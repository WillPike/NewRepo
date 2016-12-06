angular.module('SNAP.controllers')
.factory('CommandCustomerSocialLogin',
  ['AuthenticationManager', 'CustomerManager', 'SocialManager',
  (AuthenticationManager, CustomerManager, SocialManager) => {

  function doLogin(auth) {
    return AuthenticationManager.customerLoginSocial(auth).then(() => {
      return CustomerManager.loginSocial(auth);
    });
  }

  return {
    facebook: function() {
      return SocialManager.loginFacebook().then(doLogin);
    },
    googleplus: function() {
      return SocialManager.loginGooglePlus().then(doLogin);
    },
    twitter: function() {
      return SocialManager.loginTwitter().then(doLogin);
    }
  };
}]);
