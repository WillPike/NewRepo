angular.module('SNAP.controllers')
.controller('ScreensaverCtrl',
  ['$scope', '$timeout', 'ShellManager', 'ActivityMonitor', 'DataModel',
  ($scope, $timeout, ShellManager, ActivityMonitor, DataModel) => {
    
  $scope.visible = false;

  function showImages(values) {
    $timeout(function() {
      $scope.images = values.map(function(item){
        return {
          src: ShellManager.getMediaUrl(item.media, 1920, 1080, 'jpg'),
          type: ShellManager.getMediaType(item.media)
        };
      });
    });
  }

  showImages(ShellManager.model.screensavers);
  ShellManager.model.screensaversChanged.add(showImages);

  ActivityMonitor.activeChanged.add(value => {
    $timeout(() => {
      $scope.visible = value === false && ($scope.images && $scope.images.length > 0);
    });
  });
}]);
