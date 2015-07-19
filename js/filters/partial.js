angular.module('SNAP.filters')
.filter('partial', ['ShellManager', (ShellManager) => {
  return (name) => ShellManager.getPartialUrl(name);
}]);
