angular.module('SNAP.controllers')
.factory('CommandUpdateCache',
  ['DataManager', 'LocationManager',
  (DataManager, LocationManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      DataManager.fetchContent().then(resolve, e => {
        console.error(e);
        if (e === 'nodigest') {
          reject(e);
        }
        else{
          resolve('obsolete');
        }
      });
    });
  };
}]);
