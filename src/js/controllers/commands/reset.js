angular.module('SNAP.controllers')
.factory('CommandReset',
  ['AnalyticsManager', 'ChatManager', 'CustomerManager', 'OrderManager', 'SessionManager', 'SurveyManager', 'ManagementService', 'Logger',
  (AnalyticsManager, ChatManager, CustomerManager, OrderManager, SessionManager, SurveyManager, ManagementService, Logger) => {
    
  return function() {
    return new Promise((resolve, reject) => {
      function fail(e) {
        Logger.warn(`Unable to reset properly: ${e.message}`);
        reject(e);
      }

      SessionManager.endSession();

      AnalyticsManager.submit().then(() => {
        OrderManager.reset().then(() => {
          SurveyManager.reset().then(() => {
            CustomerManager.logout().then(() => {
              ChatManager.reset().then(() => {
                Logger.debug('Reset completed successfully.');
                resolve();
              }, fail);
            }, fail);
          }, fail);
        }, fail);
      }, fail);
    });
  };
}]);
