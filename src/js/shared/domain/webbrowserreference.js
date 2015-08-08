window.app.WebBrowserReference = class WebBrowserReference {
  constructor(type, initialUrl) {
    this.type = type;
    this._initialUrl = this._url = initialUrl;

    this.onNavigated = new signals.Signal();
    this.onExit = new signals.Signal();

    this.onNavigated.add(url => this._url = url);
  }

  attach(reference) {
    if (this._reference) {
      throw new Error('Web browser reference is already attached.');
    }

    this._reference = reference;
  }

  get url() {
    return this._url;
  }

  navigate(url) {
    this.onNavigated.dispatch(url);
  }

  exit() {
    this.onExit.dispatch();

    this.onNavigated.dispose();
    this.onExit.dispose();
  }
};

window.app.IframeWebBrowserReference = class IframeWebBrowserReference extends app.WebBrowserReference {
  constructor(initialUrl) {
    super('iframe', initialUrl);
  }

  attach(reference) {
    super.attach(reference);

    var self = this;

    function onLoad(e) {
      self.onNavigated.dispatch(e.url);
    }

    this._onLoad = onLoad;

    this._reference.addEventListener('loadstart', this._onLoad);

    this._reference.src = this._initialUrl;
  }

  exit() {
    super.exit();

    if (this._reference) {
      this._reference.removeEventListener('loadstart', this._onLoad);

      this._reference.src = 'about:blank';
    }

    this._reference = null;
  }
};

window.app.WebViewBrowserReference = class WebViewBrowserReference extends app.WebBrowserReference {
  constructor(initialUrl) {
    super('webview', initialUrl);
  }

  attach(reference) {
    super.attach(reference);

    var self = this;

    function onLoad(e) {
      self.onNavigated.dispatch(self._reference.getUrl());
    }

    this._onLoad = onLoad;

    this._reference.addEventListener('did-stop-loading', this._onLoad);

    this._reference.src = this._initialUrl;
  }

  exit() {
    super.exit();

    if (this._reference) {
      this._reference.removeEventListener('did-stop-loading', this._onLoad);

      this._reference.src = 'about:blank';
    }

    this._reference = null;
  }
};

window.app.CordovaWebBrowserReference = class CordovaWebBrowserReference extends app.WebBrowserReference {
  constructor(initialUrl) {
    super('external', initialUrl);
  }

  attach(reference) {
      super.attach(reference);

      var self = this;

      function onLoadStart(e) {
        self.onNavigated.dispatch(e.url);
      }

      function onExit() {
        self.exit();
      }

      this._onLoadStart = onLoadStart;
      this._onExit = onExit;

      this._reference.addEventListener('loadstart', this._onLoadStart);
      this._reference.addEventListener('exit', this._onExit);

      this.onNavigated.dispatch(this._initialUrl);
  }

  exit() {
    super.exit();

    if (this._reference) {
      this._reference.removeEventListener('loadstart', this._onLoadStart);
      this._reference.removeEventListener('exit', this._onExit);

      this._reference.close();
    }

    this._reference = null;
  }
};
