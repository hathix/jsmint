var acorn = require('acorn'),
	walk = require('acorn/util/walk'),
	_ = require('lodash');
	
var src = "for(var i = 0; i < 5; i++){ if(1 == 1) { var x = 2; while(true){} }}";
var tree = acorn.parse(src);

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

console.log(statementTypes);