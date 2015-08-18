angular.module('SNAP.controllers')
.factory('CommandStartup',
  ['Logger', 'AnalyticsManager', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SessionManager', 'SocialManager', 'SurveyManager', 'SNAPLocation',
  (Logger, AnalyticsManager, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SessionManager, SocialManager, SurveyManager, SNAPLocation) => {

  return function() {
    return new Promise((resolve, reject) => {
      Q.allSettled([
        AnalyticsManager.initialize(),
        ChatManager.initialize(),
        CustomerManager.initialize(),
        ChatManager.initialize(),
        DataManager.initialize(),
        ShellManager.initialize(),
        SessionManager.initialize(),
        SocialManager.initialize(),
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

        DataManager.fetchMedia();

        resolve();
      }, reject);
    });
  };
}]);
