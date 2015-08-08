(function() {

  var ActivityMonitor = function($rootScope, $timeout) {
    this.$$rootScope = $rootScope;
    this.$$timeout = $timeout;
    this._timeout = 10000;

    this._activeChanged = new signals.Signal();
    this.enabled = true;

    var self = this;

    this.$$rootScope.$on('$locationChangeSuccess', function() {
      if (self.enabled) {
        self.activityDetected();
      }
    });

    this.activityDetected();
  };

  ActivityMonitor.prototype = {};

  Object.defineProperty(ActivityMonitor.prototype, 'timeout', {
    get: function() { return this._timeout; },
    set: function(value) {
      if (value > 0) {
        this._timeout = value;
        this.activityDetected();
      }
    }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'enabled', {
    get: function() { return this._enabled; },
    set: function(value) { this._enabled = value; }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'active', {
    get: function() { return this._timer !== null; }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'activeChanged', {
    get: function() { return this._activeChanged; }
  });

  ActivityMonitor.prototype.activityDetected = function() {
    var changed;

    if (this._timer) {
      this.$$timeout.cancel(this._timer);
    }
    else if (this._timer === null) {
      changed = true;
    }

    var self = this;

    var onTimeout = function() {
      self._timer = null;

      self.$$rootScope.$apply(function() {
        if (self.enabled) {
          self.activeChanged.dispatch(self.active);
        }
      });
    };

    this._timer = this.$$timeout(onTimeout, this._timeout);

    if (changed && this.enabled) {
      this.activeChanged.dispatch(this.active);
    }
  };

  window.app.ActivityMonitor = ActivityMonitor;
})();
