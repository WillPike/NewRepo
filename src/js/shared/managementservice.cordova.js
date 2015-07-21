window.app.CordovaManagementService = class CordovaManagementService {
  /* global signals */

  constructor(Logger) {
    this._Logger = Logger;

    if (!window.cordova) {
      this._Logger.warn('Cordova is not available.');
    }

    this.isExternalBrowser = true;
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

  }

  stopCardReader() {

  }

  reset() {
    var self = this;
    return new Promise((resolve, reject) => {

    });
  }

  getSoundVolume() {

  }

  setSoundVolume(value) {

  }

  getDisplayBrightness() {

  }

  setDisplayBrightness(value) {

  }
};
