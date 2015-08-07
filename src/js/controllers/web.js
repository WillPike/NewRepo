angular.module('SNAP.controllers')
.controller('WebCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'NavigationManager', 'WebBrowser',
  ($scope, $timeout, ActivityMonitor, NavigationManager, WebBrowser) => {

  WebBrowser.onOpened.add(reference => {
    ActivityMonitor.enabled = false;

    $timeout(() => {
      $scope.type = reference.type;
      $scope.visible = true;
    });

    switch (reference.type) {
      case 'iframe':
        reference.attach(document.getElementById('page-web-iframe'));
        break;
      case 'webview':
        reference.attach(document.getElementById('page-web-webview'));
        break;
    }
  });

  WebBrowser.onClosed.add(() => {
    ActivityMonitor.enabled = true;
    $timeout(() => $scope.visible = false);
  });

  NavigationManager.locationChanging.add(location => {
    WebBrowser.close();
    $timeout(() => $scope.wide = location.type !== 'home');
  });
}]);
