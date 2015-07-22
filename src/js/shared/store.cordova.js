window.app.CordovaLocalStorageStore = class CordovaLocalStorageStore {
  constructor(id) {
    this._id = id;

    if (!localStorage) {
      console.error('Cordova not found.');
    }
  }

  clear() {
    var self = this;
    return new Promise((resolve) => {
      //localStorage.removeItem(self._id);
      resolve();
    });
  }

  read() {
    var self = this;
    return new Promise((resolve) => {
      var value = JSON.parse(localStorage.getItem(self._id));
      resolve(value);
    });
  }

  write(value) {
    var self = this;
    return new Promise((resolve) => {
      localStorage.setItem(self._id, JSON.stringify(value));
      resolve();
    });
  }
};
