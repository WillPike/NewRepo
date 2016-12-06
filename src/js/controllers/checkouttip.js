angular.module('SNAP.controllers')
.controller('CheckoutTipCtrl', ['$scope', '$timeout', 'OrderManager', function($scope, $timeout, OrderManager) {

  $scope.tipEditorOpen = false;
  $scope.data = {
    tipAmount: 0.0,
    tipAmountInt: 0
  };

  //Add a tip
  $scope.addTip = function(amount) {
    if (amount >= 0) {
      $scope.data.tipAmount = amount;
      $scope.data.tipAmountInt = amount * 100;
      $scope.current.tip = Math.round(($scope.current.subtotal * amount) * 100) / 100;
    }
  };

  //Apply the selected tip amount and proceed further
  $scope.applyTip = function() {
    $scope.options.step = $scope.STEP_PAYMENT;
    $scope.tipEditorOpen = false;
  };

  //Edit tip amount
  $scope.editTip = function() {
    $scope.tipEditorOpen = true;
    $scope.addTip(0.2);
  };

  //Edit tip amount
  $scope.cancelEditTip = function() {
    $scope.tipEditorOpen = false;
    $scope.addTip(0.0);
  };

  $scope.$watchAsProperty('data.tipAmount')
    .skipDuplicates()
    .subscribe(function(value) {
      if (!value.value) {
        return;
      }

      var amount = parseFloat(value.value());

      if (amount >= 0) {
        $scope.addTip(amount);
      }
    });

  $scope.$watchAsProperty('data.tipAmountInt')
    .skipDuplicates()
    .subscribe(function(value) {
      if (!value.value) {
        return;
      }

      var amount = parseInt(value.value()) / 100;

      if (amount >= 0) {
        $scope.addTip(amount);
      }
    });
}]);
