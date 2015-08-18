angular.module('SNAP.controllers')
.factory('CommandUpdateCache',
  ['DataManager', 'LocationManager',
  (DataManager, LocationManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      DataManager.initialize().then(result => {
        DataManager.fetchContent().then(resolve, e => {
          if (result === 'nodigest') {
            reject(e);
          }
          else{
            resolve('obsolete');
          }
        });
      }, reject);
    });
  };
}]);
