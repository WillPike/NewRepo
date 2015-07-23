(function() {
  function _staticHostRegex(SNAP_HOSTS_CONFIG) {
    return new RegExp('.*' + SNAP_HOSTS_CONFIG.static + '.*');
  }

  function _getPartialUrl(SNAP_CONFIG, SNAP_HOSTS_CONFIG, SNAP_ENVIRONMENT, name) {
    var host = SNAP_HOSTS_CONFIG.static.host ?
      `//${SNAP_HOSTS_CONFIG.static.host}${SNAP_HOSTS_CONFIG.static.path}` :
      `${SNAP_HOSTS_CONFIG.static.path}`;

    return `${host}/assets/${SNAP_CONFIG.theme.layout}/partials/${name}.html`;
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
    ['$locationProvider', '$routeProvider', '$sceDelegateProvider', 'SNAPConfig', 'SNAPHosts', 'SNAPEnvironment',
    ($locationProvider, $routeProvider, $sceDelegateProvider, SNAPConfig, SNAPHosts, SNAPEnvironment) => {

    var getPartialUrl = name => _getPartialUrl(SNAPConfig, SNAPHosts, SNAPEnvironment, name),
        staticHostRegex = () => _staticHostRegex(SNAPHosts);

    if (SNAPHosts.static.host) {
      $sceDelegateProvider.resourceUrlWhitelist(['self', staticHostRegex()]);
    }

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

  angular.module('SNAPStartup', [
    'ngRoute',
    'SNAP.configs',
    'SNAP.controllers',
    'SNAP.directives',
    'SNAP.filters',
    'SNAP.services'
  ]).
  config(() => {});

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
    ['$locationProvider', '$routeProvider', 'SNAPConfig', 'SNAPHosts', 'SNAPEnvironment',
    ($locationProvider, $routeProvider, SNAPConfig, SNAPHosts, SNAPEnvironment) => {

    var getPartialUrl = name => _getPartialUrl(SNAPConfig, SNAPHosts, SNAPEnvironment, name);

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { templateUrl: getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);
})();
