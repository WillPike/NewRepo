window.app.WebBrowser = class WebBrowser {
  /* global signals, URI */

  constructor(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
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

  open(url, options) {
    var self = this;

    return this._ManagementService.openBrowser(url, this._browser, options).then(browser => {
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

  //-----------------------------------------------
  //    External methods
  //-----------------------------------------------

  navigated(url) {
    if (this._browser) {
      this._browser.onNavigated.dispatch(url);
    }
  }

  callback(data) {
    if (this._browser) {
      this._browser.onCallback.dispatch(data);
    }

    this.close();
  }
};
