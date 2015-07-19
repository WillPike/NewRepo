angular.module('SNAP.services', ['ngResource'])

  .factory('SNAPConfig', () => {
    return SNAP_CONFIG;
  })
  .factory('SNAPEnvironment', () => {
    return SNAP_ENVIRONMENT;
  })
  .factory('SNAPHosts', () => {
    return SNAP_HOSTS_CONFIG;
  })
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
  .factory('ManagementService', ['$resource', 'SNAPEnvironment', ($resource, SNAPEnvironment) => {
    return new app.ManagementService($resource, SNAPEnvironment);
  }])
  .factory('SessionService', ['$resource', ($resource) => {
    return new app.SessionService($resource);
  }])
  .factory('SocketClient', ['SessionProvider', 'Logger', (SessionProvider, Logger) => {
    return new app.SocketClient(SessionProvider, Logger);
  }])
  .factory('TelemetryService', ['$resource', ($resource) => {
    return new app.TelemetryService($resource);
  }])
  .factory('WebBrowser', ['$window', 'AnalyticsModel', 'ManagementService', 'SNAPEnvironment', 'SNAPHosts', ($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) => {
    window.SnapWebBrowser = new app.WebBrowser($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts);
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
  .factory('ChatModel', ['SNAPConfig', 'SNAPEnvironment', 'StorageProvider', (SNAPConfig, SNAPEnvironment, StorageProvider) => {
    return new app.ChatModel(SNAPConfig, SNAPEnvironment, StorageProvider);
  }])
  .factory('CustomerModel', ['SNAPConfig', 'StorageProvider', (SNAPConfig, StorageProvider) => {
    return new app.CustomerModel(SNAPConfig, StorageProvider);
  }])
  .factory('DataProvider', ['SNAPConfig', 'DtsApi', (SNAPConfig, DtsApi) => {
    return new app.DataProvider(SNAPConfig, DtsApi);
  }])
  .factory('HeatMap', () => {
    return new app.HeatMap(document.body);
  })
  .factory('LocationModel', ['SNAPEnvironment', 'StorageProvider', (SNAPEnvironment, StorageProvider) => {
    return new app.LocationModel(SNAPEnvironment, StorageProvider);
  }])
  .factory('OrderModel', ['StorageProvider', (StorageProvider) => {
    return new app.OrderModel(StorageProvider);
  }])
  .factory('ShellModel', () => {
    return new app.ShellModel();
  })
  .factory('SurveyModel', ['SNAPConfig', 'StorageProvider', (SNAPConfig, StorageProvider) => {
    return new app.SurveyModel(SNAPConfig, StorageProvider);
  }])
  .factory('SessionProvider', ['SessionService', 'StorageProvider', (SessionService, StorageProvider) => {
    return new app.SessionProvider(SessionService, StorageProvider);
  }])
  .factory('StorageProvider', () =>  {
    return (id) => {
      return new app.LocalStorageStore(id);
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
  .factory('CustomerManager', ['SNAPConfig', 'SNAPEnvironment', 'DtsApi', 'CustomerModel', (SNAPConfig, SNAPEnvironment, DtsApi, CustomerModel) => {
    return new app.CustomerManager(SNAPConfig, SNAPEnvironment, DtsApi, CustomerModel);
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
  .factory('NavigationManager', ['$rootScope', '$location', '$window', 'AnalyticsModel', ($rootScope, $location, $window, AnalyticsModel) => {
    return new app.NavigationManager($rootScope, $location, $window, AnalyticsModel);
  }])
  .factory('OrderManager', ['ChatModel', 'CustomerModel', 'DataProvider', 'DtsApi', 'LocationModel', 'OrderModel', (ChatModel, CustomerModel, DataProvider, DtsApi, LocationModel, OrderModel) => {
    return new app.OrderManager(ChatModel, CustomerModel, DataProvider, DtsApi, LocationModel, OrderModel);
  }])
  .factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) => {
    return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
  }])
  .factory('ShellManager', ['$sce', 'DataProvider', 'ShellModel', 'SNAPConfig', 'SNAPEnvironment', 'SNAPHosts', ($sce, DataProvider, ShellModel, SNAPConfig, SNAPEnvironment, SNAPHosts) => {
    let manager = new app.ShellManager($sce, DataProvider, ShellModel, SNAPConfig, SNAPEnvironment, SNAPHosts);
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
