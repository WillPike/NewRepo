angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['AuthenticationManager', 'LocationManager',
  (AuthenticationManager, LocationManager) => {

  function loadLocation() {
    return LocationManager.loadConfig()
      .then(() => LocationManager.loadSeats());
  }

  return function() {
    return AuthenticationManager.validate().then(authorized => {
      if (!authorized) {
        return AuthenticationManager.authorize().then(() => loadLocation());
      }

      return loadLocation();
    });
  };
}]);
