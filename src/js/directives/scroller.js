angular.module('SNAP.directives')
.directive('scroller', ['ActivityMonitor', 'SNAPEnvironment', function (ActivityMonitor, SNAPEnvironment) {
  return {
    restrict: 'C',
    replace: false,
    link: function (scope, elem) {
      if (SNAPEnvironment.platform === 'desktop') {
        $(elem).kinetic({
          y: false,
    		  filterTarget: function(target, e){
            if (!/down|start|click/.test(e.type)){
              return !(/a|img/i.test(target.tagName));
            }
    		  },
    		  stopped: function () {
            ActivityMonitor.activityDetected();
          }
        });
      }
    }
  };
}]);
