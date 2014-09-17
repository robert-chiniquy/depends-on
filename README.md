depends-on
==========

Spins up external processes your tests need.

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

`ready()` is a function that takes a callback. It will call that callback when your dependencies are ready. They'll be stopped when your node process exits. 

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
…
```

If multiple tests share dependencies, depends-on will share them across the test files, each dependency only being started once. When node exits, all dependencies will exit.

why not use a bash script or Makefile?
======================================

I like to be able to run tests individually like `$ node tests.js` without running anything else.

