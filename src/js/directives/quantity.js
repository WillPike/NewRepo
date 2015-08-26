angular.module('SNAP.directives')
.directive('quantity',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      quantity: '=',
      min: '@',
      max: '@',
      step: '@',
      appendix: '@'
    },
    link: function (scope, elem) {
      scope.min = scope.min || 1;
      scope.max = scope.max || 9;
      scope.step = scope.step || 1;
      scope.appendix = scope.appendix || '';

      scope.decrease = () => {
        scope.quantity = scope.quantity > parseInt(scope.min) ?
          Math.max(scope.quantity - parseInt(scope.step), parseInt(scope.min)) :
          parseInt(scope.min);
      };

      scope.increase = () => {
        scope.quantity = scope.quantity < parseInt(scope.max) ?
          Math.min(scope.quantity + parseInt(scope.step), parseInt(scope.max)) :
          parseInt(scope.max);
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-quantity')
  };
}]);
