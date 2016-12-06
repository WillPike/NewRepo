angular.module('SNAP.controllers')
.controller('ChatMapCtrl',
['$scope', '$timeout', 'ChatManager', 'ShellManager', 'DialogManager', 'NavigationManager', 'LocationModel',
($scope, $timeout, ChatManager, ShellManager, DialogManager, NavigationManager, LocationModel) => {

  $scope.seats = [];

  $scope.mapImage = ShellManager.model.elements.location_map;
  ShellManager.model.elementsChanged.add(() => {
    $timeout(() => $scope.mapImage = ShellManager.model.elements.location_map);
  });

  function buildMap() {
    if (!LocationModel.seat) {
      return;
    }

    $timeout(function() {
      $scope.seats = LocationModel.seats
        .filter(function(seat) { return seat.token !== LocationModel.seat.token; })
        .map(function(seat) {
          var devices = LocationModel.devices
            .filter(function(device) { return device.seat === seat.token; })
            .map(function(device) {
              return {
                token: device.token,
                seat: device.seat,
                is_available: device.is_available,
                username: device.username
              };
            });

          return {
            token: seat.token,
            name: seat.name,
            devices: devices,
            map_position_x: seat.map_position_x,
            map_position_y: seat.map_position_y,
            is_available: devices
              .filter(function(device) { return device.is_available; })
              .length > 0
          };
        });
    });
  }

  LocationModel.devicesChanged.add(buildMap);
  LocationModel.seatsChanged.add(buildMap);
  LocationModel.seatChanged.add(buildMap);
  buildMap();

  $scope.chooseSeat = function(seat) {
    var device = seat.devices[0];

    if (!seat.is_available || !device) {
      var deviceName = device && device.username ? device.username : seat.name;
      DialogManager.alert(deviceName + ' is unavailable for chat');
      return;
    }

    ChatManager.approveDevice(device.token);
    $scope.exitMap();
  };

  $scope.exitMap = function() {
    NavigationManager.location = { type: 'chat' };
  };
}]);
