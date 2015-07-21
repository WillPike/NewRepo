window.app.AuthenticationManager = class AuthenticationManager {
  constructor(BackendApi, SessionProvider, SNAPEnvironment, WebBrowser) {
    this._BackendApi = BackendApi;
    this._SessionProvider = SessionProvider;
    this._SNAPEnvironment = SNAPEnvironment;
    this._WebBrowser = WebBrowser;
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
};
