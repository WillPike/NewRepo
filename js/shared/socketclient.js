window.app.SocketClient = class SocketClient {
  constructor(SessionProvider, Logger) {
    var self = this;

    this._SessionProvider = SessionProvider;
    this._Logger = Logger;

    this.isConnectedChanged = new signals.Signal();

    this._channels = {};
    this._isConnected = false;

    this._socket = socketCluster.connect({
      path: '/sockets/',
      port: 8080
    });
    this._socket.on('connect', status => {
      self._Logger.debug(`Socket connected.`);
      self._authenticate();
    });
    this._socket.on('disconnect', () => {
      self._Logger.debug(`Socket disconnected.`);
      self._isConnected = false;
      self.isConnectedChanged.dispatch(self.isConnected);
    });
  }

  get isConnected() {
    return this._isConnected;
  }

  subscribe(topic, handler) {
    this._getChannel(topic).watch(handler);
  }

  send(topic, data) {
    this._getChannel(topic).publish(data);
  }

  _getChannel(topic) {
    return this._channels[topic] || (this._channels[topic] = this._socket.subscribe(topic));
  }

  _authenticate() {
    var self = this;
    this._SessionProvider.getBusinessToken().then(token => {
      self._socket.emit('authenticate', {
        access_token: token
      }, err => {
        if (err) {
          self._Logger.warn(`Unable to authenticate socket: ${err.message}`);
          return;
        }

        self._isConnected = true;
        self.isConnectedChanged.dispatch(self.isConnected);
      });
    }, e => {
      self._Logger.warn(`Unable to perform socket authentication: ${e.message}`);
    });
  }
};
