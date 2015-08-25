angular.module('SNAP.components')
.factory('ComponentMenuTitle', ['NavigationManager', (NavigationManager) => {
  return React.createClass({
    render: function() {
      var title = this.props.title || '',
          history = this.props.history || [];
      return React.DOM.div({}, [
        React.DOM.button({
          key: 1,
          className: 'clickable',
          onClick: e => {
            e.preventDefault();
            NavigationManager.goBack();
          }
        }),
        React.DOM.ul({ key: 2 }, history.map((destination, i) => {
          return React.DOM.li({
            key: i,
            onClick: e => {
              e.preventDefault();
              NavigationManager.location = destination;
            }
          }, destination.title);
        })),
        React.DOM.h1({ key: 3 }, title)
      ]);
    }
  });
}]);
