window.app.SocialManager = class SocialManager extends app.AbstractManager {
  /* global URI */

  constructor(SNAPEnvironment, DtsApi, WebBrowser, Logger) {
    super(Logger);

    this._SNAPEnvironment = SNAPEnvironment;
    this._DtsApi = DtsApi;
    this._WebBrowser = WebBrowser;
  }

  initialize() {
    super.initialize();
  }

  loginFacebook() {
    var loginUrl = URI('https://www.facebook.com/dialog/oauth')
      .addSearch('client_id', this._SNAPEnvironment.facebook_application.client_id)
      .addSearch('redirect_uri', this._SNAPEnvironment.facebook_application.redirect_url)
      .addSearch('response_type', 'token')
      .addSearch('scope', 'public_profile,email')
      .toString();

    return new Promise((resolve, reject) => {
      this._Logger.debug('Logging in with Facebook.');

      this._WebBrowser.open(loginUrl).then(web => {
        web.onNavigated.add(url => {
          if (url.indexOf(this._SNAPEnvironment.facebook_application.redirect_url) === 0) {
            var facebookAuth = URI('?' + URI(url).fragment()).search(true);

            if (facebookAuth.error || !facebookAuth.access_token) {
              this._Logger.debug('Facebook callback error: ' + facebookAuth.error);
              web.exit();
              return reject(facebookAuth.error);
            }

            this._Logger.debug('Facebook callback received.');

            this._DtsApi.customer.signUpFacebook({
              access_token: facebookAuth.access_token,
              client_id: this._SNAPEnvironment.customer_application.client_id
            }).then(ticket => {
              this._Logger.debug('Facebook signin complete.');

              let url = this._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
                client_id: this._SNAPEnvironment.customer_application.client_id,
                redirect_uri: this._SNAPEnvironment.customer_application.callback_url,
                response_type: 'token'
              });

              web.navigate(url);
            }, e => {
              this._Logger.debug('Error getting a Facebook login ticket.');
              web.exit();
              reject();
            });
          }
          else if (url.indexOf(this._SNAPEnvironment.customer_application.callback_url) === 0) {
            var customerAuth = URI('?' + URI(url).fragment()).search(true);

            if (customerAuth.error || !customerAuth.access_token) {
              this._Logger.debug('Facebook customer callback error: ' + customerAuth.error);
              return reject(customerAuth.error);
            }

            this._Logger.debug('Facebook customer login complete.');

            resolve(customerAuth);
            web.exit();
          }
        });

        web.onExit.add(() => {
          this._Logger.debug('Facebook login canceled.');
          reject();
        });
      }, reject);
    });
  }

  loginGooglePlus() {
    return new Promise((resolve, reject) => {
      var state = this._generateToken();
      var loginUrl = URI('https://accounts.google.com/o/oauth2/auth')
        .addSearch('client_id', this._SNAPEnvironment.googleplus_application.client_id)
        .addSearch('redirect_uri', this._SNAPEnvironment.googleplus_application.redirect_url)
        .addSearch('response_type', 'code')
        .addSearch('scope', 'https://www.googleapis.com/auth/plus.login email')
        .addSearch('access_type', 'offline')
        .addSearch('state', state)
        .toString();

      this._Logger.debug('Logging in with Google+.');

      this._WebBrowser.open(loginUrl).then(web => {
        web.onNavigated.add(url => {
          if (url.indexOf(this._SNAPEnvironment.googleplus_application.redirect_url) === 0) {
            var googleplusAuth = URI(url).search(true);

            if (googleplusAuth.error || !googleplusAuth.code || googleplusAuth.state !== state) {
              this._Logger.debug('Google+ callback error: ' + googleplusAuth.error);
              web.exit();
              return reject(googleplusAuth.error);
            }

            this._Logger.debug('Google+ callback received.');

            this._DtsApi.customer.signUpGooglePlus({
              code: googleplusAuth.code,
              client_id: this._SNAPEnvironment.customer_application.client_id
            }).then(ticket => {
              this._Logger.debug('Google+ signin complete.');

              var url = this._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
                client_id: this._SNAPEnvironment.customer_application.client_id,
                redirect_uri: this._SNAPEnvironment.customer_application.callback_url,
                response_type: 'token'
              });

              web.navigate(url);
            }, e => {
              this._Logger.debug('Error getting a Google+ login ticket.');
              web.exit();
              reject();
            });
          }
          else if (url.indexOf(this._SNAPEnvironment.customer_application.callback_url) === 0) {
            var customerAuth = URI('?' + URI(url).fragment()).search(true);

            if (customerAuth.error || !customerAuth.access_token) {
              this._Logger.debug('Google+ customer callback error: ' + customerAuth.error);
              return reject(customerAuth.error);
            }

            this._Logger.debug('Google+ customer login complete.');

            resolve(customerAuth);
            web.exit();
          }
        });

        web.onExit.add(() => {
          this._Logger.debug('Google+ login canceled.');
          reject();
        });
      }, reject);
    });
  }

  loginTwitter() {
    return new Promise((resolve, reject) => {
      this._Logger.debug('Logging in with Twitter.');

      this._DtsApi.customer.signUpTwitterRequestToken({
        oauth_callback: this._SNAPEnvironment.twitter_application.redirect_url
      }).then(token => {
        var url = URI('https://api.twitter.com/oauth/authenticate')
        .addSearch('oauth_token', token.oauth_token)
        .addSearch('force_login', 'true')
        .toString();

        this._Logger.debug('Twitter request token received.');

        var tokenSecret = token.oauth_token_secret;

        this._WebBrowser.open(url).then(web => {
          web.onNavigated.add(url => {
            if (url.indexOf(this._SNAPEnvironment.twitter_application.redirect_url) === 0) {
              var twitterAuth = URI(url).search(true);

              if (twitterAuth.error || !twitterAuth.oauth_verifier) {
                this._Logger.debug('Twitter callback error: ' + twitterAuth.error);
                web.exit();
                return reject(twitterAuth.error);
              }

              this._Logger.debug('Twitter callback received.');

              this._DtsApi.customer.signUpTwitter({
                client_id: this._SNAPEnvironment.customer_application.client_id,
                request_token: twitterAuth.oauth_token,
                request_token_secret: tokenSecret,
                request_token_verifier: twitterAuth.oauth_verifier
              }).then(ticket => {
                this._Logger.debug('Twitter signin complete.');

                let url = this._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
                  client_id: this._SNAPEnvironment.customer_application.client_id,
                  redirect_uri: this._SNAPEnvironment.customer_application.callback_url,
                  response_type: 'token'
                });

                web.navigate(url);
              }, reject);
            }
            else if (url.indexOf(this._SNAPEnvironment.customer_application.callback_url) === 0) {
              var customerAuth = URI('?' + URI(url).fragment()).search(true);

              if (customerAuth.error || !customerAuth.access_token) {
                this._Logger.debug('Twitter customer callback error: ' + customerAuth.error);
                web.exit();
                return reject(customerAuth.error);
              }

              this._Logger.debug('Twitter customer login complete.');

              resolve(customerAuth);
              web.exit();
            }
          });

          web.onExit.add(() => {
            this._Logger.debug('Twitter login canceled.');
            reject();
          });
        }, reject);
      }, reject);
    });
  }

  //-----------------------------------------------
  //    Helpers
  //-----------------------------------------------

  _generateToken() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
};
