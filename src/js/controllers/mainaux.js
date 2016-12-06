angular.module('SNAP.controllers')
.controller('MainAuxCtrl', ['$scope', 'CommandStartup', function($scope, CommandStartup) {
  CommandStartup();
}]);
