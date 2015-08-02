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

  //Split the current order in the selected way
  $scope.splitCheck = function(type) {
    var i, data = [];

    if (type === $scope.CHECK_SPLIT_NONE) {
      data.push({
        items: OrderManager.model.orderCheck
      });

      $scope.options.guest_count = 1;
      $scope.doneSplitting();
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

      $scope.doneSplitting();
    }
    else if (type === $scope.CHECK_SPLIT_BY_ITEMS) {
      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          name: `Check 0${i + 1}`,
          items: []
        });
      }

      $scope.split_items = OrderManager
        .copyItems(OrderManager.model.orderCheck)
        .reduce((result, item) => {
          while (item.quantity > 0) {
            result.push(item.clone());
            item.quantity--;
          }

          return result;
        }, []);

      $scope.split_items.forEach(item => item.check = data[0]);
      data[0].items = data[0].items.concat($scope.split_items);
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

  $scope.calculateChecks = function() {
    $scope.$parent.data.forEach(check => {
      check.items = $scope.split_items.filter(item => item.check === check);
    });
  };

  $scope.cancelSplitting = function() {
    $scope.guestEditorType = $scope.options.check_split = undefined;
    $scope.$parent.data = originalData;
    originalData = undefined;
  };

  $scope.doneSplitting = function() {
    $scope.$parent.data = $scope.$parent.data.filter(check => check.subtotal > 0 || (check.items && check.items.length > 0));
    $scope.options.step = $scope.STEP_TIPPING;
  };
}]);
