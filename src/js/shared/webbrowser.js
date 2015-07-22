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

  open(url) {
    var self = this;

    return this._ManagementService.openBrowser(url, this._browser).then(browser => {
      self._browser = browser;
      self.onOpen.dispatch(url, self._browser);
      self._browserOpened = true;

      self._browser.onNavigated.add(url => {
        self.onNavigated.dispatch(url);

        let host = URI(url).hostname();

        if (self._localHosts.indexOf(host) === -1) {
          self._AnalyticsModel.logUrl(url);
        }
      });
      self._browser.onExit.addOnce(() => {
        self.onClose.dispatch();
        self._browserOpened = false;
        self._browser = null;
      });

      return browser;
    });
  }

  close() {
    var self = this;

    if (!this._browserOpened) {
      return Promise.resolve();
    }

    return this._ManagementService.closeBrowser(this._browser).then(() => {
      self._browser = null;
      self.onClose.dispatch();
      self._browserOpened = false;
    });
  }

  getAppUrl(url) {
    var host = this.$$window.location.protocol + '//' + this.$$window.location.hostname +
      (this.$$window.location.port ? ':' + this.$$window.location.port: '');
    return host + url;
  }
};
