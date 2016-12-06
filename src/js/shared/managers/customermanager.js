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

  finalize() {
    super.finalize();

    return this.logout();
  }

  logout() {
    return new Promise(resolve => {
      this._SessionModel.customerToken = null;
      this._CustomerModel.profile = null;
      resolve();
    });
  }

  guestLogin() {
    return new Promise(resolve => {
      this._CustomerModel.profile = 'guest';
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
    return new Promise((resolve, reject) => {
      registration.client_id = this._customerAppId;
      this._DtsApi.customer.signUp(registration).then(() => {
        this.login({
          login: registration.username,
          password: registration.password
        }).then(resolve, reject);
      }, reject);
    });
  }

  updateProfile(profile) {
    return new Promise((resolve, reject) => {
      this._DtsApi.customer.updateProfile(profile).then(() => {
        this._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }

  changePassword(request) {
    return new Promise((resolve, reject) => {
      this._DtsApi.customer.changePassword(request).then(() => {
        this.login({
          login: this._CustomerModel.email,
          password: request.new_password
        }).then(resolve, reject);
      }, reject);
    });
  }

  resetPassword(request) {
    return new Promise((resolve, reject) => {
      this._DtsApi.customer.resetPassword(request).then(() => {
        resolve();
      }, reject);
    });
  }

  _loadProfile() {
    return new Promise((resolve, reject) => {
      this._DtsApi.customer.getProfile().then(profile => {
        this._CustomerModel.profile = profile;
        resolve();
      }, reject);
    });
  }
};
