angular.module('SNAP.controllers')
.controller('ResetCtrl',
  ['$scope', 'CommandReset', 'DialogManager', 'ManagementService',
  ($scope, CommandReset, DialogManager, ManagementService) => {

  var job = DialogManager.startJob();

  CommandReset().then(() => {
    ManagementService.loadStartup();
  }, () => {
    DialogManager.endJob(job);
    ManagementService.loadStartup();
  });
}]);
