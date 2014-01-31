
require('longjohn');
require('../'); // for the process.on('exit', …); to be before tape's

var test = require('tape');

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
    t.ok(err, "non-zero exit returns an error");
    t.end();
  });
});

test('wait for socket', function(t) {
  require('../')('write to the port')(function(err) {
    t.error(err, "No error returned");
    t.end();
  });
});

