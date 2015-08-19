window.app.WebBrowserReference = class WebBrowserReference {
  constructor(type, initialUrl) {
    this.type = type;
    this._initialUrl = this._url = initialUrl;

    this.onNavigated = new signals.Signal();
    this.onExit = new signals.Signal();

    this.onNavigated.add(url => this._url = url);
  }

  attach(reference) {
    if (this._disposed) {
      throw new Error('Web browser reference is already disposed.');
    }

    if (this._reference) {
      throw new Error('Web browser reference is already attached.');
    }

    this._reference = reference;
  }

  get url() {
    return this._url;
  }

  navigate(url) {
    if (this._disposed) {
      throw new Error('Web browser reference is already disposed.');
    }
  }

  exit() {
    if (this._disposed) {
      throw new Error('Web browser reference is already disposed.');
    }

    this._disposed = true;

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

    this._onLoad = function onLoad(e) {
      self.onNavigated.dispatch(reference.src);
    };

    this._checkUrl = function() {
      let url = self._reference.src;

      if (self.url !== url) {
        self.onNavigated.dispatch(url);
      }
    };

    this._reference.addEventListener('load', this._onLoad);
    this._interval = setInterval(this._checkUrl, 1000);

    this._reference.src = this._initialUrl;
  }

  navigate(url) {
    super.navigate(url);
    this._reference.src = url;
  }

  exit() {
    super.exit();

    if (this._reference) {
      this._reference.removeEventListener('load', this._onLoad);
      clearInterval(this._interval);

      this._reference.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
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

    this._onLoad = function onLoad(e) {
      self.onNavigated.dispatch(self._reference.getUrl());
    };

    this._checkUrl = function() {
      let url = self._reference.getUrl();

      if (self.url !== url) {
        self.onNavigated.dispatch(url);
      }
    };

    this._reference.addEventListener('did-stop-loading', this._onLoad);
    this._interval = setInterval(this._checkUrl, 1000);

    this._reference.src = this._initialUrl;
  }

  navigate(url) {
    super.navigate(url);
    this._reference.src = url;
  }

  exit() {
    super.exit();

    if (this._reference) {
      this._reference.removeEventListener('did-stop-loading', this._onLoad);
      clearInterval(this._interval);

      this._reference.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
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

  navigate(url) {
    super.navigate(url);
    this._reference.src = url;
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
