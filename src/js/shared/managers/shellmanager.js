window.app.ShellManager = class ShellManager extends app.AbstractManager {
  constructor(DataModel, LocationModel, ShellModel, SNAPLocation, Environment, Hosts, Logger) {
    super(Logger);

    this._DataModel = DataModel;
    this._LocationModel = LocationModel;
    this._ShellModel = ShellModel;
    this._SNAPLocation = SNAPLocation;
    this._Environment = Environment;
    this._Hosts = Hosts;

    this.locale = this._LocationModel.location.locale;
    this._LocationModel.locationChanged.add(location => {
      this.locale = location.locale;
    });
  }

  get locale() {
    return this._locale;
  }

  set locale(value) {
    if (this._locale === value) {
      return;
    }
    this._locale = value;

    var format = '{0}',
        currency = '';

    switch (this._locale) {
      case 'ro_MD':
        format = '{0} Lei';
        currency = '';
        break;
      case 'zh_MO':
        format = 'MOP$ {0}';
        currency = '';
        break;
      case 'en_US':
        format = '${0}';
        currency = 'USD';
        break;
    }

    this._ShellModel.priceFormat = format;
    this._ShellModel.currency = currency;
  }

  get model() {
    return this._ShellModel;
  }

  initialize() {
    super.initialize();

    var self = this;

    var taskBackgrounds = this._DataModel.backgrounds().then(function(response) {
      self._ShellModel.backgrounds = response.main.map(function(item){
        return {
          media: item.src
        };
      });

      self._ShellModel.screensavers = response.screensaver.map(function(item){
        return {
          media: item.src
        };
      });

      self._ShellModel.pageBackgrounds = response.pages.map(function(item){
        return {
          media: item.background.src,
          destination: item.destination
        };
      });
    });

    var taskElements = this._DataModel.elements().then(function(response) {
      var layout = self._SNAPLocation.theme.layout;

      var elements = {};

      switch (layout) {
        case 'classic':
          elements = {
            'button_home': self.getAssetUrl('images/button-home.png'),
            'button_back': self.getAssetUrl('images/button-back.png'),
            'button_cart': self.getAssetUrl('images/button-cart.png'),
            'button_rotate': self.getAssetUrl('images/button-rotate.png'),
            'button_waiter': self.getAssetUrl('images/button-assistance.png'),
            'button_check': self.getAssetUrl('images/button-closeout.png'),
            'button_survey': self.getAssetUrl('images/button-survey.png'),
            'button_chat': self.getAssetUrl('images/button-chat.png')
          };
          break;
        case 'galaxies':
          elements = {
            'button_back': self.getAssetUrl('images/button-back.png'),
            'button_rotate': self.getAssetUrl('images/button-rotate.png'),
            'button_settings': self.getAssetUrl('images/button-settings.png'),
            'location_logo': self.getAssetUrl('images/button-logo.png'),
          };
          break;
      }

      for (var i = 0; i < response.elements.length; i++) {
        let element = response.elements[i];
        elements[element.slot] = element.src;
      }

      self._ShellModel.elements = elements;
    });

    return Promise.all([
      taskBackgrounds,
      taskElements
    ]);
  }

  formatPrice(price) {
    return this._ShellModel.priceFormat.replace(/{(\d+)}/g, () => price.toFixed(2));
  }

  getPageBackgrounds(location) {
    return this._ShellModel.pageBackgrounds.filter(item => {
      return item.destination.type === location.type &&
        (item.destination.token === location.token && location.token ||
         item.destination.url === location.url && location.url);
    });
  }

  getAssetUrl(file) {
    var path = this._DataModel.getPath(this._Hosts.static);

    return `${path}assets/${this._SNAPLocation.theme.layout}/${file}`;
  }

  getPartialUrl(name) {
    return this.getAssetUrl(`partials/${name}.html`);
  }

  getMediaUrl(...args) {
    return this._DataModel.getMediaUrl(...args);
  }

  getMediaType(...args) {
    return this._DataModel.getMediaType(...args);
  }

  get tileStyle() {
    var style = 'tile';

    switch (this._SNAPLocation.theme.tiles_style) {
      case 'regular':
        style += ' tile-regular';
        break;
    }
    //style += ' tile-regular';
    return style;
  }

  get predicateEven() {
    var index = 0;
    return () => index++ % 2 === 1;
  }

  get predicateOdd() {
    var index = 0;
    return () => index++ % 2 === 0;
  }
};
