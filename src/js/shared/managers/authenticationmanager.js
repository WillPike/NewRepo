window.app.AuthenticationManager = class AuthenticationManager extends app.AbstractManager {
  /* global moment */

  constructor(BackendApi, SessionModel, SNAPEnvironment, WebBrowser, Logger) {
    super(Logger);

    this._BackendApi = BackendApi;
    this._SessionModel = SessionModel;
    this._SNAPEnvironment = SNAPEnvironment;
    this._WebBrowser = WebBrowser;
  }

  validate() {
    var model = this._SessionModel;

    this._Logger.debug('Validating access token...');

    return new Promise((resolve, reject) => {
      model.initialize().then(() => {
        var token = model.apiToken;

        if (!token || !this._validateToken(token)) {
          this._Logger.debug('Authorization is not valid.');
          resolve(false);
        }
        else {
          this._Logger.debug('Validating authorization session...');

          this._BackendApi.oauth2.getSession().then(session => {
            session = URI('?' + session).query(true); //ToDo: remove this hack

            if (session && session.valid === 'true') {
              this._Logger.debug('Authorization is valid.', session);
              resolve(true);
            }
            else {
              this._Logger.debug('Authorization is not valid or expired.', session);
              resolve(false);
            }
          },
          e => {
            this._Logger.debug('Unable to validate authorization.', e);
            resolve(null);
          });
        }
      },
      e => {
        this._Logger.debug('Error validating authorization.', e);
        resolve(null);
      });
    });
  }

  authorize() {
    this._Logger.debug('Authorizing API access...');

    var self = this;
    return new Promise((resolve, reject) => {
      this._SessionModel.clear().then(() => {
        var application = this._SNAPEnvironment.main_application,
            authUrl = this._BackendApi.oauth2.getTokenAuthorizeUrl(application.client_id, application.callback_url, application.scope);

        this._WebBrowser.open(authUrl).then(browser => {
          var complete = false;

          function handleCallback(url) {
            if (url.indexOf(application.callback_url) !== 0) {
              return;
            }

            complete = true;
            browser.exit();

            var callbackResponse = url.split('#')[1],
                responseParameters = callbackResponse.split('&'),
                parameterMap = [];

            for (var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
            }

            if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              var token = {
                access_token: parameterMap.access_token,
                expires_in: parameterMap.expires_in
              };

              self._Logger.debug('New access token issued.', token);

              self._SessionModel.apiToken = token;

              return resolve();
            }

            self._Logger.debug('Problem issuing new access token.', parameterMap);
            reject('Problem authenticating: ' + url);
          }

          browser.onNavigated.add(url => handleCallback(url));

          browser.onExit.add(() => {
            if (complete) {
              return;
            }

            reject('Canceled');
          });
        }, reject);
      }, reject);
    });
  }

  customerLoginRegular(credentials) {
    return new Promise((resolve, reject) => {
      var application = this._SNAPEnvironment.customer_application;
      this._BackendApi.oauth2.getTokenWithCredentials(
        application.client_id,
        credentials.login,
        credentials.password
      ).then(result => {
        if (!result) {
          return reject();
        }

        result = JSON.parse(result); //ToDo: fix

        if (result.error || !result.access_token) {
          return reject(result.error);
        }

        var session = {
          access_token: result.access_token
        };

        if (result.expires_in) {
          session.expires = moment().add(result.expires_in, 'seconds').unix();
        }

        this._SessionModel.customerToken = session;

        resolve();
      }, reject);
    });
  }

  customerLoginSocial(token) {
    return new Promise((resolve, reject) => {
      var session = {
        access_token: token.access_token
      };

      if (token.expires_in) {
        session.expires = moment().add(token.expires_in, 'seconds').unix();
      }

      this._SessionModel.customerToken = session;

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
