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
  }

  get isExternal() {
    return this._SNAPEnvironment.platform !== 'web';
  }

  navigated(url) {
    this.onNavigated.dispatch(url);

    let host = URI(url).hostname();

    if (this._localHosts.indexOf(host) === -1) {
      this._AnalyticsModel.logUrl(url);
    }
  }

  open(url) {
    if (this.isExternal) {
      this._ManagementService.openBrowser(url);
    }

    this.onOpen.dispatch(url);
    this._browserOpened = true;
  }

  close() {
    if (this._browserOpened) {
      if (this.isExternal) {
        this._ManagementService.closeBrowser();
      }

      this.onClose.dispatch();
      this._browserOpened = false;
    }
  }

  getAppUrl(url) {
    var host = this.$$window.location.protocol + '//' + this.$$window.location.hostname +
      (this.$$window.location.port ? ':' + this.$$window.location.port: '');
    return host + url;
  }
};
