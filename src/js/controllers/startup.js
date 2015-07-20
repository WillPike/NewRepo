angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', '$timeout', 'DialogManager',
  ($scope, $timeout, DialogManager) => {

  var job;

  $timeout(() => {
    job = DialogManager.startJob();
  }, 1000);

}]);
