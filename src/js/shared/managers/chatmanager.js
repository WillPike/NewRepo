window.app.ChatManager = class ChatManager {
  /* global moment, signals */

  constructor(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient) {
    var self = this;

    this.MESSAGE_TYPES = {
      LOCATION: 'location',
      DEVICE: 'device'
    };
    this.MESSAGE_STATUSES = {
      CHAT_REQUEST: 'chat_request',
      CHAT_REQUEST_ACCEPTED: 'chat_request_accepted',
      CHAT_REQUEST_DECLINED: 'chat_request_declined',
      GIFT_REQUEST: 'gift_request',
      GIFT_REQUEST_ACCEPTED: 'gift_request_accepted',
      GIFT_REQUEST_DECLINED: 'gift_request_declined',
      CHAT_CLOSED: 'chat_closed'
    };
    this.OPERATIONS = {
      CHAT_MESSAGE: 'chat_message',
      STATUS_REQUEST: 'status_request',
      STATUS_UPDATE: 'status_update'
    };
    this.ROOMS = {
      LOCATION: 'location_',
      DEVICE: 'device_'
    };

    this._AnalyticsModel = AnalyticsModel;
    this._ChatModel = ChatModel;
    this._CustomerModel = CustomerModel;
    this._LocationModel = LocationModel;
    this._SocketClient = SocketClient;

    this._ChatModel.isEnabledChanged.add(() => self._sendStatusUpdate());
    this._ChatModel.isPresentChanged.add(() => self._sendStatusUpdate());
    this._CustomerModel.profileChanged.add(() => self._sendStatusUpdate());
    this._LocationModel.seatChanged.add(() => self._sendStatusUpdate());

    this._SocketClient.isConnectedChanged.add(isConnected => {
      self.model.isConnected = isConnected;
      self._sendStatusUpdate();
      self._sendStatusRequest();
    });

    this._SocketClient.subscribe(this.ROOMS.LOCATION + this._LocationModel.location.token, message => {
      switch (message.operation) {
        case self.OPERATIONS.CHAT_MESSAGE:
          self._onMessage(message);
          break;
        case self.OPERATIONS.STATUS_REQUEST:
          self._onStatusRequest(message);
          break;
        case self.OPERATIONS.STATUS_UPDATE:
          self._onStatusUpdate(message);
          break;
      }
    });

    this._SocketClient.subscribe(this.ROOMS.DEVICE + this._LocationModel.device, message => {
      switch (message.operation) {
        case self.OPERATIONS.CHAT_MESSAGE:
          self._onMessage(message);
          break;
        case self.OPERATIONS.STATUS_UPDATE:
          self._onStatusUpdate(message);
          break;
      }
    });
  }

  get model() {
    return this._ChatModel;
  }

  reset() {
    this.model.reset();

    return Promise.resolve();
  }

  //-----------------------------------------------
  //    Messaging
  //-----------------------------------------------

  sendMessage(message) {
    message.device = this._LocationModel.device;
    message.operation = this.OPERATIONS.CHAT_MESSAGE;
    message.type = message.to_device ?
      this.MESSAGE_TYPES.DEVICE :
      this.MESSAGE_TYPES.LOCATION;

    this._addMessageID(message);
    this.model.addHistory(message);

    var topic = this._getTopic(message);

    this._SocketClient.send(topic, message);
    this._AnalyticsModel.logChat(message);
  }

  approveDevice(token) {
    var device = this._LocationModel.getDevice(token);

    this.model.setLastRead(token, moment().unix());

    if (this.model.isPendingDevice(device)) {
      this.model.removePendingDevice(device);

      this.sendMessage({
        status: this.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED,
        to_device: device.token
      });
    }
    else {
      this.sendMessage({
        status: this.MESSAGE_STATUSES.CHAT_REQUEST,
        to_device: device.token
      });
    }

    if (!this.model.isActiveDevice(device)) {
      this.model.addActiveDevice(device);
    }
  }

  declineDevice(token) {
    var device = this._LocationModel.getDevice(token);

    if (this.model.isActiveDevice(device)) {
      this.model.removeActiveDevice(device);

      this.sendMessage({
        status: this.MESSAGE_STATUSES.CHAT_CLOSED,
        to_device: device.token
      });
    }
    else {
      this.sendMessage({
        status: this.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED,
        to_device: device.token
      });
    }
  }

  getMessageName(message) {
    if (this._LocationModel.device === message.device) {
      return 'Me';
    }

    return message.username || this.getDeviceName(message.device);
  }

  getDeviceName(token) {
    var device = this._LocationModel.getDevice(token);

    if (device) {
      if (this._LocationModel.device === device.token) {
        return 'Me';
      }

      if (device.username) {
        return device.username;
      }

      for(var p in this._LocationModel.seats) {
        if (this._LocationModel.seats[p].token === device.seat) {
          return this._LocationModel.seats[p].name;
        }
      }
    }

    return 'Guest';
  }

  //-----------------------------------------------
  //    Notifications
  //-----------------------------------------------

  checkIfUnread(device_token, message) {
    let lastRead = this.model.getLastRead(device_token);

    if (!lastRead) {
      return false;
    }

    if (message) {
      return moment.unix(message.received).isAfter(moment.unix(lastRead));
    }

    return this.getUnreadCount(device_token) > 0;
  }

  getUnreadCount(device_token) {
    let lastRead = this.model.getLastRead(device_token);

    if (!lastRead) {
      return 0;
    }

    var self = this,
        fromDate = moment.unix(lastRead);

    return this.model.history
      .filter(message => message.type === self.MESSAGE_TYPES.DEVICE && message.device === device_token)
      .filter(message => moment.unix(message.received).isAfter(fromDate))
      .length;
  }

  markAsRead(device_token) {
    this.model.setLastRead(device_token, moment().unix());
  }

  //-----------------------------------------------
  //    Gifts
  //-----------------------------------------------

  sendGift(items) {
    if (!this.model.giftDevice) {
      return;
    }

    this.sendMessage({
      status: this.MESSAGE_STATUSES.GIFT_REQUEST,
      to_device: this.model.giftDevice,
      text: items.reduce((result, item) => {
        if (result !== '') {
          result += ', ';
        }
        result += item.item.title;
        return result;
      }, '')
    });
  }

  acceptGift(device) {
    this.sendMessage({
      status: this.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED,
      to_device: device.token
    });
  }

  declineGift(device) {
    this.sendMessage({
      status: this.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED,
      to_device: device.token
    });
  }

  startGift(device_token) {
    let device = this._LocationModel.getDevice(device_token);

    this.model.giftDevice = device_token;
    this.model.giftSeat = device.seat;
  }

  endGift() {
    this.model.giftDevice = null;
    this.model.giftSeat = null;
  }

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  _onMessage(message) {
    if (!message.id) {
      return;
    }

    if (this.model.history.filter(msg => msg.id === message.id).length > 0) {
      return;
    }

    message.received = moment().unix();

    var device = this._LocationModel.getDevice(message.device),
        giftDevice = this.model.giftDevice,
        seat = this._LocationModel.seat.token;

    if (!device) {
      return;
    }

    if ((message.status === this.MESSAGE_STATUSES.CHAT_REQUEST) &&
        !this.model.isPendingDevice(device) &&
        !this.model.isActiveDevice(device)) {
      this.model.addPendingDevice(device);
      this.model.chatRequestReceived.dispatch(device.token);
    }

    if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST &&
        this.model.isActiveDevice(device)) {
      this.model.giftRequestReceived.dispatch(device, message.text);
    }

    if (message.to_device) {
      if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED) {
        if (giftDevice && giftDevice === message.device) {
          this.model.giftAccepted.dispatch(true);
          this.model.giftDevice = null;
        }
      }
      else if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED) {
        if (giftDevice && giftDevice === message.device) {
          this.model.giftAccepted.dispatch(false);
          this.model.giftDevice = null;
        }
      }
      else if (message.status === this.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED) {
        this.declineDevice(device);
      }
    }

    if (message.operation === this.OPERATIONS.CHAT_MESSAGE) {
      message.username = this.getDeviceName(device);
      this.model.addHistory(message);
    }

    this.model.messageReceived.dispatch(message);
  }

  _onStatusRequest(message) {
    if (message.device === this._LocationModel.device) {
      return;
    }

    this._sendStatusUpdate(message.device);
  }

  _onStatusUpdate(message) {
    if (message.device === this._LocationModel.device) {
      return;
    }

    var device = this._LocationModel.getDevice(message.device);

    if (!device) {
      device = {
        token: message.device,
      };

      this._LocationModel.addDevice(device);
    }

    if (!message.is_available && device.is_available) {
      let history = {
        operation: this.OPERATIONS.CHAT_MESSAGE,
        type: this.MESSAGE_TYPES.DEVICE,
        device: device.token,
        status: this.MESSAGE_STATUSES.CHAT_CLOSED,
        to_device: this._LocationModel.device
      };
      this._addMessageID(history);
      this.model.addHistory(history);
    }

    device.is_available = Boolean(message.is_available);
    device.is_present = Boolean(message.is_present);
    device.seat = message.seat;
    device.username = message.username;

    this._LocationModel.devicesChanged.dispatch(this._LocationModel.devices);
  }

  _sendStatusRequest() {
    if (!this.model.isConnected) {
      return;
    }

    let message = {
      operation: this.OPERATIONS.STATUS_REQUEST,
      device: this._LocationModel.device
    };

    this._SocketClient.send(this._getTopic(message), message);
  }

  _sendStatusUpdate(device) {
    if (!this.model.isConnected) {
      return;
    }

    let profile = this._CustomerModel.profile,
        username;

    if (profile && profile.first_name) {
      username = profile.first_name + ' ' + profile.last_name;
    }

    let message = {
      operation: this.OPERATIONS.STATUS_UPDATE,
      to_device: device,
      device: this._LocationModel.device,
      seat: this._LocationModel.seat.token,
      is_available: this.model.isEnabled,
      is_present: this.model.isPresent,
      username: username
    };

    this._SocketClient.send(this._getTopic(message), message);
  }

  _getTopic(message) {
      return message.to_device ?
        this.ROOMS.DEVICE + message.to_device :
        this.ROOMS.LOCATION + this._LocationModel.location.token;
  }

  _addMessageID(message) {
    message.id = message.id || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      var r = Math.random() * 16|0,
          v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
};
