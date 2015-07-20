angular.module('SNAP.controllers')
.controller('BackgroundCtrl', ['$scope', '$timeout', 'ShellManager', 'NavigationManager', function($scope, $timeout, ShellManager, NavigationManager) {

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

  var backgrounds = ShellManager.model.backgrounds,
      pageBackgrounds = null;

  showImages(backgrounds);
  ShellManager.model.backgroundsChanged.add(value => {
    backgrounds = value;
    showImages(backgrounds);
  });

  NavigationManager.locationChanged.add(function(location) {
    var newPageBackgrounds = ShellManager.getPageBackgrounds(location);

    if (newPageBackgrounds.length > 0) {
      pageBackgrounds = newPageBackgrounds;
      showImages(pageBackgrounds);
      return;
    }

    if (pageBackgrounds) {
      switch (location.type) {
        case 'menu':
        case 'category':
        case 'item':
          return;
      }
    }

    pageBackgrounds = null;
    showImages(backgrounds);
  });
}]);
