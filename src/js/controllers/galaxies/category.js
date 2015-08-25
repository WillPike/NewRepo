angular.module('SNAP.controllers')
.controller('GalaxiesCategoryCtrl',
  ['$scope', '$timeout', 'ComponentMenuTitle', 'ComponentMenuList', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, ComponentMenuTitle, ComponentMenuList, DataManager, NavigationManager, ShellManager) => {

  const titleId = 'page-category-title';
  const contentId = 'page-category-content';
  const conainerId = 'page-category-content-container';

  var destinations = [];

  function renderTitle(element, data, destinations) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(ComponentMenuTitle, {
        title: data.title,
        history: data.destinations
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

  function renderData(items, entry) {
    var tiles = items.map(item => {
      let destination = {
        type: item.destination.type,
        token: item.destination.token,
        title: item.title
      };

      return {
        title: item.title,
        image: item.image,
        destination: destination
      };
    });

    var titleElement = document.getElementById(titleId),
        contentElement = document.getElementById(contentId);

    var data = {
      title: entry.title,
      destinations: destinations
    };

    if (titleElement && contentElement) {
      renderTitle(titleElement, data);
      renderContent(contentElement, tiles);
    }
    else {
      $timeout(() => {
        renderTitle(titleElement, data);
        renderContent(contentElement, tiles);
      });
    }
  }

  DataManager.menuChanged.add(menu => {
    if (!menu) {
      return;
    }

    renderData(menu.categories || [], menu);
  });

  DataManager.categoryChanged.add(category => {
    if (!category) {
      return;
    }

    let elements = (category.categories || [])
      .concat(category.items || []);

    renderData(elements, category);
  });

  NavigationManager.locationChanging.add(location => {
    if (location.type === 'menu' || location.type === 'category') {
      destinations = DataManager.getDestinationPath(location);
    }

    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    DataManager.category = location.type === 'category' ? location.token : undefined;

    $scope.showModal = location.type === 'item';
    $scope.visible = Boolean(DataManager.menu) ||
      Boolean(DataManager.category) ||
      Boolean($scope.showModal);

    $timeout(() => reset());
  });
}]);
