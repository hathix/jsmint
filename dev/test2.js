var acorn = require('acorn'),
  walk = require('acorn/util/walk'),
  _ = require('lodash');


var src = "if(x==2){ for(var i=0;i<5;i++){ var x = 5; while(true){} }} else { var y = 3; }";
var tree = acorn.parse(src);

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

var simple = toStatementTree(tree);

var matchTree = function(realTree, treeToMatch) {
    // try to find `treeToMatch`'s top node
    console.log(realTree.type + " vs. " + treeToMatch.type);

    // compare `realTree`'s top node to `treeToMatch`'s top node
    if(treeToMatch.type == realTree.type) {
        // found it! now start checking `treeToMatch`'s children
        console.log("FOUND " + treeToMatch.type);

        if(treeToMatch.children.length === 0) {
            // no children left to match; the tree has ended
            return true;
        }

        // all children MUST be found
        var foundInChildren = _.map(treeToMatch.children, function(child){
            return matchTree(realTree, child);
        });

        return foundInChildren.indexOf(false) === -1;
    }
    else {
        // try matching each child of `realTree`

        if(realTree.children.length === 0) {
            // no children left in tree; ran out of options
            return false;
        }

        // as long as there's true somewhere in there, we're good
        var foundInChildren = _.map(realTree.children, function(child){
            return matchTree(child, treeToMatch);
        });

        return foundInChildren.indexOf(true) > -1;
    }
};

console.log(matchTree(simple, new StatementNode('ForStatement', [ new StatementNode('VariableDeclaration', []) ])));
console.log(matchTree(simple, new StatementNode('VariableDeclaration', [])));
console.log(matchTree(simple,
        new StatementNode('ForStatement', [
            new StatementNode('VariableDeclaration', []),
            new StatementNode('WhileStatement', [])
        ])));
console.log(matchTree(simple,
        new StatementNode('ForStatement', [
            new StatementNode('VariableDeclaration', []),
            new StatementNode('ForStatement', [])
        ]))); // TODO FIX THIS
