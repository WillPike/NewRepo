window.app.AuthenticationManager = class AuthenticationManager {
  /* global moment, signals */

  constructor(BackendApi, SessionProvider, SNAPEnvironment, WebBrowser) {
    this._BackendApi = BackendApi;
    this._SessionProvider = SessionProvider;
    this._SNAPEnvironment = SNAPEnvironment;
    this._WebBrowser = WebBrowser;
  }

  validate() {
    var self = this;
    return new Promise((resolve, reject) => {
      var token = self._SessionProvider.businessToken;

      if (!self._validateToken(token)) {
        return reject('No valid token found.');
      }

      resolve();
    });
  }

  authorize() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._SessionProvider.clear().then(() => {
        var application = self._SNAPEnvironment.main_application,
            authUrl = self._BackendApi.oauth2.getTokenAuthorizeUrl(application.client_id, application.callback_url, application.scope);

        self._WebBrowser.open(authUrl).then(browser => {
          browser.onNavigated.add(url => {
            if (url.indexOf(application.callback_url) !== 0) {
              return;
            }

            browser.exit();

            var callbackResponse = url.split('#')[1],
                responseParameters = callbackResponse.split('&'),
                parameterMap = [];

            for (var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
            }

            if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              return resolve({
                access_token: parameterMap.access_token,
                expires_in: parameterMap.expires_in
              });
            }

            reject('Problem authenticating: ' + url);
          });
        }, reject);
      }, reject);
    });
  }

  customerLoginRegular(credentials) {
    var self = this;
    return new Promise((resolve, reject) => {
      var application = self._SNAPEnvironment.customer_application;
      self._BackendApi.oauth2.getTokenWithCredentials(
        application.client_id,
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

        self._SessionProvider.customerToken = session;

        resolve();
      }, reject);
    });
  }

  customerLoginSocial(token) {
    var self = this;
    return new Promise((resolve, reject) => {
      var session = {
        access_token: token.access_token
      };

      if (token.expires_in) {
        session.expires = moment().add(token.expires_in, 'seconds').unix();
      }

      self._SessionProvider.customerToken = session;

      resolve();
    });
  }

  _validateToken(token) {
    if (!token || !token.access_token) {
        return false;
    }

    if (token.expires) {
      var expires = moment.unix(token.expires);

      if (expires.isBefore(moment())) {
        return false;
      }
    }

    return true;
  }
};
