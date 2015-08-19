angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['AuthenticationManager', 'LocationManager',
  (AuthenticationManager, LocationManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      AuthenticationManager.validate().then(authorized => {
        if (authorized === false) {
          AuthenticationManager.authorize().then(() => {
            resolve('reboot');
          }, reject);
          return;
        }

        LocationManager.loadConfig().then(() => {
          LocationManager.loadSeats().then(() => {
            resolve();
          }, reject);
        }, reject);
      }, reject);
    });
  };
}]);
