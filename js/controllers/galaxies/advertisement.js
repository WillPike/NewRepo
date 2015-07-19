angular.module('SNAP.controllers')
.controller('GalaxiesAdvertisementCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'AnalyticsModel', 'ShellManager', 'DataManager', 'DataProvider', 'DialogManager', 'NavigationManager', 'CommandReset', 'CommandFlipScreen', 'ShellManager', 'WebBrowser', 'SNAPEnvironment',
  ($scope, $timeout, ActivityMonitor, AnalyticsModel, hellManager, DataManager, DataProvider, DialogManager, NavigationManager, CommandReset, CommandFlipScreen, ShellManager, WebBrowser, SNAPEnvironment) => {

  $scope.visible = false;

  $scope.advertisementClick = item => {
    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    AnalyticsModel.logAdvertisement({
      token: item.token,
      type: 'click'
    });

    if (item.href) {
      NavigationManager.location = { type: 'url', url: item.href.url };
    }
  };

  $scope.advertisementImpression = item => {
    if (ActivityMonitor.active && $scope.visible) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.advertisements = [];

  DataProvider.advertisements().then(data => {
    $timeout(() => {
      $scope.advertisements = data.main
        .map(ad => {
          return {
            src: ShellManager.getMediaUrl(ad.src, 970, 90),
            href: ad.href,
            type: ShellManager.getMediaType(ad.src),
            token: ad.token
          };
        });
    });
  });

  NavigationManager.locationChanging.add(location => {
    $scope.visible = location.type === 'home';
    $timeout(() => $scope.$apply());
  });
}]);
