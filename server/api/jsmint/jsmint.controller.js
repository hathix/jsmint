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
// A test function.
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
    var text = req.body.text,
        includes = req.body.includes;
    console.log(req.body);

    var statementTypes = findStatementTypes(acorn.parse(text));

    var contains = _.intersection(includes, statementTypes);
    var missing = _.difference(includes, contains);
    var passing = missing.length == 0;

    res.json({
        contains: contains,
        missing: missing,
        passing: passing
    })
};

/*
    Determines if the given `text` includes none of the given statements.

    Parameters:
        text : string - JavaScript source code to parse
        excludes : string[] - a list of statement types (e.g. ForStatement) that MUST NOT be included

    Outputs:
        violates : string[] - a list of statement types in `excludes` that are included anyway
        absent: string[] - a list of statement types in `excludes` that are indeed excluded
        passing : boolean - true if there are no violating statements, false otherwise
*/
exports.blacklist = function(req, res){
    var text = req.body.text,
        excludes = req.body.excludes;
    console.log(req.body);

    var statementTypes = findStatementTypes(acorn.parse(text));

    var violates = _.intersection(excludes, statementTypes);
    var absent = _.difference(excludes, violates);
    var passing = violates.length == 0;

    res.json({
        violates: violates,
        absent: absent,
        passing: passing
    })
}
