angular.module('SNAP.controllers')
.controller('ChatRoomCtrl',
['$scope', '$timeout', 'ChatManager', 'NavigationManager', 'ShellManager', 'SNAPConfig',
($scope, $timeout, ChatManager, NavigationManager, ShellManager, SNAPConfig) => {
  
  if (!SNAPConfig.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPConfig.location_name;

  $scope.getPartialUrl = name => ShellManager.getPartialUrl(name);
}]);
