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

/*
    Tries to find `treeToMatch` inside `realTree`, including `realTree`'s head node.
*/
var _matchTree = function(realTree, treeToMatch) {
    // try to find `treeToMatch`'s top node

    // compare `realTree`'s top node to `treeToMatch`'s top node
    // (but this comparison will only work if the real tree's top node hasn't been visited already;
    // if that's the case, just check it's children)
    if(!realTree._visited && treeToMatch.type == realTree.type) {
        // found it!

        // mark this node as visited already so we can't reuse it
        realTree._visited = true;

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
        return _matchTree(realChild, treeToMatch);
    });

    return foundInChildren.indexOf(true) > -1;
};

/*
    Removes `_visited` tags from `tree`'s head node and all children thereof.
*/
var _cleanseTree = function(tree) {
    if(typeof tree._visited !== "undefined") {
        delete tree._visited;
    }

    _.each(tree.children, function(child){
        _cleanseTree(child);
    });
}

var matchTree = function(realTree, treeToMatch) {
    var found = _matchTree(realTree, treeToMatch);

    // do some cleanup by removing _visited tags
    _cleanseTree(realTree);

    return found;
};

// > true
console.log(matchTree(simple, new StatementNode('ForStatement', [ new StatementNode('VariableDeclaration', []) ])));
// > true
console.log(matchTree(simple, new StatementNode('VariableDeclaration', [])));
// > true
console.log(matchTree(simple,
        new StatementNode('ForStatement', [
            new StatementNode('VariableDeclaration', []),
            new StatementNode('WhileStatement', [])
        ])));
// > false
console.log(matchTree(simple,
        new StatementNode('ForStatement', [
            new StatementNode('VariableDeclaration', []),
            new StatementNode('ForStatement', [])
        ])));
// > false
console.log(matchTree(simple,
        new StatementNode('IfStatement', [
            new StatementNode('VariableDeclaration', []),
            new StatementNode('VariableDeclaration', []),
            new StatementNode('VariableDeclaration', []),
        ])));
