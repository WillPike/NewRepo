window.app.NavigationManager = class NavigationManager extends app.AbstractManager {
  /* global signals */

  constructor($rootScope, $location, $window, AnalyticsModel, Logger) {
    super(Logger);

    this.$$location = $location;
    this.$$window = $window;
    this._AnalyticsModel = AnalyticsModel;

    this.locationChanging = new signals.Signal();
    this.locationChanged = new signals.Signal();

    var self = this;

    $rootScope.$on('$locationChangeSuccess', () => {
      var path = self.$$location.path();

      if (path === self._path) {
        self.locationChanged.dispatch(self._location);
        return;
      }

      self._path = path;
      self._location = self.getLocation(path);
      self.locationChanging.dispatch(self._location);
      self.locationChanged.dispatch(self._location);
    });

    this.locationChanged.add(location => self._AnalyticsModel.logNavigation(location));
  }

  get path() { return this._path; }
  set path(value) {
    var i = value.indexOf('#'),
        path = i !== -1 ? value.substring(i + 1) : value;

    this.location = this.getLocation(path);
  }

  get location() { return this._location; }
  set location(value) {
    this._location = value;

    this.locationChanging.dispatch(this._location);

    var path = this._path = this.getPath(this._location);
    this.$$location.path(path);
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
