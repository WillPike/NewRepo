(function() {

  //------------------------------------------------------------------------
  //
  //  Store
  //
  //------------------------------------------------------------------------

  var Store = function() {
    this._storage = null;
  };

  window.app.Store = Store;

  Store.prototype.clear = function() {
    this._storage = null;
    return Promise.resolve();
  };

  Store.prototype.read = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      resolve(self._storage);
    });
  };

  Store.prototype.write = function(value) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self._storage = value;
      resolve();
    });
  };
})();
