angular.module('SNAP.controllers')
.controller('WebCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'NavigationManager', 'WebBrowser',
  ($scope, $timeout, ActivityMonitor, NavigationManager, WebBrowser) => {

  $scope.close = () => WebBrowser.close();
  $scope.url = '';

  WebBrowser.onOpened.add(reference => {
    ActivityMonitor.enabled = false;

    $timeout(() => {
      $scope.browserUrl = reference.url;
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

    reference.onNavigated.add(url => $timeout(() => $scope.browserUrl = url));
  });

  WebBrowser.onClosed.add(() => {
    ActivityMonitor.enabled = true;
    $timeout(() => {
      $scope.url = '';
      $scope.visible = false;
    });
  });

  NavigationManager.locationChanging.add(location => {
    WebBrowser.close();
    $timeout(() => {
      $scope.wide = location.type !== 'home' && location.type !== 'signin';
      $scope.fullscreen = location.type === 'signin';
    });
  });
}]);
