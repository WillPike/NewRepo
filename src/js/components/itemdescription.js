angular.module('SNAP.components')
.factory('ComponentItemDescription', ['NavigationManager', 'ShellManager', (NavigationManager, ShellManager) => {
  return React.createClass({
    render: function() {
      var entry = this.props.entry;
      return (
        React.DOM.div({
          className: 'page-item-info'
        }, [
          React.DOM.h1({ key: 1 }, entry.item.title || ' '),
          React.DOM.h2({ key: 2 }, ShellManager.formatPrice(entry.item.order.price) || ' '),
          React.DOM.p({ key: 3 }, entry.item.description || ' ')
        ])
      );
    }
  });
}]);
