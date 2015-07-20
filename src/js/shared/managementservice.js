window.app.ManagementService = class ManagementService {
  constructor($resource, SNAPEnvironment) {
    this._api = {
      'rotateScreen': $resource('/management/rotate-screen', {}, { query: { method: 'GET' } }),
      'openBrowser': $resource('/management/open-browser', {}, { query: { method: 'GET' } }),
      'closeBrowser': $resource('/management/close-browser', {}, { query: { method: 'GET' } }),
      'startCardReader': $resource('/management/start-card-reader', {}, { query: { method: 'GET' } }),
      'stopCardReader': $resource('/management/stop-card-reader', {}, { query: { method: 'GET' } }),
      'reset': $resource('/management/reset', {}, { query: { method: 'GET' } }),
      'getSoundVolume': $resource('/management/volume', {}, { query: { method: 'GET' } }),
      'setSoundVolume': $resource('/management/volume', {}, { query: { method: 'GET' } }),
      'getDisplayBrightness': $resource('/management/brightness', {}, { query: { method: 'GET' } }),
      'setDisplayBrightness': $resource('/management/brightness', {}, { query: { method: 'GET' } })
    };
    this._SNAPEnvironment = SNAPEnvironment;
  }

  rotateScreen() {
    this._api.rotateScreen.query();
  }

  openBrowser(url) {
    this._api.openBrowser.query({ url: url });
  }

  closeBrowser() {
    this._api.closeBrowser.query();
  }

  startCardReader() {
    this._api.startCardReader.query();
  }

  stopCardReader() {
    this._api.stopCardReader.query();
  }

  reset() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._api.reset.query().$promise.then(resolve, function() {
        window.location.assign('/snap/' + encodeURIComponent(self._SNAPEnvironment.platform));
      });
    });
  }

  getSoundVolume() {
    return this._api.getSoundVolume.query().$promise;
  }

  setSoundVolume(value) {
    return this._api.setSoundVolume.query({ value: value }).$promise;
  }

  getDisplayBrightness() {
    return this._api.getDisplayBrightness.query().$promise;
  }

  setDisplayBrightness(value) {
    return this._api.setDisplayBrightness.query({ value: value }).$promise;
  }
};
