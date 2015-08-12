//------------------------------------------------------------------------
//
//  ApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.ApplicationBootstraper = class ApplicationBootstraper {
  constructor(name, options) {
    this.name = name;
    this.options = options || {};

    this.hosts = {
      api: { 'host': 'api2.managesnap.com', 'secure': true },
      content: { 'host': 'content.managesnap.com', 'secure': false },
      media: { 'host': 'content.managesnap.com', 'secure': false },
      static: { 'path': this.options.static_path || '/' },
      socket: { 'host': 'web-dev.managesnap.com', 'secure': true, 'port':8080, 'path': '/socket/' },
      games: { 'host': 'static.managesnap.com' }
    };

    this.environment = {
      debug: this.options.debug || false,
      platform: this.options.platform || 'web',
      version: SNAP_VERSION || '0.0.0',
      main_application: { 'client_id': 'd67610b1c91044d8abd55cbda6c619f0', 'callback_url': 'https://api2.managesnap.com/callback/api', 'scope': '' },
      customer_application: { 'client_id': '91381a86b3b444fd876df80b22d7fa6e' },
      facebook_application: { 'client_id': '349729518545313', 'redirect_url': 'https://web.managesnap.com/callback/facebook' },
      googleplus_application: { 'client_id': '678998250941-1dmebp4ksni9tsjth45tsht8l7cl1mrn.apps.googleusercontent.com', 'redirect_url': 'https://web.managesnap.com/callback/googleplus' },
      twitter_application: { 'consumer_key': 'yQ8XJ15PmaPOi4L5DJPikGCI0', 'redirect_url': 'https://web.managesnap.com/callback/twitter' }
    };

    this.dependencies = [
      'ngRoute',
      'ngAnimate',
      'ngTouch',
      'ngSanitize',
      'SNAP.configs',
      'SNAP.controllers',
      'SNAP.directives',
      'SNAP.filters',
      'SNAP.services'
    ];
  }

  //-----------------------------------------------
  //    Public methods
  //-----------------------------------------------

  configure() {
    FastClick.attach(document.body);

    return new Promise((resolve, reject) => {console.log(this.options.access_token);
      if (this.options.access_token) {
        this._getStore('snap_accesstoken').write(JSON.stringify(this.options.access_token));
      }

      var store = this._getStore('snap_location');

      this._getStore('snap_location').read().then(config => {
        this.location = config || null;

        angular.module('SNAP.configs', [])
          .constant('SNAPLocation', this.location)
          .constant('SNAPEnvironment', this.environment)
          .constant('SNAPHosts', this.hosts);

        if (this.hosts.static.host) {
          $sceDelegateProvider.resourceUrlWhitelist([ 'self', new RegExp('.*' + this.hosts.static.host + '.*') ]);
        }

        let app = angular.module(this.name, this.dependencies);

        resolve(app);
      }, reject);
    });
  }

  run() {
    angular.bootstrap(document, [this.name]);
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

  _getStore(id) {
    switch (this.environment.platform) {
      case 'mobile':
        return new app.CordovaLocalStorageStore(id);
      default:
        return new app.LocalStorageStore(id);
    }
  }
};

//------------------------------------------------------------------------
//
//  SnapApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapApplicationBootstraper = class SnapApplicationBootstraper extends app.ApplicationBootstraper {
  constructor(options) {
    super('SNAPApplication', options);
  }

  configure() {
    return super.configure().then(app => app.config(
      ['$locationProvider', '$routeProvider', '$sceDelegateProvider',
      ($locationProvider, $routeProvider, $sceDelegateProvider) => {

      $locationProvider.html5Mode(false);

      $routeProvider.when('/', { template: ' ', controller: 'HomeBaseCtrl' });
      $routeProvider.when('/menu/:token', { template: ' ', controller: 'MenuBaseCtrl' });
      $routeProvider.when('/category/:token', { template: ' ', controller: 'CategoryBaseCtrl' });
      $routeProvider.when('/item/:token', { template: ' ', controller: 'ItemBaseCtrl' });
      $routeProvider.when('/checkout', { templateUrl: this._getPartialUrl('checkout'), controller: 'CheckoutCtrl' });
      $routeProvider.when('/signin', { templateUrl: this._getPartialUrl('signin'), controller: 'SignInCtrl' });
      $routeProvider.when('/account', { templateUrl: this._getPartialUrl('account'), controller: 'AccountCtrl' });
      $routeProvider.when('/chat', { templateUrl: this._getPartialUrl('chat'), controller: 'ChatCtrl' });
      $routeProvider.when('/chatmap', { templateUrl: this._getPartialUrl('chatmap'), controller: 'ChatMapCtrl' });
      $routeProvider.when('/survey', { templateUrl: this._getPartialUrl('survey'), controller: 'SurveyCtrl' });
      $routeProvider.otherwise({ redirectTo: '/' });
    }]));
  }
};

//------------------------------------------------------------------------
//
//  StartupApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.StartupApplicationBootstraper = class StartupApplicationBootstraper extends app.ApplicationBootstraper {
  constructor(options) {
    super('SNAPStartup', options);
  }
};

//------------------------------------------------------------------------
//
//  ResetApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.ResetApplicationBootstraper = class ResetApplicationBootstraper extends app.ApplicationBootstraper {
  constructor(options) {
    super('SNAPReset', options);
  }
};

//------------------------------------------------------------------------
//
//  FlashApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.FlashApplicationBootstraper = class FlashApplicationBootstraper extends app.ApplicationBootstraper {
  constructor(options) {
    super('SNAPFlash', options);
  }
};


//------------------------------------------------------------------------
//
//  SnapAuxiliaresApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapAuxiliaresApplicationBootstraper = class SnapAuxiliaresApplicationBootstraper extends app.ApplicationBootstraper {
  constructor(options) {
    super('SNAPAuxiliares', options);
  }

  configure() {
    return super.configure().then(app => app.config(
      ['$locationProvider', '$routeProvider',
      ($locationProvider, $routeProvider) => {

      $locationProvider.html5Mode(false);

      $routeProvider.when('/', { templateUrl: this._getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
      $routeProvider.otherwise({ redirectTo: '/' });
    }]));
  }
};
