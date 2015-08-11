angular.module('SNAP.controllers')
.controller('GalaxiesCategoryCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager) => {

  $scope.goBack = () => NavigationManager.goBack();

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

  DataManager.categoryChanged.add(category => {
    if (!category) {
      return $timeout(() => $scope.category = null);
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

    var element = document.getElementById('page-category-content');

    if (element) {
      React.render(
        React.createElement(CategoryList, { tiles: tiles }),
        element
      );
    }

    $scope.category = category;
    $timeout(() => $scope.$apply());
  });

  NavigationManager.locationChanging.add(function(location) {
    if (location.type === 'item') {
      $scope.showModal = true;
      return;
    }

    $scope.showModal = false;

    DataManager.category = location.type === 'category' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.category);
    $timeout(() => {
      var container = document.getElementById('page-category-content-container');
      container.scrollLeft = 0;

      $scope.$apply();
    });
  });
}]);
