window.app.DataModel = class DataModel {
  constructor(config, service, storageProvider) {
    this._config = config;
    this._service = service;
    this._cache = {};
    this._storageProvider = storageProvider;
  }

  clear() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._cache = {};
      resolve();
    });
  }

  digest() {
    return this._service.snap.getDigest(this._config.location);
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
    });
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
    });
  }

  _getSnapData(name, method, id) {
    var cached = this._cached(name, id);

    if (cached) {
      return Promise.resolve(cached);
    }

    if (navigator.onLine === false) {
      var stored = this._stored(name, id);

      if (stored) {
        return Promise.resolve(stored);
      }
      else {
        return Promise.reject(`Data is not available: /${name}/${id}`);
      }
    }

    return this._service.snap[method](this._config.location, id).then(data => {
      data = data || [];
      this._store(data, name, id);
      return data;
    });
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

  _stored(group, id) {
    let storage = this._getStorage(group, id);

    return storage.readSync();
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

    if (group !== 'media') {
      let storage = this._getStorage(group, id);
      storage.write(data);
    }
  }

  _getStorage(group, id) {
    if (id) {
      return this._storageProvider(`snap_cache_${group}_${id}`);
    }

    return this._storageProvider(`snap_cache_${group}`);
  }

  _getMediaUrl() {

  }
};
