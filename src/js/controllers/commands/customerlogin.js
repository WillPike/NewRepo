angular.module('SNAP.controllers')
.factory('CommandCustomerLogin',
  ['AuthenticationManager', 'CustomerManager',
  (AuthenticationManager, CustomerManager) => {

  return function(credentials) {
    return AuthenticationManager.customerLoginRegular(credentials).then(() => {
      return CustomerManager.login(credentials);
    });
  };
}]);
