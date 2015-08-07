window.app.GenericManagementService = class GenericManagementService {
  loadReset() {
    return new Promise(() => window.location.assign('reset.html'));
  }

  loadStartup() {
    return new Promise(() => window.location.assign('startup.html'));
  }

  loadApplication() {
    return new Promise(() => window.location.assign('snap.html'));
  }

  openBrowser() {
    return Promise.reject();
  }

  closeBrowser() {
    return Promise.reject();
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
