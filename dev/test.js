var acorn = require('acorn'),
	walk = require('acorn/util/walk'),
	_ = require('lodash');

var src = "for(var x = 1; x < 5; x++) {\n    if(x < 2) {\n        while(true){\n            x = 1;\n            var y = 3;\n        }\n    }\n    else {\n        x = 2;\n    }\n}";
var tree = acorn.parse(src);

// console.log(tree);

/*
// Prints all the keywords used in the script.
var tokenized = acorn.tokenize(src);
var tokens = [];
while(true) {
	var token = tokenized();
	if(token && token.type && token.type.type == "eof") {
		break;
	}

	tokens.push(token);
}

var keywords = _.map(tokens, function(token){
	if(token.type && token.type.keyword){
		return token.type.keyword;
	}
	else {
		return undefined;
	}
});
keywords = _(keywords).compact().unique().value();
console.log(keywords);
*/

// traverse the abstract syntax tree to find all statement types
// e.g. ForStatement, IfStatement, WhileStatement
var statementTypes = [];
walk.simple(tree, {
	Statement: function(node){
		statementTypes.push(node.type);
	}
});
statementTypes = _.unique(statementTypes);

/*
// convert node types to code equivalents; e.g. "ForStatement" => "for"
var statementKeywords = _(statementTypes)
	.map(function(type){
		return type.replace("Statement", "").toLowerCase();
	})
	.unique()
	.value();
*/

// console.log(statementTypes);

/*
	Converts an Abstract Syntax Tree into a tree that just contains
	the statement types (e.g. ForStatement).

	Each node has a `type` (string) and `children` (node[]).
*/
var toSimpleTree = function(ast){
	var children = [];

	if(ast.body) {
		while(!_.isArray(ast.body))
		children = _.map(ast.body, function(child){
			return toSimpleTree(child);
		});
	}

	return {
		type: ast.type,
		children: children
	}
};

// var simple = toSimpleTree(tree);

// console.log(JSON.stringify(simple));

var nodes = [];
walk.ancestor(tree, {
	Statement: function(node){
		nodes.unshift(node);
	}
});
console.log(nodes);
