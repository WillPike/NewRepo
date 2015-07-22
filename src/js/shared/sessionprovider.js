window.app.SessionProvider = class SessionProvider {
  /* global moment, signals */

  constructor(storageProvider) {
    this._ApiSessionStore = storageProvider('snap_accesstoken');
    this._CustomerSessionStore = storageProvider('snap_customer_accesstoken');

    this.apiTokenChanged = new signals.Signal();
    this.customerTokenChanged = new signals.Signal();

    this._apiToken = null;
    this._customerToken = null;

    var self = this;
    this._ApiSessionStore.read().then(token => {
      self._apiToken = token;
    });
    this._CustomerSessionStore.read().then(token => {
      self._customerToken = token;
    });
  }

  get apiToken() {
    return this._apiToken;
  }

  set apiToken(value) {
    this._apiToken = value;
    this._ApiSessionStore.write(value);
    this.apiTokenChanged.dispatch(value);
  }

  fetchApiToken() {
    var self = this;
    return new Promise((resolve, reject) => {
      if (self._apiToken) {
        return resolve(self._apiToken);
      }

      reject();
    });
  }

  get customerToken() {
    return this._customerToken;
  }

  set customerToken(value) {
    this._customerToken = value;
    this._CustomerSessionStore.write(value);
    this.customerTokenChanged.dispatch(value);
  }

  fetchCustomerToken() {
    var self = this;
    return new Promise((resolve, reject) => {
      if (self._customerToken) {
        return resolve(self._customerToken);
      }

      reject();
    });
  }

  clear() {
    var self = this;
    return new Promise(resolve => {
      return self._ApiSessionStore.clear().then(() => {
        return self._CustomerSessionStore.read().then(() => {
          self._apiToken = self._customerToken = null;
          resolve();
        });
      });
    });
  }
};
