
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

test('custom filename', function(t) {
  require('..')('fake target', 'custom-dependencies')(function(err) {
    t.ok(err, "Non-existent custom dependencies returns error"); // doesn't exist
    t.end();
  });
});

test('test SIGKILL', require('../')(['catch-signals']));
