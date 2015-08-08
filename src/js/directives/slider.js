angular.module('SNAP.directives')
.directive('slider',
  ['$timeout', 'ShellManager',
  ($timeout, ShellManager) => {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      source: '=',
      slideclick: '=',
      slideshow: '=',
      timeout: '='
    },
    link: function (scope, elem) {
      var timeout = scope.timeout || 5000;
      scope.source = scope.source || [];
      scope.currentIndex = -1;

      var changeImage = function() {
        if (scope.source.length === 0 || scope.disabled) {
          return;
        }

        $timeout.cancel(timer);

        scope.source.forEach(function(entry, i){
          entry.visible = false;
        });

        var entry = scope.source[scope.currentIndex];
        entry.visible = true;

        if (scope.slideshow) {
          scope.slideshow(entry);
        }

        if (entry.type === 'video') {
          var v = $('video', elem);
          v.attr('src', entry.src);
          var video = v.get(0);

          if (!video) {
            timer = $timeout(sliderFunc, 300);
            return;
          }

          var onVideoEnded = function() {
            video.removeEventListener('ended', onVideoEnded, false);
            $timeout(function() { scope.next(); });
          };

          var onVideoError = function(error) {
            video.removeEventListener('error', onVideoError, false);
            $timeout(function() { scope.next(); });
          };

          video.addEventListener('ended', onVideoEnded, false);
          video.addEventListener('error', onVideoError, false);

          try
          {
            video.load();
            video.play();
          }
          catch(e) {
            console.error('Unable to play video: ' + e);
          }
        }
        else {
          timer = $timeout(sliderFunc, timeout);
        }
      };

      scope.next = function() {
        if (scope.currentIndex < scope.source.length - 1) {
          scope.currentIndex++;
        }
        else {
          scope.currentIndex = 0;
        }

        changeImage();
      };

      scope.prev = function() {
        if (scope.currentIndex > 0) {
          scope.currentIndex--;
        }
        else {
          scope.currentIndex = scope.source.length - 1;
        }
        
        changeImage();
      };

      var timer;

      var sliderFunc = function() {
        if (scope.source.length === 0 || scope.disabled) {
          return;
        }

        scope.next();
      };

      scope.$watch('source', function(){
        scope.currentIndex = -1;
        sliderFunc();
      });

      scope.$watch('disabled', function(){
        scope.currentIndex = -1;
        sliderFunc();
      });

      sliderFunc();

      scope.$on('$destroy', function() {
        $timeout.cancel(timer);
      });
    },
    templateUrl: ShellManager.getPartialUrl('slider')
  };
}]);
