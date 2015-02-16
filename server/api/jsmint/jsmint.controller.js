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

// Send back what you sent
exports.test = function(req, res) {
    res.json({
        body: req.body
    });
};

// Uses Acorn to parse the given *body* and returns its output.
exports.acorn = function(req, res) {
    var result = acorn.parse(req.body.text);

    res.json({
        result: result
    });
};


/*
    Turns the given Acorn Abstract Syntax Tree into a tree where
    statements (for, while, if, etc.) are nodes.
    Each node contains:
        type : String (ForStatement, IfStatement, )
*/
