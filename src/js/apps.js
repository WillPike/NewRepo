//------------------------------------------------------------------------
//
//  ApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.ApplicationBootstraper = class ApplicationBootstraper {

  constructor() {
    this.hosts = {
      api: { 'host': 'api2.managesnap.com', 'secure': true },
      content: { 'host': 'content.managesnap.com', 'secure': false },
      media: { 'host': 'content.managesnap.com', 'secure': false },
      static: { 'path': '/' },
      socket: { 'host': 'web-dev.managesnap.com', 'secure': true, 'port':8080, 'path': '/socket/' }
    };

    this.environment = {
      main_application: { 'client_id': 'd67610b1c91044d8abd55cbda6c619f0', 'callback_url': 'http://api2.managesnap.com/callback/api', 'scope': '' },
      customer_application: { 'client_id': '91381a86b3b444fd876df80b22d7fa6e' },
      facebook_application: { 'client_id': '349729518545313', 'redirect_url': 'https://web.managesnap.com/callback/facebook' },
      googleplus_application: { 'client_id': '678998250941-1dmebp4ksni9tsjth45tsht8l7cl1mrn.apps.googleusercontent.com', 'redirect_url': 'https://web.managesnap.com/callback/googleplus' },
      twitter_application: { 'consumer_key': 'yQ8XJ15PmaPOi4L5DJPikGCI0', 'redirect_url': 'https://web.managesnap.com/callback/twitter' }
    };
  }

  //-----------------------------------------------
  //    Public methods
  //-----------------------------------------------

  configure() {
    var self = this;
    return new Promise((resolve, reject) => {
      var store = new app.CordovaLocalStorageStore('snap_location');

      store.read().then(config => {
        self.location = config || null;

        angular.module('SNAP.configs', [])
          .constant('SNAPLocation', self.location)
          .constant('SNAPEnvironment', self.environment)
          .constant('SNAPHosts', self.hosts);

        if (self.hosts.static.host) {
          $sceDelegateProvider.resourceUrlWhitelist([ 'self', new RegExp('.*' + self.hosts.static.host + '.*') ]);
        }

        resolve();
      }, reject);
    });
  }

  run() {
    throw new Error('Not implemented.');
  }

  //-----------------------------------------------
  //    Helper methods
  //-----------------------------------------------

  _getPartialUrl(name) {
    if (!this.hosts) {
      throw new Error('Missing hosts configuration.');
    }

    if (!this.location) {
      throw new Error('Missing location configuration.');
    }

    var path = this.hosts.static.host ?
      `//${this.hosts.static.host}${this.hosts.static.path}` :
      `${this.hosts.static.path}`;

    return `${path}assets/${this.location.theme.layout}/partials/${name}.html`;
  }
};

//------------------------------------------------------------------------
//
//  SnapApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapApplicationBootstraper = class SnapApplicationBootstraper extends app.ApplicationBootstraper {
  configure() {
    return super.configure().then(() => {
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

        $locationProvider.html5Mode(false);

        $routeProvider.when('/', { template: ' ', controller: 'HomeBaseCtrl' });
        $routeProvider.when('/menu/:token', { template: ' ', controller: 'MenuBaseCtrl' });
        $routeProvider.when('/category/:token', { template: ' ', controller: 'CategoryBaseCtrl' });
        $routeProvider.when('/item/:token', { template: ' ', controller: 'ItemBaseCtrl' });
        $routeProvider.when('/url/:url', { template: ' ', controller: 'UrlCtrl' });
        $routeProvider.when('/checkout', { templateUrl: this._getPartialUrl('checkout'), controller: 'CheckoutCtrl' });
        $routeProvider.when('/signin', { templateUrl: this._getPartialUrl('signin'), controller: 'SignInCtrl' });
        $routeProvider.when('/account', { templateUrl: this._getPartialUrl('account'), controller: 'AccountCtrl' });
        $routeProvider.when('/chat', { templateUrl: this._getPartialUrl('chat'), controller: 'ChatCtrl' });
        $routeProvider.when('/chatmap', { templateUrl: this._getPartialUrl('chatmap'), controller: 'ChatMapCtrl' });
        $routeProvider.when('/survey', { templateUrl: this._getPartialUrl('survey'), controller: 'SurveyCtrl' });
        $routeProvider.otherwise({ redirectTo: '/' });
      }]);
    });
  }

  run() {
    angular.bootstrap(document, ['SNAPApplication']);
  }
};

//------------------------------------------------------------------------
//
//  StartupApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.StartupApplicationBootstraper = class StartupApplicationBootstraper extends app.ApplicationBootstraper {
  configure() {
    return super.configure().then(() => {
      angular.module('SNAPStartup', [
        'ngRoute',
        'SNAP.configs',
        'SNAP.controllers',
        'SNAP.directives',
        'SNAP.filters',
        'SNAP.services'
      ]).
      config(() => {});
    });
  }

  run() {
    angular.bootstrap(document, ['SNAPStartup']);
  }
};

//------------------------------------------------------------------------
//
//  SnapAuxiliaresApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapAuxiliaresApplicationBootstraper = class SnapAuxiliaresApplicationBootstraper extends app.ApplicationBootstraper {
  configure() {
    return super.configure().then(() => {
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

        $routeProvider.when('/', { templateUrl: this._getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
        $routeProvider.otherwise({ redirectTo: '/' });
      }]);
    });
  }

  run() {
    angular.bootstrap(document, ['SNAPAuxiliares']);
  }
};
