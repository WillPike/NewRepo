angular.module('SNAP.services', ['ngResource', 'SNAP.configs'])

  .factory('FlashStarter', ['Logger', 'SNAPHosts', (Logger, SNAPHosts) => {
    return new app.FlashStarter(Logger, SNAPHosts);
  }])
  .factory('Logger', ['SNAPEnvironment', (SNAPEnvironment) => {
    var loggers = [
      new app.Log4JsLogger()
    ];

    switch (SNAPEnvironment.platform) {
      case 'desktop':
        loggers.push(new app.ElectronLogger());
        break;
    }

    return new app.CompositeLogger(loggers);
  }])
  .factory('$exceptionHandler', ['Logger', (Logger) => {
    return (exception, cause) => {
      Logger.fatal(exception.stack, cause, exception);
      throw exception;
    };
  }])

  //Services

  .factory('CardReader', ['ManagementService', 'SNAPEnvironment', (ManagementService, SNAPEnvironment) => {
    var reader;

    switch (SNAPEnvironment.platform) {
      case 'mobile':
        reader = new app.CordovaCardReader();
        break;
      default:
        reader = new app.CardReader(ManagementService);
        break;
    }

    window.SnapCardReader = reader;

    return reader;
  }])
  .factory('DtsApi', ['SNAPHosts', 'SessionModel', (SNAPHosts, SessionModel) => {
    return new app.BackendApi(SNAPHosts, SessionModel);
  }])
  .factory('ManagementService', ['SNAPEnvironment', (SNAPEnvironment) => {
    switch (SNAPEnvironment.platform) {
      case 'desktop':
        return new app.ElectronManagementService();
      case 'mobile':
        return new app.CordovaManagementService();
      default:
        return new app.GenericManagementService();
    }
  }])
  .factory('SocketClient', ['SessionModel', 'SNAPHosts', 'Logger', (SessionModel, SNAPHosts, Logger) => {
    return new app.SocketClient(SessionModel, SNAPHosts, Logger);
  }])
  .factory('TelemetryService', ['$resource', ($resource) => {
    return new app.TelemetryService($resource);
  }])
  .factory('WebBrowser', ['AnalyticsModel', 'ManagementService', 'SNAPEnvironment', 'SNAPHosts', (AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) => {
    window.SnapWebBrowser = new app.WebBrowser(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts);
    return window.SnapWebBrowser;
  }])

  //Models

  .factory('AnalyticsModel', ['StorageProvider', 'HeatMap', 'Logger', (StorageProvider, HeatMap, Logger) => {
    return new app.AnalyticsModel(StorageProvider, HeatMap, Logger);
  }])
  .factory('CartModel', () => {
    return new app.CartModel();
  })
  .factory('ChatModel', ['SNAPLocation', 'SNAPEnvironment', 'StorageProvider', (SNAPLocation, SNAPEnvironment, StorageProvider) => {
    return new app.ChatModel(SNAPLocation, SNAPEnvironment, StorageProvider);
  }])
  .factory('CustomerModel', ['SNAPLocation', 'StorageProvider', (SNAPLocation, StorageProvider) => {
    return new app.CustomerModel(SNAPLocation, StorageProvider);
  }])
  .factory('DataModel', ['SNAPLocation', 'DtsApi', 'StorageProvider', 'SNAPHosts', (SNAPLocation, DtsApi, StorageProvider, SNAPHosts) => {
    return new app.DataModel(SNAPLocation, DtsApi, StorageProvider, SNAPHosts);
  }])
  .factory('HeatMap', () => {
    return new app.HeatMap(document.body);
  })
  .factory('LocationModel', ['DtsApi', 'SNAPEnvironment', 'SNAPLocation', 'StorageProvider', (DtsApi, SNAPEnvironment, SNAPLocation, StorageProvider) => {
    return new app.LocationModel(DtsApi, SNAPEnvironment, SNAPLocation, StorageProvider);
  }])
  .factory('OrderModel', ['StorageProvider', (StorageProvider) => {
    return new app.OrderModel(StorageProvider);
  }])
  .factory('ShellModel', () => {
    return new app.ShellModel();
  })
  .factory('SurveyModel', ['SNAPLocation', 'StorageProvider', (SNAPLocation, StorageProvider) => {
    return new app.SurveyModel(SNAPLocation, StorageProvider);
  }])
  .factory('SessionModel', ['StorageProvider', (StorageProvider) => {
    return new app.SessionModel(StorageProvider);
  }])
  .factory('StorageProvider', ['Logger', 'SNAPEnvironment', (Logger, SNAPEnvironment) =>  {
    return (id) => {
      switch (SNAPEnvironment.platform) {
        case 'mobile':
          return new app.CordovaLocalStorageStore(id, Logger);
        default:
          return new app.LocalStorageStore(id);
      }
    };
  }])

  //Managers

  .factory('ActivityMonitor', ['$rootScope', '$timeout', 'SNAPEnvironment', ($rootScope, $timeout, SNAPEnvironment) => {
    var monitor = new app.ActivityMonitor($rootScope, $timeout);
    monitor.timeout = 5 * 60 * 1000;

    if (SNAPEnvironment.debug) {
      monitor.timeout *= 10;
    }

    return monitor;
  }])
  .factory('AnalyticsManager', ['TelemetryService', 'AnalyticsModel', 'Logger', (TelemetryService, AnalyticsModel, Logger) => {
    return new app.AnalyticsManager(TelemetryService, AnalyticsModel, Logger);
  }])
  .factory('AuthenticationManager', ['DtsApi', 'SessionModel', 'SNAPEnvironment', 'WebBrowser', 'Logger', (DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger) => {
    return new app.AuthenticationManager(DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger);
  }])
  .factory('CustomerManager', ['DtsApi', 'CustomerModel', 'SessionModel', 'Logger', 'SNAPEnvironment', (DtsApi, CustomerModel, SessionModel, Logger, SNAPEnvironment) => {
    return new app.CustomerManager(DtsApi, CustomerModel, SessionModel, Logger, SNAPEnvironment);
  }])
  .factory('ChatManager', ['AnalyticsModel', 'ChatModel', 'CustomerModel', 'LocationModel', 'SocketClient', 'Logger', (AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient, Logger) => {
    return new app.ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient, Logger);
  }])
  .factory('DataManager', ['DataModel', 'Logger', 'SNAPEnvironment', 'SNAPLocation', (DataModel, Logger, SNAPEnvironment, SNAPLocation) => {
    return new app.DataManager(DataModel, Logger, SNAPEnvironment, SNAPLocation);
  }])
  .factory('DialogManager', ['Logger', (Logger) => {
    return new app.DialogManager(Logger);
  }])
  .factory('LocationManager', ['DataModel', 'DtsApi', 'LocationModel', 'Logger', (DataModel, DtsApi, LocationModel, Logger) => {
    return new app.LocationManager(DataModel, DtsApi, LocationModel, Logger);
  }])
  .factory('NavigationManager', ['$rootScope', '$location', '$timeout', 'AnalyticsModel', 'Logger', ($rootScope, $location, $timeout, AnalyticsModel, Logger) => {
    return new app.NavigationManager($rootScope, $location, $timeout, AnalyticsModel, Logger);
  }])
  .factory('OrderManager', ['ChatModel', 'CustomerModel', 'DtsApi', 'OrderModel', 'Logger', (ChatModel, CustomerModel, DtsApi, OrderModel, Logger) => {
    return new app.OrderManager(ChatModel, CustomerModel, DtsApi, OrderModel, Logger);
  }])
  .factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) => {
    return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
  }])
  .factory('ShellManager', ['DataModel', 'LocationModel', 'ShellModel', 'SNAPLocation', 'SNAPEnvironment', 'SNAPHosts', 'Logger', (DataModel, LocationModel, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts, Logger) => {
    return new app.ShellManager(DataModel, LocationModel, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts, Logger);
  }])
  .factory('SocialManager', ['SNAPEnvironment', 'DtsApi', 'WebBrowser', 'Logger', (SNAPEnvironment, DtsApi, WebBrowser, Logger) => {
    return new app.SocialManager(SNAPEnvironment, DtsApi, WebBrowser, Logger);
  }])
  .factory('SoftwareManager', ['SNAPEnvironment', (SNAPEnvironment) => {
    return new app.SoftwareManager(SNAPEnvironment);
  }])
  .factory('SurveyManager', ['DataModel', 'SurveyModel', 'Logger', (DataModel, SurveyModel, Logger) => {
    return new app.SurveyManager(DataModel, SurveyModel, Logger);
  }]);
