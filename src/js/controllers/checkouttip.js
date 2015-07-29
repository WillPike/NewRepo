angular.module('SNAP.controllers')
.controller('CheckoutTipCtrl', ['$scope', '$timeout', 'OrderManager', function($scope, $timeout, OrderManager) {

  $scope.tipEditorOpen = false;
  $scope.tipAmount = 0;

  //Add a tip
  $scope.addTip = function(amount) {
    if (amount === undefined) {
      amount = $scope.tipAmount;
    }
    else {
      amount = parseFloat(amount);
    }

console.log(amount);
    if (amount >= 0 && $scope.tipAmount !== amount) {
      $scope.current.tip = Math.round(($scope.current.subtotal * $scope.tipAmount) * 100) / 100;
    }
  };

  //Apply the selected tip amount and proceed further
  $scope.applyTip = function() {
    $scope.options.step = $scope.STEP_PAYMENT_METHOD;
    $scope.tipEditorOpen = false;
  };

  //Edit tip amount
  $scope.editTip = function() {
    $scope.tipEditorOpen = true;
    $scope.addTip(0.1);
  };

  //Edit tip amount
  $scope.cancelEditTip = function() {
    $scope.tipEditorOpen = false;
    $scope.addTip(0);
  };
}]);
