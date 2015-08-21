angular.module('SNAP.controllers')
.controller('StartupCtrl',
  ['$scope', '$timeout', 'CommandBoot', 'CommandUpdateCache', 'DialogManager', 'LocationModel', 'ManagementService', 'SNAPEnvironment',
  ($scope, $timeout, CommandBoot, CommandUpdateCache, DialogManager, LocationModel, ManagementService, SNAPEnvironment) => {

  $scope.version = SNAPEnvironment.version;
  $scope.step = 0;

  function step1() {
    $timeout(() => $scope.step = 1);

    CommandBoot().then(result => {
      step2();
    }, e => {
      DialogManager.alert(app.Alert.ERROR_STARTUP).then(() => step1());
    });
  }

  function step2() {
    $timeout(() => $scope.step = 2);

    CommandUpdateCache().then(result => {
      if (result === 'obsolete') {
        DialogManager.alert(app.Alert.WARNING_CACHE_OBSOLETE).then(() => finished());
      }
      else {
        finished();
      }
    }, e => {
      DialogManager.alert(app.Alert.ERROR_CACHE_UPDATE).then(() => step2());
    });
  }

  function finished() {
    $timeout(() => $scope.step = 0);

    ManagementService.loadApplication(LocationModel.location);
  }

  $timeout(() => step1(), 1000);
}]);
