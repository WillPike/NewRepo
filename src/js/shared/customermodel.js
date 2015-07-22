window.app.CustomerModel = class CustomerModel {
  /* global signals */

  constructor(Config, storageProvider) {
    var self = this;

    this._accountStore = storageProvider('snap_customer');

    this._profile = null;

    this._isGuest = false;
    this._isEnabled = Boolean(Config.accounts);

    this.profileChanged = new signals.Signal();

    this._accountStore.read().then(account => {
      self._isGuest = account && account.is_guest;

      if (!account || account.is_guest) {
        self._profile = null;
      }
      else {
        self._profile = account.profile;
      }

      self.profileChanged.dispatch(self._profile);
    });
  }

  get isEnabled() {
    return Boolean(this._isEnabled);
  }

  get isAuthenticated() {
    return this.isEnabled && (Boolean(this.profile) || this.isGuest);
  }

  get isGuest() {
    return this.isEnabled && Boolean(this._isGuest);
  }

  get hasCredentials() {
    return Boolean(this.isAuthenticated && !this.isGuest && this.profile.type === 1);
  }

  get profile() {
    return this._profile;
  }

  set profile(value) {
    var self = this;
    this._profile = value || null;
    this._isGuest = value === 'guest';

    if (!value) {
      this._accountStore.clear().then(() => {
        self._isGuest = false;
        self.profileChanged.dispatch(self._profile);
        self.session = null;
      });
    }
    else {
      this._accountStore.write({
        profile: this._profile,
        is_guest: this._isGuest
      }).then(() => {
        self.profileChanged.dispatch(self._profile);

        if (!value || self._isGuest) {
          self.session = null;
        }
      });
    }
  }
};
