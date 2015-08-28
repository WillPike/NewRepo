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

  finalize() {
    super.finalize();

    return new Promise((resolve) => {
      this.model.clearWatcher(this.model.REQUEST_KIND_ORDER);
      this.model.clearWatcher(this.model.REQUEST_KIND_ASSISTANCE);
      this.model.clearWatcher(this.model.REQUEST_KIND_CLOSEOUT);

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
    this.model.$orderCartAdd(item);

    if (this._ChatModel.giftSeat) {
      this._ChatModel.giftReady.dispatch();
    }

    return this.model.orderCart;
  }

  removeFromCart(item) {
    this.model.$orderCartRemove(item);

    return this.model.orderCart;
  }

  clearCart() {
    this.model.$orderCartClear();

    this._ChatModel.giftSeat = null;
  }

  clearCheck(items) {
    this.model.$orderCheckClear(items);
  }

  submitCart(options) {
    if (this.model.orderCart.length === 0) {
      return;
    }

    options = options || 0;

    if (this._ChatModel.giftSeat) {
      options |= 4;
    }

    var request = {
      kind: this.model.REQUEST_KIND_ORDER,
      items: this.model.orderCart.map(entry => {
        return {
          token: entry.item.order.token,
          quantity: entry.quantity,
          modifiers: [],
          modifiers_list: entry.modifiers.reduce((result, category) => {
            return result.concat(category.modifiers.reduce((result, modifier) => {
              if (modifier.isSelected || modifier.data.is_default) {
                let payload = {
                  token: modifier.data.token,
                  is_selected: modifier.isSelected
                };

                if (modifier.isExtra) {
                  payload.is_extra = modifier.isExtra;
                }

                result.push(payload);
              }

              return result;
            }, []));
          }, []),
          note: entry.name || ''
        };
      }),
      ticket_token: this.model.orderTicket.token,
      seat_token: this._ChatModel.giftSeat,
      options: options
    };

    return new Promise((resolve, reject) => {
      this._DtsApi.waiter.placeOrder(request).then(response => {
        if (response.item_tokens) {
          for (var i = 0; i < response.item_tokens.length; i++) {
            this.model.orderCart[i].request = response.item_tokens[i];
          }
        }

        this.model.orderTicket = { token: response.ticket_token };

        this.model.$moveCartToCheck();

        this._ChatModel.giftSeat = null;

        let watcher = this._createWatcher(this.model.REQUEST_KIND_ORDER, response);
        resolve(watcher);
      }, reject);
    });
  }

  requestCloseout() {
    var request = {
      kind: this.model.REQUEST_KIND_CLOSEOUT,
      ticket_token: this.model.orderTicket.token,
    };

    return this._DtsApi.waiter.placeRequest(request).then(response => {
      this.model.orderTicket = { token: response.ticket_token };
      return this._createWatcher(this.model.REQUEST_KIND_CLOSEOUT, response);
    });
  }

  requestAssistance() {
    var request = {
      kind: this.model.REQUEST_KIND_ASSISTANCE,
      ticket_token: this.model.orderTicket.token,
    };

    return this._DtsApi.waiter.placeRequest(request).then(response => {
      this._saveTicket(response);
      return this._createWatcher(this.model.REQUEST_KIND_ASSISTANCE, response);
    });
  }

  copyItems(items) {
    return items.slice(0).map(item => item.clone());
  }

  calculatePrice(entry) {
    if (!entry) {
      return 0;
    }

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

  calculateCount(entries) {
    return entries.reduce((total, entry) => total + entry.quantity, 0);
  }

  uploadSignature(data) {
    return this._DtsApi.upload.uploadTemp(data, 'image/png', 'signature.png')
      .then(response => response.token);
  }

  generatePaymentToken() {
    return new Promise((resolve, reject) => {
      if (this._CustomerModel.isAuthenticated && !this._CustomerModel.isGuest) {
        this._DtsApi.customer.initializePayment().then(response => {
          resolve(response.token);
        }, reject);
      }
      else {
        this._DtsApi.waiter.initializePayment().then(response => {
          resolve(response.token);
        }, reject);
      }
    });
  }

  payOrder(request) {
    request.ticket_token = this.model.orderTicket.token;
    return this._DtsApi.waiter.submitCheckoutPayment(request);
  }

  requestReceipt(request) {
    request.ticket_token = this.model.orderTicket.token;
    return this._DtsApi.waiter.requestReceipt(request);
  }

  _saveTicket(response) {
    this.model.orderTicket = {
      token: response.ticket_token
    };
  }

  _createWatcher(kind, ticket) {
    let watcher = new app.RequestWatcher(ticket, this._DtsApi);
    this.model.addWatcher(kind, watcher);

    return watcher;
  }
};
