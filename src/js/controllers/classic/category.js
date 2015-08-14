angular.module('SNAP.controllers')
.controller('CategoryBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', function($scope, $timeout, DataManager, NavigationManager) {
}]);

angular.module('SNAP.controllers')
.controller('CategoryCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'SNAPEnvironment', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, SNAPEnvironment, ShellManager) => {

  var CategoryList = React.createClass({
    render: function() {
      var tileClassName = ShellManager.tileStyle;
      var rows = this.props.tiles.map(function(tile, i) {
        return (
          React.DOM.td({
            className: tileClassName,
            key: i
          }, React.DOM.a({
            onClick: e => {
              e.preventDefault();
              NavigationManager.location = tile.destination;
            },
            style: {
              backgroundImage: 'url(' + ShellManager.getMediaUrl(tile.image, 370, 370) + ')'
            }
          },
            React.DOM.span(null, tile.title)
          ))
        );
      }).reduce(function(result, value, i) {
        result[i % 2].push(value);
        return result;
      }, [[], []])
      .map(function(row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({ className: 'tile-table' }, rows);
    }
  });

  NavigationManager.locationChanging.add(function(location) {
    DataManager.category = location.type === 'category' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.category);
    $timeout(function() { $scope.$apply(); });
  });

  DataManager.categoryChanged.add(function(data) {
    if (!data) {
      return;
    }

    var tiles,
        categories = data.categories || [];
    tiles = data.items || [];
    tiles = categories.concat(tiles);

    if (SNAPEnvironment.platform !== 'desktop') {
      tiles = tiles.filter(tile => tile.type !== 3);
    }

    tiles.forEach(tile => {
      tile.url = '#' + NavigationManager.getPath(tile.destination);
    });

    React.render(
      React.createElement(CategoryList, { tiles: tiles }),
      document.getElementById('content-category')
    );
  });
}]);
