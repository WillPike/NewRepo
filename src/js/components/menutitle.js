angular.module('SNAP.components')
.factory('ComponentMenuTitle', ['NavigationManager', (NavigationManager) => {
  return React.createClass({
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
}]);
