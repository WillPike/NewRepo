angular.module('SNAP.controllers')
.controller('UrlCtrl',
  ['$scope', 'NavigationManager', 'WebBrowser',
  ($scope, NavigationManager, WebBrowser) => {

  WebBrowser.open(NavigationManager.location.url);

  $scope.$on('$destroy', () => {
    WebBrowser.close();
  });
}]);
