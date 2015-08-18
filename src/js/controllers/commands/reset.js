angular.module('SNAP.controllers')
.factory('CommandReset',
  ['AnalyticsManager', 'ChatManager', 'CustomerManager', 'OrderManager', 'SessionManager', 'SurveyManager', 'ManagementService', 'Logger',
  (AnalyticsManager, ChatManager, CustomerManager, OrderManager, SessionManager, SurveyManager, ManagementService, Logger) => {

  return function() {
    return new Promise((resolve, reject) => {
      function reset(e) {
        if (e) {
          Logger.warn(`Unable to finalize AnalyticsManager: ${e}`);
        }

        Q.allSettled([
          OrderManager.finalize(),
          SurveyManager.finalize(),
          CustomerManager.finalize(),
          ChatManager.finalize()
        ])
        .spread(() => {
          Logger.debug('Reset completed successfully.');
        }, e => {
          Logger.warn(`Unable to reset properly: ${e}`);
        })
        .then(resolve, reject);
      }

      Q.all([
        AnalyticsManager.initialize(),
        SessionManager.initialize()
      ]).then(() => {
        SessionManager.endSession().then(() => {
          AnalyticsManager.finalize().then(reset, reset);
        }, reject);
      }, reject);
    });
  };
}]);
