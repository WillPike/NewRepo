angular.module('SNAP.controllers')
.controller('WebCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'WebBrowser',
  ($scope, $timeout, ActivityMonitor, WebBrowser) => {

  var browserRef;

  $scope.navigated = e => {
    if (browserRef) {
      browserRef.onNavigated.dispatch(e.target.src);
    }
  };

  WebBrowser.onOpen.add((url, browser) => {
    browserRef = browser;

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
