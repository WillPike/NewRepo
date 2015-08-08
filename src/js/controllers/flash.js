angular.module('SNAP.controllers')
.controller('FlashCtrl',
  ['$timeout', 'FlashStarter', 'NavigationManager', 'ShellManager', ($timeout, FlashStarter, NavigationManager, ShellManager) => {

    $timeout(() => {
      let url = ShellManager.getMediaUrl({
        token: NavigationManager.getQueryParameter('media'),
        mime_type: 'application/x-shockwave-flash'
      });

      FlashStarter.start(
        'media-container',
        url,
        NavigationManager.getQueryParameter('width'),
        NavigationManager.getQueryParameter('height')
      );
    }, 1000);
}]);
