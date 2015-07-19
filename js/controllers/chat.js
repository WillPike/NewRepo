angular.module('SNAP.controllers')
.controller('ChatCtrl',
  ['$scope', '$timeout', 'CustomerManager', 'ChatManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'ShellManager', 'SNAPConfig',
  ($scope, $timeout, CustomerManager, ChatManager, DialogManager, NavigationManager, LocationModel, ShellManager, SNAPConfig) => {

  if (!SNAPConfig.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPConfig.location_name;

  $scope.getPartialUrl = name => ShellManager.getPartialUrl(name);

  $scope.chatEnabled = ChatManager.model.isEnabled;
  ChatManager.model.isEnabledChanged.add(value => {
    $timeout(() => $scope.chatEnabled = value);
  });

  $scope.activeDevices = ChatManager.model.activeDevices;
  ChatManager.model.activeDevicesChanged.add(value => {
    $timeout(() => $scope.activeDevices = value);
  });

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(token => {
    $timeout(() => $scope.giftSeat = LocationModel.getSeat(token));
  });

  $scope.giftDevice = ChatManager.model.giftDevice;
  ChatManager.model.giftDeviceChanged.add(value => {
    $timeout(() => $scope.giftDevice = value);
  });

  $scope.toggleChat = () => {
    ChatManager.model.isEnabled = !ChatManager.model.isEnabled;
  };

  $scope.openMap = () => {
    NavigationManager.location = { type: 'chatmap' };
  };

  $scope.getDeviceName = device_token => ChatManager.getDeviceName(device_token);

  $scope.getSeatNumber = device_token => {
    var device = LocationModel.getDevice(device_token);

    for (var p in LocationModel.seats) {
      if (LocationModel.seats[p].token === device.seat) {
        let match = LocationModel.seats[p].name.match(/\d+/);
        return match ? match[0] || '' : '';
      }
    }

    return '';
  };

  $scope.closeChat = device_token => {
    DialogManager.confirm('Are you sure you would like to close the chat with ' + $scope.getDeviceName(device_token) + '?')
    .then(function() {
      ChatManager.declineDevice(device_token);
    });
  };

  $scope.getUnreadCount = device_token => ChatManager.getUnreadCount(device_token);

  $scope.sendGift = device_token => {
    var device = LocationModel.getDevice(device_token),
        seat = LocationModel.getSeat(device.seat);

    if (!seat) {
      return;
    }

    DialogManager.confirm(`Are you sure that you want to send a gift to ${seat.name}?`).then(() => {
      ChatManager.startGift(device_token);
      NavigationManager.location = { type: 'home' };
    });
  };

  $scope.cancelGift = () => ChatManager.endGift();

  ChatManager.isPresent = true;

  var watchLocation = true;

  $scope.$on('$locationChangeStart', () => {
    if (watchLocation) {
      ChatManager.model.isPresent = false;
      watchLocation = false;
    }
  });
}]);
