"use strict";

/* global app, console, snap, window */

window.snap = {};

//------------------------------------------------------------------------
//
//  Application
//
//------------------------------------------------------------------------

window.snap.Application = class Application {
  constructor(App) {
    if (!App) {
      throw new Error('No application provided.');
    }

    this.options = {
      debug: true,
      acess_token: window.snap.galaxies_access_token
    };

    this._application = new App(this.options);
  }

  initialize() {
    this._prepareEnvironment();

    console.log('Bootstrapping the application...');

    var self = this;
    this._application.configure().then(() => {
      self._application.run();
    }, e => {
      console.error('Unable to bootstrap the application.', e);
    });
  }

  _prepareEnvironment() {
    console.log('Preparing the application environment...');

    var win = window.open;

    window.open = function(strUrl, strWindowName, strWindowFeatures) {
      var ref = win(strUrl, strWindowName, strWindowFeatures);

      if (ref) {
        new snap.PopupWatcher(ref);
      }

      return ref;
    };
  }
};

//------------------------------------------------------------------------
//
//  StartupApplication
//
//------------------------------------------------------------------------

window.snap.StartupApplication = class StartupApplication extends snap.Application {
  constructor() {
    super(app.StartupApplicationBootstraper);
  }
};

//------------------------------------------------------------------------
//
//  ResetApplication
//
//------------------------------------------------------------------------

window.snap.ResetApplication = class ResetApplication extends snap.Application {
  constructor() {
    super(app.ResetApplicationBootstraper);
  }
};

//------------------------------------------------------------------------
//
//  SnapApplication
//
//------------------------------------------------------------------------

window.snap.SnapApplication = class SnapApplication extends snap.Application {
  constructor() {
    super(app.SnapApplicationBootstraper);
  }
};

//------------------------------------------------------------------------
//
//  Misc
//
//------------------------------------------------------------------------

window.snap.galaxies_access_token = {
  "access_token": "QAAAAMNRxkGC0mLR3Rlyxq3tTTWq-ts4NYVpZYbZPZ3oFHyqkqyZ-hOfEzH5WCFiWU0-RN7oQ7zokivQUO0Tmg1Z9x80AQAAQAAAADn0-7U82N61WnZAF4pzt8cftkvIGu1Ad6-CrcDbdSjkuJw_b-VQITIlV4hBgfvsmS7TF5ky0TjDOt7NWaQR5SMvj_DGcWK4RfvDFpZ7q9oWlFQUyRn-mHGrud7lAp2TkntWaRbbjwvqV1B3-MqX3C0_DwX0b6-W3lRpk4dYAHoh8GVyT8bYHsuk2oVQvBen5r7spX9PQPAPO5KCFcy_n1tQ0eEFScdW7BZqKJNHMJwZNLWpAFLCKVl3PWRBKImb0iEmxcWtaW8_5M6UOW2VqxuhdHyCe8pMfzY_ZoiVvfSZC6IhWlZnFxoHGnHnwrWTUzWGJoKf5-rqYwKbXdjDxaalP596psqHp4iNT-X8GmfHPLW1Iqf7IaUQ76OtLsN4mr392FmCDODIDwGR_RdJZJs"
};

window.snap.PopupWatcher = class PopupWatcher {
  constructor(ref) {
    this._ref = ref;

    var self = this;
    this._interval = setInterval(function() {
      self._checkUrl();
    }, 100);
  }

  _checkUrl() {
    try {
      var href = this._ref.location.href;

      if (!href || this._href === href || !href.startsWith('http')) {
        return;
      }

      this._href = this._ref.location.href;
    } catch (e) {
      console.error(e);
      return this.dispose();
    }

    if (this._href === undefined) {
      return this.dispose();
    }

    if (window.SnapWebBrowser) {
      console.log(this._href);
      window.SnapWebBrowser.navigated(this._href);
    }
  }

  dispose() {
    clearInterval(this._interval);
    this._ref = null;
  }
};
