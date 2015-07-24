angular.module('SNAP.controllers')
.factory('CommandStartup',
  ['Logger', 'AppCache', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SurveyManager', 'SNAPLocation',
  (Logger, AppCache, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SurveyManager, SNAPLocation) => {

  return function() {
    return new Promise((result, reject) => {

      function fail(e) {
        Logger.warn(`Unable to startup properly: ${e.message}`);
      }

      function cacheComplete(updated) {
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

      AppCache.complete.add(cacheComplete);

      ShellManager.initialize();

      if (CustomerManager.model.isEnabled) {
        if (!CustomerManager.model.isAuthenticated) {
          NavigationManager.location = { type: 'signin' };
        }
      }
      else {
        CustomerManager.guestLogin();
      }

      return result();    
    });
  };
}]);
