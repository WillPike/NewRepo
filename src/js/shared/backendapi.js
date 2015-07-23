window.app.BackendApi = class BackendApi {
  constructor(Hosts, SessionProvider) {
    this._SessionProvider = SessionProvider;

    var self = this;

    function businessTokenProvider() {
      return self._SessionProvider.fetchApiToken().then(token => token.access_token);
    }

    function customerTokenProvider() {
      return self._SessionProvider.fetchCustomerToken().then(token => token.access_token);
    }

    for (var key in DtsApiClient) {
      let config = {
        host: {
          domain: Hosts.api.host,
          secure: Hosts.api.secure === 'true'
        }
      };

      let provider = businessTokenProvider;

      if (key === 'snap') {
        config.host.domain = Hosts.content.host;
      }
      else if (key === 'customer') {
        provider = customerTokenProvider;
      }

      this[key] = new DtsApiClient[key](config, provider);
    }
  }
};
