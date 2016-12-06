window.app.ElectronManagementService = class ElectronManagementService {
  constructor() {
    if (!require) {
      throw new Error('Node.js context not found.');
    }

    this._ipc = require('ipc');

    if (!this._ipc) {
      throw new Error('IPC module not found.');
    }
  }

  loadReset() {
    return new Promise(() => window.location.assign('reset.html'));
  }

  loadStartup() {
    return new Promise(() => window.location.assign('startup.html'));
  }

  loadApplication(location) {
    return new Promise(() => window.location.assign(`snap_${location.theme.layout}.html`));
  }

  openBrowser(url) {
    return Promise.resolve(new app.WebViewBrowserReference(url));
  }

  closeBrowser(reference) {
    return new Promise(resolve => {
      reference.exit();
      resolve();
    });
  }

  rotateScreen() {
    return new Promise(resolve => {
      //this._ipc.send('rotate-screen');
      resolve();
    });
  }

  getSoundVolume() {
    return Promise.resolve(50);
    // return new Promise(resolve => {
    //   this._ipc.on('get-sound-volume-result', function(value) {
    //     resolve(parseFloat(value) * 100);
    //   });
    //   this._ipc.send('get-sound-volume');
    // });
  }

  setSoundVolume() {
    if (!(value >= 0 && value <= 100)) {
      return Promise.reject(`Invalid value: ${value}`);
    }

    return new Promise(resolve => {
      //this._ipc.send('set-sound-volume', value * 0.01);
      resolve();
    });
  }

  getDisplayBrightness() {
    return Promise.resolve(50);
    // return new Promise(resolve => {
    //   this._ipc.on('get-display-brightness-result', function(value) {
    //     resolve(parseFloat(value) * 100);
    //   });
    //   this._ipc.send('get-display-brightness');
    // });
  }

  setDisplayBrightness(value) {
    if (!(value >= 0 && value <= 100)) {
      return Promise.reject(`Invalid value: ${value}`);
    }

    return new Promise(resolve => {
      //this._ipc.send('set-display-brightness', value * 0.01);
      resolve();
    });
  }

  startCardReader() {
    return Promise.reject();
    // return new Promise((resolve, reject) => {
    //   this._ipc.on('card-reader-result', function(data) {
    //     resolve(data);
    //   });
    //   this._ipc.on('card-reader-error', function() {
    //     reject();
    //   });
    //   this._ipc.send('start-card-reader');
    // });
  }

  stopCardReader() {
    return Promise.reject();
    // return new Promise(resolve => {
    //   this._ipc.send('stop-card-reader');
    //   resolve();
    // });
  }
};
