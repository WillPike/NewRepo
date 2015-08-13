angular.module('SNAP.controllers')
.controller('MainSnapCtrl',
  ['$scope', '$timeout', 'CustomerManager', 'ActivityMonitor', 'ChatManager', 'ShellManager', 'DataManager', 'DialogManager', 'OrderManager', 'LocationModel', 'NavigationManager', 'SoftwareManager', 'SNAPLocation', 'CommandStartup',
  ($scope, $timeout, CustomerManager, ActivityMonitor, ChatManager, ShellManager, DataManager, DialogManager, OrderManager, LocationModel, NavigationManager, SoftwareManager, SNAPLocation, CommandStartup) => {

  CommandStartup();

  $scope.touch = () => ActivityMonitor.activityDetected();

  OrderManager.model.orderRequestChanged.add(item => {
    if (!item) {
      return;
    }
    item.promise.then(() => DialogManager.alert(ALERT_REQUEST_ORDER_RECEIVED));
  });

  OrderManager.model.assistanceRequestChanged.add(item => {
    if (!item) {
      return;
    }
    item.promise.then(() => DialogManager.alert(ALERT_REQUEST_ASSISTANCE_RECEIVED));
  });

  OrderManager.model.closeoutRequestChanged.add(item => {
    if (!item) {
      return;
    }
    item.promise.then(() => DialogManager.alert(ALERT_REQUEST_CLOSEOUT_RECEIVED));
  });

  ChatManager.model.chatRequestReceived.add(token => {
    DialogManager.confirm(ChatManager.getDeviceName(token) + ' would like to chat with you.').then(() => {
      ChatManager.approveDevice(token);
      NavigationManager.location = { type: 'chat' };
    }, () => ChatManager.declineDevice(token));
  });

  ChatManager.model.giftRequestReceived.add((token, description) => {
    DialogManager.confirm(ChatManager.getDeviceName(token) + ' would like to gift you a ' + description).then(() => {
      ChatManager.acceptGift(token);
    }, () => ChatManager.declineGift(token));
  });

  ChatManager.model.messageReceived.add(message => {
    var device = LocationModel.getDevice(message.device);

    if (!device) {
      return;
    }

    if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED) {
      DialogManager.alert('Chat with ' + ChatManager.getDeviceName(device.token) + ' was declined. ' +
      'To stop recieving chat requests, open the chat screen and touch the "Chat on/off" button.');
    }
    else if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED) {
      DialogManager.alert('Your chat request to ' + ChatManager.getDeviceName(device.token) + ' was accepted.');
    }
    else if (message.status === ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED) {
      DialogManager.alert(ChatManager.getDeviceName(device.token) + ' has accepted your gift. The item will be added to your check.');
    }
    else if (message.status === ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED) {
      DialogManager.alert(ChatManager.getDeviceName(device.token) + ' has declined your gift. The item will NOT be added to your check.');
    }

    if (NavigationManager.location.type === 'chat') {
      return;
    }

    if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_CLOSED) {
      DialogManager.notification(ChatManager.getDeviceName(device.token) + ' has closed the chat');
    }
    else if(!message.status && message.to_device) {
      DialogManager.notification('New message from ' + ChatManager.getDeviceName(device.token));
    }
  });

  ChatManager.model.giftReady.add(() => {
    ChatManager.sendGift(OrderManager.model.orderCart);
    NavigationManager.location = { type: 'chat' };
  });

  ChatManager.model.giftAccepted.add(status => {
    if (!status || !ChatManager.model.giftDevice) {
      ChatManager.model.giftSeat = null;
    }
    else {
      var job = DialogManager.startJob();

      OrderManager.submitCart().then(() => {
        DialogManager.endJob(job);
        NavigationManager.location = { type: 'chat' };
      }, () => {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);

        ChatManager.endGift();
        NavigationManager.location = { type: 'chat' };
      });
    }
  });
}]);
