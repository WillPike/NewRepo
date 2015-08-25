angular.module('SNAP.components')
.factory('ComponentMenuList', ['NavigationManager', 'ShellManager', (NavigationManager, ShellManager) => {
  return React.createClass({
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
}]);
