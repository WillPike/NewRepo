angular.module('SNAP.controllers')
.factory('CommandStartup', ['Logger', 'AppCache', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SurveyManager', 'SNAPConfig', function(Logger, AppCache, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SurveyManager, SNAPConfig) {
  return function() {
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
      return;
    }
    else if (AppCache.isComplete) {
      cacheComplete(false);
    }

    AppCache.complete.add(cacheComplete);

    ShellManager.initialize();

    if (CustomerManager.model.isEnabled) {
      if (!CustomerManager.model.isAuthenticated) {
        NavigationManager.location = { type: 'signin' };
        return;
      }
    }
    else {
      CustomerManager.guestLogin();
    }
  };
}]);
