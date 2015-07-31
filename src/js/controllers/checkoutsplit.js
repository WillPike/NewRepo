angular.module('SNAP.controllers')
.controller('CheckoutSplitCtrl',
  ['$scope', '$timeout', 'OrderManager',
  ($scope, $timeout, OrderManager) => {

  //Open guest count editor
  $scope.editGuestCount = function(type) {
    $scope.guestEditorType = type;
  };

  //Close guest count editor
  $scope.cancelEditGuestCount = function() {
    $scope.guestEditorType = undefined;
  };

  //Split the current order in the selected way
  $scope.splitCheck = function(type) {
    var i, data = [];

    if (type === $scope.CHECK_SPLIT_NONE) {
      data.push({
        items: OrderManager.model.orderCheck
      });

      $scope.options.step = $scope.STEP_TIPPING;
    }
    else if (type === $scope.CHECK_SPLIT_EVENLY) {
      var check = OrderManager.model.orderCheck,
          subtotal = OrderManager.calculateTotalPrice(check),
          tax = OrderManager.calculateTax(check);

      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          subtotal: Math.round((subtotal / $scope.options.guest_count) * 100) / 100,
          tax: Math.round((tax / $scope.options.guest_count) * 100) / 100
        });
      }

      $scope.options.step = $scope.STEP_TIPPING;
    }
    else if (type === $scope.CHECK_SPLIT_BY_ITEMS) {
      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          items: []
        });
      }

      $scope.split_items = OrderManager.model.orderCheck.slice(0).map(item => item.clone());
    }

    $scope.$parent.data = data;
    $scope.options.check_split = type;
    $scope.guestEditorType = undefined;
  };

  //Move an item to the current check
  $scope.addToCheck = function(entry) {
    $scope.split_items = $scope.split_items
    .map(item => {
      if (item.request !== entry.request) {
        return item;
      }

      if (item.quantity > 1) {
        item.quantity--;
        return item.clone();
      }

      return null;
    })
    .filter(item => item != null);

    var exists = false;

    $scope.current.items = $scope.current.items
    .map(item => {
      if (item.request === entry.request) {
        exists = true;
        item.quantity++;
        return item.clone();
      }

      return item;
    });

    if (!exists) {
      var clone = entry.clone();
      clone.quantity = 1;

      $scope.current.items.push(clone);
    }
  };

  //Remove an item from the current check
  $scope.removeFromCheck = function(entry) {
    $scope.current.items = $scope.current.items
    .map(item => {
      if (item.request !== entry.request) {
        return item;
      }

      if (item.quantity > 1) {
        item.quantity--;
        return item.clone();
      }

      return null;
    })
    .filter(item => item != null);

    var exists = false;

    $scope.split_items = $scope.split_items
    .map(item => {
      if (item.request === entry.request) {
        exists = true;
        item.quantity++;
        return item.clone();
      }

      return item;
    });

    if (!exists) {
      var clone = entry.clone();
      clone.quantity = 1;

      $scope.split_items.push(clone);
    }
  };

  //Move all available items to the current check
  $scope.addAllToCheck = function() {
    $scope.split_items.forEach($scope.addToCheck);

    $scope.split_items.forEach(item => {
      $scope.current.items.forEach(newitem => {
        if (newitem.request === item.request) {
          newitem.quantity += item.quantity;
        }
      });
    });

    $scope.split_items = [];
  };

  //Remove all items from the current check
  $scope.removeAllFromCheck = function() {
    $scope.current.items.forEach($scope.removeFromCheck);

    $scope.current.items.forEach(item => {
      $scope.split_items.forEach(newitem => {
        if (newitem.request === item.request) {
          newitem.quantity += item.quantity;
        }
      });
    });

    $scope.current.items = [];
  };

  //Proceed with the next check splitting
  $scope.splitNextCheck = function() {
    if ($scope.options.index < $scope.options.count - 1 && $scope.split_items.length > 0) {
      $scope.options.index++;
      return;
    }

    if ($scope.split_items.length > 0) {
      $scope.addAllToCheck();
    }

    $timeout(() => {
      $scope.$parent.data = $scope.$parent.data.filter(function(check) {
        return check.items.length > 0;
      });

      $scope.options.step = $scope.STEP_TIPPING;
    });
  };

  var step = $scope.$watchAsProperty('options.step');
  step
  .skipDuplicates()
  .subscribe(function(value) {
    if (!value.value || value.value() !== $scope.STEP_CHECK_SPLIT) {
      return;
    }

    $timeout(() => {
      $scope.options.check_split = $scope.CHECK_SPLIT_NONE;
    });
  });
}]);
