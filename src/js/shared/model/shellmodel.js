window.app.ShellModel = class ShellModel {
  /* global signals */

  constructor() {
    this._backgrounds = [];
    this.backgroundsChanged = new signals.Signal();
    this._screensavers = [];
    this.screensaversChanged = new signals.Signal();
    this._pageBackgrounds = [];
    this.pageBackgroundsChanged = new signals.Signal();
    this._elements = [];
    this.elementsChanged = new signals.Signal();
    this._priceFormat = '{0}';
    this.priceFormatChanged = new signals.Signal();
    this._currency = '';
    this.currencyChanged = new signals.Signal();
  }

  get backgrounds() {
    return this._backgrounds;
  }

  set backgrounds(value) {
    this._backgrounds = value;
    this.backgroundsChanged.dispatch(value);
  }

  get screensavers() {
    return this._screensavers;
  }

  set screensavers(value) {
    this._screensavers = value;
    this.screensaversChanged.dispatch(value);
  }

  get pageBackgrounds() {
    return this._pageBackgrounds;
  }

  set pageBackgrounds(value) {
    this._pageBackgrounds = value;
    this.pageBackgroundsChanged.dispatch(value);
  }

  get elements() {
    return this._elements;
  }

  set elements(value) {
    this._elements = value;
    this.elementsChanged.dispatch(value);
  }

  get priceFormat() {
    return this._priceFormat;
  }

  set priceFormat(value) {
    this._priceFormat = value;
    this.priceFormatChanged.dispatch(value);
  }

  get currency() {
    return this._currency;
  }

  set currency(value) {
    this._currency = value;
    this.currencyChanged.dispatch(value);
  }
};
