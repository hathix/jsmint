'use strict';

angular.module('jsmintApp').controller('MainCtrl', function($scope, $http) {
  // ace editor
  var editor;

  // things to expose to webpage
  $scope.temp = 55;
  $scope.whitelistResults = {};
  $scope.blacklistResults = {};

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

    // run through Acorn
    $http.post("/api/jsmint/acorn", { text: text }).success(function(data, status, headers, config){
        $scope.temp = JSON.stringify(data.result);
    });

    $http.post("/api/jsmint/whitelist", { includes: whitelist, text: text }).success(function(data){
        $scope.whitelistResults = data;
    });

    $http.post("/api/jsmint/blacklist", { excludes: blacklist, text: text }).success(function(data){
        $scope.blacklistResults = data;
    });
  };

  // initialize ace editor
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/xcode");
  editor.getSession().setUseWrapMode(true);
  editor.getSession().setMode("ace/mode/javascript");

  editor.on('change', _.throttle($scope.check, 100));
});
