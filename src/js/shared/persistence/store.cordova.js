window.app.CordovaLocalStorageStore = class CordovaLocalStorageStore {
  constructor(id, Logger) {
    this._id = id;
    this._Logger = Logger;

    if (!localStorage) {
      throw Error('Cordova not found.');
    }
  }

  clear() {
    try {
      localStorage.removeItem(this._id);
      return Promise.resolve();
    } catch (e) {
      this._Logger.warn(`Unable to clear store #${this._id}: ${e.message}`);
      return Promise.reject(e);
    }
  }

  read() {
    try {
      var value = JSON.parse(localStorage.getItem(this._id));
      return Promise.resolve(value);
    } catch (e) {
      this._Logger.warn(`Unable to read from store #${this._id}: ${e.message}`);
      return Promise.reject(e);
    }
  }

  readSync() {
    try {
      var value = JSON.parse(localStorage.getItem(this._id));
      return value;
    } catch (e) {
      this._Logger.warn(`Unable to read from store #${this._id}: ${e.message}`);
      return undefined;
    }
  }

  write(value) {
    try {
      localStorage.setItem(this._id, JSON.stringify(value));
      return Promise.resolve();
    } catch (e) {
      this._Logger.warn(`Unable to write to store #${this._id}: ${e.message}`);
      return Promise.reject(e);
    }
  }
};
