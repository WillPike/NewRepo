window.app.DataManager = class DataManager {
  /* global signals */

  constructor(DataProvider, Logger, SNAPEnvironment) {
    this._DataProvider = DataProvider;
    this._Logger = Logger;
    this._SNAPEnvironment = SNAPEnvironment;

    this.homeChanged = new signals.Signal();
    this.menuChanged = new signals.Signal();
    this.categoryChanged = new signals.Signal();
    this.itemChanged = new signals.Signal();

    this._CACHEABLE_MEDIA_KINDS = [
      41, 51, 58, 61
    ];
  }

  get provider() {
    return this._DataProvider;
  }

  initialize() {
    var self = this;
    this._cache = {
      menu: {},
      category: {},
      item: {},
      media: {}
    };

    this._Logger.debug('Initializing data manager.');

    this.provider.digest().then(digest => {
      var menuSets = digest.menu_sets.map(menu => {
        return new Promise((resolve, reject) => {
          self.provider.menu(menu.token)
            .then(data => self._cache.menu[menu.token] = self._filterMenu(data))
            .then(resolve, resolve);
        });
      });

      var menuCategories = digest.menu_categories.map(category => {
        return new Promise((resolve, reject) => {
          self.provider.category(category.token)
            .then(data => self._cache.category[category.token] = self._filterCategory(data))
            .then(resolve, resolve);
        });
      });

      var menuItems = digest.menu_items.map(item => {
        return new Promise((resolve, reject) => {
          self.provider.item(item.token)
            .then(data => self._cache.item[item.token] = data)
            .then(resolve, resolve);
        });
      });

      var medias = digest.media
        .filter(media => self._CACHEABLE_MEDIA_KINDS.indexOf(media.kind) !== -1)
        .map(media => {
          var width, height;

          switch (media.kind) {
            case 41:
            case 51:
              width = 370;
              height = 370;
              break;
            case 58:
              width = 600;
              height = 600;
              break;
            case 61:
              width = 100;
              height = 100;
              break;
          }

          media.width = width;
          media.height = height;

          return media;
        })
        .map(media => {
          return new Promise((resolve, reject) => {
            self.provider.media(media)
              .then(img => self._cache.media[media.token] = img)
              .then(resolve, resolve);
          });
        });

      self._Logger.debug(`Digest contains ${menuSets.length} menus, ` +
        `${menuCategories.length} categories, ` +
        `${menuItems.length} items and ` +
        `${medias.length} files.`);

      var tasks = []
        .concat(menuSets)
        .concat(menuCategories)
        .concat(menuItems);

      Promise.all(tasks).then(() => {
        Promise.all(medias);
      });
    });
  }

  get home() { return this._home; }
  set home(value) {
    if (this._home === value) {
      return;
    }

    if (value) {
      var self = this;
      this._home = value;
      this.provider.home().then(home => {
        if (self._home) {
          home = self._filterHome(home);
          self.homeChanged.dispatch(home);
        }
      });
    }
    else {
      this._home = undefined;
      this.homeChanged.dispatch(undefined);
    }
  }

  get menu() { return this._menu; }
  set menu(value) {
    if (this._menu === value) {
      return;
    }

    if (value) {
      var self = this;
      this._menu = value;

      var data = this._cached('menu', value);

      if (data) {
        return this.menuChanged.dispatch(data);
      }

      this.provider.menu(value).then(menu => {
        if (self._menu) {
          menu = self._filterMenu(menu);
          self.menuChanged.dispatch(menu);
        }
      });
    }
    else {
      this._menu = undefined;
      this.menuChanged.dispatch(undefined);
    }
  }

  get category() { return this._category; }
  set category(value) {
    if (this._category === value) {
      return;
    }

    if (value) {
      var self = this;
      this._category = value;

      var data = this._cached('category', value);

      if (data) {
        return this.categoryChanged.dispatch(data);
      }

      this.provider.category(value).then(category => {
        if (self._category) {
          category = self._filterCategory(category);
          self.categoryChanged.dispatch(category);
        }
      });
    }
    else {
      this._category = undefined;
      this.categoryChanged.dispatch(undefined);
    }
  }

  get item() { return this._item; }
  set item(value) {
    if (this._item === value) {
      return;
    }

    if (value) {
      var self = this;
      this._item = value;

      var data = this._cached('item', value);

      if (data) {
        return this.itemChanged.dispatch(data);
      }

      this.provider.item(value).then(item => {
        if (self._item) {
          self.itemChanged.dispatch(item);
        }
      });
    }
    else {
      this._item = undefined;
      this.itemChanged.dispatch(undefined);
    }
  }

  _cached(group, id) {
    if (!this._cache) {
      return null;
    }

    if (id && this._cache[group] && this._cache[group][id]) {
      return this._cache[group][id];
    }
    else if (!id && this._cache[group]) {
      return this._cache[group];
    }

    return null;
  }

  _filterHome(data) {
    var self = this;
    data.menus = data.menus
      .filter(menu => self._SNAPEnvironment.platform === 'desktop' || menu.type !== 3);

    return data;
  }

  _filterMenu(data) {
    return data;
  }

  _filterCategory(data) {
    var self = this;
    data.items = data.items
      .filter(item => self._SNAPEnvironment.platform === 'desktop' || item.type !== 3);

    return data;
  }
};
