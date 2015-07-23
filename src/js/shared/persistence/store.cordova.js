window.app.CordovaLocalStorageStore = class CordovaLocalStorageStore {
  constructor(id) {
    this._id = id;

    if (!localStorage) {
      throw Error('Cordova not found.');
    }
  }

  clear() {
    try {
      localStorage.removeItem(this._id);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  read() {
    try {
      var value = JSON.parse(localStorage.getItem(this._id));
      return Promise.resolve(value);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  write(value) {
    try {
      localStorage.setItem(this._id, JSON.stringify(value));
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
