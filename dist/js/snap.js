//src/js/shared/_base.js

'use strict';

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

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
  }, {
    key: 'sendMessage',

    //-----------------------------------------------
    //    Messaging
    //-----------------------------------------------

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
  }, {
    key: 'checkIfUnread',

    //-----------------------------------------------
    //    Notifications
    //-----------------------------------------------

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
  }, {
    key: 'sendGift',

    //-----------------------------------------------
    //    Gifts
    //-----------------------------------------------

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
  }, {
    key: '_onMessage',

    //------------------------------------------------------------------------
    //
    //  Private methods
    //
    //------------------------------------------------------------------------

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
  }, {
    key: 'addToCart',

    //-----------------------------------------------
    //    Cart and checks
    //-----------------------------------------------

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
  }, {
    key: '_notifyChange',

    //------------------------------------------------------------------------
    //
    //  Private methods
    //
    //------------------------------------------------------------------------

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

    //------------------------------------------------------------------------
    //
    //  Properties
    //
    //------------------------------------------------------------------------

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
  }, {
    key: 'navigated',

    //-----------------------------------------------
    //    External methods
    //-----------------------------------------------

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
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\#&]' + name + '=([^&#]*)'),
        results = regex.exec(location.hash);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, ' '));
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

  _createClass(ApplicationBootstraper, [{
    key: 'configure',

    //-----------------------------------------------
    //    Public methods
    //-----------------------------------------------

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
  }, {
    key: '_getPartialUrl',

    //-----------------------------------------------
    //    Helper methods
    //-----------------------------------------------

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
          message = 'Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.';
          break;
        case ALERT_REQUEST_SUBMIT_ERROR:
          message = 'Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.';
          break;
        case ALERT_REQUEST_ASSISTANCE_SENT:
          message = 'Call Server request was sent successfully.';
          break;
        case ALERT_REQUEST_ASSISTANCE_RECEIVED:
          message = 'Your request for server assistance has been seen, and accepted.';
          break;
        case ALERT_REQUEST_CLOSEOUT_SENT:
          message = 'Request check request was sent successfully.';
          break;
        case ALERT_REQUEST_CLOSEOUT_RECEIVED:
          message = 'Your check request has been seen, and accepted.';
          break;
        case ALERT_REQUEST_ORDER_SENT:
          message = 'Order sent! You will be notified when your waiter accepts the order.';
          break;
        case ALERT_REQUEST_ORDER_RECEIVED:
          message = 'Your order has been successfully accepted.';
          break;
        case ALERT_SIGNIN_REQUIRED:
          message = 'You must be logged into SNAP to access this page.';
          break;
        case ALERT_TABLE_ASSISTANCE:
          message = 'Are you sure you want to call the waiter?';
          break;
        case ALERT_TABLE_CLOSEOUT:
          message = 'Are you sure you want to request your check?';
          break;
        case ALERT_TABLE_RESET:
          message = 'Are you sure you want to reset?';
          break;
        case ALERT_DELET_CARD:
          message = 'Are you sure you want to remove this payment method?';
          break;
        case ALERT_PASSWORD_RESET_COMPLETE:
          message = 'A link to change your password has been emailed.';
          break;
        case ALERT_SOFTWARE_OUTDATED:
          message = 'A software update is available. Please restart the application.';
          break;
        case ALERT_CARDREADER_ERROR:
          message = 'Unable to read the card data. Please try again.';
          break;
        case ALERT_ERROR_NO_SEAT:
          message = 'Device is not assigned to any table.';
          break;
        case ALERT_ERROR_STARTUP:
          message = 'Unable to start the application.';
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
      $scope.menus.forEach(function (menu) {});
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
    if (attr !== '') {
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

//menu.selected = (location.type === 'menu' && menu.token === location.token);
//# sourceMappingURL=data:application/json;base64,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QUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUNuRSxTQUFPLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNqRCxDQUFDLENBQUMsQ0FDRixPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxVQUFDLFlBQVksRUFBRSxXQUFXLEVBQUs7QUFDdkYsU0FBTyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQ3pELENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlbXAvc25hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vc3JjL2pzL3NoYXJlZC9fYmFzZS5qc1xuXG53aW5kb3cuYXBwID0ge307XG5cbnZhciBBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUiA9IDEsXG4gICAgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQgPSAxMCxcbiAgICBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQgPSAxMSxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQgPSAyMCxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEID0gMjEsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UID0gMzAsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCA9IDMxLFxuICAgIEFMRVJUX1NJR05JTl9SRVFVSVJFRCA9IDQwLFxuICAgIEFMRVJUX1RBQkxFX1JFU0VUID0gNTAsXG4gICAgQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSA9IDUxLFxuICAgIEFMRVJUX1RBQkxFX0NMT1NFT1VUID0gNTIsXG4gICAgQUxFUlRfR0VORVJJQ19FUlJPUiA9IDEwMCxcbiAgICBBTEVSVF9ERUxFVF9DQVJEID0gMjAwLFxuICAgIEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFID0gMjEwLFxuICAgIEFMRVJUX1NPRlRXQVJFX09VVERBVEVEID0gMjIwLFxuICAgIEFMRVJUX0NBUkRSRUFERVJfRVJST1IgPSAzMTAsXG4gICAgQUxFUlRfRVJST1JfTk9fU0VBVCA9IDQxMCxcbiAgICBBTEVSVF9FUlJPUl9TVEFSVFVQID0gNTEwO1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2FuYWx5dGljc2RhdGEuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NEYXRhID0gY2xhc3MgQW5hbHl0aWNzRGF0YSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHN0b3JhZ2VQcm92aWRlciwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlIHx8ICgoKSA9PiBbXSk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RlZmF1bHRWYWx1ZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2FuYWx5dGljc18nICsgbmFtZSk7XG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4oZGF0YSA9PiBzZWxmLl9kYXRhID0gZGF0YSB8fCBzZWxmLl9kYXRhKTtcbiAgfVxuXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG5cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gIH1cblxuICBzZXQgZGF0YSh2YWx1ZSkge1xuICAgIHRoaXMuX2RhdGEgPSB2YWx1ZTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5sZW5ndGg7XG4gIH1cblxuICBnZXQgbGFzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVt0aGlzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgcHVzaChpdGVtKSB7XG4gICAgdGhpcy5fZGF0YS5wdXNoKGl0ZW0pO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGVmYXVsdFZhbHVlKCk7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIHN0b3JlKCkge1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX2RhdGEpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2NhcnRpdGVtLmpzXG5cbndpbmRvdy5hcHAuQ2FydEl0ZW0gPSBjbGFzcyBDYXJ0SXRlbSB7XG4gIGNvbnN0cnVjdG9yKGl0ZW0sIHF1YW50aXR5LCBuYW1lLCBtb2RpZmllcnMsIHJlcXVlc3QpIHtcbiAgICB0aGlzLml0ZW0gPSBpdGVtO1xuICAgIHRoaXMucXVhbnRpdHkgPSBxdWFudGl0eTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgICBpZiAoIXRoaXMuaGFzTW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICghbW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IGl0ZW0ubW9kaWZpZXJzLm1hcChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeShjYXRlZ29yeSwgY2F0ZWdvcnkuaXRlbXMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyKG1vZGlmaWVyKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhhc01vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtLm1vZGlmaWVycyAhPSBudWxsICYmIHRoaXMuaXRlbS5tb2RpZmllcnMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZE1vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnMucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzQ2F0ZWdvcnksIGNhdGVnb3J5LCBpLCBhcnJheSkge1xuICAgICAgcmV0dXJuIGFycmF5LmNvbmNhdChjYXRlZ29yeS5pdGVtcy5maWx0ZXIoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgICB9KSk7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgY2xvbmUoY291bnQpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgIHRoaXMuaXRlbSxcbiAgICAgIHRoaXMucXVhbnRpdHksXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICB0aGlzLm1vZGlmaWVycy5tYXAoY2F0ZWdvcnkgPT4gY2F0ZWdvcnkuY2xvbmUoKSksXG4gICAgICB0aGlzLnJlcXVlc3QpO1xuICB9XG5cbiAgY2xvbmVNYW55KGNvdW50KSB7XG4gICAgY291bnQgPSBjb3VudCB8fCB0aGlzLnF1YW50aXR5O1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2gobmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgICAgdGhpcy5pdGVtLFxuICAgICAgICAxLFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMubW9kaWZpZXJzLm1hcChjYXRlZ29yeSA9PiBjYXRlZ29yeS5jbG9uZSgpKSxcbiAgICAgICAgdGhpcy5yZXF1ZXN0KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcmVzdG9yZShkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydEl0ZW0oXG4gICAgICBkYXRhLml0ZW0sXG4gICAgICBkYXRhLnF1YW50aXR5LFxuICAgICAgZGF0YS5uYW1lLFxuICAgICAgZGF0YS5tb2RpZmllcnMubWFwKGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUucmVzdG9yZSksXG4gICAgICBkYXRhLnJlcXVlc3RcbiAgICApO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2NhcnRtb2RpZmllci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcnRNb2RpZmllclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXIgPSBmdW5jdGlvbihkYXRhLCBpc1NlbGVjdGVkKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkIHx8IGZhbHNlO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIodGhpcy5kYXRhLCB0aGlzLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIoZGF0YS5kYXRhLCBkYXRhLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyID0gQ2FydE1vZGlmaWVyO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJ0TW9kaWZpZXJDYXRlZ29yeVxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXJDYXRlZ29yeSA9IGZ1bmN0aW9uKGRhdGEsIG1vZGlmaWVycykge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGlmaWVycyA9IHRoaXMubW9kaWZpZXJzLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgcmV0dXJuIG1vZGlmaWVyLmNsb25lKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkodGhpcy5kYXRhLCBtb2RpZmllcnMpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KGRhdGEuZGF0YSwgZGF0YS5tb2RpZmllcnMubWFwKENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSkpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkgPSBDYXJ0TW9kaWZpZXJDYXRlZ29yeTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vcmVxdWVzdHdhdGNoZXIuanNcblxud2luZG93LmFwcC5SZXF1ZXN0V2F0Y2hlciA9IGNsYXNzIFJlcXVlc3RXYXRjaGVyIHtcbiAgY29uc3RydWN0b3IodGlja2V0LCBEdHNBcGkpIHtcbiAgICB0aGlzLl90b2tlbiA9IHRpY2tldC50b2tlbjtcbiAgICB0aGlzLl9yZW1vdGUgPSBEdHNBcGk7XG5cbiAgICB0aGlzLlBPTExJTkdfSU5URVJWQUwgPSA1MDAwO1xuXG4gICAgdGhpcy5SRVFVRVNUX1NUQVRVU19QRU5ESU5HID0gMTtcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX1JFQ0VJVkVEID0gMjtcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX0FDQ0VQVEVEID0gMztcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX0VYUElSRUQgPSAyNTU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX3N0YXR1c1VwZGF0ZVJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdGlja2V0ID0geyBzdGF0dXM6IDAgfTtcbiAgICB0aGlzLl93YXRjaFN0YXR1cygpO1xuICB9XG5cbiAgZ2V0IHRva2VuKCkge1xuICAgIHJldHVybiB0aGlzLl90b2tlbjtcbiAgfVxuXG4gIGdldCB0aWNrZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpY2tldDtcbiAgfVxuXG4gIGdldCBwcm9taXNlKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dElkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RpY2tldC5zdGF0dXMgPCB0aGlzLlJFUVVFU1RfU1RBVFVTX0FDQ0VQVEVEKSB7XG4gICAgICB0aGlzLl9zdGF0dXNVcGRhdGVSZWplY3QoKTtcbiAgICB9XG4gIH1cblxuICBfd2F0Y2hTdGF0dXMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3RpbWVvdXRJZCkge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0SWQpO1xuICAgIH1cblxuICAgIHZhciBvblRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICBzZWxmLl9yZW1vdGUud2FpdGVyLmdldFN0YXR1cyhzZWxmLl90b2tlbikudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHNlbGYuX3NldFRpY2tldChyZXNwb25zZSk7XG4gICAgICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgPT09IHNlbGYuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQpIHtcbiAgICAgIHNlbGYuX3N0YXR1c1VwZGF0ZVJlc29sdmUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyAhPT0gc2VsZi5SRVFVRVNUX1NUQVRVU19FWFBJUkVEKSB7XG4gICAgICBzZWxmLl90aW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dChvblRpbWVvdXQsIHRoaXMuUE9MTElOR19JTlRFUlZBTCk7XG4gICAgfVxuICB9XG5cbiAgX3NldFRpY2tldCh2YWx1ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzID09PSB2YWx1ZS5zdGF0dXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLl90aWNrZXQgPSB2YWx1ZTtcbiAgICBzZWxmLl93YXRjaFN0YXR1cygpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL3dlYmJyb3dzZXJyZWZlcmVuY2UuanNcblxud2luZG93LmFwcC5XZWJCcm93c2VyUmVmZXJlbmNlID0gY2xhc3MgV2ViQnJvd3NlclJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGJyb3dzZXJSZWYpIHtcbiAgICB0aGlzLmJyb3dzZXIgPSBicm93c2VyUmVmO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uRXhpdCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DYWxsYmFjayA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZXhpdCgpIHtcbiAgICB0aGlzLm9uRXhpdC5kaXNwYXRjaCgpO1xuICB9XG59O1xuXG5cbndpbmRvdy5hcHAuQ29yZG92YVdlYkJyb3dzZXJSZWZlcmVuY2UgPSBjbGFzcyBDb3Jkb3ZhV2ViQnJvd3NlclJlZmVyZW5jZSBleHRlbmRzIGFwcC5XZWJCcm93c2VyUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IoYnJvd3NlclJlZikge1xuICAgIHN1cGVyKGJyb3dzZXJSZWYpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIG9uTG9hZFN0YXJ0KGV2ZW50KSB7XG4gICAgICBzZWxmLm9uTmF2aWdhdGVkLmRpc3BhdGNoKGV2ZW50LnVybCk7XG4gICAgfVxuICAgIHRoaXMuX29uTG9hZFN0YXJ0ID0gb25Mb2FkU3RhcnQ7XG5cbiAgICBmdW5jdGlvbiBvbkV4aXQoKSB7XG4gICAgICBicm93c2VyUmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIG9uTG9hZFN0YXJ0KTtcbiAgICAgIGJyb3dzZXJSZWYucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXhpdCcsIG9uRXhpdCk7XG4gICAgICBzZWxmLm9uRXhpdC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgICB0aGlzLl9vbkV4aXQgPSBvbkV4aXQ7XG5cbiAgICB0aGlzLmJyb3dzZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0Jywgb25Mb2FkU3RhcnQpO1xuICAgIHRoaXMuYnJvd3Nlci5hZGRFdmVudExpc3RlbmVyKCdleGl0Jywgb25FeGl0KTtcbiAgfVxuXG4gIGV4aXQoKSB7XG4gICAgc3VwZXIuZXhpdCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIHRoaXMuYnJvd3Nlci5jbG9zZSgpO1xuICB9XG5cbiAgX2Rpc3Bvc2UoKSB7XG4gICAgdGhpcy5vbk5hdmlnYXRlZC5kaXNwb3NlKCk7XG4gICAgdGhpcy5vbkV4aXQuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5icm93c2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIHRoaXMuX29uTG9hZFN0YXJ0KTtcbiAgICB0aGlzLmJyb3dzZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXhpdCcsIHRoaXMuX29uRXhpdCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9hY3Rpdml0eW1vbml0b3IuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBY3Rpdml0eU1vbml0b3IgPSBmdW5jdGlvbigkcm9vdFNjb3BlLCAkdGltZW91dCkge1xuICAgIHRoaXMuJCRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgIHRoaXMuJCR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgdGhpcy5fdGltZW91dCA9IDEwMDAwO1xuXG4gICAgdGhpcy5fYWN0aXZlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLiQkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuICAgICAgICBzZWxmLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICB9O1xuXG4gIEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ3RpbWVvdXQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3RpbWVvdXQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdlbmFibGVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9lbmFibGVkOyB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5fZW5hYmxlZCA9IHZhbHVlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl90aW1lciAhPSBudWxsOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlQ2hhbmdlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fYWN0aXZlQ2hhbmdlZDsgfVxuICB9KTtcblxuICBBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLmFjdGl2aXR5RGV0ZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hhbmdlZDtcblxuICAgIGlmICh0aGlzLl90aW1lcikge1xuICAgICAgdGhpcy4kJHRpbWVvdXQuY2FuY2VsKHRoaXMuX3RpbWVyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fdGltZXIgPT09IG51bGwpIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBvblRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX3RpbWVyID0gbnVsbDtcblxuICAgICAgc2VsZi4kJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLmVuYWJsZWQpIHtcbiAgICAgICAgICBzZWxmLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5hY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdGltZXIgPSB0aGlzLiQkdGltZW91dChvblRpbWVvdXQsIHRoaXMuX3RpbWVvdXQpO1xuXG4gICAgaWYgKGNoYW5nZWQgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmUpO1xuICAgIH1cbiAgfTtcblxuICB3aW5kb3cuYXBwLkFjdGl2aXR5TW9uaXRvciA9IEFjdGl2aXR5TW9uaXRvcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9hbmFseXRpY3NtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQW5hbHl0aWNzTWFuYWdlciA9IGNsYXNzIEFuYWx5dGljc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihUZWxlbWV0cnlTZXJ2aWNlLCBBbmFseXRpY3NNb2RlbCwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fVGVsZW1ldHJ5U2VydmljZSA9IFRlbGVtZXRyeVNlcnZpY2U7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH1cblxuICBzdWJtaXQoKSB7XG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTdWJtaXR0aW5nIGFuYWx5dGljcyBkYXRhIHdpdGggYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5zZXNzaW9ucy5sZW5ndGh9IHNlYXQgc2Vzc2lvbnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuYW5zd2Vycy5sZW5ndGh9IGFuc3dlcnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY2hhdHMubGVuZ3RofSBjaGF0cywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jb21tZW50cy5sZW5ndGh9IGNvbW1lbnRzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNsaWNrcy5sZW5ndGh9IGNsaWNrcywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5wYWdlcy5sZW5ndGh9IHBhZ2VzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmFkdmVydGlzZW1lbnRzLmxlbmd0aH0gYWR2ZXJ0aXNlbWVudHMgYW5kIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwudXJscy5sZW5ndGh9IFVSTHMuYCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX1RlbGVtZXRyeVNlcnZpY2Uuc3VibWl0VGVsZW1ldHJ5KHtcbiAgICAgICAgc2Vzc2lvbnM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnNlc3Npb25zLmRhdGEsXG4gICAgICAgIGFkdmVydGlzZW1lbnRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hZHZlcnRpc2VtZW50cy5kYXRhLFxuICAgICAgICBhbnN3ZXJzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hbnN3ZXJzLmRhdGEsXG4gICAgICAgIGNoYXRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jaGF0cy5kYXRhLFxuICAgICAgICBjb21tZW50czogc2VsZi5fQW5hbHl0aWNzTW9kZWwuY29tbWVudHMuZGF0YSxcbiAgICAgICAgY2xpY2tzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jbGlja3MuZGF0YSxcbiAgICAgICAgcGFnZXM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnBhZ2VzLmRhdGEsXG4gICAgICAgIHVybHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnVybHMuZGF0YVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0FuYWx5dGljc01vZGVsLmNsZWFyKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIGUgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIud2FybignVW5hYmxlIHRvIHN1Ym1pdCBhbmFseXRpY3MgZGF0YTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvYXV0aGVudGljYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQXV0aGVudGljYXRpb25NYW5hZ2VyID0gY2xhc3MgQXV0aGVudGljYXRpb25NYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKEJhY2tlbmRBcGksIFNlc3Npb25Nb2RlbCwgU05BUEVudmlyb25tZW50LCBXZWJCcm93c2VyLCBMb2dnZXIpIHtcbiAgICB0aGlzLl9CYWNrZW5kQXBpID0gQmFja2VuZEFwaTtcbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX1dlYkJyb3dzZXIgPSBXZWJCcm93c2VyO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgfVxuXG4gIHZhbGlkYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbW9kZWwgPSBzZWxmLl9TZXNzaW9uTW9kZWw7XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ1ZhbGlkYXRpbmcgYWNjZXNzIHRva2VuLi4uJyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbW9kZWwuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB2YXIgdG9rZW4gPSBtb2RlbC5hcGlUb2tlbjtcblxuICAgICAgICBpZiAoIXRva2VuIHx8ICFzZWxmLl92YWxpZGF0ZVRva2VuKHRva2VuKSkge1xuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXphdGlvbiBpcyBub3QgdmFsaWQuJyk7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdWYWxpZGF0aW5nIGF1dGhvcml6YXRpb24gc2Vzc2lvbi4uLicpO1xuXG4gICAgICAgICAgc2VsZi5fQmFja2VuZEFwaS5vYXV0aDIuZ2V0U2Vzc2lvbigpLnRoZW4oc2Vzc2lvbiA9PiB7XG4gICAgICAgICAgICBzZXNzaW9uID0gVVJJKCc/JyArIHNlc3Npb24pLnF1ZXJ5KHRydWUpOyAvL1RvRG86IHJlbW92ZSB0aGlzIGhhY2tcblxuICAgICAgICAgICAgaWYgKHNlc3Npb24gJiYgc2Vzc2lvbi52YWxpZCA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXphdGlvbiBpcyB2YWxpZC4nLCBzZXNzaW9uKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0F1dGhvcml6YXRpb24gaXMgbm90IHZhbGlkIG9yIGV4cGlyZWQuJywgc2Vzc2lvbik7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZSA9PiB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1VuYWJsZSB0byB2YWxpZGF0ZSBhdXRob3JpemF0aW9uLicsIGUpO1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGUgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0Vycm9yIHZhbGlkYXRpbmcgYXV0aG9yaXphdGlvbi4nLCBlKTtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXV0aG9yaXplKCkge1xuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXppbmcgQVBJIGFjY2Vzcy4uLicpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdmFyIGFwcGxpY2F0aW9uID0gc2VsZi5fU05BUEVudmlyb25tZW50Lm1haW5fYXBwbGljYXRpb24sXG4gICAgICAgICAgICBhdXRoVXJsID0gc2VsZi5fQmFja2VuZEFwaS5vYXV0aDIuZ2V0VG9rZW5BdXRob3JpemVVcmwoYXBwbGljYXRpb24uY2xpZW50X2lkLCBhcHBsaWNhdGlvbi5jYWxsYmFja191cmwsIGFwcGxpY2F0aW9uLnNjb3BlKTtcblxuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4oYXV0aFVybCwgeyBzeXN0ZW06IHRydWUgfSkudGhlbihicm93c2VyID0+IHtcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVDYWxsYmFjayh1cmwpIHtcbiAgICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihhcHBsaWNhdGlvbi5jYWxsYmFja191cmwpICE9PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJvd3Nlci5leGl0KCk7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja1Jlc3BvbnNlID0gdXJsLnNwbGl0KCcjJylbMV0sXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzID0gY2FsbGJhY2tSZXNwb25zZS5zcGxpdCgnJicpLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlck1hcCA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBwYXJhbWV0ZXJNYXBbcmVzcG9uc2VQYXJhbWV0ZXJzW2ldLnNwbGl0KCc9JylbMF1dID0gcmVzcG9uc2VQYXJhbWV0ZXJzW2ldLnNwbGl0KCc9JylbMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJNYXAuYWNjZXNzX3Rva2VuICE9PSB1bmRlZmluZWQgJiYgcGFyYW1ldGVyTWFwLmFjY2Vzc190b2tlbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB2YXIgdG9rZW4gPSB7XG4gICAgICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBwYXJhbWV0ZXJNYXAuYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgICAgIGV4cGlyZXNfaW46IHBhcmFtZXRlck1hcC5leHBpcmVzX2luXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdOZXcgYWNjZXNzIHRva2VuIGlzc3VlZC4nLCB0b2tlbik7XG5cbiAgICAgICAgICAgICAgc2VsZi5fU2Vzc2lvbk1vZGVsLmFwaVRva2VuID0gdG9rZW47XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdQcm9ibGVtIGlzc3VpbmcgbmV3IGFjY2VzcyB0b2tlbi4nLCBwYXJhbWV0ZXJNYXApO1xuICAgICAgICAgICAgcmVqZWN0KCdQcm9ibGVtIGF1dGhlbnRpY2F0aW5nOiAnICsgdXJsKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicm93c2VyLm9uQ2FsbGJhY2suYWRkKHVybCA9PiBoYW5kbGVDYWxsYmFjayh1cmwpKTtcbiAgICAgICAgICBicm93c2VyLm9uTmF2aWdhdGVkLmFkZCh1cmwgPT4gaGFuZGxlQ2FsbGJhY2sodXJsKSk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY3VzdG9tZXJMb2dpblJlZ3VsYXIoY3JlZGVudGlhbHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBhcHBsaWNhdGlvbiA9IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcbiAgICAgIHNlbGYuX0JhY2tlbmRBcGkub2F1dGgyLmdldFRva2VuV2l0aENyZWRlbnRpYWxzKFxuICAgICAgICBhcHBsaWNhdGlvbi5jbGllbnRfaWQsXG4gICAgICAgIGNyZWRlbnRpYWxzLmxvZ2luLFxuICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZFxuICAgICAgKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5lcnJvciB8fCAhcmVzdWx0LmFjY2Vzc190b2tlbikge1xuICAgICAgICAgIHJldHVybiByZWplY3QocmVzdWx0LmVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICAgIGFjY2Vzc190b2tlbjogcmVzdWx0LmFjY2Vzc190b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQuZXhwaXJlc19pbikge1xuICAgICAgICAgIHNlc3Npb24uZXhwaXJlcyA9IG1vbWVudCgpLmFkZChyZXN1bHQuZXhwaXJlc19pbiwgJ3NlY29uZHMnKS51bml4KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IHNlc3Npb247XG5cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN1c3RvbWVyTG9naW5Tb2NpYWwodG9rZW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuLmFjY2Vzc190b2tlblxuICAgICAgfTtcblxuICAgICAgaWYgKHRva2VuLmV4cGlyZXNfaW4pIHtcbiAgICAgICAgc2Vzc2lvbi5leHBpcmVzID0gbW9tZW50KCkuYWRkKHRva2VuLmV4cGlyZXNfaW4sICdzZWNvbmRzJykudW5peCgpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IHNlc3Npb247XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF92YWxpZGF0ZVRva2VuKHRva2VuKSB7XG4gICAgaWYgKCF0b2tlbiB8fCAhdG9rZW4uYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodG9rZW4uZXhwaXJlcykge1xuICAgICAgdmFyIGV4cGlyZXMgPSBtb21lbnQudW5peCh0b2tlbi5leHBpcmVzKTtcblxuICAgICAgaWYgKGV4cGlyZXMuaXNCZWZvcmUobW9tZW50KCkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2NoYXRtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQ2hhdE1hbmFnZXIgPSBjbGFzcyBDaGF0TWFuYWdlciB7XG4gIC8qIGdsb2JhbCBtb21lbnQsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLk1FU1NBR0VfVFlQRVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uJyxcbiAgICAgIERFVklDRTogJ2RldmljZSdcbiAgICB9O1xuICAgIHRoaXMuTUVTU0FHRV9TVEFUVVNFUyA9IHtcbiAgICAgIENIQVRfUkVRVUVTVDogJ2NoYXRfcmVxdWVzdCcsXG4gICAgICBDSEFUX1JFUVVFU1RfQUNDRVBURUQ6ICdjaGF0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOiAnY2hhdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIEdJRlRfUkVRVUVTVDogJ2dpZnRfcmVxdWVzdCcsXG4gICAgICBHSUZUX1JFUVVFU1RfQUNDRVBURUQ6ICdnaWZ0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOiAnZ2lmdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIENIQVRfQ0xPU0VEOiAnY2hhdF9jbG9zZWQnXG4gICAgfTtcbiAgICB0aGlzLk9QRVJBVElPTlMgPSB7XG4gICAgICBDSEFUX01FU1NBR0U6ICdjaGF0X21lc3NhZ2UnLFxuICAgICAgU1RBVFVTX1JFUVVFU1Q6ICdzdGF0dXNfcmVxdWVzdCcsXG4gICAgICBTVEFUVVNfVVBEQVRFOiAnc3RhdHVzX3VwZGF0ZSdcbiAgICB9O1xuICAgIHRoaXMuUk9PTVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uXycsXG4gICAgICBERVZJQ0U6ICdkZXZpY2VfJ1xuICAgIH07XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQgPSBTb2NrZXRDbGllbnQ7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNQcmVzZW50Q2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuaXNDb25uZWN0ZWRDaGFuZ2VkLmFkZChpc0Nvbm5lY3RlZCA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmlzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCk7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzUmVxdWVzdCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnN1YnNjcmliZSh0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbi50b2tlbiwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19SRVFVRVNUOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzUmVxdWVzdChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURTpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zdWJzY3JpYmUodGhpcy5ST09NUy5ERVZJQ0UgKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19VUERBVEU6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNVcGRhdGUobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0NoYXRNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubW9kZWwucmVzZXQoKTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTWVzc2FnaW5nXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5kZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZTtcbiAgICBtZXNzYWdlLm9wZXJhdGlvbiA9IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0U7XG4gICAgbWVzc2FnZS50eXBlID0gbWVzc2FnZS50b19kZXZpY2UgP1xuICAgICAgdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSA6XG4gICAgICB0aGlzLk1FU1NBR0VfVFlQRVMuTE9DQVRJT047XG5cbiAgICB0aGlzLl9hZGRNZXNzYWdlSUQobWVzc2FnZSk7XG4gICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KG1lc3NhZ2UpO1xuXG4gICAgdmFyIHRvcGljID0gdGhpcy5fZ2V0VG9waWMobWVzc2FnZSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0b3BpYywgbWVzc2FnZSk7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nQ2hhdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFwcHJvdmVEZXZpY2UodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgdGhpcy5tb2RlbC5zZXRMYXN0UmVhZCh0b2tlbiwgbW9tZW50KCkudW5peCgpKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzUGVuZGluZ0RldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZVBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcblxuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1QsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5hZGRBY3RpdmVEZXZpY2UoZGV2aWNlKTtcbiAgICB9XG4gIH1cblxuICBkZWNsaW5lRGV2aWNlKHRva2VuKSB7XG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRva2VuKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSk7XG5cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRNZXNzYWdlTmFtZShtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgcmV0dXJuICdNZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2UudXNlcm5hbWUgfHwgdGhpcy5nZXREZXZpY2VOYW1lKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIGdldERldmljZU5hbWUodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgaWYgKGRldmljZSkge1xuICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBkZXZpY2UudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICdNZSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZXZpY2UudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZS51c2VybmFtZTtcbiAgICAgIH1cblxuICAgICAgZm9yKHZhciBwIGluIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHMpIHtcbiAgICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0udG9rZW4gPT09IGRldmljZS5zZWF0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0ubmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBOb3RpZmljYXRpb25zXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjaGVja0lmVW5yZWFkKGRldmljZV90b2tlbiwgbWVzc2FnZSkge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1vbWVudC51bml4KG1lc3NhZ2UucmVjZWl2ZWQpLmlzQWZ0ZXIobW9tZW50LnVuaXgobGFzdFJlYWQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pID4gMDtcbiAgfVxuXG4gIGdldFVucmVhZENvdW50KGRldmljZV90b2tlbikge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZnJvbURhdGUgPSBtb21lbnQudW5peChsYXN0UmVhZCk7XG5cbiAgICByZXR1cm4gdGhpcy5tb2RlbC5oaXN0b3J5XG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS50eXBlID09PSBzZWxmLk1FU1NBR0VfVFlQRVMuREVWSUNFICYmIG1lc3NhZ2UuZGV2aWNlID09PSBkZXZpY2VfdG9rZW4pXG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbW9tZW50LnVuaXgobWVzc2FnZS5yZWNlaXZlZCkuaXNBZnRlcihmcm9tRGF0ZSkpXG4gICAgICAubGVuZ3RoO1xuICB9XG5cbiAgbWFya0FzUmVhZChkZXZpY2VfdG9rZW4pIHtcbiAgICB0aGlzLm1vZGVsLnNldExhc3RSZWFkKGRldmljZV90b2tlbiwgbW9tZW50KCkudW5peCgpKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgR2lmdHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNlbmRHaWZ0KGl0ZW1zKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmdpZnREZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCxcbiAgICAgIHRvX2RldmljZTogdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgdGV4dDogaXRlbXMucmVkdWNlKChyZXN1bHQsIGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgICByZXN1bHQgKz0gJywgJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gaXRlbS5pdGVtLnRpdGxlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgJycpXG4gICAgfSk7XG4gIH1cblxuICBhY2NlcHRHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIGRlY2xpbmVHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0R2lmdChkZXZpY2VfdG9rZW4pIHtcbiAgICBsZXQgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKTtcblxuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IGRldmljZV90b2tlbjtcbiAgICB0aGlzLm1vZGVsLmdpZnRTZWF0ID0gZGV2aWNlLnNlYXQ7XG4gIH1cblxuICBlbmRHaWZ0KCkge1xuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgdGhpcy5tb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX29uTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlLmlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZWwuaGlzdG9yeS5maWx0ZXIobXNnID0+IG1zZy5pZCA9PT0gbWVzc2FnZS5pZCkubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lc3NhZ2UucmVjZWl2ZWQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpLFxuICAgICAgICBnaWZ0RGV2aWNlID0gdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgICBzZWF0ID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmFkZFBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UudG9rZW4pO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCAmJlxuICAgICAgICB0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuZ2lmdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UsIG1lc3NhZ2UudGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlKSB7XG4gICAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgICAgaWYgKGdpZnREZXZpY2UgJiYgZ2lmdERldmljZSA9PT0gbWVzc2FnZS5kZXZpY2UpIHtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnRBY2NlcHRlZC5kaXNwYXRjaCh0cnVlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICBpZiAoZ2lmdERldmljZSAmJiBnaWZ0RGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdEFjY2VwdGVkLmRpc3BhdGNoKGZhbHNlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICB0aGlzLmRlY2xpbmVEZXZpY2UoZGV2aWNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5vcGVyYXRpb24gPT09IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0UpIHtcbiAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSB0aGlzLmdldERldmljZU5hbWUoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuYWRkSGlzdG9yeShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5kaXNwYXRjaChtZXNzYWdlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1JlcXVlc3QobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZW5kU3RhdHVzVXBkYXRlKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSk7XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgZGV2aWNlID0ge1xuICAgICAgICB0b2tlbjogbWVzc2FnZS5kZXZpY2UsXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLmFkZERldmljZShkZXZpY2UpO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5pc19hdmFpbGFibGUgJiYgZGV2aWNlLmlzX2F2YWlsYWJsZSkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB7XG4gICAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRSxcbiAgICAgICAgdHlwZTogdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSxcbiAgICAgICAgZGV2aWNlOiBkZXZpY2UudG9rZW4sXG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VELFxuICAgICAgICB0b19kZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgICB9O1xuICAgICAgdGhpcy5fYWRkTWVzc2FnZUlEKGhpc3RvcnkpO1xuICAgICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KGhpc3RvcnkpO1xuICAgIH1cblxuICAgIGRldmljZS5pc19hdmFpbGFibGUgPSBCb29sZWFuKG1lc3NhZ2UuaXNfYXZhaWxhYmxlKTtcbiAgICBkZXZpY2UuaXNfcHJlc2VudCA9IEJvb2xlYW4obWVzc2FnZS5pc19wcmVzZW50KTtcbiAgICBkZXZpY2Uuc2VhdCA9IG1lc3NhZ2Uuc2VhdDtcbiAgICBkZXZpY2UudXNlcm5hbWUgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZXMpO1xuICB9XG5cbiAgX3NlbmRTdGF0dXNSZXF1ZXN0KCkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuU1RBVFVTX1JFUVVFU1QsXG4gICAgICBkZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgfTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRoaXMuX2dldFRvcGljKG1lc3NhZ2UpLCBtZXNzYWdlKTtcbiAgfVxuXG4gIF9zZW5kU3RhdHVzVXBkYXRlKGRldmljZSkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcm9maWxlID0gdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlLFxuICAgICAgICB1c2VybmFtZTtcblxuICAgIGlmIChwcm9maWxlICYmIHByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgdXNlcm5hbWUgPSBwcm9maWxlLmZpcnN0X25hbWUgKyAnICcgKyBwcm9maWxlLmxhc3RfbmFtZTtcbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLlNUQVRVU19VUERBVEUsXG4gICAgICB0b19kZXZpY2U6IGRldmljZSxcbiAgICAgIGRldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UsXG4gICAgICBzZWF0OiB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQudG9rZW4sXG4gICAgICBpc19hdmFpbGFibGU6IHRoaXMubW9kZWwuaXNFbmFibGVkLFxuICAgICAgaXNfcHJlc2VudDogdGhpcy5tb2RlbC5pc1ByZXNlbnQsXG4gICAgICB1c2VybmFtZTogdXNlcm5hbWVcbiAgICB9O1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodGhpcy5fZ2V0VG9waWMobWVzc2FnZSksIG1lc3NhZ2UpO1xuICB9XG5cbiAgX2dldFRvcGljKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBtZXNzYWdlLnRvX2RldmljZSA/XG4gICAgICAgIHRoaXMuUk9PTVMuREVWSUNFICsgbWVzc2FnZS50b19kZXZpY2UgOlxuICAgICAgICB0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbi50b2tlbjtcbiAgfVxuXG4gIF9hZGRNZXNzYWdlSUQobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuaWQgPSBtZXNzYWdlLmlkIHx8ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgYyA9PiB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNnwwLFxuICAgICAgICAgIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9jdXN0b21lcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5DdXN0b21lck1hbmFnZXIgPSBjbGFzcyBDdXN0b21lck1hbmFnZXIge1xuICAvKiBnbG9iYWwgbW9tZW50ICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBFbnZpcm9ubWVudCwgRHRzQXBpLCBDdXN0b21lck1vZGVsLCBTZXNzaW9uTW9kZWwpIHtcbiAgICB0aGlzLl9hcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fU2Vzc2lvbk1vZGVsID0gU2Vzc2lvbk1vZGVsO1xuICAgIHRoaXMuX2N1c3RvbWVyQXBwSWQgPSBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbi5jbGllbnRfaWQ7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0N1c3RvbWVyTW9kZWw7XG4gIH1cblxuICBnZXQgY3VzdG9tZXJOYW1lKCkge1xuICAgIGlmICh0aGlzLm1vZGVsLmlzRW5hYmxlZCAmJiB0aGlzLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICB2YXIgbmFtZSA9ICcnO1xuXG4gICAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgICBuYW1lICs9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmZpcnN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWUpIHtcbiAgICAgICAgbmFtZSArPSAnICcgKyBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgbG9nb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IG51bGw7XG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBudWxsO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZ3Vlc3RMb2dpbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gJ2d1ZXN0JztcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ2luKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2FkUHJvZmlsZSgpO1xuICB9XG5cbiAgbG9naW5Tb2NpYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvYWRQcm9maWxlKCk7XG4gIH1cblxuICBzaWduVXAocmVnaXN0cmF0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWdpc3RyYXRpb24uY2xpZW50X2lkID0gc2VsZi5fY3VzdG9tZXJBcHBJZDtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5zaWduVXAocmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5sb2dpbih7XG4gICAgICAgICAgbG9naW46IHJlZ2lzdHJhdGlvbi51c2VybmFtZSxcbiAgICAgICAgICBwYXNzd29yZDogcmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICAgIH0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVQcm9maWxlKHByb2ZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci51cGRhdGVQcm9maWxlKHByb2ZpbGUpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbmdlUGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLmNoYW5nZVBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogc2VsZi5fQ3VzdG9tZXJNb2RlbC5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcmVxdWVzdC5uZXdfcGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0UGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnJlc2V0UGFzc3dvcmQocmVxdWVzdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBfbG9hZFByb2ZpbGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuZ2V0UHJvZmlsZSgpLnRoZW4ocHJvZmlsZSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9kYXRhbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkRhdGFNYW5hZ2VyID0gY2xhc3MgRGF0YU1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcblxuICAgIHRoaXMuaG9tZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lbnVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jYXRlZ29yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLml0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9DQUNIRUFCTEVfTUVESUFfS0lORFMgPSBbXG4gICAgICA0MSwgNTEsIDU4LCA2MVxuICAgIF07XG4gIH1cblxuICBnZXQgcHJvdmlkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0RhdGFQcm92aWRlcjtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlID0ge1xuICAgICAgbWVudToge30sXG4gICAgICBjYXRlZ29yeToge30sXG4gICAgICBpdGVtOiB7fSxcbiAgICAgIG1lZGlhOiB7fVxuICAgIH07XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0luaXRpYWxpemluZyBkYXRhIG1hbmFnZXIuJyk7XG5cbiAgICB0aGlzLnByb3ZpZGVyLmRpZ2VzdCgpLnRoZW4oZGlnZXN0ID0+IHtcbiAgICAgIHZhciBtZW51U2V0cyA9IGRpZ2VzdC5tZW51X3NldHMubWFwKG1lbnUgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIubWVudShtZW51LnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5tZW51W21lbnUudG9rZW5dID0gc2VsZi5fZmlsdGVyTWVudShkYXRhKSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVudUNhdGVnb3JpZXMgPSBkaWdlc3QubWVudV9jYXRlZ29yaWVzLm1hcChjYXRlZ29yeSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5jYXRlZ29yeShjYXRlZ29yeS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuY2F0ZWdvcnlbY2F0ZWdvcnkudG9rZW5dID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoZGF0YSkpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lbnVJdGVtcyA9IGRpZ2VzdC5tZW51X2l0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLml0ZW0oaXRlbS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuaXRlbVtpdGVtLnRva2VuXSA9IGRhdGEpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lZGlhcyA9IGRpZ2VzdC5tZWRpYVxuICAgICAgICAuZmlsdGVyKG1lZGlhID0+IHNlbGYuX0NBQ0hFQUJMRV9NRURJQV9LSU5EUy5pbmRleE9mKG1lZGlhLmtpbmQpICE9PSAtMSlcbiAgICAgICAgLm1hcChtZWRpYSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgICBzd2l0Y2ggKG1lZGlhLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgICB3aWR0aCA9IDM3MDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gMzcwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgICAgIHdpZHRoID0gNjAwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSA2MDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2MTpcbiAgICAgICAgICAgICAgd2lkdGggPSAxMDA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWVkaWEud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBtZWRpYS5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICByZXR1cm4gbWVkaWE7XG4gICAgICAgIH0pXG4gICAgICAgIC5tYXAobWVkaWEgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzZWxmLnByb3ZpZGVyLm1lZGlhKG1lZGlhKVxuICAgICAgICAgICAgICAudGhlbihpbWcgPT4gc2VsZi5fY2FjaGUubWVkaWFbbWVkaWEudG9rZW5dID0gaW1nKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRGlnZXN0IGNvbnRhaW5zICR7bWVudVNldHMubGVuZ3RofSBtZW51cywgYCArXG4gICAgICAgIGAke21lbnVDYXRlZ29yaWVzLmxlbmd0aH0gY2F0ZWdvcmllcywgYCArXG4gICAgICAgIGAke21lbnVJdGVtcy5sZW5ndGh9IGl0ZW1zIGFuZCBgICtcbiAgICAgICAgYCR7bWVkaWFzLmxlbmd0aH0gZmlsZXMuYCk7XG5cbiAgICAgIHZhciB0YXNrcyA9IFtdXG4gICAgICAgIC5jb25jYXQobWVudVNldHMpXG4gICAgICAgIC5jb25jYXQobWVudUNhdGVnb3JpZXMpXG4gICAgICAgIC5jb25jYXQobWVudUl0ZW1zKTtcblxuICAgICAgUHJvbWlzZS5hbGwodGFza3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICBQcm9taXNlLmFsbChtZWRpYXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaG9tZSgpIHsgcmV0dXJuIHRoaXMuX2hvbWU7IH1cbiAgc2V0IGhvbWUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faG9tZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2hvbWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMucHJvdmlkZXIuaG9tZSgpLnRoZW4oaG9tZSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9ob21lKSB7XG4gICAgICAgICAgaG9tZSA9IHNlbGYuX2ZpbHRlckhvbWUoaG9tZSk7XG4gICAgICAgICAgc2VsZi5ob21lQ2hhbmdlZC5kaXNwYXRjaChob21lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5faG9tZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuaG9tZUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgbWVudSgpIHsgcmV0dXJuIHRoaXMuX21lbnU7IH1cbiAgc2V0IG1lbnUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fbWVudSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX21lbnUgPSB2YWx1ZTtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZWQoJ21lbnUnLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLm1lbnUodmFsdWUpLnRoZW4obWVudSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9tZW51KSB7XG4gICAgICAgICAgbWVudSA9IHNlbGYuX2ZpbHRlck1lbnUobWVudSk7XG4gICAgICAgICAgc2VsZi5tZW51Q2hhbmdlZC5kaXNwYXRjaChtZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fbWVudSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMubWVudUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2F0ZWdvcnkoKSB7IHJldHVybiB0aGlzLl9jYXRlZ29yeTsgfVxuICBzZXQgY2F0ZWdvcnkodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2F0ZWdvcnkgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9jYXRlZ29yeSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnY2F0ZWdvcnknLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5jYXRlZ29yeSh2YWx1ZSkudGhlbihjYXRlZ29yeSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9jYXRlZ29yeSkge1xuICAgICAgICAgIGNhdGVnb3J5ID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgIHNlbGYuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKGNhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fY2F0ZWdvcnkgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBpdGVtKCkgeyByZXR1cm4gdGhpcy5faXRlbTsgfVxuICBzZXQgaXRlbSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pdGVtID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5faXRlbSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnaXRlbScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIuaXRlbSh2YWx1ZSkudGhlbihpdGVtID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2l0ZW0pIHtcbiAgICAgICAgICBzZWxmLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9pdGVtID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5pdGVtQ2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZWQoZ3JvdXAsIGlkKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSAmJiB0aGlzLl9jYWNoZVtncm91cF1baWRdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW2dyb3VwXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9maWx0ZXJIb21lKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZGF0YS5tZW51cyA9IGRhdGEubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBzZWxmLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyTWVudShkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyQ2F0ZWdvcnkoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkYXRhLml0ZW1zID0gZGF0YS5pdGVtc1xuICAgICAgLmZpbHRlcihpdGVtID0+IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IGl0ZW0udHlwZSAhPT0gMyk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2RpYWxvZ21hbmFnZXIuanNcblxud2luZG93LmFwcC5EaWFsb2dNYW5hZ2VyID0gY2xhc3MgRGlhbG9nTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWxlcnRSZXF1ZXN0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvblJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY29uZmlybVJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1vZGFsU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubW9kYWxFbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2pvYnMgPSAwO1xuICAgIHRoaXMuX21vZGFscyA9IDA7XG4gIH1cblxuICBnZXQgam9icygpIHsgcmV0dXJuIHRoaXMuX2pvYnM7IH1cbiAgZ2V0IG1vZGFscygpIHsgcmV0dXJuIHRoaXMuX21vZGFsczsgfVxuXG4gIGFsZXJ0KG1lc3NhZ2UsIHRpdGxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLmFsZXJ0UmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHRpdGxlLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgbm90aWZpY2F0aW9uKG1lc3NhZ2UpIHtcbiAgICB0aGlzLm5vdGlmaWNhdGlvblJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlKTtcbiAgfVxuXG4gIGNvbmZpcm0obWVzc2FnZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5jb25maXJtUmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydEpvYigpIHtcbiAgICB0aGlzLl9qb2JzKys7XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMSkge1xuICAgICAgdGhpcy5qb2JTdGFydGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2pvYnM7XG4gIH1cblxuICBlbmRKb2IoaWQpIHtcbiAgICB0aGlzLl9qb2JzLS07XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMCkge1xuICAgICAgdGhpcy5qb2JFbmRlZC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TW9kYWwoKSB7XG4gICAgdGhpcy5fbW9kYWxzKys7XG5cbiAgICBpZiAodGhpcy5fbW9kYWxzID09PSAxKSB7XG4gICAgICB0aGlzLm1vZGFsU3RhcnRlZC5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tb2RhbHM7XG4gIH1cblxuICBlbmRNb2RhbChpZCkge1xuICAgIHRoaXMuX21vZGFscy0tO1xuXG4gICAgaWYgKHRoaXMuX21vZGFscyA9PT0gMCkge1xuICAgICAgdGhpcy5tb2RhbEVuZGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvbG9jYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuTG9jYXRpb25NYW5hZ2VyID0gY2xhc3MgTG9jYXRpb25NYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIExvZ2dlcikge1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9XG5cbiAgbG9hZENvbmZpZygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG1vZGVsID0gc2VsZi5fTG9jYXRpb25Nb2RlbDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmdW5jdGlvbiBsb2FkQ29uZmlnKCkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgbG9jYXRpb24gY29uZmlnLi4uJyk7XG5cbiAgICAgICAgbW9kZWwuZmV0Y2goJ2xvY2F0aW9uJykudGhlbihsb2NhdGlvbiA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBOZXcgJyR7bG9jYXRpb24ubG9jYXRpb25fbmFtZX0nIGxvY2F0aW9uIGNvbmZpZyBsb2FkZWQuYCk7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhdGlvbik7XG4gICAgICAgIH0sIGUgPT4ge1xuICAgICAgICAgIGlmICghbW9kZWwubG9jYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBGYWxsYmFjayB0byBzdG9yZWQgbG9jYXRpb24gJyR7bW9kZWwubG9jYXRpb24ubG9jYXRpb25fbmFtZX0nLmApO1xuICAgICAgICAgIHJlc29sdmUobW9kZWwubG9jYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbW9kZWwuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgZGV2aWNlIGluZm8uLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnZGV2aWNlJykudGhlbihkZXZpY2UgPT4ge1xuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgTmV3IGRldmljZSBsb2FkZWQ6IHRva2VuPSR7ZGV2aWNlLnRva2VufTtsb2NhdGlvbj0ke2RldmljZS5sb2NhdGlvbl90b2tlbn1gKTtcbiAgICAgICAgICBsb2FkQ29uZmlnKCk7XG4gICAgICAgIH0sIGUgPT4ge1xuICAgICAgICAgIGlmICghbW9kZWwuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRmFsbGJhY2sgdG8gc3RvcmVkIGRldmljZTogdG9rZW49JHttb2RlbC5kZXZpY2UudG9rZW59O2xvY2F0aW9uPSR7bW9kZWwuZGV2aWNlLmxvY2F0aW9uX3Rva2VufWApO1xuICAgICAgICAgIGxvYWRDb25maWcoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZFNlYXRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbW9kZWwgPSBzZWxmLl9Mb2NhdGlvbk1vZGVsO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIGxvYWRTZWF0KCkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgY3VycmVudCBzZWF0IGluZm8uLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnc2VhdCcpLnRoZW4oc2VhdCA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBOZXcgc2VhdCBkYXRhIGxvYWRlZCBmb3IgIyR7c2VhdC50b2tlbn0uYCk7XG4gICAgICAgICAgcmVzb2x2ZShzZWF0KTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5zZWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRmFsbGJhY2sgdG8gc3RvcmVkIHNlYXQgIyR7bW9kZWwuc2VhdC50b2tlbn0uYCk7XG4gICAgICAgICAgcmVzb2x2ZShtb2RlbC5zZWF0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIG1vZGVsLmluaXRpYWxpemUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2FkaW5nIGxvY2F0aW9uIHNlYXRzLi4uJyk7XG5cbiAgICAgICAgbW9kZWwuZmV0Y2goJ3NlYXRzJykudGhlbihzZWF0cyA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBMb2NhdGlvbiBzZWF0cyBsb2FkZWQgKCR7c2VhdHMubGVuZ3RofSkuYCk7XG4gICAgICAgICAgbG9hZFNlYXQoKTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5zZWF0cykge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYEZhbGxiYWNrIHRvIHN0b3JlZCBzZWF0cyAoJHttb2RlbC5zZWF0cy5sZW5ndGh9KS5gKTtcbiAgICAgICAgICBsb2FkU2VhdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9uYXZpZ2F0aW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk5hdmlnYXRpb25NYW5hZ2VyID0gY2xhc3MgTmF2aWdhdGlvbk1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpIHtcbiAgICB0aGlzLiQkbG9jYXRpb24gPSAkbG9jYXRpb247XG4gICAgdGhpcy4kJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2luZyA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsICgpID0+IHtcbiAgICAgIHZhciBwYXRoID0gc2VsZi4kJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgaWYgKHBhdGggPT09IHNlbGYuX3BhdGgpIHtcbiAgICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BhdGggPSBwYXRoO1xuICAgICAgc2VsZi5fbG9jYXRpb24gPSBzZWxmLmdldExvY2F0aW9uKHBhdGgpO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICAgIHNlbGYubG9jYXRpb25DaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dOYXZpZ2F0aW9uKGxvY2F0aW9uKSk7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3BhdGg7IH1cbiAgc2V0IHBhdGgodmFsdWUpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmluZGV4T2YoJyMnKSxcbiAgICAgICAgcGF0aCA9IGkgIT09IC0xID8gdmFsdWUuc3Vic3RyaW5nKGkgKyAxKSA6IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb24ocGF0aCk7XG4gIH1cblxuICBnZXQgbG9jYXRpb24oKSB7IHJldHVybiB0aGlzLl9sb2NhdGlvbjsgfVxuICBzZXQgbG9jYXRpb24odmFsdWUpIHtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHRoaXMuX2xvY2F0aW9uKTtcblxuICAgIHZhciBwYXRoID0gdGhpcy5fcGF0aCA9IHRoaXMuZ2V0UGF0aCh0aGlzLl9sb2NhdGlvbik7XG4gICAgdGhpcy4kJGxvY2F0aW9uLnBhdGgocGF0aCk7XG4gIH1cblxuICBnZXRQYXRoKGxvY2F0aW9uKSB7XG4gICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnRva2VuKSB7XG4gICAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZSArICcvJyArIGxvY2F0aW9uLnRva2VuO1xuICAgIH1cbiAgICBlbHNlIGlmIChsb2NhdGlvbi51cmwpIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdob21lJykge1xuICAgICAgcmV0dXJuICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZTtcbiAgfVxuXG4gIGdldExvY2F0aW9uKHBhdGgpIHtcbiAgICB2YXIgbWF0Y2ggPSAvXFwvKFxcdyspPyhcXC8oLispKT8vLmV4ZWMocGF0aCk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXRjaFsxXTtcbiAgICAgIHZhciBwYXJhbSA9IG1hdGNoWzNdO1xuXG4gICAgICBpZiAocGFyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB1cmw6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbSkgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB0b2tlbjogcGFyYW0gfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgdHlwZSA9ICdob21lJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSB9O1xuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGdvQmFjaygpIHtcbiAgICBpZiAodGhpcy5sb2NhdGlvbi50eXBlICE9PSAnaG9tZScgJiYgdGhpcy5sb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJykge1xuICAgICAgdGhpcy4kJHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9vcmRlcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5PcmRlck1hbmFnZXIgPSBjbGFzcyBPcmRlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIER0c0FwaSwgT3JkZXJNb2RlbCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9DaGF0TW9kZWwgPSBDaGF0TW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZChnaWZ0U2VhdCA9PiB7XG4gICAgICBpZiAoc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IHNlbGYubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydCA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWdpZnRTZWF0KSB7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fT3JkZXJNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2VsZi5tb2RlbC5jbGVhcldhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIpO1xuICAgICAgc2VsZi5tb2RlbC5jbGVhcldhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSk7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCk7XG5cbiAgICAgIHNlbGYuY2xlYXJDYXJ0KCk7XG4gICAgICBzZWxmLmNsZWFyQ2hlY2soKTtcbiAgICAgIHNlbGYubW9kZWwub3JkZXJUaWNrZXQgPSB7fTtcblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDYXJ0IGFuZCBjaGVja3NcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGFkZFRvQ2FydChpdGVtKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQucHVzaChpdGVtKTtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuZGlzcGF0Y2godGhpcy5tb2RlbC5vcmRlckNhcnQpO1xuXG4gICAgaWYgKHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCkge1xuICAgICAgdGhpcy5fQ2hhdE1vZGVsLmdpZnRSZWFkeS5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1vZGVsLm9yZGVyQ2FydDtcbiAgfVxuXG4gIHJlbW92ZUZyb21DYXJ0KGl0ZW0pIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydCA9IHRoaXMubW9kZWwub3JkZXJDYXJ0LmZpbHRlcihlbnRyeSA9PiBlbnRyeSAhPT0gaXRlbSk7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXJDYXJ0O1xuICB9XG5cbiAgY2xlYXJDYXJ0KCkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0ID0gW107XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IFtdO1xuXG4gICAgdGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcbiAgfVxuXG4gIGNsZWFyQ2hlY2soaXRlbXMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICBpZiAoaXRlbXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5vcmRlckNoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaXRlbXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5tb2RlbC5vcmRlckNoZWNrW2ldID09PSBpdGVtc1tqXSkge1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMubW9kZWwub3JkZXJDaGVja1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2hlY2sgPSByZXN1bHQ7XG4gIH1cblxuICBzdWJtaXRDYXJ0KG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5tb2RlbC5vcmRlckNhcnQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgMDtcblxuICAgIGlmICh0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQpIHtcbiAgICAgIG9wdGlvbnMgfD0gNDtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSLFxuICAgICAgaXRlbXM6IHRoaXMubW9kZWwub3JkZXJDYXJ0Lm1hcChlbnRyeSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IGVudHJ5Lml0ZW0ub3JkZXIudG9rZW4sXG4gICAgICAgICAgcXVhbnRpdHk6IGVudHJ5LnF1YW50aXR5LFxuICAgICAgICAgIG1vZGlmaWVyczogZW50cnkubW9kaWZpZXJzLnJlZHVjZSgocmVzdWx0LCBjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoY2F0ZWdvcnkubW9kaWZpZXJzLnJlZHVjZSgocmVzdWx0LCBtb2RpZmllcikgPT4ge1xuICAgICAgICAgICAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vZGlmaWVyLmRhdGEudG9rZW4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCBbXSkpO1xuICAgICAgICAgIH0sIFtdKSxcbiAgICAgICAgICBub3RlOiBlbnRyeS5uYW1lIHx8ICcnXG4gICAgICAgIH07XG4gICAgICB9KSxcbiAgICAgIHRpY2tldF90b2tlbjogc2VsZi5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICAgIHNlYXRfdG9rZW46IHNlbGYuX0NoYXRNb2RlbC5naWZ0U2VhdCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX0R0c0FwaS53YWl0ZXIucGxhY2VPcmRlcihyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLml0ZW1fdG9rZW5zKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5pdGVtX3Rva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRbaV0ucmVxdWVzdCA9IHJlc3BvbnNlLml0ZW1fdG9rZW5zW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJUaWNrZXQgPSB7IHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4gfTtcblxuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2hlY2sgPSBzZWxmLm1vZGVsLm9yZGVyQ2hlY2suY29uY2F0KHNlbGYubW9kZWwub3JkZXJDYXJ0KTtcbiAgICAgICAgc2VsZi5jbGVhckNhcnQoKTtcblxuICAgICAgICBzZWxmLl9DaGF0TW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuXG4gICAgICAgIGxldCB3YXRjaGVyID0gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUiwgcmVzcG9uc2UpO1xuICAgICAgICByZXNvbHZlKHdhdGNoZXIpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlcXVlc3RDbG9zZW91dCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBraW5kOiB0aGlzLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCxcbiAgICAgIHRpY2tldF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucGxhY2VSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHsgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbiB9O1xuICAgICAgcmV0dXJuIHNlbGYuX2NyZWF0ZVdhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQsIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlcXVlc3RBc3Npc3RhbmNlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UsXG4gICAgICB0aWNrZXRfdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnBsYWNlUmVxdWVzdChyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYuX3NhdmVUaWNrZXQocmVzcG9uc2UpO1xuICAgICAgcmV0dXJuIHNlbGYuX2NyZWF0ZVdhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlUHJpY2UoZW50cnkpIHtcbiAgICB2YXIgbW9kaWZpZXJzID0gZW50cnkubW9kaWZpZXJzLnJlZHVjZSgodG90YWwsIGNhdGVnb3J5KSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyBjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKCh0b3RhbCwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgJiYgbW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgICAgIG1vZGlmaWVyLmRhdGEucHJpY2UgOlxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH0sIDApO1xuICAgIH0sIDApO1xuXG4gICAgcmV0dXJuIGVudHJ5LnF1YW50aXR5ICogKG1vZGlmaWVycyArIGVudHJ5Lml0ZW0ub3JkZXIucHJpY2UpO1xuICB9XG5cbiAgY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKSB7XG4gICAgcmV0dXJuIChlbnRyaWVzID8gZW50cmllcy5yZWR1Y2UoKHRvdGFsLCBlbnRyeSkgPT4ge1xuICAgICAgcmV0dXJuIHRvdGFsICsgT3JkZXJNYW5hZ2VyLnByb3RvdHlwZS5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICAgfSwgMCkgOiAwKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVRheChlbnRyaWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKSAqIHRoaXMubW9kZWwudGF4O1xuICB9XG5cbiAgdXBsb2FkU2lnbmF0dXJlKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLnVwbG9hZC51cGxvYWRUZW1wKGRhdGEsICdpbWFnZS9wbmcnLCAnc2lnbmF0dXJlLnBuZycpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50b2tlbik7XG4gIH1cblxuICBnZW5lcmF0ZVBheW1lbnRUb2tlbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fQ3VzdG9tZXJNb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIXRoaXMuX0N1c3RvbWVyTW9kZWwuaXNHdWVzdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX0R0c0FwaS5jdXN0b21lci5pbml0aWFsaXplUGF5bWVudCgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBzZWxmLl9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLmluaXRpYWxpemVQYXltZW50KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLl9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBheU9yZGVyKHJlcXVlc3QpIHtcbiAgICByZXF1ZXN0LnRpY2tldF90b2tlbiA9IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW47XG4gICAgcmVxdWVzdC5wYXltZW50X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC5wYXltZW50X3Rva2VuO1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnN1Ym1pdENoZWNrb3V0UGF5bWVudChyZXF1ZXN0KTtcbiAgfVxuXG4gIHJlcXVlc3RSZWNlaXB0KHJlcXVlc3QpIHtcbiAgICByZXF1ZXN0LnRpY2tldF90b2tlbiA9IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW47XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucmVxdWVzdFJlY2VpcHQocmVxdWVzdCk7XG4gIH1cblxuICBfc2F2ZVRpY2tldChyZXNwb25zZSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJUaWNrZXQgPSB7XG4gICAgICB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuLFxuICAgICAgcGF5bWVudF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC5wYXltZW50X3Rva2VuXG4gICAgfTtcbiAgfVxuXG4gIF9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlclRpY2tldCA9IHtcbiAgICAgIHRva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgICAgcGF5bWVudF90b2tlbjogcmVzcG9uc2UudG9rZW5cbiAgICB9O1xuICB9XG5cbiAgX2NyZWF0ZVdhdGNoZXIoa2luZCwgdGlja2V0KSB7XG4gICAgbGV0IHdhdGNoZXIgPSBuZXcgYXBwLlJlcXVlc3RXYXRjaGVyKHRpY2tldCwgdGhpcy5fRHRzQXBpKTtcbiAgICB0aGlzLm1vZGVsLmFkZFdhdGNoZXIoa2luZCwgd2F0Y2hlcik7XG5cbiAgICByZXR1cm4gd2F0Y2hlcjtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3Nlc3Npb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvbk1hbmFnZXIgPSBjbGFzcyBTZXNzaW9uTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBzdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLnNlc3Npb25FbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG4gICAgdGhpcy5fU3VydmV5TW9kZWwgPSBTdXJ2ZXlNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zZWF0X3Nlc3Npb24nKTtcbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbihkYXRhID0+IHtcbiAgICAgIHNlbGYuX3Nlc3Npb24gPSBkYXRhO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgc2VsZi5fc3RhcnRTZXNzaW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZChjdXN0b21lciA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIWN1c3RvbWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc2Vzc2lvbi5jdXN0b21lciA9IGN1c3RvbWVyLnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhc2VhdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24uc2VhdCA9IHNlYXQudG9rZW47XG4gICAgICBzZWxmLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX09yZGVyTW9kZWwub3JkZXJUaWNrZXRDaGFuZ2VkLmFkZCh0aWNrZXQgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICF0aWNrZXQgfHwgIXRpY2tldC50b2tlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24udGlja2V0ID0gdGlja2V0LnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2Vzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbjtcbiAgfVxuXG4gIGVuZFNlc3Npb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zZXNzaW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBlbmRlZC5gKTtcblxuICAgIHZhciBzID0gdGhpcy5fc2Vzc2lvbjtcbiAgICBzLmVuZGVkID0gbmV3IERhdGUoKTtcblxuICAgIHRoaXMuX3Nlc3Npb24gPSBudWxsO1xuICAgIHRoaXMuX3N0b3JlLmNsZWFyKCk7XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dTZXNzaW9uKHMpO1xuXG4gICAgdGhpcy5zZXNzaW9uRW5kZWQuZGlzcGF0Y2gocyk7XG4gIH1cblxuICBnZXQgZ3Vlc3RDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCB8fCAxO1xuICB9XG5cbiAgc2V0IGd1ZXN0Q291bnQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLmd1ZXN0X2NvdW50ID0gdmFsdWU7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBnZXQgc3BlY2lhbEV2ZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQ7XG4gIH1cblxuICBzZXQgc3BlY2lhbEV2ZW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uc3BlY2lhbF9ldmVudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQgPSB2YWx1ZTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9zdGFydFNlc3Npb24oKSB7XG4gICAgbGV0IHNlYXQgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQ7XG5cbiAgICB0aGlzLl9zZXNzaW9uID0ge1xuICAgICAgaWQ6IHRoaXMuX2dlbmVyYXRlSUQoKSxcbiAgICAgIHNlYXQ6IHNlYXQgPyBzZWF0LnRva2VuIDogdW5kZWZpbmVkLFxuICAgICAgcGxhdGZvcm06IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSxcbiAgICAgIHN0YXJ0ZWQ6IG5ldyBEYXRlKClcbiAgICB9O1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBzdGFydGVkLmApO1xuXG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZC5kaXNwYXRjaCh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9nZW5lcmF0ZUlEKCl7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9zaGVsbG1hbmFnZXIuanNcblxud2luZG93LmFwcC5TaGVsbE1hbmFnZXIgPSBjbGFzcyBTaGVsbE1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIENvbmZpZywgRW52aXJvbm1lbnQsIEhvc3RzKSB7XG4gICAgdGhpcy4kJHNjZSA9ICRzY2U7XG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1NoZWxsTW9kZWwgPSBTaGVsbE1vZGVsO1xuICAgIHRoaXMuX0NvbmZpZyA9IENvbmZpZztcbiAgICB0aGlzLl9FbnZpcm9ubWVudCA9IEVudmlyb25tZW50O1xuICAgIHRoaXMuX0hvc3RzID0gSG9zdHM7XG5cbiAgICB0aGlzLmxvY2FsZSA9IENvbmZpZy5sb2NhbGU7XG4gIH1cblxuICBnZXQgbG9jYWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gIH1cblxuICBzZXQgbG9jYWxlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2xvY2FsZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbG9jYWxlID0gdmFsdWU7XG5cbiAgICB2YXIgZm9ybWF0ID0gJ3swfScsXG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX2xvY2FsZSkge1xuICAgICAgY2FzZSAncm9fTUQnOlxuICAgICAgICBmb3JtYXQgPSAnezB9IExlaSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnemhfTU8nOlxuICAgICAgICBmb3JtYXQgPSAnTU9QJCB7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2VuX1VTJzpcbiAgICAgICAgZm9ybWF0ID0gJyR7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICdVU0QnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl9TaGVsbE1vZGVsLnByaWNlRm9ybWF0ID0gZm9ybWF0O1xuICAgIHRoaXMuX1NoZWxsTW9kZWwuY3VycmVuY3kgPSBjdXJyZW5jeTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLmJhY2tncm91bmRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5iYWNrZ3JvdW5kcyA9IHJlc3BvbnNlLm1haW4ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwuc2NyZWVuc2F2ZXJzID0gcmVzcG9uc2Uuc2NyZWVuc2F2ZXIubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwucGFnZUJhY2tncm91bmRzID0gcmVzcG9uc2UucGFnZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLmJhY2tncm91bmQuc3JjLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBpdGVtLmRlc3RpbmF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5lbGVtZW50cygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHZhciBsYXlvdXQgPSBzZWxmLl9Db25maWcudGhlbWUubGF5b3V0O1xuXG4gICAgICB2YXIgZWxlbWVudHMgPSB7fTtcblxuICAgICAgc3dpdGNoIChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSAnY2xhc3NpYyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2hvbWUnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWhvbWUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NhcnQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNhcnQucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl93YWl0ZXInOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWFzc2lzdGFuY2UucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoZWNrJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1jbG9zZW91dC5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fc3VydmV5Jzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1zdXJ2ZXkucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoYXQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNoYXQucG5nJylcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnYWxheGllcyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9zZXR0aW5ncyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tc2V0dGluZ3MucG5nJyksXG4gICAgICAgICAgICAnbG9jYXRpb25fbG9nbyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tbG9nby5wbmcnKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gcmVzcG9uc2UuZWxlbWVudHNbaV07XG4gICAgICAgIGVsZW1lbnRzW2VsZW1lbnQuc2xvdF0gPSBlbGVtZW50LnNyYztcbiAgICAgIH1cblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICAgIH0pO1xuICB9XG5cbiAgZm9ybWF0UHJpY2UocHJpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbC5wcmljZUZvcm1hdC5yZXBsYWNlKC97KFxcZCspfS9nLCAoKSA9PiBwcmljZS50b0ZpeGVkKDIpKTtcbiAgfVxuXG4gIGdldFBhZ2VCYWNrZ3JvdW5kcyhsb2NhdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsLnBhZ2VCYWNrZ3JvdW5kcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5kZXN0aW5hdGlvbi50eXBlID09PSBsb2NhdGlvbi50eXBlICYmXG4gICAgICAgIChpdGVtLmRlc3RpbmF0aW9uLnRva2VuID09PSBsb2NhdGlvbi50b2tlbiAmJiBsb2NhdGlvbi50b2tlbiB8fFxuICAgICAgICAgaXRlbS5kZXN0aW5hdGlvbi51cmwgPT09IGxvY2F0aW9uLnVybCAmJiBsb2NhdGlvbi51cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QXBwVXJsKHVybCkge1xuICAgIHZhciBob3N0ID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArXG4gICAgICAod2luZG93LmxvY2F0aW9uLnBvcnQgPyAnOicgKyB3aW5kb3cubG9jYXRpb24ucG9ydDogJycpO1xuICAgIHJldHVybiBob3N0ICsgdXJsO1xuICB9XG5cbiAgZ2V0QXNzZXRVcmwoZmlsZSkge1xuICAgIHZhciBwYXRoID0gdGhpcy5fZ2V0UGF0aCh0aGlzLl9Ib3N0cy5zdGF0aWMpO1xuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAke3BhdGh9YXNzZXRzLyR7dGhpcy5fQ29uZmlnLnRoZW1lLmxheW91dH0vJHtmaWxlfWApO1xuICB9XG5cbiAgZ2V0UGFydGlhbFVybChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXNzZXRVcmwoYHBhcnRpYWxzLyR7bmFtZX0uaHRtbGApO1xuICB9XG5cbiAgZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikge1xuICAgIGlmICghbWVkaWEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBwYXRoID0gdGhpcy5fZ2V0UGF0aCh0aGlzLl9Ib3N0cy5tZWRpYSk7XG5cbiAgICBpZiAodHlwZW9mIG1lZGlhID09PSAnc3RyaW5nJyB8fCBtZWRpYSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgaWYgKG1lZGlhLnN1YnN0cmluZygwLCA0KSAhPT0gJ2h0dHAnICYmIG1lZGlhLnN1YnN0cmluZygwLCAyKSAhPT0gJy8vJykge1xuICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24gfHwgJ2pwZyc7XG4gICAgICAgIHJldHVybiB0aGlzLiQkc2NlLnRydXN0QXNSZXNvdXJjZVVybChgJHtwYXRofW1lZGlhLyR7bWVkaWF9XyR7d2lkdGh9XyR7aGVpZ2h0fS4ke2V4dGVuc2lvbn1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lZGlhO1xuICAgIH1cblxuICAgIGlmICghbWVkaWEudG9rZW4pIHtcbiAgICAgIHJldHVybiBtZWRpYTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlKG1lZGlhKTtcbiAgICB2YXIgdXJsID0gYCR7cGF0aH1tZWRpYS8ke21lZGlhLnRva2VufWA7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndmlkZW8nKSB7XG4gICAgICB1cmwgKz0gJy53ZWJtJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ZsYXNoJykge1xuICAgICAgdXJsICs9ICcuc3dmJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJykge1xuICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICB1cmwgKz0gJ18nICsgd2lkdGggKyAnXycgKyBoZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgdXJsICs9ICcuJyArIGV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAobWVkaWEubWltZV90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaW1hZ2UvcG5nJzpcbiAgICAgICAgICAgIHVybCArPSAnLnBuZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdXJsICs9ICcuanBnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHVybCk7XG4gIH1cblxuICBnZXRNZWRpYVR5cGUobWVkaWEpIHtcbiAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICdpbWFnZScpe1xuICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiAndmlkZW8nO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS5taW1lX3R5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcpIHtcbiAgICAgIHJldHVybiAnZmxhc2gnO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgdGlsZVN0eWxlKCkge1xuICAgIHZhciBzdHlsZSA9ICd0aWxlJztcblxuICAgIHN3aXRjaCAodGhpcy5fQ29uZmlnLnRoZW1lLnRpbGVzX3N0eWxlKSB7XG4gICAgICBjYXNlICdyZWd1bGFyJzpcbiAgICAgICAgc3R5bGUgKz0gJyB0aWxlLXJlZ3VsYXInO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9zdHlsZSArPSAnIHRpbGUtcmVndWxhcic7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG5cbiAgZ2V0IHByZWRpY2F0ZUV2ZW4oKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICByZXR1cm4gKCkgPT4gaW5kZXgrKyAlIDIgPT09IDE7XG4gIH1cblxuICBnZXQgcHJlZGljYXRlT2RkKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuICgpID0+IGluZGV4KysgJSAyID09PSAwO1xuICB9XG5cbiAgX2dldFBhdGgocmVzKSB7XG4gICAgdmFyIHBhdGggPSAnJztcblxuICAgIGlmIChyZXMucHJvdG9jb2wpIHtcbiAgICAgIHBhdGggKz0gYCR7cmVzLnByb2ZvY29sfTovL2A7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlcy5zZWN1cmUpIHtcbiAgICAgIHBhdGggKz0gYGh0dHBzOi8vYDtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzLnNlY3VyZSA9PT0gZmFsc2UpIHtcbiAgICAgIHBhdGggKz0gYGh0dHA6Ly9gO1xuICAgIH1cblxuICAgIGlmIChyZXMuaG9zdCkge1xuICAgICAgaWYgKCFyZXMucHJvdG9jb2wpIHtcbiAgICAgICAgcGF0aCArPSAnLy8nO1xuICAgICAgfVxuICAgICAgcGF0aCArPSByZXMuaG9zdDtcbiAgICB9XG5cbiAgICBpZiAocmVzLnBhdGgpIHtcbiAgICAgIHBhdGggKz0gcmVzLnBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHBhdGgubGVuZ3RoID4gMCAmJiAhcGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoICs9ICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3NvY2lhbG1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8qIGdsb2JhbCBVUkkgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29jaWFsTWFuYWdlclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBTb2NpYWxNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50LCBEdHNBcGksIFdlYkJyb3dzZXIsIExvZ2dlcikge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fV2ViQnJvd3NlciA9IFdlYkJyb3dzZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29jaWFsTWFuYWdlciA9IFNvY2lhbE1hbmFnZXI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBMb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5GYWNlYm9vayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZmFjZWJvb2tBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuZmFjZWJvb2tfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggRmFjZWJvb2s6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZmFjZWJvb2tBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChmYWNlYm9va0F1dGguZXJyb3IgfHwgIWZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgZXJyb3I6ICcgKyBmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwRmFjZWJvb2soe1xuICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBmYWNlYm9va0F1dGguYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWRcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggRmFjZWJvb2suJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9kaWFsb2cvb2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBmYWNlYm9va0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVzcG9uc2VfdHlwZScsICd0b2tlbicpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ3B1YmxpY19wcm9maWxlLGVtYWlsJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luR29vZ2xlUGx1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZ29vZ2xlcGx1c0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5nb29nbGVwbHVzX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHNlbGYuX2dlbmVyYXRlVG9rZW4oKTtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggR29vZ2xlOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGdvb2dsZXBsdXNBdXRoID0gVVJJKHVybCkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGdvb2dsZXBsdXNBdXRoLmVycm9yIHx8ICFnb29nbGVwbHVzQXV0aC5jb2RlIHx8IGdvb2dsZXBsdXNBdXRoLnN0YXRlICE9PSBzdGF0ZSkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY2FsbGJhY2sgZXJyb3I6ICcgKyBnb29nbGVwbHVzQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBHb29nbGVQbHVzKHtcbiAgICAgICAgICAgIGNvZGU6IGdvb2dsZXBsdXNBdXRoLmNvZGUsXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBHb29nbGUuJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoJylcbiAgICAgICAgLmFkZFNlYXJjaCgnY2xpZW50X2lkJywgZ29vZ2xlcGx1c0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGdvb2dsZXBsdXNBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ2NvZGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzY29wZScsICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3BsdXMubG9naW4gZW1haWwnKVxuICAgICAgICAuYWRkU2VhcmNoKCdhY2Nlc3NfdHlwZScsICdvZmZsaW5lJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc3RhdGUnLCBzdGF0ZSlcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luVHdpdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdHdpdHRlckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC50d2l0dGVyX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB0b2tlblNlY3JldDtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggVHdpdHRlcjogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZih0d2l0dGVyQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgdHdpdHRlckF1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAodHdpdHRlckF1dGguZXJyb3IgfHwgIXR3aXR0ZXJBdXRoLm9hdXRoX3ZlcmlmaWVyKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyB0d2l0dGVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlcih7XG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgIHJlcXVlc3RfdG9rZW46IHR3aXR0ZXJBdXRoLm9hdXRoX3Rva2VuLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl9zZWNyZXQ6IHRva2VuU2VjcmV0LFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl92ZXJpZmllcjogdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXJcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggVHdpdHRlci4nKTtcblxuICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcFR3aXR0ZXJSZXF1ZXN0VG9rZW4oe1xuICAgICAgICBvYXV0aF9jYWxsYmFjazogdHdpdHRlckFwcC5yZWRpcmVjdF91cmxcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hcGkudHdpdHRlci5jb20vb2F1dGgvYXV0aGVudGljYXRlJylcbiAgICAgICAgLmFkZFNlYXJjaCgnb2F1dGhfdG9rZW4nLCB0b2tlbi5vYXV0aF90b2tlbilcbiAgICAgICAgLmFkZFNlYXJjaCgnZm9yY2VfbG9naW4nLCAndHJ1ZScpXG4gICAgICAgIC50b1N0cmluZygpO1xuXG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciByZXF1ZXN0IHRva2VuIHJlY2VpdmVkLicpO1xuXG4gICAgICAgIHRva2VuU2VjcmV0ID0gdG9rZW4ub2F1dGhfdG9rZW5fc2VjcmV0O1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBIZWxwZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5fZ2VuZXJhdGVUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9O1xuXG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvc29mdHdhcmVtYW5hZ2VyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29mdHdhcmVNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvZnR3YXJlTWFuYWdlciA9IGZ1bmN0aW9uKFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgfTtcblxuICB3aW5kb3cuYXBwLlNvZnR3YXJlTWFuYWdlciA9IFNvZnR3YXJlTWFuYWdlcjtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ2N1cnJlbnRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0dGVybiA9IC8oU05BUClcXC8oWzAtOS5dKykvLFxuICAgICAgICAgIG1hdGNoID0gcGF0dGVybi5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiAnOC44LjguOCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAncmVxdWlyZWRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fU05BUEVudmlyb25tZW50LnJlcXVpcmVtZW50c1t0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm1dO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICd1cGRhdGVSZXF1aXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZlcnNpb25Db21wYXJlKHRoaXMuY3VycmVudFZlcnNpb24sIHRoaXMucmVxdWlyZWRWZXJzaW9uKSA9PT0gLTE7XG4gICAgfVxuICB9KTtcblxuICBTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLl92ZXJzaW9uQ29tcGFyZSA9IGZ1bmN0aW9uKHYxLCB2Miwgb3B0aW9ucykge1xuICAgIGlmICghdjEgfHwgIXYyKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICB2YXIgbGV4aWNvZ3JhcGhpY2FsID0gb3B0aW9ucyAmJiBvcHRpb25zLmxleGljb2dyYXBoaWNhbCxcbiAgICAgICAgemVyb0V4dGVuZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy56ZXJvRXh0ZW5kLFxuICAgICAgICB2MXBhcnRzID0gdjEuc3BsaXQoJy4nKSxcbiAgICAgICAgdjJwYXJ0cyA9IHYyLnNwbGl0KCcuJyk7XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkUGFydCh4KSB7XG4gICAgICByZXR1cm4gKGxleGljb2dyYXBoaWNhbCA/IC9eXFxkK1tBLVphLXpdKiQvIDogL15cXGQrJC8pLnRlc3QoeCk7XG4gICAgfVxuXG4gICAgaWYgKCF2MXBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSB8fCAhdjJwYXJ0cy5ldmVyeShpc1ZhbGlkUGFydCkpIHtcbiAgICAgIHJldHVybiBOYU47XG4gICAgfVxuXG4gICAgaWYgKHplcm9FeHRlbmQpIHtcbiAgICAgIHdoaWxlICh2MXBhcnRzLmxlbmd0aCA8IHYycGFydHMubGVuZ3RoKSB7XG4gICAgICAgIHYxcGFydHMucHVzaCgnMCcpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHYycGFydHMubGVuZ3RoIDwgdjFwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjJwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFsZXhpY29ncmFwaGljYWwpIHtcbiAgICAgIHYxcGFydHMgPSB2MXBhcnRzLm1hcChOdW1iZXIpO1xuICAgICAgdjJwYXJ0cyA9IHYycGFydHMubWFwKE51bWJlcik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2MXBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodjJwYXJ0cy5sZW5ndGggPT09IGkpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIGlmICh2MXBhcnRzW2ldID09PSB2MnBhcnRzW2ldKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodjFwYXJ0c1tpXSA+IHYycGFydHNbaV0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2MXBhcnRzLmxlbmd0aCAhPT0gdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9zdXJ2ZXltYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TWFuYWdlciA9IGNsYXNzIFN1cnZleU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG5cbiAgICBpZiAodGhpcy5fU3VydmV5TW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLl9EYXRhUHJvdmlkZXIuc3VydmV5cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNlbGYuX1N1cnZleU1vZGVsLmZlZWRiYWNrU3VydmV5ID0gZGF0YS5zdXJ2ZXlzWzBdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TdXJ2ZXlNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHNlbGYuX1N1cnZleU1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgICBzZWxmLl9TdXJ2ZXlNb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2Fic3RyYWN0bW9kZWwuanNcblxud2luZG93LmFwcC5BYnN0cmFjdE1vZGVsID0gY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdGhpcy5fc3RvcmFnZVByb3ZpZGVyID0gc3RvcmFnZVByb3ZpZGVyO1xuICAgIHRoaXMuX3Byb3BlcnRpZXMgPSB7fTtcbiAgfVxuXG4gIF9kZWZpbmVQcm9wZXJ0eShuYW1lLCBzdG9yZU5hbWUsIGRlZmF1bHRWYWx1ZSwgcHJvdmlkZXJGdW5jdGlvbikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW25hbWVdID0geyBuYW1lOiAnXycgKyBuYW1lIH07XG5cbiAgICBpZiAoc3RvcmVOYW1lKSB7XG4gICAgICBwcm9wZXJ0eS5zdG9yZSA9IHRoaXMuX3N0b3JhZ2VQcm92aWRlcihzdG9yZU5hbWUpO1xuICAgIH1cblxuICAgIGlmIChwcm92aWRlckZ1bmN0aW9uKSB7XG4gICAgICBwcm9wZXJ0eS5wcm92aWRlciA9IHByb3ZpZGVyRnVuY3Rpb247XG4gICAgfVxuXG4gICAgdGhpc1tuYW1lICsgJ0NoYW5nZWQnXSA9IHByb3BlcnR5LnNpZ25hbCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmW3Byb3BlcnR5Lm5hbWVdIHx8IGRlZmF1bHRWYWx1ZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gc2VsZltwcm9wZXJ0eS5uYW1lXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGZbcHJvcGVydHkubmFtZV0gPSB2YWx1ZTtcblxuICAgICAgICBpZiAocHJvcGVydHkuc3RvcmUpIHtcbiAgICAgICAgICBwcm9wZXJ0eS5zdG9yZS53cml0ZSh2YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcm9wZXJ0eS5zaWduYWwuZGlzcGF0Y2godmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaW5pdFByb3BlcnR5KG5hbWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1tuYW1lXTtcblxuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJyR7bmFtZX0nIG5vdCBmb3VuZC5gKTtcbiAgICB9XG5cbiAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJyR7bmFtZX0nIGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm9wZXJ0eS5zdG9yZSkge1xuICAgICAgcHJvcGVydHkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wZXJ0eS5zdG9yZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBwcm9wZXJ0eS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBzZWxmW3Byb3BlcnR5Lm5hbWVdID0gdmFsdWU7XG4gICAgICBwcm9wZXJ0eS5zaWduYWwuZGlzcGF0Y2godmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcylcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICF0aGlzLl9wcm9wZXJ0aWVzW2tleV0uaW5pdGlhbGl6ZWQpXG4gICAgICAubWFwKGtleSA9PiB0aGlzLl9pbml0UHJvcGVydHkoa2V5KSkpO1xuICB9XG5cbiAgZmV0Y2gocHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBub3QgZm91bmQuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm9wZXJ0eS5wcm92aWRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBoYXMgbm8gcHJvdmlkZXIuYCk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBwcm9wZXJ0eS5wcm92aWRlcigpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZltwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG4gIH1cblxuICBmZXRjaEFsbCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcylcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMuX3Byb3BlcnRpZXNba2V5XS5wcm92aWRlcilcbiAgICAgIC5tYXAoa2V5ID0+IHRoaXMuZmV0Y2goa2V5KSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKE9iamVjdC5rZXlzKHRoaXMuX3Byb3BlcnRpZXMpXG4gICAgICAuZmlsdGVyKGtleSA9PiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0uc3RvcmUpXG4gICAgICAubWFwKGtleSA9PiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0uc3RvcmUuY2xlYXIoKSkpO1xuICB9XG5cbiAgX3Byb3BlcnR5Q2hhbmdlZChuYW1lKSB7XG4gICAgdmFyIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1tuYW1lXTtcblxuICAgIHByb3BlcnR5LnNpZ25hbC5kaXNwYXRjaCh0aGlzW3Byb3BlcnR5Lm5hbWVdKTtcblxuICAgIGlmIChwcm9wZXJ0eS5zdG9yZSkge1xuICAgICAgcHJvcGVydHkuc3RvcmUud3JpdGUodGhpc1twcm9wZXJ0eS5uYW1lXSk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvYW5hbHl0aWNzbW9kZWwuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NNb2RlbCA9IGNsYXNzIEFuYWx5dGljc01vZGVsIHtcbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyLCBoZWF0bWFwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2RhdGEgPSBbXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3Nlc3Npb25zJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnYWR2ZXJ0aXNlbWVudHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdhbnN3ZXJzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY2hhdHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjb21tZW50cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NsaWNrcycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3BhZ2VzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgndXJscycsIHN0b3JhZ2VQcm92aWRlcilcbiAgICBdLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgICByZXN1bHRbaXRlbS5uYW1lXSA9IGl0ZW07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIGhlYXRtYXAuY2xpY2tlZC5hZGQoY2xpY2sgPT4ge1xuICAgICAgc2VsZi5fbG9nQ2xpY2soY2xpY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbG9nU2Vzc2lvbihzZXNzaW9uKSB7XG4gICAgdGhpcy5fZGF0YS5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICB9XG5cbiAgZ2V0IHNlc3Npb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnNlc3Npb25zO1xuICB9XG5cbiAgbG9nTmF2aWdhdGlvbihkZXN0aW5hdGlvbikge1xuICAgIHRoaXMuX2RhdGEucGFnZXMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5zdG9yZSgpO1xuICB9XG5cbiAgZ2V0IHBhZ2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnBhZ2VzO1xuICB9XG5cbiAgbG9nQWR2ZXJ0aXNlbWVudChhZHZlcnRpc2VtZW50KSB7XG4gICAgdGhpcy5fZGF0YS5hZHZlcnRpc2VtZW50cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBhZHZlcnRpc2VtZW50OiBhZHZlcnRpc2VtZW50XG4gICAgfSk7XG4gIH1cblxuICBnZXQgYWR2ZXJ0aXNlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuYWR2ZXJ0aXNlbWVudHM7XG4gIH1cblxuICBsb2dBbnN3ZXIoYW5zd2VyKSB7XG4gICAgdGhpcy5fZGF0YS5hbnN3ZXJzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGFuc3dlcjogYW5zd2VyXG4gICAgfSk7XG4gIH1cblxuICBnZXQgYW5zd2VycygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5hbnN3ZXJzO1xuICB9XG5cbiAgbG9nQ2hhdChjaGF0KSB7XG4gICAgdGhpcy5fZGF0YS5jaGF0cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBjaGF0OiBjaGF0XG4gICAgfSk7XG4gIH1cblxuICBnZXQgY2hhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY2hhdHM7XG4gIH1cblxuICBsb2dDb21tZW50KGNvbW1lbnQpIHtcbiAgICB0aGlzLl9kYXRhLmNvbW1lbnRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNvbW1lbnQ6IGNvbW1lbnRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBjb21tZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jb21tZW50cztcbiAgfVxuXG4gIGxvZ1VybCh1cmwpIHtcbiAgICB0aGlzLl9kYXRhLnVybHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbiAgfVxuXG4gIGdldCB1cmxzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVybHM7XG4gIH1cblxuICBnZXQgY2xpY2tzKCkge1xuICAgIHRoaXMuX2RhdGEuY2xpY2tzLnN0b3JlKCk7XG5cbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jbGlja3M7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBrIGluIHRoaXMuX2RhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba10ucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBfbG9nQ2xpY2soY2xpY2spIHtcbiAgICBjbGljay50aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5kYXRhLnB1c2goY2xpY2spO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvY2FydG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ2FydE1vZGVsID0gY2xhc3MgQ2FydE1vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5TVEFURV9DQVJUID0gJ2NhcnQnO1xuICAgIHRoaXMuU1RBVEVfSElTVE9SWSA9ICdoaXN0b3J5JztcblxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fY2FydFN0YXRlID0gdGhpcy5TVEFURV9DQVJUO1xuICAgIHRoaXMuY2FydFN0YXRlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IG51bGw7XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgaXNDYXJ0T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDYXJ0T3BlbjtcbiAgfVxuXG4gIHNldCBpc0NhcnRPcGVuKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ2FydE9wZW4gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSB2YWx1ZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBjYXJ0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhcnRTdGF0ZTtcbiAgfVxuXG4gIHNldCBjYXJ0U3RhdGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2FydFN0YXRlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jYXJ0U3RhdGUgPSB2YWx1ZTtcbiAgICB0aGlzLmNhcnRTdGF0ZUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbU5ldygpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtTmV3O1xuICB9XG5cbiAgb3BlbkVkaXRvcihpdGVtLCBpc05ldykge1xuICAgIGlmICh0aGlzLl9lZGl0YWJsZUl0ZW0gPT09IGl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtTmV3ID0gaXNOZXcgfHwgZmFsc2U7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gaXRlbTtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQuZGlzcGF0Y2goaXRlbSk7XG4gIH1cblxuICBjbG9zZUVkaXRvcigpIHtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW1OZXcgPSBmYWxzZTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBudWxsO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZC5kaXNwYXRjaChudWxsKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2NoYXRtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkNoYXRNb2RlbCA9IGNsYXNzIENoYXRNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY2hhdF9wcmVmZXJlbmNlcycpO1xuICAgIHRoaXMuX2hpc3RvcnlTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jaGF0X2hpc3RvcnknKTtcblxuICAgIHRoaXMuaXNDb25uZWN0ZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLmFjdGl2ZURldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNoYXRSZXF1ZXN0UmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuaGlzdG9yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lc3NhZ2VSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIFxuICAgIHRoaXMuZ2lmdFJlcXVlc3RSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZ2lmdEFjY2VwdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9naWZ0U2VhdCA9IG51bGw7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2dpZnREZXZpY2UgPSBudWxsO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuZ2lmdFJlYWR5ID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5naWZ0QWNjZXB0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IFNOQVBMb2NhdGlvbi5jaGF0O1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gW107XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX2xhc3RSZWFkcyA9IHt9O1xuXG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5yZWFkKCkudGhlbihwcmVmcyA9PiB7XG4gICAgICBpZiAoIXByZWZzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faXNFbmFibGVkID0gQm9vbGVhbihwcmVmcy5pc19lbmFibGVkKTtcblxuICAgICAgc2VsZi5fYWN0aXZlRGV2aWNlcyA9IHByZWZzLmFjdGl2ZV9kZXZpY2VzIHx8IFtdO1xuICAgICAgc2VsZi5fcGVuZGluZ0RldmljZXMgPSBwcmVmcy5wZW5kaW5nX2RldmljZXMgfHwgW107XG4gICAgICBzZWxmLl9sYXN0UmVhZHMgPSBwcmVmcy5sYXN0X3JlYWRzIHx8IHt9O1xuICAgIH0pO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLnJlYWQoKS50aGVuKGhpc3RvcnkgPT4ge1xuICAgICAgc2VsZi5faGlzdG9yeSA9IGhpc3RvcnkgfHwgW107XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgc2V0IGlzQ29ubmVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29ubmVjdGVkID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNDb25uZWN0ZWQpO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbmFibGVkO1xuICB9XG5cbiAgc2V0IGlzRW5hYmxlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0VuYWJsZWQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzRW5hYmxlZCk7XG5cbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgZ2V0IGlzUHJlc2VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNQcmVzZW50O1xuICB9XG5cbiAgc2V0IGlzUHJlc2VudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc1ByZXNlbnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNQcmVzZW50ID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzUHJlc2VudCk7XG4gIH1cblxuICBnZXQgZ2lmdERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2lmdERldmljZTtcbiAgfVxuXG4gIHNldCBnaWZ0RGV2aWNlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnREZXZpY2UgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZ2lmdERldmljZSA9IHZhbHVlO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdERldmljZSk7XG4gIH1cblxuICBnZXQgZ2lmdFNlYXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dpZnRTZWF0O1xuICB9XG5cbiAgc2V0IGdpZnRTZWF0KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnRTZWF0ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2dpZnRTZWF0ID0gdmFsdWU7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdFNlYXQpO1xuICB9XG5cbiAgZ2V0IHBlbmRpbmdEZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIHNldCBwZW5kaW5nRGV2aWNlcyh2YWx1ZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5wZW5kaW5nRGV2aWNlcyk7XG4gIH1cblxuICBnZXQgYWN0aXZlRGV2aWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIHNldCBhY3RpdmVEZXZpY2VzKHZhbHVlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmVEZXZpY2VzKTtcbiAgfVxuXG4gIGlzQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZURldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBpc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZ0RldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBhZGRBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcy5wdXNoKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlcyA9IHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICBhZGRQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzLnB1c2goZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlcyA9IHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuYWN0aXZlRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLmFjdGl2ZURldmljZXMgPSB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnBlbmRpbmdEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzID0gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICBnZXQgaGlzdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIHNldCBoaXN0b3J5KHZhbHVlKSB7XG4gICAgdGhpcy5faGlzdG9yeSA9IHZhbHVlIHx8IFtdO1xuXG4gICAgdGhpcy5oaXN0b3J5Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9oaXN0b3J5KTtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gIH1cblxuICBhZGRIaXN0b3J5KG1lc3NhZ2UpIHtcbiAgICB0aGlzLl9oaXN0b3J5LnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIGdldExhc3RSZWFkKGRldmljZSkge1xuICAgIGxldCB0b2tlbiA9IGRldmljZS50b2tlbiB8fCBkZXZpY2U7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gfHwgbnVsbDtcbiAgfVxuXG4gIHNldExhc3RSZWFkKGRldmljZSwgdmFsdWUpIHtcbiAgICBsZXQgdG9rZW4gPSBkZXZpY2UudG9rZW4gfHwgZGV2aWNlO1xuICAgIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gICAgdGhpcy5fdXBkYXRlUHJlZmVyZW5jZXMoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdGhpcy5faXNFbmFibGVkID0gdGhpcy5faXNQcmVzZW50ID0gZmFsc2U7XG4gICAgdGhpcy5faGlzdG9yeSA9IFtdO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMgPSBbXTtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcyA9IFtdO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLmNsZWFyKCk7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5jbGVhcigpO1xuICB9XG5cbiAgX3VwZGF0ZUhpc3RvcnkoKSB7XG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLndyaXRlKHRoaXMuaGlzdG9yeSk7XG4gIH1cblxuICBfdXBkYXRlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS53cml0ZSh7XG4gICAgICBpc19lbmFibGVkOiB0aGlzLmlzRW5hYmxlZCxcbiAgICAgIGFjdGl2ZV9kZXZpY2VzOiB0aGlzLmFjdGl2ZURldmljZXMsXG4gICAgICBwZW5kaW5nX2RldmljZXM6IHRoaXMucGVuZGluZ0RldmljZXMsXG4gICAgICBsYXN0X3JlYWRzOiB0aGlzLl9sYXN0UmVhZHNcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2N1c3RvbWVybW9kZWwuanNcblxud2luZG93LmFwcC5DdXN0b21lck1vZGVsID0gY2xhc3MgQ3VzdG9tZXJNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9hY2NvdW50U3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXInKTtcblxuICAgIHRoaXMuX3Byb2ZpbGUgPSBudWxsO1xuXG4gICAgdGhpcy5faXNHdWVzdCA9IGZhbHNlO1xuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4oQ29uZmlnLmFjY291bnRzKTtcblxuICAgIHRoaXMucHJvZmlsZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2FjY291bnRTdG9yZS5yZWFkKCkudGhlbihhY2NvdW50ID0+IHtcbiAgICAgIHNlbGYuX2lzR3Vlc3QgPSBhY2NvdW50ICYmIGFjY291bnQuaXNfZ3Vlc3Q7XG5cbiAgICAgIGlmICghYWNjb3VudCB8fCBhY2NvdW50LmlzX2d1ZXN0KSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBhY2NvdW50LnByb2ZpbGU7XG4gICAgICB9XG5cbiAgICAgIHNlbGYucHJvZmlsZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fcHJvZmlsZSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lzRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCAmJiAoQm9vbGVhbih0aGlzLnByb2ZpbGUpIHx8IHRoaXMuaXNHdWVzdCk7XG4gIH1cblxuICBnZXQgaXNHdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQgJiYgQm9vbGVhbih0aGlzLl9pc0d1ZXN0KTtcbiAgfVxuXG4gIGdldCBoYXNDcmVkZW50aWFscygpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5pc0d1ZXN0ICYmIHRoaXMucHJvZmlsZS50eXBlID09PSAxKTtcbiAgfVxuXG4gIGdldCBwcm9maWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9maWxlO1xuICB9XG5cbiAgc2V0IHByb2ZpbGUodmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHJvZmlsZSA9IHZhbHVlIHx8IG51bGw7XG4gICAgdGhpcy5faXNHdWVzdCA9IHZhbHVlID09PSAnZ3Vlc3QnO1xuXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdGhpcy5fYWNjb3VudFN0b3JlLmNsZWFyKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX2lzR3Vlc3QgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcbiAgICAgICAgc2VsZi5zZXNzaW9uID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2FjY291bnRTdG9yZS53cml0ZSh7XG4gICAgICAgIHByb2ZpbGU6IHRoaXMuX3Byb2ZpbGUsXG4gICAgICAgIGlzX2d1ZXN0OiB0aGlzLl9pc0d1ZXN0XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcblxuICAgICAgICBpZiAoIXZhbHVlIHx8IHNlbGYuX2lzR3Vlc3QpIHtcbiAgICAgICAgICBzZWxmLnNlc3Npb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9sb2NhdGlvbm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuTG9jYXRpb25Nb2RlbCA9IGNsYXNzIExvY2F0aW9uTW9kZWwgZXh0ZW5kcyBhcHAuQWJzdHJhY3RNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKER0c0FwaSwgU05BUEVudmlyb25tZW50LCBTTkFQTG9jYXRpb24sIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHN1cGVyKHN0b3JhZ2VQcm92aWRlcik7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnZGV2aWNlJywgJ3NuYXBfZGV2aWNlJywgbnVsbCwgKCkgPT4gRHRzQXBpLmhhcmR3YXJlLmdldEN1cnJlbnREZXZpY2UoKSk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ2RldmljZXMnLCB1bmRlZmluZWQsIFtdKTtcbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnc2VhdCcsICdzbmFwX3NlYXQnLCBudWxsLCAoKSA9PiBEdHNBcGkubG9jYXRpb24uZ2V0Q3VycmVudFNlYXQoKSk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ3NlYXRzJywgJ3NuYXBfc2VhdHMnLCBbXSwgKCkgPT4gRHRzQXBpLmxvY2F0aW9uLmdldFNlYXRzKCkpO1xuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdsb2NhdGlvbicsICdzbmFwX2xvY2F0aW9uJywgU05BUExvY2F0aW9uLCAoKSA9PiB7XG4gICAgICBpZiAoIXNlbGYuZGV2aWNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGRhdGEgaXMgbWlzc2luZy4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIER0c0FwaS5zbmFwLmdldENvbmZpZyhzZWxmLmRldmljZS5sb2NhdGlvbl90b2tlbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIGFkZERldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLmRldmljZXMucHVzaChkZXZpY2UpO1xuICAgIHRoaXMuX3Byb3BlcnR5Q2hhbmdlZCgnZGV2aWNlJyk7XG4gIH1cblxuICBnZXRTZWF0KHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VhdHMuZmlsdGVyKHNlYXQgPT4gc2VhdC50b2tlbiA9PT0gdG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cblxuICBnZXREZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlcy5maWx0ZXIoZCA9PiAoZGV2aWNlLnRva2VuIHx8IGRldmljZSkgPT09IGQudG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9vcmRlcm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuT3JkZXJNb2RlbCA9IGNsYXNzIE9yZGVyTW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSID0gMTtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFID0gMjtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVCA9IDM7XG5cbiAgICB0aGlzLnByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy50YXggPSAwO1xuXG4gICAgdGhpcy5fb3JkZXJDYXJ0ID0gW107XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSBbXTtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gW107XG4gICAgdGhpcy5fb3JkZXJUaWNrZXQgPSB7fTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVycyA9IHt9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICAgIFNpZ25hbHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB0aGlzLm9yZGVyQ2FydENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJDaGVja0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyVGlja2V0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gICAgSW5pdGlhbGl6YXRpb25cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0b3JlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcy5tYXAgPyBpdGVtcy5tYXAoYXBwLkNhcnRJdGVtLnByb3RvdHlwZS5yZXN0b3JlKSA6IFtdO1xuICAgIH1cblxuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNhcnQgPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNhcnRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0KTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNhcnRTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydF9zdGFzaCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoU3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0U3Rhc2gpO1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaENoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNoZWNrU3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl9jaGVjaycpO1xuICAgIHRoaXMuX29yZGVyQ2hlY2tTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDaGVjayA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDaGVjayk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2hlY2tTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlclRpY2tldFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfdGlja2V0Jyk7XG4gICAgdGhpcy5fb3JkZXJUaWNrZXRTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXQgPSB2YWx1ZSB8fCB7fTtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJUaWNrZXQpO1xuICAgICAgc2VsZi5vcmRlclRpY2tldENoYW5nZWQuYWRkKGRhdGEgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlclRpY2tldFN0b3JhZ2Uud3JpdGUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0IG9yZGVyQ2FydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDYXJ0O1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2FydCA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydCk7XG4gIH1cblxuICBnZXQgb3JkZXJDYXJ0U3Rhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2FydFN0YXNoO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydFN0YXNoKHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydFN0YXNoKTtcbiAgfVxuXG4gIGdldCBvcmRlckNoZWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNoZWNrO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2hlY2sodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNoZWNrQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2hlY2spO1xuICB9XG5cbiAgZ2V0IG9yZGVyVGlja2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlclRpY2tldDtcbiAgfVxuXG4gIHNldCBvcmRlclRpY2tldCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyVGlja2V0ID0gdmFsdWUgfHwge307XG4gICAgdGhpcy5vcmRlclRpY2tldENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlclRpY2tldCk7XG4gIH1cblxuICBnZXQgb3JkZXJSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfT1JERVIpO1xuICB9XG5cbiAgZ2V0IGFzc2lzdGFuY2VSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSk7XG4gIH1cblxuICBnZXQgY2xvc2VvdXRSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZXF1ZXN0IHdhdGNoZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXRXYXRjaGVyKGtpbmQpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICB9XG5cbiAgYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKSB7XG4gICAgdGhpcy5jbGVhcldhdGNoZXIoa2luZCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd2F0Y2hlci5wcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHNlbGYuZ2V0V2F0Y2hlcihraW5kKSAhPT0gd2F0Y2hlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWxmLmNsZWFyV2F0Y2hlcihraW5kKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXSA9IHdhdGNoZXI7XG4gICAgdGhpcy5fbm90aWZ5Q2hhbmdlKGtpbmQpO1xuICB9XG5cbiAgY2xlYXJXYXRjaGVyKGtpbmQpIHtcbiAgICB2YXIgd2F0Y2hlciA9IHRoaXMuZ2V0V2F0Y2hlcihraW5kKTtcblxuICAgIGlmICh3YXRjaGVyKSB7XG4gICAgICB3YXRjaGVyLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICAgIHRoaXMuX25vdGlmeUNoYW5nZShraW5kKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfbm90aWZ5Q2hhbmdlKGtpbmQpIHtcbiAgICB2YXIgc2lnbmFsO1xuXG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSOlxuICAgICAgICBzaWduYWwgPSB0aGlzLm9yZGVyUmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzaWduYWwpIHtcbiAgICAgIHNpZ25hbC5kaXNwYXRjaCh0aGlzLmdldFdhdGNoZXIoa2luZCkpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL3Nlc3Npb25tb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNlc3Npb25Nb2RlbCA9IGNsYXNzIFNlc3Npb25Nb2RlbCBleHRlbmRzIGFwcC5BYnN0cmFjdE1vZGVsICB7XG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHN1cGVyKHN0b3JhZ2VQcm92aWRlcik7XG5cbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnYXBpVG9rZW4nLCAnc25hcF9hY2Nlc3N0b2tlbicpO1xuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdjdXN0b21lclRva2VuJywgJ3NuYXBfY3VzdG9tZXJfYWNjZXNzdG9rZW4nKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvc2hlbGxtb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTW9kZWwgPSBjbGFzcyBTaGVsbE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IFtdO1xuICAgIHRoaXMuYmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gW107XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fcGFnZUJhY2tncm91bmRzID0gW107XG4gICAgdGhpcy5wYWdlQmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmVsZW1lbnRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jdXJyZW5jeSA9ICcnO1xuICAgIHRoaXMuY3VycmVuY3lDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgYmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRzO1xuICB9XG5cbiAgc2V0IGJhY2tncm91bmRzKHZhbHVlKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLmJhY2tncm91bmRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgc2NyZWVuc2F2ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JlZW5zYXZlcnM7XG4gIH1cblxuICBzZXQgc2NyZWVuc2F2ZXJzKHZhbHVlKSB7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gdmFsdWU7XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYWdlQmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcztcbiAgfVxuXG4gIHNldCBwYWdlQmFja2dyb3VuZHModmFsdWUpIHtcbiAgICB0aGlzLl9wYWdlQmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLnBhZ2VCYWNrZ3JvdW5kc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcbiAgfVxuXG4gIHNldCBlbGVtZW50cyh2YWx1ZSkge1xuICAgIHRoaXMuX2VsZW1lbnRzID0gdmFsdWU7XG4gICAgdGhpcy5lbGVtZW50c0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHByaWNlRm9ybWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9wcmljZUZvcm1hdDtcbiAgfVxuXG4gIHNldCBwcmljZUZvcm1hdCh2YWx1ZSkge1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gdmFsdWU7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbmN5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW5jeTtcbiAgfVxuXG4gIHNldCBjdXJyZW5jeSh2YWx1ZSkge1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gdmFsdWU7XG4gICAgdGhpcy5jdXJyZW5jeUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvc3VydmV5bW9kZWwuanNcblxud2luZG93LmFwcC5TdXJ2ZXlNb2RlbCA9IGNsYXNzIFN1cnZleU1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4oQ29uZmlnLnN1cnZleXMpO1xuICAgIHRoaXMuX3N1cnZleXMgPSB7fTtcblxuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX3N1cnZleScpO1xuXG4gICAgdGhpcy5fZmVlZGJhY2tTdXJ2ZXkgPSBudWxsO1xuICAgIHRoaXMuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLnN1cnZleUNvbXBsZXRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5fc3VydmV5cyA9IHZhbHVlIHx8IHNlbGYuX3N1cnZleXM7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lzRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgZmVlZGJhY2tTdXJ2ZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZlZWRiYWNrU3VydmV5O1xuICB9XG5cbiAgc2V0IGZlZWRiYWNrU3VydmV5KHZhbHVlKSB7XG4gICAgdGhpcy5fZmVlZGJhY2tTdXJ2ZXkgPSB2YWx1ZTtcbiAgICB0aGlzLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9mZWVkYmFja1N1cnZleSk7XG4gIH1cblxuICBnZXQgZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9zdXJ2ZXlzLmZlZWRiYWNrKTtcbiAgfVxuXG4gIHNldCBmZWVkYmFja1N1cnZleUNvbXBsZXRlKHZhbHVlKSB7XG4gICAgdGhpcy5fc3VydmV5cy5mZWVkYmFjayA9IEJvb2xlYW4odmFsdWUpO1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3N1cnZleXMpO1xuXG4gICAgdGhpcy5zdXJ2ZXlDb21wbGV0ZWQuZGlzcGF0Y2godGhpcy5mZWVkYmFja1N1cnZleSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9wZXJzaXN0ZW5jZS9hcHBjYWNoZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIEFwcENhY2hlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIEFwcENhY2hlID0gZnVuY3Rpb24oTG9nZ2VyKSB7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX2NhY2hlID0gd2luZG93LmFwcGxpY2F0aW9uQ2FjaGU7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMgPSBbXG4gICAgICAnY2FjaGVkJyxcbiAgICAgICdjaGVja2luZycsXG4gICAgICAnZG93bmxvYWRpbmcnLFxuICAgICAgJ2NhY2hlZCcsXG4gICAgICAnbm91cGRhdGUnLFxuICAgICAgJ29ic29sZXRlJyxcbiAgICAgICd1cGRhdGVyZWFkeScsXG4gICAgICAncHJvZ3Jlc3MnXG4gICAgXTtcblxuICAgIHZhciBzdGF0dXMgPSB0aGlzLl9nZXRDYWNoZVN0YXR1cygpO1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuXG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1VwZGF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9oYWRFcnJvcnMgPSBmYWxzZTtcblxuICAgIGlmIChzdGF0dXMgPT09ICdVTkNBQ0hFRCcpIHtcbiAgICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgICAgdGhpcy5jb21wbGV0ZS5kaXNwYXRjaChmYWxzZSk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2Vycm9ySGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2hhbmRsZUNhY2hlRXJyb3IoZSk7XG4gICAgfTtcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9oYW5kbGVDYWNoZUV2ZW50KGUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc0NvbXBsZXRlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9pc0NvbXBsZXRlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc1VwZGF0ZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2lzVXBkYXRlZDsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXBwQ2FjaGUucHJvdG90eXBlLCAnaGFkRXJyb3JzJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9oYWRFcnJvcnM7IH1cbiAgfSk7XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9nZXRDYWNoZVN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fY2FjaGUuc3RhdHVzKSB7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVOQ0FDSEVEOlxuICAgICAgICByZXR1cm4gJ1VOQ0FDSEVEJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuSURMRTpcbiAgICAgICAgcmV0dXJuICdJRExFJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuQ0hFQ0tJTkc6XG4gICAgICAgIHJldHVybiAnQ0hFQ0tJTkcnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5ET1dOTE9BRElORzpcbiAgICAgICAgcmV0dXJuICdET1dOTE9BRElORyc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVQREFURVJFQURZOlxuICAgICAgICByZXR1cm4gJ1VQREFURVJFQURZJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuT0JTT0xFVEU6XG4gICAgICAgIHJldHVybiAnT0JTT0xFVEUnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdVS05PV04gQ0FDSEUgU1RBVFVTJztcbiAgICB9XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZXN1bHQgPSBmdW5jdGlvbihlcnJvciwgdXBkYXRlZCkge1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgIHRoaXMuX2lzVXBkYXRlZCA9IHVwZGF0ZWQ7XG4gICAgdGhpcy5faGFkRXJyb3JzID0gKGVycm9yICE9IG51bGwpO1xuICAgIHRoaXMuY29tcGxldGUuZGlzcGF0Y2godXBkYXRlZCk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9oYW5kbGVDYWNoZUV2ZW50ID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnR5cGUgIT09ICdwcm9ncmVzcycpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGUgZXZlbnQ6ICcgKyBlLnR5cGUpO1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyB0aGlzLl9nZXRDYWNoZVN0YXR1cygpKTtcbiAgICB9XG5cbiAgICBpZiAoZS50eXBlID09PSAndXBkYXRlcmVhZHknKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hpbmcgY29tcGxldGUuIFN3YXBwaW5nIHRoZSBjYWNoZS4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX2NhY2hlLnN3YXBDYWNoZSgpO1xuXG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgdHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKGUudHlwZSA9PT0gJ2NhY2hlZCcpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gQ2FjaGUgc2F2ZWQuJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgZmFsc2UpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLnR5cGUgPT09ICdub3VwZGF0ZScpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gTm8gdXBkYXRlcy4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCBmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5faGFuZGxlQ2FjaGVFcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYWNoZSB1cGRhdGUgZXJyb3I6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fcmVzdWx0KGUsIGZhbHNlKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkFwcENhY2hlID0gQXBwQ2FjaGU7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvcGVyc2lzdGVuY2Uvc3RvcmUuY29yZG92YS5qc1xuXG53aW5kb3cuYXBwLkNvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZSA9IGNsYXNzIENvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5faWQgPSBpZDtcblxuICAgIGlmICghbG9jYWxTdG9yYWdlKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ29yZG92YSBub3QgZm91bmQuJyk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2lkKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZCgpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHZhbHVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9pZCkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2lkLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9wZXJzaXN0ZW5jZS9zdG9yZS5pbm1lbW9yeS5qc1xuXG53aW5kb3cuYXBwLkluTWVtb3J5U3RvcmUgPSBjbGFzcyBJbk1lbW9yeVN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IG51bGw7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHJlYWQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9zdG9yYWdlKTtcbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IHZhbHVlO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3BlcnNpc3RlbmNlL3N0b3JlLmxvY2Fsc3RvcmFnZS5qc1xuXG53aW5kb3cuYXBwLkxvY2FsU3RvcmFnZVN0b3JlID0gY2xhc3MgTG9jYWxTdG9yYWdlU3RvcmUge1xuICBjb25zdHJ1Y3RvcihpZCkge1xuICAgIHRoaXMuX2lkID0gaWQ7XG5cbiAgICBpZiAoIXN0b3JlKSB7XG4gICAgICB0aHJvdyBFcnJvcignU3RvcmUuanMgbm90IGZvdW5kLicpO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRyeSB7XG4gICAgICBzdG9yZS5yZW1vdmUodGhpcy5faWQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cblxuICByZWFkKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdmFsdWUgPSBzdG9yZS5nZXQodGhpcy5faWQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN0b3JlLnNldCh0aGlzLl9pZCwgdmFsdWUpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL2JhY2tlbmRhcGkuanNcblxud2luZG93LmFwcC5CYWNrZW5kQXBpID0gY2xhc3MgQmFja2VuZEFwaSB7XG4gIGNvbnN0cnVjdG9yKEhvc3RzLCBTZXNzaW9uTW9kZWwpIHtcbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBidXNpbmVzc1Rva2VuUHJvdmlkZXIoKSB7XG4gICAgICBpZiAoIXNlbGYuX1Nlc3Npb25Nb2RlbC5hcGlUb2tlbikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzZWxmLl9TZXNzaW9uTW9kZWwuYXBpVG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXN0b21lclRva2VuUHJvdmlkZXIoKSB7XG4gICAgICBpZiAoIXNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIER0c0FwaUNsaWVudCkge1xuICAgICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgaG9zdDoge1xuICAgICAgICAgIGRvbWFpbjogSG9zdHMuYXBpLmhvc3QsXG4gICAgICAgICAgc2VjdXJlOiBIb3N0cy5hcGkuc2VjdXJlID09PSAndHJ1ZSdcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHByb3ZpZGVyID0gYnVzaW5lc3NUb2tlblByb3ZpZGVyO1xuXG4gICAgICBpZiAoa2V5ID09PSAnc25hcCcpIHtcbiAgICAgICAgY29uZmlnLmhvc3QuZG9tYWluID0gSG9zdHMuY29udGVudC5ob3N0O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoa2V5ID09PSAnY3VzdG9tZXInKSB7XG4gICAgICAgIHByb3ZpZGVyID0gY3VzdG9tZXJUb2tlblByb3ZpZGVyO1xuICAgICAgfVxuXG4gICAgICB0aGlzW2tleV0gPSBuZXcgRHRzQXBpQ2xpZW50W2tleV0oY29uZmlnLCBwcm92aWRlcik7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9jYXJkcmVhZGVyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJkUmVhZGVyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcmRSZWFkZXIgPSBmdW5jdGlvbihNYW5hZ2VtZW50U2VydmljZSkge1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5vblJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbkVycm9yID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUucmVjZWl2ZWQgPSBmdW5jdGlvbihjYXJkKSB7XG4gICAgdGhpcy5vblJlY2VpdmVkLmRpc3BhdGNoKGNhcmQpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIHRoaXMub25FcnJvci5kaXNwYXRjaChlKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdGFydENhcmRSZWFkZXIoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdG9wQ2FyZFJlYWRlcigpO1xuICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FyZFJlYWRlciA9IENhcmRSZWFkZXI7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9kYXRhcHJvdmlkZXIuanNcblxud2luZG93LmFwcC5EYXRhUHJvdmlkZXIgPSBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcihjb25maWcsIHNlcnZpY2UpIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fc2VydmljZSA9IHNlcnZpY2U7XG4gICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fY2FjaGUgPSB7fTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2VzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2RpZ2VzdCcsICdnZXREaWdlc3QnKTtcbiAgfVxuXG4gIGhvbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdob21lJywgJ2dldE1lbnVzJyk7XG4gIH1cblxuICBhZHZlcnRpc2VtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2FkdmVydGlzZW1lbnRzJywgJ2dldEFkdmVydGlzZW1lbnRzJyk7XG4gIH1cblxuICBiYWNrZ3JvdW5kcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2JhY2tncm91bmRzJywgJ2dldEJhY2tncm91bmRzJyk7XG4gIH1cblxuICBlbGVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2VsZW1lbnRzJywgJ2dldEVsZW1lbnRzJyk7XG4gIH1cblxuICBtZW51KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdtZW51JywgJ2dldE1lbnUnLCBpZCk7XG4gIH1cblxuICBjYXRlZ29yeShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnY2F0ZWdvcnknLCAnZ2V0TWVudUNhdGVnb3J5JywgaWQpO1xuICB9XG5cbiAgaXRlbShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnaXRlbScsICdnZXRNZW51SXRlbScsIGlkKTtcbiAgfVxuXG4gIHN1cnZleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdzdXJ2ZXlzJywgJ2dldFN1cnZleXMnKTtcbiAgfVxuXG4gIHNlYXRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdzZWF0cycpIHx8IHRoaXMuX3NlcnZpY2UubG9jYXRpb24uZ2V0U2VhdHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCAnc2VhdHMnKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgbWVkaWEobWVkaWEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRva2VuID0gbWVkaWEudG9rZW4gKyAnXycgKyBtZWRpYS53aWR0aCArICdfJyArIG1lZGlhLmhlaWdodDtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdtZWRpYScsIHRva2VuKSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAobWVkaWEud2lkdGggJiYgbWVkaWEuaGVpZ2h0KSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1nKTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4gcmVqZWN0KGUpO1xuICAgICAgICBpbWcuc3JjID0gc2VsZi5fZ2V0TWVkaWFVcmwobWVkaWEsIG1lZGlhLndpZHRoLCBtZWRpYS5oZWlnaHQsIG1lZGlhLmV4dGVuc2lvbik7XG5cbiAgICAgICAgc2VsZi5fc3RvcmUoaW1nLCAnbWVkaWEnLCB0b2tlbik7XG5cbiAgICAgICAgaWYgKGltZy5jb21wbGV0ZSkge1xuICAgICAgICAgIHJlc29sdmUoaW1nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlamVjdCgnTWlzc2luZyBpbWFnZSBkaW1lbnNpb25zJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBfZ2V0U25hcERhdGEobmFtZSwgbWV0aG9kLCBpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKG5hbWUsIGlkKSB8fCB0aGlzLl9zZXJ2aWNlLnNuYXBbbWV0aG9kXSh0aGlzLl9jb25maWcubG9jYXRpb24sIGlkKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCBuYW1lLCBpZCk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIF9vbkVycm9yKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICBfY2FjaGVkKGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0gJiYgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF1baWRdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF0pO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgX3N0b3JlKGRhdGEsIGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCkge1xuICAgICAgaWYgKCF0aGlzLl9jYWNoZVtncm91cF0pIHtcbiAgICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdID0ge307XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0gPSBkYXRhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXSA9IGRhdGE7XG4gICAgfVxuICB9XG5cbiAgX2dldE1lZGlhVXJsKCkge1xuXG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL21hbmFnZW1lbnRzZXJ2aWNlLmNvcmRvdmEuanNcblxud2luZG93LmFwcC5Db3Jkb3ZhTWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBDb3Jkb3ZhTWFuYWdlbWVudFNlcnZpY2Uge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKExvZ2dlcikge1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcblxuICAgIGlmICghd2luZG93LmNvcmRvdmEpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci53YXJuKCdDb3Jkb3ZhIGlzIG5vdCBhdmFpbGFibGUuJyk7XG4gICAgfVxuICB9XG5cbiAgcm90YXRlU2NyZWVuKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIG9wZW5Ccm93c2VyKHVybCwgYnJvd3NlclJlZiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdmFyIHRhcmdldCA9IG9wdGlvbnMuc3lzdGVtID8gJ19ibGFuaycgOiAnX2JsYW5rJyxcbiAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIGxvY2F0aW9uOiBvcHRpb25zLnN5c3RlbSA/ICdubycgOiAneWVzJyxcbiAgICAgICAgICAgIGNsZWFyY2FjaGU6ICd5ZXMnLFxuICAgICAgICAgICAgY2xlYXJzZXNzaW9uY2FjaGU6ICd5ZXMnLFxuICAgICAgICAgICAgem9vbTogJ25vJyxcbiAgICAgICAgICAgIGhhcmR3YXJlYmFjazogJ25vJ1xuICAgICAgICAgIH07XG5cbiAgICAgIGJyb3dzZXJSZWYgPSB3aW5kb3cub3Blbih1cmwsIHRhcmdldCwgT2JqZWN0LmtleXMoc2V0dGluZ3MpLm1hcCh4ID0+IGAke3h9PSR7c2V0dGluZ3NbeF19YCkuam9pbignLCcpKTtcbiAgICAgIHJlc29sdmUobmV3IGFwcC5Db3Jkb3ZhV2ViQnJvd3NlclJlZmVyZW5jZShicm93c2VyUmVmKSk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZUJyb3dzZXIoYnJvd3NlclJlZikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGJyb3dzZXJSZWYuZXhpdCgpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRDYXJkUmVhZGVyKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHN0b3BDYXJkUmVhZGVyKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgfSk7XG4gIH1cblxuICBsb2FkQXBwbGljYXRpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB3aW5kb3cub3Blbihgc25hcC5odG1sYCwgJ19zZWxmJyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRTb3VuZFZvbHVtZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDEwMCk7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2YWx1ZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIGdldERpc3BsYXlCcmlnaHRuZXNzKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMTAwKTtcbiAgfVxuXG4gIHNldERpc3BsYXlCcmlnaHRuZXNzKHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9tYW5hZ2VtZW50c2VydmljZS5ob21lYnJldy5qc1xuXG53aW5kb3cuYXBwLkhvbWVicmV3TWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBIb21lYnJld01hbmFnZW1lbnRTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9hcGkgPSB7XG4gICAgICAncm90YXRlU2NyZWVuJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9yb3RhdGUtc2NyZWVuJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ29wZW5Ccm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9vcGVuLWJyb3dzZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnY2xvc2VCcm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9jbG9zZS1icm93c2VyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3N0YXJ0Q2FyZFJlYWRlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvc3RhcnQtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc3RvcENhcmRSZWFkZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3N0b3AtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAncmVzZXQnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3Jlc2V0Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2dldFNvdW5kVm9sdW1lJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC92b2x1bWUnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc2V0U291bmRWb2x1bWUnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3ZvbHVtZScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdnZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KVxuICAgIH07XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9XG5cbiAgcm90YXRlU2NyZWVuKCkge1xuICAgIHRoaXMuX2FwaS5yb3RhdGVTY3JlZW4ucXVlcnkoKTtcbiAgfVxuXG4gIG9wZW5Ccm93c2VyKHVybCwgYnJvd3NlclJlZikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5fYXBpLm9wZW5Ccm93c2VyLnF1ZXJ5KHsgdXJsOiB1cmwgfSkudGhlbihyZXNvbHZlID0+IHtcbiAgICAgICAgdmFyIGJyb3dzZXIgPSBuZXcgYXBwLldlYkJyb3dzZXJSZWZlcmVuY2UoKTtcbiAgICAgICAgYnJvd3Nlci5vbk5hdmlnYXRlZC5kaXNwYXRjaCh1cmwpO1xuICAgICAgICByZXNvbHZlKGJyb3dzZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZUJyb3dzZXIoYnJvd3NlclJlZikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoYnJvd3NlclJlZikge1xuICAgICAgICBicm93c2VyUmVmLm9uRXhpdC5kaXNwYXRjaCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5fYXBpLmNsb3NlQnJvd3Nlci5xdWVyeSgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRDYXJkUmVhZGVyKCkge1xuICAgIHRoaXMuX2FwaS5zdGFydENhcmRSZWFkZXIucXVlcnkoKTtcbiAgfVxuXG4gIHN0b3BDYXJkUmVhZGVyKCkge1xuICAgIHRoaXMuX2FwaS5zdG9wQ2FyZFJlYWRlci5xdWVyeSgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkucmVzZXQucXVlcnkoKS4kcHJvbWlzZS50aGVuKHJlc29sdmUsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKCcvc25hcC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkQXBwbGljYXRpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKCcvc25hcC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSkpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0U291bmRWb2x1bWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXRTb3VuZFZvbHVtZS5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0U291bmRWb2x1bWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldFNvdW5kVm9sdW1lLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG5cbiAgZ2V0RGlzcGxheUJyaWdodG5lc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXREaXNwbGF5QnJpZ2h0bmVzcy5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldERpc3BsYXlCcmlnaHRuZXNzLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9zb2NrZXRjbGllbnQuanNcblxud2luZG93LmFwcC5Tb2NrZXRDbGllbnQgPSBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBjb25zdHJ1Y3RvcihTZXNzaW9uTW9kZWwsIEhvc3RzLCBMb2dnZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2NoYW5uZWxzID0ge307XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldENsdXN0ZXIuY29ubmVjdCh7XG4gICAgICBob3N0bmFtZTogSG9zdHMuc29ja2V0Lmhvc3QsXG4gICAgICBwYXRoOiBIb3N0cy5zb2NrZXQucGF0aCxcbiAgICAgIHBvcnQ6IEhvc3RzLnNvY2tldC5wb3J0LFxuICAgICAgc2VjdXJlOiBIb3N0cy5zb2NrZXQuc2VjdXJlXG4gICAgfSk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdjb25uZWN0Jywgc3RhdHVzID0+IHtcbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgU29ja2V0IGNvbm5lY3RlZC5gKTtcbiAgICAgIHNlbGYuX2F1dGhlbnRpY2F0ZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgU29ja2V0IGRpc2Nvbm5lY3RlZC5gKTtcbiAgICAgIHNlbGYuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBzZWxmLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmlzQ29ubmVjdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBzdWJzY3JpYmUodG9waWMsIGhhbmRsZXIpIHtcbiAgICB0aGlzLl9nZXRDaGFubmVsKHRvcGljKS53YXRjaChoYW5kbGVyKTtcbiAgfVxuXG4gIHNlbmQodG9waWMsIGRhdGEpIHtcbiAgICB0aGlzLl9nZXRDaGFubmVsKHRvcGljKS5wdWJsaXNoKGRhdGEpO1xuICB9XG5cbiAgX2dldENoYW5uZWwodG9waWMpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhbm5lbHNbdG9waWNdIHx8ICh0aGlzLl9jaGFubmVsc1t0b3BpY10gPSB0aGlzLl9zb2NrZXQuc3Vic2NyaWJlKHRvcGljKSk7XG4gIH1cblxuICBfYXV0aGVudGljYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLl9zb2NrZXQuZW1pdCgnYXV0aGVudGljYXRlJywge1xuICAgICAgYWNjZXNzX3Rva2VuOiBzZWxmLl9TZXNzaW9uTW9kZWwuYXBpVG9rZW5cbiAgICB9LCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBzZWxmLl9Mb2dnZXIud2FybihgVW5hYmxlIHRvIGF1dGhlbnRpY2F0ZSBzb2NrZXQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgc2VsZi5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2goc2VsZi5pc0Nvbm5lY3RlZCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL3RlbGVtZXRyeXNlcnZpY2UuanNcblxud2luZG93LmFwcC5UZWxlbWV0cnlTZXJ2aWNlID0gY2xhc3MgVGVsZW1ldHJ5U2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSkge1xuICAgIHRoaXMuX2FwaSA9IHtcbiAgICAgICdzdWJtaXRUZWxlbWV0cnknOiAkcmVzb3VyY2UoJy9zbmFwL3RlbGVtZXRyeScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSksXG4gICAgICAnc3VibWl0TG9ncyc6ICRyZXNvdXJjZSgnL3NuYXAvbG9ncycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSlcbiAgICB9O1xuICB9XG5cbiAgc3VibWl0VGVsZW1ldHJ5KGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnN1Ym1pdFRlbGVtZXRyeS5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHN1Ym1pdExvZ3MoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0TG9ncy5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NlcnZpY2Uvd2ViYnJvd3Nlci5qc1xuXG53aW5kb3cuYXBwLldlYkJyb3dzZXIgPSBjbGFzcyBXZWJCcm93c2VyIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMsIFVSSSAqL1xuXG4gIGNvbnN0cnVjdG9yKEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpIHtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5fbG9jYWxIb3N0cyA9IE9iamVjdC5rZXlzKFNOQVBIb3N0cykubWFwKHAgPT4gU05BUEhvc3RzW3BdLmhvc3QpO1xuICAgIHRoaXMuX2xvY2FsSG9zdHMucHVzaCgnbG9jYWxob3N0Jyk7XG5cbiAgICB0aGlzLm9uT3BlbiA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DbG9zZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2Jyb3dzZXIgPSBudWxsO1xuICB9XG5cbiAgb3Blbih1cmwsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5fTWFuYWdlbWVudFNlcnZpY2Uub3BlbkJyb3dzZXIodXJsLCB0aGlzLl9icm93c2VyLCBvcHRpb25zKS50aGVuKGJyb3dzZXIgPT4ge1xuICAgICAgc2VsZi5fYnJvd3NlciA9IGJyb3dzZXI7XG4gICAgICBzZWxmLm9uT3Blbi5kaXNwYXRjaCh1cmwsIHNlbGYuX2Jyb3dzZXIpO1xuICAgICAgc2VsZi5fYnJvd3Nlck9wZW5lZCA9IHRydWU7XG5cbiAgICAgIHNlbGYuX2Jyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKHVybCA9PiB7XG4gICAgICAgIHNlbGYub25OYXZpZ2F0ZWQuZGlzcGF0Y2godXJsKTtcblxuICAgICAgICBsZXQgaG9zdCA9IFVSSSh1cmwpLmhvc3RuYW1lKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX2xvY2FsSG9zdHMuaW5kZXhPZihob3N0KSA9PT0gLTEpIHtcbiAgICAgICAgICBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dVcmwodXJsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzZWxmLl9icm93c2VyLm9uRXhpdC5hZGRPbmNlKCgpID0+IHtcbiAgICAgICAgc2VsZi5vbkNsb3NlLmRpc3BhdGNoKCk7XG4gICAgICAgIHNlbGYuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5fYnJvd3NlciA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJyb3dzZXI7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuX2Jyb3dzZXJPcGVuZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fTWFuYWdlbWVudFNlcnZpY2UuY2xvc2VCcm93c2VyKHRoaXMuX2Jyb3dzZXIpLnRoZW4oKCkgPT4ge1xuICAgICAgc2VsZi5fYnJvd3NlciA9IG51bGw7XG4gICAgICBzZWxmLm9uQ2xvc2UuZGlzcGF0Y2goKTtcbiAgICAgIHNlbGYuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgRXh0ZXJuYWwgbWV0aG9kc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbmF2aWdhdGVkKHVybCkge1xuICAgIGlmICh0aGlzLl9icm93c2VyKSB7XG4gICAgICB0aGlzLl9icm93c2VyLm9uTmF2aWdhdGVkLmRpc3BhdGNoKHVybCk7XG4gICAgfVxuICB9XG5cbiAgY2FsbGJhY2soZGF0YSkge1xuICAgIGlmICh0aGlzLl9icm93c2VyKSB7XG4gICAgICB0aGlzLl9icm93c2VyLm9uQ2FsbGJhY2suZGlzcGF0Y2goZGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvd29ya2Vycy9oZWF0bWFwLmpzXG5cbndpbmRvdy5hcHAuSGVhdE1hcCA9IGNsYXNzIEhlYXRNYXAge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbGlzdGVuZXIgPSBlID0+IHtcbiAgICAgIHNlbGYuX29uQ2xpY2soZSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9saXN0ZW5lcik7XG5cbiAgICB0aGlzLmNsaWNrZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2xpc3RlbmVyKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGUpIHtcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIHg6IGUubGF5ZXJYIC8gdGhpcy5fZWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgIHk6IGUubGF5ZXJZIC8gdGhpcy5fZWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICB9O1xuXG4gICAgaWYgKGRhdGEueCA8IDAgfHwgZGF0YS55IDwgMCB8fCBkYXRhLnggPiAxIHx8IGRhdGEueSA+IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsaWNrZWQuZGlzcGF0Y2goZGF0YSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC93b3JrZXJzL2xvZ2dlci5qc1xuXG53aW5kb3cuYXBwLkxvZ2dlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX2xvZyA9IGxvZzRqYXZhc2NyaXB0LmdldExvZ2dlcigpO1xuXG4gICAgdmFyIGFqYXhBcHBlbmRlciA9IG5ldyBsb2c0amF2YXNjcmlwdC5BamF4QXBwZW5kZXIoJy9zbmFwL2xvZycpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRXYWl0Rm9yUmVzcG9uc2UodHJ1ZSk7XG4gICAgYWpheEFwcGVuZGVyLnNldExheW91dChuZXcgbG9nNGphdmFzY3JpcHQuSnNvbkxheW91dCgpKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0VGhyZXNob2xkKGxvZzRqYXZhc2NyaXB0LkxldmVsLkVSUk9SKTtcblxuICAgIHRoaXMuX2xvZy5hZGRBcHBlbmRlcihhamF4QXBwZW5kZXIpO1xuICAgIHRoaXMuX2xvZy5hZGRBcHBlbmRlcihuZXcgbG9nNGphdmFzY3JpcHQuQnJvd3NlckNvbnNvbGVBcHBlbmRlcigpKTtcbiAgfVxuXG4gIGRlYnVnKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuZGVidWcoLi4uYXJncyk7XG4gIH1cblxuICBpbmZvKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuaW5mbyguLi5hcmdzKTtcbiAgfVxuXG4gIHdhcm4oLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy53YXJuKC4uLmFyZ3MpO1xuICB9XG5cbiAgZXJyb3IoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5lcnJvciguLi5hcmdzKTtcbiAgfVxuXG4gIGZhdGFsKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuZmF0YWwoLi4uYXJncyk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC93b3JrZXJzL21lZGlhc3RhcnRlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzd2ZvYmplY3QgKi9cblxuICBmdW5jdGlvbiBNZWRpYVN0YXJ0ZXIoaWQpIHtcblxuICAgIHZhciBmbGFzaHZhcnMgPSB7fTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgbWVudTogJ2ZhbHNlJyxcbiAgICAgIHdtb2RlOiAnZGlyZWN0JyxcbiAgICAgIGFsbG93RnVsbFNjcmVlbjogJ2ZhbHNlJ1xuICAgIH07XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBuYW1lOiBpZFxuICAgIH07XG5cbiAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcigndXJsJyksXG4gICAgICBpZCxcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd3aWR0aCcpLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ2hlaWdodCcpLFxuICAgICAgJzE2LjAuMCcsXG4gICAgICAnZXhwcmVzc0luc3RhbGwuc3dmJyxcbiAgICAgIGZsYXNodmFycyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdWNjZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIE1lZGlhU3RhcnRlci5wcm90b3R5cGUuX2dldFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcIyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIiksXG4gICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uaGFzaCk7XG4gICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyB1bmRlZmluZWQgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLk1lZGlhU3RhcnRlciA9IE1lZGlhU3RhcnRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL2FwcHMuanNcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyAgQXBwbGljYXRpb25Cb290c3RyYXBlclxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5hcHAuQXBwbGljYXRpb25Cb290c3RyYXBlciA9IGNsYXNzIEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaG9zdHMgPSB7XG4gICAgICBhcGk6IHsgJ2hvc3QnOiAnYXBpMi5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiB0cnVlIH0sXG4gICAgICBjb250ZW50OiB7ICdob3N0JzogJ2NvbnRlbnQubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogZmFsc2UgfSxcbiAgICAgIG1lZGlhOiB7ICdob3N0JzogJ2NvbnRlbnQubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogZmFsc2UgfSxcbiAgICAgIHN0YXRpYzogeyAncGF0aCc6ICcvJyB9LFxuICAgICAgc29ja2V0OiB7ICdob3N0JzogJ3dlYi1kZXYubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogdHJ1ZSwgJ3BvcnQnOjgwODAsICdwYXRoJzogJy9zb2NrZXQvJyB9XG4gICAgfTtcblxuICAgIHRoaXMuZW52aXJvbm1lbnQgPSB7XG4gICAgICBtYWluX2FwcGxpY2F0aW9uOiB7ICdjbGllbnRfaWQnOiAnZDY3NjEwYjFjOTEwNDRkOGFiZDU1Y2JkYTZjNjE5ZjAnLCAnY2FsbGJhY2tfdXJsJzogJ2h0dHA6Ly9hcGkyLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL2FwaScsICdzY29wZSc6ICcnIH0sXG4gICAgICBjdXN0b21lcl9hcHBsaWNhdGlvbjogeyAnY2xpZW50X2lkJzogJzkxMzgxYTg2YjNiNDQ0ZmQ4NzZkZjgwYjIyZDdmYTZlJyB9LFxuICAgICAgZmFjZWJvb2tfYXBwbGljYXRpb246IHsgJ2NsaWVudF9pZCc6ICczNDk3Mjk1MTg1NDUzMTMnLCAncmVkaXJlY3RfdXJsJzogJ2h0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL2ZhY2Vib29rJyB9LFxuICAgICAgZ29vZ2xlcGx1c19hcHBsaWNhdGlvbjogeyAnY2xpZW50X2lkJzogJzY3ODk5ODI1MDk0MS0xZG1lYnA0a3NuaTl0c2p0aDQ1dHNodDhsN2NsMW1ybi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsICdyZWRpcmVjdF91cmwnOiAnaHR0cHM6Ly93ZWIubWFuYWdlc25hcC5jb20vY2FsbGJhY2svZ29vZ2xlcGx1cycgfSxcbiAgICAgIHR3aXR0ZXJfYXBwbGljYXRpb246IHsgJ2NvbnN1bWVyX2tleSc6ICd5UThYSjE1UG1hUE9pNEw1REpQaWtHQ0kwJywgJ3JlZGlyZWN0X3VybCc6ICdodHRwczovL3dlYi5tYW5hZ2VzbmFwLmNvbS9jYWxsYmFjay90d2l0dGVyJyB9XG4gICAgfTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUHVibGljIG1ldGhvZHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNvbmZpZ3VyZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBzdG9yZSA9IG5ldyBhcHAuQ29yZG92YUxvY2FsU3RvcmFnZVN0b3JlKCdzbmFwX2xvY2F0aW9uJyk7XG5cbiAgICAgIHN0b3JlLnJlYWQoKS50aGVuKGNvbmZpZyA9PiB7XG4gICAgICAgIHNlbGYubG9jYXRpb24gPSBjb25maWcgfHwgbnVsbDtcblxuICAgICAgICBhbmd1bGFyLm1vZHVsZSgnU05BUC5jb25maWdzJywgW10pXG4gICAgICAgICAgLmNvbnN0YW50KCdTTkFQTG9jYXRpb24nLCBzZWxmLmxvY2F0aW9uKVxuICAgICAgICAgIC5jb25zdGFudCgnU05BUEVudmlyb25tZW50Jywgc2VsZi5lbnZpcm9ubWVudClcbiAgICAgICAgICAuY29uc3RhbnQoJ1NOQVBIb3N0cycsIHNlbGYuaG9zdHMpO1xuXG4gICAgICAgIGlmIChzZWxmLmhvc3RzLnN0YXRpYy5ob3N0KSB7XG4gICAgICAgICAgJHNjZURlbGVnYXRlUHJvdmlkZXIucmVzb3VyY2VVcmxXaGl0ZWxpc3QoWyAnc2VsZicsIG5ldyBSZWdFeHAoJy4qJyArIHNlbGYuaG9zdHMuc3RhdGljLmhvc3QgKyAnLionKSBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBydW4oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEhlbHBlciBtZXRob2RzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfZ2V0UGFydGlhbFVybChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmhvc3RzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgaG9zdHMgY29uZmlndXJhdGlvbi4nKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubG9jYXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBsb2NhdGlvbiBjb25maWd1cmF0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBwYXRoID0gdGhpcy5ob3N0cy5zdGF0aWMuaG9zdCA/XG4gICAgICBgLy8ke3RoaXMuaG9zdHMuc3RhdGljLmhvc3R9JHt0aGlzLmhvc3RzLnN0YXRpYy5wYXRofWAgOlxuICAgICAgYCR7dGhpcy5ob3N0cy5zdGF0aWMucGF0aH1gO1xuXG4gICAgcmV0dXJuIGAke3BhdGh9YXNzZXRzLyR7dGhpcy5sb2NhdGlvbi50aGVtZS5sYXlvdXR9L3BhcnRpYWxzLyR7bmFtZX0uaHRtbGA7XG4gIH1cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gIFNuYXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxud2luZG93LmFwcC5TbmFwQXBwbGljYXRpb25Cb290c3RyYXBlciA9IGNsYXNzIFNuYXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyIGV4dGVuZHMgYXBwLkFwcGxpY2F0aW9uQm9vdHN0cmFwZXIge1xuICBjb25maWd1cmUoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmNvbmZpZ3VyZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgYW5ndWxhci5tb2R1bGUoJ1NOQVBBcHBsaWNhdGlvbicsIFtcbiAgICAgICAgJ25nUm91dGUnLFxuICAgICAgICAnbmdBbmltYXRlJyxcbiAgICAgICAgJ25nVG91Y2gnLFxuICAgICAgICAnbmdTYW5pdGl6ZScsXG4gICAgICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICAgICAnU05BUC5jb250cm9sbGVycycsXG4gICAgICAgICdTTkFQLmRpcmVjdGl2ZXMnLFxuICAgICAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAgICAgJ1NOQVAuc2VydmljZXMnXG4gICAgICBdKS5cbiAgICAgIGNvbmZpZyhcbiAgICAgICAgWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsICckc2NlRGVsZWdhdGVQcm92aWRlcicsXG4gICAgICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIsICRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSA9PiB7XG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKGZhbHNlKTtcblxuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnSG9tZUJhc2VDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL21lbnUvOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnTWVudUJhc2VDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NhdGVnb3J5Lzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0NhdGVnb3J5QmFzZUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvaXRlbS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdJdGVtQmFzZUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvdXJsLzp1cmwnLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdVcmxDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoZWNrb3V0JywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnY2hlY2tvdXQnKSwgY29udHJvbGxlcjogJ0NoZWNrb3V0Q3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9zaWduaW4nLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdzaWduaW4nKSwgY29udHJvbGxlcjogJ1NpZ25JbkN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvYWNjb3VudCcsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ2FjY291bnQnKSwgY29udHJvbGxlcjogJ0FjY291bnRDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoYXQnLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdjaGF0JyksIGNvbnRyb2xsZXI6ICdDaGF0Q3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGF0bWFwJywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnY2hhdG1hcCcpLCBjb250cm9sbGVyOiAnQ2hhdE1hcEN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvc3VydmV5JywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnc3VydmV5JyksIGNvbnRyb2xsZXI6ICdTdXJ2ZXlDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKHsgcmVkaXJlY3RUbzogJy8nIH0pO1xuICAgICAgfV0pO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ1NOQVBBcHBsaWNhdGlvbiddKTtcbiAgfVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyAgU3RhcnR1cEFwcGxpY2F0aW9uQm9vdHN0cmFwZXJcbi8vXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG53aW5kb3cuYXBwLlN0YXJ0dXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyID0gY2xhc3MgU3RhcnR1cEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIgZXh0ZW5kcyBhcHAuQXBwbGljYXRpb25Cb290c3RyYXBlciB7XG4gIGNvbmZpZ3VyZSgpIHtcbiAgICByZXR1cm4gc3VwZXIuY29uZmlndXJlKCkudGhlbigoKSA9PiB7XG4gICAgICBhbmd1bGFyLm1vZHVsZSgnU05BUFN0YXJ0dXAnLCBbXG4gICAgICAgICduZ1JvdXRlJyxcbiAgICAgICAgJ1NOQVAuY29uZmlncycsXG4gICAgICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ1NOQVAuZGlyZWN0aXZlcycsXG4gICAgICAgICdTTkFQLmZpbHRlcnMnLFxuICAgICAgICAnU05BUC5zZXJ2aWNlcydcbiAgICAgIF0pLlxuICAgICAgY29uZmlnKCgpID0+IHt9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bigpIHtcbiAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydTTkFQU3RhcnR1cCddKTtcbiAgfVxufTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyAgU25hcEF1eGlsaWFyZXNBcHBsaWNhdGlvbkJvb3RzdHJhcGVyXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxud2luZG93LmFwcC5TbmFwQXV4aWxpYXJlc0FwcGxpY2F0aW9uQm9vdHN0cmFwZXIgPSBjbGFzcyBTbmFwQXV4aWxpYXJlc0FwcGxpY2F0aW9uQm9vdHN0cmFwZXIgZXh0ZW5kcyBhcHAuQXBwbGljYXRpb25Cb290c3RyYXBlciB7XG4gIGNvbmZpZ3VyZSgpIHtcbiAgICByZXR1cm4gc3VwZXIuY29uZmlndXJlKCkudGhlbigoKSA9PiB7XG4gICAgICBhbmd1bGFyLm1vZHVsZSgnU05BUEF1eGlsaWFyZXMnLCBbXG4gICAgICAgICduZ1JvdXRlJyxcbiAgICAgICAgJ25nQW5pbWF0ZScsXG4gICAgICAgICduZ1RvdWNoJyxcbiAgICAgICAgJ25nU2FuaXRpemUnLFxuICAgICAgICAnU05BUC5jb25maWdzJyxcbiAgICAgICAgJ1NOQVAuY29udHJvbGxlcnMnLFxuICAgICAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAgICAgJ1NOQVAuZmlsdGVycycsXG4gICAgICAgICdTTkFQLnNlcnZpY2VzJ1xuICAgICAgXSkuXG4gICAgICBjb25maWcoXG4gICAgICAgIFsnJGxvY2F0aW9uUHJvdmlkZXInLCAnJHJvdXRlUHJvdmlkZXInLFxuICAgICAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyKSA9PiB7XG5cbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKGZhbHNlKTtcblxuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvJywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnY2hhdHJvb20nKSwgY29udHJvbGxlcjogJ0NoYXRSb29tQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7IHJlZGlyZWN0VG86ICcvJyB9KTtcbiAgICAgIH1dKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bigpIHtcbiAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydTTkFQQXV4aWxpYXJlcyddKTtcbiAgfVxufTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvX2Jhc2UuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnLCBbJ2FuZ3VsYXItYmFjb24nXSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2FjY291bnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgWyckc2NvcGUnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsIEN1c3RvbWVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENvbnN0YW50c1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQcm9maWxlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJvZmlsZSA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlO1xuICAkc2NvcGUuY2FuQ2hhbmdlUGFzc3dvcmQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gIHZhciBwcm9maWxlID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3Byb2ZpbGUnKTtcblxuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgJHNjb3BlLnByb2ZpbGUgPSB2YWx1ZTtcbiAgICAkc2NvcGUuY2FuQ2hhbmdlUGFzc3dvcmQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gICAgJHNjb3BlLmNhbkNoYW5nZUVtYWlsID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFNwbGFzaCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5lZGl0UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9maWxlZWRpdCA9IGFuZ3VsYXIuY29weSgkc2NvcGUucHJvZmlsZSk7XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmVkaXRQYXNzd29yZCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wYXNzd29yZGVkaXQgPSB7XG4gICAgICBvbGRfcGFzc3dvcmQ6ICcnLFxuICAgICAgbmV3X3Bhc3N3b3JkOiAnJ1xuICAgIH07XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZWRpdFBheW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1BheW1lbnRFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFByb2ZpbGUgZWRpdCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wcm9maWxlRWRpdFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIudXBkYXRlUHJvZmlsZSgkc2NvcGUucHJvZmlsZWVkaXQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucHJvZmlsZUVkaXRDYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYXNzd29yZCBlZGl0IHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhc3N3b3JkRWRpdFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIuY2hhbmdlUGFzc3dvcmQoJHNjb3BlLnBhc3N3b3JkZWRpdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IGZhbHNlO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRFZGl0Q2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSBmYWxzZTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvYmFja2dyb3VuZC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQmFja2dyb3VuZEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG5cbiAgZnVuY3Rpb24gc2hvd0ltYWdlcyh2YWx1ZXMpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pbWFnZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0ubWVkaWEsIDE5MjAsIDEwODAsICdqcGcnKSxcbiAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGl0ZW0ubWVkaWEpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBiYWNrZ3JvdW5kcyA9IFNoZWxsTWFuYWdlci5tb2RlbC5iYWNrZ3JvdW5kcyxcbiAgICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG51bGw7XG5cbiAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5iYWNrZ3JvdW5kc0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICBiYWNrZ3JvdW5kcyA9IHZhbHVlO1xuICAgIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgdmFyIG5ld1BhZ2VCYWNrZ3JvdW5kcyA9IFNoZWxsTWFuYWdlci5nZXRQYWdlQmFja2dyb3VuZHMobG9jYXRpb24pO1xuXG4gICAgaWYgKG5ld1BhZ2VCYWNrZ3JvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBwYWdlQmFja2dyb3VuZHMgPSBuZXdQYWdlQmFja2dyb3VuZHM7XG4gICAgICBzaG93SW1hZ2VzKHBhZ2VCYWNrZ3JvdW5kcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHBhZ2VCYWNrZ3JvdW5kcykge1xuICAgICAgc3dpdGNoIChsb2NhdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21lbnUnOlxuICAgICAgICBjYXNlICdjYXRlZ29yeSc6XG4gICAgICAgIGNhc2UgJ2l0ZW0nOlxuICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYWdlQmFja2dyb3VuZHMgPSBudWxsO1xuICAgIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2FydC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2FydEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICckc2NlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnQ2hhdE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgJHNjZSwgQ3VzdG9tZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIENhcnRNb2RlbCwgTG9jYXRpb25Nb2RlbCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuICAkc2NvcGUub3B0aW9ucyA9IHt9O1xuXG4gICRzY29wZS5zdGF0ZSA9IENhcnRNb2RlbC5jYXJ0U3RhdGU7XG4gIENhcnRNb2RlbC5jYXJ0U3RhdGVDaGFuZ2VkLmFkZChzdGF0ZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RhdGUgPSBzdGF0ZSkpO1xuXG4gICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IHZhbHVlKTtcblxuICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja0NoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSB0cnVlO1xuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gdHJ1ZTtcbiAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgJHNjb3BlLnZpc2libGUgPSBDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgICAkc2NvcGUudmlzaWJsZSA9IHZhbHVlO1xuICB9KTtcblxuICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID9cbiAgICBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6XG4gICAgJ1RhYmxlJztcblxuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+ICRzY29wZS5zZWF0X25hbWUgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJyk7XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QgPT0gbnVsbDtcbiAgfTtcbiAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgPT0gbnVsbDtcbiAgfTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuICByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLmNhbGN1bGF0ZURlc2NyaXB0aW9uID0gZW50cnkgPT4ge1xuICAgIHZhciByZXN1bHQgPSBlbnRyeS5uYW1lIHx8IGVudHJ5Lml0ZW0udGl0bGU7XG5cbiAgICByZXN1bHQgKz0gZW50cnkubW9kaWZpZXJzLnJlZHVjZSgob3V0cHV0LCBjYXRlZ29yeSkgPT4ge1xuICAgICAgcmV0dXJuIG91dHB1dCArIGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKG91dHB1dCwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIG91dHB1dCArIChtb2RpZmllci5pc1NlbGVjdGVkID9cbiAgICAgICAgICAnPGJyLz4tICcgKyBtb2RpZmllci5kYXRhLnRpdGxlIDpcbiAgICAgICAgICAnJyk7XG4gICAgICB9LCAnJyk7XG4gICAgfSwgJycpO1xuXG4gICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgfTtcblxuICAkc2NvcGUuY2FsY3VsYXRlUHJpY2UgPSBlbnRyeSA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgJHNjb3BlLmVkaXRJdGVtID0gZW50cnkgPT4gQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIGZhbHNlKTtcbiAgJHNjb3BlLnJlbW92ZUZyb21DYXJ0ID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydChlbnRyeSk7XG4gICRzY29wZS5yZW9yZGVySXRlbSA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5LmNsb25lKCkpO1xuXG4gICRzY29wZS5zdWJtaXRDYXJ0ID0gKCkgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICB2YXIgb3B0aW9ucyA9ICRzY29wZS5vcHRpb25zLnRvX2dvX29yZGVyID8gMiA6IDA7XG5cbiAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2xlYXJDYXJ0ID0gKCkgPT4ge1xuICAgICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmNsZWFyQ2FydCgpO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNhcnQgPSAoKSA9PiB7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd0hpc3RvcnkgPSAoKSA9PiBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICRzY29wZS5zaG93Q2FydCA9ICgpID0+IENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcblxuICAkc2NvcGUucGF5Q2hlY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoZWNrb3V0JyB9O1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXQgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jYXRlZ29yeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2F0ZWdvcnlCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXRlZ29yeUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTTkFQRW52aXJvbm1lbnQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU05BUEVudmlyb25tZW50LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICB2YXIgQ2F0ZWdvcnlMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGlsZUNsYXNzTmFtZSA9IFNoZWxsTWFuYWdlci50aWxlU3R5bGU7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKGZ1bmN0aW9uKHRpbGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB0aWxlQ2xhc3NOYW1lLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDM3MCwgMzcwKSArICcpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaSkge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7IGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBEYXRhTWFuYWdlci5jYXRlZ29yeSA9IGxvY2F0aW9uLnR5cGUgPT09ICdjYXRlZ29yeScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuY2F0ZWdvcnkpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5jYXRlZ29yeUNoYW5nZWQuYWRkKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMsXG4gICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXMgfHwgW107XG4gICAgdGlsZXMgPSBkYXRhLml0ZW1zIHx8IFtdO1xuICAgIHRpbGVzID0gY2F0ZWdvcmllcy5jb25jYXQodGlsZXMpO1xuXG4gICAgaWYgKFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSAhPT0gJ2Rlc2t0b3AnKSB7XG4gICAgICB0aWxlcyA9IHRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUudHlwZSAhPT0gMyk7XG4gICAgfVxuXG4gICAgdGlsZXMuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgIHRpbGUudXJsID0gJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aCh0aWxlLmRlc3RpbmF0aW9uKTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcnlMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50LWNhdGVnb3J5JylcbiAgICApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnQ2hhdE1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQTG9jYXRpb24nLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNYW5hZ2VyLCBDaGF0TWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFNoZWxsTWFuYWdlciwgU05BUExvY2F0aW9uKSA9PiB7XG5cbiAgaWYgKCFTTkFQTG9jYXRpb24uY2hhdCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUExvY2F0aW9uLmxvY2F0aW9uX25hbWU7XG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xuXG4gICRzY29wZS5jaGF0RW5hYmxlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jaGF0RW5hYmxlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFjdGl2ZURldmljZXMgPSBDaGF0TWFuYWdlci5tb2RlbC5hY3RpdmVEZXZpY2VzO1xuICBDaGF0TWFuYWdlci5tb2RlbC5hY3RpdmVEZXZpY2VzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5hY3RpdmVEZXZpY2VzID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdpZnREZXZpY2UgPSBDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0RGV2aWNlID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUudG9nZ2xlQ2hhdCA9ICgpID0+IHtcbiAgICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgPSAhQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICB9O1xuXG4gICRzY29wZS5vcGVuTWFwID0gKCkgPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdG1hcCcgfTtcbiAgfTtcblxuICAkc2NvcGUuZ2V0RGV2aWNlTmFtZSA9IGRldmljZV90b2tlbiA9PiBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZV90b2tlbik7XG5cbiAgJHNjb3BlLmdldFNlYXROdW1iZXIgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIHZhciBkZXZpY2UgPSBMb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pO1xuXG4gICAgZm9yICh2YXIgcCBpbiBMb2NhdGlvbk1vZGVsLnNlYXRzKSB7XG4gICAgICBpZiAoTG9jYXRpb25Nb2RlbC5zZWF0c1twXS50b2tlbiA9PT0gZGV2aWNlLnNlYXQpIHtcbiAgICAgICAgbGV0IG1hdGNoID0gTG9jYXRpb25Nb2RlbC5zZWF0c1twXS5uYW1lLm1hdGNoKC9cXGQrLyk7XG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIHx8ICcnIDogJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNoYXQgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3b3VsZCBsaWtlIHRvIGNsb3NlIHRoZSBjaGF0IHdpdGggJyArICRzY29wZS5nZXREZXZpY2VOYW1lKGRldmljZV90b2tlbikgKyAnPycpXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0TWFuYWdlci5kZWNsaW5lRGV2aWNlKGRldmljZV90b2tlbik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmdldFVucmVhZENvdW50ID0gZGV2aWNlX3Rva2VuID0+IENoYXRNYW5hZ2VyLmdldFVucmVhZENvdW50KGRldmljZV90b2tlbik7XG5cbiAgJHNjb3BlLnNlbmRHaWZ0ID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKSxcbiAgICAgICAgc2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChkZXZpY2Uuc2VhdCk7XG5cbiAgICBpZiAoIXNlYXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oYEFyZSB5b3Ugc3VyZSB0aGF0IHlvdSB3YW50IHRvIHNlbmQgYSBnaWZ0IHRvICR7c2VhdC5uYW1lfT9gKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLnN0YXJ0R2lmdChkZXZpY2VfdG9rZW4pO1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxHaWZ0ID0gKCkgPT4gQ2hhdE1hbmFnZXIuZW5kR2lmdCgpO1xuXG4gIENoYXRNYW5hZ2VyLmlzUHJlc2VudCA9IHRydWU7XG5cbiAgdmFyIHdhdGNoTG9jYXRpb24gPSB0cnVlO1xuXG4gICRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKCkgPT4ge1xuICAgIGlmICh3YXRjaExvY2F0aW9uKSB7XG4gICAgICBDaGF0TWFuYWdlci5tb2RlbC5pc1ByZXNlbnQgPSBmYWxzZTtcbiAgICAgIHdhdGNoTG9jYXRpb24gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0Ym94LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Qm94Q3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRhdHRycycsICdDaGF0TWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJGF0dHJzLCBDaGF0TWFuYWdlciwgTG9jYXRpb25Nb2RlbCkge1xuICB2YXIgdG9fZGV2aWNlID0gJHNjb3BlLmRldmljZSxcbiAgICAgIHR5cGUgPSB0b19kZXZpY2UgP1xuICAgICAgICBDaGF0TWFuYWdlci5NRVNTQUdFX1RZUEVTLkRFVklDRSA6XG4gICAgICAgIENoYXRNYW5hZ2VyLk1FU1NBR0VfVFlQRVMuTE9DQVRJT047XG5cbiAgdmFyIGRldmljZSA9IHRvX2RldmljZSA/IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRvX2RldmljZSkgOiBudWxsO1xuXG4gICRzY29wZS5yZWFkb25seSA9IEJvb2xlYW4oJGF0dHJzLnJlYWRvbmx5KTtcbiAgJHNjb3BlLmNoYXQgPSB7fTtcbiAgJHNjb3BlLm1lc3NhZ2VzID0gW107XG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2VzKCkge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5tZXNzYWdlcyA9IENoYXRNYW5hZ2VyLm1vZGVsLmhpc3RvcnkuZmlsdGVyKG1lc3NhZ2UgPT4ge1xuICAgICAgICByZXR1cm4gbWVzc2FnZS50eXBlID09PSB0eXBlICYmIChcbiAgICAgICAgICBtZXNzYWdlLmRldmljZSA9PT0gdG9fZGV2aWNlIHx8XG4gICAgICAgICAgbWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY2hhdEVuYWJsZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2hhdEVuYWJsZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5pc0Nvbm5lY3RlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzQ29ubmVjdGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0Nvbm5lY3RlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuaXNDb25uZWN0ZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5zZW5kTWVzc2FnZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5pc0Nvbm5lY3RlZCB8fCAhJHNjb3BlLmNoYXQubWVzc2FnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHRvX2RldmljZTogdG9fZGV2aWNlLFxuICAgICAgdGV4dDogJHNjb3BlLmNoYXQubWVzc2FnZVxuICAgIH07XG5cbiAgICBDaGF0TWFuYWdlci5zZW5kTWVzc2FnZShtZXNzYWdlKTtcblxuICAgICRzY29wZS5jaGF0Lm1lc3NhZ2UgPSAnJztcbiAgfTtcblxuICAkc2NvcGUuZ2V0RnJvbU5hbWUgPSBtZXNzYWdlID0+IENoYXRNYW5hZ2VyLmdldE1lc3NhZ2VOYW1lKG1lc3NhZ2UpO1xuXG4gICRzY29wZS5nZXRTdGF0dXNUZXh0ID0gbWVzc2FnZSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHN3aXRjaChtZXNzYWdlLnN0YXR1cykge1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnWW91IGhhdmUgcmVxdWVzdGVkIHRvIGNoYXQgd2l0aCAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShtZXNzYWdlLnRvX2RldmljZSk7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VEOlxuICAgICAgICAgIHJldHVybiAnQ2xvc2VkIHRoZSBjaGF0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ0dpZnQgcmVxdWVzdCBzZW50JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBhIGdpZnQnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLmdldEZyb21OYW1lKG1lc3NhZ2UpICsgJyB3b3VsZCBsaWtlIHRvIGNoYXQgd2l0aCB5b3UnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRDpcbiAgICAgICAgICByZXR1cm4gJ0Nsb3NlZCB0aGUgY2hhdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdXb3VsZCBsaWtlIHRvIHNlbmQgeW91IGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgYSBnaWZ0JztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmlzVW5yZWFkID0gbWVzc2FnZSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2hhdE1hbmFnZXIuY2hlY2tJZlVucmVhZCh0b19kZXZpY2UsIG1lc3NhZ2UpO1xuICB9O1xuXG4gICRzY29wZS5tYXJrQXNSZWFkID0gKCkgPT4ge1xuICAgIGlmICghdG9fZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2hhdE1hbmFnZXIubWFya0FzUmVhZCh0b19kZXZpY2UpO1xuICB9O1xuXG4gICRzY29wZS5vbktleWRvd24gPSBrZXljb2RlID0+IHtcbiAgICBpZiAoa2V5Y29kZSA9PT0gMTMpIHtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuc2VuZE1lc3NhZ2UoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBMb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRzQ2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaGlzdG9yeUNoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIHNob3dNZXNzYWdlcygpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0bWFwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0TWFwQ3RybCcsXG5bJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJyxcbigkc2NvcGUsICR0aW1lb3V0LCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgTG9jYXRpb25Nb2RlbCkgPT4ge1xuXG4gICRzY29wZS5zZWF0cyA9IFtdO1xuXG4gICRzY29wZS5tYXBJbWFnZSA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cy5sb2NhdGlvbl9tYXA7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUubWFwSW1hZ2UgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHMubG9jYXRpb25fbWFwKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gYnVpbGRNYXAoKSB7XG4gICAgaWYgKCFMb2NhdGlvbk1vZGVsLnNlYXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5zZWF0cyA9IExvY2F0aW9uTW9kZWwuc2VhdHNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihzZWF0KSB7IHJldHVybiBzZWF0LnRva2VuICE9PSBMb2NhdGlvbk1vZGVsLnNlYXQudG9rZW47IH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oc2VhdCkge1xuICAgICAgICAgIHZhciBkZXZpY2VzID0gTG9jYXRpb25Nb2RlbC5kZXZpY2VzXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGRldmljZSkgeyByZXR1cm4gZGV2aWNlLnNlYXQgPT09IHNlYXQudG9rZW47IH0pXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRldmljZSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRva2VuOiBkZXZpY2UudG9rZW4sXG4gICAgICAgICAgICAgICAgc2VhdDogZGV2aWNlLnNlYXQsXG4gICAgICAgICAgICAgICAgaXNfYXZhaWxhYmxlOiBkZXZpY2UuaXNfYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBkZXZpY2UudXNlcm5hbWVcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRva2VuOiBzZWF0LnRva2VuLFxuICAgICAgICAgICAgbmFtZTogc2VhdC5uYW1lLFxuICAgICAgICAgICAgZGV2aWNlczogZGV2aWNlcyxcbiAgICAgICAgICAgIG1hcF9wb3NpdGlvbl94OiBzZWF0Lm1hcF9wb3NpdGlvbl94LFxuICAgICAgICAgICAgbWFwX3Bvc2l0aW9uX3k6IHNlYXQubWFwX3Bvc2l0aW9uX3ksXG4gICAgICAgICAgICBpc19hdmFpbGFibGU6IGRldmljZXNcbiAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkZXZpY2UpIHsgcmV0dXJuIGRldmljZS5pc19hdmFpbGFibGU7IH0pXG4gICAgICAgICAgICAgIC5sZW5ndGggPiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBMb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdHNDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgYnVpbGRNYXAoKTtcblxuICAkc2NvcGUuY2hvb3NlU2VhdCA9IGZ1bmN0aW9uKHNlYXQpIHtcbiAgICB2YXIgZGV2aWNlID0gc2VhdC5kZXZpY2VzWzBdO1xuXG4gICAgaWYgKCFzZWF0LmlzX2F2YWlsYWJsZSB8fCAhZGV2aWNlKSB7XG4gICAgICB2YXIgZGV2aWNlTmFtZSA9IGRldmljZSAmJiBkZXZpY2UudXNlcm5hbWUgPyBkZXZpY2UudXNlcm5hbWUgOiBzZWF0Lm5hbWU7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KGRldmljZU5hbWUgKyAnIGlzIHVuYXZhaWxhYmxlIGZvciBjaGF0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2hhdE1hbmFnZXIuYXBwcm92ZURldmljZShkZXZpY2UudG9rZW4pO1xuICAgICRzY29wZS5leGl0TWFwKCk7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRyb29tLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Um9vbUN0cmwnLFxuWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ2hhdE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsXG4oJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIFNOQVBMb2NhdGlvbikgPT4ge1xuICBcbiAgaWYgKCFTTkFQTG9jYXRpb24uY2hhdCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUExvY2F0aW9uLmxvY2F0aW9uX25hbWU7XG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2Vzc2lvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU3VydmV5TWFuYWdlcicsXG4gICgkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFN1cnZleU1hbmFnZXIpID0+IHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ29uc3RhbnRzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVjayBzcGxpdCB0eXBlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORSA9IDA7XG4gICRzY29wZS5DSEVDS19TUExJVF9CWV9JVEVNUyA9IDE7XG4gICRzY29wZS5DSEVDS19TUExJVF9FVkVOTFkgPSAyO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUGF5bWVudCBtZXRob2RcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVJEID0gMTtcbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBU0ggPSAyO1xuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfUEFZUEFMID0gMztcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlY2VpcHQgbWV0aG9kXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfTk9ORSA9IDA7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTCA9IDE7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVMgPSAyO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfUFJJTlQgPSAzO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2tvdXQgc3RlcFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQgPSAwO1xuICAkc2NvcGUuU1RFUF9QQVlNRU5UX01FVEhPRCA9IDE7XG4gICRzY29wZS5TVEVQX1RJUFBJTkcgPSAyO1xuICAkc2NvcGUuU1RFUF9TSUdOQVRVUkUgPSAzO1xuICAkc2NvcGUuU1RFUF9SRUNFSVBUID0gNDtcbiAgJHNjb3BlLlNURVBfQ09NUExFVEUgPSA1O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcbiAgJHNjb3BlLmRhdGEgPSBbe1xuICAgIGl0ZW1zOiBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja1xuICB9XTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL0NoZWNrcyBkYXRhXG4gIHZhciBkYXRhID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ2RhdGEnKTtcbiAgZGF0YVxuICAuY2hhbmdlcygpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUudmFsdWUpIHtcbiAgICAgIHZhciBkYXRhID0gdmFsdWUudmFsdWUoKTtcbiAgICAgICRzY29wZS5vcHRpb25zLmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgfVxuXG4gICAgJHNjb3BlLm9wdGlvbnMuaW5kZXggPSAwO1xuICB9KTtcblxuICAvL01heGltdW0gbnVtYmVyIG9mIGd1ZXN0c1xuICAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudF9tYXggPSBNYXRoLm1heChcbiAgICBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50LFxuICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLnJlZHVjZSgoaSwgaXRlbSkgPT4gaSArIGl0ZW0ucXVhbnRpdHksIDApXG4gICk7XG5cbiAgLy9OdW1iZXIgb2YgZ3Vlc3RzXG4gICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50ID0gU2Vzc2lvbk1hbmFnZXIuZ3Vlc3RDb3VudDtcblxuICAvL0NoZWNrIHNwbGl0IG1vZGVcbiAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORTtcblxuICAvL0NoZWNrIGluZGV4XG4gICRzY29wZS5vcHRpb25zLmluZGV4ID0gMDtcbiAgdmFyIGluZGV4ID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuaW5kZXgnKTtcbiAgQmFjb24uY29tYmluZUFzQXJyYXkoaW5kZXgsIGRhdGEpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQgPSAkc2NvcGUuZGF0YVskc2NvcGUub3B0aW9ucy5pbmRleF07XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgPSAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lIHx8IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLnBob25lO1xuICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscyA/XG4gICAgICAgIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmVtYWlsIDpcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbDtcbiAgICB9XG5cbiAgICBpZiAoJHNjb3BlLmN1cnJlbnQuaXRlbXMpIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnN1YnRvdGFsID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgICAgJHNjb3BlLmN1cnJlbnQudGF4ID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRheCgkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgfVxuXG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC50aXApIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnRpcCA9IDA7XG4gICAgfVxuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE5hdmlnYXRpb25cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vQ3VycmVudCBzdGVwXG4gICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudF9tYXggPiAxID9cbiAgICAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCA6XG4gICAgJHNjb3BlLlNURVBfVElQUElORztcbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgICAuc2tpcER1cGxpY2F0ZXMoKVxuICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdmFsdWUudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RlcCA9IHZhbHVlLnZhbHVlKCk7XG5cbiAgICAgIGlmIChzdGVwID09PSAkc2NvcGUuU1RFUF9DT01QTEVURSkge1xuICAgICAgICBzdGFydE5leHRDaGVjaygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTWlzY1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9TZWF0IG5hbWVcbiAgJHNjb3BlLm9wdGlvbnMuc2VhdCA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiB7XG4gICAgJHNjb3BlLm9wdGlvbnMuc2VhdCA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnO1xuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9Qcm9jZWVkIHdpdGggdGhlIG5leHQgY2hlY2tcbiAgZnVuY3Rpb24gc3RhcnROZXh0Q2hlY2soKSB7XG4gICAgdmFyIGNoZWNrID0gJHNjb3BlLmN1cnJlbnQ7XG5cbiAgICBpZiAoJHNjb3BlLm9wdGlvbnMuaW5kZXggPT09ICRzY29wZS5vcHRpb25zLmNvdW50IC0gMSkge1xuICAgICAgT3JkZXJNYW5hZ2VyLmNsZWFyQ2hlY2soKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0ge1xuICAgICAgICB0eXBlOiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCA/ICdzdXJ2ZXknIDogJ2hvbWUnXG4gICAgICB9O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuaW5kZXgrKztcbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xuXG4gIC8vQ2FsY3VsYXRlIGEgY2FydCBpdGVtIHRpdGxlXG4gICRzY29wZS5jYWxjdWxhdGVUaXRsZSA9IGVudHJ5ID0+IGVudHJ5Lm5hbWUgfHwgZW50cnkuaXRlbS50aXRsZTtcblxuICAvL0NhbGN1bGF0ZSBhIGNhcnQgaXRlbSBwcmljZVxuICAkc2NvcGUuY2FsY3VsYXRlUHJpY2UgPSBlbnRyeSA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuXG4gIC8vQ2FsY3VsYXRlIGNhcnQgaXRlbXMgcHJpY2VcbiAgJHNjb3BlLmNhbGN1bGF0ZVRvdGFsUHJpY2UgPSBlbnRyaWVzID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpO1xuXG4gIC8vT3V0cHV0IGEgZm9ybWF0dGVkIHByaWNlIHN0cmluZ1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUgfHwgMCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3NpZ25pbicgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUuaW5pdGlhbGl6ZWQgPSB0cnVlO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dG1ldGhvZC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRNZXRob2RDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNb2RlbCcsICdDYXJkUmVhZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvZ2dlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1vZGVsLCBDYXJkUmVhZGVyLCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvZ2dlcikgPT4ge1xuXG4gIENhcmRSZWFkZXIub25SZWNlaXZlZC5hZGQoZGF0YSA9PiB7XG4gICAgTG9nZ2VyLmRlYnVnKGBDYXJkIHJlYWRlciByZXN1bHQ6ICR7SlNPTi5zdHJpbmdpZnkoZGF0YSl9YCk7XG4gICAgdmFyIGNhcmQgPSB7XG4gICAgICBudW1iZXI6IGRhdGEuY2FyZF9udW1iZXIsXG4gICAgICBtb250aDogZGF0YS5leHBpcmF0aW9uX21vbnRoLFxuICAgICAgeWVhcjogZGF0YS5leHBpcmF0aW9uX3llYXIsXG4gICAgICBkYXRhOiBkYXRhLmRhdGFcbiAgICB9O1xuXG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gICAgY2FyZERhdGFSZWNlaXZlZChjYXJkKTtcbiAgfSk7XG5cbiAgQ2FyZFJlYWRlci5vbkVycm9yLmFkZChlID0+IHtcbiAgICBMb2dnZXIuZGVidWcoYENhcmQgcmVhZGVyIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfQ0FSRFJFQURFUl9FUlJPUik7XG4gIH0pO1xuXG4gICRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKCkgPT4ge1xuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICB9KTtcblxuICAvL0dlbmVyYXRlIGEgcGF5bWVudCB0b2tlblxuICBmdW5jdGlvbiBnZW5lcmF0ZVBheW1lbnRUb2tlbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLmdlbmVyYXRlUGF5bWVudFRva2VuKCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBQYXltZW50IHRva2VuIGdlbmVyYXRpb24gZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICAvL0NhbGxlZCB3aGVuIGEgY2FyZCBkYXRhIGlzIHJlY2VpdmVkXG4gIGZ1bmN0aW9uIGNhcmREYXRhUmVjZWl2ZWQoY2FyZCkge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIE9yZGVyTWFuYWdlci5jbGVhckNoZWNrKCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICAgICRzY29wZS5jdXJyZW50LmNhcmRfZGF0YSA9IGNhcmQuZGF0YTtcbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9TSUdOQVRVUkU7XG4gICAgfSk7XG4gIH1cblxuICAvL0Nob29zZSB0byBwYXkgd2l0aCBhIGNyZWRpdCBjYXJkXG4gICRzY29wZS5wYXlDYXJkID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBUkQ7XG4gICAgQ2FyZFJlYWRlci5zdGFydCgpO1xuICB9O1xuXG4gICRzY29wZS5wYXlDYXJkQ2FuY2VsID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gdW5kZWZpbmVkO1xuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHBheSB3aXRoIGNhc2hcbiAgJHNjb3BlLnBheUNhc2ggPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FTSDtcblxuICAgIGlmIChPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ICE9IG51bGwpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBSZXF1ZXN0IGNsb3Nlb3V0IGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIGdlbmVyYXRlUGF5bWVudFRva2VuKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0cmVjZWlwdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRSZWNlaXB0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIpID0+IHtcblxuICAvL0Nob29zZSB0byBoYXZlIG5vIHJlY2VpcHRcbiAgJHNjb3BlLnJlY2VpcHROb25lID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfTk9ORTtcbiAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHJlY2VpcHQgYnkgZS1tYWlsXG4gICRzY29wZS5yZWNlaXB0RW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTDtcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSByZWNlaXB0IGJ5IHNtc1xuICAkc2NvcGUucmVjZWlwdFNtcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHByaW50ZWQgcmVjZWlwdFxuICAkc2NvcGUucmVjZWlwdFByaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfUFJJTlQ7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXF1ZXN0UmVjZWlwdCgpIHtcbiAgICB2YXIgaXRlbSA9ICRzY29wZS5jdXJyZW50O1xuXG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBjaGVja291dF90b2tlbjogaXRlbS5jaGVja291dF90b2tlbixcbiAgICAgIHJlY2VpcHRfbWV0aG9kOiBpdGVtLnJlY2VpcHRfbWV0aG9kXG4gICAgfTtcblxuICAgIGlmIChpdGVtLnJlY2VpcHRfbWV0aG9kID09PSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUwpIHtcbiAgICAgIHJlcXVlc3QucmVjZWlwdF9lbWFpbCA9IGl0ZW0ucmVjZWlwdF9lbWFpbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5yZWNlaXB0X21ldGhvZCA9PT0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUykge1xuICAgICAgcmVxdWVzdC5yZWNlaXB0X3Bob25lID0gaXRlbS5yZWNlaXB0X3Bob25lO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdFJlY2VpcHQocmVxdWVzdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRzaWduYXR1cmUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0U2lnbmF0dXJlQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvZ2dlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvZ2dlcikgPT4ge1xuXG4gIC8vQ2xlYXIgdGhlIGN1cnJlbnQgc2lnbmF0dXJlXG4gIHZhciByZXNldFNpZ25hdHVyZSA9ICgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuY3VycmVudC5zaWduYXR1cmVfdG9rZW4gPSB1bmRlZmluZWQ7XG5cbiAgICAgIHZhciBzaWduYXR1cmUgPSAkKCcjY2hlY2tvdXQtc2lnbmF0dXJlLWlucHV0Jyk7XG4gICAgICBzaWduYXR1cmUuZW1wdHkoKTtcbiAgICAgIHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdpbml0Jywge1xuICAgICAgICAnY29sb3InIDogJyMwMDAnLFxuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmZmJyxcbiAgICAgICAgJ2RlY29yLWNvbG9yJzogJyNmZmYnLFxuICAgICAgICAnd2lkdGgnOiAnMTAwJScsXG4gICAgICAgICdoZWlnaHQnOiAnMjAwcHgnXG4gICAgICB9KTtcbiAgICB9LCAzMDApO1xuICB9O1xuXG4gIC8vU3VibWl0IHRoZSBjdXJyZW50IHNpZ25hdHVyZSBpbnB1dFxuICAkc2NvcGUuc2lnbmF0dXJlU3VibWl0ID0gKCkgPT4ge1xuICAgIHZhciBzaWduYXR1cmUgPSAkKCcjY2hlY2tvdXQtc2lnbmF0dXJlLWlucHV0Jyk7XG5cbiAgICBpZiAoc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2dldERhdGEnLCAnbmF0aXZlJykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICB2YXIgc2lnID0gc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2dldERhdGEnLCAnaW1hZ2UnKTtcblxuICAgIE9yZGVyTWFuYWdlci51cGxvYWRTaWduYXR1cmUoc2lnWzFdKS50aGVuKHRva2VuID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuY3VycmVudC5zaWduYXR1cmVfdG9rZW4gPSB0b2tlbjtcbiAgICAgICAgY29tcGxldGVDaGVja291dCgpO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFNpZ25hdHVyZSB1cGxvYWQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy9DYW5jZWwgdGhlIGN1cnJlbnQgc2lnbmF0dXJlIGlucHV0XG4gICRzY29wZS5zaWduYXR1cmVDYW5jZWwgPSAoKSA9PiB7XG4gICAgcmVzZXRTaWduYXR1cmUoKTtcbiAgfTtcblxuICAvL0NvbXBsZXRlIHRoZSBjaGVja291dFxuICBmdW5jdGlvbiBjb21wbGV0ZUNoZWNrb3V0KCkge1xuICAgIHZhciBpdGVtID0gJHNjb3BlLmN1cnJlbnQ7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgYW1vdW50X3N1YnRvdGFsOiBpdGVtLnN1YnRvdGFsLFxuICAgICAgYW1vdW50X3RheDogaXRlbS50YXgsXG4gICAgICBhbW91bnRfdGlwOiBpdGVtLnRpcCxcbiAgICAgIGNhcmRfZGF0YTogaXRlbS5jYXJkX2RhdGEsXG4gICAgICBzaWduYXR1cmVfdG9rZW46IGl0ZW0uc2lnbmF0dXJlX3Rva2VuLFxuICAgICAgb3JkZXJfdG9rZW5zOiBpdGVtLml0ZW1zICE9IG51bGwgP1xuICAgICAgICBpdGVtLml0ZW1zLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGl0ZW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbS5xdWFudGl0eTsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0ucmVxdWVzdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwgW10pXG4gICAgICAgIDogbnVsbFxuICAgIH07XG5cbiAgICBPcmRlck1hbmFnZXIucGF5T3JkZXIocmVxdWVzdCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcblxuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuY3VycmVudC5jaGVja291dF90b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1JFQ0VJUFQ7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgT3JkZXIgcGF5bWVudCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gIC5za2lwRHVwbGljYXRlcygpXG4gIC5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgIGlmICghdmFsdWUudmFsdWUgfHwgdmFsdWUudmFsdWUoKSAhPT0gJHNjb3BlLlNURVBfU0lHTkFUVVJFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzZXRTaWduYXR1cmUoKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0c3BsaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0U3BsaXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnT3JkZXJNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIC8vU3BsaXQgdGhlIGN1cnJlbnQgb3JkZXIgaW4gdGhlIHNlbGVjdGVkIHdheVxuICAkc2NvcGUuc3BsaXRDaGVjayA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgaSwgZGF0YSA9IFtdO1xuXG4gICAgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9OT05FKSB7XG4gICAgICBkYXRhLnB1c2goe1xuICAgICAgICBpdGVtczogT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX0VWRU5MWSkge1xuICAgICAgdmFyIGNoZWNrID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2ssXG4gICAgICAgICAgc3VidG90YWwgPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShjaGVjayksXG4gICAgICAgICAgdGF4ID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRheChjaGVjayk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudDsgaSsrKSB7XG4gICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgc3VidG90YWw6IE1hdGgucm91bmQoKHN1YnRvdGFsIC8gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQpICogMTAwKSAvIDEwMCxcbiAgICAgICAgICB0YXg6IE1hdGgucm91bmQoKHRheCAvICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfQllfSVRFTVMpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudDsgaSsrKSB7XG4gICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjay5zbGljZSgwKS5tYXAoaXRlbSA9PiBpdGVtLmNsb25lKCkpO1xuICAgIH1cblxuICAgICRzY29wZS4kcGFyZW50LmRhdGEgPSBkYXRhO1xuICAgICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gdHlwZTtcbiAgfTtcblxuICAvL01vdmUgYW4gaXRlbSB0byB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUuYWRkVG9DaGVjayA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gJHNjb3BlLnNwbGl0X2l0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ICE9PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5xdWFudGl0eSA+IDEpIHtcbiAgICAgICAgaXRlbS5xdWFudGl0eS0tO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbSAhPSBudWxsOyB9KTtcblxuICAgIHZhciBleGlzdHMgPSBmYWxzZTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gJHNjb3BlLmN1cnJlbnQuaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgPT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5xdWFudGl0eSsrO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KTtcblxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB2YXIgY2xvbmUgPSBlbnRyeS5jbG9uZSgpO1xuICAgICAgY2xvbmUucXVhbnRpdHkgPSAxO1xuXG4gICAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5wdXNoKGNsb25lKTtcbiAgICB9XG4gIH07XG5cbiAgLy9SZW1vdmUgYW4gaXRlbSBmcm9tIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5yZW1vdmVGcm9tQ2hlY2sgPSBmdW5jdGlvbihlbnRyeSkge1xuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gJHNjb3BlLmN1cnJlbnQuaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgIT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLnF1YW50aXR5ID4gMSkge1xuICAgICAgICBpdGVtLnF1YW50aXR5LS07XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pXG4gICAgLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtICE9IG51bGw7IH0pO1xuXG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gJHNjb3BlLnNwbGl0X2l0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ID09PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIGV4aXN0cyA9IHRydWU7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHkrKztcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG5cbiAgICBpZiAoIWV4aXN0cykge1xuICAgICAgdmFyIGNsb25lID0gZW50cnkuY2xvbmUoKTtcbiAgICAgIGNsb25lLnF1YW50aXR5ID0gMTtcblxuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zLnB1c2goY2xvbmUpO1xuICAgIH1cbiAgfTtcblxuICAvL01vdmUgYWxsIGF2YWlsYWJsZSBpdGVtcyB0byB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUuYWRkQWxsVG9DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKCRzY29wZS5hZGRUb0NoZWNrKTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24obmV3aXRlbSkge1xuICAgICAgICBpZiAobmV3aXRlbS5yZXF1ZXN0ID09PSBpdGVtLnJlcXVlc3QpIHtcbiAgICAgICAgICBuZXdpdGVtLnF1YW50aXR5ICs9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gW107XG4gIH07XG5cbiAgLy9SZW1vdmUgYWxsIGl0ZW1zIGZyb20gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLnJlbW92ZUFsbEZyb21DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goJHNjb3BlLnJlbW92ZUZyb21DaGVjayk7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKG5ld2l0ZW0pIHtcbiAgICAgICAgaWYgKG5ld2l0ZW0ucmVxdWVzdCA9PT0gaXRlbS5yZXF1ZXN0KSB7XG4gICAgICAgICAgbmV3aXRlbS5xdWFudGl0eSArPSBpdGVtLnF1YW50aXR5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gW107XG4gIH07XG5cbiAgLy9Qcm9jZWVkIHdpdGggdGhlIG5leHQgY2hlY2sgc3BsaXR0aW5nXG4gICRzY29wZS5zcGxpdE5leHRDaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUub3B0aW9ucy5pbmRleCA8ICRzY29wZS5vcHRpb25zLmNvdW50IC0gMSAmJiAkc2NvcGUuc3BsaXRfaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuaW5kZXgrKztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJHNjb3BlLnNwbGl0X2l0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICRzY29wZS5hZGRBbGxUb0NoZWNrKCk7XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuJHBhcmVudC5kYXRhID0gJHNjb3BlLiRwYXJlbnQuZGF0YS5maWx0ZXIoZnVuY3Rpb24oY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIGNoZWNrLml0ZW1zLmxlbmd0aCA+IDA7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgLnNraXBEdXBsaWNhdGVzKClcbiAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUudmFsdWUgfHwgdmFsdWUudmFsdWUoKSAhPT0gJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkU7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHRpcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRUaXBDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnT3JkZXJNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgT3JkZXJNYW5hZ2VyKSB7XG5cbiAgLy9BZGQgYSB0aXBcbiAgJHNjb3BlLmFkZFRpcCA9IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICRzY29wZS5jdXJyZW50LnRpcCA9IE1hdGgucm91bmQoKCRzY29wZS5jdXJyZW50LnN1YnRvdGFsICogYW1vdW50KSAqIDEwMCkgLyAxMDA7XG4gIH07XG5cbiAgLy9BcHBseSB0aGUgc2VsZWN0ZWQgdGlwIGFtb3VudCBhbmQgcHJvY2VlZCBmdXJ0aGVyXG4gICRzY29wZS5hcHBseVRpcCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9QQVlNRU5UX01FVEhPRDtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvYm9vdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEJvb3QnLFxuICBbJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1hbmFnZXInLFxuICAoQXV0aGVudGljYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1hbmFnZXIpID0+IHtcblxuICBmdW5jdGlvbiBsb2FkTG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIExvY2F0aW9uTWFuYWdlci5sb2FkQ29uZmlnKClcbiAgICAgIC50aGVuKCgpID0+IExvY2F0aW9uTWFuYWdlci5sb2FkU2VhdHMoKSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEF1dGhlbnRpY2F0aW9uTWFuYWdlci52YWxpZGF0ZSgpLnRoZW4oYXV0aG9yaXplZCA9PiB7XG4gICAgICBpZiAoYXV0aG9yaXplZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIEF1dGhlbnRpY2F0aW9uTWFuYWdlci5hdXRob3JpemUoKS50aGVuKCgpID0+IGxvYWRMb2NhdGlvbigpKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxvYWRMb2NhdGlvbigpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9jdXN0b21lcmd1ZXN0bG9naW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRDdXN0b21lckd1ZXN0TG9naW4nLFxuICBbJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLFxuICAoQXV0aGVudGljYXRpb25NYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIpID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEN1c3RvbWVyTWFuYWdlci5ndWVzdExvZ2luKCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2N1c3RvbWVybG9naW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRDdXN0b21lckxvZ2luJyxcbiAgWydBdXRoZW50aWNhdGlvbk1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJyxcbiAgKEF1dGhlbnRpY2F0aW9uTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgcmV0dXJuIEF1dGhlbnRpY2F0aW9uTWFuYWdlci5jdXN0b21lckxvZ2luUmVndWxhcihjcmVkZW50aWFscykudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKGNyZWRlbnRpYWxzKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvY3VzdG9tZXJzaWdudXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRDdXN0b21lclNpZ251cCcsXG4gIFsnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsXG4gIChBdXRoZW50aWNhdGlvbk1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbihyZWdpc3RyYXRpb24pIHtcbiAgICByZXR1cm4gQ3VzdG9tZXJNYW5hZ2VyLnNpZ25VcChyZWdpc3RyYXRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGNyZWRlbnRpYWxzID0ge1xuICAgICAgICBsb2dpbjogcmVnaXN0cmF0aW9uLnVzZXJuYW1lLFxuICAgICAgICBwYXNzd29yZDogcmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQXV0aGVudGljYXRpb25NYW5hZ2VyLmN1c3RvbWVyTG9naW5SZWd1bGFyKGNyZWRlbnRpYWxzKS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIEN1c3RvbWVyTWFuYWdlci5sb2dpbihjcmVkZW50aWFscyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvY3VzdG9tZXJzb2NpYWxsb2dpbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4nLFxuICBbJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnU29jaWFsTWFuYWdlcicsXG4gIChBdXRoZW50aWNhdGlvbk1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgU29jaWFsTWFuYWdlcikgPT4ge1xuXG4gIGZ1bmN0aW9uIGRvTG9naW4oYXV0aCkge1xuICAgIHJldHVybiBBdXRoZW50aWNhdGlvbk1hbmFnZXIuY3VzdG9tZXJMb2dpblNvY2lhbChhdXRoKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBDdXN0b21lck1hbmFnZXIubG9naW5Tb2NpYWwoYXV0aCk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZhY2Vib29rOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBTb2NpYWxNYW5hZ2VyLmxvZ2luRmFjZWJvb2soKS50aGVuKGRvTG9naW4pO1xuICAgIH0sXG4gICAgZ29vZ2xlcGx1czogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gU29jaWFsTWFuYWdlci5sb2dpbkdvb2dsZVBsdXMoKS50aGVuKGRvTG9naW4pO1xuICAgIH0sXG4gICAgdHdpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gU29jaWFsTWFuYWdlci5sb2dpblR3aXR0ZXIoKS50aGVuKGRvTG9naW4pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvZmxpcHNjcmVlbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEZsaXBTY3JlZW4nLCBbJ01hbmFnZW1lbnRTZXJ2aWNlJywgZnVuY3Rpb24oTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJvdGF0ZVNjcmVlbigpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9yZXNldC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFJlc2V0JywgWydBbmFseXRpY3NNYW5hZ2VyJywgJ0NoYXRNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU2Vzc2lvbk1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsICdNYW5hZ2VtZW50U2VydmljZScsICdMb2dnZXInLCBmdW5jdGlvbihBbmFseXRpY3NNYW5hZ2VyLCBDaGF0TWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTdXJ2ZXlNYW5hZ2VyLCBNYW5hZ2VtZW50U2VydmljZSwgTG9nZ2VyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICAgIExvZ2dlci53YXJuKCdVbmFibGUgdG8gcmVzZXQgcHJvcGVybHk6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgTWFuYWdlbWVudFNlcnZpY2UucmVzZXQoKTtcbiAgICB9XG5cbiAgICBTZXNzaW9uTWFuYWdlci5lbmRTZXNzaW9uKCk7XG5cbiAgICBBbmFseXRpY3NNYW5hZ2VyLnN1Ym1pdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBPcmRlck1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTdXJ2ZXlNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBDdXN0b21lck1hbmFnZXIubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIENoYXRNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgTWFuYWdlbWVudFNlcnZpY2UucmVzZXQoKTtcbiAgICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICB9LCBmYWlsKTtcbiAgICAgIH0sIGZhaWwpO1xuICAgIH0sIGZhaWwpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9zdGFydHVwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kU3RhcnR1cCcsXG4gIFsnTG9nZ2VyJywgJ0FwcENhY2hlJywgJ0NoYXRNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsICdTTkFQTG9jYXRpb24nLFxuICAoTG9nZ2VyLCBBcHBDYWNoZSwgQ2hhdE1hbmFnZXIsIFNoZWxsTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFN1cnZleU1hbmFnZXIsIFNOQVBMb2NhdGlvbikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgcmVqZWN0KSA9PiB7XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWwoZSkge1xuICAgICAgICBMb2dnZXIud2FybihgVW5hYmxlIHRvIHN0YXJ0dXAgcHJvcGVybHk6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYWNoZUNvbXBsZXRlKHVwZGF0ZWQpIHtcbiAgICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIERhdGFNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoQXBwQ2FjaGUuaXNVcGRhdGVkKSB7XG4gICAgICAgIGNhY2hlQ29tcGxldGUodHJ1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKEFwcENhY2hlLmlzQ29tcGxldGUpIHtcbiAgICAgICAgY2FjaGVDb21wbGV0ZShmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIEFwcENhY2hlLmNvbXBsZXRlLmFkZChjYWNoZUNvbXBsZXRlKTtcblxuICAgICAgU2hlbGxNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQpIHtcbiAgICAgICAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzaWduaW4nIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBDdXN0b21lck1hbmFnZXIuZ3Vlc3RMb2dpbigpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0KCk7ICAgIFxuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9zdWJtaXRvcmRlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFN1Ym1pdE9yZGVyJyxcbiAgWydEaWFsb2dNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNYW5hZ2VyJyxcbiAgKERpYWxvZ01hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFMb2NhdGlvbk1vZGVsLnNlYXQgfHwgIUxvY2F0aW9uTW9kZWwuc2VhdC50b2tlbikge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9FUlJPUl9OT19TRUFUKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgMDtcblxuICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2RpYWxvZy5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignRGlhbG9nQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdEaWFsb2dNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgRGlhbG9nTWFuYWdlcikgPT4ge1xuXG4gIHZhciBhbGVydFN0YWNrID0gW10sXG4gICAgICBjb25maXJtU3RhY2sgPSBbXTtcbiAgdmFyIGFsZXJ0SW5kZXggPSAtMSxcbiAgICAgIGNvbmZpcm1JbmRleCA9IC0xO1xuICB2YXIgYWxlcnRUaW1lcjtcblxuICBmdW5jdGlvbiB1cGRhdGVWaXNpYmlsaXR5KGlzQnVzeSwgc2hvd0FsZXJ0LCBzaG93Q29uZmlybSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmlzQnVzeSA9IGlzQnVzeSAhPT0gdW5kZWZpbmVkID8gaXNCdXN5IDogJHNjb3BlLmlzQnVzeTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBzaG93QWxlcnQgIT09IHVuZGVmaW5lZCA/IHNob3dBbGVydCA6ICRzY29wZS5zaG93QWxlcnQ7XG4gICAgICAkc2NvcGUuc2hvd0NvbmZpcm0gPSBzaG93Q29uZmlybSAhPT0gdW5kZWZpbmVkID8gc2hvd0NvbmZpcm0gOiAkc2NvcGUuc2hvd0NvbmZpcm07XG4gICAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5pc0J1c3kgfHwgJHNjb3BlLnNob3dBbGVydCB8fCAkc2NvcGUuc2hvd0NvbmZpcm07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TmV4dEFsZXJ0KCkge1xuICAgIGlmIChhbGVydFRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwoYWxlcnRUaW1lcik7XG4gICAgfVxuXG4gICAgdmFyIGFsZXJ0ID0gYWxlcnRTdGFja1thbGVydEluZGV4XTtcblxuICAgIGlmIChhbGVydCAmJiBhbGVydC5yZXNvbHZlKSB7XG4gICAgICBhbGVydC5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgYWxlcnRJbmRleCsrO1xuXG4gICAgaWYgKGFsZXJ0SW5kZXggPT09IGFsZXJ0U3RhY2subGVuZ3RoKSB7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgYWxlcnRTdGFjayA9IFtdO1xuICAgICAgYWxlcnRJbmRleCA9IC0xO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmFsZXJ0VGl0bGUgPSBhbGVydFN0YWNrW2FsZXJ0SW5kZXhdLnRpdGxlO1xuICAgICAgJHNjb3BlLmFsZXJ0VGV4dCA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF0ubWVzc2FnZTtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIGFsZXJ0VGltZXIgPSAkdGltZW91dChzaG93TmV4dEFsZXJ0LCAxMDAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TmV4dENvbmZpcm0oKSB7XG4gICAgY29uZmlybUluZGV4Kys7XG5cbiAgICBpZiAoY29uZmlybUluZGV4ID09PSBjb25maXJtU3RhY2subGVuZ3RoKSB7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICBjb25maXJtU3RhY2sgPSBbXTtcbiAgICAgIGNvbmZpcm1JbmRleCA9IC0xO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmNvbmZpcm1UZXh0ID0gY29uZmlybVN0YWNrW2NvbmZpcm1JbmRleF0ubWVzc2FnZTtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgICAgIGNhc2UgQUxFUlRfR0VORVJJQ19FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9vcHMhIE15IGJpdHMgYXJlIGZpZGRsZWQuIE91ciByZXF1ZXN0IHN5c3RlbSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuIFBsZWFzZSBub3RpZnkgYSBzZXJ2ZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT29wcyEgTXkgYml0cyBhcmUgZmlkZGxlZC4gT3VyIHJlcXVlc3Qgc3lzdGVtIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC4gUGxlYXNlIG5vdGlmeSBhIHNlcnZlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJDYWxsIFNlcnZlciByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciByZXF1ZXN0IGZvciBzZXJ2ZXIgYXNzaXN0YW5jZSBoYXMgYmVlbiBzZWVuLCBhbmQgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlJlcXVlc3QgY2hlY2sgcmVxdWVzdCB3YXMgc2VudCBzdWNjZXNzZnVsbHkuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIGNoZWNrIHJlcXVlc3QgaGFzIGJlZW4gc2VlbiwgYW5kIGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPcmRlciBzZW50ISBZb3Ugd2lsbCBiZSBub3RpZmllZCB3aGVuIHlvdXIgd2FpdGVyIGFjY2VwdHMgdGhlIG9yZGVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciBvcmRlciBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1NJR05JTl9SRVFVSVJFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdSBtdXN0IGJlIGxvZ2dlZCBpbnRvIFNOQVAgdG8gYWNjZXNzIHRoaXMgcGFnZS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfQVNTSVNUQU5DRTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjYWxsIHRoZSB3YWl0ZXI/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX0NMT1NFT1VUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlcXVlc3QgeW91ciBjaGVjaz9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfUkVTRVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQ/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0RFTEVUX0NBUkQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlIHRoaXMgcGF5bWVudCBtZXRob2Q/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQSBsaW5rIHRvIGNoYW5nZSB5b3VyIHBhc3N3b3JkIGhhcyBiZWVuIGVtYWlsZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1NPRlRXQVJFX09VVERBVEVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQSBzb2Z0d2FyZSB1cGRhdGUgaXMgYXZhaWxhYmxlLiBQbGVhc2UgcmVzdGFydCB0aGUgYXBwbGljYXRpb24uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0NBUkRSRUFERVJfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJVbmFibGUgdG8gcmVhZCB0aGUgY2FyZCBkYXRhLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9FUlJPUl9OT19TRUFUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiRGV2aWNlIGlzIG5vdCBhc3NpZ25lZCB0byBhbnkgdGFibGUuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0VSUk9SX1NUQVJUVVA6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJVbmFibGUgdG8gc3RhcnQgdGhlIGFwcGxpY2F0aW9uLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cblxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuICAkc2NvcGUuaXNCdXN5ID0gZmFsc2U7XG4gICRzY29wZS5zaG93QWxlcnQgPSBmYWxzZTtcbiAgJHNjb3BlLnNob3dDb25maXJtID0gZmFsc2U7XG5cbiAgJHNjb3BlLmNsb3NlQWxlcnQgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBzaG93TmV4dEFsZXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ29uZmlybSA9IGNvbmZpcm1lZCA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIHZhciBjb25maXJtID0gY29uZmlybVN0YWNrW2NvbmZpcm1JbmRleF07XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICBpZiAoY29uZmlybS5yZXNvbHZlKSB7XG4gICAgICAgICAgY29uZmlybS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY29uZmlybS5yZWplY3QpIHtcbiAgICAgICAgICBjb25maXJtLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2hvd05leHRDb25maXJtKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gYWxlcnRSZXF1ZXN0ZWQobWVzc2FnZSwgdGl0bGUsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgYWxlcnRTdGFjay5wdXNoKHsgdGl0bGU6IHRpdGxlLCBtZXNzYWdlOiBtZXNzYWdlLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dBbGVydCkge1xuICAgICAgJHRpbWVvdXQoc2hvd05leHRBbGVydCk7XG4gICAgfVxuICB9XG5cbiAgRGlhbG9nTWFuYWdlci5hbGVydFJlcXVlc3RlZC5hZGQoYWxlcnRSZXF1ZXN0ZWQpO1xuXG4gIGZ1bmN0aW9uIGNvbmZpcm1SZXF1ZXN0ZWQobWVzc2FnZSwgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgbWVzc2FnZSA9IGdldE1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICBjb25maXJtU3RhY2sucHVzaCh7IG1lc3NhZ2U6IG1lc3NhZ2UsIHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0IH0pO1xuXG4gICAgaWYgKCEkc2NvcGUuc2hvd0NvbmZpcm0pIHtcbiAgICAgICR0aW1lb3V0KHNob3dOZXh0Q29uZmlybSk7XG4gICAgfVxuICB9XG5cbiAgRGlhbG9nTWFuYWdlci5jb25maXJtUmVxdWVzdGVkLmFkZChjb25maXJtUmVxdWVzdGVkKTtcblxuICBmdW5jdGlvbiBqb2JTdGFydGVkKCkge1xuICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgIH1cblxuICAgIHVwZGF0ZVZpc2liaWxpdHkodHJ1ZSk7XG4gIH1cblxuICBEaWFsb2dNYW5hZ2VyLmpvYlN0YXJ0ZWQuYWRkKGpvYlN0YXJ0ZWQpO1xuICBEaWFsb2dNYW5hZ2VyLmpvYkVuZGVkLmFkZChmdW5jdGlvbigpIHtcbiAgICB1cGRhdGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgfSk7XG5cbiAgaWYgKERpYWxvZ01hbmFnZXIuam9icyA+IDApIHtcbiAgICBqb2JTdGFydGVkKCk7XG4gIH1cbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvYWR2ZXJ0aXNlbWVudC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNBZHZlcnRpc2VtZW50Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdBbmFseXRpY3NNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1NoZWxsTWFuYWdlcicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEFuYWx5dGljc01vZGVsLCBoZWxsTWFuYWdlciwgRGF0YU1hbmFnZXIsIERhdGFQcm92aWRlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIENvbW1hbmRSZXNldCwgQ29tbWFuZEZsaXBTY3JlZW4sIFNoZWxsTWFuYWdlciwgV2ViQnJvd3NlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudENsaWNrID0gaXRlbSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgdHlwZTogJ2NsaWNrJ1xuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0uaHJlZikge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICd1cmwnLCB1cmw6IGl0ZW0uaHJlZi51cmwgfTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgJHNjb3BlLnZpc2libGUpIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgICAgdHlwZTogJ2ltcHJlc3Npb24nXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gW107XG5cbiAgRGF0YVByb3ZpZGVyLmFkdmVydGlzZW1lbnRzKCkudGhlbihkYXRhID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBkYXRhLm1haW5cbiAgICAgICAgLm1hcChhZCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGFkLnNyYywgOTcwLCA5MCksXG4gICAgICAgICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvY2FydC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdHYWxheGllc0NhcnRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJHNjZScsICdDdXN0b21lck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ0NoYXRNYW5hZ2VyJyxcbiAgICAoJHNjb3BlLCAkdGltZW91dCwgJHNjZSwgQ3VzdG9tZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIENhcnRNb2RlbCwgTG9jYXRpb25Nb2RlbCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICAgICAgJHNjb3BlLlNUQVRFX0NBUlQgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcbiAgICAgICRzY29wZS5TVEFURV9ISVNUT1JZID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG5cbiAgICAgICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICAgICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuICAgICAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcblxuICAgICAgJHNjb3BlLmN1cnJlbmN5ID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmN1cnJlbmN5O1xuICAgICAgU2hlbGxNYW5hZ2VyLm1vZGVsLmN1cnJlbmN5Q2hhbmdlZC5hZGQoY3VycmVuY3kgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1cnJlbmN5ID0gY3VycmVuY3kpKTtcblxuICAgICAgJHNjb3BlLnN0YXRlID0gQ2FydE1vZGVsLmNhcnRTdGF0ZTtcbiAgICAgIENhcnRNb2RlbC5jYXJ0U3RhdGVDaGFuZ2VkLmFkZChzdGF0ZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RhdGUgPSBzdGF0ZSkpO1xuXG4gICAgICAkc2NvcGUuZWRpdGFibGVJdGVtID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbTtcbiAgICAgIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChpdGVtID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5lZGl0YWJsZUl0ZW0gPSBpdGVtKSk7XG5cbiAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSB2YWx1ZSk7XG5cbiAgICAgICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja0NoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuXG4gICAgICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICAgICAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuY2hlY2tvdXRFbmFibGVkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgICAgICRzY29wZS52aXNpYmxlID0gQ2FydE1vZGVsLmlzQ2FydE9wZW47XG5cbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgICAgICRzY29wZS5zaG93Q2FydCgpO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgP1xuICAgICAgICBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6XG4gICAgICAgICdUYWJsZSc7XG5cbiAgICAgIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4gJHNjb3BlLnNlYXRfbmFtZSA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnKTtcblxuICAgICAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gICAgICB9O1xuICAgICAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hDbG9zZW91dFJlcXVlc3QpO1xuXG4gICAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QgPT0gbnVsbDtcbiAgICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG5cbiAgICAgICRzY29wZS5nZXRNb2RpZmllcnMgPSBlbnRyeSA9PiB7XG4gICAgICAgIGlmICghZW50cnkubW9kaWZpZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKHJlc3VsdCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICBsZXQgbW9kaWZpZXJzID0gY2F0ZWdvcnkubW9kaWZpZXJzLmZpbHRlcihtb2RpZmllciA9PiBtb2RpZmllci5pc1NlbGVjdGVkKTtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KG1vZGlmaWVycyk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSwgW10pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgICAgICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAgICAgJHNjb3BlLmVkaXRJdGVtID0gZW50cnkgPT4gQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIGZhbHNlKTtcblxuICAgICAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IChjYXRlZ29yeSwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgaWYgKGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgbSA9PiBtLmlzU2VsZWN0ZWQgPSAobSA9PT0gbW9kaWZpZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllci5pc1NlbGVjdGVkID0gIW1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yZW1vdmVGcm9tQ2FydCA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIucmVtb3ZlRnJvbUNhcnQoZW50cnkpO1xuICAgICAgJHNjb3BlLnJlb3JkZXJJdGVtID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkuY2xvbmUoKSk7XG5cbiAgICAgICRzY29wZS5zdWJtaXRDYXJ0ID0gKCkgPT4ge1xuICAgICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gJHNjb3BlLm9wdGlvbnMudG9HbyA/IDIgOiAwO1xuXG4gICAgICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgICAgICAgJHNjb3BlLm9wdGlvbnMudG9HbyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJDYXJ0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy50b0dvID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuY2xlYXJDYXJ0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2xvc2VFZGl0b3IgPSAoKSA9PiB7XG4gICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsb3NlQ2FydCA9ICgpID0+IHtcbiAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAgICAgQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2hvd0hpc3RvcnkgPSAoKSA9PiBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcbiAgICAgICRzY29wZS5zaG93Q2FydCA9ICgpID0+IENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuXG4gICAgICAkc2NvcGUucGF5Q2hlY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoZWNrb3V0JyB9O1xuXG4gICAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2NhdGVnb3J5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0NhdGVnb3J5Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gICRzY29wZS5nb0JhY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICB2YXIgQ2F0ZWdvcnlMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDQ3MCwgNDEwKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLXJlZ3VsYXInLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZCA/ICd1cmwoXCInICsgYmFja2dyb3VuZCArICdcIiknIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCB2YWx1ZSwgaSkgPT4ge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmNhdGVnb3J5Q2hhbmdlZC5hZGQoY2F0ZWdvcnkgPT4ge1xuICAgIGlmICghY2F0ZWdvcnkpIHtcbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2F0ZWdvcnkgPSBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgaXRlbXMgPSBjYXRlZ29yeS5pdGVtcyB8fCBbXSxcbiAgICAgICAgY2F0ZWdvcmllcyA9IGNhdGVnb3J5LmNhdGVnb3JpZXMgfHwgW107XG5cbiAgICB2YXIgdGlsZXMgPSBjYXRlZ29yaWVzLmNvbmNhdChpdGVtcykubWFwKGl0ZW0gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXG4gICAgICAgIGltYWdlOiBpdGVtLmltYWdlLFxuICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoaXRlbS5kZXN0aW5hdGlvbiksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBpdGVtLmRlc3RpbmF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYXRlZ29yeUxpc3QsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2UtY2F0ZWdvcnktY29udGVudCcpXG4gICAgKTtcblxuICAgICRzY29wZS5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJykge1xuICAgICAgJHNjb3BlLnNob3dNb2RhbCA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLnNob3dNb2RhbCA9IGZhbHNlO1xuXG4gICAgRGF0YU1hbmFnZXIuY2F0ZWdvcnkgPSBsb2NhdGlvbi50eXBlID09PSAnY2F0ZWdvcnknID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmNhdGVnb3J5KTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaG9tZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNIb21lQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQTG9jYXRpb24nLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIFNOQVBMb2NhdGlvbikgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHJvd3MgPSBbXSxcbiAgICAgICAgICBob21lID0gdGhpcy5wcm9wcy5ob21lO1xuXG4gICAgICBpZiAoQm9vbGVhbihob21lLmludHJvKSkge1xuICAgICAgICByb3dzLnB1c2goUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtaW5mbycsXG4gICAgICAgICAga2V5OiAnaW50cm8nXG4gICAgICAgIH0sIFJlYWN0LkRPTS5kaXYoe30sIFtcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMSh7IGtleTogJ2ludHJvLXRpdGxlJyB9LFxuICAgICAgICAgICAgICBob21lLmludHJvLnRpdGxlIHx8IGBXZWxjb21lIHRvICR7U05BUExvY2F0aW9uLmxvY2F0aW9uX25hbWV9YFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHsga2V5OiAnaW50cm8tdGV4dCcgfSxcbiAgICAgICAgICAgICAgaG9tZS5pbnRyby50ZXh0XG4gICAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGlsZXMgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJvd3MgPSByb3dzLmNvbmNhdCh0aWxlcylcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUpID0+IHtcbiAgICAgICAgcmVzdWx0WzBdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdXSlcbiAgICAgIC5tYXAoKHJvdywgaSkgPT4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdykpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGlsZS10YWJsZSdcbiAgICAgIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuaG9tZUNoYW5nZWQuYWRkKGhvbWUgPT4ge1xuICAgIGlmICghaG9tZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IGhvbWUubWVudXNcbiAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgaW1hZ2U6IG1lbnUuaW1hZ2UsXG4gICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSG9tZU1lbnUsIHsgdGlsZXM6IHRpbGVzLCBob21lOiBob21lIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2UtaG9tZS1tZW51JylcbiAgICApO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaG9tZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuaG9tZSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2l0ZW0uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSXRlbUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ1dlYkJyb3dzZXInLCAnQ29tbWFuZFN1Ym1pdE9yZGVyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIENvbW1hbmRTdWJtaXRPcmRlcikgPT4ge1xuXG4gICRzY29wZS5nb0JhY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICBEYXRhTWFuYWdlci5pdGVtQ2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG5cbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9ICRzY29wZS5lbnRyaWVzID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLnR5cGUgPSAxO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDA7XG4gICAgICAgICRzY29wZS5lbnRyeUluZGV4ID0gMDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gaXRlbS50eXBlO1xuXG4gICAgaWYgKHR5cGUgPT09IDIgJiYgaXRlbS53ZWJzaXRlKSB7XG4gICAgICBXZWJCcm93c2VyLm9wZW4oaXRlbS53ZWJzaXRlLnVybCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDMgJiYgaXRlbS5mbGFzaCkge1xuICAgICAgbGV0IGZsYXNoVXJsID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0uZmxhc2gubWVkaWEsIDAsIDAsICdzd2YnKSxcbiAgICAgICAgICB1cmwgPSAnL2ZsYXNoI3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZsYXNoVXJsKSArXG4gICAgICAgICAgICAgICAgJyZ3aWR0aD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0uZmxhc2gud2lkdGgpICtcbiAgICAgICAgICAgICAgICAnJmhlaWdodD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0uZmxhc2guaGVpZ2h0KTtcblxuICAgICAgV2ViQnJvd3Nlci5vcGVuKFNoZWxsTWFuYWdlci5nZXRBcHBVcmwodXJsKSk7XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgJHNjb3BlLmVudHJ5ID0gbmV3IGFwcC5DYXJ0SXRlbShpdGVtLCAxKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnR5cGUgPSB0eXBlO1xuICAgICAgJHNjb3BlLnN0ZXAgPSAwO1xuICAgICAgJHNjb3BlLmVudHJ5SW5kZXggPSAwO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHcsIGgsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3LCBoLCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiB2YWx1ZSA/IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSkgOiAwO1xuXG4gICRzY29wZS5uZXh0U3RlcCA9ICgpID0+IHtcbiAgICBpZiAoJHNjb3BlLnN0ZXAgPT09IDApIHtcbiAgICAgIGlmICgkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAgICRzY29wZS5lbnRyaWVzID0gJHNjb3BlLmVudHJ5LmNsb25lTWFueSgpO1xuICAgICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbJHNjb3BlLmVudHJ5SW5kZXggPSAwXTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAxO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoJHNjb3BlLmVudHJ5KTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAyO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgkc2NvcGUuc3RlcCA9PT0gMSkge1xuICAgICAgaWYgKCRzY29wZS5lbnRyeUluZGV4ID09PSAkc2NvcGUuZW50cmllcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICRzY29wZS5lbnRyaWVzLmZvckVhY2goZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChlbnRyeSkpO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWysrJHNjb3BlLmVudHJ5SW5kZXhdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkc2NvcGUucHJldmlvdXNTdGVwID0gKCkgPT4ge1xuICAgIGlmICgkc2NvcGUuc3RlcCA9PT0gMSAmJiAkc2NvcGUuZW50cnlJbmRleCA+IDApIHtcbiAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1stLSRzY29wZS5lbnRyeUluZGV4XTtcbiAgICB9XG4gICAgZWxzZSBpZiAoJHNjb3BlLnN0ZXAgPT09IDApIHtcbiAgICAgICRzY29wZS5nb0JhY2soKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkc2NvcGUuc3RlcC0tO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gKGNhdGVnb3J5LCBtb2RpZmllcikgPT4ge1xuICAgIGlmIChjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgbSA9PiBtLmlzU2VsZWN0ZWQgPSAobSA9PT0gbW9kaWZpZXIpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBtb2RpZmllci5pc1NlbGVjdGVkID0gIW1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zdWJtaXRPcmRlciA9ICgpID0+IHtcbiAgICBDb21tYW5kU3VibWl0T3JkZXIoKTtcbiAgICAkc2NvcGUuZ29CYWNrKCk7XG4gIH07XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLml0ZW0gPSBsb2NhdGlvbi50eXBlID09PSAnaXRlbScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuaXRlbSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2l0ZW1lZGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSXRlbUVkaXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnQ29tbWFuZFN1Ym1pdE9yZGVyJyxcbiAgICAoJHNjb3BlLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENhcnRNb2RlbCwgQ29tbWFuZFN1Ym1pdE9yZGVyKSA9PiB7XG5cbiAgICAgICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICAgICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuXG4gICAgICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG5cbiAgICAgIHZhciByZWZyZXNoTmF2aWdhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJHNjb3BlLmVudHJ5ICYmICRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICAgICAkc2NvcGUuaGFzTmV4dENhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggPiAxICYmXG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPCAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgJHNjb3BlLmhhc1ByZXZpb3VzQ2F0ZWdvcnkgPSBjdXJyZW50SW5kZXggPiAwO1xuICAgICAgICAgICRzY29wZS5jYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XTtcbiAgICAgICAgICAkc2NvcGUuY2FuRXhpdCA9IENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXc7XG4gICAgICAgICAgJHNjb3BlLmNhbkRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgICAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ21lbnUnICYmIGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIGluaXQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSB2YWx1ZTtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSAkc2NvcGUuZW50cnkgIT0gbnVsbDtcblxuICAgICAgICBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICBpbml0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuXG4gICAgICBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaW5pdCh2YWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmdldE1vZGlmaWVyVGl0bGUgPSBmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICByZXR1cm4gbW9kaWZpZXIuZGF0YS50aXRsZSArIChtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAgICAgICAnICgrJyArIFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZShtb2RpZmllci5kYXRhLnByaWNlKSArICcpJyA6XG4gICAgICAgICAgICAgICcnXG4gICAgICAgICAgKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5sZWZ0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gKGN1cnJlbnRJbmRleCA+IDApID8gKCRzY29wZS5wcmV2aW91c0NhdGVnb3J5KCkpIDogJHNjb3BlLmV4aXQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5sZWZ0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoY3VycmVudEluZGV4ID4gMCkgPyAnQmFjaycgOiAnRXhpdCc7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2hvd0xlZnRCdXR0b24gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKGN1cnJlbnRJbmRleCA+IDApO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJpZ2h0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgICAgICAvL01ha2Ugc3VyZSBQaWNrIDEgbW9kaWZpZXIgY2F0ZWdvcmllcyBoYXZlIG1ldCB0aGUgc2VsZWN0aW9uIGNvbmRpdGlvbi5cbiAgICAgICAgaWYoJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgdmFyIG51bVNlbGVjdGVkID0gMDtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgaWYgKG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICBudW1TZWxlY3RlZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYobnVtU2VsZWN0ZWQgIT09IDEpIHtcbiAgICAgICAgICAgIC8vVE9ETzogQWRkIG1vZGFsIHBvcHVwLiBNdXN0IG1ha2UgMSBzZWxlY3Rpb24hXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICRzY29wZS5uZXh0Q2F0ZWdvcnkoKSA6ICRzY29wZS5kb25lKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmlnaHRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICdOZXh0JyA6ICdEb25lJztcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zaG93UmlnaHRCdXR0b24gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3VycmVudEluZGV4LS07XG4gICAgICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubmV4dENhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCsrO1xuICAgICAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBtb2RpZmllcikge1xuICAgICAgICBtb2RpZmllci5pc1NlbGVjdGVkID0gIW1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG5cbiAgICAgICAgaWYgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgJiYgY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBtLmlzU2VsZWN0ZWQgPSBtID09PSBtb2RpZmllcjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdENoYW5nZXMgPSBmdW5jdGlvbigpe1xuICAgICAgICBPcmRlck1hbmFnZXIucmVtb3ZlRnJvbUNhcnQoJHNjb3BlLmVudHJ5KTtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmRvbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXcpIHtcbiAgICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgQ2FydE1vZGVsLmNsb3NlRWRpdG9yKCk7XG4gICAgICB9O1xuICAgIH1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvbWVudS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNNZW51Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gICRzY29wZS5nb0JhY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICB2YXIgTWVudUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgdmFyIGJhY2tncm91bmQgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgNDcwLCA0MTApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtcmVndWxhcicsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kID8gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKScgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pXG4gICAgICAucmVkdWNlKChyZXN1bHQsIHZhbHVlLCBpKSA9PiB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoKHJvdywgaSkgPT4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdykpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGlsZS10YWJsZSdcbiAgICAgIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIubWVudUNoYW5nZWQuYWRkKG1lbnUgPT4ge1xuICAgIGlmICghbWVudSkge1xuICAgICAgcmV0dXJuICR0aW1lb3V0KCgpID0+ICRzY29wZS5tZW51ID0gbnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIHRpbGVzID0gbWVudS5jYXRlZ29yaWVzXG4gICAgICAubWFwKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICAgIHR5cGU6ICdjYXRlZ29yeScsXG4gICAgICAgICAgdG9rZW46IGNhdGVnb3J5LnRva2VuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0aXRsZTogY2F0ZWdvcnkudGl0bGUsXG4gICAgICAgICAgaW1hZ2U6IGNhdGVnb3J5LmltYWdlLFxuICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTWVudUxpc3QsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2UtbWVudS1jb250ZW50JylcbiAgICApO1xuXG4gICAgJHNjb3BlLm1lbnUgPSBtZW51O1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5tZW51ID0gbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLm1lbnUpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9uYXZpZ2F0aW9uLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc05hdmlnYXRpb25DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ0N1c3RvbWVyTWFuYWdlcicsICdBbmFseXRpY3NNb2RlbCcsICdDYXJ0TW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnTWFuYWdlbWVudFNlcnZpY2UnLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kU3VibWl0T3JkZXInLCAnQ29tbWFuZEZsaXBTY3JlZW4nLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBDdXN0b21lck1hbmFnZXIsIEFuYWx5dGljc01vZGVsLCBDYXJ0TW9kZWwsIFNoZWxsTWFuYWdlciwgRGF0YU1hbmFnZXIsIERhdGFQcm92aWRlciwgRGlhbG9nTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENvbW1hbmRSZXNldCwgQ29tbWFuZFN1Ym1pdE9yZGVyLCBDb21tYW5kRmxpcFNjcmVlbiwgV2ViQnJvd3NlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG5cbiAgJHNjb3BlLm1lbnVzID0gW107XG5cbiAgRGF0YVByb3ZpZGVyLmhvbWUoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxvY2F0aW9uID0gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24sXG4gICAgICAgIGxpbWl0ID0gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgPyA0IDogMztcblxuICAgICRzY29wZS5tZW51cyA9IHJlc3BvbnNlLm1lbnVzXG4gICAgICAuZmlsdGVyKG1lbnUgPT4gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgbWVudS50eXBlICE9PSAzKVxuICAgICAgLmZpbHRlcigobWVudSwgaSkgPT4gaSA8IGxpbWl0KVxuICAgICAgLm1hcChtZW51ID0+IHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuLFxuICAgICAgICAgIHRpdGxlOiBtZW51LnRpdGxlLFxuICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uLFxuICAgICAgICAgIHNlbGVjdGVkOiBsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW5cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudENsaWNrID0gaXRlbSA9PiB7XG4gICAgaWYgKGl0ZW0uaHJlZikge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICd1cmwnLCB1cmw6IGl0ZW0uaHJlZi51cmwgfTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgICRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudCA9IGl0ZW07XG5cbiAgICBpZiAoQWN0aXZpdHlNb25pdG9yLmFjdGl2ZSAmJiAkc2NvcGUubWVudU9wZW4pIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgICAgdHlwZTogJ2ltcHJlc3Npb24nXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gW107XG5cbiAgRGF0YVByb3ZpZGVyLmFkdmVydGlzZW1lbnRzKCkudGhlbihkYXRhID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBkYXRhLm1pc2NcbiAgICAgICAgLm1hcChhZCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGFkLnNyYywgMzAwLCAyNTApLFxuICAgICAgICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgICAgICAgIHRva2VuOiBhZC50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUubmF2aWdhdGVIb21lID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgfTtcblxuICAkc2NvcGUubmF2aWdhdGVCYWNrID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuICB9O1xuXG4gICRzY29wZS5yb3RhdGVTY3JlZW4gPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgQ29tbWFuZEZsaXBTY3JlZW4oKTtcbiAgfTtcblxuICAkc2NvcGUub3BlbkNhcnQgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSAhQ2FydE1vZGVsLmlzQ2FydE9wZW47XG4gIH07XG5cbiAgJHNjb3BlLnNlYXROYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID8gTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOiAnVGFibGUnO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc2VhdE5hbWUgPSB2YWx1ZSA/IHZhbHVlLm5hbWUgOiAnVGFibGUnKSk7XG5cbiAgJHNjb3BlLnJlc2V0VGFibGUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5tZW51T3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVNZW51ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLm1lbnVPcGVuID0gISRzY29wZS5tZW51T3BlbjtcblxuICAgIGlmICgkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQgJiYgJHNjb3BlLm1lbnVPcGVuKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46ICRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudC50b2tlbixcbiAgICAgICAgdHlwZTogJ2ltcHJlc3Npb24nXG4gICAgICB9KTtcbiAgICAgICRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudCA9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAkc2NvcGUudG9nZ2xlU2V0dGluZ3MgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gISRzY29wZS5zZXR0aW5nc09wZW47XG4gIH07XG5cbiAgJHNjb3BlLmVsZW1lbnRzID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmVsZW1lbnRzID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuY2FydENvdW50ID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGg7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZChjYXJ0ID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2FydENvdW50ID0gY2FydC5sZW5ndGgpO1xuICB9KTtcblxuICAkc2NvcGUuY2hlY2tvdXRFbmFibGVkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcblxuICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCk7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuXG4gICRzY29wZS5zdWJtaXRPcmRlciA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIENvbW1hbmRTdWJtaXRPcmRlcigpO1xuICB9O1xuXG4gICRzY29wZS52aWV3T3JkZXIgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLnBheUJpbGwgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNldHRpbmdzID0ge1xuICAgIGRpc3BsYXlCcmlnaHRuZXNzOiAxMDAsXG4gICAgc291bmRWb2x1bWU6IDEwMFxuICB9O1xuXG4gICRzY29wZS4kd2F0Y2goJ3NldHRpbmdzLnNvdW5kVm9sdW1lJywgKHZhbHVlLCBvbGQpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uuc2V0U291bmRWb2x1bWUodmFsdWUpO1xuICB9KTtcbiAgTWFuYWdlbWVudFNlcnZpY2UuZ2V0U291bmRWb2x1bWUoKS50aGVuKFxuICAgIHJlc3BvbnNlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZXR0aW5ncy5zb3VuZFZvbHVtZSA9IHJlc3BvbnNlLnZvbHVtZSksXG4gICAgZSA9PiB7IH1cbiAgKTtcblxuICAkc2NvcGUuJHdhdGNoKCdzZXR0aW5ncy5kaXNwbGF5QnJpZ2h0bmVzcycsICh2YWx1ZSwgb2xkKSA9PiB7XG4gICAgaWYgKHZhbHVlID09PSBvbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnNldERpc3BsYXlCcmlnaHRuZXNzKHZhbHVlKTtcbiAgfSk7XG4gIE1hbmFnZW1lbnRTZXJ2aWNlLmdldERpc3BsYXlCcmlnaHRuZXNzKCkudGhlbihcbiAgICByZXNwb25zZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc2V0dGluZ3MuZGlzcGxheUJyaWdodG5lc3MgPSByZXNwb25zZS5icmlnaHRuZXNzKSxcbiAgICBlID0+IHsgfVxuICApO1xuXG4gICRzY29wZS5uYXZpZ2F0ZSA9IGRlc3RpbmF0aW9uID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgICRzY29wZS52aXNpYmxlID0gbG9jYXRpb24udHlwZSAhPT0gJ3NpZ25pbic7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2l0ZW0nKSB7XG4gICAgICAgICRzY29wZS5tZW51cy5mb3JFYWNoKG1lbnUgPT4ge1xuICAgICAgICAgIG1lbnUuc2VsZWN0ZWQgPSAobG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5tZW51T3BlbiA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIH0pO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaG9tZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSG9tZUJhc2VDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0hvbWVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ2hhdE1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ1NoZWxsTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdTdXJ2ZXlNYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsICdTTkFQRW52aXJvbm1lbnQnLCAnQ29tbWFuZFJlc2V0JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIFNoZWxsTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTdXJ2ZXlNYW5hZ2VyLCBTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgQ29tbWFuZFJlc2V0KSA9PiB7XG5cbiAgdmFyIEhvbWVNZW51ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gWyBSZWFjdC5ET00udGQoeyBrZXk6IC0xIH0pIF07XG5cbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnaG9tZS1tZW51LWl0ZW0nLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtcbiAgICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMTYwLCAxNjApXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyb3dzKTtcbiAgICAgIHJlc3VsdC5wdXNoKFJlYWN0LkRPTS50ZCh7IGtleTogcmVzdWx0Lmxlbmd0aCB9KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUobnVsbCwgcmVzdWx0KTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgcmVzcG9uc2UubWVudXNcbiAgICAuZmlsdGVyKG1lbnUgPT4gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgbWVudS50eXBlICE9PSAzKVxuICAgIC5yZWR1Y2UoKHRpbGVzLCBtZW51KSA9PiB7XG4gICAgICBpZiAobWVudS5wcm9tb3MgJiYgbWVudS5wcm9tb3MubGVuZ3RoID4gMCkge1xuICAgICAgICBtZW51LnByb21vc1xuICAgICAgICAuZmlsdGVyKHByb21vID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IHByb21vLnR5cGUgIT09IDMpXG4gICAgICAgIC5mb3JFYWNoKHByb21vID0+IHtcbiAgICAgICAgICB0aWxlcy5wdXNoKHtcbiAgICAgICAgICAgIHRpdGxlOiBwcm9tby50aXRsZSxcbiAgICAgICAgICAgIGltYWdlOiBwcm9tby5pbWFnZSxcbiAgICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChwcm9tby5kZXN0aW5hdGlvbiksXG4gICAgICAgICAgICBkZXN0aW5hdGlvbjogcHJvbW8uZGVzdGluYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIHRpbGVzLnB1c2goe1xuICAgICAgICAgIHRpdGxlOiBtZW51LnRpdGxlLFxuICAgICAgICAgIGltYWdlOiBtZW51LmltYWdlLFxuICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfSwgdGlsZXMpO1xuXG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVNZW51LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hvbWUtbWVudS1tYWluJylcbiAgICAgICk7XG4gICAgfSwgMTAwMCk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkdGltZW91dCgoKSA9PiB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5wcmVsb2FkID0gZGVzdGluYXRpb24gPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG4gIH07XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLnByZWRpY2F0ZUV2ZW4gPSBTaGVsbE1hbmFnZXIucHJlZGljYXRlRXZlbjtcbiAgJHNjb3BlLnByZWRpY2F0ZU9kZCA9IFNoZWxsTWFuYWdlci5wcmVkaWNhdGVPZGQ7XG5cbiAgJHNjb3BlLnNlYXRfbmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5zZWF0X25hbWUgPSB2YWx1ZSA/IHZhbHVlLm5hbWUgOiAnVGFibGUnO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuY3VzdG9tZXJfbmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lcl9uYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpO1xuICB9O1xuICB2YXIgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCk7XG4gIH07XG4gIHZhciByZWZyZXNoU3VydmV5ID0gKCkgPT4ge1xuICAgICRzY29wZS5zdXJ2ZXlBdmFpbGFibGUgPSBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5ICYmICFTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGU7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcbiAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNoYW5nZWQuYWRkKHJlZnJlc2hTdXJ2ZXkpO1xuICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLnN1cnZleUNvbXBsZXRlZC5hZGQocmVmcmVzaFN1cnZleSk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuICByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KCk7XG4gIHJlZnJlc2hTdXJ2ZXkoKTtcblxuICAkc2NvcGUuY2hhdEF2YWlsYWJsZSA9IEJvb2xlYW4oU05BUExvY2F0aW9uLmNoYXQpO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXQgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0NMT1NFT1VUKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5vcGVuU3VydmV5ID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnN1cnZleUF2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnc3VydmV5JyB9O1xuICB9O1xuXG4gICRzY29wZS5zZWF0Q2xpY2tlZCA9ICgpID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmN1c3RvbWVyQ2xpY2tlZCA9ICgpID0+IHtcbiAgICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnYWNjb3VudCcgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5vcGVuQ2hhdCA9ICgpID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2l0ZW0uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0l0ZW1CYXNlQ3RybCcsXG4gIFsnJHNjb3BlJywgKCRzY29wZSkgPT4ge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSXRlbUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0RhdGFNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQRW52aXJvbm1lbnQnLCAnQ2hhdE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIERhdGFNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIFNoZWxsTWFuYWdlciwgU05BUEVudmlyb25tZW50LCBDaGF0TWFuYWdlcikgPT4ge1xuXG4gIHZhciBJdGVtSW1hZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uaW1nKHtcbiAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGhpcy5wcm9wcy5tZWRpYSwgNjAwLCA2MDApXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5pdGVtID0gbG9jYXRpb24udHlwZSA9PT0gJ2l0ZW0nID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLml0ZW0pO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5pdGVtQ2hhbmdlZC5hZGQocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UgJiYgKCRzY29wZS53ZWJzaXRlVXJsIHx8ICRzY29wZS5mbGFzaFVybCkpIHtcbiAgICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAkc2NvcGUud2Vic2l0ZVVybCA9IG51bGw7XG4gICAgJHNjb3BlLmZsYXNoVXJsID0gbnVsbDtcblxuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICRzY29wZS5lbnRyeSA9IG51bGw7XG5cbiAgICAgIGlmICgkc2NvcGUudHlwZSA9PT0gMSkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXRlbS1waG90bycpLmlubmVySFRNTCA9ICcnO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHlwZSA9IDE7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB0eXBlID0gcmVzcG9uc2UudHlwZTtcblxuICAgIGlmICh0eXBlID09PSAyICYmIHJlc3BvbnNlLndlYnNpdGUpIHtcbiAgICAgICRzY29wZS53ZWJzaXRlVXJsID0gcmVzcG9uc2Uud2Vic2l0ZS51cmw7XG4gICAgICBXZWJCcm93c2VyLm9wZW4oJHNjb3BlLndlYnNpdGVVcmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzICYmIHJlc3BvbnNlLmZsYXNoKSB7XG4gICAgICB2YXIgdXJsID0gJy9mbGFzaCN1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChnZXRNZWRpYVVybChyZXNwb25zZS5mbGFzaC5tZWRpYSwgMCwgMCwgJ3N3ZicpKSArXG4gICAgICAgICcmd2lkdGg9JyArIGVuY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5mbGFzaC53aWR0aCkgK1xuICAgICAgICAnJmhlaWdodD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHJlc3BvbnNlLmZsYXNoLmhlaWdodCk7XG4gICAgICAkc2NvcGUuZmxhc2hVcmwgPSBTaGVsbE1hbmFnZXIuZ2V0QXBwVXJsKHVybCk7XG4gICAgICBXZWJCcm93c2VyLm9wZW4oJHNjb3BlLmZsYXNoVXJsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgJHNjb3BlLmVudHJ5ID0gbmV3IGFwcC5DYXJ0SXRlbShyZXNwb25zZSwgMSk7XG5cbiAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChJdGVtSW1hZ2UsIHsgbWVkaWE6ICRzY29wZS5lbnRyeS5pdGVtLmltYWdlIH0pLFxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXRlbS1waG90bycpXG4gICAgICApO1xuICAgIH1cblxuICAgICRzY29wZS50eXBlID0gdHlwZTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gdmFsdWUgPyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpIDogMDtcblxuICAkc2NvcGUuYWRkVG9DYXJ0ID0gKCkgPT4ge1xuICAgIGlmIChDdXN0b21lck1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZW50cnkgPSAkc2NvcGUuZW50cnk7XG5cbiAgICBpZiAoZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICBDYXJ0TW9kZWwub3BlbkVkaXRvcihlbnRyeSwgdHJ1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChlbnRyeSk7XG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbEdpZnQgPSAoKSA9PiBDaGF0TWFuYWdlci5jYW5jZWxHaWZ0KCk7XG5cbiAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9pdGVtZWRpdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSXRlbUVkaXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDYXJ0TW9kZWwnLFxuICAoJHNjb3BlLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENhcnRNb2RlbCkgPT4ge1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG5cbiAgdmFyIGN1cnJlbnRJbmRleCA9IC0xO1xuXG4gIHZhciByZWZyZXNoTmF2aWdhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZW50cnkgJiYgJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgJHNjb3BlLmhhc05leHRDYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoID4gMSAmJlxuICAgICAgICBjdXJyZW50SW5kZXggPCAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCAtIDE7XG4gICAgICAkc2NvcGUuaGFzUHJldmlvdXNDYXRlZ29yeSA9IGN1cnJlbnRJbmRleCA+IDA7XG4gICAgICAkc2NvcGUuY2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF07XG4gICAgICAkc2NvcGUuY2FuRXhpdCA9IENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXc7XG4gICAgICAkc2NvcGUuY2FuRG9uZSA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdtZW51JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAkc2NvcGUuZXhpdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBpbml0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAkc2NvcGUuZW50cnkgPSB2YWx1ZTtcbiAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5lbnRyeSAhPSBudWxsO1xuXG4gICAgY3VycmVudEluZGV4ID0gMDtcblxuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgaW5pdChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcblxuICBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpbml0KHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdldE1vZGlmaWVyVGl0bGUgPSBmdW5jdGlvbihtb2RpZmllcikge1xuICAgIHJldHVybiBtb2RpZmllci5kYXRhLnRpdGxlICsgKG1vZGlmaWVyLmRhdGEucHJpY2UgPiAwID9cbiAgICAgICcgKCsnICsgU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKG1vZGlmaWVyLmRhdGEucHJpY2UpICsgJyknIDpcbiAgICAgICcnXG4gICAgKTtcbiAgfTtcblxuICAkc2NvcGUubGVmdEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVzdWx0ID0gKGN1cnJlbnRJbmRleCA+IDApID8gKCRzY29wZS5wcmV2aW91c0NhdGVnb3J5KCkpIDogJHNjb3BlLmV4aXQoKTtcbiAgfTtcblxuICAkc2NvcGUubGVmdEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiAoY3VycmVudEluZGV4ID4gMCkgPyAnQmFjaycgOiAnRXhpdCc7XG4gIH07XG5cbiAgJHNjb3BlLnJpZ2h0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgIC8vTWFrZSBzdXJlIFBpY2sgMSBtb2RpZmllciBjYXRlZ29yaWVzIGhhdmUgbWV0IHRoZSBzZWxlY3Rpb24gY29uZGl0aW9uLlxuICAgIGlmKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgdmFyIG51bVNlbGVjdGVkID0gMDtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0ubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIGlmIChtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICBudW1TZWxlY3RlZCsrO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYobnVtU2VsZWN0ZWQgIT09IDEpIHtcbiAgICAgICAgLy9UT0RPOiBBZGQgbW9kYWwgcG9wdXAuIE11c3QgbWFrZSAxIHNlbGVjdGlvbiFcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZXN1bHQgPSAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAkc2NvcGUubmV4dENhdGVnb3J5KCkgOiAkc2NvcGUuZG9uZSgpO1xuICB9O1xuXG4gICRzY29wZS5yaWdodEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAnTmV4dCcgOiAnRG9uZSc7XG4gIH07XG5cbiAgJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50SW5kZXgtLTtcbiAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICB9O1xuXG4gICRzY29wZS5uZXh0Q2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjdXJyZW50SW5kZXgrKztcbiAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICB9O1xuXG4gICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSBmdW5jdGlvbihjYXRlZ29yeSwgbW9kaWZpZXIpIHtcbiAgICBtb2RpZmllci5pc1NlbGVjdGVkID0gIW1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG5cbiAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICBtLmlzU2VsZWN0ZWQgPSBtID09PSBtb2RpZmllcjtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3KSB7XG4gICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuICAgIH1cblxuICAgICRzY29wZS5leGl0KCk7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5leGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgQ2FydE1vZGVsLmNsb3NlRWRpdG9yKCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21haW5hdXguanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01haW5BdXhDdHJsJywgWyckc2NvcGUnLCAnQ29tbWFuZFN0YXJ0dXAnLCBmdW5jdGlvbigkc2NvcGUsIENvbW1hbmRTdGFydHVwKSB7XG4gIENvbW1hbmRTdGFydHVwKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21haW5zbmFwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNYWluU25hcEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBcHBDYWNoZScsICdDdXN0b21lck1hbmFnZXInLCAnQWN0aXZpdHlNb25pdG9yJywgJ0NoYXRNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NvZnR3YXJlTWFuYWdlcicsICdTTkFQTG9jYXRpb24nLCAnQ29tbWFuZFN0YXJ0dXAnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQXBwQ2FjaGUsIEN1c3RvbWVyTWFuYWdlciwgQWN0aXZpdHlNb25pdG9yLCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBOYXZpZ2F0aW9uTWFuYWdlciwgU29mdHdhcmVNYW5hZ2VyLCBTTkFQTG9jYXRpb24sIENvbW1hbmRTdGFydHVwKSA9PiB7XG5cbiAgQ29tbWFuZFN0YXJ0dXAoKTtcblxuICAkc2NvcGUudG91Y2ggPSAoKSA9PiBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlclJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEKSk7XG4gIH0pO1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5jaGF0UmVxdWVzdFJlY2VpdmVkLmFkZCh0b2tlbiA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUodG9rZW4pICsgJyB3b3VsZCBsaWtlIHRvIGNoYXQgd2l0aCB5b3UuJykudGhlbigoKSA9PiB7XG4gICAgICBDaGF0TWFuYWdlci5hcHByb3ZlRGV2aWNlKHRva2VuKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICB9LCAoKSA9PiBDaGF0TWFuYWdlci5kZWNsaW5lRGV2aWNlKHRva2VuKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRSZXF1ZXN0UmVjZWl2ZWQuYWRkKCh0b2tlbiwgZGVzY3JpcHRpb24pID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZSh0b2tlbikgKyAnIHdvdWxkIGxpa2UgdG8gZ2lmdCB5b3UgYSAnICsgZGVzY3JpcHRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuYWNjZXB0R2lmdCh0b2tlbik7XG4gICAgfSwgKCkgPT4gQ2hhdE1hbmFnZXIuZGVjbGluZUdpZnQodG9rZW4pKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwubWVzc2FnZVJlY2VpdmVkLmFkZChtZXNzYWdlID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KCdDaGF0IHdpdGggJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgd2FzIGRlY2xpbmVkLiAnICtcbiAgICAgICdUbyBzdG9wIHJlY2lldmluZyBjaGF0IHJlcXVlc3RzLCBvcGVuIHRoZSBjaGF0IHNjcmVlbiBhbmQgdG91Y2ggdGhlIFwiQ2hhdCBvbi9vZmZcIiBidXR0b24uJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydCgnWW91ciBjaGF0IHJlcXVlc3QgdG8gJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgd2FzIGFjY2VwdGVkLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgYWNjZXB0ZWQgeW91ciBnaWZ0LiBUaGUgaXRlbSB3aWxsIGJlIGFkZGVkIHRvIHlvdXIgY2hlY2suJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIGhhcyBkZWNsaW5lZCB5b3VyIGdpZnQuIFRoZSBpdGVtIHdpbGwgTk9UIGJlIGFkZGVkIHRvIHlvdXIgY2hlY2suJyk7XG4gICAgfVxuXG4gICAgaWYgKE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLnR5cGUgPT09ICdjaGF0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb24oQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgY2xvc2VkIHRoZSBjaGF0Jyk7XG4gICAgfVxuICAgIGVsc2UgaWYoIW1lc3NhZ2Uuc3RhdHVzICYmIG1lc3NhZ2UudG9fZGV2aWNlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvbignTmV3IG1lc3NhZ2UgZnJvbSAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pKTtcbiAgICB9XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRSZWFkeS5hZGQoKCkgPT4ge1xuICAgIENoYXRNYW5hZ2VyLnNlbmRHaWZ0KE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQpO1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdEFjY2VwdGVkLmFkZChzdGF0dXMgPT4ge1xuICAgIGlmICghc3RhdHVzIHx8ICFDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlKSB7XG4gICAgICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcblxuICAgICAgICBDaGF0TWFuYWdlci5lbmRHaWZ0KCk7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21lbnUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01lbnVCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikgPT4ge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWVudUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICB2YXIgTWVudUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aWxlQ2xhc3NOYW1lID0gU2hlbGxNYW5hZ2VyLnRpbGVTdHlsZTtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoZnVuY3Rpb24odGlsZSwgaSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IHRpbGVDbGFzc05hbWUsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMzcwLCAzNzApICsgJyknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpKSB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHsgY2xhc3NOYW1lOiAndGlsZS10YWJsZScgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIERhdGFNYW5hZ2VyLm1lbnUgPSBsb2NhdGlvbi50eXBlID09PSAnbWVudScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIubWVudSk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLm1lbnVDaGFuZ2VkLmFkZChmdW5jdGlvbihtZW51KSB7XG4gICAgaWYgKCFtZW51KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWVudS5jYXRlZ29yaWVzLmZvckVhY2godGlsZSA9PiB7XG4gICAgICB0aWxlLnVybCA9ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgodGlsZS5kZXN0aW5hdGlvbik7XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVMaXN0LCB7IHRpbGVzOiBtZW51LmNhdGVnb3JpZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudC1tZW51JylcbiAgICApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbW9kYWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01vZGFsQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlcikgPT4ge1xuXG4gICAgRGlhbG9nTWFuYWdlci5tb2RhbFN0YXJ0ZWQuYWRkKCgpID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS52aXNpYmxlID0gdHJ1ZSkpO1xuICAgIERpYWxvZ01hbmFnZXIubW9kYWxFbmRlZC5hZGQoKCkgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnZpc2libGUgPSBmYWxzZSkpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9uYXZpZ2F0aW9uLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdOYXZpZ2F0aW9uQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdDdXN0b21lck1hbmFnZXInLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ2FydE1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgQ3VzdG9tZXJNYW5hZ2VyLCBBbmFseXRpY3NNb2RlbCwgQ2FydE1vZGVsLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENvbW1hbmRSZXNldCwgQ29tbWFuZEZsaXBTY3JlZW4sIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS5tZW51cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsb2NhdGlvbiA9IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLFxuICAgICAgICBsaW1pdCA9IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnID8gNCA6IDM7XG5cbiAgICAkc2NvcGUubWVudXMgPSByZXNwb25zZS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAgIC5maWx0ZXIoKG1lbnUsIGkpID0+IGkgPCBsaW1pdClcbiAgICAgIC5tYXAobWVudSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlbixcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcbiAgICAgICAgICBzZWxlY3RlZDogbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlSG9tZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICAkc2NvcGUubmF2aWdhdGVCYWNrID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICAkc2NvcGUucm90YXRlU2NyZWVuID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgQ29tbWFuZEZsaXBTY3JlZW4oKTtcbiAgfTtcblxuICAkc2NvcGUub3BlbkNhcnQgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSAhQ2FydE1vZGVsLmlzQ2FydE9wZW47XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5TZXR0aW5ncyA9ICgpID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgJHNjb3BlLm1lbnVPcGVuID0gISRzY29wZS5tZW51T3BlbjtcbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudENsaWNrID0gaXRlbSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgdHlwZTogJ2NsaWNrJ1xuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0uaHJlZikge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICd1cmwnLCB1cmw6IGl0ZW0uaHJlZi51cmwgfTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgISRzY29wZS53aWRlKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQWxsID0gW107XG4gICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcCA9IFtdO1xuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20gPSBbXTtcbiAgdmFyIG1hcEFkdmVydGlzZW1lbnQgPSBhZCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGFkLnNyYywgOTcwLCA5MCksXG4gICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgfTtcbiAgfTtcbiAgRGF0YVByb3ZpZGVyLmFkdmVydGlzZW1lbnRzKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wID0gcmVzcG9uc2UudG9wLm1hcChtYXBBZHZlcnRpc2VtZW50KTtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c0JvdHRvbSA9IHJlc3BvbnNlLmJvdHRvbS5tYXAobWFwQWR2ZXJ0aXNlbWVudCk7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNBbGwgPSAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AuY29uY2F0KCRzY29wZS5hZHZlcnRpc2VtZW50c0JvdHRvbSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5jYXJ0Q291bnQgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKGNhcnQgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXJ0Q291bnQgPSBjYXJ0Lmxlbmd0aCk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlID0gZGVzdGluYXRpb24gPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUubWVudXMuZm9yRWFjaChtZW51ID0+IHtcbiAgICAgICAgLy9tZW51LnNlbGVjdGVkID0gKGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlbik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL25vdGlmaWNhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTm90aWZpY2F0aW9uQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyKSB7XG4gIHZhciB0aW1lcjtcblxuICAkc2NvcGUubWVzc2FnZXMgPSBbXTtcblxuICBmdW5jdGlvbiB1cGRhdGVWaXNpYmlsaXR5KGlzVmlzaWJsZSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnZpc2libGUgPSBpc1Zpc2libGU7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlTmV4dCgpIHtcbiAgICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgJHNjb3BlLm1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCRzY29wZS5tZXNzYWdlc1tpXSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLm1lc3NhZ2VzID0gbWVzc2FnZXM7XG5cbiAgICBpZiAoJHNjb3BlLm1lc3NhZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eShmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGltZXIgPSAkdGltZW91dChoaWRlTmV4dCwgNDAwMCk7XG4gIH1cblxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuXG4gIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uUmVxdWVzdGVkLmFkZChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZXMucHVzaCh7IHRleHQ6IG1lc3NhZ2UgfSk7XG4gICAgfSk7XG5cbiAgICB1cGRhdGVWaXNpYmlsaXR5KHRydWUpO1xuXG4gICAgaWYgKHRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgIH1cblxuICAgIHRpbWVyID0gJHRpbWVvdXQoaGlkZU5leHQsIDQwMDApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc2NyZWVuc2F2ZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1NjcmVlbnNhdmVyQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsICdBY3Rpdml0eU1vbml0b3InLCAnRGF0YVByb3ZpZGVyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIFNoZWxsTWFuYWdlciwgQWN0aXZpdHlNb25pdG9yLCBEYXRhUHJvdmlkZXIpID0+IHtcbiAgICBcbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBzaG93SW1hZ2VzKHZhbHVlcykge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmltYWdlcyA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaXRlbS5tZWRpYSwgMTkyMCwgMTA4MCwgJ2pwZycpLFxuICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoaXRlbS5tZWRpYSlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2hvd0ltYWdlcyhTaGVsbE1hbmFnZXIubW9kZWwuc2NyZWVuc2F2ZXJzKTtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLnNjcmVlbnNhdmVyc0NoYW5nZWQuYWRkKHNob3dJbWFnZXMpO1xuXG4gIEFjdGl2aXR5TW9uaXRvci5hY3RpdmVDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZSA9PT0gZmFsc2UgJiYgKCRzY29wZS5pbWFnZXMgJiYgJHNjb3BlLmltYWdlcy5sZW5ndGggPiAwKTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3NpZ25pbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU2lnbkluQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NvbW1hbmRDdXN0b21lckxvZ2luJywgJ0NvbW1hbmRDdXN0b21lckd1ZXN0TG9naW4nLCAnQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4nLCAnQ29tbWFuZEN1c3RvbWVyU2lnbnVwJywgJ0N1c3RvbWVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1NOQVBMb2NhdGlvbicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIENvbW1hbmRDdXN0b21lckxvZ2luLCBDb21tYW5kQ3VzdG9tZXJHdWVzdExvZ2luLCBDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbiwgQ29tbWFuZEN1c3RvbWVyU2lnbnVwLCBDdXN0b21lck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU05BUExvY2F0aW9uLCBXZWJCcm93c2VyKSA9PiB7XG5cbiAgdmFyIFNURVBfU1BMQVNIID0gMSxcbiAgICAgIFNURVBfTE9HSU4gPSAyLFxuICAgICAgU1RFUF9SRUdJU1RSQVRJT04gPSAzLFxuICAgICAgU1RFUF9HVUVTVFMgPSA0LFxuICAgICAgU1RFUF9FVkVOVCA9IDUsXG4gICAgICBTVEVQX1JFU0VUID0gNjtcblxuICAkc2NvcGUuU1RFUF9TUExBU0ggPSBTVEVQX1NQTEFTSDtcbiAgJHNjb3BlLlNURVBfTE9HSU4gPSBTVEVQX0xPR0lOO1xuICAkc2NvcGUuU1RFUF9SRUdJU1RSQVRJT04gPSBTVEVQX1JFR0lTVFJBVElPTjtcbiAgJHNjb3BlLlNURVBfR1VFU1RTID0gU1RFUF9HVUVTVFM7XG4gICRzY29wZS5TVEVQX0VWRU5UID0gU1RFUF9FVkVOVDtcbiAgJHNjb3BlLlNURVBfUkVTRVQgPSBTVEVQX1JFU0VUO1xuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQTG9jYXRpb24ubG9jYXRpb25fbmFtZTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIExvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUubG9naW4gPSAoKSA9PiB7XG4gICAgJHNjb3BlLmNyZWRlbnRpYWxzID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX0xPR0lOO1xuICB9O1xuXG4gICRzY29wZS5ndWVzdExvZ2luID0gKCkgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDb21tYW5kQ3VzdG9tZXJHdWVzdExvZ2luKCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5kb0xvZ2luID0gKGNyZWRlbnRpYWxzKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICRzY29wZS5jcmVkZW50aWFscy51c2VybmFtZSA9ICRzY29wZS5jcmVkZW50aWFscy5lbWFpbDtcblxuICAgIENvbW1hbmRDdXN0b21lckxvZ2luKCRzY29wZS5jcmVkZW50aWFscykudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfR0VORVJJQ19FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBTb2NpYWwgbG9naW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5sb2dpbkZhY2Vib29rID0gKCkgPT4ge1xuICAgIHNvY2lhbEJ1c3koKTtcbiAgICBDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbi5mYWNlYm9vaygpLnRoZW4oc29jaWFsTG9naW4sIHNvY2lhbEVycm9yKTtcbiAgfTtcblxuICAkc2NvcGUubG9naW5Ud2l0dGVyID0gKCkgPT4ge1xuICAgIHNvY2lhbEJ1c3koKTtcbiAgICBDb21tYW5kQ3VzdG9tZXJTb2NpYWxMb2dpbi50d2l0dGVyKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpbkdvb2dsZSA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4uZ29vZ2xlcGx1cygpLnRoZW4oc29jaWFsTG9naW4sIHNvY2lhbEVycm9yKTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlZ2lzdHJhdGlvblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnJlZ2lzdGVyID0gKCkgPT4ge1xuICAgICRzY29wZS5yZWdpc3RyYXRpb24gPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfUkVHSVNUUkFUSU9OO1xuICB9O1xuXG4gICRzY29wZS5kb1JlZ2lzdHJhdGlvbiA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVnaXN0cmF0aW9uLnVzZXJuYW1lID0gJHNjb3BlLnJlZ2lzdHJhdGlvbi5lbWFpbDtcblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDb21tYW5kQ3VzdG9tZXJTaWdudXAoJHNjb3BlLnJlZ2lzdHJhdGlvbikudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgR3Vlc3QgY291bnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5zZXNzaW9uID0ge1xuICAgIGd1ZXN0Q291bnQ6IDEsXG4gICAgc3BlY2lhbDogZmFsc2VcbiAgfTtcblxuICAkc2NvcGUuc3VibWl0R3Vlc3RDb3VudCA9ICgpID0+IHtcbiAgICBpZiAoJHNjb3BlLnNlc3Npb24uZ3Vlc3RDb3VudCA+IDEpIHtcbiAgICAgIFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQgPSAkc2NvcGUuc2Vzc2lvbi5ndWVzdENvdW50O1xuICAgICAgJHNjb3BlLnN0ZXAgPSBTVEVQX0VWRU5UO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVuZFNpZ25JbigpO1xuICAgIH1cbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEV2ZW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuc3VibWl0U3BlY2lhbEV2ZW50ID0gKHZhbHVlKSA9PiB7XG4gICAgJHNjb3BlLnNlc3Npb24uc3BlY2lhbCA9IFNlc3Npb25NYW5hZ2VyLnNwZWNpYWxFdmVudCA9IEJvb2xlYW4odmFsdWUpO1xuICAgIGVuZFNpZ25JbigpO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVzZXQgcGFzc3dvcmRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5yZXNldFBhc3N3b3JkID0gKCkgPT4ge1xuICAgICRzY29wZS5wYXNzd29yZHJlc2V0ID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1JFU0VUO1xuICB9O1xuXG4gICRzY29wZS5wYXNzd29yZFJlc2V0U3VibWl0ID0gKCkgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIucmVzZXRQYXNzd29yZCgkc2NvcGUucGFzc3dvcmRyZXNldCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnBhc3N3b3JkUmVzZXQgPSBmYWxzZTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEUpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRSZXNldENhbmNlbCA9ICgpID0+IHtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfU1BMQVNIO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBmdW5jdGlvbiBzb2NpYWxMb2dpbigpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxFcnJvcigpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG4gICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9HRU5FUklDX0VSUk9SKTtcbiAgfVxuXG4gIHZhciBzb2NpYWxKb2IsIHNvY2lhbFRpbWVyO1xuXG4gIGZ1bmN0aW9uIHNvY2lhbEJ1c3koKSB7XG4gICAgc29jaWFsQnVzeUVuZCgpO1xuXG4gICAgc29jaWFsSm9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgIHNvY2lhbFRpbWVyID0gJHRpbWVvdXQoc29jaWFsQnVzeUVuZCwgMTIwICogMTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxCdXN5RW5kKCkge1xuICAgIGlmIChzb2NpYWxKb2IpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKHNvY2lhbEpvYik7XG4gICAgICBzb2NpYWxKb2IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChzb2NpYWxUaW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHNvY2lhbFRpbWVyKTtcbiAgICAgIHNvY2lhbFRpbWVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbmRTaWduSW4oKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIHJldHVybiBlbmRTaWduSW4oKTtcbiAgfVxuXG4gICRzY29wZS5pbml0aWFsaXplZCA9IHRydWU7XG4gICRzY29wZS5zdGVwID0gU1RFUF9TUExBU0g7XG5cbiAgdmFyIG1vZGFsID0gRGlhbG9nTWFuYWdlci5zdGFydE1vZGFsKCk7XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuICAgIERpYWxvZ01hbmFnZXIuZW5kTW9kYWwobW9kYWwpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc3RhcnR1cC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU3RhcnR1cEN0cmwnLFxuICBbJyRzY29wZScsICdDb21tYW5kQm9vdCcsICdEaWFsb2dNYW5hZ2VyJywgJ01hbmFnZW1lbnRTZXJ2aWNlJyxcbiAgKCRzY29wZSwgQ29tbWFuZEJvb3QsIERpYWxvZ01hbmFnZXIsIE1hbmFnZW1lbnRTZXJ2aWNlKSA9PiB7XG5cbiAgZnVuY3Rpb24gd29ya2Zsb3coKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIENvbW1hbmRCb290KCkudGhlbigoKSA9PiB7XG4gICAgICBNYW5hZ2VtZW50U2VydmljZS5sb2FkQXBwbGljYXRpb24oKTtcbiAgICB9LCBlID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0VSUk9SX1NUQVJUVVApLnRoZW4oKCkgPT4gd29ya2Zsb3coKSk7XG4gICAgfSk7XG4gIH1cblxuICB3b3JrZmxvdygpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zdXJ2ZXkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1N1cnZleUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1hbmFnZXInLCAnQ3VzdG9tZXJNb2RlbCcsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTWFuYWdlciwgQ3VzdG9tZXJNb2RlbCwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU3VydmV5TWFuYWdlcikge1xuXG4gIGlmICghU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgIVN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkgfHwgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmNvbW1lbnQgPSAnJztcbiAgJHNjb3BlLmVtYWlsID0gJyc7XG4gICRzY29wZS5oYWRfcHJvYmxlbXMgPSBmYWxzZTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBhZ2VzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZXMgPSBbXTtcbiAgdmFyIHBhZ2VzID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VzJyk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBJbmRleFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VJbmRleCA9IC0xO1xuICB2YXIgcGFnZUluZGV4ID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VJbmRleCcpO1xuICBwYWdlSW5kZXguY2hhbmdlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wYWdlID0gJHNjb3BlLnBhZ2VJbmRleCA+IC0xID8gJHNjb3BlLnBhZ2VzWyRzY29wZS5wYWdlSW5kZXhdIDogeyBxdWVzdGlvbnM6IFtdIH07XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUucGFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJCgnI3JhdGUtJyArIGl0ZW0udG9rZW4pLnJhdGVpdCh7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDUsXG4gICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgcmVzZXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tpbmdmbGQ6ICcjcmFuZ2UtJyArIGl0ZW0udG9rZW5cbiAgICAgICAgICB9KS5iaW5kKCdyYXRlZCcsIGZ1bmN0aW9uKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaXRlbS5mZWVkYmFjayA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ291bnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlQ291bnQgPSAwO1xuICBwYWdlcy5jaGFuZ2VzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBhZ2VDb3VudCA9ICRzY29wZS5wYWdlcy5sZW5ndGg7XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBnZW5lcmF0ZVBhc3N3b3JkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IDgsXG4gICAgICAgIGNoYXJzZXQgPSAnYWJjZGVmZ2hrbnBxcnN0dXZ3eHl6QUJDREVGR0hLTU5QUVJTVFVWV1hZWjIzNDU2Nzg5JyxcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGFyc2V0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBzdWJtaXRGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wYWdlcy5yZWR1Y2UoKGFuc3dlcnMsIHBhZ2UpID0+IHtcbiAgICAgIHJldHVybiBwYWdlLnJlZHVjZSgoYW5zd2VycywgcXVlc3Rpb24pID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQocXVlc3Rpb24uZmVlZGJhY2spO1xuXG4gICAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgICBhbnN3ZXJzLnB1c2goe1xuICAgICAgICAgICAgc3VydmV5OiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5LnRva2VuLFxuICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnRva2VuLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW5zd2VycztcbiAgICAgIH0sIGFuc3dlcnMpO1xuICAgIH0sIFtdKVxuICAgIC5mb3JFYWNoKGFuc3dlciA9PiBBbmFseXRpY3NNb2RlbC5sb2dBbnN3ZXIoYW5zd2VyKSk7XG5cbiAgICBpZiAoJHNjb3BlLmNvbW1lbnQgJiYgJHNjb3BlLmNvbW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQ29tbWVudCh7XG4gICAgICAgIHR5cGU6ICdmZWVkYmFjaycsXG4gICAgICAgIHRleHQ6ICRzY29wZS5jb21tZW50XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGUgPSB0cnVlO1xuXG4gICAgaWYgKCRzY29wZS5oYWRfcHJvYmxlbXMgJiYgIU9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCkge1xuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuZW1haWwgJiYgJHNjb3BlLmVtYWlsLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBnZW5lcmF0ZVBhc3N3b3JkKCk7XG5cbiAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbih7XG4gICAgICAgIGVtYWlsOiAkc2NvcGUuZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogJHNjb3BlLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIH1cbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJldmlvdXNQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5wYWdlSW5kZXggPiAwKSB7XG4gICAgICAkc2NvcGUucGFnZUluZGV4LS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5uZXh0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGFnZUluZGV4IDwgJHNjb3BlLnBhZ2VDb3VudCAtIDEpIHtcbiAgICAgICRzY29wZS5wYWdlSW5kZXgrKztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuc3RlcCA8IDMpIHtcbiAgICAgICRzY29wZS5zdGVwKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLnN0ZXAgPCAyKSB7XG4gICAgICAkc2NvcGUuc3RlcCsrO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zdWJtaXRQcm9ibGVtID0gZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgJHNjb3BlLmhhZF9wcm9ibGVtcyA9IEJvb2xlYW4oc3RhdHVzKTtcbiAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuc3RlcCA+IDApIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYWdlO1xuXG4gICAgJHNjb3BlLmhhc19lbWFpbCA9IEN1c3RvbWVyTW9kZWwuaGFzQ3JlZGVudGlhbHM7XG5cbiAgICBmdW5jdGlvbiBidWlsZFN1cnZleSgpIHtcbiAgICAgIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkucXVlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYWdlIHx8IHBhZ2UubGVuZ3RoID4gNCkge1xuICAgICAgICAgIHBhZ2UgPSBbXTtcbiAgICAgICAgICAkc2NvcGUucGFnZXMucHVzaChwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW0uZmVlZGJhY2sgPSAwO1xuICAgICAgICBwYWdlLnB1c2goaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSkge1xuICAgICAgYnVpbGRTdXJ2ZXkoKTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5hZGQoKCkgPT4gYnVpbGRTdXJ2ZXkoKSk7XG5cbiAgICAkc2NvcGUucGFnZUluZGV4ID0gMDtcbiAgICAkc2NvcGUuc3RlcCA9IDA7XG4gIH0pKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3VybC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignVXJsQ3RybCcsXG4gIFsnJHNjb3BlJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1dlYkJyb3dzZXInLFxuICAoJHNjb3BlLCBOYXZpZ2F0aW9uTWFuYWdlciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gIFdlYkJyb3dzZXIub3BlbihOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi51cmwpO1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3dlYi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignV2ViQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gIFdlYkJyb3dzZXIub25PcGVuLmFkZCgoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmVuYWJsZWQgPSBmYWxzZTtcbiAgfSk7XG5cbiAgV2ViQnJvd3Nlci5vbkNsb3NlLmFkZCgoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmVuYWJsZWQgPSB0cnVlO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJywgWydhbmd1bGFyLWJhY29uJ10pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL2dhbGxlcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdnYWxsZXJ5JywgW1xuICAnQWN0aXZpdHlNb25pdG9yJywgJ1NoZWxsTWFuYWdlcicsICckdGltZW91dCcsXG4gIChBY3Rpdml0eU1vbml0b3IsIFNoZWxsTWFuYWdlciwgJHRpbWVvdXQpID0+IHtcblxuICB2YXIgc2xpZGVyLFxuICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgIG1vZGU6ICdmYWRlJyxcbiAgICAgICAgd3JhcHBlckNsYXNzOiAncGhvdG8tZ2FsbGVyeSdcbiAgICAgIH07XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIHNjb3BlOiB7XG4gICAgICBpbWFnZXM6ICc9JyxcbiAgICAgIGltYWdld2lkdGggOiAnPT8nLFxuICAgICAgaW1hZ2VoZWlnaHQ6ICc9PydcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnZ2FsbGVyeScpLFxuICAgIGxpbms6IChzY29wZSwgZWxlbSwgYXR0cnMpID0+IHtcbiAgICAgIGVsZW0ucmVhZHkoKCkgPT4ge1xuICAgICAgICBzbGlkZXIgPSAkKCcuYnhzbGlkZXInLCBlbGVtKS5ieFNsaWRlcihzZXR0aW5ncyk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdpbWFnZXMnLCAoKSA9PiB7XG4gICAgICAgIHNjb3BlLm1lZGlhcyA9IChzY29wZS5pbWFnZXMgfHwgW10pLm1hcChpbWFnZSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaW1hZ2UsIGF0dHJzLmltYWdld2lkdGgsIGF0dHJzLmltYWdlaGVpZ2h0KSk7XG4gICAgICAgIHNldHRpbmdzLnBhZ2VyID0gc2NvcGUubWVkaWFzLmxlbmd0aCA+IDE7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHNsaWRlci5yZWxvYWRTbGlkZXIoc2V0dGluZ3MpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9vbmlmcmFtZWxvYWQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdvbklmcmFtZUxvYWQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiB7XG4gICAgICBjYWxsYmFjazogJyZvbklmcmFtZUxvYWQnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoc2NvcGUuY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgc2NvcGUuY2FsbGJhY2soeyBldmVudDogZSB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvb25rZXlkb3duLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnb25LZXlkb3duJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBmdW5jdGlvblRvQ2FsbCA9IHNjb3BlLiRldmFsKGF0dHJzLm9uS2V5ZG93bik7XG4gICAgICBlbGVtLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGZ1bmN0aW9uVG9DYWxsKGUud2hpY2gpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvcXVhbnRpdHkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdxdWFudGl0eScsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgcXVhbnRpdHk6ICc9JyxcbiAgICAgIG1pbjogJz0nLFxuICAgICAgbWF4OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUubWluID0gc2NvcGUubWluIHx8IDE7XG4gICAgICBzY29wZS5tYXggPSBzY29wZS5tYXggfHwgOTtcbiAgICAgIHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIG1pbjogc2NvcGUubWluLFxuICAgICAgICBtYXg6IHNjb3BlLm1heCxcbiAgICAgICAgcXVhbnRpdHk6IHBhcnNlSW50KHNjb3BlLnF1YW50aXR5KVxuICAgICAgfTtcblxuICAgICAgc2NvcGUuZGVjcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPiBzY29wZS5kYXRhLm1pbiA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSAtIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWluO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuaW5jcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPCBzY29wZS5kYXRhLm1heCA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSArIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWF4O1xuICAgICAgfTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnaW5wdXQtcXVhbnRpdHknKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3Njcm9sbGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2Nyb2xsZXInLCBbJ0FjdGl2aXR5TW9uaXRvcicsICdTTkFQRW52aXJvbm1lbnQnLCBmdW5jdGlvbiAoQWN0aXZpdHlNb25pdG9yLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0MnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgaWYgKFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnKSB7XG4gICAgICAgICQoZWxlbSkua2luZXRpYyh7XG4gICAgICAgICAgeTogZmFsc2UsIHN0b3BwZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2Nyb2xsZ2x1ZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3Njcm9sbGdsdWUnLCBbJyRwYXJzZScsIGZ1bmN0aW9uICgkcGFyc2UpIHtcbiAgZnVuY3Rpb24gdW5ib3VuZFN0YXRlKGluaXRWYWx1ZSl7XG4gICAgdmFyIGFjdGl2YXRlZCA9IGluaXRWYWx1ZTtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgYWN0aXZhdGVkID0gdmFsdWU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZVdheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNjb3BlKXtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXR0ZXIoc2NvcGUpO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbigpe31cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gdHdvV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2V0dGVyLCBzY29wZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHNjb3BlKTtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBpZih2YWx1ZSAhPT0gZ2V0dGVyKHNjb3BlKSl7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZXR0ZXIoc2NvcGUsIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0ciwgc2NvcGUpe1xuICAgIGlmKGF0dHIgIT09IFwiXCIpe1xuICAgICAgdmFyIGdldHRlciA9ICRwYXJzZShhdHRyKTtcbiAgICAgIGlmKGdldHRlci5hc3NpZ24gIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBnZXR0ZXIuYXNzaWduLCBzY29wZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5ib3VuZFN0YXRlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcHJpb3JpdHk6IDEsXG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgJGVsLCBhdHRycyl7XG4gICAgICB2YXIgZWwgPSAkZWxbMF0sXG4gICAgICBhY3RpdmF0aW9uU3RhdGUgPSBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0cnMuc2Nyb2xsZ2x1ZSwgc2NvcGUpO1xuXG4gICAgICBmdW5jdGlvbiBzY3JvbGxUb0JvdHRvbSgpe1xuICAgICAgICBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uU2NvcGVDaGFuZ2VzKCl7XG4gICAgICAgIGlmKGFjdGl2YXRpb25TdGF0ZS5nZXRWYWx1ZSgpICYmICFzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKSl7XG4gICAgICAgICAgc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKXtcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFRvcCArIGVsLmNsaWVudEhlaWdodCArIDEgPj0gZWwuc2Nyb2xsSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblNjcm9sbCgpe1xuICAgICAgICBhY3RpdmF0aW9uU3RhdGUuc2V0VmFsdWUoc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCkpO1xuICAgICAgfVxuXG4gICAgICBzY29wZS4kd2F0Y2gob25TY29wZUNoYW5nZXMpO1xuICAgICAgJGVsLmJpbmQoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2xpZGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2xpZGVyJyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNvdXJjZTogJz0nLFxuICAgICAgc2xpZGVjbGljazogJz0nLFxuICAgICAgc2xpZGVzaG93OiAnPScsXG4gICAgICB0aW1lb3V0OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgdmFyIHRpbWVvdXQgPSBzY29wZS50aW1lb3V0IHx8IDUwMDA7XG4gICAgICBzY29wZS5zb3VyY2UgPSBzY29wZS5zb3VyY2UgfHwgW107XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIGNoYW5nZUltYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzY29wZS5zb3VyY2UubGVuZ3RoID09PSAwIHx8IHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcblxuICAgICAgICBzY29wZS5zb3VyY2UuZm9yRWFjaChmdW5jdGlvbihlbnRyeSwgaSl7XG4gICAgICAgICAgZW50cnkudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZW50cnkgPSBzY29wZS5zb3VyY2Vbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgICAgZW50cnkudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNjb3BlLnNsaWRlc2hvdykge1xuICAgICAgICAgIHNjb3BlLnNsaWRlc2hvdyhlbnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHZhciB2ID0gJCgndmlkZW8nLCBlbGVtKTtcbiAgICAgICAgICB2LmF0dHIoJ3NyYycsIGVudHJ5LnNyYyk7XG4gICAgICAgICAgdmFyIHZpZGVvID0gdi5nZXQoMCk7XG5cbiAgICAgICAgICBpZiAoIXZpZGVvKSB7XG4gICAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIDMwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9uVmlkZW9FbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBzY29wZS5uZXh0KCk7IH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgb25WaWRlb0Vycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25WaWRlb0Vycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgc2NvcGUubmV4dCgpOyB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uVmlkZW9FcnJvciwgZmFsc2UpO1xuXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAge1xuICAgICAgICAgICAgdmlkZW8ubG9hZCgpO1xuICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmFibGUgdG8gcGxheSB2aWRlbzogJyArIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA8IHNjb3BlLnNvdXJjZS5sZW5ndGgtMSA/XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4KysgOlxuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgIGNoYW5nZUltYWdlKCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5wcmV2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA+IDAgP1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleC0tIDpcbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5zb3VyY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgY2hhbmdlSW1hZ2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB0aW1lcjtcblxuICAgICAgdmFyIHNsaWRlckZ1bmMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNjb3BlLnNvdXJjZS5sZW5ndGggPT09IDAgfHwgc2NvcGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY29wZS5uZXh0KCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ3NvdXJjZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdkaXNhYmxlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2xpZGVyRnVuYygpO1xuXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnc2xpZGVyJylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zd2l0Y2guanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzd2l0Y2gnLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRpc2FibGVkOiAnPT8nLFxuICAgICAgc2VsZWN0ZWQ6ICc9PydcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUuZGlzYWJsZWQgPSBCb29sZWFuKHNjb3BlLmRpc2FibGVkKTtcbiAgICAgIHNjb3BlLnNlbGVjdGVkID0gQm9vbGVhbihzY29wZS5zZWxlY3RlZCk7XG4gICAgICBzY29wZS5kYXRhID0ge1xuICAgICAgICBkaXNhYmxlZDogQm9vbGVhbihzY29wZS5kaXNhYmxlZCksXG4gICAgICAgIHNlbGVjdGVkOiBCb29sZWFuKHNjb3BlLnNlbGVjdGVkKSxcbiAgICAgICAgY2hhbmdlZDogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUuc2VsZWN0ZWQgPSBzY29wZS5kYXRhLnNlbGVjdGVkID0gIXNjb3BlLmRhdGEuc2VsZWN0ZWQ7XG4gICAgICAgIHNjb3BlLmRhdGEuY2hhbmdlZCA9IHRydWU7XG4gICAgICB9O1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdpbnB1dC1zd2l0Y2gnKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnLCBbXSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvcGFydGlhbC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3BhcnRpYWwnLCBbJ1NoZWxsTWFuYWdlcicsIChTaGVsbE1hbmFnZXIpID0+IHtcbiAgcmV0dXJuIChuYW1lKSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy90aHVtYm5haWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCd0aHVtYm5haWwnLCBbJ1NoZWxsTWFuYWdlcicsIFNoZWxsTWFuYWdlciA9PiB7XG4gIHJldHVybiAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3RydXN0dXJsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigndHJ1c3RVcmwnLCBbJyRzY2UnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwodmFsKTtcbiAgICB9O1xufV0pO1xuXG4vL3NyYy9qcy9zZXJ2aWNlcy5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5zZXJ2aWNlcycsIFsnbmdSZXNvdXJjZScsICdTTkFQLmNvbmZpZ3MnXSlcblxuICAuZmFjdG9yeSgnTG9nZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAoU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9nZ2VyKFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnJGV4Y2VwdGlvbkhhbmRsZXInLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gKGV4Y2VwdGlvbiwgY2F1c2UpID0+IHtcbiAgICAgIExvZ2dlci5mYXRhbChleGNlcHRpb24uc3RhY2ssIGNhdXNlLCBleGNlcHRpb24pO1xuICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgIH07XG4gIH1dKVxuXG4gIC8vU2VydmljZXNcblxuICAuZmFjdG9yeSgnQ2FyZFJlYWRlcicsIFsnTWFuYWdlbWVudFNlcnZpY2UnLCAoTWFuYWdlbWVudFNlcnZpY2UpID0+IHtcbiAgICB3aW5kb3cuU25hcENhcmRSZWFkZXIgPSBuZXcgYXBwLkNhcmRSZWFkZXIoTWFuYWdlbWVudFNlcnZpY2UpO1xuICAgIHJldHVybiB3aW5kb3cuU25hcENhcmRSZWFkZXI7XG4gIH1dKVxuICAuZmFjdG9yeSgnRHRzQXBpJywgWydTTkFQSG9zdHMnLCAnU2Vzc2lvbk1vZGVsJywgKFNOQVBIb3N0cywgU2Vzc2lvbk1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQmFja2VuZEFwaShTTkFQSG9zdHMsIFNlc3Npb25Nb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnTWFuYWdlbWVudFNlcnZpY2UnLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Db3Jkb3ZhTWFuYWdlbWVudFNlcnZpY2UoTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2NrZXRDbGllbnQnLCBbJ1Nlc3Npb25Nb2RlbCcsICdTTkFQSG9zdHMnLCAnTG9nZ2VyJywgKFNlc3Npb25Nb2RlbCwgU05BUEhvc3RzLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2NrZXRDbGllbnQoU2Vzc2lvbk1vZGVsLCBTTkFQSG9zdHMsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnVGVsZW1ldHJ5U2VydmljZScsIFsnJHJlc291cmNlJywgKCRyZXNvdXJjZSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlRlbGVtZXRyeVNlcnZpY2UoJHJlc291cmNlKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdXZWJCcm93c2VyJywgWydBbmFseXRpY3NNb2RlbCcsICdNYW5hZ2VtZW50U2VydmljZScsICdTTkFQRW52aXJvbm1lbnQnLCAnU05BUEhvc3RzJywgKEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpID0+IHtcbiAgICB3aW5kb3cuU25hcFdlYkJyb3dzZXIgPSBuZXcgYXBwLldlYkJyb3dzZXIoQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cyk7XG4gICAgcmV0dXJuIHdpbmRvdy5TbmFwV2ViQnJvd3NlcjtcbiAgfV0pXG5cbiAgLy9Nb2RlbHNcblxuICAuZmFjdG9yeSgnQXBwQ2FjaGUnLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BcHBDYWNoZShMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0FuYWx5dGljc01vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAnSGVhdE1hcCcsIChTdG9yYWdlUHJvdmlkZXIsIEhlYXRNYXApID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BbmFseXRpY3NNb2RlbChTdG9yYWdlUHJvdmlkZXIsIEhlYXRNYXApO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0NhcnRNb2RlbCcsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kZWwoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0NoYXRNb2RlbCcsIFsnU05BUExvY2F0aW9uJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNoYXRNb2RlbChTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdDdXN0b21lck1vZGVsJywgWydTTkFQTG9jYXRpb24nLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ3VzdG9tZXJNb2RlbChTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGF0YVByb3ZpZGVyJywgWydTTkFQTG9jYXRpb24nLCAnRHRzQXBpJywgKFNOQVBMb2NhdGlvbiwgRHRzQXBpKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuRGF0YVByb3ZpZGVyKFNOQVBMb2NhdGlvbiwgRHRzQXBpKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdIZWF0TWFwJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkhlYXRNYXAoZG9jdW1lbnQuYm9keSk7XG4gIH0pXG4gIC5mYWN0b3J5KCdMb2NhdGlvbk1vZGVsJywgWydEdHNBcGknLCAnU05BUEVudmlyb25tZW50JywgJ1NOQVBMb2NhdGlvbicsICdTdG9yYWdlUHJvdmlkZXInLCAoRHRzQXBpLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9jYXRpb25Nb2RlbChEdHNBcGksIFNOQVBFbnZpcm9ubWVudCwgU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ09yZGVyTW9kZWwnLCBbJ1N0b3JhZ2VQcm92aWRlcicsIChTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5PcmRlck1vZGVsKFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2hlbGxNb2RlbCcsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TaGVsbE1vZGVsKCk7XG4gIH0pXG4gIC5mYWN0b3J5KCdTdXJ2ZXlNb2RlbCcsIFsnU05BUExvY2F0aW9uJywgJ1N0b3JhZ2VQcm92aWRlcicsIChTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlN1cnZleU1vZGVsKFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTZXNzaW9uTW9kZWwnLCBbJ1N0b3JhZ2VQcm92aWRlcicsIChTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uTW9kZWwoU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTdG9yYWdlUHJvdmlkZXInLCAoKSA9PiAge1xuICAgIHJldHVybiAoaWQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgYXBwLkNvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZShpZCk7XG4gICAgfTtcbiAgfSlcblxuICAvL01hbmFnZXJzXG5cbiAgLmZhY3RvcnkoJ0FjdGl2aXR5TW9uaXRvcicsIFsnJHJvb3RTY29wZScsICckdGltZW91dCcsICgkcm9vdFNjb3BlLCAkdGltZW91dCkgPT4ge1xuICAgIHZhciBtb25pdG9yID0gbmV3IGFwcC5BY3Rpdml0eU1vbml0b3IoJHJvb3RTY29wZSwgJHRpbWVvdXQpO1xuICAgIG1vbml0b3IudGltZW91dCA9IDMwMDAwO1xuICAgIHJldHVybiBtb25pdG9yO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0FuYWx5dGljc01hbmFnZXInLCBbJ1RlbGVtZXRyeVNlcnZpY2UnLCAnQW5hbHl0aWNzTW9kZWwnLCAnTG9nZ2VyJywgKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BbmFseXRpY3NNYW5hZ2VyKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsIFsnRHRzQXBpJywgJ1Nlc3Npb25Nb2RlbCcsICdTTkFQRW52aXJvbm1lbnQnLCAnV2ViQnJvd3NlcicsICdMb2dnZXInLCAoRHRzQXBpLCBTZXNzaW9uTW9kZWwsIFNOQVBFbnZpcm9ubWVudCwgV2ViQnJvd3NlciwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQXV0aGVudGljYXRpb25NYW5hZ2VyKER0c0FwaSwgU2Vzc2lvbk1vZGVsLCBTTkFQRW52aXJvbm1lbnQsIFdlYkJyb3dzZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ3VzdG9tZXJNYW5hZ2VyJywgWydTTkFQTG9jYXRpb24nLCAnU05BUEVudmlyb25tZW50JywgJ0R0c0FwaScsICdDdXN0b21lck1vZGVsJywgJ1Nlc3Npb25Nb2RlbCcsIChTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBDdXN0b21lck1vZGVsLCBTZXNzaW9uTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DdXN0b21lck1hbmFnZXIoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCwgU2Vzc2lvbk1vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdDaGF0TWFuYWdlcicsIFsnQW5hbHl0aWNzTW9kZWwnLCAnQ2hhdE1vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdTb2NrZXRDbGllbnQnLCAoQW5hbHl0aWNzTW9kZWwsIENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgU29ja2V0Q2xpZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2hhdE1hbmFnZXIoQW5hbHl0aWNzTW9kZWwsIENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgU29ja2V0Q2xpZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEYXRhTWFuYWdlcicsIFsnRGF0YVByb3ZpZGVyJywgJ0xvZ2dlcicsICdTTkFQRW52aXJvbm1lbnQnLCAoRGF0YVByb3ZpZGVyLCBMb2dnZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRhdGFNYW5hZ2VyKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0RpYWxvZ01hbmFnZXInLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuRGlhbG9nTWFuYWdlcigpO1xuICB9KVxuICAuZmFjdG9yeSgnTG9jYXRpb25NYW5hZ2VyJywgWydEYXRhUHJvdmlkZXInLCAnRHRzQXBpJywgJ0xvY2F0aW9uTW9kZWwnLCAnTG9nZ2VyJywgKERhdGFQcm92aWRlciwgRHRzQXBpLCBMb2NhdGlvbk1vZGVsLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Mb2NhdGlvbk1hbmFnZXIoRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnTmF2aWdhdGlvbk1hbmFnZXInLCBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyR3aW5kb3cnLCAnQW5hbHl0aWNzTW9kZWwnLCAoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBBbmFseXRpY3NNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLk5hdmlnYXRpb25NYW5hZ2VyKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ09yZGVyTWFuYWdlcicsIFsnQ2hhdE1vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnRHRzQXBpJywgJ09yZGVyTW9kZWwnLCAoQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBEdHNBcGksIE9yZGVyTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5PcmRlck1hbmFnZXIoQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBEdHNBcGksIE9yZGVyTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1Nlc3Npb25NYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ09yZGVyTW9kZWwnLCAnU3VydmV5TW9kZWwnLCAnU3RvcmFnZVByb3ZpZGVyJywgJ0xvZ2dlcicsIChTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgU3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uTWFuYWdlcihTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgU3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NoZWxsTWFuYWdlcicsIFsnJHNjZScsICdEYXRhUHJvdmlkZXInLCAnU2hlbGxNb2RlbCcsICdTTkFQTG9jYXRpb24nLCAnU05BUEVudmlyb25tZW50JywgJ1NOQVBIb3N0cycsICgkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpID0+IHtcbiAgICBsZXQgbWFuYWdlciA9IG5ldyBhcHAuU2hlbGxNYW5hZ2VyKCRzY2UsIERhdGFQcm92aWRlciwgU2hlbGxNb2RlbCwgU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cyk7XG4gICAgRGF0YVByb3ZpZGVyLl9nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBtYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pOyAvL1RvRG86IHJlZmFjdG9yXG4gICAgcmV0dXJuIG1hbmFnZXI7XG4gIH1dKVxuICAuZmFjdG9yeSgnU29jaWFsTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgJ0R0c0FwaScsICdXZWJCcm93c2VyJywgJ0xvZ2dlcicsIChTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU29jaWFsTWFuYWdlcihTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2Z0d2FyZU1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsIChTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2Z0d2FyZU1hbmFnZXIoU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTdXJ2ZXlNYW5hZ2VyJywgWydEYXRhUHJvdmlkZXInLCAnU3VydmV5TW9kZWwnLCAoRGF0YVByb3ZpZGVyLCBTdXJ2ZXlNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlN1cnZleU1hbmFnZXIoRGF0YVByb3ZpZGVyLCBTdXJ2ZXlNb2RlbCk7XG4gIH1dKTtcbiJdfQ==
