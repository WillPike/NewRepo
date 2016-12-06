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
      var min = parseInt(scope.min),
          max = parseInt(scope.max),
          step = parseInt(scope.step) || 1,
          appendix = scope.appendix || '';

      if (isNaN(min)) {
        min = 1;
      }

      if (isNaN(max)) {
        max = 9;
      }

      scope.decrease = () => {


        scope.quantity = (scope.quantity - step) >= min ?
          scope.quantity - step :
          min;
      };

      scope.increase = () => {
        scope.quantity = scope.quantity + step <= max ?
          scope.quantity + step :
          max;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-quantity')
  };
}]);
