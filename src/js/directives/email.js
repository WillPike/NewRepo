angular.module('SNAP.directives')
.directive('email',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {

  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      disabled: '=?',
      ngModel: '=',
      placeholder: '@'
    },
    templateUrl: ShellManager.getPartialUrl('input-email')
  };
}]);
