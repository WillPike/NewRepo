angular.module('SNAP.controllers')
.controller('ItemBaseCtrl',
  ['$scope', ($scope) => {
}]);

angular.module('SNAP.controllers')
.controller('ItemCtrl',
  ['$scope', '$timeout', 'AnalyticsModel', 'CustomerModel', 'DataManager', 'DialogManager', 'NavigationManager', 'OrderManager', 'CartModel', 'LocationModel', 'ShellManager', 'SNAPEnvironment', 'ChatManager',
  ($scope, $timeout, AnalyticsModel, CustomerModel, DataManager, DialogManager, NavigationManager, OrderManager, CartModel, LocationModel, ShellManager, SNAPEnvironment, ChatManager) => {

  var ItemImage = React.createClass({
    render: function() {
      return React.DOM.img({
        src: ShellManager.getMediaUrl(this.props.media, 600, 600)
      });
    }
  });

  NavigationManager.locationChanging.add(location => {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);
    $timeout(function() { $scope.$apply(); });
  });

  DataManager.itemChanged.add(response => {
    if (!response && ($scope.websiteUrl || $scope.flashUrl)) {
      WebBrowser.close();
    }

    $scope.websiteUrl = null;
    $scope.flashUrl = null;

    if (!response) {
      $scope.entry = null;

      if ($scope.type === 1) {
        document.getElementById('item-photo').innerHTML = '';
      }

      $scope.type = 1;
      $timeout(() => $scope.$apply());
      return;
    }

    let type = response.type;

    if (type === 2 && response.website) {
      $scope.websiteUrl = response.website.url;
      WebBrowser.open($scope.websiteUrl);
    }
    else if (type === 3 && response.flash) {
      var url = '/flash#url=' + encodeURIComponent(getMediaUrl(response.flash.media, 0, 0, 'swf')) +
        '&width=' + encodeURIComponent(response.flash.width) +
        '&height=' + encodeURIComponent(response.flash.height);
      $scope.flashUrl = ShellManager.getAppUrl(url);
      WebBrowser.open($scope.flashUrl);
    }
    else if (type === 1) {
      $scope.entry = new app.CartItem(response, 1);

      React.render(
        React.createElement(ItemImage, { media: $scope.entry.item.image }),
        document.getElementById('item-photo')
      );
    }

    $scope.type = type;
    $timeout(function() { $scope.$apply(); });
  });

  $scope.getMediaUrl = (media, width, height, extension) => ShellManager.getMediaUrl(media, width, height, extension);
  $scope.formatPrice = value => value ? ShellManager.formatPrice(value) : 0;

  $scope.addToCart = () => {
    if (CustomerModel.isEnabled && !CustomerModel.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    var entry = $scope.entry;

    if (entry.hasModifiers) {
      CartModel.openEditor(entry, true);
    }
    else {
      OrderManager.addToCart(entry);
      CartModel.isCartOpen = true;
    }

    NavigationManager.goBack();
  };

  $scope.cancelGift = () => ChatManager.cancelGift();

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(token => {
    $timeout(() => $scope.giftSeat = LocationModel.getSeat(token));
  });
}]);
