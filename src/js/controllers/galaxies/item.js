angular.module('SNAP.controllers')
.controller('GalaxiesItemCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'OrderManager', 'ShellManager', 'WebBrowser', 'CommandSubmitOrder',
  ($scope, $timeout, DataManager, NavigationManager, OrderManager, ShellManager, WebBrowser, CommandSubmitOrder) => {

  $scope.goBack = () => NavigationManager.goBack();

  function onClose() {
    if (NavigationManager.location.type === 'item') {
      $timeout(() => $scope.goBack());
    }
  }

  var ItemDescription = React.createClass({
    render: function() {
      var entry = this.props.entry;
      return (
        React.DOM.div({
          className: 'page-item-info'
        }, [
          React.DOM.h1({ key: 1 }, entry.item.title || '&nbsp;'),
          React.DOM.h2({ key: 2 }, $scope.formatPrice(entry.item.order.price) || '&nbsp;'),
          React.DOM.p({ key: 3 }, entry.item.description || '&nbsp;')
        ])
      );
    }
  });

  DataManager.itemChanged.add(item => {
    if (!item) {
      $scope.visible = false;
      $timeout(() => {
        $scope.entry = $scope.entries = null;
        $scope.type = 1;
        $scope.step = 0;
        $scope.entryIndex = 0;
      });
      return;
    }

    var type = item.type;

    if (type === 2 && item.website) {
      WebBrowser
        .open(item.website.url)
        .then(browser => browser.onExit.addOnce(onClose));
    }
    else if (type === 3 && item.flash) {
      let url = WebBrowser.getFlashUrl(item.flash.media.token, item.flash.width, item.flash.height);

      WebBrowser
        .open(url)
        .then(browser => browser.onExit.addOnce(onClose));
    }

    var entry;
    var element = document.getElementById('page-item-info');

    if (type === 1) {
      entry = new app.CartItem(item, 1);

      if (element) {
        React.render(
          React.createElement(ItemDescription, { entry: entry }),
          element
        );
      }
    }
    else {
      if (element) {
        element.innerHTML = '';
      }
    }

    $scope.visible = type === 1;
    $scope.entry = entry;
    $scope.type = type;
    $scope.step = 0;
    $scope.entryIndex = 0;
  });

  $scope.getMediaUrl = (media, w, h, extension) => ShellManager.getMediaUrl(media, w, h, extension);
  $scope.formatPrice = value => value ? ShellManager.formatPrice(value) : 0;

  $scope.nextStep = () => {
    if ($scope.step === 0) {
      if ($scope.entry.hasModifiers) {
        $scope.entries = $scope.entry.cloneMany();
        $scope.currentEntry = $scope.entries[$scope.entryIndex = 0];
        $scope.step = 1;
      }
      else {
        OrderManager.addToCart($scope.entry);
        $scope.step = 2;
      }
    }
    else if ($scope.step === 1) {
      if ($scope.entryIndex === $scope.entries.length - 1) {
        $scope.entries.forEach(entry => OrderManager.addToCart(entry));
        $scope.step = 2;
      }
      else {
        $scope.currentEntry = $scope.entries[++$scope.entryIndex];
      }
    }
  };

  $scope.previousStep = () => {
    if ($scope.step === 1 && $scope.entryIndex > 0) {
      $scope.currentEntry = $scope.entries[--$scope.entryIndex];
    }
    else if ($scope.step === 0) {
      $scope.goBack();
    }
    else {
      $scope.step--;
    }
  };

  $scope.updateModifiers = (category, modifier) => {
    if (category.data.selection === 1) {
      angular.forEach(category.modifiers, m => m.isSelected = (m === modifier));
    }
    else {
      modifier.isSelected = !modifier.isSelected;
    }
  };

  $scope.submitOrder = () => {
    CommandSubmitOrder();
    $scope.goBack();
  };

  NavigationManager.locationChanging.add(location => {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $timeout(() => $scope.$apply());
  });
}]);
