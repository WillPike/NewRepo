window.app.AbstractModel = class AbstractModel {
  /* global signals */

  constructor(storageProvider) {
    this._storageProvider = storageProvider;
    this._properties = {};
  }

  _defineProperty(name, storeName, defaultValue, providerFunction) {
    var self = this,
        property = this._properties[name] = { name: '_' + name };

    if (storeName) {
      property.store = this._storageProvider(storeName);
    }

    if (providerFunction) {
      property.provider = providerFunction;
    }

    this[name + 'Changed'] = property.signal = new signals.Signal();

    Object.defineProperty(this, name, {
      get: function() {
        return self[property.name] || defaultValue;
      },
      set: function(value) {
        if (value === self[property.name]) {
          return;
        }

        self[property.name] = value;

        if (property.store) {
          property.store.write(value).then(() => {
            property.signal.dispatch(value);
          });
        }
      }
    });
  }

  _initProperty(name) {
    var self = this,
        property = this._properties[name];

    if (!property) {
      throw new Error(`Property '${name}' not found.`);
    }

    if (property.initialized) {
      throw new Error(`Property '${name}' is already initialized.`);
    }

    if (!property.store) {
      property.initialized = true;
      return Promise.resolve();
    }

    return property.store.read().then(value => {
      property.initialized = true;
      self[property.name] = value;
      property.signal.dispatch(value);
    });
  }

  initialize() {
    return Promise.all(Object.keys(this._properties)
      .filter(key => !this._properties[key].initialized)
      .map(key => this._initProperty(key)));
  }

  fetch(propertyName) {
    var property = this._properties[propertyName];

    if (!property) {
      throw new Error(`Property '${propertyName}' not found.`);
    }

    if (!property.provider) {
      throw new Error(`Property '${propertyName}' has no provider.`);
    }

    var self = this;
    return property.provider().then(value => {
      self[propertyName] = value;
      return value;
    });
  }

  fetchAll() {
    return Promise.all(Object.keys(this._properties)
      .filter(key => this._properties[key].provider)
      .map(key => this.fetch(key)));
  }

  clear() {
    return Promise.all(Object.keys(this._properties)
      .filter(key => this._properties[key].store)
      .map(key => this._properties[key].store.clear()));
  }

  _propertyChanged(name) {
    var property = this._properties[name];

    property.signal.dispatch(this[property.name]);

    if (property.store) {
      property.store.write(this[property.name]);
    }
  }
};
