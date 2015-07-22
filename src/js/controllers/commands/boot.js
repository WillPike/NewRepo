angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['AuthenticationManager',
  (AuthenticationManager) => {

  return function() {
    return AuthenticationManager.validate().then(token => {
      if (!token) {
        return AuthenticationManager.authorize();
      }

      return Promise.resolve();
    });
  };
}]);
