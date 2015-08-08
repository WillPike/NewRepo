window.app.NavigationManager = class NavigationManager extends app.AbstractManager {
  /* global signals */

  constructor($rootScope, $location, $window, AnalyticsModel, Logger) {
    super(Logger);

    this.$$location = $location;
    this.$$window = $window;
    this._AnalyticsModel = AnalyticsModel;

    this.locationChanging = new signals.Signal();
    this.locationChanged = new signals.Signal();

    $rootScope.$on('$locationChangeSuccess', () => {
      var path = this.$$location.path();

      if (path !== this._path) {
        this._path = path;
        this._location = this.getLocation(path);
        this.locationChanging.dispatch(this.location);
      }

      this.locationChanged.dispatch(this.location);
    });

    this.locationChanged.add(location => this._AnalyticsModel.logNavigation(location));
  }

  get path() { return this._path; }
  set path(value) {
    var i = value.indexOf('#'),
        path = i !== -1 ? value.substring(i + 1) : value;

    this.location = this.getLocation(path);
  }

  get location() { return this._location; }
  set location(value) {
    if (this._location === value) {
      return;
    }
    else if (this.location.type === value.type && this.location.token === value.token) {
      return;
    }

    this._location = value;
    this.locationChanging.dispatch(this.location);

    this._path = this.getPath(this.location);
    this.$$location.path(this._path);
  }

  getPath(location) {
    if (!location) {
      return null;
    }

    if (location.token) {
      return '/' + location.type + '/' + location.token;
    }
    else if (location.url) {
      return '/' + location.type + '/' + encodeURIComponent(location.url);
    }

    if (location.type === 'home') {
      return '/';
    }

    return '/' + location.type;
  }

  getLocation(path) {
    var match = /\/(\w+)?(\/(.+))?/.exec(path);

    if (match && match.length > 1) {
      var type = match[1];
      var param = match[3];

      if (param !== undefined) {
        switch(type) {
          case 'url':
            return { type: type, url: decodeURIComponent(param) };

          default:
            return { type: type, token: param };
        }
      }

      if (!type) {
        type = 'home';
      }

      return { type: type };
    }

    return {};
  }

  goBack() {
    if (this.location.type !== 'home' && this.location.type !== 'signin') {
      this.$$window.history.back();
    }
  }
};
