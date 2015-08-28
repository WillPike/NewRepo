window.app.CartItem = class CartItem {
  constructor(item, quantity, name, modifiers, request) {
    this.quantityChanged = new signals.Signal();

    Object.defineProperty(this, 'quantityChanged', {
      value: new signals.Signal(),
      enumerable: false,
      writable: false,
      configurable: false
    });

    this.item = item;
    this.quantity = quantity;
    this.name = name;
    this.request = request;

    if (!this.hasModifiers) {
      this.modifiers = [];
    }
    else if (!modifiers) {
      this.modifiers = item.modifiers.map(category => new app.CartModifierCategory(
        category,
        category.items.map(modifier => new app.CartModifier(modifier, Boolean(modifier.is_default)))
      ));
    }
    else {
      this.modifiers = modifiers;
    }
  }

  get hasModifiers() {
    return this.item.modifiers !== null && this.item.modifiers.length > 0;
  }

  get quantity() {
    return this._quantity;
  }

  set quantity(value) {
    value = parseInt(value);

    if (this._quantity === value) {
      return;
    }

    this._quantity = value;
    this.quantityChanged.dispatch(value);
  }

  clone(count) {
    return new app.CartItem(
      this.item,
      this.quantity,
      this.name,
      this.modifiers.map(category => category.clone()),
      this.request);
  }

  cloneMany(count) {
    count = count || this.quantity;
    var result = [];

    for (var i = 0; i < count; i++) {
      result.push(new app.CartItem(
        this.item,
        1,
        this.name,
        this.modifiers.map(category => category.clone()),
        this.request)
      );
    }

    return result;
  }

  restore(data) {
    return new app.CartItem(
      data.item,
      data.quantity || data._quantity || 1,
      data.name,
      data.modifiers.map(app.CartModifierCategory.prototype.restore),
      data.request
    );
  }
};
