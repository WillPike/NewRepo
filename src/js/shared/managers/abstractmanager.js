window.app.AbstractManager = class AbstractManager {
  constructor(Logger) {
      this._Logger = Logger;
  }

  initialize() {
    this._Logger.debug(`Initializing ${this.constructor.name}...`);

    return Promise.resolve();
  }

  reset() {
    this._Logger.debug(`Resetting ${this.constructor.name}...`);
  }
};
