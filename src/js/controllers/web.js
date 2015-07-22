angular.module('SNAP.controllers')
.controller('WebCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'WebBrowser',
  ($scope, $timeout, ActivityMonitor, WebBrowser) => {

  WebBrowser.onOpen.add(() => {
    ActivityMonitor.enabled = false;
  });

  WebBrowser.onClose.add(() => {
    ActivityMonitor.enabled = true;
  });
}]);
