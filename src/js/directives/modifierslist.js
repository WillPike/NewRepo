angular.module('SNAP.directives')
.directive('modifierslist',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      entry: '='
    },
    link: function (scope, elem) {
      scope.updateModifiers = (category, modifier) => {
        if (category.data.selection === 1) {
          angular.forEach(category.modifiers, m => m.isSelected = (m === modifier));
        }
        else {
          modifier.isSelected = !modifier.isSelected;
        }
      };
    },
    templateUrl: ShellManager.getPartialUrl('modifiers-list')
  };
}]);
