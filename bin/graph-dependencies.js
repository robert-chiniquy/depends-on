#! /usr/bin/env node

var path = require('path');
var _ = require('underscore');

var depends_on = require('..');

var deps = require(depends_on.find(process.argv.length > 2 ? path.relative(process.cwd(), process.argv.slice(-1)[0]) : undefined));

process.stdout.write(
  'digraph dependencies {\n' +
  '\trankdir = "RL";\n' +
  '\toverlap = false;\n' +
  '\tremincross = true;\n' +
  '\tcompound = true;\n' +
  '\tsplines = true;\n\n'
);

process.stdout.write(_.flatten(_.pairs(deps).map(function(p) {
  if (p[1].depends) {
    return p[1].depends.map(function(d) {
      return '\t"' + p[0] + '" -> "' + d + '";';
    });
  }
  return '\t"' + p[0] + '";';
})).sort().reverse().join('\n') + '\n');

process.stdout.write("}\n");
