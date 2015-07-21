angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['Logger', 'AuthenticationManager',
  (Logger, AuthenticationManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      AuthenticationManager.authorize().then(token => {
        console.log(token);
        resolve();
      }, e => {
        console.error(e);
        reject(e);
      });
    });
  };
}]);
