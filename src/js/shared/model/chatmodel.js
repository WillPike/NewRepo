window.app.ChatModel = class ChatModel {
  /* global signals */

  constructor(SNAPLocation, SNAPEnvironment, storageProvider) {
    var self = this;

    this._preferencesStore = storageProvider('snap_chat_preferences');
    this._historyStore = storageProvider('snap_chat_history');

    this.isConnectedChanged = new signals.Signal();
    this.isEnabledChanged = new signals.Signal();
    this.isPresentChanged = new signals.Signal();

    this.activeDevicesChanged = new signals.Signal();
    this.pendingDevicesChanged = new signals.Signal();
    this.chatRequestReceived = new signals.Signal();

    this.historyChanged = new signals.Signal();
    this.messageReceived = new signals.Signal();
    
    this.giftRequestReceived = new signals.Signal();
    this.giftAccepted = new signals.Signal();

    this._giftSeat = null;
    this.giftSeatChanged = new signals.Signal();

    this._giftDevice = null;
    this.giftDeviceChanged = new signals.Signal();

    this.giftReady = new signals.Signal();
    this.giftAccepted = new signals.Signal();

    this._isEnabled = SNAPLocation.chat;
    this._pendingDevices = [];
    this._activeDevices = [];
    this._lastReads = {};

    this._preferencesStore.read().then(prefs => {
      if (!prefs) {
        return;
      }

      self._isEnabled = Boolean(prefs.is_enabled);

      self._activeDevices = prefs.active_devices || [];
      self._pendingDevices = prefs.pending_devices || [];
      self._lastReads = prefs.last_reads || {};
    });

    this._historyStore.read().then(history => {
      self._history = history || [];
    });
  }

  get isConnected() {
    return this._isConnected;
  }

  set isConnected(value) {
    if (this._isConnected === value) {
      return;
    }

    this._isConnected = Boolean(value);
    this.isConnectedChanged.dispatch(this._isConnected);
  }

  get isEnabled() {
    return this._isEnabled;
  }

  set isEnabled(value) {
    if (this._isEnabled === value) {
      return;
    }

    this._isEnabled = Boolean(value);
    this.isEnabledChanged.dispatch(this._isEnabled);

    this._updatePreferences();
  }

  get isPresent() {
    return this._isPresent;
  }

  set isPresent(value) {
    if (this._isPresent === value) {
      return;
    }

    this._isPresent = Boolean(value);
    this.isPresentChanged.dispatch(this._isPresent);
  }

  get giftDevice() {
    return this._giftDevice;
  }

  set giftDevice(value) {
    if (this._giftDevice === value) {
      return;
    }

    this._giftDevice = value;
    this.giftDeviceChanged.dispatch(this._giftDevice);
  }

  get giftSeat() {
    return this._giftSeat;
  }

  set giftSeat(value) {
    if (this._giftSeat === value) {
      return;
    }

    this._giftSeat = value;
    this.giftSeatChanged.dispatch(this._giftSeat);
  }

  get pendingDevices() {
    return this._pendingDevices;
  }

  set pendingDevices(value) {
    this._pendingDevices = value || [];
    this.pendingDevicesChanged.dispatch(this.pendingDevices);
  }

  get activeDevices() {
    return this._activeDevices;
  }

  set activeDevices(value) {
    this._activeDevices = value || [];
    this.activeDevicesChanged.dispatch(this.activeDevices);
  }

  isActiveDevice(device) {
    return this.activeDevices.indexOf(device.token || device) !== -1;
  }

  isPendingDevice(device) {
    return this.pendingDevices.indexOf(device.token || device) !== -1;
  }

  addActiveDevice(device) {
    this._activeDevices.push(device.token || device);
    this.activeDevices = this._activeDevices;
  }

  addPendingDevice(device) {
    this._pendingDevices.push(device.token || device);
    this.pendingDevices = this._pendingDevices;
  }

  removeActiveDevice(device) {
    var index = this.activeDevices.indexOf(device.token || device);
    this._activeDevices.splice(index, 1);
    this.activeDevices = this._activeDevices;
  }

  removePendingDevice(device) {
    var index = this.pendingDevices.indexOf(device.token || device);
    this._pendingDevices.splice(index, 1);
    this.pendingDevices = this._pendingDevices;
  }

  get history() {
    return this._history;
  }

  set history(value) {
    this._history = value || [];

    this.historyChanged.dispatch(this._history);
    this._updateHistory();
  }

  addHistory(message) {
    this._history.push(message);
    this.history = this._history;
  }

  getLastRead(device) {
    let token = device.token || device;
    return this._lastReads[token] || null;
  }

  setLastRead(device, value) {
    let token = device.token || device;
    this._lastReads[token] = value;
    this._updatePreferences();
  }

  save() {
    this._updateHistory();
    this._updatePreferences();
  }

  reset() {
    this._isConnected = this._isEnabled = this._isPresent = false;
    this._history = [];
    this._activeDevices = [];
    this._pendingDevices = [];

    this._historyStore.clear();
    this._preferencesStore.clear();
  }

  _updateHistory() {
    this._historyStore.write(this.history);
  }

  _updatePreferences() {
    this._preferencesStore.write({
      is_enabled: this.isEnabled,
      active_devices: this.activeDevices,
      pending_devices: this.pendingDevices,
      last_reads: this._lastReads
    });
  }
};
