angular.module('SNAP.controllers')
.controller('GalaxiesHomeCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', 'SNAPLocation',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager, SNAPLocation) => {

  var HomeMenu = React.createClass({
    render: function() {
      let rows = [],
          home = this.props.home;

      if (Boolean(home.intro)) {
        rows.push(React.DOM.td({
          className: 'tile tile-info',
          key: 'intro'
        }, React.DOM.div({}, [
            React.DOM.h1({ key: 'intro-title' },
              home.intro.title || `Welcome to ${SNAPLocation.location_name}`
            ),
            React.DOM.p({ key: 'intro-text' },
              home.intro.text
            )
        ])
        ));
      }

      let tiles = this.props.tiles.map((tile, i) => {
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
      });

      rows = rows.concat(tiles)
      .reduce((result, value) => {
        result[0].push(value);
        return result;
      }, [[]])
      .map((row, i) => React.DOM.tr({ key: i }, row));

      return React.DOM.table({
        className: 'tile-table'
      }, rows);
    }
  });

  const elementId = 'page-home-menu';
  const containerId = 'page-home-menu-container';

  function render(element, tiles, home) {
    if (!element) {
      element = document.getElementById(elementId);
    }

    React.render(
      React.createElement(HomeMenu, { tiles: tiles, home: home }),
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

    var tiles = home.menus
    .map(menu => {
      let destination = {
        type: 'menu',
        token: menu.token
      };

      return {
        title: menu.title,
        image: menu.image,
        url: '#' + NavigationManager.getPath(destination),
        destination: destination
      };
    });

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
