angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', '$timeout', 'CommandBoot', 'CommandUpdateCache', 'DialogManager', 'LocationModel', 'ManagementService', 'SNAPEnvironment',
  ($scope, $timeout, CommandBoot, CommandUpdateCache, DialogManager, LocationModel, ManagementService, SNAPEnvironment) => {

  $scope.version = SNAPEnvironment.version;

  function step1() {
    CommandBoot().then(step2, e => {
      DialogManager.alert(ALERT_ERROR_STARTUP).then(() => step1());
    });
  }

  function step2() {
    CommandUpdateCache().then(result => {
      if (result === 'obsolete') {
        DialogManager.alert(ALERT_WARNING_CACHE_OBSOLETE).then(() => finished());
      }
      else {
        finished();
      }
    }, e => {
      DialogManager.alert(ALERT_ERROR_CACHE_UPDATE).then(() => step2());
    });
  }

  function finished() {
    ManagementService.loadApplication(LocationModel.location);
  }

  $timeout(() => step1(), 1000);
}]);
