var ready = require('../..')('unique'); // for the process.on('exit', …); to be before tape's
var test = require('tape');

test('can find the right (i.e. closest) dependencies.json file in a dir nested under tests/', ready);