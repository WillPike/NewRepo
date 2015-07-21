window.app.WebBrowserReference = class WebBrowserReference {
  constructor(browserRef) {
    this.browser = browserRef;
    this.onNavigated = new signals.Signal();
    this.onExit = new signals.Signal();
  }

  exit() {
    this.onExit.dispatch();
  }
};


window.app.CordovaWebBrowserReference = class CordovaWebBrowserReference extends app.WebBrowserReference {
  constructor(browserRef) {
    super(browserRef);
    var self = this;

    function onLoadStart(event) {
      self.onNavigated.dispatch(event.url);
    }
    this._onLoadStart = onLoadStart;

    function onExit() {
      browserRef.removeEventListener('loadstart', onLoadStart);
      browserRef.removeEventListener('exit', onExit);
      self.onExit.dispatch();
    }
    this._onExit = onExit;

    this.browser.addEventListener('loadstart', onLoadStart);
    this.browser.addEventListener('exit', onExit);
  }

  exit() {
    super.exit();

    this._dispose();
    this.browser.close();
  }

  _dispose() {
    this.onNavigated.dispose();
    this.onExit.dispose();

    this.browser.removeEventListener('loadstart', this._onLoadStart);
    this.browser.removeEventListener('exit', this._onExit);
  }
};
