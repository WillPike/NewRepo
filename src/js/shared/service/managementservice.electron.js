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
      this._ipc.send('rotate-screen');
      resolve();
    });
  }

  getSoundVolume() {
    return Promise.resolve(100);
  }

  setSoundVolume() {
    return Promise.reject();
  }

  getDisplayBrightness() {
    return new Promise(resolve => {
      let value = this._ipc.sendSync('get-display-brightness');
      resolve(value);
    });
  }

  setDisplayBrightness(value) {
    if (!(value >= 0 && value <= 100)) {
      return Promise.reject(`Invalid value: ${value}`);
    }

    return new Promise(resolve => {
      this._ipc.send('set-display-brightness', value * 0.01);
      resolve();
    });
  }

  startCardReader() {
    return Promise.reject();
  }

  stopCardReader() {
    return Promise.reject();
  }
};
