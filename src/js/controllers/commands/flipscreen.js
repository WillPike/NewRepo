angular.module('SNAP.controllers')
.factory('CommandFlipScreen', ['ManagementService', function(ManagementService) {
  return function() {
    ManagementService.rotateScreen();
  };
}]);
