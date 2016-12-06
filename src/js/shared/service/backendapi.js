window.app.BackendApi = class BackendApi {
  constructor(Hosts, SessionModel) {
    this._SessionModel = SessionModel;

    var self = this;

    function businessTokenProvider() {
      if (!self._SessionModel.apiToken) {
        return Promise.reject();
      }

      return Promise.resolve(self._SessionModel.apiToken.access_token);
    }

    function customerTokenProvider() {
      if (!self._SessionModel.customerToken) {
        return Promise.reject();
      }

      return Promise.resolve(self._SessionModel.customerToken.access_token);
    }

    for (var key in DtsApiClient) {
      let config = {
        host: {
          domain: Hosts.api.host,
          secure: Hosts.api.secure === true
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
