window.app.CustomerManager = class CustomerManager extends app.AbstractManager {
  constructor(DtsApi, CustomerModel, SessionModel, Logger, SNAPEnvironment) {
    super(Logger);

    this._DtsApi = DtsApi;
    this._CustomerModel = CustomerModel;
    this._SessionModel = SessionModel;
    this._customerAppId = SNAPEnvironment.customer_application.client_id;
  }

  get model() {
    return this._CustomerModel;
  }

  get customerName() {
    if (this.model.isEnabled && this.model.isAuthenticated && !this.model.isGuest) {
      var name = '';

      if (this.model.profile.first_name) {
        name += this.model.profile.first_name;
      }

      if (this.model.profile.last_name) {
        name += ' ' + this.model.profile.last_name;
      }

      return name;
    }

    return null;
  }

  reset() {
    super.reset();

    return this.logout();
  }

  logout() {
    var self = this;
    return new Promise(resolve => {
      self._SessionModel.customerToken = null;
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

  login() {
    return this._loadProfile();
  }

  loginSocial() {
    return this._loadProfile();
  }

  signUp(registration) {
    var self = this;
    return new Promise((resolve, reject) => {
      registration.client_id = self._customerAppId;
      self._DtsApi.customer.signUp(registration).then(() => {
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
      self._DtsApi.customer.updateProfile(profile).then(() => {
        self._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }

  changePassword(request) {
    var self = this;
    return new Promise((resolve, reject) => {
      self._DtsApi.customer.changePassword(request).then(() => {
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
      self._DtsApi.customer.resetPassword(request).then(() => {
        resolve();
      }, reject);
    });
  }

  _loadProfile() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._DtsApi.customer.getProfile().then(profile => {
        self._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }
};
