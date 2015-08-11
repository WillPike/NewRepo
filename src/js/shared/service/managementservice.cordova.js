window.app.CordovaManagementService = class CordovaManagementService {
  constructor() {
    if (!window.cordova) {
      throw new Error('Cordova is not available.');
    }

    if (window.screen) {
      this._orientation = window.screen.orientation;
    }
  }

  loadReset() {
    return new Promise(() => window.open('reset.html', '_self'));
  }

  loadStartup() {
    return new Promise(() => window.open('startup.html', '_self'));
  }

  loadApplication(location) {
    return new Promise(() => window.open(`snap_${location.theme.layout}.html`, '_self'));
  }

  rotateScreen() {
    if (!window.screen || !this._orientation) {
      return Promise.resolve();
    }

    var self = this;
    return new Promise(resolve => {
      var orientation;
      switch (self._orientation.type) {
        case 'landscape':
        case 'landscape-primary':
          orientation = 'landscape-secondary';
          break;
        case 'landscape-secondary':
          orientation = 'landscape-primary';
          break;
        default:
          orientation = 'landscape-primary';
          break;
      }

      window.screen.lockOrientation(orientation);
      resolve();
    });
  }

  openBrowser(url) {
    return new Promise(resolve => {
      let settings = {
            location: 'yes',
            clearcache: 'yes',
            clearsessioncache: 'yes',
            zoom: 'no',
            hardwareback: 'no'
          };

      let ref = new app.CordovaWebBrowserReference(url);
      ref.attach(window.open(url, '_blank', Object.keys(settings).map(x => `${x}=${settings[x]}`).join(',')));

      resolve(ref);
    });
  }

  closeBrowser(reference) {
    return new Promise(resolve => {
      reference.exit();
      resolve();
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

  startCardReader() {
    return new Promise((resolve, reject) => {
      IDTech.startCardReader(resolve, reject);
    });
  }

  stopCardReader() {
    return new Promise((resolve, reject) => {
      IDTech.stopCardReader(resolve, reject);
    });
  }
};
