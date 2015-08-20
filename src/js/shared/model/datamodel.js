window.app.DataModel = class DataModel {
  constructor(config, service, storageProvider) {
    this._config = config;
    this._service = service;
    this._cache = {};
    this._storageProvider = storageProvider;
  }

  clear() {
    return new Promise(resolve => {
      this._cache = {};
      resolve();
    });
  }

  digest(fetch) {
    return this._getSnapData('digest', 'getDigest', undefined, fetch);
  }

  home(fetch) {
    return this._getSnapData('home', 'getMenus', undefined, fetch);
  }

  advertisements(fetch) {
    return this._getSnapData('advertisements', 'getAdvertisements', undefined, fetch);
  }

  backgrounds(fetch) {
    return this._getSnapData('backgrounds', 'getBackgrounds', undefined, fetch);
  }

  elements(fetch) {
    return this._getSnapData('elements', 'getElements', undefined, fetch);
  }

  menu(id, fetch) {
    return this._getSnapData('menu', 'getMenu', id, fetch);
  }

  category(id, fetch) {
    return this._getSnapData('category', 'getMenuCategory', id, fetch);
  }

  item(id, fetch) {
    return this._getSnapData('item', 'getMenuItem', id, fetch);
  }

  surveys(fetch) {
    return this._getSnapData('surveys', 'getSurveys', undefined, fetch);
  }

  media(media) {
    var token = `${media.token}_${media.width}_${media.height}`;
    return this._cached('media', token) || new Promise((resolve, reject) => {
      if (navigator.onLine === false) {
        reject(`Application is offline, unable to load media ${token}`);
      }

      if (media.width && media.height) {
        var src = this._getMediaUrl(media, media.width, media.height, media.extension);

        var img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;

        this._store(img, 'media', src);

        if (img.complete) {
          resolve(img);
        }
      }
      else {
        reject('Missing image dimensions');
      }
    });
  }

  assetsDigest(layout) {
    return new Promise((resolve, reject) => {
      $.get(`assets/${layout}/manifest.json`, function(data, status) {
        if (status !== 'success') {
          return reject(`Manifest load error: ${status}`);
        }
        resolve(data);
      });
    });
  }

  url(url) {
    var self = this;
    return this._cached('url', url) || new Promise((resolve, reject) => {
      if (navigator.onLine === false) {
        reject(`Application is offline, unable to load media ${token}`);
      }

      $.get(url, function(data, status) {
        if (status !== 'success') {
          return reject(`URL load error: ${status}`);
        }

        self._store(data, 'url', url);
        resolve(data);
      });
    });
  }

  _getSnapData(name, method, id, fetch) {
    if (fetch) {
      return this._service.snap[method](this._config.location, id).then(data => {
        data = data || [];
        this._store(data, name, id);
        return data;
      });
    }

    let cached = this._cached(name, id);

    if (cached) {
      return Promise.resolve(cached);
    }

    let stored = this._stored(name, id);

    if (stored) {
      return Promise.resolve(stored);
    }

    return Promise.reject(`Content is not available: /${name}/${id || ''}`);
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

    if (group !== 'media' && group !== 'url') {
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
