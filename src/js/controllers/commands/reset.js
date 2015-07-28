angular.module('SNAP.controllers')
.factory('CommandReset',
  ['AnalyticsManager', 'ChatManager', 'CustomerManager', 'OrderManager', 'SessionManager', 'SurveyManager', 'ManagementService', 'Logger',
  (AnalyticsManager, ChatManager, CustomerManager, OrderManager, SessionManager, SurveyManager, ManagementService, Logger) => {

  return function() {
    return new Promise((resolve, reject) => {
      Q.all([
        AnalyticsManager.initialize(),
        SessionManager.initialize()
      ]).then(() => {
        SessionManager.endSession().then(() => {
          Q.allSettled([
            AnalyticsManager.submit(),
            OrderManager.reset(),
            SurveyManager.reset(),
            CustomerManager.logout(),
            ChatManager.reset()
          ]).spread(() => {
            Logger.debug('Reset completed successfully.');
          }, e => {
            Logger.warn(`Unable to reset properly: ${e}`);
          }).then(resolve, reject);
        }, reject);
      }, reject);
    });
  };
}]);
