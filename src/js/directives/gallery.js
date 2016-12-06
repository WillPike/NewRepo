angular.module('SNAP.directives')
.directive('gallery', [
  'ActivityMonitor', 'ShellManager', '$timeout',
  (ActivityMonitor, ShellManager, $timeout) => {

  var slider,
      settings = {
        mode: 'fade',
        wrapperClass: 'photo-gallery'
      };

  return {
    restrict: 'E',
    replace: false,
    scope: {
      images: '=',
      imagewidth : '=?',
      imageheight: '=?'
    },
    templateUrl: ShellManager.getPartialUrl('gallery'),
    link: (scope, elem, attrs) => {
      elem.ready(() => {
        slider = $('.bxslider', elem).bxSlider(settings);
      });

      scope.$watch('images', () => {
        scope.medias = (scope.images || []).map(image => ShellManager.getMediaUrl(image, attrs.imagewidth, attrs.imageheight));
        settings.pager = scope.medias.length > 1;
        $timeout(() => slider.reloadSlider(settings));
      });
    }
  };
}]);
