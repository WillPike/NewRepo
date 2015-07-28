//src/js/shared/_base.js

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

window.app = {};

var ALERT_REQUEST_SUBMIT_ERROR = 1,
    ALERT_REQUEST_ASSISTANCE_SENT = 10,
    ALERT_REQUEST_ASSISTANCE_RECEIVED = 11,
    ALERT_REQUEST_CLOSEOUT_SENT = 20,
    ALERT_REQUEST_CLOSEOUT_RECEIVED = 21,
    ALERT_REQUEST_ORDER_SENT = 30,
    ALERT_REQUEST_ORDER_RECEIVED = 31,
    ALERT_SIGNIN_REQUIRED = 40,
    ALERT_TABLE_RESET = 50,
    ALERT_TABLE_ASSISTANCE = 51,
    ALERT_TABLE_CLOSEOUT = 52,
    ALERT_GENERIC_ERROR = 100,
    ALERT_DELET_CARD = 200,
    ALERT_PASSWORD_RESET_COMPLETE = 210,
    ALERT_SOFTWARE_OUTDATED = 220,
    ALERT_CARDREADER_ERROR = 310,
    ALERT_ERROR_NO_SEAT = 410,
    ALERT_ERROR_STARTUP = 510;

//src/js/shared/domain/analyticsdata.js

window.app.AnalyticsData = (function () {
  function AnalyticsData(name, storageProvider, defaultValue) {
    _classCallCheck(this, AnalyticsData);

    this._defaultValue = defaultValue || function () {
      return [];
    };
    this._name = name;
    this._data = this._defaultValue();
    this._store = storageProvider('snap_analytics_' + name);
    this._store.read().then(function (data) {
      return self._data = data || self._data;
    });
  }

  _createClass(AnalyticsData, [{
    key: 'push',
    value: function push(item) {
      this._data.push(item);
      store();
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._data = this._defaultValue();
      store();
    }
  }, {
    key: 'store',
    value: function store() {
      this._store.write(this._data);
    }
  }, {
    key: 'name',
    get: function get() {
      return this._name;
    }
  }, {
    key: 'data',
    get: function get() {
      return this._data;
    },
    set: function set(value) {
      this._data = value;
      store();
    }
  }, {
    key: 'length',
    get: function get() {
      return this._data.length;
    }
  }, {
    key: 'last',
    get: function get() {
      return this._data[this.length - 1];
    }
  }]);

  return AnalyticsData;
})();

//src/js/shared/domain/cartitem.js

window.app.CartItem = (function () {
  function CartItem(item, quantity, name, modifiers, request) {
    _classCallCheck(this, CartItem);

    this.item = item;
    this.quantity = quantity;
    this.name = name;
    this.request = request;

    if (!this.hasModifiers) {
      this.modifiers = [];
    } else if (!modifiers) {
      this.modifiers = item.modifiers.map(function (category) {
        return new app.CartModifierCategory(category, category.items.map(function (modifier) {
          return new app.CartModifier(modifier);
        }));
      });
    } else {
      this.modifiers = modifiers;
    }
  }

  _createClass(CartItem, [{
    key: 'clone',
    value: function clone(count) {
      return new app.CartItem(this.item, this.quantity, this.name, this.modifiers.map(function (category) {
        return category.clone();
      }), this.request);
    }
  }, {
    key: 'cloneMany',
    value: function cloneMany(count) {
      count = count || this.quantity;
      var result = [];

      for (var i = 0; i < count; i++) {
        result.push(new app.CartItem(this.item, 1, this.name, this.modifiers.map(function (category) {
          return category.clone();
        }), this.request));
      }

      return result;
    }
  }, {
    key: 'restore',
    value: function restore(data) {
      return new app.CartItem(data.item, data.quantity, data.name, data.modifiers.map(app.CartModifierCategory.prototype.restore), data.request);
    }
  }, {
    key: 'hasModifiers',
    get: function get() {
      return this.item.modifiers != null && this.item.modifiers.length > 0;
    }
  }, {
    key: 'selectedModifiers',
    get: function get() {
      return this.modifiers.reduce(function (previousCategory, category, i, array) {
        return array.concat(category.items.filter(function (modifier) {
          return modifier.isSelected;
        }));
      }, []);
    }
  }]);

  return CartItem;
})();

//src/js/shared/domain/cartmodifier.js

(function () {

  //------------------------------------------------------------------------
  //
  //  CartModifier
  //
  //------------------------------------------------------------------------

  var CartModifier = function CartModifier(data, isSelected) {
    this.data = data;
    this.isSelected = isSelected || false;
  };

  CartModifier.prototype.clone = function () {
    return new app.CartModifier(this.data, this.isSelected);
  };

  CartModifier.prototype.restore = function (data) {
    return new app.CartModifier(data.data, data.isSelected);
  };

  window.app.CartModifier = CartModifier;

  //------------------------------------------------------------------------
  //
  //  CartModifierCategory
  //
  //------------------------------------------------------------------------

  var CartModifierCategory = function CartModifierCategory(data, modifiers) {
    this.data = data;
    this.modifiers = modifiers;
  };

  CartModifierCategory.prototype.clone = function () {
    var modifiers = this.modifiers.map(function (modifier) {
      return modifier.clone();
    });
    return new app.CartModifierCategory(this.data, modifiers);
  };

  CartModifierCategory.prototype.restore = function (data) {
    return new app.CartModifierCategory(data.data, data.modifiers.map(CartModifier.prototype.restore));
  };

  window.app.CartModifierCategory = CartModifierCategory;
})();

//src/js/shared/domain/requestwatcher.js

window.app.RequestWatcher = (function () {
  function RequestWatcher(ticket, DtsApi) {
    _classCallCheck(this, RequestWatcher);

    this._token = ticket.token;
    this._remote = DtsApi;

    this.POLLING_INTERVAL = 5000;

    this.REQUEST_STATUS_PENDING = 1;
    this.REQUEST_STATUS_RECEIVED = 2;
    this.REQUEST_STATUS_ACCEPTED = 3;
    this.REQUEST_STATUS_EXPIRED = 255;

    var self = this;
    this._promise = new Promise(function (resolve, reject) {
      self._statusUpdateResolve = resolve;
      self._statusUpdateReject = reject;
    });

    this._ticket = { status: 0 };
    this._watchStatus();
  }

  _createClass(RequestWatcher, [{
    key: 'dispose',
    value: function dispose() {
      if (this._timeoutId) {
        window.clearTimeout(this._timeoutId);
      }

      if (this._ticket.status < this.REQUEST_STATUS_ACCEPTED) {
        this._statusUpdateReject();
      }
    }
  }, {
    key: '_watchStatus',
    value: function _watchStatus() {
      var self = this;

      if (self._timeoutId) {
        window.clearTimeout(self._timeoutId);
      }

      var onTimeout = function onTimeout() {
        self._remote.waiter.getStatus(self._token).then(function (response) {
          self._setTicket(response);
          self._watchStatus();
        }, function () {
          self._watchStatus();
        });
      };

      if (self._ticket.status === self.REQUEST_STATUS_ACCEPTED) {
        self._statusUpdateResolve();
      } else if (self._ticket.status !== self.REQUEST_STATUS_EXPIRED) {
        self._timeoutId = window.setTimeout(onTimeout, this.POLLING_INTERVAL);
      }
    }
  }, {
    key: '_setTicket',
    value: function _setTicket(value) {
      var self = this;

      if (self._ticket.status === value.status) {
        return;
      }

      self._ticket = value;
      self._watchStatus();
    }
  }, {
    key: 'token',
    get: function get() {
      return this._token;
    }
  }, {
    key: 'ticket',
    get: function get() {
      return this._ticket;
    }
  }, {
    key: 'promise',
    get: function get() {
      return this._promise;
    }
  }]);

  return RequestWatcher;
})();

//src/js/shared/domain/webbrowserreference.js

window.app.WebBrowserReference = (function () {
  function WebBrowserReference(browserRef) {
    _classCallCheck(this, WebBrowserReference);

    this.browser = browserRef;
    this.onNavigated = new signals.Signal();
    this.onExit = new signals.Signal();
    this.onCallback = new signals.Signal();
  }

  _createClass(WebBrowserReference, [{
    key: 'exit',
    value: function exit() {
      this.onExit.dispatch();
    }
  }]);

  return WebBrowserReference;
})();

window.app.CordovaWebBrowserReference = (function (_app$WebBrowserReference) {
  _inherits(CordovaWebBrowserReference, _app$WebBrowserReference);

  function CordovaWebBrowserReference(browserRef) {
    _classCallCheck(this, CordovaWebBrowserReference);

    _get(Object.getPrototypeOf(CordovaWebBrowserReference.prototype), 'constructor', this).call(this, browserRef);
    var self = this;

    function onLoadStart(event) {
      self.onNavigated.dispatch(event.url);
    }
    this._onLoadStart = onLoadStart;

    function onExit() {
      browserRef.removeEventListener('loadstart', onLoadStart);
      browserRef.removeEventListener('exit', onExit);
      self.onExit.dispatch();
    }
    this._onExit = onExit;

    this.browser.addEventListener('loadstart', onLoadStart);
    this.browser.addEventListener('exit', onExit);
  }

  _createClass(CordovaWebBrowserReference, [{
    key: 'exit',
    value: function exit() {
      _get(Object.getPrototypeOf(CordovaWebBrowserReference.prototype), 'exit', this).call(this);

      this._dispose();
      this.browser.close();
    }
  }, {
    key: '_dispose',
    value: function _dispose() {
      this.onNavigated.dispose();
      this.onExit.dispose();

      this.browser.removeEventListener('loadstart', this._onLoadStart);
      this.browser.removeEventListener('exit', this._onExit);
    }
  }]);

  return CordovaWebBrowserReference;
})(app.WebBrowserReference);

//src/js/shared/managers/activitymonitor.js

(function () {

  var ActivityMonitor = function ActivityMonitor($rootScope, $timeout) {
    this.$$rootScope = $rootScope;
    this.$$timeout = $timeout;
    this._timeout = 10000;

    this._activeChanged = new signals.Signal();
    this.enabled = true;

    var self = this;

    this.$$rootScope.$on('$locationChangeSuccess', function () {
      if (self.enabled) {
        self.activityDetected();
      }
    });

    this.activityDetected();
  };

  ActivityMonitor.prototype = {};

  Object.defineProperty(ActivityMonitor.prototype, 'timeout', {
    get: function get() {
      return this._timeout;
    },
    set: function set(value) {
      if (value > 0) {
        this._timeout = value;
        this.activityDetected();
      }
    }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'enabled', {
    get: function get() {
      return this._enabled;
    },
    set: function set(value) {
      this._enabled = value;
    }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'active', {
    get: function get() {
      return this._timer != null;
    }
  });

  Object.defineProperty(ActivityMonitor.prototype, 'activeChanged', {
    get: function get() {
      return this._activeChanged;
    }
  });

  ActivityMonitor.prototype.activityDetected = function () {
    var changed;

    if (this._timer) {
      this.$$timeout.cancel(this._timer);
    } else if (this._timer === null) {
      changed = true;
    }

    var self = this;

    var onTimeout = function onTimeout() {
      self._timer = null;

      self.$$rootScope.$apply(function () {
        if (self.enabled) {
          self.activeChanged.dispatch(self.active);
        }
      });
    };

    this._timer = this.$$timeout(onTimeout, this._timeout);

    if (changed && this.enabled) {
      this.activeChanged.dispatch(this.active);
    }
  };

  window.app.ActivityMonitor = ActivityMonitor;
})();

//src/js/shared/managers/analyticsmanager.js

window.app.AnalyticsManager = (function () {
  function AnalyticsManager(TelemetryService, AnalyticsModel, Logger) {
    _classCallCheck(this, AnalyticsManager);

    this._TelemetryService = TelemetryService;
    this._AnalyticsModel = AnalyticsModel;
    this._Logger = Logger;
  }

  _createClass(AnalyticsManager, [{
    key: 'submit',
    value: function submit() {
      this._Logger.debug('Submitting analytics data with ' + (this._AnalyticsModel.sessions.length + ' seat sessions, ') + (this._AnalyticsModel.answers.length + ' answers, ') + (this._AnalyticsModel.chats.length + ' chats, ') + (this._AnalyticsModel.comments.length + ' comments, ') + (this._AnalyticsModel.clicks.length + ' clicks, ') + (this._AnalyticsModel.pages.length + ' pages, ') + (this._AnalyticsModel.advertisements.length + ' advertisements and ') + (this._AnalyticsModel.urls.length + ' URLs.'));

      var self = this;
      return new Promise(function (resolve, reject) {
        self._TelemetryService.submitTelemetry({
          sessions: self._AnalyticsModel.sessions.data,
          advertisements: self._AnalyticsModel.advertisements.data,
          answers: self._AnalyticsModel.answers.data,
          chats: self._AnalyticsModel.chats.data,
          comments: self._AnalyticsModel.comments.data,
          clicks: self._AnalyticsModel.clicks.data,
          pages: self._AnalyticsModel.pages.data,
          urls: self._AnalyticsModel.urls.data
        }).then(function () {
          self._AnalyticsModel.clear();
          resolve();
        }, function (e) {
          self._Logger.warn('Unable to submit analytics data: ' + e.message);
          reject(e);
        });
      });
    }
  }]);

  return AnalyticsManager;
})();

//src/js/shared/managers/authenticationmanager.js

window.app.AuthenticationManager = (function () {
  /* global moment, signals */

  function AuthenticationManager(BackendApi, SessionModel, SNAPEnvironment, WebBrowser, Logger) {
    _classCallCheck(this, AuthenticationManager);

    this._BackendApi = BackendApi;
    this._SessionModel = SessionModel;
    this._SNAPEnvironment = SNAPEnvironment;
    this._WebBrowser = WebBrowser;
    this._Logger = Logger;
  }

  _createClass(AuthenticationManager, [{
    key: 'validate',
    value: function validate() {
      var self = this,
          model = self._SessionModel;

      this._Logger.debug('Validating access token...');

      return new Promise(function (resolve, reject) {
        model.initialize().then(function () {
          var token = model.apiToken;

          if (!token || !self._validateToken(token)) {
            self._Logger.debug('Authorization is not valid.');
            resolve(false);
          } else {
            self._Logger.debug('Validating authorization session...');

            self._BackendApi.oauth2.getSession().then(function (session) {
              session = URI('?' + session).query(true); //ToDo: remove this hack

              if (session && session.valid === 'true') {
                self._Logger.debug('Authorization is valid.', session);
                resolve(true);
              } else {
                self._Logger.debug('Authorization is not valid or expired.', session);
                resolve(false);
              }
            }, function (e) {
              self._Logger.debug('Unable to validate authorization.', e);
              resolve(null);
            });
          }
        }, function (e) {
          self._Logger.debug('Error validating authorization.', e);
          resolve(null);
        });
      });
    }
  }, {
    key: 'authorize',
    value: function authorize() {
      this._Logger.debug('Authorizing API access...');

      var self = this;
      return new Promise(function (resolve, reject) {
        self._SessionModel.clear().then(function () {
          var application = self._SNAPEnvironment.main_application,
              authUrl = self._BackendApi.oauth2.getTokenAuthorizeUrl(application.client_id, application.callback_url, application.scope);

          self._WebBrowser.open(authUrl, { system: true }).then(function (browser) {
            function handleCallback(url) {
              if (url.indexOf(application.callback_url) !== 0) {
                return;
              }

              browser.exit();

              var callbackResponse = url.split('#')[1],
                  responseParameters = callbackResponse.split('&'),
                  parameterMap = [];

              for (var i = 0; i < responseParameters.length; i++) {
                parameterMap[responseParameters[i].split('=')[0]] = responseParameters[i].split('=')[1];
              }

              if (parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
                var token = {
                  access_token: parameterMap.access_token,
                  expires_in: parameterMap.expires_in
                };

                self._Logger.debug('New access token issued.', token);

                self._SessionModel.apiToken = token;

                return resolve();
              }

              self._Logger.debug('Problem issuing new access token.', parameterMap);
              reject('Problem authenticating: ' + url);
            }

            browser.onCallback.add(function (url) {
              return handleCallback(url);
            });
            browser.onNavigated.add(function (url) {
              return handleCallback(url);
            });
          }, reject);
        }, reject);
      });
    }
  }, {
    key: 'customerLoginRegular',
    value: function customerLoginRegular(credentials) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var application = self._SNAPEnvironment.customer_application;
        self._BackendApi.oauth2.getTokenWithCredentials(application.client_id, credentials.login, credentials.password).then(function (result) {
          if (!result) {
            return reject();
          }

          if (result.error || !result.access_token) {
            return reject(result.error);
          }

          var session = {
            access_token: result.access_token
          };

          if (result.expires_in) {
            session.expires = moment().add(result.expires_in, 'seconds').unix();
          }

          self._SessionModel.customerToken = session;

          resolve();
        }, reject);
      });
    }
  }, {
    key: 'customerLoginSocial',
    value: function customerLoginSocial(token) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var session = {
          access_token: token.access_token
        };

        if (token.expires_in) {
          session.expires = moment().add(token.expires_in, 'seconds').unix();
        }

        self._SessionModel.customerToken = session;

        resolve();
      });
    }
  }, {
    key: '_validateToken',
    value: function _validateToken(token) {
      if (!token || !token.access_token) {
        return false;
      }

      if (token.expires) {
        var expires = moment.unix(token.expires);

        if (expires.isBefore(moment())) {
          return false;
        }
      }

      return true;
    }
  }]);

  return AuthenticationManager;
})();

//src/js/shared/managers/chatmanager.js

window.app.ChatManager = (function () {
  /* global moment, signals */

  function ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient) {
    _classCallCheck(this, ChatManager);

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

    this._ChatModel.isEnabledChanged.add(function () {
      return self._sendStatusUpdate();
    });
    this._ChatModel.isPresentChanged.add(function () {
      return self._sendStatusUpdate();
    });
    this._CustomerModel.profileChanged.add(function () {
      return self._sendStatusUpdate();
    });
    this._LocationModel.seatChanged.add(function () {
      return self._sendStatusUpdate();
    });

    this._SocketClient.isConnectedChanged.add(function (isConnected) {
      self.model.isConnected = isConnected;
      self._sendStatusUpdate();
      self._sendStatusRequest();
    });

    this._SocketClient.subscribe(this.ROOMS.LOCATION + this._LocationModel.location.token, function (message) {
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

    this._SocketClient.subscribe(this.ROOMS.DEVICE + this._LocationModel.device, function (message) {
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

  _createClass(ChatManager, [{
    key: 'reset',
    value: function reset() {
      this.model.reset();

      return Promise.resolve();
    }

    //-----------------------------------------------
    //    Messaging
    //-----------------------------------------------

  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      message.device = this._LocationModel.device;
      message.operation = this.OPERATIONS.CHAT_MESSAGE;
      message.type = message.to_device ? this.MESSAGE_TYPES.DEVICE : this.MESSAGE_TYPES.LOCATION;

      this._addMessageID(message);
      this.model.addHistory(message);

      var topic = this._getTopic(message);

      this._SocketClient.send(topic, message);
      this._AnalyticsModel.logChat(message);
    }
  }, {
    key: 'approveDevice',
    value: function approveDevice(token) {
      var device = this._LocationModel.getDevice(token);

      this.model.setLastRead(token, moment().unix());

      if (this.model.isPendingDevice(device)) {
        this.model.removePendingDevice(device);

        this.sendMessage({
          status: this.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED,
          to_device: device.token
        });
      } else {
        this.sendMessage({
          status: this.MESSAGE_STATUSES.CHAT_REQUEST,
          to_device: device.token
        });
      }

      if (!this.model.isActiveDevice(device)) {
        this.model.addActiveDevice(device);
      }
    }
  }, {
    key: 'declineDevice',
    value: function declineDevice(token) {
      var device = this._LocationModel.getDevice(token);

      if (this.model.isActiveDevice(device)) {
        this.model.removeActiveDevice(device);

        this.sendMessage({
          status: this.MESSAGE_STATUSES.CHAT_CLOSED,
          to_device: device.token
        });
      } else {
        this.sendMessage({
          status: this.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED,
          to_device: device.token
        });
      }
    }
  }, {
    key: 'getMessageName',
    value: function getMessageName(message) {
      if (this._LocationModel.device === message.device) {
        return 'Me';
      }

      return message.username || this.getDeviceName(message.device);
    }
  }, {
    key: 'getDeviceName',
    value: function getDeviceName(token) {
      var device = this._LocationModel.getDevice(token);

      if (device) {
        if (this._LocationModel.device === device.token) {
          return 'Me';
        }

        if (device.username) {
          return device.username;
        }

        for (var p in this._LocationModel.seats) {
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

  }, {
    key: 'checkIfUnread',
    value: function checkIfUnread(device_token, message) {
      var lastRead = this.model.getLastRead(device_token);

      if (!lastRead) {
        return false;
      }

      if (message) {
        return moment.unix(message.received).isAfter(moment.unix(lastRead));
      }

      return this.getUnreadCount(device_token) > 0;
    }
  }, {
    key: 'getUnreadCount',
    value: function getUnreadCount(device_token) {
      var lastRead = this.model.getLastRead(device_token);

      if (!lastRead) {
        return 0;
      }

      var self = this,
          fromDate = moment.unix(lastRead);

      return this.model.history.filter(function (message) {
        return message.type === self.MESSAGE_TYPES.DEVICE && message.device === device_token;
      }).filter(function (message) {
        return moment.unix(message.received).isAfter(fromDate);
      }).length;
    }
  }, {
    key: 'markAsRead',
    value: function markAsRead(device_token) {
      this.model.setLastRead(device_token, moment().unix());
    }

    //-----------------------------------------------
    //    Gifts
    //-----------------------------------------------

  }, {
    key: 'sendGift',
    value: function sendGift(items) {
      if (!this.model.giftDevice) {
        return;
      }

      this.sendMessage({
        status: this.MESSAGE_STATUSES.GIFT_REQUEST,
        to_device: this.model.giftDevice,
        text: items.reduce(function (result, item) {
          if (result !== '') {
            result += ', ';
          }
          result += item.item.title;
          return result;
        }, '')
      });
    }
  }, {
    key: 'acceptGift',
    value: function acceptGift(device) {
      this.sendMessage({
        status: this.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED,
        to_device: device.token
      });
    }
  }, {
    key: 'declineGift',
    value: function declineGift(device) {
      this.sendMessage({
        status: this.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED,
        to_device: device.token
      });
    }
  }, {
    key: 'startGift',
    value: function startGift(device_token) {
      var device = this._LocationModel.getDevice(device_token);

      this.model.giftDevice = device_token;
      this.model.giftSeat = device.seat;
    }
  }, {
    key: 'endGift',
    value: function endGift() {
      this.model.giftDevice = null;
      this.model.giftSeat = null;
    }

    //------------------------------------------------------------------------
    //
    //  Private methods
    //
    //------------------------------------------------------------------------

  }, {
    key: '_onMessage',
    value: function _onMessage(message) {
      if (!message.id) {
        return;
      }

      if (this.model.history.filter(function (msg) {
        return msg.id === message.id;
      }).length > 0) {
        return;
      }

      message.received = moment().unix();

      var device = this._LocationModel.getDevice(message.device),
          giftDevice = this.model.giftDevice,
          seat = this._LocationModel.seat.token;

      if (!device) {
        return;
      }

      if (message.status === this.MESSAGE_STATUSES.CHAT_REQUEST && !this.model.isPendingDevice(device) && !this.model.isActiveDevice(device)) {
        this.model.addPendingDevice(device);
        this.model.chatRequestReceived.dispatch(device.token);
      }

      if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST && this.model.isActiveDevice(device)) {
        this.model.giftRequestReceived.dispatch(device, message.text);
      }

      if (message.to_device) {
        if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED) {
          if (giftDevice && giftDevice === message.device) {
            this.model.giftAccepted.dispatch(true);
            this.model.giftDevice = null;
          }
        } else if (message.status === this.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED) {
          if (giftDevice && giftDevice === message.device) {
            this.model.giftAccepted.dispatch(false);
            this.model.giftDevice = null;
          }
        } else if (message.status === this.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED) {
          this.declineDevice(device);
        }
      }

      if (message.operation === this.OPERATIONS.CHAT_MESSAGE) {
        message.username = this.getDeviceName(device);
        this.model.addHistory(message);
      }

      this.model.messageReceived.dispatch(message);
    }
  }, {
    key: '_onStatusRequest',
    value: function _onStatusRequest(message) {
      if (message.device === this._LocationModel.device) {
        return;
      }

      this._sendStatusUpdate(message.device);
    }
  }, {
    key: '_onStatusUpdate',
    value: function _onStatusUpdate(message) {
      if (message.device === this._LocationModel.device) {
        return;
      }

      var device = this._LocationModel.getDevice(message.device);

      if (!device) {
        device = {
          token: message.device
        };

        this._LocationModel.addDevice(device);
      }

      if (!message.is_available && device.is_available) {
        var _history = {
          operation: this.OPERATIONS.CHAT_MESSAGE,
          type: this.MESSAGE_TYPES.DEVICE,
          device: device.token,
          status: this.MESSAGE_STATUSES.CHAT_CLOSED,
          to_device: this._LocationModel.device
        };
        this._addMessageID(_history);
        this.model.addHistory(_history);
      }

      device.is_available = Boolean(message.is_available);
      device.is_present = Boolean(message.is_present);
      device.seat = message.seat;
      device.username = message.username;

      this._LocationModel.devicesChanged.dispatch(this._LocationModel.devices);
    }
  }, {
    key: '_sendStatusRequest',
    value: function _sendStatusRequest() {
      if (!this.model.isConnected) {
        return;
      }

      var message = {
        operation: this.OPERATIONS.STATUS_REQUEST,
        device: this._LocationModel.device
      };

      this._SocketClient.send(this._getTopic(message), message);
    }
  }, {
    key: '_sendStatusUpdate',
    value: function _sendStatusUpdate(device) {
      if (!this.model.isConnected) {
        return;
      }

      var profile = this._CustomerModel.profile,
          username = undefined;

      if (profile && profile.first_name) {
        username = profile.first_name + ' ' + profile.last_name;
      }

      var message = {
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
  }, {
    key: '_getTopic',
    value: function _getTopic(message) {
      return message.to_device ? this.ROOMS.DEVICE + message.to_device : this.ROOMS.LOCATION + this._LocationModel.location.token;
    }
  }, {
    key: '_addMessageID',
    value: function _addMessageID(message) {
      message.id = message.id || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }, {
    key: 'model',
    get: function get() {
      return this._ChatModel;
    }
  }]);

  return ChatManager;
})();

//src/js/shared/managers/customermanager.js

window.app.CustomerManager = (function () {
  /* global moment */

  function CustomerManager(Config, Environment, DtsApi, CustomerModel, SessionModel) {
    _classCallCheck(this, CustomerManager);

    this._api = DtsApi;
    this._CustomerModel = CustomerModel;
    this._SessionModel = SessionModel;
    this._customerAppId = Environment.customer_application.client_id;
  }

  _createClass(CustomerManager, [{
    key: 'logout',
    value: function logout() {
      var self = this;
      return new Promise(function (resolve) {
        self._SessionModel.customerToken = null;
        self._CustomerModel.profile = null;
        resolve();
      });
    }
  }, {
    key: 'guestLogin',
    value: function guestLogin() {
      var self = this;
      return new Promise(function (resolve) {
        self._CustomerModel.profile = 'guest';
        resolve();
      });
    }
  }, {
    key: 'login',
    value: function login() {
      return this._loadProfile();
    }
  }, {
    key: 'loginSocial',
    value: function loginSocial() {
      return this._loadProfile();
    }
  }, {
    key: 'signUp',
    value: function signUp(registration) {
      var self = this;
      return new Promise(function (resolve, reject) {
        registration.client_id = self._customerAppId;
        self._api.customer.signUp(registration).then(function () {
          self.login({
            login: registration.username,
            password: registration.password
          }).then(resolve, reject);
        }, reject);
      });
    }
  }, {
    key: 'updateProfile',
    value: function updateProfile(profile) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.customer.updateProfile(profile).then(function () {
          self._CustomerModel.profile = profile;
          resolve();
        }, reject);
      });
    }
  }, {
    key: 'changePassword',
    value: function changePassword(request) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.customer.changePassword(request).then(function () {
          self.login({
            login: self._CustomerModel.email,
            password: request.new_password
          }).then(resolve, reject);
        }, reject);
      });
    }
  }, {
    key: 'resetPassword',
    value: function resetPassword(request) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.customer.resetPassword(request).then(function () {
          resolve();
        }, reject);
      });
    }
  }, {
    key: '_loadProfile',
    value: function _loadProfile() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.customer.getProfile().then(function (profile) {
          self._CustomerModel.profile = profile;
          resolve();
        }, reject);
      });
    }
  }, {
    key: 'model',
    get: function get() {
      return this._CustomerModel;
    }
  }, {
    key: 'customerName',
    get: function get() {
      if (this.model.isEnabled && this.model.isAuthenticated && !this.model.isGuest) {
        var name = '';

        if (CustomerManager.model.profile.first_name) {
          name += CustomerManager.model.profile.first_name;
        }

        if (CustomerManager.model.profile.last_name) {
          name += ' ' + CustomerManager.model.profile.last_name;
        }

        return name;
      }

      return 'Guest';
    }
  }]);

  return CustomerManager;
})();

//src/js/shared/managers/datamanager.js

window.app.DataManager = (function () {
  /* global signals */

  function DataManager(DataProvider, Logger, SNAPEnvironment) {
    _classCallCheck(this, DataManager);

    this._DataProvider = DataProvider;
    this._Logger = Logger;
    this._SNAPEnvironment = SNAPEnvironment;

    this.homeChanged = new signals.Signal();
    this.menuChanged = new signals.Signal();
    this.categoryChanged = new signals.Signal();
    this.itemChanged = new signals.Signal();

    this._CACHEABLE_MEDIA_KINDS = [41, 51, 58, 61];
  }

  _createClass(DataManager, [{
    key: 'initialize',
    value: function initialize() {
      var self = this;
      this._cache = {
        menu: {},
        category: {},
        item: {},
        media: {}
      };

      this._Logger.debug('Initializing data manager.');

      this.provider.digest().then(function (digest) {
        var menuSets = digest.menu_sets.map(function (menu) {
          return new Promise(function (resolve, reject) {
            self.provider.menu(menu.token).then(function (data) {
              return self._cache.menu[menu.token] = self._filterMenu(data);
            }).then(resolve, resolve);
          });
        });

        var menuCategories = digest.menu_categories.map(function (category) {
          return new Promise(function (resolve, reject) {
            self.provider.category(category.token).then(function (data) {
              return self._cache.category[category.token] = self._filterCategory(data);
            }).then(resolve, resolve);
          });
        });

        var menuItems = digest.menu_items.map(function (item) {
          return new Promise(function (resolve, reject) {
            self.provider.item(item.token).then(function (data) {
              return self._cache.item[item.token] = data;
            }).then(resolve, resolve);
          });
        });

        var medias = digest.media.filter(function (media) {
          return self._CACHEABLE_MEDIA_KINDS.indexOf(media.kind) !== -1;
        }).map(function (media) {
          var width, height;

          switch (media.kind) {
            case 41:
            case 51:
              width = 370;
              height = 370;
              break;
            case 58:
              width = 600;
              height = 600;
              break;
            case 61:
              width = 100;
              height = 100;
              break;
          }

          media.width = width;
          media.height = height;

          return media;
        }).map(function (media) {
          return new Promise(function (resolve, reject) {
            self.provider.media(media).then(function (img) {
              return self._cache.media[media.token] = img;
            }).then(resolve, resolve);
          });
        });

        self._Logger.debug('Digest contains ' + menuSets.length + ' menus, ' + (menuCategories.length + ' categories, ') + (menuItems.length + ' items and ') + (medias.length + ' files.'));

        var tasks = [].concat(menuSets).concat(menuCategories).concat(menuItems);

        Promise.all(tasks).then(function () {
          Promise.all(medias);
        });
      });
    }
  }, {
    key: '_cached',
    value: function _cached(group, id) {
      if (!this._cache) {
        return null;
      }

      if (id && this._cache[group] && this._cache[group][id]) {
        return this._cache[group][id];
      } else if (!id && this._cache[group]) {
        return this._cache[group];
      }

      return null;
    }
  }, {
    key: '_filterHome',
    value: function _filterHome(data) {
      var self = this;
      data.menus = data.menus.filter(function (menu) {
        return self._SNAPEnvironment.platform === 'desktop' || menu.type !== 3;
      });

      return data;
    }
  }, {
    key: '_filterMenu',
    value: function _filterMenu(data) {
      return data;
    }
  }, {
    key: '_filterCategory',
    value: function _filterCategory(data) {
      var self = this;
      data.items = data.items.filter(function (item) {
        return self._SNAPEnvironment.platform === 'desktop' || item.type !== 3;
      });

      return data;
    }
  }, {
    key: 'provider',
    get: function get() {
      return this._DataProvider;
    }
  }, {
    key: 'home',
    get: function get() {
      return this._home;
    },
    set: function set(value) {
      if (this._home === value) {
        return;
      }

      if (value) {
        var self = this;
        this._home = value;
        this.provider.home().then(function (home) {
          if (self._home) {
            home = self._filterHome(home);
            self.homeChanged.dispatch(home);
          }
        });
      } else {
        this._home = undefined;
        this.homeChanged.dispatch(undefined);
      }
    }
  }, {
    key: 'menu',
    get: function get() {
      return this._menu;
    },
    set: function set(value) {
      if (this._menu === value) {
        return;
      }

      if (value) {
        var self = this;
        this._menu = value;

        var data = this._cached('menu', value);

        if (data) {
          return this.menuChanged.dispatch(data);
        }

        this.provider.menu(value).then(function (menu) {
          if (self._menu) {
            menu = self._filterMenu(menu);
            self.menuChanged.dispatch(menu);
          }
        });
      } else {
        this._menu = undefined;
        this.menuChanged.dispatch(undefined);
      }
    }
  }, {
    key: 'category',
    get: function get() {
      return this._category;
    },
    set: function set(value) {
      if (this._category === value) {
        return;
      }

      if (value) {
        var self = this;
        this._category = value;

        var data = this._cached('category', value);

        if (data) {
          return this.categoryChanged.dispatch(data);
        }

        this.provider.category(value).then(function (category) {
          if (self._category) {
            category = self._filterCategory(category);
            self.categoryChanged.dispatch(category);
          }
        });
      } else {
        this._category = undefined;
        this.categoryChanged.dispatch(undefined);
      }
    }
  }, {
    key: 'item',
    get: function get() {
      return this._item;
    },
    set: function set(value) {
      if (this._item === value) {
        return;
      }

      if (value) {
        var self = this;
        this._item = value;

        var data = this._cached('item', value);

        if (data) {
          return this.itemChanged.dispatch(data);
        }

        this.provider.item(value).then(function (item) {
          if (self._item) {
            self.itemChanged.dispatch(item);
          }
        });
      } else {
        this._item = undefined;
        this.itemChanged.dispatch(undefined);
      }
    }
  }]);

  return DataManager;
})();

//src/js/shared/managers/dialogmanager.js

window.app.DialogManager = (function () {
  function DialogManager() {
    _classCallCheck(this, DialogManager);

    this.alertRequested = new signals.Signal();
    this.notificationRequested = new signals.Signal();
    this.confirmRequested = new signals.Signal();
    this.jobStarted = new signals.Signal();
    this.jobEnded = new signals.Signal();
    this.modalStarted = new signals.Signal();
    this.modalEnded = new signals.Signal();
    this._jobs = 0;
    this._modals = 0;
  }

  _createClass(DialogManager, [{
    key: 'alert',
    value: function alert(message, title) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.alertRequested.dispatch(message, title, resolve, reject);
      });
    }
  }, {
    key: 'notification',
    value: function notification(message) {
      this.notificationRequested.dispatch(message);
    }
  }, {
    key: 'confirm',
    value: function confirm(message) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self.confirmRequested.dispatch(message, resolve, reject);
      });
    }
  }, {
    key: 'startJob',
    value: function startJob() {
      this._jobs++;

      if (this._jobs === 1) {
        this.jobStarted.dispatch();
      }

      return this._jobs;
    }
  }, {
    key: 'endJob',
    value: function endJob(id) {
      this._jobs--;

      if (this._jobs === 0) {
        this.jobEnded.dispatch();
      }
    }
  }, {
    key: 'startModal',
    value: function startModal() {
      this._modals++;

      if (this._modals === 1) {
        this.modalStarted.dispatch();
      }

      return this._modals;
    }
  }, {
    key: 'endModal',
    value: function endModal(id) {
      this._modals--;

      if (this._modals === 0) {
        this.modalEnded.dispatch();
      }
    }
  }, {
    key: 'jobs',
    get: function get() {
      return this._jobs;
    }
  }, {
    key: 'modals',
    get: function get() {
      return this._modals;
    }
  }]);

  return DialogManager;
})();

//src/js/shared/managers/locationmanager.js

window.app.LocationManager = (function () {
  function LocationManager(DataProvider, DtsApi, LocationModel, Logger) {
    _classCallCheck(this, LocationManager);

    this._DataProvider = DataProvider;
    this._DtsApi = DtsApi;
    this._LocationModel = LocationModel;
    this._Logger = Logger;
  }

  _createClass(LocationManager, [{
    key: 'loadConfig',
    value: function loadConfig() {
      var self = this,
          model = self._LocationModel;

      return new Promise(function (resolve, reject) {
        function loadConfig() {
          self._Logger.debug('Loading location config...');

          model.fetch('location').then(function (location) {
            self._Logger.debug('New \'' + location.location_name + '\' location config loaded.');
            resolve(location);
          }, function (e) {
            if (!model.location) {
              return reject(e);
            }

            self._Logger.debug('Fallback to stored location \'' + model.location.location_name + '\'.');
            resolve(model.location);
          });
        }

        model.initialize().then(function () {
          self._Logger.debug('Loading device info...');

          model.fetch('device').then(function (device) {
            self._Logger.debug('New device loaded: token=' + device.token + ';location=' + device.location_token);
            loadConfig();
          }, function (e) {
            if (!model.device) {
              return reject(e);
            }

            self._Logger.debug('Fallback to stored device: token=' + model.device.token + ';location=' + model.device.location_token);
            loadConfig();
          });
        }, reject);
      });
    }
  }, {
    key: 'loadSeats',
    value: function loadSeats() {
      var self = this,
          model = self._LocationModel;

      return new Promise(function (resolve, reject) {
        function loadSeat() {
          self._Logger.debug('Loading current seat info...');

          model.fetch('seat').then(function (seat) {
            self._Logger.debug('New seat data loaded for #' + seat.token + '.');
            resolve(seat);
          }, function (e) {
            if (!model.seat) {
              return reject(e);
            }

            self._Logger.debug('Fallback to stored seat #' + model.seat.token + '.');
            resolve(model.seat);
          });
        }

        model.initialize().then(function () {
          self._Logger.debug('Loading location seats...');

          model.fetch('seats').then(function (seats) {
            self._Logger.debug('Location seats loaded (' + seats.length + ').');
            loadSeat();
          }, function (e) {
            if (!model.seats) {
              return reject(e);
            }

            self._Logger.debug('Fallback to stored seats (' + model.seats.length + ').');
            loadSeat();
          });
        }, reject);
      });
    }
  }]);

  return LocationManager;
})();

//src/js/shared/managers/navigationmanager.js

window.app.NavigationManager = (function () {
  /* global signals */

  function NavigationManager($rootScope, $location, $window, AnalyticsModel) {
    _classCallCheck(this, NavigationManager);

    this.$$location = $location;
    this.$$window = $window;
    this._AnalyticsModel = AnalyticsModel;

    this.locationChanging = new signals.Signal();
    this.locationChanged = new signals.Signal();

    var self = this;

    $rootScope.$on('$locationChangeSuccess', function () {
      var path = self.$$location.path();

      if (path === self._path) {
        self.locationChanged.dispatch(self._location);
        return;
      }

      self._path = path;
      self._location = self.getLocation(path);
      self.locationChanging.dispatch(self._location);
      self.locationChanged.dispatch(self._location);
    });

    this.locationChanged.add(function (location) {
      return self._AnalyticsModel.logNavigation(location);
    });
  }

  _createClass(NavigationManager, [{
    key: 'getPath',
    value: function getPath(location) {
      if (!location) {
        return null;
      }

      if (location.token) {
        return '/' + location.type + '/' + location.token;
      } else if (location.url) {
        return '/' + location.type + '/' + encodeURIComponent(location.url);
      }

      if (location.type === 'home') {
        return '/';
      }

      return '/' + location.type;
    }
  }, {
    key: 'getLocation',
    value: function getLocation(path) {
      var match = /\/(\w+)?(\/(.+))?/.exec(path);

      if (match && match.length > 1) {
        var type = match[1];
        var param = match[3];

        if (param !== undefined) {
          switch (type) {
            case 'url':
              return { type: type, url: decodeURIComponent(param) };

            default:
              return { type: type, token: param };
          }
        }

        if (!type) {
          type = 'home';
        }

        return { type: type };
      }

      return {};
    }
  }, {
    key: 'goBack',
    value: function goBack() {
      if (this.location.type !== 'home' && this.location.type !== 'signin') {
        this.$$window.history.back();
      }
    }
  }, {
    key: 'path',
    get: function get() {
      return this._path;
    },
    set: function set(value) {
      var i = value.indexOf('#'),
          path = i !== -1 ? value.substring(i + 1) : value;

      this.location = this.getLocation(path);
    }
  }, {
    key: 'location',
    get: function get() {
      return this._location;
    },
    set: function set(value) {
      this._location = value;

      this.locationChanging.dispatch(this._location);

      var path = this._path = this.getPath(this._location);
      this.$$location.path(path);
    }
  }]);

  return NavigationManager;
})();

//src/js/shared/managers/ordermanager.js

window.app.OrderManager = (function () {
  function OrderManager(ChatModel, CustomerModel, DtsApi, OrderModel) {
    _classCallCheck(this, OrderManager);

    var self = this;

    this._DtsApi = DtsApi;
    this._ChatModel = ChatModel;
    this._CustomerModel = CustomerModel;
    this._OrderModel = OrderModel;

    this._ChatModel.giftSeatChanged.add(function (giftSeat) {
      if (self.model.orderCartStash.length === 0) {
        self.model.orderCartStash = self.model.orderCart;
        self.model.orderCart = [];
      }

      if (!giftSeat) {
        self.model.orderCart = self.model.orderCartStash;
      }
    });
  }

  _createClass(OrderManager, [{
    key: 'reset',
    value: function reset() {
      var self = this;

      return new Promise(function (resolve) {
        self.model.clearWatcher(self.model.REQUEST_KIND_ORDER);
        self.model.clearWatcher(self.model.REQUEST_KIND_ASSISTANCE);
        self.model.clearWatcher(self.model.REQUEST_KIND_CLOSEOUT);

        self.clearCart();
        self.clearCheck();
        self.model.orderTicket = {};

        resolve();
      });
    }

    //-----------------------------------------------
    //    Cart and checks
    //-----------------------------------------------

  }, {
    key: 'addToCart',
    value: function addToCart(item) {
      this.model.orderCart.push(item);
      this.model.orderCartChanged.dispatch(this.model.orderCart);

      if (this._ChatModel.giftSeat) {
        this._ChatModel.giftReady.dispatch();
      }

      return this.model.orderCart;
    }
  }, {
    key: 'removeFromCart',
    value: function removeFromCart(item) {
      this.model.orderCart = this.model.orderCart.filter(function (entry) {
        return entry !== item;
      });
      return this.model.orderCart;
    }
  }, {
    key: 'clearCart',
    value: function clearCart() {
      this.model.orderCart = [];
      this.model.orderCartStash = [];

      this._ChatModel.giftSeat = null;
    }
  }, {
    key: 'clearCheck',
    value: function clearCheck(items) {
      var result = [];

      if (items) {
        for (var i = 0; i < this.model.orderCheck.length; i++) {
          var found = false;

          for (var j = 0; j < items.length; j++) {
            if (this.model.orderCheck[i] === items[j]) {
              found = true;
              break;
            }
          }

          if (!found) {
            result.push(this.model.orderCheck[i]);
          }
        }
      }

      this.model.orderCheck = result;
    }
  }, {
    key: 'submitCart',
    value: function submitCart(options) {
      if (this.model.orderCart.length === 0) {
        return;
      }

      options = options || 0;

      if (this._ChatModel.giftSeat) {
        options |= 4;
      }

      var self = this;

      var request = {
        kind: this.model.REQUEST_KIND_ORDER,
        items: this.model.orderCart.map(function (entry) {
          return {
            token: entry.item.order.token,
            quantity: entry.quantity,
            modifiers: entry.modifiers.reduce(function (result, category) {
              return result.concat(category.modifiers.reduce(function (result, modifier) {
                if (modifier.isSelected) {
                  result.push(modifier.data.token);
                }
                return result;
              }, []));
            }, []),
            note: entry.name || ''
          };
        }),
        ticket_token: self.model.orderTicket.token,
        seat_token: self._ChatModel.giftSeat,
        options: options
      };

      return new Promise(function (resolve, reject) {
        self._DtsApi.waiter.placeOrder(request).then(function (response) {
          if (response.item_tokens) {
            for (var i = 0; i < response.item_tokens.length; i++) {
              self.model.orderCart[i].request = response.item_tokens[i];
            }
          }

          self.model.orderTicket = { token: response.ticket_token };

          self.model.orderCheck = self.model.orderCheck.concat(self.model.orderCart);
          self.clearCart();

          self._ChatModel.giftSeat = null;

          var watcher = self._createWatcher(self.model.REQUEST_KIND_ORDER, response);
          resolve(watcher);
        }, reject);
      });
    }
  }, {
    key: 'requestCloseout',
    value: function requestCloseout() {
      var self = this;
      var request = {
        kind: this.model.REQUEST_KIND_CLOSEOUT,
        ticket_token: this.model.orderTicket.token
      };

      return this._DtsApi.waiter.placeRequest(request).then(function (response) {
        self.model.orderTicket = { token: response.ticket_token };
        return self._createWatcher(self.model.REQUEST_KIND_CLOSEOUT, response);
      });
    }
  }, {
    key: 'requestAssistance',
    value: function requestAssistance() {
      var self = this;
      var request = {
        kind: this.model.REQUEST_KIND_ASSISTANCE,
        ticket_token: this.model.orderTicket.token
      };

      return this._DtsApi.waiter.placeRequest(request).then(function (response) {
        self._saveTicket(response);
        return self._createWatcher(self.model.REQUEST_KIND_ASSISTANCE, response);
      });
    }
  }, {
    key: 'calculatePrice',
    value: function calculatePrice(entry) {
      var modifiers = entry.modifiers.reduce(function (total, category) {
        return total + category.modifiers.reduce(function (total, modifier) {
          return total + (modifier.isSelected && modifier.data.price > 0 ? modifier.data.price : 0);
        }, 0);
      }, 0);

      return entry.quantity * (modifiers + entry.item.order.price);
    }
  }, {
    key: 'calculateTotalPrice',
    value: function calculateTotalPrice(entries) {
      return entries ? entries.reduce(function (total, entry) {
        return total + OrderManager.prototype.calculatePrice(entry);
      }, 0) : 0;
    }
  }, {
    key: 'calculateTax',
    value: function calculateTax(entries) {
      return this.calculateTotalPrice(entries) * this.model.tax;
    }
  }, {
    key: 'uploadSignature',
    value: function uploadSignature(data) {
      return this._DtsApi.upload.uploadTemp(data, 'image/png', 'signature.png').then(function (response) {
        return response.token;
      });
    }
  }, {
    key: 'generatePaymentToken',
    value: function generatePaymentToken() {
      var self = this;

      if (this._CustomerModel.isAuthenticated && !this._CustomerModel.isGuest) {
        return this._DtsApi.customer.initializePayment().then(function (response) {
          self._savePaymentToken(response);
        });
      }

      return this._DtsApi.waiter.initializePayment().then(function (response) {
        self._savePaymentToken(response);
      });
    }
  }, {
    key: 'payOrder',
    value: function payOrder(request) {
      request.ticket_token = this.model.orderTicket.token;
      request.payment_token = this.model.orderTicket.payment_token;
      return this._DtsApi.waiter.submitCheckoutPayment(request);
    }
  }, {
    key: 'requestReceipt',
    value: function requestReceipt(request) {
      request.ticket_token = this.model.orderTicket.token;
      return this._DtsApi.waiter.requestReceipt(request);
    }
  }, {
    key: '_saveTicket',
    value: function _saveTicket(response) {
      this.model.orderTicket = {
        token: response.ticket_token,
        payment_token: this.model.orderTicket.payment_token
      };
    }
  }, {
    key: '_savePaymentToken',
    value: function _savePaymentToken(response) {
      this.model.orderTicket = {
        token: this.model.orderTicket.token,
        payment_token: response.token
      };
    }
  }, {
    key: '_createWatcher',
    value: function _createWatcher(kind, ticket) {
      var watcher = new app.RequestWatcher(ticket, this._DtsApi);
      this.model.addWatcher(kind, watcher);

      return watcher;
    }
  }, {
    key: 'model',
    get: function get() {
      return this._OrderModel;
    }
  }]);

  return OrderManager;
})();

//src/js/shared/managers/sessionmanager.js

window.app.SessionManager = (function () {
  function SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, storageProvider, Logger) {
    var _this = this;

    _classCallCheck(this, SessionManager);

    var self = this;

    this.sessionStarted = new signals.Signal();
    this.sessionEnded = new signals.Signal();

    this._SNAPEnvironment = SNAPEnvironment;
    this._AnalyticsModel = AnalyticsModel;
    this._CustomerModel = CustomerModel;
    this._LocationModel = LocationModel;
    this._OrderModel = OrderModel;
    this._SurveyModel = SurveyModel;
    this._Logger = Logger;

    this._store = storageProvider('snap_seat_session');
    this._store.read().then(function (data) {
      self._session = data;

      if (!data) {
        self._startSession();
      }
    });

    this._CustomerModel.profileChanged.add(function (customer) {
      if (!self._session || !customer) {
        return;
      }

      self._session.customer = customer.token;
      self._store.write(_this._session);
    });

    this._LocationModel.seatChanged.add(function (seat) {
      if (!self._session || !seat) {
        return;
      }

      self._session.seat = seat.token;
      self._store.write(_this._session);
    });

    this._OrderModel.orderTicketChanged.add(function (ticket) {
      if (!self._session || !ticket || !ticket.token) {
        return;
      }

      self._session.ticket = ticket.token;
      self._store.write(_this._session);
    });
  }

  _createClass(SessionManager, [{
    key: 'endSession',
    value: function endSession() {
      if (!this._session) {
        return;
      }

      this._Logger.debug('Seat session ' + this._session.id + ' ended.');

      var s = this._session;
      s.ended = new Date();

      this._session = null;
      this._store.clear();

      this._AnalyticsModel.logSession(s);

      this.sessionEnded.dispatch(s);
    }
  }, {
    key: '_startSession',
    value: function _startSession() {
      var seat = this._LocationModel.seat;

      this._session = {
        id: this._generateID(),
        seat: seat ? seat.token : undefined,
        platform: this._SNAPEnvironment.platform,
        started: new Date()
      };

      this._Logger.debug('Seat session ' + this._session.id + ' started.');

      this._store.write(this._session);
      this.sessionStarted.dispatch(this._session);
    }
  }, {
    key: '_generateID',
    value: function _generateID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }, {
    key: 'session',
    get: function get() {
      return this._session;
    }
  }, {
    key: 'guestCount',
    get: function get() {
      return this._session.guest_count || 1;
    },
    set: function set(value) {
      if (this._session.guest_count === value) {
        return;
      }

      this._session.guest_count = value;
      this._store.write(this._session);
    }
  }, {
    key: 'specialEvent',
    get: function get() {
      return this._session.special_event;
    },
    set: function set(value) {
      if (this._session.special_event === value) {
        return;
      }

      this._session.special_event = value;
      this._store.write(this._session);
    }
  }]);

  return SessionManager;
})();

//src/js/shared/managers/shellmanager.js

window.app.ShellManager = (function () {
  function ShellManager($sce, DataProvider, ShellModel, Config, Environment, Hosts) {
    _classCallCheck(this, ShellManager);

    this.$$sce = $sce;
    this._DataProvider = DataProvider;
    this._ShellModel = ShellModel;
    this._Config = Config;
    this._Environment = Environment;
    this._Hosts = Hosts;

    this.locale = Config.locale;
  }

  _createClass(ShellManager, [{
    key: 'initialize',
    value: function initialize() {
      var self = this;

      this._DataProvider.backgrounds().then(function (response) {
        self._ShellModel.backgrounds = response.main.map(function (item) {
          return {
            media: item.src
          };
        });

        self._ShellModel.screensavers = response.screensaver.map(function (item) {
          return {
            media: item.src
          };
        });

        self._ShellModel.pageBackgrounds = response.pages.map(function (item) {
          return {
            media: item.background.src,
            destination: item.destination
          };
        });
      });

      this._DataProvider.elements().then(function (response) {
        var layout = self._Config.theme.layout;

        var elements = {};

        switch (layout) {
          case 'classic':
            elements = {
              'button_home': self.getAssetUrl('images/button-home.png'),
              'button_back': self.getAssetUrl('images/button-back.png'),
              'button_cart': self.getAssetUrl('images/button-cart.png'),
              'button_rotate': self.getAssetUrl('images/button-rotate.png'),
              'button_waiter': self.getAssetUrl('images/button-assistance.png'),
              'button_check': self.getAssetUrl('images/button-closeout.png'),
              'button_survey': self.getAssetUrl('images/button-survey.png'),
              'button_chat': self.getAssetUrl('images/button-chat.png')
            };
            break;
          case 'galaxies':
            elements = {
              'button_back': self.getAssetUrl('images/button-back.png'),
              'button_rotate': self.getAssetUrl('images/button-rotate.png'),
              'button_settings': self.getAssetUrl('images/button-settings.png'),
              'location_logo': self.getAssetUrl('images/button-logo.png')
            };
            break;
        }

        for (var i = 0; i < response.elements.length; i++) {
          var element = response.elements[i];
          elements[element.slot] = element.src;
        }

        self._ShellModel.elements = elements;
      });
    }
  }, {
    key: 'formatPrice',
    value: function formatPrice(price) {
      return this._ShellModel.priceFormat.replace(/{(\d+)}/g, function () {
        return price.toFixed(2);
      });
    }
  }, {
    key: 'getPageBackgrounds',
    value: function getPageBackgrounds(location) {
      return this._ShellModel.pageBackgrounds.filter(function (item) {
        return item.destination.type === location.type && (item.destination.token === location.token && location.token || item.destination.url === location.url && location.url);
      });
    }
  }, {
    key: 'getAppUrl',
    value: function getAppUrl(url) {
      var host = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      return host + url;
    }
  }, {
    key: 'getAssetUrl',
    value: function getAssetUrl(file) {
      var path = this._getPath(this._Hosts['static']);

      return this.$$sce.trustAsResourceUrl(path + 'assets/' + this._Config.theme.layout + '/' + file);
    }
  }, {
    key: 'getPartialUrl',
    value: function getPartialUrl(name) {
      return this.getAssetUrl('partials/' + name + '.html');
    }
  }, {
    key: 'getMediaUrl',
    value: function getMediaUrl(media, width, height, extension) {
      if (!media) {
        return null;
      }

      var path = this._getPath(this._Hosts.media);

      if (typeof media === 'string' || media instanceof String) {
        if (media.substring(0, 4) !== 'http' && media.substring(0, 2) !== '//') {
          extension = extension || 'jpg';
          return this.$$sce.trustAsResourceUrl(path + 'media/' + media + '_' + width + '_' + height + '.' + extension);
        }

        return media;
      }

      if (!media.token) {
        return media;
      }

      var type = this.getMediaType(media);
      var url = path + 'media/' + media.token;

      if (!type) {
        return null;
      } else if (type === 'video') {
        url += '.webm';
      } else if (type === 'flash') {
        url += '.swf';
      } else if (type === 'image') {
        if (width && height) {
          url += '_' + width + '_' + height;
        }

        if (extension) {
          url += '.' + extension;
        } else {
          if (!media || !media.mime_type) {
            return undefined;
          }
          switch (media.mime_type) {
            case 'image/png':
              url += '.png';
              break;
            default:
              url += '.jpg';
              break;
          }
        }
      }

      return this.$$sce.trustAsResourceUrl(url);
    }
  }, {
    key: 'getMediaType',
    value: function getMediaType(media) {
      if (!media || !media.mime_type) {
        return undefined;
      }

      if (media.mime_type.substring(0, 5) === 'image') {
        return 'image';
      } else if (media.mime_type.substring(0, 5) === 'video') {
        return 'video';
      } else if (media.mime_type === 'application/x-shockwave-flash') {
        return 'flash';
      }

      return undefined;
    }
  }, {
    key: '_getPath',
    value: function _getPath(res) {
      var path = '';

      if (res.protocol) {
        path += res.profocol + '://';
      } else if (res.secure) {
        path += 'https://';
      } else if (res.secure === false) {
        path += 'http://';
      }

      if (res.host) {
        if (!res.protocol) {
          path += '//';
        }
        path += res.host;
      }

      if (res.path) {
        path += res.path;
      }

      if (path.length > 0 && !path.endsWith('/')) {
        path += '/';
      }

      return path;
    }
  }, {
    key: 'locale',
    get: function get() {
      return this._locale;
    },
    set: function set(value) {
      if (this._locale === value) {
        return;
      }
      this._locale = value;

      var format = '{0}',
          currency = '';

      switch (this._locale) {
        case 'ro_MD':
          format = '{0} Lei';
          currency = '';
          break;
        case 'zh_MO':
          format = 'MOP$ {0}';
          currency = '';
          break;
        case 'en_US':
          format = '${0}';
          currency = 'USD';
          break;
      }

      this._ShellModel.priceFormat = format;
      this._ShellModel.currency = currency;
    }
  }, {
    key: 'model',
    get: function get() {
      return this._ShellModel;
    }
  }, {
    key: 'tileStyle',
    get: function get() {
      var style = 'tile';

      switch (this._Config.theme.tiles_style) {
        case 'regular':
          style += ' tile-regular';
          break;
      }
      //style += ' tile-regular';
      return style;
    }
  }, {
    key: 'predicateEven',
    get: function get() {
      var index = 0;
      return function () {
        return index++ % 2 === 1;
      };
    }
  }, {
    key: 'predicateOdd',
    get: function get() {
      var index = 0;
      return function () {
        return index++ % 2 === 0;
      };
    }
  }]);

  return ShellManager;
})();

//src/js/shared/managers/socialmanager.js

(function () {

  /* global URI */

  //------------------------------------------------------------------------
  //
  //  SocialManager
  //
  //------------------------------------------------------------------------

  var SocialManager = function SocialManager(SNAPEnvironment, DtsApi, WebBrowser, Logger) {
    this._SNAPEnvironment = SNAPEnvironment;
    this._DtsApi = DtsApi;
    this._WebBrowser = WebBrowser;
    this._Logger = Logger;
  };

  window.app.SocialManager = SocialManager;

  //-----------------------------------------------
  //    Login
  //-----------------------------------------------

  SocialManager.prototype.loginFacebook = function () {
    var self = this,
        facebookApp = this._SNAPEnvironment.facebook_application,
        customerApp = this._SNAPEnvironment.customer_application;

    return new Promise(function (resolve, reject) {
      function dispose() {
        self._WebBrowser.onNavigated.remove(onNavigated);
        self._WebBrowser.close();
      }

      var _reject = reject,
          _resolve = resolve;
      reject = function (e) {
        self._Logger.debug('Unable to login with Facebook: ' + e);
        dispose();
        _reject(e);
      };
      resolve = function (data) {
        self._Logger.debug('Facebook login complete.');
        dispose();
        _resolve(data);
      };

      function onNavigated(url) {
        if (url.indexOf(facebookApp.redirect_url) === 0) {
          var facebookAuth = URI('?' + URI(url).fragment()).search(true);

          if (facebookAuth.error || !facebookAuth.access_token) {
            self._Logger.debug('Facebook callback error: ' + facebookAuth.error);
            return reject(facebookAuth.error);
          }

          self._Logger.debug('Facebook callback received.');

          self._DtsApi.customer.signUpFacebook({
            access_token: facebookAuth.access_token,
            client_id: customerApp.client_id
          }).then(function (ticket) {
            self._Logger.debug('Facebook signin complete.');

            var url = self._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
              client_id: customerApp.client_id,
              response_type: 'token',
              redirect_uri: customerApp.callback_url
            });

            self._WebBrowser.open(url);
          }, reject);
        } else if (url.indexOf(customerApp.callback_url) === 0) {
          var customerAuth = URI('?' + URI(url).fragment()).search(true);

          if (customerAuth.error || !customerAuth.access_token) {
            self._Logger.debug('Facebook customer callback error: ' + customerAuth.error);
            return reject(customerAuth.error);
          }

          self._Logger.debug('Facebook customer login complete.');

          resolve(customerAuth);
        }
      }

      self._WebBrowser.onNavigated.add(onNavigated);

      self._Logger.debug('Logging in with Facebook.');

      var url = URI('https://www.facebook.com/dialog/oauth').addSearch('client_id', facebookApp.client_id).addSearch('redirect_uri', facebookApp.redirect_url).addSearch('response_type', 'token').addSearch('scope', 'public_profile,email').toString();

      self._WebBrowser.open(url);
    });
  };

  SocialManager.prototype.loginGooglePlus = function () {
    var self = this,
        googleplusApp = this._SNAPEnvironment.googleplus_application,
        customerApp = this._SNAPEnvironment.customer_application;

    return new Promise(function (resolve, reject) {
      var state = self._generateToken();

      function dispose() {
        self._WebBrowser.onNavigated.remove(onNavigated);
        self._WebBrowser.close();
      }

      var _reject = reject,
          _resolve = resolve;
      reject = function (e) {
        self._Logger.debug('Unable to login with Google: ' + e);
        dispose();
        _reject(e);
      };
      resolve = function (data) {
        self._Logger.debug('Google login complete.');
        dispose();
        _resolve(data);
      };

      function onNavigated(url) {
        if (url.indexOf(googleplusApp.redirect_url) === 0) {
          var googleplusAuth = URI(url).search(true);

          if (googleplusAuth.error || !googleplusAuth.code || googleplusAuth.state !== state) {
            self._Logger.debug('Google callback error: ' + googleplusAuth.error);
            return reject(googleplusAuth.error);
          }

          self._Logger.debug('Google callback received.');

          self._DtsApi.customer.signUpGooglePlus({
            code: googleplusAuth.code,
            client_id: customerApp.client_id
          }).then(function (ticket) {
            self._Logger.debug('Google signin complete.');

            var url = self._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
              client_id: customerApp.client_id,
              response_type: 'token',
              redirect_uri: customerApp.callback_url
            });

            self._WebBrowser.open(url);
          }, reject);
        } else if (url.indexOf(customerApp.callback_url) === 0) {
          var customerAuth = URI('?' + URI(url).fragment()).search(true);

          if (customerAuth.error || !customerAuth.access_token) {
            self._Logger.debug('Google customer callback error: ' + customerAuth.error);
            return reject(customerAuth.error);
          }

          self._Logger.debug('Google customer login complete.');

          resolve(customerAuth);
        }
      }

      self._WebBrowser.onNavigated.add(onNavigated);

      self._Logger.debug('Logging in with Google.');

      var url = URI('https://accounts.google.com/o/oauth2/auth').addSearch('client_id', googleplusApp.client_id).addSearch('redirect_uri', googleplusApp.redirect_url).addSearch('response_type', 'code').addSearch('scope', 'https://www.googleapis.com/auth/plus.login email').addSearch('access_type', 'offline').addSearch('state', state).toString();

      self._WebBrowser.open(url);
    });
  };

  SocialManager.prototype.loginTwitter = function () {
    var self = this,
        twitterApp = this._SNAPEnvironment.twitter_application,
        customerApp = this._SNAPEnvironment.customer_application;

    return new Promise(function (resolve, reject) {
      var tokenSecret;

      function dispose() {
        self._WebBrowser.onNavigated.remove(onNavigated);
        self._WebBrowser.close();
      }

      var _reject = reject,
          _resolve = resolve;
      reject = function (e) {
        self._Logger.debug('Unable to login with Twitter: ' + e);
        dispose();
        _reject(e);
      };
      resolve = function (data) {
        self._Logger.debug('Twitter login complete.');
        dispose();
        _resolve(data);
      };

      function onNavigated(url) {
        if (url.indexOf(twitterApp.redirect_url) === 0) {
          var twitterAuth = URI(url).search(true);

          if (twitterAuth.error || !twitterAuth.oauth_verifier) {
            self._Logger.debug('Twitter callback error: ' + twitterAuth.error);
            return reject(twitterAuth.error);
          }

          self._Logger.debug('Twitter callback received.');

          self._DtsApi.customer.signUpTwitter({
            client_id: customerApp.client_id,
            request_token: twitterAuth.oauth_token,
            request_token_secret: tokenSecret,
            request_token_verifier: twitterAuth.oauth_verifier
          }).then(function (ticket) {
            self._Logger.debug('Twitter signin complete.');

            var url = self._DtsApi.oauth2.getAuthConfirmUrl(ticket.ticket_id, {
              client_id: customerApp.client_id,
              response_type: 'token',
              redirect_uri: customerApp.callback_url
            });

            self._WebBrowser.open(url);
          }, reject);
        } else if (url.indexOf(customerApp.callback_url) === 0) {
          var customerAuth = URI('?' + URI(url).fragment()).search(true);

          if (customerAuth.error || !customerAuth.access_token) {
            self._Logger.debug('Twitter customer callback error: ' + customerAuth.error);
            return reject(customerAuth.error);
          }

          self._Logger.debug('Twitter customer login complete.');

          resolve(customerAuth);
        }
      }

      self._WebBrowser.onNavigated.add(onNavigated);

      self._Logger.debug('Logging in with Twitter.');

      self._DtsApi.customer.signUpTwitterRequestToken({
        oauth_callback: twitterApp.redirect_url
      }).then(function (token) {
        var url = URI('https://api.twitter.com/oauth/authenticate').addSearch('oauth_token', token.oauth_token).addSearch('force_login', 'true').toString();

        self._Logger.debug('Twitter request token received.');

        tokenSecret = token.oauth_token_secret;
        self._WebBrowser.open(url);
      }, reject);
    });
  };

  //-----------------------------------------------
  //    Helpers
  //-----------------------------------------------

  SocialManager.prototype._generateToken = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };
})();

//src/js/shared/managers/softwaremanager.js

(function () {

  //------------------------------------------------------------------------
  //
  //  SoftwareManager
  //
  //------------------------------------------------------------------------

  var SoftwareManager = function SoftwareManager(SNAPEnvironment) {
    this._SNAPEnvironment = SNAPEnvironment;
  };

  window.app.SoftwareManager = SoftwareManager;

  Object.defineProperty(SoftwareManager.prototype, 'currentVersion', {
    get: function get() {
      var pattern = /(SNAP)\/([0-9.]+)/,
          match = pattern.exec(navigator.userAgent);

      if (!match) {
        return '8.8.8.8';
      }

      return match[1];
    }
  });

  Object.defineProperty(SoftwareManager.prototype, 'requiredVersion', {
    get: function get() {
      return this._SNAPEnvironment.requirements[this._SNAPEnvironment.platform];
    }
  });

  Object.defineProperty(SoftwareManager.prototype, 'updateRequired', {
    get: function get() {
      return this._versionCompare(this.currentVersion, this.requiredVersion) === -1;
    }
  });

  SoftwareManager.prototype._versionCompare = function (v1, v2, options) {
    if (!v1 || !v2) {
      return 0;
    }

    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
      return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
      return NaN;
    }

    if (zeroExtend) {
      while (v1parts.length < v2parts.length) {
        v1parts.push('0');
      }
      while (v2parts.length < v1parts.length) {
        v2parts.push('0');
      }
    }

    if (!lexicographical) {
      v1parts = v1parts.map(Number);
      v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
      if (v2parts.length === i) {
        return 1;
      }

      if (v1parts[i] === v2parts[i]) {
        continue;
      } else if (v1parts[i] > v2parts[i]) {
        return 1;
      } else {
        return -1;
      }
    }

    if (v1parts.length !== v2parts.length) {
      return -1;
    }

    return 0;
  };
})();

//src/js/shared/managers/surveymanager.js

window.app.SurveyManager = (function () {
  function SurveyManager(DataProvider, SurveyModel) {
    _classCallCheck(this, SurveyManager);

    var self = this;

    this._DataProvider = DataProvider;
    this._SurveyModel = SurveyModel;

    if (this._SurveyModel.isEnabled) {
      this._DataProvider.surveys().then(function (data) {
        self._SurveyModel.feedbackSurvey = data.surveys[0];
      });
    }
  }

  _createClass(SurveyManager, [{
    key: 'reset',
    value: function reset() {
      var self = this;
      return new Promise(function (resolve, reject) {
        if (self._SurveyModel.isEnabled) {
          self._SurveyModel.feedbackSurveyComplete = false;
        }

        resolve();
      });
    }
  }, {
    key: 'model',
    get: function get() {
      return this._SurveyModel;
    }
  }]);

  return SurveyManager;
})();

//src/js/shared/model/abstractmodel.js

window.app.AbstractModel = (function () {
  /* global signals */

  function AbstractModel(storageProvider) {
    _classCallCheck(this, AbstractModel);

    this._storageProvider = storageProvider;
    this._properties = {};
  }

  _createClass(AbstractModel, [{
    key: '_defineProperty',
    value: function _defineProperty(name, storeName, defaultValue, providerFunction) {
      var self = this,
          property = this._properties[name] = { name: '_' + name };

      if (storeName) {
        property.store = this._storageProvider(storeName);
      }

      if (providerFunction) {
        property.provider = providerFunction;
      }

      this[name + 'Changed'] = property.signal = new signals.Signal();

      Object.defineProperty(this, name, {
        get: function get() {
          return self[property.name] || defaultValue;
        },
        set: function set(value) {
          if (value === self[property.name]) {
            return;
          }

          self[property.name] = value;

          if (property.store) {
            property.store.write(value).then(function () {
              property.signal.dispatch(value);
            });
          }
        }
      });
    }
  }, {
    key: '_initProperty',
    value: function _initProperty(name) {
      var self = this,
          property = this._properties[name];

      if (!property) {
        throw new Error('Property \'' + name + '\' not found.');
      }

      if (property.initialized) {
        throw new Error('Property \'' + name + '\' is already initialized.');
      }

      if (!property.store) {
        property.initialized = true;
        return Promise.resolve();
      }

      return property.store.read().then(function (value) {
        property.initialized = true;
        self[property.name] = value;
        property.signal.dispatch(value);
      });
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      return Promise.all(Object.keys(this._properties).filter(function (key) {
        return !_this2._properties[key].initialized;
      }).map(function (key) {
        return _this2._initProperty(key);
      }));
    }
  }, {
    key: 'fetch',
    value: function fetch(propertyName) {
      var property = this._properties[propertyName];

      if (!property) {
        throw new Error('Property \'' + propertyName + '\' not found.');
      }

      if (!property.provider) {
        throw new Error('Property \'' + propertyName + '\' has no provider.');
      }

      var self = this;
      return property.provider().then(function (value) {
        self[propertyName] = value;
        return value;
      });
    }
  }, {
    key: 'fetchAll',
    value: function fetchAll() {
      var _this3 = this;

      return Promise.all(Object.keys(this._properties).filter(function (key) {
        return _this3._properties[key].provider;
      }).map(function (key) {
        return _this3.fetch(key);
      }));
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this4 = this;

      return Promise.all(Object.keys(this._properties).filter(function (key) {
        return _this4._properties[key].store;
      }).map(function (key) {
        return _this4._properties[key].store.clear();
      }));
    }
  }, {
    key: '_propertyChanged',
    value: function _propertyChanged(name) {
      var property = this._properties[name];

      property.signal.dispatch(this[property.name]);

      if (property.store) {
        property.store.write(this[property.name]);
      }
    }
  }]);

  return AbstractModel;
})();

//src/js/shared/model/analyticsmodel.js

window.app.AnalyticsModel = (function () {
  function AnalyticsModel(storageProvider, heatmap) {
    _classCallCheck(this, AnalyticsModel);

    var self = this;
    this._data = [new app.AnalyticsData('sessions', storageProvider), new app.AnalyticsData('advertisements', storageProvider), new app.AnalyticsData('answers', storageProvider), new app.AnalyticsData('chats', storageProvider), new app.AnalyticsData('comments', storageProvider), new app.AnalyticsData('clicks', storageProvider), new app.AnalyticsData('pages', storageProvider), new app.AnalyticsData('urls', storageProvider)].reduce(function (result, item) {
      result[item.name] = item;
      return result;
    }, {});

    heatmap.clicked.add(function (click) {
      self._logClick(click);
    });
  }

  _createClass(AnalyticsModel, [{
    key: 'logSession',
    value: function logSession(session) {
      this._data.sessions.push(session);
    }
  }, {
    key: 'logNavigation',
    value: function logNavigation(destination) {
      this._data.pages.push({
        time: new Date(),
        destination: destination
      });

      this._data.clicks.store();
    }
  }, {
    key: 'logAdvertisement',
    value: function logAdvertisement(advertisement) {
      this._data.advertisements.push({
        time: new Date(),
        advertisement: advertisement
      });
    }
  }, {
    key: 'logAnswer',
    value: function logAnswer(answer) {
      this._data.answers.push({
        time: new Date(),
        answer: answer
      });
    }
  }, {
    key: 'logChat',
    value: function logChat(chat) {
      this._data.chats.push({
        time: new Date(),
        chat: chat
      });
    }
  }, {
    key: 'logComment',
    value: function logComment(comment) {
      this._data.comments.push({
        time: new Date(),
        comment: comment
      });
    }
  }, {
    key: 'logUrl',
    value: function logUrl(url) {
      this._data.urls.push({
        time: new Date(),
        url: url
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      for (var k in this._data) {
        this._data[k].reset();
      }
    }
  }, {
    key: '_logClick',
    value: function _logClick(click) {
      click.time = new Date();
      this._data.clicks.data.push(click);
    }
  }, {
    key: 'sessions',
    get: function get() {
      return this._data.sessions;
    }
  }, {
    key: 'pages',
    get: function get() {
      return this._data.pages;
    }
  }, {
    key: 'advertisements',
    get: function get() {
      return this._data.advertisements;
    }
  }, {
    key: 'answers',
    get: function get() {
      return this._data.answers;
    }
  }, {
    key: 'chats',
    get: function get() {
      return this._data.chats;
    }
  }, {
    key: 'comments',
    get: function get() {
      return this._data.comments;
    }
  }, {
    key: 'urls',
    get: function get() {
      return this._data.urls;
    }
  }, {
    key: 'clicks',
    get: function get() {
      this._data.clicks.store();

      return this._data.clicks;
    }
  }]);

  return AnalyticsModel;
})();

//src/js/shared/model/cartmodel.js

window.app.CartModel = (function () {
  function CartModel() {
    _classCallCheck(this, CartModel);

    this.STATE_CART = 'cart';
    this.STATE_HISTORY = 'history';

    this._isCartOpen = false;
    this.isCartOpenChanged = new signals.Signal();
    this._cartState = this.STATE_CART;
    this.cartStateChanged = new signals.Signal();
    this._editableItem = null;
    this.editableItemChanged = new signals.Signal();
  }

  _createClass(CartModel, [{
    key: 'openEditor',
    value: function openEditor(item, isNew) {
      if (this._editableItem === item) {
        return;
      }
      this._editableItemNew = isNew || false;
      this._editableItem = item;
      this.editableItemChanged.dispatch(item);
    }
  }, {
    key: 'closeEditor',
    value: function closeEditor() {
      this._editableItemNew = false;
      this._editableItem = null;
      this.editableItemChanged.dispatch(null);
    }
  }, {
    key: 'isCartOpen',
    get: function get() {
      return this._isCartOpen;
    },
    set: function set(value) {
      if (this._isCartOpen === value) {
        return;
      }
      this._isCartOpen = value;
      this.isCartOpenChanged.dispatch(value);
    }
  }, {
    key: 'cartState',
    get: function get() {
      return this._cartState;
    },
    set: function set(value) {
      if (this._cartState === value) {
        return;
      }
      this._cartState = value;
      this.cartStateChanged.dispatch(value);
    }
  }, {
    key: 'editableItem',
    get: function get() {
      return this._editableItem;
    }
  }, {
    key: 'editableItemNew',
    get: function get() {
      return this._editableItemNew;
    }
  }]);

  return CartModel;
})();

//src/js/shared/model/chatmodel.js

window.app.ChatModel = (function () {
  /* global signals */

  function ChatModel(SNAPLocation, SNAPEnvironment, storageProvider) {
    _classCallCheck(this, ChatModel);

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

    this._preferencesStore.read().then(function (prefs) {
      if (!prefs) {
        return;
      }

      self._isEnabled = Boolean(prefs.is_enabled);

      self._activeDevices = prefs.active_devices || [];
      self._pendingDevices = prefs.pending_devices || [];
      self._lastReads = prefs.last_reads || {};
    });

    this._historyStore.read().then(function (history) {
      self._history = history || [];
    });
  }

  _createClass(ChatModel, [{
    key: 'isActiveDevice',
    value: function isActiveDevice(device) {
      return this.activeDevices.indexOf(device.token || device) !== -1;
    }
  }, {
    key: 'isPendingDevice',
    value: function isPendingDevice(device) {
      return this.pendingDevices.indexOf(device.token || device) !== -1;
    }
  }, {
    key: 'addActiveDevice',
    value: function addActiveDevice(device) {
      this._activeDevices.push(device.token || device);
      this.activeDevices = this._activeDevices;
    }
  }, {
    key: 'addPendingDevice',
    value: function addPendingDevice(device) {
      this._pendingDevices.push(device.token || device);
      this.pendingDevices = this._pendingDevices;
    }
  }, {
    key: 'removeActiveDevice',
    value: function removeActiveDevice(device) {
      var index = this.activeDevices.indexOf(device.token || device);
      this._activeDevices.splice(index, 1);
      this.activeDevices = this._activeDevices;
    }
  }, {
    key: 'removePendingDevice',
    value: function removePendingDevice(device) {
      var index = this.pendingDevices.indexOf(device.token || device);
      this._pendingDevices.splice(index, 1);
      this.pendingDevices = this._pendingDevices;
    }
  }, {
    key: 'addHistory',
    value: function addHistory(message) {
      this._history.push(message);
      this.history = this._history;
    }
  }, {
    key: 'getLastRead',
    value: function getLastRead(device) {
      var token = device.token || device;
      return this._lastReads[token] || null;
    }
  }, {
    key: 'setLastRead',
    value: function setLastRead(device, value) {
      var token = device.token || device;
      this._lastReads[token] = value;
      this._updatePreferences();
    }
  }, {
    key: 'save',
    value: function save() {
      this._updateHistory();
      this._updatePreferences();
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._isConnected = this._isEnabled = this._isPresent = false;
      this._history = [];
      this._activeDevices = [];
      this._pendingDevices = [];

      this._historyStore.clear();
      this._preferencesStore.clear();
    }
  }, {
    key: '_updateHistory',
    value: function _updateHistory() {
      this._historyStore.write(this.history);
    }
  }, {
    key: '_updatePreferences',
    value: function _updatePreferences() {
      this._preferencesStore.write({
        is_enabled: this.isEnabled,
        active_devices: this.activeDevices,
        pending_devices: this.pendingDevices,
        last_reads: this._lastReads
      });
    }
  }, {
    key: 'isConnected',
    get: function get() {
      return this._isConnected;
    },
    set: function set(value) {
      if (this._isConnected === value) {
        return;
      }

      this._isConnected = Boolean(value);
      this.isConnectedChanged.dispatch(this._isConnected);
    }
  }, {
    key: 'isEnabled',
    get: function get() {
      return this._isEnabled;
    },
    set: function set(value) {
      if (this._isEnabled === value) {
        return;
      }

      this._isEnabled = Boolean(value);
      this.isEnabledChanged.dispatch(this._isEnabled);

      this._updatePreferences();
    }
  }, {
    key: 'isPresent',
    get: function get() {
      return this._isPresent;
    },
    set: function set(value) {
      if (this._isPresent === value) {
        return;
      }

      this._isPresent = Boolean(value);
      this.isPresentChanged.dispatch(this._isPresent);
    }
  }, {
    key: 'giftDevice',
    get: function get() {
      return this._giftDevice;
    },
    set: function set(value) {
      if (this._giftDevice === value) {
        return;
      }

      this._giftDevice = value;
      this.giftDeviceChanged.dispatch(this._giftDevice);
    }
  }, {
    key: 'giftSeat',
    get: function get() {
      return this._giftSeat;
    },
    set: function set(value) {
      if (this._giftSeat === value) {
        return;
      }

      this._giftSeat = value;
      this.giftSeatChanged.dispatch(this._giftSeat);
    }
  }, {
    key: 'pendingDevices',
    get: function get() {
      return this._pendingDevices;
    },
    set: function set(value) {
      this._pendingDevices = value || [];
      this.pendingDevicesChanged.dispatch(this.pendingDevices);
    }
  }, {
    key: 'activeDevices',
    get: function get() {
      return this._activeDevices;
    },
    set: function set(value) {
      this._activeDevices = value || [];
      this.activeDevicesChanged.dispatch(this.activeDevices);
    }
  }, {
    key: 'history',
    get: function get() {
      return this._history;
    },
    set: function set(value) {
      this._history = value || [];

      this.historyChanged.dispatch(this._history);
      this._updateHistory();
    }
  }]);

  return ChatModel;
})();

//src/js/shared/model/customermodel.js

window.app.CustomerModel = (function () {
  /* global signals */

  function CustomerModel(Config, storageProvider) {
    _classCallCheck(this, CustomerModel);

    var self = this;

    this._accountStore = storageProvider('snap_customer');

    this._profile = null;

    this._isGuest = false;
    this._isEnabled = Boolean(Config.accounts);

    this.profileChanged = new signals.Signal();

    this._accountStore.read().then(function (account) {
      self._isGuest = account && account.is_guest;

      if (!account || account.is_guest) {
        self._profile = null;
      } else {
        self._profile = account.profile;
      }

      self.profileChanged.dispatch(self._profile);
    });
  }

  _createClass(CustomerModel, [{
    key: 'isEnabled',
    get: function get() {
      return Boolean(this._isEnabled);
    }
  }, {
    key: 'isAuthenticated',
    get: function get() {
      return this.isEnabled && (Boolean(this.profile) || this.isGuest);
    }
  }, {
    key: 'isGuest',
    get: function get() {
      return this.isEnabled && Boolean(this._isGuest);
    }
  }, {
    key: 'hasCredentials',
    get: function get() {
      return Boolean(this.isAuthenticated && !this.isGuest && this.profile.type === 1);
    }
  }, {
    key: 'profile',
    get: function get() {
      return this._profile;
    },
    set: function set(value) {
      var self = this;
      this._profile = value || null;
      this._isGuest = value === 'guest';

      if (!value) {
        this._accountStore.clear().then(function () {
          self._isGuest = false;
          self.profileChanged.dispatch(self._profile);
          self.session = null;
        });
      } else {
        this._accountStore.write({
          profile: this._profile,
          is_guest: this._isGuest
        }).then(function () {
          self.profileChanged.dispatch(self._profile);

          if (!value || self._isGuest) {
            self.session = null;
          }
        });
      }
    }
  }]);

  return CustomerModel;
})();

//src/js/shared/model/locationmodel.js

window.app.LocationModel = (function (_app$AbstractModel) {
  _inherits(LocationModel, _app$AbstractModel);

  function LocationModel(DtsApi, SNAPEnvironment, SNAPLocation, storageProvider) {
    _classCallCheck(this, LocationModel);

    _get(Object.getPrototypeOf(LocationModel.prototype), 'constructor', this).call(this, storageProvider);

    var self = this;

    this._defineProperty('device', 'snap_device', null, function () {
      return DtsApi.hardware.getCurrentDevice();
    });
    this._defineProperty('devices', undefined, []);
    this._defineProperty('seat', 'snap_seat', null, function () {
      return DtsApi.location.getCurrentSeat();
    });
    this._defineProperty('seats', 'snap_seats', [], function () {
      return DtsApi.location.getSeats();
    });
    this._defineProperty('location', 'snap_location', SNAPLocation, function () {
      if (!self.device) {
        return Promise.reject('Device data is missing.');
      }

      return DtsApi.snap.getConfig(self.device.location_token);
    });

    this.initialize();
  }

  _createClass(LocationModel, [{
    key: 'addDevice',
    value: function addDevice(device) {
      this.devices.push(device);
      this._propertyChanged('device');
    }
  }, {
    key: 'getSeat',
    value: function getSeat(token) {
      return this.seats.filter(function (seat) {
        return seat.token === token;
      })[0] || null;
    }
  }, {
    key: 'getDevice',
    value: function getDevice(device) {
      return this.devices.filter(function (d) {
        return (device.token || device) === d.token;
      })[0] || null;
    }
  }]);

  return LocationModel;
})(app.AbstractModel);

//src/js/shared/model/ordermodel.js

window.app.OrderModel = (function () {
  /* global signals */

  function OrderModel(storageProvider) {
    _classCallCheck(this, OrderModel);

    var self = this;

    this.REQUEST_KIND_ORDER = 1;
    this.REQUEST_KIND_ASSISTANCE = 2;
    this.REQUEST_KIND_CLOSEOUT = 3;

    this.priceFormat = '{0}';
    this.tax = 0;

    this._orderCart = [];
    this._orderCartStash = [];
    this._orderCheck = [];
    this._orderTicket = {};

    this._requestWatchers = {};

    //-----------------------------------------------
    //    Signals
    //-----------------------------------------------

    this.orderCartChanged = new signals.Signal();
    this.orderCartStashChanged = new signals.Signal();
    this.orderCheckChanged = new signals.Signal();
    this.orderTicketChanged = new signals.Signal();
    this.orderRequestChanged = new signals.Signal();
    this.assistanceRequestChanged = new signals.Signal();
    this.closeoutRequestChanged = new signals.Signal();

    //-----------------------------------------------
    //    Initialization
    //-----------------------------------------------

    function prepareCartData(items) {
      return items;
    }

    function restoreCartData(items) {
      return items.map ? items.map(app.CartItem.prototype.restore) : [];
    }

    this._orderCartStorage = storageProvider('snap_order_cart');
    this._orderCartStorage.read().then(function (value) {
      self.orderCart = restoreCartData(value || []);
      self.orderCartChanged.dispatch(self.orderCart);
      self.orderCartChanged.add(function (items) {
        self._orderCartStorage.write(prepareCartData(items));
      });
    });

    this._orderCartStashStorage = storageProvider('snap_order_cart_stash');
    this._orderCartStashStorage.read().then(function (value) {
      self.orderCartStash = restoreCartData(value || []);
      self.orderCartStashChanged.dispatch(self.orderCartStash);
      self.orderCartStashChanged.add(function (items) {
        self._orderCartStashStorage.write(prepareCartData(items));
      });
    });

    this._orderCheckStorage = storageProvider('snap_order_check');
    this._orderCheckStorage.read().then(function (value) {
      self.orderCheck = restoreCartData(value || []);
      self.orderCheckChanged.dispatch(self.orderCheck);
      self.orderCheckChanged.add(function (items) {
        self._orderCheckStorage.write(prepareCartData(items));
      });
    });

    this._orderTicketStorage = storageProvider('snap_order_ticket');
    this._orderTicketStorage.read().then(function (value) {
      self.orderTicket = value || {};
      self.orderTicketChanged.dispatch(self.orderTicket);
      self.orderTicketChanged.add(function (data) {
        self._orderTicketStorage.write(data);
      });
    });
  }

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  _createClass(OrderModel, [{
    key: 'getWatcher',

    //------------------------------------------------------------------------
    //
    //  Public methods
    //
    //------------------------------------------------------------------------

    //-----------------------------------------------
    //    Request watchers
    //-----------------------------------------------

    value: function getWatcher(kind) {
      return this._requestWatchers[kind];
    }
  }, {
    key: 'addWatcher',
    value: function addWatcher(kind, watcher) {
      this.clearWatcher(kind);

      var self = this;
      watcher.promise.then(function () {
        if (self.getWatcher(kind) !== watcher) {
          return;
        }
        self.clearWatcher(kind);
      });

      this._requestWatchers[kind] = watcher;
      this._notifyChange(kind);
    }
  }, {
    key: 'clearWatcher',
    value: function clearWatcher(kind) {
      var watcher = this.getWatcher(kind);

      if (watcher) {
        watcher.dispose();
      }

      delete this._requestWatchers[kind];
      this._notifyChange(kind);
    }

    //------------------------------------------------------------------------
    //
    //  Private methods
    //
    //------------------------------------------------------------------------

  }, {
    key: '_notifyChange',
    value: function _notifyChange(kind) {
      var signal;

      switch (kind) {
        case this.REQUEST_KIND_ORDER:
          signal = this.orderRequestChanged;
          break;
        case this.REQUEST_KIND_ASSISTANCE:
          signal = this.assistanceRequestChanged;
          break;
        case this.REQUEST_KIND_CLOSEOUT:
          signal = this.closeoutRequestChanged;
          break;
      }

      if (signal) {
        signal.dispatch(this.getWatcher(kind));
      }
    }
  }, {
    key: 'orderCart',
    get: function get() {
      return this._orderCart;
    },
    set: function set(value) {
      this._orderCart = value || [];
      this.orderCartChanged.dispatch(this.orderCart);
    }
  }, {
    key: 'orderCartStash',
    get: function get() {
      return this._orderCartStash;
    },
    set: function set(value) {
      this._orderCartStash = value || [];
      this.orderCartStashChanged.dispatch(this.orderCartStash);
    }
  }, {
    key: 'orderCheck',
    get: function get() {
      return this._orderCheck;
    },
    set: function set(value) {
      this._orderCheck = value || [];
      this.orderCheckChanged.dispatch(this.orderCheck);
    }
  }, {
    key: 'orderTicket',
    get: function get() {
      return this._orderTicket;
    },
    set: function set(value) {
      this._orderTicket = value || {};
      this.orderTicketChanged.dispatch(this.orderTicket);
    }
  }, {
    key: 'orderRequest',
    get: function get() {
      return this.getWatcher(this.REQUEST_KIND_ORDER);
    }
  }, {
    key: 'assistanceRequest',
    get: function get() {
      return this.getWatcher(this.REQUEST_KIND_ASSISTANCE);
    }
  }, {
    key: 'closeoutRequest',
    get: function get() {
      return this.getWatcher(this.REQUEST_KIND_CLOSEOUT);
    }
  }]);

  return OrderModel;
})();

//src/js/shared/model/sessionmodel.js

window.app.SessionModel = (function (_app$AbstractModel2) {
  _inherits(SessionModel, _app$AbstractModel2);

  function SessionModel(storageProvider) {
    _classCallCheck(this, SessionModel);

    _get(Object.getPrototypeOf(SessionModel.prototype), 'constructor', this).call(this, storageProvider);

    this._defineProperty('apiToken', 'snap_accesstoken');
    this._defineProperty('customerToken', 'snap_customer_accesstoken');

    this.initialize();
  }

  return SessionModel;
})(app.AbstractModel);

//src/js/shared/model/shellmodel.js

window.app.ShellModel = (function () {
  /* global signals */

  function ShellModel() {
    _classCallCheck(this, ShellModel);

    this._backgrounds = [];
    this.backgroundsChanged = new signals.Signal();
    this._screensavers = [];
    this.screensaversChanged = new signals.Signal();
    this._pageBackgrounds = [];
    this.pageBackgroundsChanged = new signals.Signal();
    this._elements = [];
    this.elementsChanged = new signals.Signal();
    this._priceFormat = '{0}';
    this.priceFormatChanged = new signals.Signal();
    this._currency = '';
    this.currencyChanged = new signals.Signal();
  }

  _createClass(ShellModel, [{
    key: 'backgrounds',
    get: function get() {
      return this._backgrounds;
    },
    set: function set(value) {
      this._backgrounds = value;
      this.backgroundsChanged.dispatch(value);
    }
  }, {
    key: 'screensavers',
    get: function get() {
      return this._screensavers;
    },
    set: function set(value) {
      this._screensavers = value;
      this.screensaversChanged.dispatch(value);
    }
  }, {
    key: 'pageBackgrounds',
    get: function get() {
      return this._pageBackgrounds;
    },
    set: function set(value) {
      this._pageBackgrounds = value;
      this.pageBackgroundsChanged.dispatch(value);
    }
  }, {
    key: 'elements',
    get: function get() {
      return this._elements;
    },
    set: function set(value) {
      this._elements = value;
      this.elementsChanged.dispatch(value);
    }
  }, {
    key: 'priceFormat',
    get: function get() {
      return this._priceFormat;
    },
    set: function set(value) {
      this._priceFormat = value;
      this.priceFormatChanged.dispatch(value);
    }
  }, {
    key: 'currency',
    get: function get() {
      return this._currency;
    },
    set: function set(value) {
      this._currency = value;
      this.currencyChanged.dispatch(value);
    }
  }]);

  return ShellModel;
})();

//src/js/shared/model/surveymodel.js

window.app.SurveyModel = (function () {
  /* global signals */

  function SurveyModel(Config, storageProvider) {
    _classCallCheck(this, SurveyModel);

    var self = this;

    this._isEnabled = Boolean(Config.surveys);
    this._surveys = {};

    this._store = storageProvider('snap_survey');

    this._feedbackSurvey = null;
    this.feedbackSurveyChanged = new signals.Signal();

    this.surveyCompleted = new signals.Signal();

    this._store.read().then(function (value) {
      self._surveys = value || self._surveys;
    });
  }

  _createClass(SurveyModel, [{
    key: 'isEnabled',
    get: function get() {
      return Boolean(this._isEnabled);
    }
  }, {
    key: 'feedbackSurvey',
    get: function get() {
      return this._feedbackSurvey;
    },
    set: function set(value) {
      this._feedbackSurvey = value;
      this.feedbackSurveyChanged.dispatch(this._feedbackSurvey);
    }
  }, {
    key: 'feedbackSurveyComplete',
    get: function get() {
      return Boolean(this._surveys.feedback);
    },
    set: function set(value) {
      this._surveys.feedback = Boolean(value);
      this._store.write(this._surveys);

      this.surveyCompleted.dispatch(this.feedbackSurvey);
    }
  }]);

  return SurveyModel;
})();

//src/js/shared/persistence/appcache.js

(function () {
  /* global signals */

  //------------------------------------------------------------------------
  //
  //  AppCache
  //
  //------------------------------------------------------------------------

  var AppCache = function AppCache(Logger) {
    this._Logger = Logger;
    this._cache = window.applicationCache;
    this._appCacheEvents = ['cached', 'checking', 'downloading', 'cached', 'noupdate', 'obsolete', 'updateready', 'progress'];

    var status = this._getCacheStatus();

    this._Logger.debug('Cache status: ' + status);

    this.complete = new signals.Signal();
    this._isComplete = false;
    this._isUpdated = false;
    this._hadErrors = false;

    if (status === 'UNCACHED') {
      this._isComplete = true;
      this.complete.dispatch(false);
    }

    var self = this;
    this._errorHandler = function (e) {
      self._handleCacheError(e);
    };
    this._eventHandler = function (e) {
      self._handleCacheEvent(e);
    };

    this._addEventListeners();
  };

  Object.defineProperty(AppCache.prototype, 'isComplete', {
    get: function get() {
      return this._isComplete;
    }
  });

  Object.defineProperty(AppCache.prototype, 'isUpdated', {
    get: function get() {
      return this._isUpdated;
    }
  });

  Object.defineProperty(AppCache.prototype, 'hadErrors', {
    get: function get() {
      return this._hadErrors;
    }
  });

  AppCache.prototype._getCacheStatus = function () {
    switch (this._cache.status) {
      case this._cache.UNCACHED:
        return 'UNCACHED';
      case this._cache.IDLE:
        return 'IDLE';
      case this._cache.CHECKING:
        return 'CHECKING';
      case this._cache.DOWNLOADING:
        return 'DOWNLOADING';
      case this._cache.UPDATEREADY:
        return 'UPDATEREADY';
      case this._cache.OBSOLETE:
        return 'OBSOLETE';
      default:
        return 'UKNOWN CACHE STATUS';
    }
  };

  AppCache.prototype._result = function (error, updated) {
    this._isComplete = true;
    this._isUpdated = updated;
    this._hadErrors = error != null;
    this.complete.dispatch(updated);
  };

  AppCache.prototype._addEventListeners = function () {
    var self = this;
    this._cache.addEventListener('error', this._errorHandler);
    this._appCacheEvents.forEach(function (e) {
      self._cache.addEventListener(e, self._eventHandler);
    });
  };

  AppCache.prototype._removeEventListeners = function () {
    var self = this;
    this._cache.removeEventListener('error', this._errorHandler);
    this._appCacheEvents.forEach(function (e) {
      self._cache.removeEventListener(e, self._eventHandler);
    });
  };

  AppCache.prototype._handleCacheEvent = function (e) {
    if (e.type !== 'progress') {
      this._Logger.debug('Cache event: ' + e.type);
      this._Logger.debug('Cache status: ' + this._getCacheStatus());
    }

    if (e.type === 'updateready') {
      this._Logger.debug('Caching complete. Swapping the cache.');

      this._removeEventListeners();
      this._cache.swapCache();

      this._result(null, true);
      return;
    } else if (e.type === 'cached') {
      this._Logger.debug('Caching complete. Cache saved.');

      this._removeEventListeners();
      this._result(null, false);
    } else if (e.type === 'noupdate') {
      this._Logger.debug('Caching complete. No updates.');

      this._removeEventListeners();
      this._result(null, false);
    }
  };

  AppCache.prototype._handleCacheError = function (e) {
    console.error('Cache update error: ' + e.message);
    this._removeEventListeners();
    this._result(e, false);
  };

  window.app.AppCache = AppCache;
})();

//src/js/shared/persistence/store.cordova.js

window.app.CordovaLocalStorageStore = (function () {
  function CordovaLocalStorageStore(id) {
    _classCallCheck(this, CordovaLocalStorageStore);

    this._id = id;

    if (!localStorage) {
      throw Error('Cordova not found.');
    }
  }

  _createClass(CordovaLocalStorageStore, [{
    key: 'clear',
    value: function clear() {
      try {
        localStorage.removeItem(this._id);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: 'read',
    value: function read() {
      try {
        var value = JSON.parse(localStorage.getItem(this._id));
        return Promise.resolve(value);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: 'write',
    value: function write(value) {
      try {
        localStorage.setItem(this._id, JSON.stringify(value));
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);

  return CordovaLocalStorageStore;
})();

//src/js/shared/persistence/store.inmemory.js

window.app.InMemoryStore = (function () {
  function InMemoryStore() {
    _classCallCheck(this, InMemoryStore);

    this._storage = null;
  }

  _createClass(InMemoryStore, [{
    key: 'clear',
    value: function clear() {
      this._storage = undefined;
      return Promise.resolve();
    }
  }, {
    key: 'read',
    value: function read() {
      return Promise.resolve(this._storage);
    }
  }, {
    key: 'write',
    value: function write(value) {
      this._storage = value;
      return Promise.resolve();
    }
  }]);

  return InMemoryStore;
})();

//src/js/shared/persistence/store.localstorage.js

window.app.LocalStorageStore = (function () {
  function LocalStorageStore(id) {
    _classCallCheck(this, LocalStorageStore);

    this._id = id;

    if (!store) {
      throw Error('Store.js not found.');
    }
  }

  _createClass(LocalStorageStore, [{
    key: 'clear',
    value: function clear() {
      try {
        store.remove(this._id);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: 'read',
    value: function read() {
      try {
        var value = store.get(this._id);
        return Promise.resolve(value);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }, {
    key: 'write',
    value: function write(value) {
      try {
        store.set(this._id, value);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  }]);

  return LocalStorageStore;
})();

//src/js/shared/service/backendapi.js

window.app.BackendApi = function BackendApi(Hosts, SessionModel) {
  _classCallCheck(this, BackendApi);

  this._SessionModel = SessionModel;

  var self = this;

  function businessTokenProvider() {
    if (!self._SessionModel.apiToken) {
      return Promise.reject();
    }

    return Promise.resolve(self._SessionModel.apiToken.access_token);
  }

  function customerTokenProvider() {
    if (!self._SessionModel.customerToken) {
      return Promise.reject();
    }

    return Promise.resolve(self._SessionModel.customerToken.access_token);
  }

  for (var key in DtsApiClient) {
    var config = {
      host: {
        domain: Hosts.api.host,
        secure: Hosts.api.secure === 'true'
      }
    };

    var provider = businessTokenProvider;

    if (key === 'snap') {
      config.host.domain = Hosts.content.host;
    } else if (key === 'customer') {
      provider = customerTokenProvider;
    }

    this[key] = new DtsApiClient[key](config, provider);
  }
};

//src/js/shared/service/cardreader.js

(function () {

  /* global signals */

  //------------------------------------------------------------------------
  //
  //  CardReader
  //
  //------------------------------------------------------------------------

  var CardReader = function CardReader(ManagementService) {
    this._ManagementService = ManagementService;
    this.onReceived = new signals.Signal();
    this.onError = new signals.Signal();
  };

  CardReader.prototype.received = function (card) {
    this.onReceived.dispatch(card);
  };

  CardReader.prototype.error = function (e) {
    this.onError.dispatch(e);
  };

  CardReader.prototype.start = function () {
    if (!this._active) {
      this._ManagementService.startCardReader();
      this._active = true;
    }
  };

  CardReader.prototype.stop = function () {
    if (this._active) {
      this._ManagementService.stopCardReader();
      this._active = false;
    }
  };

  window.app.CardReader = CardReader;
})();

//src/js/shared/service/dataprovider.js

window.app.DataProvider = (function () {
  function DataProvider(config, service) {
    _classCallCheck(this, DataProvider);

    this._config = config;
    this._service = service;
    this._cache = {};
  }

  _createClass(DataProvider, [{
    key: 'clear',
    value: function clear() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._cache = {};
        resolve();
      });
    }
  }, {
    key: 'digest',
    value: function digest() {
      return this._getSnapData('digest', 'getDigest');
    }
  }, {
    key: 'home',
    value: function home() {
      return this._getSnapData('home', 'getMenus');
    }
  }, {
    key: 'advertisements',
    value: function advertisements() {
      return this._getSnapData('advertisements', 'getAdvertisements');
    }
  }, {
    key: 'backgrounds',
    value: function backgrounds() {
      return this._getSnapData('backgrounds', 'getBackgrounds');
    }
  }, {
    key: 'elements',
    value: function elements() {
      return this._getSnapData('elements', 'getElements');
    }
  }, {
    key: 'menu',
    value: function menu(id) {
      return this._getSnapData('menu', 'getMenu', id);
    }
  }, {
    key: 'category',
    value: function category(id) {
      return this._getSnapData('category', 'getMenuCategory', id);
    }
  }, {
    key: 'item',
    value: function item(id) {
      return this._getSnapData('item', 'getMenuItem', id);
    }
  }, {
    key: 'surveys',
    value: function surveys() {
      return this._getSnapData('surveys', 'getSurveys');
    }
  }, {
    key: 'seats',
    value: function seats() {
      var self = this;
      return this._cached('seats') || this._service.location.getSeats().then(function (data) {
        data = data || [];
        self._store(data, 'seats');
        return data;
      }, this._onError);
    }
  }, {
    key: 'media',
    value: function media(_media) {
      var self = this,
          token = _media.token + '_' + _media.width + '_' + _media.height;
      return this._cached('media', token) || new Promise(function (resolve, reject) {
        if (_media.width && _media.height) {
          var img = new Image();
          img.onload = function () {
            return resolve(img);
          };
          img.onerror = function (e) {
            return reject(e);
          };
          img.src = self._getMediaUrl(_media, _media.width, _media.height, _media.extension);

          self._store(img, 'media', token);

          if (img.complete) {
            resolve(img);
          }
        } else {
          reject('Missing image dimensions');
        }
      }, this._onError);
    }
  }, {
    key: '_getSnapData',
    value: function _getSnapData(name, method, id) {
      var self = this;
      return this._cached(name, id) || this._service.snap[method](this._config.location, id).then(function (data) {
        data = data || [];
        self._store(data, name, id);
        return data;
      }, this._onError);
    }
  }, {
    key: '_onError',
    value: function _onError(e) {
      console.error(e.message);
      return e;
    }
  }, {
    key: '_cached',
    value: function _cached(group, id) {
      if (id && this._cache[group] && this._cache[group][id]) {
        return Promise.resolve(this._cache[group][id]);
      } else if (!id && this._cache[group]) {
        return Promise.resolve(this._cache[group]);
      }

      return null;
    }
  }, {
    key: '_store',
    value: function _store(data, group, id) {
      if (id) {
        if (!this._cache[group]) {
          this._cache[group] = {};
        }

        this._cache[group][id] = data;
      } else {
        this._cache[group] = data;
      }
    }
  }, {
    key: '_getMediaUrl',
    value: function _getMediaUrl() {}
  }]);

  return DataProvider;
})();

//src/js/shared/service/managementservice.cordova.js

window.app.CordovaManagementService = (function () {
  /* global signals */

  function CordovaManagementService(Logger) {
    _classCallCheck(this, CordovaManagementService);

    this._Logger = Logger;

    if (!window.cordova) {
      this._Logger.warn('Cordova is not available.');
    }
  }

  _createClass(CordovaManagementService, [{
    key: 'rotateScreen',
    value: function rotateScreen() {
      return Promise.resolve();
    }
  }, {
    key: 'openBrowser',
    value: function openBrowser(url, browserRef, options) {
      options = options || {};

      return new Promise(function (resolve) {
        var target = options.system ? '_blank' : '_blank',
            settings = {
          location: options.system ? 'no' : 'yes',
          clearcache: 'yes',
          clearsessioncache: 'yes',
          zoom: 'no',
          hardwareback: 'no'
        };

        browserRef = window.open(url, target, Object.keys(settings).map(function (x) {
          return x + '=' + settings[x];
        }).join(','));
        resolve(new app.CordovaWebBrowserReference(browserRef));
      });
    }
  }, {
    key: 'closeBrowser',
    value: function closeBrowser(browserRef) {
      return new Promise(function (resolve) {
        browserRef.exit();
        resolve();
      });
    }
  }, {
    key: 'startCardReader',
    value: function startCardReader() {
      return Promise.resolve();
    }
  }, {
    key: 'stopCardReader',
    value: function stopCardReader() {
      return Promise.resolve();
    }
  }, {
    key: 'reset',
    value: function reset() {
      var self = this;
      return new Promise(function (resolve, reject) {});
    }
  }, {
    key: 'loadApplication',
    value: function loadApplication() {
      var self = this;
      return new Promise(function (resolve, reject) {
        window.open('snap.html', '_self');
      });
    }
  }, {
    key: 'getSoundVolume',
    value: function getSoundVolume() {
      return Promise.resolve(100);
    }
  }, {
    key: 'setSoundVolume',
    value: function setSoundVolume(value) {
      return Promise.resolve();
    }
  }, {
    key: 'getDisplayBrightness',
    value: function getDisplayBrightness() {
      return Promise.resolve(100);
    }
  }, {
    key: 'setDisplayBrightness',
    value: function setDisplayBrightness(value) {
      return Promise.resolve();
    }
  }]);

  return CordovaManagementService;
})();

//src/js/shared/service/managementservice.homebrew.js

window.app.HomebrewManagementService = (function () {
  function HomebrewManagementService($resource, SNAPEnvironment) {
    _classCallCheck(this, HomebrewManagementService);

    this._api = {
      'rotateScreen': $resource('/management/rotate-screen', {}, { query: { method: 'GET' } }),
      'openBrowser': $resource('/management/open-browser', {}, { query: { method: 'GET' } }),
      'closeBrowser': $resource('/management/close-browser', {}, { query: { method: 'GET' } }),
      'startCardReader': $resource('/management/start-card-reader', {}, { query: { method: 'GET' } }),
      'stopCardReader': $resource('/management/stop-card-reader', {}, { query: { method: 'GET' } }),
      'reset': $resource('/management/reset', {}, { query: { method: 'GET' } }),
      'getSoundVolume': $resource('/management/volume', {}, { query: { method: 'GET' } }),
      'setSoundVolume': $resource('/management/volume', {}, { query: { method: 'GET' } }),
      'getDisplayBrightness': $resource('/management/brightness', {}, { query: { method: 'GET' } }),
      'setDisplayBrightness': $resource('/management/brightness', {}, { query: { method: 'GET' } })
    };
    this._SNAPEnvironment = SNAPEnvironment;
  }

  _createClass(HomebrewManagementService, [{
    key: 'rotateScreen',
    value: function rotateScreen() {
      this._api.rotateScreen.query();
    }
  }, {
    key: 'openBrowser',
    value: function openBrowser(url, browserRef) {
      var self = this;
      return new Promise(function (resolve) {
        return self._api.openBrowser.query({ url: url }).then(function (resolve) {
          var browser = new app.WebBrowserReference();
          browser.onNavigated.dispatch(url);
          resolve(browser);
        });
      });
    }
  }, {
    key: 'closeBrowser',
    value: function closeBrowser(browserRef) {
      var self = this;
      return new Promise(function (resolve) {
        if (browserRef) {
          browserRef.onExit.dispatch();
        }

        return self._api.closeBrowser.query();
      });
    }
  }, {
    key: 'startCardReader',
    value: function startCardReader() {
      this._api.startCardReader.query();
    }
  }, {
    key: 'stopCardReader',
    value: function stopCardReader() {
      this._api.stopCardReader.query();
    }
  }, {
    key: 'reset',
    value: function reset() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.reset.query().$promise.then(resolve, function () {
          window.location.assign('/snap/' + encodeURIComponent(self._SNAPEnvironment.platform));
        });
      });
    }
  }, {
    key: 'loadApplication',
    value: function loadApplication() {
      var self = this;
      return new Promise(function (resolve, reject) {
        window.location.assign('/snap/' + encodeURIComponent(self._SNAPEnvironment.platform));
      });
    }
  }, {
    key: 'getSoundVolume',
    value: function getSoundVolume() {
      return this._api.getSoundVolume.query().$promise;
    }
  }, {
    key: 'setSoundVolume',
    value: function setSoundVolume(value) {
      return this._api.setSoundVolume.query({ value: value }).$promise;
    }
  }, {
    key: 'getDisplayBrightness',
    value: function getDisplayBrightness() {
      return this._api.getDisplayBrightness.query().$promise;
    }
  }, {
    key: 'setDisplayBrightness',
    value: function setDisplayBrightness(value) {
      return this._api.setDisplayBrightness.query({ value: value }).$promise;
    }
  }]);

  return HomebrewManagementService;
})();

//src/js/shared/service/socketclient.js

window.app.SocketClient = (function () {
  function SocketClient(SessionModel, Hosts, Logger) {
    _classCallCheck(this, SocketClient);

    var self = this;

    this._SessionModel = SessionModel;
    this._Logger = Logger;

    this.isConnectedChanged = new signals.Signal();

    this._channels = {};
    this._isConnected = false;

    this._socket = socketCluster.connect({
      hostname: Hosts.socket.host,
      path: Hosts.socket.path,
      port: Hosts.socket.port,
      secure: Hosts.socket.secure
    });
    this._socket.on('connect', function (status) {
      self._Logger.debug('Socket connected.');
      self._authenticate();
    });
    this._socket.on('disconnect', function () {
      self._Logger.debug('Socket disconnected.');
      self._isConnected = false;
      self.isConnectedChanged.dispatch(self.isConnected);
    });
  }

  _createClass(SocketClient, [{
    key: 'subscribe',
    value: function subscribe(topic, handler) {
      this._getChannel(topic).watch(handler);
    }
  }, {
    key: 'send',
    value: function send(topic, data) {
      this._getChannel(topic).publish(data);
    }
  }, {
    key: '_getChannel',
    value: function _getChannel(topic) {
      return this._channels[topic] || (this._channels[topic] = this._socket.subscribe(topic));
    }
  }, {
    key: '_authenticate',
    value: function _authenticate() {
      var self = this;
      self._socket.emit('authenticate', {
        access_token: self._SessionModel.apiToken
      }, function (err) {
        if (err) {
          self._Logger.warn('Unable to authenticate socket: ' + err.message);
          return;
        }

        self._isConnected = true;
        self.isConnectedChanged.dispatch(self.isConnected);
      });
    }
  }, {
    key: 'isConnected',
    get: function get() {
      return this._isConnected;
    }
  }]);

  return SocketClient;
})();

//src/js/shared/service/telemetryservice.js

window.app.TelemetryService = (function () {
  function TelemetryService($resource) {
    _classCallCheck(this, TelemetryService);

    this._api = {
      'submitTelemetry': $resource('/snap/telemetry', {}, { query: { method: 'POST' } }),
      'submitLogs': $resource('/snap/logs', {}, { query: { method: 'POST' } })
    };
  }

  _createClass(TelemetryService, [{
    key: 'submitTelemetry',
    value: function submitTelemetry(data) {
      return this._api.submitTelemetry.query(data).$promise;
    }
  }, {
    key: 'submitLogs',
    value: function submitLogs(data) {
      return this._api.submitLogs.query(data).$promise;
    }
  }]);

  return TelemetryService;
})();

//src/js/shared/service/webbrowser.js

window.app.WebBrowser = (function () {
  /* global signals, URI */

  function WebBrowser(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
    _classCallCheck(this, WebBrowser);

    this._AnalyticsModel = AnalyticsModel;
    this._ManagementService = ManagementService;
    this._SNAPEnvironment = SNAPEnvironment;

    this._localHosts = Object.keys(SNAPHosts).map(function (p) {
      return SNAPHosts[p].host;
    });
    this._localHosts.push('localhost');

    this.onOpen = new signals.Signal();
    this.onClose = new signals.Signal();
    this.onNavigated = new signals.Signal();

    this._browser = null;
  }

  _createClass(WebBrowser, [{
    key: 'open',
    value: function open(url, options) {
      var self = this;

      return this._ManagementService.openBrowser(url, this._browser, options).then(function (browser) {
        self._browser = browser;
        self.onOpen.dispatch(url, self._browser);
        self._browserOpened = true;

        self._browser.onNavigated.add(function (url) {
          self.onNavigated.dispatch(url);

          var host = URI(url).hostname();

          if (self._localHosts.indexOf(host) === -1) {
            self._AnalyticsModel.logUrl(url);
          }
        });
        self._browser.onExit.addOnce(function () {
          self.onClose.dispatch();
          self._browserOpened = false;
          self._browser = null;
        });

        return browser;
      });
    }
  }, {
    key: 'close',
    value: function close() {
      var self = this;

      if (!this._browserOpened) {
        return Promise.resolve();
      }

      return this._ManagementService.closeBrowser(this._browser).then(function () {
        self._browser = null;
        self.onClose.dispatch();
        self._browserOpened = false;
      });
    }

    //-----------------------------------------------
    //    External methods
    //-----------------------------------------------

  }, {
    key: 'navigated',
    value: function navigated(url) {
      if (this._browser) {
        this._browser.onNavigated.dispatch(url);
      }
    }
  }, {
    key: 'callback',
    value: function callback(data) {
      if (this._browser) {
        this._browser.onCallback.dispatch(data);
      }

      this.close();
    }
  }]);

  return WebBrowser;
})();

//src/js/shared/workers/heatmap.js

window.app.HeatMap = (function () {
  function HeatMap(element) {
    _classCallCheck(this, HeatMap);

    var self = this;

    this._listener = function (e) {
      self._onClick(e);
    };

    this._element = element;
    this._element.addEventListener('click', this._listener);

    this.clicked = new signals.Signal();
  }

  _createClass(HeatMap, [{
    key: 'dispose',
    value: function dispose() {
      this._element.removeEventListener('click', this._listener);
    }
  }, {
    key: '_onClick',
    value: function _onClick(e) {
      var data = {
        x: e.layerX / this._element.clientWidth,
        y: e.layerY / this._element.clientHeight
      };

      if (data.x < 0 || data.y < 0 || data.x > 1 || data.y > 1) {
        return;
      }

      this.clicked.dispatch(data);
    }
  }]);

  return HeatMap;
})();

//src/js/shared/workers/logger.js

window.app.Logger = (function () {
  function _class(SNAPEnvironment) {
    _classCallCheck(this, _class);

    this._SNAPEnvironment = SNAPEnvironment;
    this._log = log4javascript.getLogger();

    var ajaxAppender = new log4javascript.AjaxAppender('/snap/log');
    ajaxAppender.setWaitForResponse(true);
    ajaxAppender.setLayout(new log4javascript.JsonLayout());
    ajaxAppender.setThreshold(log4javascript.Level.ERROR);

    this._log.addAppender(ajaxAppender);
    this._log.addAppender(new log4javascript.BrowserConsoleAppender());
  }

  _createClass(_class, [{
    key: 'debug',
    value: function debug() {
      var _log;

      (_log = this._log).debug.apply(_log, arguments);
    }
  }, {
    key: 'info',
    value: function info() {
      var _log2;

      (_log2 = this._log).info.apply(_log2, arguments);
    }
  }, {
    key: 'warn',
    value: function warn() {
      var _log3;

      (_log3 = this._log).warn.apply(_log3, arguments);
    }
  }, {
    key: 'error',
    value: function error() {
      var _log4;

      (_log4 = this._log).error.apply(_log4, arguments);
    }
  }, {
    key: 'fatal',
    value: function fatal() {
      var _log5;

      (_log5 = this._log).fatal.apply(_log5, arguments);
    }
  }]);

  return _class;
})();

//src/js/shared/workers/mediastarter.js

(function () {
  /* global swfobject */

  function MediaStarter(id) {

    var flashvars = {};
    var params = {
      menu: 'false',
      wmode: 'direct',
      allowFullScreen: 'false'
    };
    var attributes = {
      id: id,
      name: id
    };

    swfobject.embedSWF(this._getQueryParameter('url'), id, this._getQueryParameter('width'), this._getQueryParameter('height'), '16.0.0', 'expressInstall.swf', flashvars, params, attributes, function (res) {
      if (res.success !== true) {
        console.error(res);
      }
    });
  }

  MediaStarter.prototype._getQueryParameter = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
        results = regex.exec(location.hash);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  window.app.MediaStarter = MediaStarter;
})();

//src/js/apps.js

//------------------------------------------------------------------------
//
//  ApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.ApplicationBootstraper = (function () {
  function ApplicationBootstraper() {
    _classCallCheck(this, ApplicationBootstraper);

    this.hosts = {
      api: { 'host': 'api2.managesnap.com', 'secure': true },
      content: { 'host': 'content.managesnap.com', 'secure': false },
      media: { 'host': 'content.managesnap.com', 'secure': false },
      'static': { 'path': '/' },
      socket: { 'host': 'web-dev.managesnap.com', 'secure': true, 'port': 8080, 'path': '/socket/' }
    };

    this.environment = {
      main_application: { 'client_id': 'd67610b1c91044d8abd55cbda6c619f0', 'callback_url': 'http://api2.managesnap.com/callback/api', 'scope': '' },
      customer_application: { 'client_id': '91381a86b3b444fd876df80b22d7fa6e' },
      facebook_application: { 'client_id': '349729518545313', 'redirect_url': 'https://web.managesnap.com/callback/facebook' },
      googleplus_application: { 'client_id': '678998250941-1dmebp4ksni9tsjth45tsht8l7cl1mrn.apps.googleusercontent.com', 'redirect_url': 'https://web.managesnap.com/callback/googleplus' },
      twitter_application: { 'consumer_key': 'yQ8XJ15PmaPOi4L5DJPikGCI0', 'redirect_url': 'https://web.managesnap.com/callback/twitter' }
    };
  }

  //-----------------------------------------------
  //    Public methods
  //-----------------------------------------------

  _createClass(ApplicationBootstraper, [{
    key: 'configure',
    value: function configure() {
      var self = this;
      return new Promise(function (resolve, reject) {
        var store = new app.CordovaLocalStorageStore('snap_location');

        store.read().then(function (config) {
          self.location = config || null;

          angular.module('SNAP.configs', []).constant('SNAPLocation', self.location).constant('SNAPEnvironment', self.environment).constant('SNAPHosts', self.hosts);

          if (self.hosts['static'].host) {
            $sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('.*' + self.hosts['static'].host + '.*')]);
          }

          resolve();
        }, reject);
      });
    }
  }, {
    key: 'run',
    value: function run() {
      throw new Error('Not implemented.');
    }

    //-----------------------------------------------
    //    Helper methods
    //-----------------------------------------------

  }, {
    key: '_getPartialUrl',
    value: function _getPartialUrl(name) {
      if (!this.hosts) {
        throw new Error('Missing hosts configuration.');
      }

      if (!this.location) {
        throw new Error('Missing location configuration.');
      }

      var path = this.hosts['static'].host ? '//' + this.hosts['static'].host + this.hosts['static'].path : '' + this.hosts['static'].path;

      return path + 'assets/' + this.location.theme.layout + '/partials/' + name + '.html';
    }
  }]);

  return ApplicationBootstraper;
})();

//------------------------------------------------------------------------
//
//  SnapApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapApplicationBootstraper = (function (_app$ApplicationBootstraper) {
  _inherits(SnapApplicationBootstraper, _app$ApplicationBootstraper);

  function SnapApplicationBootstraper() {
    _classCallCheck(this, SnapApplicationBootstraper);

    _get(Object.getPrototypeOf(SnapApplicationBootstraper.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SnapApplicationBootstraper, [{
    key: 'configure',
    value: function configure() {
      var _this5 = this;

      return _get(Object.getPrototypeOf(SnapApplicationBootstraper.prototype), 'configure', this).call(this).then(function () {
        angular.module('SNAPApplication', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', function ($locationProvider, $routeProvider, $sceDelegateProvider) {

          $locationProvider.html5Mode(false);

          $routeProvider.when('/', { template: ' ', controller: 'HomeBaseCtrl' });
          $routeProvider.when('/menu/:token', { template: ' ', controller: 'MenuBaseCtrl' });
          $routeProvider.when('/category/:token', { template: ' ', controller: 'CategoryBaseCtrl' });
          $routeProvider.when('/item/:token', { template: ' ', controller: 'ItemBaseCtrl' });
          $routeProvider.when('/url/:url', { template: ' ', controller: 'UrlCtrl' });
          $routeProvider.when('/checkout', { templateUrl: _this5._getPartialUrl('checkout'), controller: 'CheckoutCtrl' });
          $routeProvider.when('/signin', { templateUrl: _this5._getPartialUrl('signin'), controller: 'SignInCtrl' });
          $routeProvider.when('/account', { templateUrl: _this5._getPartialUrl('account'), controller: 'AccountCtrl' });
          $routeProvider.when('/chat', { templateUrl: _this5._getPartialUrl('chat'), controller: 'ChatCtrl' });
          $routeProvider.when('/chatmap', { templateUrl: _this5._getPartialUrl('chatmap'), controller: 'ChatMapCtrl' });
          $routeProvider.when('/survey', { templateUrl: _this5._getPartialUrl('survey'), controller: 'SurveyCtrl' });
          $routeProvider.otherwise({ redirectTo: '/' });
        }]);
      });
    }
  }, {
    key: 'run',
    value: function run() {
      angular.bootstrap(document, ['SNAPApplication']);
    }
  }]);

  return SnapApplicationBootstraper;
})(app.ApplicationBootstraper);

//------------------------------------------------------------------------
//
//  StartupApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.StartupApplicationBootstraper = (function (_app$ApplicationBootstraper2) {
  _inherits(StartupApplicationBootstraper, _app$ApplicationBootstraper2);

  function StartupApplicationBootstraper() {
    _classCallCheck(this, StartupApplicationBootstraper);

    _get(Object.getPrototypeOf(StartupApplicationBootstraper.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(StartupApplicationBootstraper, [{
    key: 'configure',
    value: function configure() {
      return _get(Object.getPrototypeOf(StartupApplicationBootstraper.prototype), 'configure', this).call(this).then(function () {
        angular.module('SNAPStartup', ['ngRoute', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(function () {});
      });
    }
  }, {
    key: 'run',
    value: function run() {
      angular.bootstrap(document, ['SNAPStartup']);
    }
  }]);

  return StartupApplicationBootstraper;
})(app.ApplicationBootstraper);

//------------------------------------------------------------------------
//
//  SnapAuxiliaresApplicationBootstraper
//
//------------------------------------------------------------------------

window.app.SnapAuxiliaresApplicationBootstraper = (function (_app$ApplicationBootstraper3) {
  _inherits(SnapAuxiliaresApplicationBootstraper, _app$ApplicationBootstraper3);

  function SnapAuxiliaresApplicationBootstraper() {
    _classCallCheck(this, SnapAuxiliaresApplicationBootstraper);

    _get(Object.getPrototypeOf(SnapAuxiliaresApplicationBootstraper.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SnapAuxiliaresApplicationBootstraper, [{
    key: 'configure',
    value: function configure() {
      var _this6 = this;

      return _get(Object.getPrototypeOf(SnapAuxiliaresApplicationBootstraper.prototype), 'configure', this).call(this).then(function () {
        angular.module('SNAPAuxiliares', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

          $locationProvider.html5Mode(false);

          $routeProvider.when('/', { templateUrl: _this6._getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
          $routeProvider.otherwise({ redirectTo: '/' });
        }]);
      });
    }
  }, {
    key: 'run',
    value: function run() {
      angular.bootstrap(document, ['SNAPAuxiliares']);
    }
  }]);

  return SnapAuxiliaresApplicationBootstraper;
})(app.ApplicationBootstraper);

//src/js/controllers/_base.js

angular.module('SNAP.controllers', ['angular-bacon']);

//src/js/controllers/account.js

angular.module('SNAP.controllers').controller('AccountCtrl', ['$scope', 'CustomerManager', 'DialogManager', 'NavigationManager', function ($scope, CustomerManager, DialogManager, NavigationManager) {

  if (!CustomerManager.model.isEnabled || !CustomerManager.model.isAuthenticated) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  //------------------------------------------------------------------------
  //
  //  Constants
  //
  //------------------------------------------------------------------------

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Profile
  //-----------------------------------------------

  $scope.profile = CustomerManager.model.profile;
  $scope.canChangePassword = CustomerManager.model.hasCredentials;
  var profile = $scope.$watchAsProperty('profile');

  CustomerManager.model.profileChanged.add(function (value) {
    $scope.profile = value;
    $scope.canChangePassword = CustomerManager.model.hasCredentials;
    $scope.canChangeEmail = CustomerManager.model.hasCredentials;
  });

  //-----------------------------------------------
  //    Splash screen
  //-----------------------------------------------

  $scope.editProfile = function () {
    $scope.profileedit = angular.copy($scope.profile);
    $scope.showProfileEdit = true;
  };

  $scope.editPassword = function () {
    $scope.passwordedit = {
      old_password: '',
      new_password: ''
    };
    $scope.showProfileEdit = false;
    $scope.showPasswordEdit = true;
  };

  $scope.editPayment = function () {
    $scope.showPaymentEdit = true;
  };

  //-----------------------------------------------
  //    Profile edit screen
  //-----------------------------------------------

  $scope.profileEditSubmit = function () {
    var job = DialogManager.startJob();

    CustomerManager.updateProfile($scope.profileedit).then(function () {
      DialogManager.endJob(job);
      $scope.showProfileEdit = false;
    }, function (e) {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.profileEditCancel = function () {
    $scope.showProfileEdit = false;
  };

  //-----------------------------------------------
  //    Password edit screen
  //-----------------------------------------------

  $scope.passwordEditSubmit = function () {
    var job = DialogManager.startJob();

    CustomerManager.changePassword($scope.passwordedit).then(function () {
      DialogManager.endJob(job);
      $scope.showPasswordEdit = false;
    }, function (e) {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.passwordEditCancel = function () {
    $scope.showPasswordEdit = false;
  };
}]);

//src/js/controllers/background.js

angular.module('SNAP.controllers').controller('BackgroundCtrl', ['$scope', '$timeout', 'ShellManager', 'NavigationManager', function ($scope, $timeout, ShellManager, NavigationManager) {

  function showImages(values) {
    $timeout(function () {
      $scope.images = values.map(function (item) {
        return {
          src: ShellManager.getMediaUrl(item.media, 1920, 1080, 'jpg'),
          type: ShellManager.getMediaType(item.media)
        };
      });
    });
  }

  var backgrounds = ShellManager.model.backgrounds,
      pageBackgrounds = null;

  showImages(backgrounds);
  ShellManager.model.backgroundsChanged.add(function (value) {
    backgrounds = value;
    showImages(backgrounds);
  });

  NavigationManager.locationChanged.add(function (location) {
    var newPageBackgrounds = ShellManager.getPageBackgrounds(location);

    if (newPageBackgrounds.length > 0) {
      pageBackgrounds = newPageBackgrounds;
      showImages(pageBackgrounds);
      return;
    }

    if (pageBackgrounds) {
      switch (location.type) {
        case 'menu':
        case 'category':
        case 'item':
          return;
      }
    }

    pageBackgrounds = null;
    showImages(backgrounds);
  });
}]);

//src/js/controllers/cart.js

angular.module('SNAP.controllers').controller('CartCtrl', ['$scope', '$timeout', '$sce', 'CustomerManager', 'ShellManager', 'NavigationManager', 'OrderManager', 'DialogManager', 'CartModel', 'LocationModel', 'ChatManager', function ($scope, $timeout, $sce, CustomerManager, ShellManager, NavigationManager, OrderManager, DialogManager, CartModel, LocationModel, ChatManager) {

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.formatPrice = function (value) {
    return ShellManager.formatPrice(value);
  };
  $scope.options = {};

  $scope.state = CartModel.cartState;
  CartModel.cartStateChanged.add(function (state) {
    return $timeout(function () {
      return $scope.state = state;
    });
  });

  $scope.currentOrder = OrderManager.model.orderCart;
  OrderManager.model.orderCartChanged.add(function (value) {
    return $scope.currentOrder = value;
  });

  $scope.totalOrder = OrderManager.model.orderCheck;
  OrderManager.model.orderCheckChanged.add(function (value) {
    return $scope.totalOrder = value;
  });

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(function (token) {
    $timeout(function () {
      return $scope.giftSeat = LocationModel.getSeat(token);
    });
  });

  $scope.requestAssistanceAvailable = true;
  $scope.requestCloseoutAvailable = true;
  $scope.checkoutEnabled = CustomerManager.model.isEnabled;
  $scope.toGoOrder = false;
  $scope.visible = CartModel.isCartOpen;

  NavigationManager.locationChanging.add(function (location) {
    if (location.type !== 'category') {
      CartModel.isCartOpen = false;
    }
  });

  CartModel.isCartOpenChanged.add(function (value) {
    $scope.showCart();
    $scope.visible = value;
  });

  $scope.seat_name = LocationModel.seat ? LocationModel.seat.name : 'Table';

  LocationModel.seatChanged.add(function (seat) {
    return $scope.seat_name = seat ? seat.name : 'Table';
  });

  var refreshAssistanceRequest = function refreshAssistanceRequest() {
    $scope.requestAssistanceAvailable = OrderManager.model.assistanceRequest == null;
  };
  var refreshCloseoutRequest = function refreshCloseoutRequest() {
    $scope.requestCloseoutAvailable = OrderManager.model.closeoutRequest == null;
  };

  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  OrderManager.model.closeoutRequestChanged.add(refreshCloseoutRequest);
  refreshAssistanceRequest();
  refreshCloseoutRequest();

  $scope.calculateDescription = function (entry) {
    var result = entry.name || entry.item.title;

    result += entry.modifiers.reduce(function (output, category) {
      return output + category.modifiers.reduce(function (output, modifier) {
        return output + (modifier.isSelected ? '<br/>- ' + modifier.data.title : '');
      }, '');
    }, '');

    return $sce.trustAsHtml(result);
  };

  $scope.calculatePrice = function (entry) {
    return OrderManager.calculatePrice(entry);
  };
  $scope.calculateTotalPrice = function (entries) {
    return OrderManager.calculateTotalPrice(entries);
  };

  $scope.editItem = function (entry) {
    return CartModel.openEditor(entry, false);
  };
  $scope.removeFromCart = function (entry) {
    return $scope.currentOrder = OrderManager.removeFromCart(entry);
  };
  $scope.reorderItem = function (entry) {
    return $scope.currentOrder = OrderManager.addToCart(entry.clone());
  };

  $scope.submitCart = function () {
    var job = DialogManager.startJob();

    var options = $scope.options.to_go_order ? 2 : 0;

    OrderManager.submitCart(options).then(function () {
      DialogManager.endJob(job);

      $scope.$apply(function () {
        $scope.currentOrder = OrderManager.model.orderCart;
        $scope.totalOrder = OrderManager.model.orderCheck;
        $scope.toGoOrder = false;
      });

      DialogManager.alert(ALERT_REQUEST_ORDER_SENT);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.clearCart = function () {
    $scope.toGoOrder = false;
    $scope.currentOrder = OrderManager.clearCart();
  };

  $scope.closeCart = function () {
    CartModel.isCartOpen = false;
    $scope.showCart();
  };

  $scope.showHistory = function () {
    return CartModel.cartState = CartModel.STATE_HISTORY;
  };
  $scope.showCart = function () {
    return CartModel.cartState = CartModel.STATE_CART;
  };

  $scope.payCheck = function () {
    return NavigationManager.location = { type: 'checkout' };
  };

  $scope.requestAssistance = function () {
    if (!$scope.requestAssistanceAvailable) {
      return;
    }

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.requestCloseout = function () {
    if (!$scope.requestCloseoutAvailable) {
      return;
    }

    var job = DialogManager.startJob();

    OrderManager.requestCloseout().then(function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };
}]);

//src/js/controllers/category.js

angular.module('SNAP.controllers').controller('CategoryBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', function ($scope, $timeout, DataManager, NavigationManager) {}]);

angular.module('SNAP.controllers').controller('CategoryCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'SNAPEnvironment', 'ShellManager', function ($scope, $timeout, DataManager, NavigationManager, SNAPEnvironment, ShellManager) {

  var CategoryList = React.createClass({
    displayName: 'CategoryList',

    render: function render() {
      var tileClassName = ShellManager.tileStyle;
      var rows = this.props.tiles.map(function (tile, i) {
        return React.DOM.td({
          className: tileClassName,
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          },
          style: {
            backgroundImage: 'url(' + ShellManager.getMediaUrl(tile.image, 370, 370) + ')'
          }
        }, React.DOM.span(null, tile.title)));
      }).reduce(function (result, value, i) {
        result[i % 2].push(value);
        return result;
      }, [[], []]).map(function (row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({ className: 'tile-table' }, rows);
    }
  });

  NavigationManager.locationChanging.add(function (location) {
    DataManager.category = location.type === 'category' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.category);
    $timeout(function () {
      $scope.$apply();
    });
  });

  DataManager.categoryChanged.add(function (data) {
    if (!data) {
      return;
    }

    var tiles,
        categories = data.categories || [];
    tiles = data.items || [];
    tiles = categories.concat(tiles);

    if (SNAPEnvironment.platform !== 'desktop') {
      tiles = tiles.filter(function (tile) {
        return tile.type !== 3;
      });
    }

    tiles.forEach(function (tile) {
      tile.url = '#' + NavigationManager.getPath(tile.destination);
    });

    React.render(React.createElement(CategoryList, { tiles: tiles }), document.getElementById('content-category'));
  });
}]);

//src/js/controllers/chat.js

angular.module('SNAP.controllers').controller('ChatCtrl', ['$scope', '$timeout', 'CustomerManager', 'ChatManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'ShellManager', 'SNAPLocation', function ($scope, $timeout, CustomerManager, ChatManager, DialogManager, NavigationManager, LocationModel, ShellManager, SNAPLocation) {

  if (!SNAPLocation.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPLocation.location_name;

  $scope.getPartialUrl = function (name) {
    return ShellManager.getPartialUrl(name);
  };

  $scope.chatEnabled = ChatManager.model.isEnabled;
  ChatManager.model.isEnabledChanged.add(function (value) {
    $timeout(function () {
      return $scope.chatEnabled = value;
    });
  });

  $scope.activeDevices = ChatManager.model.activeDevices;
  ChatManager.model.activeDevicesChanged.add(function (value) {
    $timeout(function () {
      return $scope.activeDevices = value;
    });
  });

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(function (token) {
    $timeout(function () {
      return $scope.giftSeat = LocationModel.getSeat(token);
    });
  });

  $scope.giftDevice = ChatManager.model.giftDevice;
  ChatManager.model.giftDeviceChanged.add(function (value) {
    $timeout(function () {
      return $scope.giftDevice = value;
    });
  });

  $scope.toggleChat = function () {
    ChatManager.model.isEnabled = !ChatManager.model.isEnabled;
  };

  $scope.openMap = function () {
    NavigationManager.location = { type: 'chatmap' };
  };

  $scope.getDeviceName = function (device_token) {
    return ChatManager.getDeviceName(device_token);
  };

  $scope.getSeatNumber = function (device_token) {
    var device = LocationModel.getDevice(device_token);

    for (var p in LocationModel.seats) {
      if (LocationModel.seats[p].token === device.seat) {
        var match = LocationModel.seats[p].name.match(/\d+/);
        return match ? match[0] || '' : '';
      }
    }

    return '';
  };

  $scope.closeChat = function (device_token) {
    DialogManager.confirm('Are you sure you would like to close the chat with ' + $scope.getDeviceName(device_token) + '?').then(function () {
      ChatManager.declineDevice(device_token);
    });
  };

  $scope.getUnreadCount = function (device_token) {
    return ChatManager.getUnreadCount(device_token);
  };

  $scope.sendGift = function (device_token) {
    var device = LocationModel.getDevice(device_token),
        seat = LocationModel.getSeat(device.seat);

    if (!seat) {
      return;
    }

    DialogManager.confirm('Are you sure that you want to send a gift to ' + seat.name + '?').then(function () {
      ChatManager.startGift(device_token);
      NavigationManager.location = { type: 'home' };
    });
  };

  $scope.cancelGift = function () {
    return ChatManager.endGift();
  };

  ChatManager.isPresent = true;

  var watchLocation = true;

  $scope.$on('$locationChangeStart', function () {
    if (watchLocation) {
      ChatManager.model.isPresent = false;
      watchLocation = false;
    }
  });
}]);

//src/js/controllers/chatbox.js

angular.module('SNAP.controllers').controller('ChatBoxCtrl', ['$scope', '$timeout', '$attrs', 'ChatManager', 'LocationModel', function ($scope, $timeout, $attrs, ChatManager, LocationModel) {
  var to_device = $scope.device,
      type = to_device ? ChatManager.MESSAGE_TYPES.DEVICE : ChatManager.MESSAGE_TYPES.LOCATION;

  var device = to_device ? LocationModel.getDevice(to_device) : null;

  $scope.readonly = Boolean($attrs.readonly);
  $scope.chat = {};
  $scope.messages = [];

  function showMessages() {
    $timeout(function () {
      $scope.messages = ChatManager.model.history.filter(function (message) {
        return message.type === type && (message.device === to_device || message.to_device === to_device);
      });
    });
  }

  $scope.chatEnabled = ChatManager.model.isEnabled;
  ChatManager.model.isEnabledChanged.add(function (value) {
    $timeout(function () {
      return $scope.chatEnabled = value;
    });
  });

  $scope.isConnected = ChatManager.model.isConnected;
  ChatManager.model.isConnectedChanged.add(function (value) {
    $timeout(function () {
      return $scope.isConnected = value;
    });
  });

  $scope.sendMessage = function () {
    if (!$scope.isConnected || !$scope.chat.message) {
      return;
    }

    var message = {
      type: type,
      to_device: to_device,
      text: $scope.chat.message
    };

    ChatManager.sendMessage(message);

    $scope.chat.message = '';
  };

  $scope.getFromName = function (message) {
    return ChatManager.getMessageName(message);
  };

  $scope.getStatusText = function (message) {
    if (message.to_device === to_device) {
      switch (message.status) {
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST:
          return 'You have requested to chat with ' + ChatManager.getDeviceName(message.to_device);
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED:
          return 'Accepted chat request';
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED:
          return 'Declined chat request';
        case ChatManager.MESSAGE_STATUSES.CHAT_CLOSED:
          return 'Closed the chat';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST:
          return 'Gift request sent';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED:
          return 'Accepted a gift';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED:
          return 'Declined a gift';
      }
    } else if (message.device === to_device) {
      switch (message.status) {
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST:
          return $scope.getFromName(message) + ' would like to chat with you';
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED:
          return 'Accepted chat request';
        case ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED:
          return 'Declined chat request';
        case ChatManager.MESSAGE_STATUSES.CHAT_CLOSED:
          return 'Closed the chat';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST:
          return 'Would like to send you a gift';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED:
          return 'Accepted a gift';
        case ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED:
          return 'Declined a gift';
      }
    }
  };

  $scope.isUnread = function (message) {
    if (message.to_device === to_device) {
      return false;
    }

    return ChatManager.checkIfUnread(to_device, message);
  };

  $scope.markAsRead = function () {
    if (!to_device) {
      return;
    }

    ChatManager.markAsRead(to_device);
  };

  $scope.onKeydown = function (keycode) {
    if (keycode === 13) {
      $timeout(function () {
        $scope.sendMessage();
      });
    }
  };

  LocationModel.devicesChanged.add(showMessages);
  LocationModel.seatsChanged.add(showMessages);
  ChatManager.model.historyChanged.add(showMessages);
  showMessages();
}]);

//src/js/controllers/chatmap.js

angular.module('SNAP.controllers').controller('ChatMapCtrl', ['$scope', '$timeout', 'ChatManager', 'ShellManager', 'DialogManager', 'NavigationManager', 'LocationModel', function ($scope, $timeout, ChatManager, ShellManager, DialogManager, NavigationManager, LocationModel) {

  $scope.seats = [];

  $scope.mapImage = ShellManager.model.elements.location_map;
  ShellManager.model.elementsChanged.add(function () {
    $timeout(function () {
      return $scope.mapImage = ShellManager.model.elements.location_map;
    });
  });

  function buildMap() {
    if (!LocationModel.seat) {
      return;
    }

    $timeout(function () {
      $scope.seats = LocationModel.seats.filter(function (seat) {
        return seat.token !== LocationModel.seat.token;
      }).map(function (seat) {
        var devices = LocationModel.devices.filter(function (device) {
          return device.seat === seat.token;
        }).map(function (device) {
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
          is_available: devices.filter(function (device) {
            return device.is_available;
          }).length > 0
        };
      });
    });
  }

  LocationModel.devicesChanged.add(buildMap);
  LocationModel.seatsChanged.add(buildMap);
  LocationModel.seatChanged.add(buildMap);
  buildMap();

  $scope.chooseSeat = function (seat) {
    var device = seat.devices[0];

    if (!seat.is_available || !device) {
      var deviceName = device && device.username ? device.username : seat.name;
      DialogManager.alert(deviceName + ' is unavailable for chat');
      return;
    }

    ChatManager.approveDevice(device.token);
    $scope.exitMap();
  };

  $scope.exitMap = function () {
    NavigationManager.location = { type: 'chat' };
  };
}]);

//src/js/controllers/chatroom.js

angular.module('SNAP.controllers').controller('ChatRoomCtrl', ['$scope', '$timeout', 'ChatManager', 'NavigationManager', 'ShellManager', 'SNAPLocation', function ($scope, $timeout, ChatManager, NavigationManager, ShellManager, SNAPLocation) {

  if (!SNAPLocation.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPLocation.location_name;

  $scope.getPartialUrl = function (name) {
    return ShellManager.getPartialUrl(name);
  };
}]);

//src/js/controllers/checkout.js

angular.module('SNAP.controllers').controller('CheckoutCtrl', ['$scope', '$rootScope', '$timeout', 'CustomerManager', 'OrderManager', 'DialogManager', 'NavigationManager', 'SessionManager', 'ShellManager', 'LocationModel', 'SurveyManager', function ($scope, $rootScope, $timeout, CustomerManager, OrderManager, DialogManager, NavigationManager, SessionManager, ShellManager, LocationModel, SurveyManager) {

  //------------------------------------------------------------------------
  //
  //  Constants
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Check split type
  //-----------------------------------------------

  $scope.CHECK_SPLIT_NONE = 0;
  $scope.CHECK_SPLIT_BY_ITEMS = 1;
  $scope.CHECK_SPLIT_EVENLY = 2;

  //-----------------------------------------------
  //    Payment method
  //-----------------------------------------------

  $scope.PAYMENT_METHOD_CARD = 1;
  $scope.PAYMENT_METHOD_CASH = 2;
  $scope.PAYMENT_METHOD_PAYPAL = 3;

  //-----------------------------------------------
  //    Receipt method
  //-----------------------------------------------

  $scope.RECEIPT_METHOD_NONE = 0;
  $scope.RECEIPT_METHOD_EMAIL = 1;
  $scope.RECEIPT_METHOD_SMS = 2;
  $scope.RECEIPT_METHOD_PRINT = 3;

  //-----------------------------------------------
  //    Checkout step
  //-----------------------------------------------

  $scope.STEP_CHECK_SPLIT = 0;
  $scope.STEP_PAYMENT_METHOD = 1;
  $scope.STEP_TIPPING = 2;
  $scope.STEP_SIGNATURE = 3;
  $scope.STEP_RECEIPT = 4;
  $scope.STEP_COMPLETE = 5;

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  $scope.options = {};
  $scope.data = [{
    items: OrderManager.model.orderCheck
  }];

  //-----------------------------------------------
  //    Check
  //-----------------------------------------------

  //Checks data
  var data = $scope.$watchAsProperty('data');
  data.changes().subscribe(function (value) {
    if (value.value) {
      var data = value.value();
      $scope.options.count = data.length;
    }

    $scope.options.index = 0;
  });

  //Maximum number of guests
  $scope.options.guest_count_max = Math.max(SessionManager.guestCount, OrderManager.model.orderCheck.reduce(function (i, item) {
    return i + item.quantity;
  }, 0));

  //Number of guests
  $scope.options.guest_count = SessionManager.guestCount;

  //Check split mode
  $scope.options.check_split = $scope.CHECK_SPLIT_NONE;

  //Check index
  $scope.options.index = 0;
  var index = $scope.$watchAsProperty('options.index');
  Bacon.combineAsArray(index, data).subscribe(function () {
    $scope.current = $scope.data[$scope.options.index];

    if (CustomerManager.model.isAuthenticated && !CustomerManager.model.isGuest) {
      $scope.current.receipt_phone = $scope.current.receipt_phone || CustomerManager.model.profile.phone;
      $scope.current.receipt_email = CustomerManager.model.hasCredentials ? CustomerManager.model.profile.email : $scope.current.receipt_email;
    }

    if ($scope.current.items) {
      $scope.current.subtotal = OrderManager.calculateTotalPrice($scope.current.items);
      $scope.current.tax = OrderManager.calculateTax($scope.current.items);
    }

    if (!$scope.current.tip) {
      $scope.current.tip = 0;
    }
  });

  //-----------------------------------------------
  //    Navigation
  //-----------------------------------------------

  //Current step
  $scope.options.step = $scope.options.guest_count_max > 1 ? $scope.STEP_CHECK_SPLIT : $scope.STEP_TIPPING;
  var step = $scope.$watchAsProperty('options.step');
  step.skipDuplicates().subscribe(function (value) {
    if (!value.value) {
      return;
    }

    var step = value.value();

    if (step === $scope.STEP_COMPLETE) {
      startNextCheck();
    }
  });

  //-----------------------------------------------
  //    Misc
  //-----------------------------------------------

  //Seat name
  $scope.options.seat = LocationModel.seat ? LocationModel.seat.name : 'Table';
  LocationModel.seatChanged.add(function (seat) {
    $scope.options.seat = seat ? seat.name : 'Table';
  });

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  //Proceed with the next check
  function startNextCheck() {
    var check = $scope.current;

    if ($scope.options.index === $scope.options.count - 1) {
      OrderManager.clearCheck();
      NavigationManager.location = {
        type: SurveyManager.model.isEnabled ? 'survey' : 'home'
      };
      return;
    }

    $timeout(function () {
      $scope.options.index++;
      $scope.options.step = $scope.STEP_TIPPING;
    });
  }

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  $scope.getPartialUrl = function (name) {
    return ShellManager.getPartialUrl(name);
  };

  //Calculate a cart item title
  $scope.calculateTitle = function (entry) {
    return entry.name || entry.item.title;
  };

  //Calculate a cart item price
  $scope.calculatePrice = function (entry) {
    return OrderManager.calculatePrice(entry);
  };

  //Calculate cart items price
  $scope.calculateTotalPrice = function (entries) {
    return OrderManager.calculateTotalPrice(entries);
  };

  //Output a formatted price string
  $scope.formatPrice = function (value) {
    return ShellManager.formatPrice(value || 0);
  };

  //------------------------------------------------------------------------
  //
  //  Startup
  //
  //------------------------------------------------------------------------

  if (!CustomerManager.model.isAuthenticated) {
    NavigationManager.location = { type: 'signin' };
    return;
  }

  $scope.initialized = true;
}]);

//src/js/controllers/checkoutmethod.js

angular.module('SNAP.controllers').controller('CheckoutMethodCtrl', ['$scope', '$timeout', 'CustomerModel', 'CardReader', 'DialogManager', 'OrderManager', 'Logger', function ($scope, $timeout, CustomerModel, CardReader, DialogManager, OrderManager, Logger) {

  CardReader.onReceived.add(function (data) {
    Logger.debug('Card reader result: ' + JSON.stringify(data));
    var card = {
      number: data.card_number,
      month: data.expiration_month,
      year: data.expiration_year,
      data: data.data
    };

    CardReader.stop();
    cardDataReceived(card);
  });

  CardReader.onError.add(function (e) {
    Logger.debug('Card reader error: ' + JSON.stringify(e));
    DialogManager.alert(ALERT_CARDREADER_ERROR);
  });

  $scope.$on('$locationChangeStart', function () {
    CardReader.stop();
  });

  //Generate a payment token
  function generatePaymentToken() {
    var job = DialogManager.startJob();

    OrderManager.generatePaymentToken().then(function () {
      DialogManager.endJob(job);
    }, function (e) {
      Logger.debug('Payment token generation error: ' + JSON.stringify(e));
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  }

  //Called when a card data is received
  function cardDataReceived(card) {
    $timeout(function () {
      OrderManager.clearCheck($scope.current.items);
      $scope.current.card_data = card.data;
      $scope.options.step = $scope.STEP_SIGNATURE;
    });
  }

  //Choose to pay with a credit card
  $scope.payCard = function () {
    $scope.current.payment_method = $scope.PAYMENT_METHOD_CARD;
    CardReader.start();
  };

  $scope.payCardCancel = function () {
    $scope.current.payment_method = undefined;
    CardReader.stop();
  };

  //Choose to pay with cash
  $scope.payCash = function () {
    $scope.current.payment_method = $scope.PAYMENT_METHOD_CASH;

    if (OrderManager.model.closeoutRequest != null) {
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
      $timeout(function () {
        $scope.options.step = $scope.STEP_COMPLETE;
      });
      return;
    }

    var job = DialogManager.startJob();

    OrderManager.requestCloseout().then(function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
      $timeout(function () {
        $scope.options.step = $scope.STEP_COMPLETE;
      });
    }, function (e) {
      Logger.debug('Request closeout error: ' + JSON.stringify(e));
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  generatePaymentToken();
}]);

//src/js/controllers/checkoutreceipt.js

angular.module('SNAP.controllers').controller('CheckoutReceiptCtrl', ['$scope', '$timeout', 'DialogManager', 'OrderManager', function ($scope, $timeout, DialogManager, OrderManager) {

  //Choose to have no receipt
  $scope.receiptNone = function () {
    $scope.current.receipt_method = $scope.RECEIPT_METHOD_NONE;
    $scope.options.step = $scope.STEP_COMPLETE;
  };

  //Choose to receive a receipt by e-mail
  $scope.receiptEmail = function () {
    if (!$scope.current.receipt_email) {
      return;
    }

    $scope.current.receipt_method = $scope.RECEIPT_METHOD_EMAIL;
    requestReceipt();
  };

  //Choose to receive a receipt by sms
  $scope.receiptSms = function () {
    if (!$scope.current.receipt_phone) {
      return;
    }

    $scope.current.receipt_phone = $scope.RECEIPT_METHOD_SMS;
    requestReceipt();
  };

  //Choose to receive a printed receipt
  $scope.receiptPrint = function () {
    $scope.current.receipt_method = $scope.RECEIPT_METHOD_PRINT;
    requestReceipt();
  };

  function requestReceipt() {
    var item = $scope.current;

    var request = {
      checkout_token: item.checkout_token,
      receipt_method: item.receipt_method
    };

    if (item.receipt_method === $scope.RECEIPT_METHOD_EMAIL) {
      request.receipt_email = item.receipt_email;
    } else if (item.receipt_method === $scope.RECEIPT_METHOD_SMS) {
      request.receipt_phone = item.receipt_phone;
    }

    var job = DialogManager.startJob();

    OrderManager.requestReceipt(request).then(function () {
      DialogManager.endJob(job);

      $timeout(function () {
        $scope.options.step = $scope.STEP_COMPLETE;
      });
    }, function (e) {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  }
}]);

//src/js/controllers/checkoutsignature.js

angular.module('SNAP.controllers').controller('CheckoutSignatureCtrl', ['$scope', '$timeout', 'DialogManager', 'OrderManager', 'Logger', function ($scope, $timeout, DialogManager, OrderManager, Logger) {

  //Clear the current signature
  var resetSignature = function resetSignature() {
    $timeout(function () {
      $scope.current.signature_token = undefined;

      var signature = $('#checkout-signature-input');
      signature.empty();
      signature.jSignature('init', {
        'color': '#000',
        'background-color': '#fff',
        'decor-color': '#fff',
        'width': '100%',
        'height': '200px'
      });
    }, 300);
  };

  //Submit the current signature input
  $scope.signatureSubmit = function () {
    var signature = $('#checkout-signature-input');

    if (signature.jSignature('getData', 'native').length === 0) {
      return;
    }

    var job = DialogManager.startJob();
    var sig = signature.jSignature('getData', 'image');

    OrderManager.uploadSignature(sig[1]).then(function (token) {
      DialogManager.endJob(job);

      $timeout(function () {
        $scope.current.signature_token = token;
        completeCheckout();
      });
    }, function (e) {
      Logger.debug('Signature upload error: ' + JSON.stringify(e));
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  //Cancel the current signature input
  $scope.signatureCancel = function () {
    resetSignature();
  };

  //Complete the checkout
  function completeCheckout() {
    var item = $scope.current;
    var job = DialogManager.startJob();

    var request = {
      amount_subtotal: item.subtotal,
      amount_tax: item.tax,
      amount_tip: item.tip,
      card_data: item.card_data,
      signature_token: item.signature_token,
      order_tokens: item.items != null ? item.items.reduce(function (result, item) {
        for (var i = 0; i < item.quantity; i++) {
          result.push(item.request);
        }

        return result;
      }, []) : null
    };

    OrderManager.payOrder(request).then(function (result) {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);

      $timeout(function () {
        $scope.current.checkout_token = result.token;
        $scope.options.step = $scope.STEP_RECEIPT;
      });
    }, function (e) {
      Logger.debug('Order payment error: ' + JSON.stringify(e));
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  }

  var step = $scope.$watchAsProperty('options.step');
  step.skipDuplicates().subscribe(function (value) {
    if (!value.value || value.value() !== $scope.STEP_SIGNATURE) {
      return;
    }

    resetSignature();
  });
}]);

//src/js/controllers/checkoutsplit.js

angular.module('SNAP.controllers').controller('CheckoutSplitCtrl', ['$scope', '$timeout', 'OrderManager', function ($scope, $timeout, OrderManager) {

  //Split the current order in the selected way
  $scope.splitCheck = function (type) {
    var i,
        data = [];

    if (type === $scope.CHECK_SPLIT_NONE) {
      data.push({
        items: OrderManager.model.orderCheck
      });

      $scope.options.step = $scope.STEP_TIPPING;
    } else if (type === $scope.CHECK_SPLIT_EVENLY) {
      var check = OrderManager.model.orderCheck,
          subtotal = OrderManager.calculateTotalPrice(check),
          tax = OrderManager.calculateTax(check);

      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          subtotal: Math.round(subtotal / $scope.options.guest_count * 100) / 100,
          tax: Math.round(tax / $scope.options.guest_count * 100) / 100
        });
      }

      $scope.options.step = $scope.STEP_TIPPING;
    } else if (type === $scope.CHECK_SPLIT_BY_ITEMS) {
      for (i = 0; i < $scope.options.guest_count; i++) {
        data.push({
          items: []
        });
      }

      $scope.split_items = OrderManager.model.orderCheck.slice(0).map(function (item) {
        return item.clone();
      });
    }

    $scope.$parent.data = data;
    $scope.options.check_split = type;
  };

  //Move an item to the current check
  $scope.addToCheck = function (entry) {
    $scope.split_items = $scope.split_items.map(function (item) {
      if (item.request !== entry.request) {
        return item;
      }

      if (item.quantity > 1) {
        item.quantity--;
        return item.clone();
      }

      return null;
    }).filter(function (item) {
      return item != null;
    });

    var exists = false;

    $scope.current.items = $scope.current.items.map(function (item) {
      if (item.request === entry.request) {
        exists = true;
        item.quantity++;
        return item.clone();
      }

      return item;
    });

    if (!exists) {
      var clone = entry.clone();
      clone.quantity = 1;

      $scope.current.items.push(clone);
    }
  };

  //Remove an item from the current check
  $scope.removeFromCheck = function (entry) {
    $scope.current.items = $scope.current.items.map(function (item) {
      if (item.request !== entry.request) {
        return item;
      }

      if (item.quantity > 1) {
        item.quantity--;
        return item.clone();
      }

      return null;
    }).filter(function (item) {
      return item != null;
    });

    var exists = false;

    $scope.split_items = $scope.split_items.map(function (item) {
      if (item.request === entry.request) {
        exists = true;
        item.quantity++;
        return item.clone();
      }

      return item;
    });

    if (!exists) {
      var clone = entry.clone();
      clone.quantity = 1;

      $scope.split_items.push(clone);
    }
  };

  //Move all available items to the current check
  $scope.addAllToCheck = function () {
    $scope.split_items.forEach($scope.addToCheck);

    $scope.split_items.forEach(function (item) {
      $scope.current.items.forEach(function (newitem) {
        if (newitem.request === item.request) {
          newitem.quantity += item.quantity;
        }
      });
    });

    $scope.split_items = [];
  };

  //Remove all items from the current check
  $scope.removeAllFromCheck = function () {
    $scope.current.items.forEach($scope.removeFromCheck);

    $scope.current.items.forEach(function (item) {
      $scope.split_items.forEach(function (newitem) {
        if (newitem.request === item.request) {
          newitem.quantity += item.quantity;
        }
      });
    });

    $scope.current.items = [];
  };

  //Proceed with the next check splitting
  $scope.splitNextCheck = function () {
    if ($scope.options.index < $scope.options.count - 1 && $scope.split_items.length > 0) {
      $scope.options.index++;
      return;
    }

    if ($scope.split_items.length > 0) {
      $scope.addAllToCheck();
    }

    $timeout(function () {
      $scope.$parent.data = $scope.$parent.data.filter(function (check) {
        return check.items.length > 0;
      });

      $scope.options.step = $scope.STEP_TIPPING;
    });
  };

  var step = $scope.$watchAsProperty('options.step');
  step.skipDuplicates().subscribe(function (value) {
    if (!value.value || value.value() !== $scope.STEP_CHECK_SPLIT) {
      return;
    }

    $timeout(function () {
      $scope.options.check_split = $scope.CHECK_SPLIT_NONE;
    });
  });
}]);

//src/js/controllers/checkouttip.js

angular.module('SNAP.controllers').controller('CheckoutTipCtrl', ['$scope', '$timeout', 'OrderManager', function ($scope, $timeout, OrderManager) {

  //Add a tip
  $scope.addTip = function (amount) {
    $scope.current.tip = Math.round($scope.current.subtotal * amount * 100) / 100;
  };

  //Apply the selected tip amount and proceed further
  $scope.applyTip = function () {
    $scope.options.step = $scope.STEP_PAYMENT_METHOD;
  };
}]);

//src/js/controllers/commands/boot.js

angular.module('SNAP.controllers').factory('CommandBoot', ['AuthenticationManager', 'LocationManager', function (AuthenticationManager, LocationManager) {

  function loadLocation() {
    return LocationManager.loadConfig().then(function () {
      return LocationManager.loadSeats();
    });
  }

  return function () {
    return AuthenticationManager.validate().then(function (authorized) {
      if (authorized === false) {
        return AuthenticationManager.authorize().then(function () {
          return loadLocation();
        });
      }

      return loadLocation();
    });
  };
}]);

//src/js/controllers/commands/customerguestlogin.js

angular.module('SNAP.controllers').factory('CommandCustomerGuestLogin', ['AuthenticationManager', 'CustomerManager', function (AuthenticationManager, CustomerManager) {

  return function () {
    return CustomerManager.guestLogin();
  };
}]);

//src/js/controllers/commands/customerlogin.js

angular.module('SNAP.controllers').factory('CommandCustomerLogin', ['AuthenticationManager', 'CustomerManager', function (AuthenticationManager, CustomerManager) {

  return function (credentials) {
    return AuthenticationManager.customerLoginRegular(credentials).then(function () {
      return CustomerManager.login(credentials);
    });
  };
}]);

//src/js/controllers/commands/customersignup.js

angular.module('SNAP.controllers').factory('CommandCustomerSignup', ['AuthenticationManager', 'CustomerManager', function (AuthenticationManager, CustomerManager) {

  return function (registration) {
    return CustomerManager.signUp(registration).then(function () {
      var credentials = {
        login: registration.username,
        password: registration.password
      };

      return AuthenticationManager.customerLoginRegular(credentials).then(function () {
        return CustomerManager.login(credentials);
      });
    });
  };
}]);

//src/js/controllers/commands/customersociallogin.js

angular.module('SNAP.controllers').factory('CommandCustomerSocialLogin', ['AuthenticationManager', 'CustomerManager', 'SocialManager', function (AuthenticationManager, CustomerManager, SocialManager) {

  function doLogin(auth) {
    return AuthenticationManager.customerLoginSocial(auth).then(function () {
      return CustomerManager.loginSocial(auth);
    });
  }

  return {
    facebook: function facebook() {
      return SocialManager.loginFacebook().then(doLogin);
    },
    googleplus: function googleplus() {
      return SocialManager.loginGooglePlus().then(doLogin);
    },
    twitter: function twitter() {
      return SocialManager.loginTwitter().then(doLogin);
    }
  };
}]);

//src/js/controllers/commands/flipscreen.js

angular.module('SNAP.controllers').factory('CommandFlipScreen', ['ManagementService', function (ManagementService) {
  return function () {
    ManagementService.rotateScreen();
  };
}]);

//src/js/controllers/commands/reset.js

angular.module('SNAP.controllers').factory('CommandReset', ['AnalyticsManager', 'ChatManager', 'CustomerManager', 'OrderManager', 'SessionManager', 'SurveyManager', 'ManagementService', 'Logger', function (AnalyticsManager, ChatManager, CustomerManager, OrderManager, SessionManager, SurveyManager, ManagementService, Logger) {
  return function () {
    function fail(e) {
      Logger.warn('Unable to reset properly: ' + e.message);
      ManagementService.reset();
    }

    SessionManager.endSession();

    AnalyticsManager.submit().then(function () {
      OrderManager.reset().then(function () {
        SurveyManager.reset().then(function () {
          CustomerManager.logout().then(function () {
            ChatManager.reset().then(function () {
              ManagementService.reset();
            }, fail);
          }, fail);
        }, fail);
      }, fail);
    }, fail);
  };
}]);

//src/js/controllers/commands/startup.js

angular.module('SNAP.controllers').factory('CommandStartup', ['Logger', 'AppCache', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SurveyManager', 'SNAPLocation', function (Logger, AppCache, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SurveyManager, SNAPLocation) {

  return function () {
    return new Promise(function (result, reject) {

      function fail(e) {
        Logger.warn('Unable to startup properly: ' + e.message);
      }

      function cacheComplete(updated) {
        if (updated) {
          window.location.reload(true);
        } else {
          DataManager.initialize();
        }
      }

      if (AppCache.isUpdated) {
        cacheComplete(true);
        return result();
      } else if (AppCache.isComplete) {
        cacheComplete(false);
      }

      AppCache.complete.add(cacheComplete);

      ShellManager.initialize();

      if (CustomerManager.model.isEnabled) {
        if (!CustomerManager.model.isAuthenticated) {
          NavigationManager.location = { type: 'signin' };
        }
      } else {
        CustomerManager.guestLogin();
      }

      return result();
    });
  };
}]);

//src/js/controllers/commands/submitorder.js

angular.module('SNAP.controllers').factory('CommandSubmitOrder', ['DialogManager', 'LocationModel', 'OrderManager', function (DialogManager, LocationModel, OrderManager) {

  return function (options) {
    if (!LocationModel.seat || !LocationModel.seat.token) {
      DialogManager.alert(ALERT_ERROR_NO_SEAT);
      return;
    }

    var job = DialogManager.startJob();

    options = options || 0;

    OrderManager.submitCart(options).then(function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_ORDER_SENT);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };
}]);

//src/js/controllers/dialog.js

angular.module('SNAP.controllers').controller('DialogCtrl', ['$scope', '$timeout', 'ActivityMonitor', 'DialogManager', function ($scope, $timeout, ActivityMonitor, DialogManager) {

  var alertStack = [],
      confirmStack = [];
  var alertIndex = -1,
      confirmIndex = -1;
  var alertTimer;

  function updateVisibility(isBusy, showAlert, showConfirm) {
    $timeout(function () {
      $scope.isBusy = isBusy !== undefined ? isBusy : $scope.isBusy;
      $scope.showAlert = showAlert !== undefined ? showAlert : $scope.showAlert;
      $scope.showConfirm = showConfirm !== undefined ? showConfirm : $scope.showConfirm;
      $scope.visible = $scope.isBusy || $scope.showAlert || $scope.showConfirm;
    });
  }

  function showNextAlert() {
    if (alertTimer) {
      $timeout.cancel(alertTimer);
    }

    var alert = alertStack[alertIndex];

    if (alert && alert.resolve) {
      alert.resolve();
    }

    alertIndex++;

    if (alertIndex === alertStack.length) {
      updateVisibility(undefined, false);
      alertStack = [];
      alertIndex = -1;
      return;
    }

    $timeout(function () {
      $scope.alertTitle = alertStack[alertIndex].title;
      $scope.alertText = alertStack[alertIndex].message;
      updateVisibility(undefined, true);
    });

    alertTimer = $timeout(showNextAlert, 10000);
  }

  function showNextConfirm() {
    confirmIndex++;

    if (confirmIndex === confirmStack.length) {
      updateVisibility(undefined, undefined, false);
      confirmStack = [];
      confirmIndex = -1;
      return;
    }

    $timeout(function () {
      $scope.confirmText = confirmStack[confirmIndex].message;
      updateVisibility(undefined, undefined, true);
    });
  }

  function getMessage(message) {
    if (typeof message !== 'string') {
      switch (message) {
        case ALERT_GENERIC_ERROR:
          message = "Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.";
          break;
        case ALERT_REQUEST_SUBMIT_ERROR:
          message = "Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.";
          break;
        case ALERT_REQUEST_ASSISTANCE_SENT:
          message = "Call Server request was sent successfully.";
          break;
        case ALERT_REQUEST_ASSISTANCE_RECEIVED:
          message = "Your request for server assistance has been seen, and accepted.";
          break;
        case ALERT_REQUEST_CLOSEOUT_SENT:
          message = "Request check request was sent successfully.";
          break;
        case ALERT_REQUEST_CLOSEOUT_RECEIVED:
          message = "Your check request has been seen, and accepted.";
          break;
        case ALERT_REQUEST_ORDER_SENT:
          message = "Order sent! You will be notified when your waiter accepts the order.";
          break;
        case ALERT_REQUEST_ORDER_RECEIVED:
          message = "Your order has been successfully accepted.";
          break;
        case ALERT_SIGNIN_REQUIRED:
          message = "You must be logged into SNAP to access this page.";
          break;
        case ALERT_TABLE_ASSISTANCE:
          message = "Are you sure you want to call the waiter?";
          break;
        case ALERT_TABLE_CLOSEOUT:
          message = "Are you sure you want to request your check?";
          break;
        case ALERT_TABLE_RESET:
          message = "Are you sure you want to reset?";
          break;
        case ALERT_DELET_CARD:
          message = "Are you sure you want to remove this payment method?";
          break;
        case ALERT_PASSWORD_RESET_COMPLETE:
          message = "A link to change your password has been emailed.";
          break;
        case ALERT_SOFTWARE_OUTDATED:
          message = "A software update is available. Please restart the application.";
          break;
        case ALERT_CARDREADER_ERROR:
          message = "Unable to read the card data. Please try again.";
          break;
        case ALERT_ERROR_NO_SEAT:
          message = "Device is not assigned to any table.";
          break;
        case ALERT_ERROR_STARTUP:
          message = "Unable to start the application.";
          break;
      }
    }

    return message;
  }

  $scope.visible = false;
  $scope.isBusy = false;
  $scope.showAlert = false;
  $scope.showConfirm = false;

  $scope.closeAlert = function () {
    ActivityMonitor.activityDetected();
    showNextAlert();
  };

  $scope.closeConfirm = function (confirmed) {
    ActivityMonitor.activityDetected();

    var confirm = confirmStack[confirmIndex];

    if (confirm) {
      if (confirmed) {
        if (confirm.resolve) {
          confirm.resolve();
        }
      } else {
        if (confirm.reject) {
          confirm.reject();
        }
      }
    }

    showNextConfirm();
  };

  function alertRequested(message, title, resolve, reject) {
    message = getMessage(message);

    alertStack.push({ title: title, message: message, resolve: resolve, reject: reject });

    if (!$scope.showAlert) {
      $timeout(showNextAlert);
    }
  }

  DialogManager.alertRequested.add(alertRequested);

  function confirmRequested(message, resolve, reject) {
    message = getMessage(message);

    confirmStack.push({ message: message, resolve: resolve, reject: reject });

    if (!$scope.showConfirm) {
      $timeout(showNextConfirm);
    }
  }

  DialogManager.confirmRequested.add(confirmRequested);

  function jobStarted() {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    updateVisibility(true);
  }

  DialogManager.jobStarted.add(jobStarted);
  DialogManager.jobEnded.add(function () {
    updateVisibility(false);
  });

  if (DialogManager.jobs > 0) {
    jobStarted();
  }
}]);

//src/js/controllers/galaxies/advertisement.js

angular.module('SNAP.controllers').controller('GalaxiesAdvertisementCtrl', ['$scope', '$timeout', 'ActivityMonitor', 'AnalyticsModel', 'ShellManager', 'DataManager', 'DataProvider', 'DialogManager', 'NavigationManager', 'CommandReset', 'CommandFlipScreen', 'ShellManager', 'WebBrowser', 'SNAPEnvironment', function ($scope, $timeout, ActivityMonitor, AnalyticsModel, hellManager, DataManager, DataProvider, DialogManager, NavigationManager, CommandReset, CommandFlipScreen, ShellManager, WebBrowser, SNAPEnvironment) {

  $scope.visible = false;

  $scope.advertisementClick = function (item) {
    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    AnalyticsModel.logAdvertisement({
      token: item.token,
      type: 'click'
    });

    if (item.href) {
      NavigationManager.location = { type: 'url', url: item.href.url };
    }
  };

  $scope.advertisementImpression = function (item) {
    if (ActivityMonitor.active && $scope.visible) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.advertisements = [];

  DataProvider.advertisements().then(function (data) {
    $timeout(function () {
      $scope.advertisements = data.main.map(function (ad) {
        return {
          src: ShellManager.getMediaUrl(ad.src, 970, 90),
          href: ad.href,
          type: ShellManager.getMediaType(ad.src),
          token: ad.token
        };
      });
    });
  });

  NavigationManager.locationChanging.add(function (location) {
    $scope.visible = location.type === 'home';
    $timeout(function () {
      return $scope.$apply();
    });
  });
}]);

//src/js/controllers/galaxies/cart.js

angular.module('SNAP.controllers').controller('GalaxiesCartCtrl', ['$scope', '$timeout', '$sce', 'CustomerManager', 'ShellManager', 'NavigationManager', 'OrderManager', 'DialogManager', 'CartModel', 'LocationModel', 'ChatManager', function ($scope, $timeout, $sce, CustomerManager, ShellManager, NavigationManager, OrderManager, DialogManager, CartModel, LocationModel, ChatManager) {

  $scope.STATE_CART = CartModel.STATE_CART;
  $scope.STATE_HISTORY = CartModel.STATE_HISTORY;

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.formatPrice = function (value) {
    return ShellManager.formatPrice(value);
  };
  $scope.options = {};

  $scope.currency = ShellManager.model.currency;
  ShellManager.model.currencyChanged.add(function (currency) {
    return $timeout(function () {
      return $scope.currency = currency;
    });
  });

  $scope.state = CartModel.cartState;
  CartModel.cartStateChanged.add(function (state) {
    return $timeout(function () {
      return $scope.state = state;
    });
  });

  $scope.editableItem = CartModel.editableItem;
  CartModel.editableItemChanged.add(function (item) {
    return $timeout(function () {
      return $scope.editableItem = item;
    });
  });

  $scope.currentOrder = OrderManager.model.orderCart;
  OrderManager.model.orderCartChanged.add(function (value) {
    return $scope.currentOrder = value;
  });

  $scope.totalOrder = OrderManager.model.orderCheck;
  OrderManager.model.orderCheckChanged.add(function (value) {
    return $scope.totalOrder = value;
  });

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(function (token) {
    $timeout(function () {
      return $scope.giftSeat = LocationModel.getSeat(token);
    });
  });

  $scope.customerName = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(function () {
    $timeout(function () {
      return $scope.customerName = CustomerManager.customerName;
    });
  });

  $scope.checkoutEnabled = CustomerManager.model.isEnabled;
  $scope.visible = CartModel.isCartOpen;

  NavigationManager.locationChanging.add(function (location) {
    if (location.type !== 'category') {
      CartModel.isCartOpen = false;
      CartModel.closeEditor();
    }
  });

  CartModel.isCartOpenChanged.add(function (value) {
    $scope.showCart();
    $scope.visible = value;
  });

  $scope.seat_name = LocationModel.seat ? LocationModel.seat.name : 'Table';

  LocationModel.seatChanged.add(function (seat) {
    return $scope.seat_name = seat ? seat.name : 'Table';
  });

  var refreshAssistanceRequest = function refreshAssistanceRequest() {
    $scope.requestAssistanceAvailable = OrderManager.model.assistanceRequest == null;
  };
  var refreshCloseoutRequest = function refreshCloseoutRequest() {
    $scope.requestCloseoutAvailable = OrderManager.model.closeoutRequest == null;
  };

  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  OrderManager.model.closeoutRequestChanged.add(refreshCloseoutRequest);

  $scope.requestAssistanceAvailable = OrderManager.model.assistanceRequest == null;
  $scope.requestCloseoutAvailable = OrderManager.model.closeoutRequest == null;

  $scope.getModifiers = function (entry) {
    if (!entry.modifiers) {
      return [];
    }

    return entry.modifiers.reduce(function (result, category) {
      var modifiers = category.modifiers.filter(function (modifier) {
        return modifier.isSelected;
      });
      result = result.concat(modifiers);
      return result;
    }, []);
  };

  $scope.calculatePrice = function (entry) {
    return OrderManager.calculatePrice(entry);
  };
  $scope.calculateTotalPrice = function (entries) {
    return OrderManager.calculateTotalPrice(entries);
  };

  $scope.editItem = function (entry) {
    return CartModel.openEditor(entry, false);
  };

  $scope.updateModifiers = function (category, modifier) {
    if (category.data.selection === 1) {
      angular.forEach(category.modifiers, function (m) {
        return m.isSelected = m === modifier;
      });
    } else {
      modifier.isSelected = !modifier.isSelected;
    }
  };

  $scope.removeFromCart = function (entry) {
    return $scope.currentOrder = OrderManager.removeFromCart(entry);
  };
  $scope.reorderItem = function (entry) {
    return $scope.currentOrder = OrderManager.addToCart(entry.clone());
  };

  $scope.submitCart = function () {
    var job = DialogManager.startJob();

    var options = $scope.options.toGo ? 2 : 0;

    OrderManager.submitCart(options).then(function () {
      DialogManager.endJob(job);

      $scope.$apply(function () {
        $scope.currentOrder = OrderManager.model.orderCart;
        $scope.totalOrder = OrderManager.model.orderCheck;
        $scope.options.toGo = false;
      });

      DialogManager.alert(ALERT_REQUEST_ORDER_SENT);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.clearCart = function () {
    $scope.options.toGo = false;
    $scope.currentOrder = OrderManager.clearCart();
  };

  $scope.closeEditor = function () {
    CartModel.closeEditor();
  };

  $scope.closeCart = function () {
    CartModel.isCartOpen = false;
    CartModel.state = CartModel.STATE_CART;
  };

  $scope.showHistory = function () {
    return CartModel.state = CartModel.STATE_HISTORY;
  };
  $scope.showCart = function () {
    return CartModel.state = CartModel.STATE_CART;
  };

  $scope.payCheck = function () {
    return NavigationManager.location = { type: 'checkout' };
  };

  $scope.requestAssistance = function () {
    if (!$scope.requestAssistanceAvailable) {
      return;
    }

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.requestCloseout = function () {
    if (!$scope.requestCloseoutAvailable) {
      return;
    }

    var job = DialogManager.startJob();

    OrderManager.requestCloseout().then(function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };
}]);

//src/js/controllers/galaxies/category.js

angular.module('SNAP.controllers').controller('GalaxiesCategoryCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', function ($scope, $timeout, DataManager, NavigationManager, ShellManager) {

  $scope.goBack = function () {
    return NavigationManager.goBack();
  };

  var CategoryList = React.createClass({
    displayName: 'CategoryList',

    render: function render() {
      var rows = this.props.tiles.map(function (tile, i) {
        var background = ShellManager.getMediaUrl(tile.image, 470, 410);
        return React.DOM.td({
          className: 'tile tile-regular',
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          },
          style: {
            backgroundImage: background ? 'url("' + background + '")' : null
          }
        }, React.DOM.span(null, tile.title)));
      }).reduce(function (result, value, i) {
        result[i % 2].push(value);
        return result;
      }, [[], []]).map(function (row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({
        className: 'tile-table'
      }, rows);
    }
  });

  DataManager.categoryChanged.add(function (category) {
    if (!category) {
      return $timeout(function () {
        return $scope.category = null;
      });
    }

    var items = category.items || [],
        categories = category.categories || [];

    var tiles = categories.concat(items).map(function (item) {
      return {
        title: item.title,
        image: item.image,
        url: '#' + NavigationManager.getPath(item.destination),
        destination: item.destination
      };
    });

    React.render(React.createElement(CategoryList, { tiles: tiles }), document.getElementById('page-category-content'));

    $scope.category = category;
    $timeout(function () {
      return $scope.$apply();
    });
  });

  NavigationManager.locationChanging.add(function (location) {
    if (location.type === 'item') {
      $scope.showModal = true;
      return;
    }

    $scope.showModal = false;

    DataManager.category = location.type === 'category' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.category);
    $timeout(function () {
      return $scope.$apply();
    });
  });
}]);

//src/js/controllers/galaxies/home.js

angular.module('SNAP.controllers').controller('GalaxiesHomeCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', 'SNAPLocation', function ($scope, $timeout, DataManager, NavigationManager, ShellManager, SNAPLocation) {

  var HomeMenu = React.createClass({
    displayName: 'HomeMenu',

    render: function render() {
      var rows = [],
          home = this.props.home;

      if (Boolean(home.intro)) {
        rows.push(React.DOM.td({
          className: 'tile tile-info',
          key: 'intro'
        }, React.DOM.div({}, [React.DOM.h1({ key: 'intro-title' }, home.intro.title || 'Welcome to ' + SNAPLocation.location_name), React.DOM.p({ key: 'intro-text' }, home.intro.text)])));
      }

      var tiles = this.props.tiles.map(function (tile, i) {
        var background = ShellManager.getMediaUrl(tile.image, 470, 410);
        return React.DOM.td({
          className: 'tile tile-regular',
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          },
          style: {
            backgroundImage: background ? 'url("' + background + '")' : null
          }
        }, React.DOM.span(null, tile.title)));
      });

      rows = rows.concat(tiles).reduce(function (result, value) {
        result[0].push(value);
        return result;
      }, [[]]).map(function (row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({
        className: 'tile-table'
      }, rows);
    }
  });

  DataManager.homeChanged.add(function (home) {
    if (!home) {
      return;
    }

    var tiles = home.menus.map(function (menu) {
      var destination = {
        type: 'menu',
        token: menu.token
      };

      return {
        title: menu.title,
        image: menu.image,
        url: '#' + NavigationManager.getPath(destination),
        destination: destination
      };
    });

    React.render(React.createElement(HomeMenu, { tiles: tiles, home: home }), document.getElementById('page-home-menu'));
  });

  NavigationManager.locationChanging.add(function (location) {
    DataManager.home = location.type === 'home';
    $scope.visible = Boolean(DataManager.home);
    $timeout(function () {
      return $scope.$apply();
    });
  });
}]);

//src/js/controllers/galaxies/item.js

angular.module('SNAP.controllers').controller('GalaxiesItemCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'OrderManager', 'ShellManager', 'WebBrowser', 'CommandSubmitOrder', function ($scope, $timeout, DataManager, NavigationManager, OrderManager, ShellManager, WebBrowser, CommandSubmitOrder) {

  $scope.goBack = function () {
    return NavigationManager.goBack();
  };

  DataManager.itemChanged.add(function (item) {
    if (!item) {
      WebBrowser.close();

      return $timeout(function () {
        $scope.entry = $scope.entries = null;
        $scope.type = 1;
        $scope.step = 0;
        $scope.entryIndex = 0;
      });
    }

    var type = item.type;

    if (type === 2 && item.website) {
      WebBrowser.open(item.website.url);
    } else if (type === 3 && item.flash) {
      var flashUrl = ShellManager.getMediaUrl(item.flash.media, 0, 0, 'swf'),
          url = '/flash#url=' + encodeURIComponent(flashUrl) + '&width=' + encodeURIComponent(item.flash.width) + '&height=' + encodeURIComponent(item.flash.height);

      WebBrowser.open(ShellManager.getAppUrl(url));
    }

    $timeout(function () {
      if (type === 1) {
        $scope.entry = new app.CartItem(item, 1);
      }

      $scope.type = type;
      $scope.step = 0;
      $scope.entryIndex = 0;
    });
  });

  $scope.getMediaUrl = function (media, w, h, extension) {
    return ShellManager.getMediaUrl(media, w, h, extension);
  };
  $scope.formatPrice = function (value) {
    return value ? ShellManager.formatPrice(value) : 0;
  };

  $scope.nextStep = function () {
    if ($scope.step === 0) {
      if ($scope.entry.hasModifiers) {
        $scope.entries = $scope.entry.cloneMany();
        $scope.currentEntry = $scope.entries[$scope.entryIndex = 0];
        $scope.step = 1;
      } else {
        OrderManager.addToCart($scope.entry);
        $scope.step = 2;
      }
    } else if ($scope.step === 1) {
      if ($scope.entryIndex === $scope.entries.length - 1) {
        $scope.entries.forEach(function (entry) {
          return OrderManager.addToCart(entry);
        });
        $scope.step = 2;
      } else {
        $scope.currentEntry = $scope.entries[++$scope.entryIndex];
      }
    }
  };

  $scope.previousStep = function () {
    if ($scope.step === 1 && $scope.entryIndex > 0) {
      $scope.currentEntry = $scope.entries[--$scope.entryIndex];
    } else if ($scope.step === 0) {
      $scope.goBack();
    } else {
      $scope.step--;
    }
  };

  $scope.updateModifiers = function (category, modifier) {
    if (category.data.selection === 1) {
      angular.forEach(category.modifiers, function (m) {
        return m.isSelected = m === modifier;
      });
    } else {
      modifier.isSelected = !modifier.isSelected;
    }
  };

  $scope.submitOrder = function () {
    CommandSubmitOrder();
    $scope.goBack();
  };

  NavigationManager.locationChanging.add(function (location) {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);
    $timeout(function () {
      return $scope.$apply();
    });
  });
}]);

//src/js/controllers/galaxies/itemedit.js

angular.module('SNAP.controllers').controller('GalaxiesItemEditCtrl', ['$scope', 'ShellManager', 'NavigationManager', 'OrderManager', 'CartModel', 'CommandSubmitOrder', function ($scope, ShellManager, NavigationManager, OrderManager, CartModel, CommandSubmitOrder) {

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.formatPrice = function (value) {
    return ShellManager.formatPrice(value);
  };

  var currentIndex = -1;

  var refreshNavigation = function refreshNavigation() {
    if ($scope.entry && $scope.entry.hasModifiers) {
      $scope.hasNextCategory = $scope.entry.modifiers.length > 1 && currentIndex < $scope.entry.modifiers.length - 1;
      $scope.hasPreviousCategory = currentIndex > 0;
      $scope.category = $scope.entry.modifiers[currentIndex];
      $scope.canExit = CartModel.editableItemNew;
      $scope.canDone = true;
    }
  };

  NavigationManager.locationChanging.add(function (location) {
    if (location.type !== 'menu' && location.type !== 'category') {
      $scope.exit();
    }
  });

  CartModel.isCartOpenChanged.add(function (value) {
    if (value) {
      $scope.exit();
    }
  });

  var init = function init(value) {
    $scope.entry = value;
    $scope.visible = $scope.entry != null;

    currentIndex = 0;

    refreshNavigation();
  };

  init(CartModel.editableItem);

  CartModel.editableItemChanged.add(function (value) {
    init(value);
  });

  $scope.getModifierTitle = function (modifier) {
    return modifier.data.title + (modifier.data.price > 0 ? ' (+' + ShellManager.formatPrice(modifier.data.price) + ')' : '');
  };

  $scope.leftButtonClick = function () {
    var result = currentIndex > 0 ? $scope.previousCategory() : $scope.exit();
  };

  $scope.leftButtonText = function () {
    return currentIndex > 0 ? 'Back' : 'Exit';
  };

  $scope.showLeftButton = function () {
    return currentIndex > 0;
  };

  $scope.rightButtonClick = function () {
    //Make sure Pick 1 modifier categories have met the selection condition.
    if ($scope.entry.modifiers[currentIndex].data.selection === 1) {
      var numSelected = 0;
      angular.forEach($scope.entry.modifiers[currentIndex].modifiers, function (m) {
        if (m.isSelected) {
          numSelected++;
        }
      });

      if (numSelected !== 1) {
        //TODO: Add modal popup. Must make 1 selection!
        return;
      }
    }

    var result = $scope.hasNextCategory ? $scope.nextCategory() : $scope.done();
  };

  $scope.rightButtonText = function () {
    return $scope.hasNextCategory ? 'Next' : 'Done';
  };

  $scope.showRightButton = function () {
    return $scope.hasNextCategory;
  };

  $scope.previousCategory = function () {
    currentIndex--;
    refreshNavigation();
  };

  $scope.nextCategory = function () {
    currentIndex++;
    refreshNavigation();
  };

  $scope.updateModifiers = function (category, modifier) {
    modifier.isSelected = !modifier.isSelected;

    if (modifier.isSelected && category.data.selection === 1) {
      angular.forEach(category.modifiers, function (m) {
        m.isSelected = m === modifier;
      });
    }
  };

  $scope.submitChanges = function () {
    OrderManager.removeFromCart($scope.entry);
    OrderManager.addToCart($scope.entry);
    $scope.exit();
  };

  $scope.done = function () {
    if (CartModel.editableItemNew) {
      OrderManager.addToCart(CartModel.editableItem);
    }

    $scope.exit();
    CartModel.isCartOpen = true;
  };

  $scope.exit = function () {
    CartModel.closeEditor();
  };
}]);

//src/js/controllers/galaxies/menu.js

angular.module('SNAP.controllers').controller('GalaxiesMenuCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', function ($scope, $timeout, DataManager, NavigationManager, ShellManager) {

  $scope.goBack = function () {
    return NavigationManager.goBack();
  };

  var MenuList = React.createClass({
    displayName: 'MenuList',

    render: function render() {
      var rows = this.props.tiles.map(function (tile, i) {
        var background = ShellManager.getMediaUrl(tile.image, 470, 410);
        return React.DOM.td({
          className: 'tile tile-regular',
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          },
          style: {
            backgroundImage: background ? 'url("' + background + '")' : null
          }
        }, React.DOM.span(null, tile.title)));
      }).reduce(function (result, value, i) {
        result[i % 2].push(value);
        return result;
      }, [[], []]).map(function (row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({
        className: 'tile-table'
      }, rows);
    }
  });

  DataManager.menuChanged.add(function (menu) {
    if (!menu) {
      return $timeout(function () {
        return $scope.menu = null;
      });
    }

    var tiles = menu.categories.map(function (category) {
      var destination = {
        type: 'category',
        token: category.token
      };

      return {
        title: category.title,
        image: category.image,
        url: '#' + NavigationManager.getPath(destination),
        destination: destination
      };
    });

    React.render(React.createElement(MenuList, { tiles: tiles }), document.getElementById('page-menu-content'));

    $scope.menu = menu;
    $timeout(function () {
      return $scope.$apply();
    });
  });

  NavigationManager.locationChanging.add(function (location) {
    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.menu);
    $timeout(function () {
      return $scope.$apply();
    });
  });
}]);

//src/js/controllers/galaxies/navigation.js

angular.module('SNAP.controllers').controller('GalaxiesNavigationCtrl', ['$scope', '$timeout', 'ActivityMonitor', 'CustomerManager', 'AnalyticsModel', 'CartModel', 'ShellManager', 'DataManager', 'DataProvider', 'DialogManager', 'LocationModel', 'ManagementService', 'NavigationManager', 'OrderManager', 'CommandReset', 'CommandSubmitOrder', 'CommandFlipScreen', 'WebBrowser', 'SNAPEnvironment', function ($scope, $timeout, ActivityMonitor, CustomerManager, AnalyticsModel, CartModel, ShellManager, DataManager, DataProvider, DialogManager, LocationModel, ManagementService, NavigationManager, OrderManager, CommandReset, CommandSubmitOrder, CommandFlipScreen, WebBrowser, SNAPEnvironment) {

  $scope.menus = [];

  DataProvider.home().then(function (response) {
    if (!response) {
      return;
    }

    var location = NavigationManager.location,
        limit = SNAPEnvironment.platform === 'desktop' ? 4 : 3;

    $scope.menus = response.menus.filter(function (menu) {
      return SNAPEnvironment.platform === 'desktop' || menu.type !== 3;
    }).filter(function (menu, i) {
      return i < limit;
    }).map(function (menu) {
      var destination = {
        type: 'menu',
        token: menu.token
      };
      return {
        token: menu.token,
        title: menu.title,
        url: '#' + NavigationManager.getPath(destination),
        destination: destination,
        selected: location.type === 'menu' && menu.token === location.token
      };
    });
  });

  $scope.advertisementClick = function (item) {
    if (item.href) {
      NavigationManager.location = { type: 'url', url: item.href.url };
    }
  };

  $scope.currentAdvertisement;

  $scope.advertisementImpression = function (item) {
    $scope.currentAdvertisement = item;

    if (ActivityMonitor.active && $scope.menuOpen) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.advertisements = [];

  DataProvider.advertisements().then(function (data) {
    $timeout(function () {
      $scope.advertisements = data.misc.map(function (ad) {
        return {
          src: ShellManager.getMediaUrl(ad.src, 300, 250),
          href: ad.href,
          type: ShellManager.getMediaType(ad.src),
          token: ad.token
        };
      });
    });
  });

  $scope.navigateHome = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    NavigationManager.location = { type: 'home' };
  };

  $scope.navigateBack = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    NavigationManager.goBack();
  };

  $scope.rotateScreen = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    CommandFlipScreen();
  };

  $scope.openCart = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    CartModel.isCartOpen = !CartModel.isCartOpen;
  };

  $scope.seatName = LocationModel.seat ? LocationModel.seat.name : 'Table';
  LocationModel.seatChanged.add(function (value) {
    return $timeout(function () {
      return $scope.seatName = value ? value.name : 'Table';
    });
  });

  $scope.resetTable = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    DialogManager.confirm(ALERT_TABLE_RESET).then(function () {
      DialogManager.startJob();
      CommandReset();
    });
  };

  $scope.menuOpen = false;

  $scope.toggleMenu = function () {
    ActivityMonitor.activityDetected();
    $scope.menuOpen = !$scope.menuOpen;

    if ($scope.currentAdvertisement && $scope.menuOpen) {
      AnalyticsModel.logAdvertisement({
        token: $scope.currentAdvertisement.token,
        type: 'impression'
      });
      $scope.currentAdvertisement = null;
    }
  };

  $scope.settingsOpen = false;

  $scope.toggleSettings = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = !$scope.settingsOpen;
  };

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(function (value) {
    $timeout(function () {
      return $scope.elements = value;
    });
  });

  $scope.cartCount = OrderManager.model.orderCart.length;
  OrderManager.model.orderCartChanged.add(function (cart) {
    $timeout(function () {
      return $scope.cartCount = cart.length;
    });
  });

  $scope.checkoutEnabled = CustomerManager.model.isEnabled;

  $scope.totalOrder = OrderManager.model.orderCheck;
  OrderManager.model.orderCheckChanged.add(function (value) {
    $timeout(function () {
      return $scope.totalOrder = value;
    });
  });

  $scope.requestAssistance = function () {
    if (!$scope.requestAssistanceAvailable) {
      return;
    }

    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  var refreshAssistanceRequest = function refreshAssistanceRequest() {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  refreshAssistanceRequest();

  $scope.submitOrder = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    CommandSubmitOrder();
  };

  $scope.viewOrder = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    CartModel.cartState = CartModel.STATE_CART;
    CartModel.isCartOpen = true;
  };

  $scope.payBill = function () {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    CartModel.cartState = CartModel.STATE_HISTORY;
    CartModel.isCartOpen = true;
  };

  $scope.customerName = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(function () {
    $timeout(function () {
      return $scope.customerName = CustomerManager.customerName;
    });
  });

  $scope.settings = {
    displayBrightness: 100,
    soundVolume: 100
  };

  $scope.$watch('settings.soundVolume', function (value, old) {
    if (value === old) {
      return;
    }

    ActivityMonitor.activityDetected();
    ManagementService.setSoundVolume(value);
  });
  ManagementService.getSoundVolume().then(function (response) {
    return $timeout(function () {
      return $scope.settings.soundVolume = response.volume;
    });
  }, function (e) {});

  $scope.$watch('settings.displayBrightness', function (value, old) {
    if (value === old) {
      return;
    }

    ActivityMonitor.activityDetected();
    ManagementService.setDisplayBrightness(value);
  });
  ManagementService.getDisplayBrightness().then(function (response) {
    return $timeout(function () {
      return $scope.settings.displayBrightness = response.brightness;
    });
  }, function (e) {});

  $scope.navigate = function (destination) {
    return NavigationManager.location = destination;
  };

  NavigationManager.locationChanging.add(function (location) {
    $scope.visible = location.type !== 'signin';
    $timeout(function () {
      return $scope.$apply();
    });
  });

  NavigationManager.locationChanged.add(function (location) {
    $timeout(function () {
      if (location.type !== 'category' && location.type !== 'item') {
        $scope.menus.forEach(function (menu) {
          menu.selected = location.type === 'menu' && menu.token === location.token;
        });
      }

      $scope.menuOpen = false;
      $scope.settingsOpen = false;
    });
  });
}]);

//src/js/controllers/home.js

angular.module('SNAP.controllers').controller('HomeBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', function ($scope, $timeout, DataManager, NavigationManager) {}]);

angular.module('SNAP.controllers').controller('HomeCtrl', ['$scope', '$timeout', 'ChatManager', 'DataProvider', 'ShellManager', 'CustomerManager', 'OrderManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'SurveyManager', 'SNAPLocation', 'SNAPEnvironment', 'CommandReset', function ($scope, $timeout, ChatManager, DataProvider, ShellManager, CustomerManager, OrderManager, DialogManager, NavigationManager, LocationModel, SurveyManager, SNAPLocation, SNAPEnvironment, CommandReset) {

  var HomeMenu = React.createClass({
    displayName: 'HomeMenu',

    render: function render() {
      var result = [React.DOM.td({ key: -1 })];

      var rows = this.props.tiles.map(function (tile, i) {
        return React.DOM.td({
          className: 'home-menu-item',
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          }
        }, React.DOM.img({
          src: ShellManager.getMediaUrl(tile.image, 160, 160)
        })));
      });

      result = result.concat(rows);
      result.push(React.DOM.td({ key: result.length }));

      return React.DOM.table(null, result);
    }
  });

  DataProvider.home().then(function (response) {
    if (!response) {
      return;
    }

    var tiles = [];

    response.menus.filter(function (menu) {
      return SNAPEnvironment.platform === 'desktop' || menu.type !== 3;
    }).reduce(function (tiles, menu) {
      if (menu.promos && menu.promos.length > 0) {
        menu.promos.filter(function (promo) {
          return SNAPEnvironment.platform === 'desktop' || promo.type !== 3;
        }).forEach(function (promo) {
          tiles.push({
            title: promo.title,
            image: promo.image,
            url: '#' + NavigationManager.getPath(promo.destination),
            destination: promo.destination
          });
        });
      } else {
        var destination = {
          type: 'menu',
          token: menu.token
        };

        tiles.push({
          title: menu.title,
          image: menu.image,
          url: '#' + NavigationManager.getPath(destination),
          destination: destination
        });
      }

      return tiles;
    }, tiles);

    $timeout(function () {
      React.render(React.createElement(HomeMenu, { tiles: tiles }), document.getElementById('home-menu-main'));
    }, 1000);
  });

  NavigationManager.locationChanging.add(function (location) {
    $scope.visible = location.type === 'home';
    $timeout(function () {
      $scope.$apply();
    });
  });

  $scope.preload = function (destination) {
    NavigationManager.location = destination;
  };

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.predicateEven = ShellManager.predicateEven;
  $scope.predicateOdd = ShellManager.predicateOdd;

  $scope.seat_name = LocationModel.seat ? LocationModel.seat.name : 'Table';
  LocationModel.seatChanged.add(function (value) {
    $timeout(function () {
      $scope.seat_name = value ? value.name : 'Table';
    });
  });

  $scope.customer_name = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(function () {
    $timeout(function () {
      return $scope.customer_name = CustomerManager.customerName;
    });
  });

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(function (value) {
    $timeout(function () {
      return $scope.elements = value;
    });
  });

  var refreshAssistanceRequest = function refreshAssistanceRequest() {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  var refreshCloseoutRequest = function refreshCloseoutRequest() {
    $scope.requestCloseoutAvailable = !Boolean(OrderManager.model.closeoutRequest);
  };
  var refreshSurvey = function refreshSurvey() {
    $scope.surveyAvailable = SurveyManager.model.isEnabled && SurveyManager.model.feedbackSurvey && !SurveyManager.model.feedbackSurveyComplete;
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  OrderManager.model.closeoutRequestChanged.add(refreshCloseoutRequest);
  SurveyManager.model.feedbackSurveyChanged.add(refreshSurvey);
  SurveyManager.model.surveyCompleted.add(refreshSurvey);
  refreshAssistanceRequest();
  refreshCloseoutRequest();
  refreshSurvey();

  $scope.chatAvailable = Boolean(SNAPLocation.chat);

  $scope.requestAssistance = function () {
    if (!$scope.requestAssistanceAvailable) {
      return;
    }

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.requestCloseout = function () {
    if (!$scope.requestCloseoutAvailable) {
      return;
    }

    DialogManager.confirm(ALERT_TABLE_CLOSEOUT).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestCloseout().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.openSurvey = function () {
    if (!$scope.surveyAvailable) {
      return;
    }

    NavigationManager.location = { type: 'survey' };
  };

  $scope.seatClicked = function () {
    DialogManager.confirm(ALERT_TABLE_RESET).then(function () {
      DialogManager.startJob();
      CommandReset();
    });
  };

  $scope.customerClicked = function () {
    if (!CustomerManager.model.isEnabled) {
      return;
    }

    if (CustomerManager.model.isAuthenticated && !CustomerManager.model.isGuest) {
      NavigationManager.location = { type: 'account' };
    } else {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
    }
  };

  $scope.openChat = function () {
    NavigationManager.location = { type: 'chat' };
  };
}]);

//src/js/controllers/item.js

angular.module('SNAP.controllers').controller('ItemBaseCtrl', ['$scope', function ($scope) {}]);

angular.module('SNAP.controllers').controller('ItemCtrl', ['$scope', '$timeout', 'AnalyticsModel', 'CustomerModel', 'DataManager', 'DialogManager', 'NavigationManager', 'OrderManager', 'CartModel', 'LocationModel', 'ShellManager', 'SNAPEnvironment', 'ChatManager', function ($scope, $timeout, AnalyticsModel, CustomerModel, DataManager, DialogManager, NavigationManager, OrderManager, CartModel, LocationModel, ShellManager, SNAPEnvironment, ChatManager) {

  var ItemImage = React.createClass({
    displayName: 'ItemImage',

    render: function render() {
      return React.DOM.img({
        src: ShellManager.getMediaUrl(this.props.media, 600, 600)
      });
    }
  });

  NavigationManager.locationChanging.add(function (location) {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);
    $timeout(function () {
      $scope.$apply();
    });
  });

  DataManager.itemChanged.add(function (response) {
    if (!response && ($scope.websiteUrl || $scope.flashUrl)) {
      WebBrowser.close();
    }

    $scope.websiteUrl = null;
    $scope.flashUrl = null;

    if (!response) {
      $scope.entry = null;

      if ($scope.type === 1) {
        document.getElementById('item-photo').innerHTML = '';
      }

      $scope.type = 1;
      $timeout(function () {
        return $scope.$apply();
      });
      return;
    }

    var type = response.type;

    if (type === 2 && response.website) {
      $scope.websiteUrl = response.website.url;
      WebBrowser.open($scope.websiteUrl);
    } else if (type === 3 && response.flash) {
      var url = '/flash#url=' + encodeURIComponent(getMediaUrl(response.flash.media, 0, 0, 'swf')) + '&width=' + encodeURIComponent(response.flash.width) + '&height=' + encodeURIComponent(response.flash.height);
      $scope.flashUrl = ShellManager.getAppUrl(url);
      WebBrowser.open($scope.flashUrl);
    } else if (type === 1) {
      $scope.entry = new app.CartItem(response, 1);

      React.render(React.createElement(ItemImage, { media: $scope.entry.item.image }), document.getElementById('item-photo'));
    }

    $scope.type = type;
    $timeout(function () {
      $scope.$apply();
    });
  });

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.formatPrice = function (value) {
    return value ? ShellManager.formatPrice(value) : 0;
  };

  $scope.addToCart = function () {
    if (CustomerModel.isEnabled && !CustomerModel.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    var entry = $scope.entry;

    if (entry.hasModifiers) {
      CartModel.openEditor(entry, true);
    } else {
      OrderManager.addToCart(entry);
      CartModel.isCartOpen = true;
    }

    NavigationManager.goBack();
  };

  $scope.cancelGift = function () {
    return ChatManager.cancelGift();
  };

  $scope.giftSeat = LocationModel.getSeat(ChatManager.model.giftSeat);
  ChatManager.model.giftSeatChanged.add(function (token) {
    $timeout(function () {
      return $scope.giftSeat = LocationModel.getSeat(token);
    });
  });
}]);

//src/js/controllers/itemedit.js

angular.module('SNAP.controllers').controller('ItemEditCtrl', ['$scope', 'ShellManager', 'NavigationManager', 'OrderManager', 'CartModel', function ($scope, ShellManager, NavigationManager, OrderManager, CartModel) {

  $scope.getMediaUrl = function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
  $scope.formatPrice = function (value) {
    return ShellManager.formatPrice(value);
  };

  var currentIndex = -1;

  var refreshNavigation = function refreshNavigation() {
    if ($scope.entry && $scope.entry.hasModifiers) {
      $scope.hasNextCategory = $scope.entry.modifiers.length > 1 && currentIndex < $scope.entry.modifiers.length - 1;
      $scope.hasPreviousCategory = currentIndex > 0;
      $scope.category = $scope.entry.modifiers[currentIndex];
      $scope.canExit = CartModel.editableItemNew;
      $scope.canDone = true;
    }
  };

  NavigationManager.locationChanging.add(function (location) {
    if (location.type !== 'menu' && location.type !== 'category') {
      $scope.exit();
    }
  });

  CartModel.isCartOpenChanged.add(function (value) {
    if (value) {
      $scope.exit();
    }
  });

  var init = function init(value) {
    $scope.entry = value;
    $scope.visible = $scope.entry != null;

    currentIndex = 0;

    refreshNavigation();
  };

  init(CartModel.editableItem);

  CartModel.editableItemChanged.add(function (value) {
    init(value);
  });

  $scope.getModifierTitle = function (modifier) {
    return modifier.data.title + (modifier.data.price > 0 ? ' (+' + ShellManager.formatPrice(modifier.data.price) + ')' : '');
  };

  $scope.leftButtonClick = function () {
    var result = currentIndex > 0 ? $scope.previousCategory() : $scope.exit();
  };

  $scope.leftButtonText = function () {
    return currentIndex > 0 ? 'Back' : 'Exit';
  };

  $scope.rightButtonClick = function () {
    //Make sure Pick 1 modifier categories have met the selection condition.
    if ($scope.entry.modifiers[currentIndex].data.selection === 1) {
      var numSelected = 0;
      angular.forEach($scope.entry.modifiers[currentIndex].modifiers, function (m) {
        if (m.isSelected) {
          numSelected++;
        }
      });

      if (numSelected !== 1) {
        //TODO: Add modal popup. Must make 1 selection!
        return;
      }
    }

    var result = $scope.hasNextCategory ? $scope.nextCategory() : $scope.done();
  };

  $scope.rightButtonText = function () {
    return $scope.hasNextCategory ? 'Next' : 'Done';
  };

  $scope.previousCategory = function () {
    currentIndex--;
    refreshNavigation();
  };

  $scope.nextCategory = function () {
    currentIndex++;
    refreshNavigation();
  };

  $scope.updateModifiers = function (category, modifier) {
    modifier.isSelected = !modifier.isSelected;

    if (modifier.isSelected && category.data.selection === 1) {
      angular.forEach(category.modifiers, function (m) {
        m.isSelected = m === modifier;
      });
    }
  };

  $scope.done = function () {
    if (CartModel.editableItemNew) {
      OrderManager.addToCart(CartModel.editableItem);
    }

    $scope.exit();
    CartModel.isCartOpen = true;
  };

  $scope.exit = function () {
    CartModel.closeEditor();
  };
}]);

//src/js/controllers/mainaux.js

angular.module('SNAP.controllers').controller('MainAuxCtrl', ['$scope', 'CommandStartup', function ($scope, CommandStartup) {
  CommandStartup();
}]);

//src/js/controllers/mainsnap.js

angular.module('SNAP.controllers').controller('MainSnapCtrl', ['$scope', '$timeout', 'AppCache', 'CustomerManager', 'ActivityMonitor', 'ChatManager', 'ShellManager', 'DataManager', 'DialogManager', 'OrderManager', 'LocationModel', 'NavigationManager', 'SoftwareManager', 'SNAPLocation', 'CommandStartup', function ($scope, $timeout, AppCache, CustomerManager, ActivityMonitor, ChatManager, ShellManager, DataManager, DialogManager, OrderManager, LocationModel, NavigationManager, SoftwareManager, SNAPLocation, CommandStartup) {

  CommandStartup();

  $scope.touch = function () {
    return ActivityMonitor.activityDetected();
  };

  OrderManager.model.orderRequestChanged.add(function (item) {
    if (!item) {
      return;
    }
    item.promise.then(function () {
      return DialogManager.alert(ALERT_REQUEST_ORDER_RECEIVED);
    });
  });

  OrderManager.model.assistanceRequestChanged.add(function (item) {
    if (!item) {
      return;
    }
    item.promise.then(function () {
      return DialogManager.alert(ALERT_REQUEST_ASSISTANCE_RECEIVED);
    });
  });

  OrderManager.model.closeoutRequestChanged.add(function (item) {
    if (!item) {
      return;
    }
    item.promise.then(function () {
      return DialogManager.alert(ALERT_REQUEST_CLOSEOUT_RECEIVED);
    });
  });

  ChatManager.model.chatRequestReceived.add(function (token) {
    DialogManager.confirm(ChatManager.getDeviceName(token) + ' would like to chat with you.').then(function () {
      ChatManager.approveDevice(token);
      NavigationManager.location = { type: 'chat' };
    }, function () {
      return ChatManager.declineDevice(token);
    });
  });

  ChatManager.model.giftRequestReceived.add(function (token, description) {
    DialogManager.confirm(ChatManager.getDeviceName(token) + ' would like to gift you a ' + description).then(function () {
      ChatManager.acceptGift(token);
    }, function () {
      return ChatManager.declineGift(token);
    });
  });

  ChatManager.model.messageReceived.add(function (message) {
    var device = LocationModel.getDevice(message.device);

    if (!device) {
      return;
    }

    if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_DECLINED) {
      DialogManager.alert('Chat with ' + ChatManager.getDeviceName(device.token) + ' was declined. ' + 'To stop recieving chat requests, open the chat screen and touch the "Chat on/off" button.');
    } else if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_REQUEST_ACCEPTED) {
      DialogManager.alert('Your chat request to ' + ChatManager.getDeviceName(device.token) + ' was accepted.');
    } else if (message.status === ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_ACCEPTED) {
      DialogManager.alert(ChatManager.getDeviceName(device.token) + ' has accepted your gift. The item will be added to your check.');
    } else if (message.status === ChatManager.MESSAGE_STATUSES.GIFT_REQUEST_DECLINED) {
      DialogManager.alert(ChatManager.getDeviceName(device.token) + ' has declined your gift. The item will NOT be added to your check.');
    }

    if (NavigationManager.location.type === 'chat') {
      return;
    }

    if (message.status === ChatManager.MESSAGE_STATUSES.CHAT_CLOSED) {
      DialogManager.notification(ChatManager.getDeviceName(device.token) + ' has closed the chat');
    } else if (!message.status && message.to_device) {
      DialogManager.notification('New message from ' + ChatManager.getDeviceName(device.token));
    }
  });

  ChatManager.model.giftReady.add(function () {
    ChatManager.sendGift(OrderManager.model.orderCart);
    NavigationManager.location = { type: 'chat' };
  });

  ChatManager.model.giftAccepted.add(function (status) {
    if (!status || !ChatManager.model.giftDevice) {
      ChatManager.model.giftSeat = null;
    } else {
      var job = DialogManager.startJob();

      OrderManager.submitCart().then(function () {
        DialogManager.endJob(job);
        NavigationManager.location = { type: 'chat' };
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);

        ChatManager.endGift();
        NavigationManager.location = { type: 'chat' };
      });
    }
  });
}]);

//src/js/controllers/menu.js

angular.module('SNAP.controllers').controller('MenuBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', function ($scope, $timeout, DataManager, NavigationManager) {}]);

angular.module('SNAP.controllers').controller('MenuCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', function ($scope, $timeout, DataManager, NavigationManager, ShellManager) {

  var MenuList = React.createClass({
    displayName: 'MenuList',

    render: function render() {
      var tileClassName = ShellManager.tileStyle;
      var rows = this.props.tiles.map(function (tile, i) {
        return React.DOM.td({
          className: tileClassName,
          key: i
        }, React.DOM.a({
          onClick: function onClick(e) {
            e.preventDefault();
            NavigationManager.location = tile.destination;
          },
          style: {
            backgroundImage: 'url(' + ShellManager.getMediaUrl(tile.image, 370, 370) + ')'
          }
        }, React.DOM.span(null, tile.title)));
      }).reduce(function (result, value, i) {
        result[i % 2].push(value);
        return result;
      }, [[], []]).map(function (row, i) {
        return React.DOM.tr({ key: i }, row);
      });

      return React.DOM.table({ className: 'tile-table' }, rows);
    }
  });

  NavigationManager.locationChanging.add(function (location) {
    DataManager.menu = location.type === 'menu' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.menu);
    $timeout(function () {
      $scope.$apply();
    });
  });

  DataManager.menuChanged.add(function (menu) {
    if (!menu) {
      return;
    }

    menu.categories.forEach(function (tile) {
      tile.url = '#' + NavigationManager.getPath(tile.destination);
    });

    React.render(React.createElement(MenuList, { tiles: menu.categories }), document.getElementById('content-menu'));
  });
}]);

//src/js/controllers/modal.js

angular.module('SNAP.controllers').controller('ModalCtrl', ['$scope', '$timeout', 'DialogManager', function ($scope, $timeout, DialogManager) {

  DialogManager.modalStarted.add(function () {
    return $timeout(function () {
      return $scope.visible = true;
    });
  });
  DialogManager.modalEnded.add(function () {
    return $timeout(function () {
      return $scope.visible = false;
    });
  });
}]);

//src/js/controllers/navigation.js

angular.module('SNAP.controllers').controller('NavigationCtrl', ['$scope', '$timeout', 'ActivityMonitor', 'CustomerManager', 'AnalyticsModel', 'CartModel', 'ShellManager', 'DataManager', 'DataProvider', 'DialogManager', 'NavigationManager', 'OrderManager', 'CommandReset', 'CommandFlipScreen', 'WebBrowser', 'SNAPEnvironment', function ($scope, $timeout, ActivityMonitor, CustomerManager, AnalyticsModel, CartModel, ShellManager, DataManager, DataProvider, DialogManager, NavigationManager, OrderManager, CommandReset, CommandFlipScreen, WebBrowser, SNAPEnvironment) {

  $scope.menus = [];

  DataProvider.home().then(function (response) {
    if (!response) {
      return;
    }

    var location = NavigationManager.location,
        limit = SNAPEnvironment.platform === 'desktop' ? 4 : 3;

    $scope.menus = response.menus.filter(function (menu) {
      return SNAPEnvironment.platform === 'desktop' || menu.type !== 3;
    }).filter(function (menu, i) {
      return i < limit;
    }).map(function (menu) {
      var destination = {
        type: 'menu',
        token: menu.token
      };
      return {
        token: menu.token,
        title: menu.title,
        url: '#' + NavigationManager.getPath(destination),
        destination: destination,
        selected: location.type === 'menu' && menu.token === location.token
      };
    });
  });

  $scope.navigateHome = function () {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.confirm(ALERT_TABLE_RESET).then(function () {
        DialogManager.startJob();
        CommandReset();
      });
      return;
    }

    NavigationManager.location = { type: 'home' };
    CartModel.isCartOpen = false;
  };

  $scope.navigateBack = function () {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    NavigationManager.goBack();

    CartModel.isCartOpen = false;
  };

  $scope.rotateScreen = function () {
    ActivityMonitor.activityDetected();
    CommandFlipScreen();
  };

  $scope.openCart = function () {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    CartModel.isCartOpen = !CartModel.isCartOpen;
  };

  $scope.openSettings = function () {
    DialogManager.confirm(ALERT_TABLE_RESET).then(function () {
      DialogManager.startJob();
      CommandReset();
    });
  };

  $scope.menuOpen = false;

  $scope.toggleMenu = function () {
    $scope.menuOpen = !$scope.menuOpen;
  };

  $scope.advertisementClick = function (item) {
    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    AnalyticsModel.logAdvertisement({
      token: item.token,
      type: 'click'
    });

    if (item.href) {
      NavigationManager.location = { type: 'url', url: item.href.url };
    }
  };

  $scope.advertisementImpression = function (item) {
    if (ActivityMonitor.active && !$scope.wide) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(function (value) {
    $timeout(function () {
      return $scope.elements = value;
    });
  });

  $scope.advertisementsAll = [];
  $scope.advertisementsTop = [];
  $scope.advertisementsBottom = [];
  var mapAdvertisement = function mapAdvertisement(ad) {
    return {
      src: ShellManager.getMediaUrl(ad.src, 970, 90),
      href: ad.href,
      type: ShellManager.getMediaType(ad.src),
      token: ad.token
    };
  };
  DataProvider.advertisements().then(function (response) {
    $timeout(function () {
      $scope.advertisementsTop = response.top.map(mapAdvertisement);
      $scope.advertisementsBottom = response.bottom.map(mapAdvertisement);
      $scope.advertisementsAll = $scope.advertisementsTop.concat($scope.advertisementsBottom);
    });
  });

  $scope.cartCount = OrderManager.model.orderCart.length;
  OrderManager.model.orderCartChanged.add(function (cart) {
    $timeout(function () {
      return $scope.cartCount = cart.length;
    });
  });

  $scope.requestAssistance = function () {
    if (!$scope.requestAssistanceAvailable) {
      return;
    }

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(function () {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, function () {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  var refreshAssistanceRequest = function refreshAssistanceRequest() {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  refreshAssistanceRequest();

  $scope.customerName = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(function () {
    $timeout(function () {
      return $scope.customerName = CustomerManager.customerName;
    });
  });

  $scope.navigate = function (destination) {
    return NavigationManager.location = destination;
  };

  NavigationManager.locationChanged.add(function (location) {
    $timeout(function () {
      $scope.menus.forEach(function (menu) {
        //menu.selected = (location.type === 'menu' && menu.token === location.token);
      });
    });
  });
}]);

//src/js/controllers/notification.js

angular.module('SNAP.controllers').controller('NotificationCtrl', ['$scope', '$timeout', 'DialogManager', function ($scope, $timeout, DialogManager) {
  var timer;

  $scope.messages = [];

  function updateVisibility(isVisible) {
    $timeout(function () {
      $scope.visible = isVisible;
    });
  }

  function hideNext() {
    var messages = [];

    for (var i = 1; i < $scope.messages.length; i++) {
      messages.push($scope.messages[i]);
    }

    $scope.messages = messages;

    if ($scope.messages.length === 0) {
      updateVisibility(false);
      return;
    }

    timer = $timeout(hideNext, 4000);
  }

  $scope.visible = false;

  DialogManager.notificationRequested.add(function (message) {
    $timeout(function () {
      $scope.messages.push({ text: message });
    });

    updateVisibility(true);

    if (timer) {
      $timeout.cancel(timer);
    }

    timer = $timeout(hideNext, 4000);
  });
}]);

//src/js/controllers/screensaver.js

angular.module('SNAP.controllers').controller('ScreensaverCtrl', ['$scope', '$timeout', 'ShellManager', 'ActivityMonitor', 'DataProvider', function ($scope, $timeout, ShellManager, ActivityMonitor, DataProvider) {

  $scope.visible = false;

  function showImages(values) {
    $timeout(function () {
      $scope.images = values.map(function (item) {
        return {
          src: ShellManager.getMediaUrl(item.media, 1920, 1080, 'jpg'),
          type: ShellManager.getMediaType(item.media)
        };
      });
    });
  }

  showImages(ShellManager.model.screensavers);
  ShellManager.model.screensaversChanged.add(showImages);

  ActivityMonitor.activeChanged.add(function (value) {
    $timeout(function () {
      $scope.visible = value === false && ($scope.images && $scope.images.length > 0);
    });
  });
}]);

//src/js/controllers/signin.js

angular.module('SNAP.controllers').controller('SignInCtrl', ['$scope', '$timeout', 'CommandCustomerLogin', 'CommandCustomerGuestLogin', 'CommandCustomerSocialLogin', 'CommandCustomerSignup', 'CustomerManager', 'DialogManager', 'NavigationManager', 'SessionManager', 'SNAPLocation', 'WebBrowser', function ($scope, $timeout, CommandCustomerLogin, CommandCustomerGuestLogin, CommandCustomerSocialLogin, CommandCustomerSignup, CustomerManager, DialogManager, NavigationManager, SessionManager, SNAPLocation, WebBrowser) {

  var STEP_SPLASH = 1,
      STEP_LOGIN = 2,
      STEP_REGISTRATION = 3,
      STEP_GUESTS = 4,
      STEP_EVENT = 5,
      STEP_RESET = 6;

  $scope.STEP_SPLASH = STEP_SPLASH;
  $scope.STEP_LOGIN = STEP_LOGIN;
  $scope.STEP_REGISTRATION = STEP_REGISTRATION;
  $scope.STEP_GUESTS = STEP_GUESTS;
  $scope.STEP_EVENT = STEP_EVENT;
  $scope.STEP_RESET = STEP_RESET;

  $scope.locationName = SNAPLocation.location_name;

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Login
  //-----------------------------------------------

  $scope.login = function () {
    $scope.credentials = {};
    $scope.step = STEP_LOGIN;
  };

  $scope.guestLogin = function () {
    var job = DialogManager.startJob();

    CommandCustomerGuestLogin().then(function () {
      DialogManager.endJob(job);
      $timeout(function () {
        return $scope.step = STEP_GUESTS;
      });
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.doLogin = function (credentials) {
    var job = DialogManager.startJob();

    $scope.credentials.username = $scope.credentials.email;

    CommandCustomerLogin($scope.credentials).then(function () {
      DialogManager.endJob(job);
      $timeout(function () {
        return $scope.step = STEP_GUESTS;
      });
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_GENERIC_ERROR);
    });
  };

  //-----------------------------------------------
  //    Social login
  //-----------------------------------------------

  $scope.loginFacebook = function () {
    socialBusy();
    CommandCustomerSocialLogin.facebook().then(socialLogin, socialError);
  };

  $scope.loginTwitter = function () {
    socialBusy();
    CommandCustomerSocialLogin.twitter().then(socialLogin, socialError);
  };

  $scope.loginGoogle = function () {
    socialBusy();
    CommandCustomerSocialLogin.googleplus().then(socialLogin, socialError);
  };

  //-----------------------------------------------
  //    Registration
  //-----------------------------------------------

  $scope.register = function () {
    $scope.registration = {};
    $scope.step = STEP_REGISTRATION;
  };

  $scope.doRegistration = function () {
    $scope.registration.username = $scope.registration.email;

    var job = DialogManager.startJob();

    CommandCustomerSignup($scope.registration).then(function () {
      DialogManager.endJob(job);
      $timeout(function () {
        return $scope.step = STEP_GUESTS;
      });
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  //-----------------------------------------------
  //    Guest count
  //-----------------------------------------------

  $scope.session = {
    guestCount: 1,
    special: false
  };

  $scope.submitGuestCount = function () {
    if ($scope.session.guestCount > 1) {
      SessionManager.guestCount = $scope.session.guestCount;
      $scope.step = STEP_EVENT;
    } else {
      endSignIn();
    }
  };

  //-----------------------------------------------
  //    Event
  //-----------------------------------------------

  $scope.submitSpecialEvent = function (value) {
    $scope.session.special = SessionManager.specialEvent = Boolean(value);
    endSignIn();
  };

  //-----------------------------------------------
  //    Reset password
  //-----------------------------------------------

  $scope.resetPassword = function () {
    $scope.passwordreset = {};
    $scope.step = STEP_RESET;
  };

  $scope.passwordResetSubmit = function () {
    var job = DialogManager.startJob();

    CustomerManager.resetPassword($scope.passwordreset).then(function () {
      DialogManager.endJob(job);
      $scope.passwordReset = false;
      DialogManager.alert(ALERT_PASSWORD_RESET_COMPLETE);
    }, function () {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.passwordResetCancel = function () {
    $scope.step = STEP_SPLASH;
  };

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  function socialLogin() {
    socialBusyEnd();
    $timeout(function () {
      return $scope.step = STEP_GUESTS;
    });
  }

  function socialError() {
    socialBusyEnd();
    DialogManager.alert(ALERT_GENERIC_ERROR);
  }

  var socialJob, socialTimer;

  function socialBusy() {
    socialBusyEnd();

    socialJob = DialogManager.startJob();
    socialTimer = $timeout(socialBusyEnd, 120 * 1000);
  }

  function socialBusyEnd() {
    if (socialJob) {
      DialogManager.endJob(socialJob);
      socialJob = null;
    }

    if (socialTimer) {
      $timeout.cancel(socialTimer);
      socialTimer = null;
    }
  }

  function endSignIn() {
    NavigationManager.location = { type: 'home' };
  }

  //------------------------------------------------------------------------
  //
  //  Startup
  //
  //------------------------------------------------------------------------

  if (!CustomerManager.model.isEnabled || CustomerManager.model.isAuthenticated) {
    return endSignIn();
  }

  $scope.initialized = true;
  $scope.step = STEP_SPLASH;

  var modal = DialogManager.startModal();

  $scope.$on('$destroy', function () {
    WebBrowser.close();
    DialogManager.endModal(modal);
  });
}]);

//src/js/controllers/startup.js

angular.module('SNAP.controllers').controller('StartupCtrl', ['$scope', 'CommandBoot', 'DialogManager', 'ManagementService', function ($scope, CommandBoot, DialogManager, ManagementService) {

  function workflow() {
    var job = DialogManager.startJob();

    CommandBoot().then(function () {
      ManagementService.loadApplication();
    }, function (e) {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_ERROR_STARTUP).then(function () {
        return workflow();
      });
    });
  }

  workflow();
}]);

//src/js/controllers/survey.js

angular.module('SNAP.controllers').controller('SurveyCtrl', ['$scope', '$timeout', 'AnalyticsModel', 'CustomerManager', 'CustomerModel', 'DialogManager', 'NavigationManager', 'OrderManager', 'SurveyManager', function ($scope, $timeout, AnalyticsModel, CustomerManager, CustomerModel, DialogManager, NavigationManager, OrderManager, SurveyManager) {

  if (!SurveyManager.model.isEnabled || !SurveyManager.model.feedbackSurvey || SurveyManager.model.feedbackSurveyComplete) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  $scope.comment = '';
  $scope.email = '';
  $scope.had_problems = false;

  //-----------------------------------------------
  //    Pages
  //-----------------------------------------------

  $scope.pages = [];
  var pages = $scope.$watchAsProperty('pages');

  //-----------------------------------------------
  //    Index
  //-----------------------------------------------

  $scope.pageIndex = -1;
  var pageIndex = $scope.$watchAsProperty('pageIndex');
  pageIndex.changes().subscribe(function () {
    $scope.page = $scope.pageIndex > -1 ? $scope.pages[$scope.pageIndex] : { questions: [] };

    $timeout(function () {
      $scope.page.forEach(function (item) {
        if (item.type !== 1) {
          return;
        }

        $('#rate-' + item.token).rateit({
          min: 0,
          max: 5,
          step: 1,
          resetable: false,
          backingfld: '#range-' + item.token
        }).bind('rated', function (event, value) {
          item.feedback = value;
        });
      });
    });
  });

  //-----------------------------------------------
  //    Count
  //-----------------------------------------------

  $scope.pageCount = 0;
  pages.changes().subscribe(function () {
    $scope.pageCount = $scope.pages.length;
  });

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  var generatePassword = function generatePassword() {
    var length = 8,
        charset = 'abcdefghknpqrstuvwxyzABCDEFGHKMNPQRSTUVWXYZ23456789',
        result = '';
    for (var i = 0, n = charset.length; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * n));
    }
    return result;
  };

  var submitFeedback = function submitFeedback() {
    $scope.pages.reduce(function (answers, page) {
      return page.reduce(function (answers, question) {
        var value = parseInt(question.feedback);

        if (value > 0) {
          answers.push({
            survey: SurveyManager.model.feedbackSurvey.token,
            question: question.token,
            value: value
          });
        }

        return answers;
      }, answers);
    }, []).forEach(function (answer) {
      return AnalyticsModel.logAnswer(answer);
    });

    if ($scope.comment && $scope.comment.length > 0) {
      AnalyticsModel.logComment({
        type: 'feedback',
        text: $scope.comment
      });
    }

    SurveyManager.model.feedbackSurveyComplete = true;

    if ($scope.had_problems && !OrderManager.model.assistanceRequest) {
      OrderManager.requestAssistance();
    }

    if (CustomerModel.isGuest && $scope.email && $scope.email.length > 0) {
      var job = DialogManager.startJob();
      var password = generatePassword();

      CustomerManager.login({
        email: $scope.email,
        password: password
      }).then(function () {
        CustomerManager.login({
          login: $scope.email,
          password: password
        }).then(function () {
          DialogManager.endJob(job);
          NavigationManager.location = { type: 'home' };
        }, function () {
          DialogManager.endJob(job);
          NavigationManager.location = { type: 'home' };
        });
      }, function () {
        DialogManager.endJob(job);
        NavigationManager.location = { type: 'home' };
      });
    } else {
      NavigationManager.location = { type: 'home' };
    }
  };

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  $scope.previousPage = function () {
    if ($scope.pageIndex > 0) {
      $scope.pageIndex--;
    }
  };

  $scope.nextPage = function () {
    if ($scope.pageIndex < $scope.pageCount - 1) {
      $scope.pageIndex++;
    } else {
      $scope.nextStep();
    }
  };

  $scope.nextStep = function () {
    if (CustomerModel.isGuest && $scope.step < 3) {
      $scope.step++;
    } else if (!CustomerModel.isGuest && $scope.step < 2) {
      $scope.step++;
    } else {
      submitFeedback();
    }
  };

  $scope.submitProblem = function (status) {
    $scope.had_problems = Boolean(status);
    $scope.nextStep();
  };

  $scope.exit = function () {
    if ($scope.step > 0) {
      submitFeedback();
    }

    NavigationManager.location = { type: 'home' };
  };

  //------------------------------------------------------------------------
  //
  //  Startup
  //
  //------------------------------------------------------------------------

  (function () {
    var page;

    $scope.has_email = CustomerModel.hasCredentials;

    function buildSurvey() {
      SurveyManager.model.feedbackSurvey.questions.forEach(function (item) {
        if (item.type !== 1) {
          return;
        }

        if (!page || page.length > 4) {
          page = [];
          $scope.pages.push(page);
        }

        item.feedback = 0;
        page.push(item);
      });
    }

    if (SurveyManager.model.isEnabled && SurveyManager.model.feedbackSurvey) {
      buildSurvey();
    }

    SurveyManager.model.feedbackSurveyChanged.add(function () {
      return buildSurvey();
    });

    $scope.pageIndex = 0;
    $scope.step = 0;
  })();
}]);

//src/js/controllers/url.js

angular.module('SNAP.controllers').controller('UrlCtrl', ['$scope', 'NavigationManager', 'WebBrowser', function ($scope, NavigationManager, WebBrowser) {

  WebBrowser.open(NavigationManager.location.url);

  $scope.$on('$destroy', function () {
    WebBrowser.close();
  });
}]);

//src/js/controllers/web.js

angular.module('SNAP.controllers').controller('WebCtrl', ['$scope', '$timeout', 'ActivityMonitor', 'WebBrowser', function ($scope, $timeout, ActivityMonitor, WebBrowser) {

  WebBrowser.onOpen.add(function () {
    ActivityMonitor.enabled = false;
  });

  WebBrowser.onClose.add(function () {
    ActivityMonitor.enabled = true;
  });
}]);

//src/js/directives/_base.js

angular.module('SNAP.directives', ['angular-bacon']);

//src/js/directives/gallery.js

angular.module('SNAP.directives').directive('gallery', ['ActivityMonitor', 'ShellManager', '$timeout', function (ActivityMonitor, ShellManager, $timeout) {

  var slider,
      settings = {
    mode: 'fade',
    wrapperClass: 'photo-gallery'
  };

  return {
    restrict: 'E',
    replace: false,
    scope: {
      images: '=',
      imagewidth: '=?',
      imageheight: '=?'
    },
    templateUrl: ShellManager.getPartialUrl('gallery'),
    link: function link(scope, elem, attrs) {
      elem.ready(function () {
        slider = $('.bxslider', elem).bxSlider(settings);
      });

      scope.$watch('images', function () {
        scope.medias = (scope.images || []).map(function (image) {
          return ShellManager.getMediaUrl(image, attrs.imagewidth, attrs.imageheight);
        });
        settings.pager = scope.medias.length > 1;
        $timeout(function () {
          return slider.reloadSlider(settings);
        });
      });
    }
  };
}]);

//src/js/directives/oniframeload.js

angular.module('SNAP.directives').directive('onIframeLoad', function () {
  return {
    restrict: 'A',
    scope: {
      callback: '&onIframeLoad'
    },
    link: function link(scope, element, attrs) {
      element.bind('load', function (e) {
        if (typeof scope.callback === 'function') {
          scope.callback({ event: e });
        }
      });
    }
  };
});

//src/js/directives/onkeydown.js

angular.module('SNAP.directives').directive('onKeydown', function () {
  return {
    restrict: 'A',
    link: function link(scope, elem, attrs) {
      var functionToCall = scope.$eval(attrs.onKeydown);
      elem.on('keydown', function (e) {
        functionToCall(e.which);
      });
    }
  };
});

//src/js/directives/quantity.js

angular.module('SNAP.directives').directive('quantity', ['$timeout', 'ShellManager', function ($timeout, ShellManager) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      quantity: '=',
      min: '=',
      max: '='
    },
    link: function link(scope, elem) {
      scope.min = scope.min || 1;
      scope.max = scope.max || 9;
      scope.data = {
        min: scope.min,
        max: scope.max,
        quantity: parseInt(scope.quantity)
      };

      scope.decrease = function () {
        scope.quantity = scope.data.quantity = scope.data.quantity > scope.data.min ? scope.data.quantity - 1 : scope.data.min;
      };

      scope.increase = function () {
        scope.quantity = scope.data.quantity = scope.data.quantity < scope.data.max ? scope.data.quantity + 1 : scope.data.max;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-quantity')
  };
}]);

//src/js/directives/scroller.js

angular.module('SNAP.directives').directive('scroller', ['ActivityMonitor', 'SNAPEnvironment', function (ActivityMonitor, SNAPEnvironment) {
  return {
    restrict: 'C',
    replace: false,
    link: function link(scope, elem) {
      if (SNAPEnvironment.platform === 'desktop') {
        $(elem).kinetic({
          y: false, stopped: function stopped() {
            ActivityMonitor.activityDetected();
          }
        });
      }
    }
  };
}]);

//src/js/directives/scrollglue.js

angular.module('SNAP.directives').directive('scrollglue', ['$parse', function ($parse) {
  function unboundState(initValue) {
    var activated = initValue;
    return {
      getValue: function getValue() {
        return activated;
      },
      setValue: function setValue(value) {
        activated = value;
      }
    };
  }

  function oneWayBindingState(getter, scope) {
    return {
      getValue: function getValue() {
        return getter(scope);
      },
      setValue: function setValue() {}
    };
  }

  function twoWayBindingState(getter, setter, scope) {
    return {
      getValue: function getValue() {
        return getter(scope);
      },
      setValue: function setValue(value) {
        if (value !== getter(scope)) {
          scope.$apply(function () {
            setter(scope, value);
          });
        }
      }
    };
  }

  function createActivationState(attr, scope) {
    if (attr !== "") {
      var getter = $parse(attr);
      if (getter.assign !== undefined) {
        return twoWayBindingState(getter, getter.assign, scope);
      } else {
        return oneWayBindingState(getter, scope);
      }
    } else {
      return unboundState(true);
    }
  }

  return {
    priority: 1,
    restrict: 'A',
    link: function link(scope, $el, attrs) {
      var el = $el[0],
          activationState = createActivationState(attrs.scrollglue, scope);

      function scrollToBottom() {
        el.scrollTop = el.scrollHeight;
      }

      function onScopeChanges() {
        if (activationState.getValue() && !shouldActivateAutoScroll()) {
          scrollToBottom();
        }
      }

      function shouldActivateAutoScroll() {
        return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
      }

      function onScroll() {
        activationState.setValue(shouldActivateAutoScroll());
      }

      scope.$watch(onScopeChanges);
      $el.bind('scroll', onScroll);
    }
  };
}]);

//src/js/directives/slider.js

angular.module('SNAP.directives').directive('slider', ['$timeout', 'ShellManager', function ($timeout, ShellManager) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      source: '=',
      slideclick: '=',
      slideshow: '=',
      timeout: '='
    },
    link: function link(scope, elem) {
      var timeout = scope.timeout || 5000;
      scope.source = scope.source || [];
      scope.currentIndex = -1;

      var changeImage = function changeImage() {
        if (scope.source.length === 0 || scope.disabled) {
          return;
        }

        $timeout.cancel(timer);

        scope.source.forEach(function (entry, i) {
          entry.visible = false;
        });

        var entry = scope.source[scope.currentIndex];
        entry.visible = true;

        if (scope.slideshow) {
          scope.slideshow(entry);
        }

        if (entry.type === 'video') {
          var v = $('video', elem);
          v.attr('src', entry.src);
          var video = v.get(0);

          if (!video) {
            timer = $timeout(sliderFunc, 300);
            return;
          }

          var onVideoEnded = function onVideoEnded() {
            video.removeEventListener('ended', onVideoEnded, false);
            $timeout(function () {
              scope.next();
            });
          };

          var onVideoError = function onVideoError(error) {
            video.removeEventListener('error', onVideoError, false);
            $timeout(function () {
              scope.next();
            });
          };

          video.addEventListener('ended', onVideoEnded, false);
          video.addEventListener('error', onVideoError, false);

          try {
            video.load();
            video.play();
          } catch (e) {
            console.error('Unable to play video: ' + e);
          }
        } else {
          timer = $timeout(sliderFunc, timeout);
        }
      };

      scope.next = function () {
        scope.currentIndex < scope.source.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
        changeImage();
      };

      scope.prev = function () {
        scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.source.length - 1;
        changeImage();
      };

      var timer;

      var sliderFunc = function sliderFunc() {
        if (scope.source.length === 0 || scope.disabled) {
          return;
        }

        scope.next();
      };

      scope.$watch('source', function () {
        scope.currentIndex = -1;
        sliderFunc();
      });

      scope.$watch('disabled', function () {
        scope.currentIndex = -1;
        sliderFunc();
      });

      sliderFunc();

      scope.$on('$destroy', function () {
        $timeout.cancel(timer);
      });
    },
    templateUrl: ShellManager.getPartialUrl('slider')
  };
}]);

//src/js/directives/switch.js

angular.module('SNAP.directives').directive('switch', ['$timeout', 'ShellManager', function ($timeout, ShellManager) {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      disabled: '=?',
      selected: '=?'
    },
    link: function link(scope, elem) {
      scope.disabled = Boolean(scope.disabled);
      scope.selected = Boolean(scope.selected);
      scope.data = {
        disabled: Boolean(scope.disabled),
        selected: Boolean(scope.selected),
        changed: false
      };

      scope.toggle = function () {
        if (scope.disabled) {
          return;
        }

        scope.selected = scope.data.selected = !scope.data.selected;
        scope.data.changed = true;
      };
    },
    templateUrl: ShellManager.getPartialUrl('input-switch')
  };
}]);

//src/js/filters/_base.js

angular.module('SNAP.filters', []);

//src/js/filters/partial.js

angular.module('SNAP.filters').filter('partial', ['ShellManager', function (ShellManager) {
  return function (name) {
    return ShellManager.getPartialUrl(name);
  };
}]);

//src/js/filters/thumbnail.js

angular.module('SNAP.filters').filter('thumbnail', ['ShellManager', function (ShellManager) {
  return function (media, width, height, extension) {
    return ShellManager.getMediaUrl(media, width, height, extension);
  };
}]);

//src/js/filters/trusturl.js

angular.module('SNAP.filters').filter('trustUrl', ['$sce', function ($sce) {
  return function (val) {
    return $sce.trustAsResourceUrl(val);
  };
}]);

//src/js/services.js

angular.module('SNAP.services', ['ngResource', 'SNAP.configs']).factory('Logger', ['SNAPEnvironment', function (SNAPEnvironment) {
  return new app.Logger(SNAPEnvironment);
}]).factory('$exceptionHandler', ['Logger', function (Logger) {
  return function (exception, cause) {
    Logger.fatal(exception.stack, cause, exception);
    throw exception;
  };
}])

//Services

.factory('CardReader', ['ManagementService', function (ManagementService) {
  window.SnapCardReader = new app.CardReader(ManagementService);
  return window.SnapCardReader;
}]).factory('DtsApi', ['SNAPHosts', 'SessionModel', function (SNAPHosts, SessionModel) {
  return new app.BackendApi(SNAPHosts, SessionModel);
}]).factory('ManagementService', ['Logger', function (Logger) {
  return new app.CordovaManagementService(Logger);
}]).factory('SocketClient', ['SessionModel', 'SNAPHosts', 'Logger', function (SessionModel, SNAPHosts, Logger) {
  return new app.SocketClient(SessionModel, SNAPHosts, Logger);
}]).factory('TelemetryService', ['$resource', function ($resource) {
  return new app.TelemetryService($resource);
}]).factory('WebBrowser', ['AnalyticsModel', 'ManagementService', 'SNAPEnvironment', 'SNAPHosts', function (AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
  window.SnapWebBrowser = new app.WebBrowser(AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts);
  return window.SnapWebBrowser;
}])

//Models

.factory('AppCache', ['Logger', function (Logger) {
  return new app.AppCache(Logger);
}]).factory('AnalyticsModel', ['StorageProvider', 'HeatMap', function (StorageProvider, HeatMap) {
  return new app.AnalyticsModel(StorageProvider, HeatMap);
}]).factory('CartModel', function () {
  return new app.CartModel();
}).factory('ChatModel', ['SNAPLocation', 'SNAPEnvironment', 'StorageProvider', function (SNAPLocation, SNAPEnvironment, StorageProvider) {
  return new app.ChatModel(SNAPLocation, SNAPEnvironment, StorageProvider);
}]).factory('CustomerModel', ['SNAPLocation', 'StorageProvider', function (SNAPLocation, StorageProvider) {
  return new app.CustomerModel(SNAPLocation, StorageProvider);
}]).factory('DataProvider', ['SNAPLocation', 'DtsApi', function (SNAPLocation, DtsApi) {
  return new app.DataProvider(SNAPLocation, DtsApi);
}]).factory('HeatMap', function () {
  return new app.HeatMap(document.body);
}).factory('LocationModel', ['DtsApi', 'SNAPEnvironment', 'SNAPLocation', 'StorageProvider', function (DtsApi, SNAPEnvironment, SNAPLocation, StorageProvider) {
  return new app.LocationModel(DtsApi, SNAPEnvironment, SNAPLocation, StorageProvider);
}]).factory('OrderModel', ['StorageProvider', function (StorageProvider) {
  return new app.OrderModel(StorageProvider);
}]).factory('ShellModel', function () {
  return new app.ShellModel();
}).factory('SurveyModel', ['SNAPLocation', 'StorageProvider', function (SNAPLocation, StorageProvider) {
  return new app.SurveyModel(SNAPLocation, StorageProvider);
}]).factory('SessionModel', ['StorageProvider', function (StorageProvider) {
  return new app.SessionModel(StorageProvider);
}]).factory('StorageProvider', function () {
  return function (id) {
    return new app.CordovaLocalStorageStore(id);
  };
})

//Managers

.factory('ActivityMonitor', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  var monitor = new app.ActivityMonitor($rootScope, $timeout);
  monitor.timeout = 30000;
  return monitor;
}]).factory('AnalyticsManager', ['TelemetryService', 'AnalyticsModel', 'Logger', function (TelemetryService, AnalyticsModel, Logger) {
  return new app.AnalyticsManager(TelemetryService, AnalyticsModel, Logger);
}]).factory('AuthenticationManager', ['DtsApi', 'SessionModel', 'SNAPEnvironment', 'WebBrowser', 'Logger', function (DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger) {
  return new app.AuthenticationManager(DtsApi, SessionModel, SNAPEnvironment, WebBrowser, Logger);
}]).factory('CustomerManager', ['SNAPLocation', 'SNAPEnvironment', 'DtsApi', 'CustomerModel', 'SessionModel', function (SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionModel) {
  return new app.CustomerManager(SNAPLocation, SNAPEnvironment, DtsApi, CustomerModel, SessionModel);
}]).factory('ChatManager', ['AnalyticsModel', 'ChatModel', 'CustomerModel', 'LocationModel', 'SocketClient', function (AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient) {
  return new app.ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient);
}]).factory('DataManager', ['DataProvider', 'Logger', 'SNAPEnvironment', function (DataProvider, Logger, SNAPEnvironment) {
  return new app.DataManager(DataProvider, Logger, SNAPEnvironment);
}]).factory('DialogManager', function () {
  return new app.DialogManager();
}).factory('LocationManager', ['DataProvider', 'DtsApi', 'LocationModel', 'Logger', function (DataProvider, DtsApi, LocationModel, Logger) {
  return new app.LocationManager(DataProvider, DtsApi, LocationModel, Logger);
}]).factory('NavigationManager', ['$rootScope', '$location', '$window', 'AnalyticsModel', function ($rootScope, $location, $window, AnalyticsModel) {
  return new app.NavigationManager($rootScope, $location, $window, AnalyticsModel);
}]).factory('OrderManager', ['ChatModel', 'CustomerModel', 'DtsApi', 'OrderModel', function (ChatModel, CustomerModel, DtsApi, OrderModel) {
  return new app.OrderManager(ChatModel, CustomerModel, DtsApi, OrderModel);
}]).factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', function (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) {
  return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
}]).factory('ShellManager', ['$sce', 'DataProvider', 'ShellModel', 'SNAPLocation', 'SNAPEnvironment', 'SNAPHosts', function ($sce, DataProvider, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts) {
  var manager = new app.ShellManager($sce, DataProvider, ShellModel, SNAPLocation, SNAPEnvironment, SNAPHosts);
  DataProvider._getMediaUrl = function (media, width, height, extension) {
    return manager.getMediaUrl(media, width, height, extension);
  }; //ToDo: refactor
  return manager;
}]).factory('SocialManager', ['SNAPEnvironment', 'DtsApi', 'WebBrowser', 'Logger', function (SNAPEnvironment, DtsApi, WebBrowser, Logger) {
  return new app.SocialManager(SNAPEnvironment, DtsApi, WebBrowser, Logger);
}]).factory('SoftwareManager', ['SNAPEnvironment', function (SNAPEnvironment) {
  return new app.SoftwareManager(SNAPEnvironment);
}]).factory('SurveyManager', ['DataProvider', 'SurveyModel', function (DataProvider, SurveyModel) {
  return new app.SurveyManager(DataProvider, SurveyModel);
}]);
//# sourceMappingURL=data:application/json;base64,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RSxDQUFDLGlCQUFpQixFQUFFLFVBQUMsZUFBZSxFQUFLO0FBQ25FLFNBQU8sSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ2pELENBQUMsQ0FBQyxDQUNGLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxjQUFjLEVBQUUsYUFBYSxFQUFFLFVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBSztBQUN2RixTQUFPLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDekQsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVtcC9zbmFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9zcmMvanMvc2hhcmVkL19iYXNlLmpzXG5cbndpbmRvdy5hcHAgPSB7fTtcblxudmFyIEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SID0gMSxcbiAgICBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCA9IDEwLFxuICAgIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRCA9IDExLFxuICAgIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCA9IDIwLFxuICAgIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQgPSAyMSxcbiAgICBBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQgPSAzMCxcbiAgICBBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEID0gMzEsXG4gICAgQUxFUlRfU0lHTklOX1JFUVVJUkVEID0gNDAsXG4gICAgQUxFUlRfVEFCTEVfUkVTRVQgPSA1MCxcbiAgICBBTEVSVF9UQUJMRV9BU1NJU1RBTkNFID0gNTEsXG4gICAgQUxFUlRfVEFCTEVfQ0xPU0VPVVQgPSA1MixcbiAgICBBTEVSVF9HRU5FUklDX0VSUk9SID0gMTAwLFxuICAgIEFMRVJUX0RFTEVUX0NBUkQgPSAyMDAsXG4gICAgQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEUgPSAyMTAsXG4gICAgQUxFUlRfU09GVFdBUkVfT1VUREFURUQgPSAyMjAsXG4gICAgQUxFUlRfQ0FSRFJFQURFUl9FUlJPUiA9IDMxMCxcbiAgICBBTEVSVF9FUlJPUl9OT19TRUFUID0gNDEwLFxuICAgIEFMRVJUX0VSUk9SX1NUQVJUVVAgPSA1MTA7XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vYW5hbHl0aWNzZGF0YS5qc1xuXG53aW5kb3cuYXBwLkFuYWx5dGljc0RhdGEgPSBjbGFzcyBBbmFseXRpY3NEYXRhIHtcbiAgY29uc3RydWN0b3IobmFtZSwgc3RvcmFnZVByb3ZpZGVyLCBkZWZhdWx0VmFsdWUpIHtcbiAgICB0aGlzLl9kZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWUgfHwgKCgpID0+IFtdKTtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGVmYXVsdFZhbHVlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfYW5hbHl0aWNzXycgKyBuYW1lKTtcbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbihkYXRhID0+IHNlbGYuX2RhdGEgPSBkYXRhIHx8IHNlbGYuX2RhdGEpO1xuICB9XG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cblxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfVxuXG4gIHNldCBkYXRhKHZhbHVlKSB7XG4gICAgdGhpcy5fZGF0YSA9IHZhbHVlO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmxlbmd0aDtcbiAgfVxuXG4gIGdldCBsYXN0KCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhW3RoaXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICBwdXNoKGl0ZW0pIHtcbiAgICB0aGlzLl9kYXRhLnB1c2goaXRlbSk7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kZWZhdWx0VmFsdWUoKTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgc3RvcmUoKSB7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fZGF0YSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vY2FydGl0ZW0uanNcblxud2luZG93LmFwcC5DYXJ0SXRlbSA9IGNsYXNzIENhcnRJdGVtIHtcbiAgY29uc3RydWN0b3IoaXRlbSwgcXVhbnRpdHksIG5hbWUsIG1vZGlmaWVycywgcmVxdWVzdCkge1xuICAgIHRoaXMuaXRlbSA9IGl0ZW07XG4gICAgdGhpcy5xdWFudGl0eSA9IHF1YW50aXR5O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdDtcblxuICAgIGlmICghdGhpcy5oYXNNb2RpZmllcnMpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgfVxuICAgIGVsc2UgaWYgKCFtb2RpZmllcnMpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gaXRlbS5tb2RpZmllcnMubWFwKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KGNhdGVnb3J5LCBjYXRlZ29yeS5pdGVtcy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIobW9kaWZpZXIpO1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IG1vZGlmaWVycztcbiAgICB9XG4gIH1cblxuICBnZXQgaGFzTW9kaWZpZXJzKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW0ubW9kaWZpZXJzICE9IG51bGwgJiYgdGhpcy5pdGVtLm1vZGlmaWVycy5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkTW9kaWZpZXJzKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGlmaWVycy5yZWR1Y2UoZnVuY3Rpb24ocHJldmlvdXNDYXRlZ29yeSwgY2F0ZWdvcnksIGksIGFycmF5KSB7XG4gICAgICByZXR1cm4gYXJyYXkuY29uY2F0KGNhdGVnb3J5Lml0ZW1zLmZpbHRlcihmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICByZXR1cm4gbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICBjbG9uZShjb3VudCkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRJdGVtKFxuICAgICAgdGhpcy5pdGVtLFxuICAgICAgdGhpcy5xdWFudGl0eSxcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIHRoaXMubW9kaWZpZXJzLm1hcChjYXRlZ29yeSA9PiBjYXRlZ29yeS5jbG9uZSgpKSxcbiAgICAgIHRoaXMucmVxdWVzdCk7XG4gIH1cblxuICBjbG9uZU1hbnkoY291bnQpIHtcbiAgICBjb3VudCA9IGNvdW50IHx8IHRoaXMucXVhbnRpdHk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChuZXcgYXBwLkNhcnRJdGVtKFxuICAgICAgICB0aGlzLml0ZW0sXG4gICAgICAgIDEsXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy5tb2RpZmllcnMubWFwKGNhdGVnb3J5ID0+IGNhdGVnb3J5LmNsb25lKCkpLFxuICAgICAgICB0aGlzLnJlcXVlc3QpXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICByZXN0b3JlKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgIGRhdGEuaXRlbSxcbiAgICAgIGRhdGEucXVhbnRpdHksXG4gICAgICBkYXRhLm5hbWUsXG4gICAgICBkYXRhLm1vZGlmaWVycy5tYXAoYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5yZXN0b3JlKSxcbiAgICAgIGRhdGEucmVxdWVzdFxuICAgICk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vY2FydG1vZGlmaWVyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ2FydE1vZGlmaWVyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcnRNb2RpZmllciA9IGZ1bmN0aW9uKGRhdGEsIGlzU2VsZWN0ZWQpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQgfHwgZmFsc2U7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllcih0aGlzLmRhdGEsIHRoaXMuaXNTZWxlY3RlZCk7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllcihkYXRhLmRhdGEsIGRhdGEuaXNTZWxlY3RlZCk7XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJ0TW9kaWZpZXIgPSBDYXJ0TW9kaWZpZXI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcnRNb2RpZmllckNhdGVnb3J5XG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcnRNb2RpZmllckNhdGVnb3J5ID0gZnVuY3Rpb24oZGF0YSwgbW9kaWZpZXJzKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLm1vZGlmaWVycyA9IG1vZGlmaWVycztcbiAgfTtcblxuICBDYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kaWZpZXJzID0gdGhpcy5tb2RpZmllcnMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICByZXR1cm4gbW9kaWZpZXIuY2xvbmUoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeSh0aGlzLmRhdGEsIG1vZGlmaWVycyk7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkoZGF0YS5kYXRhLCBkYXRhLm1vZGlmaWVycy5tYXAoQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5yZXN0b3JlKSk7XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeSA9IENhcnRNb2RpZmllckNhdGVnb3J5O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL2RvbWFpbi9yZXF1ZXN0d2F0Y2hlci5qc1xuXG53aW5kb3cuYXBwLlJlcXVlc3RXYXRjaGVyID0gY2xhc3MgUmVxdWVzdFdhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcih0aWNrZXQsIER0c0FwaSkge1xuICAgIHRoaXMuX3Rva2VuID0gdGlja2V0LnRva2VuO1xuICAgIHRoaXMuX3JlbW90ZSA9IER0c0FwaTtcblxuICAgIHRoaXMuUE9MTElOR19JTlRFUlZBTCA9IDUwMDA7XG5cbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX1BFTkRJTkcgPSAxO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfUkVDRUlWRUQgPSAyO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQgPSAzO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfRVhQSVJFRCA9IDI1NTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBzZWxmLl9zdGF0dXNVcGRhdGVSZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICB0aGlzLl90aWNrZXQgPSB7IHN0YXR1czogMCB9O1xuICAgIHRoaXMuX3dhdGNoU3RhdHVzKCk7XG4gIH1cblxuICBnZXQgdG9rZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rva2VuO1xuICB9XG5cbiAgZ2V0IHRpY2tldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGlja2V0O1xuICB9XG5cbiAgZ2V0IHByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElkKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGlja2V0LnN0YXR1cyA8IHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQpIHtcbiAgICAgIHRoaXMuX3N0YXR1c1VwZGF0ZVJlamVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIF93YXRjaFN0YXR1cygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fdGltZW91dElkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgdmFyIG9uVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHNlbGYuX3JlbW90ZS53YWl0ZXIuZ2V0U3RhdHVzKHNlbGYuX3Rva2VuKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgc2VsZi5fc2V0VGlja2V0KHJlc3BvbnNlKTtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyA9PT0gc2VsZi5SRVFVRVNUX1NUQVRVU19BQ0NFUFRFRCkge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzICE9PSBzZWxmLlJFUVVFU1RfU1RBVFVTX0VYUElSRUQpIHtcbiAgICAgIHNlbGYuX3RpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KG9uVGltZW91dCwgdGhpcy5QT0xMSU5HX0lOVEVSVkFMKTtcbiAgICB9XG4gIH1cblxuICBfc2V0VGlja2V0KHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgPT09IHZhbHVlLnN0YXR1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuX3RpY2tldCA9IHZhbHVlO1xuICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vd2ViYnJvd3NlcnJlZmVyZW5jZS5qc1xuXG53aW5kb3cuYXBwLldlYkJyb3dzZXJSZWZlcmVuY2UgPSBjbGFzcyBXZWJCcm93c2VyUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IoYnJvd3NlclJlZikge1xuICAgIHRoaXMuYnJvd3NlciA9IGJyb3dzZXJSZWY7XG4gICAgdGhpcy5vbk5hdmlnYXRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25FeGl0ID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbkNhbGxiYWNrID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBleGl0KCkge1xuICAgIHRoaXMub25FeGl0LmRpc3BhdGNoKCk7XG4gIH1cbn07XG5cblxud2luZG93LmFwcC5Db3Jkb3ZhV2ViQnJvd3NlclJlZmVyZW5jZSA9IGNsYXNzIENvcmRvdmFXZWJCcm93c2VyUmVmZXJlbmNlIGV4dGVuZHMgYXBwLldlYkJyb3dzZXJSZWZlcmVuY2Uge1xuICBjb25zdHJ1Y3Rvcihicm93c2VyUmVmKSB7XG4gICAgc3VwZXIoYnJvd3NlclJlZik7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gb25Mb2FkU3RhcnQoZXZlbnQpIHtcbiAgICAgIHNlbGYub25OYXZpZ2F0ZWQuZGlzcGF0Y2goZXZlbnQudXJsKTtcbiAgICB9XG4gICAgdGhpcy5fb25Mb2FkU3RhcnQgPSBvbkxvYWRTdGFydDtcblxuICAgIGZ1bmN0aW9uIG9uRXhpdCgpIHtcbiAgICAgIGJyb3dzZXJSZWYucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0Jywgb25Mb2FkU3RhcnQpO1xuICAgICAgYnJvd3NlclJlZi5yZW1vdmVFdmVudExpc3RlbmVyKCdleGl0Jywgb25FeGl0KTtcbiAgICAgIHNlbGYub25FeGl0LmRpc3BhdGNoKCk7XG4gICAgfVxuICAgIHRoaXMuX29uRXhpdCA9IG9uRXhpdDtcblxuICAgIHRoaXMuYnJvd3Nlci5hZGRFdmVudExpc3RlbmVyKCdsb2Fkc3RhcnQnLCBvbkxvYWRTdGFydCk7XG4gICAgdGhpcy5icm93c2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2V4aXQnLCBvbkV4aXQpO1xuICB9XG5cbiAgZXhpdCgpIHtcbiAgICBzdXBlci5leGl0KCk7XG5cbiAgICB0aGlzLl9kaXNwb3NlKCk7XG4gICAgdGhpcy5icm93c2VyLmNsb3NlKCk7XG4gIH1cblxuICBfZGlzcG9zZSgpIHtcbiAgICB0aGlzLm9uTmF2aWdhdGVkLmRpc3Bvc2UoKTtcbiAgICB0aGlzLm9uRXhpdC5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLmJyb3dzZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgdGhpcy5fb25Mb2FkU3RhcnQpO1xuICAgIHRoaXMuYnJvd3Nlci5yZW1vdmVFdmVudExpc3RlbmVyKCdleGl0JywgdGhpcy5fb25FeGl0KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2FjdGl2aXR5bW9uaXRvci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFjdGl2aXR5TW9uaXRvciA9IGZ1bmN0aW9uKCRyb290U2NvcGUsICR0aW1lb3V0KSB7XG4gICAgdGhpcy4kJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG4gICAgdGhpcy4kJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICB0aGlzLl90aW1lb3V0ID0gMTAwMDA7XG5cbiAgICB0aGlzLl9hY3RpdmVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuJCRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5lbmFibGVkKSB7XG4gICAgICAgIHNlbGYuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hY3Rpdml0eURldGVjdGVkKCk7XG4gIH07XG5cbiAgQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSA9IHt9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAndGltZW91dCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fdGltZW91dDsgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICAgIHRoaXMuX3RpbWVvdXQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ2VuYWJsZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLl9lbmFibGVkID0gdmFsdWU7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdhY3RpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3RpbWVyICE9IG51bGw7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdhY3RpdmVDaGFuZ2VkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9hY3RpdmVDaGFuZ2VkOyB9XG4gIH0pO1xuXG4gIEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUuYWN0aXZpdHlEZXRlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGFuZ2VkO1xuXG4gICAgaWYgKHRoaXMuX3RpbWVyKSB7XG4gICAgICB0aGlzLiQkdGltZW91dC5jYW5jZWwodGhpcy5fdGltZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLl90aW1lciA9PT0gbnVsbCkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG9uVGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fdGltZXIgPSBudWxsO1xuXG4gICAgICBzZWxmLiQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuICAgICAgICAgIHNlbGYuYWN0aXZlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmFjdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl90aW1lciA9IHRoaXMuJCR0aW1lb3V0KG9uVGltZW91dCwgdGhpcy5fdGltZW91dCk7XG5cbiAgICBpZiAoY2hhbmdlZCAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYWN0aXZlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLmFjdGl2ZSk7XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hcHAuQWN0aXZpdHlNb25pdG9yID0gQWN0aXZpdHlNb25pdG9yO1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2FuYWx5dGljc21hbmFnZXIuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NNYW5hZ2VyID0gY2xhc3MgQW5hbHl0aWNzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpIHtcbiAgICB0aGlzLl9UZWxlbWV0cnlTZXJ2aWNlID0gVGVsZW1ldHJ5U2VydmljZTtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgfVxuXG4gIHN1Ym1pdCgpIHtcbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoYFN1Ym1pdHRpbmcgYW5hbHl0aWNzIGRhdGEgd2l0aCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLnNlc3Npb25zLmxlbmd0aH0gc2VhdCBzZXNzaW9ucywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5hbnN3ZXJzLmxlbmd0aH0gYW5zd2VycywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jaGF0cy5sZW5ndGh9IGNoYXRzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNvbW1lbnRzLmxlbmd0aH0gY29tbWVudHMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY2xpY2tzLmxlbmd0aH0gY2xpY2tzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLnBhZ2VzLmxlbmd0aH0gcGFnZXMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuYWR2ZXJ0aXNlbWVudHMubGVuZ3RofSBhZHZlcnRpc2VtZW50cyBhbmQgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC51cmxzLmxlbmd0aH0gVVJMcy5gKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fVGVsZW1ldHJ5U2VydmljZS5zdWJtaXRUZWxlbWV0cnkoe1xuICAgICAgICBzZXNzaW9uczogc2VsZi5fQW5hbHl0aWNzTW9kZWwuc2Vzc2lvbnMuZGF0YSxcbiAgICAgICAgYWR2ZXJ0aXNlbWVudHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmFkdmVydGlzZW1lbnRzLmRhdGEsXG4gICAgICAgIGFuc3dlcnM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmFuc3dlcnMuZGF0YSxcbiAgICAgICAgY2hhdHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmNoYXRzLmRhdGEsXG4gICAgICAgIGNvbW1lbnRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jb21tZW50cy5kYXRhLFxuICAgICAgICBjbGlja3M6IHNlbGYuX0FuYWx5dGljc01vZGVsLmNsaWNrcy5kYXRhLFxuICAgICAgICBwYWdlczogc2VsZi5fQW5hbHl0aWNzTW9kZWwucGFnZXMuZGF0YSxcbiAgICAgICAgdXJsczogc2VsZi5fQW5hbHl0aWNzTW9kZWwudXJscy5kYXRhXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5fQW5hbHl0aWNzTW9kZWwuY2xlYXIoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgZSA9PiB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci53YXJuKCdVbmFibGUgdG8gc3VibWl0IGFuYWx5dGljcyBkYXRhOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9hdXRoZW50aWNhdGlvbm1hbmFnZXIuanNcblxud2luZG93LmFwcC5BdXRoZW50aWNhdGlvbk1hbmFnZXIgPSBjbGFzcyBBdXRoZW50aWNhdGlvbk1hbmFnZXIge1xuICAvKiBnbG9iYWwgbW9tZW50LCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQmFja2VuZEFwaSwgU2Vzc2lvbk1vZGVsLCBTTkFQRW52aXJvbm1lbnQsIFdlYkJyb3dzZXIsIExvZ2dlcikge1xuICAgIHRoaXMuX0JhY2tlbmRBcGkgPSBCYWNrZW5kQXBpO1xuICAgIHRoaXMuX1Nlc3Npb25Nb2RlbCA9IFNlc3Npb25Nb2RlbDtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fV2ViQnJvd3NlciA9IFdlYkJyb3dzZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9XG5cbiAgdmFsaWRhdGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBtb2RlbCA9IHNlbGYuX1Nlc3Npb25Nb2RlbDtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnVmFsaWRhdGluZyBhY2Nlc3MgdG9rZW4uLi4nKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBtb2RlbC5pbml0aWFsaXplKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHZhciB0b2tlbiA9IG1vZGVsLmFwaVRva2VuO1xuXG4gICAgICAgIGlmICghdG9rZW4gfHwgIXNlbGYuX3ZhbGlkYXRlVG9rZW4odG9rZW4pKSB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdBdXRob3JpemF0aW9uIGlzIG5vdCB2YWxpZC4nKTtcbiAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1ZhbGlkYXRpbmcgYXV0aG9yaXphdGlvbiBzZXNzaW9uLi4uJyk7XG5cbiAgICAgICAgICBzZWxmLl9CYWNrZW5kQXBpLm9hdXRoMi5nZXRTZXNzaW9uKCkudGhlbihzZXNzaW9uID0+IHtcbiAgICAgICAgICAgIHNlc3Npb24gPSBVUkkoJz8nICsgc2Vzc2lvbikucXVlcnkodHJ1ZSk7IC8vVG9EbzogcmVtb3ZlIHRoaXMgaGFja1xuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbiAmJiBzZXNzaW9uLnZhbGlkID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdBdXRob3JpemF0aW9uIGlzIHZhbGlkLicsIHNlc3Npb24pO1xuICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXphdGlvbiBpcyBub3QgdmFsaWQgb3IgZXhwaXJlZC4nLCBzZXNzaW9uKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIHZhbGlkYXRlIGF1dGhvcml6YXRpb24uJywgZSk7XG4gICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZSA9PiB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRXJyb3IgdmFsaWRhdGluZyBhdXRob3JpemF0aW9uLicsIGUpO1xuICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhdXRob3JpemUoKSB7XG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdBdXRob3JpemluZyBBUEkgYWNjZXNzLi4uJyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX1Nlc3Npb25Nb2RlbC5jbGVhcigpLnRoZW4oKCkgPT4ge1xuICAgICAgICB2YXIgYXBwbGljYXRpb24gPSBzZWxmLl9TTkFQRW52aXJvbm1lbnQubWFpbl9hcHBsaWNhdGlvbixcbiAgICAgICAgICAgIGF1dGhVcmwgPSBzZWxmLl9CYWNrZW5kQXBpLm9hdXRoMi5nZXRUb2tlbkF1dGhvcml6ZVVybChhcHBsaWNhdGlvbi5jbGllbnRfaWQsIGFwcGxpY2F0aW9uLmNhbGxiYWNrX3VybCwgYXBwbGljYXRpb24uc2NvcGUpO1xuXG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3BlbihhdXRoVXJsLCB7IHN5c3RlbTogdHJ1ZSB9KS50aGVuKGJyb3dzZXIgPT4ge1xuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZUNhbGxiYWNrKHVybCkge1xuICAgICAgICAgICAgaWYgKHVybC5pbmRleE9mKGFwcGxpY2F0aW9uLmNhbGxiYWNrX3VybCkgIT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicm93c2VyLmV4aXQoKTtcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrUmVzcG9uc2UgPSB1cmwuc3BsaXQoJyMnKVsxXSxcbiAgICAgICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnMgPSBjYWxsYmFja1Jlc3BvbnNlLnNwbGl0KCcmJyksXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyTWFwID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2VQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHBhcmFtZXRlck1hcFtyZXNwb25zZVBhcmFtZXRlcnNbaV0uc3BsaXQoJz0nKVswXV0gPSByZXNwb25zZVBhcmFtZXRlcnNbaV0uc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhcmFtZXRlck1hcC5hY2Nlc3NfdG9rZW4gIT09IHVuZGVmaW5lZCAmJiBwYXJhbWV0ZXJNYXAuYWNjZXNzX3Rva2VuICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIHZhciB0b2tlbiA9IHtcbiAgICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHBhcmFtZXRlck1hcC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICAgICAgZXhwaXJlc19pbjogcGFyYW1ldGVyTWFwLmV4cGlyZXNfaW5cbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ05ldyBhY2Nlc3MgdG9rZW4gaXNzdWVkLicsIHRva2VuKTtcblxuICAgICAgICAgICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuYXBpVG9rZW4gPSB0b2tlbjtcblxuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1Byb2JsZW0gaXNzdWluZyBuZXcgYWNjZXNzIHRva2VuLicsIHBhcmFtZXRlck1hcCk7XG4gICAgICAgICAgICByZWplY3QoJ1Byb2JsZW0gYXV0aGVudGljYXRpbmc6ICcgKyB1cmwpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyb3dzZXIub25DYWxsYmFjay5hZGQodXJsID0+IGhhbmRsZUNhbGxiYWNrKHVybCkpO1xuICAgICAgICAgIGJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKHVybCA9PiBoYW5kbGVDYWxsYmFjayh1cmwpKTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBjdXN0b21lckxvZ2luUmVndWxhcihjcmVkZW50aWFscykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIGFwcGxpY2F0aW9uID0gc2VsZi5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuICAgICAgc2VsZi5fQmFja2VuZEFwaS5vYXV0aDIuZ2V0VG9rZW5XaXRoQ3JlZGVudGlhbHMoXG4gICAgICAgIGFwcGxpY2F0aW9uLmNsaWVudF9pZCxcbiAgICAgICAgY3JlZGVudGlhbHMubG9naW4sXG4gICAgICAgIGNyZWRlbnRpYWxzLnBhc3N3b3JkXG4gICAgICApLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmVycm9yIHx8ICFyZXN1bHQuYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChyZXN1bHQuZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlc3Npb24gPSB7XG4gICAgICAgICAgYWNjZXNzX3Rva2VuOiByZXN1bHQuYWNjZXNzX3Rva2VuXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc3VsdC5leHBpcmVzX2luKSB7XG4gICAgICAgICAgc2Vzc2lvbi5leHBpcmVzID0gbW9tZW50KCkuYWRkKHJlc3VsdC5leHBpcmVzX2luLCAnc2Vjb25kcycpLnVuaXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuID0gc2Vzc2lvbjtcblxuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY3VzdG9tZXJMb2dpblNvY2lhbCh0b2tlbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIHNlc3Npb24gPSB7XG4gICAgICAgIGFjY2Vzc190b2tlbjogdG9rZW4uYWNjZXNzX3Rva2VuXG4gICAgICB9O1xuXG4gICAgICBpZiAodG9rZW4uZXhwaXJlc19pbikge1xuICAgICAgICBzZXNzaW9uLmV4cGlyZXMgPSBtb21lbnQoKS5hZGQodG9rZW4uZXhwaXJlc19pbiwgJ3NlY29uZHMnKS51bml4KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuID0gc2Vzc2lvbjtcblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgX3ZhbGlkYXRlVG9rZW4odG9rZW4pIHtcbiAgICBpZiAoIXRva2VuIHx8ICF0b2tlbi5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0b2tlbi5leHBpcmVzKSB7XG4gICAgICB2YXIgZXhwaXJlcyA9IG1vbWVudC51bml4KHRva2VuLmV4cGlyZXMpO1xuXG4gICAgICBpZiAoZXhwaXJlcy5pc0JlZm9yZShtb21lbnQoKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvY2hhdG1hbmFnZXIuanNcblxud2luZG93LmFwcC5DaGF0TWFuYWdlciA9IGNsYXNzIENoYXRNYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuTUVTU0FHRV9UWVBFUyA9IHtcbiAgICAgIExPQ0FUSU9OOiAnbG9jYXRpb24nLFxuICAgICAgREVWSUNFOiAnZGV2aWNlJ1xuICAgIH07XG4gICAgdGhpcy5NRVNTQUdFX1NUQVRVU0VTID0ge1xuICAgICAgQ0hBVF9SRVFVRVNUOiAnY2hhdF9yZXF1ZXN0JyxcbiAgICAgIENIQVRfUkVRVUVTVF9BQ0NFUFRFRDogJ2NoYXRfcmVxdWVzdF9hY2NlcHRlZCcsXG4gICAgICBDSEFUX1JFUVVFU1RfREVDTElORUQ6ICdjaGF0X3JlcXVlc3RfZGVjbGluZWQnLFxuICAgICAgR0lGVF9SRVFVRVNUOiAnZ2lmdF9yZXF1ZXN0JyxcbiAgICAgIEdJRlRfUkVRVUVTVF9BQ0NFUFRFRDogJ2dpZnRfcmVxdWVzdF9hY2NlcHRlZCcsXG4gICAgICBHSUZUX1JFUVVFU1RfREVDTElORUQ6ICdnaWZ0X3JlcXVlc3RfZGVjbGluZWQnLFxuICAgICAgQ0hBVF9DTE9TRUQ6ICdjaGF0X2Nsb3NlZCdcbiAgICB9O1xuICAgIHRoaXMuT1BFUkFUSU9OUyA9IHtcbiAgICAgIENIQVRfTUVTU0FHRTogJ2NoYXRfbWVzc2FnZScsXG4gICAgICBTVEFUVVNfUkVRVUVTVDogJ3N0YXR1c19yZXF1ZXN0JyxcbiAgICAgIFNUQVRVU19VUERBVEU6ICdzdGF0dXNfdXBkYXRlJ1xuICAgIH07XG4gICAgdGhpcy5ST09NUyA9IHtcbiAgICAgIExPQ0FUSU9OOiAnbG9jYXRpb25fJyxcbiAgICAgIERFVklDRTogJ2RldmljZV8nXG4gICAgfTtcblxuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fQ2hhdE1vZGVsID0gQ2hhdE1vZGVsO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwgPSBMb2NhdGlvbk1vZGVsO1xuICAgIHRoaXMuX1NvY2tldENsaWVudCA9IFNvY2tldENsaWVudDtcblxuICAgIHRoaXMuX0NoYXRNb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0NoYXRNb2RlbC5pc1ByZXNlbnRDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5pc0Nvbm5lY3RlZENoYW5nZWQuYWRkKGlzQ29ubmVjdGVkID0+IHtcbiAgICAgIHNlbGYubW9kZWwuaXNDb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZDtcbiAgICAgIHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKTtcbiAgICAgIHNlbGYuX3NlbmRTdGF0dXNSZXF1ZXN0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc3Vic2NyaWJlKHRoaXMuUk9PTVMuTE9DQVRJT04gKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmxvY2F0aW9uLnRva2VuLCBtZXNzYWdlID0+IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS5vcGVyYXRpb24pIHtcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFOlxuICAgICAgICAgIHNlbGYuX29uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1JFUVVFU1Q6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5TVEFUVVNfVVBEQVRFOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzVXBkYXRlKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnN1YnNjcmliZSh0aGlzLlJPT01TLkRFVklDRSArIHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlLCBtZXNzYWdlID0+IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS5vcGVyYXRpb24pIHtcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFOlxuICAgICAgICAgIHNlbGYuX29uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURTpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fQ2hhdE1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5tb2RlbC5yZXNldCgpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBNZXNzYWdpbmdcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlO1xuICAgIG1lc3NhZ2Uub3BlcmF0aW9uID0gdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTtcbiAgICBtZXNzYWdlLnR5cGUgPSBtZXNzYWdlLnRvX2RldmljZSA/XG4gICAgICB0aGlzLk1FU1NBR0VfVFlQRVMuREVWSUNFIDpcbiAgICAgIHRoaXMuTUVTU0FHRV9UWVBFUy5MT0NBVElPTjtcblxuICAgIHRoaXMuX2FkZE1lc3NhZ2VJRChtZXNzYWdlKTtcbiAgICB0aGlzLm1vZGVsLmFkZEhpc3RvcnkobWVzc2FnZSk7XG5cbiAgICB2YXIgdG9waWMgPSB0aGlzLl9nZXRUb3BpYyhtZXNzYWdlKTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRvcGljLCBtZXNzYWdlKTtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dDaGF0KG1lc3NhZ2UpO1xuICB9XG5cbiAgYXBwcm92ZURldmljZSh0b2tlbikge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZSh0b2tlbik7XG5cbiAgICB0aGlzLm1vZGVsLnNldExhc3RSZWFkKHRva2VuLCBtb21lbnQoKS51bml4KCkpO1xuXG4gICAgaWYgKHRoaXMubW9kZWwuaXNQZW5kaW5nRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlUGVuZGluZ0RldmljZShkZXZpY2UpO1xuXG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVELFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmFkZEFjdGl2ZURldmljZShkZXZpY2UpO1xuICAgIH1cbiAgfVxuXG4gIGRlY2xpbmVEZXZpY2UodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgaWYgKHRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5yZW1vdmVBY3RpdmVEZXZpY2UoZGV2aWNlKTtcblxuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VELFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lc3NhZ2VOYW1lKG1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UgPT09IG1lc3NhZ2UuZGV2aWNlKSB7XG4gICAgICByZXR1cm4gJ01lJztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZS51c2VybmFtZSB8fCB0aGlzLmdldERldmljZU5hbWUobWVzc2FnZS5kZXZpY2UpO1xuICB9XG5cbiAgZ2V0RGV2aWNlTmFtZSh0b2tlbikge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZSh0b2tlbik7XG5cbiAgICBpZiAoZGV2aWNlKSB7XG4gICAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UgPT09IGRldmljZS50b2tlbikge1xuICAgICAgICByZXR1cm4gJ01lJztcbiAgICAgIH1cblxuICAgICAgaWYgKGRldmljZS51c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gZGV2aWNlLnVzZXJuYW1lO1xuICAgICAgfVxuXG4gICAgICBmb3IodmFyIHAgaW4gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0cykge1xuICAgICAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0c1twXS50b2tlbiA9PT0gZGV2aWNlLnNlYXQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0c1twXS5uYW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICdHdWVzdCc7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE5vdGlmaWNhdGlvbnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNoZWNrSWZVbnJlYWQoZGV2aWNlX3Rva2VuLCBtZXNzYWdlKSB7XG4gICAgbGV0IGxhc3RSZWFkID0gdGhpcy5tb2RlbC5nZXRMYXN0UmVhZChkZXZpY2VfdG9rZW4pO1xuXG4gICAgaWYgKCFsYXN0UmVhZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbW9tZW50LnVuaXgobWVzc2FnZS5yZWNlaXZlZCkuaXNBZnRlcihtb21lbnQudW5peChsYXN0UmVhZCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldFVucmVhZENvdW50KGRldmljZV90b2tlbikgPiAwO1xuICB9XG5cbiAgZ2V0VW5yZWFkQ291bnQoZGV2aWNlX3Rva2VuKSB7XG4gICAgbGV0IGxhc3RSZWFkID0gdGhpcy5tb2RlbC5nZXRMYXN0UmVhZChkZXZpY2VfdG9rZW4pO1xuXG4gICAgaWYgKCFsYXN0UmVhZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmcm9tRGF0ZSA9IG1vbWVudC51bml4KGxhc3RSZWFkKTtcblxuICAgIHJldHVybiB0aGlzLm1vZGVsLmhpc3RvcnlcbiAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtZXNzYWdlLnR5cGUgPT09IHNlbGYuTUVTU0FHRV9UWVBFUy5ERVZJQ0UgJiYgbWVzc2FnZS5kZXZpY2UgPT09IGRldmljZV90b2tlbilcbiAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtb21lbnQudW5peChtZXNzYWdlLnJlY2VpdmVkKS5pc0FmdGVyKGZyb21EYXRlKSlcbiAgICAgIC5sZW5ndGg7XG4gIH1cblxuICBtYXJrQXNSZWFkKGRldmljZV90b2tlbikge1xuICAgIHRoaXMubW9kZWwuc2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuLCBtb21lbnQoKS51bml4KCkpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBHaWZ0c1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgc2VuZEdpZnQoaXRlbXMpIHtcbiAgICBpZiAoIXRoaXMubW9kZWwuZ2lmdERldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNULFxuICAgICAgdG9fZGV2aWNlOiB0aGlzLm1vZGVsLmdpZnREZXZpY2UsXG4gICAgICB0ZXh0OiBpdGVtcy5yZWR1Y2UoKHJlc3VsdCwgaXRlbSkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgIHJlc3VsdCArPSAnLCAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBpdGVtLml0ZW0udGl0bGU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCAnJylcbiAgICB9KTtcbiAgfVxuXG4gIGFjY2VwdEdpZnQoZGV2aWNlKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQsXG4gICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgIH0pO1xuICB9XG5cbiAgZGVjbGluZUdpZnQoZGV2aWNlKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQsXG4gICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRHaWZ0KGRldmljZV90b2tlbikge1xuICAgIGxldCBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pO1xuXG4gICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gZGV2aWNlX3Rva2VuO1xuICAgIHRoaXMubW9kZWwuZ2lmdFNlYXQgPSBkZXZpY2Uuc2VhdDtcbiAgfVxuXG4gIGVuZEdpZnQoKSB7XG4gICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gbnVsbDtcbiAgICB0aGlzLm1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfb25NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBpZiAoIW1lc3NhZ2UuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tb2RlbC5oaXN0b3J5LmZpbHRlcihtc2cgPT4gbXNnLmlkID09PSBtZXNzYWdlLmlkKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWVzc2FnZS5yZWNlaXZlZCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSksXG4gICAgICAgIGdpZnREZXZpY2UgPSB0aGlzLm1vZGVsLmdpZnREZXZpY2UsXG4gICAgICAgIHNlYXQgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQudG9rZW47XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1QpICYmXG4gICAgICAgICF0aGlzLm1vZGVsLmlzUGVuZGluZ0RldmljZShkZXZpY2UpICYmXG4gICAgICAgICF0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuYWRkUGVuZGluZ0RldmljZShkZXZpY2UpO1xuICAgICAgdGhpcy5tb2RlbC5jaGF0UmVxdWVzdFJlY2VpdmVkLmRpc3BhdGNoKGRldmljZS50b2tlbik7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUICYmXG4gICAgICAgIHRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5naWZ0UmVxdWVzdFJlY2VpdmVkLmRpc3BhdGNoKGRldmljZSwgbWVzc2FnZS50ZXh0KTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UpIHtcbiAgICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRCkge1xuICAgICAgICBpZiAoZ2lmdERldmljZSAmJiBnaWZ0RGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdEFjY2VwdGVkLmRpc3BhdGNoKHRydWUpO1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICAgIGlmIChnaWZ0RGV2aWNlICYmIGdpZnREZXZpY2UgPT09IG1lc3NhZ2UuZGV2aWNlKSB7XG4gICAgICAgICAgdGhpcy5tb2RlbC5naWZ0QWNjZXB0ZWQuZGlzcGF0Y2goZmFsc2UpO1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICAgIHRoaXMuZGVjbGluZURldmljZShkZXZpY2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLm9wZXJhdGlvbiA9PT0gdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRSkge1xuICAgICAgbWVzc2FnZS51c2VybmFtZSA9IHRoaXMuZ2V0RGV2aWNlTmFtZShkZXZpY2UpO1xuICAgICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHRoaXMubW9kZWwubWVzc2FnZVJlY2VpdmVkLmRpc3BhdGNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgX29uU3RhdHVzUmVxdWVzdChtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NlbmRTdGF0dXNVcGRhdGUobWVzc2FnZS5kZXZpY2UpO1xuICB9XG5cbiAgX29uU3RhdHVzVXBkYXRlKG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5kZXZpY2UgPT09IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICBkZXZpY2UgPSB7XG4gICAgICAgIHRva2VuOiBtZXNzYWdlLmRldmljZSxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuYWRkRGV2aWNlKGRldmljZSk7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmlzX2F2YWlsYWJsZSAmJiBkZXZpY2UuaXNfYXZhaWxhYmxlKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHtcbiAgICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFLFxuICAgICAgICB0eXBlOiB0aGlzLk1FU1NBR0VfVFlQRVMuREVWSUNFLFxuICAgICAgICBkZXZpY2U6IGRldmljZS50b2tlbixcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQsXG4gICAgICAgIHRvX2RldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VcbiAgICAgIH07XG4gICAgICB0aGlzLl9hZGRNZXNzYWdlSUQoaGlzdG9yeSk7XG4gICAgICB0aGlzLm1vZGVsLmFkZEhpc3RvcnkoaGlzdG9yeSk7XG4gICAgfVxuXG4gICAgZGV2aWNlLmlzX2F2YWlsYWJsZSA9IEJvb2xlYW4obWVzc2FnZS5pc19hdmFpbGFibGUpO1xuICAgIGRldmljZS5pc19wcmVzZW50ID0gQm9vbGVhbihtZXNzYWdlLmlzX3ByZXNlbnQpO1xuICAgIGRldmljZS5zZWF0ID0gbWVzc2FnZS5zZWF0O1xuICAgIGRldmljZS51c2VybmFtZSA9IG1lc3NhZ2UudXNlcm5hbWU7XG5cbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlcyk7XG4gIH1cblxuICBfc2VuZFN0YXR1c1JlcXVlc3QoKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmlzQ29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICBvcGVyYXRpb246IHRoaXMuT1BFUkFUSU9OUy5TVEFUVVNfUkVRVUVTVCxcbiAgICAgIGRldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VcbiAgICB9O1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodGhpcy5fZ2V0VG9waWMobWVzc2FnZSksIG1lc3NhZ2UpO1xuICB9XG5cbiAgX3NlbmRTdGF0dXNVcGRhdGUoZGV2aWNlKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmlzQ29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHByb2ZpbGUgPSB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGUsXG4gICAgICAgIHVzZXJuYW1lO1xuXG4gICAgaWYgKHByb2ZpbGUgJiYgcHJvZmlsZS5maXJzdF9uYW1lKSB7XG4gICAgICB1c2VybmFtZSA9IHByb2ZpbGUuZmlyc3RfbmFtZSArICcgJyArIHByb2ZpbGUubGFzdF9uYW1lO1xuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURSxcbiAgICAgIHRvX2RldmljZTogZGV2aWNlLFxuICAgICAgZGV2aWNlOiB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSxcbiAgICAgIHNlYXQ6IHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdC50b2tlbixcbiAgICAgIGlzX2F2YWlsYWJsZTogdGhpcy5tb2RlbC5pc0VuYWJsZWQsXG4gICAgICBpc19wcmVzZW50OiB0aGlzLm1vZGVsLmlzUHJlc2VudCxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZVxuICAgIH07XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0aGlzLl9nZXRUb3BpYyhtZXNzYWdlKSwgbWVzc2FnZSk7XG4gIH1cblxuICBfZ2V0VG9waWMobWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1lc3NhZ2UudG9fZGV2aWNlID9cbiAgICAgICAgdGhpcy5ST09NUy5ERVZJQ0UgKyBtZXNzYWdlLnRvX2RldmljZSA6XG4gICAgICAgIHRoaXMuUk9PTVMuTE9DQVRJT04gKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmxvY2F0aW9uLnRva2VuO1xuICB9XG5cbiAgX2FkZE1lc3NhZ2VJRChtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5pZCA9IG1lc3NhZ2UuaWQgfHwgJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBjID0+IHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2fDAsXG4gICAgICAgICAgdiA9IGMgPT09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2N1c3RvbWVybWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkN1c3RvbWVyTWFuYWdlciA9IGNsYXNzIEN1c3RvbWVyTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBtb21lbnQgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwsIFNlc3Npb25Nb2RlbCkge1xuICAgIHRoaXMuX2FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG4gICAgdGhpcy5fY3VzdG9tZXJBcHBJZCA9IEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uLmNsaWVudF9pZDtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fQ3VzdG9tZXJNb2RlbDtcbiAgfVxuXG4gIGdldCBjdXN0b21lck5hbWUoKSB7XG4gICAgaWYgKHRoaXMubW9kZWwuaXNFbmFibGVkICYmIHRoaXMubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICF0aGlzLm1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgIHZhciBuYW1lID0gJyc7XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5maXJzdF9uYW1lKSB7XG4gICAgICAgIG5hbWUgKz0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZmlyc3RfbmFtZTtcbiAgICAgIH1cblxuICAgICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmxhc3RfbmFtZSkge1xuICAgICAgICBuYW1lICs9ICcgJyArIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmxhc3RfbmFtZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuICdHdWVzdCc7XG4gIH1cblxuICBsb2dvdXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuID0gbnVsbDtcbiAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IG51bGw7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICBndWVzdExvZ2luKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSAnZ3Vlc3QnO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9naW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvYWRQcm9maWxlKCk7XG4gIH1cblxuICBsb2dpblNvY2lhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9hZFByb2ZpbGUoKTtcbiAgfVxuXG4gIHNpZ25VcChyZWdpc3RyYXRpb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlZ2lzdHJhdGlvbi5jbGllbnRfaWQgPSBzZWxmLl9jdXN0b21lckFwcElkO1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnNpZ25VcChyZWdpc3RyYXRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogcmVnaXN0cmF0aW9uLnVzZXJuYW1lLFxuICAgICAgICAgIHBhc3N3b3JkOiByZWdpc3RyYXRpb24ucGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVByb2ZpbGUocHJvZmlsZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnVwZGF0ZVByb2ZpbGUocHJvZmlsZSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFuZ2VQYXNzd29yZChyZXF1ZXN0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuY2hhbmdlUGFzc3dvcmQocmVxdWVzdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYubG9naW4oe1xuICAgICAgICAgIGxvZ2luOiBzZWxmLl9DdXN0b21lck1vZGVsLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiByZXF1ZXN0Lm5ld19wYXNzd29yZFxuICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRQYXNzd29yZChyZXF1ZXN0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIucmVzZXRQYXNzd29yZChyZXF1ZXN0KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9sb2FkUHJvZmlsZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5nZXRQcm9maWxlKCkudGhlbihwcm9maWxlID0+IHtcbiAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gcHJvZmlsZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2RhdGFtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuRGF0YU1hbmFnZXIgPSBjbGFzcyBEYXRhTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoRGF0YVByb3ZpZGVyLCBMb2dnZXIsIFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5ob21lQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubWVudUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNhdGVnb3J5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuaXRlbUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX0NBQ0hFQUJMRV9NRURJQV9LSU5EUyA9IFtcbiAgICAgIDQxLCA1MSwgNTgsIDYxXG4gICAgXTtcbiAgfVxuXG4gIGdldCBwcm92aWRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fRGF0YVByb3ZpZGVyO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fY2FjaGUgPSB7XG4gICAgICBtZW51OiB7fSxcbiAgICAgIGNhdGVnb3J5OiB7fSxcbiAgICAgIGl0ZW06IHt9LFxuICAgICAgbWVkaWE6IHt9XG4gICAgfTtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6aW5nIGRhdGEgbWFuYWdlci4nKTtcblxuICAgIHRoaXMucHJvdmlkZXIuZGlnZXN0KCkudGhlbihkaWdlc3QgPT4ge1xuICAgICAgdmFyIG1lbnVTZXRzID0gZGlnZXN0Lm1lbnVfc2V0cy5tYXAobWVudSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5tZW51KG1lbnUudG9rZW4pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHNlbGYuX2NhY2hlLm1lbnVbbWVudS50b2tlbl0gPSBzZWxmLl9maWx0ZXJNZW51KGRhdGEpKVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBtZW51Q2F0ZWdvcmllcyA9IGRpZ2VzdC5tZW51X2NhdGVnb3JpZXMubWFwKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLmNhdGVnb3J5KGNhdGVnb3J5LnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5jYXRlZ29yeVtjYXRlZ29yeS50b2tlbl0gPSBzZWxmLl9maWx0ZXJDYXRlZ29yeShkYXRhKSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVudUl0ZW1zID0gZGlnZXN0Lm1lbnVfaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIuaXRlbShpdGVtLnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5pdGVtW2l0ZW0udG9rZW5dID0gZGF0YSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVkaWFzID0gZGlnZXN0Lm1lZGlhXG4gICAgICAgIC5maWx0ZXIobWVkaWEgPT4gc2VsZi5fQ0FDSEVBQkxFX01FRElBX0tJTkRTLmluZGV4T2YobWVkaWEua2luZCkgIT09IC0xKVxuICAgICAgICAubWFwKG1lZGlhID0+IHtcbiAgICAgICAgICB2YXIgd2lkdGgsIGhlaWdodDtcblxuICAgICAgICAgIHN3aXRjaCAobWVkaWEua2luZCkge1xuICAgICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICAgIHdpZHRoID0gMzcwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSAzNzA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICAgICAgd2lkdGggPSA2MDA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDYwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgICB3aWR0aCA9IDEwMDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gMTAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtZWRpYS53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIG1lZGlhLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgIHJldHVybiBtZWRpYTtcbiAgICAgICAgfSlcbiAgICAgICAgLm1hcChtZWRpYSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHNlbGYucHJvdmlkZXIubWVkaWEobWVkaWEpXG4gICAgICAgICAgICAgIC50aGVuKGltZyA9PiBzZWxmLl9jYWNoZS5tZWRpYVttZWRpYS50b2tlbl0gPSBpbWcpXG4gICAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBEaWdlc3QgY29udGFpbnMgJHttZW51U2V0cy5sZW5ndGh9IG1lbnVzLCBgICtcbiAgICAgICAgYCR7bWVudUNhdGVnb3JpZXMubGVuZ3RofSBjYXRlZ29yaWVzLCBgICtcbiAgICAgICAgYCR7bWVudUl0ZW1zLmxlbmd0aH0gaXRlbXMgYW5kIGAgK1xuICAgICAgICBgJHttZWRpYXMubGVuZ3RofSBmaWxlcy5gKTtcblxuICAgICAgdmFyIHRhc2tzID0gW11cbiAgICAgICAgLmNvbmNhdChtZW51U2V0cylcbiAgICAgICAgLmNvbmNhdChtZW51Q2F0ZWdvcmllcylcbiAgICAgICAgLmNvbmNhdChtZW51SXRlbXMpO1xuXG4gICAgICBQcm9taXNlLmFsbCh0YXNrcykudGhlbigoKSA9PiB7XG4gICAgICAgIFByb21pc2UuYWxsKG1lZGlhcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBob21lKCkgeyByZXR1cm4gdGhpcy5faG9tZTsgfVxuICBzZXQgaG9tZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9ob21lID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5faG9tZSA9IHZhbHVlO1xuICAgICAgdGhpcy5wcm92aWRlci5ob21lKCkudGhlbihob21lID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2hvbWUpIHtcbiAgICAgICAgICBob21lID0gc2VsZi5fZmlsdGVySG9tZShob21lKTtcbiAgICAgICAgICBzZWxmLmhvbWVDaGFuZ2VkLmRpc3BhdGNoKGhvbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9ob21lID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5ob21lQ2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBtZW51KCkgeyByZXR1cm4gdGhpcy5fbWVudTsgfVxuICBzZXQgbWVudSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9tZW51ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5fbWVudSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnbWVudScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIubWVudSh2YWx1ZSkudGhlbihtZW51ID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX21lbnUpIHtcbiAgICAgICAgICBtZW51ID0gc2VsZi5fZmlsdGVyTWVudShtZW51KTtcbiAgICAgICAgICBzZWxmLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKG1lbnUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9tZW51ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5tZW51Q2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjYXRlZ29yeSgpIHsgcmV0dXJuIHRoaXMuX2NhdGVnb3J5OyB9XG4gIHNldCBjYXRlZ29yeSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9jYXRlZ29yeSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2NhdGVnb3J5ID0gdmFsdWU7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVkKCdjYXRlZ29yeScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLmNhdGVnb3J5KHZhbHVlKS50aGVuKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2NhdGVnb3J5KSB7XG4gICAgICAgICAgY2F0ZWdvcnkgPSBzZWxmLl9maWx0ZXJDYXRlZ29yeShjYXRlZ29yeSk7XG4gICAgICAgICAgc2VsZi5jYXRlZ29yeUNoYW5nZWQuZGlzcGF0Y2goY2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9jYXRlZ29yeSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGl0ZW0oKSB7IHJldHVybiB0aGlzLl9pdGVtOyB9XG4gIHNldCBpdGVtKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2l0ZW0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9pdGVtID0gdmFsdWU7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVkKCdpdGVtJywgdmFsdWUpO1xuXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtQ2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5pdGVtKHZhbHVlKS50aGVuKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoc2VsZi5faXRlbSkge1xuICAgICAgICAgIHNlbGYuaXRlbUNoYW5nZWQuZGlzcGF0Y2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2l0ZW0gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgX2NhY2hlZChncm91cCwgaWQpIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdICYmIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZVtncm91cF1baWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICghaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVbZ3JvdXBdO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgX2ZpbHRlckhvbWUoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkYXRhLm1lbnVzID0gZGF0YS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMyk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIF9maWx0ZXJNZW51KGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIF9maWx0ZXJDYXRlZ29yeShkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRhdGEuaXRlbXMgPSBkYXRhLml0ZW1zXG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgaXRlbS50eXBlICE9PSAzKTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvZGlhbG9nbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkRpYWxvZ01hbmFnZXIgPSBjbGFzcyBEaWFsb2dNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hbGVydFJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubm90aWZpY2F0aW9uUmVxdWVzdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jb25maXJtUmVxdWVzdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5qb2JTdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5qb2JFbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubW9kYWxTdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5tb2RhbEVuZGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fam9icyA9IDA7XG4gICAgdGhpcy5fbW9kYWxzID0gMDtcbiAgfVxuXG4gIGdldCBqb2JzKCkgeyByZXR1cm4gdGhpcy5fam9iczsgfVxuICBnZXQgbW9kYWxzKCkgeyByZXR1cm4gdGhpcy5fbW9kYWxzOyB9XG5cbiAgYWxlcnQobWVzc2FnZSwgdGl0bGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuYWxlcnRSZXF1ZXN0ZWQuZGlzcGF0Y2gobWVzc2FnZSwgdGl0bGUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBub3RpZmljYXRpb24obWVzc2FnZSkge1xuICAgIHRoaXMubm90aWZpY2F0aW9uUmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgY29uZmlybShtZXNzYWdlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLmNvbmZpcm1SZXF1ZXN0ZWQuZGlzcGF0Y2gobWVzc2FnZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0Sm9iKCkge1xuICAgIHRoaXMuX2pvYnMrKztcblxuICAgIGlmICh0aGlzLl9qb2JzID09PSAxKSB7XG4gICAgICB0aGlzLmpvYlN0YXJ0ZWQuZGlzcGF0Y2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fam9icztcbiAgfVxuXG4gIGVuZEpvYihpZCkge1xuICAgIHRoaXMuX2pvYnMtLTtcblxuICAgIGlmICh0aGlzLl9qb2JzID09PSAwKSB7XG4gICAgICB0aGlzLmpvYkVuZGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRNb2RhbCgpIHtcbiAgICB0aGlzLl9tb2RhbHMrKztcblxuICAgIGlmICh0aGlzLl9tb2RhbHMgPT09IDEpIHtcbiAgICAgIHRoaXMubW9kYWxTdGFydGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21vZGFscztcbiAgfVxuXG4gIGVuZE1vZGFsKGlkKSB7XG4gICAgdGhpcy5fbW9kYWxzLS07XG5cbiAgICBpZiAodGhpcy5fbW9kYWxzID09PSAwKSB7XG4gICAgICB0aGlzLm1vZGFsRW5kZWQuZGlzcGF0Y2goKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9sb2NhdGlvbm1hbmFnZXIuanNcblxud2luZG93LmFwcC5Mb2NhdGlvbk1hbmFnZXIgPSBjbGFzcyBMb2NhdGlvbk1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIER0c0FwaSwgTG9jYXRpb25Nb2RlbCwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH1cblxuICBsb2FkQ29uZmlnKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbW9kZWwgPSBzZWxmLl9Mb2NhdGlvbk1vZGVsO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIGxvYWRDb25maWcoKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9hZGluZyBsb2NhdGlvbiBjb25maWcuLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnbG9jYXRpb24nKS50aGVuKGxvY2F0aW9uID0+IHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYE5ldyAnJHtsb2NhdGlvbi5sb2NhdGlvbl9uYW1lfScgbG9jYXRpb24gY29uZmlnIGxvYWRlZC5gKTtcbiAgICAgICAgICByZXNvbHZlKGxvY2F0aW9uKTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5sb2NhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYEZhbGxiYWNrIHRvIHN0b3JlZCBsb2NhdGlvbiAnJHttb2RlbC5sb2NhdGlvbi5sb2NhdGlvbl9uYW1lfScuYCk7XG4gICAgICAgICAgcmVzb2x2ZShtb2RlbC5sb2NhdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBtb2RlbC5pbml0aWFsaXplKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9hZGluZyBkZXZpY2UgaW5mby4uLicpO1xuXG4gICAgICAgIG1vZGVsLmZldGNoKCdkZXZpY2UnKS50aGVuKGRldmljZSA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBOZXcgZGV2aWNlIGxvYWRlZDogdG9rZW49JHtkZXZpY2UudG9rZW59O2xvY2F0aW9uPSR7ZGV2aWNlLmxvY2F0aW9uX3Rva2VufWApO1xuICAgICAgICAgIGxvYWRDb25maWcoKTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5kZXZpY2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBGYWxsYmFjayB0byBzdG9yZWQgZGV2aWNlOiB0b2tlbj0ke21vZGVsLmRldmljZS50b2tlbn07bG9jYXRpb249JHttb2RlbC5kZXZpY2UubG9jYXRpb25fdG9rZW59YCk7XG4gICAgICAgICAgbG9hZENvbmZpZygpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkU2VhdHMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBtb2RlbCA9IHNlbGYuX0xvY2F0aW9uTW9kZWw7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZnVuY3Rpb24gbG9hZFNlYXQoKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9hZGluZyBjdXJyZW50IHNlYXQgaW5mby4uLicpO1xuXG4gICAgICAgIG1vZGVsLmZldGNoKCdzZWF0JykudGhlbihzZWF0ID0+IHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYE5ldyBzZWF0IGRhdGEgbG9hZGVkIGZvciAjJHtzZWF0LnRva2VufS5gKTtcbiAgICAgICAgICByZXNvbHZlKHNlYXQpO1xuICAgICAgICB9LCBlID0+IHtcbiAgICAgICAgICBpZiAoIW1vZGVsLnNlYXQpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBGYWxsYmFjayB0byBzdG9yZWQgc2VhdCAjJHttb2RlbC5zZWF0LnRva2VufS5gKTtcbiAgICAgICAgICByZXNvbHZlKG1vZGVsLnNlYXQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbW9kZWwuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgbG9jYXRpb24gc2VhdHMuLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnc2VhdHMnKS50aGVuKHNlYXRzID0+IHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYExvY2F0aW9uIHNlYXRzIGxvYWRlZCAoJHtzZWF0cy5sZW5ndGh9KS5gKTtcbiAgICAgICAgICBsb2FkU2VhdCgpO1xuICAgICAgICB9LCBlID0+IHtcbiAgICAgICAgICBpZiAoIW1vZGVsLnNlYXRzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRmFsbGJhY2sgdG8gc3RvcmVkIHNlYXRzICgke21vZGVsLnNlYXRzLmxlbmd0aH0pLmApO1xuICAgICAgICAgIGxvYWRTZWF0KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL25hdmlnYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuTmF2aWdhdGlvbk1hbmFnZXIgPSBjbGFzcyBOYXZpZ2F0aW9uTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBBbmFseXRpY3NNb2RlbCkge1xuICAgIHRoaXMuJCRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICB0aGlzLiQkd2luZG93ID0gJHdpbmRvdztcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5sb2NhdGlvbkNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgKCkgPT4ge1xuICAgICAgdmFyIHBhdGggPSBzZWxmLiQkbG9jYXRpb24ucGF0aCgpO1xuXG4gICAgICBpZiAocGF0aCA9PT0gc2VsZi5fcGF0aCkge1xuICAgICAgICBzZWxmLmxvY2F0aW9uQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9sb2NhdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fcGF0aCA9IHBhdGg7XG4gICAgICBzZWxmLl9sb2NhdGlvbiA9IHNlbGYuZ2V0TG9jYXRpb24ocGF0aCk7XG4gICAgICBzZWxmLmxvY2F0aW9uQ2hhbmdpbmcuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHNlbGYuX0FuYWx5dGljc01vZGVsLmxvZ05hdmlnYXRpb24obG9jYXRpb24pKTtcbiAgfVxuXG4gIGdldCBwYXRoKCkgeyByZXR1cm4gdGhpcy5fcGF0aDsgfVxuICBzZXQgcGF0aCh2YWx1ZSkge1xuICAgIHZhciBpID0gdmFsdWUuaW5kZXhPZignIycpLFxuICAgICAgICBwYXRoID0gaSAhPT0gLTEgPyB2YWx1ZS5zdWJzdHJpbmcoaSArIDEpIDogdmFsdWU7XG5cbiAgICB0aGlzLmxvY2F0aW9uID0gdGhpcy5nZXRMb2NhdGlvbihwYXRoKTtcbiAgfVxuXG4gIGdldCBsb2NhdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xvY2F0aW9uOyB9XG4gIHNldCBsb2NhdGlvbih2YWx1ZSkge1xuICAgIHRoaXMuX2xvY2F0aW9uID0gdmFsdWU7XG5cbiAgICB0aGlzLmxvY2F0aW9uQ2hhbmdpbmcuZGlzcGF0Y2godGhpcy5fbG9jYXRpb24pO1xuXG4gICAgdmFyIHBhdGggPSB0aGlzLl9wYXRoID0gdGhpcy5nZXRQYXRoKHRoaXMuX2xvY2F0aW9uKTtcbiAgICB0aGlzLiQkbG9jYXRpb24ucGF0aChwYXRoKTtcbiAgfVxuXG4gIGdldFBhdGgobG9jYXRpb24pIHtcbiAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobG9jYXRpb24udG9rZW4pIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgbG9jYXRpb24udG9rZW47XG4gICAgfVxuICAgIGVsc2UgaWYgKGxvY2F0aW9uLnVybCkge1xuICAgICAgcmV0dXJuICcvJyArIGxvY2F0aW9uLnR5cGUgKyAnLycgKyBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24udXJsKTtcbiAgICB9XG5cbiAgICBpZiAobG9jYXRpb24udHlwZSA9PT0gJ2hvbWUnKSB7XG4gICAgICByZXR1cm4gJy8nO1xuICAgIH1cblxuICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlO1xuICB9XG5cbiAgZ2V0TG9jYXRpb24ocGF0aCkge1xuICAgIHZhciBtYXRjaCA9IC9cXC8oXFx3Kyk/KFxcLyguKykpPy8uZXhlYyhwYXRoKTtcblxuICAgIGlmIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgdHlwZSA9IG1hdGNoWzFdO1xuICAgICAgdmFyIHBhcmFtID0gbWF0Y2hbM107XG5cbiAgICAgIGlmIChwYXJhbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIHVybDogZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtKSB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIHRva2VuOiBwYXJhbSB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdHlwZSkge1xuICAgICAgICB0eXBlID0gJ2hvbWUnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyB0eXBlOiB0eXBlIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgZ29CYWNrKCkge1xuICAgIGlmICh0aGlzLmxvY2F0aW9uLnR5cGUgIT09ICdob21lJyAmJiB0aGlzLmxvY2F0aW9uLnR5cGUgIT09ICdzaWduaW4nKSB7XG4gICAgICB0aGlzLiQkd2luZG93Lmhpc3RvcnkuYmFjaygpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL29yZGVybWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk9yZGVyTWFuYWdlciA9IGNsYXNzIE9yZGVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRHRzQXBpLCBPcmRlck1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRHRzQXBpID0gRHRzQXBpO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9PcmRlck1vZGVsID0gT3JkZXJNb2RlbDtcblxuICAgIHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKGdpZnRTZWF0ID0+IHtcbiAgICAgIGlmIChzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoID0gc2VsZi5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gW107XG4gICAgICB9XG5cbiAgICAgIGlmICghZ2lmdFNlYXQpIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnQgPSBzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9PcmRlck1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUik7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFKTtcbiAgICAgIHNlbGYubW9kZWwuY2xlYXJXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VUKTtcblxuICAgICAgc2VsZi5jbGVhckNhcnQoKTtcbiAgICAgIHNlbGYuY2xlYXJDaGVjaygpO1xuICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHt9O1xuXG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENhcnQgYW5kIGNoZWNrc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWRkVG9DYXJ0KGl0ZW0pIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydC5wdXNoKGl0ZW0pO1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm1vZGVsLm9yZGVyQ2FydCk7XG5cbiAgICBpZiAodGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0KSB7XG4gICAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFJlYWR5LmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXJDYXJ0O1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNhcnQoaXRlbSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0ID0gdGhpcy5tb2RlbC5vcmRlckNhcnQuZmlsdGVyKGVudHJ5ID0+IGVudHJ5ICE9PSBpdGVtKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5vcmRlckNhcnQ7XG4gIH1cblxuICBjbGVhckNhcnQoKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQgPSBbXTtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydFN0YXNoID0gW107XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICB9XG5cbiAgY2xlYXJDaGVjayhpdGVtcykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGlmIChpdGVtcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1vZGVsLm9yZGVyQ2hlY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBpdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2hlY2tbaV0gPT09IGl0ZW1zW2pdKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5tb2RlbC5vcmRlckNoZWNrW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubW9kZWwub3JkZXJDaGVjayA9IHJlc3VsdDtcbiAgfVxuXG4gIHN1Ym1pdENhcnQob3B0aW9ucykge1xuICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCAwO1xuXG4gICAgaWYgKHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCkge1xuICAgICAgb3B0aW9ucyB8PSA0O1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIsXG4gICAgICBpdGVtczogdGhpcy5tb2RlbC5vcmRlckNhcnQubWFwKGVudHJ5ID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogZW50cnkuaXRlbS5vcmRlci50b2tlbixcbiAgICAgICAgICBxdWFudGl0eTogZW50cnkucXVhbnRpdHksXG4gICAgICAgICAgbW9kaWZpZXJzOiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdChjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9kaWZpZXIuZGF0YS50b2tlbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIFtdKSk7XG4gICAgICAgICAgfSwgW10pLFxuICAgICAgICAgIG5vdGU6IGVudHJ5Lm5hbWUgfHwgJydcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgICAgdGlja2V0X3Rva2VuOiBzZWxmLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgICAgc2VhdF90b2tlbjogc2VsZi5fQ2hhdE1vZGVsLmdpZnRTZWF0LFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fRHRzQXBpLndhaXRlci5wbGFjZU9yZGVyKHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuaXRlbV90b2tlbnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLml0ZW1fdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydFtpXS5yZXF1ZXN0ID0gcmVzcG9uc2UuaXRlbV90b2tlbnNbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHsgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbiB9O1xuXG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDaGVjayA9IHNlbGYubW9kZWwub3JkZXJDaGVjay5jb25jYXQoc2VsZi5tb2RlbC5vcmRlckNhcnQpO1xuICAgICAgICBzZWxmLmNsZWFyQ2FydCgpO1xuXG4gICAgICAgIHNlbGYuX0NoYXRNb2RlbC5naWZ0U2VhdCA9IG51bGw7XG5cbiAgICAgICAgbGV0IHdhdGNoZXIgPSBzZWxmLl9jcmVhdGVXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSLCByZXNwb25zZSk7XG4gICAgICAgIHJlc29sdmUod2F0Y2hlcik7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdENsb3Nlb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VULFxuICAgICAgdGlja2V0X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5wbGFjZVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLm9yZGVyVGlja2V0ID0geyB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuIH07XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdEFzc2lzdGFuY2UoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSxcbiAgICAgIHRpY2tldF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucGxhY2VSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5fc2F2ZVRpY2tldChyZXNwb25zZSk7XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFLCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQcmljZShlbnRyeSkge1xuICAgIHZhciBtb2RpZmllcnMgPSBlbnRyeS5tb2RpZmllcnMucmVkdWNlKCh0b3RhbCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgIHJldHVybiB0b3RhbCArIGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKHRvdGFsLCBtb2RpZmllcikgPT4ge1xuICAgICAgICByZXR1cm4gdG90YWwgKyAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAgICAgbW9kaWZpZXIuZGF0YS5wcmljZSA6XG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgfSwgMCk7XG4gICAgfSwgMCk7XG5cbiAgICByZXR1cm4gZW50cnkucXVhbnRpdHkgKiAobW9kaWZpZXJzICsgZW50cnkuaXRlbS5vcmRlci5wcmljZSk7XG4gIH1cblxuICBjYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpIHtcbiAgICByZXR1cm4gKGVudHJpZXMgPyBlbnRyaWVzLnJlZHVjZSgodG90YWwsIGVudHJ5KSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyBPcmRlck1hbmFnZXIucHJvdG90eXBlLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgICB9LCAwKSA6IDApO1xuICB9XG5cbiAgY2FsY3VsYXRlVGF4KGVudHJpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpICogdGhpcy5tb2RlbC50YXg7XG4gIH1cblxuICB1cGxvYWRTaWduYXR1cmUoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkudXBsb2FkLnVwbG9hZFRlbXAoZGF0YSwgJ2ltYWdlL3BuZycsICdzaWduYXR1cmUucG5nJylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRva2VuKTtcbiAgfVxuXG4gIGdlbmVyYXRlUGF5bWVudFRva2VuKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9DdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5fQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fRHRzQXBpLmN1c3RvbWVyLmluaXRpYWxpemVQYXltZW50KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuaW5pdGlhbGl6ZVBheW1lbnQoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcGF5T3JkZXIocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXF1ZXN0LnBheW1lbnRfdG9rZW4gPSB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW47XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuc3VibWl0Q2hlY2tvdXRQYXltZW50KHJlcXVlc3QpO1xuICB9XG5cbiAgcmVxdWVzdFJlY2VpcHQocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5yZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KTtcbiAgfVxuXG4gIF9zYXZlVGlja2V0KHJlc3BvbnNlKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlclRpY2tldCA9IHtcbiAgICAgIHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW5cbiAgICB9O1xuICB9XG5cbiAgX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyVGlja2V0ID0ge1xuICAgICAgdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiByZXNwb25zZS50b2tlblxuICAgIH07XG4gIH1cblxuICBfY3JlYXRlV2F0Y2hlcihraW5kLCB0aWNrZXQpIHtcbiAgICBsZXQgd2F0Y2hlciA9IG5ldyBhcHAuUmVxdWVzdFdhdGNoZXIodGlja2V0LCB0aGlzLl9EdHNBcGkpO1xuICAgIHRoaXMubW9kZWwuYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKTtcblxuICAgIHJldHVybiB3YXRjaGVyO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvc2Vzc2lvbm1hbmFnZXIuanNcblxud2luZG93LmFwcC5TZXNzaW9uTWFuYWdlciA9IGNsYXNzIFNlc3Npb25NYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoU05BUEVudmlyb25tZW50LCBBbmFseXRpY3NNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNb2RlbCwgU3VydmV5TW9kZWwsIHN0b3JhZ2VQcm92aWRlciwgTG9nZ2VyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuc2Vzc2lvbkVuZGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9PcmRlck1vZGVsID0gT3JkZXJNb2RlbDtcbiAgICB0aGlzLl9TdXJ2ZXlNb2RlbCA9IFN1cnZleU1vZGVsO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcblxuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX3NlYXRfc2Vzc2lvbicpO1xuICAgIHRoaXMuX3N0b3JlLnJlYWQoKS50aGVuKGRhdGEgPT4ge1xuICAgICAgc2VsZi5fc2Vzc2lvbiA9IGRhdGE7XG5cbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBzZWxmLl9zdGFydFNlc3Npb24oKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKGN1c3RvbWVyID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhY3VzdG9tZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zZXNzaW9uLmN1c3RvbWVyID0gY3VzdG9tZXIudG9rZW47XG4gICAgICBzZWxmLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICFzZWF0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc2Vzc2lvbi5zZWF0ID0gc2VhdC50b2tlbjtcbiAgICAgIHNlbGYuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fT3JkZXJNb2RlbC5vcmRlclRpY2tldENoYW5nZWQuYWRkKHRpY2tldCA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIXRpY2tldCB8fCAhdGlja2V0LnRva2VuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc2Vzc2lvbi50aWNrZXQgPSB0aWNrZXQudG9rZW47XG4gICAgICBzZWxmLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBzZXNzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uO1xuICB9XG5cbiAgZW5kU2Vzc2lvbigpIHtcbiAgICBpZiAoIXRoaXMuX3Nlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoYFNlYXQgc2Vzc2lvbiAke3RoaXMuX3Nlc3Npb24uaWR9IGVuZGVkLmApO1xuXG4gICAgdmFyIHMgPSB0aGlzLl9zZXNzaW9uO1xuICAgIHMuZW5kZWQgPSBuZXcgRGF0ZSgpO1xuXG4gICAgdGhpcy5fc2Vzc2lvbiA9IG51bGw7XG4gICAgdGhpcy5fc3RvcmUuY2xlYXIoKTtcblxuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsLmxvZ1Nlc3Npb24ocyk7XG5cbiAgICB0aGlzLnNlc3Npb25FbmRlZC5kaXNwYXRjaChzKTtcbiAgfVxuXG4gIGdldCBndWVzdENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uLmd1ZXN0X2NvdW50IHx8IDE7XG4gIH1cblxuICBzZXQgZ3Vlc3RDb3VudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9zZXNzaW9uLmd1ZXN0X2NvdW50ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Nlc3Npb24uZ3Vlc3RfY291bnQgPSB2YWx1ZTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIGdldCBzcGVjaWFsRXZlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb24uc3BlY2lhbF9ldmVudDtcbiAgfVxuXG4gIHNldCBzcGVjaWFsRXZlbnQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5zcGVjaWFsX2V2ZW50ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Nlc3Npb24uc3BlY2lhbF9ldmVudCA9IHZhbHVlO1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICB9XG5cbiAgX3N0YXJ0U2Vzc2lvbigpIHtcbiAgICBsZXQgc2VhdCA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdDtcblxuICAgIHRoaXMuX3Nlc3Npb24gPSB7XG4gICAgICBpZDogdGhpcy5fZ2VuZXJhdGVJRCgpLFxuICAgICAgc2VhdDogc2VhdCA/IHNlYXQudG9rZW4gOiB1bmRlZmluZWQsXG4gICAgICBwbGF0Zm9ybTogdGhpcy5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtLFxuICAgICAgc3RhcnRlZDogbmV3IERhdGUoKVxuICAgIH07XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoYFNlYXQgc2Vzc2lvbiAke3RoaXMuX3Nlc3Npb24uaWR9IHN0YXJ0ZWQuYCk7XG5cbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB0aGlzLnNlc3Npb25TdGFydGVkLmRpc3BhdGNoKHRoaXMuX3Nlc3Npb24pO1xuICB9XG5cbiAgX2dlbmVyYXRlSUQoKXtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3NoZWxsbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTWFuYWdlciA9IGNsYXNzIFNoZWxsTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCRzY2UsIERhdGFQcm92aWRlciwgU2hlbGxNb2RlbCwgQ29uZmlnLCBFbnZpcm9ubWVudCwgSG9zdHMpIHtcbiAgICB0aGlzLiQkc2NlID0gJHNjZTtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fU2hlbGxNb2RlbCA9IFNoZWxsTW9kZWw7XG4gICAgdGhpcy5fQ29uZmlnID0gQ29uZmlnO1xuICAgIHRoaXMuX0Vudmlyb25tZW50ID0gRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fSG9zdHMgPSBIb3N0cztcblxuICAgIHRoaXMubG9jYWxlID0gQ29uZmlnLmxvY2FsZTtcbiAgfVxuXG4gIGdldCBsb2NhbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgfVxuXG4gIHNldCBsb2NhbGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fbG9jYWxlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9sb2NhbGUgPSB2YWx1ZTtcblxuICAgIHZhciBmb3JtYXQgPSAnezB9JyxcbiAgICAgICAgY3VycmVuY3kgPSAnJztcblxuICAgIHN3aXRjaCAodGhpcy5fbG9jYWxlKSB7XG4gICAgICBjYXNlICdyb19NRCc6XG4gICAgICAgIGZvcm1hdCA9ICd7MH0gTGVpJztcbiAgICAgICAgY3VycmVuY3kgPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd6aF9NTyc6XG4gICAgICAgIGZvcm1hdCA9ICdNT1AkIHswfSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW5fVVMnOlxuICAgICAgICBmb3JtYXQgPSAnJHswfSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJ1VTRCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX1NoZWxsTW9kZWwucHJpY2VGb3JtYXQgPSBmb3JtYXQ7XG4gICAgdGhpcy5fU2hlbGxNb2RlbC5jdXJyZW5jeSA9IGN1cnJlbmN5O1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIuYmFja2dyb3VuZHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLmJhY2tncm91bmRzID0gcmVzcG9uc2UubWFpbi5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uc3JjXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5zY3JlZW5zYXZlcnMgPSByZXNwb25zZS5zY3JlZW5zYXZlci5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uc3JjXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5wYWdlQmFja2dyb3VuZHMgPSByZXNwb25zZS5wYWdlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uYmFja2dyb3VuZC5zcmMsXG4gICAgICAgICAgZGVzdGluYXRpb246IGl0ZW0uZGVzdGluYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLmVsZW1lbnRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgdmFyIGxheW91dCA9IHNlbGYuX0NvbmZpZy50aGVtZS5sYXlvdXQ7XG5cbiAgICAgIHZhciBlbGVtZW50cyA9IHt9O1xuXG4gICAgICBzd2l0Y2ggKGxheW91dCkge1xuICAgICAgICBjYXNlICdjbGFzc2ljJzpcbiAgICAgICAgICBlbGVtZW50cyA9IHtcbiAgICAgICAgICAgICdidXR0b25faG9tZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24taG9tZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fYmFjayc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYmFjay5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2FydCc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tY2FydC5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fcm90YXRlJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1yb3RhdGUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3dhaXRlcic6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYXNzaXN0YW5jZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2hlY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNsb3Nlb3V0LnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9zdXJ2ZXknOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLXN1cnZleS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2hhdCc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tY2hhdC5wbmcnKVxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dhbGF4aWVzJzpcbiAgICAgICAgICBlbGVtZW50cyA9IHtcbiAgICAgICAgICAgICdidXR0b25fYmFjayc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYmFjay5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fcm90YXRlJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1yb3RhdGUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3NldHRpbmdzJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1zZXR0aW5ncy5wbmcnKSxcbiAgICAgICAgICAgICdsb2NhdGlvbl9sb2dvJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1sb2dvLnBuZycpLFxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSByZXNwb25zZS5lbGVtZW50c1tpXTtcbiAgICAgICAgZWxlbWVudHNbZWxlbWVudC5zbG90XSA9IGVsZW1lbnQuc3JjO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gICAgfSk7XG4gIH1cblxuICBmb3JtYXRQcmljZShwcmljZSkge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsLnByaWNlRm9ybWF0LnJlcGxhY2UoL3soXFxkKyl9L2csICgpID0+IHByaWNlLnRvRml4ZWQoMikpO1xuICB9XG5cbiAgZ2V0UGFnZUJhY2tncm91bmRzKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX1NoZWxsTW9kZWwucGFnZUJhY2tncm91bmRzLmZpbHRlcihpdGVtID0+IHtcbiAgICAgIHJldHVybiBpdGVtLmRlc3RpbmF0aW9uLnR5cGUgPT09IGxvY2F0aW9uLnR5cGUgJiZcbiAgICAgICAgKGl0ZW0uZGVzdGluYXRpb24udG9rZW4gPT09IGxvY2F0aW9uLnRva2VuICYmIGxvY2F0aW9uLnRva2VuIHx8XG4gICAgICAgICBpdGVtLmRlc3RpbmF0aW9uLnVybCA9PT0gbG9jYXRpb24udXJsICYmIGxvY2F0aW9uLnVybCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRBcHBVcmwodXJsKSB7XG4gICAgdmFyIGhvc3QgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICtcbiAgICAgICh3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHdpbmRvdy5sb2NhdGlvbi5wb3J0OiAnJyk7XG4gICAgcmV0dXJuIGhvc3QgKyB1cmw7XG4gIH1cblxuICBnZXRBc3NldFVybChmaWxlKSB7XG4gICAgdmFyIHBhdGggPSB0aGlzLl9nZXRQYXRoKHRoaXMuX0hvc3RzLnN0YXRpYyk7XG5cbiAgICByZXR1cm4gdGhpcy4kJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoYCR7cGF0aH1hc3NldHMvJHt0aGlzLl9Db25maWcudGhlbWUubGF5b3V0fS8ke2ZpbGV9YCk7XG4gIH1cblxuICBnZXRQYXJ0aWFsVXJsKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBc3NldFVybChgcGFydGlhbHMvJHtuYW1lfS5odG1sYCk7XG4gIH1cblxuICBnZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSB7XG4gICAgaWYgKCFtZWRpYSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHBhdGggPSB0aGlzLl9nZXRQYXRoKHRoaXMuX0hvc3RzLm1lZGlhKTtcblxuICAgIGlmICh0eXBlb2YgbWVkaWEgPT09ICdzdHJpbmcnIHx8IG1lZGlhIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICBpZiAobWVkaWEuc3Vic3RyaW5nKDAsIDQpICE9PSAnaHR0cCcgJiYgbWVkaWEuc3Vic3RyaW5nKDAsIDIpICE9PSAnLy8nKSB7XG4gICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbiB8fCAnanBnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAke3BhdGh9bWVkaWEvJHttZWRpYX1fJHt3aWR0aH1fJHtoZWlnaHR9LiR7ZXh0ZW5zaW9ufWApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWVkaWE7XG4gICAgfVxuXG4gICAgaWYgKCFtZWRpYS50b2tlbikge1xuICAgICAgcmV0dXJuIG1lZGlhO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gdGhpcy5nZXRNZWRpYVR5cGUobWVkaWEpO1xuICAgIHZhciB1cmwgPSBgJHtwYXRofW1lZGlhLyR7bWVkaWEudG9rZW59YDtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgIHVybCArPSAnLndlYm0nO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnZmxhc2gnKSB7XG4gICAgICB1cmwgKz0gJy5zd2YnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAnaW1hZ2UnKSB7XG4gICAgICBpZiAod2lkdGggJiYgaGVpZ2h0KSB7XG4gICAgICAgIHVybCArPSAnXycgKyB3aWR0aCArICdfJyArIGhlaWdodDtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgICB1cmwgKz0gJy4nICsgZXh0ZW5zaW9uO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICghbWVkaWEgfHwgIW1lZGlhLm1pbWVfdHlwZSkge1xuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgICAgICBjYXNlICdpbWFnZS9wbmcnOlxuICAgICAgICAgICAgdXJsICs9ICcucG5nJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB1cmwgKz0gJy5qcGcnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy4kJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwodXJsKTtcbiAgfVxuXG4gIGdldE1lZGlhVHlwZShtZWRpYSkge1xuICAgIGlmICghbWVkaWEgfHwgIW1lZGlhLm1pbWVfdHlwZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAobWVkaWEubWltZV90eXBlLnN1YnN0cmluZygwLCA1KSA9PT0gJ2ltYWdlJyl7XG4gICAgICByZXR1cm4gJ2ltYWdlJztcbiAgICB9XG4gICAgZWxzZSBpZiAobWVkaWEubWltZV90eXBlLnN1YnN0cmluZygwLCA1KSA9PT0gJ3ZpZGVvJykge1xuICAgICAgcmV0dXJuICd2aWRlbyc7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lZGlhLm1pbWVfdHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJykge1xuICAgICAgcmV0dXJuICdmbGFzaCc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCB0aWxlU3R5bGUoKSB7XG4gICAgdmFyIHN0eWxlID0gJ3RpbGUnO1xuXG4gICAgc3dpdGNoICh0aGlzLl9Db25maWcudGhlbWUudGlsZXNfc3R5bGUpIHtcbiAgICAgIGNhc2UgJ3JlZ3VsYXInOlxuICAgICAgICBzdHlsZSArPSAnIHRpbGUtcmVndWxhcic7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvL3N0eWxlICs9ICcgdGlsZS1yZWd1bGFyJztcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cblxuICBnZXQgcHJlZGljYXRlRXZlbigpIHtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHJldHVybiAoKSA9PiBpbmRleCsrICUgMiA9PT0gMTtcbiAgfVxuXG4gIGdldCBwcmVkaWNhdGVPZGQoKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICByZXR1cm4gKCkgPT4gaW5kZXgrKyAlIDIgPT09IDA7XG4gIH1cblxuICBfZ2V0UGF0aChyZXMpIHtcbiAgICB2YXIgcGF0aCA9ICcnO1xuXG4gICAgaWYgKHJlcy5wcm90b2NvbCkge1xuICAgICAgcGF0aCArPSBgJHtyZXMucHJvZm9jb2x9Oi8vYDtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzLnNlY3VyZSkge1xuICAgICAgcGF0aCArPSBgaHR0cHM6Ly9gO1xuICAgIH1cbiAgICBlbHNlIGlmIChyZXMuc2VjdXJlID09PSBmYWxzZSkge1xuICAgICAgcGF0aCArPSBgaHR0cDovL2A7XG4gICAgfVxuXG4gICAgaWYgKHJlcy5ob3N0KSB7XG4gICAgICBpZiAoIXJlcy5wcm90b2NvbCkge1xuICAgICAgICBwYXRoICs9ICcvLyc7XG4gICAgICB9XG4gICAgICBwYXRoICs9IHJlcy5ob3N0O1xuICAgIH1cblxuICAgIGlmIChyZXMucGF0aCkge1xuICAgICAgcGF0aCArPSByZXMucGF0aDtcbiAgICB9XG5cbiAgICBpZiAocGF0aC5sZW5ndGggPiAwICYmICFwYXRoLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgIHBhdGggKz0gJy8nO1xuICAgIH1cblxuICAgIHJldHVybiBwYXRoO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvc29jaWFsbWFuYWdlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLyogZ2xvYmFsIFVSSSAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2NpYWxNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvY2lhbE1hbmFnZXIgPSBmdW5jdGlvbihTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9XZWJCcm93c2VyID0gV2ViQnJvd3NlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH07XG5cbiAgd2luZG93LmFwcC5Tb2NpYWxNYW5hZ2VyID0gU29jaWFsTWFuYWdlcjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIExvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5sb2dpbkZhY2Vib29rID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmYWNlYm9va0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5mYWNlYm9va19hcHBsaWNhdGlvbixcbiAgICAgICAgY3VzdG9tZXJBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuY3VzdG9tZXJfYXBwbGljYXRpb247XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBGYWNlYm9vazogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBmYWNlYm9va0F1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGZhY2Vib29rQXV0aC5lcnJvciB8fCAhZmFjZWJvb2tBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayBlcnJvcjogJyArIGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBGYWNlYm9vayh7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyBjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBGYWNlYm9vay4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2RpYWxvZy9vYXV0aCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2NsaWVudF9pZCcsIGZhY2Vib29rQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ3Rva2VuJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc2NvcGUnLCAncHVibGljX3Byb2ZpbGUsZW1haWwnKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Hb29nbGVQbHVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBnb29nbGVwbHVzQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50Lmdvb2dsZXBsdXNfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHN0YXRlID0gc2VsZi5fZ2VuZXJhdGVUb2tlbigpO1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBHb29nbGU6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZihnb29nbGVwbHVzQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZ29vZ2xlcGx1c0F1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoZ29vZ2xlcGx1c0F1dGguZXJyb3IgfHwgIWdvb2dsZXBsdXNBdXRoLmNvZGUgfHwgZ29vZ2xlcGx1c0F1dGguc3RhdGUgIT09IHN0YXRlKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayBlcnJvcjogJyArIGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZ29vZ2xlcGx1c0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGNhbGxiYWNrIHJlY2VpdmVkLicpO1xuXG4gICAgICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcEdvb2dsZVBsdXMoe1xuICAgICAgICAgICAgY29kZTogZ29vZ2xlcGx1c0F1dGguY29kZSxcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbih0aWNrZXQpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBsb2dpbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgIHJlc29sdmUoY3VzdG9tZXJBdXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLmFkZChvbk5hdmlnYXRlZCk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9nZ2luZyBpbiB3aXRoIEdvb2dsZS4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBnb29nbGVwbHVzQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Jlc3BvbnNlX3R5cGUnLCAnY29kZScpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvcGx1cy5sb2dpbiBlbWFpbCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2FjY2Vzc190eXBlJywgJ29mZmxpbmUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzdGF0ZScsIHN0YXRlKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Ud2l0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0d2l0dGVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LnR3aXR0ZXJfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHRva2VuU2VjcmV0O1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBUd2l0dGVyOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKHR3aXR0ZXJBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciB0d2l0dGVyQXV0aCA9IFVSSSh1cmwpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmICh0d2l0dGVyQXV0aC5lcnJvciB8fCAhdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayBlcnJvcjogJyArIHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QodHdpdHRlckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBUd2l0dGVyKHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbjogdHdpdHRlckF1dGgub2F1dGhfdG9rZW4sXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3NlY3JldDogdG9rZW5TZWNyZXQsXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3ZlcmlmaWVyOiB0d2l0dGVyQXV0aC5vYXV0aF92ZXJpZmllclxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgc2lnbmluIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VsZi5fRHRzQXBpLm9hdXRoMi5nZXRBdXRoQ29uZmlybVVybCh0aWNrZXQudGlja2V0X2lkLCB7XG4gICAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgICByZXNwb25zZV90eXBlOiAndG9rZW4nLFxuICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodXJsLmluZGV4T2YoY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBjdXN0b21lckF1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGN1c3RvbWVyQXV0aC5lcnJvciB8fCAhY3VzdG9tZXJBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBUd2l0dGVyLicpO1xuXG4gICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlclJlcXVlc3RUb2tlbih7XG4gICAgICAgIG9hdXRoX2NhbGxiYWNrOiB0d2l0dGVyQXBwLnJlZGlyZWN0X3VybFxuICAgICAgfSkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICB2YXIgdXJsID0gVVJJKCdodHRwczovL2FwaS50d2l0dGVyLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdvYXV0aF90b2tlbicsIHRva2VuLm9hdXRoX3Rva2VuKVxuICAgICAgICAuYWRkU2VhcmNoKCdmb3JjZV9sb2dpbicsICd0cnVlJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHJlcXVlc3QgdG9rZW4gcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgdG9rZW5TZWNyZXQgPSB0b2tlbi5vYXV0aF90b2tlbl9zZWNyZXQ7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEhlbHBlcnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLl9nZW5lcmF0ZVRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH07XG5cbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9zb2Z0d2FyZW1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2Z0d2FyZU1hbmFnZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgU29mdHdhcmVNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29mdHdhcmVNYW5hZ2VyID0gU29mdHdhcmVNYW5hZ2VyO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAnY3VycmVudFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXR0ZXJuID0gLyhTTkFQKVxcLyhbMC05Ll0rKS8sXG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuICc4LjguOC44JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICdyZXF1aXJlZFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucmVxdWlyZW1lbnRzW3RoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybV07XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ3VwZGF0ZVJlcXVpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmVyc2lvbkNvbXBhcmUodGhpcy5jdXJyZW50VmVyc2lvbiwgdGhpcy5yZXF1aXJlZFZlcnNpb24pID09PSAtMTtcbiAgICB9XG4gIH0pO1xuXG4gIFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUuX3ZlcnNpb25Db21wYXJlID0gZnVuY3Rpb24odjEsIHYyLCBvcHRpb25zKSB7XG4gICAgaWYgKCF2MSB8fCAhdjIpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBsZXhpY29ncmFwaGljYWwgPSBvcHRpb25zICYmIG9wdGlvbnMubGV4aWNvZ3JhcGhpY2FsLFxuICAgICAgICB6ZXJvRXh0ZW5kID0gb3B0aW9ucyAmJiBvcHRpb25zLnplcm9FeHRlbmQsXG4gICAgICAgIHYxcGFydHMgPSB2MS5zcGxpdCgnLicpLFxuICAgICAgICB2MnBhcnRzID0gdjIuc3BsaXQoJy4nKTtcblxuICAgIGZ1bmN0aW9uIGlzVmFsaWRQYXJ0KHgpIHtcbiAgICAgIHJldHVybiAobGV4aWNvZ3JhcGhpY2FsID8gL15cXGQrW0EtWmEtel0qJC8gOiAvXlxcZCskLykudGVzdCh4KTtcbiAgICB9XG5cbiAgICBpZiAoIXYxcGFydHMuZXZlcnkoaXNWYWxpZFBhcnQpIHx8ICF2MnBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSkge1xuICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG5cbiAgICBpZiAoemVyb0V4dGVuZCkge1xuICAgICAgd2hpbGUgKHYxcGFydHMubGVuZ3RoIDwgdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjFwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodjJwYXJ0cy5sZW5ndGggPCB2MXBhcnRzLmxlbmd0aCkge1xuICAgICAgICB2MnBhcnRzLnB1c2goJzAnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWxleGljb2dyYXBoaWNhbCkge1xuICAgICAgdjFwYXJ0cyA9IHYxcGFydHMubWFwKE51bWJlcik7XG4gICAgICB2MnBhcnRzID0gdjJwYXJ0cy5tYXAoTnVtYmVyKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHYxcGFydHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh2MnBhcnRzLmxlbmd0aCA9PT0gaSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKHYxcGFydHNbaV0gPT09IHYycGFydHNbaV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2MXBhcnRzW2ldID4gdjJwYXJ0c1tpXSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHYxcGFydHMubGVuZ3RoICE9PSB2MnBhcnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3N1cnZleW1hbmFnZXIuanNcblxud2luZG93LmFwcC5TdXJ2ZXlNYW5hZ2VyID0gY2xhc3MgU3VydmV5TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKERhdGFQcm92aWRlciwgU3VydmV5TW9kZWwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fU3VydmV5TW9kZWwgPSBTdXJ2ZXlNb2RlbDtcblxuICAgIGlmICh0aGlzLl9TdXJ2ZXlNb2RlbC5pc0VuYWJsZWQpIHtcbiAgICAgIHRoaXMuX0RhdGFQcm92aWRlci5zdXJ2ZXlzKCkudGhlbihkYXRhID0+IHtcbiAgICAgICAgc2VsZi5fU3VydmV5TW9kZWwuZmVlZGJhY2tTdXJ2ZXkgPSBkYXRhLnN1cnZleXNbMF07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX1N1cnZleU1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoc2VsZi5fU3VydmV5TW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICAgIHNlbGYuX1N1cnZleU1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGUgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvYWJzdHJhY3Rtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkFic3RyYWN0TW9kZWwgPSBjbGFzcyBBYnN0cmFjdE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9zdG9yYWdlUHJvdmlkZXIgPSBzdG9yYWdlUHJvdmlkZXI7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IHt9O1xuICB9XG5cbiAgX2RlZmluZVByb3BlcnR5KG5hbWUsIHN0b3JlTmFtZSwgZGVmYXVsdFZhbHVlLCBwcm92aWRlckZ1bmN0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBwcm9wZXJ0eSA9IHRoaXMuX3Byb3BlcnRpZXNbbmFtZV0gPSB7IG5hbWU6ICdfJyArIG5hbWUgfTtcblxuICAgIGlmIChzdG9yZU5hbWUpIHtcbiAgICAgIHByb3BlcnR5LnN0b3JlID0gdGhpcy5fc3RvcmFnZVByb3ZpZGVyKHN0b3JlTmFtZSk7XG4gICAgfVxuXG4gICAgaWYgKHByb3ZpZGVyRnVuY3Rpb24pIHtcbiAgICAgIHByb3BlcnR5LnByb3ZpZGVyID0gcHJvdmlkZXJGdW5jdGlvbjtcbiAgICB9XG5cbiAgICB0aGlzW25hbWUgKyAnQ2hhbmdlZCddID0gcHJvcGVydHkuc2lnbmFsID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHNlbGZbcHJvcGVydHkubmFtZV0gfHwgZGVmYXVsdFZhbHVlO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBzZWxmW3Byb3BlcnR5Lm5hbWVdKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZltwcm9wZXJ0eS5uYW1lXSA9IHZhbHVlO1xuXG4gICAgICAgIGlmIChwcm9wZXJ0eS5zdG9yZSkge1xuICAgICAgICAgIHByb3BlcnR5LnN0b3JlLndyaXRlKHZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHByb3BlcnR5LnNpZ25hbC5kaXNwYXRjaCh2YWx1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9pbml0UHJvcGVydHkobmFtZSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW25hbWVdO1xuXG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtuYW1lfScgbm90IGZvdW5kLmApO1xuICAgIH1cblxuICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtuYW1lfScgaXMgYWxyZWFkeSBpbml0aWFsaXplZC5gKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3BlcnR5LnN0b3JlKSB7XG4gICAgICBwcm9wZXJ0eS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3BlcnR5LnN0b3JlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHByb3BlcnR5LmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIHNlbGZbcHJvcGVydHkubmFtZV0gPSB2YWx1ZTtcbiAgICAgIHByb3BlcnR5LnNpZ25hbC5kaXNwYXRjaCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3Qua2V5cyh0aGlzLl9wcm9wZXJ0aWVzKVxuICAgICAgLmZpbHRlcihrZXkgPT4gIXRoaXMuX3Byb3BlcnRpZXNba2V5XS5pbml0aWFsaXplZClcbiAgICAgIC5tYXAoa2V5ID0+IHRoaXMuX2luaXRQcm9wZXJ0eShrZXkpKSk7XG4gIH1cblxuICBmZXRjaChwcm9wZXJ0eU5hbWUpIHtcbiAgICB2YXIgcHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG5cbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICcke3Byb3BlcnR5TmFtZX0nIG5vdCBmb3VuZC5gKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb3BlcnR5LnByb3ZpZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICcke3Byb3BlcnR5TmFtZX0nIGhhcyBubyBwcm92aWRlci5gKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHByb3BlcnR5LnByb3ZpZGVyKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGZldGNoQWxsKCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChPYmplY3Qua2V5cyh0aGlzLl9wcm9wZXJ0aWVzKVxuICAgICAgLmZpbHRlcihrZXkgPT4gdGhpcy5fcHJvcGVydGllc1trZXldLnByb3ZpZGVyKVxuICAgICAgLm1hcChrZXkgPT4gdGhpcy5mZXRjaChrZXkpKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcylcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMuX3Byb3BlcnRpZXNba2V5XS5zdG9yZSlcbiAgICAgIC5tYXAoa2V5ID0+IHRoaXMuX3Byb3BlcnRpZXNba2V5XS5zdG9yZS5jbGVhcigpKSk7XG4gIH1cblxuICBfcHJvcGVydHlDaGFuZ2VkKG5hbWUpIHtcbiAgICB2YXIgcHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW25hbWVdO1xuXG4gICAgcHJvcGVydHkuc2lnbmFsLmRpc3BhdGNoKHRoaXNbcHJvcGVydHkubmFtZV0pO1xuXG4gICAgaWYgKHByb3BlcnR5LnN0b3JlKSB7XG4gICAgICBwcm9wZXJ0eS5zdG9yZS53cml0ZSh0aGlzW3Byb3BlcnR5Lm5hbWVdKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9hbmFseXRpY3Ntb2RlbC5qc1xuXG53aW5kb3cuYXBwLkFuYWx5dGljc01vZGVsID0gY2xhc3MgQW5hbHl0aWNzTW9kZWwge1xuICBjb25zdHJ1Y3RvcihzdG9yYWdlUHJvdmlkZXIsIGhlYXRtYXApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZGF0YSA9IFtcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnc2Vzc2lvbnMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdhZHZlcnRpc2VtZW50cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2Fuc3dlcnMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjaGF0cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NvbW1lbnRzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY2xpY2tzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgncGFnZXMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCd1cmxzJywgc3RvcmFnZVByb3ZpZGVyKVxuICAgIF0ucmVkdWNlKChyZXN1bHQsIGl0ZW0pID0+IHtcbiAgICAgIHJlc3VsdFtpdGVtLm5hbWVdID0gaXRlbTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgaGVhdG1hcC5jbGlja2VkLmFkZChjbGljayA9PiB7XG4gICAgICBzZWxmLl9sb2dDbGljayhjbGljayk7XG4gICAgfSk7XG4gIH1cblxuICBsb2dTZXNzaW9uKHNlc3Npb24pIHtcbiAgICB0aGlzLl9kYXRhLnNlc3Npb25zLnB1c2goc2Vzc2lvbik7XG4gIH1cblxuICBnZXQgc2Vzc2lvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuc2Vzc2lvbnM7XG4gIH1cblxuICBsb2dOYXZpZ2F0aW9uKGRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy5fZGF0YS5wYWdlcy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICB9KTtcblxuICAgIHRoaXMuX2RhdGEuY2xpY2tzLnN0b3JlKCk7XG4gIH1cblxuICBnZXQgcGFnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucGFnZXM7XG4gIH1cblxuICBsb2dBZHZlcnRpc2VtZW50KGFkdmVydGlzZW1lbnQpIHtcbiAgICB0aGlzLl9kYXRhLmFkdmVydGlzZW1lbnRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGFkdmVydGlzZW1lbnQ6IGFkdmVydGlzZW1lbnRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBhZHZlcnRpc2VtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5hZHZlcnRpc2VtZW50cztcbiAgfVxuXG4gIGxvZ0Fuc3dlcihhbnN3ZXIpIHtcbiAgICB0aGlzLl9kYXRhLmFuc3dlcnMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgYW5zd2VyOiBhbnN3ZXJcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBhbnN3ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmFuc3dlcnM7XG4gIH1cblxuICBsb2dDaGF0KGNoYXQpIHtcbiAgICB0aGlzLl9kYXRhLmNoYXRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNoYXQ6IGNoYXRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBjaGF0cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jaGF0cztcbiAgfVxuXG4gIGxvZ0NvbW1lbnQoY29tbWVudCkge1xuICAgIHRoaXMuX2RhdGEuY29tbWVudHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgY29tbWVudDogY29tbWVudFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGNvbW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmNvbW1lbnRzO1xuICB9XG5cbiAgbG9nVXJsKHVybCkge1xuICAgIHRoaXMuX2RhdGEudXJscy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICB1cmw6IHVybFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHVybHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXJscztcbiAgfVxuXG4gIGdldCBjbGlja3MoKSB7XG4gICAgdGhpcy5fZGF0YS5jbGlja3Muc3RvcmUoKTtcblxuICAgIHJldHVybiB0aGlzLl9kYXRhLmNsaWNrcztcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGZvciAodmFyIGsgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrXS5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIF9sb2dDbGljayhjbGljaykge1xuICAgIGNsaWNrLnRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuX2RhdGEuY2xpY2tzLmRhdGEucHVzaChjbGljayk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9jYXJ0bW9kZWwuanNcblxud2luZG93LmFwcC5DYXJ0TW9kZWwgPSBjbGFzcyBDYXJ0TW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLlNUQVRFX0NBUlQgPSAnY2FydCc7XG4gICAgdGhpcy5TVEFURV9ISVNUT1JZID0gJ2hpc3RvcnknO1xuXG4gICAgdGhpcy5faXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuaXNDYXJ0T3BlbkNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jYXJ0U3RhdGUgPSB0aGlzLlNUQVRFX0NBUlQ7XG4gICAgdGhpcy5jYXJ0U3RhdGVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gbnVsbDtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGdldCBpc0NhcnRPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0NhcnRPcGVuO1xuICB9XG5cbiAgc2V0IGlzQ2FydE9wZW4odmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNDYXJ0T3BlbiA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNDYXJ0T3BlbiA9IHZhbHVlO1xuICAgIHRoaXMuaXNDYXJ0T3BlbkNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGNhcnRTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FydFN0YXRlO1xuICB9XG5cbiAgc2V0IGNhcnRTdGF0ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9jYXJ0U3RhdGUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2NhcnRTdGF0ZSA9IHZhbHVlO1xuICAgIHRoaXMuY2FydFN0YXRlQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgZWRpdGFibGVJdGVtKCkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0YWJsZUl0ZW07XG4gIH1cblxuICBnZXQgZWRpdGFibGVJdGVtTmV3KCkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0YWJsZUl0ZW1OZXc7XG4gIH1cblxuICBvcGVuRWRpdG9yKGl0ZW0sIGlzTmV3KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRhYmxlSXRlbSA9PT0gaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW1OZXcgPSBpc05ldyB8fCBmYWxzZTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBpdGVtO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZC5kaXNwYXRjaChpdGVtKTtcbiAgfVxuXG4gIGNsb3NlRWRpdG9yKCkge1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbU5ldyA9IGZhbHNlO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IG51bGw7XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmRpc3BhdGNoKG51bGwpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvY2hhdG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ2hhdE1vZGVsID0gY2xhc3MgQ2hhdE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jaGF0X3ByZWZlcmVuY2VzJyk7XG4gICAgdGhpcy5faGlzdG9yeVN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2NoYXRfaGlzdG9yeScpO1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmlzRW5hYmxlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmlzUHJlc2VudENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuYWN0aXZlRGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY2hhdFJlcXVlc3RSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5oaXN0b3J5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubWVzc2FnZVJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgXG4gICAgdGhpcy5naWZ0UmVxdWVzdFJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5naWZ0QWNjZXB0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2dpZnRTZWF0ID0gbnVsbDtcbiAgICB0aGlzLmdpZnRTZWF0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fZ2lmdERldmljZSA9IG51bGw7XG4gICAgdGhpcy5naWZ0RGV2aWNlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5naWZ0UmVhZHkgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmdpZnRBY2NlcHRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5faXNFbmFibGVkID0gU05BUExvY2F0aW9uLmNoYXQ7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzID0gW107XG4gICAgdGhpcy5fbGFzdFJlYWRzID0ge307XG5cbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLnJlYWQoKS50aGVuKHByZWZzID0+IHtcbiAgICAgIGlmICghcHJlZnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9pc0VuYWJsZWQgPSBCb29sZWFuKHByZWZzLmlzX2VuYWJsZWQpO1xuXG4gICAgICBzZWxmLl9hY3RpdmVEZXZpY2VzID0gcHJlZnMuYWN0aXZlX2RldmljZXMgfHwgW107XG4gICAgICBzZWxmLl9wZW5kaW5nRGV2aWNlcyA9IHByZWZzLnBlbmRpbmdfZGV2aWNlcyB8fCBbXTtcbiAgICAgIHNlbGYuX2xhc3RSZWFkcyA9IHByZWZzLmxhc3RfcmVhZHMgfHwge307XG4gICAgfSk7XG5cbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUucmVhZCgpLnRoZW4oaGlzdG9yeSA9PiB7XG4gICAgICBzZWxmLl9oaXN0b3J5ID0gaGlzdG9yeSB8fCBbXTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBzZXQgaXNDb25uZWN0ZWQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNDb25uZWN0ZWQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9pc0Nvbm5lY3RlZCk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0VuYWJsZWQ7XG4gIH1cblxuICBzZXQgaXNFbmFibGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzRW5hYmxlZCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzRW5hYmxlZENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNFbmFibGVkKTtcblxuICAgIHRoaXMuX3VwZGF0ZVByZWZlcmVuY2VzKCk7XG4gIH1cblxuICBnZXQgaXNQcmVzZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9pc1ByZXNlbnQ7XG4gIH1cblxuICBzZXQgaXNQcmVzZW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzUHJlc2VudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1ByZXNlbnQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzUHJlc2VudENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNQcmVzZW50KTtcbiAgfVxuXG4gIGdldCBnaWZ0RGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLl9naWZ0RGV2aWNlO1xuICB9XG5cbiAgc2V0IGdpZnREZXZpY2UodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZ2lmdERldmljZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9naWZ0RGV2aWNlID0gdmFsdWU7XG4gICAgdGhpcy5naWZ0RGV2aWNlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9naWZ0RGV2aWNlKTtcbiAgfVxuXG4gIGdldCBnaWZ0U2VhdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2lmdFNlYXQ7XG4gIH1cblxuICBzZXQgZ2lmdFNlYXQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZ2lmdFNlYXQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZ2lmdFNlYXQgPSB2YWx1ZTtcbiAgICB0aGlzLmdpZnRTZWF0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9naWZ0U2VhdCk7XG4gIH1cblxuICBnZXQgcGVuZGluZ0RldmljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgc2V0IHBlbmRpbmdEZXZpY2VzKHZhbHVlKSB7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLnBlbmRpbmdEZXZpY2VzKTtcbiAgfVxuXG4gIGdldCBhY3RpdmVEZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgc2V0IGFjdGl2ZURldmljZXModmFsdWUpIHtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLmFjdGl2ZURldmljZXMpO1xuICB9XG5cbiAgaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpICE9PSAtMTtcbiAgfVxuXG4gIGlzUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpICE9PSAtMTtcbiAgfVxuXG4gIGFkZEFjdGl2ZURldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzLnB1c2goZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzID0gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIGFkZFBlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMucHVzaChkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzID0gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICByZW1vdmVBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5hY3RpdmVEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlcyA9IHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICByZW1vdmVQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMucGVuZGluZ0RldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMucGVuZGluZ0RldmljZXMgPSB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIGdldCBoaXN0b3J5KCkge1xuICAgIHJldHVybiB0aGlzLl9oaXN0b3J5O1xuICB9XG5cbiAgc2V0IGhpc3RvcnkodmFsdWUpIHtcbiAgICB0aGlzLl9oaXN0b3J5ID0gdmFsdWUgfHwgW107XG5cbiAgICB0aGlzLmhpc3RvcnlDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2hpc3RvcnkpO1xuICAgIHRoaXMuX3VwZGF0ZUhpc3RvcnkoKTtcbiAgfVxuXG4gIGFkZEhpc3RvcnkobWVzc2FnZSkge1xuICAgIHRoaXMuX2hpc3RvcnkucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLl9oaXN0b3J5O1xuICB9XG5cbiAgZ2V0TGFzdFJlYWQoZGV2aWNlKSB7XG4gICAgbGV0IHRva2VuID0gZGV2aWNlLnRva2VuIHx8IGRldmljZTtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFJlYWRzW3Rva2VuXSB8fCBudWxsO1xuICB9XG5cbiAgc2V0TGFzdFJlYWQoZGV2aWNlLCB2YWx1ZSkge1xuICAgIGxldCB0b2tlbiA9IGRldmljZS50b2tlbiB8fCBkZXZpY2U7XG4gICAgdGhpcy5fbGFzdFJlYWRzW3Rva2VuXSA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVByZWZlcmVuY2VzKCk7XG4gIH1cblxuICBzYXZlKCkge1xuICAgIHRoaXMuX3VwZGF0ZUhpc3RvcnkoKTtcbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0aGlzLl9pc0VuYWJsZWQgPSB0aGlzLl9pc1ByZXNlbnQgPSBmYWxzZTtcbiAgICB0aGlzLl9oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gW107XG5cbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUuY2xlYXIoKTtcbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLmNsZWFyKCk7XG4gIH1cblxuICBfdXBkYXRlSGlzdG9yeSgpIHtcbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUud3JpdGUodGhpcy5oaXN0b3J5KTtcbiAgfVxuXG4gIF91cGRhdGVQcmVmZXJlbmNlcygpIHtcbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLndyaXRlKHtcbiAgICAgIGlzX2VuYWJsZWQ6IHRoaXMuaXNFbmFibGVkLFxuICAgICAgYWN0aXZlX2RldmljZXM6IHRoaXMuYWN0aXZlRGV2aWNlcyxcbiAgICAgIHBlbmRpbmdfZGV2aWNlczogdGhpcy5wZW5kaW5nRGV2aWNlcyxcbiAgICAgIGxhc3RfcmVhZHM6IHRoaXMuX2xhc3RSZWFkc1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvY3VzdG9tZXJtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkN1c3RvbWVyTW9kZWwgPSBjbGFzcyBDdXN0b21lck1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2FjY291bnRTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jdXN0b21lcicpO1xuXG4gICAgdGhpcy5fcHJvZmlsZSA9IG51bGw7XG5cbiAgICB0aGlzLl9pc0d1ZXN0ID0gZmFsc2U7XG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbihDb25maWcuYWNjb3VudHMpO1xuXG4gICAgdGhpcy5wcm9maWxlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fYWNjb3VudFN0b3JlLnJlYWQoKS50aGVuKGFjY291bnQgPT4ge1xuICAgICAgc2VsZi5faXNHdWVzdCA9IGFjY291bnQgJiYgYWNjb3VudC5pc19ndWVzdDtcblxuICAgICAgaWYgKCFhY2NvdW50IHx8IGFjY291bnQuaXNfZ3Vlc3QpIHtcbiAgICAgICAgc2VsZi5fcHJvZmlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5fcHJvZmlsZSA9IGFjY291bnQucHJvZmlsZTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5faXNFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBpc0F1dGhlbnRpY2F0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbmFibGVkICYmIChCb29sZWFuKHRoaXMucHJvZmlsZSkgfHwgdGhpcy5pc0d1ZXN0KTtcbiAgfVxuXG4gIGdldCBpc0d1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCAmJiBCb29sZWFuKHRoaXMuX2lzR3Vlc3QpO1xuICB9XG5cbiAgZ2V0IGhhc0NyZWRlbnRpYWxzKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuaXNBdXRoZW50aWNhdGVkICYmICF0aGlzLmlzR3Vlc3QgJiYgdGhpcy5wcm9maWxlLnR5cGUgPT09IDEpO1xuICB9XG5cbiAgZ2V0IHByb2ZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2ZpbGU7XG4gIH1cblxuICBzZXQgcHJvZmlsZSh2YWx1ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9wcm9maWxlID0gdmFsdWUgfHwgbnVsbDtcbiAgICB0aGlzLl9pc0d1ZXN0ID0gdmFsdWUgPT09ICdndWVzdCc7XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLl9hY2NvdW50U3RvcmUuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5faXNHdWVzdCA9IGZhbHNlO1xuICAgICAgICBzZWxmLnByb2ZpbGVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3Byb2ZpbGUpO1xuICAgICAgICBzZWxmLnNlc3Npb24gPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fYWNjb3VudFN0b3JlLndyaXRlKHtcbiAgICAgICAgcHJvZmlsZTogdGhpcy5fcHJvZmlsZSxcbiAgICAgICAgaXNfZ3Vlc3Q6IHRoaXMuX2lzR3Vlc3RcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLnByb2ZpbGVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3Byb2ZpbGUpO1xuXG4gICAgICAgIGlmICghdmFsdWUgfHwgc2VsZi5faXNHdWVzdCkge1xuICAgICAgICAgIHNlbGYuc2Vzc2lvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2xvY2F0aW9ubW9kZWwuanNcblxud2luZG93LmFwcC5Mb2NhdGlvbk1vZGVsID0gY2xhc3MgTG9jYXRpb25Nb2RlbCBleHRlbmRzIGFwcC5BYnN0cmFjdE1vZGVsIHtcbiAgY29uc3RydWN0b3IoRHRzQXBpLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBMb2NhdGlvbiwgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgc3VwZXIoc3RvcmFnZVByb3ZpZGVyKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdkZXZpY2UnLCAnc25hcF9kZXZpY2UnLCBudWxsLCAoKSA9PiBEdHNBcGkuaGFyZHdhcmUuZ2V0Q3VycmVudERldmljZSgpKTtcbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnZGV2aWNlcycsIHVuZGVmaW5lZCwgW10pO1xuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdzZWF0JywgJ3NuYXBfc2VhdCcsIG51bGwsICgpID0+IER0c0FwaS5sb2NhdGlvbi5nZXRDdXJyZW50U2VhdCgpKTtcbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnc2VhdHMnLCAnc25hcF9zZWF0cycsIFtdLCAoKSA9PiBEdHNBcGkubG9jYXRpb24uZ2V0U2VhdHMoKSk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ2xvY2F0aW9uJywgJ3NuYXBfbG9jYXRpb24nLCBTTkFQTG9jYXRpb24sICgpID0+IHtcbiAgICAgIGlmICghc2VsZi5kZXZpY2UpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCdEZXZpY2UgZGF0YSBpcyBtaXNzaW5nLicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gRHRzQXBpLnNuYXAuZ2V0Q29uZmlnKHNlbGYuZGV2aWNlLmxvY2F0aW9uX3Rva2VuKTtcbiAgICB9KTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgYWRkRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuZGV2aWNlcy5wdXNoKGRldmljZSk7XG4gICAgdGhpcy5fcHJvcGVydHlDaGFuZ2VkKCdkZXZpY2UnKTtcbiAgfVxuXG4gIGdldFNlYXQodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy5zZWF0cy5maWx0ZXIoc2VhdCA9PiBzZWF0LnRva2VuID09PSB0b2tlbilbMF0gfHwgbnVsbDtcbiAgfVxuXG4gIGdldERldmljZShkZXZpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2VzLmZpbHRlcihkID0+IChkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSA9PT0gZC50b2tlbilbMF0gfHwgbnVsbDtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL29yZGVybW9kZWwuanNcblxud2luZG93LmFwcC5PcmRlck1vZGVsID0gY2xhc3MgT3JkZXJNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5SRVFVRVNUX0tJTkRfT1JERVIgPSAxO1xuICAgIHRoaXMuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UgPSAyO1xuICAgIHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUID0gMztcblxuICAgIHRoaXMucHJpY2VGb3JtYXQgPSAnezB9JztcbiAgICB0aGlzLnRheCA9IDA7XG5cbiAgICB0aGlzLl9vcmRlckNhcnQgPSBbXTtcbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaCA9IFtdO1xuICAgIHRoaXMuX29yZGVyQ2hlY2sgPSBbXTtcbiAgICB0aGlzLl9vcmRlclRpY2tldCA9IHt9O1xuXG4gICAgdGhpcy5fcmVxdWVzdFdhdGNoZXJzID0ge307XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gICAgU2lnbmFsc1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHRoaXMub3JkZXJDYXJ0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlckNoZWNrQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJUaWNrZXRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlclJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgICBJbml0aWFsaXphdGlvblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIGZ1bmN0aW9uIHByZXBhcmVDYXJ0RGF0YShpdGVtcykge1xuICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3RvcmVDYXJ0RGF0YShpdGVtcykge1xuICAgICAgcmV0dXJuIGl0ZW1zLm1hcCA/IGl0ZW1zLm1hcChhcHAuQ2FydEl0ZW0ucHJvdG90eXBlLnJlc3RvcmUpIDogW107XG4gICAgfVxuXG4gICAgdGhpcy5fb3JkZXJDYXJ0U3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl9jYXJ0Jyk7XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2FydCA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2FydENoYW5nZWQuZGlzcGF0Y2goc2VsZi5vcmRlckNhcnQpO1xuICAgICAgc2VsZi5vcmRlckNhcnRDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2FydFN0b3JhZ2Uud3JpdGUocHJlcGFyZUNhcnREYXRhKGl0ZW1zKSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoU3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl9jYXJ0X3N0YXNoJyk7XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2ggPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaENoYW5nZWQuZGlzcGF0Y2goc2VsZi5vcmRlckNhcnRTdGFzaCk7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2Uud3JpdGUocHJlcGFyZUNhcnREYXRhKGl0ZW1zKSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29yZGVyQ2hlY2tTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX2NoZWNrJyk7XG4gICAgdGhpcy5fb3JkZXJDaGVja1N0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNoZWNrID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDaGVja0NoYW5nZWQuZGlzcGF0Y2goc2VsZi5vcmRlckNoZWNrKTtcbiAgICAgIHNlbGYub3JkZXJDaGVja0NoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDaGVja1N0b3JhZ2Uud3JpdGUocHJlcGFyZUNhcnREYXRhKGl0ZW1zKSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX29yZGVyVGlja2V0U3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl90aWNrZXQnKTtcbiAgICB0aGlzLl9vcmRlclRpY2tldFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlclRpY2tldCA9IHZhbHVlIHx8IHt9O1xuICAgICAgc2VsZi5vcmRlclRpY2tldENoYW5nZWQuZGlzcGF0Y2goc2VsZi5vcmRlclRpY2tldCk7XG4gICAgICBzZWxmLm9yZGVyVGlja2V0Q2hhbmdlZC5hZGQoZGF0YSA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyVGlja2V0U3RvcmFnZS53cml0ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXQgb3JkZXJDYXJ0KCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNhcnQ7XG4gIH1cblxuICBzZXQgb3JkZXJDYXJ0KHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDYXJ0ID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNhcnRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMub3JkZXJDYXJ0KTtcbiAgfVxuXG4gIGdldCBvcmRlckNhcnRTdGFzaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDYXJ0U3Rhc2g7XG4gIH1cblxuICBzZXQgb3JkZXJDYXJ0U3Rhc2godmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaCA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmRpc3BhdGNoKHRoaXMub3JkZXJDYXJ0U3Rhc2gpO1xuICB9XG5cbiAgZ2V0IG9yZGVyQ2hlY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2hlY2s7XG4gIH1cblxuICBzZXQgb3JkZXJDaGVjayh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2hlY2sgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2hlY2tDaGFuZ2VkLmRpc3BhdGNoKHRoaXMub3JkZXJDaGVjayk7XG4gIH1cblxuICBnZXQgb3JkZXJUaWNrZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyVGlja2V0O1xuICB9XG5cbiAgc2V0IG9yZGVyVGlja2V0KHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJUaWNrZXQgPSB2YWx1ZSB8fCB7fTtcbiAgICB0aGlzLm9yZGVyVGlja2V0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyVGlja2V0KTtcbiAgfVxuXG4gIGdldCBvcmRlclJlcXVlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2F0Y2hlcih0aGlzLlJFUVVFU1RfS0lORF9PUkRFUik7XG4gIH1cblxuICBnZXQgYXNzaXN0YW5jZVJlcXVlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2F0Y2hlcih0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFKTtcbiAgfVxuXG4gIGdldCBjbG9zZW91dFJlcXVlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2F0Y2hlcih0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVCk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlcXVlc3Qgd2F0Y2hlcnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldFdhdGNoZXIoa2luZCkge1xuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnNba2luZF07XG4gIH1cblxuICBhZGRXYXRjaGVyKGtpbmQsIHdhdGNoZXIpIHtcbiAgICB0aGlzLmNsZWFyV2F0Y2hlcihraW5kKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB3YXRjaGVyLnByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICBpZiAoc2VsZi5nZXRXYXRjaGVyKGtpbmQpICE9PSB3YXRjaGVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlbGYuY2xlYXJXYXRjaGVyKGtpbmQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdID0gd2F0Y2hlcjtcbiAgICB0aGlzLl9ub3RpZnlDaGFuZ2Uoa2luZCk7XG4gIH1cblxuICBjbGVhcldhdGNoZXIoa2luZCkge1xuICAgIHZhciB3YXRjaGVyID0gdGhpcy5nZXRXYXRjaGVyKGtpbmQpO1xuXG4gICAgaWYgKHdhdGNoZXIpIHtcbiAgICAgIHdhdGNoZXIuZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnNba2luZF07XG4gICAgdGhpcy5fbm90aWZ5Q2hhbmdlKGtpbmQpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9ub3RpZnlDaGFuZ2Uoa2luZCkge1xuICAgIHZhciBzaWduYWw7XG5cbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgdGhpcy5SRVFVRVNUX0tJTkRfT1JERVI6XG4gICAgICAgIHNpZ25hbCA9IHRoaXMub3JkZXJSZXF1ZXN0Q2hhbmdlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0U6XG4gICAgICAgIHNpZ25hbCA9IHRoaXMuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQ6XG4gICAgICAgIHNpZ25hbCA9IHRoaXMuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHNpZ25hbCkge1xuICAgICAgc2lnbmFsLmRpc3BhdGNoKHRoaXMuZ2V0V2F0Y2hlcihraW5kKSk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvc2Vzc2lvbm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvbk1vZGVsID0gY2xhc3MgU2Vzc2lvbk1vZGVsIGV4dGVuZHMgYXBwLkFic3RyYWN0TW9kZWwgIHtcbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgc3VwZXIoc3RvcmFnZVByb3ZpZGVyKTtcblxuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdhcGlUb2tlbicsICdzbmFwX2FjY2Vzc3Rva2VuJyk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ2N1c3RvbWVyVG9rZW4nLCAnc25hcF9jdXN0b21lcl9hY2Nlc3N0b2tlbicpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9zaGVsbG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuU2hlbGxNb2RlbCA9IGNsYXNzIFNoZWxsTW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2JhY2tncm91bmRzID0gW107XG4gICAgdGhpcy5iYWNrZ3JvdW5kc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9zY3JlZW5zYXZlcnMgPSBbXTtcbiAgICB0aGlzLnNjcmVlbnNhdmVyc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9wYWdlQmFja2dyb3VuZHMgPSBbXTtcbiAgICB0aGlzLnBhZ2VCYWNrZ3JvdW5kc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMuZWxlbWVudHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fcHJpY2VGb3JtYXQgPSAnezB9JztcbiAgICB0aGlzLnByaWNlRm9ybWF0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gJyc7XG4gICAgdGhpcy5jdXJyZW5jeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGdldCBiYWNrZ3JvdW5kcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZHM7XG4gIH1cblxuICBzZXQgYmFja2dyb3VuZHModmFsdWUpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IHZhbHVlO1xuICAgIHRoaXMuYmFja2dyb3VuZHNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBzY3JlZW5zYXZlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NjcmVlbnNhdmVycztcbiAgfVxuXG4gIHNldCBzY3JlZW5zYXZlcnModmFsdWUpIHtcbiAgICB0aGlzLl9zY3JlZW5zYXZlcnMgPSB2YWx1ZTtcbiAgICB0aGlzLnNjcmVlbnNhdmVyc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHBhZ2VCYWNrZ3JvdW5kcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcGFnZUJhY2tncm91bmRzO1xuICB9XG5cbiAgc2V0IHBhZ2VCYWNrZ3JvdW5kcyh2YWx1ZSkge1xuICAgIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcyA9IHZhbHVlO1xuICAgIHRoaXMucGFnZUJhY2tncm91bmRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgZWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VsZW1lbnRzO1xuICB9XG5cbiAgc2V0IGVsZW1lbnRzKHZhbHVlKSB7XG4gICAgdGhpcy5fZWxlbWVudHMgPSB2YWx1ZTtcbiAgICB0aGlzLmVsZW1lbnRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgcHJpY2VGb3JtYXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ByaWNlRm9ybWF0O1xuICB9XG5cbiAgc2V0IHByaWNlRm9ybWF0KHZhbHVlKSB7XG4gICAgdGhpcy5fcHJpY2VGb3JtYXQgPSB2YWx1ZTtcbiAgICB0aGlzLnByaWNlRm9ybWF0Q2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgY3VycmVuY3koKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbmN5O1xuICB9XG5cbiAgc2V0IGN1cnJlbmN5KHZhbHVlKSB7XG4gICAgdGhpcy5fY3VycmVuY3kgPSB2YWx1ZTtcbiAgICB0aGlzLmN1cnJlbmN5Q2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9zdXJ2ZXltb2RlbC5qc1xuXG53aW5kb3cuYXBwLlN1cnZleU1vZGVsID0gY2xhc3MgU3VydmV5TW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKENvbmZpZywgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbihDb25maWcuc3VydmV5cyk7XG4gICAgdGhpcy5fc3VydmV5cyA9IHt9O1xuXG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfc3VydmV5Jyk7XG5cbiAgICB0aGlzLl9mZWVkYmFja1N1cnZleSA9IG51bGw7XG4gICAgdGhpcy5mZWVkYmFja1N1cnZleUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuc3VydmV5Q29tcGxldGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLl9zdXJ2ZXlzID0gdmFsdWUgfHwgc2VsZi5fc3VydmV5cztcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5faXNFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBmZWVkYmFja1N1cnZleSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmVlZGJhY2tTdXJ2ZXk7XG4gIH1cblxuICBzZXQgZmVlZGJhY2tTdXJ2ZXkodmFsdWUpIHtcbiAgICB0aGlzLl9mZWVkYmFja1N1cnZleSA9IHZhbHVlO1xuICAgIHRoaXMuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2ZlZWRiYWNrU3VydmV5KTtcbiAgfVxuXG4gIGdldCBmZWVkYmFja1N1cnZleUNvbXBsZXRlKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX3N1cnZleXMuZmVlZGJhY2spO1xuICB9XG5cbiAgc2V0IGZlZWRiYWNrU3VydmV5Q29tcGxldGUodmFsdWUpIHtcbiAgICB0aGlzLl9zdXJ2ZXlzLmZlZWRiYWNrID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc3VydmV5cyk7XG5cbiAgICB0aGlzLnN1cnZleUNvbXBsZXRlZC5kaXNwYXRjaCh0aGlzLmZlZWRiYWNrU3VydmV5KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3BlcnNpc3RlbmNlL2FwcGNhY2hlLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQXBwQ2FjaGVcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQXBwQ2FjaGUgPSBmdW5jdGlvbihMb2dnZXIpIHtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gICAgdGhpcy5fY2FjaGUgPSB3aW5kb3cuYXBwbGljYXRpb25DYWNoZTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cyA9IFtcbiAgICAgICdjYWNoZWQnLFxuICAgICAgJ2NoZWNraW5nJyxcbiAgICAgICdkb3dubG9hZGluZycsXG4gICAgICAnY2FjaGVkJyxcbiAgICAgICdub3VwZGF0ZScsXG4gICAgICAnb2Jzb2xldGUnLFxuICAgICAgJ3VwZGF0ZXJlYWR5JyxcbiAgICAgICdwcm9ncmVzcydcbiAgICBdO1xuXG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuX2dldENhY2hlU3RhdHVzKCk7XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hlIHN0YXR1czogJyArIHN0YXR1cyk7XG5cbiAgICB0aGlzLmNvbXBsZXRlID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5faXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2lzVXBkYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hhZEVycm9ycyA9IGZhbHNlO1xuXG4gICAgaWYgKHN0YXR1cyA9PT0gJ1VOQ0FDSEVEJykge1xuICAgICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XG4gICAgICB0aGlzLmNvbXBsZXRlLmRpc3BhdGNoKGZhbHNlKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5faGFuZGxlQ2FjaGVFcnJvcihlKTtcbiAgICB9O1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2hhbmRsZUNhY2hlRXZlbnQoZSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFwcENhY2hlLnByb3RvdHlwZSwgJ2lzQ29tcGxldGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2lzQ29tcGxldGU7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFwcENhY2hlLnByb3RvdHlwZSwgJ2lzVXBkYXRlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faXNVcGRhdGVkOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdoYWRFcnJvcnMnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2hhZEVycm9yczsgfVxuICB9KTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2dldENhY2hlU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9jYWNoZS5zdGF0dXMpIHtcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuVU5DQUNIRUQ6XG4gICAgICAgIHJldHVybiAnVU5DQUNIRUQnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5JRExFOlxuICAgICAgICByZXR1cm4gJ0lETEUnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5DSEVDS0lORzpcbiAgICAgICAgcmV0dXJuICdDSEVDS0lORyc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLkRPV05MT0FESU5HOlxuICAgICAgICByZXR1cm4gJ0RPV05MT0FESU5HJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuVVBEQVRFUkVBRFk6XG4gICAgICAgIHJldHVybiAnVVBEQVRFUkVBRFknO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5PQlNPTEVURTpcbiAgICAgICAgcmV0dXJuICdPQlNPTEVURSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ1VLTk9XTiBDQUNIRSBTVEFUVVMnO1xuICAgIH1cbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX3Jlc3VsdCA9IGZ1bmN0aW9uKGVycm9yLCB1cGRhdGVkKSB7XG4gICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XG4gICAgdGhpcy5faXNVcGRhdGVkID0gdXBkYXRlZDtcbiAgICB0aGlzLl9oYWRFcnJvcnMgPSAoZXJyb3IgIT0gbnVsbCk7XG4gICAgdGhpcy5jb21wbGV0ZS5kaXNwYXRjaCh1cGRhdGVkKTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2FkZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fZXJyb3JIYW5kbGVyKTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2NhY2hlLmFkZEV2ZW50TGlzdGVuZXIoZSwgc2VsZi5fZXZlbnRIYW5kbGVyKTtcbiAgICB9KTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX3JlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fZXJyb3JIYW5kbGVyKTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2NhY2hlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZSwgc2VsZi5fZXZlbnRIYW5kbGVyKTtcbiAgICB9KTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2hhbmRsZUNhY2hlRXZlbnQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudHlwZSAhPT0gJ3Byb2dyZXNzJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBldmVudDogJyArIGUudHlwZSk7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hlIHN0YXR1czogJyArIHRoaXMuX2dldENhY2hlU3RhdHVzKCkpO1xuICAgIH1cblxuICAgIGlmIChlLnR5cGUgPT09ICd1cGRhdGVyZWFkeScpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gU3dhcHBpbmcgdGhlIGNhY2hlLicpO1xuXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgdGhpcy5fY2FjaGUuc3dhcENhY2hlKCk7XG5cbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCB0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS50eXBlID09PSAnY2FjaGVkJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoaW5nIGNvbXBsZXRlLiBDYWNoZSBzYXZlZC4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCBmYWxzZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUudHlwZSA9PT0gJ25vdXBkYXRlJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoaW5nIGNvbXBsZXRlLiBObyB1cGRhdGVzLicpO1xuXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgdGhpcy5fcmVzdWx0KG51bGwsIGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9oYW5kbGVDYWNoZUVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NhY2hlIHVwZGF0ZSBlcnJvcjogJyArIGUubWVzc2FnZSk7XG4gICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9yZXN1bHQoZSwgZmFsc2UpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQXBwQ2FjaGUgPSBBcHBDYWNoZTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9wZXJzaXN0ZW5jZS9zdG9yZS5jb3Jkb3ZhLmpzXG5cbndpbmRvdy5hcHAuQ29yZG92YUxvY2FsU3RvcmFnZVN0b3JlID0gY2xhc3MgQ29yZG92YUxvY2FsU3RvcmFnZVN0b3JlIHtcbiAgY29uc3RydWN0b3IoaWQpIHtcbiAgICB0aGlzLl9pZCA9IGlkO1xuXG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UpIHtcbiAgICAgIHRocm93IEVycm9yKCdDb3Jkb3ZhIG5vdCBmb3VuZC4nKTtcbiAgICB9XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5faWQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cblxuICByZWFkKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdmFsdWUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuX2lkKSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuICB9XG5cbiAgd3JpdGUodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5faWQsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3BlcnNpc3RlbmNlL3N0b3JlLmlubWVtb3J5LmpzXG5cbndpbmRvdy5hcHAuSW5NZW1vcnlTdG9yZSA9IGNsYXNzIEluTWVtb3J5U3RvcmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gbnVsbDtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX3N0b3JhZ2UgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgcmVhZCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3N0b3JhZ2UpO1xuICB9XG5cbiAgd3JpdGUodmFsdWUpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gdmFsdWU7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvcGVyc2lzdGVuY2Uvc3RvcmUubG9jYWxzdG9yYWdlLmpzXG5cbndpbmRvdy5hcHAuTG9jYWxTdG9yYWdlU3RvcmUgPSBjbGFzcyBMb2NhbFN0b3JhZ2VTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5faWQgPSBpZDtcblxuICAgIGlmICghc3RvcmUpIHtcbiAgICAgIHRocm93IEVycm9yKCdTdG9yZS5qcyBub3QgZm91bmQuJyk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN0b3JlLnJlbW92ZSh0aGlzLl9pZCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxuXG4gIHJlYWQoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB2YWx1ZSA9IHN0b3JlLmdldCh0aGlzLl9pZCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuICB9XG5cbiAgd3JpdGUodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgc3RvcmUuc2V0KHRoaXMuX2lkLCB2YWx1ZSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NlcnZpY2UvYmFja2VuZGFwaS5qc1xuXG53aW5kb3cuYXBwLkJhY2tlbmRBcGkgPSBjbGFzcyBCYWNrZW5kQXBpIHtcbiAgY29uc3RydWN0b3IoSG9zdHMsIFNlc3Npb25Nb2RlbCkge1xuICAgIHRoaXMuX1Nlc3Npb25Nb2RlbCA9IFNlc3Npb25Nb2RlbDtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGJ1c2luZXNzVG9rZW5Qcm92aWRlcigpIHtcbiAgICAgIGlmICghc2VsZi5fU2Vzc2lvbk1vZGVsLmFwaVRva2VuKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNlbGYuX1Nlc3Npb25Nb2RlbC5hcGlUb2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1c3RvbWVyVG9rZW5Qcm92aWRlcigpIHtcbiAgICAgIGlmICghc2VsZi5fU2Vzc2lvbk1vZGVsLmN1c3RvbWVyVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc2VsZi5fU2Vzc2lvbk1vZGVsLmN1c3RvbWVyVG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gRHRzQXBpQ2xpZW50KSB7XG4gICAgICBsZXQgY29uZmlnID0ge1xuICAgICAgICBob3N0OiB7XG4gICAgICAgICAgZG9tYWluOiBIb3N0cy5hcGkuaG9zdCxcbiAgICAgICAgICBzZWN1cmU6IEhvc3RzLmFwaS5zZWN1cmUgPT09ICd0cnVlJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBsZXQgcHJvdmlkZXIgPSBidXNpbmVzc1Rva2VuUHJvdmlkZXI7XG5cbiAgICAgIGlmIChrZXkgPT09ICdzbmFwJykge1xuICAgICAgICBjb25maWcuaG9zdC5kb21haW4gPSBIb3N0cy5jb250ZW50Lmhvc3Q7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChrZXkgPT09ICdjdXN0b21lcicpIHtcbiAgICAgICAgcHJvdmlkZXIgPSBjdXN0b21lclRva2VuUHJvdmlkZXI7XG4gICAgICB9XG5cbiAgICAgIHRoaXNba2V5XSA9IG5ldyBEdHNBcGlDbGllbnRba2V5XShjb25maWcsIHByb3ZpZGVyKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL2NhcmRyZWFkZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcmRSZWFkZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQ2FyZFJlYWRlciA9IGZ1bmN0aW9uKE1hbmFnZW1lbnRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fTWFuYWdlbWVudFNlcnZpY2UgPSBNYW5hZ2VtZW50U2VydmljZTtcbiAgICB0aGlzLm9uUmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uRXJyb3IgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5yZWNlaXZlZCA9IGZ1bmN0aW9uKGNhcmQpIHtcbiAgICB0aGlzLm9uUmVjZWl2ZWQuZGlzcGF0Y2goY2FyZCk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5vbkVycm9yLmRpc3BhdGNoKGUpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLnN0YXJ0Q2FyZFJlYWRlcigpO1xuICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9hY3RpdmUpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLnN0b3BDYXJkUmVhZGVyKCk7XG4gICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJkUmVhZGVyID0gQ2FyZFJlYWRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL2RhdGFwcm92aWRlci5qc1xuXG53aW5kb3cuYXBwLkRhdGFQcm92aWRlciA9IGNsYXNzIERhdGFQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZywgc2VydmljZSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9zZXJ2aWNlID0gc2VydmljZTtcbiAgICB0aGlzLl9jYWNoZSA9IHt9O1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9jYWNoZSA9IHt9O1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnZXN0KCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnZGlnZXN0JywgJ2dldERpZ2VzdCcpO1xuICB9XG5cbiAgaG9tZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2hvbWUnLCAnZ2V0TWVudXMnKTtcbiAgfVxuXG4gIGFkdmVydGlzZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnYWR2ZXJ0aXNlbWVudHMnLCAnZ2V0QWR2ZXJ0aXNlbWVudHMnKTtcbiAgfVxuXG4gIGJhY2tncm91bmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnYmFja2dyb3VuZHMnLCAnZ2V0QmFja2dyb3VuZHMnKTtcbiAgfVxuXG4gIGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnZWxlbWVudHMnLCAnZ2V0RWxlbWVudHMnKTtcbiAgfVxuXG4gIG1lbnUoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ21lbnUnLCAnZ2V0TWVudScsIGlkKTtcbiAgfVxuXG4gIGNhdGVnb3J5KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdjYXRlZ29yeScsICdnZXRNZW51Q2F0ZWdvcnknLCBpZCk7XG4gIH1cblxuICBpdGVtKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdpdGVtJywgJ2dldE1lbnVJdGVtJywgaWQpO1xuICB9XG5cbiAgc3VydmV5cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ3N1cnZleXMnLCAnZ2V0U3VydmV5cycpO1xuICB9XG5cbiAgc2VhdHMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQoJ3NlYXRzJykgfHwgdGhpcy5fc2VydmljZS5sb2NhdGlvbi5nZXRTZWF0cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgIHNlbGYuX3N0b3JlKGRhdGEsICdzZWF0cycpO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBtZWRpYShtZWRpYSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdG9rZW4gPSBtZWRpYS50b2tlbiArICdfJyArIG1lZGlhLndpZHRoICsgJ18nICsgbWVkaWEuaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQoJ21lZGlhJywgdG9rZW4pIHx8IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmIChtZWRpYS53aWR0aCAmJiBtZWRpYS5oZWlnaHQpIHtcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWcpO1xuICAgICAgICBpbWcub25lcnJvciA9IChlKSA9PiByZWplY3QoZSk7XG4gICAgICAgIGltZy5zcmMgPSBzZWxmLl9nZXRNZWRpYVVybChtZWRpYSwgbWVkaWEud2lkdGgsIG1lZGlhLmhlaWdodCwgbWVkaWEuZXh0ZW5zaW9uKTtcblxuICAgICAgICBzZWxmLl9zdG9yZShpbWcsICdtZWRpYScsIHRva2VuKTtcblxuICAgICAgICBpZiAoaW1nLmNvbXBsZXRlKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbWcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVqZWN0KCdNaXNzaW5nIGltYWdlIGRpbWVuc2lvbnMnKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIF9nZXRTbmFwRGF0YShuYW1lLCBtZXRob2QsIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQobmFtZSwgaWQpIHx8IHRoaXMuX3NlcnZpY2Uuc25hcFttZXRob2RdKHRoaXMuX2NvbmZpZy5sb2NhdGlvbiwgaWQpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgIHNlbGYuX3N0b3JlKGRhdGEsIG5hbWUsIGlkKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgX29uRXJyb3IoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIF9jYWNoZWQoZ3JvdXAsIGlkKSB7XG4gICAgaWYgKGlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSAmJiB0aGlzLl9jYWNoZVtncm91cF1baWRdKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0pO1xuICAgIH1cbiAgICBlbHNlIGlmICghaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NhY2hlW2dyb3VwXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBfc3RvcmUoZGF0YSwgZ3JvdXAsIGlkKSB7XG4gICAgaWYgKGlkKSB7XG4gICAgICBpZiAoIXRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgICB0aGlzLl9jYWNoZVtncm91cF0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSA9IGRhdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdID0gZGF0YTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TWVkaWFVcmwoKSB7XG5cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NlcnZpY2UvbWFuYWdlbWVudHNlcnZpY2UuY29yZG92YS5qc1xuXG53aW5kb3cuYXBwLkNvcmRvdmFNYW5hZ2VtZW50U2VydmljZSA9IGNsYXNzIENvcmRvdmFNYW5hZ2VtZW50U2VydmljZSB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoTG9nZ2VyKSB7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgaWYgKCF3aW5kb3cuY29yZG92YSkge1xuICAgICAgdGhpcy5fTG9nZ2VyLndhcm4oJ0NvcmRvdmEgaXMgbm90IGF2YWlsYWJsZS4nKTtcbiAgICB9XG4gIH1cblxuICByb3RhdGVTY3JlZW4oKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgb3BlbkJyb3dzZXIodXJsLCBicm93c2VyUmVmLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy5zeXN0ZW0gPyAnX2JsYW5rJyA6ICdfYmxhbmsnLFxuICAgICAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICAgICAgbG9jYXRpb246IG9wdGlvbnMuc3lzdGVtID8gJ25vJyA6ICd5ZXMnLFxuICAgICAgICAgICAgY2xlYXJjYWNoZTogJ3llcycsXG4gICAgICAgICAgICBjbGVhcnNlc3Npb25jYWNoZTogJ3llcycsXG4gICAgICAgICAgICB6b29tOiAnbm8nLFxuICAgICAgICAgICAgaGFyZHdhcmViYWNrOiAnbm8nXG4gICAgICAgICAgfTtcblxuICAgICAgYnJvd3NlclJlZiA9IHdpbmRvdy5vcGVuKHVybCwgdGFyZ2V0LCBPYmplY3Qua2V5cyhzZXR0aW5ncykubWFwKHggPT4gYCR7eH09JHtzZXR0aW5nc1t4XX1gKS5qb2luKCcsJykpO1xuICAgICAgcmVzb2x2ZShuZXcgYXBwLkNvcmRvdmFXZWJCcm93c2VyUmVmZXJlbmNlKGJyb3dzZXJSZWYpKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlQnJvd3Nlcihicm93c2VyUmVmKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgYnJvd3NlclJlZi5leGl0KCk7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydENhcmRSZWFkZXIoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgc3RvcENhcmRSZWFkZXIoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRBcHBsaWNhdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHdpbmRvdy5vcGVuKGBzbmFwLmh0bWxgLCAnX3NlbGYnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFNvdW5kVm9sdW1lKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMTAwKTtcbiAgfVxuXG4gIHNldFNvdW5kVm9sdW1lKHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgZ2V0RGlzcGxheUJyaWdodG5lc3MoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgxMDApO1xuICB9XG5cbiAgc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL21hbmFnZW1lbnRzZXJ2aWNlLmhvbWVicmV3LmpzXG5cbndpbmRvdy5hcHAuSG9tZWJyZXdNYW5hZ2VtZW50U2VydmljZSA9IGNsYXNzIEhvbWVicmV3TWFuYWdlbWVudFNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigkcmVzb3VyY2UsIFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX2FwaSA9IHtcbiAgICAgICdyb3RhdGVTY3JlZW4nOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3JvdGF0ZS1zY3JlZW4nLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnb3BlbkJyb3dzZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L29wZW4tYnJvd3NlcicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdjbG9zZUJyb3dzZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L2Nsb3NlLWJyb3dzZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc3RhcnRDYXJkUmVhZGVyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9zdGFydC1jYXJkLXJlYWRlcicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzdG9wQ2FyZFJlYWRlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvc3RvcC1jYXJkLXJlYWRlcicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdyZXNldCc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvcmVzZXQnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnZ2V0U291bmRWb2x1bWUnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3ZvbHVtZScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzZXRTb3VuZFZvbHVtZSc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvdm9sdW1lJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2dldERpc3BsYXlCcmlnaHRuZXNzJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9icmlnaHRuZXNzJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3NldERpc3BsYXlCcmlnaHRuZXNzJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9icmlnaHRuZXNzJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pXG4gICAgfTtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gIH1cblxuICByb3RhdGVTY3JlZW4oKSB7XG4gICAgdGhpcy5fYXBpLnJvdGF0ZVNjcmVlbi5xdWVyeSgpO1xuICB9XG5cbiAgb3BlbkJyb3dzZXIodXJsLCBicm93c2VyUmVmKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHJldHVybiBzZWxmLl9hcGkub3BlbkJyb3dzZXIucXVlcnkoeyB1cmw6IHVybCB9KS50aGVuKHJlc29sdmUgPT4ge1xuICAgICAgICB2YXIgYnJvd3NlciA9IG5ldyBhcHAuV2ViQnJvd3NlclJlZmVyZW5jZSgpO1xuICAgICAgICBicm93c2VyLm9uTmF2aWdhdGVkLmRpc3BhdGNoKHVybCk7XG4gICAgICAgIHJlc29sdmUoYnJvd3Nlcik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlQnJvd3Nlcihicm93c2VyUmVmKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmIChicm93c2VyUmVmKSB7XG4gICAgICAgIGJyb3dzZXJSZWYub25FeGl0LmRpc3BhdGNoKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLl9hcGkuY2xvc2VCcm93c2VyLnF1ZXJ5KCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0YXJ0Q2FyZFJlYWRlci5xdWVyeSgpO1xuICB9XG5cbiAgc3RvcENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0b3BDYXJkUmVhZGVyLnF1ZXJ5KCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5yZXNldC5xdWVyeSgpLiRwcm9taXNlLnRoZW4ocmVzb2x2ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oJy9zbmFwLycgKyBlbmNvZGVVUklDb21wb25lbnQoc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvYWRBcHBsaWNhdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oJy9zbmFwLycgKyBlbmNvZGVVUklDb21wb25lbnQoc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtKSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRTb3VuZFZvbHVtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLmdldFNvdW5kVm9sdW1lLnF1ZXJ5KCkuJHByb21pc2U7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc2V0U291bmRWb2x1bWUucXVlcnkoeyB2YWx1ZTogdmFsdWUgfSkuJHByb21pc2U7XG4gIH1cblxuICBnZXREaXNwbGF5QnJpZ2h0bmVzcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLmdldERpc3BsYXlCcmlnaHRuZXNzLnF1ZXJ5KCkuJHByb21pc2U7XG4gIH1cblxuICBzZXREaXNwbGF5QnJpZ2h0bmVzcyh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc2V0RGlzcGxheUJyaWdodG5lc3MucXVlcnkoeyB2YWx1ZTogdmFsdWUgfSkuJHByb21pc2U7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL3NvY2tldGNsaWVudC5qc1xuXG53aW5kb3cuYXBwLlNvY2tldENsaWVudCA9IGNsYXNzIFNvY2tldENsaWVudCB7XG4gIGNvbnN0cnVjdG9yKFNlc3Npb25Nb2RlbCwgSG9zdHMsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX1Nlc3Npb25Nb2RlbCA9IFNlc3Npb25Nb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0Q2x1c3Rlci5jb25uZWN0KHtcbiAgICAgIGhvc3RuYW1lOiBIb3N0cy5zb2NrZXQuaG9zdCxcbiAgICAgIHBhdGg6IEhvc3RzLnNvY2tldC5wYXRoLFxuICAgICAgcG9ydDogSG9zdHMuc29ja2V0LnBvcnQsXG4gICAgICBzZWN1cmU6IEhvc3RzLnNvY2tldC5zZWN1cmVcbiAgICB9KTtcbiAgICB0aGlzLl9zb2NrZXQub24oJ2Nvbm5lY3QnLCBzdGF0dXMgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBTb2NrZXQgY29ubmVjdGVkLmApO1xuICAgICAgc2VsZi5fYXV0aGVudGljYXRlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBTb2NrZXQgZGlzY29ubmVjdGVkLmApO1xuICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHNlbGYuaXNDb25uZWN0ZWRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuaXNDb25uZWN0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIHN1YnNjcmliZSh0b3BpYywgaGFuZGxlcikge1xuICAgIHRoaXMuX2dldENoYW5uZWwodG9waWMpLndhdGNoKGhhbmRsZXIpO1xuICB9XG5cbiAgc2VuZCh0b3BpYywgZGF0YSkge1xuICAgIHRoaXMuX2dldENoYW5uZWwodG9waWMpLnB1Ymxpc2goZGF0YSk7XG4gIH1cblxuICBfZ2V0Q2hhbm5lbCh0b3BpYykge1xuICAgIHJldHVybiB0aGlzLl9jaGFubmVsc1t0b3BpY10gfHwgKHRoaXMuX2NoYW5uZWxzW3RvcGljXSA9IHRoaXMuX3NvY2tldC5zdWJzY3JpYmUodG9waWMpKTtcbiAgfVxuXG4gIF9hdXRoZW50aWNhdGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuX3NvY2tldC5lbWl0KCdhdXRoZW50aWNhdGUnLCB7XG4gICAgICBhY2Nlc3NfdG9rZW46IHNlbGYuX1Nlc3Npb25Nb2RlbC5hcGlUb2tlblxuICAgIH0sIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci53YXJuKGBVbmFibGUgdG8gYXV0aGVudGljYXRlIHNvY2tldDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9pc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICBzZWxmLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmlzQ29ubmVjdGVkKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NlcnZpY2UvdGVsZW1ldHJ5c2VydmljZS5qc1xuXG53aW5kb3cuYXBwLlRlbGVtZXRyeVNlcnZpY2UgPSBjbGFzcyBUZWxlbWV0cnlTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlKSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3N1Ym1pdFRlbGVtZXRyeSc6ICRyZXNvdXJjZSgnL3NuYXAvdGVsZW1ldHJ5Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KSxcbiAgICAgICdzdWJtaXRMb2dzJzogJHJlc291cmNlKCcvc25hcC9sb2dzJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KVxuICAgIH07XG4gIH1cblxuICBzdWJtaXRUZWxlbWV0cnkoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0VGVsZW1ldHJ5LnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG5cbiAgc3VibWl0TG9ncyhkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zdWJtaXRMb2dzLnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS93ZWJicm93c2VyLmpzXG5cbndpbmRvdy5hcHAuV2ViQnJvd3NlciA9IGNsYXNzIFdlYkJyb3dzZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscywgVVJJICovXG5cbiAgY29uc3RydWN0b3IoQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykge1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fTWFuYWdlbWVudFNlcnZpY2UgPSBNYW5hZ2VtZW50U2VydmljZTtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG5cbiAgICB0aGlzLl9sb2NhbEhvc3RzID0gT2JqZWN0LmtleXMoU05BUEhvc3RzKS5tYXAocCA9PiBTTkFQSG9zdHNbcF0uaG9zdCk7XG4gICAgdGhpcy5fbG9jYWxIb3N0cy5wdXNoKCdsb2NhbGhvc3QnKTtcblxuICAgIHRoaXMub25PcGVuID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbkNsb3NlID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbk5hdmlnYXRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fYnJvd3NlciA9IG51bGw7XG4gIH1cblxuICBvcGVuKHVybCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5vcGVuQnJvd3Nlcih1cmwsIHRoaXMuX2Jyb3dzZXIsIG9wdGlvbnMpLnRoZW4oYnJvd3NlciA9PiB7XG4gICAgICBzZWxmLl9icm93c2VyID0gYnJvd3NlcjtcbiAgICAgIHNlbGYub25PcGVuLmRpc3BhdGNoKHVybCwgc2VsZi5fYnJvd3Nlcik7XG4gICAgICBzZWxmLl9icm93c2VyT3BlbmVkID0gdHJ1ZTtcblxuICAgICAgc2VsZi5fYnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQodXJsID0+IHtcbiAgICAgICAgc2VsZi5vbk5hdmlnYXRlZC5kaXNwYXRjaCh1cmwpO1xuXG4gICAgICAgIGxldCBob3N0ID0gVVJJKHVybCkuaG9zdG5hbWUoKTtcblxuICAgICAgICBpZiAoc2VsZi5fbG9jYWxIb3N0cy5pbmRleE9mKGhvc3QpID09PSAtMSkge1xuICAgICAgICAgIHNlbGYuX0FuYWx5dGljc01vZGVsLmxvZ1VybCh1cmwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHNlbGYuX2Jyb3dzZXIub25FeGl0LmFkZE9uY2UoKCkgPT4ge1xuICAgICAgICBzZWxmLm9uQ2xvc2UuZGlzcGF0Y2goKTtcbiAgICAgICAgc2VsZi5fYnJvd3Nlck9wZW5lZCA9IGZhbHNlO1xuICAgICAgICBzZWxmLl9icm93c2VyID0gbnVsbDtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gYnJvd3NlcjtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghdGhpcy5fYnJvd3Nlck9wZW5lZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5jbG9zZUJyb3dzZXIodGhpcy5fYnJvd3NlcikudGhlbigoKSA9PiB7XG4gICAgICBzZWxmLl9icm93c2VyID0gbnVsbDtcbiAgICAgIHNlbGYub25DbG9zZS5kaXNwYXRjaCgpO1xuICAgICAgc2VsZi5fYnJvd3Nlck9wZW5lZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBFeHRlcm5hbCBtZXRob2RzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBuYXZpZ2F0ZWQodXJsKSB7XG4gICAgaWYgKHRoaXMuX2Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX2Jyb3dzZXIub25OYXZpZ2F0ZWQuZGlzcGF0Y2godXJsKTtcbiAgICB9XG4gIH1cblxuICBjYWxsYmFjayhkYXRhKSB7XG4gICAgaWYgKHRoaXMuX2Jyb3dzZXIpIHtcbiAgICAgIHRoaXMuX2Jyb3dzZXIub25DYWxsYmFjay5kaXNwYXRjaChkYXRhKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsb3NlKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC93b3JrZXJzL2hlYXRtYXAuanNcblxud2luZG93LmFwcC5IZWF0TWFwID0gY2xhc3MgSGVhdE1hcCB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9saXN0ZW5lciA9IGUgPT4ge1xuICAgICAgc2VsZi5fb25DbGljayhlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2xpc3RlbmVyKTtcblxuICAgIHRoaXMuY2xpY2tlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fbGlzdGVuZXIpO1xuICB9XG5cbiAgX29uQ2xpY2soZSkge1xuICAgIGxldCBkYXRhID0ge1xuICAgICAgeDogZS5sYXllclggLyB0aGlzLl9lbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgeTogZS5sYXllclkgLyB0aGlzLl9lbGVtZW50LmNsaWVudEhlaWdodFxuICAgIH07XG5cbiAgICBpZiAoZGF0YS54IDwgMCB8fCBkYXRhLnkgPCAwIHx8IGRhdGEueCA+IDEgfHwgZGF0YS55ID4gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xpY2tlZC5kaXNwYXRjaChkYXRhKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3dvcmtlcnMvbG9nZ2VyLmpzXG5cbndpbmRvdy5hcHAuTG9nZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fbG9nID0gbG9nNGphdmFzY3JpcHQuZ2V0TG9nZ2VyKCk7XG5cbiAgICB2YXIgYWpheEFwcGVuZGVyID0gbmV3IGxvZzRqYXZhc2NyaXB0LkFqYXhBcHBlbmRlcignL3NuYXAvbG9nJyk7XG4gICAgYWpheEFwcGVuZGVyLnNldFdhaXRGb3JSZXNwb25zZSh0cnVlKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0TGF5b3V0KG5ldyBsb2c0amF2YXNjcmlwdC5Kc29uTGF5b3V0KCkpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRUaHJlc2hvbGQobG9nNGphdmFzY3JpcHQuTGV2ZWwuRVJST1IpO1xuXG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKGFqYXhBcHBlbmRlcik7XG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKG5ldyBsb2c0amF2YXNjcmlwdC5Ccm93c2VyQ29uc29sZUFwcGVuZGVyKCkpO1xuICB9XG5cbiAgZGVidWcoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5kZWJ1ZyguLi5hcmdzKTtcbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5pbmZvKC4uLmFyZ3MpO1xuICB9XG5cbiAgd2FybiguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLndhcm4oLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmVycm9yKC4uLmFyZ3MpO1xuICB9XG5cbiAgZmF0YWwoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5mYXRhbCguLi5hcmdzKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3dvcmtlcnMvbWVkaWFzdGFydGVyLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgLyogZ2xvYmFsIHN3Zm9iamVjdCAqL1xuXG4gIGZ1bmN0aW9uIE1lZGlhU3RhcnRlcihpZCkge1xuXG4gICAgdmFyIGZsYXNodmFycyA9IHt9O1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICBtZW51OiAnZmFsc2UnLFxuICAgICAgd21vZGU6ICdkaXJlY3QnLFxuICAgICAgYWxsb3dGdWxsU2NyZWVuOiAnZmFsc2UnXG4gICAgfTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIG5hbWU6IGlkXG4gICAgfTtcblxuICAgIHN3Zm9iamVjdC5lbWJlZFNXRihcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd1cmwnKSxcbiAgICAgIGlkLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ3dpZHRoJyksXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcignaGVpZ2h0JyksXG4gICAgICAnMTYuMC4wJyxcbiAgICAgICdleHByZXNzSW5zdGFsbC5zd2YnLFxuICAgICAgZmxhc2h2YXJzLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXR0cmlidXRlcyxcbiAgICAgIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZiAocmVzLnN1Y2Nlc3MgIT09IHRydWUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKHJlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgTWVkaWFTdGFydGVyLnByb3RvdHlwZS5fZ2V0UXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCBcIlxcXFxbXCIpLnJlcGxhY2UoL1tcXF1dLywgXCJcXFxcXVwiKTtcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFwjJl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKSxcbiAgICByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5oYXNoKTtcbiAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuTWVkaWFTdGFydGVyID0gTWVkaWFTdGFydGVyO1xufSkoKTtcblxuLy9zcmMvanMvYXBwcy5qc1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vICBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxud2luZG93LmFwcC5BcHBsaWNhdGlvbkJvb3RzdHJhcGVyID0gY2xhc3MgQXBwbGljYXRpb25Cb290c3RyYXBlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ob3N0cyA9IHtcbiAgICAgIGFwaTogeyAnaG9zdCc6ICdhcGkyLm1hbmFnZXNuYXAuY29tJywgJ3NlY3VyZSc6IHRydWUgfSxcbiAgICAgIGNvbnRlbnQ6IHsgJ2hvc3QnOiAnY29udGVudC5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiBmYWxzZSB9LFxuICAgICAgbWVkaWE6IHsgJ2hvc3QnOiAnY29udGVudC5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiBmYWxzZSB9LFxuICAgICAgc3RhdGljOiB7ICdwYXRoJzogJy8nIH0sXG4gICAgICBzb2NrZXQ6IHsgJ2hvc3QnOiAnd2ViLWRldi5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiB0cnVlLCAncG9ydCc6ODA4MCwgJ3BhdGgnOiAnL3NvY2tldC8nIH1cbiAgICB9O1xuXG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IHtcbiAgICAgIG1haW5fYXBwbGljYXRpb246IHsgJ2NsaWVudF9pZCc6ICdkNjc2MTBiMWM5MTA0NGQ4YWJkNTVjYmRhNmM2MTlmMCcsICdjYWxsYmFja191cmwnOiAnaHR0cDovL2FwaTIubWFuYWdlc25hcC5jb20vY2FsbGJhY2svYXBpJywgJ3Njb3BlJzogJycgfSxcbiAgICAgIGN1c3RvbWVyX2FwcGxpY2F0aW9uOiB7ICdjbGllbnRfaWQnOiAnOTEzODFhODZiM2I0NDRmZDg3NmRmODBiMjJkN2ZhNmUnIH0sXG4gICAgICBmYWNlYm9va19hcHBsaWNhdGlvbjogeyAnY2xpZW50X2lkJzogJzM0OTcyOTUxODU0NTMxMycsICdyZWRpcmVjdF91cmwnOiAnaHR0cHM6Ly93ZWIubWFuYWdlc25hcC5jb20vY2FsbGJhY2svZmFjZWJvb2snIH0sXG4gICAgICBnb29nbGVwbHVzX2FwcGxpY2F0aW9uOiB7ICdjbGllbnRfaWQnOiAnNjc4OTk4MjUwOTQxLTFkbWVicDRrc25pOXRzanRoNDV0c2h0OGw3Y2wxbXJuLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJywgJ3JlZGlyZWN0X3VybCc6ICdodHRwczovL3dlYi5tYW5hZ2VzbmFwLmNvbS9jYWxsYmFjay9nb29nbGVwbHVzJyB9LFxuICAgICAgdHdpdHRlcl9hcHBsaWNhdGlvbjogeyAnY29uc3VtZXJfa2V5JzogJ3lROFhKMTVQbWFQT2k0TDVESlBpa0dDSTAnLCAncmVkaXJlY3RfdXJsJzogJ2h0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL3R3aXR0ZXInIH1cbiAgICB9O1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQdWJsaWMgbWV0aG9kc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY29uZmlndXJlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIHN0b3JlID0gbmV3IGFwcC5Db3Jkb3ZhTG9jYWxTdG9yYWdlU3RvcmUoJ3NuYXBfbG9jYXRpb24nKTtcblxuICAgICAgc3RvcmUucmVhZCgpLnRoZW4oY29uZmlnID0+IHtcbiAgICAgICAgc2VsZi5sb2NhdGlvbiA9IGNvbmZpZyB8fCBudWxsO1xuXG4gICAgICAgIGFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbmZpZ3MnLCBbXSlcbiAgICAgICAgICAuY29uc3RhbnQoJ1NOQVBMb2NhdGlvbicsIHNlbGYubG9jYXRpb24pXG4gICAgICAgICAgLmNvbnN0YW50KCdTTkFQRW52aXJvbm1lbnQnLCBzZWxmLmVudmlyb25tZW50KVxuICAgICAgICAgIC5jb25zdGFudCgnU05BUEhvc3RzJywgc2VsZi5ob3N0cyk7XG5cbiAgICAgICAgaWYgKHNlbGYuaG9zdHMuc3RhdGljLmhvc3QpIHtcbiAgICAgICAgICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdChbICdzZWxmJywgbmV3IFJlZ0V4cCgnLionICsgc2VsZi5ob3N0cy5zdGF0aWMuaG9zdCArICcuKicpIF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgSGVscGVyIG1ldGhvZHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9nZXRQYXJ0aWFsVXJsKG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuaG9zdHMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBob3N0cyBjb25maWd1cmF0aW9uLicpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5sb2NhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGxvY2F0aW9uIGNvbmZpZ3VyYXRpb24uJyk7XG4gICAgfVxuXG4gICAgdmFyIHBhdGggPSB0aGlzLmhvc3RzLnN0YXRpYy5ob3N0ID9cbiAgICAgIGAvLyR7dGhpcy5ob3N0cy5zdGF0aWMuaG9zdH0ke3RoaXMuaG9zdHMuc3RhdGljLnBhdGh9YCA6XG4gICAgICBgJHt0aGlzLmhvc3RzLnN0YXRpYy5wYXRofWA7XG5cbiAgICByZXR1cm4gYCR7cGF0aH1hc3NldHMvJHt0aGlzLmxvY2F0aW9uLnRoZW1lLmxheW91dH0vcGFydGlhbHMvJHtuYW1lfS5odG1sYDtcbiAgfVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyAgU25hcEFwcGxpY2F0aW9uQm9vdHN0cmFwZXJcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG53aW5kb3cuYXBwLlNuYXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyID0gY2xhc3MgU25hcEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIgZXh0ZW5kcyBhcHAuQXBwbGljYXRpb25Cb290c3RyYXBlciB7XG4gIGNvbmZpZ3VyZSgpIHtcbiAgICByZXR1cm4gc3VwZXIuY29uZmlndXJlKCkudGhlbigoKSA9PiB7XG4gICAgICBhbmd1bGFyLm1vZHVsZSgnU05BUEFwcGxpY2F0aW9uJywgW1xuICAgICAgICAnbmdSb3V0ZScsXG4gICAgICAgICduZ0FuaW1hdGUnLFxuICAgICAgICAnbmdUb3VjaCcsXG4gICAgICAgICduZ1Nhbml0aXplJyxcbiAgICAgICAgJ1NOQVAuY29uZmlncycsXG4gICAgICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ1NOQVAuZGlyZWN0aXZlcycsXG4gICAgICAgICdTTkFQLmZpbHRlcnMnLFxuICAgICAgICAnU05BUC5zZXJ2aWNlcydcbiAgICAgIF0pLlxuICAgICAgY29uZmlnKFxuICAgICAgICBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyRyb3V0ZVByb3ZpZGVyJywgJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJyxcbiAgICAgICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlciwgJHNjZURlbGVnYXRlUHJvdmlkZXIpID0+IHtcblxuICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoZmFsc2UpO1xuXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy8nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdIb21lQmFzZUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvbWVudS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdNZW51QmFzZUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2F0ZWdvcnkvOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnQ2F0ZWdvcnlCYXNlQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9pdGVtLzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0l0ZW1CYXNlQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy91cmwvOnVybCcsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ1VybEN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hlY2tvdXQnLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdjaGVja291dCcpLCBjb250cm9sbGVyOiAnQ2hlY2tvdXRDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3NpZ25pbicsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ3NpZ25pbicpLCBjb250cm9sbGVyOiAnU2lnbkluQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9hY2NvdW50JywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnYWNjb3VudCcpLCBjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hhdCcsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ2NoYXQnKSwgY29udHJvbGxlcjogJ0NoYXRDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoYXRtYXAnLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdjaGF0bWFwJyksIGNvbnRyb2xsZXI6ICdDaGF0TWFwQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9zdXJ2ZXknLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdzdXJ2ZXknKSwgY29udHJvbGxlcjogJ1N1cnZleUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoeyByZWRpcmVjdFRvOiAnLycgfSk7XG4gICAgICB9XSk7XG4gICAgfSk7XG4gIH1cblxuICBydW4oKSB7XG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnU05BUEFwcGxpY2F0aW9uJ10pO1xuICB9XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vICBTdGFydHVwQXBwbGljYXRpb25Cb290c3RyYXBlclxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5hcHAuU3RhcnR1cEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIgPSBjbGFzcyBTdGFydHVwQXBwbGljYXRpb25Cb290c3RyYXBlciBleHRlbmRzIGFwcC5BcHBsaWNhdGlvbkJvb3RzdHJhcGVyIHtcbiAgY29uZmlndXJlKCkge1xuICAgIHJldHVybiBzdXBlci5jb25maWd1cmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGFuZ3VsYXIubW9kdWxlKCdTTkFQU3RhcnR1cCcsIFtcbiAgICAgICAgJ25nUm91dGUnLFxuICAgICAgICAnU05BUC5jb25maWdzJyxcbiAgICAgICAgJ1NOQVAuY29udHJvbGxlcnMnLFxuICAgICAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAgICAgJ1NOQVAuZmlsdGVycycsXG4gICAgICAgICdTTkFQLnNlcnZpY2VzJ1xuICAgICAgXSkuXG4gICAgICBjb25maWcoKCkgPT4ge30pO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ1NOQVBTdGFydHVwJ10pO1xuICB9XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vICBTbmFwQXV4aWxpYXJlc0FwcGxpY2F0aW9uQm9vdHN0cmFwZXJcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG53aW5kb3cuYXBwLlNuYXBBdXhpbGlhcmVzQXBwbGljYXRpb25Cb290c3RyYXBlciA9IGNsYXNzIFNuYXBBdXhpbGlhcmVzQXBwbGljYXRpb25Cb290c3RyYXBlciBleHRlbmRzIGFwcC5BcHBsaWNhdGlvbkJvb3RzdHJhcGVyIHtcbiAgY29uZmlndXJlKCkge1xuICAgIHJldHVybiBzdXBlci5jb25maWd1cmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGFuZ3VsYXIubW9kdWxlKCdTTkFQQXV4aWxpYXJlcycsIFtcbiAgICAgICAgJ25nUm91dGUnLFxuICAgICAgICAnbmdBbmltYXRlJyxcbiAgICAgICAgJ25nVG91Y2gnLFxuICAgICAgICAnbmdTYW5pdGl6ZScsXG4gICAgICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICAgICAnU05BUC5jb250cm9sbGVycycsXG4gICAgICAgICdTTkFQLmRpcmVjdGl2ZXMnLFxuICAgICAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAgICAgJ1NOQVAuc2VydmljZXMnXG4gICAgICBdKS5cbiAgICAgIGNvbmZpZyhcbiAgICAgICAgWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsXG4gICAgICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIpID0+IHtcblxuICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoZmFsc2UpO1xuXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy8nLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdjaGF0cm9vbScpLCBjb250cm9sbGVyOiAnQ2hhdFJvb21DdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKHsgcmVkaXJlY3RUbzogJy8nIH0pO1xuICAgICAgfV0pO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ1NOQVBBdXhpbGlhcmVzJ10pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycsIFsnYW5ndWxhci1iYWNvbiddKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvYWNjb3VudC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBbJyRzY29wZScsICdDdXN0b21lck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgQ3VzdG9tZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCB8fCAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ29uc3RhbnRzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFByb2ZpbGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wcm9maWxlID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGU7XG4gICRzY29wZS5jYW5DaGFuZ2VQYXNzd29yZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgdmFyIHByb2ZpbGUgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgncHJvZmlsZScpO1xuXG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAkc2NvcGUucHJvZmlsZSA9IHZhbHVlO1xuICAgICRzY29wZS5jYW5DaGFuZ2VQYXNzd29yZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgICAkc2NvcGUuY2FuQ2hhbmdlRW1haWwgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgU3BsYXNoIHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmVkaXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2ZpbGVlZGl0ID0gYW5ndWxhci5jb3B5KCRzY29wZS5wcm9maWxlKTtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZWRpdFBhc3N3b3JkID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBhc3N3b3JkZWRpdCA9IHtcbiAgICAgIG9sZF9wYXNzd29yZDogJycsXG4gICAgICBuZXdfcGFzc3dvcmQ6ICcnXG4gICAgfTtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5lZGl0UGF5bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UGF5bWVudEVkaXQgPSB0cnVlO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUHJvZmlsZSBlZGl0IHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByb2ZpbGVFZGl0U3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci51cGRhdGVQcm9maWxlKCRzY29wZS5wcm9maWxlZWRpdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wcm9maWxlRWRpdENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBhc3N3b3JkIGVkaXQgc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFzc3dvcmRFZGl0U3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5jaGFuZ2VQYXNzd29yZCgkc2NvcGUucGFzc3dvcmRlZGl0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wYXNzd29yZEVkaXRDYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IGZhbHNlO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9iYWNrZ3JvdW5kLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdCYWNrZ3JvdW5kQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcblxuICBmdW5jdGlvbiBzaG93SW1hZ2VzKHZhbHVlcykge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmltYWdlcyA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaXRlbS5tZWRpYSwgMTkyMCwgMTA4MCwgJ2pwZycpLFxuICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoaXRlbS5tZWRpYSlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGJhY2tncm91bmRzID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmJhY2tncm91bmRzLFxuICAgICAgcGFnZUJhY2tncm91bmRzID0gbnVsbDtcblxuICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmJhY2tncm91bmRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgIGJhY2tncm91bmRzID0gdmFsdWU7XG4gICAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdlZC5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICB2YXIgbmV3UGFnZUJhY2tncm91bmRzID0gU2hlbGxNYW5hZ2VyLmdldFBhZ2VCYWNrZ3JvdW5kcyhsb2NhdGlvbik7XG5cbiAgICBpZiAobmV3UGFnZUJhY2tncm91bmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG5ld1BhZ2VCYWNrZ3JvdW5kcztcbiAgICAgIHNob3dJbWFnZXMocGFnZUJhY2tncm91bmRzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocGFnZUJhY2tncm91bmRzKSB7XG4gICAgICBzd2l0Y2ggKGxvY2F0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbWVudSc6XG4gICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgY2FzZSAnaXRlbSc6XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG51bGw7XG4gICAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jYXJ0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXJ0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRzY2UnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdDaGF0TWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCAkc2NlLCBDdXN0b21lck1hbmFnZXIsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBDaGF0TWFuYWdlcikgPT4ge1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG4gICRzY29wZS5vcHRpb25zID0ge307XG5cbiAgJHNjb3BlLnN0YXRlID0gQ2FydE1vZGVsLmNhcnRTdGF0ZTtcbiAgQ2FydE1vZGVsLmNhcnRTdGF0ZUNoYW5nZWQuYWRkKHN0YXRlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGF0ZSA9IHN0YXRlKSk7XG5cbiAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gdmFsdWUpO1xuXG4gICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLnRvdGFsT3JkZXIgPSB2YWx1ZSk7XG5cbiAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IHRydWU7XG4gICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSB0cnVlO1xuICAkc2NvcGUuY2hlY2tvdXRFbmFibGVkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAkc2NvcGUudmlzaWJsZSA9IENhcnRNb2RlbC5pc0NhcnRPcGVuO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICRzY29wZS5zaG93Q2FydCgpO1xuICAgICRzY29wZS52aXNpYmxlID0gdmFsdWU7XG4gIH0pO1xuXG4gICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgP1xuICAgIExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDpcbiAgICAnVGFibGUnO1xuXG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4gJHNjb3BlLnNlYXRfbmFtZSA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnKTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICB9O1xuICB2YXIgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuICB9O1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG4gIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QoKTtcblxuICAkc2NvcGUuY2FsY3VsYXRlRGVzY3JpcHRpb24gPSBlbnRyeSA9PiB7XG4gICAgdmFyIHJlc3VsdCA9IGVudHJ5Lm5hbWUgfHwgZW50cnkuaXRlbS50aXRsZTtcblxuICAgIHJlc3VsdCArPSBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChvdXRwdXQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICByZXR1cm4gb3V0cHV0ICsgY2F0ZWdvcnkubW9kaWZpZXJzLnJlZHVjZSgob3V0cHV0LCBtb2RpZmllcikgPT4ge1xuICAgICAgICByZXR1cm4gb3V0cHV0ICsgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgP1xuICAgICAgICAgICc8YnIvPi0gJyArIG1vZGlmaWVyLmRhdGEudGl0bGUgOlxuICAgICAgICAgICcnKTtcbiAgICAgIH0sICcnKTtcbiAgICB9LCAnJyk7XG5cbiAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChyZXN1bHQpO1xuICB9O1xuXG4gICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAkc2NvcGUuZWRpdEl0ZW0gPSBlbnRyeSA9PiBDYXJ0TW9kZWwub3BlbkVkaXRvcihlbnRyeSwgZmFsc2UpO1xuICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KGVudHJ5KTtcbiAgJHNjb3BlLnJlb3JkZXJJdGVtID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkuY2xvbmUoKSk7XG5cbiAgJHNjb3BlLnN1Ym1pdENhcnQgPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIHZhciBvcHRpb25zID0gJHNjb3BlLm9wdGlvbnMudG9fZ29fb3JkZXIgPyAyIDogMDtcblxuICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gICAgICAgICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jbGVhckNhcnQgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuY2xlYXJDYXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ2FydCA9ICgpID0+IHtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgICRzY29wZS5zaG93Q2FydCgpO1xuICB9O1xuXG4gICRzY29wZS5zaG93SGlzdG9yeSA9ICgpID0+IENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcbiAgJHNjb3BlLnNob3dDYXJ0ID0gKCkgPT4gQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuXG4gICRzY29wZS5wYXlDaGVjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hlY2tvdXQnIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NhdGVnb3J5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXRlZ29yeUJhc2VDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhdGVnb3J5Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTTkFQRW52aXJvbm1lbnQsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aWxlQ2xhc3NOYW1lID0gU2hlbGxNYW5hZ2VyLnRpbGVTdHlsZTtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoZnVuY3Rpb24odGlsZSwgaSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IHRpbGVDbGFzc05hbWUsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMzcwLCAzNzApICsgJyknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpKSB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHsgY2xhc3NOYW1lOiAndGlsZS10YWJsZScgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIERhdGFNYW5hZ2VyLmNhdGVnb3J5ID0gbG9jYXRpb24udHlwZSA9PT0gJ2NhdGVnb3J5JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5jYXRlZ29yeSk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmNhdGVnb3J5Q2hhbmdlZC5hZGQoZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyxcbiAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllcyB8fCBbXTtcbiAgICB0aWxlcyA9IGRhdGEuaXRlbXMgfHwgW107XG4gICAgdGlsZXMgPSBjYXRlZ29yaWVzLmNvbmNhdCh0aWxlcyk7XG5cbiAgICBpZiAoU05BUEVudmlyb25tZW50LnBsYXRmb3JtICE9PSAnZGVza3RvcCcpIHtcbiAgICAgIHRpbGVzID0gdGlsZXMuZmlsdGVyKHRpbGUgPT4gdGlsZS50eXBlICE9PSAzKTtcbiAgICB9XG5cbiAgICB0aWxlcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS51cmwgPSAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHRpbGUuZGVzdGluYXRpb24pO1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYXRlZ29yeUxpc3QsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQtY2F0ZWdvcnknKVxuICAgICk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTWFuYWdlcicsICdDaGF0TWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIENoYXRNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgU2hlbGxNYW5hZ2VyLCBTTkFQTG9jYXRpb24pID0+IHtcblxuICBpZiAoIVNOQVBMb2NhdGlvbi5jaGF0KSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQTG9jYXRpb24ubG9jYXRpb25fbmFtZTtcblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG5cbiAgJHNjb3BlLmNoYXRFbmFibGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNoYXRFbmFibGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuYWN0aXZlRGV2aWNlcyA9IENoYXRNYW5hZ2VyLm1vZGVsLmFjdGl2ZURldmljZXM7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmFjdGl2ZURldmljZXNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmFjdGl2ZURldmljZXMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcblxuICAkc2NvcGUuZ2lmdERldmljZSA9IENoYXRNYW5hZ2VyLm1vZGVsLmdpZnREZXZpY2U7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnREZXZpY2VDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnREZXZpY2UgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS50b2dnbGVDaGF0ID0gKCkgPT4ge1xuICAgIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCA9ICFDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5NYXAgPSAoKSA9PiB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0bWFwJyB9O1xuICB9O1xuXG4gICRzY29wZS5nZXREZXZpY2VOYW1lID0gZGV2aWNlX3Rva2VuID0+IENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlX3Rva2VuKTtcblxuICAkc2NvcGUuZ2V0U2VhdE51bWJlciA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKGRldmljZV90b2tlbik7XG5cbiAgICBmb3IgKHZhciBwIGluIExvY2F0aW9uTW9kZWwuc2VhdHMpIHtcbiAgICAgIGlmIChMb2NhdGlvbk1vZGVsLnNlYXRzW3BdLnRva2VuID09PSBkZXZpY2Uuc2VhdCkge1xuICAgICAgICBsZXQgbWF0Y2ggPSBMb2NhdGlvbk1vZGVsLnNlYXRzW3BdLm5hbWUubWF0Y2goL1xcZCsvKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gfHwgJycgOiAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ2hhdCA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdvdWxkIGxpa2UgdG8gY2xvc2UgdGhlIGNoYXQgd2l0aCAnICsgJHNjb3BlLmdldERldmljZU5hbWUoZGV2aWNlX3Rva2VuKSArICc/JylcbiAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIENoYXRNYW5hZ2VyLmRlY2xpbmVEZXZpY2UoZGV2aWNlX3Rva2VuKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuZ2V0VW5yZWFkQ291bnQgPSBkZXZpY2VfdG9rZW4gPT4gQ2hhdE1hbmFnZXIuZ2V0VW5yZWFkQ291bnQoZGV2aWNlX3Rva2VuKTtcblxuICAkc2NvcGUuc2VuZEdpZnQgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIHZhciBkZXZpY2UgPSBMb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pLFxuICAgICAgICBzZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KGRldmljZS5zZWF0KTtcblxuICAgIGlmICghc2VhdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShgQXJlIHlvdSBzdXJlIHRoYXQgeW91IHdhbnQgdG8gc2VuZCBhIGdpZnQgdG8gJHtzZWF0Lm5hbWV9P2ApLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuc3RhcnRHaWZ0KGRldmljZV90b2tlbik7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbEdpZnQgPSAoKSA9PiBDaGF0TWFuYWdlci5lbmRHaWZ0KCk7XG5cbiAgQ2hhdE1hbmFnZXIuaXNQcmVzZW50ID0gdHJ1ZTtcblxuICB2YXIgd2F0Y2hMb2NhdGlvbiA9IHRydWU7XG5cbiAgJHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoKSA9PiB7XG4gICAgaWYgKHdhdGNoTG9jYXRpb24pIHtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmlzUHJlc2VudCA9IGZhbHNlO1xuICAgICAgd2F0Y2hMb2NhdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRib3guanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRCb3hDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGF0dHJzJywgJ0NoYXRNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkYXR0cnMsIENoYXRNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsKSB7XG4gIHZhciB0b19kZXZpY2UgPSAkc2NvcGUuZGV2aWNlLFxuICAgICAgdHlwZSA9IHRvX2RldmljZSA/XG4gICAgICAgIENoYXRNYW5hZ2VyLk1FU1NBR0VfVFlQRVMuREVWSUNFIDpcbiAgICAgICAgQ2hhdE1hbmFnZXIuTUVTU0FHRV9UWVBFUy5MT0NBVElPTjtcblxuICB2YXIgZGV2aWNlID0gdG9fZGV2aWNlID8gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9fZGV2aWNlKSA6IG51bGw7XG5cbiAgJHNjb3BlLnJlYWRvbmx5ID0gQm9vbGVhbigkYXR0cnMucmVhZG9ubHkpO1xuICAkc2NvcGUuY2hhdCA9IHt9O1xuICAkc2NvcGUubWVzc2FnZXMgPSBbXTtcblxuICBmdW5jdGlvbiBzaG93TWVzc2FnZXMoKSB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLm1lc3NhZ2VzID0gQ2hhdE1hbmFnZXIubW9kZWwuaGlzdG9yeS5maWx0ZXIobWVzc2FnZSA9PiB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlLnR5cGUgPT09IHR5cGUgJiYgKFxuICAgICAgICAgIG1lc3NhZ2UuZGV2aWNlID09PSB0b19kZXZpY2UgfHxcbiAgICAgICAgICBtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jaGF0RW5hYmxlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jaGF0RW5hYmxlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmlzQ29ubmVjdGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNDb25uZWN0ZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzQ29ubmVjdGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5pc0Nvbm5lY3RlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNlbmRNZXNzYWdlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLmlzQ29ubmVjdGVkIHx8ICEkc2NvcGUuY2hhdC5tZXNzYWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdG9fZGV2aWNlOiB0b19kZXZpY2UsXG4gICAgICB0ZXh0OiAkc2NvcGUuY2hhdC5tZXNzYWdlXG4gICAgfTtcblxuICAgIENoYXRNYW5hZ2VyLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgJHNjb3BlLmNoYXQubWVzc2FnZSA9ICcnO1xuICB9O1xuXG4gICRzY29wZS5nZXRGcm9tTmFtZSA9IG1lc3NhZ2UgPT4gQ2hhdE1hbmFnZXIuZ2V0TWVzc2FnZU5hbWUobWVzc2FnZSk7XG5cbiAgJHNjb3BlLmdldFN0YXR1c1RleHQgPSBtZXNzYWdlID0+IHtcbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgc3dpdGNoKG1lc3NhZ2Uuc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdZb3UgaGF2ZSByZXF1ZXN0ZWQgdG8gY2hhdCB3aXRoICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKG1lc3NhZ2UudG9fZGV2aWNlKTtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQ6XG4gICAgICAgICAgcmV0dXJuICdDbG9zZWQgdGhlIGNoYXQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnR2lmdCByZXF1ZXN0IHNlbnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGEgZ2lmdCc7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHN3aXRjaChtZXNzYWdlLnN0YXR1cykge1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAkc2NvcGUuZ2V0RnJvbU5hbWUobWVzc2FnZSkgKyAnIHdvdWxkIGxpa2UgdG8gY2hhdCB3aXRoIHlvdSc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VEOlxuICAgICAgICAgIHJldHVybiAnQ2xvc2VkIHRoZSBjaGF0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ1dvdWxkIGxpa2UgdG8gc2VuZCB5b3UgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBhIGdpZnQnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuaXNVbnJlYWQgPSBtZXNzYWdlID0+IHtcbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBDaGF0TWFuYWdlci5jaGVja0lmVW5yZWFkKHRvX2RldmljZSwgbWVzc2FnZSk7XG4gIH07XG5cbiAgJHNjb3BlLm1hcmtBc1JlYWQgPSAoKSA9PiB7XG4gICAgaWYgKCF0b19kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDaGF0TWFuYWdlci5tYXJrQXNSZWFkKHRvX2RldmljZSk7XG4gIH07XG5cbiAgJHNjb3BlLm9uS2V5ZG93biA9IGtleWNvZGUgPT4ge1xuICAgIGlmIChrZXljb2RlID09PSAxMykge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zZW5kTWVzc2FnZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIExvY2F0aW9uTW9kZWwuZGV2aWNlc0NoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdHNDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5oaXN0b3J5Q2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgc2hvd01lc3NhZ2VzKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRtYXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRNYXBDdHJsJyxcblsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLFxuKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsKSA9PiB7XG5cbiAgJHNjb3BlLnNlYXRzID0gW107XG5cbiAgJHNjb3BlLm1hcEltYWdlID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzLmxvY2F0aW9uX21hcDtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5tYXBJbWFnZSA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cy5sb2NhdGlvbl9tYXApO1xuICB9KTtcblxuICBmdW5jdGlvbiBidWlsZE1hcCgpIHtcbiAgICBpZiAoIUxvY2F0aW9uTW9kZWwuc2VhdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnNlYXRzID0gTG9jYXRpb25Nb2RlbC5zZWF0c1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKHNlYXQpIHsgcmV0dXJuIHNlYXQudG9rZW4gIT09IExvY2F0aW9uTW9kZWwuc2VhdC50b2tlbjsgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbihzZWF0KSB7XG4gICAgICAgICAgdmFyIGRldmljZXMgPSBMb2NhdGlvbk1vZGVsLmRldmljZXNcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZGV2aWNlKSB7IHJldHVybiBkZXZpY2Uuc2VhdCA9PT0gc2VhdC50b2tlbjsgfSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9rZW46IGRldmljZS50b2tlbixcbiAgICAgICAgICAgICAgICBzZWF0OiBkZXZpY2Uuc2VhdCxcbiAgICAgICAgICAgICAgICBpc19hdmFpbGFibGU6IGRldmljZS5pc19hdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IGRldmljZS51c2VybmFtZVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9rZW46IHNlYXQudG9rZW4sXG4gICAgICAgICAgICBuYW1lOiBzZWF0Lm5hbWUsXG4gICAgICAgICAgICBkZXZpY2VzOiBkZXZpY2VzLFxuICAgICAgICAgICAgbWFwX3Bvc2l0aW9uX3g6IHNlYXQubWFwX3Bvc2l0aW9uX3gsXG4gICAgICAgICAgICBtYXBfcG9zaXRpb25feTogc2VhdC5tYXBfcG9zaXRpb25feSxcbiAgICAgICAgICAgIGlzX2F2YWlsYWJsZTogZGV2aWNlc1xuICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGRldmljZSkgeyByZXR1cm4gZGV2aWNlLmlzX2F2YWlsYWJsZTsgfSlcbiAgICAgICAgICAgICAgLmxlbmd0aCA+IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIExvY2F0aW9uTW9kZWwuZGV2aWNlc0NoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0c0NoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBidWlsZE1hcCgpO1xuXG4gICRzY29wZS5jaG9vc2VTZWF0ID0gZnVuY3Rpb24oc2VhdCkge1xuICAgIHZhciBkZXZpY2UgPSBzZWF0LmRldmljZXNbMF07XG5cbiAgICBpZiAoIXNlYXQuaXNfYXZhaWxhYmxlIHx8ICFkZXZpY2UpIHtcbiAgICAgIHZhciBkZXZpY2VOYW1lID0gZGV2aWNlICYmIGRldmljZS51c2VybmFtZSA/IGRldmljZS51c2VybmFtZSA6IHNlYXQubmFtZTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoZGV2aWNlTmFtZSArICcgaXMgdW5hdmFpbGFibGUgZm9yIGNoYXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDaGF0TWFuYWdlci5hcHByb3ZlRGV2aWNlKGRldmljZS50b2tlbik7XG4gICAgJHNjb3BlLmV4aXRNYXAoKTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdHJvb20uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRSb29tQ3RybCcsXG5bJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnU05BUExvY2F0aW9uJyxcbigkc2NvcGUsICR0aW1lb3V0LCBDaGF0TWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgU05BUExvY2F0aW9uKSA9PiB7XG4gIFxuICBpZiAoIVNOQVBMb2NhdGlvbi5jaGF0KSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQTG9jYXRpb24ubG9jYXRpb25fbmFtZTtcblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dEN0cmwnLFxuICBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdTdXJ2ZXlNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2Vzc2lvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgU3VydmV5TWFuYWdlcikgPT4ge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDb25zdGFudHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrIHNwbGl0IHR5cGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5DSEVDS19TUExJVF9OT05FID0gMDtcbiAgJHNjb3BlLkNIRUNLX1NQTElUX0JZX0lURU1TID0gMTtcbiAgJHNjb3BlLkNIRUNLX1NQTElUX0VWRU5MWSA9IDI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYXltZW50IG1ldGhvZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBUkQgPSAxO1xuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FTSCA9IDI7XG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9QQVlQQUwgPSAzO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVjZWlwdCBtZXRob2RcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9OT05FID0gMDtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMID0gMTtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUyA9IDI7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9QUklOVCA9IDM7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVja291dCBzdGVwXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCA9IDA7XG4gICRzY29wZS5TVEVQX1BBWU1FTlRfTUVUSE9EID0gMTtcbiAgJHNjb3BlLlNURVBfVElQUElORyA9IDI7XG4gICRzY29wZS5TVEVQX1NJR05BVFVSRSA9IDM7XG4gICRzY29wZS5TVEVQX1JFQ0VJUFQgPSA0O1xuICAkc2NvcGUuU1RFUF9DT01QTEVURSA9IDU7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUub3B0aW9ucyA9IHt9O1xuICAkc2NvcGUuZGF0YSA9IFt7XG4gICAgaXRlbXM6IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrXG4gIH1dO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2tcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vQ2hlY2tzIGRhdGFcbiAgdmFyIGRhdGEgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnZGF0YScpO1xuICBkYXRhXG4gIC5jaGFuZ2VzKClcbiAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZS52YWx1ZSkge1xuICAgICAgdmFyIGRhdGEgPSB2YWx1ZS52YWx1ZSgpO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuY291bnQgPSBkYXRhLmxlbmd0aDtcbiAgICB9XG5cbiAgICAkc2NvcGUub3B0aW9ucy5pbmRleCA9IDA7XG4gIH0pO1xuXG4gIC8vTWF4aW11bSBudW1iZXIgb2YgZ3Vlc3RzXG4gICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50X21heCA9IE1hdGgubWF4KFxuICAgIFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQsXG4gICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2sucmVkdWNlKChpLCBpdGVtKSA9PiBpICsgaXRlbS5xdWFudGl0eSwgMClcbiAgKTtcblxuICAvL051bWJlciBvZiBndWVzdHNcbiAgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQgPSBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50O1xuXG4gIC8vQ2hlY2sgc3BsaXQgbW9kZVxuICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9ICRzY29wZS5DSEVDS19TUExJVF9OT05FO1xuXG4gIC8vQ2hlY2sgaW5kZXhcbiAgJHNjb3BlLm9wdGlvbnMuaW5kZXggPSAwO1xuICB2YXIgaW5kZXggPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5pbmRleCcpO1xuICBCYWNvbi5jb21iaW5lQXNBcnJheShpbmRleCwgZGF0YSlcbiAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudCA9ICRzY29wZS5kYXRhWyRzY29wZS5vcHRpb25zLmluZGV4XTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNHdWVzdCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSA9ICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgfHwgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUucGhvbmU7XG4gICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzID9cbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZW1haWwgOlxuICAgICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUuY3VycmVudC5pdGVtcykge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuc3VidG90YWwgPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZSgkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgICAkc2NvcGUuY3VycmVudC50YXggPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVGF4KCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICB9XG5cbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnRpcCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQudGlwID0gMDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTmF2aWdhdGlvblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9DdXJyZW50IHN0ZXBcbiAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50X21heCA+IDEgP1xuICAgICRzY29wZS5TVEVQX0NIRUNLX1NQTElUIDpcbiAgICAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAgIC5za2lwRHVwbGljYXRlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZS52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGVwID0gdmFsdWUudmFsdWUoKTtcblxuICAgICAgaWYgKHN0ZXAgPT09ICRzY29wZS5TVEVQX0NPTVBMRVRFKSB7XG4gICAgICAgIHN0YXJ0TmV4dENoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBNaXNjXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1NlYXQgbmFtZVxuICAkc2NvcGUub3B0aW9ucy5zZWF0ID0gTG9jYXRpb25Nb2RlbC5zZWF0ID8gTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOiAnVGFibGUnO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+IHtcbiAgICAkc2NvcGUub3B0aW9ucy5zZWF0ID0gc2VhdCA/IHNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1Byb2NlZWQgd2l0aCB0aGUgbmV4dCBjaGVja1xuICBmdW5jdGlvbiBzdGFydE5leHRDaGVjaygpIHtcbiAgICB2YXIgY2hlY2sgPSAkc2NvcGUuY3VycmVudDtcblxuICAgIGlmICgkc2NvcGUub3B0aW9ucy5pbmRleCA9PT0gJHNjb3BlLm9wdGlvbnMuY291bnQgLSAxKSB7XG4gICAgICBPcmRlck1hbmFnZXIuY2xlYXJDaGVjaygpO1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7XG4gICAgICAgIHR5cGU6IFN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkID8gJ3N1cnZleScgOiAnaG9tZSdcbiAgICAgIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5pbmRleCsrO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG5cbiAgLy9DYWxjdWxhdGUgYSBjYXJ0IGl0ZW0gdGl0bGVcbiAgJHNjb3BlLmNhbGN1bGF0ZVRpdGxlID0gZW50cnkgPT4gZW50cnkubmFtZSB8fCBlbnRyeS5pdGVtLnRpdGxlO1xuXG4gIC8vQ2FsY3VsYXRlIGEgY2FydCBpdGVtIHByaWNlXG4gICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG5cbiAgLy9DYWxjdWxhdGUgY2FydCBpdGVtcyBwcmljZVxuICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgLy9PdXRwdXQgYSBmb3JtYXR0ZWQgcHJpY2Ugc3RyaW5nXG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSB8fCAwKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnc2lnbmluJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5pbml0aWFsaXplZCA9IHRydWU7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0bWV0aG9kLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dE1ldGhvZEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1vZGVsJywgJ0NhcmRSZWFkZXInLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9nZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTW9kZWwsIENhcmRSZWFkZXIsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlciwgTG9nZ2VyKSA9PiB7XG5cbiAgQ2FyZFJlYWRlci5vblJlY2VpdmVkLmFkZChkYXRhID0+IHtcbiAgICBMb2dnZXIuZGVidWcoYENhcmQgcmVhZGVyIHJlc3VsdDogJHtKU09OLnN0cmluZ2lmeShkYXRhKX1gKTtcbiAgICB2YXIgY2FyZCA9IHtcbiAgICAgIG51bWJlcjogZGF0YS5jYXJkX251bWJlcixcbiAgICAgIG1vbnRoOiBkYXRhLmV4cGlyYXRpb25fbW9udGgsXG4gICAgICB5ZWFyOiBkYXRhLmV4cGlyYXRpb25feWVhcixcbiAgICAgIGRhdGE6IGRhdGEuZGF0YVxuICAgIH07XG5cbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgICBjYXJkRGF0YVJlY2VpdmVkKGNhcmQpO1xuICB9KTtcblxuICBDYXJkUmVhZGVyLm9uRXJyb3IuYWRkKGUgPT4ge1xuICAgIExvZ2dlci5kZWJ1ZyhgQ2FyZCByZWFkZXIgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9DQVJEUkVBREVSX0VSUk9SKTtcbiAgfSk7XG5cbiAgJHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoKSA9PiB7XG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gIH0pO1xuXG4gIC8vR2VuZXJhdGUgYSBwYXltZW50IHRva2VuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUGF5bWVudFRva2VuKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIuZ2VuZXJhdGVQYXltZW50VG9rZW4oKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFBheW1lbnQgdG9rZW4gZ2VuZXJhdGlvbiBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vQ2FsbGVkIHdoZW4gYSBjYXJkIGRhdGEgaXMgcmVjZWl2ZWRcbiAgZnVuY3Rpb24gY2FyZERhdGFSZWNlaXZlZChjYXJkKSB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgT3JkZXJNYW5hZ2VyLmNsZWFyQ2hlY2soJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgICAgJHNjb3BlLmN1cnJlbnQuY2FyZF9kYXRhID0gY2FyZC5kYXRhO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1NJR05BVFVSRTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vQ2hvb3NlIHRvIHBheSB3aXRoIGEgY3JlZGl0IGNhcmRcbiAgJHNjb3BlLnBheUNhcmQgPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FSRDtcbiAgICBDYXJkUmVhZGVyLnN0YXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLnBheUNhcmRDYW5jZWwgPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSB1bmRlZmluZWQ7XG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcGF5IHdpdGggY2FzaFxuICAkc2NvcGUucGF5Q2FzaCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9ICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVNIO1xuXG4gICAgaWYgKE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgIT0gbnVsbCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFJlcXVlc3QgY2xvc2VvdXQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgZ2VuZXJhdGVQYXltZW50VG9rZW4oKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRyZWNlaXB0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFJlY2VpcHRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCBcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIC8vQ2hvb3NlIHRvIGhhdmUgbm8gcmVjZWlwdFxuICAkc2NvcGUucmVjZWlwdE5vbmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9OT05FO1xuICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcmVjZWlwdCBieSBlLW1haWxcbiAgJHNjb3BlLnJlY2VpcHRFbWFpbCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHJlY2VpcHQgYnkgc21zXG4gICRzY29wZS5yZWNlaXB0U21zID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVM7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcHJpbnRlZCByZWNlaXB0XG4gICRzY29wZS5yZWNlaXB0UHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9QUklOVDtcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RSZWNlaXB0KCkge1xuICAgIHZhciBpdGVtID0gJHNjb3BlLmN1cnJlbnQ7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGNoZWNrb3V0X3Rva2VuOiBpdGVtLmNoZWNrb3V0X3Rva2VuLFxuICAgICAgcmVjZWlwdF9tZXRob2Q6IGl0ZW0ucmVjZWlwdF9tZXRob2RcbiAgICB9O1xuXG4gICAgaWYgKGl0ZW0ucmVjZWlwdF9tZXRob2QgPT09ICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTCkge1xuICAgICAgcmVxdWVzdC5yZWNlaXB0X2VtYWlsID0gaXRlbS5yZWNlaXB0X2VtYWlsO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLnJlY2VpcHRfbWV0aG9kID09PSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TKSB7XG4gICAgICByZXF1ZXN0LnJlY2VpcHRfcGhvbmUgPSBpdGVtLnJlY2VpcHRfcGhvbmU7XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHNpZ25hdHVyZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRTaWduYXR1cmVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9nZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlciwgTG9nZ2VyKSA9PiB7XG5cbiAgLy9DbGVhciB0aGUgY3VycmVudCBzaWduYXR1cmVcbiAgdmFyIHJlc2V0U2lnbmF0dXJlID0gKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5jdXJyZW50LnNpZ25hdHVyZV90b2tlbiA9IHVuZGVmaW5lZDtcblxuICAgICAgdmFyIHNpZ25hdHVyZSA9ICQoJyNjaGVja291dC1zaWduYXR1cmUtaW5wdXQnKTtcbiAgICAgIHNpZ25hdHVyZS5lbXB0eSgpO1xuICAgICAgc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2luaXQnLCB7XG4gICAgICAgICdjb2xvcicgOiAnIzAwMCcsXG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZmYnLFxuICAgICAgICAnZGVjb3ItY29sb3InOiAnI2ZmZicsXG4gICAgICAgICd3aWR0aCc6ICcxMDAlJyxcbiAgICAgICAgJ2hlaWdodCc6ICcyMDBweCdcbiAgICAgIH0pO1xuICAgIH0sIDMwMCk7XG4gIH07XG5cbiAgLy9TdWJtaXQgdGhlIGN1cnJlbnQgc2lnbmF0dXJlIGlucHV0XG4gICRzY29wZS5zaWduYXR1cmVTdWJtaXQgPSAoKSA9PiB7XG4gICAgdmFyIHNpZ25hdHVyZSA9ICQoJyNjaGVja291dC1zaWduYXR1cmUtaW5wdXQnKTtcblxuICAgIGlmIChzaWduYXR1cmUualNpZ25hdHVyZSgnZ2V0RGF0YScsICduYXRpdmUnKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgIHZhciBzaWcgPSBzaWduYXR1cmUualNpZ25hdHVyZSgnZ2V0RGF0YScsICdpbWFnZScpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnVwbG9hZFNpZ25hdHVyZShzaWdbMV0pLnRoZW4odG9rZW4gPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50LnNpZ25hdHVyZV90b2tlbiA9IHRva2VuO1xuICAgICAgICBjb21wbGV0ZUNoZWNrb3V0KCk7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgU2lnbmF0dXJlIHVwbG9hZCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvL0NhbmNlbCB0aGUgY3VycmVudCBzaWduYXR1cmUgaW5wdXRcbiAgJHNjb3BlLnNpZ25hdHVyZUNhbmNlbCA9ICgpID0+IHtcbiAgICByZXNldFNpZ25hdHVyZSgpO1xuICB9O1xuXG4gIC8vQ29tcGxldGUgdGhlIGNoZWNrb3V0XG4gIGZ1bmN0aW9uIGNvbXBsZXRlQ2hlY2tvdXQoKSB7XG4gICAgdmFyIGl0ZW0gPSAkc2NvcGUuY3VycmVudDtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBhbW91bnRfc3VidG90YWw6IGl0ZW0uc3VidG90YWwsXG4gICAgICBhbW91bnRfdGF4OiBpdGVtLnRheCxcbiAgICAgIGFtb3VudF90aXA6IGl0ZW0udGlwLFxuICAgICAgY2FyZF9kYXRhOiBpdGVtLmNhcmRfZGF0YSxcbiAgICAgIHNpZ25hdHVyZV90b2tlbjogaXRlbS5zaWduYXR1cmVfdG9rZW4sXG4gICAgICBvcmRlcl90b2tlbnM6IGl0ZW0uaXRlbXMgIT0gbnVsbCA/XG4gICAgICAgIGl0ZW0uaXRlbXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaXRlbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtLnF1YW50aXR5OyBpKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbS5yZXF1ZXN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9LCBbXSlcbiAgICAgICAgOiBudWxsXG4gICAgfTtcblxuICAgIE9yZGVyTWFuYWdlci5wYXlPcmRlcihyZXF1ZXN0KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuXG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5jdXJyZW50LmNoZWNrb3V0X3Rva2VuID0gcmVzdWx0LnRva2VuO1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfUkVDRUlQVDtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBPcmRlciBwYXltZW50IGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgLnNraXBEdXBsaWNhdGVzKClcbiAgLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgaWYgKCF2YWx1ZS52YWx1ZSB8fCB2YWx1ZS52YWx1ZSgpICE9PSAkc2NvcGUuU1RFUF9TSUdOQVRVUkUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXNldFNpZ25hdHVyZSgpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRzcGxpdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRTcGxpdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdPcmRlck1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgLy9TcGxpdCB0aGUgY3VycmVudCBvcmRlciBpbiB0aGUgc2VsZWN0ZWQgd2F5XG4gICRzY29wZS5zcGxpdENoZWNrID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBpLCBkYXRhID0gW107XG5cbiAgICBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkUpIHtcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGl0ZW1zOiBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfRVZFTkxZKSB7XG4gICAgICB2YXIgY2hlY2sgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjayxcbiAgICAgICAgICBzdWJ0b3RhbCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGNoZWNrKSxcbiAgICAgICAgICB0YXggPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVGF4KGNoZWNrKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICBzdWJ0b3RhbDogTWF0aC5yb3VuZCgoc3VidG90YWwgLyAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCkgKiAxMDApIC8gMTAwLFxuICAgICAgICAgIHRheDogTWF0aC5yb3VuZCgodGF4IC8gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQpICogMTAwKSAvIDEwMFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9CWV9JVEVNUykge1xuICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcyA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLnNsaWNlKDApLm1hcChpdGVtID0+IGl0ZW0uY2xvbmUoKSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLiRwYXJlbnQuZGF0YSA9IGRhdGE7XG4gICAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSB0eXBlO1xuICB9O1xuXG4gIC8vTW92ZSBhbiBpdGVtIHRvIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5hZGRUb0NoZWNrID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSAkc2NvcGUuc3BsaXRfaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgIT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLnF1YW50aXR5ID4gMSkge1xuICAgICAgICBpdGVtLnF1YW50aXR5LS07XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pXG4gICAgLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtICE9IG51bGw7IH0pO1xuXG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSAkc2NvcGUuY3VycmVudC5pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCA9PT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICBleGlzdHMgPSB0cnVlO1xuICAgICAgICBpdGVtLnF1YW50aXR5Kys7XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHZhciBjbG9uZSA9IGVudHJ5LmNsb25lKCk7XG4gICAgICBjbG9uZS5xdWFudGl0eSA9IDE7XG5cbiAgICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLnB1c2goY2xvbmUpO1xuICAgIH1cbiAgfTtcblxuICAvL1JlbW92ZSBhbiBpdGVtIGZyb20gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLnJlbW92ZUZyb21DaGVjayA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSAkc2NvcGUuY3VycmVudC5pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCAhPT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ucXVhbnRpdHkgPiAxKSB7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHktLTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gIT0gbnVsbDsgfSk7XG5cbiAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSAkc2NvcGUuc3BsaXRfaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgPT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5xdWFudGl0eSsrO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KTtcblxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB2YXIgY2xvbmUgPSBlbnRyeS5jbG9uZSgpO1xuICAgICAgY2xvbmUucXVhbnRpdHkgPSAxO1xuXG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMucHVzaChjbG9uZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vTW92ZSBhbGwgYXZhaWxhYmxlIGl0ZW1zIHRvIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5hZGRBbGxUb0NoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goJHNjb3BlLmFkZFRvQ2hlY2spO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihuZXdpdGVtKSB7XG4gICAgICAgIGlmIChuZXdpdGVtLnJlcXVlc3QgPT09IGl0ZW0ucmVxdWVzdCkge1xuICAgICAgICAgIG5ld2l0ZW0ucXVhbnRpdHkgKz0gaXRlbS5xdWFudGl0eTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSBbXTtcbiAgfTtcblxuICAvL1JlbW92ZSBhbGwgaXRlbXMgZnJvbSB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUucmVtb3ZlQWxsRnJvbUNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaCgkc2NvcGUucmVtb3ZlRnJvbUNoZWNrKTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goZnVuY3Rpb24obmV3aXRlbSkge1xuICAgICAgICBpZiAobmV3aXRlbS5yZXF1ZXN0ID09PSBpdGVtLnJlcXVlc3QpIHtcbiAgICAgICAgICBuZXdpdGVtLnF1YW50aXR5ICs9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSBbXTtcbiAgfTtcblxuICAvL1Byb2NlZWQgd2l0aCB0aGUgbmV4dCBjaGVjayBzcGxpdHRpbmdcbiAgJHNjb3BlLnNwbGl0TmV4dENoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5vcHRpb25zLmluZGV4IDwgJHNjb3BlLm9wdGlvbnMuY291bnQgLSAxICYmICRzY29wZS5zcGxpdF9pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5pbmRleCsrO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUuc3BsaXRfaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgJHNjb3BlLmFkZEFsbFRvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS4kcGFyZW50LmRhdGEgPSAkc2NvcGUuJHBhcmVudC5kYXRhLmZpbHRlcihmdW5jdGlvbihjaGVjaykge1xuICAgICAgICByZXR1cm4gY2hlY2suaXRlbXMubGVuZ3RoID4gMDtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAuc2tpcER1cGxpY2F0ZXMoKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZS52YWx1ZSB8fCB2YWx1ZS52YWx1ZSgpICE9PSAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0dGlwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFRpcEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdPcmRlck1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBPcmRlck1hbmFnZXIpIHtcblxuICAvL0FkZCBhIHRpcFxuICAkc2NvcGUuYWRkVGlwID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgJHNjb3BlLmN1cnJlbnQudGlwID0gTWF0aC5yb3VuZCgoJHNjb3BlLmN1cnJlbnQuc3VidG90YWwgKiBhbW91bnQpICogMTAwKSAvIDEwMDtcbiAgfTtcblxuICAvL0FwcGx5IHRoZSBzZWxlY3RlZCB0aXAgYW1vdW50IGFuZCBwcm9jZWVkIGZ1cnRoZXJcbiAgJHNjb3BlLmFwcGx5VGlwID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1BBWU1FTlRfTUVUSE9EO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9ib290LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kQm9vdCcsXG4gIFsnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTWFuYWdlcicsXG4gIChBdXRoZW50aWNhdGlvbk1hbmFnZXIsIExvY2F0aW9uTWFuYWdlcikgPT4ge1xuXG4gIGZ1bmN0aW9uIGxvYWRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gTG9jYXRpb25NYW5hZ2VyLmxvYWRDb25maWcoKVxuICAgICAgLnRoZW4oKCkgPT4gTG9jYXRpb25NYW5hZ2VyLmxvYWRTZWF0cygpKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQXV0aGVudGljYXRpb25NYW5hZ2VyLnZhbGlkYXRlKCkudGhlbihhdXRob3JpemVkID0+IHtcbiAgICAgIGlmIChhdXRob3JpemVkID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gQXV0aGVudGljYXRpb25NYW5hZ2VyLmF1dGhvcml6ZSgpLnRoZW4oKCkgPT4gbG9hZExvY2F0aW9uKCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbG9hZExvY2F0aW9uKCk7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2N1c3RvbWVyZ3Vlc3Rsb2dpbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEN1c3RvbWVyR3Vlc3RMb2dpbicsXG4gIFsnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsXG4gIChBdXRoZW50aWNhdGlvbk1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQ3VzdG9tZXJNYW5hZ2VyLmd1ZXN0TG9naW4oKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvY3VzdG9tZXJsb2dpbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEN1c3RvbWVyTG9naW4nLFxuICBbJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLFxuICAoQXV0aGVudGljYXRpb25NYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIpID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICByZXR1cm4gQXV0aGVudGljYXRpb25NYW5hZ2VyLmN1c3RvbWVyTG9naW5SZWd1bGFyKGNyZWRlbnRpYWxzKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBDdXN0b21lck1hbmFnZXIubG9naW4oY3JlZGVudGlhbHMpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9jdXN0b21lcnNpZ251cC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEN1c3RvbWVyU2lnbnVwJyxcbiAgWydBdXRoZW50aWNhdGlvbk1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJyxcbiAgKEF1dGhlbnRpY2F0aW9uTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHJlZ2lzdHJhdGlvbikge1xuICAgIHJldHVybiBDdXN0b21lck1hbmFnZXIuc2lnblVwKHJlZ2lzdHJhdGlvbikudGhlbigoKSA9PiB7XG4gICAgICB2YXIgY3JlZGVudGlhbHMgPSB7XG4gICAgICAgIGxvZ2luOiByZWdpc3RyYXRpb24udXNlcm5hbWUsXG4gICAgICAgIHBhc3N3b3JkOiByZWdpc3RyYXRpb24ucGFzc3dvcmRcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBBdXRoZW50aWNhdGlvbk1hbmFnZXIuY3VzdG9tZXJMb2dpblJlZ3VsYXIoY3JlZGVudGlhbHMpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXR1cm4gQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKGNyZWRlbnRpYWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9jdXN0b21lcnNvY2lhbGxvZ2luLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbicsXG4gIFsnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdTb2NpYWxNYW5hZ2VyJyxcbiAgKEF1dGhlbnRpY2F0aW9uTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBTb2NpYWxNYW5hZ2VyKSA9PiB7XG5cbiAgZnVuY3Rpb24gZG9Mb2dpbihhdXRoKSB7XG4gICAgcmV0dXJuIEF1dGhlbnRpY2F0aW9uTWFuYWdlci5jdXN0b21lckxvZ2luU29jaWFsKGF1dGgpLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIEN1c3RvbWVyTWFuYWdlci5sb2dpblNvY2lhbChhdXRoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZmFjZWJvb2s6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFNvY2lhbE1hbmFnZXIubG9naW5GYWNlYm9vaygpLnRoZW4oZG9Mb2dpbik7XG4gICAgfSxcbiAgICBnb29nbGVwbHVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBTb2NpYWxNYW5hZ2VyLmxvZ2luR29vZ2xlUGx1cygpLnRoZW4oZG9Mb2dpbik7XG4gICAgfSxcbiAgICB0d2l0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBTb2NpYWxNYW5hZ2VyLmxvZ2luVHdpdHRlcigpLnRoZW4oZG9Mb2dpbik7XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9mbGlwc2NyZWVuLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kRmxpcFNjcmVlbicsIFsnTWFuYWdlbWVudFNlcnZpY2UnLCBmdW5jdGlvbihNYW5hZ2VtZW50U2VydmljZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uucm90YXRlU2NyZWVuKCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3Jlc2V0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kUmVzZXQnLCBbJ0FuYWx5dGljc01hbmFnZXInLCAnQ2hhdE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ0xvZ2dlcicsIGZ1bmN0aW9uKEFuYWx5dGljc01hbmFnZXIsIENoYXRNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU2Vzc2lvbk1hbmFnZXIsIFN1cnZleU1hbmFnZXIsIE1hbmFnZW1lbnRTZXJ2aWNlLCBMb2dnZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIGZhaWwoZSkge1xuICAgICAgTG9nZ2VyLndhcm4oJ1VuYWJsZSB0byByZXNldCBwcm9wZXJseTogJyArIGUubWVzc2FnZSk7XG4gICAgICBNYW5hZ2VtZW50U2VydmljZS5yZXNldCgpO1xuICAgIH1cblxuICAgIFNlc3Npb25NYW5hZ2VyLmVuZFNlc3Npb24oKTtcblxuICAgIEFuYWx5dGljc01hbmFnZXIuc3VibWl0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIFN1cnZleU1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgQ2hhdE1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBNYW5hZ2VtZW50U2VydmljZS5yZXNldCgpO1xuICAgICAgICAgICAgfSwgZmFpbCk7XG4gICAgICAgICAgfSwgZmFpbCk7XG4gICAgICAgIH0sIGZhaWwpO1xuICAgICAgfSwgZmFpbCk7XG4gICAgfSwgZmFpbCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3N0YXJ0dXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRTdGFydHVwJyxcbiAgWydMb2dnZXInLCAnQXBwQ2FjaGUnLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsXG4gIChMb2dnZXIsIEFwcENhY2hlLCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU3VydmV5TWFuYWdlciwgU05BUExvY2F0aW9uKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzdWx0LCByZWplY3QpID0+IHtcblxuICAgICAgZnVuY3Rpb24gZmFpbChlKSB7XG4gICAgICAgIExvZ2dlci53YXJuKGBVbmFibGUgdG8gc3RhcnR1cCBwcm9wZXJseTogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhY2hlQ29tcGxldGUodXBkYXRlZCkge1xuICAgICAgICBpZiAodXBkYXRlZCkge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgRGF0YU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChBcHBDYWNoZS5pc1VwZGF0ZWQpIHtcbiAgICAgICAgY2FjaGVDb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCgpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoQXBwQ2FjaGUuaXNDb21wbGV0ZSkge1xuICAgICAgICBjYWNoZUNvbXBsZXRlKGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgQXBwQ2FjaGUuY29tcGxldGUuYWRkKGNhY2hlQ29tcGxldGUpO1xuXG4gICAgICBTaGVsbE1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3NpZ25pbicgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIEN1c3RvbWVyTWFuYWdlci5ndWVzdExvZ2luKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQoKTsgICAgXG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3N1Ym1pdG9yZGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kU3VibWl0T3JkZXInLFxuICBbJ0RpYWxvZ01hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdPcmRlck1hbmFnZXInLFxuICAoRGlhbG9nTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoIUxvY2F0aW9uTW9kZWwuc2VhdCB8fCAhTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0VSUk9SX05PX1NFQVQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCAwO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQob3B0aW9ucykudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZGlhbG9nLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdEaWFsb2dDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ0RpYWxvZ01hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBEaWFsb2dNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIGFsZXJ0U3RhY2sgPSBbXSxcbiAgICAgIGNvbmZpcm1TdGFjayA9IFtdO1xuICB2YXIgYWxlcnRJbmRleCA9IC0xLFxuICAgICAgY29uZmlybUluZGV4ID0gLTE7XG4gIHZhciBhbGVydFRpbWVyO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpc2liaWxpdHkoaXNCdXN5LCBzaG93QWxlcnQsIHNob3dDb25maXJtKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaXNCdXN5ID0gaXNCdXN5ICE9PSB1bmRlZmluZWQgPyBpc0J1c3kgOiAkc2NvcGUuaXNCdXN5O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IHNob3dBbGVydCAhPT0gdW5kZWZpbmVkID8gc2hvd0FsZXJ0IDogJHNjb3BlLnNob3dBbGVydDtcbiAgICAgICRzY29wZS5zaG93Q29uZmlybSA9IHNob3dDb25maXJtICE9PSB1bmRlZmluZWQgPyBzaG93Q29uZmlybSA6ICRzY29wZS5zaG93Q29uZmlybTtcbiAgICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmlzQnVzeSB8fCAkc2NvcGUuc2hvd0FsZXJ0IHx8ICRzY29wZS5zaG93Q29uZmlybTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dOZXh0QWxlcnQoKSB7XG4gICAgaWYgKGFsZXJ0VGltZXIpIHtcbiAgICAgICR0aW1lb3V0LmNhbmNlbChhbGVydFRpbWVyKTtcbiAgICB9XG5cbiAgICB2YXIgYWxlcnQgPSBhbGVydFN0YWNrW2FsZXJ0SW5kZXhdO1xuXG4gICAgaWYgKGFsZXJ0ICYmIGFsZXJ0LnJlc29sdmUpIHtcbiAgICAgIGFsZXJ0LnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICBhbGVydEluZGV4Kys7XG5cbiAgICBpZiAoYWxlcnRJbmRleCA9PT0gYWxlcnRTdGFjay5sZW5ndGgpIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICBhbGVydFN0YWNrID0gW107XG4gICAgICBhbGVydEluZGV4ID0gLTE7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuYWxlcnRUaXRsZSA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF0udGl0bGU7XG4gICAgICAkc2NvcGUuYWxlcnRUZXh0ID0gYWxlcnRTdGFja1thbGVydEluZGV4XS5tZXNzYWdlO1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgYWxlcnRUaW1lciA9ICR0aW1lb3V0KHNob3dOZXh0QWxlcnQsIDEwMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dOZXh0Q29uZmlybSgpIHtcbiAgICBjb25maXJtSW5kZXgrKztcblxuICAgIGlmIChjb25maXJtSW5kZXggPT09IGNvbmZpcm1TdGFjay5sZW5ndGgpIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIGNvbmZpcm1TdGFjayA9IFtdO1xuICAgICAgY29uZmlybUluZGV4ID0gLTE7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuY29uZmlybVRleHQgPSBjb25maXJtU3RhY2tbY29uZmlybUluZGV4XS5tZXNzYWdlO1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICAgICAgY2FzZSBBTEVSVF9HRU5FUklDX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT29wcyEgTXkgYml0cyBhcmUgZmlkZGxlZC4gT3VyIHJlcXVlc3Qgc3lzdGVtIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC4gUGxlYXNlIG5vdGlmeSBhIHNlcnZlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPb3BzISBNeSBiaXRzIGFyZSBmaWRkbGVkLiBPdXIgcmVxdWVzdCBzeXN0ZW0gaGFzIGJlZW4gZGlzY29ubmVjdGVkLiBQbGVhc2Ugbm90aWZ5IGEgc2VydmVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkNhbGwgU2VydmVyIHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5LlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIHJlcXVlc3QgZm9yIHNlcnZlciBhc3Npc3RhbmNlIGhhcyBiZWVuIHNlZW4sIGFuZCBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWVzdCBjaGVjayByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgY2hlY2sgcmVxdWVzdCBoYXMgYmVlbiBzZWVuLCBhbmQgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9yZGVyIHNlbnQhIFlvdSB3aWxsIGJlIG5vdGlmaWVkIHdoZW4geW91ciB3YWl0ZXIgYWNjZXB0cyB0aGUgb3JkZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfT1JERVJfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIG9yZGVyIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfU0lHTklOX1JFUVVJUkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91IG11c3QgYmUgbG9nZ2VkIGludG8gU05BUCB0byBhY2Nlc3MgdGhpcyBwYWdlLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9BU1NJU1RBTkNFOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNhbGwgdGhlIHdhaXRlcj9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfQ0xPU0VPVVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVxdWVzdCB5b3VyIGNoZWNrP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9SRVNFVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldD9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfREVMRVRfQ0FSRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgdGhpcyBwYXltZW50IG1ldGhvZD9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEU6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBIGxpbmsgdG8gY2hhbmdlIHlvdXIgcGFzc3dvcmQgaGFzIGJlZW4gZW1haWxlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfU09GVFdBUkVfT1VUREFURUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBIHNvZnR3YXJlIHVwZGF0ZSBpcyBhdmFpbGFibGUuIFBsZWFzZSByZXN0YXJ0IHRoZSBhcHBsaWNhdGlvbi5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfQ0FSRFJFQURFUl9FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlVuYWJsZSB0byByZWFkIHRoZSBjYXJkIGRhdGEuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0VSUk9SX05PX1NFQVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJEZXZpY2UgaXMgbm90IGFzc2lnbmVkIHRvIGFueSB0YWJsZS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfRVJST1JfU1RBUlRVUDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlVuYWJsZSB0byBzdGFydCB0aGUgYXBwbGljYXRpb24uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG4gICRzY29wZS5pc0J1c3kgPSBmYWxzZTtcbiAgJHNjb3BlLnNob3dBbGVydCA9IGZhbHNlO1xuICAkc2NvcGUuc2hvd0NvbmZpcm0gPSBmYWxzZTtcblxuICAkc2NvcGUuY2xvc2VBbGVydCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIHNob3dOZXh0QWxlcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDb25maXJtID0gY29uZmlybWVkID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgdmFyIGNvbmZpcm0gPSBjb25maXJtU3RhY2tbY29uZmlybUluZGV4XTtcblxuICAgIGlmIChjb25maXJtKSB7XG4gICAgICBpZiAoY29uZmlybWVkKSB7XG4gICAgICAgIGlmIChjb25maXJtLnJlc29sdmUpIHtcbiAgICAgICAgICBjb25maXJtLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjb25maXJtLnJlamVjdCkge1xuICAgICAgICAgIGNvbmZpcm0ucmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93TmV4dENvbmZpcm0oKTtcbiAgfTtcblxuICBmdW5jdGlvbiBhbGVydFJlcXVlc3RlZChtZXNzYWdlLCB0aXRsZSwgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgbWVzc2FnZSA9IGdldE1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICBhbGVydFN0YWNrLnB1c2goeyB0aXRsZTogdGl0bGUsIG1lc3NhZ2U6IG1lc3NhZ2UsIHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0IH0pO1xuXG4gICAgaWYgKCEkc2NvcGUuc2hvd0FsZXJ0KSB7XG4gICAgICAkdGltZW91dChzaG93TmV4dEFsZXJ0KTtcbiAgICB9XG4gIH1cblxuICBEaWFsb2dNYW5hZ2VyLmFsZXJ0UmVxdWVzdGVkLmFkZChhbGVydFJlcXVlc3RlZCk7XG5cbiAgZnVuY3Rpb24gY29uZmlybVJlcXVlc3RlZChtZXNzYWdlLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICBtZXNzYWdlID0gZ2V0TWVzc2FnZShtZXNzYWdlKTtcblxuICAgIGNvbmZpcm1TdGFjay5wdXNoKHsgbWVzc2FnZTogbWVzc2FnZSwgcmVzb2x2ZTogcmVzb2x2ZSwgcmVqZWN0OiByZWplY3QgfSk7XG5cbiAgICBpZiAoISRzY29wZS5zaG93Q29uZmlybSkge1xuICAgICAgJHRpbWVvdXQoc2hvd05leHRDb25maXJtKTtcbiAgICB9XG4gIH1cblxuICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm1SZXF1ZXN0ZWQuYWRkKGNvbmZpcm1SZXF1ZXN0ZWQpO1xuXG4gIGZ1bmN0aW9uIGpvYlN0YXJ0ZWQoKSB7XG4gICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gZG9jdW1lbnQuYm9keSkge1xuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlVmlzaWJpbGl0eSh0cnVlKTtcbiAgfVxuXG4gIERpYWxvZ01hbmFnZXIuam9iU3RhcnRlZC5hZGQoam9iU3RhcnRlZCk7XG4gIERpYWxvZ01hbmFnZXIuam9iRW5kZWQuYWRkKGZ1bmN0aW9uKCkge1xuICAgIHVwZGF0ZVZpc2liaWxpdHkoZmFsc2UpO1xuICB9KTtcblxuICBpZiAoRGlhbG9nTWFuYWdlci5qb2JzID4gMCkge1xuICAgIGpvYlN0YXJ0ZWQoKTtcbiAgfVxufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9hZHZlcnRpc2VtZW50LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0FkdmVydGlzZW1lbnRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ0FuYWx5dGljc01vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdDb21tYW5kUmVzZXQnLCAnQ29tbWFuZEZsaXBTY3JlZW4nLCAnU2hlbGxNYW5hZ2VyJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgQW5hbHl0aWNzTW9kZWwsIGhlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgQ29tbWFuZFJlc2V0LCBDb21tYW5kRmxpcFNjcmVlbiwgU2hlbGxNYW5hZ2VyLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50Q2xpY2sgPSBpdGVtID0+IHtcbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICB0eXBlOiAnY2xpY2snXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbS5ocmVmKSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3VybCcsIHVybDogaXRlbS5ocmVmLnVybCB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudEltcHJlc3Npb24gPSBpdGVtID0+IHtcbiAgICBpZiAoQWN0aXZpdHlNb25pdG9yLmFjdGl2ZSAmJiAkc2NvcGUudmlzaWJsZSkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuYWR2ZXJ0aXNlbWVudHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IGRhdGEubWFpblxuICAgICAgICAubWFwKGFkID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoYWQuc3JjLCA5NzAsIDkwKSxcbiAgICAgICAgICAgIGhyZWY6IGFkLmhyZWYsXG4gICAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGFkLnNyYyksXG4gICAgICAgICAgICB0b2tlbjogYWQudG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgICRzY29wZS52aXNpYmxlID0gbG9jYXRpb24udHlwZSA9PT0gJ2hvbWUnO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9jYXJ0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ0dhbGF4aWVzQ2FydEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICckc2NlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnQ2hhdE1hbmFnZXInLFxuICAgICgkc2NvcGUsICR0aW1lb3V0LCAkc2NlLCBDdXN0b21lck1hbmFnZXIsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBDaGF0TWFuYWdlcikgPT4ge1xuXG4gICAgICAkc2NvcGUuU1RBVEVfQ0FSVCA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgICAgJHNjb3BlLlNUQVRFX0hJU1RPUlkgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcblxuICAgICAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgICAgICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG4gICAgICAkc2NvcGUub3B0aW9ucyA9IHt9O1xuXG4gICAgICAkc2NvcGUuY3VycmVuY3kgPSBTaGVsbE1hbmFnZXIubW9kZWwuY3VycmVuY3k7XG4gICAgICBTaGVsbE1hbmFnZXIubW9kZWwuY3VycmVuY3lDaGFuZ2VkLmFkZChjdXJyZW5jeSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VycmVuY3kgPSBjdXJyZW5jeSkpO1xuXG4gICAgICAkc2NvcGUuc3RhdGUgPSBDYXJ0TW9kZWwuY2FydFN0YXRlO1xuICAgICAgQ2FydE1vZGVsLmNhcnRTdGF0ZUNoYW5nZWQuYWRkKHN0YXRlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGF0ZSA9IHN0YXRlKSk7XG5cbiAgICAgICRzY29wZS5lZGl0YWJsZUl0ZW0gPSBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtO1xuICAgICAgQ2FydE1vZGVsLmVkaXRhYmxlSXRlbUNoYW5nZWQuYWRkKGl0ZW0gPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmVkaXRhYmxlSXRlbSA9IGl0ZW0pKTtcblxuICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IHZhbHVlKTtcblxuICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLnRvdGFsT3JkZXIgPSB2YWx1ZSk7XG5cbiAgICAgICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gICAgICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gICAgICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICAgICAgJHNjb3BlLnZpc2libGUgPSBDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcblxuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgICAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgICAgICAgQ2FydE1vZGVsLmNsb3NlRWRpdG9yKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAgICAgJHNjb3BlLnNob3dDYXJ0KCk7XG4gICAgICAgICRzY29wZS52aXNpYmxlID0gdmFsdWU7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLnNlYXRfbmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/XG4gICAgICAgIExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDpcbiAgICAgICAgJ1RhYmxlJztcblxuICAgICAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiAkc2NvcGUuc2VhdF9uYW1lID0gc2VhdCA/IHNlYXQubmFtZSA6ICdUYWJsZScpO1xuXG4gICAgICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QgPT0gbnVsbDtcbiAgICAgIH07XG4gICAgICB2YXIgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgPT0gbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG5cbiAgICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICAgICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgPT0gbnVsbDtcblxuICAgICAgJHNjb3BlLmdldE1vZGlmaWVycyA9IGVudHJ5ID0+IHtcbiAgICAgICAgaWYgKCFlbnRyeS5tb2RpZmllcnMpIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZW50cnkubW9kaWZpZXJzLnJlZHVjZSgocmVzdWx0LCBjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgIGxldCBtb2RpZmllcnMgPSBjYXRlZ29yeS5tb2RpZmllcnMuZmlsdGVyKG1vZGlmaWVyID0+IG1vZGlmaWVyLmlzU2VsZWN0ZWQpO1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobW9kaWZpZXJzKTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCBbXSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2FsY3VsYXRlUHJpY2UgPSBlbnRyeSA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuICAgICAgJHNjb3BlLmNhbGN1bGF0ZVRvdGFsUHJpY2UgPSBlbnRyaWVzID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpO1xuXG4gICAgICAkc2NvcGUuZWRpdEl0ZW0gPSBlbnRyeSA9PiBDYXJ0TW9kZWwub3BlbkVkaXRvcihlbnRyeSwgZmFsc2UpO1xuXG4gICAgICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gKGNhdGVnb3J5LCBtb2RpZmllcikgPT4ge1xuICAgICAgICBpZiAoY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBtID0+IG0uaXNTZWxlY3RlZCA9IChtID09PSBtb2RpZmllcikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJlbW92ZUZyb21DYXJ0ID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydChlbnRyeSk7XG4gICAgICAkc2NvcGUucmVvcmRlckl0ZW0gPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChlbnRyeS5jbG9uZSgpKTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdENhcnQgPSAoKSA9PiB7XG4gICAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSAkc2NvcGUub3B0aW9ucy50b0dvID8gMiA6IDA7XG5cbiAgICAgICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQob3B0aW9ucykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgICAgICAgICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gICAgICAgICAgICAkc2NvcGUub3B0aW9ucy50b0dvID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jbGVhckNhcnQgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnRvR28gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5jbGVhckNhcnQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jbG9zZUVkaXRvciA9ICgpID0+IHtcbiAgICAgICAgQ2FydE1vZGVsLmNsb3NlRWRpdG9yKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2xvc2VDYXJ0ID0gKCkgPT4ge1xuICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgICAgICBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zaG93SGlzdG9yeSA9ICgpID0+IENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAgICAgJHNjb3BlLnNob3dDYXJ0ID0gKCkgPT4gQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG5cbiAgICAgICRzY29wZS5wYXlDaGVjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hlY2tvdXQnIH07XG5cbiAgICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvY2F0ZWdvcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzQ2F0ZWdvcnlDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdvQmFjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gIHZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgdmFyIGJhY2tncm91bmQgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgNDcwLCA0MTApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtcmVndWxhcicsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kID8gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKScgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAucmVkdWNlKChyZXN1bHQsIHZhbHVlLCBpKSA9PiB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoKHJvdywgaSkgPT4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdykpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGlsZS10YWJsZSdcbiAgICAgIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuY2F0ZWdvcnlDaGFuZ2VkLmFkZChjYXRlZ29yeSA9PiB7XG4gICAgaWYgKCFjYXRlZ29yeSkge1xuICAgICAgcmV0dXJuICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXRlZ29yeSA9IG51bGwpO1xuICAgIH1cblxuICAgIHZhciBpdGVtcyA9IGNhdGVnb3J5Lml0ZW1zIHx8IFtdLFxuICAgICAgICBjYXRlZ29yaWVzID0gY2F0ZWdvcnkuY2F0ZWdvcmllcyB8fCBbXTtcblxuICAgIHZhciB0aWxlcyA9IGNhdGVnb3JpZXMuY29uY2F0KGl0ZW1zKS5tYXAoaXRlbSA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogaXRlbS50aXRsZSxcbiAgICAgICAgaW1hZ2U6IGl0ZW0uaW1hZ2UsXG4gICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChpdGVtLmRlc3RpbmF0aW9uKSxcbiAgICAgICAgZGVzdGluYXRpb246IGl0ZW0uZGVzdGluYXRpb25cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhdGVnb3J5TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZS1jYXRlZ29yeS1jb250ZW50JylcbiAgICApO1xuXG4gICAgJHNjb3BlLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBpZiAobG9jYXRpb24udHlwZSA9PT0gJ2l0ZW0nKSB7XG4gICAgICAkc2NvcGUuc2hvd01vZGFsID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkc2NvcGUuc2hvd01vZGFsID0gZmFsc2U7XG5cbiAgICBEYXRhTWFuYWdlci5jYXRlZ29yeSA9IGxvY2F0aW9uLnR5cGUgPT09ICdjYXRlZ29yeScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuY2F0ZWdvcnkpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9ob21lLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0hvbWVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgU05BUExvY2F0aW9uKSA9PiB7XG5cbiAgdmFyIEhvbWVNZW51ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgcm93cyA9IFtdLFxuICAgICAgICAgIGhvbWUgPSB0aGlzLnByb3BzLmhvbWU7XG5cbiAgICAgIGlmIChCb29sZWFuKGhvbWUuaW50cm8pKSB7XG4gICAgICAgIHJvd3MucHVzaChSZWFjdC5ET00udGQoe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1pbmZvJyxcbiAgICAgICAgICBrZXk6ICdpbnRybydcbiAgICAgICAgfSwgUmVhY3QuRE9NLmRpdih7fSwgW1xuICAgICAgICAgICAgUmVhY3QuRE9NLmgxKHsga2V5OiAnaW50cm8tdGl0bGUnIH0sXG4gICAgICAgICAgICAgIGhvbWUuaW50cm8udGl0bGUgfHwgYFdlbGNvbWUgdG8gJHtTTkFQTG9jYXRpb24ubG9jYXRpb25fbmFtZX1gXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgUmVhY3QuRE9NLnAoeyBrZXk6ICdpbnRyby10ZXh0JyB9LFxuICAgICAgICAgICAgICBob21lLmludHJvLnRleHRcbiAgICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgICAgKSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB0aWxlcyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDQ3MCwgNDEwKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLXJlZ3VsYXInLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZCA/ICd1cmwoXCInICsgYmFja2dyb3VuZCArICdcIiknIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcm93cyA9IHJvd3MuY29uY2F0KHRpbGVzKVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCB2YWx1ZSkgPT4ge1xuICAgICAgICByZXN1bHRbMF0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5ob21lQ2hhbmdlZC5hZGQoaG9tZSA9PiB7XG4gICAgaWYgKCFob21lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGVzID0gaG9tZS5tZW51c1xuICAgIC5tYXAobWVudSA9PiB7XG4gICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBtZW51LnRpdGxlLFxuICAgICAgICBpbWFnZTogbWVudS5pbWFnZSxcbiAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIb21lTWVudSwgeyB0aWxlczogdGlsZXMsIGhvbWU6IGhvbWUgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZS1ob21lLW1lbnUnKVxuICAgICk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5ob21lID0gbG9jYXRpb24udHlwZSA9PT0gJ2hvbWUnO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5ob21lKTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaXRlbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNJdGVtQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnV2ViQnJvd3NlcicsICdDb21tYW5kU3VibWl0T3JkZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIFNoZWxsTWFuYWdlciwgV2ViQnJvd3NlciwgQ29tbWFuZFN1Ym1pdE9yZGVyKSA9PiB7XG5cbiAgJHNjb3BlLmdvQmFjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gIERhdGFNYW5hZ2VyLml0ZW1DaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcblxuICAgICAgcmV0dXJuICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmVudHJ5ID0gJHNjb3BlLmVudHJpZXMgPSBudWxsO1xuICAgICAgICAkc2NvcGUudHlwZSA9IDE7XG4gICAgICAgICRzY29wZS5zdGVwID0gMDtcbiAgICAgICAgJHNjb3BlLmVudHJ5SW5kZXggPSAwO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSBpdGVtLnR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gMiAmJiBpdGVtLndlYnNpdGUpIHtcbiAgICAgIFdlYkJyb3dzZXIub3BlbihpdGVtLndlYnNpdGUudXJsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMyAmJiBpdGVtLmZsYXNoKSB7XG4gICAgICBsZXQgZmxhc2hVcmwgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaXRlbS5mbGFzaC5tZWRpYSwgMCwgMCwgJ3N3ZicpLFxuICAgICAgICAgIHVybCA9ICcvZmxhc2gjdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQoZmxhc2hVcmwpICtcbiAgICAgICAgICAgICAgICAnJndpZHRoPScgKyBlbmNvZGVVUklDb21wb25lbnQoaXRlbS5mbGFzaC53aWR0aCkgK1xuICAgICAgICAgICAgICAgICcmaGVpZ2h0PScgKyBlbmNvZGVVUklDb21wb25lbnQoaXRlbS5mbGFzaC5oZWlnaHQpO1xuXG4gICAgICBXZWJCcm93c2VyLm9wZW4oU2hlbGxNYW5hZ2VyLmdldEFwcFVybCh1cmwpKTtcbiAgICB9XG5cbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKGl0ZW0sIDEpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHlwZSA9IHR5cGU7XG4gICAgICAkc2NvcGUuc3RlcCA9IDA7XG4gICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgdywgaCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHcsIGgsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IHZhbHVlID8gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKSA6IDA7XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gKCkgPT4ge1xuICAgIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgaWYgKCRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMgPSAkc2NvcGUuZW50cnkuY2xvbmVNYW55KCk7XG4gICAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1skc2NvcGUuZW50cnlJbmRleCA9IDBdO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDI7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCRzY29wZS5zdGVwID09PSAxKSB7XG4gICAgICBpZiAoJHNjb3BlLmVudHJ5SW5kZXggPT09ICRzY29wZS5lbnRyaWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KSk7XG4gICAgICAgICRzY29wZS5zdGVwID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbKyskc2NvcGUuZW50cnlJbmRleF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5wcmV2aW91c1N0ZXAgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zdGVwID09PSAxICYmICRzY29wZS5lbnRyeUluZGV4ID4gMCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWy0tJHNjb3BlLmVudHJ5SW5kZXhdO1xuICAgIH1cbiAgICBlbHNlIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgJHNjb3BlLmdvQmFjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5zdGVwLS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgaWYgKGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBtID0+IG0uaXNTZWxlY3RlZCA9IChtID09PSBtb2RpZmllcikpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIENvbW1hbmRTdWJtaXRPcmRlcigpO1xuICAgICRzY29wZS5nb0JhY2soKTtcbiAgfTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaXRlbWVkaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdDb21tYW5kU3VibWl0T3JkZXInLFxuICAgICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAgICAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgICAgICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG5cbiAgICAgIHZhciBjdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc2NvcGUuZW50cnkgJiYgJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgICAgICRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAkc2NvcGUuaGFzUHJldmlvdXNDYXRlZ29yeSA9IGN1cnJlbnRJbmRleCA+IDA7XG4gICAgICAgICAgJHNjb3BlLmNhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdO1xuICAgICAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICAgICAkc2NvcGUuY2FuRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnbWVudScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5lbnRyeSAhPSBudWxsO1xuXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgIGluaXQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG5cbiAgICAgIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpbml0KHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBtb2RpZmllci5kYXRhLnRpdGxlICsgKG1vZGlmaWVyLmRhdGEucHJpY2UgPiAwID9cbiAgICAgICAgICAgICcgKCsnICsgU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKG1vZGlmaWVyLmRhdGEucHJpY2UpICsgJyknIDpcbiAgICAgICAgICAgICAgJydcbiAgICAgICAgICApO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zaG93TGVmdEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoY3VycmVudEluZGV4ID4gMCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vTWFrZSBzdXJlIFBpY2sgMSBtb2RpZmllciBjYXRlZ29yaWVzIGhhdmUgbWV0IHRoZSBzZWxlY3Rpb24gY29uZGl0aW9uLlxuICAgICAgICBpZigkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0uZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0ubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAgICAgLy9UT0RPOiBBZGQgbW9kYWwgcG9wdXAuIE11c3QgbWFrZSAxIHNlbGVjdGlvbiFcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJHNjb3BlLm5leHRDYXRlZ29yeSgpIDogJHNjb3BlLmRvbmUoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yaWdodEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJ05leHQnIDogJ0RvbmUnO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dSaWdodEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJyZW50SW5kZXgtLTtcbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5uZXh0Q2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gZnVuY3Rpb24oY2F0ZWdvcnksIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgICAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2hhbmdlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldykge1xuICAgICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdvQmFjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gIHZhciBNZW51TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQobWVudSA9PiB7XG4gICAgaWYgKCFtZW51KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLm1lbnUgPSBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBtZW51LmNhdGVnb3JpZXNcbiAgICAgIC5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ2NhdGVnb3J5JyxcbiAgICAgICAgICB0b2tlbjogY2F0ZWdvcnkudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBjYXRlZ29yeS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogY2F0ZWdvcnkuaW1hZ2UsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZS1tZW51LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUubWVudSA9IG1lbnU7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLm1lbnUgPSBsb2NhdGlvbi50eXBlID09PSAnbWVudScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIubWVudSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL25hdmlnYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdNYW5hZ2VtZW50U2VydmljZScsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ29tbWFuZFJlc2V0LCBDb21tYW5kU3VibWl0T3JkZXIsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50Q2xpY2sgPSBpdGVtID0+IHtcbiAgICBpZiAoaXRlbS5ocmVmKSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3VybCcsIHVybDogaXRlbS5ocmVmLnVybCB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQ7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gaXRlbTtcblxuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS5tZW51T3Blbikge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuYWR2ZXJ0aXNlbWVudHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IGRhdGEubWlzY1xuICAgICAgICAubWFwKGFkID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoYWQuc3JjLCAzMDAsIDI1MCksXG4gICAgICAgICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gICRzY29wZS5uYXZpZ2F0ZUJhY2sgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDb21tYW5kRmxpcFNjcmVlbigpO1xuICB9O1xuXG4gICRzY29wZS5vcGVuQ2FydCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9ICFDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcbiAgfTtcblxuICAkc2NvcGUuc2VhdE5hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZWF0TmFtZSA9IHZhbHVlID8gdmFsdWUubmFtZSA6ICdUYWJsZScpKTtcblxuICAkc2NvcGUucmVzZXRUYWJsZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUubWVudU9wZW4gPSAhJHNjb3BlLm1lbnVPcGVuO1xuXG4gICAgaWYgKCRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudCAmJiAkc2NvcGUubWVudU9wZW4pIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50LnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVTZXR0aW5ncyA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSAhJHNjb3BlLnNldHRpbmdzT3BlbjtcbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5jYXJ0Q291bnQgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKGNhcnQgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXJ0Q291bnQgPSBjYXJ0Lmxlbmd0aCk7XG4gIH0pO1xuXG4gICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuXG4gICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgQ29tbWFuZFN1Ym1pdE9yZGVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnZpZXdPcmRlciA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUucGF5QmlsbCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZGlzcGxheUJyaWdodG5lc3M6IDEwMCxcbiAgICBzb3VuZFZvbHVtZTogMTAwXG4gIH07XG5cbiAgJHNjb3BlLiR3YXRjaCgnc2V0dGluZ3Muc291bmRWb2x1bWUnLCAodmFsdWUsIG9sZCkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gb2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5zZXRTb3VuZFZvbHVtZSh2YWx1ZSk7XG4gIH0pO1xuICBNYW5hZ2VtZW50U2VydmljZS5nZXRTb3VuZFZvbHVtZSgpLnRoZW4oXG4gICAgcmVzcG9uc2UgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNldHRpbmdzLnNvdW5kVm9sdW1lID0gcmVzcG9uc2Uudm9sdW1lKSxcbiAgICBlID0+IHsgfVxuICApO1xuXG4gICRzY29wZS4kd2F0Y2goJ3NldHRpbmdzLmRpc3BsYXlCcmlnaHRuZXNzJywgKHZhbHVlLCBvbGQpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uuc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpO1xuICB9KTtcbiAgTWFuYWdlbWVudFNlcnZpY2UuZ2V0RGlzcGxheUJyaWdodG5lc3MoKS50aGVuKFxuICAgIHJlc3BvbnNlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZXR0aW5ncy5kaXNwbGF5QnJpZ2h0bmVzcyA9IHJlc3BvbnNlLmJyaWdodG5lc3MpLFxuICAgIGUgPT4geyB9XG4gICk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlID0gZGVzdGluYXRpb24gPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJztcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnaXRlbScpIHtcbiAgICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgICAgbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG4gICAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ob21lLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdIb21lQmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1N1cnZleU1hbmFnZXInLCAnU05BUExvY2F0aW9uJywgJ1NOQVBFbnZpcm9ubWVudCcsICdDb21tYW5kUmVzZXQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIERhdGFQcm92aWRlciwgU2hlbGxNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFN1cnZleU1hbmFnZXIsIFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBDb21tYW5kUmVzZXQpID0+IHtcblxuICB2YXIgSG9tZU1lbnUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbIFJlYWN0LkRPTS50ZCh7IGtleTogLTEgfSkgXTtcblxuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICdob21lLW1lbnUtaXRlbScsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5pbWcoe1xuICAgICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCAxNjAsIDE2MClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJvd3MpO1xuICAgICAgcmVzdWx0LnB1c2goUmVhY3QuRE9NLnRkKHsga2V5OiByZXN1bHQubGVuZ3RoIH0pKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZShudWxsLCByZXN1bHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgRGF0YVByb3ZpZGVyLmhvbWUoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGVzID0gW107XG5cbiAgICByZXNwb25zZS5tZW51c1xuICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgLnJlZHVjZSgodGlsZXMsIG1lbnUpID0+IHtcbiAgICAgIGlmIChtZW51LnByb21vcyAmJiBtZW51LnByb21vcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIG1lbnUucHJvbW9zXG4gICAgICAgIC5maWx0ZXIocHJvbW8gPT4gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgcHJvbW8udHlwZSAhPT0gMylcbiAgICAgICAgLmZvckVhY2gocHJvbW8gPT4ge1xuICAgICAgICAgIHRpbGVzLnB1c2goe1xuICAgICAgICAgICAgdGl0bGU6IHByb21vLnRpdGxlLFxuICAgICAgICAgICAgaW1hZ2U6IHByb21vLmltYWdlLFxuICAgICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHByb21vLmRlc3RpbmF0aW9uKSxcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBwcm9tby5kZXN0aW5hdGlvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGlsZXMucHVzaCh7XG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgaW1hZ2U6IG1lbnUuaW1hZ2UsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aWxlcztcbiAgICB9LCB0aWxlcyk7XG5cbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSG9tZU1lbnUsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaG9tZS1tZW51LW1haW4nKVxuICAgICAgKTtcbiAgICB9LCAxMDAwKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgICRzY29wZS52aXNpYmxlID0gbG9jYXRpb24udHlwZSA9PT0gJ2hvbWUnO1xuICAgICR0aW1lb3V0KCgpID0+IHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLnByZWxvYWQgPSBkZXN0aW5hdGlvbiA9PiB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcbiAgfTtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUucHJlZGljYXRlRXZlbiA9IFNoZWxsTWFuYWdlci5wcmVkaWNhdGVFdmVuO1xuICAkc2NvcGUucHJlZGljYXRlT2RkID0gU2hlbGxNYW5hZ2VyLnByZWRpY2F0ZU9kZDtcblxuICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID8gTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOiAnVGFibGUnO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLnNlYXRfbmFtZSA9IHZhbHVlID8gdmFsdWUubmFtZSA6ICdUYWJsZSc7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5jdXN0b21lcl9uYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyX25hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmVsZW1lbnRzID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmVsZW1lbnRzID0gdmFsdWUpO1xuICB9KTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCk7XG4gIH07XG4gIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0KTtcbiAgfTtcbiAgdmFyIHJlZnJlc2hTdXJ2ZXkgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnN1cnZleUF2YWlsYWJsZSA9IFN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkgJiYgIVN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hDbG9zZW91dFJlcXVlc3QpO1xuICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5hZGQocmVmcmVzaFN1cnZleSk7XG4gIFN1cnZleU1hbmFnZXIubW9kZWwuc3VydmV5Q29tcGxldGVkLmFkZChyZWZyZXNoU3VydmV5KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG4gIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QoKTtcbiAgcmVmcmVzaFN1cnZleSgpO1xuXG4gICRzY29wZS5jaGF0QXZhaWxhYmxlID0gQm9vbGVhbihTTkFQTG9jYXRpb24uY2hhdCk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQ0xPU0VPVVQpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5TdXJ2ZXkgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUuc3VydmV5QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzdXJ2ZXknIH07XG4gIH07XG5cbiAgJHNjb3BlLnNlYXRDbGlja2VkID0gKCkgPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJDbGlja2VkID0gKCkgPT4ge1xuICAgIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNHdWVzdCkge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdhY2NvdW50JyB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DaGF0ID0gKCkgPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaXRlbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSXRlbUJhc2VDdHJsJyxcbiAgWyckc2NvcGUnLCAoJHNjb3BlKSA9PiB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FuYWx5dGljc01vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnRGF0YU1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsICdDaGF0TWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBbmFseXRpY3NNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRGF0YU1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENhcnRNb2RlbCwgTG9jYXRpb25Nb2RlbCwgU2hlbGxNYW5hZ2VyLCBTTkFQRW52aXJvbm1lbnQsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIEl0ZW1JbWFnZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFJlYWN0LkRPTS5pbWcoe1xuICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aGlzLnByb3BzLm1lZGlhLCA2MDAsIDYwMClcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLml0ZW0gPSBsb2NhdGlvbi50eXBlID09PSAnaXRlbScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuaXRlbSk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLml0ZW1DaGFuZ2VkLmFkZChyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSAmJiAoJHNjb3BlLndlYnNpdGVVcmwgfHwgJHNjb3BlLmZsYXNoVXJsKSkge1xuICAgICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuICAgIH1cblxuICAgICRzY29wZS53ZWJzaXRlVXJsID0gbnVsbDtcbiAgICAkc2NvcGUuZmxhc2hVcmwgPSBudWxsO1xuXG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgJHNjb3BlLmVudHJ5ID0gbnVsbDtcblxuICAgICAgaWYgKCRzY29wZS50eXBlID09PSAxKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtLXBob3RvJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS50eXBlID0gMTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHR5cGUgPSByZXNwb25zZS50eXBlO1xuXG4gICAgaWYgKHR5cGUgPT09IDIgJiYgcmVzcG9uc2Uud2Vic2l0ZSkge1xuICAgICAgJHNjb3BlLndlYnNpdGVVcmwgPSByZXNwb25zZS53ZWJzaXRlLnVybDtcbiAgICAgIFdlYkJyb3dzZXIub3Blbigkc2NvcGUud2Vic2l0ZVVybCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDMgJiYgcmVzcG9uc2UuZmxhc2gpIHtcbiAgICAgIHZhciB1cmwgPSAnL2ZsYXNoI3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGdldE1lZGlhVXJsKHJlc3BvbnNlLmZsYXNoLm1lZGlhLCAwLCAwLCAnc3dmJykpICtcbiAgICAgICAgJyZ3aWR0aD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHJlc3BvbnNlLmZsYXNoLndpZHRoKSArXG4gICAgICAgICcmaGVpZ2h0PScgKyBlbmNvZGVVUklDb21wb25lbnQocmVzcG9uc2UuZmxhc2guaGVpZ2h0KTtcbiAgICAgICRzY29wZS5mbGFzaFVybCA9IFNoZWxsTWFuYWdlci5nZXRBcHBVcmwodXJsKTtcbiAgICAgIFdlYkJyb3dzZXIub3Blbigkc2NvcGUuZmxhc2hVcmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKHJlc3BvbnNlLCAxKTtcblxuICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEl0ZW1JbWFnZSwgeyBtZWRpYTogJHNjb3BlLmVudHJ5Lml0ZW0uaW1hZ2UgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtLXBob3RvJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnR5cGUgPSB0eXBlO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiB2YWx1ZSA/IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSkgOiAwO1xuXG4gICRzY29wZS5hZGRUb0NhcnQgPSAoKSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlbnRyeSA9ICRzY29wZS5lbnRyeTtcblxuICAgIGlmIChlbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgIENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCB0cnVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KTtcbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsR2lmdCA9ICgpID0+IENoYXRNYW5hZ2VyLmNhbmNlbEdpZnQoKTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2l0ZW1lZGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsXG4gICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsKSA9PiB7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcblxuICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG5cbiAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5lbnRyeSAmJiAkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAkc2NvcGUuaGFzTmV4dENhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggPiAxICYmXG4gICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICRzY29wZS5oYXNQcmV2aW91c0NhdGVnb3J5ID0gY3VycmVudEluZGV4ID4gMDtcbiAgICAgICRzY29wZS5jYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XTtcbiAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICRzY29wZS5jYW5Eb25lID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ21lbnUnICYmIGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICRzY29wZS5leGl0KCk7XG4gICAgfVxuICB9KTtcblxuICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAkc2NvcGUuZXhpdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGluaXQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmVudHJ5ICE9IG51bGw7XG5cbiAgICBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICBpbml0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuXG4gIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgIGluaXQodmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgcmV0dXJuIG1vZGlmaWVyLmRhdGEudGl0bGUgKyAobW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgJyAoKycgKyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UobW9kaWZpZXIuZGF0YS5wcmljZSkgKyAnKScgOlxuICAgICAgJydcbiAgICApO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgfTtcblxuICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgLy9NYWtlIHN1cmUgUGljayAxIG1vZGlmaWVyIGNhdGVnb3JpZXMgaGF2ZSBtZXQgdGhlIHNlbGVjdGlvbiBjb25kaXRpb24uXG4gICAgaWYoJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgaWYgKG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAvL1RPRE86IEFkZCBtb2RhbCBwb3B1cC4gTXVzdCBtYWtlIDEgc2VsZWN0aW9uIVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9ICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICRzY29wZS5uZXh0Q2F0ZWdvcnkoKSA6ICRzY29wZS5kb25lKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJpZ2h0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICdOZXh0JyA6ICdEb25lJztcbiAgfTtcblxuICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleC0tO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleCsrO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBtb2RpZmllcikge1xuICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkICYmIGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXcpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmV4aXQoKTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbmF1eC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWFpbkF1eEN0cmwnLCBbJyRzY29wZScsICdDb21tYW5kU3RhcnR1cCcsIGZ1bmN0aW9uKCRzY29wZSwgQ29tbWFuZFN0YXJ0dXApIHtcbiAgQ29tbWFuZFN0YXJ0dXAoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbnNuYXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01haW5TbmFwQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FwcENhY2hlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdBY3Rpdml0eU1vbml0b3InLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU29mdHdhcmVNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsICdDb21tYW5kU3RhcnR1cCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBcHBDYWNoZSwgQ3VzdG9tZXJNYW5hZ2VyLCBBY3Rpdml0eU1vbml0b3IsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE5hdmlnYXRpb25NYW5hZ2VyLCBTb2Z0d2FyZU1hbmFnZXIsIFNOQVBMb2NhdGlvbiwgQ29tbWFuZFN0YXJ0dXApID0+IHtcblxuICBDb21tYW5kU3RhcnR1cCgpO1xuXG4gICRzY29wZS50b3VjaCA9ICgpID0+IEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyUmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1JFQ0VJVkVEKSk7XG4gIH0pO1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmNoYXRSZXF1ZXN0UmVjZWl2ZWQuYWRkKHRva2VuID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZSh0b2tlbikgKyAnIHdvdWxkIGxpa2UgdG8gY2hhdCB3aXRoIHlvdS4nKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLmFwcHJvdmVEZXZpY2UodG9rZW4pO1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICAgIH0sICgpID0+IENoYXRNYW5hZ2VyLmRlY2xpbmVEZXZpY2UodG9rZW4pKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFJlcXVlc3RSZWNlaXZlZC5hZGQoKHRva2VuLCBkZXNjcmlwdGlvbikgPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKHRva2VuKSArICcgd291bGQgbGlrZSB0byBnaWZ0IHlvdSBhICcgKyBkZXNjcmlwdGlvbikudGhlbigoKSA9PiB7XG4gICAgICBDaGF0TWFuYWdlci5hY2NlcHRHaWZ0KHRva2VuKTtcbiAgICB9LCAoKSA9PiBDaGF0TWFuYWdlci5kZWNsaW5lR2lmdCh0b2tlbikpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5tZXNzYWdlUmVjZWl2ZWQuYWRkKG1lc3NhZ2UgPT4ge1xuICAgIHZhciBkZXZpY2UgPSBMb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSk7XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoJ0NoYXQgd2l0aCAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyB3YXMgZGVjbGluZWQuICcgK1xuICAgICAgJ1RvIHN0b3AgcmVjaWV2aW5nIGNoYXQgcmVxdWVzdHMsIG9wZW4gdGhlIGNoYXQgc2NyZWVuIGFuZCB0b3VjaCB0aGUgXCJDaGF0IG9uL29mZlwiIGJ1dHRvbi4nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KCdZb3VyIGNoYXQgcmVxdWVzdCB0byAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyB3YXMgYWNjZXB0ZWQuJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIGhhcyBhY2NlcHRlZCB5b3VyIGdpZnQuIFRoZSBpdGVtIHdpbGwgYmUgYWRkZWQgdG8geW91ciBjaGVjay4nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGRlY2xpbmVkIHlvdXIgZ2lmdC4gVGhlIGl0ZW0gd2lsbCBOT1QgYmUgYWRkZWQgdG8geW91ciBjaGVjay4nKTtcbiAgICB9XG5cbiAgICBpZiAoTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24udHlwZSA9PT0gJ2NoYXQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvbihDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIGhhcyBjbG9zZWQgdGhlIGNoYXQnKTtcbiAgICB9XG4gICAgZWxzZSBpZighbWVzc2FnZS5zdGF0dXMgJiYgbWVzc2FnZS50b19kZXZpY2UpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uKCdOZXcgbWVzc2FnZSBmcm9tICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikpO1xuICAgIH1cbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFJlYWR5LmFkZCgoKSA9PiB7XG4gICAgQ2hhdE1hbmFnZXIuc2VuZEdpZnQoT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydCk7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0QWNjZXB0ZWQuYWRkKHN0YXR1cyA9PiB7XG4gICAgaWYgKCFzdGF0dXMgfHwgIUNoYXRNYW5hZ2VyLm1vZGVsLmdpZnREZXZpY2UpIHtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuXG4gICAgICAgIENoYXRNYW5hZ2VyLmVuZEdpZnQoKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWVudS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWVudUJhc2VDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSA9PiB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNZW51Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHZhciBNZW51TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbGVDbGFzc05hbWUgPSBTaGVsbE1hbmFnZXIudGlsZVN0eWxlO1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcChmdW5jdGlvbih0aWxlLCBpKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogdGlsZUNsYXNzTmFtZSxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCAzNzAsIDM3MCkgKyAnKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGkpIHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcChmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoeyBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJyB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgRGF0YU1hbmFnZXIubWVudSA9IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5tZW51KTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIubWVudUNoYW5nZWQuYWRkKGZ1bmN0aW9uKG1lbnUpIHtcbiAgICBpZiAoIW1lbnUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtZW51LmNhdGVnb3JpZXMuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgIHRpbGUudXJsID0gJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aCh0aWxlLmRlc3RpbmF0aW9uKTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUxpc3QsIHsgdGlsZXM6IG1lbnUuY2F0ZWdvcmllcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50LW1lbnUnKVxuICAgICk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tb2RhbC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTW9kYWxDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyKSA9PiB7XG5cbiAgICBEaWFsb2dNYW5hZ2VyLm1vZGFsU3RhcnRlZC5hZGQoKCkgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnZpc2libGUgPSB0cnVlKSk7XG4gICAgRGlhbG9nTWFuYWdlci5tb2RhbEVuZGVkLmFkZCgoKSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUudmlzaWJsZSA9IGZhbHNlKSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL25hdmlnYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ05hdmlnYXRpb25DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ0N1c3RvbWVyTWFuYWdlcicsICdBbmFseXRpY3NNb2RlbCcsICdDYXJ0TW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDb21tYW5kUmVzZXQnLCAnQ29tbWFuZEZsaXBTY3JlZW4nLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBDdXN0b21lck1hbmFnZXIsIEFuYWx5dGljc01vZGVsLCBDYXJ0TW9kZWwsIFNoZWxsTWFuYWdlciwgRGF0YU1hbmFnZXIsIERhdGFQcm92aWRlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ29tbWFuZFJlc2V0LCBDb21tYW5kRmxpcFNjcmVlbiwgV2ViQnJvd3NlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG5cbiAgJHNjb3BlLm1lbnVzID0gW107XG5cbiAgRGF0YVByb3ZpZGVyLmhvbWUoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxvY2F0aW9uID0gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24sXG4gICAgICAgIGxpbWl0ID0gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgPyA0IDogMztcblxuICAgICRzY29wZS5tZW51cyA9IHJlc3BvbnNlLm1lbnVzXG4gICAgICAuZmlsdGVyKG1lbnUgPT4gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgbWVudS50eXBlICE9PSAzKVxuICAgICAgLmZpbHRlcigobWVudSwgaSkgPT4gaSA8IGxpbWl0KVxuICAgICAgLm1hcChtZW51ID0+IHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuLFxuICAgICAgICAgIHRpdGxlOiBtZW51LnRpdGxlLFxuICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uLFxuICAgICAgICAgIHNlbGVjdGVkOiBsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW5cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUubmF2aWdhdGVIb21lID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICB9O1xuXG4gICRzY29wZS5uYXZpZ2F0ZUJhY2sgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICB9O1xuXG4gICRzY29wZS5yb3RhdGVTY3JlZW4gPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBDb21tYW5kRmxpcFNjcmVlbigpO1xuICB9O1xuXG4gICRzY29wZS5vcGVuQ2FydCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9ICFDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcbiAgfTtcblxuICAkc2NvcGUub3BlblNldHRpbmdzID0gKCkgPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUubWVudU9wZW4gPSBmYWxzZTtcblxuICAkc2NvcGUudG9nZ2xlTWVudSA9ICgpID0+IHtcbiAgICAkc2NvcGUubWVudU9wZW4gPSAhJHNjb3BlLm1lbnVPcGVuO1xuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50Q2xpY2sgPSBpdGVtID0+IHtcbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICB0eXBlOiAnY2xpY2snXG4gICAgfSk7XG5cbiAgICBpZiAoaXRlbS5ocmVmKSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3VybCcsIHVybDogaXRlbS5ocmVmLnVybCB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudEltcHJlc3Npb24gPSBpdGVtID0+IHtcbiAgICBpZiAoQWN0aXZpdHlNb25pdG9yLmFjdGl2ZSAmJiAhJHNjb3BlLndpZGUpIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgICAgdHlwZTogJ2ltcHJlc3Npb24nXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmVsZW1lbnRzID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmVsZW1lbnRzID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNBbGwgPSBbXTtcbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wID0gW107XG4gICRzY29wZS5hZHZlcnRpc2VtZW50c0JvdHRvbSA9IFtdO1xuICB2YXIgbWFwQWR2ZXJ0aXNlbWVudCA9IGFkID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoYWQuc3JjLCA5NzAsIDkwKSxcbiAgICAgIGhyZWY6IGFkLmhyZWYsXG4gICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGFkLnNyYyksXG4gICAgICB0b2tlbjogYWQudG9rZW5cbiAgICB9O1xuICB9O1xuICBEYXRhUHJvdmlkZXIuYWR2ZXJ0aXNlbWVudHMoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AgPSByZXNwb25zZS50b3AubWFwKG1hcEFkdmVydGlzZW1lbnQpO1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQm90dG9tID0gcmVzcG9uc2UuYm90dG9tLm1hcChtYXBBZHZlcnRpc2VtZW50KTtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c0FsbCA9ICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcC5jb25jYXQoJHNjb3BlLmFkdmVydGlzZW1lbnRzQm90dG9tKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmNhcnRDb3VudCA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQubGVuZ3RoO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoY2FydCA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhcnRDb3VudCA9IGNhcnQubGVuZ3RoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcblxuICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUubmF2aWdhdGUgPSBkZXN0aW5hdGlvbiA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdlZC5hZGQobG9jYXRpb24gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5tZW51cy5mb3JFYWNoKG1lbnUgPT4ge1xuICAgICAgICAvL21lbnUuc2VsZWN0ZWQgPSAobG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbm90aWZpY2F0aW9uLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdOb3RpZmljYXRpb25DdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIpIHtcbiAgdmFyIHRpbWVyO1xuXG4gICRzY29wZS5tZXNzYWdlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpc2liaWxpdHkoaXNWaXNpYmxlKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUudmlzaWJsZSA9IGlzVmlzaWJsZTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpZGVOZXh0KCkge1xuICAgIHZhciBtZXNzYWdlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAkc2NvcGUubWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1lc3NhZ2VzLnB1c2goJHNjb3BlLm1lc3NhZ2VzW2ldKTtcbiAgICB9XG5cbiAgICAkc2NvcGUubWVzc2FnZXMgPSBtZXNzYWdlcztcblxuICAgIGlmICgkc2NvcGUubWVzc2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aW1lciA9ICR0aW1lb3V0KGhpZGVOZXh0LCA0MDAwKTtcbiAgfVxuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb25SZXF1ZXN0ZWQuYWRkKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlcy5wdXNoKHsgdGV4dDogbWVzc2FnZSB9KTtcbiAgICB9KTtcblxuICAgIHVwZGF0ZVZpc2liaWxpdHkodHJ1ZSk7XG5cbiAgICBpZiAodGltZXIpIHtcbiAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgfVxuXG4gICAgdGltZXIgPSAkdGltZW91dChoaWRlTmV4dCwgNDAwMCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zY3JlZW5zYXZlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU2NyZWVuc2F2ZXJDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJywgJ0FjdGl2aXR5TW9uaXRvcicsICdEYXRhUHJvdmlkZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgU2hlbGxNYW5hZ2VyLCBBY3Rpdml0eU1vbml0b3IsIERhdGFQcm92aWRlcikgPT4ge1xuICAgIFxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIHNob3dJbWFnZXModmFsdWVzKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaW1hZ2VzID0gdmFsdWVzLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLm1lZGlhLCAxOTIwLCAxMDgwLCAnanBnJyksXG4gICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShpdGVtLm1lZGlhKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzaG93SW1hZ2VzKFNoZWxsTWFuYWdlci5tb2RlbC5zY3JlZW5zYXZlcnMpO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuc2NyZWVuc2F2ZXJzQ2hhbmdlZC5hZGQoc2hvd0ltYWdlcyk7XG5cbiAgQWN0aXZpdHlNb25pdG9yLmFjdGl2ZUNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUudmlzaWJsZSA9IHZhbHVlID09PSBmYWxzZSAmJiAoJHNjb3BlLmltYWdlcyAmJiAkc2NvcGUuaW1hZ2VzLmxlbmd0aCA+IDApO1xuICAgIH0pO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc2lnbmluLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTaWduSW5DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ29tbWFuZEN1c3RvbWVyTG9naW4nLCAnQ29tbWFuZEN1c3RvbWVyR3Vlc3RMb2dpbicsICdDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbicsICdDb21tYW5kQ3VzdG9tZXJTaWdudXAnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2Vzc2lvbk1hbmFnZXInLCAnU05BUExvY2F0aW9uJywgJ1dlYkJyb3dzZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ29tbWFuZEN1c3RvbWVyTG9naW4sIENvbW1hbmRDdXN0b21lckd1ZXN0TG9naW4sIENvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luLCBDb21tYW5kQ3VzdG9tZXJTaWdudXAsIEN1c3RvbWVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTTkFQTG9jYXRpb24sIFdlYkJyb3dzZXIpID0+IHtcblxuICB2YXIgU1RFUF9TUExBU0ggPSAxLFxuICAgICAgU1RFUF9MT0dJTiA9IDIsXG4gICAgICBTVEVQX1JFR0lTVFJBVElPTiA9IDMsXG4gICAgICBTVEVQX0dVRVNUUyA9IDQsXG4gICAgICBTVEVQX0VWRU5UID0gNSxcbiAgICAgIFNURVBfUkVTRVQgPSA2O1xuXG4gICRzY29wZS5TVEVQX1NQTEFTSCA9IFNURVBfU1BMQVNIO1xuICAkc2NvcGUuU1RFUF9MT0dJTiA9IFNURVBfTE9HSU47XG4gICRzY29wZS5TVEVQX1JFR0lTVFJBVElPTiA9IFNURVBfUkVHSVNUUkFUSU9OO1xuICAkc2NvcGUuU1RFUF9HVUVTVFMgPSBTVEVQX0dVRVNUUztcbiAgJHNjb3BlLlNURVBfRVZFTlQgPSBTVEVQX0VWRU5UO1xuICAkc2NvcGUuU1RFUF9SRVNFVCA9IFNURVBfUkVTRVQ7XG5cbiAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IFNOQVBMb2NhdGlvbi5sb2NhdGlvbl9uYW1lO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTG9naW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5sb2dpbiA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3JlZGVudGlhbHMgPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfTE9HSU47XG4gIH07XG5cbiAgJHNjb3BlLmd1ZXN0TG9naW4gPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIENvbW1hbmRDdXN0b21lckd1ZXN0TG9naW4oKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RlcCA9IFNURVBfR1VFU1RTKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmRvTG9naW4gPSAoY3JlZGVudGlhbHMpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgJHNjb3BlLmNyZWRlbnRpYWxzLnVzZXJuYW1lID0gJHNjb3BlLmNyZWRlbnRpYWxzLmVtYWlsO1xuXG4gICAgQ29tbWFuZEN1c3RvbWVyTG9naW4oJHNjb3BlLmNyZWRlbnRpYWxzKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RlcCA9IFNURVBfR1VFU1RTKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9HRU5FUklDX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFNvY2lhbCBsb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmxvZ2luRmFjZWJvb2sgPSAoKSA9PiB7XG4gICAgc29jaWFsQnVzeSgpO1xuICAgIENvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luLmZhY2Vib29rKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpblR3aXR0ZXIgPSAoKSA9PiB7XG4gICAgc29jaWFsQnVzeSgpO1xuICAgIENvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luLnR3aXR0ZXIoKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luR29vZ2xlID0gKCkgPT4ge1xuICAgIHNvY2lhbEJ1c3koKTtcbiAgICBDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbi5nb29nbGVwbHVzKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVnaXN0cmF0aW9uXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucmVnaXN0ZXIgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlZ2lzdHJhdGlvbiA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9SRUdJU1RSQVRJT047XG4gIH07XG5cbiAgJHNjb3BlLmRvUmVnaXN0cmF0aW9uID0gKCkgPT4ge1xuICAgICRzY29wZS5yZWdpc3RyYXRpb24udXNlcm5hbWUgPSAkc2NvcGUucmVnaXN0cmF0aW9uLmVtYWlsO1xuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIENvbW1hbmRDdXN0b21lclNpZ251cCgkc2NvcGUucmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RlcCA9IFNURVBfR1VFU1RTKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBHdWVzdCBjb3VudFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnNlc3Npb24gPSB7XG4gICAgZ3Vlc3RDb3VudDogMSxcbiAgICBzcGVjaWFsOiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5zdWJtaXRHdWVzdENvdW50ID0gKCkgPT4ge1xuICAgIGlmICgkc2NvcGUuc2Vzc2lvbi5ndWVzdENvdW50ID4gMSkge1xuICAgICAgU2Vzc2lvbk1hbmFnZXIuZ3Vlc3RDb3VudCA9ICRzY29wZS5zZXNzaW9uLmd1ZXN0Q291bnQ7XG4gICAgICAkc2NvcGUuc3RlcCA9IFNURVBfRVZFTlQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZW5kU2lnbkluKCk7XG4gICAgfVxuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgRXZlbnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5zdWJtaXRTcGVjaWFsRXZlbnQgPSAodmFsdWUpID0+IHtcbiAgICAkc2NvcGUuc2Vzc2lvbi5zcGVjaWFsID0gU2Vzc2lvbk1hbmFnZXIuc3BlY2lhbEV2ZW50ID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgZW5kU2lnbkluKCk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZXNldCBwYXNzd29yZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnBhc3N3b3JkcmVzZXQgPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfUkVTRVQ7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkUmVzZXRTdWJtaXQgPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5yZXNldFBhc3N3b3JkKCRzY29wZS5wYXNzd29yZHJlc2V0KS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkc2NvcGUucGFzc3dvcmRSZXNldCA9IGZhbHNlO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9QQVNTV09SRF9SRVNFVF9DT01QTEVURSk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wYXNzd29yZFJlc2V0Q2FuY2VsID0gKCkgPT4ge1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9TUExBU0g7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGZ1bmN0aW9uIHNvY2lhbExvZ2luKCkge1xuICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RlcCA9IFNURVBfR1VFU1RTKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNvY2lhbEVycm9yKCkge1xuICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0dFTkVSSUNfRVJST1IpO1xuICB9XG5cbiAgdmFyIHNvY2lhbEpvYiwgc29jaWFsVGltZXI7XG5cbiAgZnVuY3Rpb24gc29jaWFsQnVzeSgpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG5cbiAgICBzb2NpYWxKb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgc29jaWFsVGltZXIgPSAkdGltZW91dChzb2NpYWxCdXN5RW5kLCAxMjAgKiAxMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNvY2lhbEJ1c3lFbmQoKSB7XG4gICAgaWYgKHNvY2lhbEpvYikge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioc29jaWFsSm9iKTtcbiAgICAgIHNvY2lhbEpvYiA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHNvY2lhbFRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwoc29jaWFsVGltZXIpO1xuICAgICAgc29jaWFsVGltZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZFNpZ25JbigpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCB8fCBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgcmV0dXJuIGVuZFNpZ25JbigpO1xuICB9XG5cbiAgJHNjb3BlLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgJHNjb3BlLnN0ZXAgPSBTVEVQX1NQTEFTSDtcblxuICB2YXIgbW9kYWwgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0TW9kYWwoKTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgRGlhbG9nTWFuYWdlci5lbmRNb2RhbChtb2RhbCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zdGFydHVwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTdGFydHVwQ3RybCcsXG4gIFsnJHNjb3BlJywgJ0NvbW1hbmRCb290JywgJ0RpYWxvZ01hbmFnZXInLCAnTWFuYWdlbWVudFNlcnZpY2UnLFxuICAoJHNjb3BlLCBDb21tYW5kQm9vdCwgRGlhbG9nTWFuYWdlciwgTWFuYWdlbWVudFNlcnZpY2UpID0+IHtcblxuICBmdW5jdGlvbiB3b3JrZmxvdygpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ29tbWFuZEJvb3QoKS50aGVuKCgpID0+IHtcbiAgICAgIE1hbmFnZW1lbnRTZXJ2aWNlLmxvYWRBcHBsaWNhdGlvbigpO1xuICAgIH0sIGUgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfRVJST1JfU1RBUlRVUCkudGhlbigoKSA9PiB3b3JrZmxvdygpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHdvcmtmbG93KCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3N1cnZleS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU3VydmV5Q3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FuYWx5dGljc01vZGVsJywgJ0N1c3RvbWVyTWFuYWdlcicsICdDdXN0b21lck1vZGVsJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1N1cnZleU1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBBbmFseXRpY3NNb2RlbCwgQ3VzdG9tZXJNYW5hZ2VyLCBDdXN0b21lck1vZGVsLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBTdXJ2ZXlNYW5hZ2VyKSB7XG5cbiAgaWYgKCFTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCB8fCAhU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSB8fCBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGUpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuY29tbWVudCA9ICcnO1xuICAkc2NvcGUuZW1haWwgPSAnJztcbiAgJHNjb3BlLmhhZF9wcm9ibGVtcyA9IGZhbHNlO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUGFnZXNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlcyA9IFtdO1xuICB2YXIgcGFnZXMgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgncGFnZXMnKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEluZGV4XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZUluZGV4ID0gLTE7XG4gIHZhciBwYWdlSW5kZXggPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgncGFnZUluZGV4Jyk7XG4gIHBhZ2VJbmRleC5jaGFuZ2VzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBhZ2UgPSAkc2NvcGUucGFnZUluZGV4ID4gLTEgPyAkc2NvcGUucGFnZXNbJHNjb3BlLnBhZ2VJbmRleF0gOiB7IHF1ZXN0aW9uczogW10gfTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5wYWdlLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIGlmIChpdGVtLnR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkKCcjcmF0ZS0nICsgaXRlbS50b2tlbikucmF0ZWl0KHtcbiAgICAgICAgICAgIG1pbjogMCxcbiAgICAgICAgICAgIG1heDogNSxcbiAgICAgICAgICAgIHN0ZXA6IDEsXG4gICAgICAgICAgICByZXNldGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgYmFja2luZ2ZsZDogJyNyYW5nZS0nICsgaXRlbS50b2tlblxuICAgICAgICAgIH0pLmJpbmQoJ3JhdGVkJywgZnVuY3Rpb24oZXZlbnQsIHZhbHVlKSB7XG4gICAgICAgICAgICBpdGVtLmZlZWRiYWNrID0gdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDb3VudFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VDb3VudCA9IDA7XG4gIHBhZ2VzLmNoYW5nZXMoKVxuICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucGFnZUNvdW50ID0gJHNjb3BlLnBhZ2VzLmxlbmd0aDtcbiAgICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIGdlbmVyYXRlUGFzc3dvcmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gOCxcbiAgICAgICAgY2hhcnNldCA9ICdhYmNkZWZnaGtucHFyc3R1dnd4eXpBQkNERUZHSEtNTlBRUlNUVVZXWFlaMjM0NTY3ODknLFxuICAgICAgICByZXN1bHQgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNoYXJzZXQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSBjaGFyc2V0LmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdmFyIHN1Ym1pdEZlZWRiYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBhZ2VzLnJlZHVjZSgoYW5zd2VycywgcGFnZSkgPT4ge1xuICAgICAgcmV0dXJuIHBhZ2UucmVkdWNlKChhbnN3ZXJzLCBxdWVzdGlvbikgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChxdWVzdGlvbi5mZWVkYmFjayk7XG5cbiAgICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICAgIGFuc3dlcnMucHVzaCh7XG4gICAgICAgICAgICBzdXJ2ZXk6IFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkudG9rZW4sXG4gICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24udG9rZW4sXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbnN3ZXJzO1xuICAgICAgfSwgYW5zd2Vycyk7XG4gICAgfSwgW10pXG4gICAgLmZvckVhY2goYW5zd2VyID0+IEFuYWx5dGljc01vZGVsLmxvZ0Fuc3dlcihhbnN3ZXIpKTtcblxuICAgIGlmICgkc2NvcGUuY29tbWVudCAmJiAkc2NvcGUuY29tbWVudC5sZW5ndGggPiAwKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dDb21tZW50KHtcbiAgICAgICAgdHlwZTogJ2ZlZWRiYWNrJyxcbiAgICAgICAgdGV4dDogJHNjb3BlLmNvbW1lbnRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSA9IHRydWU7XG5cbiAgICBpZiAoJHNjb3BlLmhhZF9wcm9ibGVtcyAmJiAhT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KSB7XG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKTtcbiAgICB9XG5cbiAgICBpZiAoQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0ICYmICRzY29wZS5lbWFpbCAmJiAkc2NvcGUuZW1haWwubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIHZhciBwYXNzd29yZCA9IGdlbmVyYXRlUGFzc3dvcmQoKTtcblxuICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKHtcbiAgICAgICAgZW1haWw6ICRzY29wZS5lbWFpbCxcbiAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBDdXN0b21lck1hbmFnZXIubG9naW4oe1xuICAgICAgICAgIGxvZ2luOiAkc2NvcGUuZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgICB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgfVxuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wcmV2aW91c1BhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnBhZ2VJbmRleCA+IDApIHtcbiAgICAgICRzY29wZS5wYWdlSW5kZXgtLTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm5leHRQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5wYWdlSW5kZXggPCAkc2NvcGUucGFnZUNvdW50IC0gMSkge1xuICAgICAgJHNjb3BlLnBhZ2VJbmRleCsrO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5uZXh0U3RlcCgpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUubmV4dFN0ZXAgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0ICYmICRzY29wZS5zdGVwIDwgMykge1xuICAgICAgJHNjb3BlLnN0ZXArKztcbiAgICB9XG4gICAgZWxzZSBpZiAoIUN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuc3RlcCA8IDIpIHtcbiAgICAgICRzY29wZS5zdGVwKys7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc3VibWl0RmVlZGJhY2soKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdFByb2JsZW0gPSBmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAkc2NvcGUuaGFkX3Byb2JsZW1zID0gQm9vbGVhbihzdGF0dXMpO1xuICAgICRzY29wZS5uZXh0U3RlcCgpO1xuICB9O1xuXG4gICRzY29wZS5leGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5zdGVwID4gMCkge1xuICAgICAgc3VibWl0RmVlZGJhY2soKTtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhZ2U7XG5cbiAgICAkc2NvcGUuaGFzX2VtYWlsID0gQ3VzdG9tZXJNb2RlbC5oYXNDcmVkZW50aWFscztcblxuICAgIGZ1bmN0aW9uIGJ1aWxkU3VydmV5KCkge1xuICAgICAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleS5xdWVzdGlvbnMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmIChpdGVtLnR5cGUgIT09IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhZ2UgfHwgcGFnZS5sZW5ndGggPiA0KSB7XG4gICAgICAgICAgcGFnZSA9IFtdO1xuICAgICAgICAgICRzY29wZS5wYWdlcy5wdXNoKHBhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgaXRlbS5mZWVkYmFjayA9IDA7XG4gICAgICAgIHBhZ2UucHVzaChpdGVtKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5KSB7XG4gICAgICBidWlsZFN1cnZleSgpO1xuICAgIH1cblxuICAgIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmFkZCgoKSA9PiBidWlsZFN1cnZleSgpKTtcblxuICAgICRzY29wZS5wYWdlSW5kZXggPSAwO1xuICAgICRzY29wZS5zdGVwID0gMDtcbiAgfSkoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvdXJsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdVcmxDdHJsJyxcbiAgWyckc2NvcGUnLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsIE5hdmlnYXRpb25NYW5hZ2VyLCBXZWJCcm93c2VyKSA9PiB7XG5cbiAgV2ViQnJvd3Nlci5vcGVuKE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLnVybCk7XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvd2ViLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdXZWJDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ1dlYkJyb3dzZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBXZWJCcm93c2VyKSA9PiB7XG5cbiAgV2ViQnJvd3Nlci5vbk9wZW4uYWRkKCgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuZW5hYmxlZCA9IGZhbHNlO1xuICB9KTtcblxuICBXZWJCcm93c2VyLm9uQ2xvc2UuYWRkKCgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuZW5hYmxlZCA9IHRydWU7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnLCBbJ2FuZ3VsYXItYmFjb24nXSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvZ2FsbGVyeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ2dhbGxlcnknLCBbXG4gICdBY3Rpdml0eU1vbml0b3InLCAnU2hlbGxNYW5hZ2VyJywgJyR0aW1lb3V0JyxcbiAgKEFjdGl2aXR5TW9uaXRvciwgU2hlbGxNYW5hZ2VyLCAkdGltZW91dCkgPT4ge1xuXG4gIHZhciBzbGlkZXIsXG4gICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgbW9kZTogJ2ZhZGUnLFxuICAgICAgICB3cmFwcGVyQ2xhc3M6ICdwaG90by1nYWxsZXJ5J1xuICAgICAgfTtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogZmFsc2UsXG4gICAgc2NvcGU6IHtcbiAgICAgIGltYWdlczogJz0nLFxuICAgICAgaW1hZ2V3aWR0aCA6ICc9PycsXG4gICAgICBpbWFnZWhlaWdodDogJz0/J1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdnYWxsZXJ5JyksXG4gICAgbGluazogKHNjb3BlLCBlbGVtLCBhdHRycykgPT4ge1xuICAgICAgZWxlbS5yZWFkeSgoKSA9PiB7XG4gICAgICAgIHNsaWRlciA9ICQoJy5ieHNsaWRlcicsIGVsZW0pLmJ4U2xpZGVyKHNldHRpbmdzKTtcbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ2ltYWdlcycsICgpID0+IHtcbiAgICAgICAgc2NvcGUubWVkaWFzID0gKHNjb3BlLmltYWdlcyB8fCBbXSkubWFwKGltYWdlID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpbWFnZSwgYXR0cnMuaW1hZ2V3aWR0aCwgYXR0cnMuaW1hZ2VoZWlnaHQpKTtcbiAgICAgICAgc2V0dGluZ3MucGFnZXIgPSBzY29wZS5tZWRpYXMubGVuZ3RoID4gMTtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gc2xpZGVyLnJlbG9hZFNsaWRlcihzZXR0aW5ncykpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL29uaWZyYW1lbG9hZC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ29uSWZyYW1lTG9hZCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgc2NvcGU6IHtcbiAgICAgIGNhbGxiYWNrOiAnJm9uSWZyYW1lTG9hZCdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgZWxlbWVudC5iaW5kKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodHlwZW9mIChzY29wZS5jYWxsYmFjaykgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzY29wZS5jYWxsYmFjayh7IGV2ZW50OiBlIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9vbmtleWRvd24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdvbktleWRvd24nLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtLCBhdHRycykge1xuICAgICAgdmFyIGZ1bmN0aW9uVG9DYWxsID0gc2NvcGUuJGV2YWwoYXR0cnMub25LZXlkb3duKTtcbiAgICAgIGVsZW0ub24oJ2tleWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZnVuY3Rpb25Ub0NhbGwoZS53aGljaCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9xdWFudGl0eS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3F1YW50aXR5JyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBxdWFudGl0eTogJz0nLFxuICAgICAgbWluOiAnPScsXG4gICAgICBtYXg6ICc9J1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtKSB7XG4gICAgICBzY29wZS5taW4gPSBzY29wZS5taW4gfHwgMTtcbiAgICAgIHNjb3BlLm1heCA9IHNjb3BlLm1heCB8fCA5O1xuICAgICAgc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgbWluOiBzY29wZS5taW4sXG4gICAgICAgIG1heDogc2NvcGUubWF4LFxuICAgICAgICBxdWFudGl0eTogcGFyc2VJbnQoc2NvcGUucXVhbnRpdHkpXG4gICAgICB9O1xuXG4gICAgICBzY29wZS5kZWNyZWFzZSA9ICgpID0+IHtcbiAgICAgICAgc2NvcGUucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA+IHNjb3BlLmRhdGEubWluID9cbiAgICAgICAgICBzY29wZS5kYXRhLnF1YW50aXR5IC0gMSA6XG4gICAgICAgICAgc2NvcGUuZGF0YS5taW47XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5pbmNyZWFzZSA9ICgpID0+IHtcbiAgICAgICAgc2NvcGUucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA8IHNjb3BlLmRhdGEubWF4ID9cbiAgICAgICAgICBzY29wZS5kYXRhLnF1YW50aXR5ICsgMSA6XG4gICAgICAgICAgc2NvcGUuZGF0YS5tYXg7XG4gICAgICB9O1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdpbnB1dC1xdWFudGl0eScpXG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2Nyb2xsZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzY3JvbGxlcicsIFsnQWN0aXZpdHlNb25pdG9yJywgJ1NOQVBFbnZpcm9ubWVudCcsIGZ1bmN0aW9uIChBY3Rpdml0eU1vbml0b3IsIFNOQVBFbnZpcm9ubWVudCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQycsXG4gICAgcmVwbGFjZTogZmFsc2UsXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtKSB7XG4gICAgICBpZiAoU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcpIHtcbiAgICAgICAgJChlbGVtKS5raW5ldGljKHtcbiAgICAgICAgICB5OiBmYWxzZSwgc3RvcHBlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zY3JvbGxnbHVlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2Nyb2xsZ2x1ZScsIFsnJHBhcnNlJywgZnVuY3Rpb24gKCRwYXJzZSkge1xuICBmdW5jdGlvbiB1bmJvdW5kU3RhdGUoaW5pdFZhbHVlKXtcbiAgICB2YXIgYWN0aXZhdGVkID0gaW5pdFZhbHVlO1xuICAgIHJldHVybiB7XG4gICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGFjdGl2YXRlZDtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBhY3RpdmF0ZWQgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpe1xuICAgIHJldHVybiB7XG4gICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldHRlcihzY29wZSk7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKCl7fVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBzZXR0ZXIsIHNjb3BlKXtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXR0ZXIoc2NvcGUpO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIGlmKHZhbHVlICE9PSBnZXR0ZXIoc2NvcGUpKXtcbiAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldHRlcihzY29wZSwgdmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUFjdGl2YXRpb25TdGF0ZShhdHRyLCBzY29wZSl7XG4gICAgaWYoYXR0ciAhPT0gXCJcIil7XG4gICAgICB2YXIgZ2V0dGVyID0gJHBhcnNlKGF0dHIpO1xuICAgICAgaWYoZ2V0dGVyLmFzc2lnbiAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmV0dXJuIHR3b1dheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIGdldHRlci5hc3NpZ24sIHNjb3BlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvbmVXYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBzY29wZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmJvdW5kU3RhdGUodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwcmlvcml0eTogMSxcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWwsIGF0dHJzKXtcbiAgICAgIHZhciBlbCA9ICRlbFswXSxcbiAgICAgIGFjdGl2YXRpb25TdGF0ZSA9IGNyZWF0ZUFjdGl2YXRpb25TdGF0ZShhdHRycy5zY3JvbGxnbHVlLCBzY29wZSk7XG5cbiAgICAgIGZ1bmN0aW9uIHNjcm9sbFRvQm90dG9tKCl7XG4gICAgICAgIGVsLnNjcm9sbFRvcCA9IGVsLnNjcm9sbEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25TY29wZUNoYW5nZXMoKXtcbiAgICAgICAgaWYoYWN0aXZhdGlvblN0YXRlLmdldFZhbHVlKCkgJiYgIXNob3VsZEFjdGl2YXRlQXV0b1Njcm9sbCgpKXtcbiAgICAgICAgICBzY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3VsZEFjdGl2YXRlQXV0b1Njcm9sbCgpe1xuICAgICAgICByZXR1cm4gZWwuc2Nyb2xsVG9wICsgZWwuY2xpZW50SGVpZ2h0ICsgMSA+PSBlbC5zY3JvbGxIZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uU2Nyb2xsKCl7XG4gICAgICAgIGFjdGl2YXRpb25TdGF0ZS5zZXRWYWx1ZShzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKSk7XG4gICAgICB9XG5cbiAgICAgIHNjb3BlLiR3YXRjaChvblNjb3BlQ2hhbmdlcyk7XG4gICAgICAkZWwuYmluZCgnc2Nyb2xsJywgb25TY3JvbGwpO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zbGlkZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzbGlkZXInLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgc291cmNlOiAnPScsXG4gICAgICBzbGlkZWNsaWNrOiAnPScsXG4gICAgICBzbGlkZXNob3c6ICc9JyxcbiAgICAgIHRpbWVvdXQ6ICc9J1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtKSB7XG4gICAgICB2YXIgdGltZW91dCA9IHNjb3BlLnRpbWVvdXQgfHwgNTAwMDtcbiAgICAgIHNjb3BlLnNvdXJjZSA9IHNjb3BlLnNvdXJjZSB8fCBbXTtcbiAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuXG4gICAgICB2YXIgY2hhbmdlSW1hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNjb3BlLnNvdXJjZS5sZW5ndGggPT09IDAgfHwgc2NvcGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuXG4gICAgICAgIHNjb3BlLnNvdXJjZS5mb3JFYWNoKGZ1bmN0aW9uKGVudHJ5LCBpKXtcbiAgICAgICAgICBlbnRyeS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBlbnRyeSA9IHNjb3BlLnNvdXJjZVtzY29wZS5jdXJyZW50SW5kZXhdO1xuICAgICAgICBlbnRyeS52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICBpZiAoc2NvcGUuc2xpZGVzaG93KSB7XG4gICAgICAgICAgc2NvcGUuc2xpZGVzaG93KGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50eXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdmFyIHYgPSAkKCd2aWRlbycsIGVsZW0pO1xuICAgICAgICAgIHYuYXR0cignc3JjJywgZW50cnkuc3JjKTtcbiAgICAgICAgICB2YXIgdmlkZW8gPSB2LmdldCgwKTtcblxuICAgICAgICAgIGlmICghdmlkZW8pIHtcbiAgICAgICAgICAgIHRpbWVyID0gJHRpbWVvdXQoc2xpZGVyRnVuYywgMzAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb25WaWRlb0VuZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlbmRlZCcsIG9uVmlkZW9FbmRlZCwgZmFsc2UpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7IHNjb3BlLm5leHQoKTsgfSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZhciBvblZpZGVvRXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvblZpZGVvRXJyb3IsIGZhbHNlKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBzY29wZS5uZXh0KCk7IH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIG9uVmlkZW9FbmRlZCwgZmFsc2UpO1xuICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25WaWRlb0Vycm9yLCBmYWxzZSk7XG5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2aWRlby5sb2FkKCk7XG4gICAgICAgICAgICB2aWRlby5wbGF5KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byBwbGF5IHZpZGVvOiAnICsgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRpbWVyID0gJHRpbWVvdXQoc2xpZGVyRnVuYywgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2NvcGUuY3VycmVudEluZGV4IDwgc2NvcGUuc291cmNlLmxlbmd0aC0xID9cbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgrKyA6XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgY2hhbmdlSW1hZ2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnByZXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID4gMCA/XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4LS0gOlxuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IHNjb3BlLnNvdXJjZS5sZW5ndGggLSAxO1xuICAgICAgICBjaGFuZ2VJbWFnZSgpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHRpbWVyO1xuXG4gICAgICB2YXIgc2xpZGVyRnVuYyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2NvcGUuc291cmNlLmxlbmd0aCA9PT0gMCB8fCBzY29wZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLm5leHQoKTtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnc291cmNlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIHNsaWRlckZ1bmMoKTtcbiAgICAgIH0pO1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ2Rpc2FibGVkJywgZnVuY3Rpb24oKXtcbiAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIHNsaWRlckZ1bmMoKTtcbiAgICAgIH0pO1xuXG4gICAgICBzbGlkZXJGdW5jKCk7XG5cbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdzbGlkZXInKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3N3aXRjaC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3N3aXRjaCcsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgZGlzYWJsZWQ6ICc9PycsXG4gICAgICBzZWxlY3RlZDogJz0/J1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtKSB7XG4gICAgICBzY29wZS5kaXNhYmxlZCA9IEJvb2xlYW4oc2NvcGUuZGlzYWJsZWQpO1xuICAgICAgc2NvcGUuc2VsZWN0ZWQgPSBCb29sZWFuKHNjb3BlLnNlbGVjdGVkKTtcbiAgICAgIHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIGRpc2FibGVkOiBCb29sZWFuKHNjb3BlLmRpc2FibGVkKSxcbiAgICAgICAgc2VsZWN0ZWQ6IEJvb2xlYW4oc2NvcGUuc2VsZWN0ZWQpLFxuICAgICAgICBjaGFuZ2VkOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgc2NvcGUudG9nZ2xlID0gKCkgPT4ge1xuICAgICAgICBpZiAoc2NvcGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY29wZS5zZWxlY3RlZCA9IHNjb3BlLmRhdGEuc2VsZWN0ZWQgPSAhc2NvcGUuZGF0YS5zZWxlY3RlZDtcbiAgICAgICAgc2NvcGUuZGF0YS5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ2lucHV0LXN3aXRjaCcpXG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvX2Jhc2UuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycsIFtdKTtcblxuLy9zcmMvanMvZmlsdGVycy9wYXJ0aWFsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigncGFydGlhbCcsIFsnU2hlbGxNYW5hZ2VyJywgKFNoZWxsTWFuYWdlcikgPT4ge1xuICByZXR1cm4gKG5hbWUpID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3RodW1ibmFpbC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3RodW1ibmFpbCcsIFsnU2hlbGxNYW5hZ2VyJywgU2hlbGxNYW5hZ2VyID0+IHtcbiAgcmV0dXJuIChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG59XSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvdHJ1c3R1cmwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCd0cnVzdFVybCcsIFsnJHNjZScsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCh2YWwpO1xuICAgIH07XG59XSk7XG5cbi8vc3JjL2pzL3NlcnZpY2VzLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLnNlcnZpY2VzJywgWyduZ1Jlc291cmNlJywgJ1NOQVAuY29uZmlncyddKVxuXG4gIC5mYWN0b3J5KCdMb2dnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsIChTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Mb2dnZXIoU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCckZXhjZXB0aW9uSGFuZGxlcicsIFsnTG9nZ2VyJywgKExvZ2dlcikgPT4ge1xuICAgIHJldHVybiAoZXhjZXB0aW9uLCBjYXVzZSkgPT4ge1xuICAgICAgTG9nZ2VyLmZhdGFsKGV4Y2VwdGlvbi5zdGFjaywgY2F1c2UsIGV4Y2VwdGlvbik7XG4gICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgfTtcbiAgfV0pXG5cbiAgLy9TZXJ2aWNlc1xuXG4gIC5mYWN0b3J5KCdDYXJkUmVhZGVyJywgWydNYW5hZ2VtZW50U2VydmljZScsIChNYW5hZ2VtZW50U2VydmljZSkgPT4ge1xuICAgIHdpbmRvdy5TbmFwQ2FyZFJlYWRlciA9IG5ldyBhcHAuQ2FyZFJlYWRlcihNYW5hZ2VtZW50U2VydmljZSk7XG4gICAgcmV0dXJuIHdpbmRvdy5TbmFwQ2FyZFJlYWRlcjtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEdHNBcGknLCBbJ1NOQVBIb3N0cycsICdTZXNzaW9uTW9kZWwnLCAoU05BUEhvc3RzLCBTZXNzaW9uTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5CYWNrZW5kQXBpKFNOQVBIb3N0cywgU2Vzc2lvbk1vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdNYW5hZ2VtZW50U2VydmljZScsIFsnTG9nZ2VyJywgKExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNvcmRvdmFNYW5hZ2VtZW50U2VydmljZShMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvY2tldENsaWVudCcsIFsnU2Vzc2lvbk1vZGVsJywgJ1NOQVBIb3N0cycsICdMb2dnZXInLCAoU2Vzc2lvbk1vZGVsLCBTTkFQSG9zdHMsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvY2tldENsaWVudChTZXNzaW9uTW9kZWwsIFNOQVBIb3N0cywgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdUZWxlbWV0cnlTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAoJHJlc291cmNlKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuVGVsZW1ldHJ5U2VydmljZSgkcmVzb3VyY2UpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1dlYkJyb3dzZXInLCBbJ0FuYWx5dGljc01vZGVsJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQSG9zdHMnLCAoQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykgPT4ge1xuICAgIHdpbmRvdy5TbmFwV2ViQnJvd3NlciA9IG5ldyBhcHAuV2ViQnJvd3NlcihBbmFseXRpY3NNb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICByZXR1cm4gd2luZG93LlNuYXBXZWJCcm93c2VyO1xuICB9XSlcblxuICAvL01vZGVsc1xuXG4gIC5mYWN0b3J5KCdBcHBDYWNoZScsIFsnTG9nZ2VyJywgKExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFwcENhY2hlKExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTW9kZWwnLCBbJ1N0b3JhZ2VQcm92aWRlcicsICdIZWF0TWFwJywgKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01vZGVsKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2FydE1vZGVsJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnQ2hhdE1vZGVsJywgWydTTkFQTG9jYXRpb24nLCAnU05BUEVudmlyb25tZW50JywgJ1N0b3JhZ2VQcm92aWRlcicsIChTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2hhdE1vZGVsKFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0N1c3RvbWVyTW9kZWwnLCBbJ1NOQVBMb2NhdGlvbicsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DdXN0b21lck1vZGVsKFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEYXRhUHJvdmlkZXInLCBbJ1NOQVBMb2NhdGlvbicsICdEdHNBcGknLCAoU05BUExvY2F0aW9uLCBEdHNBcGkpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EYXRhUHJvdmlkZXIoU05BUExvY2F0aW9uLCBEdHNBcGkpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0hlYXRNYXAnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuSGVhdE1hcChkb2N1bWVudC5ib2R5KTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0xvY2F0aW9uTW9kZWwnLCBbJ0R0c0FwaScsICdTTkFQRW52aXJvbm1lbnQnLCAnU05BUExvY2F0aW9uJywgJ1N0b3JhZ2VQcm92aWRlcicsIChEdHNBcGksIFNOQVBFbnZpcm9ubWVudCwgU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Mb2NhdGlvbk1vZGVsKER0c0FwaSwgU05BUEVudmlyb25tZW50LCBTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnT3JkZXJNb2RlbCcsIFsnU3RvcmFnZVByb3ZpZGVyJywgKFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLk9yZGVyTW9kZWwoU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTaGVsbE1vZGVsJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNoZWxsTW9kZWwoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ1N1cnZleU1vZGVsJywgWydTTkFQTG9jYXRpb24nLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU3VydmV5TW9kZWwoU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1Nlc3Npb25Nb2RlbCcsIFsnU3RvcmFnZVByb3ZpZGVyJywgKFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25Nb2RlbChTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1N0b3JhZ2VQcm92aWRlcicsICgpID0+ICB7XG4gICAgcmV0dXJuIChpZCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBhcHAuQ29yZG92YUxvY2FsU3RvcmFnZVN0b3JlKGlkKTtcbiAgICB9O1xuICB9KVxuXG4gIC8vTWFuYWdlcnNcblxuICAuZmFjdG9yeSgnQWN0aXZpdHlNb25pdG9yJywgWyckcm9vdFNjb3BlJywgJyR0aW1lb3V0JywgKCRyb290U2NvcGUsICR0aW1lb3V0KSA9PiB7XG4gICAgdmFyIG1vbml0b3IgPSBuZXcgYXBwLkFjdGl2aXR5TW9uaXRvcigkcm9vdFNjb3BlLCAkdGltZW91dCk7XG4gICAgbW9uaXRvci50aW1lb3V0ID0gMzAwMDA7XG4gICAgcmV0dXJuIG1vbml0b3I7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTWFuYWdlcicsIFsnVGVsZW1ldHJ5U2VydmljZScsICdBbmFseXRpY3NNb2RlbCcsICdMb2dnZXInLCAoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01hbmFnZXIoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgWydEdHNBcGknLCAnU2Vzc2lvbk1vZGVsJywgJ1NOQVBFbnZpcm9ubWVudCcsICdXZWJCcm93c2VyJywgJ0xvZ2dlcicsIChEdHNBcGksIFNlc3Npb25Nb2RlbCwgU05BUEVudmlyb25tZW50LCBXZWJCcm93c2VyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BdXRoZW50aWNhdGlvbk1hbmFnZXIoRHRzQXBpLCBTZXNzaW9uTW9kZWwsIFNOQVBFbnZpcm9ubWVudCwgV2ViQnJvd3NlciwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdDdXN0b21lck1hbmFnZXInLCBbJ1NOQVBMb2NhdGlvbicsICdTTkFQRW52aXJvbm1lbnQnLCAnRHRzQXBpJywgJ0N1c3RvbWVyTW9kZWwnLCAnU2Vzc2lvbk1vZGVsJywgKFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwsIFNlc3Npb25Nb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTWFuYWdlcihTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBDdXN0b21lck1vZGVsLCBTZXNzaW9uTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0NoYXRNYW5hZ2VyJywgWydBbmFseXRpY3NNb2RlbCcsICdDaGF0TW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ1NvY2tldENsaWVudCcsIChBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DaGF0TWFuYWdlcihBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0RhdGFNYW5hZ2VyJywgWydEYXRhUHJvdmlkZXInLCAnTG9nZ2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsIChEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuRGF0YU1hbmFnZXIoRGF0YVByb3ZpZGVyLCBMb2dnZXIsIFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGlhbG9nTWFuYWdlcicsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EaWFsb2dNYW5hZ2VyKCk7XG4gIH0pXG4gIC5mYWN0b3J5KCdMb2NhdGlvbk1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdEdHNBcGknLCAnTG9jYXRpb25Nb2RlbCcsICdMb2dnZXInLCAoRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkxvY2F0aW9uTWFuYWdlcihEYXRhUHJvdmlkZXIsIER0c0FwaSwgTG9jYXRpb25Nb2RlbCwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdOYXZpZ2F0aW9uTWFuYWdlcicsIFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJHdpbmRvdycsICdBbmFseXRpY3NNb2RlbCcsICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIEFuYWx5dGljc01vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTmF2aWdhdGlvbk1hbmFnZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBBbmFseXRpY3NNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnT3JkZXJNYW5hZ2VyJywgWydDaGF0TW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdEdHNBcGknLCAnT3JkZXJNb2RlbCcsIChDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIER0c0FwaSwgT3JkZXJNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLk9yZGVyTWFuYWdlcihDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIER0c0FwaSwgT3JkZXJNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvbk1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNb2RlbCcsICdTdXJ2ZXlNb2RlbCcsICdTdG9yYWdlUHJvdmlkZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25NYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2hlbGxNYW5hZ2VyJywgWyckc2NlJywgJ0RhdGFQcm92aWRlcicsICdTaGVsbE1vZGVsJywgJ1NOQVBMb2NhdGlvbicsICdTTkFQRW52aXJvbm1lbnQnLCAnU05BUEhvc3RzJywgKCRzY2UsIERhdGFQcm92aWRlciwgU2hlbGxNb2RlbCwgU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykgPT4ge1xuICAgIGxldCBtYW5hZ2VyID0gbmV3IGFwcC5TaGVsbE1hbmFnZXIoJHNjZSwgRGF0YVByb3ZpZGVyLCBTaGVsbE1vZGVsLCBTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICBEYXRhUHJvdmlkZXIuX2dldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IG1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7IC8vVG9EbzogcmVmYWN0b3JcbiAgICByZXR1cm4gbWFuYWdlcjtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2NpYWxNYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAnRHRzQXBpJywgJ1dlYkJyb3dzZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2NpYWxNYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvZnR3YXJlTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgKFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvZnR3YXJlTWFuYWdlcihTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1N1cnZleU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdTdXJ2ZXlNb2RlbCcsIChEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU3VydmV5TWFuYWdlcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKTtcbiAgfV0pO1xuIl19
