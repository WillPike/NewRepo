angular.module('SNAP.controllers')
.controller('GalaxiesMenuCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager',
  ($scope, $timeout, DataManager, NavigationManager, ShellManager) => {

  var MenuTitle = React.createClass({
    render: function() {
      var menu = this.props.menu;
      return React.DOM.div({}, [
        React.DOM.button({
          key: 1,
          className: 'clickable',
          onClick: e => {
            e.preventDefault();
            NavigationManager.goBack();
          }
        }),
        React.DOM.h1({ key: 2 }, menu.title || ' ')
      ]);
    }
  });

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

  const titleId = 'page-menu-title';
  const contentId = 'page-menu-content';
  const conainerId = 'page-menu-content-container';

  function renderTitle(element, menu) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(MenuTitle, { menu: menu }),
      element
    );
  }

  function renderContent(element, tiles) {
    if (!element) {
      element = document.getElementById(contentId);
    }

    React.render(
      React.createElement(MenuList, { tiles: tiles }),
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
