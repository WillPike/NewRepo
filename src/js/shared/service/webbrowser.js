window.app.WebBrowser = class WebBrowser {
  /* global signals, URI */

  constructor(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
    this._AnalyticsModel = AnalyticsModel;
    this._ManagementService = ManagementService;
    this._SNAPEnvironment = SNAPEnvironment;

    this._localHosts = Object.keys(SNAPHosts)
      .map(p => SNAPHosts[p].host)
      .filter(h => Boolean(h));
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

    return new Promise((resolve, reject) => {
      this._ManagementService.openBrowser(url).then(browser => {
        this._browser = browser;
        this.onOpened.dispatch(this._browser);

        this._browser.onNavigated.add(url => {
          this.onNavigated.dispatch(url);

          let host = URI(url).hostname();

          if (this._localHosts.indexOf(host) === -1) {
            this._AnalyticsModel.logUrl(url);
          }
        });

        this._browser.onExit.addOnce(() => {
          this.onClosed.dispatch();
          this._browser = null;
        });

        resolve(browser);
      }, reject);
    });
  }

  close() {
    if (!this._browser) {
      return Promise.resolve();
    }

    return this._ManagementService.closeBrowser(this._browser).then(() => {
      this._browser = null;
      this.onClosed.dispatch();
    });
  }

  getFlashUrl(url, width, height) {
    return `flash.html#media=${encodeURIComponent(url)}` +
      `&width=${encodeURIComponent(width)}` +
      `&height=${encodeURIComponent(height)}`;
  }

  isPrivateUrl(url) {
    return !url.startsWith('http') || this._localHosts.indexOf(URI(url).hostname()) !== -1;
  }
};
