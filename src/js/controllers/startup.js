angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', 'CommandBoot', 'DialogManager', 'ManagementService',
  ($scope, CommandBoot, DialogManager, ManagementService) => {

  var job = DialogManager.startJob();

  CommandBoot().then(() => {
    ManagementService.loadApplication();
  }, e => {
    DialogManager.endJob(job);
  });
}]);
