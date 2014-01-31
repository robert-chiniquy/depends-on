#! /usr/bin/env node

var client = require('net').connect(process.argv[2], function() {
  client.write(process.argv[3]);
  client.end();
});
