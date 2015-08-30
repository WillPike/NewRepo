angular.module('SNAP.controllers')
.controller('GalaxiesHomeCtrl',
  ['$scope', '$timeout', 'ComponentHomeMenu', 'DataManager', 'NavigationManager', 'ShellManager', 'SNAPLocation',
  ($scope, $timeout, ComponentHomeMenu, DataManager, NavigationManager, ShellManager, SNAPLocation) => {

  const elementId = 'page-home-menu';
  const containerId = 'page-home-menu-container';

  function render(element, tiles, home) {
    if (!element) {
      element = document.getElementById(elementId);
    }

    React.render(
      React.createElement(ComponentHomeMenu, { tiles: tiles, home: home }),
      element
    );
  }

  function reset() {
    var container = document.getElementById(containerId);
    if (container) {
      container.scrollLeft = 0;
    }
  }

  DataManager.homeChanged.add(home => {
    if (!home) {
      return;
    }

    var tiles = home.menus.reduce((res, menu) => {
      if (menu.promos.length > 0) {
        menu.promos.forEach(promo => {
          res.push({
            title: promo.title,
            image: promo.image,
            destination: promo.destination
          });
        });
      }
      else {
        res.push({
          title: menu.title,
          image: menu.image,
          destination: {
            type: 'menu',
            token: menu.token,
            title: menu.title
          }
        });
      }

      return res;
    }, []);

    var element = document.getElementById(elementId);

    if (element) {
      render(element, tiles, home);
    }
    else {
      $timeout(() => render(element, tiles, home));
    }
  });

  NavigationManager.locationChanging.add(location => {
    DataManager.home = location.type === 'home';
    $scope.visible = Boolean(DataManager.home);
    $timeout(() => reset());
  });
}]);
