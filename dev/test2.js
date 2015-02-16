var acorn = require('acorn'),
  walk = require('acorn/util/walk'),
  _ = require('lodash');


var src = "if(x==2){ }";
var tree = acorn.parse(src);

/*
    Finds all the statement types used in the given abstract syntax tree,
    e.g. ForStatement, IfStatement, WhileStatement, VariableDeclaration.
    The types of statements available can be found at:
    https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements.
*/
var findStatementTypes = function(tree) {
  var statementTypes = [];
  walk.simple(tree, {
    Statement: function(node) {
      statementTypes.push(node.type);
    }
  });
  statementTypes = _.unique(statementTypes);

  return statementTypes;
}

var statements = findStatementTypes(tree);
var excludes = [
    'WhileStatement',
    'ForStatement'
];

var violates = _.intersection(excludes, statements);
var absent = _.difference(excludes, violates);
var passing = violates.length == 0;

console.log(violates);
console.log(absent);
console.log(passing);
