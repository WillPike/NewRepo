"use strict";

/* global app, cordova, console, snap, window */

window.snap = {};

//------------------------------------------------------------------------
//
//  CordovaApplication
//
//------------------------------------------------------------------------

window.snap.CordovaApplication = class CordovaApplication {
  constructor(application) {
    if (!application) {
      throw new Error('No application provided.');
    }

    this._application = application;
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
//  StartupCordovaApplication
//
//------------------------------------------------------------------------

window.snap.StartupCordovaApplication = class StartupCordovaApplication extends snap.CordovaApplication {
  constructor() {
    super(new app.StartupApplicationBootstraper());
  }
};

//------------------------------------------------------------------------
//
//  ResetCordovaApplication
//
//------------------------------------------------------------------------

window.snap.ResetCordovaApplication = class ResetCordovaApplication extends snap.CordovaApplication {
  constructor() {
    super(new app.ResetApplicationBootstraper());
  }
};

//------------------------------------------------------------------------
//
//  SnapCordovaApplication
//
//------------------------------------------------------------------------

window.snap.SnapCordovaApplication = class SnapCordovaApplication extends snap.CordovaApplication {
  constructor() {
    super(new app.SnapApplicationBootstraper());
  }
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
