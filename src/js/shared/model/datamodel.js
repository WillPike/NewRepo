window.app.DataModel = class DataModel extends app.AbstractModel {
  constructor(config, service, storageProvider, SNAPHosts) {
    super(storageProvider);

    this._config = config;
    this._service = service;
    this._cache = {};
    this._storageProvider = storageProvider;
    this._SNAPHosts = SNAPHosts;

    this._defineProperty('menuMap', 'snap_menumap', {});

    this.initialize();
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

  media(m) {
    var token = `${m.token}_${m.width}_${m.height}`;
    return this._cached('media', token) || new Promise((resolve, reject) => {
      if (navigator.onLine === false) {
        reject(`Application is offline, unable to load media ${token}`);
      }

      if (m.width && m.height) {
        var src = this._getMediaUrl(m, m.width, m.height, m.extension);

        if (!src) {
          reject('Invalid media URL');
        }

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
      $.get(`${this._SNAPHosts.static.path}assets/${layout}/manifest.json`, function(data, status) {
        if (status !== 'success') {
          return reject(`Manifest load error: ${status}`);
        }

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          }
          catch (e) {
            reject(e);
          }
        }

        resolve(data);
      });
    });
  }

  asset(url) {
    var self = this;
    url = this._SNAPHosts.static.path + url;
    return this._cached('asset', url) || new Promise((resolve, reject) => {
      if (navigator.onLine === false) {
        reject(`Application is offline, unable to load media ${token}`);
      }

      $.get(url, function(data, status) {
        if (status !== 'success') {
          return reject(`URL load error: ${status}`);
        }

        self._store(data, 'asset', url);
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

    if (group !== 'asset' && group !== 'media') {
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
