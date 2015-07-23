window.app.ConfigModel = class ConfigModel {
  /* global signals */

  constructor(storageProvider) {
    this._store = storageProvider('snap_location_config');
    this.configChanged = new signals.Signal();

    this._store.read().then(config => {
      this._config = config;
    });
  }

  get config() {
    return this._config;
  }

  set config(value) {
    this._config = value;
    this._store.write(value);
    this.configChanged.dispatch(value);
  }
};
