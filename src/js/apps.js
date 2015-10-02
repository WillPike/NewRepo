window.snap = {};

//------------------------------------------------------------------------
//
//  Application
//
//------------------------------------------------------------------------

window.snap.Application = class Application {
  constructor(application) {
    if (!application) {
      throw new Error('No application provided.');
    }

    this.options = {
      environment: {
        platform: 'web',
        version: SNAP_VERSION,
        main_application: { 'client_id': '2101353f79a64d8398c4a118f2caf548', 'callback_url': `https://demo.managesnap.com/${SNAP_VERSION}/startup.html`, 'scope': '' }
      },
      hosts: {
        static: { path: 'libs/dts-snap/' }
      }
    };

    this._application = new application(this.options);
  }

  initialize() {
    setTimeout(() => this._onReady(), 0);
  }

  _prepareEnvironment() {
    console.log('Preparing the application environment...');
  }

  _onReady() {
    this._prepareEnvironment();

    console.log('Bootstrapping the application...');

    this._application.configure().then(() => {
      this._application.run();
    }, e => {
      console.error('Unable to bootstrap the application.', e);
    });
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
//  MainAuxApplication
//
//------------------------------------------------------------------------

window.snap.MainApplication = class MainApplication extends snap.Application {
  constructor() {
    super(app.MainApplicationBootstraper);
  }
};
