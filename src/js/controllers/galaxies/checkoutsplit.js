angular.module('SNAP.controllers')
.controller('GalaxiesCheckoutSplitCtrl',
  ['$scope', '$timeout', 'CustomerManager', 'OrderManager',
  ($scope, $timeout, CustomerManager, OrderManager) => {

  var originalData;

  //Open guest count editor
  $scope.editGuestCount = function(type) {
    if (type === $scope.CHECK_SPLIT_EVENLY || type === $scope.CHECK_SPLIT_BY_ITEMS) {
      originalData = $scope.$parent.data;
      $scope.options.guest_count = $scope.options.guest_count_min;
    }

    $scope.guestEditorType = type;
  };

  //Close guest count editor
  $scope.cancelEditGuestCount = function() {
    $scope.guestEditorType = undefined;
    originalData = undefined;
  };

  //Close item split page
  $scope.cancelSplit = function() {
    $scope.guestEditorType = $scope.options.check_split = undefined;
    $scope.$parent.data = originalData;
    originalData = undefined;
  };

  //Split the current order in the selected way
  $scope.splitCheck = function(type) {
    var i, data = [];

    if (type === $scope.CHECK_SPLIT_NONE) {
      data.push({
        items: OrderManager.model.orderCheck
      });

      $scope.options.guest_count = 1;
      $scope.options.step = $scope.STEP_TIPPING;
    }
    else if (type === $scope.CHECK_SPLIT_EVENLY) {
      var check = OrderManager.model.orderCheck,
          subtotal = OrderManager.calculateTotalPrice(check),
          tax = OrderManager.calculateTax(check);

      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          name: `Check 0${i + 1}`,
          subtotal: Math.round((subtotal / $scope.options.guest_count) * 100) / 100,
          tax: Math.round((tax / $scope.options.guest_count) * 100) / 100
        });
      }

      $scope.options.step = $scope.STEP_TIPPING;
    }
    else if (type === $scope.CHECK_SPLIT_BY_ITEMS) {
      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          name: `Check 0${i + 1}`,
          items: []
        });
      }

      $scope.split_items = OrderManager.copyItems(OrderManager.model.orderCheck);
      data[0].items = data[0].items.concat($scope.split_items);
      data[0].items.forEach(item => item.check = data[0]);
    }

    $scope.$parent.data = data;
    $scope.options.check_split = type;
    $scope.guestEditorType = undefined;
  };

  $scope.getModifiers = entry => {
    if (!entry.modifiers) {
      return [];
    }

    return entry.modifiers.reduce((result, category) => {
      let modifiers = category.modifiers.filter(modifier => modifier.isSelected);
      result = result.concat(modifiers);
      return result;
    }, []);
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
