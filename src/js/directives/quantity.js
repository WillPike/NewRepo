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

      scope.decrease = () => {
        scope.quantity = scope.quantity > scope.min ?
          scope.quantity - 1 :
          scope.min;
      };

      scope.increase = () => {
        scope.quantity = scope.quantity < scope.max ?
          scope.quantity + 1 :
          scope.max;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-quantity')
  };
}]);
