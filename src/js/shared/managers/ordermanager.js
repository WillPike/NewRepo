window.app.OrderManager = class OrderManager extends app.AbstractManager {
  constructor(ChatModel, CustomerModel, DtsApi, OrderModel, Logger) {
    super(Logger);

    this._DtsApi = DtsApi;
    this._ChatModel = ChatModel;
    this._CustomerModel = CustomerModel;
    this._OrderModel = OrderModel;

    this._ChatModel.giftSeatChanged.add(giftSeat => {
      if (this.model.orderCartStash.length === 0) {
        this.model.orderCartStash = this.model.orderCart;
        this.model.orderCart = [];
      }

      if (!giftSeat) {
        this.model.orderCart = this.model.orderCartStash;
      }
    });
  }

  get model() {
    return this._OrderModel;
  }

  reset() {
    super.reset();

    return new Promise((resolve) => {
      this.model.clearWatcher(self.model.REQUEST_KIND_ORDER);
      this.model.clearWatcher(self.model.REQUEST_KIND_ASSISTANCE);
      this.model.clearWatcher(self.model.REQUEST_KIND_CLOSEOUT);

      this.clearCart();
      this.clearCheck();
      this.model.orderTicket = {};

      resolve();
    });
  }

  //-----------------------------------------------
  //    Cart and checks
  //-----------------------------------------------

  addToCart(item) {
    this.model.orderCart.push(item);
    this.model.orderCartChanged.dispatch(this.model.orderCart);

    if (this._ChatModel.giftSeat) {
      this._ChatModel.giftReady.dispatch();
    }

    return this.model.orderCart;
  }

  removeFromCart(item) {
    this.model.orderCart = this.model.orderCart.filter(entry => entry !== item);
    return this.model.orderCart;
  }

  clearCart() {
    this.model.orderCart = [];
    this.model.orderCartStash = [];

    this._ChatModel.giftSeat = null;
  }

  clearCheck(items) {
    var result = [];

    if (items) {
      result = this.model.orderCheck;

      items.forEach(item => {
        for (var i = 0; i < result.length; i++) {
          if (result[i].request === item.request) {
            result[i].quantity -= item.quantity;
            break;
          }
        }
      });

      result = result.filter(item => item.quantity > 0);
    }

    this.model.orderCheck = result;
  }

  submitCart(options) {
    if (this.model.orderCart.length === 0) {
      return;
    }

    options = options || 0;

    if (this._ChatModel.giftSeat) {
      options |= 4;
    }

    var self = this;

    var request = {
      kind: this.model.REQUEST_KIND_ORDER,
      items: this.model.orderCart.map(entry => {
        return {
          token: entry.item.order.token,
          quantity: entry.quantity,
          modifiers: entry.modifiers.reduce((result, category) => {
            return result.concat(category.modifiers.reduce((result, modifier) => {
              if (modifier.isSelected) {
                result.push(modifier.data.token);
              }
              return result;
            }, []));
          }, []),
          note: entry.name || ''
        };
      }),
      ticket_token: self.model.orderTicket.token,
      seat_token: self._ChatModel.giftSeat,
      options: options
    };

    return new Promise((resolve, reject) => {
      self._DtsApi.waiter.placeOrder(request).then(response => {
        if (response.item_tokens) {
          for (var i = 0; i < response.item_tokens.length; i++) {
            self.model.orderCart[i].request = response.item_tokens[i];
          }
        }

        self.model.orderTicket = { token: response.ticket_token };

        self.model.orderCheck = self.model.orderCheck.concat(self.model.orderCart);
        self.clearCart();

        self._ChatModel.giftSeat = null;

        let watcher = self._createWatcher(self.model.REQUEST_KIND_ORDER, response);
        resolve(watcher);
      }, reject);
    });
  }

  requestCloseout() {
    var self = this;
    var request = {
      kind: this.model.REQUEST_KIND_CLOSEOUT,
      ticket_token: this.model.orderTicket.token,
    };

    return this._DtsApi.waiter.placeRequest(request).then(response => {
      self.model.orderTicket = { token: response.ticket_token };
      return self._createWatcher(self.model.REQUEST_KIND_CLOSEOUT, response);
    });
  }

  requestAssistance() {
    var self = this;
    var request = {
      kind: this.model.REQUEST_KIND_ASSISTANCE,
      ticket_token: this.model.orderTicket.token,
    };

    return this._DtsApi.waiter.placeRequest(request).then(response => {
      self._saveTicket(response);
      return self._createWatcher(self.model.REQUEST_KIND_ASSISTANCE, response);
    });
  }

  copyItems(items) {
    return items.slice(0).map(item => item.clone());
  }

  calculatePrice(entry) {
    var modifiers = entry.modifiers.reduce((total, category) => {
      return total + category.modifiers.reduce((total, modifier) => {
        return total + (modifier.isSelected && modifier.data.price > 0 ?
          modifier.data.price :
          0
        );
      }, 0);
    }, 0);

    return entry.quantity * (modifiers + entry.item.order.price);
  }

  calculateTotalPrice(entries) {
    return (entries ? entries.reduce((total, entry) => {
      return total + OrderManager.prototype.calculatePrice(entry);
    }, 0) : 0);
  }

  calculateTax(entries) {
    return this.calculateTotalPrice(entries) * this.model.tax;
  }

  uploadSignature(data) {
    return this._DtsApi.upload.uploadTemp(data, 'image/png', 'signature.png')
      .then(response => response.token);
  }

  generatePaymentToken() {
    var self = this;

    if (this._CustomerModel.isAuthenticated && !this._CustomerModel.isGuest) {
      return this._DtsApi.customer.initializePayment().then(response => {
        self._savePaymentToken(response);
      });
    }

    return this._DtsApi.waiter.initializePayment().then(response => {
      self._savePaymentToken(response);
    });
  }

  payOrder(request) {
    request.ticket_token = this.model.orderTicket.token;
    request.payment_token = this.model.orderTicket.payment_token;
    return this._DtsApi.waiter.submitCheckoutPayment(request);
  }

  requestReceipt(request) {
    request.ticket_token = this.model.orderTicket.token;
    return this._DtsApi.waiter.requestReceipt(request);
  }

  _saveTicket(response) {
    this.model.orderTicket = {
      token: response.ticket_token,
      payment_token: this.model.orderTicket.payment_token
    };
  }

  _savePaymentToken(response) {
    this.model.orderTicket = {
      token: this.model.orderTicket.token,
      payment_token: response.token
    };
  }

  _createWatcher(kind, ticket) {
    let watcher = new app.RequestWatcher(ticket, this._DtsApi);
    this.model.addWatcher(kind, watcher);

    return watcher;
  }
};
