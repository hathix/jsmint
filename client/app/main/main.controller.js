'use strict';

angular.module('jsmintApp').controller('MainCtrl', function($scope, $http) {
  // ace editor
  var editor;

  // constants
  $scope.statementTypes = [
    'ForStatement',
    'IfStatement',
    'WhileStatement',
    'VariableDeclaration',
    'ExpressionStatement'
  ];
  $scope.statementTypes = $scope.statementTypes.sort();

  // output from API
  $scope.whitelistResults = {};
  $scope.blacklistResults = {};
  // the tree of the actual code
  $scope.codeTree = {};
  $scope.codeTreeMatched = false;

  // the tree user wants to match against
  var generateDefaultMatchTree = function() {
    return {
      type: "Program",
      children: []
    };
  };
  $scope.matchTree = generateDefaultMatchTree();

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

      // re-render and re-check output tree
      $scope.check();
    }
  };
  // resets the `matchTree` to its default (empty) state.
  $scope.clearMatchTree = function() {
    $scope.matchTree = generateDefaultMatchTree();

    // re-render and re-check output tree
    $scope.check();
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


  // a hash of statements that must be used
  // each statement maps to either true (must be used) or false
  // fill in with everything being false by default
  $scope.whitelistHash = _.reduce($scope.statementTypes, function(accumulator, value) {
    accumulator[value] = false;
    return accumulator;
  }, {});
  // a hash of statements that must not be used
  // each statement maps to either true (must not be used) or false
  // it starts with the same state as the whitelist hash so just copy i
  $scope.blacklistHash = _.clone($scope.whitelistHash);

  /*
    Converts the whitelist or blacklist hashes into arrays where
    the only elements are those where the corresponding entry in the hash was true.

    hashToArray({ IfStatement: true, ForStatement: false }) == ['IfStatement']
  */
  var hashToArray = function(hash) {
    return _(hash).map(function(truthiness, type) {
      return truthiness ? type : undefined;
    }).compact().value().sort();
  }

  /*
    Returns a list of all statements that MUST be used.
  */
  $scope.getWhitelist = function() {
      return hashToArray($scope.whitelistHash);
  };

  /*
    Returns a list of all statements that MUST NOT be used
  */
  $scope.getBlacklist = function() {
      return hashToArray($scope.blacklistHash);
  }

  // Runs the selected test on the user's inputted code.
  $scope.check = function() {
    var text = editor.getValue();

    var whitelist = $scope.getWhitelist();
    var blacklist = $scope.getBlacklist();

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
      text: text,
      treeToMatch: $scope.matchTree
    }).success(function(data) {
      $scope.codeTree = data.tree;
      $scope.codeTreeMatched = data.matched;
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
