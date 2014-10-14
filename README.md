depends-on
==========

Spins up external processes your tests need. Think of it as `async.auto` with process control for testing.

example:
========

```json
{
  "redis": {
    "cmd": ["/usr/sbin/redis-server"],
    "wait_for": {
      "port": 6379
    }
  }
}
```

```javascript
var ready = require('depends-on')('redis');
var test = require('tape');

test('init', ready);

< … tests that use redis here … >

```

`ready()` is a function that takes a callback (or a tape test object). It will call that callback when your dependencies are ready. They'll be stopped when your node process exits. 

Dependencies can have dependencies. Say you want to clear all values from Redis after it starts, but before your tests run:

```json
{
  "redis": {
    "cmd": ["/usr/sbin/redis-server"],
    "wait_for": {
      "port": 6379
    }
  },
  "fresh & clean redis": {
    "cmd": ["./bin/flushall.sh"],
    "depends": ["redis"]
  }
}
```

```javascript
var ready = require('depends-on')('fresh & clean redis');
var test = require('tape');

test('start fresh redis', ready);

test('test that uses redis', function(t) {
  …
});
…
```

If multiple tests share dependencies, depends-on will share them across the test files, each dependency only being started once. When node exits, all dependencies will exit.

## dependencies.json 
`dependencies.json` is a file containing a json object mapping dependency names to objects that describe each dependency.

### dependency fields

<dl>
<dt>cmd</dt>
<dd>array of command and args for child_process.spawn (required)</dd>

<dt>depends</dt>
<dd>array of names of dependencies which this dependency depends on</dd>

<dt>cwd</dt>
<dd>The cwd to pass to child_process.spawn</dd>

<dt>stdout</dt>
<dd>path to log dependency's stdout to (default: your stdout)</dd>

<dt>stderr</dt>
<dd>path to log dependency's stderr to (default: your stderr)</dd>

<dt>signal</dt>
<dd>signal to use to tell the dependency to shut down (default: `SIGTERM`)</dd>

<dt>wait_for</dt>
<dd>lets you specify an ip:port and timeout to wait for socket availability before considering a dependency started</dd>

</dl>

### wait_for fields

One of `port` or `exit_code` is required.

<dl>

<dt>host</dt>
<dd>default: localhost</dd>

<dt>port</dt>
<dd>if port is set, will wait for a TCP connection to be accepted on this port</dd>

<dt>exit_code</dt>
<dd>if exit_code is set, will wait for the process to exit with this code before proceeding</dd>

<dt>timeout</dt>
<dd>seconds to wait before considering a dependency to have failed starting up (default: 30)</dd>

</dl>


### using with tape
Be sure to `require('depends-on')` before you `require('tape')` like this:

```javascript
var ready = require('depends-on')('redis');
var test = require('tape');
```

Both depends-on and tape have `process.on('exit', …)` handlers, but tape calls `process.exit` in its `process.on('exit', …)` handler, so if tape's handler runs first, depends-on's handler will never run (and child processes won't be cleaned up). Handlers run in the order they are added, so depends-on must be required first.

### why not use a bash script or Makefile?


I like to be able to run integration tests individually like `$ node tests.js` without running anything else or relying on some external service coincidentally being on.

