window.app.CartModifier = class CartModifier {
  constructor(data, isSelected, isExtra) {
    this.data = data;
    this.isSelected = isSelected || false;
    this.isExtra = isExtra || false;
  }

  clone() {
    return new app.CartModifier(this.data, this.isSelected, this.isExtra);
  }

  restore(data) {
    return new app.CartModifier(data.data, data.isSelected, data.isExtra);
  }
};

window.app.CartModifierCategory = class CartModifierCategory {
  constructor(data, modifiers) {
    this.data = data;
    this.modifiers = modifiers;
  }

  clone() {
    let modifiers = this.modifiers.map(modifier => modifier.clone());
    return new app.CartModifierCategory(this.data, modifiers);
  }

  restore(data) {
    return new app.CartModifierCategory(data.data, data.modifiers.map(app.CartModifier.prototype.restore));
  }
};
