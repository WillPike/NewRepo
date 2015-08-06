window.app.CordovaCardReader = class CordovaCardReader {
  /* global signals */

  constructor() {
    this.onReceived = new signals.Signal();
    this.onError = new signals.Signal();

    if (!window.IDTech) {
      throw new Error('Card reader is not available.');
    }
  }

  received(card) {
    this.onReceived.dispatch(card);
  }

  error(e) {
    this.onError.dispatch(e);
  }

  start() {
    if (!this._active) {
      this._active = true;

      window.IDTech.startCardReader((data) => this._onReceived(data), e => this._onError(e));
    }
  }

  stop() {
    if (this._active) {
      this._active = false;

      window.IDTech.stopCardReader(() => {}, e => {});
    }
  }

  _onReceived(data) {
    if (!this._active) {
      return;
    }

    this.received({
      data: data
    });
  }

  _onError(data) {
    if (!this._active) {
      return;
    }

    this.error({
      cause: parseInt(data) || 2
    });
  }
};
