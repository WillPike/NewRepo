angular.module('SNAP.controllers')
.factory('CommandStartup',
  ['Logger', 'AnalyticsManager', 'AppCache', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SessionManager', 'SurveyManager', 'SNAPLocation',
  (Logger, AnalyticsManager, AppCache, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SessionManager, SurveyManager, SNAPLocation) => {

  return function() {
    return new Promise((result, reject) => {
      /*function cacheComplete(updated) {
        if (updated) {
          window.location.reload(true);
        }
        else {
          DataManager.initialize();
        }
      }

      if (AppCache.isUpdated) {
        cacheComplete(true);
        return result();
      }
      else if (AppCache.isComplete) {
        cacheComplete(false);
      }

      AppCache.complete.add(cacheComplete);*/

      Q.allSettled([
        AnalyticsManager.initialize(),
        ChatManager.initialize(),
        CustomerManager.initialize(),
        NavigationManager.initialize(),
        ShellManager.initialize(),
        SessionManager.initialize(),
        SurveyManager.initialize()
      ])
      .then(() => {
        if (CustomerManager.model.isEnabled) {
          if (!CustomerManager.model.isAuthenticated) {
            NavigationManager.location = { type: 'signin' };
          }
        }
        else {
          CustomerManager.guestLogin();
        }

        DataManager.initialize();
      }, reject);
    });
  };
}]);
