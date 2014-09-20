#! /usr/bin/env node

['SIGINT', 'SIGHUP', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    process.stdout.write(sig + ': ' + JSON.stringify(arguments) + '\n');
  });  
})

process.stdin.resume()

