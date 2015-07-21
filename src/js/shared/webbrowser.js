window.app.WebBrowser = class WebBrowser {
  /* global signals, URI */

  constructor($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
    this.$$window = $window;
    this._AnalyticsModel = AnalyticsModel;
    this._ManagementService = ManagementService;
    this._SNAPEnvironment = SNAPEnvironment;

    this._localHosts = Object.keys(SNAPHosts).map(p => SNAPHosts[p].host);
    this._localHosts.push('localhost');

    this.onOpen = new signals.Signal();
    this.onClose = new signals.Signal();
    this.onNavigated = new signals.Signal();

    this._browser = null;
  }

  get isExternal() {
    return this._ManagementService.isExternalBrowser;
  }

  navigated(url) {
    this.onNavigated.dispatch(url);

    let host = URI(url).hostname();

    if (this._localHosts.indexOf(host) === -1) {
      this._AnalyticsModel.logUrl(url);
    }
  }

  open(url) {
    var self = this;

    if (this.isExternal) {
      return this._ManagementService.openBrowser(url, this._browser).then(browser => {
        self._browser = browser;
        self.onOpen.dispatch(url, self._browser);
        self._browserOpened = true;

        self._browser.onNavigated.add(url => {
          self.onNavigated.dispatch();
          self._browserOpened = false;
          self._browser = null;
        });
        self._browser.onExit.addOnce(() => {
          self.onClose.dispatch();
          self._browserOpened = false;
          self._browser = null;
        });

        return browser;
      });
    }

    this.onOpen.dispatch(url, null);
    this._browserOpened = true;

    return Promise.resolve(null);
  }

  close() {
    var self = this;

    if (this._browserOpened) {
      if (this.isExternal) {
        return this._ManagementService.closeBrowser(this._browser).then(() => {
          self._browser = null;
          self.onClose.dispatch();
          self._browserOpened = false;
        });
      }

      this.onClose.dispatch();
      this._browserOpened = false;
    }

    return Promise.resolve();
  }

  getAppUrl(url) {
    var host = this.$$window.location.protocol + '//' + this.$$window.location.hostname +
      (this.$$window.location.port ? ':' + this.$$window.location.port: '');
    return host + url;
  }
};
