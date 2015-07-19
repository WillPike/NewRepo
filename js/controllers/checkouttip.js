angular.module('SNAP.controllers')
.controller('CheckoutTipCtrl', ['$scope', '$timeout', 'OrderManager', function($scope, $timeout, OrderManager) {

  //Add a tip
  $scope.addTip = function(amount) {
    $scope.current.tip = Math.round(($scope.current.subtotal * amount) * 100) / 100;
  };

  //Apply the selected tip amount and proceed further
  $scope.applyTip = function() {
    $scope.options.step = $scope.STEP_PAYMENT_METHOD;
  };
}]);
