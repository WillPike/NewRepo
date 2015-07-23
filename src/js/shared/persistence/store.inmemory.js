window.app.InMemoryStore = class InMemoryStore {
  constructor() {
    this._storage = null;
  }

  clear() {
    this._storage = undefined;
    return Promise.resolve();
  }

  read() {
    return Promise.resolve(this._storage);
  }

  write(value) {
    this._storage = value;
    return Promise.resolve();
  }
};
