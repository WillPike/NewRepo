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

  openBrowser(url, browserRef) {
    return new Promise(resolve => {
      browserRef = window.open(url, '_blank', 'location=no');
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

  getSoundVolume() {
    return Promise.resolve(100);
  }

  setSoundVolume(value) {
    return Promise.resolve();
  }

  getDisplayBrightness() {
    return Promise.resolve(100);
  }

  setDisplayBrightness(value) {
    return Promise.resolve();
  }
};
