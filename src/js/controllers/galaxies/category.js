angular.module('SNAP.controllers')
.controller('GalaxiesCategoryCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager) => {

  var CategoryTitle = React.createClass({
    render: function() {
      var category = this.props.category;
      return React.DOM.div({}, [
        React.DOM.button({
          key: 1,
          className: 'clickable',
          onClick: e => {
            e.preventDefault();
            NavigationManager.goBack();
          }
        }),
        React.DOM.h1({ key: 2 }, category.title || ' ')
      ]);
    }
  });

  var CategoryList = React.createClass({
    render: function() {
      var rows = this.props.tiles.map((tile, i) => {
        var background = ShellManager.getMediaUrl(tile.image, 470, 410);
        return (
          React.DOM.td({
            className: 'tile tile-regular',
            key: i
          }, React.DOM.a({
            onClick: e => {
              e.preventDefault();
              NavigationManager.location = tile.destination;
            },
            style: {
              backgroundImage: background ? 'url("' + background + '")' : null
            }
          },
            React.DOM.span(null, tile.title)
          ))
        );
      })
      .reduce((result, value, i) => {
        result[i % 2].push(value);
        return result;
      }, [[], []])
      .map((row, i) => React.DOM.tr({ key: i }, row));

      return React.DOM.table({
        className: 'tile-table'
      }, rows);
    }
  });

  const titleId = 'page-category-title';
  const contentId = 'page-category-content';
  const conainerId = 'page-category-content-container';

  function renderTitle(element, category) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(CategoryTitle, { category: category }),
      element
    );
  }

  function renderContent(element, tiles) {
    if (!element) {
      element = document.getElementById(contentId);
    }

    React.render(
      React.createElement(CategoryList, { tiles: tiles }),
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
