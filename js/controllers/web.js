angular.module('SNAP.controllers')
.controller('WebCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'WebBrowser',
  ($scope, $timeout, ActivityMonitor, WebBrowser) => {

  $scope.navigated = e => WebBrowser.navigated(e.target.src);

  WebBrowser.onOpen.add(url => {
    ActivityMonitor.enabled = false;

    if (!WebBrowser.isExternal) {
      $timeout(() => {
        $scope.browserUrl = url;
        $scope.visible = true;
      });
    }
  });

  WebBrowser.onClose.add(() => {
    ActivityMonitor.enabled = true;

    if (!WebBrowser.isExternal) {
      $timeout(() => {
        $scope.browserUrl = WebBrowser.getAppUrl('/blank');
        $scope.visible = false;
      });
    }
  });
}]);
