angular.module('SNAP.services', ['ngResource', 'SNAP.configs'])

  .factory('Logger', ['SNAPEnvironment', (SNAPEnvironment) => {
    return new app.Logger(SNAPEnvironment);
  }])
  .factory('$exceptionHandler', ['Logger', (Logger) => {
    return (exception, cause) => {
      Logger.fatal(exception.stack, cause, exception);
      throw exception;
    };
  }])

  //Services

  .factory('CardReader', ['ManagementService', (ManagementService) => {
    window.SnapCardReader = new app.CardReader(ManagementService);
    return window.SnapCardReader;
  }])
  .factory('DtsApi', ['SNAPHosts', 'SessionProvider', (SNAPHosts, SessionProvider) => {
    return new app.BackendApi(SNAPHosts, SessionProvider);
  }])
  .factory('ManagementService', ['Logger', (Logger) => {
    return new app.CordovaManagementService(Logger);
  }])
  .factory('SocketClient', ['SessionProvider', 'SNAPHosts', 'Logger', (SessionProvider, SNAPHosts, Logger) => {
    return new app.SocketClient(SessionProvider, SNAPHosts, Logger);
  }])
  .factory('TelemetryService', ['$resource', ($resource) => {
    return new app.TelemetryService($resource);
  }])
  .factory('WebBrowser', ['AnalyticsModel', 'ManagementService', 'SNAPEnvironment', 'SNAPHosts', (AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) => {
    window.SnapWebBrowser = new app.WebBrowser(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts);
    return window.SnapWebBrowser;
  }])

  //Models

  .factory('AppCache', ['Logger', (Logger) => {
    return new app.AppCache(Logger);
  }])
  .factory('AnalyticsModel', ['StorageProvider', 'HeatMap', (StorageProvider, HeatMap) => {
    return new app.AnalyticsModel(StorageProvider, HeatMap);
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
  .factory('DataProvider', ['SNAPLocation', 'DtsApi', (SNAPLocation, DtsApi) => {
    return new app.DataProvider(SNAPLocation, DtsApi);
  }])
  .factory('HeatMap', () => {
    return new app.HeatMap(document.body);
  })
  .factory('LocationModel', ['SNAPEnvironment', 'SNAPLocation', 'StorageProvider', (SNAPEnvironment, SNAPLocation, StorageProvider) => {
    return new app.LocationModel(SNAPEnvironment, SNAPLocation, StorageProvider);
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
  .factory('SessionProvider', ['StorageProvider', (StorageProvider) => {
    return new app.SessionProvider(StorageProvider);
  }])
  .factory('StorageProvider', () =>  {
    return (id) => {
      return new app.CordovaLocalStorageStore(id);
    };
  })

  //Managers

  .factory('ActivityMonitor', ['$rootScope', '$timeout', ($rootScope, $timeout) => {
    var monitor = new app.ActivityMonitor($rootScope, $timeout);
    monitor.timeout = 30000;
    return monitor;
  }])
  .factory('AnalyticsManager', ['TelemetryService', 'AnalyticsModel', 'Logger', (TelemetryService, AnalyticsModel, Logger) => {
    return new app.AnalyticsManager(TelemetryService, AnalyticsModel, Logger);
  }])
  .factory('AuthenticationManager', ['DtsApi', 'SessionProvider', 'SNAPEnvironment', 'WebBrowser', 'Logger', (DtsApi, SessionProvider, SNAPEnvironment, WebBrowser, Logger) => {
    return new app.AuthenticationManager(DtsApi, SessionProvider, SNAPEnvironment, WebBrowser, Logger);
  }])
  .factory('CustomerManager', ['SNAPLocation', 'SNAPEnvironment', 'DtsApi', 'CustomerModel', 'SessionProvider', (SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionProvider) => {
    return new app.CustomerManager(SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionProvider);
  }])
  .factory('ChatManager', ['AnalyticsModel', 'ChatModel', 'CustomerModel', 'LocationModel', 'SocketClient', (AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient) => {
    return new app.ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient);
  }])
  .factory('DataManager', ['DataProvider', 'Logger', 'SNAPEnvironment', (DataProvider, Logger, SNAPEnvironment) => {
    return new app.DataManager(DataProvider, Logger, SNAPEnvironment);
  }])
  .factory('DialogManager', () => {
    return new app.DialogManager();
  })
  .factory('LocationManager', ['DataProvider', 'DtsApi', 'LocationModel', 'Logger', (DataProvider, DtsApi, LocationModel, Logger) => {
    return new app.LocationManager(DataProvider, DtsApi, LocationModel, Logger);
  }])
  .factory('NavigationManager', ['$rootScope', '$location', '$window', 'AnalyticsModel', ($rootScope, $location, $window, AnalyticsModel) => {
    return new app.NavigationManager($rootScope, $location, $window, AnalyticsModel);
  }])
  .factory('OrderManager', ['ChatModel', 'CustomerModel', 'DtsApi', 'OrderModel', (ChatModel, CustomerModel, DtsApi, OrderModel) => {
    return new app.OrderManager(ChatModel, CustomerModel, DtsApi, OrderModel);
  }])
  .factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) => {
    return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
  }])
  .factory('ShellManager', ['$sce', 'DataProvider', 'ShellModel', 'SNAPLocation', 'SNAPEnvironment', 'SNAPHosts', ($sce, DataProvider, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts) => {
    let manager = new app.ShellManager($sce, DataProvider, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts);
    DataProvider._getMediaUrl = (media, width, height, extension) => manager.getMediaUrl(media, width, height, extension); //ToDo: refactor
    return manager;
  }])
  .factory('SocialManager', ['SNAPEnvironment', 'DtsApi', 'WebBrowser', 'Logger', (SNAPEnvironment, DtsApi, WebBrowser, Logger) => {
    return new app.SocialManager(SNAPEnvironment, DtsApi, WebBrowser, Logger);
  }])
  .factory('SoftwareManager', ['SNAPEnvironment', (SNAPEnvironment) => {
    return new app.SoftwareManager(SNAPEnvironment);
  }])
  .factory('SurveyManager', ['DataProvider', 'SurveyModel', (DataProvider, SurveyModel) => {
    return new app.SurveyManager(DataProvider, SurveyModel);
  }]);
