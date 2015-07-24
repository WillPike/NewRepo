angular.module('SNAP.controllers')
.controller('ChatRoomCtrl',
['$scope', '$timeout', 'ChatManager', 'NavigationManager', 'ShellManager', 'SNAPLocation',
($scope, $timeout, ChatManager, NavigationManager, ShellManager, SNAPLocation) => {
  
  if (!SNAPLocation.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPLocation.location_name;

  $scope.getPartialUrl = name => ShellManager.getPartialUrl(name);
}]);
