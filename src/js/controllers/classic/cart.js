angular.module('SNAP.controllers')
.controller('CartCtrl',
  ['$scope', '$timeout', '$sce', 'CustomerManager', 'ShellManager', 'NavigationManager', 'OrderManager', 'DialogManager', 'CartModel', 'LocationModel', 'ChatManager',
  ($scope, $timeout, $sce, CustomerManager, ShellManager, NavigationManager, OrderManager, DialogManager, CartModel, LocationModel, ChatManager) => {

  $scope.formatPrice = value => ShellManager.formatPrice(value);
  $scope.options = {};

  $scope.state = CartModel.cartState;
  $scope.visible = CartModel.cartState !== CartModel.STATE_NONE;
  CartModel.cartStateChanged.add(state => $timeout(() => {
    $scope.state = CartModel.cartState !== CartModel.STATE_NONE;
  }));

  $scope.currentOrder = OrderManager.model.orderCart;
  OrderManager.model.orderCartChanged.add(value => $scope.currentOrder = value);

  $scope.totalOrder = OrderManager.model.orderCheck;
  OrderManager.model.orderCheckChanged.add(value => $scope.totalOrder = value);

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(token => {
    $timeout(() => $scope.giftSeat = LocationModel.getSeat(token));
  });

  $scope.requestAssistanceAvailable = true;
  $scope.requestCloseoutAvailable = true;
  $scope.checkoutEnabled = CustomerManager.model.isEnabled;
  $scope.toGoOrder = false;

  NavigationManager.locationChanging.add(location => {
    if (location.type !== 'category') {
      CartModel.cartState = CartModel.STATE_NONE;
    }
  });

  $scope.seat_name = LocationModel.seat ?
    LocationModel.seat.name :
    'Table';

  LocationModel.seatChanged.add(seat => $scope.seat_name = seat ? seat.name : 'Table');

  var refreshAssistanceRequest = () => {
    $scope.requestAssistanceAvailable = OrderManager.model.assistanceRequest === null;
  };
  var refreshCloseoutRequest = () => {
    $scope.requestCloseoutAvailable = OrderManager.model.closeoutRequest === null;
  };

  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  OrderManager.model.closeoutRequestChanged.add(refreshCloseoutRequest);
  refreshAssistanceRequest();
  refreshCloseoutRequest();

  $scope.calculateDescription = entry => {
    var result = entry.name || entry.item.title;

    result += entry.modifiers.reduce((output, category) => {
      return output + category.modifiers.reduce((output, modifier) => {
        return output + (modifier.isSelected ?
          '<br/>- ' + modifier.data.title :
          '');
      }, '');
    }, '');

    return $sce.trustAsHtml(result);
  };

  $scope.calculatePrice = entry => OrderManager.calculatePrice(entry);
  $scope.calculateTotalPrice = entries => OrderManager.calculateTotalPrice(entries);

  $scope.editItem = entry => CartModel.openEditor(entry, false);
  $scope.removeFromCart = entry => $scope.currentOrder = OrderManager.removeFromCart(entry);
  $scope.reorderItem = entry => $scope.currentOrder = OrderManager.addToCart(entry.clone());

  $scope.submitCart = () => {
    var job = DialogManager.startJob();

    var options = $scope.options.to_go_order ? 2 : 0;

    OrderManager.submitCart(options).then(function() {
      DialogManager.endJob(job);

      $scope.$apply(() => {
        $scope.currentOrder = OrderManager.model.orderCart;
        $scope.totalOrder = OrderManager.model.orderCheck;
        $scope.toGoOrder = false;
      });

      DialogManager.alert(app.Alert.REQUEST_ORDER_SENT);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.clearCart = () => {
    $scope.toGoOrder = false;
    $scope.currentOrder = OrderManager.clearCart();
  };

  $scope.closeCart = () => {
    CartModel.cartState = CartModel.STATE_NONE;
  };

  $scope.showHistory = () => CartModel.cartState = CartModel.STATE_HISTORY;
  $scope.showCart = () => CartModel.cartState = CartModel.STATE_CART;

  $scope.payCheck = () => NavigationManager.location = { type: 'checkout' };

  $scope.requestAssistance = () => {
    if (!$scope.requestAssistanceAvailable){
      return;
    }

    DialogManager.confirm(app.Alert.TABLE_ASSISTANCE).then(() => {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(() => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_ASSISTANCE_SENT);
      }, () => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.requestCloseout = () => {
    if (!$scope.requestCloseoutAvailable) {
      return;
    }

    var job = DialogManager.startJob();

    OrderManager.requestCloseout().then(() => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_CLOSEOUT_SENT);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };
}]);
