angular.module('SNAP.directives')
.directive('switch',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      disabled: '=?',
      selected: '=?'
    },
    link: function (scope, elem) {
      scope.disabled = Boolean(scope.disabled);
      scope.selected = Boolean(scope.selected);
      scope.data = {
        disabled: Boolean(scope.disabled),
        selected: Boolean(scope.selected),
        changed: false
      };

      scope.toggle = () => {
        if (scope.disabled) {
          return;
        }

        scope.selected = scope.data.selected = !scope.data.selected;
        scope.data.changed = true;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-switch')
  };
}]);
