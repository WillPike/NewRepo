window.app.CustomerManager = class CustomerManager {
  /* global moment */

  constructor(Config, Environment, DtsApi, CustomerModel) {
    this._api = DtsApi;
    this._CustomerModel = CustomerModel;
    this._customerAppId = Environment.customer_application.client_id;
  }

  get model() {
    return this._CustomerModel;
  }

  get customerName() {
    if (this.model.isEnabled && this.model.isAuthenticated && !this.model.isGuest) {
      var name = '';

      if (CustomerManager.model.profile.first_name) {
        name += CustomerManager.model.profile.first_name;
      }

      if (CustomerManager.model.profile.last_name) {
        name += ' ' + CustomerManager.model.profile.last_name;
      }

      return name;
    }

    return 'Guest';
  }

  logout() {
    var self = this;
    return new Promise(resolve => {
      self._CustomerModel.profile = null;
      resolve();
    });
  }

  guestLogin() {
    var self = this;
    return new Promise(resolve => {
      self._CustomerModel.profile = 'guest';
      resolve();
    });
  }

  login(credentials) {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.oauth2.getTokenWithCredentials(
        self._customerAppId,
        credentials.login,
        credentials.password
      ).then(result => {
        if (!result) {
          return reject();
        }

        if (result.error || !result.access_token) {
          return reject(result.error);
        }

        var session = {
          access_token: result.access_token
        };

        if (result.expires_in) {
          session.expires = moment().add(result.expires_in, 'seconds').unix();
        }

        self._CustomerModel.session = session;

        self._loadProfile().then(resolve, e => {
          self._CustomerModel.session = null;
          reject(e);
        });
      }, reject);
    });
  }

  loginSocial(token) {
    var self = this;
    return new Promise((resolve, reject) => {
      var session = {
        access_token: token.access_token
      };

      if (token.expires_in) {
        session.expires = moment().add(token.expires_in, 'seconds').unix();
      }

      self._CustomerModel.session = session;

      self._loadProfile().then(resolve, e => {
        self._CustomerModel.session = null;
        reject(e);
      });
    });
  }

  signUp(registration) {
    var self = this;
    return new Promise((resolve, reject) => {
      registration.client_id = self._customerAppId;
      self._api.customer.signUp(registration).then(() => {
        self.login({
          login: registration.username,
          password: registration.password
        }).then(resolve, reject);
      }, reject);
    });
  }

  updateProfile(profile) {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.customer.updateProfile(profile).then(() => {
        self._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }

  changePassword(request) {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.customer.changePassword(request).then(() => {
        self.login({
          login: self._CustomerModel.email,
          password: request.new_password
        }).then(resolve, reject);
      }, reject);
    });
  }

  resetPassword(request) {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.customer.resetPassword(request).then(() => {
        resolve();
      }, reject);
    });
  }

  _loadProfile() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.customer.getProfile().then(profile => {
        self._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }
};
