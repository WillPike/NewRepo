angular.module('SNAP.controllers')
.factory('CommandCustomerSignup',
  ['AuthenticationManager', 'CustomerManager',
  (AuthenticationManager, CustomerManager) => {

  return function(registration) {
    return CustomerManager.signUp(registration).then(() => {
      var credentials = {
        login: registration.username,
        password: registration.password
      };

      return AuthenticationManager.customerLoginRegular(credentials).then(() => {
        return CustomerManager.login(credentials);
      });
    });
  };
}]);
