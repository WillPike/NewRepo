window.app.DataProvider = class DataProvider {
  constructor(config, service) {
    this._config = config;
    this._service = service;
    this._cache = {};
  }

  clear() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._cache = {};
      resolve();
    });
  }

  digest() {
    return this._getSnapData('digest', 'getDigest');
  }

  home() {
    return this._getSnapData('home', 'getMenus');
  }

  advertisements() {
    return this._getSnapData('advertisements', 'getAdvertisements');
  }

  backgrounds() {
    return this._getSnapData('backgrounds', 'getBackgrounds');
  }

  elements() {
    return this._getSnapData('elements', 'getElements');
  }

  menu(id) {
    return this._getSnapData('menu', 'getMenu', id);
  }

  category(id) {
    return this._getSnapData('category', 'getMenuCategory', id);
  }

  item(id) {
    return this._getSnapData('item', 'getMenuItem', id);
  }

  surveys() {
    return this._getSnapData('surveys', 'getSurveys');
  }

  seats() {
    var self = this;
    return this._cached('seats') || this._service.location.getSeats().then(data => {
      data = data || [];
      self._store(data, 'seats');
      return data;
    }, this._onError);
  }

  media(media) {
    var self = this,
        token = media.token + '_' + media.width + '_' + media.height;
    return this._cached('media', token) || new Promise((resolve, reject) => {
      if (media.width && media.height) {
        var img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = self._getMediaUrl(media, media.width, media.height, media.extension);

        self._store(img, 'media', token);

        if (img.complete) {
          resolve(img);
        }
      }
      else {
        reject('Missing image dimensions');
      }
    }, this._onError);
  }

  _getSnapData(name, method, id) {
    var self = this;
    return this._cached(name, id) || this._service.snap[method](this._config.location, id).then(data => {
      data = data || [];
      self._store(data, name, id);
      return data;
    }, this._onError);
  }

  _onError(e) {
    console.error(e.message);
    return e;
  }

  _cached(group, id) {
    if (id && this._cache[group] && this._cache[group][id]) {
      return Promise.resolve(this._cache[group][id]);
    }
    else if (!id && this._cache[group]) {
      return Promise.resolve(this._cache[group]);
    }

    return null;
  }

  _store(data, group, id) {
    if (id) {
      if (!this._cache[group]) {
        this._cache[group] = {};
      }

      this._cache[group][id] = data;
    }
    else {
      this._cache[group] = data;
    }
  }

  _getMediaUrl() {

  }
};
