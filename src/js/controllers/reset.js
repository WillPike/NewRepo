angular.module('SNAP.controllers')
.controller('ResetCtrl',
  ['$scope', 'CommandReset', 'DialogManager', 'ManagementService', 'SNAPEnvironment',
  ($scope, CommandReset, DialogManager, ManagementService, SNAPEnvironment) => {

  $scope.version = SNAPEnvironment.version;

  CommandReset().then(() => {
    ManagementService.loadStartup();
  }, () => {
    ManagementService.loadStartup();
  });
}]);
