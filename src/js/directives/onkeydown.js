angular.module('SNAP.directives')
.directive('onKeydown', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var functionToCall = scope.$eval(attrs.onKeydown);
      elem.on('keydown', function(e){
        functionToCall(e.which);
      });
    }
  };
});
