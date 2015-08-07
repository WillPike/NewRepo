angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', '$timeout', 'CommandBoot', 'DialogManager', 'ManagementService',
  ($scope, $timeout, CommandBoot, DialogManager, ManagementService) => {

  function workflow() {
    CommandBoot().then(() => {
      ManagementService.loadApplication();
    }, e => {
      DialogManager.alert(ALERT_ERROR_STARTUP).then(() => workflow());
    });
  }

  $timeout(() => workflow(), 1000);
}]);
