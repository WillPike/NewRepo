window.app.GenericManagementService = class GenericManagementService {
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
    return Promise.resolve(new app.IframeWebBrowserReference(url));
  }

  closeBrowser(reference) {
    return new Promise(resolve => {
      reference.exit();
      resolve();
    });
  }

  rotateScreen() {
    return Promise.reject();
  }

  getSoundVolume() {
    return Promise.reject();
  }

  setSoundVolume() {
    return Promise.reject();
  }

  getDisplayBrightness() {
    return Promise.reject();
  }

  setDisplayBrightness() {
    return Promise.reject();
  }

  startCardReader() {
    return Promise.reject();
  }

  stopCardReader() {
    return Promise.reject();
  }
};
