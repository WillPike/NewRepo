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
      main_application: { 'client_id': 'd67610b1c91044d8abd55cbda6c619f0', 'callback_url': 'http://locahost/callback/api', 'scope': '' },
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
//# sourceMappingURL=data:application/json;base64,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QUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUNuRSxTQUFPLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNqRCxDQUFDLENBQUMsQ0FDRixPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxVQUFDLFlBQVksRUFBRSxXQUFXLEVBQUs7QUFDdkYsU0FBTyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQ3pELENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlbXAvc25hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vc3JjL2pzL3NoYXJlZC9fYmFzZS5qc1xuXG53aW5kb3cuYXBwID0ge307XG5cbnZhciBBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUiA9IDEsXG4gICAgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQgPSAxMCxcbiAgICBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQgPSAxMSxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQgPSAyMCxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEID0gMjEsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UID0gMzAsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCA9IDMxLFxuICAgIEFMRVJUX1NJR05JTl9SRVFVSVJFRCA9IDQwLFxuICAgIEFMRVJUX1RBQkxFX1JFU0VUID0gNTAsXG4gICAgQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSA9IDUxLFxuICAgIEFMRVJUX1RBQkxFX0NMT1NFT1VUID0gNTIsXG4gICAgQUxFUlRfR0VORVJJQ19FUlJPUiA9IDEwMCxcbiAgICBBTEVSVF9ERUxFVF9DQVJEID0gMjAwLFxuICAgIEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFID0gMjEwLFxuICAgIEFMRVJUX1NPRlRXQVJFX09VVERBVEVEID0gMjIwLFxuICAgIEFMRVJUX0NBUkRSRUFERVJfRVJST1IgPSAzMTAsXG4gICAgQUxFUlRfRVJST1JfTk9fU0VBVCA9IDQxMCxcbiAgICBBTEVSVF9FUlJPUl9TVEFSVFVQID0gNTEwO1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2FuYWx5dGljc2RhdGEuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NEYXRhID0gY2xhc3MgQW5hbHl0aWNzRGF0YSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHN0b3JhZ2VQcm92aWRlciwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlIHx8ICgoKSA9PiBbXSk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RlZmF1bHRWYWx1ZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2FuYWx5dGljc18nICsgbmFtZSk7XG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4oZGF0YSA9PiBzZWxmLl9kYXRhID0gZGF0YSB8fCBzZWxmLl9kYXRhKTtcbiAgfVxuXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG5cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gIH1cblxuICBzZXQgZGF0YSh2YWx1ZSkge1xuICAgIHRoaXMuX2RhdGEgPSB2YWx1ZTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5sZW5ndGg7XG4gIH1cblxuICBnZXQgbGFzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVt0aGlzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgcHVzaChpdGVtKSB7XG4gICAgdGhpcy5fZGF0YS5wdXNoKGl0ZW0pO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGVmYXVsdFZhbHVlKCk7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIHN0b3JlKCkge1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX2RhdGEpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2NhcnRpdGVtLmpzXG5cbndpbmRvdy5hcHAuQ2FydEl0ZW0gPSBjbGFzcyBDYXJ0SXRlbSB7XG4gIGNvbnN0cnVjdG9yKGl0ZW0sIHF1YW50aXR5LCBuYW1lLCBtb2RpZmllcnMsIHJlcXVlc3QpIHtcbiAgICB0aGlzLml0ZW0gPSBpdGVtO1xuICAgIHRoaXMucXVhbnRpdHkgPSBxdWFudGl0eTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgICBpZiAoIXRoaXMuaGFzTW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICghbW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IGl0ZW0ubW9kaWZpZXJzLm1hcChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeShjYXRlZ29yeSwgY2F0ZWdvcnkuaXRlbXMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyKG1vZGlmaWVyKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhhc01vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtLm1vZGlmaWVycyAhPSBudWxsICYmIHRoaXMuaXRlbS5tb2RpZmllcnMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZE1vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnMucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzQ2F0ZWdvcnksIGNhdGVnb3J5LCBpLCBhcnJheSkge1xuICAgICAgcmV0dXJuIGFycmF5LmNvbmNhdChjYXRlZ29yeS5pdGVtcy5maWx0ZXIoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgICB9KSk7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgY2xvbmUoY291bnQpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgIHRoaXMuaXRlbSxcbiAgICAgIHRoaXMucXVhbnRpdHksXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICB0aGlzLm1vZGlmaWVycy5tYXAoY2F0ZWdvcnkgPT4gY2F0ZWdvcnkuY2xvbmUoKSksXG4gICAgICB0aGlzLnJlcXVlc3QpO1xuICB9XG5cbiAgY2xvbmVNYW55KGNvdW50KSB7XG4gICAgY291bnQgPSBjb3VudCB8fCB0aGlzLnF1YW50aXR5O1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2gobmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgICAgdGhpcy5pdGVtLFxuICAgICAgICAxLFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMubW9kaWZpZXJzLm1hcChjYXRlZ29yeSA9PiBjYXRlZ29yeS5jbG9uZSgpKSxcbiAgICAgICAgdGhpcy5yZXF1ZXN0KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcmVzdG9yZShkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydEl0ZW0oXG4gICAgICBkYXRhLml0ZW0sXG4gICAgICBkYXRhLnF1YW50aXR5LFxuICAgICAgZGF0YS5uYW1lLFxuICAgICAgZGF0YS5tb2RpZmllcnMubWFwKGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUucmVzdG9yZSksXG4gICAgICBkYXRhLnJlcXVlc3RcbiAgICApO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL2NhcnRtb2RpZmllci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcnRNb2RpZmllclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXIgPSBmdW5jdGlvbihkYXRhLCBpc1NlbGVjdGVkKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkIHx8IGZhbHNlO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIodGhpcy5kYXRhLCB0aGlzLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIoZGF0YS5kYXRhLCBkYXRhLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyID0gQ2FydE1vZGlmaWVyO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJ0TW9kaWZpZXJDYXRlZ29yeVxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXJDYXRlZ29yeSA9IGZ1bmN0aW9uKGRhdGEsIG1vZGlmaWVycykge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGlmaWVycyA9IHRoaXMubW9kaWZpZXJzLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgcmV0dXJuIG1vZGlmaWVyLmNsb25lKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkodGhpcy5kYXRhLCBtb2RpZmllcnMpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KGRhdGEuZGF0YSwgZGF0YS5tb2RpZmllcnMubWFwKENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSkpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkgPSBDYXJ0TW9kaWZpZXJDYXRlZ29yeTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9kb21haW4vcmVxdWVzdHdhdGNoZXIuanNcblxud2luZG93LmFwcC5SZXF1ZXN0V2F0Y2hlciA9IGNsYXNzIFJlcXVlc3RXYXRjaGVyIHtcbiAgY29uc3RydWN0b3IodGlja2V0LCBEdHNBcGkpIHtcbiAgICB0aGlzLl90b2tlbiA9IHRpY2tldC50b2tlbjtcbiAgICB0aGlzLl9yZW1vdGUgPSBEdHNBcGk7XG5cbiAgICB0aGlzLlBPTExJTkdfSU5URVJWQUwgPSA1MDAwO1xuXG4gICAgdGhpcy5SRVFVRVNUX1NUQVRVU19QRU5ESU5HID0gMTtcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX1JFQ0VJVkVEID0gMjtcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX0FDQ0VQVEVEID0gMztcbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX0VYUElSRUQgPSAyNTU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX3N0YXR1c1VwZGF0ZVJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdGlja2V0ID0geyBzdGF0dXM6IDAgfTtcbiAgICB0aGlzLl93YXRjaFN0YXR1cygpO1xuICB9XG5cbiAgZ2V0IHRva2VuKCkge1xuICAgIHJldHVybiB0aGlzLl90b2tlbjtcbiAgfVxuXG4gIGdldCB0aWNrZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpY2tldDtcbiAgfVxuXG4gIGdldCBwcm9taXNlKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9taXNlO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fdGltZW91dElkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RpY2tldC5zdGF0dXMgPCB0aGlzLlJFUVVFU1RfU1RBVFVTX0FDQ0VQVEVEKSB7XG4gICAgICB0aGlzLl9zdGF0dXNVcGRhdGVSZWplY3QoKTtcbiAgICB9XG4gIH1cblxuICBfd2F0Y2hTdGF0dXMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3RpbWVvdXRJZCkge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dChzZWxmLl90aW1lb3V0SWQpO1xuICAgIH1cblxuICAgIHZhciBvblRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICBzZWxmLl9yZW1vdGUud2FpdGVyLmdldFN0YXR1cyhzZWxmLl90b2tlbikudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHNlbGYuX3NldFRpY2tldChyZXNwb25zZSk7XG4gICAgICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgPT09IHNlbGYuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQpIHtcbiAgICAgIHNlbGYuX3N0YXR1c1VwZGF0ZVJlc29sdmUoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyAhPT0gc2VsZi5SRVFVRVNUX1NUQVRVU19FWFBJUkVEKSB7XG4gICAgICBzZWxmLl90aW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dChvblRpbWVvdXQsIHRoaXMuUE9MTElOR19JTlRFUlZBTCk7XG4gICAgfVxuICB9XG5cbiAgX3NldFRpY2tldCh2YWx1ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzID09PSB2YWx1ZS5zdGF0dXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLl90aWNrZXQgPSB2YWx1ZTtcbiAgICBzZWxmLl93YXRjaFN0YXR1cygpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZG9tYWluL3dlYmJyb3dzZXJyZWZlcmVuY2UuanNcblxud2luZG93LmFwcC5XZWJCcm93c2VyUmVmZXJlbmNlID0gY2xhc3MgV2ViQnJvd3NlclJlZmVyZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGJyb3dzZXJSZWYpIHtcbiAgICB0aGlzLmJyb3dzZXIgPSBicm93c2VyUmVmO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uRXhpdCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DYWxsYmFjayA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZXhpdCgpIHtcbiAgICB0aGlzLm9uRXhpdC5kaXNwYXRjaCgpO1xuICB9XG59O1xuXG5cbndpbmRvdy5hcHAuQ29yZG92YVdlYkJyb3dzZXJSZWZlcmVuY2UgPSBjbGFzcyBDb3Jkb3ZhV2ViQnJvd3NlclJlZmVyZW5jZSBleHRlbmRzIGFwcC5XZWJCcm93c2VyUmVmZXJlbmNlIHtcbiAgY29uc3RydWN0b3IoYnJvd3NlclJlZikge1xuICAgIHN1cGVyKGJyb3dzZXJSZWYpO1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIG9uTG9hZFN0YXJ0KGV2ZW50KSB7XG4gICAgICBzZWxmLm9uTmF2aWdhdGVkLmRpc3BhdGNoKGV2ZW50LnVybCk7XG4gICAgfVxuICAgIHRoaXMuX29uTG9hZFN0YXJ0ID0gb25Mb2FkU3RhcnQ7XG5cbiAgICBmdW5jdGlvbiBvbkV4aXQoKSB7XG4gICAgICBicm93c2VyUmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIG9uTG9hZFN0YXJ0KTtcbiAgICAgIGJyb3dzZXJSZWYucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXhpdCcsIG9uRXhpdCk7XG4gICAgICBzZWxmLm9uRXhpdC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgICB0aGlzLl9vbkV4aXQgPSBvbkV4aXQ7XG5cbiAgICB0aGlzLmJyb3dzZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0Jywgb25Mb2FkU3RhcnQpO1xuICAgIHRoaXMuYnJvd3Nlci5hZGRFdmVudExpc3RlbmVyKCdleGl0Jywgb25FeGl0KTtcbiAgfVxuXG4gIGV4aXQoKSB7XG4gICAgc3VwZXIuZXhpdCgpO1xuXG4gICAgdGhpcy5fZGlzcG9zZSgpO1xuICAgIHRoaXMuYnJvd3Nlci5jbG9zZSgpO1xuICB9XG5cbiAgX2Rpc3Bvc2UoKSB7XG4gICAgdGhpcy5vbk5hdmlnYXRlZC5kaXNwb3NlKCk7XG4gICAgdGhpcy5vbkV4aXQuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5icm93c2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsIHRoaXMuX29uTG9hZFN0YXJ0KTtcbiAgICB0aGlzLmJyb3dzZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXhpdCcsIHRoaXMuX29uRXhpdCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9hY3Rpdml0eW1vbml0b3IuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBY3Rpdml0eU1vbml0b3IgPSBmdW5jdGlvbigkcm9vdFNjb3BlLCAkdGltZW91dCkge1xuICAgIHRoaXMuJCRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgIHRoaXMuJCR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgdGhpcy5fdGltZW91dCA9IDEwMDAwO1xuXG4gICAgdGhpcy5fYWN0aXZlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLiQkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuICAgICAgICBzZWxmLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICB9O1xuXG4gIEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ3RpbWVvdXQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3RpbWVvdXQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdlbmFibGVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9lbmFibGVkOyB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5fZW5hYmxlZCA9IHZhbHVlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl90aW1lciAhPSBudWxsOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlQ2hhbmdlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fYWN0aXZlQ2hhbmdlZDsgfVxuICB9KTtcblxuICBBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLmFjdGl2aXR5RGV0ZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hhbmdlZDtcblxuICAgIGlmICh0aGlzLl90aW1lcikge1xuICAgICAgdGhpcy4kJHRpbWVvdXQuY2FuY2VsKHRoaXMuX3RpbWVyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fdGltZXIgPT09IG51bGwpIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBvblRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX3RpbWVyID0gbnVsbDtcblxuICAgICAgc2VsZi4kJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLmVuYWJsZWQpIHtcbiAgICAgICAgICBzZWxmLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5hY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdGltZXIgPSB0aGlzLiQkdGltZW91dChvblRpbWVvdXQsIHRoaXMuX3RpbWVvdXQpO1xuXG4gICAgaWYgKGNoYW5nZWQgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmUpO1xuICAgIH1cbiAgfTtcblxuICB3aW5kb3cuYXBwLkFjdGl2aXR5TW9uaXRvciA9IEFjdGl2aXR5TW9uaXRvcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9hbmFseXRpY3NtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQW5hbHl0aWNzTWFuYWdlciA9IGNsYXNzIEFuYWx5dGljc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihUZWxlbWV0cnlTZXJ2aWNlLCBBbmFseXRpY3NNb2RlbCwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fVGVsZW1ldHJ5U2VydmljZSA9IFRlbGVtZXRyeVNlcnZpY2U7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH1cblxuICBzdWJtaXQoKSB7XG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTdWJtaXR0aW5nIGFuYWx5dGljcyBkYXRhIHdpdGggYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5zZXNzaW9ucy5sZW5ndGh9IHNlYXQgc2Vzc2lvbnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuYW5zd2Vycy5sZW5ndGh9IGFuc3dlcnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY2hhdHMubGVuZ3RofSBjaGF0cywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jb21tZW50cy5sZW5ndGh9IGNvbW1lbnRzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNsaWNrcy5sZW5ndGh9IGNsaWNrcywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5wYWdlcy5sZW5ndGh9IHBhZ2VzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmFkdmVydGlzZW1lbnRzLmxlbmd0aH0gYWR2ZXJ0aXNlbWVudHMgYW5kIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwudXJscy5sZW5ndGh9IFVSTHMuYCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX1RlbGVtZXRyeVNlcnZpY2Uuc3VibWl0VGVsZW1ldHJ5KHtcbiAgICAgICAgc2Vzc2lvbnM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnNlc3Npb25zLmRhdGEsXG4gICAgICAgIGFkdmVydGlzZW1lbnRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hZHZlcnRpc2VtZW50cy5kYXRhLFxuICAgICAgICBhbnN3ZXJzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hbnN3ZXJzLmRhdGEsXG4gICAgICAgIGNoYXRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jaGF0cy5kYXRhLFxuICAgICAgICBjb21tZW50czogc2VsZi5fQW5hbHl0aWNzTW9kZWwuY29tbWVudHMuZGF0YSxcbiAgICAgICAgY2xpY2tzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jbGlja3MuZGF0YSxcbiAgICAgICAgcGFnZXM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnBhZ2VzLmRhdGEsXG4gICAgICAgIHVybHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnVybHMuZGF0YVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0FuYWx5dGljc01vZGVsLmNsZWFyKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIGUgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIud2FybignVW5hYmxlIHRvIHN1Ym1pdCBhbmFseXRpY3MgZGF0YTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvYXV0aGVudGljYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQXV0aGVudGljYXRpb25NYW5hZ2VyID0gY2xhc3MgQXV0aGVudGljYXRpb25NYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKEJhY2tlbmRBcGksIFNlc3Npb25Nb2RlbCwgU05BUEVudmlyb25tZW50LCBXZWJCcm93c2VyLCBMb2dnZXIpIHtcbiAgICB0aGlzLl9CYWNrZW5kQXBpID0gQmFja2VuZEFwaTtcbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX1dlYkJyb3dzZXIgPSBXZWJCcm93c2VyO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgfVxuXG4gIHZhbGlkYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbW9kZWwgPSBzZWxmLl9TZXNzaW9uTW9kZWw7XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ1ZhbGlkYXRpbmcgYWNjZXNzIHRva2VuLi4uJyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbW9kZWwuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICB2YXIgdG9rZW4gPSBtb2RlbC5hcGlUb2tlbjtcblxuICAgICAgICBpZiAoIXRva2VuIHx8ICFzZWxmLl92YWxpZGF0ZVRva2VuKHRva2VuKSkge1xuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXphdGlvbiBpcyBub3QgdmFsaWQuJyk7XG4gICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdWYWxpZGF0aW5nIGF1dGhvcml6YXRpb24gc2Vzc2lvbi4uLicpO1xuXG4gICAgICAgICAgc2VsZi5fQmFja2VuZEFwaS5vYXV0aDIuZ2V0U2Vzc2lvbigpLnRoZW4oc2Vzc2lvbiA9PiB7XG4gICAgICAgICAgICBzZXNzaW9uID0gVVJJKCc/JyArIHNlc3Npb24pLnF1ZXJ5KHRydWUpOyAvL1RvRG86IHJlbW92ZSB0aGlzIGhhY2tcblxuICAgICAgICAgICAgaWYgKHNlc3Npb24gJiYgc2Vzc2lvbi52YWxpZCA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXphdGlvbiBpcyB2YWxpZC4nLCBzZXNzaW9uKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0F1dGhvcml6YXRpb24gaXMgbm90IHZhbGlkIG9yIGV4cGlyZWQuJywgc2Vzc2lvbik7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZSA9PiB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1VuYWJsZSB0byB2YWxpZGF0ZSBhdXRob3JpemF0aW9uLicsIGUpO1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGUgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0Vycm9yIHZhbGlkYXRpbmcgYXV0aG9yaXphdGlvbi4nLCBlKTtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXV0aG9yaXplKCkge1xuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQXV0aG9yaXppbmcgQVBJIGFjY2Vzcy4uLicpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgdmFyIGFwcGxpY2F0aW9uID0gc2VsZi5fU05BUEVudmlyb25tZW50Lm1haW5fYXBwbGljYXRpb24sXG4gICAgICAgICAgICBhdXRoVXJsID0gc2VsZi5fQmFja2VuZEFwaS5vYXV0aDIuZ2V0VG9rZW5BdXRob3JpemVVcmwoYXBwbGljYXRpb24uY2xpZW50X2lkLCBhcHBsaWNhdGlvbi5jYWxsYmFja191cmwsIGFwcGxpY2F0aW9uLnNjb3BlKTtcblxuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4oYXV0aFVybCwgeyBzeXN0ZW06IHRydWUgfSkudGhlbihicm93c2VyID0+IHtcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVDYWxsYmFjayh1cmwpIHtcbiAgICAgICAgICAgIGlmICh1cmwuaW5kZXhPZihhcHBsaWNhdGlvbi5jYWxsYmFja191cmwpICE9PSAwKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJvd3Nlci5leGl0KCk7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFja1Jlc3BvbnNlID0gdXJsLnNwbGl0KCcjJylbMV0sXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VQYXJhbWV0ZXJzID0gY2FsbGJhY2tSZXNwb25zZS5zcGxpdCgnJicpLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlck1hcCA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBwYXJhbWV0ZXJNYXBbcmVzcG9uc2VQYXJhbWV0ZXJzW2ldLnNwbGl0KCc9JylbMF1dID0gcmVzcG9uc2VQYXJhbWV0ZXJzW2ldLnNwbGl0KCc9JylbMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJNYXAuYWNjZXNzX3Rva2VuICE9PSB1bmRlZmluZWQgJiYgcGFyYW1ldGVyTWFwLmFjY2Vzc190b2tlbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICB2YXIgdG9rZW4gPSB7XG4gICAgICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBwYXJhbWV0ZXJNYXAuYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgICAgIGV4cGlyZXNfaW46IHBhcmFtZXRlck1hcC5leHBpcmVzX2luXG4gICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdOZXcgYWNjZXNzIHRva2VuIGlzc3VlZC4nLCB0b2tlbik7XG5cbiAgICAgICAgICAgICAgc2VsZi5fU2Vzc2lvbk1vZGVsLmFwaVRva2VuID0gdG9rZW47XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdQcm9ibGVtIGlzc3VpbmcgbmV3IGFjY2VzcyB0b2tlbi4nLCBwYXJhbWV0ZXJNYXApO1xuICAgICAgICAgICAgcmVqZWN0KCdQcm9ibGVtIGF1dGhlbnRpY2F0aW5nOiAnICsgdXJsKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicm93c2VyLm9uQ2FsbGJhY2suYWRkKHVybCA9PiBoYW5kbGVDYWxsYmFjayh1cmwpKTtcbiAgICAgICAgICBicm93c2VyLm9uTmF2aWdhdGVkLmFkZCh1cmwgPT4gaGFuZGxlQ2FsbGJhY2sodXJsKSk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY3VzdG9tZXJMb2dpblJlZ3VsYXIoY3JlZGVudGlhbHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBhcHBsaWNhdGlvbiA9IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcbiAgICAgIHNlbGYuX0JhY2tlbmRBcGkub2F1dGgyLmdldFRva2VuV2l0aENyZWRlbnRpYWxzKFxuICAgICAgICBhcHBsaWNhdGlvbi5jbGllbnRfaWQsXG4gICAgICAgIGNyZWRlbnRpYWxzLmxvZ2luLFxuICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZFxuICAgICAgKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5lcnJvciB8fCAhcmVzdWx0LmFjY2Vzc190b2tlbikge1xuICAgICAgICAgIHJldHVybiByZWplY3QocmVzdWx0LmVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICAgIGFjY2Vzc190b2tlbjogcmVzdWx0LmFjY2Vzc190b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQuZXhwaXJlc19pbikge1xuICAgICAgICAgIHNlc3Npb24uZXhwaXJlcyA9IG1vbWVudCgpLmFkZChyZXN1bHQuZXhwaXJlc19pbiwgJ3NlY29uZHMnKS51bml4KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IHNlc3Npb247XG5cbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN1c3RvbWVyTG9naW5Tb2NpYWwodG9rZW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuLmFjY2Vzc190b2tlblxuICAgICAgfTtcblxuICAgICAgaWYgKHRva2VuLmV4cGlyZXNfaW4pIHtcbiAgICAgICAgc2Vzc2lvbi5leHBpcmVzID0gbW9tZW50KCkuYWRkKHRva2VuLmV4cGlyZXNfaW4sICdzZWNvbmRzJykudW5peCgpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IHNlc3Npb247XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF92YWxpZGF0ZVRva2VuKHRva2VuKSB7XG4gICAgaWYgKCF0b2tlbiB8fCAhdG9rZW4uYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAodG9rZW4uZXhwaXJlcykge1xuICAgICAgdmFyIGV4cGlyZXMgPSBtb21lbnQudW5peCh0b2tlbi5leHBpcmVzKTtcblxuICAgICAgaWYgKGV4cGlyZXMuaXNCZWZvcmUobW9tZW50KCkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2NoYXRtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQ2hhdE1hbmFnZXIgPSBjbGFzcyBDaGF0TWFuYWdlciB7XG4gIC8qIGdsb2JhbCBtb21lbnQsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLk1FU1NBR0VfVFlQRVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uJyxcbiAgICAgIERFVklDRTogJ2RldmljZSdcbiAgICB9O1xuICAgIHRoaXMuTUVTU0FHRV9TVEFUVVNFUyA9IHtcbiAgICAgIENIQVRfUkVRVUVTVDogJ2NoYXRfcmVxdWVzdCcsXG4gICAgICBDSEFUX1JFUVVFU1RfQUNDRVBURUQ6ICdjaGF0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOiAnY2hhdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIEdJRlRfUkVRVUVTVDogJ2dpZnRfcmVxdWVzdCcsXG4gICAgICBHSUZUX1JFUVVFU1RfQUNDRVBURUQ6ICdnaWZ0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOiAnZ2lmdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIENIQVRfQ0xPU0VEOiAnY2hhdF9jbG9zZWQnXG4gICAgfTtcbiAgICB0aGlzLk9QRVJBVElPTlMgPSB7XG4gICAgICBDSEFUX01FU1NBR0U6ICdjaGF0X21lc3NhZ2UnLFxuICAgICAgU1RBVFVTX1JFUVVFU1Q6ICdzdGF0dXNfcmVxdWVzdCcsXG4gICAgICBTVEFUVVNfVVBEQVRFOiAnc3RhdHVzX3VwZGF0ZSdcbiAgICB9O1xuICAgIHRoaXMuUk9PTVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uXycsXG4gICAgICBERVZJQ0U6ICdkZXZpY2VfJ1xuICAgIH07XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQgPSBTb2NrZXRDbGllbnQ7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNQcmVzZW50Q2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuaXNDb25uZWN0ZWRDaGFuZ2VkLmFkZChpc0Nvbm5lY3RlZCA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmlzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCk7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzUmVxdWVzdCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnN1YnNjcmliZSh0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbi50b2tlbiwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19SRVFVRVNUOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzUmVxdWVzdChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURTpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zdWJzY3JpYmUodGhpcy5ST09NUy5ERVZJQ0UgKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19VUERBVEU6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNVcGRhdGUobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0NoYXRNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubW9kZWwucmVzZXQoKTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTWVzc2FnaW5nXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5kZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZTtcbiAgICBtZXNzYWdlLm9wZXJhdGlvbiA9IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0U7XG4gICAgbWVzc2FnZS50eXBlID0gbWVzc2FnZS50b19kZXZpY2UgP1xuICAgICAgdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSA6XG4gICAgICB0aGlzLk1FU1NBR0VfVFlQRVMuTE9DQVRJT047XG5cbiAgICB0aGlzLl9hZGRNZXNzYWdlSUQobWVzc2FnZSk7XG4gICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KG1lc3NhZ2UpO1xuXG4gICAgdmFyIHRvcGljID0gdGhpcy5fZ2V0VG9waWMobWVzc2FnZSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0b3BpYywgbWVzc2FnZSk7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nQ2hhdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFwcHJvdmVEZXZpY2UodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgdGhpcy5tb2RlbC5zZXRMYXN0UmVhZCh0b2tlbiwgbW9tZW50KCkudW5peCgpKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzUGVuZGluZ0RldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZVBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcblxuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1QsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5hZGRBY3RpdmVEZXZpY2UoZGV2aWNlKTtcbiAgICB9XG4gIH1cblxuICBkZWNsaW5lRGV2aWNlKHRva2VuKSB7XG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRva2VuKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSk7XG5cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRNZXNzYWdlTmFtZShtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgcmV0dXJuICdNZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2UudXNlcm5hbWUgfHwgdGhpcy5nZXREZXZpY2VOYW1lKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIGdldERldmljZU5hbWUodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgaWYgKGRldmljZSkge1xuICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBkZXZpY2UudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICdNZSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZXZpY2UudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZS51c2VybmFtZTtcbiAgICAgIH1cblxuICAgICAgZm9yKHZhciBwIGluIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHMpIHtcbiAgICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0udG9rZW4gPT09IGRldmljZS5zZWF0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0ubmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBOb3RpZmljYXRpb25zXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjaGVja0lmVW5yZWFkKGRldmljZV90b2tlbiwgbWVzc2FnZSkge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1vbWVudC51bml4KG1lc3NhZ2UucmVjZWl2ZWQpLmlzQWZ0ZXIobW9tZW50LnVuaXgobGFzdFJlYWQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pID4gMDtcbiAgfVxuXG4gIGdldFVucmVhZENvdW50KGRldmljZV90b2tlbikge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZnJvbURhdGUgPSBtb21lbnQudW5peChsYXN0UmVhZCk7XG5cbiAgICByZXR1cm4gdGhpcy5tb2RlbC5oaXN0b3J5XG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS50eXBlID09PSBzZWxmLk1FU1NBR0VfVFlQRVMuREVWSUNFICYmIG1lc3NhZ2UuZGV2aWNlID09PSBkZXZpY2VfdG9rZW4pXG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbW9tZW50LnVuaXgobWVzc2FnZS5yZWNlaXZlZCkuaXNBZnRlcihmcm9tRGF0ZSkpXG4gICAgICAubGVuZ3RoO1xuICB9XG5cbiAgbWFya0FzUmVhZChkZXZpY2VfdG9rZW4pIHtcbiAgICB0aGlzLm1vZGVsLnNldExhc3RSZWFkKGRldmljZV90b2tlbiwgbW9tZW50KCkudW5peCgpKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgR2lmdHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNlbmRHaWZ0KGl0ZW1zKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmdpZnREZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCxcbiAgICAgIHRvX2RldmljZTogdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgdGV4dDogaXRlbXMucmVkdWNlKChyZXN1bHQsIGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgICByZXN1bHQgKz0gJywgJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gaXRlbS5pdGVtLnRpdGxlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgJycpXG4gICAgfSk7XG4gIH1cblxuICBhY2NlcHRHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIGRlY2xpbmVHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0R2lmdChkZXZpY2VfdG9rZW4pIHtcbiAgICBsZXQgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKTtcblxuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IGRldmljZV90b2tlbjtcbiAgICB0aGlzLm1vZGVsLmdpZnRTZWF0ID0gZGV2aWNlLnNlYXQ7XG4gIH1cblxuICBlbmRHaWZ0KCkge1xuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgdGhpcy5tb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX29uTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlLmlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZWwuaGlzdG9yeS5maWx0ZXIobXNnID0+IG1zZy5pZCA9PT0gbWVzc2FnZS5pZCkubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lc3NhZ2UucmVjZWl2ZWQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpLFxuICAgICAgICBnaWZ0RGV2aWNlID0gdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgICBzZWF0ID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmFkZFBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UudG9rZW4pO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCAmJlxuICAgICAgICB0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuZ2lmdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UsIG1lc3NhZ2UudGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlKSB7XG4gICAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgICAgaWYgKGdpZnREZXZpY2UgJiYgZ2lmdERldmljZSA9PT0gbWVzc2FnZS5kZXZpY2UpIHtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnRBY2NlcHRlZC5kaXNwYXRjaCh0cnVlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICBpZiAoZ2lmdERldmljZSAmJiBnaWZ0RGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdEFjY2VwdGVkLmRpc3BhdGNoKGZhbHNlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICB0aGlzLmRlY2xpbmVEZXZpY2UoZGV2aWNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5vcGVyYXRpb24gPT09IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0UpIHtcbiAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSB0aGlzLmdldERldmljZU5hbWUoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuYWRkSGlzdG9yeShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5kaXNwYXRjaChtZXNzYWdlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1JlcXVlc3QobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZW5kU3RhdHVzVXBkYXRlKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSk7XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgZGV2aWNlID0ge1xuICAgICAgICB0b2tlbjogbWVzc2FnZS5kZXZpY2UsXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLmFkZERldmljZShkZXZpY2UpO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5pc19hdmFpbGFibGUgJiYgZGV2aWNlLmlzX2F2YWlsYWJsZSkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB7XG4gICAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRSxcbiAgICAgICAgdHlwZTogdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSxcbiAgICAgICAgZGV2aWNlOiBkZXZpY2UudG9rZW4sXG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VELFxuICAgICAgICB0b19kZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgICB9O1xuICAgICAgdGhpcy5fYWRkTWVzc2FnZUlEKGhpc3RvcnkpO1xuICAgICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KGhpc3RvcnkpO1xuICAgIH1cblxuICAgIGRldmljZS5pc19hdmFpbGFibGUgPSBCb29sZWFuKG1lc3NhZ2UuaXNfYXZhaWxhYmxlKTtcbiAgICBkZXZpY2UuaXNfcHJlc2VudCA9IEJvb2xlYW4obWVzc2FnZS5pc19wcmVzZW50KTtcbiAgICBkZXZpY2Uuc2VhdCA9IG1lc3NhZ2Uuc2VhdDtcbiAgICBkZXZpY2UudXNlcm5hbWUgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZXMpO1xuICB9XG5cbiAgX3NlbmRTdGF0dXNSZXF1ZXN0KCkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuU1RBVFVTX1JFUVVFU1QsXG4gICAgICBkZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgfTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRoaXMuX2dldFRvcGljKG1lc3NhZ2UpLCBtZXNzYWdlKTtcbiAgfVxuXG4gIF9zZW5kU3RhdHVzVXBkYXRlKGRldmljZSkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcm9maWxlID0gdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlLFxuICAgICAgICB1c2VybmFtZTtcblxuICAgIGlmIChwcm9maWxlICYmIHByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgdXNlcm5hbWUgPSBwcm9maWxlLmZpcnN0X25hbWUgKyAnICcgKyBwcm9maWxlLmxhc3RfbmFtZTtcbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLlNUQVRVU19VUERBVEUsXG4gICAgICB0b19kZXZpY2U6IGRldmljZSxcbiAgICAgIGRldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UsXG4gICAgICBzZWF0OiB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQudG9rZW4sXG4gICAgICBpc19hdmFpbGFibGU6IHRoaXMubW9kZWwuaXNFbmFibGVkLFxuICAgICAgaXNfcHJlc2VudDogdGhpcy5tb2RlbC5pc1ByZXNlbnQsXG4gICAgICB1c2VybmFtZTogdXNlcm5hbWVcbiAgICB9O1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodGhpcy5fZ2V0VG9waWMobWVzc2FnZSksIG1lc3NhZ2UpO1xuICB9XG5cbiAgX2dldFRvcGljKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBtZXNzYWdlLnRvX2RldmljZSA/XG4gICAgICAgIHRoaXMuUk9PTVMuREVWSUNFICsgbWVzc2FnZS50b19kZXZpY2UgOlxuICAgICAgICB0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbi50b2tlbjtcbiAgfVxuXG4gIF9hZGRNZXNzYWdlSUQobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuaWQgPSBtZXNzYWdlLmlkIHx8ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgYyA9PiB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNnwwLFxuICAgICAgICAgIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9jdXN0b21lcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5DdXN0b21lck1hbmFnZXIgPSBjbGFzcyBDdXN0b21lck1hbmFnZXIge1xuICAvKiBnbG9iYWwgbW9tZW50ICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBFbnZpcm9ubWVudCwgRHRzQXBpLCBDdXN0b21lck1vZGVsLCBTZXNzaW9uTW9kZWwpIHtcbiAgICB0aGlzLl9hcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fU2Vzc2lvbk1vZGVsID0gU2Vzc2lvbk1vZGVsO1xuICAgIHRoaXMuX2N1c3RvbWVyQXBwSWQgPSBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbi5jbGllbnRfaWQ7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0N1c3RvbWVyTW9kZWw7XG4gIH1cblxuICBnZXQgY3VzdG9tZXJOYW1lKCkge1xuICAgIGlmICh0aGlzLm1vZGVsLmlzRW5hYmxlZCAmJiB0aGlzLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICB2YXIgbmFtZSA9ICcnO1xuXG4gICAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgICBuYW1lICs9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmZpcnN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWUpIHtcbiAgICAgICAgbmFtZSArPSAnICcgKyBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgbG9nb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZWxmLl9TZXNzaW9uTW9kZWwuY3VzdG9tZXJUb2tlbiA9IG51bGw7XG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBudWxsO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZ3Vlc3RMb2dpbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gJ2d1ZXN0JztcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ2luKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2FkUHJvZmlsZSgpO1xuICB9XG5cbiAgbG9naW5Tb2NpYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvYWRQcm9maWxlKCk7XG4gIH1cblxuICBzaWduVXAocmVnaXN0cmF0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWdpc3RyYXRpb24uY2xpZW50X2lkID0gc2VsZi5fY3VzdG9tZXJBcHBJZDtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5zaWduVXAocmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5sb2dpbih7XG4gICAgICAgICAgbG9naW46IHJlZ2lzdHJhdGlvbi51c2VybmFtZSxcbiAgICAgICAgICBwYXNzd29yZDogcmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICAgIH0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVQcm9maWxlKHByb2ZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci51cGRhdGVQcm9maWxlKHByb2ZpbGUpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbmdlUGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLmNoYW5nZVBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogc2VsZi5fQ3VzdG9tZXJNb2RlbC5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcmVxdWVzdC5uZXdfcGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0UGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnJlc2V0UGFzc3dvcmQocmVxdWVzdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBfbG9hZFByb2ZpbGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuZ2V0UHJvZmlsZSgpLnRoZW4ocHJvZmlsZSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9kYXRhbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkRhdGFNYW5hZ2VyID0gY2xhc3MgRGF0YU1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcblxuICAgIHRoaXMuaG9tZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lbnVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jYXRlZ29yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLml0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9DQUNIRUFCTEVfTUVESUFfS0lORFMgPSBbXG4gICAgICA0MSwgNTEsIDU4LCA2MVxuICAgIF07XG4gIH1cblxuICBnZXQgcHJvdmlkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0RhdGFQcm92aWRlcjtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlID0ge1xuICAgICAgbWVudToge30sXG4gICAgICBjYXRlZ29yeToge30sXG4gICAgICBpdGVtOiB7fSxcbiAgICAgIG1lZGlhOiB7fVxuICAgIH07XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0luaXRpYWxpemluZyBkYXRhIG1hbmFnZXIuJyk7XG5cbiAgICB0aGlzLnByb3ZpZGVyLmRpZ2VzdCgpLnRoZW4oZGlnZXN0ID0+IHtcbiAgICAgIHZhciBtZW51U2V0cyA9IGRpZ2VzdC5tZW51X3NldHMubWFwKG1lbnUgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIubWVudShtZW51LnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5tZW51W21lbnUudG9rZW5dID0gc2VsZi5fZmlsdGVyTWVudShkYXRhKSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVudUNhdGVnb3JpZXMgPSBkaWdlc3QubWVudV9jYXRlZ29yaWVzLm1hcChjYXRlZ29yeSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5jYXRlZ29yeShjYXRlZ29yeS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuY2F0ZWdvcnlbY2F0ZWdvcnkudG9rZW5dID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoZGF0YSkpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lbnVJdGVtcyA9IGRpZ2VzdC5tZW51X2l0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLml0ZW0oaXRlbS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuaXRlbVtpdGVtLnRva2VuXSA9IGRhdGEpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lZGlhcyA9IGRpZ2VzdC5tZWRpYVxuICAgICAgICAuZmlsdGVyKG1lZGlhID0+IHNlbGYuX0NBQ0hFQUJMRV9NRURJQV9LSU5EUy5pbmRleE9mKG1lZGlhLmtpbmQpICE9PSAtMSlcbiAgICAgICAgLm1hcChtZWRpYSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgICBzd2l0Y2ggKG1lZGlhLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgICB3aWR0aCA9IDM3MDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gMzcwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgICAgIHdpZHRoID0gNjAwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSA2MDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2MTpcbiAgICAgICAgICAgICAgd2lkdGggPSAxMDA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWVkaWEud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBtZWRpYS5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICByZXR1cm4gbWVkaWE7XG4gICAgICAgIH0pXG4gICAgICAgIC5tYXAobWVkaWEgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzZWxmLnByb3ZpZGVyLm1lZGlhKG1lZGlhKVxuICAgICAgICAgICAgICAudGhlbihpbWcgPT4gc2VsZi5fY2FjaGUubWVkaWFbbWVkaWEudG9rZW5dID0gaW1nKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRGlnZXN0IGNvbnRhaW5zICR7bWVudVNldHMubGVuZ3RofSBtZW51cywgYCArXG4gICAgICAgIGAke21lbnVDYXRlZ29yaWVzLmxlbmd0aH0gY2F0ZWdvcmllcywgYCArXG4gICAgICAgIGAke21lbnVJdGVtcy5sZW5ndGh9IGl0ZW1zIGFuZCBgICtcbiAgICAgICAgYCR7bWVkaWFzLmxlbmd0aH0gZmlsZXMuYCk7XG5cbiAgICAgIHZhciB0YXNrcyA9IFtdXG4gICAgICAgIC5jb25jYXQobWVudVNldHMpXG4gICAgICAgIC5jb25jYXQobWVudUNhdGVnb3JpZXMpXG4gICAgICAgIC5jb25jYXQobWVudUl0ZW1zKTtcblxuICAgICAgUHJvbWlzZS5hbGwodGFza3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICBQcm9taXNlLmFsbChtZWRpYXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaG9tZSgpIHsgcmV0dXJuIHRoaXMuX2hvbWU7IH1cbiAgc2V0IGhvbWUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faG9tZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2hvbWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMucHJvdmlkZXIuaG9tZSgpLnRoZW4oaG9tZSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9ob21lKSB7XG4gICAgICAgICAgaG9tZSA9IHNlbGYuX2ZpbHRlckhvbWUoaG9tZSk7XG4gICAgICAgICAgc2VsZi5ob21lQ2hhbmdlZC5kaXNwYXRjaChob21lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5faG9tZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuaG9tZUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgbWVudSgpIHsgcmV0dXJuIHRoaXMuX21lbnU7IH1cbiAgc2V0IG1lbnUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fbWVudSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX21lbnUgPSB2YWx1ZTtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZWQoJ21lbnUnLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLm1lbnUodmFsdWUpLnRoZW4obWVudSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9tZW51KSB7XG4gICAgICAgICAgbWVudSA9IHNlbGYuX2ZpbHRlck1lbnUobWVudSk7XG4gICAgICAgICAgc2VsZi5tZW51Q2hhbmdlZC5kaXNwYXRjaChtZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fbWVudSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMubWVudUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2F0ZWdvcnkoKSB7IHJldHVybiB0aGlzLl9jYXRlZ29yeTsgfVxuICBzZXQgY2F0ZWdvcnkodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2F0ZWdvcnkgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9jYXRlZ29yeSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnY2F0ZWdvcnknLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5jYXRlZ29yeSh2YWx1ZSkudGhlbihjYXRlZ29yeSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9jYXRlZ29yeSkge1xuICAgICAgICAgIGNhdGVnb3J5ID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgIHNlbGYuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKGNhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fY2F0ZWdvcnkgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBpdGVtKCkgeyByZXR1cm4gdGhpcy5faXRlbTsgfVxuICBzZXQgaXRlbSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pdGVtID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5faXRlbSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnaXRlbScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIuaXRlbSh2YWx1ZSkudGhlbihpdGVtID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2l0ZW0pIHtcbiAgICAgICAgICBzZWxmLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9pdGVtID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5pdGVtQ2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZWQoZ3JvdXAsIGlkKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSAmJiB0aGlzLl9jYWNoZVtncm91cF1baWRdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW2dyb3VwXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9maWx0ZXJIb21lKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZGF0YS5tZW51cyA9IGRhdGEubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBzZWxmLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyTWVudShkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyQ2F0ZWdvcnkoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkYXRhLml0ZW1zID0gZGF0YS5pdGVtc1xuICAgICAgLmZpbHRlcihpdGVtID0+IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IGl0ZW0udHlwZSAhPT0gMyk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL2RpYWxvZ21hbmFnZXIuanNcblxud2luZG93LmFwcC5EaWFsb2dNYW5hZ2VyID0gY2xhc3MgRGlhbG9nTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWxlcnRSZXF1ZXN0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvblJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY29uZmlybVJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1vZGFsU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubW9kYWxFbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2pvYnMgPSAwO1xuICAgIHRoaXMuX21vZGFscyA9IDA7XG4gIH1cblxuICBnZXQgam9icygpIHsgcmV0dXJuIHRoaXMuX2pvYnM7IH1cbiAgZ2V0IG1vZGFscygpIHsgcmV0dXJuIHRoaXMuX21vZGFsczsgfVxuXG4gIGFsZXJ0KG1lc3NhZ2UsIHRpdGxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLmFsZXJ0UmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHRpdGxlLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgbm90aWZpY2F0aW9uKG1lc3NhZ2UpIHtcbiAgICB0aGlzLm5vdGlmaWNhdGlvblJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlKTtcbiAgfVxuXG4gIGNvbmZpcm0obWVzc2FnZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5jb25maXJtUmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydEpvYigpIHtcbiAgICB0aGlzLl9qb2JzKys7XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMSkge1xuICAgICAgdGhpcy5qb2JTdGFydGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2pvYnM7XG4gIH1cblxuICBlbmRKb2IoaWQpIHtcbiAgICB0aGlzLl9qb2JzLS07XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMCkge1xuICAgICAgdGhpcy5qb2JFbmRlZC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TW9kYWwoKSB7XG4gICAgdGhpcy5fbW9kYWxzKys7XG5cbiAgICBpZiAodGhpcy5fbW9kYWxzID09PSAxKSB7XG4gICAgICB0aGlzLm1vZGFsU3RhcnRlZC5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tb2RhbHM7XG4gIH1cblxuICBlbmRNb2RhbChpZCkge1xuICAgIHRoaXMuX21vZGFscy0tO1xuXG4gICAgaWYgKHRoaXMuX21vZGFscyA9PT0gMCkge1xuICAgICAgdGhpcy5tb2RhbEVuZGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvbG9jYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuTG9jYXRpb25NYW5hZ2VyID0gY2xhc3MgTG9jYXRpb25NYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIExvZ2dlcikge1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9XG5cbiAgbG9hZENvbmZpZygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG1vZGVsID0gc2VsZi5fTG9jYXRpb25Nb2RlbDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmdW5jdGlvbiBsb2FkQ29uZmlnKCkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgbG9jYXRpb24gY29uZmlnLi4uJyk7XG5cbiAgICAgICAgbW9kZWwuZmV0Y2goJ2xvY2F0aW9uJykudGhlbihsb2NhdGlvbiA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBOZXcgJyR7bG9jYXRpb24ubG9jYXRpb25fbmFtZX0nIGxvY2F0aW9uIGNvbmZpZyBsb2FkZWQuYCk7XG4gICAgICAgICAgcmVzb2x2ZShsb2NhdGlvbik7XG4gICAgICAgIH0sIGUgPT4ge1xuICAgICAgICAgIGlmICghbW9kZWwubG9jYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBGYWxsYmFjayB0byBzdG9yZWQgbG9jYXRpb24gJyR7bW9kZWwubG9jYXRpb24ubG9jYXRpb25fbmFtZX0nLmApO1xuICAgICAgICAgIHJlc29sdmUobW9kZWwubG9jYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbW9kZWwuaW5pdGlhbGl6ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgZGV2aWNlIGluZm8uLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnZGV2aWNlJykudGhlbihkZXZpY2UgPT4ge1xuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgTmV3IGRldmljZSBsb2FkZWQ6IHRva2VuPSR7ZGV2aWNlLnRva2VufTtsb2NhdGlvbj0ke2RldmljZS5sb2NhdGlvbl90b2tlbn1gKTtcbiAgICAgICAgICBsb2FkQ29uZmlnKCk7XG4gICAgICAgIH0sIGUgPT4ge1xuICAgICAgICAgIGlmICghbW9kZWwuZGV2aWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRmFsbGJhY2sgdG8gc3RvcmVkIGRldmljZTogdG9rZW49JHttb2RlbC5kZXZpY2UudG9rZW59O2xvY2F0aW9uPSR7bW9kZWwuZGV2aWNlLmxvY2F0aW9uX3Rva2VufWApO1xuICAgICAgICAgIGxvYWRDb25maWcoKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9hZFNlYXRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbW9kZWwgPSBzZWxmLl9Mb2NhdGlvbk1vZGVsO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIGxvYWRTZWF0KCkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvYWRpbmcgY3VycmVudCBzZWF0IGluZm8uLi4nKTtcblxuICAgICAgICBtb2RlbC5mZXRjaCgnc2VhdCcpLnRoZW4oc2VhdCA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBOZXcgc2VhdCBkYXRhIGxvYWRlZCBmb3IgIyR7c2VhdC50b2tlbn0uYCk7XG4gICAgICAgICAgcmVzb2x2ZShzZWF0KTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5zZWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRmFsbGJhY2sgdG8gc3RvcmVkIHNlYXQgIyR7bW9kZWwuc2VhdC50b2tlbn0uYCk7XG4gICAgICAgICAgcmVzb2x2ZShtb2RlbC5zZWF0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIG1vZGVsLmluaXRpYWxpemUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2FkaW5nIGxvY2F0aW9uIHNlYXRzLi4uJyk7XG5cbiAgICAgICAgbW9kZWwuZmV0Y2goJ3NlYXRzJykudGhlbihzZWF0cyA9PiB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBMb2NhdGlvbiBzZWF0cyBsb2FkZWQgKCR7c2VhdHMubGVuZ3RofSkuYCk7XG4gICAgICAgICAgbG9hZFNlYXQoKTtcbiAgICAgICAgfSwgZSA9PiB7XG4gICAgICAgICAgaWYgKCFtb2RlbC5zZWF0cykge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYEZhbGxiYWNrIHRvIHN0b3JlZCBzZWF0cyAoJHttb2RlbC5zZWF0cy5sZW5ndGh9KS5gKTtcbiAgICAgICAgICBsb2FkU2VhdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9uYXZpZ2F0aW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk5hdmlnYXRpb25NYW5hZ2VyID0gY2xhc3MgTmF2aWdhdGlvbk1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpIHtcbiAgICB0aGlzLiQkbG9jYXRpb24gPSAkbG9jYXRpb247XG4gICAgdGhpcy4kJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2luZyA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsICgpID0+IHtcbiAgICAgIHZhciBwYXRoID0gc2VsZi4kJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgaWYgKHBhdGggPT09IHNlbGYuX3BhdGgpIHtcbiAgICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BhdGggPSBwYXRoO1xuICAgICAgc2VsZi5fbG9jYXRpb24gPSBzZWxmLmdldExvY2F0aW9uKHBhdGgpO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICAgIHNlbGYubG9jYXRpb25DaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dOYXZpZ2F0aW9uKGxvY2F0aW9uKSk7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3BhdGg7IH1cbiAgc2V0IHBhdGgodmFsdWUpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmluZGV4T2YoJyMnKSxcbiAgICAgICAgcGF0aCA9IGkgIT09IC0xID8gdmFsdWUuc3Vic3RyaW5nKGkgKyAxKSA6IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb24ocGF0aCk7XG4gIH1cblxuICBnZXQgbG9jYXRpb24oKSB7IHJldHVybiB0aGlzLl9sb2NhdGlvbjsgfVxuICBzZXQgbG9jYXRpb24odmFsdWUpIHtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHRoaXMuX2xvY2F0aW9uKTtcblxuICAgIHZhciBwYXRoID0gdGhpcy5fcGF0aCA9IHRoaXMuZ2V0UGF0aCh0aGlzLl9sb2NhdGlvbik7XG4gICAgdGhpcy4kJGxvY2F0aW9uLnBhdGgocGF0aCk7XG4gIH1cblxuICBnZXRQYXRoKGxvY2F0aW9uKSB7XG4gICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnRva2VuKSB7XG4gICAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZSArICcvJyArIGxvY2F0aW9uLnRva2VuO1xuICAgIH1cbiAgICBlbHNlIGlmIChsb2NhdGlvbi51cmwpIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdob21lJykge1xuICAgICAgcmV0dXJuICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZTtcbiAgfVxuXG4gIGdldExvY2F0aW9uKHBhdGgpIHtcbiAgICB2YXIgbWF0Y2ggPSAvXFwvKFxcdyspPyhcXC8oLispKT8vLmV4ZWMocGF0aCk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXRjaFsxXTtcbiAgICAgIHZhciBwYXJhbSA9IG1hdGNoWzNdO1xuXG4gICAgICBpZiAocGFyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB1cmw6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbSkgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB0b2tlbjogcGFyYW0gfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgdHlwZSA9ICdob21lJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSB9O1xuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGdvQmFjaygpIHtcbiAgICBpZiAodGhpcy5sb2NhdGlvbi50eXBlICE9PSAnaG9tZScgJiYgdGhpcy5sb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJykge1xuICAgICAgdGhpcy4kJHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9vcmRlcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5PcmRlck1hbmFnZXIgPSBjbGFzcyBPcmRlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIER0c0FwaSwgT3JkZXJNb2RlbCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9DaGF0TW9kZWwgPSBDaGF0TW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZChnaWZ0U2VhdCA9PiB7XG4gICAgICBpZiAoc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IHNlbGYubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydCA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWdpZnRTZWF0KSB7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fT3JkZXJNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgc2VsZi5tb2RlbC5jbGVhcldhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIpO1xuICAgICAgc2VsZi5tb2RlbC5jbGVhcldhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSk7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCk7XG5cbiAgICAgIHNlbGYuY2xlYXJDYXJ0KCk7XG4gICAgICBzZWxmLmNsZWFyQ2hlY2soKTtcbiAgICAgIHNlbGYubW9kZWwub3JkZXJUaWNrZXQgPSB7fTtcblxuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDYXJ0IGFuZCBjaGVja3NcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGFkZFRvQ2FydChpdGVtKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQucHVzaChpdGVtKTtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuZGlzcGF0Y2godGhpcy5tb2RlbC5vcmRlckNhcnQpO1xuXG4gICAgaWYgKHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCkge1xuICAgICAgdGhpcy5fQ2hhdE1vZGVsLmdpZnRSZWFkeS5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1vZGVsLm9yZGVyQ2FydDtcbiAgfVxuXG4gIHJlbW92ZUZyb21DYXJ0KGl0ZW0pIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydCA9IHRoaXMubW9kZWwub3JkZXJDYXJ0LmZpbHRlcihlbnRyeSA9PiBlbnRyeSAhPT0gaXRlbSk7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXJDYXJ0O1xuICB9XG5cbiAgY2xlYXJDYXJ0KCkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0ID0gW107XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IFtdO1xuXG4gICAgdGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcbiAgfVxuXG4gIGNsZWFyQ2hlY2soaXRlbXMpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICBpZiAoaXRlbXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5vcmRlckNoZWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaXRlbXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5tb2RlbC5vcmRlckNoZWNrW2ldID09PSBpdGVtc1tqXSkge1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMubW9kZWwub3JkZXJDaGVja1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2hlY2sgPSByZXN1bHQ7XG4gIH1cblxuICBzdWJtaXRDYXJ0KG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy5tb2RlbC5vcmRlckNhcnQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgMDtcblxuICAgIGlmICh0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQpIHtcbiAgICAgIG9wdGlvbnMgfD0gNDtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSLFxuICAgICAgaXRlbXM6IHRoaXMubW9kZWwub3JkZXJDYXJ0Lm1hcChlbnRyeSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IGVudHJ5Lml0ZW0ub3JkZXIudG9rZW4sXG4gICAgICAgICAgcXVhbnRpdHk6IGVudHJ5LnF1YW50aXR5LFxuICAgICAgICAgIG1vZGlmaWVyczogZW50cnkubW9kaWZpZXJzLnJlZHVjZSgocmVzdWx0LCBjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jb25jYXQoY2F0ZWdvcnkubW9kaWZpZXJzLnJlZHVjZSgocmVzdWx0LCBtb2RpZmllcikgPT4ge1xuICAgICAgICAgICAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1vZGlmaWVyLmRhdGEudG9rZW4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9LCBbXSkpO1xuICAgICAgICAgIH0sIFtdKSxcbiAgICAgICAgICBub3RlOiBlbnRyeS5uYW1lIHx8ICcnXG4gICAgICAgIH07XG4gICAgICB9KSxcbiAgICAgIHRpY2tldF90b2tlbjogc2VsZi5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICAgIHNlYXRfdG9rZW46IHNlbGYuX0NoYXRNb2RlbC5naWZ0U2VhdCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX0R0c0FwaS53YWl0ZXIucGxhY2VPcmRlcihyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLml0ZW1fdG9rZW5zKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5pdGVtX3Rva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRbaV0ucmVxdWVzdCA9IHJlc3BvbnNlLml0ZW1fdG9rZW5zW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJUaWNrZXQgPSB7IHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4gfTtcblxuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2hlY2sgPSBzZWxmLm1vZGVsLm9yZGVyQ2hlY2suY29uY2F0KHNlbGYubW9kZWwub3JkZXJDYXJ0KTtcbiAgICAgICAgc2VsZi5jbGVhckNhcnQoKTtcblxuICAgICAgICBzZWxmLl9DaGF0TW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuXG4gICAgICAgIGxldCB3YXRjaGVyID0gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUiwgcmVzcG9uc2UpO1xuICAgICAgICByZXNvbHZlKHdhdGNoZXIpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlcXVlc3RDbG9zZW91dCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBraW5kOiB0aGlzLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCxcbiAgICAgIHRpY2tldF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucGxhY2VSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHsgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbiB9O1xuICAgICAgcmV0dXJuIHNlbGYuX2NyZWF0ZVdhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQsIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlcXVlc3RBc3Npc3RhbmNlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UsXG4gICAgICB0aWNrZXRfdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnBsYWNlUmVxdWVzdChyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYuX3NhdmVUaWNrZXQocmVzcG9uc2UpO1xuICAgICAgcmV0dXJuIHNlbGYuX2NyZWF0ZVdhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsY3VsYXRlUHJpY2UoZW50cnkpIHtcbiAgICB2YXIgbW9kaWZpZXJzID0gZW50cnkubW9kaWZpZXJzLnJlZHVjZSgodG90YWwsIGNhdGVnb3J5KSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyBjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKCh0b3RhbCwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHRvdGFsICsgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgJiYgbW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgICAgIG1vZGlmaWVyLmRhdGEucHJpY2UgOlxuICAgICAgICAgIDBcbiAgICAgICAgKTtcbiAgICAgIH0sIDApO1xuICAgIH0sIDApO1xuXG4gICAgcmV0dXJuIGVudHJ5LnF1YW50aXR5ICogKG1vZGlmaWVycyArIGVudHJ5Lml0ZW0ub3JkZXIucHJpY2UpO1xuICB9XG5cbiAgY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKSB7XG4gICAgcmV0dXJuIChlbnRyaWVzID8gZW50cmllcy5yZWR1Y2UoKHRvdGFsLCBlbnRyeSkgPT4ge1xuICAgICAgcmV0dXJuIHRvdGFsICsgT3JkZXJNYW5hZ2VyLnByb3RvdHlwZS5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICAgfSwgMCkgOiAwKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVRheChlbnRyaWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKSAqIHRoaXMubW9kZWwudGF4O1xuICB9XG5cbiAgdXBsb2FkU2lnbmF0dXJlKGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLnVwbG9hZC51cGxvYWRUZW1wKGRhdGEsICdpbWFnZS9wbmcnLCAnc2lnbmF0dXJlLnBuZycpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50b2tlbik7XG4gIH1cblxuICBnZW5lcmF0ZVBheW1lbnRUb2tlbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5fQ3VzdG9tZXJNb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIXRoaXMuX0N1c3RvbWVyTW9kZWwuaXNHdWVzdCkge1xuICAgICAgcmV0dXJuIHRoaXMuX0R0c0FwaS5jdXN0b21lci5pbml0aWFsaXplUGF5bWVudCgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBzZWxmLl9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLmluaXRpYWxpemVQYXltZW50KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLl9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHBheU9yZGVyKHJlcXVlc3QpIHtcbiAgICByZXF1ZXN0LnRpY2tldF90b2tlbiA9IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW47XG4gICAgcmVxdWVzdC5wYXltZW50X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC5wYXltZW50X3Rva2VuO1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnN1Ym1pdENoZWNrb3V0UGF5bWVudChyZXF1ZXN0KTtcbiAgfVxuXG4gIHJlcXVlc3RSZWNlaXB0KHJlcXVlc3QpIHtcbiAgICByZXF1ZXN0LnRpY2tldF90b2tlbiA9IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW47XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucmVxdWVzdFJlY2VpcHQocmVxdWVzdCk7XG4gIH1cblxuICBfc2F2ZVRpY2tldChyZXNwb25zZSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJUaWNrZXQgPSB7XG4gICAgICB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuLFxuICAgICAgcGF5bWVudF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC5wYXltZW50X3Rva2VuXG4gICAgfTtcbiAgfVxuXG4gIF9zYXZlUGF5bWVudFRva2VuKHJlc3BvbnNlKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlclRpY2tldCA9IHtcbiAgICAgIHRva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgICAgcGF5bWVudF90b2tlbjogcmVzcG9uc2UudG9rZW5cbiAgICB9O1xuICB9XG5cbiAgX2NyZWF0ZVdhdGNoZXIoa2luZCwgdGlja2V0KSB7XG4gICAgbGV0IHdhdGNoZXIgPSBuZXcgYXBwLlJlcXVlc3RXYXRjaGVyKHRpY2tldCwgdGhpcy5fRHRzQXBpKTtcbiAgICB0aGlzLm1vZGVsLmFkZFdhdGNoZXIoa2luZCwgd2F0Y2hlcik7XG5cbiAgICByZXR1cm4gd2F0Y2hlcjtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3Nlc3Npb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvbk1hbmFnZXIgPSBjbGFzcyBTZXNzaW9uTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBzdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLnNlc3Npb25FbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG4gICAgdGhpcy5fU3VydmV5TW9kZWwgPSBTdXJ2ZXlNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zZWF0X3Nlc3Npb24nKTtcbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbihkYXRhID0+IHtcbiAgICAgIHNlbGYuX3Nlc3Npb24gPSBkYXRhO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgc2VsZi5fc3RhcnRTZXNzaW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZChjdXN0b21lciA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIWN1c3RvbWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc2Vzc2lvbi5jdXN0b21lciA9IGN1c3RvbWVyLnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhc2VhdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24uc2VhdCA9IHNlYXQudG9rZW47XG4gICAgICBzZWxmLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX09yZGVyTW9kZWwub3JkZXJUaWNrZXRDaGFuZ2VkLmFkZCh0aWNrZXQgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICF0aWNrZXQgfHwgIXRpY2tldC50b2tlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24udGlja2V0ID0gdGlja2V0LnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2Vzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbjtcbiAgfVxuXG4gIGVuZFNlc3Npb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zZXNzaW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBlbmRlZC5gKTtcblxuICAgIHZhciBzID0gdGhpcy5fc2Vzc2lvbjtcbiAgICBzLmVuZGVkID0gbmV3IERhdGUoKTtcblxuICAgIHRoaXMuX3Nlc3Npb24gPSBudWxsO1xuICAgIHRoaXMuX3N0b3JlLmNsZWFyKCk7XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dTZXNzaW9uKHMpO1xuXG4gICAgdGhpcy5zZXNzaW9uRW5kZWQuZGlzcGF0Y2gocyk7XG4gIH1cblxuICBnZXQgZ3Vlc3RDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCB8fCAxO1xuICB9XG5cbiAgc2V0IGd1ZXN0Q291bnQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLmd1ZXN0X2NvdW50ID0gdmFsdWU7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBnZXQgc3BlY2lhbEV2ZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQ7XG4gIH1cblxuICBzZXQgc3BlY2lhbEV2ZW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uc3BlY2lhbF9ldmVudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQgPSB2YWx1ZTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9zdGFydFNlc3Npb24oKSB7XG4gICAgbGV0IHNlYXQgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQ7XG5cbiAgICB0aGlzLl9zZXNzaW9uID0ge1xuICAgICAgaWQ6IHRoaXMuX2dlbmVyYXRlSUQoKSxcbiAgICAgIHNlYXQ6IHNlYXQgPyBzZWF0LnRva2VuIDogdW5kZWZpbmVkLFxuICAgICAgcGxhdGZvcm06IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSxcbiAgICAgIHN0YXJ0ZWQ6IG5ldyBEYXRlKClcbiAgICB9O1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBzdGFydGVkLmApO1xuXG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZC5kaXNwYXRjaCh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9nZW5lcmF0ZUlEKCl7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9zaGVsbG1hbmFnZXIuanNcblxud2luZG93LmFwcC5TaGVsbE1hbmFnZXIgPSBjbGFzcyBTaGVsbE1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIENvbmZpZywgRW52aXJvbm1lbnQsIEhvc3RzKSB7XG4gICAgdGhpcy4kJHNjZSA9ICRzY2U7XG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1NoZWxsTW9kZWwgPSBTaGVsbE1vZGVsO1xuICAgIHRoaXMuX0NvbmZpZyA9IENvbmZpZztcbiAgICB0aGlzLl9FbnZpcm9ubWVudCA9IEVudmlyb25tZW50O1xuICAgIHRoaXMuX0hvc3RzID0gSG9zdHM7XG5cbiAgICB0aGlzLmxvY2FsZSA9IENvbmZpZy5sb2NhbGU7XG4gIH1cblxuICBnZXQgbG9jYWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gIH1cblxuICBzZXQgbG9jYWxlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2xvY2FsZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbG9jYWxlID0gdmFsdWU7XG5cbiAgICB2YXIgZm9ybWF0ID0gJ3swfScsXG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX2xvY2FsZSkge1xuICAgICAgY2FzZSAncm9fTUQnOlxuICAgICAgICBmb3JtYXQgPSAnezB9IExlaSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnemhfTU8nOlxuICAgICAgICBmb3JtYXQgPSAnTU9QJCB7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2VuX1VTJzpcbiAgICAgICAgZm9ybWF0ID0gJyR7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICdVU0QnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl9TaGVsbE1vZGVsLnByaWNlRm9ybWF0ID0gZm9ybWF0O1xuICAgIHRoaXMuX1NoZWxsTW9kZWwuY3VycmVuY3kgPSBjdXJyZW5jeTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLmJhY2tncm91bmRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5iYWNrZ3JvdW5kcyA9IHJlc3BvbnNlLm1haW4ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwuc2NyZWVuc2F2ZXJzID0gcmVzcG9uc2Uuc2NyZWVuc2F2ZXIubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwucGFnZUJhY2tncm91bmRzID0gcmVzcG9uc2UucGFnZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLmJhY2tncm91bmQuc3JjLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBpdGVtLmRlc3RpbmF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5lbGVtZW50cygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHZhciBsYXlvdXQgPSBzZWxmLl9Db25maWcudGhlbWUubGF5b3V0O1xuXG4gICAgICB2YXIgZWxlbWVudHMgPSB7fTtcblxuICAgICAgc3dpdGNoIChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSAnY2xhc3NpYyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2hvbWUnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWhvbWUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NhcnQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNhcnQucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl93YWl0ZXInOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWFzc2lzdGFuY2UucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoZWNrJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1jbG9zZW91dC5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fc3VydmV5Jzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1zdXJ2ZXkucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoYXQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNoYXQucG5nJylcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnYWxheGllcyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9zZXR0aW5ncyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tc2V0dGluZ3MucG5nJyksXG4gICAgICAgICAgICAnbG9jYXRpb25fbG9nbyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tbG9nby5wbmcnKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gcmVzcG9uc2UuZWxlbWVudHNbaV07XG4gICAgICAgIGVsZW1lbnRzW2VsZW1lbnQuc2xvdF0gPSBlbGVtZW50LnNyYztcbiAgICAgIH1cblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICAgIH0pO1xuICB9XG5cbiAgZm9ybWF0UHJpY2UocHJpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbC5wcmljZUZvcm1hdC5yZXBsYWNlKC97KFxcZCspfS9nLCAoKSA9PiBwcmljZS50b0ZpeGVkKDIpKTtcbiAgfVxuXG4gIGdldFBhZ2VCYWNrZ3JvdW5kcyhsb2NhdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsLnBhZ2VCYWNrZ3JvdW5kcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5kZXN0aW5hdGlvbi50eXBlID09PSBsb2NhdGlvbi50eXBlICYmXG4gICAgICAgIChpdGVtLmRlc3RpbmF0aW9uLnRva2VuID09PSBsb2NhdGlvbi50b2tlbiAmJiBsb2NhdGlvbi50b2tlbiB8fFxuICAgICAgICAgaXRlbS5kZXN0aW5hdGlvbi51cmwgPT09IGxvY2F0aW9uLnVybCAmJiBsb2NhdGlvbi51cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QXBwVXJsKHVybCkge1xuICAgIHZhciBob3N0ID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSArXG4gICAgICAod2luZG93LmxvY2F0aW9uLnBvcnQgPyAnOicgKyB3aW5kb3cubG9jYXRpb24ucG9ydDogJycpO1xuICAgIHJldHVybiBob3N0ICsgdXJsO1xuICB9XG5cbiAgZ2V0QXNzZXRVcmwoZmlsZSkge1xuICAgIHZhciBwYXRoID0gdGhpcy5fZ2V0UGF0aCh0aGlzLl9Ib3N0cy5zdGF0aWMpO1xuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAke3BhdGh9YXNzZXRzLyR7dGhpcy5fQ29uZmlnLnRoZW1lLmxheW91dH0vJHtmaWxlfWApO1xuICB9XG5cbiAgZ2V0UGFydGlhbFVybChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXNzZXRVcmwoYHBhcnRpYWxzLyR7bmFtZX0uaHRtbGApO1xuICB9XG5cbiAgZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikge1xuICAgIGlmICghbWVkaWEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBwYXRoID0gdGhpcy5fZ2V0UGF0aCh0aGlzLl9Ib3N0cy5tZWRpYSk7XG5cbiAgICBpZiAodHlwZW9mIG1lZGlhID09PSAnc3RyaW5nJyB8fCBtZWRpYSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgaWYgKG1lZGlhLnN1YnN0cmluZygwLCA0KSAhPT0gJ2h0dHAnICYmIG1lZGlhLnN1YnN0cmluZygwLCAyKSAhPT0gJy8vJykge1xuICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24gfHwgJ2pwZyc7XG4gICAgICAgIHJldHVybiB0aGlzLiQkc2NlLnRydXN0QXNSZXNvdXJjZVVybChgJHtwYXRofW1lZGlhLyR7bWVkaWF9XyR7d2lkdGh9XyR7aGVpZ2h0fS4ke2V4dGVuc2lvbn1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lZGlhO1xuICAgIH1cblxuICAgIGlmICghbWVkaWEudG9rZW4pIHtcbiAgICAgIHJldHVybiBtZWRpYTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlKG1lZGlhKTtcbiAgICB2YXIgdXJsID0gYCR7cGF0aH1tZWRpYS8ke21lZGlhLnRva2VufWA7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndmlkZW8nKSB7XG4gICAgICB1cmwgKz0gJy53ZWJtJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ZsYXNoJykge1xuICAgICAgdXJsICs9ICcuc3dmJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJykge1xuICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICB1cmwgKz0gJ18nICsgd2lkdGggKyAnXycgKyBoZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgdXJsICs9ICcuJyArIGV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAobWVkaWEubWltZV90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaW1hZ2UvcG5nJzpcbiAgICAgICAgICAgIHVybCArPSAnLnBuZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdXJsICs9ICcuanBnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHVybCk7XG4gIH1cblxuICBnZXRNZWRpYVR5cGUobWVkaWEpIHtcbiAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICdpbWFnZScpe1xuICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiAndmlkZW8nO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS5taW1lX3R5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcpIHtcbiAgICAgIHJldHVybiAnZmxhc2gnO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgdGlsZVN0eWxlKCkge1xuICAgIHZhciBzdHlsZSA9ICd0aWxlJztcblxuICAgIHN3aXRjaCAodGhpcy5fQ29uZmlnLnRoZW1lLnRpbGVzX3N0eWxlKSB7XG4gICAgICBjYXNlICdyZWd1bGFyJzpcbiAgICAgICAgc3R5bGUgKz0gJyB0aWxlLXJlZ3VsYXInO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9zdHlsZSArPSAnIHRpbGUtcmVndWxhcic7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG5cbiAgZ2V0IHByZWRpY2F0ZUV2ZW4oKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICByZXR1cm4gKCkgPT4gaW5kZXgrKyAlIDIgPT09IDE7XG4gIH1cblxuICBnZXQgcHJlZGljYXRlT2RkKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuICgpID0+IGluZGV4KysgJSAyID09PSAwO1xuICB9XG5cbiAgX2dldFBhdGgocmVzKSB7XG4gICAgdmFyIHBhdGggPSAnJztcblxuICAgIGlmIChyZXMucHJvdG9jb2wpIHtcbiAgICAgIHBhdGggKz0gYCR7cmVzLnByb2ZvY29sfTovL2A7XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlcy5zZWN1cmUpIHtcbiAgICAgIHBhdGggKz0gYGh0dHBzOi8vYDtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzLnNlY3VyZSA9PT0gZmFsc2UpIHtcbiAgICAgIHBhdGggKz0gYGh0dHA6Ly9gO1xuICAgIH1cblxuICAgIGlmIChyZXMuaG9zdCkge1xuICAgICAgaWYgKCFyZXMucHJvdG9jb2wpIHtcbiAgICAgICAgcGF0aCArPSAnLy8nO1xuICAgICAgfVxuICAgICAgcGF0aCArPSByZXMuaG9zdDtcbiAgICB9XG5cbiAgICBpZiAocmVzLnBhdGgpIHtcbiAgICAgIHBhdGggKz0gcmVzLnBhdGg7XG4gICAgfVxuXG4gICAgaWYgKHBhdGgubGVuZ3RoID4gMCAmJiAhcGF0aC5lbmRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoICs9ICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZXJzL3NvY2lhbG1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8qIGdsb2JhbCBVUkkgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29jaWFsTWFuYWdlclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBTb2NpYWxNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50LCBEdHNBcGksIFdlYkJyb3dzZXIsIExvZ2dlcikge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fV2ViQnJvd3NlciA9IFdlYkJyb3dzZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29jaWFsTWFuYWdlciA9IFNvY2lhbE1hbmFnZXI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBMb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5GYWNlYm9vayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZmFjZWJvb2tBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuZmFjZWJvb2tfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggRmFjZWJvb2s6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZmFjZWJvb2tBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChmYWNlYm9va0F1dGguZXJyb3IgfHwgIWZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgZXJyb3I6ICcgKyBmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwRmFjZWJvb2soe1xuICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBmYWNlYm9va0F1dGguYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWRcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggRmFjZWJvb2suJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9kaWFsb2cvb2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBmYWNlYm9va0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVzcG9uc2VfdHlwZScsICd0b2tlbicpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ3B1YmxpY19wcm9maWxlLGVtYWlsJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luR29vZ2xlUGx1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZ29vZ2xlcGx1c0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5nb29nbGVwbHVzX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHNlbGYuX2dlbmVyYXRlVG9rZW4oKTtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggR29vZ2xlOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGdvb2dsZXBsdXNBdXRoID0gVVJJKHVybCkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGdvb2dsZXBsdXNBdXRoLmVycm9yIHx8ICFnb29nbGVwbHVzQXV0aC5jb2RlIHx8IGdvb2dsZXBsdXNBdXRoLnN0YXRlICE9PSBzdGF0ZSkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY2FsbGJhY2sgZXJyb3I6ICcgKyBnb29nbGVwbHVzQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBHb29nbGVQbHVzKHtcbiAgICAgICAgICAgIGNvZGU6IGdvb2dsZXBsdXNBdXRoLmNvZGUsXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBHb29nbGUuJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoJylcbiAgICAgICAgLmFkZFNlYXJjaCgnY2xpZW50X2lkJywgZ29vZ2xlcGx1c0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGdvb2dsZXBsdXNBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ2NvZGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzY29wZScsICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3BsdXMubG9naW4gZW1haWwnKVxuICAgICAgICAuYWRkU2VhcmNoKCdhY2Nlc3NfdHlwZScsICdvZmZsaW5lJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc3RhdGUnLCBzdGF0ZSlcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luVHdpdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdHdpdHRlckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC50d2l0dGVyX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB0b2tlblNlY3JldDtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggVHdpdHRlcjogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZih0d2l0dGVyQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgdHdpdHRlckF1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAodHdpdHRlckF1dGguZXJyb3IgfHwgIXR3aXR0ZXJBdXRoLm9hdXRoX3ZlcmlmaWVyKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyB0d2l0dGVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlcih7XG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgIHJlcXVlc3RfdG9rZW46IHR3aXR0ZXJBdXRoLm9hdXRoX3Rva2VuLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl9zZWNyZXQ6IHRva2VuU2VjcmV0LFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl92ZXJpZmllcjogdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXJcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggVHdpdHRlci4nKTtcblxuICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcFR3aXR0ZXJSZXF1ZXN0VG9rZW4oe1xuICAgICAgICBvYXV0aF9jYWxsYmFjazogdHdpdHRlckFwcC5yZWRpcmVjdF91cmxcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hcGkudHdpdHRlci5jb20vb2F1dGgvYXV0aGVudGljYXRlJylcbiAgICAgICAgLmFkZFNlYXJjaCgnb2F1dGhfdG9rZW4nLCB0b2tlbi5vYXV0aF90b2tlbilcbiAgICAgICAgLmFkZFNlYXJjaCgnZm9yY2VfbG9naW4nLCAndHJ1ZScpXG4gICAgICAgIC50b1N0cmluZygpO1xuXG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciByZXF1ZXN0IHRva2VuIHJlY2VpdmVkLicpO1xuXG4gICAgICAgIHRva2VuU2VjcmV0ID0gdG9rZW4ub2F1dGhfdG9rZW5fc2VjcmV0O1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBIZWxwZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5fZ2VuZXJhdGVUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9O1xuXG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlcnMvc29mdHdhcmVtYW5hZ2VyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29mdHdhcmVNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvZnR3YXJlTWFuYWdlciA9IGZ1bmN0aW9uKFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgfTtcblxuICB3aW5kb3cuYXBwLlNvZnR3YXJlTWFuYWdlciA9IFNvZnR3YXJlTWFuYWdlcjtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ2N1cnJlbnRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0dGVybiA9IC8oU05BUClcXC8oWzAtOS5dKykvLFxuICAgICAgICAgIG1hdGNoID0gcGF0dGVybi5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiAnOC44LjguOCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAncmVxdWlyZWRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fU05BUEVudmlyb25tZW50LnJlcXVpcmVtZW50c1t0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm1dO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICd1cGRhdGVSZXF1aXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZlcnNpb25Db21wYXJlKHRoaXMuY3VycmVudFZlcnNpb24sIHRoaXMucmVxdWlyZWRWZXJzaW9uKSA9PT0gLTE7XG4gICAgfVxuICB9KTtcblxuICBTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLl92ZXJzaW9uQ29tcGFyZSA9IGZ1bmN0aW9uKHYxLCB2Miwgb3B0aW9ucykge1xuICAgIGlmICghdjEgfHwgIXYyKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICB2YXIgbGV4aWNvZ3JhcGhpY2FsID0gb3B0aW9ucyAmJiBvcHRpb25zLmxleGljb2dyYXBoaWNhbCxcbiAgICAgICAgemVyb0V4dGVuZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy56ZXJvRXh0ZW5kLFxuICAgICAgICB2MXBhcnRzID0gdjEuc3BsaXQoJy4nKSxcbiAgICAgICAgdjJwYXJ0cyA9IHYyLnNwbGl0KCcuJyk7XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkUGFydCh4KSB7XG4gICAgICByZXR1cm4gKGxleGljb2dyYXBoaWNhbCA/IC9eXFxkK1tBLVphLXpdKiQvIDogL15cXGQrJC8pLnRlc3QoeCk7XG4gICAgfVxuXG4gICAgaWYgKCF2MXBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSB8fCAhdjJwYXJ0cy5ldmVyeShpc1ZhbGlkUGFydCkpIHtcbiAgICAgIHJldHVybiBOYU47XG4gICAgfVxuXG4gICAgaWYgKHplcm9FeHRlbmQpIHtcbiAgICAgIHdoaWxlICh2MXBhcnRzLmxlbmd0aCA8IHYycGFydHMubGVuZ3RoKSB7XG4gICAgICAgIHYxcGFydHMucHVzaCgnMCcpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHYycGFydHMubGVuZ3RoIDwgdjFwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjJwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFsZXhpY29ncmFwaGljYWwpIHtcbiAgICAgIHYxcGFydHMgPSB2MXBhcnRzLm1hcChOdW1iZXIpO1xuICAgICAgdjJwYXJ0cyA9IHYycGFydHMubWFwKE51bWJlcik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2MXBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodjJwYXJ0cy5sZW5ndGggPT09IGkpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIGlmICh2MXBhcnRzW2ldID09PSB2MnBhcnRzW2ldKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodjFwYXJ0c1tpXSA+IHYycGFydHNbaV0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2MXBhcnRzLmxlbmd0aCAhPT0gdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9tYW5hZ2Vycy9zdXJ2ZXltYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TWFuYWdlciA9IGNsYXNzIFN1cnZleU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG5cbiAgICBpZiAodGhpcy5fU3VydmV5TW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLl9EYXRhUHJvdmlkZXIuc3VydmV5cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNlbGYuX1N1cnZleU1vZGVsLmZlZWRiYWNrU3VydmV5ID0gZGF0YS5zdXJ2ZXlzWzBdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TdXJ2ZXlNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHNlbGYuX1N1cnZleU1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgICBzZWxmLl9TdXJ2ZXlNb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2Fic3RyYWN0bW9kZWwuanNcblxud2luZG93LmFwcC5BYnN0cmFjdE1vZGVsID0gY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdGhpcy5fc3RvcmFnZVByb3ZpZGVyID0gc3RvcmFnZVByb3ZpZGVyO1xuICAgIHRoaXMuX3Byb3BlcnRpZXMgPSB7fTtcbiAgfVxuXG4gIF9kZWZpbmVQcm9wZXJ0eShuYW1lLCBzdG9yZU5hbWUsIGRlZmF1bHRWYWx1ZSwgcHJvdmlkZXJGdW5jdGlvbikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcHJvcGVydHkgPSB0aGlzLl9wcm9wZXJ0aWVzW25hbWVdID0geyBuYW1lOiAnXycgKyBuYW1lIH07XG5cbiAgICBpZiAoc3RvcmVOYW1lKSB7XG4gICAgICBwcm9wZXJ0eS5zdG9yZSA9IHRoaXMuX3N0b3JhZ2VQcm92aWRlcihzdG9yZU5hbWUpO1xuICAgIH1cblxuICAgIGlmIChwcm92aWRlckZ1bmN0aW9uKSB7XG4gICAgICBwcm9wZXJ0eS5wcm92aWRlciA9IHByb3ZpZGVyRnVuY3Rpb247XG4gICAgfVxuXG4gICAgdGhpc1tuYW1lICsgJ0NoYW5nZWQnXSA9IHByb3BlcnR5LnNpZ25hbCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIG5hbWUsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmW3Byb3BlcnR5Lm5hbWVdIHx8IGRlZmF1bHRWYWx1ZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gc2VsZltwcm9wZXJ0eS5uYW1lXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGZbcHJvcGVydHkubmFtZV0gPSB2YWx1ZTtcblxuICAgICAgICBpZiAocHJvcGVydHkuc3RvcmUpIHtcbiAgICAgICAgICBwcm9wZXJ0eS5zdG9yZS53cml0ZSh2YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcm9wZXJ0eS5zaWduYWwuZGlzcGF0Y2godmFsdWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfaW5pdFByb3BlcnR5KG5hbWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1tuYW1lXTtcblxuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJyR7bmFtZX0nIG5vdCBmb3VuZC5gKTtcbiAgICB9XG5cbiAgICBpZiAocHJvcGVydHkuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJyR7bmFtZX0nIGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm9wZXJ0eS5zdG9yZSkge1xuICAgICAgcHJvcGVydHkuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wZXJ0eS5zdG9yZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBwcm9wZXJ0eS5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICBzZWxmW3Byb3BlcnR5Lm5hbWVdID0gdmFsdWU7XG4gICAgICBwcm9wZXJ0eS5zaWduYWwuZGlzcGF0Y2godmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcylcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICF0aGlzLl9wcm9wZXJ0aWVzW2tleV0uaW5pdGlhbGl6ZWQpXG4gICAgICAubWFwKGtleSA9PiB0aGlzLl9pbml0UHJvcGVydHkoa2V5KSkpO1xuICB9XG5cbiAgZmV0Y2gocHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBub3QgZm91bmQuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFwcm9wZXJ0eS5wcm92aWRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBoYXMgbm8gcHJvdmlkZXIuYCk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBwcm9wZXJ0eS5wcm92aWRlcigpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZltwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSk7XG4gIH1cblxuICBmZXRjaEFsbCgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXModGhpcy5fcHJvcGVydGllcylcbiAgICAgIC5maWx0ZXIoa2V5ID0+IHRoaXMuX3Byb3BlcnRpZXNba2V5XS5wcm92aWRlcilcbiAgICAgIC5tYXAoa2V5ID0+IHRoaXMuZmV0Y2goa2V5KSkpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKE9iamVjdC5rZXlzKHRoaXMuX3Byb3BlcnRpZXMpXG4gICAgICAuZmlsdGVyKGtleSA9PiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0uc3RvcmUpXG4gICAgICAubWFwKGtleSA9PiB0aGlzLl9wcm9wZXJ0aWVzW2tleV0uc3RvcmUuY2xlYXIoKSkpO1xuICB9XG5cbiAgX3Byb3BlcnR5Q2hhbmdlZChuYW1lKSB7XG4gICAgdmFyIHByb3BlcnR5ID0gdGhpcy5fcHJvcGVydGllc1tuYW1lXTtcblxuICAgIHByb3BlcnR5LnNpZ25hbC5kaXNwYXRjaCh0aGlzW3Byb3BlcnR5Lm5hbWVdKTtcblxuICAgIGlmIChwcm9wZXJ0eS5zdG9yZSkge1xuICAgICAgcHJvcGVydHkuc3RvcmUud3JpdGUodGhpc1twcm9wZXJ0eS5uYW1lXSk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvYW5hbHl0aWNzbW9kZWwuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NNb2RlbCA9IGNsYXNzIEFuYWx5dGljc01vZGVsIHtcbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyLCBoZWF0bWFwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2RhdGEgPSBbXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3Nlc3Npb25zJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnYWR2ZXJ0aXNlbWVudHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdhbnN3ZXJzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY2hhdHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjb21tZW50cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NsaWNrcycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3BhZ2VzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgndXJscycsIHN0b3JhZ2VQcm92aWRlcilcbiAgICBdLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgICByZXN1bHRbaXRlbS5uYW1lXSA9IGl0ZW07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIGhlYXRtYXAuY2xpY2tlZC5hZGQoY2xpY2sgPT4ge1xuICAgICAgc2VsZi5fbG9nQ2xpY2soY2xpY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbG9nU2Vzc2lvbihzZXNzaW9uKSB7XG4gICAgdGhpcy5fZGF0YS5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICB9XG5cbiAgZ2V0IHNlc3Npb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnNlc3Npb25zO1xuICB9XG5cbiAgbG9nTmF2aWdhdGlvbihkZXN0aW5hdGlvbikge1xuICAgIHRoaXMuX2RhdGEucGFnZXMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5zdG9yZSgpO1xuICB9XG5cbiAgZ2V0IHBhZ2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnBhZ2VzO1xuICB9XG5cbiAgbG9nQWR2ZXJ0aXNlbWVudChhZHZlcnRpc2VtZW50KSB7XG4gICAgdGhpcy5fZGF0YS5hZHZlcnRpc2VtZW50cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBhZHZlcnRpc2VtZW50OiBhZHZlcnRpc2VtZW50XG4gICAgfSk7XG4gIH1cblxuICBnZXQgYWR2ZXJ0aXNlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuYWR2ZXJ0aXNlbWVudHM7XG4gIH1cblxuICBsb2dBbnN3ZXIoYW5zd2VyKSB7XG4gICAgdGhpcy5fZGF0YS5hbnN3ZXJzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGFuc3dlcjogYW5zd2VyXG4gICAgfSk7XG4gIH1cblxuICBnZXQgYW5zd2VycygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5hbnN3ZXJzO1xuICB9XG5cbiAgbG9nQ2hhdChjaGF0KSB7XG4gICAgdGhpcy5fZGF0YS5jaGF0cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBjaGF0OiBjaGF0XG4gICAgfSk7XG4gIH1cblxuICBnZXQgY2hhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY2hhdHM7XG4gIH1cblxuICBsb2dDb21tZW50KGNvbW1lbnQpIHtcbiAgICB0aGlzLl9kYXRhLmNvbW1lbnRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNvbW1lbnQ6IGNvbW1lbnRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBjb21tZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jb21tZW50cztcbiAgfVxuXG4gIGxvZ1VybCh1cmwpIHtcbiAgICB0aGlzLl9kYXRhLnVybHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbiAgfVxuXG4gIGdldCB1cmxzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVybHM7XG4gIH1cblxuICBnZXQgY2xpY2tzKCkge1xuICAgIHRoaXMuX2RhdGEuY2xpY2tzLnN0b3JlKCk7XG5cbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jbGlja3M7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBrIGluIHRoaXMuX2RhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba10ucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBfbG9nQ2xpY2soY2xpY2spIHtcbiAgICBjbGljay50aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5kYXRhLnB1c2goY2xpY2spO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvY2FydG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ2FydE1vZGVsID0gY2xhc3MgQ2FydE1vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5TVEFURV9DQVJUID0gJ2NhcnQnO1xuICAgIHRoaXMuU1RBVEVfSElTVE9SWSA9ICdoaXN0b3J5JztcblxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fY2FydFN0YXRlID0gdGhpcy5TVEFURV9DQVJUO1xuICAgIHRoaXMuY2FydFN0YXRlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IG51bGw7XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgaXNDYXJ0T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDYXJ0T3BlbjtcbiAgfVxuXG4gIHNldCBpc0NhcnRPcGVuKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ2FydE9wZW4gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSB2YWx1ZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBjYXJ0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhcnRTdGF0ZTtcbiAgfVxuXG4gIHNldCBjYXJ0U3RhdGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2FydFN0YXRlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jYXJ0U3RhdGUgPSB2YWx1ZTtcbiAgICB0aGlzLmNhcnRTdGF0ZUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbU5ldygpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtTmV3O1xuICB9XG5cbiAgb3BlbkVkaXRvcihpdGVtLCBpc05ldykge1xuICAgIGlmICh0aGlzLl9lZGl0YWJsZUl0ZW0gPT09IGl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtTmV3ID0gaXNOZXcgfHwgZmFsc2U7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gaXRlbTtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQuZGlzcGF0Y2goaXRlbSk7XG4gIH1cblxuICBjbG9zZUVkaXRvcigpIHtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW1OZXcgPSBmYWxzZTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBudWxsO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZC5kaXNwYXRjaChudWxsKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2NoYXRtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkNoYXRNb2RlbCA9IGNsYXNzIENoYXRNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY2hhdF9wcmVmZXJlbmNlcycpO1xuICAgIHRoaXMuX2hpc3RvcnlTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jaGF0X2hpc3RvcnknKTtcblxuICAgIHRoaXMuaXNDb25uZWN0ZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLmFjdGl2ZURldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNoYXRSZXF1ZXN0UmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuaGlzdG9yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lc3NhZ2VSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIFxuICAgIHRoaXMuZ2lmdFJlcXVlc3RSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZ2lmdEFjY2VwdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9naWZ0U2VhdCA9IG51bGw7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2dpZnREZXZpY2UgPSBudWxsO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuZ2lmdFJlYWR5ID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5naWZ0QWNjZXB0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IFNOQVBMb2NhdGlvbi5jaGF0O1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gW107XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX2xhc3RSZWFkcyA9IHt9O1xuXG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5yZWFkKCkudGhlbihwcmVmcyA9PiB7XG4gICAgICBpZiAoIXByZWZzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faXNFbmFibGVkID0gQm9vbGVhbihwcmVmcy5pc19lbmFibGVkKTtcblxuICAgICAgc2VsZi5fYWN0aXZlRGV2aWNlcyA9IHByZWZzLmFjdGl2ZV9kZXZpY2VzIHx8IFtdO1xuICAgICAgc2VsZi5fcGVuZGluZ0RldmljZXMgPSBwcmVmcy5wZW5kaW5nX2RldmljZXMgfHwgW107XG4gICAgICBzZWxmLl9sYXN0UmVhZHMgPSBwcmVmcy5sYXN0X3JlYWRzIHx8IHt9O1xuICAgIH0pO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLnJlYWQoKS50aGVuKGhpc3RvcnkgPT4ge1xuICAgICAgc2VsZi5faGlzdG9yeSA9IGhpc3RvcnkgfHwgW107XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgc2V0IGlzQ29ubmVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29ubmVjdGVkID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNDb25uZWN0ZWQpO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbmFibGVkO1xuICB9XG5cbiAgc2V0IGlzRW5hYmxlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0VuYWJsZWQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzRW5hYmxlZCk7XG5cbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgZ2V0IGlzUHJlc2VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNQcmVzZW50O1xuICB9XG5cbiAgc2V0IGlzUHJlc2VudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc1ByZXNlbnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNQcmVzZW50ID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzUHJlc2VudCk7XG4gIH1cblxuICBnZXQgZ2lmdERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2lmdERldmljZTtcbiAgfVxuXG4gIHNldCBnaWZ0RGV2aWNlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnREZXZpY2UgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZ2lmdERldmljZSA9IHZhbHVlO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdERldmljZSk7XG4gIH1cblxuICBnZXQgZ2lmdFNlYXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dpZnRTZWF0O1xuICB9XG5cbiAgc2V0IGdpZnRTZWF0KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnRTZWF0ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2dpZnRTZWF0ID0gdmFsdWU7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdFNlYXQpO1xuICB9XG5cbiAgZ2V0IHBlbmRpbmdEZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIHNldCBwZW5kaW5nRGV2aWNlcyh2YWx1ZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5wZW5kaW5nRGV2aWNlcyk7XG4gIH1cblxuICBnZXQgYWN0aXZlRGV2aWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIHNldCBhY3RpdmVEZXZpY2VzKHZhbHVlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmVEZXZpY2VzKTtcbiAgfVxuXG4gIGlzQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZURldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBpc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZ0RldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBhZGRBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcy5wdXNoKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlcyA9IHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICBhZGRQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzLnB1c2goZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlcyA9IHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuYWN0aXZlRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLmFjdGl2ZURldmljZXMgPSB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnBlbmRpbmdEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzID0gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICBnZXQgaGlzdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIHNldCBoaXN0b3J5KHZhbHVlKSB7XG4gICAgdGhpcy5faGlzdG9yeSA9IHZhbHVlIHx8IFtdO1xuXG4gICAgdGhpcy5oaXN0b3J5Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9oaXN0b3J5KTtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gIH1cblxuICBhZGRIaXN0b3J5KG1lc3NhZ2UpIHtcbiAgICB0aGlzLl9oaXN0b3J5LnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIGdldExhc3RSZWFkKGRldmljZSkge1xuICAgIGxldCB0b2tlbiA9IGRldmljZS50b2tlbiB8fCBkZXZpY2U7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gfHwgbnVsbDtcbiAgfVxuXG4gIHNldExhc3RSZWFkKGRldmljZSwgdmFsdWUpIHtcbiAgICBsZXQgdG9rZW4gPSBkZXZpY2UudG9rZW4gfHwgZGV2aWNlO1xuICAgIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gICAgdGhpcy5fdXBkYXRlUHJlZmVyZW5jZXMoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdGhpcy5faXNFbmFibGVkID0gdGhpcy5faXNQcmVzZW50ID0gZmFsc2U7XG4gICAgdGhpcy5faGlzdG9yeSA9IFtdO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMgPSBbXTtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcyA9IFtdO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLmNsZWFyKCk7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5jbGVhcigpO1xuICB9XG5cbiAgX3VwZGF0ZUhpc3RvcnkoKSB7XG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLndyaXRlKHRoaXMuaGlzdG9yeSk7XG4gIH1cblxuICBfdXBkYXRlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS53cml0ZSh7XG4gICAgICBpc19lbmFibGVkOiB0aGlzLmlzRW5hYmxlZCxcbiAgICAgIGFjdGl2ZV9kZXZpY2VzOiB0aGlzLmFjdGl2ZURldmljZXMsXG4gICAgICBwZW5kaW5nX2RldmljZXM6IHRoaXMucGVuZGluZ0RldmljZXMsXG4gICAgICBsYXN0X3JlYWRzOiB0aGlzLl9sYXN0UmVhZHNcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL2N1c3RvbWVybW9kZWwuanNcblxud2luZG93LmFwcC5DdXN0b21lck1vZGVsID0gY2xhc3MgQ3VzdG9tZXJNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9hY2NvdW50U3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXInKTtcblxuICAgIHRoaXMuX3Byb2ZpbGUgPSBudWxsO1xuXG4gICAgdGhpcy5faXNHdWVzdCA9IGZhbHNlO1xuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4oQ29uZmlnLmFjY291bnRzKTtcblxuICAgIHRoaXMucHJvZmlsZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2FjY291bnRTdG9yZS5yZWFkKCkudGhlbihhY2NvdW50ID0+IHtcbiAgICAgIHNlbGYuX2lzR3Vlc3QgPSBhY2NvdW50ICYmIGFjY291bnQuaXNfZ3Vlc3Q7XG5cbiAgICAgIGlmICghYWNjb3VudCB8fCBhY2NvdW50LmlzX2d1ZXN0KSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBhY2NvdW50LnByb2ZpbGU7XG4gICAgICB9XG5cbiAgICAgIHNlbGYucHJvZmlsZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fcHJvZmlsZSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lzRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCAmJiAoQm9vbGVhbih0aGlzLnByb2ZpbGUpIHx8IHRoaXMuaXNHdWVzdCk7XG4gIH1cblxuICBnZXQgaXNHdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQgJiYgQm9vbGVhbih0aGlzLl9pc0d1ZXN0KTtcbiAgfVxuXG4gIGdldCBoYXNDcmVkZW50aWFscygpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5pc0d1ZXN0ICYmIHRoaXMucHJvZmlsZS50eXBlID09PSAxKTtcbiAgfVxuXG4gIGdldCBwcm9maWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9maWxlO1xuICB9XG5cbiAgc2V0IHByb2ZpbGUodmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHJvZmlsZSA9IHZhbHVlIHx8IG51bGw7XG4gICAgdGhpcy5faXNHdWVzdCA9IHZhbHVlID09PSAnZ3Vlc3QnO1xuXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdGhpcy5fYWNjb3VudFN0b3JlLmNsZWFyKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX2lzR3Vlc3QgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcbiAgICAgICAgc2VsZi5zZXNzaW9uID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2FjY291bnRTdG9yZS53cml0ZSh7XG4gICAgICAgIHByb2ZpbGU6IHRoaXMuX3Byb2ZpbGUsXG4gICAgICAgIGlzX2d1ZXN0OiB0aGlzLl9pc0d1ZXN0XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcblxuICAgICAgICBpZiAoIXZhbHVlIHx8IHNlbGYuX2lzR3Vlc3QpIHtcbiAgICAgICAgICBzZWxmLnNlc3Npb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9sb2NhdGlvbm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuTG9jYXRpb25Nb2RlbCA9IGNsYXNzIExvY2F0aW9uTW9kZWwgZXh0ZW5kcyBhcHAuQWJzdHJhY3RNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKER0c0FwaSwgU05BUEVudmlyb25tZW50LCBTTkFQTG9jYXRpb24sIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHN1cGVyKHN0b3JhZ2VQcm92aWRlcik7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnZGV2aWNlJywgJ3NuYXBfZGV2aWNlJywgbnVsbCwgKCkgPT4gRHRzQXBpLmhhcmR3YXJlLmdldEN1cnJlbnREZXZpY2UoKSk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ2RldmljZXMnLCB1bmRlZmluZWQsIFtdKTtcbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnc2VhdCcsICdzbmFwX3NlYXQnLCBudWxsLCAoKSA9PiBEdHNBcGkubG9jYXRpb24uZ2V0Q3VycmVudFNlYXQoKSk7XG4gICAgdGhpcy5fZGVmaW5lUHJvcGVydHkoJ3NlYXRzJywgJ3NuYXBfc2VhdHMnLCBbXSwgKCkgPT4gRHRzQXBpLmxvY2F0aW9uLmdldFNlYXRzKCkpO1xuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdsb2NhdGlvbicsICdzbmFwX2xvY2F0aW9uJywgU05BUExvY2F0aW9uLCAoKSA9PiB7XG4gICAgICBpZiAoIXNlbGYuZGV2aWNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnRGV2aWNlIGRhdGEgaXMgbWlzc2luZy4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIER0c0FwaS5zbmFwLmdldENvbmZpZyhzZWxmLmRldmljZS5sb2NhdGlvbl90b2tlbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIGFkZERldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLmRldmljZXMucHVzaChkZXZpY2UpO1xuICAgIHRoaXMuX3Byb3BlcnR5Q2hhbmdlZCgnZGV2aWNlJyk7XG4gIH1cblxuICBnZXRTZWF0KHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VhdHMuZmlsdGVyKHNlYXQgPT4gc2VhdC50b2tlbiA9PT0gdG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cblxuICBnZXREZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlcy5maWx0ZXIoZCA9PiAoZGV2aWNlLnRva2VuIHx8IGRldmljZSkgPT09IGQudG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9tb2RlbC9vcmRlcm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuT3JkZXJNb2RlbCA9IGNsYXNzIE9yZGVyTW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSID0gMTtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFID0gMjtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVCA9IDM7XG5cbiAgICB0aGlzLnByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy50YXggPSAwO1xuXG4gICAgdGhpcy5fb3JkZXJDYXJ0ID0gW107XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSBbXTtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gW107XG4gICAgdGhpcy5fb3JkZXJUaWNrZXQgPSB7fTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVycyA9IHt9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICAgIFNpZ25hbHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB0aGlzLm9yZGVyQ2FydENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJDaGVja0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyVGlja2V0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gICAgSW5pdGlhbGl6YXRpb25cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0b3JlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcy5tYXAgPyBpdGVtcy5tYXAoYXBwLkNhcnRJdGVtLnByb3RvdHlwZS5yZXN0b3JlKSA6IFtdO1xuICAgIH1cblxuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNhcnQgPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNhcnRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0KTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNhcnRTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydF9zdGFzaCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoU3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0U3Rhc2gpO1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaENoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNoZWNrU3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl9jaGVjaycpO1xuICAgIHRoaXMuX29yZGVyQ2hlY2tTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDaGVjayA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDaGVjayk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2hlY2tTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlclRpY2tldFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfdGlja2V0Jyk7XG4gICAgdGhpcy5fb3JkZXJUaWNrZXRTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXQgPSB2YWx1ZSB8fCB7fTtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJUaWNrZXQpO1xuICAgICAgc2VsZi5vcmRlclRpY2tldENoYW5nZWQuYWRkKGRhdGEgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlclRpY2tldFN0b3JhZ2Uud3JpdGUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0IG9yZGVyQ2FydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDYXJ0O1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2FydCA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydCk7XG4gIH1cblxuICBnZXQgb3JkZXJDYXJ0U3Rhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2FydFN0YXNoO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydFN0YXNoKHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydFN0YXNoKTtcbiAgfVxuXG4gIGdldCBvcmRlckNoZWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNoZWNrO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2hlY2sodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNoZWNrQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2hlY2spO1xuICB9XG5cbiAgZ2V0IG9yZGVyVGlja2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlclRpY2tldDtcbiAgfVxuXG4gIHNldCBvcmRlclRpY2tldCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyVGlja2V0ID0gdmFsdWUgfHwge307XG4gICAgdGhpcy5vcmRlclRpY2tldENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlclRpY2tldCk7XG4gIH1cblxuICBnZXQgb3JkZXJSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfT1JERVIpO1xuICB9XG5cbiAgZ2V0IGFzc2lzdGFuY2VSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSk7XG4gIH1cblxuICBnZXQgY2xvc2VvdXRSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZXF1ZXN0IHdhdGNoZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXRXYXRjaGVyKGtpbmQpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICB9XG5cbiAgYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKSB7XG4gICAgdGhpcy5jbGVhcldhdGNoZXIoa2luZCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd2F0Y2hlci5wcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHNlbGYuZ2V0V2F0Y2hlcihraW5kKSAhPT0gd2F0Y2hlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWxmLmNsZWFyV2F0Y2hlcihraW5kKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXSA9IHdhdGNoZXI7XG4gICAgdGhpcy5fbm90aWZ5Q2hhbmdlKGtpbmQpO1xuICB9XG5cbiAgY2xlYXJXYXRjaGVyKGtpbmQpIHtcbiAgICB2YXIgd2F0Y2hlciA9IHRoaXMuZ2V0V2F0Y2hlcihraW5kKTtcblxuICAgIGlmICh3YXRjaGVyKSB7XG4gICAgICB3YXRjaGVyLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICAgIHRoaXMuX25vdGlmeUNoYW5nZShraW5kKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfbm90aWZ5Q2hhbmdlKGtpbmQpIHtcbiAgICB2YXIgc2lnbmFsO1xuXG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSOlxuICAgICAgICBzaWduYWwgPSB0aGlzLm9yZGVyUmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzaWduYWwpIHtcbiAgICAgIHNpZ25hbC5kaXNwYXRjaCh0aGlzLmdldFdhdGNoZXIoa2luZCkpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21vZGVsL3Nlc3Npb25tb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNlc3Npb25Nb2RlbCA9IGNsYXNzIFNlc3Npb25Nb2RlbCBleHRlbmRzIGFwcC5BYnN0cmFjdE1vZGVsICB7XG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHN1cGVyKHN0b3JhZ2VQcm92aWRlcik7XG5cbiAgICB0aGlzLl9kZWZpbmVQcm9wZXJ0eSgnYXBpVG9rZW4nLCAnc25hcF9hY2Nlc3N0b2tlbicpO1xuICAgIHRoaXMuX2RlZmluZVByb3BlcnR5KCdjdXN0b21lclRva2VuJywgJ3NuYXBfY3VzdG9tZXJfYWNjZXNzdG9rZW4nKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvc2hlbGxtb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTW9kZWwgPSBjbGFzcyBTaGVsbE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IFtdO1xuICAgIHRoaXMuYmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gW107XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fcGFnZUJhY2tncm91bmRzID0gW107XG4gICAgdGhpcy5wYWdlQmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmVsZW1lbnRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jdXJyZW5jeSA9ICcnO1xuICAgIHRoaXMuY3VycmVuY3lDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgYmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRzO1xuICB9XG5cbiAgc2V0IGJhY2tncm91bmRzKHZhbHVlKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLmJhY2tncm91bmRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgc2NyZWVuc2F2ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JlZW5zYXZlcnM7XG4gIH1cblxuICBzZXQgc2NyZWVuc2F2ZXJzKHZhbHVlKSB7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gdmFsdWU7XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYWdlQmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcztcbiAgfVxuXG4gIHNldCBwYWdlQmFja2dyb3VuZHModmFsdWUpIHtcbiAgICB0aGlzLl9wYWdlQmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLnBhZ2VCYWNrZ3JvdW5kc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcbiAgfVxuXG4gIHNldCBlbGVtZW50cyh2YWx1ZSkge1xuICAgIHRoaXMuX2VsZW1lbnRzID0gdmFsdWU7XG4gICAgdGhpcy5lbGVtZW50c0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHByaWNlRm9ybWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9wcmljZUZvcm1hdDtcbiAgfVxuXG4gIHNldCBwcmljZUZvcm1hdCh2YWx1ZSkge1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gdmFsdWU7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbmN5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW5jeTtcbiAgfVxuXG4gIHNldCBjdXJyZW5jeSh2YWx1ZSkge1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gdmFsdWU7XG4gICAgdGhpcy5jdXJyZW5jeUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbW9kZWwvc3VydmV5bW9kZWwuanNcblxud2luZG93LmFwcC5TdXJ2ZXlNb2RlbCA9IGNsYXNzIFN1cnZleU1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4oQ29uZmlnLnN1cnZleXMpO1xuICAgIHRoaXMuX3N1cnZleXMgPSB7fTtcblxuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX3N1cnZleScpO1xuXG4gICAgdGhpcy5fZmVlZGJhY2tTdXJ2ZXkgPSBudWxsO1xuICAgIHRoaXMuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLnN1cnZleUNvbXBsZXRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5fc3VydmV5cyA9IHZhbHVlIHx8IHNlbGYuX3N1cnZleXM7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lzRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgZmVlZGJhY2tTdXJ2ZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZlZWRiYWNrU3VydmV5O1xuICB9XG5cbiAgc2V0IGZlZWRiYWNrU3VydmV5KHZhbHVlKSB7XG4gICAgdGhpcy5fZmVlZGJhY2tTdXJ2ZXkgPSB2YWx1ZTtcbiAgICB0aGlzLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9mZWVkYmFja1N1cnZleSk7XG4gIH1cblxuICBnZXQgZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9zdXJ2ZXlzLmZlZWRiYWNrKTtcbiAgfVxuXG4gIHNldCBmZWVkYmFja1N1cnZleUNvbXBsZXRlKHZhbHVlKSB7XG4gICAgdGhpcy5fc3VydmV5cy5mZWVkYmFjayA9IEJvb2xlYW4odmFsdWUpO1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3N1cnZleXMpO1xuXG4gICAgdGhpcy5zdXJ2ZXlDb21wbGV0ZWQuZGlzcGF0Y2godGhpcy5mZWVkYmFja1N1cnZleSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9wZXJzaXN0ZW5jZS9hcHBjYWNoZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIEFwcENhY2hlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIEFwcENhY2hlID0gZnVuY3Rpb24oTG9nZ2VyKSB7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX2NhY2hlID0gd2luZG93LmFwcGxpY2F0aW9uQ2FjaGU7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMgPSBbXG4gICAgICAnY2FjaGVkJyxcbiAgICAgICdjaGVja2luZycsXG4gICAgICAnZG93bmxvYWRpbmcnLFxuICAgICAgJ2NhY2hlZCcsXG4gICAgICAnbm91cGRhdGUnLFxuICAgICAgJ29ic29sZXRlJyxcbiAgICAgICd1cGRhdGVyZWFkeScsXG4gICAgICAncHJvZ3Jlc3MnXG4gICAgXTtcblxuICAgIHZhciBzdGF0dXMgPSB0aGlzLl9nZXRDYWNoZVN0YXR1cygpO1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuXG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1VwZGF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9oYWRFcnJvcnMgPSBmYWxzZTtcblxuICAgIGlmIChzdGF0dXMgPT09ICdVTkNBQ0hFRCcpIHtcbiAgICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgICAgdGhpcy5jb21wbGV0ZS5kaXNwYXRjaChmYWxzZSk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2Vycm9ySGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2hhbmRsZUNhY2hlRXJyb3IoZSk7XG4gICAgfTtcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9oYW5kbGVDYWNoZUV2ZW50KGUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc0NvbXBsZXRlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9pc0NvbXBsZXRlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc1VwZGF0ZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2lzVXBkYXRlZDsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXBwQ2FjaGUucHJvdG90eXBlLCAnaGFkRXJyb3JzJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9oYWRFcnJvcnM7IH1cbiAgfSk7XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9nZXRDYWNoZVN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fY2FjaGUuc3RhdHVzKSB7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVOQ0FDSEVEOlxuICAgICAgICByZXR1cm4gJ1VOQ0FDSEVEJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuSURMRTpcbiAgICAgICAgcmV0dXJuICdJRExFJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuQ0hFQ0tJTkc6XG4gICAgICAgIHJldHVybiAnQ0hFQ0tJTkcnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5ET1dOTE9BRElORzpcbiAgICAgICAgcmV0dXJuICdET1dOTE9BRElORyc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVQREFURVJFQURZOlxuICAgICAgICByZXR1cm4gJ1VQREFURVJFQURZJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuT0JTT0xFVEU6XG4gICAgICAgIHJldHVybiAnT0JTT0xFVEUnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdVS05PV04gQ0FDSEUgU1RBVFVTJztcbiAgICB9XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZXN1bHQgPSBmdW5jdGlvbihlcnJvciwgdXBkYXRlZCkge1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgIHRoaXMuX2lzVXBkYXRlZCA9IHVwZGF0ZWQ7XG4gICAgdGhpcy5faGFkRXJyb3JzID0gKGVycm9yICE9IG51bGwpO1xuICAgIHRoaXMuY29tcGxldGUuZGlzcGF0Y2godXBkYXRlZCk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9oYW5kbGVDYWNoZUV2ZW50ID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnR5cGUgIT09ICdwcm9ncmVzcycpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGUgZXZlbnQ6ICcgKyBlLnR5cGUpO1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyB0aGlzLl9nZXRDYWNoZVN0YXR1cygpKTtcbiAgICB9XG5cbiAgICBpZiAoZS50eXBlID09PSAndXBkYXRlcmVhZHknKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hpbmcgY29tcGxldGUuIFN3YXBwaW5nIHRoZSBjYWNoZS4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX2NhY2hlLnN3YXBDYWNoZSgpO1xuXG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgdHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKGUudHlwZSA9PT0gJ2NhY2hlZCcpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gQ2FjaGUgc2F2ZWQuJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgZmFsc2UpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLnR5cGUgPT09ICdub3VwZGF0ZScpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gTm8gdXBkYXRlcy4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCBmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5faGFuZGxlQ2FjaGVFcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYWNoZSB1cGRhdGUgZXJyb3I6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fcmVzdWx0KGUsIGZhbHNlKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkFwcENhY2hlID0gQXBwQ2FjaGU7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvcGVyc2lzdGVuY2Uvc3RvcmUuY29yZG92YS5qc1xuXG53aW5kb3cuYXBwLkNvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZSA9IGNsYXNzIENvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5faWQgPSBpZDtcblxuICAgIGlmICghbG9jYWxTdG9yYWdlKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ29yZG92YSBub3QgZm91bmQuJyk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2lkKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuICB9XG5cbiAgcmVhZCgpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHZhbHVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9pZCkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2lkLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9wZXJzaXN0ZW5jZS9zdG9yZS5pbm1lbW9yeS5qc1xuXG53aW5kb3cuYXBwLkluTWVtb3J5U3RvcmUgPSBjbGFzcyBJbk1lbW9yeVN0b3JlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IG51bGw7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHJlYWQoKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9zdG9yYWdlKTtcbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IHZhbHVlO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3BlcnNpc3RlbmNlL3N0b3JlLmxvY2Fsc3RvcmFnZS5qc1xuXG53aW5kb3cuYXBwLkxvY2FsU3RvcmFnZVN0b3JlID0gY2xhc3MgTG9jYWxTdG9yYWdlU3RvcmUge1xuICBjb25zdHJ1Y3RvcihpZCkge1xuICAgIHRoaXMuX2lkID0gaWQ7XG5cbiAgICBpZiAoIXN0b3JlKSB7XG4gICAgICB0aHJvdyBFcnJvcignU3RvcmUuanMgbm90IGZvdW5kLicpO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRyeSB7XG4gICAgICBzdG9yZS5yZW1vdmUodGhpcy5faWQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cblxuICByZWFkKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdmFsdWUgPSBzdG9yZS5nZXQodGhpcy5faWQpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHN0b3JlLnNldCh0aGlzLl9pZCwgdmFsdWUpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL2JhY2tlbmRhcGkuanNcblxud2luZG93LmFwcC5CYWNrZW5kQXBpID0gY2xhc3MgQmFja2VuZEFwaSB7XG4gIGNvbnN0cnVjdG9yKEhvc3RzLCBTZXNzaW9uTW9kZWwpIHtcbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBidXNpbmVzc1Rva2VuUHJvdmlkZXIoKSB7XG4gICAgICBpZiAoIXNlbGYuX1Nlc3Npb25Nb2RlbC5hcGlUb2tlbikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzZWxmLl9TZXNzaW9uTW9kZWwuYXBpVG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXN0b21lclRva2VuUHJvdmlkZXIoKSB7XG4gICAgICBpZiAoIXNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNlbGYuX1Nlc3Npb25Nb2RlbC5jdXN0b21lclRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIER0c0FwaUNsaWVudCkge1xuICAgICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgaG9zdDoge1xuICAgICAgICAgIGRvbWFpbjogSG9zdHMuYXBpLmhvc3QsXG4gICAgICAgICAgc2VjdXJlOiBIb3N0cy5hcGkuc2VjdXJlID09PSAndHJ1ZSdcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHByb3ZpZGVyID0gYnVzaW5lc3NUb2tlblByb3ZpZGVyO1xuXG4gICAgICBpZiAoa2V5ID09PSAnc25hcCcpIHtcbiAgICAgICAgY29uZmlnLmhvc3QuZG9tYWluID0gSG9zdHMuY29udGVudC5ob3N0O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoa2V5ID09PSAnY3VzdG9tZXInKSB7XG4gICAgICAgIHByb3ZpZGVyID0gY3VzdG9tZXJUb2tlblByb3ZpZGVyO1xuICAgICAgfVxuXG4gICAgICB0aGlzW2tleV0gPSBuZXcgRHRzQXBpQ2xpZW50W2tleV0oY29uZmlnLCBwcm92aWRlcik7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9jYXJkcmVhZGVyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJkUmVhZGVyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcmRSZWFkZXIgPSBmdW5jdGlvbihNYW5hZ2VtZW50U2VydmljZSkge1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5vblJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbkVycm9yID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUucmVjZWl2ZWQgPSBmdW5jdGlvbihjYXJkKSB7XG4gICAgdGhpcy5vblJlY2VpdmVkLmRpc3BhdGNoKGNhcmQpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIHRoaXMub25FcnJvci5kaXNwYXRjaChlKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdGFydENhcmRSZWFkZXIoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdG9wQ2FyZFJlYWRlcigpO1xuICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FyZFJlYWRlciA9IENhcmRSZWFkZXI7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9kYXRhcHJvdmlkZXIuanNcblxud2luZG93LmFwcC5EYXRhUHJvdmlkZXIgPSBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcihjb25maWcsIHNlcnZpY2UpIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fc2VydmljZSA9IHNlcnZpY2U7XG4gICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fY2FjaGUgPSB7fTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2VzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2RpZ2VzdCcsICdnZXREaWdlc3QnKTtcbiAgfVxuXG4gIGhvbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdob21lJywgJ2dldE1lbnVzJyk7XG4gIH1cblxuICBhZHZlcnRpc2VtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2FkdmVydGlzZW1lbnRzJywgJ2dldEFkdmVydGlzZW1lbnRzJyk7XG4gIH1cblxuICBiYWNrZ3JvdW5kcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2JhY2tncm91bmRzJywgJ2dldEJhY2tncm91bmRzJyk7XG4gIH1cblxuICBlbGVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2VsZW1lbnRzJywgJ2dldEVsZW1lbnRzJyk7XG4gIH1cblxuICBtZW51KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdtZW51JywgJ2dldE1lbnUnLCBpZCk7XG4gIH1cblxuICBjYXRlZ29yeShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnY2F0ZWdvcnknLCAnZ2V0TWVudUNhdGVnb3J5JywgaWQpO1xuICB9XG5cbiAgaXRlbShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnaXRlbScsICdnZXRNZW51SXRlbScsIGlkKTtcbiAgfVxuXG4gIHN1cnZleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdzdXJ2ZXlzJywgJ2dldFN1cnZleXMnKTtcbiAgfVxuXG4gIHNlYXRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdzZWF0cycpIHx8IHRoaXMuX3NlcnZpY2UubG9jYXRpb24uZ2V0U2VhdHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCAnc2VhdHMnKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgbWVkaWEobWVkaWEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRva2VuID0gbWVkaWEudG9rZW4gKyAnXycgKyBtZWRpYS53aWR0aCArICdfJyArIG1lZGlhLmhlaWdodDtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdtZWRpYScsIHRva2VuKSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAobWVkaWEud2lkdGggJiYgbWVkaWEuaGVpZ2h0KSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1nKTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4gcmVqZWN0KGUpO1xuICAgICAgICBpbWcuc3JjID0gc2VsZi5fZ2V0TWVkaWFVcmwobWVkaWEsIG1lZGlhLndpZHRoLCBtZWRpYS5oZWlnaHQsIG1lZGlhLmV4dGVuc2lvbik7XG5cbiAgICAgICAgc2VsZi5fc3RvcmUoaW1nLCAnbWVkaWEnLCB0b2tlbik7XG5cbiAgICAgICAgaWYgKGltZy5jb21wbGV0ZSkge1xuICAgICAgICAgIHJlc29sdmUoaW1nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlamVjdCgnTWlzc2luZyBpbWFnZSBkaW1lbnNpb25zJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBfZ2V0U25hcERhdGEobmFtZSwgbWV0aG9kLCBpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKG5hbWUsIGlkKSB8fCB0aGlzLl9zZXJ2aWNlLnNuYXBbbWV0aG9kXSh0aGlzLl9jb25maWcubG9jYXRpb24sIGlkKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCBuYW1lLCBpZCk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIF9vbkVycm9yKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICBfY2FjaGVkKGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0gJiYgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF1baWRdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF0pO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgX3N0b3JlKGRhdGEsIGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCkge1xuICAgICAgaWYgKCF0aGlzLl9jYWNoZVtncm91cF0pIHtcbiAgICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdID0ge307XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0gPSBkYXRhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXSA9IGRhdGE7XG4gICAgfVxuICB9XG5cbiAgX2dldE1lZGlhVXJsKCkge1xuXG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL21hbmFnZW1lbnRzZXJ2aWNlLmNvcmRvdmEuanNcblxud2luZG93LmFwcC5Db3Jkb3ZhTWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBDb3Jkb3ZhTWFuYWdlbWVudFNlcnZpY2Uge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKExvZ2dlcikge1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcblxuICAgIGlmICghd2luZG93LmNvcmRvdmEpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci53YXJuKCdDb3Jkb3ZhIGlzIG5vdCBhdmFpbGFibGUuJyk7XG4gICAgfVxuICB9XG5cbiAgcm90YXRlU2NyZWVuKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIG9wZW5Ccm93c2VyKHVybCwgYnJvd3NlclJlZiwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgdmFyIHRhcmdldCA9IG9wdGlvbnMuc3lzdGVtID8gJ19ibGFuaycgOiAnX2JsYW5rJyxcbiAgICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIGxvY2F0aW9uOiBvcHRpb25zLnN5c3RlbSA/ICdubycgOiAneWVzJyxcbiAgICAgICAgICAgIGNsZWFyY2FjaGU6ICd5ZXMnLFxuICAgICAgICAgICAgY2xlYXJzZXNzaW9uY2FjaGU6ICd5ZXMnLFxuICAgICAgICAgICAgem9vbTogJ25vJyxcbiAgICAgICAgICAgIGhhcmR3YXJlYmFjazogJ25vJ1xuICAgICAgICAgIH07XG5cbiAgICAgIGJyb3dzZXJSZWYgPSB3aW5kb3cub3Blbih1cmwsIHRhcmdldCwgT2JqZWN0LmtleXMoc2V0dGluZ3MpLm1hcCh4ID0+IGAke3h9PSR7c2V0dGluZ3NbeF19YCkuam9pbignLCcpKTtcbiAgICAgIHJlc29sdmUobmV3IGFwcC5Db3Jkb3ZhV2ViQnJvd3NlclJlZmVyZW5jZShicm93c2VyUmVmKSk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZUJyb3dzZXIoYnJvd3NlclJlZikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGJyb3dzZXJSZWYuZXhpdCgpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRDYXJkUmVhZGVyKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHN0b3BDYXJkUmVhZGVyKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgfSk7XG4gIH1cblxuICBsb2FkQXBwbGljYXRpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB3aW5kb3cub3Blbihgc25hcC5odG1sYCwgJ19zZWxmJyk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRTb3VuZFZvbHVtZSgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKDEwMCk7XG4gIH1cblxuICBzZXRTb3VuZFZvbHVtZSh2YWx1ZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIGdldERpc3BsYXlCcmlnaHRuZXNzKCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoMTAwKTtcbiAgfVxuXG4gIHNldERpc3BsYXlCcmlnaHRuZXNzKHZhbHVlKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9tYW5hZ2VtZW50c2VydmljZS5ob21lYnJldy5qc1xuXG53aW5kb3cuYXBwLkhvbWVicmV3TWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBIb21lYnJld01hbmFnZW1lbnRTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9hcGkgPSB7XG4gICAgICAncm90YXRlU2NyZWVuJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9yb3RhdGUtc2NyZWVuJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ29wZW5Ccm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9vcGVuLWJyb3dzZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnY2xvc2VCcm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9jbG9zZS1icm93c2VyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3N0YXJ0Q2FyZFJlYWRlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvc3RhcnQtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc3RvcENhcmRSZWFkZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3N0b3AtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAncmVzZXQnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3Jlc2V0Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2dldFNvdW5kVm9sdW1lJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC92b2x1bWUnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc2V0U291bmRWb2x1bWUnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3ZvbHVtZScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdnZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KVxuICAgIH07XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9XG5cbiAgcm90YXRlU2NyZWVuKCkge1xuICAgIHRoaXMuX2FwaS5yb3RhdGVTY3JlZW4ucXVlcnkoKTtcbiAgfVxuXG4gIG9wZW5Ccm93c2VyKHVybCwgYnJvd3NlclJlZikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICByZXR1cm4gc2VsZi5fYXBpLm9wZW5Ccm93c2VyLnF1ZXJ5KHsgdXJsOiB1cmwgfSkudGhlbihyZXNvbHZlID0+IHtcbiAgICAgICAgdmFyIGJyb3dzZXIgPSBuZXcgYXBwLldlYkJyb3dzZXJSZWZlcmVuY2UoKTtcbiAgICAgICAgYnJvd3Nlci5vbk5hdmlnYXRlZC5kaXNwYXRjaCh1cmwpO1xuICAgICAgICByZXNvbHZlKGJyb3dzZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZUJyb3dzZXIoYnJvd3NlclJlZikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoYnJvd3NlclJlZikge1xuICAgICAgICBicm93c2VyUmVmLm9uRXhpdC5kaXNwYXRjaCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5fYXBpLmNsb3NlQnJvd3Nlci5xdWVyeSgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRDYXJkUmVhZGVyKCkge1xuICAgIHRoaXMuX2FwaS5zdGFydENhcmRSZWFkZXIucXVlcnkoKTtcbiAgfVxuXG4gIHN0b3BDYXJkUmVhZGVyKCkge1xuICAgIHRoaXMuX2FwaS5zdG9wQ2FyZFJlYWRlci5xdWVyeSgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkucmVzZXQucXVlcnkoKS4kcHJvbWlzZS50aGVuKHJlc29sdmUsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKCcvc25hcC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkQXBwbGljYXRpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uYXNzaWduKCcvc25hcC8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSkpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0U291bmRWb2x1bWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXRTb3VuZFZvbHVtZS5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0U291bmRWb2x1bWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldFNvdW5kVm9sdW1lLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG5cbiAgZ2V0RGlzcGxheUJyaWdodG5lc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXREaXNwbGF5QnJpZ2h0bmVzcy5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldERpc3BsYXlCcmlnaHRuZXNzLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2VydmljZS9zb2NrZXRjbGllbnQuanNcblxud2luZG93LmFwcC5Tb2NrZXRDbGllbnQgPSBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBjb25zdHJ1Y3RvcihTZXNzaW9uTW9kZWwsIEhvc3RzLCBMb2dnZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9TZXNzaW9uTW9kZWwgPSBTZXNzaW9uTW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2NoYW5uZWxzID0ge307XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldENsdXN0ZXIuY29ubmVjdCh7XG4gICAgICBob3N0bmFtZTogSG9zdHMuc29ja2V0Lmhvc3QsXG4gICAgICBwYXRoOiBIb3N0cy5zb2NrZXQucGF0aCxcbiAgICAgIHBvcnQ6IEhvc3RzLnNvY2tldC5wb3J0LFxuICAgICAgc2VjdXJlOiBIb3N0cy5zb2NrZXQuc2VjdXJlXG4gICAgfSk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdjb25uZWN0Jywgc3RhdHVzID0+IHtcbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgU29ja2V0IGNvbm5lY3RlZC5gKTtcbiAgICAgIHNlbGYuX2F1dGhlbnRpY2F0ZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgU29ja2V0IGRpc2Nvbm5lY3RlZC5gKTtcbiAgICAgIHNlbGYuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgICBzZWxmLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmlzQ29ubmVjdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBzdWJzY3JpYmUodG9waWMsIGhhbmRsZXIpIHtcbiAgICB0aGlzLl9nZXRDaGFubmVsKHRvcGljKS53YXRjaChoYW5kbGVyKTtcbiAgfVxuXG4gIHNlbmQodG9waWMsIGRhdGEpIHtcbiAgICB0aGlzLl9nZXRDaGFubmVsKHRvcGljKS5wdWJsaXNoKGRhdGEpO1xuICB9XG5cbiAgX2dldENoYW5uZWwodG9waWMpIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhbm5lbHNbdG9waWNdIHx8ICh0aGlzLl9jaGFubmVsc1t0b3BpY10gPSB0aGlzLl9zb2NrZXQuc3Vic2NyaWJlKHRvcGljKSk7XG4gIH1cblxuICBfYXV0aGVudGljYXRlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLl9zb2NrZXQuZW1pdCgnYXV0aGVudGljYXRlJywge1xuICAgICAgYWNjZXNzX3Rva2VuOiBzZWxmLl9TZXNzaW9uTW9kZWwuYXBpVG9rZW5cbiAgICB9LCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBzZWxmLl9Mb2dnZXIud2FybihgVW5hYmxlIHRvIGF1dGhlbnRpY2F0ZSBzb2NrZXQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgc2VsZi5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2goc2VsZi5pc0Nvbm5lY3RlZCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXJ2aWNlL3RlbGVtZXRyeXNlcnZpY2UuanNcblxud2luZG93LmFwcC5UZWxlbWV0cnlTZXJ2aWNlID0gY2xhc3MgVGVsZW1ldHJ5U2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSkge1xuICAgIHRoaXMuX2FwaSA9IHtcbiAgICAgICdzdWJtaXRUZWxlbWV0cnknOiAkcmVzb3VyY2UoJy9zbmFwL3RlbGVtZXRyeScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSksXG4gICAgICAnc3VibWl0TG9ncyc6ICRyZXNvdXJjZSgnL3NuYXAvbG9ncycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSlcbiAgICB9O1xuICB9XG5cbiAgc3VibWl0VGVsZW1ldHJ5KGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnN1Ym1pdFRlbGVtZXRyeS5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHN1Ym1pdExvZ3MoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0TG9ncy5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NlcnZpY2Uvd2ViYnJvd3Nlci5qc1xuXG53aW5kb3cuYXBwLldlYkJyb3dzZXIgPSBjbGFzcyBXZWJCcm93c2VyIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMsIFVSSSAqL1xuXG4gIGNvbnN0cnVjdG9yKEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpIHtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5fbG9jYWxIb3N0cyA9IE9iamVjdC5rZXlzKFNOQVBIb3N0cykubWFwKHAgPT4gU05BUEhvc3RzW3BdLmhvc3QpO1xuICAgIHRoaXMuX2xvY2FsSG9zdHMucHVzaCgnbG9jYWxob3N0Jyk7XG5cbiAgICB0aGlzLm9uT3BlbiA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DbG9zZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2Jyb3dzZXIgPSBudWxsO1xuICB9XG5cbiAgb3Blbih1cmwsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5fTWFuYWdlbWVudFNlcnZpY2Uub3BlbkJyb3dzZXIodXJsLCB0aGlzLl9icm93c2VyLCBvcHRpb25zKS50aGVuKGJyb3dzZXIgPT4ge1xuICAgICAgc2VsZi5fYnJvd3NlciA9IGJyb3dzZXI7XG4gICAgICBzZWxmLm9uT3Blbi5kaXNwYXRjaCh1cmwsIHNlbGYuX2Jyb3dzZXIpO1xuICAgICAgc2VsZi5fYnJvd3Nlck9wZW5lZCA9IHRydWU7XG5cbiAgICAgIHNlbGYuX2Jyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKHVybCA9PiB7XG4gICAgICAgIHNlbGYub25OYXZpZ2F0ZWQuZGlzcGF0Y2godXJsKTtcblxuICAgICAgICBsZXQgaG9zdCA9IFVSSSh1cmwpLmhvc3RuYW1lKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX2xvY2FsSG9zdHMuaW5kZXhPZihob3N0KSA9PT0gLTEpIHtcbiAgICAgICAgICBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dVcmwodXJsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzZWxmLl9icm93c2VyLm9uRXhpdC5hZGRPbmNlKCgpID0+IHtcbiAgICAgICAgc2VsZi5vbkNsb3NlLmRpc3BhdGNoKCk7XG4gICAgICAgIHNlbGYuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5fYnJvd3NlciA9IG51bGw7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJyb3dzZXI7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIXRoaXMuX2Jyb3dzZXJPcGVuZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fTWFuYWdlbWVudFNlcnZpY2UuY2xvc2VCcm93c2VyKHRoaXMuX2Jyb3dzZXIpLnRoZW4oKCkgPT4ge1xuICAgICAgc2VsZi5fYnJvd3NlciA9IG51bGw7XG4gICAgICBzZWxmLm9uQ2xvc2UuZGlzcGF0Y2goKTtcbiAgICAgIHNlbGYuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgRXh0ZXJuYWwgbWV0aG9kc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgbmF2aWdhdGVkKHVybCkge1xuICAgIGlmICh0aGlzLl9icm93c2VyKSB7XG4gICAgICB0aGlzLl9icm93c2VyLm9uTmF2aWdhdGVkLmRpc3BhdGNoKHVybCk7XG4gICAgfVxuICB9XG5cbiAgY2FsbGJhY2soZGF0YSkge1xuICAgIGlmICh0aGlzLl9icm93c2VyKSB7XG4gICAgICB0aGlzLl9icm93c2VyLm9uQ2FsbGJhY2suZGlzcGF0Y2goZGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvd29ya2Vycy9oZWF0bWFwLmpzXG5cbndpbmRvdy5hcHAuSGVhdE1hcCA9IGNsYXNzIEhlYXRNYXAge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fbGlzdGVuZXIgPSBlID0+IHtcbiAgICAgIHNlbGYuX29uQ2xpY2soZSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2VsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9saXN0ZW5lcik7XG5cbiAgICB0aGlzLmNsaWNrZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2xpc3RlbmVyKTtcbiAgfVxuXG4gIF9vbkNsaWNrKGUpIHtcbiAgICBsZXQgZGF0YSA9IHtcbiAgICAgIHg6IGUubGF5ZXJYIC8gdGhpcy5fZWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgIHk6IGUubGF5ZXJZIC8gdGhpcy5fZWxlbWVudC5jbGllbnRIZWlnaHRcbiAgICB9O1xuXG4gICAgaWYgKGRhdGEueCA8IDAgfHwgZGF0YS55IDwgMCB8fCBkYXRhLnggPiAxIHx8IGRhdGEueSA+IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNsaWNrZWQuZGlzcGF0Y2goZGF0YSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC93b3JrZXJzL2xvZ2dlci5qc1xuXG53aW5kb3cuYXBwLkxvZ2dlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX2xvZyA9IGxvZzRqYXZhc2NyaXB0LmdldExvZ2dlcigpO1xuXG4gICAgdmFyIGFqYXhBcHBlbmRlciA9IG5ldyBsb2c0amF2YXNjcmlwdC5BamF4QXBwZW5kZXIoJy9zbmFwL2xvZycpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRXYWl0Rm9yUmVzcG9uc2UodHJ1ZSk7XG4gICAgYWpheEFwcGVuZGVyLnNldExheW91dChuZXcgbG9nNGphdmFzY3JpcHQuSnNvbkxheW91dCgpKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0VGhyZXNob2xkKGxvZzRqYXZhc2NyaXB0LkxldmVsLkVSUk9SKTtcblxuICAgIHRoaXMuX2xvZy5hZGRBcHBlbmRlcihhamF4QXBwZW5kZXIpO1xuICAgIHRoaXMuX2xvZy5hZGRBcHBlbmRlcihuZXcgbG9nNGphdmFzY3JpcHQuQnJvd3NlckNvbnNvbGVBcHBlbmRlcigpKTtcbiAgfVxuXG4gIGRlYnVnKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuZGVidWcoLi4uYXJncyk7XG4gIH1cblxuICBpbmZvKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuaW5mbyguLi5hcmdzKTtcbiAgfVxuXG4gIHdhcm4oLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy53YXJuKC4uLmFyZ3MpO1xuICB9XG5cbiAgZXJyb3IoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5lcnJvciguLi5hcmdzKTtcbiAgfVxuXG4gIGZhdGFsKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuZmF0YWwoLi4uYXJncyk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC93b3JrZXJzL21lZGlhc3RhcnRlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzd2ZvYmplY3QgKi9cblxuICBmdW5jdGlvbiBNZWRpYVN0YXJ0ZXIoaWQpIHtcblxuICAgIHZhciBmbGFzaHZhcnMgPSB7fTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgbWVudTogJ2ZhbHNlJyxcbiAgICAgIHdtb2RlOiAnZGlyZWN0JyxcbiAgICAgIGFsbG93RnVsbFNjcmVlbjogJ2ZhbHNlJ1xuICAgIH07XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBuYW1lOiBpZFxuICAgIH07XG5cbiAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcigndXJsJyksXG4gICAgICBpZCxcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd3aWR0aCcpLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ2hlaWdodCcpLFxuICAgICAgJzE2LjAuMCcsXG4gICAgICAnZXhwcmVzc0luc3RhbGwuc3dmJyxcbiAgICAgIGZsYXNodmFycyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdWNjZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIE1lZGlhU3RhcnRlci5wcm90b3R5cGUuX2dldFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcIyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIiksXG4gICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uaGFzaCk7XG4gICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyB1bmRlZmluZWQgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLk1lZGlhU3RhcnRlciA9IE1lZGlhU3RhcnRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL2FwcHMuanNcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vXG4vLyAgQXBwbGljYXRpb25Cb290c3RyYXBlclxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5hcHAuQXBwbGljYXRpb25Cb290c3RyYXBlciA9IGNsYXNzIEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaG9zdHMgPSB7XG4gICAgICBhcGk6IHsgJ2hvc3QnOiAnYXBpMi5tYW5hZ2VzbmFwLmNvbScsICdzZWN1cmUnOiB0cnVlIH0sXG4gICAgICBjb250ZW50OiB7ICdob3N0JzogJ2NvbnRlbnQubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogZmFsc2UgfSxcbiAgICAgIG1lZGlhOiB7ICdob3N0JzogJ2NvbnRlbnQubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogZmFsc2UgfSxcbiAgICAgIHN0YXRpYzogeyAncGF0aCc6ICcvJyB9LFxuICAgICAgc29ja2V0OiB7ICdob3N0JzogJ3dlYi1kZXYubWFuYWdlc25hcC5jb20nLCAnc2VjdXJlJzogdHJ1ZSwgJ3BvcnQnOjgwODAsICdwYXRoJzogJy9zb2NrZXQvJyB9XG4gICAgfTtcblxuICAgIHRoaXMuZW52aXJvbm1lbnQgPSB7XG4gICAgICBtYWluX2FwcGxpY2F0aW9uOiB7ICdjbGllbnRfaWQnOiAnZDY3NjEwYjFjOTEwNDRkOGFiZDU1Y2JkYTZjNjE5ZjAnLCAnY2FsbGJhY2tfdXJsJzogJ2h0dHA6Ly9sb2NhaG9zdC9jYWxsYmFjay9hcGknLCAnc2NvcGUnOiAnJyB9LFxuICAgICAgY3VzdG9tZXJfYXBwbGljYXRpb246IHsgJ2NsaWVudF9pZCc6ICc5MTM4MWE4NmIzYjQ0NGZkODc2ZGY4MGIyMmQ3ZmE2ZScgfSxcbiAgICAgIGZhY2Vib29rX2FwcGxpY2F0aW9uOiB7ICdjbGllbnRfaWQnOiAnMzQ5NzI5NTE4NTQ1MzEzJywgJ3JlZGlyZWN0X3VybCc6ICdodHRwczovL3dlYi5tYW5hZ2VzbmFwLmNvbS9jYWxsYmFjay9mYWNlYm9vaycgfSxcbiAgICAgIGdvb2dsZXBsdXNfYXBwbGljYXRpb246IHsgJ2NsaWVudF9pZCc6ICc2Nzg5OTgyNTA5NDEtMWRtZWJwNGtzbmk5dHNqdGg0NXRzaHQ4bDdjbDFtcm4uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLCAncmVkaXJlY3RfdXJsJzogJ2h0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL2dvb2dsZXBsdXMnIH0sXG4gICAgICB0d2l0dGVyX2FwcGxpY2F0aW9uOiB7ICdjb25zdW1lcl9rZXknOiAneVE4WEoxNVBtYVBPaTRMNURKUGlrR0NJMCcsICdyZWRpcmVjdF91cmwnOiAnaHR0cHM6Ly93ZWIubWFuYWdlc25hcC5jb20vY2FsbGJhY2svdHdpdHRlcicgfVxuICAgIH07XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFB1YmxpYyBtZXRob2RzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjb25maWd1cmUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgc3RvcmUgPSBuZXcgYXBwLkNvcmRvdmFMb2NhbFN0b3JhZ2VTdG9yZSgnc25hcF9sb2NhdGlvbicpO1xuXG4gICAgICBzdG9yZS5yZWFkKCkudGhlbihjb25maWcgPT4ge1xuICAgICAgICBzZWxmLmxvY2F0aW9uID0gY29uZmlnIHx8IG51bGw7XG5cbiAgICAgICAgYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29uZmlncycsIFtdKVxuICAgICAgICAgIC5jb25zdGFudCgnU05BUExvY2F0aW9uJywgc2VsZi5sb2NhdGlvbilcbiAgICAgICAgICAuY29uc3RhbnQoJ1NOQVBFbnZpcm9ubWVudCcsIHNlbGYuZW52aXJvbm1lbnQpXG4gICAgICAgICAgLmNvbnN0YW50KCdTTkFQSG9zdHMnLCBzZWxmLmhvc3RzKTtcblxuICAgICAgICBpZiAoc2VsZi5ob3N0cy5zdGF0aWMuaG9zdCkge1xuICAgICAgICAgICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLnJlc291cmNlVXJsV2hpdGVsaXN0KFsgJ3NlbGYnLCBuZXcgUmVnRXhwKCcuKicgKyBzZWxmLmhvc3RzLnN0YXRpYy5ob3N0ICsgJy4qJykgXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBIZWxwZXIgbWV0aG9kc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX2dldFBhcnRpYWxVcmwobmFtZSkge1xuICAgIGlmICghdGhpcy5ob3N0cykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGhvc3RzIGNvbmZpZ3VyYXRpb24uJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmxvY2F0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgbG9jYXRpb24gY29uZmlndXJhdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgcGF0aCA9IHRoaXMuaG9zdHMuc3RhdGljLmhvc3QgP1xuICAgICAgYC8vJHt0aGlzLmhvc3RzLnN0YXRpYy5ob3N0fSR7dGhpcy5ob3N0cy5zdGF0aWMucGF0aH1gIDpcbiAgICAgIGAke3RoaXMuaG9zdHMuc3RhdGljLnBhdGh9YDtcblxuICAgIHJldHVybiBgJHtwYXRofWFzc2V0cy8ke3RoaXMubG9jYXRpb24udGhlbWUubGF5b3V0fS9wYXJ0aWFscy8ke25hbWV9Lmh0bWxgO1xuICB9XG59O1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy9cbi8vICBTbmFwQXBwbGljYXRpb25Cb290c3RyYXBlclxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5hcHAuU25hcEFwcGxpY2F0aW9uQm9vdHN0cmFwZXIgPSBjbGFzcyBTbmFwQXBwbGljYXRpb25Cb290c3RyYXBlciBleHRlbmRzIGFwcC5BcHBsaWNhdGlvbkJvb3RzdHJhcGVyIHtcbiAgY29uZmlndXJlKCkge1xuICAgIHJldHVybiBzdXBlci5jb25maWd1cmUoKS50aGVuKCgpID0+IHtcbiAgICAgIGFuZ3VsYXIubW9kdWxlKCdTTkFQQXBwbGljYXRpb24nLCBbXG4gICAgICAgICduZ1JvdXRlJyxcbiAgICAgICAgJ25nQW5pbWF0ZScsXG4gICAgICAgICduZ1RvdWNoJyxcbiAgICAgICAgJ25nU2FuaXRpemUnLFxuICAgICAgICAnU05BUC5jb25maWdzJyxcbiAgICAgICAgJ1NOQVAuY29udHJvbGxlcnMnLFxuICAgICAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAgICAgJ1NOQVAuZmlsdGVycycsXG4gICAgICAgICdTTkFQLnNlcnZpY2VzJ1xuICAgICAgXSkuXG4gICAgICBjb25maWcoXG4gICAgICAgIFsnJGxvY2F0aW9uUHJvdmlkZXInLCAnJHJvdXRlUHJvdmlkZXInLCAnJHNjZURlbGVnYXRlUHJvdmlkZXInLFxuICAgICAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyLCAkc2NlRGVsZWdhdGVQcm92aWRlcikgPT4ge1xuXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZShmYWxzZSk7XG5cbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0hvbWVCYXNlQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9tZW51Lzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ01lbnVCYXNlQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jYXRlZ29yeS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdDYXRlZ29yeUJhc2VDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2l0ZW0vOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnSXRlbUJhc2VDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3VybC86dXJsJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnVXJsQ3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGVja291dCcsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ2NoZWNrb3V0JyksIGNvbnRyb2xsZXI6ICdDaGVja291dEN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvc2lnbmluJywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnc2lnbmluJyksIGNvbnRyb2xsZXI6ICdTaWduSW5DdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2FjY291bnQnLCB7IHRlbXBsYXRlVXJsOiB0aGlzLl9nZXRQYXJ0aWFsVXJsKCdhY2NvdW50JyksIGNvbnRyb2xsZXI6ICdBY2NvdW50Q3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGF0JywgeyB0ZW1wbGF0ZVVybDogdGhpcy5fZ2V0UGFydGlhbFVybCgnY2hhdCcpLCBjb250cm9sbGVyOiAnQ2hhdEN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hhdG1hcCcsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ2NoYXRtYXAnKSwgY29udHJvbGxlcjogJ0NoYXRNYXBDdHJsJyB9KTtcbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3N1cnZleScsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ3N1cnZleScpLCBjb250cm9sbGVyOiAnU3VydmV5Q3RybCcgfSk7XG4gICAgICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7IHJlZGlyZWN0VG86ICcvJyB9KTtcbiAgICAgIH1dKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bigpIHtcbiAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydTTkFQQXBwbGljYXRpb24nXSk7XG4gIH1cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gIFN0YXJ0dXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyXG4vL1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxud2luZG93LmFwcC5TdGFydHVwQXBwbGljYXRpb25Cb290c3RyYXBlciA9IGNsYXNzIFN0YXJ0dXBBcHBsaWNhdGlvbkJvb3RzdHJhcGVyIGV4dGVuZHMgYXBwLkFwcGxpY2F0aW9uQm9vdHN0cmFwZXIge1xuICBjb25maWd1cmUoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmNvbmZpZ3VyZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgYW5ndWxhci5tb2R1bGUoJ1NOQVBTdGFydHVwJywgW1xuICAgICAgICAnbmdSb3V0ZScsXG4gICAgICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICAgICAnU05BUC5jb250cm9sbGVycycsXG4gICAgICAgICdTTkFQLmRpcmVjdGl2ZXMnLFxuICAgICAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAgICAgJ1NOQVAuc2VydmljZXMnXG4gICAgICBdKS5cbiAgICAgIGNvbmZpZygoKSA9PiB7fSk7XG4gICAgfSk7XG4gIH1cblxuICBydW4oKSB7XG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnU05BUFN0YXJ0dXAnXSk7XG4gIH1cbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vL1xuLy8gIFNuYXBBdXhpbGlhcmVzQXBwbGljYXRpb25Cb290c3RyYXBlclxuLy9cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbndpbmRvdy5hcHAuU25hcEF1eGlsaWFyZXNBcHBsaWNhdGlvbkJvb3RzdHJhcGVyID0gY2xhc3MgU25hcEF1eGlsaWFyZXNBcHBsaWNhdGlvbkJvb3RzdHJhcGVyIGV4dGVuZHMgYXBwLkFwcGxpY2F0aW9uQm9vdHN0cmFwZXIge1xuICBjb25maWd1cmUoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmNvbmZpZ3VyZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgYW5ndWxhci5tb2R1bGUoJ1NOQVBBdXhpbGlhcmVzJywgW1xuICAgICAgICAnbmdSb3V0ZScsXG4gICAgICAgICduZ0FuaW1hdGUnLFxuICAgICAgICAnbmdUb3VjaCcsXG4gICAgICAgICduZ1Nhbml0aXplJyxcbiAgICAgICAgJ1NOQVAuY29uZmlncycsXG4gICAgICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAgICAgJ1NOQVAuZGlyZWN0aXZlcycsXG4gICAgICAgICdTTkFQLmZpbHRlcnMnLFxuICAgICAgICAnU05BUC5zZXJ2aWNlcydcbiAgICAgIF0pLlxuICAgICAgY29uZmlnKFxuICAgICAgICBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyRyb3V0ZVByb3ZpZGVyJyxcbiAgICAgICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikgPT4ge1xuXG4gICAgICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZShmYWxzZSk7XG5cbiAgICAgICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHsgdGVtcGxhdGVVcmw6IHRoaXMuX2dldFBhcnRpYWxVcmwoJ2NoYXRyb29tJyksIGNvbnRyb2xsZXI6ICdDaGF0Um9vbUN0cmwnIH0pO1xuICAgICAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoeyByZWRpcmVjdFRvOiAnLycgfSk7XG4gICAgICB9XSk7XG4gICAgfSk7XG4gIH1cblxuICBydW4oKSB7XG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnU05BUEF1eGlsaWFyZXMnXSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJywgWydhbmd1bGFyLWJhY29uJ10pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9hY2NvdW50LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIFsnJHNjb3BlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCBDdXN0b21lck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG5cbiAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkIHx8ICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDb25zdGFudHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUHJvZmlsZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByb2ZpbGUgPSBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZTtcbiAgJHNjb3BlLmNhbkNoYW5nZVBhc3N3b3JkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICB2YXIgcHJvZmlsZSA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwcm9maWxlJyk7XG5cbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICRzY29wZS5wcm9maWxlID0gdmFsdWU7XG4gICAgJHNjb3BlLmNhbkNoYW5nZVBhc3N3b3JkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICAgICRzY29wZS5jYW5DaGFuZ2VFbWFpbCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBTcGxhc2ggc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuZWRpdFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvZmlsZWVkaXQgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnByb2ZpbGUpO1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5lZGl0UGFzc3dvcmQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGFzc3dvcmRlZGl0ID0ge1xuICAgICAgb2xkX3Bhc3N3b3JkOiAnJyxcbiAgICAgIG5ld19wYXNzd29yZDogJydcbiAgICB9O1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmVkaXRQYXltZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQYXltZW50RWRpdCA9IHRydWU7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQcm9maWxlIGVkaXQgc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJvZmlsZUVkaXRTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnVwZGF0ZVByb2ZpbGUoJHNjb3BlLnByb2ZpbGVlZGl0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnByb2ZpbGVFZGl0Q2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUGFzc3dvcmQgZWRpdCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYXNzd29yZEVkaXRTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLmNoYW5nZVBhc3N3b3JkKCRzY29wZS5wYXNzd29yZGVkaXQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkRWRpdENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gZmFsc2U7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2JhY2tncm91bmQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0JhY2tncm91bmRDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xuXG4gIGZ1bmN0aW9uIHNob3dJbWFnZXModmFsdWVzKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaW1hZ2VzID0gdmFsdWVzLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLm1lZGlhLCAxOTIwLCAxMDgwLCAnanBnJyksXG4gICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShpdGVtLm1lZGlhKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgYmFja2dyb3VuZHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuYmFja2dyb3VuZHMsXG4gICAgICBwYWdlQmFja2dyb3VuZHMgPSBudWxsO1xuXG4gIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuYmFja2dyb3VuZHNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIHZhciBuZXdQYWdlQmFja2dyb3VuZHMgPSBTaGVsbE1hbmFnZXIuZ2V0UGFnZUJhY2tncm91bmRzKGxvY2F0aW9uKTtcblxuICAgIGlmIChuZXdQYWdlQmFja2dyb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgcGFnZUJhY2tncm91bmRzID0gbmV3UGFnZUJhY2tncm91bmRzO1xuICAgICAgc2hvd0ltYWdlcyhwYWdlQmFja2dyb3VuZHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChwYWdlQmFja2dyb3VuZHMpIHtcbiAgICAgIHN3aXRjaCAobG9jYXRpb24udHlwZSkge1xuICAgICAgICBjYXNlICdtZW51JzpcbiAgICAgICAgY2FzZSAnY2F0ZWdvcnknOlxuICAgICAgICBjYXNlICdpdGVtJzpcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFnZUJhY2tncm91bmRzID0gbnVsbDtcbiAgICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NhcnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhcnRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJHNjZScsICdDdXN0b21lck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ0NoYXRNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsICRzY2UsIEN1c3RvbWVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcbiAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcblxuICAkc2NvcGUuc3RhdGUgPSBDYXJ0TW9kZWwuY2FydFN0YXRlO1xuICBDYXJ0TW9kZWwuY2FydFN0YXRlQ2hhbmdlZC5hZGQoc3RhdGUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0YXRlID0gc3RhdGUpKTtcblxuICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSB2YWx1ZSk7XG5cbiAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gdHJ1ZTtcbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IHRydWU7XG4gICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICRzY29wZS52aXNpYmxlID0gQ2FydE1vZGVsLmlzQ2FydE9wZW47XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHNjb3BlLnNob3dDYXJ0KCk7XG4gICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNlYXRfbmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/XG4gICAgTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOlxuICAgICdUYWJsZSc7XG5cbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiAkc2NvcGUuc2VhdF9uYW1lID0gc2VhdCA/IHNlYXQubmFtZSA6ICdUYWJsZScpO1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gIH07XG4gIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG4gIH07XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hDbG9zZW91dFJlcXVlc3QpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcbiAgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCgpO1xuXG4gICRzY29wZS5jYWxjdWxhdGVEZXNjcmlwdGlvbiA9IGVudHJ5ID0+IHtcbiAgICB2YXIgcmVzdWx0ID0gZW50cnkubmFtZSB8fCBlbnRyeS5pdGVtLnRpdGxlO1xuXG4gICAgcmVzdWx0ICs9IGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKG91dHB1dCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgIHJldHVybiBvdXRwdXQgKyBjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKChvdXRwdXQsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBvdXRwdXQgKyAobW9kaWZpZXIuaXNTZWxlY3RlZCA/XG4gICAgICAgICAgJzxici8+LSAnICsgbW9kaWZpZXIuZGF0YS50aXRsZSA6XG4gICAgICAgICAgJycpO1xuICAgICAgfSwgJycpO1xuICAgIH0sICcnKTtcblxuICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHJlc3VsdCk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgJHNjb3BlLmNhbGN1bGF0ZVRvdGFsUHJpY2UgPSBlbnRyaWVzID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpO1xuXG4gICRzY29wZS5lZGl0SXRlbSA9IGVudHJ5ID0+IENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCBmYWxzZSk7XG4gICRzY29wZS5yZW1vdmVGcm9tQ2FydCA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIucmVtb3ZlRnJvbUNhcnQoZW50cnkpO1xuICAkc2NvcGUucmVvcmRlckl0ZW0gPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChlbnRyeS5jbG9uZSgpKTtcblxuICAkc2NvcGUuc3VibWl0Q2FydCA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSAkc2NvcGUub3B0aW9ucy50b19nb19vcmRlciA/IDIgOiAwO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQob3B0aW9ucykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgICAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmNsZWFyQ2FydCA9ICgpID0+IHtcbiAgICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5jbGVhckNhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDYXJ0ID0gKCkgPT4ge1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgJHNjb3BlLnNob3dDYXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLnNob3dIaXN0b3J5ID0gKCkgPT4gQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAkc2NvcGUuc2hvd0NhcnQgPSAoKSA9PiBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG5cbiAgJHNjb3BlLnBheUNoZWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGVja291dCcgfTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2F0ZWdvcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhdGVnb3J5QmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2F0ZWdvcnlDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU05BUEVudmlyb25tZW50JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNOQVBFbnZpcm9ubWVudCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbGVDbGFzc05hbWUgPSBTaGVsbE1hbmFnZXIudGlsZVN0eWxlO1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcChmdW5jdGlvbih0aWxlLCBpKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogdGlsZUNsYXNzTmFtZSxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCAzNzAsIDM3MCkgKyAnKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGkpIHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcChmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoeyBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJyB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgRGF0YU1hbmFnZXIuY2F0ZWdvcnkgPSBsb2NhdGlvbi50eXBlID09PSAnY2F0ZWdvcnknID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmNhdGVnb3J5KTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuY2F0ZWdvcnlDaGFuZ2VkLmFkZChmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGVzLFxuICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzIHx8IFtdO1xuICAgIHRpbGVzID0gZGF0YS5pdGVtcyB8fCBbXTtcbiAgICB0aWxlcyA9IGNhdGVnb3JpZXMuY29uY2F0KHRpbGVzKTtcblxuICAgIGlmIChTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gIT09ICdkZXNrdG9wJykge1xuICAgICAgdGlsZXMgPSB0aWxlcy5maWx0ZXIodGlsZSA9PiB0aWxlLnR5cGUgIT09IDMpO1xuICAgIH1cblxuICAgIHRpbGVzLmZvckVhY2godGlsZSA9PiB7XG4gICAgICB0aWxlLnVybCA9ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgodGlsZS5kZXN0aW5hdGlvbik7XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhdGVnb3J5TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudC1jYXRlZ29yeScpXG4gICAgKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0NoYXRNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnU05BUExvY2F0aW9uJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTWFuYWdlciwgQ2hhdE1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTaGVsbE1hbmFnZXIsIFNOQVBMb2NhdGlvbikgPT4ge1xuXG4gIGlmICghU05BUExvY2F0aW9uLmNoYXQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IFNOQVBMb2NhdGlvbi5sb2NhdGlvbl9uYW1lO1xuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcblxuICAkc2NvcGUuY2hhdEVuYWJsZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2hhdEVuYWJsZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5hY3RpdmVEZXZpY2VzID0gQ2hhdE1hbmFnZXIubW9kZWwuYWN0aXZlRGV2aWNlcztcbiAgQ2hhdE1hbmFnZXIubW9kZWwuYWN0aXZlRGV2aWNlc0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuYWN0aXZlRGV2aWNlcyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gIH0pO1xuXG4gICRzY29wZS5naWZ0RGV2aWNlID0gQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZUNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdERldmljZSA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnRvZ2dsZUNoYXQgPSAoKSA9PiB7XG4gICAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkID0gIUNoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgfTtcblxuICAkc2NvcGUub3Blbk1hcCA9ICgpID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXRtYXAnIH07XG4gIH07XG5cbiAgJHNjb3BlLmdldERldmljZU5hbWUgPSBkZXZpY2VfdG9rZW4gPT4gQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2VfdG9rZW4pO1xuXG4gICRzY29wZS5nZXRTZWF0TnVtYmVyID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKTtcblxuICAgIGZvciAodmFyIHAgaW4gTG9jYXRpb25Nb2RlbC5zZWF0cykge1xuICAgICAgaWYgKExvY2F0aW9uTW9kZWwuc2VhdHNbcF0udG9rZW4gPT09IGRldmljZS5zZWF0KSB7XG4gICAgICAgIGxldCBtYXRjaCA9IExvY2F0aW9uTW9kZWwuc2VhdHNbcF0ubmFtZS5tYXRjaCgvXFxkKy8pO1xuICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFswXSB8fCAnJyA6ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDaGF0ID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd291bGQgbGlrZSB0byBjbG9zZSB0aGUgY2hhdCB3aXRoICcgKyAkc2NvcGUuZ2V0RGV2aWNlTmFtZShkZXZpY2VfdG9rZW4pICsgJz8nKVxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgQ2hhdE1hbmFnZXIuZGVjbGluZURldmljZShkZXZpY2VfdG9rZW4pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5nZXRVbnJlYWRDb3VudCA9IGRldmljZV90b2tlbiA9PiBDaGF0TWFuYWdlci5nZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pO1xuXG4gICRzY29wZS5zZW5kR2lmdCA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKGRldmljZV90b2tlbiksXG4gICAgICAgIHNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoZGV2aWNlLnNlYXQpO1xuXG4gICAgaWYgKCFzZWF0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKGBBcmUgeW91IHN1cmUgdGhhdCB5b3Ugd2FudCB0byBzZW5kIGEgZ2lmdCB0byAke3NlYXQubmFtZX0/YCkudGhlbigoKSA9PiB7XG4gICAgICBDaGF0TWFuYWdlci5zdGFydEdpZnQoZGV2aWNlX3Rva2VuKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsR2lmdCA9ICgpID0+IENoYXRNYW5hZ2VyLmVuZEdpZnQoKTtcblxuICBDaGF0TWFuYWdlci5pc1ByZXNlbnQgPSB0cnVlO1xuXG4gIHZhciB3YXRjaExvY2F0aW9uID0gdHJ1ZTtcblxuICAkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsICgpID0+IHtcbiAgICBpZiAod2F0Y2hMb2NhdGlvbikge1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuaXNQcmVzZW50ID0gZmFsc2U7XG4gICAgICB3YXRjaExvY2F0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdGJveC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdEJveEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICckYXR0cnMnLCAnQ2hhdE1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRhdHRycywgQ2hhdE1hbmFnZXIsIExvY2F0aW9uTW9kZWwpIHtcbiAgdmFyIHRvX2RldmljZSA9ICRzY29wZS5kZXZpY2UsXG4gICAgICB0eXBlID0gdG9fZGV2aWNlID9cbiAgICAgICAgQ2hhdE1hbmFnZXIuTUVTU0FHRV9UWVBFUy5ERVZJQ0UgOlxuICAgICAgICBDaGF0TWFuYWdlci5NRVNTQUdFX1RZUEVTLkxPQ0FUSU9OO1xuXG4gIHZhciBkZXZpY2UgPSB0b19kZXZpY2UgPyBMb2NhdGlvbk1vZGVsLmdldERldmljZSh0b19kZXZpY2UpIDogbnVsbDtcblxuICAkc2NvcGUucmVhZG9ubHkgPSBCb29sZWFuKCRhdHRycy5yZWFkb25seSk7XG4gICRzY29wZS5jaGF0ID0ge307XG4gICRzY29wZS5tZXNzYWdlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlcygpIHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUubWVzc2FnZXMgPSBDaGF0TWFuYWdlci5tb2RlbC5oaXN0b3J5LmZpbHRlcihtZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2UudHlwZSA9PT0gdHlwZSAmJiAoXG4gICAgICAgICAgbWVzc2FnZS5kZXZpY2UgPT09IHRvX2RldmljZSB8fFxuICAgICAgICAgIG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2VcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYXRFbmFibGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNoYXRFbmFibGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuaXNDb25uZWN0ZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0Nvbm5lY3RlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNDb25uZWN0ZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmlzQ29ubmVjdGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuc2VuZE1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUuaXNDb25uZWN0ZWQgfHwgISRzY29wZS5jaGF0Lm1lc3NhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICB0b19kZXZpY2U6IHRvX2RldmljZSxcbiAgICAgIHRleHQ6ICRzY29wZS5jaGF0Lm1lc3NhZ2VcbiAgICB9O1xuXG4gICAgQ2hhdE1hbmFnZXIuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICAkc2NvcGUuY2hhdC5tZXNzYWdlID0gJyc7XG4gIH07XG5cbiAgJHNjb3BlLmdldEZyb21OYW1lID0gbWVzc2FnZSA9PiBDaGF0TWFuYWdlci5nZXRNZXNzYWdlTmFtZShtZXNzYWdlKTtcblxuICAkc2NvcGUuZ2V0U3RhdHVzVGV4dCA9IG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ1lvdSBoYXZlIHJlcXVlc3RlZCB0byBjaGF0IHdpdGggJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUobWVzc2FnZS50b19kZXZpY2UpO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRDpcbiAgICAgICAgICByZXR1cm4gJ0Nsb3NlZCB0aGUgY2hhdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdHaWZ0IHJlcXVlc3Qgc2VudCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgYSBnaWZ0JztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgc3dpdGNoKG1lc3NhZ2Uuc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5nZXRGcm9tTmFtZShtZXNzYWdlKSArICcgd291bGQgbGlrZSB0byBjaGF0IHdpdGggeW91JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQ6XG4gICAgICAgICAgcmV0dXJuICdDbG9zZWQgdGhlIGNoYXQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnV291bGQgbGlrZSB0byBzZW5kIHlvdSBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGEgZ2lmdCc7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5pc1VucmVhZCA9IG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIENoYXRNYW5hZ2VyLmNoZWNrSWZVbnJlYWQodG9fZGV2aWNlLCBtZXNzYWdlKTtcbiAgfTtcblxuICAkc2NvcGUubWFya0FzUmVhZCA9ICgpID0+IHtcbiAgICBpZiAoIXRvX2RldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENoYXRNYW5hZ2VyLm1hcmtBc1JlYWQodG9fZGV2aWNlKTtcbiAgfTtcblxuICAkc2NvcGUub25LZXlkb3duID0ga2V5Y29kZSA9PiB7XG4gICAgaWYgKGtleWNvZGUgPT09IDEzKSB7XG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnNlbmRNZXNzYWdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0c0NoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmhpc3RvcnlDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBzaG93TWVzc2FnZXMoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdG1hcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdE1hcEN0cmwnLFxuWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsXG4oJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIFNoZWxsTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwpID0+IHtcblxuICAkc2NvcGUuc2VhdHMgPSBbXTtcblxuICAkc2NvcGUubWFwSW1hZ2UgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHMubG9jYXRpb25fbWFwO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHNDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLm1hcEltYWdlID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzLmxvY2F0aW9uX21hcCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkTWFwKCkge1xuICAgIGlmICghTG9jYXRpb25Nb2RlbC5zZWF0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc2VhdHMgPSBMb2NhdGlvbk1vZGVsLnNlYXRzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oc2VhdCkgeyByZXR1cm4gc2VhdC50b2tlbiAhPT0gTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuOyB9KVxuICAgICAgICAubWFwKGZ1bmN0aW9uKHNlYXQpIHtcbiAgICAgICAgICB2YXIgZGV2aWNlcyA9IExvY2F0aW9uTW9kZWwuZGV2aWNlc1xuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkZXZpY2UpIHsgcmV0dXJuIGRldmljZS5zZWF0ID09PSBzZWF0LnRva2VuOyB9KVxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkZXZpY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2tlbjogZGV2aWNlLnRva2VuLFxuICAgICAgICAgICAgICAgIHNlYXQ6IGRldmljZS5zZWF0LFxuICAgICAgICAgICAgICAgIGlzX2F2YWlsYWJsZTogZGV2aWNlLmlzX2F2YWlsYWJsZSxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogZGV2aWNlLnVzZXJuYW1lXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b2tlbjogc2VhdC50b2tlbixcbiAgICAgICAgICAgIG5hbWU6IHNlYXQubmFtZSxcbiAgICAgICAgICAgIGRldmljZXM6IGRldmljZXMsXG4gICAgICAgICAgICBtYXBfcG9zaXRpb25feDogc2VhdC5tYXBfcG9zaXRpb25feCxcbiAgICAgICAgICAgIG1hcF9wb3NpdGlvbl95OiBzZWF0Lm1hcF9wb3NpdGlvbl95LFxuICAgICAgICAgICAgaXNfYXZhaWxhYmxlOiBkZXZpY2VzXG4gICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZGV2aWNlKSB7IHJldHVybiBkZXZpY2UuaXNfYXZhaWxhYmxlOyB9KVxuICAgICAgICAgICAgICAubGVuZ3RoID4gMFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRzQ2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIGJ1aWxkTWFwKCk7XG5cbiAgJHNjb3BlLmNob29zZVNlYXQgPSBmdW5jdGlvbihzZWF0KSB7XG4gICAgdmFyIGRldmljZSA9IHNlYXQuZGV2aWNlc1swXTtcblxuICAgIGlmICghc2VhdC5pc19hdmFpbGFibGUgfHwgIWRldmljZSkge1xuICAgICAgdmFyIGRldmljZU5hbWUgPSBkZXZpY2UgJiYgZGV2aWNlLnVzZXJuYW1lID8gZGV2aWNlLnVzZXJuYW1lIDogc2VhdC5uYW1lO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChkZXZpY2VOYW1lICsgJyBpcyB1bmF2YWlsYWJsZSBmb3IgY2hhdCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENoYXRNYW5hZ2VyLmFwcHJvdmVEZXZpY2UoZGV2aWNlLnRva2VuKTtcbiAgICAkc2NvcGUuZXhpdE1hcCgpO1xuICB9O1xuXG4gICRzY29wZS5leGl0TWFwID0gZnVuY3Rpb24oKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0cm9vbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdFJvb21DdHJsJyxcblsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQTG9jYXRpb24nLFxuKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBTTkFQTG9jYXRpb24pID0+IHtcbiAgXG4gIGlmICghU05BUExvY2F0aW9uLmNoYXQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IFNOQVBMb2NhdGlvbi5sb2NhdGlvbl9uYW1lO1xuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1N1cnZleU1hbmFnZXInLFxuICAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTdXJ2ZXlNYW5hZ2VyKSA9PiB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENvbnN0YW50c1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2sgc3BsaXQgdHlwZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLkNIRUNLX1NQTElUX05PTkUgPSAwO1xuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfQllfSVRFTVMgPSAxO1xuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfRVZFTkxZID0gMjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBheW1lbnQgbWV0aG9kXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FSRCA9IDE7XG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVNIID0gMjtcbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX1BBWVBBTCA9IDM7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZWNlaXB0IG1ldGhvZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX05PTkUgPSAwO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUwgPSAxO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TID0gMjtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1BSSU5UID0gMztcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrb3V0IHN0ZXBcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5TVEVQX0NIRUNLX1NQTElUID0gMDtcbiAgJHNjb3BlLlNURVBfUEFZTUVOVF9NRVRIT0QgPSAxO1xuICAkc2NvcGUuU1RFUF9USVBQSU5HID0gMjtcbiAgJHNjb3BlLlNURVBfU0lHTkFUVVJFID0gMztcbiAgJHNjb3BlLlNURVBfUkVDRUlQVCA9IDQ7XG4gICRzY29wZS5TVEVQX0NPTVBMRVRFID0gNTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5vcHRpb25zID0ge307XG4gICRzY29wZS5kYXRhID0gW3tcbiAgICBpdGVtczogT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tcbiAgfV07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVja1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9DaGVja3MgZGF0YVxuICB2YXIgZGF0YSA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdkYXRhJyk7XG4gIGRhdGFcbiAgLmNoYW5nZXMoKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlLnZhbHVlKSB7XG4gICAgICB2YXIgZGF0YSA9IHZhbHVlLnZhbHVlKCk7XG4gICAgICAkc2NvcGUub3B0aW9ucy5jb3VudCA9IGRhdGEubGVuZ3RoO1xuICAgIH1cblxuICAgICRzY29wZS5vcHRpb25zLmluZGV4ID0gMDtcbiAgfSk7XG5cbiAgLy9NYXhpbXVtIG51bWJlciBvZiBndWVzdHNcbiAgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnRfbWF4ID0gTWF0aC5tYXgoXG4gICAgU2Vzc2lvbk1hbmFnZXIuZ3Vlc3RDb3VudCxcbiAgICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjay5yZWR1Y2UoKGksIGl0ZW0pID0+IGkgKyBpdGVtLnF1YW50aXR5LCAwKVxuICApO1xuXG4gIC8vTnVtYmVyIG9mIGd1ZXN0c1xuICAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCA9IFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQ7XG5cbiAgLy9DaGVjayBzcGxpdCBtb2RlXG4gICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkU7XG5cbiAgLy9DaGVjayBpbmRleFxuICAkc2NvcGUub3B0aW9ucy5pbmRleCA9IDA7XG4gIHZhciBpbmRleCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLmluZGV4Jyk7XG4gIEJhY29uLmNvbWJpbmVBc0FycmF5KGluZGV4LCBkYXRhKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50ID0gJHNjb3BlLmRhdGFbJHNjb3BlLm9wdGlvbnMuaW5kZXhdO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lID0gJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSB8fCBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5waG9uZTtcbiAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWwgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHMgP1xuICAgICAgICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5lbWFpbCA6XG4gICAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWw7XG4gICAgfVxuXG4gICAgaWYgKCRzY29wZS5jdXJyZW50Lml0ZW1zKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5zdWJ0b3RhbCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICAgICRzY29wZS5jdXJyZW50LnRheCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUYXgoJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgIH1cblxuICAgIGlmICghJHNjb3BlLmN1cnJlbnQudGlwKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC50aXAgPSAwO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBOYXZpZ2F0aW9uXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL0N1cnJlbnQgc3RlcFxuICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnRfbWF4ID4gMSA/XG4gICAgJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQgOlxuICAgICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gICAgLnNraXBEdXBsaWNhdGVzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlLnZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0ZXAgPSB2YWx1ZS52YWx1ZSgpO1xuXG4gICAgICBpZiAoc3RlcCA9PT0gJHNjb3BlLlNURVBfQ09NUExFVEUpIHtcbiAgICAgICAgc3RhcnROZXh0Q2hlY2soKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE1pc2NcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vU2VhdCBuYW1lXG4gICRzY29wZS5vcHRpb25zLnNlYXQgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4ge1xuICAgICRzY29wZS5vcHRpb25zLnNlYXQgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vUHJvY2VlZCB3aXRoIHRoZSBuZXh0IGNoZWNrXG4gIGZ1bmN0aW9uIHN0YXJ0TmV4dENoZWNrKCkge1xuICAgIHZhciBjaGVjayA9ICRzY29wZS5jdXJyZW50O1xuXG4gICAgaWYgKCRzY29wZS5vcHRpb25zLmluZGV4ID09PSAkc2NvcGUub3B0aW9ucy5jb3VudCAtIDEpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5jbGVhckNoZWNrKCk7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHtcbiAgICAgICAgdHlwZTogU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgPyAnc3VydmV5JyA6ICdob21lJ1xuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmluZGV4Kys7XG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcblxuICAvL0NhbGN1bGF0ZSBhIGNhcnQgaXRlbSB0aXRsZVxuICAkc2NvcGUuY2FsY3VsYXRlVGl0bGUgPSBlbnRyeSA9PiBlbnRyeS5uYW1lIHx8IGVudHJ5Lml0ZW0udGl0bGU7XG5cbiAgLy9DYWxjdWxhdGUgYSBjYXJ0IGl0ZW0gcHJpY2VcbiAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcblxuICAvL0NhbGN1bGF0ZSBjYXJ0IGl0ZW1zIHByaWNlXG4gICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAvL091dHB1dCBhIGZvcm1hdHRlZCBwcmljZSBzdHJpbmdcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlIHx8IDApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzaWduaW4nIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmluaXRpYWxpemVkID0gdHJ1ZTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRtZXRob2QuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0TWV0aG9kQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTW9kZWwnLCAnQ2FyZFJlYWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdMb2dnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNb2RlbCwgQ2FyZFJlYWRlciwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2dnZXIpID0+IHtcblxuICBDYXJkUmVhZGVyLm9uUmVjZWl2ZWQuYWRkKGRhdGEgPT4ge1xuICAgIExvZ2dlci5kZWJ1ZyhgQ2FyZCByZWFkZXIgcmVzdWx0OiAke0pTT04uc3RyaW5naWZ5KGRhdGEpfWApO1xuICAgIHZhciBjYXJkID0ge1xuICAgICAgbnVtYmVyOiBkYXRhLmNhcmRfbnVtYmVyLFxuICAgICAgbW9udGg6IGRhdGEuZXhwaXJhdGlvbl9tb250aCxcbiAgICAgIHllYXI6IGRhdGEuZXhwaXJhdGlvbl95ZWFyLFxuICAgICAgZGF0YTogZGF0YS5kYXRhXG4gICAgfTtcblxuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICAgIGNhcmREYXRhUmVjZWl2ZWQoY2FyZCk7XG4gIH0pO1xuXG4gIENhcmRSZWFkZXIub25FcnJvci5hZGQoZSA9PiB7XG4gICAgTG9nZ2VyLmRlYnVnKGBDYXJkIHJlYWRlciBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0NBUkRSRUFERVJfRVJST1IpO1xuICB9KTtcblxuICAkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsICgpID0+IHtcbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgfSk7XG5cbiAgLy9HZW5lcmF0ZSBhIHBheW1lbnQgdG9rZW5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVQYXltZW50VG9rZW4oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5nZW5lcmF0ZVBheW1lbnRUb2tlbigpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgUGF5bWVudCB0b2tlbiBnZW5lcmF0aW9uIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG5cbiAgLy9DYWxsZWQgd2hlbiBhIGNhcmQgZGF0YSBpcyByZWNlaXZlZFxuICBmdW5jdGlvbiBjYXJkRGF0YVJlY2VpdmVkKGNhcmQpIHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBPcmRlck1hbmFnZXIuY2xlYXJDaGVjaygkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgICAkc2NvcGUuY3VycmVudC5jYXJkX2RhdGEgPSBjYXJkLmRhdGE7XG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfU0lHTkFUVVJFO1xuICAgIH0pO1xuICB9XG5cbiAgLy9DaG9vc2UgdG8gcGF5IHdpdGggYSBjcmVkaXQgY2FyZFxuICAkc2NvcGUucGF5Q2FyZCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9ICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVJEO1xuICAgIENhcmRSZWFkZXIuc3RhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUucGF5Q2FyZENhbmNlbCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9IHVuZGVmaW5lZDtcbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byBwYXkgd2l0aCBjYXNoXG4gICRzY29wZS5wYXlDYXNoID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBU0g7XG5cbiAgICBpZiAoT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCAhPSBudWxsKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgUmVxdWVzdCBjbG9zZW91dCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICBnZW5lcmF0ZVBheW1lbnRUb2tlbigpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHJlY2VpcHQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0UmVjZWlwdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsIFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgLy9DaG9vc2UgdG8gaGF2ZSBubyByZWNlaXB0XG4gICRzY29wZS5yZWNlaXB0Tm9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX05PTkU7XG4gICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSByZWNlaXB0IGJ5IGUtbWFpbFxuICAkc2NvcGUucmVjZWlwdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUw7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcmVjZWlwdCBieSBzbXNcbiAgJHNjb3BlLnJlY2VpcHRTbXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUztcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSBwcmludGVkIHJlY2VpcHRcbiAgJHNjb3BlLnJlY2VpcHRQcmludCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1BSSU5UO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVxdWVzdFJlY2VpcHQoKSB7XG4gICAgdmFyIGl0ZW0gPSAkc2NvcGUuY3VycmVudDtcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgY2hlY2tvdXRfdG9rZW46IGl0ZW0uY2hlY2tvdXRfdG9rZW4sXG4gICAgICByZWNlaXB0X21ldGhvZDogaXRlbS5yZWNlaXB0X21ldGhvZFxuICAgIH07XG5cbiAgICBpZiAoaXRlbS5yZWNlaXB0X21ldGhvZCA9PT0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMKSB7XG4gICAgICByZXF1ZXN0LnJlY2VpcHRfZW1haWwgPSBpdGVtLnJlY2VpcHRfZW1haWw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ucmVjZWlwdF9tZXRob2QgPT09ICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVMpIHtcbiAgICAgIHJlcXVlc3QucmVjZWlwdF9waG9uZSA9IGl0ZW0ucmVjZWlwdF9waG9uZTtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RSZWNlaXB0KHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0c2lnbmF0dXJlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFNpZ25hdHVyZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdMb2dnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2dnZXIpID0+IHtcblxuICAvL0NsZWFyIHRoZSBjdXJyZW50IHNpZ25hdHVyZVxuICB2YXIgcmVzZXRTaWduYXR1cmUgPSAoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuc2lnbmF0dXJlX3Rva2VuID0gdW5kZWZpbmVkO1xuXG4gICAgICB2YXIgc2lnbmF0dXJlID0gJCgnI2NoZWNrb3V0LXNpZ25hdHVyZS1pbnB1dCcpO1xuICAgICAgc2lnbmF0dXJlLmVtcHR5KCk7XG4gICAgICBzaWduYXR1cmUualNpZ25hdHVyZSgnaW5pdCcsIHtcbiAgICAgICAgJ2NvbG9yJyA6ICcjMDAwJyxcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZicsXG4gICAgICAgICdkZWNvci1jb2xvcic6ICcjZmZmJyxcbiAgICAgICAgJ3dpZHRoJzogJzEwMCUnLFxuICAgICAgICAnaGVpZ2h0JzogJzIwMHB4J1xuICAgICAgfSk7XG4gICAgfSwgMzAwKTtcbiAgfTtcblxuICAvL1N1Ym1pdCB0aGUgY3VycmVudCBzaWduYXR1cmUgaW5wdXRcbiAgJHNjb3BlLnNpZ25hdHVyZVN1Ym1pdCA9ICgpID0+IHtcbiAgICB2YXIgc2lnbmF0dXJlID0gJCgnI2NoZWNrb3V0LXNpZ25hdHVyZS1pbnB1dCcpO1xuXG4gICAgaWYgKHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdnZXREYXRhJywgJ25hdGl2ZScpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgdmFyIHNpZyA9IHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdnZXREYXRhJywgJ2ltYWdlJyk7XG5cbiAgICBPcmRlck1hbmFnZXIudXBsb2FkU2lnbmF0dXJlKHNpZ1sxXSkudGhlbih0b2tlbiA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQuc2lnbmF0dXJlX3Rva2VuID0gdG9rZW47XG4gICAgICAgIGNvbXBsZXRlQ2hlY2tvdXQoKTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBTaWduYXR1cmUgdXBsb2FkIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vQ2FuY2VsIHRoZSBjdXJyZW50IHNpZ25hdHVyZSBpbnB1dFxuICAkc2NvcGUuc2lnbmF0dXJlQ2FuY2VsID0gKCkgPT4ge1xuICAgIHJlc2V0U2lnbmF0dXJlKCk7XG4gIH07XG5cbiAgLy9Db21wbGV0ZSB0aGUgY2hlY2tvdXRcbiAgZnVuY3Rpb24gY29tcGxldGVDaGVja291dCgpIHtcbiAgICB2YXIgaXRlbSA9ICRzY29wZS5jdXJyZW50O1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGFtb3VudF9zdWJ0b3RhbDogaXRlbS5zdWJ0b3RhbCxcbiAgICAgIGFtb3VudF90YXg6IGl0ZW0udGF4LFxuICAgICAgYW1vdW50X3RpcDogaXRlbS50aXAsXG4gICAgICBjYXJkX2RhdGE6IGl0ZW0uY2FyZF9kYXRhLFxuICAgICAgc2lnbmF0dXJlX3Rva2VuOiBpdGVtLnNpZ25hdHVyZV90b2tlbixcbiAgICAgIG9yZGVyX3Rva2VuczogaXRlbS5pdGVtcyAhPSBudWxsID9cbiAgICAgICAgaXRlbS5pdGVtcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpdGVtKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW0ucXVhbnRpdHk7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtLnJlcXVlc3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0sIFtdKVxuICAgICAgICA6IG51bGxcbiAgICB9O1xuXG4gICAgT3JkZXJNYW5hZ2VyLnBheU9yZGVyKHJlcXVlc3QpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG5cbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQuY2hlY2tvdXRfdG9rZW4gPSByZXN1bHQudG9rZW47XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9SRUNFSVBUO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYE9yZGVyIHBheW1lbnQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAuc2tpcER1cGxpY2F0ZXMoKVxuICAuc3Vic2NyaWJlKHZhbHVlID0+IHtcbiAgICBpZiAoIXZhbHVlLnZhbHVlIHx8IHZhbHVlLnZhbHVlKCkgIT09ICRzY29wZS5TVEVQX1NJR05BVFVSRSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc2V0U2lnbmF0dXJlKCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHNwbGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFNwbGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ09yZGVyTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBPcmRlck1hbmFnZXIpID0+IHtcblxuICAvL1NwbGl0IHRoZSBjdXJyZW50IG9yZGVyIGluIHRoZSBzZWxlY3RlZCB3YXlcbiAgJHNjb3BlLnNwbGl0Q2hlY2sgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyIGksIGRhdGEgPSBbXTtcblxuICAgIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORSkge1xuICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgaXRlbXM6IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrXG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9FVkVOTFkpIHtcbiAgICAgIHZhciBjaGVjayA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLFxuICAgICAgICAgIHN1YnRvdGFsID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoY2hlY2spLFxuICAgICAgICAgIHRheCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUYXgoY2hlY2spO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQ7IGkrKykge1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgIHN1YnRvdGFsOiBNYXRoLnJvdW5kKChzdWJ0b3RhbCAvICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50KSAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgdGF4OiBNYXRoLnJvdW5kKCh0YXggLyAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCkgKiAxMDApIC8gMTAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX0JZX0lURU1TKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQ7IGkrKykge1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2suc2xpY2UoMCkubWFwKGl0ZW0gPT4gaXRlbS5jbG9uZSgpKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuJHBhcmVudC5kYXRhID0gZGF0YTtcbiAgICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9IHR5cGU7XG4gIH07XG5cbiAgLy9Nb3ZlIGFuIGl0ZW0gdG8gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLmFkZFRvQ2hlY2sgPSBmdW5jdGlvbihlbnRyeSkge1xuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9ICRzY29wZS5zcGxpdF9pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCAhPT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ucXVhbnRpdHkgPiAxKSB7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHktLTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gIT0gbnVsbDsgfSk7XG5cbiAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9ICRzY29wZS5jdXJyZW50Lml0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ID09PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIGV4aXN0cyA9IHRydWU7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHkrKztcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG5cbiAgICBpZiAoIWV4aXN0cykge1xuICAgICAgdmFyIGNsb25lID0gZW50cnkuY2xvbmUoKTtcbiAgICAgIGNsb25lLnF1YW50aXR5ID0gMTtcblxuICAgICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMucHVzaChjbG9uZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vUmVtb3ZlIGFuIGl0ZW0gZnJvbSB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUucmVtb3ZlRnJvbUNoZWNrID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9ICRzY29wZS5jdXJyZW50Lml0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ICE9PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5xdWFudGl0eSA+IDEpIHtcbiAgICAgICAgaXRlbS5xdWFudGl0eS0tO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbSAhPSBudWxsOyB9KTtcblxuICAgIHZhciBleGlzdHMgPSBmYWxzZTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9ICRzY29wZS5zcGxpdF9pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCA9PT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICBleGlzdHMgPSB0cnVlO1xuICAgICAgICBpdGVtLnF1YW50aXR5Kys7XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHZhciBjbG9uZSA9IGVudHJ5LmNsb25lKCk7XG4gICAgICBjbG9uZS5xdWFudGl0eSA9IDE7XG5cbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcy5wdXNoKGNsb25lKTtcbiAgICB9XG4gIH07XG5cbiAgLy9Nb3ZlIGFsbCBhdmFpbGFibGUgaXRlbXMgdG8gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLmFkZEFsbFRvQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaCgkc2NvcGUuYWRkVG9DaGVjayk7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKG5ld2l0ZW0pIHtcbiAgICAgICAgaWYgKG5ld2l0ZW0ucmVxdWVzdCA9PT0gaXRlbS5yZXF1ZXN0KSB7XG4gICAgICAgICAgbmV3aXRlbS5xdWFudGl0eSArPSBpdGVtLnF1YW50aXR5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9IFtdO1xuICB9O1xuXG4gIC8vUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5yZW1vdmVBbGxGcm9tQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKCRzY29wZS5yZW1vdmVGcm9tQ2hlY2spO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaChmdW5jdGlvbihuZXdpdGVtKSB7XG4gICAgICAgIGlmIChuZXdpdGVtLnJlcXVlc3QgPT09IGl0ZW0ucmVxdWVzdCkge1xuICAgICAgICAgIG5ld2l0ZW0ucXVhbnRpdHkgKz0gaXRlbS5xdWFudGl0eTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9IFtdO1xuICB9O1xuXG4gIC8vUHJvY2VlZCB3aXRoIHRoZSBuZXh0IGNoZWNrIHNwbGl0dGluZ1xuICAkc2NvcGUuc3BsaXROZXh0Q2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm9wdGlvbnMuaW5kZXggPCAkc2NvcGUub3B0aW9ucy5jb3VudCAtIDEgJiYgJHNjb3BlLnNwbGl0X2l0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmluZGV4Kys7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCRzY29wZS5zcGxpdF9pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAkc2NvcGUuYWRkQWxsVG9DaGVjaygpO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLiRwYXJlbnQuZGF0YSA9ICRzY29wZS4kcGFyZW50LmRhdGEuZmlsdGVyKGZ1bmN0aW9uKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBjaGVjay5pdGVtcy5sZW5ndGggPiAwO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gIC5za2lwRHVwbGljYXRlcygpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlLnZhbHVlIHx8IHZhbHVlLnZhbHVlKCkgIT09ICRzY29wZS5TVEVQX0NIRUNLX1NQTElUKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9ICRzY29wZS5DSEVDS19TUExJVF9OT05FO1xuICAgIH0pO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXR0aXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0VGlwQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ09yZGVyTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIE9yZGVyTWFuYWdlcikge1xuXG4gIC8vQWRkIGEgdGlwXG4gICRzY29wZS5hZGRUaXAgPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAkc2NvcGUuY3VycmVudC50aXAgPSBNYXRoLnJvdW5kKCgkc2NvcGUuY3VycmVudC5zdWJ0b3RhbCAqIGFtb3VudCkgKiAxMDApIC8gMTAwO1xuICB9O1xuXG4gIC8vQXBwbHkgdGhlIHNlbGVjdGVkIHRpcCBhbW91bnQgYW5kIHByb2NlZWQgZnVydGhlclxuICAkc2NvcGUuYXBwbHlUaXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfUEFZTUVOVF9NRVRIT0Q7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2Jvb3QuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRCb290JyxcbiAgWydBdXRoZW50aWNhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25NYW5hZ2VyJyxcbiAgKEF1dGhlbnRpY2F0aW9uTWFuYWdlciwgTG9jYXRpb25NYW5hZ2VyKSA9PiB7XG5cbiAgZnVuY3Rpb24gbG9hZExvY2F0aW9uKCkge1xuICAgIHJldHVybiBMb2NhdGlvbk1hbmFnZXIubG9hZENvbmZpZygpXG4gICAgICAudGhlbigoKSA9PiBMb2NhdGlvbk1hbmFnZXIubG9hZFNlYXRzKCkpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBBdXRoZW50aWNhdGlvbk1hbmFnZXIudmFsaWRhdGUoKS50aGVuKGF1dGhvcml6ZWQgPT4ge1xuICAgICAgaWYgKGF1dGhvcml6ZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBBdXRoZW50aWNhdGlvbk1hbmFnZXIuYXV0aG9yaXplKCkudGhlbigoKSA9PiBsb2FkTG9jYXRpb24oKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsb2FkTG9jYXRpb24oKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvY3VzdG9tZXJndWVzdGxvZ2luLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kQ3VzdG9tZXJHdWVzdExvZ2luJyxcbiAgWydBdXRoZW50aWNhdGlvbk1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJyxcbiAgKEF1dGhlbnRpY2F0aW9uTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBDdXN0b21lck1hbmFnZXIuZ3Vlc3RMb2dpbigpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9jdXN0b21lcmxvZ2luLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kQ3VzdG9tZXJMb2dpbicsXG4gIFsnQXV0aGVudGljYXRpb25NYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsXG4gIChBdXRoZW50aWNhdGlvbk1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgIHJldHVybiBBdXRoZW50aWNhdGlvbk1hbmFnZXIuY3VzdG9tZXJMb2dpblJlZ3VsYXIoY3JlZGVudGlhbHMpLnRoZW4oKCkgPT4ge1xuICAgICAgcmV0dXJuIEN1c3RvbWVyTWFuYWdlci5sb2dpbihjcmVkZW50aWFscyk7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2N1c3RvbWVyc2lnbnVwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kQ3VzdG9tZXJTaWdudXAnLFxuICBbJ0F1dGhlbnRpY2F0aW9uTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLFxuICAoQXV0aGVudGljYXRpb25NYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIpID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24ocmVnaXN0cmF0aW9uKSB7XG4gICAgcmV0dXJuIEN1c3RvbWVyTWFuYWdlci5zaWduVXAocmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBjcmVkZW50aWFscyA9IHtcbiAgICAgICAgbG9naW46IHJlZ2lzdHJhdGlvbi51c2VybmFtZSxcbiAgICAgICAgcGFzc3dvcmQ6IHJlZ2lzdHJhdGlvbi5wYXNzd29yZFxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIEF1dGhlbnRpY2F0aW9uTWFuYWdlci5jdXN0b21lckxvZ2luUmVndWxhcihjcmVkZW50aWFscykudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBDdXN0b21lck1hbmFnZXIubG9naW4oY3JlZGVudGlhbHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2N1c3RvbWVyc29jaWFsbG9naW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luJyxcbiAgWydBdXRoZW50aWNhdGlvbk1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NvY2lhbE1hbmFnZXInLFxuICAoQXV0aGVudGljYXRpb25NYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIFNvY2lhbE1hbmFnZXIpID0+IHtcblxuICBmdW5jdGlvbiBkb0xvZ2luKGF1dGgpIHtcbiAgICByZXR1cm4gQXV0aGVudGljYXRpb25NYW5hZ2VyLmN1c3RvbWVyTG9naW5Tb2NpYWwoYXV0aCkudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luU29jaWFsKGF1dGgpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBmYWNlYm9vazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gU29jaWFsTWFuYWdlci5sb2dpbkZhY2Vib29rKCkudGhlbihkb0xvZ2luKTtcbiAgICB9LFxuICAgIGdvb2dsZXBsdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFNvY2lhbE1hbmFnZXIubG9naW5Hb29nbGVQbHVzKCkudGhlbihkb0xvZ2luKTtcbiAgICB9LFxuICAgIHR3aXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFNvY2lhbE1hbmFnZXIubG9naW5Ud2l0dGVyKCkudGhlbihkb0xvZ2luKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2ZsaXBzY3JlZW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRGbGlwU2NyZWVuJywgWydNYW5hZ2VtZW50U2VydmljZScsIGZ1bmN0aW9uKE1hbmFnZW1lbnRTZXJ2aWNlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5yb3RhdGVTY3JlZW4oKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvcmVzZXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRSZXNldCcsIFsnQW5hbHl0aWNzTWFuYWdlcicsICdDaGF0TWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1N1cnZleU1hbmFnZXInLCAnTWFuYWdlbWVudFNlcnZpY2UnLCAnTG9nZ2VyJywgZnVuY3Rpb24oQW5hbHl0aWNzTWFuYWdlciwgQ2hhdE1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU3VydmV5TWFuYWdlciwgTWFuYWdlbWVudFNlcnZpY2UsIExvZ2dlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gZmFpbChlKSB7XG4gICAgICBMb2dnZXIud2FybignVW5hYmxlIHRvIHJlc2V0IHByb3Blcmx5OiAnICsgZS5tZXNzYWdlKTtcbiAgICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgU2Vzc2lvbk1hbmFnZXIuZW5kU2Vzc2lvbigpO1xuXG4gICAgQW5hbHl0aWNzTWFuYWdlci5zdWJtaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgT3JkZXJNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgU3VydmV5TWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBDaGF0TWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJlc2V0KCk7XG4gICAgICAgICAgICB9LCBmYWlsKTtcbiAgICAgICAgICB9LCBmYWlsKTtcbiAgICAgICAgfSwgZmFpbCk7XG4gICAgICB9LCBmYWlsKTtcbiAgICB9LCBmYWlsKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvc3RhcnR1cC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFN0YXJ0dXAnLFxuICBbJ0xvZ2dlcicsICdBcHBDYWNoZScsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1N1cnZleU1hbmFnZXInLCAnU05BUExvY2F0aW9uJyxcbiAgKExvZ2dlciwgQXBwQ2FjaGUsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTdXJ2ZXlNYW5hZ2VyLCBTTkFQTG9jYXRpb24pID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXN1bHQsIHJlamVjdCkgPT4ge1xuXG4gICAgICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICAgICAgTG9nZ2VyLndhcm4oYFVuYWJsZSB0byBzdGFydHVwIHByb3Blcmx5OiAke2UubWVzc2FnZX1gKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FjaGVDb21wbGV0ZSh1cGRhdGVkKSB7XG4gICAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBEYXRhTWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKEFwcENhY2hlLmlzVXBkYXRlZCkge1xuICAgICAgICBjYWNoZUNvbXBsZXRlKHRydWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0KCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChBcHBDYWNoZS5pc0NvbXBsZXRlKSB7XG4gICAgICAgIGNhY2hlQ29tcGxldGUoZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICBBcHBDYWNoZS5jb21wbGV0ZS5hZGQoY2FjaGVDb21wbGV0ZSk7XG5cbiAgICAgIFNoZWxsTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICAgIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnc2lnbmluJyB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmd1ZXN0TG9naW4oKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdCgpOyAgICBcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvc3VibWl0b3JkZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gIFsnRGlhbG9nTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ09yZGVyTWFuYWdlcicsXG4gIChEaWFsb2dNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1hbmFnZXIpID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghTG9jYXRpb25Nb2RlbC5zZWF0IHx8ICFMb2NhdGlvbk1vZGVsLnNlYXQudG9rZW4pIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfRVJST1JfTk9fU0VBVCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IDA7XG5cbiAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9kaWFsb2cuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0RpYWxvZ0N0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnRGlhbG9nTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICB2YXIgYWxlcnRTdGFjayA9IFtdLFxuICAgICAgY29uZmlybVN0YWNrID0gW107XG4gIHZhciBhbGVydEluZGV4ID0gLTEsXG4gICAgICBjb25maXJtSW5kZXggPSAtMTtcbiAgdmFyIGFsZXJ0VGltZXI7XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc0J1c3ksIHNob3dBbGVydCwgc2hvd0NvbmZpcm0pIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pc0J1c3kgPSBpc0J1c3kgIT09IHVuZGVmaW5lZCA/IGlzQnVzeSA6ICRzY29wZS5pc0J1c3k7XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gc2hvd0FsZXJ0ICE9PSB1bmRlZmluZWQgPyBzaG93QWxlcnQgOiAkc2NvcGUuc2hvd0FsZXJ0O1xuICAgICAgJHNjb3BlLnNob3dDb25maXJtID0gc2hvd0NvbmZpcm0gIT09IHVuZGVmaW5lZCA/IHNob3dDb25maXJtIDogJHNjb3BlLnNob3dDb25maXJtO1xuICAgICAgJHNjb3BlLnZpc2libGUgPSAkc2NvcGUuaXNCdXN5IHx8ICRzY29wZS5zaG93QWxlcnQgfHwgJHNjb3BlLnNob3dDb25maXJtO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd05leHRBbGVydCgpIHtcbiAgICBpZiAoYWxlcnRUaW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKGFsZXJ0VGltZXIpO1xuICAgIH1cblxuICAgIHZhciBhbGVydCA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF07XG5cbiAgICBpZiAoYWxlcnQgJiYgYWxlcnQucmVzb2x2ZSkge1xuICAgICAgYWxlcnQucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGFsZXJ0SW5kZXgrKztcblxuICAgIGlmIChhbGVydEluZGV4ID09PSBhbGVydFN0YWNrLmxlbmd0aCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIGFsZXJ0U3RhY2sgPSBbXTtcbiAgICAgIGFsZXJ0SW5kZXggPSAtMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5hbGVydFRpdGxlID0gYWxlcnRTdGFja1thbGVydEluZGV4XS50aXRsZTtcbiAgICAgICRzY29wZS5hbGVydFRleHQgPSBhbGVydFN0YWNrW2FsZXJ0SW5kZXhdLm1lc3NhZ2U7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBhbGVydFRpbWVyID0gJHRpbWVvdXQoc2hvd05leHRBbGVydCwgMTAwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd05leHRDb25maXJtKCkge1xuICAgIGNvbmZpcm1JbmRleCsrO1xuXG4gICAgaWYgKGNvbmZpcm1JbmRleCA9PT0gY29uZmlybVN0YWNrLmxlbmd0aCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgY29uZmlybVN0YWNrID0gW107XG4gICAgICBjb25maXJtSW5kZXggPSAtMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5jb25maXJtVGV4dCA9IGNvbmZpcm1TdGFja1tjb25maXJtSW5kZXhdLm1lc3NhZ2U7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgICAgICBjYXNlIEFMRVJUX0dFTkVSSUNfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPb3BzISBNeSBiaXRzIGFyZSBmaWRkbGVkLiBPdXIgcmVxdWVzdCBzeXN0ZW0gaGFzIGJlZW4gZGlzY29ubmVjdGVkLiBQbGVhc2Ugbm90aWZ5IGEgc2VydmVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9vcHMhIE15IGJpdHMgYXJlIGZpZGRsZWQuIE91ciByZXF1ZXN0IHN5c3RlbSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuIFBsZWFzZSBub3RpZnkgYSBzZXJ2ZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQ2FsbCBTZXJ2ZXIgcmVxdWVzdCB3YXMgc2VudCBzdWNjZXNzZnVsbHkuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgcmVxdWVzdCBmb3Igc2VydmVyIGFzc2lzdGFuY2UgaGFzIGJlZW4gc2VlbiwgYW5kIGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJSZXF1ZXN0IGNoZWNrIHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5LlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciBjaGVjayByZXF1ZXN0IGhhcyBiZWVuIHNlZW4sIGFuZCBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT3JkZXIgc2VudCEgWW91IHdpbGwgYmUgbm90aWZpZWQgd2hlbiB5b3VyIHdhaXRlciBhY2NlcHRzIHRoZSBvcmRlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgb3JkZXIgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9TSUdOSU5fUkVRVUlSRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3UgbXVzdCBiZSBsb2dnZWQgaW50byBTTkFQIHRvIGFjY2VzcyB0aGlzIHBhZ2UuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0U6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gY2FsbCB0aGUgd2FpdGVyP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9DTE9TRU9VVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXF1ZXN0IHlvdXIgY2hlY2s/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX1JFU0VUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0P1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9ERUxFVF9DQVJEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSB0aGlzIHBheW1lbnQgbWV0aG9kP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9QQVNTV09SRF9SRVNFVF9DT01QTEVURTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkEgbGluayB0byBjaGFuZ2UgeW91ciBwYXNzd29yZCBoYXMgYmVlbiBlbWFpbGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9TT0ZUV0FSRV9PVVREQVRFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkEgc29mdHdhcmUgdXBkYXRlIGlzIGF2YWlsYWJsZS4gUGxlYXNlIHJlc3RhcnQgdGhlIGFwcGxpY2F0aW9uLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9DQVJEUkVBREVSX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiVW5hYmxlIHRvIHJlYWQgdGhlIGNhcmQgZGF0YS4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfRVJST1JfTk9fU0VBVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkRldmljZSBpcyBub3QgYXNzaWduZWQgdG8gYW55IHRhYmxlLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9FUlJPUl9TVEFSVFVQOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiVW5hYmxlIHRvIHN0YXJ0IHRoZSBhcHBsaWNhdGlvbi5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLmlzQnVzeSA9IGZhbHNlO1xuICAkc2NvcGUuc2hvd0FsZXJ0ID0gZmFsc2U7XG4gICRzY29wZS5zaG93Q29uZmlybSA9IGZhbHNlO1xuXG4gICRzY29wZS5jbG9zZUFsZXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgc2hvd05leHRBbGVydCgpO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNvbmZpcm0gPSBjb25maXJtZWQgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICB2YXIgY29uZmlybSA9IGNvbmZpcm1TdGFja1tjb25maXJtSW5kZXhdO1xuXG4gICAgaWYgKGNvbmZpcm0pIHtcbiAgICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgICAgaWYgKGNvbmZpcm0ucmVzb2x2ZSkge1xuICAgICAgICAgIGNvbmZpcm0ucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKGNvbmZpcm0ucmVqZWN0KSB7XG4gICAgICAgICAgY29uZmlybS5yZWplY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNob3dOZXh0Q29uZmlybSgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFsZXJ0UmVxdWVzdGVkKG1lc3NhZ2UsIHRpdGxlLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICBtZXNzYWdlID0gZ2V0TWVzc2FnZShtZXNzYWdlKTtcblxuICAgIGFsZXJ0U3RhY2sucHVzaCh7IHRpdGxlOiB0aXRsZSwgbWVzc2FnZTogbWVzc2FnZSwgcmVzb2x2ZTogcmVzb2x2ZSwgcmVqZWN0OiByZWplY3QgfSk7XG5cbiAgICBpZiAoISRzY29wZS5zaG93QWxlcnQpIHtcbiAgICAgICR0aW1lb3V0KHNob3dOZXh0QWxlcnQpO1xuICAgIH1cbiAgfVxuXG4gIERpYWxvZ01hbmFnZXIuYWxlcnRSZXF1ZXN0ZWQuYWRkKGFsZXJ0UmVxdWVzdGVkKTtcblxuICBmdW5jdGlvbiBjb25maXJtUmVxdWVzdGVkKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgY29uZmlybVN0YWNrLnB1c2goeyBtZXNzYWdlOiBtZXNzYWdlLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dDb25maXJtKSB7XG4gICAgICAkdGltZW91dChzaG93TmV4dENvbmZpcm0pO1xuICAgIH1cbiAgfVxuXG4gIERpYWxvZ01hbmFnZXIuY29uZmlybVJlcXVlc3RlZC5hZGQoY29uZmlybVJlcXVlc3RlZCk7XG5cbiAgZnVuY3Rpb24gam9iU3RhcnRlZCgpIHtcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVWaXNpYmlsaXR5KHRydWUpO1xuICB9XG5cbiAgRGlhbG9nTWFuYWdlci5qb2JTdGFydGVkLmFkZChqb2JTdGFydGVkKTtcbiAgRGlhbG9nTWFuYWdlci5qb2JFbmRlZC5hZGQoZnVuY3Rpb24oKSB7XG4gICAgdXBkYXRlVmlzaWJpbGl0eShmYWxzZSk7XG4gIH0pO1xuXG4gIGlmIChEaWFsb2dNYW5hZ2VyLmpvYnMgPiAwKSB7XG4gICAgam9iU3RhcnRlZCgpO1xuICB9XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2FkdmVydGlzZW1lbnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzQWR2ZXJ0aXNlbWVudEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQW5hbHl0aWNzTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdTaGVsbE1hbmFnZXInLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBBbmFseXRpY3NNb2RlbCwgaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS52aXNpYmxlKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gZGF0YS5tYWluXG4gICAgICAgIC5tYXAoYWQgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgICAgICAgIHRva2VuOiBhZC50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2NhcnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNDYXJ0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRzY2UnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdDaGF0TWFuYWdlcicsXG4gICAgKCRzY29wZSwgJHRpbWVvdXQsICRzY2UsIEN1c3RvbWVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgICAgICRzY29wZS5TVEFURV9DQVJUID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgICAkc2NvcGUuU1RBVEVfSElTVE9SWSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuXG4gICAgICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAgICAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcbiAgICAgICRzY29wZS5vcHRpb25zID0ge307XG5cbiAgICAgICRzY29wZS5jdXJyZW5jeSA9IFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeTtcbiAgICAgIFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeUNoYW5nZWQuYWRkKGN1cnJlbmN5ID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXJyZW5jeSA9IGN1cnJlbmN5KSk7XG5cbiAgICAgICRzY29wZS5zdGF0ZSA9IENhcnRNb2RlbC5jYXJ0U3RhdGU7XG4gICAgICBDYXJ0TW9kZWwuY2FydFN0YXRlQ2hhbmdlZC5hZGQoc3RhdGUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0YXRlID0gc3RhdGUpKTtcblxuICAgICAgJHNjb3BlLmVkaXRhYmxlSXRlbSA9IENhcnRNb2RlbC5lZGl0YWJsZUl0ZW07XG4gICAgICBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtQ2hhbmdlZC5hZGQoaXRlbSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWRpdGFibGVJdGVtID0gaXRlbSkpO1xuXG4gICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gdmFsdWUpO1xuXG4gICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcblxuICAgICAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgICAgIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gICAgICAkc2NvcGUudmlzaWJsZSA9IENhcnRNb2RlbC5pc0NhcnRPcGVuO1xuXG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID9cbiAgICAgICAgTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOlxuICAgICAgICAnVGFibGUnO1xuXG4gICAgICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+ICRzY29wZS5zZWF0X25hbWUgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJyk7XG5cbiAgICAgIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcbiAgICAgIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJzID0gZW50cnkgPT4ge1xuICAgICAgICBpZiAoIWVudHJ5Lm1vZGlmaWVycykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgbGV0IG1vZGlmaWVycyA9IGNhdGVnb3J5Lm1vZGlmaWVycy5maWx0ZXIobW9kaWZpZXIgPT4gbW9kaWZpZXIuaXNTZWxlY3RlZCk7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChtb2RpZmllcnMpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICAgICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgICAgICRzY29wZS5lZGl0SXRlbSA9IGVudHJ5ID0+IENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCBmYWxzZSk7XG5cbiAgICAgICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIGlmIChjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIG0gPT4gbS5pc1NlbGVjdGVkID0gKG0gPT09IG1vZGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KGVudHJ5KTtcbiAgICAgICRzY29wZS5yZW9yZGVySXRlbSA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5LmNsb25lKCkpO1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2FydCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9ICRzY29wZS5vcHRpb25zLnRvR28gPyAyIDogMDtcblxuICAgICAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgICAgICAgICRzY29wZS5vcHRpb25zLnRvR28gPSBmYWxzZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsZWFyQ2FydCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMudG9HbyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmNsZWFyQ2FydCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsb3NlRWRpdG9yID0gKCkgPT4ge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jbG9zZUNhcnQgPSAoKSA9PiB7XG4gICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgICAgIENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dIaXN0b3J5ID0gKCkgPT4gQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICAgICAkc2NvcGUuc2hvd0NhcnQgPSAoKSA9PiBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcblxuICAgICAgJHNjb3BlLnBheUNoZWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGVja291dCcgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9jYXRlZ29yeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNDYXRlZ29yeUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgdmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5jYXRlZ29yeUNoYW5nZWQuYWRkKGNhdGVnb3J5ID0+IHtcbiAgICBpZiAoIWNhdGVnb3J5KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhdGVnb3J5ID0gbnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1zID0gY2F0ZWdvcnkuaXRlbXMgfHwgW10sXG4gICAgICAgIGNhdGVnb3JpZXMgPSBjYXRlZ29yeS5jYXRlZ29yaWVzIHx8IFtdO1xuXG4gICAgdmFyIHRpbGVzID0gY2F0ZWdvcmllcy5jb25jYXQoaXRlbXMpLm1hcChpdGVtID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICBpbWFnZTogaXRlbS5pbWFnZSxcbiAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGl0ZW0uZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogaXRlbS5kZXN0aW5hdGlvblxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcnlMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWNhdGVnb3J5LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIGlmIChsb2NhdGlvbi50eXBlID09PSAnaXRlbScpIHtcbiAgICAgICRzY29wZS5zaG93TW9kYWwgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5zaG93TW9kYWwgPSBmYWxzZTtcblxuICAgIERhdGFNYW5hZ2VyLmNhdGVnb3J5ID0gbG9jYXRpb24udHlwZSA9PT0gJ2NhdGVnb3J5JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5jYXRlZ29yeSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2hvbWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnU05BUExvY2F0aW9uJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBTTkFQTG9jYXRpb24pID0+IHtcblxuICB2YXIgSG9tZU1lbnUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCByb3dzID0gW10sXG4gICAgICAgICAgaG9tZSA9IHRoaXMucHJvcHMuaG9tZTtcblxuICAgICAgaWYgKEJvb2xlYW4oaG9tZS5pbnRybykpIHtcbiAgICAgICAgcm93cy5wdXNoKFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLWluZm8nLFxuICAgICAgICAgIGtleTogJ2ludHJvJ1xuICAgICAgICB9LCBSZWFjdC5ET00uZGl2KHt9LCBbXG4gICAgICAgICAgICBSZWFjdC5ET00uaDEoeyBrZXk6ICdpbnRyby10aXRsZScgfSxcbiAgICAgICAgICAgICAgaG9tZS5pbnRyby50aXRsZSB8fCBgV2VsY29tZSB0byAke1NOQVBMb2NhdGlvbi5sb2NhdGlvbl9uYW1lfWBcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7IGtleTogJ2ludHJvLXRleHQnIH0sXG4gICAgICAgICAgICAgIGhvbWUuaW50cm8udGV4dFxuICAgICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRpbGVzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgdmFyIGJhY2tncm91bmQgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgNDcwLCA0MTApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtcmVndWxhcicsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kID8gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKScgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByb3dzID0gcm93cy5jb25jYXQodGlsZXMpXG4gICAgICAucmVkdWNlKChyZXN1bHQsIHZhbHVlKSA9PiB7XG4gICAgICAgIHJlc3VsdFswXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmhvbWVDaGFuZ2VkLmFkZChob21lID0+IHtcbiAgICBpZiAoIWhvbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBob21lLm1lbnVzXG4gICAgLm1hcChtZW51ID0+IHtcbiAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgIGltYWdlOiBtZW51LmltYWdlLFxuICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVNZW51LCB7IHRpbGVzOiB0aWxlcywgaG9tZTogaG9tZSB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWhvbWUtbWVudScpXG4gICAgKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLmhvbWUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmhvbWUpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9pdGVtLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0l0ZW1DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdXZWJCcm93c2VyJywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBXZWJCcm93c2VyLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuXG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSAkc2NvcGUuZW50cmllcyA9IG51bGw7XG4gICAgICAgICRzY29wZS50eXBlID0gMTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAwO1xuICAgICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IGl0ZW0udHlwZTtcblxuICAgIGlmICh0eXBlID09PSAyICYmIGl0ZW0ud2Vic2l0ZSkge1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKGl0ZW0ud2Vic2l0ZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzICYmIGl0ZW0uZmxhc2gpIHtcbiAgICAgIGxldCBmbGFzaFVybCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLmZsYXNoLm1lZGlhLCAwLCAwLCAnc3dmJyksXG4gICAgICAgICAgdXJsID0gJy9mbGFzaCN1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChmbGFzaFVybCkgK1xuICAgICAgICAgICAgICAgICcmd2lkdGg9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLndpZHRoKSArXG4gICAgICAgICAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLmhlaWdodCk7XG5cbiAgICAgIFdlYkJyb3dzZXIub3BlbihTaGVsbE1hbmFnZXIuZ2V0QXBwVXJsKHVybCkpO1xuICAgIH1cblxuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9IG5ldyBhcHAuQ2FydEl0ZW0oaXRlbSwgMSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS50eXBlID0gdHlwZTtcbiAgICAgICRzY29wZS5zdGVwID0gMDtcbiAgICAgICRzY29wZS5lbnRyeUluZGV4ID0gMDtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3LCBoLCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgdywgaCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gdmFsdWUgPyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpIDogMDtcblxuICAkc2NvcGUubmV4dFN0ZXAgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zdGVwID09PSAwKSB7XG4gICAgICBpZiAoJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgICAkc2NvcGUuZW50cmllcyA9ICRzY29wZS5lbnRyeS5jbG9uZU1hbnkoKTtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWyRzY29wZS5lbnRyeUluZGV4ID0gMF07XG4gICAgICAgICRzY29wZS5zdGVwID0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgICRzY29wZS5zdGVwID0gMjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoJHNjb3BlLnN0ZXAgPT09IDEpIHtcbiAgICAgIGlmICgkc2NvcGUuZW50cnlJbmRleCA9PT0gJHNjb3BlLmVudHJpZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAkc2NvcGUuZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkpKTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1srKyRzY29wZS5lbnRyeUluZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnByZXZpb3VzU3RlcCA9ICgpID0+IHtcbiAgICBpZiAoJHNjb3BlLnN0ZXAgPT09IDEgJiYgJHNjb3BlLmVudHJ5SW5kZXggPiAwKSB7XG4gICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbLS0kc2NvcGUuZW50cnlJbmRleF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCRzY29wZS5zdGVwID09PSAwKSB7XG4gICAgICAkc2NvcGUuZ29CYWNrKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJHNjb3BlLnN0ZXAtLTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IChjYXRlZ29yeSwgbW9kaWZpZXIpID0+IHtcbiAgICBpZiAoY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIG0gPT4gbS5pc1NlbGVjdGVkID0gKG0gPT09IG1vZGlmaWVyKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc3VibWl0T3JkZXIgPSAoKSA9PiB7XG4gICAgQ29tbWFuZFN1Ym1pdE9yZGVyKCk7XG4gICAgJHNjb3BlLmdvQmFjaygpO1xuICB9O1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5pdGVtID0gbG9jYXRpb24udHlwZSA9PT0gJ2l0ZW0nID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLml0ZW0pO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9pdGVtZWRpdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdHYWxheGllc0l0ZW1FZGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gICAgKCRzY29wZSwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwsIENvbW1hbmRTdWJtaXRPcmRlcikgPT4ge1xuXG4gICAgICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAgICAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcblxuICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IC0xO1xuXG4gICAgICB2YXIgcmVmcmVzaE5hdmlnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRzY29wZS5lbnRyeSAmJiAkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAgICAgJHNjb3BlLmhhc05leHRDYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgY3VycmVudEluZGV4IDwgJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggLSAxO1xuICAgICAgICAgICRzY29wZS5oYXNQcmV2aW91c0NhdGVnb3J5ID0gY3VycmVudEluZGV4ID4gMDtcbiAgICAgICAgICAkc2NvcGUuY2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF07XG4gICAgICAgICAgJHNjb3BlLmNhbkV4aXQgPSBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3O1xuICAgICAgICAgICRzY29wZS5jYW5Eb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdtZW51JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbml0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgJHNjb3BlLmVudHJ5ID0gdmFsdWU7XG4gICAgICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmVudHJ5ICE9IG51bGw7XG5cbiAgICAgICAgY3VycmVudEluZGV4ID0gMDtcblxuICAgICAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICAgICAgfTtcblxuICAgICAgaW5pdChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcblxuICAgICAgQ2FydE1vZGVsLmVkaXRhYmxlSXRlbUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGluaXQodmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5nZXRNb2RpZmllclRpdGxlID0gZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmRhdGEudGl0bGUgKyAobW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgICAgICAgJyAoKycgKyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UobW9kaWZpZXIuZGF0YS5wcmljZSkgKyAnKScgOlxuICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubGVmdEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IChjdXJyZW50SW5kZXggPiAwKSA/ICgkc2NvcGUucHJldmlvdXNDYXRlZ29yeSgpKSA6ICRzY29wZS5leGl0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubGVmdEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKGN1cnJlbnRJbmRleCA+IDApID8gJ0JhY2snIDogJ0V4aXQnO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dMZWZ0QnV0dG9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yaWdodEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy9NYWtlIHN1cmUgUGljayAxIG1vZGlmaWVyIGNhdGVnb3JpZXMgaGF2ZSBtZXQgdGhlIHNlbGVjdGlvbiBjb25kaXRpb24uXG4gICAgICAgIGlmKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIHZhciBudW1TZWxlY3RlZCA9IDA7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIGlmIChtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgbnVtU2VsZWN0ZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmKG51bVNlbGVjdGVkICE9PSAxKSB7XG4gICAgICAgICAgICAvL1RPRE86IEFkZCBtb2RhbCBwb3B1cC4gTXVzdCBtYWtlIDEgc2VsZWN0aW9uIVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQgPSAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAkc2NvcGUubmV4dENhdGVnb3J5KCkgOiAkc2NvcGUuZG9uZSgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJpZ2h0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAnTmV4dCcgOiAnRG9uZSc7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2hvd1JpZ2h0QnV0dG9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5wcmV2aW91c0NhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnJlbnRJbmRleC0tO1xuICAgICAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJyZW50SW5kZXgrKztcbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSBmdW5jdGlvbihjYXRlZ29yeSwgbW9kaWZpZXIpIHtcbiAgICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuXG4gICAgICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkICYmIGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgbS5pc1NlbGVjdGVkID0gbSA9PT0gbW9kaWZpZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdWJtaXRDaGFuZ2VzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoJHNjb3BlLmVudHJ5KTtcbiAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3KSB7XG4gICAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5leGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgfTtcbiAgICB9XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL21lbnUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzTWVudUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgdmFyIE1lbnVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDQ3MCwgNDEwKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLXJlZ3VsYXInLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZCA/ICd1cmwoXCInICsgYmFja2dyb3VuZCArICdcIiknIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCB2YWx1ZSwgaSkgPT4ge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLm1lbnVDaGFuZ2VkLmFkZChtZW51ID0+IHtcbiAgICBpZiAoIW1lbnUpIHtcbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiAkc2NvcGUubWVudSA9IG51bGwpO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IG1lbnUuY2F0ZWdvcmllc1xuICAgICAgLm1hcChjYXRlZ29yeSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnY2F0ZWdvcnknLFxuICAgICAgICAgIHRva2VuOiBjYXRlZ29yeS50b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdGl0bGU6IGNhdGVnb3J5LnRpdGxlLFxuICAgICAgICAgIGltYWdlOiBjYXRlZ29yeS5pbWFnZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLW1lbnUtY29udGVudCcpXG4gICAgKTtcblxuICAgICRzY29wZS5tZW51ID0gbWVudTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIubWVudSA9IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5tZW51KTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvbmF2aWdhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNOYXZpZ2F0aW9uQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdDdXN0b21lck1hbmFnZXInLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ2FydE1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnRGlhbG9nTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDb21tYW5kUmVzZXQnLCAnQ29tbWFuZFN1Ym1pdE9yZGVyJywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgQ3VzdG9tZXJNYW5hZ2VyLCBBbmFseXRpY3NNb2RlbCwgQ2FydE1vZGVsLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRTdWJtaXRPcmRlciwgQ29tbWFuZEZsaXBTY3JlZW4sIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS5tZW51cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsb2NhdGlvbiA9IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLFxuICAgICAgICBsaW1pdCA9IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnID8gNCA6IDM7XG5cbiAgICAkc2NvcGUubWVudXMgPSByZXNwb25zZS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAgIC5maWx0ZXIoKG1lbnUsIGkpID0+IGkgPCBsaW1pdClcbiAgICAgIC5tYXAobWVudSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlbixcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcbiAgICAgICAgICBzZWxlY3RlZDogbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudDtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudEltcHJlc3Npb24gPSBpdGVtID0+IHtcbiAgICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQgPSBpdGVtO1xuXG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgJHNjb3BlLm1lbnVPcGVuKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gZGF0YS5taXNjXG4gICAgICAgIC5tYXAoYWQgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDMwMCwgMjUwKSxcbiAgICAgICAgICAgIGhyZWY6IGFkLmhyZWYsXG4gICAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGFkLnNyYyksXG4gICAgICAgICAgICB0b2tlbjogYWQudG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlSG9tZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gIH07XG5cbiAgJHNjb3BlLm5hdmlnYXRlQmFjayA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcbiAgfTtcblxuICAkc2NvcGUucm90YXRlU2NyZWVuID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIENvbW1hbmRGbGlwU2NyZWVuKCk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DYXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gIUNhcnRNb2RlbC5pc0NhcnRPcGVuO1xuICB9O1xuXG4gICRzY29wZS5zZWF0TmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQodmFsdWUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNlYXROYW1lID0gdmFsdWUgPyB2YWx1ZS5uYW1lIDogJ1RhYmxlJykpO1xuXG4gICRzY29wZS5yZXNldFRhYmxlID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUubWVudU9wZW4gPSBmYWxzZTtcblxuICAkc2NvcGUudG9nZ2xlTWVudSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5tZW51T3BlbiA9ICEkc2NvcGUubWVudU9wZW47XG5cbiAgICBpZiAoJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ICYmICRzY29wZS5tZW51T3Blbikge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQudG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZVNldHRpbmdzID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9ICEkc2NvcGUuc2V0dGluZ3NPcGVuO1xuICB9O1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmNhcnRDb3VudCA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQubGVuZ3RoO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoY2FydCA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhcnRDb3VudCA9IGNhcnQubGVuZ3RoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG5cbiAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnRvdGFsT3JkZXIgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcblxuICAkc2NvcGUuc3VibWl0T3JkZXIgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBDb21tYW5kU3VibWl0T3JkZXIoKTtcbiAgfTtcblxuICAkc2NvcGUudmlld09yZGVyID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5wYXlCaWxsID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBkaXNwbGF5QnJpZ2h0bmVzczogMTAwLFxuICAgIHNvdW5kVm9sdW1lOiAxMDBcbiAgfTtcblxuICAkc2NvcGUuJHdhdGNoKCdzZXR0aW5ncy5zb3VuZFZvbHVtZScsICh2YWx1ZSwgb2xkKSA9PiB7XG4gICAgaWYgKHZhbHVlID09PSBvbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnNldFNvdW5kVm9sdW1lKHZhbHVlKTtcbiAgfSk7XG4gIE1hbmFnZW1lbnRTZXJ2aWNlLmdldFNvdW5kVm9sdW1lKCkudGhlbihcbiAgICByZXNwb25zZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc2V0dGluZ3Muc291bmRWb2x1bWUgPSByZXNwb25zZS52b2x1bWUpLFxuICAgIGUgPT4geyB9XG4gICk7XG5cbiAgJHNjb3BlLiR3YXRjaCgnc2V0dGluZ3MuZGlzcGxheUJyaWdodG5lc3MnLCAodmFsdWUsIG9sZCkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gb2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5zZXREaXNwbGF5QnJpZ2h0bmVzcyh2YWx1ZSk7XG4gIH0pO1xuICBNYW5hZ2VtZW50U2VydmljZS5nZXREaXNwbGF5QnJpZ2h0bmVzcygpLnRoZW4oXG4gICAgcmVzcG9uc2UgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNldHRpbmdzLmRpc3BsYXlCcmlnaHRuZXNzID0gcmVzcG9uc2UuYnJpZ2h0bmVzcyksXG4gICAgZSA9PiB7IH1cbiAgKTtcblxuICAkc2NvcGUubmF2aWdhdGUgPSBkZXN0aW5hdGlvbiA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgIT09ICdzaWduaW4nO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdlZC5hZGQobG9jYXRpb24gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknICYmIGxvY2F0aW9uLnR5cGUgIT09ICdpdGVtJykge1xuICAgICAgICAkc2NvcGUubWVudXMuZm9yRWFjaChtZW51ID0+IHtcbiAgICAgICAgICBtZW51LnNlbGVjdGVkID0gKGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUubWVudU9wZW4gPSBmYWxzZTtcbiAgICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2hvbWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0hvbWVCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdIb21lQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdTaGVsbE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU3VydmV5TWFuYWdlcicsICdTTkFQTG9jYXRpb24nLCAnU05BUEVudmlyb25tZW50JywgJ0NvbW1hbmRSZXNldCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDaGF0TWFuYWdlciwgRGF0YVByb3ZpZGVyLCBTaGVsbE1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgU3VydmV5TWFuYWdlciwgU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIENvbW1hbmRSZXNldCkgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFsgUmVhY3QuRE9NLnRkKHsga2V5OiAtMSB9KSBdO1xuXG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvbWUtbWVudS1pdGVtJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7XG4gICAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDE2MCwgMTYwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocm93cyk7XG4gICAgICByZXN1bHQucHVzaChSZWFjdC5ET00udGQoeyBrZXk6IHJlc3VsdC5sZW5ndGggfSkpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKG51bGwsIHJlc3VsdCk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBbXTtcblxuICAgIHJlc3BvbnNlLm1lbnVzXG4gICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAucmVkdWNlKCh0aWxlcywgbWVudSkgPT4ge1xuICAgICAgaWYgKG1lbnUucHJvbW9zICYmIG1lbnUucHJvbW9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWVudS5wcm9tb3NcbiAgICAgICAgLmZpbHRlcihwcm9tbyA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBwcm9tby50eXBlICE9PSAzKVxuICAgICAgICAuZm9yRWFjaChwcm9tbyA9PiB7XG4gICAgICAgICAgdGlsZXMucHVzaCh7XG4gICAgICAgICAgICB0aXRsZTogcHJvbW8udGl0bGUsXG4gICAgICAgICAgICBpbWFnZTogcHJvbW8uaW1hZ2UsXG4gICAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgocHJvbW8uZGVzdGluYXRpb24pLFxuICAgICAgICAgICAgZGVzdGluYXRpb246IHByb21vLmRlc3RpbmF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICB0aWxlcy5wdXNoKHtcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogbWVudS5pbWFnZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH0sIHRpbGVzKTtcblxuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIb21lTWVudSwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdob21lLW1lbnUtbWFpbicpXG4gICAgICApO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4geyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUucHJlbG9hZCA9IGRlc3RpbmF0aW9uID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuICB9O1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5wcmVkaWNhdGVFdmVuID0gU2hlbGxNYW5hZ2VyLnByZWRpY2F0ZUV2ZW47XG4gICRzY29wZS5wcmVkaWNhdGVPZGQgPSBTaGVsbE1hbmFnZXIucHJlZGljYXRlT2RkO1xuXG4gICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gdmFsdWUgPyB2YWx1ZS5uYW1lIDogJ1RhYmxlJztcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmN1c3RvbWVyX25hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJfbmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QpO1xuICB9O1xuICB2YXIgcmVmcmVzaFN1cnZleSA9ICgpID0+IHtcbiAgICAkc2NvcGUuc3VydmV5QXZhaWxhYmxlID0gU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSAmJiAhU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG4gIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmFkZChyZWZyZXNoU3VydmV5KTtcbiAgU3VydmV5TWFuYWdlci5tb2RlbC5zdXJ2ZXlDb21wbGV0ZWQuYWRkKHJlZnJlc2hTdXJ2ZXkpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcbiAgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCgpO1xuICByZWZyZXNoU3VydmV5KCk7XG5cbiAgJHNjb3BlLmNoYXRBdmFpbGFibGUgPSBCb29sZWFuKFNOQVBMb2NhdGlvbi5jaGF0KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9DTE9TRU9VVCkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUub3BlblN1cnZleSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5zdXJ2ZXlBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3N1cnZleScgfTtcbiAgfTtcblxuICAkc2NvcGUuc2VhdENsaWNrZWQgPSAoKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jdXN0b21lckNsaWNrZWQgPSAoKSA9PiB7XG4gICAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2FjY291bnQnIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUub3BlbkNoYXQgPSAoKSA9PiB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9pdGVtLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtQmFzZUN0cmwnLFxuICBbJyRzY29wZScsICgkc2NvcGUpID0+IHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0l0ZW1DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdEYXRhTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnU05BUEVudmlyb25tZW50JywgJ0NoYXRNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTaGVsbE1hbmFnZXIsIFNOQVBFbnZpcm9ubWVudCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICB2YXIgSXRlbUltYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7XG4gICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRoaXMucHJvcHMubWVkaWEsIDYwMCwgNjAwKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlICYmICgkc2NvcGUud2Vic2l0ZVVybCB8fCAkc2NvcGUuZmxhc2hVcmwpKSB7XG4gICAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLndlYnNpdGVVcmwgPSBudWxsO1xuICAgICRzY29wZS5mbGFzaFVybCA9IG51bGw7XG5cbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBudWxsO1xuXG4gICAgICBpZiAoJHNjb3BlLnR5cGUgPT09IDEpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0tcGhvdG8nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnR5cGUgPSAxO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdHlwZSA9IHJlc3BvbnNlLnR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gMiAmJiByZXNwb25zZS53ZWJzaXRlKSB7XG4gICAgICAkc2NvcGUud2Vic2l0ZVVybCA9IHJlc3BvbnNlLndlYnNpdGUudXJsO1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKCRzY29wZS53ZWJzaXRlVXJsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMyAmJiByZXNwb25zZS5mbGFzaCkge1xuICAgICAgdmFyIHVybCA9ICcvZmxhc2gjdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQoZ2V0TWVkaWFVcmwocmVzcG9uc2UuZmxhc2gubWVkaWEsIDAsIDAsICdzd2YnKSkgK1xuICAgICAgICAnJndpZHRoPScgKyBlbmNvZGVVUklDb21wb25lbnQocmVzcG9uc2UuZmxhc2gud2lkdGgpICtcbiAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5mbGFzaC5oZWlnaHQpO1xuICAgICAgJHNjb3BlLmZsYXNoVXJsID0gU2hlbGxNYW5hZ2VyLmdldEFwcFVybCh1cmwpO1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKCRzY29wZS5mbGFzaFVybCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICRzY29wZS5lbnRyeSA9IG5ldyBhcHAuQ2FydEl0ZW0ocmVzcG9uc2UsIDEpO1xuXG4gICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSXRlbUltYWdlLCB7IG1lZGlhOiAkc2NvcGUuZW50cnkuaXRlbS5pbWFnZSB9KSxcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0tcGhvdG8nKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAkc2NvcGUudHlwZSA9IHR5cGU7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IHZhbHVlID8gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKSA6IDA7XG5cbiAgJHNjb3BlLmFkZFRvQ2FydCA9ICgpID0+IHtcbiAgICBpZiAoQ3VzdG9tZXJNb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVudHJ5ID0gJHNjb3BlLmVudHJ5O1xuXG4gICAgaWYgKGVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIHRydWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkpO1xuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxHaWZ0ID0gKCkgPT4gQ2hhdE1hbmFnZXIuY2FuY2VsR2lmdCgpO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaXRlbWVkaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0l0ZW1FZGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJyxcbiAgKCRzY29wZSwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwpID0+IHtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuXG4gIHZhciBjdXJyZW50SW5kZXggPSAtMTtcblxuICB2YXIgcmVmcmVzaE5hdmlnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmVudHJ5ICYmICRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgY3VycmVudEluZGV4IDwgJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggLSAxO1xuICAgICAgJHNjb3BlLmhhc1ByZXZpb3VzQ2F0ZWdvcnkgPSBjdXJyZW50SW5kZXggPiAwO1xuICAgICAgJHNjb3BlLmNhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdO1xuICAgICAgJHNjb3BlLmNhbkV4aXQgPSBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3O1xuICAgICAgJHNjb3BlLmNhbkRvbmUgPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnbWVudScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICRzY29wZS5leGl0KCk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgaW5pdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgJHNjb3BlLmVudHJ5ID0gdmFsdWU7XG4gICAgJHNjb3BlLnZpc2libGUgPSAkc2NvcGUuZW50cnkgIT0gbnVsbDtcblxuICAgIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICB9O1xuXG4gIGluaXQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG5cbiAgQ2FydE1vZGVsLmVkaXRhYmxlSXRlbUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaW5pdCh2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNb2RpZmllclRpdGxlID0gZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICByZXR1cm4gbW9kaWZpZXIuZGF0YS50aXRsZSArIChtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAnICgrJyArIFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZShtb2RpZmllci5kYXRhLnByaWNlKSArICcpJyA6XG4gICAgICAnJ1xuICAgICk7XG4gIH07XG5cbiAgJHNjb3BlLmxlZnRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJlc3VsdCA9IChjdXJyZW50SW5kZXggPiAwKSA/ICgkc2NvcGUucHJldmlvdXNDYXRlZ29yeSgpKSA6ICRzY29wZS5leGl0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmxlZnRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gKGN1cnJlbnRJbmRleCA+IDApID8gJ0JhY2snIDogJ0V4aXQnO1xuICB9O1xuXG4gICRzY29wZS5yaWdodEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAvL01ha2Ugc3VyZSBQaWNrIDEgbW9kaWZpZXIgY2F0ZWdvcmllcyBoYXZlIG1ldCB0aGUgc2VsZWN0aW9uIGNvbmRpdGlvbi5cbiAgICBpZigkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0uZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIHZhciBudW1TZWxlY3RlZCA9IDA7XG4gICAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICBpZiAobS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgbnVtU2VsZWN0ZWQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmKG51bVNlbGVjdGVkICE9PSAxKSB7XG4gICAgICAgIC8vVE9ETzogQWRkIG1vZGFsIHBvcHVwLiBNdXN0IG1ha2UgMSBzZWxlY3Rpb24hXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJHNjb3BlLm5leHRDYXRlZ29yeSgpIDogJHNjb3BlLmRvbmUoKTtcbiAgfTtcblxuICAkc2NvcGUucmlnaHRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJ05leHQnIDogJ0RvbmUnO1xuICB9O1xuXG4gICRzY29wZS5wcmV2aW91c0NhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudEluZGV4LS07XG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICAkc2NvcGUubmV4dENhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudEluZGV4Kys7XG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gZnVuY3Rpb24oY2F0ZWdvcnksIG1vZGlmaWVyKSB7XG4gICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuXG4gICAgaWYgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgJiYgY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgbS5pc1NlbGVjdGVkID0gbSA9PT0gbW9kaWZpZXI7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmRvbmUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldykge1xuICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZXhpdCgpO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tYWluYXV4LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNYWluQXV4Q3RybCcsIFsnJHNjb3BlJywgJ0NvbW1hbmRTdGFydHVwJywgZnVuY3Rpb24oJHNjb3BlLCBDb21tYW5kU3RhcnR1cCkge1xuICBDb21tYW5kU3RhcnR1cCgpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tYWluc25hcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWFpblNuYXBDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQXBwQ2FjaGUnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FjdGl2aXR5TW9uaXRvcicsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTb2Z0d2FyZU1hbmFnZXInLCAnU05BUExvY2F0aW9uJywgJ0NvbW1hbmRTdGFydHVwJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFwcENhY2hlLCBDdXN0b21lck1hbmFnZXIsIEFjdGl2aXR5TW9uaXRvciwgQ2hhdE1hbmFnZXIsIFNoZWxsTWFuYWdlciwgRGF0YU1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgTmF2aWdhdGlvbk1hbmFnZXIsIFNvZnR3YXJlTWFuYWdlciwgU05BUExvY2F0aW9uLCBDb21tYW5kU3RhcnR1cCkgPT4ge1xuXG4gIENvbW1hbmRTdGFydHVwKCk7XG5cbiAgJHNjb3BlLnRvdWNoID0gKCkgPT4gQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5hZGQodG9rZW4gPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKHRva2VuKSArICcgd291bGQgbGlrZSB0byBjaGF0IHdpdGggeW91LicpLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuYXBwcm92ZURldmljZSh0b2tlbik7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgfSwgKCkgPT4gQ2hhdE1hbmFnZXIuZGVjbGluZURldmljZSh0b2tlbikpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVxdWVzdFJlY2VpdmVkLmFkZCgodG9rZW4sIGRlc2NyaXB0aW9uKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUodG9rZW4pICsgJyB3b3VsZCBsaWtlIHRvIGdpZnQgeW91IGEgJyArIGRlc2NyaXB0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLmFjY2VwdEdpZnQodG9rZW4pO1xuICAgIH0sICgpID0+IENoYXRNYW5hZ2VyLmRlY2xpbmVHaWZ0KHRva2VuKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5hZGQobWVzc2FnZSA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydCgnQ2hhdCB3aXRoICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBkZWNsaW5lZC4gJyArXG4gICAgICAnVG8gc3RvcCByZWNpZXZpbmcgY2hhdCByZXF1ZXN0cywgb3BlbiB0aGUgY2hhdCBzY3JlZW4gYW5kIHRvdWNoIHRoZSBcIkNoYXQgb24vb2ZmXCIgYnV0dG9uLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoJ1lvdXIgY2hhdCByZXF1ZXN0IHRvICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBhY2NlcHRlZC4nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGFjY2VwdGVkIHlvdXIgZ2lmdC4gVGhlIGl0ZW0gd2lsbCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgZGVjbGluZWQgeW91ciBnaWZ0LiBUaGUgaXRlbSB3aWxsIE5PVCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cblxuICAgIGlmIChOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi50eXBlID09PSAnY2hhdCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGNsb3NlZCB0aGUgY2hhdCcpO1xuICAgIH1cbiAgICBlbHNlIGlmKCFtZXNzYWdlLnN0YXR1cyAmJiBtZXNzYWdlLnRvX2RldmljZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb24oJ05ldyBtZXNzYWdlIGZyb20gJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSk7XG4gICAgfVxuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVhZHkuYWRkKCgpID0+IHtcbiAgICBDaGF0TWFuYWdlci5zZW5kR2lmdChPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0KTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRBY2NlcHRlZC5hZGQoc3RhdHVzID0+IHtcbiAgICBpZiAoIXN0YXR1cyB8fCAhQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZSkge1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG5cbiAgICAgICAgQ2hhdE1hbmFnZXIuZW5kR2lmdCgpO1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNZW51QmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpID0+IHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIE1lbnVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGlsZUNsYXNzTmFtZSA9IFNoZWxsTWFuYWdlci50aWxlU3R5bGU7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKGZ1bmN0aW9uKHRpbGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB0aWxlQ2xhc3NOYW1lLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDM3MCwgMzcwKSArICcpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaSkge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7IGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBEYXRhTWFuYWdlci5tZW51ID0gbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLm1lbnUpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQoZnVuY3Rpb24obWVudSkge1xuICAgIGlmICghbWVudSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lbnUuY2F0ZWdvcmllcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS51cmwgPSAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHRpbGUuZGVzdGluYXRpb24pO1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogbWVudS5jYXRlZ29yaWVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQtbWVudScpXG4gICAgKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21vZGFsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNb2RhbEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICAgIERpYWxvZ01hbmFnZXIubW9kYWxTdGFydGVkLmFkZCgoKSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUudmlzaWJsZSA9IHRydWUpKTtcbiAgICBEaWFsb2dNYW5hZ2VyLm1vZGFsRW5kZWQuYWRkKCgpID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS52aXNpYmxlID0gZmFsc2UpKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbmF2aWdhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLm5hdmlnYXRlQmFjayA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIENvbW1hbmRGbGlwU2NyZWVuKCk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DYXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gIUNhcnRNb2RlbC5pc0NhcnRPcGVuO1xuICB9O1xuXG4gICRzY29wZS5vcGVuU2V0dGluZ3MgPSAoKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5tZW51T3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVNZW51ID0gKCkgPT4ge1xuICAgICRzY29wZS5tZW51T3BlbiA9ICEkc2NvcGUubWVudU9wZW47XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICEkc2NvcGUud2lkZSkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50c0FsbCA9IFtdO1xuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AgPSBbXTtcbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQm90dG9tID0gW107XG4gIHZhciBtYXBBZHZlcnRpc2VtZW50ID0gYWQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgIHRva2VuOiBhZC50b2tlblxuICAgIH07XG4gIH07XG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcCA9IHJlc3BvbnNlLnRvcC5tYXAobWFwQWR2ZXJ0aXNlbWVudCk7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20gPSByZXNwb25zZS5ib3R0b20ubWFwKG1hcEFkdmVydGlzZW1lbnQpO1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQWxsID0gJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wLmNvbmNhdCgkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20pO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuY2FydENvdW50ID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGg7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZChjYXJ0ID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2FydENvdW50ID0gY2FydC5sZW5ndGgpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCk7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuXG4gICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZSA9IGRlc3RpbmF0aW9uID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgIC8vbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ub3RpZmljYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ05vdGlmaWNhdGlvbkN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlcikge1xuICB2YXIgdGltZXI7XG5cbiAgJHNjb3BlLm1lc3NhZ2VzID0gW107XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc1Zpc2libGUpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gaXNWaXNpYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU5leHQoKSB7XG4gICAgdmFyIG1lc3NhZ2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8ICRzY29wZS5tZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWVzc2FnZXMucHVzaCgkc2NvcGUubWVzc2FnZXNbaV0pO1xuICAgIH1cblxuICAgICRzY29wZS5tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuXG4gICAgaWYgKCRzY29wZS5tZXNzYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRpbWVyID0gJHRpbWVvdXQoaGlkZU5leHQsIDQwMDApO1xuICB9XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvblJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2VzLnB1c2goeyB0ZXh0OiBtZXNzYWdlIH0pO1xuICAgIH0pO1xuXG4gICAgdXBkYXRlVmlzaWJpbGl0eSh0cnVlKTtcblxuICAgIGlmICh0aW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9XG5cbiAgICB0aW1lciA9ICR0aW1lb3V0KGhpZGVOZXh0LCA0MDAwKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3NjcmVlbnNhdmVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTY3JlZW5zYXZlckN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLCAnQWN0aXZpdHlNb25pdG9yJywgJ0RhdGFQcm92aWRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBTaGVsbE1hbmFnZXIsIEFjdGl2aXR5TW9uaXRvciwgRGF0YVByb3ZpZGVyKSA9PiB7XG4gICAgXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gc2hvd0ltYWdlcyh2YWx1ZXMpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pbWFnZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0ubWVkaWEsIDE5MjAsIDEwODAsICdqcGcnKSxcbiAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGl0ZW0ubWVkaWEpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNob3dJbWFnZXMoU2hlbGxNYW5hZ2VyLm1vZGVsLnNjcmVlbnNhdmVycyk7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5zY3JlZW5zYXZlcnNDaGFuZ2VkLmFkZChzaG93SW1hZ2VzKTtcblxuICBBY3Rpdml0eU1vbml0b3IuYWN0aXZlQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gdmFsdWUgPT09IGZhbHNlICYmICgkc2NvcGUuaW1hZ2VzICYmICRzY29wZS5pbWFnZXMubGVuZ3RoID4gMCk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zaWduaW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1NpZ25JbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDb21tYW5kQ3VzdG9tZXJMb2dpbicsICdDb21tYW5kQ3VzdG9tZXJHdWVzdExvZ2luJywgJ0NvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luJywgJ0NvbW1hbmRDdXN0b21lclNpZ251cCcsICdDdXN0b21lck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTTkFQTG9jYXRpb24nLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDb21tYW5kQ3VzdG9tZXJMb2dpbiwgQ29tbWFuZEN1c3RvbWVyR3Vlc3RMb2dpbiwgQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4sIENvbW1hbmRDdXN0b21lclNpZ251cCwgQ3VzdG9tZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2Vzc2lvbk1hbmFnZXIsIFNOQVBMb2NhdGlvbiwgV2ViQnJvd3NlcikgPT4ge1xuXG4gIHZhciBTVEVQX1NQTEFTSCA9IDEsXG4gICAgICBTVEVQX0xPR0lOID0gMixcbiAgICAgIFNURVBfUkVHSVNUUkFUSU9OID0gMyxcbiAgICAgIFNURVBfR1VFU1RTID0gNCxcbiAgICAgIFNURVBfRVZFTlQgPSA1LFxuICAgICAgU1RFUF9SRVNFVCA9IDY7XG5cbiAgJHNjb3BlLlNURVBfU1BMQVNIID0gU1RFUF9TUExBU0g7XG4gICRzY29wZS5TVEVQX0xPR0lOID0gU1RFUF9MT0dJTjtcbiAgJHNjb3BlLlNURVBfUkVHSVNUUkFUSU9OID0gU1RFUF9SRUdJU1RSQVRJT047XG4gICRzY29wZS5TVEVQX0dVRVNUUyA9IFNURVBfR1VFU1RTO1xuICAkc2NvcGUuU1RFUF9FVkVOVCA9IFNURVBfRVZFTlQ7XG4gICRzY29wZS5TVEVQX1JFU0VUID0gU1RFUF9SRVNFVDtcblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUExvY2F0aW9uLmxvY2F0aW9uX25hbWU7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBMb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmxvZ2luID0gKCkgPT4ge1xuICAgICRzY29wZS5jcmVkZW50aWFscyA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9MT0dJTjtcbiAgfTtcblxuICAkc2NvcGUuZ3Vlc3RMb2dpbiA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ29tbWFuZEN1c3RvbWVyR3Vlc3RMb2dpbigpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuZG9Mb2dpbiA9IChjcmVkZW50aWFscykgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAkc2NvcGUuY3JlZGVudGlhbHMudXNlcm5hbWUgPSAkc2NvcGUuY3JlZGVudGlhbHMuZW1haWw7XG5cbiAgICBDb21tYW5kQ3VzdG9tZXJMb2dpbigkc2NvcGUuY3JlZGVudGlhbHMpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0dFTkVSSUNfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgU29jaWFsIGxvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUubG9naW5GYWNlYm9vayA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4uZmFjZWJvb2soKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luVHdpdHRlciA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgQ29tbWFuZEN1c3RvbWVyU29jaWFsTG9naW4udHdpdHRlcigpLnRoZW4oc29jaWFsTG9naW4sIHNvY2lhbEVycm9yKTtcbiAgfTtcblxuICAkc2NvcGUubG9naW5Hb29nbGUgPSAoKSA9PiB7XG4gICAgc29jaWFsQnVzeSgpO1xuICAgIENvbW1hbmRDdXN0b21lclNvY2lhbExvZ2luLmdvb2dsZXBsdXMoKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZWdpc3RyYXRpb25cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5yZWdpc3RlciA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVnaXN0cmF0aW9uID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1JFR0lTVFJBVElPTjtcbiAgfTtcblxuICAkc2NvcGUuZG9SZWdpc3RyYXRpb24gPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlZ2lzdHJhdGlvbi51c2VybmFtZSA9ICRzY29wZS5yZWdpc3RyYXRpb24uZW1haWw7XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ29tbWFuZEN1c3RvbWVyU2lnbnVwKCRzY29wZS5yZWdpc3RyYXRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEd1ZXN0IGNvdW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuc2Vzc2lvbiA9IHtcbiAgICBndWVzdENvdW50OiAxLFxuICAgIHNwZWNpYWw6IGZhbHNlXG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdEd1ZXN0Q291bnQgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zZXNzaW9uLmd1ZXN0Q291bnQgPiAxKSB7XG4gICAgICBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50ID0gJHNjb3BlLnNlc3Npb24uZ3Vlc3RDb3VudDtcbiAgICAgICRzY29wZS5zdGVwID0gU1RFUF9FVkVOVDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmRTaWduSW4oKTtcbiAgICB9XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBFdmVudFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnN1Ym1pdFNwZWNpYWxFdmVudCA9ICh2YWx1ZSkgPT4ge1xuICAgICRzY29wZS5zZXNzaW9uLnNwZWNpYWwgPSBTZXNzaW9uTWFuYWdlci5zcGVjaWFsRXZlbnQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICBlbmRTaWduSW4oKTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlc2V0IHBhc3N3b3JkXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucmVzZXRQYXNzd29yZCA9ICgpID0+IHtcbiAgICAkc2NvcGUucGFzc3dvcmRyZXNldCA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9SRVNFVDtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRSZXNldFN1Ym1pdCA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnJlc2V0UGFzc3dvcmQoJHNjb3BlLnBhc3N3b3JkcmVzZXQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5wYXNzd29yZFJlc2V0ID0gZmFsc2U7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkUmVzZXRDYW5jZWwgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1NQTEFTSDtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZnVuY3Rpb24gc29jaWFsTG9naW4oKSB7XG4gICAgc29jaWFsQnVzeUVuZCgpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICB9XG5cbiAgZnVuY3Rpb24gc29jaWFsRXJyb3IoKSB7XG4gICAgc29jaWFsQnVzeUVuZCgpO1xuICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfR0VORVJJQ19FUlJPUik7XG4gIH1cblxuICB2YXIgc29jaWFsSm9iLCBzb2NpYWxUaW1lcjtcblxuICBmdW5jdGlvbiBzb2NpYWxCdXN5KCkge1xuICAgIHNvY2lhbEJ1c3lFbmQoKTtcblxuICAgIHNvY2lhbEpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICBzb2NpYWxUaW1lciA9ICR0aW1lb3V0KHNvY2lhbEJ1c3lFbmQsIDEyMCAqIDEwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc29jaWFsQnVzeUVuZCgpIHtcbiAgICBpZiAoc29jaWFsSm9iKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihzb2NpYWxKb2IpO1xuICAgICAgc29jaWFsSm9iID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoc29jaWFsVGltZXIpIHtcbiAgICAgICR0aW1lb3V0LmNhbmNlbChzb2NpYWxUaW1lcik7XG4gICAgICBzb2NpYWxUaW1lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW5kU2lnbkluKCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkIHx8IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICByZXR1cm4gZW5kU2lnbkluKCk7XG4gIH1cblxuICAkc2NvcGUuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAkc2NvcGUuc3RlcCA9IFNURVBfU1BMQVNIO1xuXG4gIHZhciBtb2RhbCA9IERpYWxvZ01hbmFnZXIuc3RhcnRNb2RhbCgpO1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICBEaWFsb2dNYW5hZ2VyLmVuZE1vZGFsKG1vZGFsKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3N0YXJ0dXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1N0YXJ0dXBDdHJsJyxcbiAgWyckc2NvcGUnLCAnQ29tbWFuZEJvb3QnLCAnRGlhbG9nTWFuYWdlcicsICdNYW5hZ2VtZW50U2VydmljZScsXG4gICgkc2NvcGUsIENvbW1hbmRCb290LCBEaWFsb2dNYW5hZ2VyLCBNYW5hZ2VtZW50U2VydmljZSkgPT4ge1xuXG4gIGZ1bmN0aW9uIHdvcmtmbG93KCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDb21tYW5kQm9vdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgTWFuYWdlbWVudFNlcnZpY2UubG9hZEFwcGxpY2F0aW9uKCk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9FUlJPUl9TVEFSVFVQKS50aGVuKCgpID0+IHdvcmtmbG93KCkpO1xuICAgIH0pO1xuICB9XG5cbiAgd29ya2Zsb3coKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc3VydmV5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTdXJ2ZXlDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0N1c3RvbWVyTW9kZWwnLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1hbmFnZXIsIEN1c3RvbWVyTW9kZWwsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIFN1cnZleU1hbmFnZXIpIHtcblxuICBpZiAoIVN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkIHx8ICFTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5IHx8IFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5jb21tZW50ID0gJyc7XG4gICRzY29wZS5lbWFpbCA9ICcnO1xuICAkc2NvcGUuaGFkX3Byb2JsZW1zID0gZmFsc2U7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYWdlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VzID0gW107XG4gIHZhciBwYWdlcyA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwYWdlcycpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgSW5kZXhcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlSW5kZXggPSAtMTtcbiAgdmFyIHBhZ2VJbmRleCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwYWdlSW5kZXgnKTtcbiAgcGFnZUluZGV4LmNoYW5nZXMoKVxuICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucGFnZSA9ICRzY29wZS5wYWdlSW5kZXggPiAtMSA/ICRzY29wZS5wYWdlc1skc2NvcGUucGFnZUluZGV4XSA6IHsgcXVlc3Rpb25zOiBbXSB9O1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnBhZ2UuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgaWYgKGl0ZW0udHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICQoJyNyYXRlLScgKyBpdGVtLnRva2VuKS5yYXRlaXQoe1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiA1LFxuICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgIHJlc2V0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNraW5nZmxkOiAnI3JhbmdlLScgKyBpdGVtLnRva2VuXG4gICAgICAgICAgfSkuYmluZCgncmF0ZWQnLCBmdW5jdGlvbihldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGl0ZW0uZmVlZGJhY2sgPSB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENvdW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZUNvdW50ID0gMDtcbiAgcGFnZXMuY2hhbmdlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wYWdlQ291bnQgPSAkc2NvcGUucGFnZXMubGVuZ3RoO1xuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgZ2VuZXJhdGVQYXNzd29yZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSA4LFxuICAgICAgICBjaGFyc2V0ID0gJ2FiY2RlZmdoa25wcXJzdHV2d3h5ekFCQ0RFRkdIS01OUFFSU1RVVldYWVoyMzQ1Njc4OScsXG4gICAgICAgIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gY2hhcnNldC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IGNoYXJzZXQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgc3VibWl0RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGFnZXMucmVkdWNlKChhbnN3ZXJzLCBwYWdlKSA9PiB7XG4gICAgICByZXR1cm4gcGFnZS5yZWR1Y2UoKGFuc3dlcnMsIHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KHF1ZXN0aW9uLmZlZWRiYWNrKTtcblxuICAgICAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICAgICAgYW5zd2Vycy5wdXNoKHtcbiAgICAgICAgICAgIHN1cnZleTogU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleS50b2tlbixcbiAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi50b2tlbixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFuc3dlcnM7XG4gICAgICB9LCBhbnN3ZXJzKTtcbiAgICB9LCBbXSlcbiAgICAuZm9yRWFjaChhbnN3ZXIgPT4gQW5hbHl0aWNzTW9kZWwubG9nQW5zd2VyKGFuc3dlcikpO1xuXG4gICAgaWYgKCRzY29wZS5jb21tZW50ICYmICRzY29wZS5jb21tZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0NvbW1lbnQoe1xuICAgICAgICB0eXBlOiAnZmVlZGJhY2snLFxuICAgICAgICB0ZXh0OiAkc2NvcGUuY29tbWVudFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gdHJ1ZTtcblxuICAgIGlmICgkc2NvcGUuaGFkX3Byb2JsZW1zICYmICFPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpO1xuICAgIH1cblxuICAgIGlmIChDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLmVtYWlsICYmICRzY29wZS5lbWFpbC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgdmFyIHBhc3N3b3JkID0gZ2VuZXJhdGVQYXNzd29yZCgpO1xuXG4gICAgICBDdXN0b21lck1hbmFnZXIubG9naW4oe1xuICAgICAgICBlbWFpbDogJHNjb3BlLmVtYWlsLFxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbih7XG4gICAgICAgICAgbG9naW46ICRzY29wZS5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICB9XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGFnZUluZGV4ID4gMCkge1xuICAgICAgJHNjb3BlLnBhZ2VJbmRleC0tO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUubmV4dFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnBhZ2VJbmRleCA8ICRzY29wZS5wYWdlQ291bnQgLSAxKSB7XG4gICAgICAkc2NvcGUucGFnZUluZGV4Kys7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJHNjb3BlLm5leHRTdGVwKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5uZXh0U3RlcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLnN0ZXAgPCAzKSB7XG4gICAgICAkc2NvcGUuc3RlcCsrO1xuICAgIH1cbiAgICBlbHNlIGlmICghQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0ICYmICRzY29wZS5zdGVwIDwgMikge1xuICAgICAgJHNjb3BlLnN0ZXArKztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzdWJtaXRGZWVkYmFjaygpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc3VibWl0UHJvYmxlbSA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICRzY29wZS5oYWRfcHJvYmxlbXMgPSBCb29sZWFuKHN0YXR1cyk7XG4gICAgJHNjb3BlLm5leHRTdGVwKCk7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnN0ZXAgPiAwKSB7XG4gICAgICBzdWJtaXRGZWVkYmFjaygpO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFnZTtcblxuICAgICRzY29wZS5oYXNfZW1haWwgPSBDdXN0b21lck1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuXG4gICAgZnVuY3Rpb24gYnVpbGRTdXJ2ZXkoKSB7XG4gICAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5LnF1ZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKGl0ZW0udHlwZSAhPT0gMSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFnZSB8fCBwYWdlLmxlbmd0aCA+IDQpIHtcbiAgICAgICAgICBwYWdlID0gW107XG4gICAgICAgICAgJHNjb3BlLnBhZ2VzLnB1c2gocGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtLmZlZWRiYWNrID0gMDtcbiAgICAgICAgcGFnZS5wdXNoKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKFN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkpIHtcbiAgICAgIGJ1aWxkU3VydmV5KCk7XG4gICAgfVxuXG4gICAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNoYW5nZWQuYWRkKCgpID0+IGJ1aWxkU3VydmV5KCkpO1xuXG4gICAgJHNjb3BlLnBhZ2VJbmRleCA9IDA7XG4gICAgJHNjb3BlLnN0ZXAgPSAwO1xuICB9KSgpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy91cmwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1VybEN0cmwnLFxuICBbJyRzY29wZScsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgTmF2aWdhdGlvbk1hbmFnZXIsIFdlYkJyb3dzZXIpID0+IHtcblxuICBXZWJCcm93c2VyLm9wZW4oTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24udXJsKTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy93ZWIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1dlYkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIFdlYkJyb3dzZXIpID0+IHtcblxuICBXZWJCcm93c2VyLm9uT3Blbi5hZGQoKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5lbmFibGVkID0gZmFsc2U7XG4gIH0pO1xuXG4gIFdlYkJyb3dzZXIub25DbG9zZS5hZGQoKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5lbmFibGVkID0gdHJ1ZTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvX2Jhc2UuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycsIFsnYW5ndWxhci1iYWNvbiddKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9nYWxsZXJ5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnZ2FsbGVyeScsIFtcbiAgJ0FjdGl2aXR5TW9uaXRvcicsICdTaGVsbE1hbmFnZXInLCAnJHRpbWVvdXQnLFxuICAoQWN0aXZpdHlNb25pdG9yLCBTaGVsbE1hbmFnZXIsICR0aW1lb3V0KSA9PiB7XG5cbiAgdmFyIHNsaWRlcixcbiAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICBtb2RlOiAnZmFkZScsXG4gICAgICAgIHdyYXBwZXJDbGFzczogJ3Bob3RvLWdhbGxlcnknXG4gICAgICB9O1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiBmYWxzZSxcbiAgICBzY29wZToge1xuICAgICAgaW1hZ2VzOiAnPScsXG4gICAgICBpbWFnZXdpZHRoIDogJz0/JyxcbiAgICAgIGltYWdlaGVpZ2h0OiAnPT8nXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ2dhbGxlcnknKSxcbiAgICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSA9PiB7XG4gICAgICBlbGVtLnJlYWR5KCgpID0+IHtcbiAgICAgICAgc2xpZGVyID0gJCgnLmJ4c2xpZGVyJywgZWxlbSkuYnhTbGlkZXIoc2V0dGluZ3MpO1xuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnaW1hZ2VzJywgKCkgPT4ge1xuICAgICAgICBzY29wZS5tZWRpYXMgPSAoc2NvcGUuaW1hZ2VzIHx8IFtdKS5tYXAoaW1hZ2UgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGltYWdlLCBhdHRycy5pbWFnZXdpZHRoLCBhdHRycy5pbWFnZWhlaWdodCkpO1xuICAgICAgICBzZXR0aW5ncy5wYWdlciA9IHNjb3BlLm1lZGlhcy5sZW5ndGggPiAxO1xuICAgICAgICAkdGltZW91dCgoKSA9PiBzbGlkZXIucmVsb2FkU2xpZGVyKHNldHRpbmdzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvb25pZnJhbWVsb2FkLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnb25JZnJhbWVMb2FkJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBzY29wZToge1xuICAgICAgY2FsbGJhY2s6ICcmb25JZnJhbWVMb2FkJ1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBlbGVtZW50LmJpbmQoJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKHNjb3BlLmNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHNjb3BlLmNhbGxiYWNrKHsgZXZlbnQ6IGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL29ua2V5ZG93bi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ29uS2V5ZG93bicsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XG4gICAgICB2YXIgZnVuY3Rpb25Ub0NhbGwgPSBzY29wZS4kZXZhbChhdHRycy5vbktleWRvd24pO1xuICAgICAgZWxlbS5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBmdW5jdGlvblRvQ2FsbChlLndoaWNoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3F1YW50aXR5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgncXVhbnRpdHknLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHF1YW50aXR5OiAnPScsXG4gICAgICBtaW46ICc9JyxcbiAgICAgIG1heDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHNjb3BlLm1pbiA9IHNjb3BlLm1pbiB8fCAxO1xuICAgICAgc2NvcGUubWF4ID0gc2NvcGUubWF4IHx8IDk7XG4gICAgICBzY29wZS5kYXRhID0ge1xuICAgICAgICBtaW46IHNjb3BlLm1pbixcbiAgICAgICAgbWF4OiBzY29wZS5tYXgsXG4gICAgICAgIHF1YW50aXR5OiBwYXJzZUludChzY29wZS5xdWFudGl0eSlcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmRlY3JlYXNlID0gKCkgPT4ge1xuICAgICAgICBzY29wZS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5ID4gc2NvcGUuZGF0YS5taW4gP1xuICAgICAgICAgIHNjb3BlLmRhdGEucXVhbnRpdHkgLSAxIDpcbiAgICAgICAgICBzY29wZS5kYXRhLm1pbjtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmluY3JlYXNlID0gKCkgPT4ge1xuICAgICAgICBzY29wZS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5IDwgc2NvcGUuZGF0YS5tYXggP1xuICAgICAgICAgIHNjb3BlLmRhdGEucXVhbnRpdHkgKyAxIDpcbiAgICAgICAgICBzY29wZS5kYXRhLm1heDtcbiAgICAgIH07XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ2lucHV0LXF1YW50aXR5JylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zY3JvbGxlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3Njcm9sbGVyJywgWydBY3Rpdml0eU1vbml0b3InLCAnU05BUEVudmlyb25tZW50JywgZnVuY3Rpb24gKEFjdGl2aXR5TW9uaXRvciwgU05BUEVudmlyb25tZW50KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdDJyxcbiAgICByZXBsYWNlOiBmYWxzZSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIGlmIChTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJykge1xuICAgICAgICAkKGVsZW0pLmtpbmV0aWMoe1xuICAgICAgICAgIHk6IGZhbHNlLCBzdG9wcGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3Njcm9sbGdsdWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzY3JvbGxnbHVlJywgWyckcGFyc2UnLCBmdW5jdGlvbiAoJHBhcnNlKSB7XG4gIGZ1bmN0aW9uIHVuYm91bmRTdGF0ZShpbml0VmFsdWUpe1xuICAgIHZhciBhY3RpdmF0ZWQgPSBpbml0VmFsdWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gYWN0aXZhdGVkO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIGFjdGl2YXRlZCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBvbmVXYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBzY29wZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHNjb3BlKTtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24oKXt9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHR3b1dheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNldHRlciwgc2NvcGUpe1xuICAgIHJldHVybiB7XG4gICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldHRlcihzY29wZSk7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgaWYodmFsdWUgIT09IGdldHRlcihzY29wZSkpe1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2V0dGVyKHNjb3BlLCB2YWx1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQWN0aXZhdGlvblN0YXRlKGF0dHIsIHNjb3BlKXtcbiAgICBpZihhdHRyICE9PSBcIlwiKXtcbiAgICAgIHZhciBnZXR0ZXIgPSAkcGFyc2UoYXR0cik7XG4gICAgICBpZihnZXR0ZXIuYXNzaWduICE9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gdHdvV2F5QmluZGluZ1N0YXRlKGdldHRlciwgZ2V0dGVyLmFzc2lnbiwgc2NvcGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9uZVdheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNjb3BlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuYm91bmRTdGF0ZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHByaW9yaXR5OiAxLFxuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsICRlbCwgYXR0cnMpe1xuICAgICAgdmFyIGVsID0gJGVsWzBdLFxuICAgICAgYWN0aXZhdGlvblN0YXRlID0gY3JlYXRlQWN0aXZhdGlvblN0YXRlKGF0dHJzLnNjcm9sbGdsdWUsIHNjb3BlKTtcblxuICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9Cb3R0b20oKXtcbiAgICAgICAgZWwuc2Nyb2xsVG9wID0gZWwuc2Nyb2xsSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblNjb3BlQ2hhbmdlcygpe1xuICAgICAgICBpZihhY3RpdmF0aW9uU3RhdGUuZ2V0VmFsdWUoKSAmJiAhc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCkpe1xuICAgICAgICAgIHNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCl7XG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxUb3AgKyBlbC5jbGllbnRIZWlnaHQgKyAxID49IGVsLnNjcm9sbEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25TY3JvbGwoKXtcbiAgICAgICAgYWN0aXZhdGlvblN0YXRlLnNldFZhbHVlKHNob3VsZEFjdGl2YXRlQXV0b1Njcm9sbCgpKTtcbiAgICAgIH1cblxuICAgICAgc2NvcGUuJHdhdGNoKG9uU2NvcGVDaGFuZ2VzKTtcbiAgICAgICRlbC5iaW5kKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3NsaWRlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3NsaWRlcicsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0FFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBzb3VyY2U6ICc9JyxcbiAgICAgIHNsaWRlY2xpY2s6ICc9JyxcbiAgICAgIHNsaWRlc2hvdzogJz0nLFxuICAgICAgdGltZW91dDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHZhciB0aW1lb3V0ID0gc2NvcGUudGltZW91dCB8fCA1MDAwO1xuICAgICAgc2NvcGUuc291cmNlID0gc2NvcGUuc291cmNlIHx8IFtdO1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG5cbiAgICAgIHZhciBjaGFuZ2VJbWFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2NvcGUuc291cmNlLmxlbmd0aCA9PT0gMCB8fCBzY29wZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG5cbiAgICAgICAgc2NvcGUuc291cmNlLmZvckVhY2goZnVuY3Rpb24oZW50cnksIGkpe1xuICAgICAgICAgIGVudHJ5LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVudHJ5ID0gc2NvcGUuc291cmNlW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgICAgIGVudHJ5LnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIGlmIChzY29wZS5zbGlkZXNob3cpIHtcbiAgICAgICAgICBzY29wZS5zbGlkZXNob3coZW50cnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB2YXIgdiA9ICQoJ3ZpZGVvJywgZWxlbSk7XG4gICAgICAgICAgdi5hdHRyKCdzcmMnLCBlbnRyeS5zcmMpO1xuICAgICAgICAgIHZhciB2aWRlbyA9IHYuZ2V0KDApO1xuXG4gICAgICAgICAgaWYgKCF2aWRlbykge1xuICAgICAgICAgICAgdGltZXIgPSAkdGltZW91dChzbGlkZXJGdW5jLCAzMDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBvblZpZGVvRW5kZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25WaWRlb0VuZGVkLCBmYWxzZSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgc2NvcGUubmV4dCgpOyB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIG9uVmlkZW9FcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uVmlkZW9FcnJvciwgZmFsc2UpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7IHNjb3BlLm5leHQoKTsgfSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25WaWRlb0VuZGVkLCBmYWxzZSk7XG4gICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvblZpZGVvRXJyb3IsIGZhbHNlKTtcblxuICAgICAgICAgIHRyeVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpZGVvLmxvYWQoKTtcbiAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIHBsYXkgdmlkZW86ICcgKyBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGltZXIgPSAkdGltZW91dChzbGlkZXJGdW5jLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2NvcGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPCBzY29wZS5zb3VyY2UubGVuZ3RoLTEgP1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCsrIDpcbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICBjaGFuZ2VJbWFnZSgpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUucHJldiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPiAwID9cbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgtLSA6XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuc291cmNlLmxlbmd0aCAtIDE7XG4gICAgICAgIGNoYW5nZUltYWdlKCk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdGltZXI7XG5cbiAgICAgIHZhciBzbGlkZXJGdW5jID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzY29wZS5zb3VyY2UubGVuZ3RoID09PSAwIHx8IHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUubmV4dCgpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdzb3VyY2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgc2xpZGVyRnVuYygpO1xuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnZGlzYWJsZWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgc2xpZGVyRnVuYygpO1xuICAgICAgfSk7XG5cbiAgICAgIHNsaWRlckZ1bmMoKTtcblxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ3NsaWRlcicpXG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc3dpdGNoLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc3dpdGNoJyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBkaXNhYmxlZDogJz0/JyxcbiAgICAgIHNlbGVjdGVkOiAnPT8nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHNjb3BlLmRpc2FibGVkID0gQm9vbGVhbihzY29wZS5kaXNhYmxlZCk7XG4gICAgICBzY29wZS5zZWxlY3RlZCA9IEJvb2xlYW4oc2NvcGUuc2VsZWN0ZWQpO1xuICAgICAgc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgZGlzYWJsZWQ6IEJvb2xlYW4oc2NvcGUuZGlzYWJsZWQpLFxuICAgICAgICBzZWxlY3RlZDogQm9vbGVhbihzY29wZS5zZWxlY3RlZCksXG4gICAgICAgIGNoYW5nZWQ6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICBzY29wZS50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzY29wZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLnNlbGVjdGVkID0gc2NvcGUuZGF0YS5zZWxlY3RlZCA9ICFzY29wZS5kYXRhLnNlbGVjdGVkO1xuICAgICAgICBzY29wZS5kYXRhLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnaW5wdXQtc3dpdGNoJylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJywgW10pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3BhcnRpYWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCdwYXJ0aWFsJywgWydTaGVsbE1hbmFnZXInLCAoU2hlbGxNYW5hZ2VyKSA9PiB7XG4gIHJldHVybiAobmFtZSkgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG59XSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvdGh1bWJuYWlsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigndGh1bWJuYWlsJywgWydTaGVsbE1hbmFnZXInLCBTaGVsbE1hbmFnZXIgPT4ge1xuICByZXR1cm4gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy90cnVzdHVybC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3RydXN0VXJsJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHZhbCk7XG4gICAgfTtcbn1dKTtcblxuLy9zcmMvanMvc2VydmljZXMuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuc2VydmljZXMnLCBbJ25nUmVzb3VyY2UnLCAnU05BUC5jb25maWdzJ10pXG5cbiAgLmZhY3RvcnkoJ0xvZ2dlcicsIFsnU05BUEVudmlyb25tZW50JywgKFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkxvZ2dlcihTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJyRleGNlcHRpb25IYW5kbGVyJywgWydMb2dnZXInLCAoTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIChleGNlcHRpb24sIGNhdXNlKSA9PiB7XG4gICAgICBMb2dnZXIuZmF0YWwoZXhjZXB0aW9uLnN0YWNrLCBjYXVzZSwgZXhjZXB0aW9uKTtcbiAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICB9O1xuICB9XSlcblxuICAvL1NlcnZpY2VzXG5cbiAgLmZhY3RvcnkoJ0NhcmRSZWFkZXInLCBbJ01hbmFnZW1lbnRTZXJ2aWNlJywgKE1hbmFnZW1lbnRTZXJ2aWNlKSA9PiB7XG4gICAgd2luZG93LlNuYXBDYXJkUmVhZGVyID0gbmV3IGFwcC5DYXJkUmVhZGVyKE1hbmFnZW1lbnRTZXJ2aWNlKTtcbiAgICByZXR1cm4gd2luZG93LlNuYXBDYXJkUmVhZGVyO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0R0c0FwaScsIFsnU05BUEhvc3RzJywgJ1Nlc3Npb25Nb2RlbCcsIChTTkFQSG9zdHMsIFNlc3Npb25Nb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkJhY2tlbmRBcGkoU05BUEhvc3RzLCBTZXNzaW9uTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ01hbmFnZW1lbnRTZXJ2aWNlJywgWydMb2dnZXInLCAoTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ29yZG92YU1hbmFnZW1lbnRTZXJ2aWNlKExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU29ja2V0Q2xpZW50JywgWydTZXNzaW9uTW9kZWwnLCAnU05BUEhvc3RzJywgJ0xvZ2dlcicsIChTZXNzaW9uTW9kZWwsIFNOQVBIb3N0cywgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU29ja2V0Q2xpZW50KFNlc3Npb25Nb2RlbCwgU05BUEhvc3RzLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1RlbGVtZXRyeVNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICgkcmVzb3VyY2UpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5UZWxlbWV0cnlTZXJ2aWNlKCRyZXNvdXJjZSk7XG4gIH1dKVxuICAuZmFjdG9yeSgnV2ViQnJvd3NlcicsIFsnQW5hbHl0aWNzTW9kZWwnLCAnTWFuYWdlbWVudFNlcnZpY2UnLCAnU05BUEVudmlyb25tZW50JywgJ1NOQVBIb3N0cycsIChBbmFseXRpY3NNb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKSA9PiB7XG4gICAgd2luZG93LlNuYXBXZWJCcm93c2VyID0gbmV3IGFwcC5XZWJCcm93c2VyKEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpO1xuICAgIHJldHVybiB3aW5kb3cuU25hcFdlYkJyb3dzZXI7XG4gIH1dKVxuXG4gIC8vTW9kZWxzXG5cbiAgLmZhY3RvcnkoJ0FwcENhY2hlJywgWydMb2dnZXInLCAoTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQXBwQ2FjaGUoTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdBbmFseXRpY3NNb2RlbCcsIFsnU3RvcmFnZVByb3ZpZGVyJywgJ0hlYXRNYXAnLCAoU3RvcmFnZVByb3ZpZGVyLCBIZWF0TWFwKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQW5hbHl0aWNzTW9kZWwoU3RvcmFnZVByb3ZpZGVyLCBIZWF0TWFwKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdDYXJ0TW9kZWwnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGVsKCk7XG4gIH0pXG4gIC5mYWN0b3J5KCdDaGF0TW9kZWwnLCBbJ1NOQVBMb2NhdGlvbicsICdTTkFQRW52aXJvbm1lbnQnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DaGF0TW9kZWwoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ3VzdG9tZXJNb2RlbCcsIFsnU05BUExvY2F0aW9uJywgJ1N0b3JhZ2VQcm92aWRlcicsIChTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTW9kZWwoU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0RhdGFQcm92aWRlcicsIFsnU05BUExvY2F0aW9uJywgJ0R0c0FwaScsIChTTkFQTG9jYXRpb24sIER0c0FwaSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRhdGFQcm92aWRlcihTTkFQTG9jYXRpb24sIER0c0FwaSk7XG4gIH1dKVxuICAuZmFjdG9yeSgnSGVhdE1hcCcsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5IZWF0TWFwKGRvY3VtZW50LmJvZHkpO1xuICB9KVxuICAuZmFjdG9yeSgnTG9jYXRpb25Nb2RlbCcsIFsnRHRzQXBpJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQTG9jYXRpb24nLCAnU3RvcmFnZVByb3ZpZGVyJywgKER0c0FwaSwgU05BUEVudmlyb25tZW50LCBTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkxvY2F0aW9uTW9kZWwoRHRzQXBpLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBMb2NhdGlvbiwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAoU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuT3JkZXJNb2RlbChTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NoZWxsTW9kZWwnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2hlbGxNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnU3VydmV5TW9kZWwnLCBbJ1NOQVBMb2NhdGlvbicsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUExvY2F0aW9uLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TdXJ2ZXlNb2RlbChTTkFQTG9jYXRpb24sIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvbk1vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAoU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2Vzc2lvbk1vZGVsKFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU3RvcmFnZVByb3ZpZGVyJywgKCkgPT4gIHtcbiAgICByZXR1cm4gKGlkKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IGFwcC5Db3Jkb3ZhTG9jYWxTdG9yYWdlU3RvcmUoaWQpO1xuICAgIH07XG4gIH0pXG5cbiAgLy9NYW5hZ2Vyc1xuXG4gIC5mYWN0b3J5KCdBY3Rpdml0eU1vbml0b3InLCBbJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLCAoJHJvb3RTY29wZSwgJHRpbWVvdXQpID0+IHtcbiAgICB2YXIgbW9uaXRvciA9IG5ldyBhcHAuQWN0aXZpdHlNb25pdG9yKCRyb290U2NvcGUsICR0aW1lb3V0KTtcbiAgICBtb25pdG9yLnRpbWVvdXQgPSAzMDAwMDtcbiAgICByZXR1cm4gbW9uaXRvcjtcbiAgfV0pXG4gIC5mYWN0b3J5KCdBbmFseXRpY3NNYW5hZ2VyJywgWydUZWxlbWV0cnlTZXJ2aWNlJywgJ0FuYWx5dGljc01vZGVsJywgJ0xvZ2dlcicsIChUZWxlbWV0cnlTZXJ2aWNlLCBBbmFseXRpY3NNb2RlbCwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQW5hbHl0aWNzTWFuYWdlcihUZWxlbWV0cnlTZXJ2aWNlLCBBbmFseXRpY3NNb2RlbCwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdBdXRoZW50aWNhdGlvbk1hbmFnZXInLCBbJ0R0c0FwaScsICdTZXNzaW9uTW9kZWwnLCAnU05BUEVudmlyb25tZW50JywgJ1dlYkJyb3dzZXInLCAnTG9nZ2VyJywgKER0c0FwaSwgU2Vzc2lvbk1vZGVsLCBTTkFQRW52aXJvbm1lbnQsIFdlYkJyb3dzZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkF1dGhlbnRpY2F0aW9uTWFuYWdlcihEdHNBcGksIFNlc3Npb25Nb2RlbCwgU05BUEVudmlyb25tZW50LCBXZWJCcm93c2VyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0N1c3RvbWVyTWFuYWdlcicsIFsnU05BUExvY2F0aW9uJywgJ1NOQVBFbnZpcm9ubWVudCcsICdEdHNBcGknLCAnQ3VzdG9tZXJNb2RlbCcsICdTZXNzaW9uTW9kZWwnLCAoU05BUExvY2F0aW9uLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCwgU2Vzc2lvbk1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ3VzdG9tZXJNYW5hZ2VyKFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwsIFNlc3Npb25Nb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2hhdE1hbmFnZXInLCBbJ0FuYWx5dGljc01vZGVsJywgJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU29ja2V0Q2xpZW50JywgKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNoYXRNYW5hZ2VyKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGF0YU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdMb2dnZXInLCAnU05BUEVudmlyb25tZW50JywgKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EYXRhTWFuYWdlcihEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEaWFsb2dNYW5hZ2VyJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRpYWxvZ01hbmFnZXIoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0xvY2F0aW9uTWFuYWdlcicsIFsnRGF0YVByb3ZpZGVyJywgJ0R0c0FwaScsICdMb2NhdGlvbk1vZGVsJywgJ0xvZ2dlcicsIChEYXRhUHJvdmlkZXIsIER0c0FwaSwgTG9jYXRpb25Nb2RlbCwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9jYXRpb25NYW5hZ2VyKERhdGFQcm92aWRlciwgRHRzQXBpLCBMb2NhdGlvbk1vZGVsLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ05hdmlnYXRpb25NYW5hZ2VyJywgWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckd2luZG93JywgJ0FuYWx5dGljc01vZGVsJywgKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5OYXZpZ2F0aW9uTWFuYWdlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIEFuYWx5dGljc01vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1hbmFnZXInLCBbJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0R0c0FwaScsICdPcmRlck1vZGVsJywgKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRHRzQXBpLCBPcmRlck1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuT3JkZXJNYW5hZ2VyKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRHRzQXBpLCBPcmRlck1vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTZXNzaW9uTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgJ0FuYWx5dGljc01vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdPcmRlck1vZGVsJywgJ1N1cnZleU1vZGVsJywgJ1N0b3JhZ2VQcm92aWRlcicsICdMb2dnZXInLCAoU05BUEVudmlyb25tZW50LCBBbmFseXRpY3NNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNb2RlbCwgU3VydmV5TW9kZWwsIFN0b3JhZ2VQcm92aWRlciwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2Vzc2lvbk1hbmFnZXIoU05BUEVudmlyb25tZW50LCBBbmFseXRpY3NNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNb2RlbCwgU3VydmV5TW9kZWwsIFN0b3JhZ2VQcm92aWRlciwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTaGVsbE1hbmFnZXInLCBbJyRzY2UnLCAnRGF0YVByb3ZpZGVyJywgJ1NoZWxsTW9kZWwnLCAnU05BUExvY2F0aW9uJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQSG9zdHMnLCAoJHNjZSwgRGF0YVByb3ZpZGVyLCBTaGVsbE1vZGVsLCBTTkFQTG9jYXRpb24sIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKSA9PiB7XG4gICAgbGV0IG1hbmFnZXIgPSBuZXcgYXBwLlNoZWxsTWFuYWdlcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBMb2NhdGlvbiwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpO1xuICAgIERhdGFQcm92aWRlci5fZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gbWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTsgLy9Ub0RvOiByZWZhY3RvclxuICAgIHJldHVybiBtYW5hZ2VyO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvY2lhbE1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdEdHNBcGknLCAnV2ViQnJvd3NlcicsICdMb2dnZXInLCAoU05BUEVudmlyb25tZW50LCBEdHNBcGksIFdlYkJyb3dzZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvY2lhbE1hbmFnZXIoU05BUEVudmlyb25tZW50LCBEdHNBcGksIFdlYkJyb3dzZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU29mdHdhcmVNYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAoU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU29mdHdhcmVNYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU3VydmV5TWFuYWdlcicsIFsnRGF0YVByb3ZpZGVyJywgJ1N1cnZleU1vZGVsJywgKERhdGFQcm92aWRlciwgU3VydmV5TW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TdXJ2ZXlNYW5hZ2VyKERhdGFQcm92aWRlciwgU3VydmV5TW9kZWwpO1xuICB9XSk7XG4iXX0=
