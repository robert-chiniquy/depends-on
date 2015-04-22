var fs = require('fs');
var path = require('path');

require('longjohn');
var ready = require('..')('true'); // for the process.on('exit', …); to be before tape's
var test = require('tape');

test('ready', ready);

test('passing test obj directly', require('..')('D'));

test('basic sequence including a fifo', require('..')('clean'));

test('noise on stdout and stderr', require('..')('noise to stderr'));

test('true', require('..')('true'));

test('false', function(t) {
  require('..')('false')(function(err) {
    t.ok(err, "non-zero exit returns an error when a callback is passed to ready()");
    t.end();
  });
});

test('wait for socket', require('..')('write to the port'));

test('pass in a tree from a different dependencies file', function(t) {
  require('..')('good', require('./other-dependencies'))(t);
});

test('pass in a tree from a different file, see evil fail', function(t) {
  require('..')('evil', require('./other-dependencies'))(function(err) {
    t.ok(err, "evil exits 1 because evil is false");
    t.end();
  });
});

test('test SIGKILL', require('../')(['catch-signals']));

test('wait for exit code', require('../')('exit 17'));
test('wait for exit code zero', require('../')('exit 0'));

test('wait for exit code specified by string', require('../')('exit 17 wait_for string'));

test('timeout', function(t) {
  require('../')('take too long')(function(err) {
    t.ok(err, "error returned on timeout");
    t.end();
  });
});

test('truncate stdio', function(t) {
  fs.writeFileSync(path.resolve(__dirname, 'logs/truncate-stdout'), 'hello bluefish\n');
  fs.writeFileSync(path.resolve(__dirname, 'logs/truncate-stderr'), 'hello redfish\n');

  require('..')('truncate stdio')(function(err) {
    var stdout, stderr;

    t.ifError(err);

    stdout = fs.readFileSync(path.resolve(__dirname, 'logs/truncate-stdout')).toString();
    stderr = fs.readFileSync(path.resolve(__dirname, 'logs/truncate-stderr')).toString();
    t.equal(stdout, 'hello bluefish\n', 'stdout only had a single line and was truncated.');
    t.equal(stderr, 'hello redfish\n', 'stderr only had a single line and was truncated.');
    t.end();
  });
});

test('do not truncate stdio', function(t) {
  fs.writeFileSync(path.resolve(__dirname, 'logs/truncate-stdout'), 'hello bluefish\n');
  fs.writeFileSync(path.resolve(__dirname, 'logs/truncate-stderr'), 'hello redfish\n');

  require('..')('do not truncate stdio')(function(err) {
    var stdout, stderr;

    t.ifError(err);

    stdout = fs.readFileSync(path.resolve(__dirname, 'logs/truncate-stdout')).toString();
    stderr = fs.readFileSync(path.resolve(__dirname, 'logs/truncate-stderr')).toString();
    t.equal(stdout, 'hello bluefish\nhello bluefish\n', 'stdout had multiple lines and was not truncated.');
    t.equal(stderr, 'hello redfish\nhello redfish\n', 'stderr had multiple lines and was truncated.');
    t.end();
  });
});
