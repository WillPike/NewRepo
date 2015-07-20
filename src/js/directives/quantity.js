angular.module('SNAP.directives')
.directive('quantity',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      quantity: '=',
      min: '=',
      max: '='
    },
    link: function (scope, elem) {
      scope.min = scope.min || 1;
      scope.max = scope.max || 9;
      scope.data = {
        min: scope.min,
        max: scope.max,
        quantity: parseInt(scope.quantity)
      };

      scope.decrease = () => {
        scope.quantity = scope.data.quantity = scope.data.quantity > scope.data.min ?
          scope.data.quantity - 1 :
          scope.data.min;
      };

      scope.increase = () => {
        scope.quantity = scope.data.quantity = scope.data.quantity < scope.data.max ?
          scope.data.quantity + 1 :
          scope.data.max;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-quantity')
  };
}]);
