var net = require('net');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var async = require('async');
var _ = require('underscore');
var autotarget = require('async-autotarget');

var child_processes = {};
var error = null;

// this must be synchronous
function kill_em() {
  _.each(child_processes, function(child, name) {
    if (child._handle) {
      child.kill('SIGTERM');
      // signalCode won't be set until the process has actually exited
      if (! (child.exitCode || child.signalCode)) {
        child.kill('SIGKILL');
      }
    }
  });
  child_processes = {};
}

process.on('exit', kill_em);

module.exports = function(targets, source) {
  error = null;

  return function ready(callback) {
    var names = [];
    var test = null;
    if (typeof callback === 'object' && callback.test) {
      test = callback;
      callback = function() {
        _.each(names, function(name) {
          test.pass(name);
        });
        test.end();
      }
    }
    async.auto(dependencies(targets || [], source, test), function(err, results) {
      names = names.concat(_.keys(results));
      callback(err);
    });
  }
};


function dependencies(targets, source, test) {
  var dependencies, r = {};

  // TODO: deal with possible dependencies.js filename
  if (source) {
    dependencies = require(source);
  } else if (fs.existsSync(path.resolve(process.cwd(), 'tests/dependencies.json'))) {
    dependencies = require(path.resolve(process.cwd(), 'tests/dependencies'));
  } else {
    var where = process.cwd();
    do {
      if (fs.existsSync(path.resolve(where, 'dependencies.json'))) {
        dependencies = require(path.resolve(where, 'dependencies'));
        process.chdir(path.resolve(where + '/..'));
        break;
      }
    } while ((where = path.resolve(where + '/..')) != '/');   
  }

  if (!dependencies) {
    throw(new Error('dependencies.json not found'));
  }

  _.each(dependencies, function(dep, name) {
    dep.depends = dep.depends || [];
    if (child_processes[name]) {
      r[name] = dep.depends.concat([function(callback) { _.defer(callback); }]);
    } else {
      r[name] = dep.depends.concat([spawn_one.bind(null, name, dep, test)]);
    }
  });

  return targets.length ? autotarget(r, targets) : r;
}


function spawn_one(name, what, test, callback) {
  var
    cmd = what.cmd[0],
    args = what.cmd.slice(1),
    child = child_processes[name] = spawn(cmd, args, {
      'cwd': what.cwd,
      'stdio': [0, what.stdout && fs.openSync(what.stdout, 'a') || 1, what.stderr && fs.openSync(what.stderr, 'a') || 2]
    });

  child.unref(); // don't block the event loop, children will be signalled on exit
  child.on('exit', function(code, signal) {
    if (!_.isNull(code) && code !== 0) {
      var msg = name + " exited with code " + code;
      error = new Error(msg);
      if (test) {
        test.fail(msg);
      } else {
        process.stderr.write(msg + '\n');
      }
      kill_em();
    } // else assume exit was intended
  });

  // TODO exit before what.timeout if the child exits before socket is available
  if (what.wait_for) {
    new SocketWaiter(name, what.wait_for.host, what.wait_for.port, what.timeout, callback);
    return;
  }

  // This function lets us return an err to callback() if `cmd` exited non-zero somewhat immediately
  setTimeout(function() {
    if (child.signalCode) {
      error = new Error(name + " exited after signal " + child.signalCode);
    } else if (child.exitCode) {
      error = new Error(name + " exited with code " + child.exitCode);
    }
    if (test && error) {
      test.fail(error);
      callback(null, name);
      return;
    }
    callback(error, name);
  }, 100); // one tick is not enough
}


function SocketWaiter(name, host, port, timeout, callback) {
  var
    found = false,
    start = new Date().getTime();

  function retry(callback) {
    if (new Date().getTime() - start > timeout * 1000) {
      callback(new Error("Timed out waiting for " + name));
      return;
    }
    setTimeout(callback, 1000);
  }

  callback = _.once(callback);
  async.until(function() {
    return found || error;
  }, function(callback) {
    var
      socket = net.connect(port, host),
      id = setTimeout(function() {
        socket.destroy();
        retry(callback);
      }, 1000);

    socket.on('connect', function() {
      found = true;
      clearTimeout(id);
      socket.end();
      callback();
    });
    socket.on('error', function(err) {
      clearTimeout(id);
      retry(callback);
    });
  }, function(err) {
    callback(err || error);
  });
}
