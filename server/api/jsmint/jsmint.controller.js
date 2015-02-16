'use strict';

var _ = require('lodash'),
    acorn = require('acorn'),
    walk = require('acorn/util/walk');

/*
    Finds all the statement types used in the given abstract syntax tree,
    e.g. ForStatement, IfStatement, WhileStatement, VariableDeclaration.
    The types of statements available can be found at:
    https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API#Statements.
*/
var findStatementTypes = function(tree) {
    var statementTypes = [];
    walk.simple(tree, {
        Statement: function(node){
            statementTypes.push(node.type);
        }
    });
    statementTypes = _.unique(statementTypes);

    return statementTypes;
}


// Uses Acorn to parse the given `text` and returns its output.
exports.acorn = function(req, res) {
    var result = acorn.parse(req.body.text);

    res.json({
        result: result
    });
};

/*
    Determines if the given `text` includes all of the required statements.

    Parameters:
        text : string - JavaScript source code to parse
        includes : string[] - a list of statement types (e.g. ForStatement) that MUST be included

    Outputs:
        missing : string[] - a list of statement types in `includes` that aren't included
        contains : string[] - a list of statement types in `includes` that are included
        passing : boolean - true if no statements are missing, false otherwise

*/
exports.whitelist = function(req, res) {
    var text = req.body["text"],
        includes = req.body["includes[]"];

    var statementTypes = findStatementTypes(acorn.parse(text));

    var contains = _.intersection(includes, statementTypes);
    var missing = _.difference(includes, contains);
    var passing = missing.length == 0;

    res.json({
        contains: contains,
        missing: missing,
        passing: passing
    })
}
