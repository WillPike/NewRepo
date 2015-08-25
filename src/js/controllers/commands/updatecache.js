angular.module('SNAP.controllers')
.factory('CommandUpdateCache',
  ['DataManager', 'LocationManager', 'ShellManager',
  (DataManager, LocationManager, ShellManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      DataManager.fetchContent().then(() => {
        DataManager.fetchMedia().then(resolve, reject);
      }, reject);
    });
  };
}]);
