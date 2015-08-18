window.app.DataManager = class DataManager extends app.AbstractManager {
  /* global signals */

  constructor(DataModel, Logger, SNAPEnvironment) {
    super(Logger);

    this._DataModel = DataModel;
    this._SNAPEnvironment = SNAPEnvironment;

    this.homeChanged = new signals.Signal();
    this.menuChanged = new signals.Signal();
    this.categoryChanged = new signals.Signal();
    this.itemChanged = new signals.Signal();

    this._CACHEABLE_MEDIA_KINDS = [
      11, 41, 51, 58, 61
    ];
  }

  get model() {
    return this._DataModel;
  }

  initialize() {
    super.initialize();

    return new Promise((resolve, reject) => {
      this.model.digest().then(digest => {
        this._loadContent(digest, false).then(resolve, e => {
          this._Logger.warn(`Error loading cached content: ${e}`);
          reject(e);
        });
      }, e => {
        this._Logger.warn(`Unable to load cached content digest. An update is required.`);
        resolve('nodigest');
      });
    });
  }

  fetchContent() {
    this._Logger.debug('Loading application content...');

    return this.model.digest(true).then(digest => {
      return this._loadContent(digest, true);
    });
  }

  fetchMedia() {
    this._Logger.debug('Loading media content...');

    return this.model.digest().then(digest => {
      var medias = (digest.media || [])
        .filter(media => this._CACHEABLE_MEDIA_KINDS.indexOf(media.kind) !== -1)
        .map(media => {
          var width, height;

          switch (media.kind) {
            case 11:
              width = 1920;
              height = 1080;
              break;
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
        .map(media => this.model.media(media, true));

      this._Logger.debug(`Digest contains ${medias.length} media files, preloading...`);

      return Promise.all(medias);
    });
  }

  get home() { return this._home; }
  set home(value) {
    if (this._home === value) {
      return;
    }

    if (value) {
      this._home = value;
      this.model.home().then(home => {
        if (this._home) {
          home = this._filterHome(home);
          this.homeChanged.dispatch(home);
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
      this._menu = value;

      this.model.menu(value).then(menu => {
        if (this._menu) {
          menu = this._filterMenu(menu);
          this.menuChanged.dispatch(menu);
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
      this._category = value;

      this.model.category(value).then(category => {
        if (this._category) {
          category = this._filterCategory(category);
          this.categoryChanged.dispatch(category);
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
      this._item = value;

      this.model.item(value).then(item => {
        if (this._item) {
          this.itemChanged.dispatch(item);
        }
      });
    }
    else {
      this._item = undefined;
      this.itemChanged.dispatch(undefined);
    }
  }

  _filterHome(data) {
    data.menus = data.menus
      .filter(menu => this._SNAPEnvironment.platform === 'desktop' || menu.type !== 3);

    return data;
  }

  _filterMenu(data) {
    return data;
  }

  _filterCategory(data) {
    data.items = data.items
      .filter(item => this._SNAPEnvironment.platform === 'desktop' || item.type !== 3);

    return data;
  }

  _loadContent(digest, fetch) {
    var menuSets = (digest.menu_sets || []).map(m => this.model.menu(m.token, fetch));
    var menuCategories = (digest.menu_categories || []).map(c => this.model.category(c.token, fetch));
    var menuItems = (digest.menu_items || []).map(i => this.model.item(i.token, fetch));

    this._Logger.debug(`Digest contains ${menuSets.length} menus, ` +
      `${menuCategories.length} categories and ` +
      `${menuItems.length} items, ${fetch ? 'updating from server' : 'loading from cache'}...`);

    var tasks = [
      this.model.home(fetch),
      this.model.advertisements(fetch),
      this.model.backgrounds(fetch),
      this.model.elements(fetch),
      this.model.surveys(fetch)
    ]
      .concat(menuSets)
      .concat(menuCategories)
      .concat(menuItems);

    return Promise.all(tasks);
  }
};
