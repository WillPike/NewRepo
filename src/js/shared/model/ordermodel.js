window.app.OrderModel = class OrderModel {
  /* global signals */

  constructor(storageProvider) {
    var self = this;

    this.REQUEST_KIND_ORDER = 1;
    this.REQUEST_KIND_ASSISTANCE = 2;
    this.REQUEST_KIND_CLOSEOUT = 3;

    this.priceFormat = '{0}';
    this.tax = 0;

    this._orderCart = [];
    this._orderCartStash = [];
    this._orderCheck = [];
    this._orderTicket = {};

    this._requestWatchers = {};

    //-----------------------------------------------
    //    Signals
    //-----------------------------------------------

    this.orderCartChanged = new signals.Signal();
    this.orderCartStashChanged = new signals.Signal();
    this.orderCheckChanged = new signals.Signal();
    this.orderTicketChanged = new signals.Signal();
    this.orderRequestChanged = new signals.Signal();
    this.assistanceRequestChanged = new signals.Signal();
    this.closeoutRequestChanged = new signals.Signal();

    //-----------------------------------------------
    //    Initialization
    //-----------------------------------------------

    function prepareCartData(items) {
      return items;
    }

    function restoreCartData(items) {
      return items.map ? items.map(app.CartItem.prototype.restore) : [];
    }

    this._orderCartStorage = storageProvider('snap_order_cart');
    this._orderCartStorage.read().then(value => {
      self.orderCart = restoreCartData(value || []);
      self.orderCartChanged.dispatch(self.orderCart);
      self.orderCartChanged.add(items => {
        self._orderCartStorage.write(prepareCartData(items));
      });
    });

    this._orderCartStashStorage = storageProvider('snap_order_cart_stash');
    this._orderCartStashStorage.read().then(value => {
      self.orderCartStash = restoreCartData(value || []);
      self.orderCartStashChanged.dispatch(self.orderCartStash);
      self.orderCartStashChanged.add(items => {
        self._orderCartStashStorage.write(prepareCartData(items));
      });
    });

    this._orderCheckStorage = storageProvider('snap_order_check');
    this._orderCheckStorage.read().then(value => {
      self.orderCheck = restoreCartData(value || []);
      self.orderCheckChanged.dispatch(self.orderCheck);
      self.orderCheckChanged.add(items => {
        self._orderCheckStorage.write(prepareCartData(items));
      });
    });

    this._orderTicketStorage = storageProvider('snap_order_ticket');
    this._orderTicketStorage.read().then(value => {
      self.orderTicket = value || {};
      self.orderTicketChanged.dispatch(self.orderTicket);
      self.orderTicketChanged.add(data => {
        self._orderTicketStorage.write(data);
      });
    });
  }

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  get orderCart() {
    return this._orderCart;
  }

  set orderCart(value) {
    this._orderCart = value || [];
    this.orderCartChanged.dispatch(this.orderCart);
  }

  get orderCartStash() {
    return this._orderCartStash;
  }

  set orderCartStash(value) {
    this._orderCartStash = value || [];
    this.orderCartStashChanged.dispatch(this.orderCartStash);
  }

  get orderCheck() {
    return this._orderCheck;
  }

  set orderCheck(value) {
    this._orderCheck = value || [];
    this.orderCheckChanged.dispatch(this.orderCheck);
  }

  get orderTicket() {
    return this._orderTicket;
  }

  set orderTicket(value) {
    this._orderTicket = value || {};
    this.orderTicketChanged.dispatch(this.orderTicket);
  }

  get orderRequest() {
    return this.getWatcher(this.REQUEST_KIND_ORDER);
  }

  get assistanceRequest() {
    return this.getWatcher(this.REQUEST_KIND_ASSISTANCE);
  }

  get closeoutRequest() {
    return this.getWatcher(this.REQUEST_KIND_CLOSEOUT);
  }

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Request watchers
  //-----------------------------------------------

  getWatcher(kind) {
    return this._requestWatchers[kind] || null;
  }

  addWatcher(kind, watcher) {
    this.clearWatcher(kind);

    var self = this;
    watcher.promise.then(() => {
      if (self.getWatcher(kind) !== watcher) {
        return;
      }
      self.clearWatcher(kind);
    });

    this._requestWatchers[kind] = watcher;
    this._notifyChange(kind);
  }

  clearWatcher(kind) {
    var watcher = this.getWatcher(kind);

    if (watcher) {
      watcher.dispose();
    }

    delete this._requestWatchers[kind];
    this._notifyChange(kind);
  }

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  _notifyChange(kind) {
    var signal;

    switch (kind) {
      case this.REQUEST_KIND_ORDER:
        signal = this.orderRequestChanged;
        break;
      case this.REQUEST_KIND_ASSISTANCE:
        signal = this.assistanceRequestChanged;
        break;
      case this.REQUEST_KIND_CLOSEOUT:
        signal = this.closeoutRequestChanged;
        break;
    }

    if (signal) {
      signal.dispatch(this.getWatcher(kind));
    }
  }
};
