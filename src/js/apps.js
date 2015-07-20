(function() {
  function staticHostRegex() {
    return new RegExp('.*' + SNAP_HOSTS_CONFIG.static + '.*');
  }

  function getPartialUrl(name) {
    return `//${SNAP_HOSTS_CONFIG.static.host}${SNAP_HOSTS_CONFIG.static.path}/dist/${SNAP_ENVIRONMENT.version}` +
      `/assets/${SNAP_CONFIG.theme.layout}/partials/${name}.html`;
  }

  angular.module('SNAPApplication', [
    'ngRoute',
    'ngAnimate',
    'ngTouch',
    'ngSanitize',
    'SNAP.configs',
    'SNAP.controllers',
    'SNAP.directives',
    'SNAP.filters',
    'SNAP.services'
  ]).
  config(
    ['$locationProvider', '$routeProvider', '$sceDelegateProvider',
    ($locationProvider, $routeProvider, $sceDelegateProvider) => {

    $sceDelegateProvider.resourceUrlWhitelist(['self', staticHostRegex()]);

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { template: ' ', controller: 'HomeBaseCtrl' });
    $routeProvider.when('/menu/:token', { template: ' ', controller: 'MenuBaseCtrl' });
    $routeProvider.when('/category/:token', { template: ' ', controller: 'CategoryBaseCtrl' });
    $routeProvider.when('/item/:token', { template: ' ', controller: 'ItemBaseCtrl' });
    $routeProvider.when('/url/:url', { template: ' ', controller: 'UrlCtrl' });
    $routeProvider.when('/checkout', { templateUrl: getPartialUrl('checkout'), controller: 'CheckoutCtrl' });
    $routeProvider.when('/signin', { templateUrl: getPartialUrl('signin'), controller: 'SignInCtrl' });
    $routeProvider.when('/account', { templateUrl: getPartialUrl('account'), controller: 'AccountCtrl' });
    $routeProvider.when('/chat', { templateUrl: getPartialUrl('chat'), controller: 'ChatCtrl' });
    $routeProvider.when('/chatmap', { templateUrl: getPartialUrl('chatmap'), controller: 'ChatMapCtrl' });
    $routeProvider.when('/survey', { templateUrl: getPartialUrl('survey'), controller: 'SurveyCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);

  angular.module('SNAPAuxiliares', [
    'ngRoute',
    'ngAnimate',
    'ngTouch',
    'ngSanitize',
    'SNAP.configs',
    'SNAP.controllers',
    'SNAP.directives',
    'SNAP.filters',
    'SNAP.services'
  ]).
  config(
    ['$locationProvider', '$routeProvider',
    ($locationProvider, $routeProvider) => {

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { templateUrl: getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);
})();
