angular.module('SNAP.controllers')
.controller('ModalCtrl',
  ['$scope', '$timeout', 'DialogManager',
  ($scope, $timeout, DialogManager) => {

    DialogManager.modalStarted.add(() => $timeout(() => $scope.visible = true));
    DialogManager.modalEnded.add(() => $timeout(() => $scope.visible = false));
}]);
