angular.module('SNAP.directives')
.directive('textinput',
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
    templateUrl: ShellManager.getPartialUrl('input-text')
  };
}]);
