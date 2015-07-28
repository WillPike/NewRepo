window.app.CordovaManagementService = class CordovaManagementService {
  /* global signals */

  constructor(Logger) {
    this._Logger = Logger;

    if (!window.cordova) {
      this._Logger.warn('Cordova is not available.');
    }
  }

  rotateScreen() {
    return Promise.resolve();
  }

  openBrowser(url, browserRef, options) {
    options = options || {};

    return new Promise(resolve => {
      var target = options.system ? '_blank' : '_blank',
          settings = {
            location: options.system ? 'no' : 'yes',
            clearcache: 'yes',
            clearsessioncache: 'yes',
            zoom: 'no',
            hardwareback: 'no'
          };

      browserRef = window.open(url, target, Object.keys(settings).map(x => `${x}=${settings[x]}`).join(','));
      resolve(new app.CordovaWebBrowserReference(browserRef));
    });
  }

  closeBrowser(browserRef) {
    return new Promise(resolve => {
      browserRef.exit();
      resolve();
    });
  }

  startCardReader() {
    return Promise.resolve();
  }

  stopCardReader() {
    return Promise.resolve();
  }

  reset() {
    var self = this;
    return new Promise((resolve, reject) => {

    });
  }

  loadApplication() {
    var self = this;
    return new Promise((resolve, reject) => {
      window.open(`snap.html`, '_self');
    });
  }

  getSoundVolume() {
    if (!window.volume) {
      return Promise.resolve(100);
    }

    return new Promise((resolve, reject) => {
      window.volume.getVolume(resolve, reject);
    });
  }

  setSoundVolume(value) {
    if (!(value >= 0 && value <= 100)) {
      return Promise.reject(`Invalid value: ${value}`);
    }

    if (!window.volume) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      window.volume.setVolume(value, resolve, reject);
    });
  }

  getDisplayBrightness() {
    if (!window.brightness) {
      return Promise.resolve(100);
    }

    return new Promise((resolve, reject) => {
      window.brightness.getBrightness(value => {
        if (value < 0) {
          return resolve(50);
        }

        value = parseInt(value * 100);
        value = Math.min(100, value);
        value = Math.max(0, value);

        resolve(value);
      }, reject);
    });
  }

  setDisplayBrightness(value) {
    if (!(value >= 0 && value <= 100)) {
      return Promise.reject(`Invalid value: ${value}`);
    }

    if (!window.brightness) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      window.brightness.setBrightness(value / 100, () => resolve(), reject);
    });
  }
};
