angular.module('SNAP.controllers')
.controller('ItemBaseCtrl',
  ['$scope', ($scope) => {
}]);

angular.module('SNAP.controllers')
.controller('ItemCtrl',
  ['$scope', '$timeout', 'AnalyticsModel', 'CustomerModel', 'DataManager', 'DialogManager', 'NavigationManager', 'OrderManager', 'CartModel', 'LocationModel', 'ShellManager', 'SNAPEnvironment', 'ChatManager', 'WebBrowser',
  ($scope, $timeout, AnalyticsModel, CustomerModel, DataManager, DialogManager, NavigationManager, OrderManager, CartModel, LocationModel, ShellManager, SNAPEnvironment, ChatManager, WebBrowser) => {

  function onClose() {
    if (NavigationManager.location.type === 'item') {
      NavigationManager.goBack();
    }
  }

  var ItemImage = React.createClass({
    render: function() {
      return React.DOM.img({
        src: ShellManager.getMediaUrl(this.props.media, 600, 600)
      });
    }
  });

  DataManager.itemChanged.add(item => {
    if (!item) {
      return $timeout(() => {
        let photo = document.getElementById('item-photo');

        if (photo) {
          photo.innerHTML = '';
        }

        $scope.entry = null;
        $scope.type = 1;
      });
    }

    var type = item.type;

    if (type === 2 && item.website) {
      WebBrowser
        .open(item.website.url)
        .then(browser => browser.onExit.addOnce(onClose));
    }
    else if (type === 3 && response.flash) {
      let url = WebBrowser.getFlashUrl(item.flash.media.token, item.flash.width, item.flash.height);

      WebBrowser
        .open(url)
        .then(browser => browser.onExit.addOnce(onClose));
    }

    $timeout(() => {
      if (type === 1) {
        $scope.entry = new app.CartItem(item, 1);

        React.render(
          React.createElement(ItemImage, { media: $scope.entry.item.image }),
          document.getElementById('item-photo')
        );
      }

      $scope.type = type;
    });
  });

  $scope.formatPrice = value => value ? ShellManager.formatPrice(value) : 0;

  $scope.addToCart = () => {
    if (CustomerModel.isEnabled && !CustomerModel.isAuthenticated) {
      DialogManager.alert(app.Alert.SIGNIN_REQUIRED);
      return;
    }

    var entry = $scope.entry;

    if (entry.hasModifiers) {
      CartModel.openEditor(entry, true);
    }
    else {
      OrderManager.addToCart(entry);
      CartModel.cartState = CartModel.STATE_CART;
    }

    NavigationManager.goBack();
  };

  $scope.cancelGift = () => ChatManager.cancelGift();

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(token => {
    $timeout(() => $scope.giftSeat = LocationModel.getSeat(token));
  });

  NavigationManager.locationChanging.add(location => {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);
    $timeout(() => $scope.$apply());
  });
}]);
