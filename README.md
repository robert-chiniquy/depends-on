depends-on
==========

Spins up external processes your tests need.

example:
========

```javascript
var ready = require('depends-on')('redis');
var test = require('tape');

test('init', ready);

< … tests that use redis here … >

```

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

Your tests won't run until Redis is ready, then it will stop when your tests finish. Dependencies are also supported. Say you want to clear all values from Redis after it starts, but before your tests run.

```json
{
  "redis": {
    "cmd": ["/usr/sbin/redis-server"],
    "wait_for": {
      "port": 6379
    }
  },
  "empty redis": {
    "cmd": ["./bin/flushall.sh"],
    "depends": ["redis"]
  }
}
```

```javascript
var ready = require('depends-on')('empty redis');
…
```

If multiple tests share dependencies, depends-on will share them across the test files. When node exits, all dependencies will exit.

why not use a bash script or Makefile?
======================================

I like to be able to run tests individually like `$ node tests.js` without running anything else.

