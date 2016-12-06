angular.module('SNAP.controllers')
  .controller('GalaxiesCartCtrl',
  ['$scope', '$timeout', '$sce', 'CustomerManager', 'ShellManager', 'NavigationManager', 'OrderManager', 'DialogManager', 'CartModel', 'LocationModel', 'ChatManager',
  ($scope, $timeout, $sce, CustomerManager, ShellManager, NavigationManager, OrderManager, DialogManager, CartModel, LocationModel, ChatManager) => {

      $scope.STATE_CART = CartModel.STATE_CART;
      $scope.STATE_HISTORY = CartModel.STATE_HISTORY;

      $scope.options = {};

      $scope.currency = ShellManager.model.currency;
      ShellManager.model.currencyChanged.add(currency => $timeout(() => $scope.currency = currency));

      $scope.editableItem = CartModel.editableItem;
      CartModel.editableItemChanged.add(item => $timeout(() => $scope.editableItem = item));

      $scope.currentOrder = OrderManager.model.orderCart;
      OrderManager.model.orderCartChanged.add(value => $timeout(() => $scope.currentOrder = value));

      $scope.totalOrder = OrderManager.model.orderCheck;
      OrderManager.model.orderCheckChanged.add(value => $timeout(() => $scope.totalOrder = value));

      $scope.cartCount = OrderManager.calculateCount(OrderManager.model.orderCart);
      OrderManager.model.orderCartChanged.add(cart => {
        $timeout(() => $scope.cartCount = OrderManager.calculateCount(cart));
      });

      $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
      ChatManager.model.giftSeatChanged.add(token => {
        $timeout(() => $scope.giftSeat = LocationModel.getSeat(token));
      });

      $scope.customerName = CustomerManager.customerName;
      CustomerManager.model.profileChanged.add(() => {
        $timeout(() => $scope.customerName = CustomerManager.customerName || 'Guest');
      });

      $scope.checkoutEnabled = CustomerManager.model.isEnabled;

      $scope.state = CartModel.cartState;
      $scope.visible = CartModel.cartState !== CartModel.STATE_NONE;
      CartModel.cartStateChanged.add(state => $timeout(() => {
        $scope.state = state;
        $scope.visible = state !== CartModel.STATE_NONE;
      }));

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

      $scope.requestAssistanceAvailable = OrderManager.model.assistanceRequest === null;
      $scope.requestCloseoutAvailable = OrderManager.model.closeoutRequest === null;

      $scope.getModifiers = entry => {
        if (!entry || !entry.modifiers) {
          return [];
        }

        return entry.modifiers.reduce((result, category) => {
          let modifiers = category.modifiers.filter(modifier => {
            return (!modifier.data.is_default && modifier.isSelected) || (modifier.data.is_default && !modifier.isSelected) || modifier.isExtra;
          });
          result = result.concat(modifiers);
          return result;
        }, []);
      };

      $scope.calculatePrice = entry => OrderManager.calculatePrice(entry);
      $scope.calculateTotalPrice = entries => OrderManager.calculateTotalPrice(entries);

      $scope.editItem = entry => CartModel.openEditor(entry, false);

      $scope.removeFromCart = entry => {
        DialogManager.confirm(app.Alert.ITEM_REMOVE_FROM_CART).then(() => {
          $scope.currentOrder = OrderManager.removeFromCart(entry);
        });
      };

      $scope.reorderItem = entry => {
        DialogManager.alert(app.Alert.ITEM_ADDED_TO_CART);
        $scope.currentOrder = OrderManager.addToCart(entry.clone());
      };

      $scope.submitCart = () => {
        DialogManager.confirm(app.Alert.TABLE_SUBMIT_ORDER).then(() => {
          var job = DialogManager.startJob();

          var options = $scope.options.toGo ? 2 : 0;

          OrderManager.submitCart(options).then(function() {
            DialogManager.endJob(job);

            $scope.$apply(() => {
              $scope.currentOrder = OrderManager.model.orderCart;
              $scope.totalOrder = OrderManager.model.orderCheck;
              $scope.options.toGo = false;
            });

            DialogManager.alert(app.Alert.REQUEST_ORDER_SENT);
          }, () => {
            DialogManager.endJob(job);
            DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
          });
        });
      };

      $scope.closeEditor = () => {
        CartModel.closeEditor();
      };

      $scope.closeCart = () => {
        CartModel.cartState = CartModel.STATE_NONE;
        NavigationManager.location = { type: 'home' };
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
