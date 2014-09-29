#! /usr/bin/env node

var path = require('path');
var _ = require('underscore');

process.stdout.write(
  'digraph dependencies {\n' +
  '\trankdir = "RL";\n' +
  '\toverlap = false;\n' +
  '\tremincross = true;\n' +
  '\tsplines = true;\n\n');

var deps = require('./' + path.relative('.', process.argv.slice(-1)[0]));

process.stdout.write(_.flatten(_.pairs(deps).map(function(p) {
  p[1] = p[1].depends || [];
  return p[1].map(function(d) {
    return '\t' + p[0] + ' -> ' + d + ' ;';
  });
})).join('\n') + '\n');

process.stdout.write("}\n");
