angular.module('SNAP.controllers')
.controller('GalaxiesMenuCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager) => {

  $scope.goBack = () => NavigationManager.goBack();

  var MenuList = React.createClass({
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

  DataManager.menuChanged.add(menu => {
    if (!menu) {
      return $timeout(() => $scope.menu = null);
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

    var element = document.getElementById('page-menu-content');

    if (element) {
      React.render(
        React.createElement(MenuList, { tiles: tiles }),
        element
      );
    }

    $scope.menu = menu;
    $timeout(() => $scope.$apply());
  });

  NavigationManager.locationChanging.add(location => {
    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.menu);
    $timeout(() => {
      var container = document.getElementById('page-menu-content-container');
      if (container) {
        container.scrollLeft = 0;
      }

      $scope.$apply();
    });
  });
}]);
