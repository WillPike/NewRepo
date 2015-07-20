window.app.SessionProvider = class SessionProvider {
  /* global moment, signals */

  constructor(SessionService, storageProvider) {
    this._SessionService = SessionService;
    this._BusinessSessionStore = storageProvider('snap_accesstoken');
    this._CustomerSessionStore = storageProvider('snap_customer_accesstoken');

    this.businessSessionExpired = new signals.Signal();
    this.customerSessionExpired = new signals.Signal();

    this._businessToken = null;

    var self = this;
    this._BusinessSessionStore.read().then(token => {
      if (token && token.access_token) {
        if (token.expires) {
          var expires = moment.unix(token.expires);

          if (expires.isAfter(moment())) {
            self._businessToken = token.access_token;
          }
        }
        else {
          self._businessToken = token.access_token;
        }
      }
    });
  }

  get businessToken() {
    var token = this._businessToken;

    if (token && token.access_token && token.expires) {
      var expires = moment.unix(token.expires);

      if (expires.isBefore(moment())) {
        this._businessToken = token = null;
        this.businessSessionExpired.dispatch();
      }
    }

    return token;
  }

  getBusinessToken() {
    if (this._pendingPromise) {
      return this._pendingPromise;
    }

    var self = this;

    this._pendingPromise = new Promise(function(resolve, reject) {
      self._BusinessSessionStore.read().then(function(token) {
        if (token && token.access_token) {
          if (token.expires) {
            var expires = moment.unix(token.expires - 120);

            if (expires.isAfter(moment())) {
              self._pendingPromise = null;
              return resolve(token.access_token);
            }
          }
          else {
            self._pendingPromise = null;
            return resolve(token.access_token);
          }
        }

        self._SessionService.getSession().then(function(data) {
          self._pendingPromise = null;
          self._BusinessSessionStore.write(data);
          resolve(data.access_token);
        }, function(e) {
          self._pendingPromise = null;

          if (e.status === 401) {
            self._BusinessSessionStore.clear();
            self.businessSessionExpired.dispatch();
          }

          reject({ code: e.status });
        });
      });
    });
    return this._pendingPromise;
  }

  getCustomerToken() {
    var self = this;
    return new Promise(function(resolve, reject) {
      self._CustomerSessionStore.read().then(function(token) {
        if (!token || !token.access_token) {
          return resolve();
        }

        if (token.expires) {
          var expires = moment.unix(token.expires);

          if (!expires.isAfter(moment())) {
            self._CustomerSessionStore.clear();
            self.customerSessionExpired.dispatch();
            return resolve();
          }
        }

        resolve(token.access_token);
      }, reject);
    });
  }
};
