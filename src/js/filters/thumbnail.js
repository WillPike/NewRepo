angular.module('SNAP.filters')
.filter('thumbnail', ['ShellManager', ShellManager => {
  return (media, width, height, extension) => ShellManager.getMediaUrl(media, width, height, extension);
}]);
