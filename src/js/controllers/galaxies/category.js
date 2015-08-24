angular.module('SNAP.controllers')
.controller('GalaxiesCategoryCtrl',
  ['$scope', '$timeout', 'ComponentMenuTitle', 'ComponentMenuList', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, ComponentMenuTitle, ComponentMenuList, DataManager, NavigationManager, ShellManager) => {

  const titleId = 'page-category-title';
  const contentId = 'page-category-content';
  const conainerId = 'page-category-content-container';

  function renderTitle(element, category) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(ComponentMenuTitle, {
        menu: {
          title: category.title
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

  DataManager.categoryChanged.add(category => {
    if (!category) {
      return;
    }

    var items = category && category.items ? category.items : [],
        categories = category && category.categories ? category.categories : [];

    var tiles = categories.concat(items).map(item => {
      return {
        title: item.title,
        image: item.image,
        url: '#' + NavigationManager.getPath(item.destination),
        destination: item.destination
      };
    });

    var titleElement = document.getElementById(titleId),
        contentElement = document.getElementById(contentId);

    if (titleElement && contentElement) {
      renderTitle(titleElement, category);
      renderContent(contentElement, tiles);
    }
    else {
      $timeout(() => {
        renderTitle(titleElement, category);
        renderContent(contentElement, tiles);
      });
    }
  });

  NavigationManager.locationChanging.add(function(location) {
    if (location.type === 'item') {
      $scope.showModal = true;
      return;
    }

    $scope.showModal = false;

    DataManager.category = location.type === 'category' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.category);
    $timeout(() => reset());
  });
}]);
