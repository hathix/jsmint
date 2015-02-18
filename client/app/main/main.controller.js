'use strict';

angular.module('jsmintApp').controller('MainCtrl', function($scope, $http) {
  // ace editor
  var editor;

  $scope.statementTypes = [
    'ForStatement',
    'IfStatement',
    'WhileStatement',
    'VariableDeclaration',
    'ExpressionStatement'
];
$scope.statementTypes = $scope.statementTypes.sort();

  $scope.whitelistResults = {};
  $scope.blacklistResults = {};
  // the tree of the actual code
  $scope.codeTree = [];
  // the tree user wants to match against
  $scope.matchTree = [{
    type: "Program",
    children: []
  }];

  // handle tabs
  $scope.activeTest = 'whitelist';
  $scope.setActiveTest = function(test) {
    $scope.activeTest = test;
  };
  $scope.isActiveTest = function(test) {
    return $scope.activeTest === test;
  };

  // the tree they want to match against (`matchTree`)
  // adds a child with the given type to the given node
  $scope.addChild = function(node, type) {
    if (type) {
      node.children.push({
        type: type,
        children: []
      });
    }
  };
  // resets the `matchTree` to its default (empty) state.
  $scope.clearMatchTree = function() {
    $scope.matchTree = [{
      type: "Program",
      children: []
    }];
  };

  $scope.codeTree = [{
    type: "a",
    children: [{
      type: "b",
      children: [{
        type: "c",
        children: []
      }]
    }, {
      type: "d",
      children: []
    }]
  }];


  var whitelist = [
    "IfStatement",
    "ForStatement"
  ];
  var blacklist = [
    "WhileStatement"
  ];

  // Runs the selected test on the user's inputted code.
  $scope.check = function() {
    var text = editor.getValue();

    $http.post("/api/jsmint/whitelist", {
      includes: whitelist,
      text: text
    }).success(function(data) {
      $scope.whitelistResults = data;
    });

    $http.post("/api/jsmint/blacklist", {
      excludes: blacklist,
      text: text
    }).success(function(data) {
      $scope.blacklistResults = data;
    });

    $http.post("/api/jsmint/codetree", {
      text: text
    }).success(function(data) {
      // the outputted tree has just one head
      // but the renderer expects an array -- so wrap it
      $scope.codeTree = [data.tree];
    });
  };

  // initialize ace editor
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/xcode");
  editor.getSession().setUseWrapMode(true);
  editor.getSession().setMode("ace/mode/javascript");

  editor.on('change', _.throttle($scope.check, 100));

  // run this on init
  $scope.check();
});
