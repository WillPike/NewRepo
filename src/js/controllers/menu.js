angular.module('SNAP.controllers')
.controller('MenuBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', ($scope, $timeout, DataManager, NavigationManager) => {
}]);

angular.module('SNAP.controllers')
.controller('MenuCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager) => {

  var MenuList = React.createClass({
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
    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.menu);
    $timeout(function() { $scope.$apply(); });
  });

  DataManager.menuChanged.add(function(menu) {
    if (!menu) {
      return;
    }

    menu.categories.forEach(tile => {
      tile.url = '#' + NavigationManager.getPath(tile.destination);
    });

    React.render(
      React.createElement(MenuList, { tiles: menu.categories }),
      document.getElementById('content-menu')
    );
  });
}]);
