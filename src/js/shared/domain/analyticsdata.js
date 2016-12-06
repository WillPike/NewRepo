window.app.AnalyticsData = class AnalyticsData {
  constructor(name, storageProvider, defaultValue) {
    this._defaultValue = defaultValue || (() => []);
    this._name = name;
    this._data = this._defaultValue();
    this._store = storageProvider('snap_analytics_' + name);
  }

  initialize() {
    var self = this;
    return this._store.read().then(data => self._data = data || self._data);
  }

  get name() {
    return this._name;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
    this.store();
  }

  get length() {
    return this._data.length;
  }

  get last() {
    return this._data[this.length - 1];
  }

  push(item) {
    this._data.push(item);
    this.store();
  }

  reset() {
    this._data = this._defaultValue();
    return this.store();
  }

  store() {
    return this._store.write(this._data);
  }
};
