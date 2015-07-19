window.app.CartItem = class CartItem {
  constructor(item, quantity, name, modifiers, request) {
    this.item = item;
    this.quantity = quantity;
    this.name = name;
    this.request = request;

    if (!this.hasModifiers) {
      this.modifiers = [];
    }
    else if (!modifiers) {
      this.modifiers = item.modifiers.map(function(category) {
        return new app.CartModifierCategory(category, category.items.map(function(modifier) {
          return new app.CartModifier(modifier);
        }));
      });
    }
    else {
      this.modifiers = modifiers;
    }
  }

  get hasModifiers() {
    return this.item.modifiers != null && this.item.modifiers.length > 0;
  }

  get selectedModifiers() {
    return this.modifiers.reduce(function(previousCategory, category, i, array) {
      return array.concat(category.items.filter(function(modifier) {
        return modifier.isSelected;
      }));
    }, []);
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
      data.quantity,
      data.name,
      data.modifiers.map(app.CartModifierCategory.prototype.restore),
      data.request
    );
  }
};
