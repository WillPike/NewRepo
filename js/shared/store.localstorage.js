(function() {

  //------------------------------------------------------------------------
  //
  //  LocalStorageStore
  //
  //------------------------------------------------------------------------

  var LocalStorageStore = function(id) {
    app.Store.call(this);
    this._id = id;
  };

  LocalStorageStore.prototype = Object.create(app.Store.prototype);

  LocalStorageStore.prototype.clear = function() {
    store.remove(this._id);
    return Promise.resolve();
  };

  LocalStorageStore.prototype.read = function() {
    return Promise.resolve(store.get(this._id));
  };

  LocalStorageStore.prototype.write = function(value) {
    store.set(this._id, value);
    return Promise.resolve();
  };

  window.app.LocalStorageStore = LocalStorageStore;
})();
