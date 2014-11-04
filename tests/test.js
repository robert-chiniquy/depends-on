
require('longjohn');
var ready = require('..')('true'); // for the process.on('exit', …); to be before tape's
var test = require('tape');

test('ready', ready);

test('passing test obj directly to ready()', require('..')('clean'));

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

test('timeout', function(t) {
  require('../')('take too long')(function(err) {
    t.ok(err, "error returned on timeout");
    t.end();
  });
});


