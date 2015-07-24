angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', 'CommandBoot', 'DialogManager', 'ManagementService',
  ($scope, CommandBoot, DialogManager, ManagementService) => {

  function workflow() {
    var job = DialogManager.startJob();

    CommandBoot().then(() => {
      ManagementService.loadApplication();
    }, e => {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_ERROR_STARTUP).then(() => workflow());
    });
  }

  workflow();
}]);
