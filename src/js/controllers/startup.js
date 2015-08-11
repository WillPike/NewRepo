angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', '$timeout', 'CommandBoot', 'DialogManager', 'ManagementService', 'SNAPEnvironment',
  ($scope, $timeout, CommandBoot, DialogManager, ManagementService, SNAPEnvironment) => {

  $scope.version = SNAPEnvironment.version;

  function workflow() {
    CommandBoot().then(() => {
      ManagementService.loadApplication();
    }, e => {
      DialogManager.alert(ALERT_ERROR_STARTUP).then(() => workflow());
    });
  }

  $timeout(() => workflow(), 1000);
}]);
