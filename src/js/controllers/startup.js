angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', 'CommandBoot', 'DialogManager',
  ($scope, CommandBoot, DialogManager) => {

  var job = DialogManager.startJob();

  CommandBoot().then(result => {
    
  }, e => {
    DialogManager.endJob(job);
  });
}]);
