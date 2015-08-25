angular.module('SNAP.components')
.factory('ComponentHomeMenu', ['NavigationManager', 'ShellManager', 'SNAPLocation', (NavigationManager, ShellManager, SNAPLocation) => {
  return React.createClass({
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
}]);
