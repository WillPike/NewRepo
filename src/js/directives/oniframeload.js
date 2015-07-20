angular.module('SNAP.directives')
.directive('onIframeLoad', function() {
  return {
    restrict: 'A',
    scope: {
      callback: '&onIframeLoad'
    },
    link: function(scope, element, attrs) {
      element.bind('load', function(e) {
        if (typeof (scope.callback) === 'function') {
          scope.callback({ event: e });
        }
      });
    }
  };
});
