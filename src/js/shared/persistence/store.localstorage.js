window.app.LocalStorageStore = class LocalStorageStore {
  constructor(id) {
    this._id = id;

    if (!store) {
      throw Error('Store.js not found.');
    }
  }

  clear() {
    try {
      store.remove(this._id);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  read() {
    try {
      var value = store.get(this._id);
      return Promise.resolve(value);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  write(value) {
    try {
      store.set(this._id, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
