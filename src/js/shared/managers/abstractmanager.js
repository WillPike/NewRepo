window.app.AbstractManager = class AbstractManager {
  constructor(Logger) {
      this._Logger = Logger;
  }

  initialize() {
    this._Logger.debug(`Initializing ${this.constructor.name}...`);

    return Promise.resolve();
  }

  finalize() {
    this._Logger.debug(`Resetting ${this.constructor.name}...`);

    return Promise.resolve();
  }
};
