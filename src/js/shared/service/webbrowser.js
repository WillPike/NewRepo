window.app.WebBrowser = class WebBrowser {
  /* global signals, URI */

  constructor(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
    this._AnalyticsModel = AnalyticsModel;
    this._ManagementService = ManagementService;
    this._SNAPEnvironment = SNAPEnvironment;

    this._localHosts = Object.keys(SNAPHosts).map(p => SNAPHosts[p].host);
    this._localHosts.push('localhost');

    this.onOpened = new signals.Signal();
    this.onClosed = new signals.Signal();
    this.onNavigated = new signals.Signal();

    this._browser = null;
  }

  open(url) {
    if (this._browser) {
      this._browser.navigate(url);
      return Promise.resolve(this._browser);
    }

    var self = this;
    return this._ManagementService.openBrowser(url).then(browser => {
      self._browser = browser;
      self.onOpened.dispatch(self._browser);

      self._browser.onNavigated.add(url => {
        self.onNavigated.dispatch(url);

        let host = URI(url).hostname();

        if (self._localHosts.indexOf(host) === -1) {
          self._AnalyticsModel.logUrl(url);
        }
      });

      self._browser.onExit.addOnce(() => {
        self.onClosed.dispatch();
        self._browser = null;
      });

      return browser;
    });
  }

  close() {
    if (!this._browser) {
      return Promise.resolve();
    }

    var self = this;
    return this._ManagementService.closeBrowser(this._browser).then(() => {
      self._browser = null;
      self.onClosed.dispatch();
    });
  }
};
