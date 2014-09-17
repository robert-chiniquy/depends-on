
require('longjohn');
var ready = require('../')('true'); // for the process.on('exit', …); to be before tape's
var test = require('tape');

test('ready', ready);

test('passing test obj directly to ready()', function(t) {
  require('../')('clean')(t);
});

test('basic sequence including a fifo', function(t) {
  require('../')('clean')(function(err) {
    t.error(err);
    t.end();
  });
});

test('noise on stdout and stderr', function(t) {
  require('../')('noise to stderr')(function(err) {
    t.error(err);
    t.end();
  });
});

test('true', function(t) {
  require('../')('true')(function(err) {
    t.error(err);
    t.end();
  });
});

test('false', function(t) {
  require('../')('false')(function(err) {
    t.ok(err, "non-zero exit returns an error when a callback is passed to ready()");
    t.end();
  });
});

test('wait for socket', function(t) {
  require('../')('write to the port')(function(err) {
    t.error(err, "No error returned");
    t.end();
  });
});

test('custom filename', function(t) {
  require('../', 'custom-dependencies')()(function(err) {
    t.end();
  });
});

