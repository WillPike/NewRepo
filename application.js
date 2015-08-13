"use strict";

/* global app, console, snap, window, SNAP_DEV_CREDENTIALS */

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
      platform: 'web'
    };

    if (typeof SNAP_DEV_CREDENTIALS !== 'undefined') {
      this.options.access_token = SNAP_DEV_CREDENTIALS.access_token;
      this.options.location = SNAP_DEV_CREDENTIALS.location;
    }

    this._application = new App(this.options);
  }

  initialize() {
    this._prepareEnvironment();

    console.log('Bootstrapping the application...');

    this._application.configure().then(() => {
      this._application.run();
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
//  FlashApplication
//
//------------------------------------------------------------------------

window.snap.FlashApplication = class FlashApplication extends snap.Application {
  constructor() {
    super(app.FlashApplicationBootstraper);
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
