window.app.AbstractModel = class AbstractModel {
  /* global signals */

  constructor(storageProvider) {
    this._storageProvider = storageProvider;
    this._storedProperties = {};
  }

  _defineProperty(name, storeName, defaultValue) {
    var self = this,
        _name = '_' + name,
        _signal = name + 'Changed',
        store;

    if (storeName) {
      store = this._storageProvider(storeName);
      this._storedProperties[name] = store;
    }

    this[_signal] = new signals.Signal();

    Object.defineProperty(this, name, {
      get: function() {
        return self[_name] || defaultValue;
      },
      set: function(value) {
        if (value === self[_name]) {
          return;
        }

        self[_name] = value;

        if (store) {
          store.write(value).then(() => {
            self[_signal].dispatch(value);
          });
        }
      }
    });
  }

  _initProperty(name) {
    var self = this,
        _name = '_' + name,
        _signal = name + 'Changed';
    return this._storedProperties[name].read().then(value => {
      self[_name] = value;
      self[_signal].dispatch(value);
    });
  }

  initialize() {
    return Object.keys(this._storedProperties).map(key => this._initProperty(key));
  }

  _propertyChanged(name) {
    var _name = '_' + name,
        _signal = name + 'Changed',
        store = this._storedProperties[name];

    this[_signal].dispatch(this[_name]);

    if (store) {
      store.write(this[_name]);
    }
  }
};
