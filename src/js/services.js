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
  .factory('DtsApi', ['SNAPHosts', 'SessionModel', (SNAPHosts, SessionModel) => {
    return new app.BackendApi(SNAPHosts, SessionModel);
  }])
  .factory('ManagementService', ['Logger', (Logger) => {
    return new app.CordovaManagementService(Logger);
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

  .factory('AppCache', ['Logger', (Logger) => {
    return new app.AppCache(Logger);
  }])
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
  .factory('DataModel', ['SNAPLocation', 'DtsApi', 'StorageProvider', (SNAPLocation, DtsApi, StorageProvider) => {
    return new app.DataModel(SNAPLocation, DtsApi, StorageProvider);
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
  .factory('StorageProvider', ['Logger', (Logger) =>  {
    return (id) => {
      return new app.CordovaLocalStorageStore(id, Logger);
    };
  }])

  //Managers

  .factory('ActivityMonitor', ['$rootScope', '$timeout', ($rootScope, $timeout) => {
    var monitor = new app.ActivityMonitor($rootScope, $timeout);
    monitor.timeout = 30000;
    return monitor;
  }])
  .factory('AnalyticsManager', ['TelemetryService', 'AnalyticsModel', 'Logger', (TelemetryService, AnalyticsModel, Logger) => {
    return new app.AnalyticsManager(TelemetryService, AnalyticsModel, Logger);
  }])
  .factory('AuthenticationManager', ['DtsApi', 'SessionModel', 'SNAPEnvironment', 'WebBrowser', 'Logger', (DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger) => {
    return new app.AuthenticationManager(DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger);
  }])
  .factory('CustomerManager', ['SNAPLocation', 'SNAPEnvironment', 'DtsApi', 'CustomerModel', 'SessionModel', 'Logger', (SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionModel, Logger) => {
    return new app.CustomerManager(SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionModel, Logger);
  }])
  .factory('ChatManager', ['AnalyticsModel', 'ChatModel', 'CustomerModel', 'LocationModel', 'SocketClient', 'Logger', (AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient, Logger) => {
    return new app.ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient, Logger);
  }])
  .factory('DataManager', ['DataModel', 'Logger', 'SNAPEnvironment', (DataModel, Logger, SNAPEnvironment) => {
    return new app.DataManager(DataModel, Logger, SNAPEnvironment);
  }])
  .factory('DialogManager', ['Logger', (Logger) => {
    return new app.DialogManager(Logger);
  }])
  .factory('LocationManager', ['DataModel', 'DtsApi', 'LocationModel', 'Logger', (DataModel, DtsApi, LocationModel, Logger) => {
    return new app.LocationManager(DataModel, DtsApi, LocationModel, Logger);
  }])
  .factory('NavigationManager', ['$rootScope', '$location', '$window', 'AnalyticsModel', 'Logger', ($rootScope, $location, $window, AnalyticsModel, Logger) => {
    return new app.NavigationManager($rootScope, $location, $window, AnalyticsModel, Logger);
  }])
  .factory('OrderManager', ['ChatModel', 'CustomerModel', 'DtsApi', 'OrderModel', 'Logger', (ChatModel, CustomerModel, DtsApi, OrderModel, Logger) => {
    return new app.OrderManager(ChatModel, CustomerModel, DtsApi, OrderModel, Logger);
  }])
  .factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) => {
    return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
  }])
  .factory('ShellManager', ['$sce', 'DataModel', 'ShellModel', 'SNAPLocation', 'SNAPEnvironment', 'SNAPHosts', 'Logger', ($sce, DataModel, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts, Logger) => {
    let manager = new app.ShellManager($sce, DataModel, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts, Logger);
    DataModel._getMediaUrl = (media, width, height, extension) => manager.getMediaUrl(media, width, height, extension); //ToDo: refactor
    return manager;
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
