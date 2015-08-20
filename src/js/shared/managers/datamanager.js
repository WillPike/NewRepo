window.app.DataManager = class DataManager extends app.AbstractManager {
  /* global signals */

  constructor(DataModel, Logger, SNAPEnvironment, SNAPLocation) {
    super(Logger);

    this._DataModel = DataModel;
    this._SNAPEnvironment = SNAPEnvironment;
    this._SNAPLocation = SNAPLocation;

    this.homeChanged = new signals.Signal();
    this.menuChanged = new signals.Signal();
    this.categoryChanged = new signals.Signal();
    this.itemChanged = new signals.Signal();

    this.homeChanged.add(value => this._home = value);
    this.menuChanged.add(value => this._menu = value);
    this.categoryChanged.add(value => this._category = value);
    this.itemChanged.add(value => this._item = value);

    this._CACHEABLE_MEDIA_KINDS = [
      app.MediaKind.advertisementimage,
      app.MediaKind.backgroundimage,
      app.MediaKind.elementimage,
      app.MediaKind.menuimage,
      app.MediaKind.menucategoryimage,
      app.MediaKind.menuitemimage,
      app.MediaKind.menuitemphoto,
      app.MediaKind.modifierimage,
      app.MediaKind.promoimage
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

    return new Promise((resolve, reject) => {
      this.model.digest(true).then(digest => {
        this._loadContent(digest, true)
          .then(() => resolve(), reject);
      }, reject);
    });
  }

  fetchMedia() {
    this._Logger.debug('Loading media content...');

    var layout = this._SNAPLocation.theme.layout;

    return new Promise((resolve, reject) => {
      this.model.digest().then(digest => {
        this.model.advertisements().then(advertisements => {
          var ads = {
            main: advertisements.main.reduce(this._reduceAd, {}),
            misc: advertisements.misc.reduce(this._reduceAd, {})
          };

          var medias = (digest.media || [])
            .filter(media => this._CACHEABLE_MEDIA_KINDS.indexOf(media.kind) !== -1)
            .map(media => {
              var width, height;

              switch (media.kind) {
                case app.MediaKind.advertisementimage:
                  if (ads.main[media.token]) {
                    width = 970;
                    height = 90;
                  }
                  else if (ads.misc[media.token]) {
                    width = 300;
                    height = 250;
                  }
                  break;
                case app.MediaKind.backgroundimage:
                  width = 1920;
                  height = 1080;
                  break;
                case app.MediaKind.elementimage:
                  if (layout === 'classic') {
                    width = 160;
                    height = 160;
                  }
                  else if (layout === 'galaxies') {
                    width = 100;
                    height = 100;
                  }
                  break;
                case app.MediaKind.menuimage:
                  if (layout === 'classic') {
                    width = 160;
                    height = 160;
                  }
                  else if (layout === 'galaxies') {
                    width = 470;
                    height = 410;
                  }
                  break;
                case app.MediaKind.menucategoryimage:
                case app.MediaKind.menuitemimage:
                  if (layout === 'classic') {
                    width = 370;
                    height = 370;
                  }
                  else if (layout === 'galaxies') {
                    width = 470;
                    height = 410;
                  }
                  break;
                case app.MediaKind.menuitemphoto:
                  if (layout === 'classic') {
                    width = 600;
                    height = 600;
                  }
                  else if (layout === 'galaxies') {
                    width = 470;
                    height = 410;
                  }
                  break;
                case app.MediaKind.modifierimage:
                  width = 100;
                  height = 100;
                  break;
                case app.MediaKind.promoimage:
                  if (layout === 'classic') {
                    width = 160;
                    height = 160;
                  }
                  break;
              }

              media.width = width;
              media.height = height;

              return media;
            })
            .filter(media => media.width && media.height);

          var table = {};
          medias = medias.reduce((unique, media) => {
            var key = `${media.token}_${media.width}_${media.height}`;

            if (!table.hasOwnProperty(key)) {
              unique.push(media);
              table[key] = true;
            }

            return unique;
          }, []);

          this._Logger.debug(`Digest contains ${medias.length} media files, preloading...`);

          let mediaTasks = medias.map(m => this.model.media(m, true));

          this.model.assetsDigest(layout).then((data) => {
            var assetsTasks = [
              data.images.map(i => this.model.url(i)),
              data.partials.map(i => this.model.url(i))
            ];

            Promise.all(assetsTasks.concat(mediaTasks)).then(resolve, reject);
          }, e => {
            reject(e);
          });
        });
      });
    });
  }

  get home() { return this._home; }
  set home(value) {
    if (this._home === value) {
      return;
    }

    if (value) {
      this.model.home().then(home => {
        this.homeChanged.dispatch(this._filterHome(home));
      });
    }
    else {
      this.homeChanged.dispatch(undefined);
    }
  }

  get menu() { return this._menu; }
  set menu(value) {
    if (this._menu === value) {
      return;
    }

    if (value) {
      this.model.menu(value).then(menu => {
        this.menuChanged.dispatch(this._filterMenu(menu));
      });
    }
    else {
      this.menuChanged.dispatch(undefined);
    }
  }

  get category() { return this._category; }
  set category(value) {
    if (this._category === value) {
      return;
    }

    if (value) {
      this.model.category(value).then(category => {
        this.categoryChanged.dispatch(this._filterCategory(category));
      });
    }
    else {
      this.categoryChanged.dispatch(undefined);
    }
  }

  get item() { return this._item; }
  set item(value) {
    if (this._item === value) {
      return;
    }

    if (value) {
      this.model.item(value).then(item => {
        this.itemChanged.dispatch(item);
      });
    }
    else {
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

  _reduceAd(result, item) {
    result[item.src] = item;
    return result;
  }
};
