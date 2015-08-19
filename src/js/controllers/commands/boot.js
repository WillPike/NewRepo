angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['AuthenticationManager', 'LocationManager',
  (AuthenticationManager, LocationManager) => {

  return function() {
    return new Promise((resolve, reject) => {
      function loadLocation() {
        LocationManager.loadConfig().then(() => {
          LocationManager.loadSeats().then(() => {
            resolve();
          }, reject);
        }, reject);
      }

      AuthenticationManager.validate().then(authorized => {
        if (authorized === false) {
          AuthenticationManager.authorize().then(loadLocation, reject);
          return;
        }

        loadLocation();
      }, reject);
    });
  };
}]);
