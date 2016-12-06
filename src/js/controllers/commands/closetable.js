angular.module('SNAP.controllers')
.factory('CommandCloseTable', [
  'ManagementService',
  (ManagementService) => {

  return function() {
    return ManagementService.loadReset();
  };
}]);
