angular.module('SNAP.controllers')
.controller('GalaxiesMenuCtrl',
  ['$scope', '$timeout', 'ComponentMenuTitle', 'ComponentMenuList', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, ComponentMenuTitle, ComponentMenuList, DataManager, NavigationManager, ShellManager) => {

  const titleId = 'page-menu-title';
  const contentId = 'page-menu-content';
  const conainerId = 'page-menu-content-container';

  function renderTitle(element, menu) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(ComponentMenuTitle, {
        menu: {
          title: menu.title
        }
      }),
      element
    );
  }

  function renderContent(element, tiles) {
    if (!element) {
      element = document.getElementById(contentId);
    }

    React.render(
      React.createElement(ComponentMenuList, { tiles: tiles }),
      element
    );
  }

  function reset() {
    var container = document.getElementById(conainerId);
    if (container) {
      container.scrollLeft = 0;
    }
  }

  DataManager.menuChanged.add(menu => {
    if (!menu) {
      return;
    }

    var tiles = menu.categories
      .map(category => {
        let destination = {
          type: 'category',
          token: category.token
        };

        return {
          title: category.title,
          image: category.image,
          url: '#' + NavigationManager.getPath(destination),
          destination: destination
        };
      });

      var titleElement = document.getElementById(titleId),
          contentElement = document.getElementById(contentId);

      if (contentElement && titleElement) {
        renderTitle(titleElement, menu);
        renderContent(contentElement, tiles);
      }
      else {
        $timeout(() => {
          renderTitle(titleElement, menu);
          renderContent(contentElement, tiles);
        });
      }
  });

  NavigationManager.locationChanging.add(location => {
    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.menu);
    $timeout(() => reset());
  });
}]);
