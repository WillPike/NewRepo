angular.module('SNAP.controllers')
.factory('CommandCustomerGuestLogin',
  ['AuthenticationManager', 'CustomerManager',
  (AuthenticationManager, CustomerManager) => {

  return function() {
    return CustomerManager.guestLogin();
  };
}]);
