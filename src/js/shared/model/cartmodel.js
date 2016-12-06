window.app.CartModel = class CartModel {
  constructor() {
    this.STATE_NONE = 'none';
    this.STATE_CART = 'cart';
    this.STATE_HISTORY = 'history';

    this._cartState = this.STATE_NONE;
    this.cartStateChanged = new signals.Signal();
    this._editableItem = null;
    this.editableItemChanged = new signals.Signal();
  }

  get cartState() {
    return this._cartState;
  }

  set cartState(value) {
    if (this._cartState === value) {
      return;
    }
    this._cartState = value;
    this.cartStateChanged.dispatch(value);
  }

  get editableItem() {
    return this._editableItem;
  }

  get editableItemNew() {
    return this._editableItemNew;
  }

  openEditor(item, isNew) {
    if (this._editableItem === item) {
      return;
    }
    this._editableItemNew = isNew || false;
    this._editableItem = item;
    this.editableItemChanged.dispatch(item);
  }

  closeEditor() {
    this._editableItemNew = false;
    this._editableItem = null;
    this.editableItemChanged.dispatch(null);
  }
};
