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

/*
    A tree node that contains the type of a node in an abstract syntax tree
    and references to each children thereof.
*/
var StatementNode = function(type, children) {
    this.type = type;
    this.children = children;
}

/*
    Converts the given abstract syntax tree into a statement tree
    of Nodes, each of which tracks its children and the statement type.
*/
var toStatementTree = function(ast) {
    // Make the top abstract node into a statement node and add it to the statement tree
    // ast == the top node

    if(!ast) {
        return null;
    }

    var type = ast.type;

    // children are either the body or the consequent/alternate (in case of if)
    var children;
    if(ast.body){
        if(_.isArray(ast.body)){
            // the body is an array of other nodes
            // each of those is a child
            children = ast.body;
        }
        else{
            // the body IS a child
            children = [ast.body];
        }
    }
    else if(ast.consequent || ast.alternate) {
        // this is an if statement; each of its two branches are children
        children = [ast.consequent, ast.alternate];
    }
    else {
        // leaf
        children = [];
    }

    // convert each child from abstract syntax node to statement node
    var statementChildren = _(children).map(toStatementTree).compact().value();

    return new StatementNode(type, statementChildren);
};

/*
    Tries to find `treeToMatch` inside `realTree`, including `realTree`'s head node.
*/
var matchTree = function(realTree, treeToMatch) {
    // try to find `treeToMatch`'s top node

    // compare `realTree`'s top node to `treeToMatch`'s top node
    // (but this comparison will only work if the real tree's top node hasn't been visited already;
    // if that's the case, just check it's children)
    if(!realTree._visited && treeToMatch.type == realTree.type) {
        // found it!

        // mark this node as visited already so we can't reuse it
        // realTree._visited = true;

        // now start checking `treeToMatch`'s children

        if(treeToMatch.children.length === 0) {
            // no children left to match; the tree has ended
            return true;
        }

        // all children MUST be found
        var foundInChildren = _.map(treeToMatch.children, function(matchChild){
            // compare matchChild with every child of the real tree's top node
            // (not the real tree's top node itself, because we can't re-use it)
            // the child must be found in ONE of those
            return _matchTreeChildren(realTree, matchChild);
        });

        return foundInChildren.indexOf(false) === -1;
    }
    else {
        // try matching each child of `realTree`
        return _matchTreeChildren(realTree, treeToMatch);
    }
};

/*
    Tries to find `treeToMatch` among all the CHILDREN of `realTree`,
    not including the head node of `realTree`.
    This is a helper function and should only be called by matchTree().
*/
var _matchTreeChildren = function(realTree, treeToMatch) {
    if(realTree.children.length === 0) {
        // no children left in tree; ran out of options
        return false;
    }

    // as long as there's true somewhere in there, we're good
    var foundInChildren = _.map(realTree.children, function(realChild){
        return matchTree(realChild, treeToMatch);
    });

    return foundInChildren.indexOf(true) > -1;
};


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
};

/*
    Given code, outputs a tree that outlines the rough structure of the code.

    Parameters:
        text : string - JavaScript source code to parse

    Outputs:
        tree : tree - a hierarchical tree where each node contains:
            type : string - the statement type of a code block
            children : node[] - code blocks contained within this one
*/
exports.codetree = function(req, res) {
    var text = req.body.text;
    var ast = acorn.parse(text);
    var statementTree = toStatementTree(ast);

    res.json({
        tree: statementTree
    });
}
