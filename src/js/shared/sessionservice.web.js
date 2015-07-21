window.app.WebSessionService = class WebSessionService {
  constructor($resource) {
    this._api = {
      'session': $resource('/oauth2/snap/session', {}, { query: { method: 'GET' } })
    };
  }

  getSession() {
    return this._api.session.query().$promise;
  }
};
