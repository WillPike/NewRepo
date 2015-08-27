angular.module('SNAP.filters')
.filter('formatprice', ['ShellManager', ShellManager => {
  return (value) => ShellManager.formatPrice(value || 0);
}]);
