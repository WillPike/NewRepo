//src/js/shared/_base.js

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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
    ALERT_ERROR_NO_SEAT = 410;

//src/js/shared/activitymonitor.js

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

//src/js/shared/analyticsdata.js

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

//src/js/shared/analyticsmanager.js

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

//src/js/shared/analyticsmodel.js

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

//src/js/shared/appcache.js

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

//src/js/shared/backendapi.js

window.app.BackendApi = function BackendApi(Hosts, SessionProvider) {
  _classCallCheck(this, BackendApi);

  this._SessionProvider = SessionProvider;

  var self = this;

  function businessTokenProvider() {
    return self._SessionProvider.getBusinessToken();
  }

  function customerTokenProvider() {
    return self._SessionProvider.getCustomerToken();
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

//src/js/shared/cardreader.js

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

//src/js/shared/cartitem.js

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

//src/js/shared/cartmodel.js

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

//src/js/shared/cartmodifier.js

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

//src/js/shared/chatmanager.js

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

    this._SocketClient.subscribe(this.ROOMS.LOCATION + this._LocationModel.location, function (message) {
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
      return message.to_device ? this.ROOMS.DEVICE + message.to_device : this.ROOMS.LOCATION + this._LocationModel.location;
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

//src/js/shared/chatmodel.js

window.app.ChatModel = (function () {
  /* global signals */

  function ChatModel(SNAPConfig, SNAPEnvironment, storageProvider) {
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

    this._isEnabled = SNAPConfig.chat;
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

//src/js/shared/customermanager.js

window.app.CustomerManager = (function () {
  /* global moment */

  function CustomerManager(Config, Environment, DtsApi, CustomerModel) {
    _classCallCheck(this, CustomerManager);

    this._api = DtsApi;
    this._CustomerModel = CustomerModel;
    this._customerAppId = Environment.customer_application.client_id;
  }

  _createClass(CustomerManager, [{
    key: 'logout',
    value: function logout() {
      var self = this;
      return new Promise(function (resolve) {
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
    value: function login(credentials) {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._api.oauth2.getTokenWithCredentials(self._customerAppId, credentials.login, credentials.password).then(function (result) {
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

          self._CustomerModel.session = session;

          self._loadProfile().then(resolve, function (e) {
            self._CustomerModel.session = null;
            reject(e);
          });
        }, reject);
      });
    }
  }, {
    key: 'loginSocial',
    value: function loginSocial(token) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var session = {
          access_token: token.access_token
        };

        if (token.expires_in) {
          session.expires = moment().add(token.expires_in, 'seconds').unix();
        }

        self._CustomerModel.session = session;

        self._loadProfile().then(resolve, function (e) {
          self._CustomerModel.session = null;
          reject(e);
        });
      });
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

//src/js/shared/customermodel.js

window.app.CustomerModel = (function () {
  /* global signals */

  function CustomerModel(Config, storageProvider) {
    _classCallCheck(this, CustomerModel);

    var self = this;

    this._accountStore = storageProvider('snap_customer');
    this._sessionStore = storageProvider('snap_customer_accesstoken');

    this._profile = null;
    this._session = null;

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
  }, {
    key: 'session',
    get: function get() {
      return this._session;
    },
    set: function set(value) {
      this._session = value || null;

      if (!value) {
        this._sessionStore.clear();
      } else {
        this._sessionStore.write(this._session);
      }
    }
  }]);

  return CustomerModel;
})();

//src/js/shared/datamanager.js

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

//src/js/shared/dataprovider.js

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

//src/js/shared/dialogmanager.js

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
  }]);

  return DialogManager;
})();

//src/js/shared/heatmap.js

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

//src/js/shared/locationmodel.js

window.app.LocationModel = (function () {
  /* global signals */

  function LocationModel(SNAPEnvironment, storageProvider) {
    _classCallCheck(this, LocationModel);

    var self = this;

    this._location = SNAPEnvironment.location;

    this._seatStore = storageProvider('snap_seat');

    this._seat = {};
    this.seatChanged = new signals.Signal();

    this._seats = [];
    this.seatsChanged = new signals.Signal();

    this._device = SNAPEnvironment.device;

    this._devices = [];
    this.devicesChanged = new signals.Signal();

    this._seatStore.read().then(function (seat) {
      self._seat = seat;

      if (seat) {
        self.seatChanged.dispatch(self._seat);
      }
    });
  }

  _createClass(LocationModel, [{
    key: 'addDevice',
    value: function addDevice(device) {
      this._devices.push(device);
      this.devices = this._devices;
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
  }, {
    key: 'location',
    get: function get() {
      return this._location;
    }
  }, {
    key: 'seat',
    get: function get() {
      return this._seat;
    },
    set: function set(value) {
      var self = this,
          oldSeat = this._seat || {};
      this._seat = value || {};

      if (!value) {
        this._seatStore.clear().then(function () {
          self.seatChanged.dispatch(self._seat);
        }, function () {
          self._seat = oldSeat;
        });
      } else {
        this._seatStore.write(this._seat).then(function () {
          self.seatChanged.dispatch(self._seat);
        }, function () {
          self._seat = oldSeat;
        });
      }
    }
  }, {
    key: 'seats',
    get: function get() {
      return this._seats;
    },
    set: function set(value) {
      if (this._seats === value) {
        return;
      }

      this._seats = value || [];
      this.seatsChanged.dispatch(this._seats);
    }
  }, {
    key: 'device',
    get: function get() {
      return this._device;
    }
  }, {
    key: 'devices',
    get: function get() {
      return this._devices;
    },
    set: function set(value) {
      if (this._devices === value) {
        return;
      }

      this._devices = value || [];
      this.devicesChanged.dispatch(this._devices);
    }
  }]);

  return LocationModel;
})();

//src/js/shared/logger.js

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

//src/js/shared/managementservice.js

window.app.ManagementService = (function () {
  function ManagementService($resource, SNAPEnvironment) {
    _classCallCheck(this, ManagementService);

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

  _createClass(ManagementService, [{
    key: 'rotateScreen',
    value: function rotateScreen() {
      this._api.rotateScreen.query();
    }
  }, {
    key: 'openBrowser',
    value: function openBrowser(url) {
      this._api.openBrowser.query({ url: url });
    }
  }, {
    key: 'closeBrowser',
    value: function closeBrowser() {
      this._api.closeBrowser.query();
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

  return ManagementService;
})();

//src/js/shared/mediastarter.js

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

//src/js/shared/navigationmanager.js

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

//src/js/shared/ordermanager.js

window.app.OrderManager = (function () {
  function OrderManager(ChatModel, CustomerModel, DataProvider, DtsApi, LocationModel, OrderModel) {
    _classCallCheck(this, OrderManager);

    var self = this;

    this._DtsApi = DtsApi;
    this._ChatModel = ChatModel;
    this._CustomerModel = CustomerModel;
    this._DataProvider = DataProvider;
    this._LocationModel = LocationModel;
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

    this._DataProvider.seats().then(function (seats) {
      self._LocationModel.seats = seats;
      self._DtsApi.location.getCurrentSeat().then(function (seat) {
        self._LocationModel.seat = seat;
      });
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

//src/js/shared/ordermodel.js

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

//src/js/shared/requestwatcher.js

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

//src/js/shared/sessionmanager.js

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

//src/js/shared/sessionprovider.js

window.app.SessionProvider = (function () {
  /* global moment, signals */

  function SessionProvider(SessionService, storageProvider) {
    _classCallCheck(this, SessionProvider);

    this._SessionService = SessionService;
    this._BusinessSessionStore = storageProvider('snap_accesstoken');
    this._CustomerSessionStore = storageProvider('snap_customer_accesstoken');

    this.businessSessionExpired = new signals.Signal();
    this.customerSessionExpired = new signals.Signal();

    this._businessToken = null;

    var self = this;
    this._BusinessSessionStore.read().then(function (token) {
      if (token && token.access_token) {
        if (token.expires) {
          var expires = moment.unix(token.expires);

          if (expires.isAfter(moment())) {
            self._businessToken = token.access_token;
          }
        } else {
          self._businessToken = token.access_token;
        }
      }
    });
  }

  _createClass(SessionProvider, [{
    key: 'getBusinessToken',
    value: function getBusinessToken() {
      if (this._pendingPromise) {
        return this._pendingPromise;
      }

      var self = this;

      this._pendingPromise = new Promise(function (resolve, reject) {
        self._BusinessSessionStore.read().then(function (token) {
          if (token && token.access_token) {
            if (token.expires) {
              var expires = moment.unix(token.expires - 120);

              if (expires.isAfter(moment())) {
                self._pendingPromise = null;
                return resolve(token.access_token);
              }
            } else {
              self._pendingPromise = null;
              return resolve(token.access_token);
            }
          }

          self._SessionService.getSession().then(function (data) {
            self._pendingPromise = null;
            self._BusinessSessionStore.write(data);
            resolve(data.access_token);
          }, function (e) {
            self._pendingPromise = null;

            if (e.status === 401) {
              self._BusinessSessionStore.clear();
              self.businessSessionExpired.dispatch();
            }

            reject({ code: e.status });
          });
        });
      });
      return this._pendingPromise;
    }
  }, {
    key: 'getCustomerToken',
    value: function getCustomerToken() {
      var self = this;
      return new Promise(function (resolve, reject) {
        self._CustomerSessionStore.read().then(function (token) {
          if (!token || !token.access_token) {
            return resolve();
          }

          if (token.expires) {
            var expires = moment.unix(token.expires);

            if (!expires.isAfter(moment())) {
              self._CustomerSessionStore.clear();
              self.customerSessionExpired.dispatch();
              return resolve();
            }
          }

          resolve(token.access_token);
        }, reject);
      });
    }
  }, {
    key: 'businessToken',
    get: function get() {
      var token = this._businessToken;

      if (token && token.access_token && token.expires) {
        var expires = moment.unix(token.expires);

        if (expires.isBefore(moment())) {
          this._businessToken = token = null;
          this.businessSessionExpired.dispatch();
        }
      }

      return token;
    }
  }]);

  return SessionProvider;
})();

//src/js/shared/sessionservice.js

window.app.SessionService = (function () {
  function SessionService($resource) {
    _classCallCheck(this, SessionService);

    this._api = {
      'session': $resource('/oauth2/snap/session', {}, { query: { method: 'GET' } })
    };
  }

  _createClass(SessionService, [{
    key: 'getSession',
    value: function getSession() {
      return this._api.session.query().$promise;
    }
  }]);

  return SessionService;
})();

//src/js/shared/shellmanager.js

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
    key: 'getAssetUrl',
    value: function getAssetUrl(file) {
      var host = this._Hosts['static'].host ? '//' + this._Hosts['static'].host + this._Hosts['static'].path : '';

      return this.$$sce.trustAsResourceUrl(host + '/assets/' + this._Config.theme.layout + '/' + file);
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

      if (typeof media === 'string' || media instanceof String) {
        if (media.substring(0, 4) !== 'http' && media.substring(0, 2) !== '//') {
          extension = extension || 'jpg';
          return this.$$sce.trustAsResourceUrl(window.location.protocol + '//' + this._Hosts.media.host + ('/media/' + media + '_' + width + '_' + height + '.' + extension));
        }

        return media;
      }

      if (!media.token) {
        return media;
      }

      var type = this.getMediaType(media);
      var url = window.location.protocol + '//' + this._Hosts.media.host + '/media/' + media.token;

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

//src/js/shared/shellmodel.js

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

//src/js/shared/socialmanager.js

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

//src/js/shared/socketclient.js

window.app.SocketClient = (function () {
  function SocketClient(SessionProvider, Logger) {
    _classCallCheck(this, SocketClient);

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
      this._SessionProvider.getBusinessToken().then(function (token) {
        self._socket.emit('authenticate', {
          access_token: token
        }, function (err) {
          if (err) {
            self._Logger.warn('Unable to authenticate socket: ' + err.message);
            return;
          }

          self._isConnected = true;
          self.isConnectedChanged.dispatch(self.isConnected);
        });
      }, function (e) {
        self._Logger.warn('Unable to perform socket authentication: ' + e.message);
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

//src/js/shared/softwaremanager.js

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

//src/js/shared/store.js

(function () {

  //------------------------------------------------------------------------
  //
  //  Store
  //
  //------------------------------------------------------------------------

  var Store = function Store() {
    this._storage = null;
  };

  window.app.Store = Store;

  Store.prototype.clear = function () {
    this._storage = null;
    return Promise.resolve();
  };

  Store.prototype.read = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      resolve(self._storage);
    });
  };

  Store.prototype.write = function (value) {
    var self = this;
    return new Promise(function (resolve, reject) {
      self._storage = value;
      resolve();
    });
  };
})();

//src/js/shared/store.localstorage.js

(function () {

  //------------------------------------------------------------------------
  //
  //  LocalStorageStore
  //
  //------------------------------------------------------------------------

  var LocalStorageStore = function LocalStorageStore(id) {
    app.Store.call(this);
    this._id = id;
  };

  LocalStorageStore.prototype = Object.create(app.Store.prototype);

  LocalStorageStore.prototype.clear = function () {
    store.remove(this._id);
    return Promise.resolve();
  };

  LocalStorageStore.prototype.read = function () {
    return Promise.resolve(store.get(this._id));
  };

  LocalStorageStore.prototype.write = function (value) {
    store.set(this._id, value);
    return Promise.resolve();
  };

  window.app.LocalStorageStore = LocalStorageStore;
})();

//src/js/shared/surveymanager.js

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

//src/js/shared/surveymodel.js

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

//src/js/shared/telemetryservice.js

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

//src/js/shared/webbrowser.js

window.app.WebBrowser = (function () {
  /* global signals, URI */

  function WebBrowser($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
    _classCallCheck(this, WebBrowser);

    this.$$window = $window;
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
  }

  _createClass(WebBrowser, [{
    key: 'navigated',
    value: function navigated(url) {
      this.onNavigated.dispatch(url);

      var host = URI(url).hostname();

      if (this._localHosts.indexOf(host) === -1) {
        this._AnalyticsModel.logUrl(url);
      }
    }
  }, {
    key: 'open',
    value: function open(url) {
      if (this.isExternal) {
        this._ManagementService.openBrowser(url);
      }

      this.onOpen.dispatch(url);
      this._browserOpened = true;
    }
  }, {
    key: 'close',
    value: function close() {
      if (this._browserOpened) {
        if (this.isExternal) {
          this._ManagementService.closeBrowser();
        }

        this.onClose.dispatch();
        this._browserOpened = false;
      }
    }
  }, {
    key: 'getAppUrl',
    value: function getAppUrl(url) {
      var host = this.$$window.location.protocol + '//' + this.$$window.location.hostname + (this.$$window.location.port ? ':' + this.$$window.location.port : '');
      return host + url;
    }
  }, {
    key: 'isExternal',
    get: function get() {
      return this._SNAPEnvironment.platform !== 'web';
    }
  }]);

  return WebBrowser;
})();

//src/js/apps.js

(function () {
  function _staticHostRegex(SNAP_HOSTS_CONFIG) {
    return new RegExp('.*' + SNAP_HOSTS_CONFIG['static'] + '.*');
  }

  function _getPartialUrl(SNAP_CONFIG, SNAP_HOSTS_CONFIG, SNAP_ENVIRONMENT, name) {
    var host = SNAP_HOSTS_CONFIG['static'].host ? '//' + SNAP_HOSTS_CONFIG['static'].host + SNAP_HOSTS_CONFIG['static'].path : '';

    return host + '/assets/' + SNAP_CONFIG.theme.layout + '/partials/' + name + '.html';
  }

  angular.module('SNAPApplication', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', 'SNAPConfig', 'SNAPHosts', 'SNAPEnvironment', function ($locationProvider, $routeProvider, $sceDelegateProvider, SNAPConfig, SNAPHosts, SNAPEnvironment) {

    var getPartialUrl = function getPartialUrl(name) {
      return _getPartialUrl(SNAPConfig, SNAPHosts, SNAPEnvironment, name);
    },
        staticHostRegex = function staticHostRegex() {
      return _staticHostRegex(SNAPHosts);
    };

    if (SNAPHosts['static'].host) {
      $sceDelegateProvider.resourceUrlWhitelist(['self', staticHostRegex()]);
    }

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { template: ' ', controller: 'HomeBaseCtrl' });
    $routeProvider.when('/menu/:token', { template: ' ', controller: 'MenuBaseCtrl' });
    $routeProvider.when('/category/:token', { template: ' ', controller: 'CategoryBaseCtrl' });
    $routeProvider.when('/item/:token', { template: ' ', controller: 'ItemBaseCtrl' });
    $routeProvider.when('/url/:url', { template: ' ', controller: 'UrlCtrl' });
    $routeProvider.when('/checkout', { templateUrl: getPartialUrl('checkout'), controller: 'CheckoutCtrl' });
    $routeProvider.when('/signin', { templateUrl: getPartialUrl('signin'), controller: 'SignInCtrl' });
    $routeProvider.when('/account', { templateUrl: getPartialUrl('account'), controller: 'AccountCtrl' });
    $routeProvider.when('/chat', { templateUrl: getPartialUrl('chat'), controller: 'ChatCtrl' });
    $routeProvider.when('/chatmap', { templateUrl: getPartialUrl('chatmap'), controller: 'ChatMapCtrl' });
    $routeProvider.when('/survey', { templateUrl: getPartialUrl('survey'), controller: 'SurveyCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);

  angular.module('SNAPStartup', ['ngRoute', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(function () {});

  angular.module('SNAPAuxiliares', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', 'SNAPConfig', 'SNAPHosts', 'SNAPEnvironment', function ($locationProvider, $routeProvider, SNAPConfig, SNAPHosts, SNAPEnvironment) {

    var getPartialUrl = function getPartialUrl(name) {
      return _getPartialUrl(SNAPConfig, SNAPHosts, SNAPEnvironment, name);
    };

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { templateUrl: getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);
})();

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

angular.module('SNAP.controllers').controller('ChatCtrl', ['$scope', '$timeout', 'CustomerManager', 'ChatManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'ShellManager', 'SNAPConfig', function ($scope, $timeout, CustomerManager, ChatManager, DialogManager, NavigationManager, LocationModel, ShellManager, SNAPConfig) {

  if (!SNAPConfig.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPConfig.location_name;

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

angular.module('SNAP.controllers').controller('ChatRoomCtrl', ['$scope', '$timeout', 'ChatManager', 'NavigationManager', 'ShellManager', 'SNAPConfig', function ($scope, $timeout, ChatManager, NavigationManager, ShellManager, SNAPConfig) {

  if (!SNAPConfig.chat) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  $scope.locationName = SNAPConfig.location_name;

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

angular.module('SNAP.controllers').factory('CommandStartup', ['Logger', 'AppCache', 'ChatManager', 'ShellManager', 'CustomerManager', 'DataManager', 'NavigationManager', 'SurveyManager', 'SNAPConfig', function (Logger, AppCache, ChatManager, ShellManager, CustomerManager, DataManager, NavigationManager, SurveyManager, SNAPConfig) {
  return function () {
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
      return;
    } else if (AppCache.isComplete) {
      cacheComplete(false);
    }

    AppCache.complete.add(cacheComplete);

    ShellManager.initialize();

    if (CustomerManager.model.isEnabled) {
      if (!CustomerManager.model.isAuthenticated) {
        NavigationManager.location = { type: 'signin' };
        return;
      }
    } else {
      CustomerManager.guestLogin();
    }
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

  DialogManager.alertRequested.add(function (message, title, resolve, reject) {
    message = getMessage(message);

    alertStack.push({ title: title, message: message, resolve: resolve, reject: reject });

    if (!$scope.showAlert) {
      $timeout(showNextAlert);
    }
  });

  DialogManager.confirmRequested.add(function (message, resolve, reject) {
    message = getMessage(message);

    confirmStack.push({ message: message, resolve: resolve, reject: reject });

    if (!$scope.showConfirm) {
      $timeout(showNextConfirm);
    }
  });

  DialogManager.jobStarted.add(function () {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    updateVisibility(true);
  });

  DialogManager.jobEnded.add(function () {
    updateVisibility(false);
  });
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

angular.module('SNAP.controllers').controller('GalaxiesHomeCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'ShellManager', 'SNAPConfig', function ($scope, $timeout, DataManager, NavigationManager, ShellManager, SNAPConfig) {

  var HomeMenu = React.createClass({
    displayName: 'HomeMenu',

    render: function render() {
      var rows = [],
          home = this.props.home;

      if (Boolean(home.intro)) {
        rows.push(React.DOM.td({
          className: 'tile tile-info',
          key: 'intro'
        }, React.DOM.div({}, [React.DOM.h1({ key: 'intro-title' }, home.intro.title || 'Welcome to ' + SNAPConfig.location_name), React.DOM.p({ key: 'intro-text' }, home.intro.text)])));
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

      WebBrowser.open(WebBrowser.getAppUrl(url));
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

angular.module('SNAP.controllers').controller('HomeCtrl', ['$scope', '$timeout', 'ChatManager', 'DataProvider', 'ShellManager', 'CustomerManager', 'OrderManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'SurveyManager', 'SNAPConfig', 'SNAPEnvironment', 'CommandReset', function ($scope, $timeout, ChatManager, DataProvider, ShellManager, CustomerManager, OrderManager, DialogManager, NavigationManager, LocationModel, SurveyManager, SNAPConfig, SNAPEnvironment, CommandReset) {

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

  $scope.chatAvailable = Boolean(SNAPConfig.chat);

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

angular.module('SNAP.controllers').controller('ItemCtrl', ['$scope', '$timeout', 'AnalyticsModel', 'CustomerModel', 'DataManager', 'DialogManager', 'NavigationManager', 'OrderManager', 'CartModel', 'LocationModel', 'ShellManager', 'WebBrowser', 'SNAPEnvironment', 'ChatManager', function ($scope, $timeout, AnalyticsModel, CustomerModel, DataManager, DialogManager, NavigationManager, OrderManager, CartModel, LocationModel, ShellManager, WebBrowser, SNAPEnvironment, ChatManager) {

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
      $scope.flashUrl = WebBrowser.getAppUrl(url);
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

angular.module('SNAP.controllers').controller('MainSnapCtrl', ['$scope', '$timeout', 'AppCache', 'CustomerManager', 'ActivityMonitor', 'ChatManager', 'ShellManager', 'DataManager', 'DialogManager', 'OrderManager', 'LocationModel', 'NavigationManager', 'SoftwareManager', 'SNAPConfig', 'CommandStartup', function ($scope, $timeout, AppCache, CustomerManager, ActivityMonitor, ChatManager, ShellManager, DataManager, DialogManager, OrderManager, LocationModel, NavigationManager, SoftwareManager, SNAPConfig, CommandStartup) {

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

angular.module('SNAP.controllers').controller('SignInCtrl', ['$scope', '$timeout', 'CustomerManager', 'DialogManager', 'NavigationManager', 'SessionManager', 'SocialManager', 'SNAPConfig', 'WebBrowser', function ($scope, $timeout, CustomerManager, DialogManager, NavigationManager, SessionManager, SocialManager, SNAPConfig, WebBrowser) {

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

  $scope.locationName = SNAPConfig.location_name;

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

    CustomerManager.guestLogin().then(function () {
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

    CustomerManager.login(credentials || $scope.credentials).then(function () {
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
    SocialManager.loginFacebook().then(socialLogin, socialError);
  };

  $scope.loginTwitter = function () {
    socialBusy();
    SocialManager.loginTwitter().then(socialLogin, socialError);
  };

  $scope.loginGoogle = function () {
    socialBusy();
    SocialManager.loginGooglePlus().then(socialLogin, socialError);
  };

  //-----------------------------------------------
  //    Registration
  //-----------------------------------------------

  $scope.register = function () {
    $scope.registration = {};
    $scope.step = STEP_REGISTRATION;
  };

  $scope.doRegistration = function () {
    var job = DialogManager.startJob();

    $scope.registration.username = $scope.registration.email;

    CustomerManager.signUp($scope.registration).then(function () {
      $timeout(function () {
        $scope.doLogin({
          login: $scope.registration.username,
          password: $scope.registration.password
        });
      });
      DialogManager.endJob(job);
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

  function socialLogin(auth) {
    CustomerManager.loginSocial(auth).then(function () {
      socialBusyEnd();
      $timeout(function () {
        return $scope.step = STEP_GUESTS;
      });
    }, function () {
      socialBusyEnd();
      DialogManager.alert(ALERT_GENERIC_ERROR);
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

angular.module('SNAP.controllers').controller('StartupCtrl', ['$scope', '$timeout', 'DialogManager', function ($scope, $timeout, DialogManager) {

  var job;

  $timeout(function () {
    job = DialogManager.startJob();
  }, 1000);
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

  $scope.navigated = function (e) {
    return WebBrowser.navigated(e.target.src);
  };

  WebBrowser.onOpen.add(function (url) {
    ActivityMonitor.enabled = false;

    if (!WebBrowser.isExternal) {
      $timeout(function () {
        $scope.browserUrl = url;
        $scope.visible = true;
      });
    }
  });

  WebBrowser.onClose.add(function () {
    ActivityMonitor.enabled = true;

    if (!WebBrowser.isExternal) {
      $timeout(function () {
        $scope.browserUrl = WebBrowser.getAppUrl('/blank');
        $scope.visible = false;
      });
    }
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
}]).factory('DtsApi', ['SNAPHosts', 'SessionProvider', function (SNAPHosts, SessionProvider) {
  return new app.BackendApi(SNAPHosts, SessionProvider);
}]).factory('ManagementService', ['$resource', 'SNAPEnvironment', function ($resource, SNAPEnvironment) {
  return new app.ManagementService($resource, SNAPEnvironment);
}]).factory('SessionService', ['$resource', function ($resource) {
  return new app.SessionService($resource);
}]).factory('SocketClient', ['SessionProvider', 'Logger', function (SessionProvider, Logger) {
  return new app.SocketClient(SessionProvider, Logger);
}]).factory('TelemetryService', ['$resource', function ($resource) {
  return new app.TelemetryService($resource);
}]).factory('WebBrowser', ['$window', 'AnalyticsModel', 'ManagementService', 'SNAPEnvironment', 'SNAPHosts', function ($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts) {
  window.SnapWebBrowser = new app.WebBrowser($window, AnalyticsModel, ManagementService, SNAPEnvironment, SNAPHosts);
  return window.SnapWebBrowser;
}])

//Models

.factory('AppCache', ['Logger', function (Logger) {
  return new app.AppCache(Logger);
}]).factory('AnalyticsModel', ['StorageProvider', 'HeatMap', function (StorageProvider, HeatMap) {
  return new app.AnalyticsModel(StorageProvider, HeatMap);
}]).factory('CartModel', function () {
  return new app.CartModel();
}).factory('ChatModel', ['SNAPConfig', 'SNAPEnvironment', 'StorageProvider', function (SNAPConfig, SNAPEnvironment, StorageProvider) {
  return new app.ChatModel(SNAPConfig, SNAPEnvironment, StorageProvider);
}]).factory('CustomerModel', ['SNAPConfig', 'StorageProvider', function (SNAPConfig, StorageProvider) {
  return new app.CustomerModel(SNAPConfig, StorageProvider);
}]).factory('DataProvider', ['SNAPConfig', 'DtsApi', function (SNAPConfig, DtsApi) {
  return new app.DataProvider(SNAPConfig, DtsApi);
}]).factory('HeatMap', function () {
  return new app.HeatMap(document.body);
}).factory('LocationModel', ['SNAPEnvironment', 'StorageProvider', function (SNAPEnvironment, StorageProvider) {
  return new app.LocationModel(SNAPEnvironment, StorageProvider);
}]).factory('OrderModel', ['StorageProvider', function (StorageProvider) {
  return new app.OrderModel(StorageProvider);
}]).factory('ShellModel', function () {
  return new app.ShellModel();
}).factory('SurveyModel', ['SNAPConfig', 'StorageProvider', function (SNAPConfig, StorageProvider) {
  return new app.SurveyModel(SNAPConfig, StorageProvider);
}]).factory('SessionProvider', ['SessionService', 'StorageProvider', function (SessionService, StorageProvider) {
  return new app.SessionProvider(SessionService, StorageProvider);
}]).factory('StorageProvider', function () {
  return function (id) {
    return new app.LocalStorageStore(id);
  };
})

//Managers

.factory('ActivityMonitor', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
  var monitor = new app.ActivityMonitor($rootScope, $timeout);
  monitor.timeout = 30000;
  return monitor;
}]).factory('AnalyticsManager', ['TelemetryService', 'AnalyticsModel', 'Logger', function (TelemetryService, AnalyticsModel, Logger) {
  return new app.AnalyticsManager(TelemetryService, AnalyticsModel, Logger);
}]).factory('CustomerManager', ['SNAPConfig', 'SNAPEnvironment', 'DtsApi', 'CustomerModel', function (SNAPConfig, SNAPEnvironment, DtsApi, CustomerModel) {
  return new app.CustomerManager(SNAPConfig, SNAPEnvironment, DtsApi, CustomerModel);
}]).factory('ChatManager', ['AnalyticsModel', 'ChatModel', 'CustomerModel', 'LocationModel', 'SocketClient', function (AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient) {
  return new app.ChatManager(AnalyticsModel, ChatModel, CustomerModel, LocationModel, SocketClient);
}]).factory('DataManager', ['DataProvider', 'Logger', 'SNAPEnvironment', function (DataProvider, Logger, SNAPEnvironment) {
  return new app.DataManager(DataProvider, Logger, SNAPEnvironment);
}]).factory('DialogManager', function () {
  return new app.DialogManager();
}).factory('NavigationManager', ['$rootScope', '$location', '$window', 'AnalyticsModel', function ($rootScope, $location, $window, AnalyticsModel) {
  return new app.NavigationManager($rootScope, $location, $window, AnalyticsModel);
}]).factory('OrderManager', ['ChatModel', 'CustomerModel', 'DataProvider', 'DtsApi', 'LocationModel', 'OrderModel', function (ChatModel, CustomerModel, DataProvider, DtsApi, LocationModel, OrderModel) {
  return new app.OrderManager(ChatModel, CustomerModel, DataProvider, DtsApi, LocationModel, OrderModel);
}]).factory('SessionManager', ['SNAPEnvironment', 'AnalyticsModel', 'CustomerModel', 'LocationModel', 'OrderModel', 'SurveyModel', 'StorageProvider', 'Logger', function (SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger) {
  return new app.SessionManager(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, StorageProvider, Logger);
}]).factory('ShellManager', ['$sce', 'DataProvider', 'ShellModel', 'SNAPConfig', 'SNAPEnvironment', 'SNAPHosts', function ($sce, DataProvider, ShellModel, SNAPConfig, SNAPEnvironment, SNAPHosts) {
  var manager = new app.ShellManager($sce, DataProvider, ShellModel, SNAPConfig, SNAPEnvironment, SNAPHosts);
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
//# sourceMappingURL=data:application/json;base64,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LFNBQU8sT0FBTyxDQUFDO0NBQ2hCLENBQUMsQ0FBQyxDQUNGLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBSztBQUMvSCxTQUFPLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztDQUMzRSxDQUFDLENBQUMsQ0FDRixPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUNuRSxTQUFPLElBQUksR0FBRyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNqRCxDQUFDLENBQUMsQ0FDRixPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsY0FBYyxFQUFFLGFBQWEsRUFBRSxVQUFDLFlBQVksRUFBRSxXQUFXLEVBQUs7QUFDdkYsU0FBTyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQ3pELENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6InRlbXAvc25hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vc3JjL2pzL3NoYXJlZC9fYmFzZS5qc1xuXG53aW5kb3cuYXBwID0ge307XG5cbnZhciBBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUiA9IDEsXG4gICAgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQgPSAxMCxcbiAgICBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQgPSAxMSxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQgPSAyMCxcbiAgICBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEID0gMjEsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UID0gMzAsXG4gICAgQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCA9IDMxLFxuICAgIEFMRVJUX1NJR05JTl9SRVFVSVJFRCA9IDQwLFxuICAgIEFMRVJUX1RBQkxFX1JFU0VUID0gNTAsXG4gICAgQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSA9IDUxLFxuICAgIEFMRVJUX1RBQkxFX0NMT1NFT1VUID0gNTIsXG4gICAgQUxFUlRfR0VORVJJQ19FUlJPUiA9IDEwMCxcbiAgICBBTEVSVF9ERUxFVF9DQVJEID0gMjAwLFxuICAgIEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFID0gMjEwLFxuICAgIEFMRVJUX1NPRlRXQVJFX09VVERBVEVEID0gMjIwLFxuICAgIEFMRVJUX0NBUkRSRUFERVJfRVJST1IgPSAzMTAsXG4gICAgQUxFUlRfRVJST1JfTk9fU0VBVCA9IDQxMDtcblxuLy9zcmMvanMvc2hhcmVkL2FjdGl2aXR5bW9uaXRvci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIEFjdGl2aXR5TW9uaXRvciA9IGZ1bmN0aW9uKCRyb290U2NvcGUsICR0aW1lb3V0KSB7XG4gICAgdGhpcy4kJHJvb3RTY29wZSA9ICRyb290U2NvcGU7XG4gICAgdGhpcy4kJHRpbWVvdXQgPSAkdGltZW91dDtcbiAgICB0aGlzLl90aW1lb3V0ID0gMTAwMDA7XG5cbiAgICB0aGlzLl9hY3RpdmVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuJCRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5lbmFibGVkKSB7XG4gICAgICAgIHNlbGYuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hY3Rpdml0eURldGVjdGVkKCk7XG4gIH07XG5cbiAgQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSA9IHt9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAndGltZW91dCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fdGltZW91dDsgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICAgIHRoaXMuX3RpbWVvdXQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ2VuYWJsZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkgeyB0aGlzLl9lbmFibGVkID0gdmFsdWU7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdhY3RpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3RpbWVyICE9IG51bGw7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdhY3RpdmVDaGFuZ2VkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9hY3RpdmVDaGFuZ2VkOyB9XG4gIH0pO1xuXG4gIEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUuYWN0aXZpdHlEZXRlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGFuZ2VkO1xuXG4gICAgaWYgKHRoaXMuX3RpbWVyKSB7XG4gICAgICB0aGlzLiQkdGltZW91dC5jYW5jZWwodGhpcy5fdGltZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLl90aW1lciA9PT0gbnVsbCkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG9uVGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fdGltZXIgPSBudWxsO1xuXG4gICAgICBzZWxmLiQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuICAgICAgICAgIHNlbGYuYWN0aXZlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmFjdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl90aW1lciA9IHRoaXMuJCR0aW1lb3V0KG9uVGltZW91dCwgdGhpcy5fdGltZW91dCk7XG5cbiAgICBpZiAoY2hhbmdlZCAmJiB0aGlzLmVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYWN0aXZlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLmFjdGl2ZSk7XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hcHAuQWN0aXZpdHlNb25pdG9yID0gQWN0aXZpdHlNb25pdG9yO1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL2FuYWx5dGljc2RhdGEuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NEYXRhID0gY2xhc3MgQW5hbHl0aWNzRGF0YSB7XG4gIGNvbnN0cnVjdG9yKG5hbWUsIHN0b3JhZ2VQcm92aWRlciwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlIHx8ICgoKSA9PiBbXSk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RlZmF1bHRWYWx1ZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2FuYWx5dGljc18nICsgbmFtZSk7XG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4oZGF0YSA9PiBzZWxmLl9kYXRhID0gZGF0YSB8fCBzZWxmLl9kYXRhKTtcbiAgfVxuXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG5cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGE7XG4gIH1cblxuICBzZXQgZGF0YSh2YWx1ZSkge1xuICAgIHRoaXMuX2RhdGEgPSB2YWx1ZTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgZ2V0IGxlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5sZW5ndGg7XG4gIH1cblxuICBnZXQgbGFzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVt0aGlzLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgcHVzaChpdGVtKSB7XG4gICAgdGhpcy5fZGF0YS5wdXNoKGl0ZW0pO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGVmYXVsdFZhbHVlKCk7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIHN0b3JlKCkge1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX2RhdGEpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvYW5hbHl0aWNzbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkFuYWx5dGljc01hbmFnZXIgPSBjbGFzcyBBbmFseXRpY3NNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcikge1xuICAgIHRoaXMuX1RlbGVtZXRyeVNlcnZpY2UgPSBUZWxlbWV0cnlTZXJ2aWNlO1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9XG5cbiAgc3VibWl0KCkge1xuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZyhgU3VibWl0dGluZyBhbmFseXRpY3MgZGF0YSB3aXRoIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuc2Vzc2lvbnMubGVuZ3RofSBzZWF0IHNlc3Npb25zLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmFuc3dlcnMubGVuZ3RofSBhbnN3ZXJzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNoYXRzLmxlbmd0aH0gY2hhdHMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY29tbWVudHMubGVuZ3RofSBjb21tZW50cywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jbGlja3MubGVuZ3RofSBjbGlja3MsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwucGFnZXMubGVuZ3RofSBwYWdlcywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5hZHZlcnRpc2VtZW50cy5sZW5ndGh9IGFkdmVydGlzZW1lbnRzIGFuZCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLnVybHMubGVuZ3RofSBVUkxzLmApO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9UZWxlbWV0cnlTZXJ2aWNlLnN1Ym1pdFRlbGVtZXRyeSh7XG4gICAgICAgIHNlc3Npb25zOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5zZXNzaW9ucy5kYXRhLFxuICAgICAgICBhZHZlcnRpc2VtZW50czogc2VsZi5fQW5hbHl0aWNzTW9kZWwuYWR2ZXJ0aXNlbWVudHMuZGF0YSxcbiAgICAgICAgYW5zd2Vyczogc2VsZi5fQW5hbHl0aWNzTW9kZWwuYW5zd2Vycy5kYXRhLFxuICAgICAgICBjaGF0czogc2VsZi5fQW5hbHl0aWNzTW9kZWwuY2hhdHMuZGF0YSxcbiAgICAgICAgY29tbWVudHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmNvbW1lbnRzLmRhdGEsXG4gICAgICAgIGNsaWNrczogc2VsZi5fQW5hbHl0aWNzTW9kZWwuY2xpY2tzLmRhdGEsXG4gICAgICAgIHBhZ2VzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5wYWdlcy5kYXRhLFxuICAgICAgICB1cmxzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC51cmxzLmRhdGFcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9BbmFseXRpY3NNb2RlbC5jbGVhcigpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCBlID0+IHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLndhcm4oJ1VuYWJsZSB0byBzdWJtaXQgYW5hbHl0aWNzIGRhdGE6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2FuYWx5dGljc21vZGVsLmpzXG5cbndpbmRvdy5hcHAuQW5hbHl0aWNzTW9kZWwgPSBjbGFzcyBBbmFseXRpY3NNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlciwgaGVhdG1hcCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9kYXRhID0gW1xuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdzZXNzaW9ucycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2FkdmVydGlzZW1lbnRzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnYW5zd2VycycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NoYXRzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY29tbWVudHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjbGlja3MnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdwYWdlcycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3VybHMnLCBzdG9yYWdlUHJvdmlkZXIpXG4gICAgXS5yZWR1Y2UoKHJlc3VsdCwgaXRlbSkgPT4ge1xuICAgICAgcmVzdWx0W2l0ZW0ubmFtZV0gPSBpdGVtO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCB7fSk7XG5cbiAgICBoZWF0bWFwLmNsaWNrZWQuYWRkKGNsaWNrID0+IHtcbiAgICAgIHNlbGYuX2xvZ0NsaWNrKGNsaWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ1Nlc3Npb24oc2Vzc2lvbikge1xuICAgIHRoaXMuX2RhdGEuc2Vzc2lvbnMucHVzaChzZXNzaW9uKTtcbiAgfVxuXG4gIGdldCBzZXNzaW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5zZXNzaW9ucztcbiAgfVxuXG4gIGxvZ05hdmlnYXRpb24oZGVzdGluYXRpb24pIHtcbiAgICB0aGlzLl9kYXRhLnBhZ2VzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGF0YS5jbGlja3Muc3RvcmUoKTtcbiAgfVxuXG4gIGdldCBwYWdlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5wYWdlcztcbiAgfVxuXG4gIGxvZ0FkdmVydGlzZW1lbnQoYWR2ZXJ0aXNlbWVudCkge1xuICAgIHRoaXMuX2RhdGEuYWR2ZXJ0aXNlbWVudHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgYWR2ZXJ0aXNlbWVudDogYWR2ZXJ0aXNlbWVudFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGFkdmVydGlzZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmFkdmVydGlzZW1lbnRzO1xuICB9XG5cbiAgbG9nQW5zd2VyKGFuc3dlcikge1xuICAgIHRoaXMuX2RhdGEuYW5zd2Vycy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBhbnN3ZXI6IGFuc3dlclxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGFuc3dlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuYW5zd2VycztcbiAgfVxuXG4gIGxvZ0NoYXQoY2hhdCkge1xuICAgIHRoaXMuX2RhdGEuY2hhdHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgY2hhdDogY2hhdFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGNoYXRzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmNoYXRzO1xuICB9XG5cbiAgbG9nQ29tbWVudChjb21tZW50KSB7XG4gICAgdGhpcy5fZGF0YS5jb21tZW50cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBjb21tZW50OiBjb21tZW50XG4gICAgfSk7XG4gIH1cblxuICBnZXQgY29tbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY29tbWVudHM7XG4gIH1cblxuICBsb2dVcmwodXJsKSB7XG4gICAgdGhpcy5fZGF0YS51cmxzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIHVybDogdXJsXG4gICAgfSk7XG4gIH1cblxuICBnZXQgdXJscygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS51cmxzO1xuICB9XG5cbiAgZ2V0IGNsaWNrcygpIHtcbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5zdG9yZSgpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY2xpY2tzO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgZm9yICh2YXIgayBpbiB0aGlzLl9kYXRhKSB7XG4gICAgICB0aGlzLl9kYXRhW2tdLnJlc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgX2xvZ0NsaWNrKGNsaWNrKSB7XG4gICAgY2xpY2sudGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy5fZGF0YS5jbGlja3MuZGF0YS5wdXNoKGNsaWNrKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2FwcGNhY2hlLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQXBwQ2FjaGVcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQXBwQ2FjaGUgPSBmdW5jdGlvbihMb2dnZXIpIHtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gICAgdGhpcy5fY2FjaGUgPSB3aW5kb3cuYXBwbGljYXRpb25DYWNoZTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cyA9IFtcbiAgICAgICdjYWNoZWQnLFxuICAgICAgJ2NoZWNraW5nJyxcbiAgICAgICdkb3dubG9hZGluZycsXG4gICAgICAnY2FjaGVkJyxcbiAgICAgICdub3VwZGF0ZScsXG4gICAgICAnb2Jzb2xldGUnLFxuICAgICAgJ3VwZGF0ZXJlYWR5JyxcbiAgICAgICdwcm9ncmVzcydcbiAgICBdO1xuXG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuX2dldENhY2hlU3RhdHVzKCk7XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hlIHN0YXR1czogJyArIHN0YXR1cyk7XG5cbiAgICB0aGlzLmNvbXBsZXRlID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5faXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIHRoaXMuX2lzVXBkYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hhZEVycm9ycyA9IGZhbHNlO1xuXG4gICAgaWYgKHN0YXR1cyA9PT0gJ1VOQ0FDSEVEJykge1xuICAgICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XG4gICAgICB0aGlzLmNvbXBsZXRlLmRpc3BhdGNoKGZhbHNlKTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5faGFuZGxlQ2FjaGVFcnJvcihlKTtcbiAgICB9O1xuICAgIHRoaXMuX2V2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2hhbmRsZUNhY2hlRXZlbnQoZSk7XG4gICAgfTtcblxuICAgIHRoaXMuX2FkZEV2ZW50TGlzdGVuZXJzKCk7XG4gIH07XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFwcENhY2hlLnByb3RvdHlwZSwgJ2lzQ29tcGxldGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2lzQ29tcGxldGU7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFwcENhY2hlLnByb3RvdHlwZSwgJ2lzVXBkYXRlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faXNVcGRhdGVkOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdoYWRFcnJvcnMnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2hhZEVycm9yczsgfVxuICB9KTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2dldENhY2hlU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gICAgc3dpdGNoICh0aGlzLl9jYWNoZS5zdGF0dXMpIHtcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuVU5DQUNIRUQ6XG4gICAgICAgIHJldHVybiAnVU5DQUNIRUQnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5JRExFOlxuICAgICAgICByZXR1cm4gJ0lETEUnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5DSEVDS0lORzpcbiAgICAgICAgcmV0dXJuICdDSEVDS0lORyc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLkRPV05MT0FESU5HOlxuICAgICAgICByZXR1cm4gJ0RPV05MT0FESU5HJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuVVBEQVRFUkVBRFk6XG4gICAgICAgIHJldHVybiAnVVBEQVRFUkVBRFknO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5PQlNPTEVURTpcbiAgICAgICAgcmV0dXJuICdPQlNPTEVURSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ1VLTk9XTiBDQUNIRSBTVEFUVVMnO1xuICAgIH1cbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX3Jlc3VsdCA9IGZ1bmN0aW9uKGVycm9yLCB1cGRhdGVkKSB7XG4gICAgdGhpcy5faXNDb21wbGV0ZSA9IHRydWU7XG4gICAgdGhpcy5faXNVcGRhdGVkID0gdXBkYXRlZDtcbiAgICB0aGlzLl9oYWRFcnJvcnMgPSAoZXJyb3IgIT0gbnVsbCk7XG4gICAgdGhpcy5jb21wbGV0ZS5kaXNwYXRjaCh1cGRhdGVkKTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2FkZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fZXJyb3JIYW5kbGVyKTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2NhY2hlLmFkZEV2ZW50TGlzdGVuZXIoZSwgc2VsZi5fZXZlbnRIYW5kbGVyKTtcbiAgICB9KTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX3JlbW92ZUV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgdGhpcy5fZXJyb3JIYW5kbGVyKTtcbiAgICB0aGlzLl9hcHBDYWNoZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2NhY2hlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZSwgc2VsZi5fZXZlbnRIYW5kbGVyKTtcbiAgICB9KTtcbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2hhbmRsZUNhY2hlRXZlbnQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudHlwZSAhPT0gJ3Byb2dyZXNzJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBldmVudDogJyArIGUudHlwZSk7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hlIHN0YXR1czogJyArIHRoaXMuX2dldENhY2hlU3RhdHVzKCkpO1xuICAgIH1cblxuICAgIGlmIChlLnR5cGUgPT09ICd1cGRhdGVyZWFkeScpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gU3dhcHBpbmcgdGhlIGNhY2hlLicpO1xuXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgdGhpcy5fY2FjaGUuc3dhcENhY2hlKCk7XG5cbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCB0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS50eXBlID09PSAnY2FjaGVkJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoaW5nIGNvbXBsZXRlLiBDYWNoZSBzYXZlZC4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCBmYWxzZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGUudHlwZSA9PT0gJ25vdXBkYXRlJykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoaW5nIGNvbXBsZXRlLiBObyB1cGRhdGVzLicpO1xuXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgdGhpcy5fcmVzdWx0KG51bGwsIGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9oYW5kbGVDYWNoZUVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NhY2hlIHVwZGF0ZSBlcnJvcjogJyArIGUubWVzc2FnZSk7XG4gICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLl9yZXN1bHQoZSwgZmFsc2UpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQXBwQ2FjaGUgPSBBcHBDYWNoZTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9iYWNrZW5kYXBpLmpzXG5cbndpbmRvdy5hcHAuQmFja2VuZEFwaSA9IGNsYXNzIEJhY2tlbmRBcGkge1xuICBjb25zdHJ1Y3RvcihIb3N0cywgU2Vzc2lvblByb3ZpZGVyKSB7XG4gICAgdGhpcy5fU2Vzc2lvblByb3ZpZGVyID0gU2Vzc2lvblByb3ZpZGVyO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgZnVuY3Rpb24gYnVzaW5lc3NUb2tlblByb3ZpZGVyKCkge1xuICAgICAgcmV0dXJuIHNlbGYuX1Nlc3Npb25Qcm92aWRlci5nZXRCdXNpbmVzc1Rva2VuKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VzdG9tZXJUb2tlblByb3ZpZGVyKCkge1xuICAgICAgcmV0dXJuIHNlbGYuX1Nlc3Npb25Qcm92aWRlci5nZXRDdXN0b21lclRva2VuKCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIER0c0FwaUNsaWVudCkge1xuICAgICAgbGV0IGNvbmZpZyA9IHtcbiAgICAgICAgaG9zdDoge1xuICAgICAgICAgIGRvbWFpbjogSG9zdHMuYXBpLmhvc3QsXG4gICAgICAgICAgc2VjdXJlOiBIb3N0cy5hcGkuc2VjdXJlID09PSAndHJ1ZSdcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHByb3ZpZGVyID0gYnVzaW5lc3NUb2tlblByb3ZpZGVyO1xuXG4gICAgICBpZiAoa2V5ID09PSAnc25hcCcpIHtcbiAgICAgICAgY29uZmlnLmhvc3QuZG9tYWluID0gSG9zdHMuY29udGVudC5ob3N0O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoa2V5ID09PSAnY3VzdG9tZXInKSB7XG4gICAgICAgIHByb3ZpZGVyID0gY3VzdG9tZXJUb2tlblByb3ZpZGVyO1xuICAgICAgfVxuXG4gICAgICB0aGlzW2tleV0gPSBuZXcgRHRzQXBpQ2xpZW50W2tleV0oY29uZmlnLCBwcm92aWRlcik7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY2FyZHJlYWRlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ2FyZFJlYWRlclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJkUmVhZGVyID0gZnVuY3Rpb24oTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZSA9IE1hbmFnZW1lbnRTZXJ2aWNlO1xuICAgIHRoaXMub25SZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25FcnJvciA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnJlY2VpdmVkID0gZnVuY3Rpb24oY2FyZCkge1xuICAgIHRoaXMub25SZWNlaXZlZC5kaXNwYXRjaChjYXJkKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5lcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLm9uRXJyb3IuZGlzcGF0Y2goZSk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZSkge1xuICAgICAgdGhpcy5fTWFuYWdlbWVudFNlcnZpY2Uuc3RhcnRDYXJkUmVhZGVyKCk7XG4gICAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZSkge1xuICAgICAgdGhpcy5fTWFuYWdlbWVudFNlcnZpY2Uuc3RvcENhcmRSZWFkZXIoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICB3aW5kb3cuYXBwLkNhcmRSZWFkZXIgPSBDYXJkUmVhZGVyO1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL2NhcnRpdGVtLmpzXG5cbndpbmRvdy5hcHAuQ2FydEl0ZW0gPSBjbGFzcyBDYXJ0SXRlbSB7XG4gIGNvbnN0cnVjdG9yKGl0ZW0sIHF1YW50aXR5LCBuYW1lLCBtb2RpZmllcnMsIHJlcXVlc3QpIHtcbiAgICB0aGlzLml0ZW0gPSBpdGVtO1xuICAgIHRoaXMucXVhbnRpdHkgPSBxdWFudGl0eTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMucmVxdWVzdCA9IHJlcXVlc3Q7XG5cbiAgICBpZiAoIXRoaXMuaGFzTW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IFtdO1xuICAgIH1cbiAgICBlbHNlIGlmICghbW9kaWZpZXJzKSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IGl0ZW0ubW9kaWZpZXJzLm1hcChmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeShjYXRlZ29yeSwgY2F0ZWdvcnkuaXRlbXMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyKG1vZGlmaWVyKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhhc01vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtLm1vZGlmaWVycyAhPSBudWxsICYmIHRoaXMuaXRlbS5tb2RpZmllcnMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBzZWxlY3RlZE1vZGlmaWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RpZmllcnMucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzQ2F0ZWdvcnksIGNhdGVnb3J5LCBpLCBhcnJheSkge1xuICAgICAgcmV0dXJuIGFycmF5LmNvbmNhdChjYXRlZ29yeS5pdGVtcy5maWx0ZXIoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgICB9KSk7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgY2xvbmUoY291bnQpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgIHRoaXMuaXRlbSxcbiAgICAgIHRoaXMucXVhbnRpdHksXG4gICAgICB0aGlzLm5hbWUsXG4gICAgICB0aGlzLm1vZGlmaWVycy5tYXAoY2F0ZWdvcnkgPT4gY2F0ZWdvcnkuY2xvbmUoKSksXG4gICAgICB0aGlzLnJlcXVlc3QpO1xuICB9XG5cbiAgY2xvbmVNYW55KGNvdW50KSB7XG4gICAgY291bnQgPSBjb3VudCB8fCB0aGlzLnF1YW50aXR5O1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2gobmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgICAgdGhpcy5pdGVtLFxuICAgICAgICAxLFxuICAgICAgICB0aGlzLm5hbWUsXG4gICAgICAgIHRoaXMubW9kaWZpZXJzLm1hcChjYXRlZ29yeSA9PiBjYXRlZ29yeS5jbG9uZSgpKSxcbiAgICAgICAgdGhpcy5yZXF1ZXN0KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcmVzdG9yZShkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydEl0ZW0oXG4gICAgICBkYXRhLml0ZW0sXG4gICAgICBkYXRhLnF1YW50aXR5LFxuICAgICAgZGF0YS5uYW1lLFxuICAgICAgZGF0YS5tb2RpZmllcnMubWFwKGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUucmVzdG9yZSksXG4gICAgICBkYXRhLnJlcXVlc3RcbiAgICApO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY2FydG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ2FydE1vZGVsID0gY2xhc3MgQ2FydE1vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5TVEFURV9DQVJUID0gJ2NhcnQnO1xuICAgIHRoaXMuU1RBVEVfSElTVE9SWSA9ICdoaXN0b3J5JztcblxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fY2FydFN0YXRlID0gdGhpcy5TVEFURV9DQVJUO1xuICAgIHRoaXMuY2FydFN0YXRlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IG51bGw7XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgaXNDYXJ0T3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDYXJ0T3BlbjtcbiAgfVxuXG4gIHNldCBpc0NhcnRPcGVuKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ2FydE9wZW4gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2lzQ2FydE9wZW4gPSB2YWx1ZTtcbiAgICB0aGlzLmlzQ2FydE9wZW5DaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBjYXJ0U3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhcnRTdGF0ZTtcbiAgfVxuXG4gIHNldCBjYXJ0U3RhdGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2FydFN0YXRlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jYXJ0U3RhdGUgPSB2YWx1ZTtcbiAgICB0aGlzLmNhcnRTdGF0ZUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtO1xuICB9XG5cbiAgZ2V0IGVkaXRhYmxlSXRlbU5ldygpIHtcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGVJdGVtTmV3O1xuICB9XG5cbiAgb3BlbkVkaXRvcihpdGVtLCBpc05ldykge1xuICAgIGlmICh0aGlzLl9lZGl0YWJsZUl0ZW0gPT09IGl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtTmV3ID0gaXNOZXcgfHwgZmFsc2U7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gaXRlbTtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQuZGlzcGF0Y2goaXRlbSk7XG4gIH1cblxuICBjbG9zZUVkaXRvcigpIHtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW1OZXcgPSBmYWxzZTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBudWxsO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZC5kaXNwYXRjaChudWxsKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2NhcnRtb2RpZmllci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcnRNb2RpZmllclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXIgPSBmdW5jdGlvbihkYXRhLCBpc1NlbGVjdGVkKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmlzU2VsZWN0ZWQgPSBpc1NlbGVjdGVkIHx8IGZhbHNlO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIodGhpcy5kYXRhLCB0aGlzLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIoZGF0YS5kYXRhLCBkYXRhLmlzU2VsZWN0ZWQpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyID0gQ2FydE1vZGlmaWVyO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJ0TW9kaWZpZXJDYXRlZ29yeVxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBDYXJ0TW9kaWZpZXJDYXRlZ29yeSA9IGZ1bmN0aW9uKGRhdGEsIG1vZGlmaWVycykge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5tb2RpZmllcnMgPSBtb2RpZmllcnM7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1vZGlmaWVycyA9IHRoaXMubW9kaWZpZXJzLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgcmV0dXJuIG1vZGlmaWVyLmNsb25lKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkodGhpcy5kYXRhLCBtb2RpZmllcnMpO1xuICB9O1xuXG4gIENhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KGRhdGEuZGF0YSwgZGF0YS5tb2RpZmllcnMubWFwKENhcnRNb2RpZmllci5wcm90b3R5cGUucmVzdG9yZSkpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkgPSBDYXJ0TW9kaWZpZXJDYXRlZ29yeTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9jaGF0bWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkNoYXRNYW5hZ2VyID0gY2xhc3MgQ2hhdE1hbmFnZXIge1xuICAvKiBnbG9iYWwgbW9tZW50LCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQW5hbHl0aWNzTW9kZWwsIENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgTG9jYXRpb25Nb2RlbCwgU29ja2V0Q2xpZW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5NRVNTQUdFX1RZUEVTID0ge1xuICAgICAgTE9DQVRJT046ICdsb2NhdGlvbicsXG4gICAgICBERVZJQ0U6ICdkZXZpY2UnXG4gICAgfTtcbiAgICB0aGlzLk1FU1NBR0VfU1RBVFVTRVMgPSB7XG4gICAgICBDSEFUX1JFUVVFU1Q6ICdjaGF0X3JlcXVlc3QnLFxuICAgICAgQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEOiAnY2hhdF9yZXF1ZXN0X2FjY2VwdGVkJyxcbiAgICAgIENIQVRfUkVRVUVTVF9ERUNMSU5FRDogJ2NoYXRfcmVxdWVzdF9kZWNsaW5lZCcsXG4gICAgICBHSUZUX1JFUVVFU1Q6ICdnaWZ0X3JlcXVlc3QnLFxuICAgICAgR0lGVF9SRVFVRVNUX0FDQ0VQVEVEOiAnZ2lmdF9yZXF1ZXN0X2FjY2VwdGVkJyxcbiAgICAgIEdJRlRfUkVRVUVTVF9ERUNMSU5FRDogJ2dpZnRfcmVxdWVzdF9kZWNsaW5lZCcsXG4gICAgICBDSEFUX0NMT1NFRDogJ2NoYXRfY2xvc2VkJ1xuICAgIH07XG4gICAgdGhpcy5PUEVSQVRJT05TID0ge1xuICAgICAgQ0hBVF9NRVNTQUdFOiAnY2hhdF9tZXNzYWdlJyxcbiAgICAgIFNUQVRVU19SRVFVRVNUOiAnc3RhdHVzX3JlcXVlc3QnLFxuICAgICAgU1RBVFVTX1VQREFURTogJ3N0YXR1c191cGRhdGUnXG4gICAgfTtcbiAgICB0aGlzLlJPT01TID0ge1xuICAgICAgTE9DQVRJT046ICdsb2NhdGlvbl8nLFxuICAgICAgREVWSUNFOiAnZGV2aWNlXydcbiAgICB9O1xuXG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9DaGF0TW9kZWwgPSBDaGF0TW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fU29ja2V0Q2xpZW50ID0gU29ja2V0Q2xpZW50O1xuXG4gICAgdGhpcy5fQ2hhdE1vZGVsLmlzRW5hYmxlZENoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG4gICAgdGhpcy5fQ2hhdE1vZGVsLmlzUHJlc2VudENoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LmlzQ29ubmVjdGVkQ2hhbmdlZC5hZGQoaXNDb25uZWN0ZWQgPT4ge1xuICAgICAgc2VsZi5tb2RlbC5pc0Nvbm5lY3RlZCA9IGlzQ29ubmVjdGVkO1xuICAgICAgc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpO1xuICAgICAgc2VsZi5fc2VuZFN0YXR1c1JlcXVlc3QoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zdWJzY3JpYmUodGhpcy5ST09NUy5MT0NBVElPTiArIHRoaXMuX0xvY2F0aW9uTW9kZWwubG9jYXRpb24sIG1lc3NhZ2UgPT4ge1xuICAgICAgc3dpdGNoIChtZXNzYWdlLm9wZXJhdGlvbikge1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0U6XG4gICAgICAgICAgc2VsZi5fb25NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5TVEFUVVNfUkVRVUVTVDpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1JlcXVlc3QobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19VUERBVEU6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNVcGRhdGUobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc3Vic2NyaWJlKHRoaXMuUk9PTVMuREVWSUNFICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UsIG1lc3NhZ2UgPT4ge1xuICAgICAgc3dpdGNoIChtZXNzYWdlLm9wZXJhdGlvbikge1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0U6XG4gICAgICAgICAgc2VsZi5fb25NZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5TVEFUVVNfVVBEQVRFOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzVXBkYXRlKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9DaGF0TW9kZWw7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLm1vZGVsLnJlc2V0KCk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE1lc3NhZ2luZ1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2U7XG4gICAgbWVzc2FnZS5vcGVyYXRpb24gPSB0aGlzLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFO1xuICAgIG1lc3NhZ2UudHlwZSA9IG1lc3NhZ2UudG9fZGV2aWNlID9cbiAgICAgIHRoaXMuTUVTU0FHRV9UWVBFUy5ERVZJQ0UgOlxuICAgICAgdGhpcy5NRVNTQUdFX1RZUEVTLkxPQ0FUSU9OO1xuXG4gICAgdGhpcy5fYWRkTWVzc2FnZUlEKG1lc3NhZ2UpO1xuICAgIHRoaXMubW9kZWwuYWRkSGlzdG9yeShtZXNzYWdlKTtcblxuICAgIHZhciB0b3BpYyA9IHRoaXMuX2dldFRvcGljKG1lc3NhZ2UpO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodG9waWMsIG1lc3NhZ2UpO1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsLmxvZ0NoYXQobWVzc2FnZSk7XG4gIH1cblxuICBhcHByb3ZlRGV2aWNlKHRva2VuKSB7XG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRva2VuKTtcblxuICAgIHRoaXMubW9kZWwuc2V0TGFzdFJlYWQodG9rZW4sIG1vbWVudCgpLnVuaXgoKSk7XG5cbiAgICBpZiAodGhpcy5tb2RlbC5pc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5yZW1vdmVQZW5kaW5nRGV2aWNlKGRldmljZSk7XG5cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNULFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuYWRkQWN0aXZlRGV2aWNlKGRldmljZSk7XG4gICAgfVxuICB9XG5cbiAgZGVjbGluZURldmljZSh0b2tlbikge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZSh0b2tlbik7XG5cbiAgICBpZiAodGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZUFjdGl2ZURldmljZShkZXZpY2UpO1xuXG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVELFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVzc2FnZU5hbWUobWVzc2FnZSkge1xuICAgIGlmICh0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSA9PT0gbWVzc2FnZS5kZXZpY2UpIHtcbiAgICAgIHJldHVybiAnTWUnO1xuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlLnVzZXJuYW1lIHx8IHRoaXMuZ2V0RGV2aWNlTmFtZShtZXNzYWdlLmRldmljZSk7XG4gIH1cblxuICBnZXREZXZpY2VOYW1lKHRva2VuKSB7XG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRva2VuKTtcblxuICAgIGlmIChkZXZpY2UpIHtcbiAgICAgIGlmICh0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSA9PT0gZGV2aWNlLnRva2VuKSB7XG4gICAgICAgIHJldHVybiAnTWUnO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGV2aWNlLnVzZXJuYW1lKSB7XG4gICAgICAgIHJldHVybiBkZXZpY2UudXNlcm5hbWU7XG4gICAgICB9XG5cbiAgICAgIGZvcih2YXIgcCBpbiB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRzKSB7XG4gICAgICAgIGlmICh0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRzW3BdLnRva2VuID09PSBkZXZpY2Uuc2VhdCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRzW3BdLm5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJ0d1ZXN0JztcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTm90aWZpY2F0aW9uc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY2hlY2tJZlVucmVhZChkZXZpY2VfdG9rZW4sIG1lc3NhZ2UpIHtcbiAgICBsZXQgbGFzdFJlYWQgPSB0aGlzLm1vZGVsLmdldExhc3RSZWFkKGRldmljZV90b2tlbik7XG5cbiAgICBpZiAoIWxhc3RSZWFkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBtb21lbnQudW5peChtZXNzYWdlLnJlY2VpdmVkKS5pc0FmdGVyKG1vbWVudC51bml4KGxhc3RSZWFkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0VW5yZWFkQ291bnQoZGV2aWNlX3Rva2VuKSA+IDA7XG4gIH1cblxuICBnZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pIHtcbiAgICBsZXQgbGFzdFJlYWQgPSB0aGlzLm1vZGVsLmdldExhc3RSZWFkKGRldmljZV90b2tlbik7XG5cbiAgICBpZiAoIWxhc3RSZWFkKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGZyb21EYXRlID0gbW9tZW50LnVuaXgobGFzdFJlYWQpO1xuXG4gICAgcmV0dXJuIHRoaXMubW9kZWwuaGlzdG9yeVxuICAgICAgLmZpbHRlcihtZXNzYWdlID0+IG1lc3NhZ2UudHlwZSA9PT0gc2VsZi5NRVNTQUdFX1RZUEVTLkRFVklDRSAmJiBtZXNzYWdlLmRldmljZSA9PT0gZGV2aWNlX3Rva2VuKVxuICAgICAgLmZpbHRlcihtZXNzYWdlID0+IG1vbWVudC51bml4KG1lc3NhZ2UucmVjZWl2ZWQpLmlzQWZ0ZXIoZnJvbURhdGUpKVxuICAgICAgLmxlbmd0aDtcbiAgfVxuXG4gIG1hcmtBc1JlYWQoZGV2aWNlX3Rva2VuKSB7XG4gICAgdGhpcy5tb2RlbC5zZXRMYXN0UmVhZChkZXZpY2VfdG9rZW4sIG1vbWVudCgpLnVuaXgoKSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEdpZnRzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzZW5kR2lmdChpdGVtcykge1xuICAgIGlmICghdGhpcy5tb2RlbC5naWZ0RGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1QsXG4gICAgICB0b19kZXZpY2U6IHRoaXMubW9kZWwuZ2lmdERldmljZSxcbiAgICAgIHRleHQ6IGl0ZW1zLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgICAgIGlmIChyZXN1bHQgIT09ICcnKSB7XG4gICAgICAgICAgcmVzdWx0ICs9ICcsICc7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IGl0ZW0uaXRlbS50aXRsZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sICcnKVxuICAgIH0pO1xuICB9XG5cbiAgYWNjZXB0R2lmdChkZXZpY2UpIHtcbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRCxcbiAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgfSk7XG4gIH1cblxuICBkZWNsaW5lR2lmdChkZXZpY2UpIHtcbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCxcbiAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgfSk7XG4gIH1cblxuICBzdGFydEdpZnQoZGV2aWNlX3Rva2VuKSB7XG4gICAgbGV0IGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKGRldmljZV90b2tlbik7XG4gIFxuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IGRldmljZV90b2tlbjtcbiAgICB0aGlzLm1vZGVsLmdpZnRTZWF0ID0gZGV2aWNlLnNlYXQ7XG4gIH1cblxuICBlbmRHaWZ0KCkge1xuICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgdGhpcy5tb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX29uTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlLmlkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZWwuaGlzdG9yeS5maWx0ZXIobXNnID0+IG1zZy5pZCA9PT0gbWVzc2FnZS5pZCkubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lc3NhZ2UucmVjZWl2ZWQgPSBtb21lbnQoKS51bml4KCk7XG5cbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpLFxuICAgICAgICBnaWZ0RGV2aWNlID0gdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgICBzZWF0ID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSAmJlxuICAgICAgICAhdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmFkZFBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UudG9rZW4pO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCAmJlxuICAgICAgICB0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuZ2lmdFJlcXVlc3RSZWNlaXZlZC5kaXNwYXRjaChkZXZpY2UsIG1lc3NhZ2UudGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlKSB7XG4gICAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgICAgaWYgKGdpZnREZXZpY2UgJiYgZ2lmdERldmljZSA9PT0gbWVzc2FnZS5kZXZpY2UpIHtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnRBY2NlcHRlZC5kaXNwYXRjaCh0cnVlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICBpZiAoZ2lmdERldmljZSAmJiBnaWZ0RGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdEFjY2VwdGVkLmRpc3BhdGNoKGZhbHNlKTtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgICB0aGlzLmRlY2xpbmVEZXZpY2UoZGV2aWNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5vcGVyYXRpb24gPT09IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0UpIHtcbiAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSB0aGlzLmdldERldmljZU5hbWUoZGV2aWNlKTtcbiAgICAgIHRoaXMubW9kZWwuYWRkSGlzdG9yeShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICB0aGlzLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5kaXNwYXRjaChtZXNzYWdlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1JlcXVlc3QobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZW5kU3RhdHVzVXBkYXRlKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIF9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSk7XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgZGV2aWNlID0ge1xuICAgICAgICB0b2tlbjogbWVzc2FnZS5kZXZpY2UsXG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLmFkZERldmljZShkZXZpY2UpO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5pc19hdmFpbGFibGUgJiYgZGV2aWNlLmlzX2F2YWlsYWJsZSkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB7XG4gICAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRSxcbiAgICAgICAgdHlwZTogdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSxcbiAgICAgICAgZGV2aWNlOiBkZXZpY2UudG9rZW4sXG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VELFxuICAgICAgICB0b19kZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgICB9O1xuICAgICAgdGhpcy5fYWRkTWVzc2FnZUlEKGhpc3RvcnkpO1xuICAgICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KGhpc3RvcnkpO1xuICAgIH1cblxuICAgIGRldmljZS5pc19hdmFpbGFibGUgPSBCb29sZWFuKG1lc3NhZ2UuaXNfYXZhaWxhYmxlKTtcbiAgICBkZXZpY2UuaXNfcHJlc2VudCA9IEJvb2xlYW4obWVzc2FnZS5pc19wcmVzZW50KTtcbiAgICBkZXZpY2Uuc2VhdCA9IG1lc3NhZ2Uuc2VhdDtcbiAgICBkZXZpY2UudXNlcm5hbWUgPSBtZXNzYWdlLnVzZXJuYW1lO1xuXG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZXMpO1xuICB9XG5cbiAgX3NlbmRTdGF0dXNSZXF1ZXN0KCkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuU1RBVFVTX1JFUVVFU1QsXG4gICAgICBkZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlXG4gICAgfTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRoaXMuX2dldFRvcGljKG1lc3NhZ2UpLCBtZXNzYWdlKTtcbiAgfVxuXG4gIF9zZW5kU3RhdHVzVXBkYXRlKGRldmljZSkge1xuICAgIGlmICghdGhpcy5tb2RlbC5pc0Nvbm5lY3RlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwcm9maWxlID0gdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlLFxuICAgICAgICB1c2VybmFtZTtcblxuICAgIGlmIChwcm9maWxlICYmIHByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgdXNlcm5hbWUgPSBwcm9maWxlLmZpcnN0X25hbWUgKyAnICcgKyBwcm9maWxlLmxhc3RfbmFtZTtcbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLlNUQVRVU19VUERBVEUsXG4gICAgICB0b19kZXZpY2U6IGRldmljZSxcbiAgICAgIGRldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UsXG4gICAgICBzZWF0OiB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQudG9rZW4sXG4gICAgICBpc19hdmFpbGFibGU6IHRoaXMubW9kZWwuaXNFbmFibGVkLFxuICAgICAgaXNfcHJlc2VudDogdGhpcy5tb2RlbC5pc1ByZXNlbnQsXG4gICAgICB1c2VybmFtZTogdXNlcm5hbWVcbiAgICB9O1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodGhpcy5fZ2V0VG9waWMobWVzc2FnZSksIG1lc3NhZ2UpO1xuICB9XG5cbiAgX2dldFRvcGljKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiBtZXNzYWdlLnRvX2RldmljZSA/XG4gICAgICAgIHRoaXMuUk9PTVMuREVWSUNFICsgbWVzc2FnZS50b19kZXZpY2UgOlxuICAgICAgICB0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbjtcbiAgfVxuXG4gIF9hZGRNZXNzYWdlSUQobWVzc2FnZSkge1xuICAgIG1lc3NhZ2UuaWQgPSBtZXNzYWdlLmlkIHx8ICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgYyA9PiB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAxNnwwLFxuICAgICAgICAgIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jaGF0bW9kZWwuanNcblxud2luZG93LmFwcC5DaGF0TW9kZWwgPSBjbGFzcyBDaGF0TW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jaGF0X3ByZWZlcmVuY2VzJyk7XG4gICAgdGhpcy5faGlzdG9yeVN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2NoYXRfaGlzdG9yeScpO1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmlzRW5hYmxlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmlzUHJlc2VudENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuYWN0aXZlRGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY2hhdFJlcXVlc3RSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5oaXN0b3J5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubWVzc2FnZVJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgXG4gICAgdGhpcy5naWZ0UmVxdWVzdFJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5naWZ0QWNjZXB0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2dpZnRTZWF0ID0gbnVsbDtcbiAgICB0aGlzLmdpZnRTZWF0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fZ2lmdERldmljZSA9IG51bGw7XG4gICAgdGhpcy5naWZ0RGV2aWNlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5naWZ0UmVhZHkgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmdpZnRBY2NlcHRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5faXNFbmFibGVkID0gU05BUENvbmZpZy5jaGF0O1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gW107XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX2xhc3RSZWFkcyA9IHt9O1xuXG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5yZWFkKCkudGhlbihwcmVmcyA9PiB7XG4gICAgICBpZiAoIXByZWZzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faXNFbmFibGVkID0gQm9vbGVhbihwcmVmcy5pc19lbmFibGVkKTtcblxuICAgICAgc2VsZi5fYWN0aXZlRGV2aWNlcyA9IHByZWZzLmFjdGl2ZV9kZXZpY2VzIHx8IFtdO1xuICAgICAgc2VsZi5fcGVuZGluZ0RldmljZXMgPSBwcmVmcy5wZW5kaW5nX2RldmljZXMgfHwgW107XG4gICAgICBzZWxmLl9sYXN0UmVhZHMgPSBwcmVmcy5sYXN0X3JlYWRzIHx8IHt9O1xuICAgIH0pO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLnJlYWQoKS50aGVuKGhpc3RvcnkgPT4ge1xuICAgICAgc2VsZi5faGlzdG9yeSA9IGhpc3RvcnkgfHwgW107XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgc2V0IGlzQ29ubmVjdGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzQ29ubmVjdGVkID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNDb25uZWN0ZWQpO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNFbmFibGVkO1xuICB9XG5cbiAgc2V0IGlzRW5hYmxlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0VuYWJsZWQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzRW5hYmxlZCk7XG5cbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgZ2V0IGlzUHJlc2VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNQcmVzZW50O1xuICB9XG5cbiAgc2V0IGlzUHJlc2VudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc1ByZXNlbnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNQcmVzZW50ID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzUHJlc2VudCk7XG4gIH1cblxuICBnZXQgZ2lmdERldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2lmdERldmljZTtcbiAgfVxuXG4gIHNldCBnaWZ0RGV2aWNlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnREZXZpY2UgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZ2lmdERldmljZSA9IHZhbHVlO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdERldmljZSk7XG4gIH1cblxuICBnZXQgZ2lmdFNlYXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dpZnRTZWF0O1xuICB9XG5cbiAgc2V0IGdpZnRTZWF0KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2dpZnRTZWF0ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2dpZnRTZWF0ID0gdmFsdWU7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQuZGlzcGF0Y2godGhpcy5fZ2lmdFNlYXQpO1xuICB9XG5cbiAgZ2V0IHBlbmRpbmdEZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIHNldCBwZW5kaW5nRGV2aWNlcyh2YWx1ZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5wZW5kaW5nRGV2aWNlcyk7XG4gIH1cblxuICBnZXQgYWN0aXZlRGV2aWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIHNldCBhY3RpdmVEZXZpY2VzKHZhbHVlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmVEZXZpY2VzKTtcbiAgfVxuXG4gIGlzQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZURldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBpc1BlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZ0RldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKSAhPT0gLTE7XG4gIH1cblxuICBhZGRBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcy5wdXNoKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlcyA9IHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICBhZGRQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzLnB1c2goZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlcyA9IHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuYWN0aXZlRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLmFjdGl2ZURldmljZXMgPSB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgcmVtb3ZlUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnBlbmRpbmdEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzID0gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICBnZXQgaGlzdG9yeSgpIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIHNldCBoaXN0b3J5KHZhbHVlKSB7XG4gICAgdGhpcy5faGlzdG9yeSA9IHZhbHVlIHx8IFtdO1xuXG4gICAgdGhpcy5oaXN0b3J5Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9oaXN0b3J5KTtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gIH1cblxuICBhZGRIaXN0b3J5KG1lc3NhZ2UpIHtcbiAgICB0aGlzLl9oaXN0b3J5LnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5oaXN0b3J5ID0gdGhpcy5faGlzdG9yeTtcbiAgfVxuXG4gIGdldExhc3RSZWFkKGRldmljZSkge1xuICAgIGxldCB0b2tlbiA9IGRldmljZS50b2tlbiB8fCBkZXZpY2U7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gfHwgbnVsbDtcbiAgfVxuXG4gIHNldExhc3RSZWFkKGRldmljZSwgdmFsdWUpIHtcbiAgICBsZXQgdG9rZW4gPSBkZXZpY2UudG9rZW4gfHwgZGV2aWNlO1xuICAgIHRoaXMuX2xhc3RSZWFkc1t0b2tlbl0gPSB2YWx1ZTtcbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICB0aGlzLl91cGRhdGVIaXN0b3J5KCk7XG4gICAgdGhpcy5fdXBkYXRlUHJlZmVyZW5jZXMoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdGhpcy5faXNFbmFibGVkID0gdGhpcy5faXNQcmVzZW50ID0gZmFsc2U7XG4gICAgdGhpcy5faGlzdG9yeSA9IFtdO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMgPSBbXTtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcyA9IFtdO1xuXG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLmNsZWFyKCk7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS5jbGVhcigpO1xuICB9XG5cbiAgX3VwZGF0ZUhpc3RvcnkoKSB7XG4gICAgdGhpcy5faGlzdG9yeVN0b3JlLndyaXRlKHRoaXMuaGlzdG9yeSk7XG4gIH1cblxuICBfdXBkYXRlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5fcHJlZmVyZW5jZXNTdG9yZS53cml0ZSh7XG4gICAgICBpc19lbmFibGVkOiB0aGlzLmlzRW5hYmxlZCxcbiAgICAgIGFjdGl2ZV9kZXZpY2VzOiB0aGlzLmFjdGl2ZURldmljZXMsXG4gICAgICBwZW5kaW5nX2RldmljZXM6IHRoaXMucGVuZGluZ0RldmljZXMsXG4gICAgICBsYXN0X3JlYWRzOiB0aGlzLl9sYXN0UmVhZHNcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2N1c3RvbWVybWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkN1c3RvbWVyTWFuYWdlciA9IGNsYXNzIEN1c3RvbWVyTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBtb21lbnQgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwpIHtcbiAgICB0aGlzLl9hcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fY3VzdG9tZXJBcHBJZCA9IEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uLmNsaWVudF9pZDtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fQ3VzdG9tZXJNb2RlbDtcbiAgfVxuXG4gIGdldCBjdXN0b21lck5hbWUoKSB7XG4gICAgaWYgKHRoaXMubW9kZWwuaXNFbmFibGVkICYmIHRoaXMubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICF0aGlzLm1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgIHZhciBuYW1lID0gJyc7XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5maXJzdF9uYW1lKSB7XG4gICAgICAgIG5hbWUgKz0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZmlyc3RfbmFtZTtcbiAgICAgIH1cblxuICAgICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmxhc3RfbmFtZSkge1xuICAgICAgICBuYW1lICs9ICcgJyArIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmxhc3RfbmFtZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuICdHdWVzdCc7XG4gIH1cblxuICBsb2dvdXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IG51bGw7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICBndWVzdExvZ2luKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSAnZ3Vlc3QnO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9naW4oY3JlZGVudGlhbHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5vYXV0aDIuZ2V0VG9rZW5XaXRoQ3JlZGVudGlhbHMoXG4gICAgICAgIHNlbGYuX2N1c3RvbWVyQXBwSWQsXG4gICAgICAgIGNyZWRlbnRpYWxzLmxvZ2luLFxuICAgICAgICBjcmVkZW50aWFscy5wYXNzd29yZFxuICAgICAgKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5lcnJvciB8fCAhcmVzdWx0LmFjY2Vzc190b2tlbikge1xuICAgICAgICAgIHJldHVybiByZWplY3QocmVzdWx0LmVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICAgIGFjY2Vzc190b2tlbjogcmVzdWx0LmFjY2Vzc190b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQuZXhwaXJlc19pbikge1xuICAgICAgICAgIHNlc3Npb24uZXhwaXJlcyA9IG1vbWVudCgpLmFkZChyZXN1bHQuZXhwaXJlc19pbiwgJ3NlY29uZHMnKS51bml4KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnNlc3Npb24gPSBzZXNzaW9uO1xuXG4gICAgICAgIHNlbGYuX2xvYWRQcm9maWxlKCkudGhlbihyZXNvbHZlLCBlID0+IHtcbiAgICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnNlc3Npb24gPSBudWxsO1xuICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgbG9naW5Tb2NpYWwodG9rZW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBzZXNzaW9uID0ge1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuLmFjY2Vzc190b2tlblxuICAgICAgfTtcblxuICAgICAgaWYgKHRva2VuLmV4cGlyZXNfaW4pIHtcbiAgICAgICAgc2Vzc2lvbi5leHBpcmVzID0gbW9tZW50KCkuYWRkKHRva2VuLmV4cGlyZXNfaW4sICdzZWNvbmRzJykudW5peCgpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnNlc3Npb24gPSBzZXNzaW9uO1xuXG4gICAgICBzZWxmLl9sb2FkUHJvZmlsZSgpLnRoZW4ocmVzb2x2ZSwgZSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwuc2Vzc2lvbiA9IG51bGw7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2lnblVwKHJlZ2lzdHJhdGlvbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmVnaXN0cmF0aW9uLmNsaWVudF9pZCA9IHNlbGYuX2N1c3RvbWVyQXBwSWQ7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuc2lnblVwKHJlZ2lzdHJhdGlvbikudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYubG9naW4oe1xuICAgICAgICAgIGxvZ2luOiByZWdpc3RyYXRpb24udXNlcm5hbWUsXG4gICAgICAgICAgcGFzc3dvcmQ6IHJlZ2lzdHJhdGlvbi5wYXNzd29yZFxuICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlUHJvZmlsZShwcm9maWxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIudXBkYXRlUHJvZmlsZShwcm9maWxlKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gcHJvZmlsZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5nZVBhc3N3b3JkKHJlcXVlc3QpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5jaGFuZ2VQYXNzd29yZChyZXF1ZXN0KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5sb2dpbih7XG4gICAgICAgICAgbG9naW46IHNlbGYuX0N1c3RvbWVyTW9kZWwuZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHJlcXVlc3QubmV3X3Bhc3N3b3JkXG4gICAgICAgIH0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICByZXNldFBhc3N3b3JkKHJlcXVlc3QpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5yZXNldFBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oKCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgX2xvYWRQcm9maWxlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLmdldFByb2ZpbGUoKS50aGVuKHByb2ZpbGUgPT4ge1xuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY3VzdG9tZXJtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkN1c3RvbWVyTW9kZWwgPSBjbGFzcyBDdXN0b21lck1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihDb25maWcsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2FjY291bnRTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jdXN0b21lcicpO1xuICAgIHRoaXMuX3Nlc3Npb25TdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jdXN0b21lcl9hY2Nlc3N0b2tlbicpO1xuXG4gICAgdGhpcy5fcHJvZmlsZSA9IG51bGw7XG4gICAgdGhpcy5fc2Vzc2lvbiA9IG51bGw7XG5cbiAgICB0aGlzLl9pc0d1ZXN0ID0gZmFsc2U7XG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbihDb25maWcuYWNjb3VudHMpO1xuXG4gICAgdGhpcy5wcm9maWxlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fYWNjb3VudFN0b3JlLnJlYWQoKS50aGVuKGFjY291bnQgPT4ge1xuICAgICAgc2VsZi5faXNHdWVzdCA9IGFjY291bnQgJiYgYWNjb3VudC5pc19ndWVzdDtcblxuICAgICAgaWYgKCFhY2NvdW50IHx8IGFjY291bnQuaXNfZ3Vlc3QpIHtcbiAgICAgICAgc2VsZi5fcHJvZmlsZSA9IG51bGw7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZi5fcHJvZmlsZSA9IGFjY291bnQucHJvZmlsZTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5faXNFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBpc0F1dGhlbnRpY2F0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbmFibGVkICYmIChCb29sZWFuKHRoaXMucHJvZmlsZSkgfHwgdGhpcy5pc0d1ZXN0KTtcbiAgfVxuXG4gIGdldCBpc0d1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCAmJiBCb29sZWFuKHRoaXMuX2lzR3Vlc3QpO1xuICB9XG5cbiAgZ2V0IGhhc0NyZWRlbnRpYWxzKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuaXNBdXRoZW50aWNhdGVkICYmICF0aGlzLmlzR3Vlc3QgJiYgdGhpcy5wcm9maWxlLnR5cGUgPT09IDEpO1xuICB9XG5cbiAgZ2V0IHByb2ZpbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2ZpbGU7XG4gIH1cblxuICBzZXQgcHJvZmlsZSh2YWx1ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9wcm9maWxlID0gdmFsdWUgfHwgbnVsbDtcbiAgICB0aGlzLl9pc0d1ZXN0ID0gdmFsdWUgPT09ICdndWVzdCc7XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLl9hY2NvdW50U3RvcmUuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5faXNHdWVzdCA9IGZhbHNlO1xuICAgICAgICBzZWxmLnByb2ZpbGVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3Byb2ZpbGUpO1xuICAgICAgICBzZWxmLnNlc3Npb24gPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fYWNjb3VudFN0b3JlLndyaXRlKHtcbiAgICAgICAgcHJvZmlsZTogdGhpcy5fcHJvZmlsZSxcbiAgICAgICAgaXNfZ3Vlc3Q6IHRoaXMuX2lzR3Vlc3RcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLnByb2ZpbGVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3Byb2ZpbGUpO1xuXG4gICAgICAgIGlmICghdmFsdWUgfHwgc2VsZi5faXNHdWVzdCkge1xuICAgICAgICAgIHNlbGYuc2Vzc2lvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldCBzZXNzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uO1xuICB9XG5cbiAgc2V0IHNlc3Npb24odmFsdWUpIHtcbiAgICB0aGlzLl9zZXNzaW9uID0gdmFsdWUgfHwgbnVsbDtcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHRoaXMuX3Nlc3Npb25TdG9yZS5jbGVhcigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX3Nlc3Npb25TdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kYXRhbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkRhdGFNYW5hZ2VyID0gY2xhc3MgRGF0YU1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcblxuICAgIHRoaXMuaG9tZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lbnVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jYXRlZ29yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLml0ZW1DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9DQUNIRUFCTEVfTUVESUFfS0lORFMgPSBbXG4gICAgICA0MSwgNTEsIDU4LCA2MVxuICAgIF07XG4gIH1cblxuICBnZXQgcHJvdmlkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0RhdGFQcm92aWRlcjtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2NhY2hlID0ge1xuICAgICAgbWVudToge30sXG4gICAgICBjYXRlZ29yeToge30sXG4gICAgICBpdGVtOiB7fSxcbiAgICAgIG1lZGlhOiB7fVxuICAgIH07XG5cbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0luaXRpYWxpemluZyBkYXRhIG1hbmFnZXIuJyk7XG5cbiAgICB0aGlzLnByb3ZpZGVyLmRpZ2VzdCgpLnRoZW4oZGlnZXN0ID0+IHtcbiAgICAgIHZhciBtZW51U2V0cyA9IGRpZ2VzdC5tZW51X3NldHMubWFwKG1lbnUgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIubWVudShtZW51LnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5tZW51W21lbnUudG9rZW5dID0gc2VsZi5fZmlsdGVyTWVudShkYXRhKSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVudUNhdGVnb3JpZXMgPSBkaWdlc3QubWVudV9jYXRlZ29yaWVzLm1hcChjYXRlZ29yeSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5jYXRlZ29yeShjYXRlZ29yeS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuY2F0ZWdvcnlbY2F0ZWdvcnkudG9rZW5dID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoZGF0YSkpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lbnVJdGVtcyA9IGRpZ2VzdC5tZW51X2l0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLml0ZW0oaXRlbS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUuaXRlbVtpdGVtLnRva2VuXSA9IGRhdGEpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lZGlhcyA9IGRpZ2VzdC5tZWRpYVxuICAgICAgICAuZmlsdGVyKG1lZGlhID0+IHNlbGYuX0NBQ0hFQUJMRV9NRURJQV9LSU5EUy5pbmRleE9mKG1lZGlhLmtpbmQpICE9PSAtMSlcbiAgICAgICAgLm1hcChtZWRpYSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoLCBoZWlnaHQ7XG5cbiAgICAgICAgICBzd2l0Y2ggKG1lZGlhLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgICB3aWR0aCA9IDM3MDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gMzcwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgICAgIHdpZHRoID0gNjAwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSA2MDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2MTpcbiAgICAgICAgICAgICAgd2lkdGggPSAxMDA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbWVkaWEud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBtZWRpYS5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgICByZXR1cm4gbWVkaWE7XG4gICAgICAgIH0pXG4gICAgICAgIC5tYXAobWVkaWEgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzZWxmLnByb3ZpZGVyLm1lZGlhKG1lZGlhKVxuICAgICAgICAgICAgICAudGhlbihpbWcgPT4gc2VsZi5fY2FjaGUubWVkaWFbbWVkaWEudG9rZW5dID0gaW1nKVxuICAgICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZyhgRGlnZXN0IGNvbnRhaW5zICR7bWVudVNldHMubGVuZ3RofSBtZW51cywgYCArXG4gICAgICAgIGAke21lbnVDYXRlZ29yaWVzLmxlbmd0aH0gY2F0ZWdvcmllcywgYCArXG4gICAgICAgIGAke21lbnVJdGVtcy5sZW5ndGh9IGl0ZW1zIGFuZCBgICtcbiAgICAgICAgYCR7bWVkaWFzLmxlbmd0aH0gZmlsZXMuYCk7XG5cbiAgICAgIHZhciB0YXNrcyA9IFtdXG4gICAgICAgIC5jb25jYXQobWVudVNldHMpXG4gICAgICAgIC5jb25jYXQobWVudUNhdGVnb3JpZXMpXG4gICAgICAgIC5jb25jYXQobWVudUl0ZW1zKTtcblxuICAgICAgUHJvbWlzZS5hbGwodGFza3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICBQcm9taXNlLmFsbChtZWRpYXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaG9tZSgpIHsgcmV0dXJuIHRoaXMuX2hvbWU7IH1cbiAgc2V0IGhvbWUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faG9tZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2hvbWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMucHJvdmlkZXIuaG9tZSgpLnRoZW4oaG9tZSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9ob21lKSB7XG4gICAgICAgICAgaG9tZSA9IHNlbGYuX2ZpbHRlckhvbWUoaG9tZSk7XG4gICAgICAgICAgc2VsZi5ob21lQ2hhbmdlZC5kaXNwYXRjaChob21lKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5faG9tZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuaG9tZUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgbWVudSgpIHsgcmV0dXJuIHRoaXMuX21lbnU7IH1cbiAgc2V0IG1lbnUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fbWVudSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX21lbnUgPSB2YWx1ZTtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZWQoJ21lbnUnLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLm1lbnUodmFsdWUpLnRoZW4obWVudSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9tZW51KSB7XG4gICAgICAgICAgbWVudSA9IHNlbGYuX2ZpbHRlck1lbnUobWVudSk7XG4gICAgICAgICAgc2VsZi5tZW51Q2hhbmdlZC5kaXNwYXRjaChtZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fbWVudSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMubWVudUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2F0ZWdvcnkoKSB7IHJldHVybiB0aGlzLl9jYXRlZ29yeTsgfVxuICBzZXQgY2F0ZWdvcnkodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fY2F0ZWdvcnkgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9jYXRlZ29yeSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnY2F0ZWdvcnknLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5jYXRlZ29yeSh2YWx1ZSkudGhlbihjYXRlZ29yeSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9jYXRlZ29yeSkge1xuICAgICAgICAgIGNhdGVnb3J5ID0gc2VsZi5fZmlsdGVyQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgIHNlbGYuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKGNhdGVnb3J5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fY2F0ZWdvcnkgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBpdGVtKCkgeyByZXR1cm4gdGhpcy5faXRlbTsgfVxuICBzZXQgaXRlbSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pdGVtID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5faXRlbSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnaXRlbScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXRlbUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIuaXRlbSh2YWx1ZSkudGhlbihpdGVtID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2l0ZW0pIHtcbiAgICAgICAgICBzZWxmLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9pdGVtID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5pdGVtQ2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIF9jYWNoZWQoZ3JvdXAsIGlkKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSAmJiB0aGlzLl9jYWNoZVtncm91cF1baWRdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW2dyb3VwXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9maWx0ZXJIb21lKGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZGF0YS5tZW51cyA9IGRhdGEubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBzZWxmLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyTWVudShkYXRhKSB7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBfZmlsdGVyQ2F0ZWdvcnkoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkYXRhLml0ZW1zID0gZGF0YS5pdGVtc1xuICAgICAgLmZpbHRlcihpdGVtID0+IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IGl0ZW0udHlwZSAhPT0gMyk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2RhdGFwcm92aWRlci5qc1xuXG53aW5kb3cuYXBwLkRhdGFQcm92aWRlciA9IGNsYXNzIERhdGFQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZywgc2VydmljZSkge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9zZXJ2aWNlID0gc2VydmljZTtcbiAgICB0aGlzLl9jYWNoZSA9IHt9O1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9jYWNoZSA9IHt9O1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlnZXN0KCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnZGlnZXN0JywgJ2dldERpZ2VzdCcpO1xuICB9XG5cbiAgaG9tZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2hvbWUnLCAnZ2V0TWVudXMnKTtcbiAgfVxuXG4gIGFkdmVydGlzZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnYWR2ZXJ0aXNlbWVudHMnLCAnZ2V0QWR2ZXJ0aXNlbWVudHMnKTtcbiAgfVxuXG4gIGJhY2tncm91bmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnYmFja2dyb3VuZHMnLCAnZ2V0QmFja2dyb3VuZHMnKTtcbiAgfVxuXG4gIGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnZWxlbWVudHMnLCAnZ2V0RWxlbWVudHMnKTtcbiAgfVxuXG4gIG1lbnUoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ21lbnUnLCAnZ2V0TWVudScsIGlkKTtcbiAgfVxuXG4gIGNhdGVnb3J5KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdjYXRlZ29yeScsICdnZXRNZW51Q2F0ZWdvcnknLCBpZCk7XG4gIH1cblxuICBpdGVtKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdpdGVtJywgJ2dldE1lbnVJdGVtJywgaWQpO1xuICB9XG5cbiAgc3VydmV5cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ3N1cnZleXMnLCAnZ2V0U3VydmV5cycpO1xuICB9XG5cbiAgc2VhdHMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQoJ3NlYXRzJykgfHwgdGhpcy5fc2VydmljZS5sb2NhdGlvbi5nZXRTZWF0cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgIHNlbGYuX3N0b3JlKGRhdGEsICdzZWF0cycpO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBtZWRpYShtZWRpYSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdG9rZW4gPSBtZWRpYS50b2tlbiArICdfJyArIG1lZGlhLndpZHRoICsgJ18nICsgbWVkaWEuaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQoJ21lZGlhJywgdG9rZW4pIHx8IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmIChtZWRpYS53aWR0aCAmJiBtZWRpYS5oZWlnaHQpIHtcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWcpO1xuICAgICAgICBpbWcub25lcnJvciA9IChlKSA9PiByZWplY3QoZSk7XG4gICAgICAgIGltZy5zcmMgPSBzZWxmLl9nZXRNZWRpYVVybChtZWRpYSwgbWVkaWEud2lkdGgsIG1lZGlhLmhlaWdodCwgbWVkaWEuZXh0ZW5zaW9uKTtcblxuICAgICAgICBzZWxmLl9zdG9yZShpbWcsICdtZWRpYScsIHRva2VuKTtcblxuICAgICAgICBpZiAoaW1nLmNvbXBsZXRlKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbWcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVqZWN0KCdNaXNzaW5nIGltYWdlIGRpbWVuc2lvbnMnKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIF9nZXRTbmFwRGF0YShuYW1lLCBtZXRob2QsIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWQobmFtZSwgaWQpIHx8IHRoaXMuX3NlcnZpY2Uuc25hcFttZXRob2RdKHRoaXMuX2NvbmZpZy5sb2NhdGlvbiwgaWQpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBkYXRhID0gZGF0YSB8fCBbXTtcbiAgICAgIHNlbGYuX3N0b3JlKGRhdGEsIG5hbWUsIGlkKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgX29uRXJyb3IoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICByZXR1cm4gZTtcbiAgfVxuXG4gIF9jYWNoZWQoZ3JvdXAsIGlkKSB7XG4gICAgaWYgKGlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSAmJiB0aGlzLl9jYWNoZVtncm91cF1baWRdKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0pO1xuICAgIH1cbiAgICBlbHNlIGlmICghaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NhY2hlW2dyb3VwXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBfc3RvcmUoZGF0YSwgZ3JvdXAsIGlkKSB7XG4gICAgaWYgKGlkKSB7XG4gICAgICBpZiAoIXRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgICB0aGlzLl9jYWNoZVtncm91cF0gPSB7fTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSA9IGRhdGE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdID0gZGF0YTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TWVkaWFVcmwoKSB7XG5cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2RpYWxvZ21hbmFnZXIuanNcblxud2luZG93LmFwcC5EaWFsb2dNYW5hZ2VyID0gY2xhc3MgRGlhbG9nTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWxlcnRSZXF1ZXN0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm5vdGlmaWNhdGlvblJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY29uZmlybVJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuam9iRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1vZGFsU3RhcnRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubW9kYWxFbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2pvYnMgPSAwO1xuICAgIHRoaXMuX21vZGFscyA9IDA7XG4gIH1cblxuICBhbGVydChtZXNzYWdlLCB0aXRsZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5hbGVydFJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlLCB0aXRsZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIG5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgdGhpcy5ub3RpZmljYXRpb25SZXF1ZXN0ZWQuZGlzcGF0Y2gobWVzc2FnZSk7XG4gIH1cblxuICBjb25maXJtKG1lc3NhZ2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuY29uZmlybVJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRKb2IoKSB7XG4gICAgdGhpcy5fam9icysrO1xuXG4gICAgaWYgKHRoaXMuX2pvYnMgPT09IDEpIHtcbiAgICAgIHRoaXMuam9iU3RhcnRlZC5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9qb2JzO1xuICB9XG5cbiAgZW5kSm9iKGlkKSB7XG4gICAgdGhpcy5fam9icy0tO1xuXG4gICAgaWYgKHRoaXMuX2pvYnMgPT09IDApIHtcbiAgICAgIHRoaXMuam9iRW5kZWQuZGlzcGF0Y2goKTtcbiAgICB9XG4gIH1cblxuICBzdGFydE1vZGFsKCkge1xuICAgIHRoaXMuX21vZGFscysrO1xuXG4gICAgaWYgKHRoaXMuX21vZGFscyA9PT0gMSkge1xuICAgICAgdGhpcy5tb2RhbFN0YXJ0ZWQuZGlzcGF0Y2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbW9kYWxzO1xuICB9XG5cbiAgZW5kTW9kYWwoaWQpIHtcbiAgICB0aGlzLl9tb2RhbHMtLTtcblxuICAgIGlmICh0aGlzLl9tb2RhbHMgPT09IDApIHtcbiAgICAgIHRoaXMubW9kYWxFbmRlZC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2hlYXRtYXAuanNcblxud2luZG93LmFwcC5IZWF0TWFwID0gY2xhc3MgSGVhdE1hcCB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9saXN0ZW5lciA9IGUgPT4ge1xuICAgICAgc2VsZi5fb25DbGljayhlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2xpc3RlbmVyKTtcblxuICAgIHRoaXMuY2xpY2tlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fbGlzdGVuZXIpO1xuICB9XG5cbiAgX29uQ2xpY2soZSkge1xuICAgIGxldCBkYXRhID0ge1xuICAgICAgeDogZS5sYXllclggLyB0aGlzLl9lbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgeTogZS5sYXllclkgLyB0aGlzLl9lbGVtZW50LmNsaWVudEhlaWdodFxuICAgIH07XG5cbiAgICBpZiAoZGF0YS54IDwgMCB8fCBkYXRhLnkgPCAwIHx8IGRhdGEueCA+IDEgfHwgZGF0YS55ID4gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xpY2tlZC5kaXNwYXRjaChkYXRhKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2xvY2F0aW9ubW9kZWwuanNcblxud2luZG93LmFwcC5Mb2NhdGlvbk1vZGVsID0gY2xhc3MgTG9jYXRpb25Nb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU05BUEVudmlyb25tZW50LCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9sb2NhdGlvbiA9IFNOQVBFbnZpcm9ubWVudC5sb2NhdGlvbjtcblxuICAgIHRoaXMuX3NlYXRTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zZWF0Jyk7XG5cbiAgICB0aGlzLl9zZWF0ID0ge307XG4gICAgdGhpcy5zZWF0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fc2VhdHMgPSBbXTtcbiAgICB0aGlzLnNlYXRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fZGV2aWNlID0gU05BUEVudmlyb25tZW50LmRldmljZTtcblxuICAgIHRoaXMuX2RldmljZXMgPSBbXTtcbiAgICB0aGlzLmRldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9zZWF0U3RvcmUucmVhZCgpLnRoZW4oc2VhdCA9PiB7XG4gICAgICBzZWxmLl9zZWF0ID0gc2VhdDtcblxuICAgICAgaWYgKHNlYXQpIHtcbiAgICAgICAgc2VsZi5zZWF0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLl9zZWF0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBsb2NhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb247XG4gIH1cblxuICBnZXQgc2VhdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VhdDtcbiAgfVxuXG4gIHNldCBzZWF0KHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBvbGRTZWF0ID0gdGhpcy5fc2VhdCB8fCB7fTtcbiAgICB0aGlzLl9zZWF0ID0gdmFsdWUgfHwge307XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLl9zZWF0U3RvcmUuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5zZWF0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLl9zZWF0KTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fc2VhdCA9IG9sZFNlYXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9zZWF0U3RvcmUud3JpdGUodGhpcy5fc2VhdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuc2VhdENoYW5nZWQuZGlzcGF0Y2goc2VsZi5fc2VhdCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHNlbGYuX3NlYXQgPSBvbGRTZWF0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHNlYXRzKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWF0cztcbiAgfVxuXG4gIHNldCBzZWF0cyh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9zZWF0cyA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWF0cyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMuc2VhdHNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX3NlYXRzKTtcbiAgfVxuXG4gIGdldCBkZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RldmljZTtcbiAgfVxuXG4gIGdldCBkZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9kZXZpY2VzO1xuICB9XG5cbiAgc2V0IGRldmljZXModmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZGV2aWNlcyA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5kZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9kZXZpY2VzKTtcbiAgfVxuXG4gIGFkZERldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9kZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICB0aGlzLmRldmljZXMgPSB0aGlzLl9kZXZpY2VzO1xuICB9XG5cbiAgZ2V0U2VhdCh0b2tlbikge1xuICAgIHJldHVybiB0aGlzLnNlYXRzLmZpbHRlcihzZWF0ID0+IHNlYXQudG9rZW4gPT09IHRva2VuKVswXSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0RGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLmRldmljZXMuZmlsdGVyKGQgPT4gKGRldmljZS50b2tlbiB8fCBkZXZpY2UpID09PSBkLnRva2VuKVswXSB8fCBudWxsO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbG9nZ2VyLmpzXG5cbndpbmRvdy5hcHAuTG9nZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fbG9nID0gbG9nNGphdmFzY3JpcHQuZ2V0TG9nZ2VyKCk7XG5cbiAgICB2YXIgYWpheEFwcGVuZGVyID0gbmV3IGxvZzRqYXZhc2NyaXB0LkFqYXhBcHBlbmRlcignL3NuYXAvbG9nJyk7XG4gICAgYWpheEFwcGVuZGVyLnNldFdhaXRGb3JSZXNwb25zZSh0cnVlKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0TGF5b3V0KG5ldyBsb2c0amF2YXNjcmlwdC5Kc29uTGF5b3V0KCkpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRUaHJlc2hvbGQobG9nNGphdmFzY3JpcHQuTGV2ZWwuRVJST1IpO1xuXG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKGFqYXhBcHBlbmRlcik7XG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKG5ldyBsb2c0amF2YXNjcmlwdC5Ccm93c2VyQ29uc29sZUFwcGVuZGVyKCkpO1xuICB9XG5cbiAgZGVidWcoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5kZWJ1ZyguLi5hcmdzKTtcbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5pbmZvKC4uLmFyZ3MpO1xuICB9XG5cbiAgd2FybiguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLndhcm4oLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmVycm9yKC4uLmFyZ3MpO1xuICB9XG5cbiAgZmF0YWwoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5mYXRhbCguLi5hcmdzKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZW1lbnRzZXJ2aWNlLmpzXG5cbndpbmRvdy5hcHAuTWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBNYW5hZ2VtZW50U2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSwgU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3JvdGF0ZVNjcmVlbic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvcm90YXRlLXNjcmVlbicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdvcGVuQnJvd3Nlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvb3Blbi1icm93c2VyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2Nsb3NlQnJvd3Nlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvY2xvc2UtYnJvd3NlcicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzdGFydENhcmRSZWFkZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3N0YXJ0LWNhcmQtcmVhZGVyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3N0b3BDYXJkUmVhZGVyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9zdG9wLWNhcmQtcmVhZGVyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3Jlc2V0JzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9yZXNldCcsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdnZXRTb3VuZFZvbHVtZSc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvdm9sdW1lJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3NldFNvdW5kVm9sdW1lJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC92b2x1bWUnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnZ2V0RGlzcGxheUJyaWdodG5lc3MnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L2JyaWdodG5lc3MnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc2V0RGlzcGxheUJyaWdodG5lc3MnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L2JyaWdodG5lc3MnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSlcbiAgICB9O1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgfVxuXG4gIHJvdGF0ZVNjcmVlbigpIHtcbiAgICB0aGlzLl9hcGkucm90YXRlU2NyZWVuLnF1ZXJ5KCk7XG4gIH1cblxuICBvcGVuQnJvd3Nlcih1cmwpIHtcbiAgICB0aGlzLl9hcGkub3BlbkJyb3dzZXIucXVlcnkoeyB1cmw6IHVybCB9KTtcbiAgfVxuXG4gIGNsb3NlQnJvd3NlcigpIHtcbiAgICB0aGlzLl9hcGkuY2xvc2VCcm93c2VyLnF1ZXJ5KCk7XG4gIH1cblxuICBzdGFydENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0YXJ0Q2FyZFJlYWRlci5xdWVyeSgpO1xuICB9XG5cbiAgc3RvcENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0b3BDYXJkUmVhZGVyLnF1ZXJ5KCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5yZXNldC5xdWVyeSgpLiRwcm9taXNlLnRoZW4ocmVzb2x2ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oJy9zbmFwLycgKyBlbmNvZGVVUklDb21wb25lbnQoc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFNvdW5kVm9sdW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuZ2V0U291bmRWb2x1bWUucXVlcnkoKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHNldFNvdW5kVm9sdW1lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zZXRTb3VuZFZvbHVtZS5xdWVyeSh7IHZhbHVlOiB2YWx1ZSB9KS4kcHJvbWlzZTtcbiAgfVxuXG4gIGdldERpc3BsYXlCcmlnaHRuZXNzKCkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuZ2V0RGlzcGxheUJyaWdodG5lc3MucXVlcnkoKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHNldERpc3BsYXlCcmlnaHRuZXNzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zZXREaXNwbGF5QnJpZ2h0bmVzcy5xdWVyeSh7IHZhbHVlOiB2YWx1ZSB9KS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21lZGlhc3RhcnRlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzd2ZvYmplY3QgKi9cblxuICBmdW5jdGlvbiBNZWRpYVN0YXJ0ZXIoaWQpIHtcblxuICAgIHZhciBmbGFzaHZhcnMgPSB7fTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgbWVudTogJ2ZhbHNlJyxcbiAgICAgIHdtb2RlOiAnZGlyZWN0JyxcbiAgICAgIGFsbG93RnVsbFNjcmVlbjogJ2ZhbHNlJ1xuICAgIH07XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBuYW1lOiBpZFxuICAgIH07XG5cbiAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcigndXJsJyksXG4gICAgICBpZCxcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd3aWR0aCcpLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ2hlaWdodCcpLFxuICAgICAgJzE2LjAuMCcsXG4gICAgICAnZXhwcmVzc0luc3RhbGwuc3dmJyxcbiAgICAgIGZsYXNodmFycyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdWNjZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIE1lZGlhU3RhcnRlci5wcm90b3R5cGUuX2dldFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcIyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIiksXG4gICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uaGFzaCk7XG4gICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyB1bmRlZmluZWQgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLk1lZGlhU3RhcnRlciA9IE1lZGlhU3RhcnRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9uYXZpZ2F0aW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk5hdmlnYXRpb25NYW5hZ2VyID0gY2xhc3MgTmF2aWdhdGlvbk1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpIHtcbiAgICB0aGlzLiQkbG9jYXRpb24gPSAkbG9jYXRpb247XG4gICAgdGhpcy4kJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2luZyA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsICgpID0+IHtcbiAgICAgIHZhciBwYXRoID0gc2VsZi4kJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgaWYgKHBhdGggPT09IHNlbGYuX3BhdGgpIHtcbiAgICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BhdGggPSBwYXRoO1xuICAgICAgc2VsZi5fbG9jYXRpb24gPSBzZWxmLmdldExvY2F0aW9uKHBhdGgpO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICAgIHNlbGYubG9jYXRpb25DaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dOYXZpZ2F0aW9uKGxvY2F0aW9uKSk7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3BhdGg7IH1cbiAgc2V0IHBhdGgodmFsdWUpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmluZGV4T2YoJyMnKSxcbiAgICAgICAgcGF0aCA9IGkgIT09IC0xID8gdmFsdWUuc3Vic3RyaW5nKGkgKyAxKSA6IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb24ocGF0aCk7XG4gIH1cblxuICBnZXQgbG9jYXRpb24oKSB7IHJldHVybiB0aGlzLl9sb2NhdGlvbjsgfVxuICBzZXQgbG9jYXRpb24odmFsdWUpIHtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHRoaXMuX2xvY2F0aW9uKTtcblxuICAgIHZhciBwYXRoID0gdGhpcy5fcGF0aCA9IHRoaXMuZ2V0UGF0aCh0aGlzLl9sb2NhdGlvbik7XG4gICAgdGhpcy4kJGxvY2F0aW9uLnBhdGgocGF0aCk7XG4gIH1cblxuICBnZXRQYXRoKGxvY2F0aW9uKSB7XG4gICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnRva2VuKSB7XG4gICAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZSArICcvJyArIGxvY2F0aW9uLnRva2VuO1xuICAgIH1cbiAgICBlbHNlIGlmIChsb2NhdGlvbi51cmwpIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdob21lJykge1xuICAgICAgcmV0dXJuICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZTtcbiAgfVxuXG4gIGdldExvY2F0aW9uKHBhdGgpIHtcbiAgICB2YXIgbWF0Y2ggPSAvXFwvKFxcdyspPyhcXC8oLispKT8vLmV4ZWMocGF0aCk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXRjaFsxXTtcbiAgICAgIHZhciBwYXJhbSA9IG1hdGNoWzNdO1xuXG4gICAgICBpZiAocGFyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB1cmw6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbSkgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB0b2tlbjogcGFyYW0gfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgdHlwZSA9ICdob21lJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSB9O1xuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGdvQmFjaygpIHtcbiAgICBpZiAodGhpcy5sb2NhdGlvbi50eXBlICE9PSAnaG9tZScgJiYgdGhpcy5sb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJykge1xuICAgICAgdGhpcy4kJHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9vcmRlcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5PcmRlck1hbmFnZXIgPSBjbGFzcyBPcmRlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIERhdGFQcm92aWRlciwgRHRzQXBpLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRHRzQXBpID0gRHRzQXBpO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZChnaWZ0U2VhdCA9PiB7XG4gICAgICBpZiAoc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IHNlbGYubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydCA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWdpZnRTZWF0KSB7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5zZWF0cygpLnRoZW4oc2VhdHMgPT4ge1xuICAgICAgc2VsZi5fTG9jYXRpb25Nb2RlbC5zZWF0cyA9IHNlYXRzO1xuICAgICAgc2VsZi5fRHRzQXBpLmxvY2F0aW9uLmdldEN1cnJlbnRTZWF0KCkudGhlbihzZWF0ID0+IHtcbiAgICAgICAgc2VsZi5fTG9jYXRpb25Nb2RlbC5zZWF0ID0gc2VhdDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9PcmRlck1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUik7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFKTtcbiAgICAgIHNlbGYubW9kZWwuY2xlYXJXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VUKTtcblxuICAgICAgc2VsZi5jbGVhckNhcnQoKTtcbiAgICAgIHNlbGYuY2xlYXJDaGVjaygpO1xuICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHt9O1xuXG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENhcnQgYW5kIGNoZWNrc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWRkVG9DYXJ0KGl0ZW0pIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydC5wdXNoKGl0ZW0pO1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm1vZGVsLm9yZGVyQ2FydCk7XG5cbiAgICBpZiAodGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0KSB7XG4gICAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFJlYWR5LmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXJDYXJ0O1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNhcnQoaXRlbSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0ID0gdGhpcy5tb2RlbC5vcmRlckNhcnQuZmlsdGVyKGVudHJ5ID0+IGVudHJ5ICE9PSBpdGVtKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5vcmRlckNhcnQ7XG4gIH1cblxuICBjbGVhckNhcnQoKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQgPSBbXTtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydFN0YXNoID0gW107XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICB9XG5cbiAgY2xlYXJDaGVjayhpdGVtcykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGlmIChpdGVtcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1vZGVsLm9yZGVyQ2hlY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBpdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2hlY2tbaV0gPT09IGl0ZW1zW2pdKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5tb2RlbC5vcmRlckNoZWNrW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubW9kZWwub3JkZXJDaGVjayA9IHJlc3VsdDtcbiAgfVxuXG4gIHN1Ym1pdENhcnQob3B0aW9ucykge1xuICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCAwO1xuXG4gICAgaWYgKHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCkge1xuICAgICAgb3B0aW9ucyB8PSA0O1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIsXG4gICAgICBpdGVtczogdGhpcy5tb2RlbC5vcmRlckNhcnQubWFwKGVudHJ5ID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogZW50cnkuaXRlbS5vcmRlci50b2tlbixcbiAgICAgICAgICBxdWFudGl0eTogZW50cnkucXVhbnRpdHksXG4gICAgICAgICAgbW9kaWZpZXJzOiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdChjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9kaWZpZXIuZGF0YS50b2tlbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIFtdKSk7XG4gICAgICAgICAgfSwgW10pLFxuICAgICAgICAgIG5vdGU6IGVudHJ5Lm5hbWUgfHwgJydcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgICAgdGlja2V0X3Rva2VuOiBzZWxmLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgICAgc2VhdF90b2tlbjogc2VsZi5fQ2hhdE1vZGVsLmdpZnRTZWF0LFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fRHRzQXBpLndhaXRlci5wbGFjZU9yZGVyKHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuaXRlbV90b2tlbnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLml0ZW1fdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydFtpXS5yZXF1ZXN0ID0gcmVzcG9uc2UuaXRlbV90b2tlbnNbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHsgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbiB9O1xuXG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDaGVjayA9IHNlbGYubW9kZWwub3JkZXJDaGVjay5jb25jYXQoc2VsZi5tb2RlbC5vcmRlckNhcnQpO1xuICAgICAgICBzZWxmLmNsZWFyQ2FydCgpO1xuXG4gICAgICAgIHNlbGYuX0NoYXRNb2RlbC5naWZ0U2VhdCA9IG51bGw7XG5cbiAgICAgICAgbGV0IHdhdGNoZXIgPSBzZWxmLl9jcmVhdGVXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSLCByZXNwb25zZSk7XG4gICAgICAgIHJlc29sdmUod2F0Y2hlcik7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdENsb3Nlb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VULFxuICAgICAgdGlja2V0X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5wbGFjZVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLm9yZGVyVGlja2V0ID0geyB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuIH07XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdEFzc2lzdGFuY2UoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSxcbiAgICAgIHRpY2tldF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucGxhY2VSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5fc2F2ZVRpY2tldChyZXNwb25zZSk7XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFLCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQcmljZShlbnRyeSkge1xuICAgIHZhciBtb2RpZmllcnMgPSBlbnRyeS5tb2RpZmllcnMucmVkdWNlKCh0b3RhbCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgIHJldHVybiB0b3RhbCArIGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKHRvdGFsLCBtb2RpZmllcikgPT4ge1xuICAgICAgICByZXR1cm4gdG90YWwgKyAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAgICAgbW9kaWZpZXIuZGF0YS5wcmljZSA6XG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgfSwgMCk7XG4gICAgfSwgMCk7XG5cbiAgICByZXR1cm4gZW50cnkucXVhbnRpdHkgKiAobW9kaWZpZXJzICsgZW50cnkuaXRlbS5vcmRlci5wcmljZSk7XG4gIH1cblxuICBjYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpIHtcbiAgICByZXR1cm4gKGVudHJpZXMgPyBlbnRyaWVzLnJlZHVjZSgodG90YWwsIGVudHJ5KSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyBPcmRlck1hbmFnZXIucHJvdG90eXBlLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgICB9LCAwKSA6IDApO1xuICB9XG5cbiAgY2FsY3VsYXRlVGF4KGVudHJpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpICogdGhpcy5tb2RlbC50YXg7XG4gIH1cblxuICB1cGxvYWRTaWduYXR1cmUoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkudXBsb2FkLnVwbG9hZFRlbXAoZGF0YSwgJ2ltYWdlL3BuZycsICdzaWduYXR1cmUucG5nJylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRva2VuKTtcbiAgfVxuXG4gIGdlbmVyYXRlUGF5bWVudFRva2VuKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9DdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5fQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fRHRzQXBpLmN1c3RvbWVyLmluaXRpYWxpemVQYXltZW50KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuaW5pdGlhbGl6ZVBheW1lbnQoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcGF5T3JkZXIocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXF1ZXN0LnBheW1lbnRfdG9rZW4gPSB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW47XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuc3VibWl0Q2hlY2tvdXRQYXltZW50KHJlcXVlc3QpO1xuICB9XG5cbiAgcmVxdWVzdFJlY2VpcHQocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5yZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KTtcbiAgfVxuXG4gIF9zYXZlVGlja2V0KHJlc3BvbnNlKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlclRpY2tldCA9IHtcbiAgICAgIHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW5cbiAgICB9O1xuICB9XG5cbiAgX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyVGlja2V0ID0ge1xuICAgICAgdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiByZXNwb25zZS50b2tlblxuICAgIH07XG4gIH1cblxuICBfY3JlYXRlV2F0Y2hlcihraW5kLCB0aWNrZXQpIHtcbiAgICBsZXQgd2F0Y2hlciA9IG5ldyBhcHAuUmVxdWVzdFdhdGNoZXIodGlja2V0LCB0aGlzLl9EdHNBcGkpO1xuICAgIHRoaXMubW9kZWwuYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKTtcblxuICAgIHJldHVybiB3YXRjaGVyO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvb3JkZXJtb2RlbC5qc1xuXG53aW5kb3cuYXBwLk9yZGVyTW9kZWwgPSBjbGFzcyBPcmRlck1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLlJFUVVFU1RfS0lORF9PUkRFUiA9IDE7XG4gICAgdGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSA9IDI7XG4gICAgdGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQgPSAzO1xuXG4gICAgdGhpcy5wcmljZUZvcm1hdCA9ICd7MH0nO1xuICAgIHRoaXMudGF4ID0gMDtcblxuICAgIHRoaXMuX29yZGVyQ2FydCA9IFtdO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoID0gW107XG4gICAgdGhpcy5fb3JkZXJDaGVjayA9IFtdO1xuICAgIHRoaXMuX29yZGVyVGlja2V0ID0ge307XG5cbiAgICB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnMgPSB7fTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgICBTaWduYWxzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgdGhpcy5vcmRlckNhcnRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlckNhcnRTdGFzaENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyQ2hlY2tDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlclRpY2tldENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyUmVxdWVzdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICAgIEluaXRpYWxpemF0aW9uXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUNhcnREYXRhKGl0ZW1zKSB7XG4gICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzdG9yZUNhcnREYXRhKGl0ZW1zKSB7XG4gICAgICByZXR1cm4gaXRlbXMubWFwID8gaXRlbXMubWFwKGFwcC5DYXJ0SXRlbS5wcm90b3R5cGUucmVzdG9yZSkgOiBbXTtcbiAgICB9XG5cbiAgICB0aGlzLl9vcmRlckNhcnRTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX2NhcnQnKTtcbiAgICB0aGlzLl9vcmRlckNhcnRTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDYXJ0ID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2FydCk7XG4gICAgICBzZWxmLm9yZGVyQ2FydENoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDYXJ0U3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX2NhcnRfc3Rhc2gnKTtcbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaCA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2FydFN0YXNoKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2FydFN0YXNoU3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJDaGVja1N0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2hlY2snKTtcbiAgICB0aGlzLl9vcmRlckNoZWNrU3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2sgPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNoZWNrQ2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2hlY2spO1xuICAgICAgc2VsZi5vcmRlckNoZWNrQ2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNoZWNrU3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJUaWNrZXRTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX3RpY2tldCcpO1xuICAgIHRoaXMuX29yZGVyVGlja2V0U3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyVGlja2V0ID0gdmFsdWUgfHwge307XG4gICAgICBzZWxmLm9yZGVyVGlja2V0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyVGlja2V0KTtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXRDaGFuZ2VkLmFkZChkYXRhID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJUaWNrZXRTdG9yYWdlLndyaXRlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldCBvcmRlckNhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2FydDtcbiAgfVxuXG4gIHNldCBvcmRlckNhcnQodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNhcnQgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2FydENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNhcnQpO1xuICB9XG5cbiAgZ2V0IG9yZGVyQ2FydFN0YXNoKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNhcnRTdGFzaDtcbiAgfVxuXG4gIHNldCBvcmRlckNhcnRTdGFzaCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNhcnRTdGFzaENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNhcnRTdGFzaCk7XG4gIH1cblxuICBnZXQgb3JkZXJDaGVjaygpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDaGVjaztcbiAgfVxuXG4gIHNldCBvcmRlckNoZWNrKHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDaGVjayA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDaGVja0NoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNoZWNrKTtcbiAgfVxuXG4gIGdldCBvcmRlclRpY2tldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJUaWNrZXQ7XG4gIH1cblxuICBzZXQgb3JkZXJUaWNrZXQodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlclRpY2tldCA9IHZhbHVlIHx8IHt9O1xuICAgIHRoaXMub3JkZXJUaWNrZXRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMub3JkZXJUaWNrZXQpO1xuICB9XG5cbiAgZ2V0IG9yZGVyUmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX09SREVSKTtcbiAgfVxuXG4gIGdldCBhc3Npc3RhbmNlUmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UpO1xuICB9XG5cbiAgZ2V0IGNsb3Nlb3V0UmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVxdWVzdCB3YXRjaGVyc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0V2F0Y2hlcihraW5kKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXTtcbiAgfVxuXG4gIGFkZFdhdGNoZXIoa2luZCwgd2F0Y2hlcikge1xuICAgIHRoaXMuY2xlYXJXYXRjaGVyKGtpbmQpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHdhdGNoZXIucHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChzZWxmLmdldFdhdGNoZXIoa2luZCkgIT09IHdhdGNoZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VsZi5jbGVhcldhdGNoZXIoa2luZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnNba2luZF0gPSB3YXRjaGVyO1xuICAgIHRoaXMuX25vdGlmeUNoYW5nZShraW5kKTtcbiAgfVxuXG4gIGNsZWFyV2F0Y2hlcihraW5kKSB7XG4gICAgdmFyIHdhdGNoZXIgPSB0aGlzLmdldFdhdGNoZXIoa2luZCk7XG5cbiAgICBpZiAod2F0Y2hlcikge1xuICAgICAgd2F0Y2hlci5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXTtcbiAgICB0aGlzLl9ub3RpZnlDaGFuZ2Uoa2luZCk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX25vdGlmeUNoYW5nZShraW5kKSB7XG4gICAgdmFyIHNpZ25hbDtcblxuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9PUkRFUjpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5vcmRlclJlcXVlc3RDaGFuZ2VkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRTpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVDpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc2lnbmFsKSB7XG4gICAgICBzaWduYWwuZGlzcGF0Y2godGhpcy5nZXRXYXRjaGVyKGtpbmQpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9yZXF1ZXN0d2F0Y2hlci5qc1xuXG53aW5kb3cuYXBwLlJlcXVlc3RXYXRjaGVyID0gY2xhc3MgUmVxdWVzdFdhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcih0aWNrZXQsIER0c0FwaSkge1xuICAgIHRoaXMuX3Rva2VuID0gdGlja2V0LnRva2VuO1xuICAgIHRoaXMuX3JlbW90ZSA9IER0c0FwaTtcblxuICAgIHRoaXMuUE9MTElOR19JTlRFUlZBTCA9IDUwMDA7XG5cbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX1BFTkRJTkcgPSAxO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfUkVDRUlWRUQgPSAyO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQgPSAzO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfRVhQSVJFRCA9IDI1NTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBzZWxmLl9zdGF0dXNVcGRhdGVSZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICB0aGlzLl90aWNrZXQgPSB7IHN0YXR1czogMCB9O1xuICAgIHRoaXMuX3dhdGNoU3RhdHVzKCk7XG4gIH1cblxuICBnZXQgdG9rZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rva2VuO1xuICB9XG5cbiAgZ2V0IHRpY2tldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGlja2V0O1xuICB9XG5cbiAgZ2V0IHByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElkKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGlja2V0LnN0YXR1cyA8IHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQpIHtcbiAgICAgIHRoaXMuX3N0YXR1c1VwZGF0ZVJlamVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIF93YXRjaFN0YXR1cygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fdGltZW91dElkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgdmFyIG9uVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHNlbGYuX3JlbW90ZS53YWl0ZXIuZ2V0U3RhdHVzKHNlbGYuX3Rva2VuKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgc2VsZi5fc2V0VGlja2V0KHJlc3BvbnNlKTtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyA9PT0gc2VsZi5SRVFVRVNUX1NUQVRVU19BQ0NFUFRFRCkge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzICE9PSBzZWxmLlJFUVVFU1RfU1RBVFVTX0VYUElSRUQpIHtcbiAgICAgIHNlbGYuX3RpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KG9uVGltZW91dCwgdGhpcy5QT0xMSU5HX0lOVEVSVkFMKTtcbiAgICB9XG4gIH1cblxuICBfc2V0VGlja2V0KHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgPT09IHZhbHVlLnN0YXR1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuX3RpY2tldCA9IHZhbHVlO1xuICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXNzaW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLlNlc3Npb25NYW5hZ2VyID0gY2xhc3MgU2Vzc2lvbk1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgc3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNlc3Npb25TdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5zZXNzaW9uRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwgPSBMb2NhdGlvbk1vZGVsO1xuICAgIHRoaXMuX09yZGVyTW9kZWwgPSBPcmRlck1vZGVsO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfc2VhdF9zZXNzaW9uJyk7XG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBzZWxmLl9zZXNzaW9uID0gZGF0YTtcblxuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHNlbGYuX3N0YXJ0U2Vzc2lvbigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoY3VzdG9tZXIgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICFjdXN0b21lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24uY3VzdG9tZXIgPSBjdXN0b21lci50b2tlbjtcbiAgICAgIHNlbGYuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIXNlYXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zZXNzaW9uLnNlYXQgPSBzZWF0LnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9PcmRlck1vZGVsLm9yZGVyVGlja2V0Q2hhbmdlZC5hZGQodGlja2V0ID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhdGlja2V0IHx8ICF0aWNrZXQudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zZXNzaW9uLnRpY2tldCA9IHRpY2tldC50b2tlbjtcbiAgICAgIHNlbGYuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb247XG4gIH1cblxuICBlbmRTZXNzaW9uKCkge1xuICAgIGlmICghdGhpcy5fc2Vzc2lvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZyhgU2VhdCBzZXNzaW9uICR7dGhpcy5fc2Vzc2lvbi5pZH0gZW5kZWQuYCk7XG5cbiAgICB2YXIgcyA9IHRoaXMuX3Nlc3Npb247XG4gICAgcy5lbmRlZCA9IG5ldyBEYXRlKCk7XG5cbiAgICB0aGlzLl9zZXNzaW9uID0gbnVsbDtcbiAgICB0aGlzLl9zdG9yZS5jbGVhcigpO1xuXG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nU2Vzc2lvbihzKTtcblxuICAgIHRoaXMuc2Vzc2lvbkVuZGVkLmRpc3BhdGNoKHMpO1xuICB9XG5cbiAgZ2V0IGd1ZXN0Q291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb24uZ3Vlc3RfY291bnQgfHwgMTtcbiAgfVxuXG4gIHNldCBndWVzdENvdW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uZ3Vlc3RfY291bnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCA9IHZhbHVlO1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICB9XG5cbiAgZ2V0IHNwZWNpYWxFdmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbi5zcGVjaWFsX2V2ZW50O1xuICB9XG5cbiAgc2V0IHNwZWNpYWxFdmVudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Vzc2lvbi5zcGVjaWFsX2V2ZW50ID0gdmFsdWU7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBfc3RhcnRTZXNzaW9uKCkge1xuICAgIGxldCBzZWF0ID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0O1xuXG4gICAgdGhpcy5fc2Vzc2lvbiA9IHtcbiAgICAgIGlkOiB0aGlzLl9nZW5lcmF0ZUlEKCksXG4gICAgICBzZWF0OiBzZWF0ID8gc2VhdC50b2tlbiA6IHVuZGVmaW5lZCxcbiAgICAgIHBsYXRmb3JtOiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0sXG4gICAgICBzdGFydGVkOiBuZXcgRGF0ZSgpXG4gICAgfTtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZyhgU2VhdCBzZXNzaW9uICR7dGhpcy5fc2Vzc2lvbi5pZH0gc3RhcnRlZC5gKTtcblxuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQuZGlzcGF0Y2godGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBfZ2VuZXJhdGVJRCgpe1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2Vzc2lvbnByb3ZpZGVyLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvblByb3ZpZGVyID0gY2xhc3MgU2Vzc2lvblByb3ZpZGVyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKFNlc3Npb25TZXJ2aWNlLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9TZXNzaW9uU2VydmljZSA9IFNlc3Npb25TZXJ2aWNlO1xuICAgIHRoaXMuX0J1c2luZXNzU2Vzc2lvblN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2FjY2Vzc3Rva2VuJyk7XG4gICAgdGhpcy5fQ3VzdG9tZXJTZXNzaW9uU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXJfYWNjZXNzdG9rZW4nKTtcblxuICAgIHRoaXMuYnVzaW5lc3NTZXNzaW9uRXhwaXJlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY3VzdG9tZXJTZXNzaW9uRXhwaXJlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fYnVzaW5lc3NUb2tlbiA9IG51bGw7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fQnVzaW5lc3NTZXNzaW9uU3RvcmUucmVhZCgpLnRoZW4odG9rZW4gPT4ge1xuICAgICAgaWYgKHRva2VuICYmIHRva2VuLmFjY2Vzc190b2tlbikge1xuICAgICAgICBpZiAodG9rZW4uZXhwaXJlcykge1xuICAgICAgICAgIHZhciBleHBpcmVzID0gbW9tZW50LnVuaXgodG9rZW4uZXhwaXJlcyk7XG5cbiAgICAgICAgICBpZiAoZXhwaXJlcy5pc0FmdGVyKG1vbWVudCgpKSkge1xuICAgICAgICAgICAgc2VsZi5fYnVzaW5lc3NUb2tlbiA9IHRva2VuLmFjY2Vzc190b2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2VsZi5fYnVzaW5lc3NUb2tlbiA9IHRva2VuLmFjY2Vzc190b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGJ1c2luZXNzVG9rZW4oKSB7XG4gICAgdmFyIHRva2VuID0gdGhpcy5fYnVzaW5lc3NUb2tlbjtcblxuICAgIGlmICh0b2tlbiAmJiB0b2tlbi5hY2Nlc3NfdG9rZW4gJiYgdG9rZW4uZXhwaXJlcykge1xuICAgICAgdmFyIGV4cGlyZXMgPSBtb21lbnQudW5peCh0b2tlbi5leHBpcmVzKTtcblxuICAgICAgaWYgKGV4cGlyZXMuaXNCZWZvcmUobW9tZW50KCkpKSB7XG4gICAgICAgIHRoaXMuX2J1c2luZXNzVG9rZW4gPSB0b2tlbiA9IG51bGw7XG4gICAgICAgIHRoaXMuYnVzaW5lc3NTZXNzaW9uRXhwaXJlZC5kaXNwYXRjaCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIGdldEJ1c2luZXNzVG9rZW4oKSB7XG4gICAgaWYgKHRoaXMuX3BlbmRpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGVuZGluZ1Byb21pc2U7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fcGVuZGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHNlbGYuX0J1c2luZXNzU2Vzc2lvblN0b3JlLnJlYWQoKS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbiAmJiB0b2tlbi5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICBpZiAodG9rZW4uZXhwaXJlcykge1xuICAgICAgICAgICAgdmFyIGV4cGlyZXMgPSBtb21lbnQudW5peCh0b2tlbi5leHBpcmVzIC0gMTIwKTtcblxuICAgICAgICAgICAgaWYgKGV4cGlyZXMuaXNBZnRlcihtb21lbnQoKSkpIHtcbiAgICAgICAgICAgICAgc2VsZi5fcGVuZGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0b2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuX3BlbmRpbmdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5fU2Vzc2lvblNlcnZpY2UuZ2V0U2Vzc2lvbigpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHNlbGYuX3BlbmRpbmdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICBzZWxmLl9CdXNpbmVzc1Nlc3Npb25TdG9yZS53cml0ZShkYXRhKTtcbiAgICAgICAgICByZXNvbHZlKGRhdGEuYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHNlbGYuX3BlbmRpbmdQcm9taXNlID0gbnVsbDtcblxuICAgICAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICBzZWxmLl9CdXNpbmVzc1Nlc3Npb25TdG9yZS5jbGVhcigpO1xuICAgICAgICAgICAgc2VsZi5idXNpbmVzc1Nlc3Npb25FeHBpcmVkLmRpc3BhdGNoKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVqZWN0KHsgY29kZTogZS5zdGF0dXMgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdQcm9taXNlO1xuICB9XG5cbiAgZ2V0Q3VzdG9tZXJUb2tlbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5fQ3VzdG9tZXJTZXNzaW9uU3RvcmUucmVhZCgpLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKCF0b2tlbiB8fCAhdG9rZW4uYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b2tlbi5leHBpcmVzKSB7XG4gICAgICAgICAgdmFyIGV4cGlyZXMgPSBtb21lbnQudW5peCh0b2tlbi5leHBpcmVzKTtcblxuICAgICAgICAgIGlmICghZXhwaXJlcy5pc0FmdGVyKG1vbWVudCgpKSkge1xuICAgICAgICAgICAgc2VsZi5fQ3VzdG9tZXJTZXNzaW9uU3RvcmUuY2xlYXIoKTtcbiAgICAgICAgICAgIHNlbGYuY3VzdG9tZXJTZXNzaW9uRXhwaXJlZC5kaXNwYXRjaCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2Vzc2lvbnNlcnZpY2UuanNcblxud2luZG93LmFwcC5TZXNzaW9uU2VydmljZSA9IGNsYXNzIFNlc3Npb25TZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlKSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3Nlc3Npb24nOiAkcmVzb3VyY2UoJy9vYXV0aDIvc25hcC9zZXNzaW9uJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pXG4gICAgfTtcbiAgfVxuXG4gIGdldFNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zZXNzaW9uLnF1ZXJ5KCkuJHByb21pc2U7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zaGVsbG1hbmFnZXIuanNcblxud2luZG93LmFwcC5TaGVsbE1hbmFnZXIgPSBjbGFzcyBTaGVsbE1hbmFnZXIge1xuICBjb25zdHJ1Y3Rvcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIENvbmZpZywgRW52aXJvbm1lbnQsIEhvc3RzKSB7XG4gICAgdGhpcy4kJHNjZSA9ICRzY2U7XG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1NoZWxsTW9kZWwgPSBTaGVsbE1vZGVsO1xuICAgIHRoaXMuX0NvbmZpZyA9IENvbmZpZztcbiAgICB0aGlzLl9FbnZpcm9ubWVudCA9IEVudmlyb25tZW50O1xuICAgIHRoaXMuX0hvc3RzID0gSG9zdHM7XG5cbiAgICB0aGlzLmxvY2FsZSA9IENvbmZpZy5sb2NhbGU7XG4gIH1cblxuICBnZXQgbG9jYWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gIH1cblxuICBzZXQgbG9jYWxlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2xvY2FsZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbG9jYWxlID0gdmFsdWU7XG5cbiAgICB2YXIgZm9ybWF0ID0gJ3swfScsXG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX2xvY2FsZSkge1xuICAgICAgY2FzZSAncm9fTUQnOlxuICAgICAgICBmb3JtYXQgPSAnezB9IExlaSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnemhfTU8nOlxuICAgICAgICBmb3JtYXQgPSAnTU9QJCB7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2VuX1VTJzpcbiAgICAgICAgZm9ybWF0ID0gJyR7MH0nO1xuICAgICAgICBjdXJyZW5jeSA9ICdVU0QnO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl9TaGVsbE1vZGVsLnByaWNlRm9ybWF0ID0gZm9ybWF0O1xuICAgIHRoaXMuX1NoZWxsTW9kZWwuY3VycmVuY3kgPSBjdXJyZW5jeTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLmJhY2tncm91bmRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5iYWNrZ3JvdW5kcyA9IHJlc3BvbnNlLm1haW4ubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwuc2NyZWVuc2F2ZXJzID0gcmVzcG9uc2Uuc2NyZWVuc2F2ZXIubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLnNyY1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwucGFnZUJhY2tncm91bmRzID0gcmVzcG9uc2UucGFnZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lZGlhOiBpdGVtLmJhY2tncm91bmQuc3JjLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBpdGVtLmRlc3RpbmF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5lbGVtZW50cygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHZhciBsYXlvdXQgPSBzZWxmLl9Db25maWcudGhlbWUubGF5b3V0O1xuXG4gICAgICB2YXIgZWxlbWVudHMgPSB7fTtcblxuICAgICAgc3dpdGNoIChsYXlvdXQpIHtcbiAgICAgICAgY2FzZSAnY2xhc3NpYyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2hvbWUnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWhvbWUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NhcnQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNhcnQucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl93YWl0ZXInOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWFzc2lzdGFuY2UucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoZWNrJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1jbG9zZW91dC5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fc3VydmV5Jzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1zdXJ2ZXkucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX2NoYXQnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNoYXQucG5nJylcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnYWxheGllcyc6XG4gICAgICAgICAgZWxlbWVudHMgPSB7XG4gICAgICAgICAgICAnYnV0dG9uX2JhY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWJhY2sucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3JvdGF0ZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tcm90YXRlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9zZXR0aW5ncyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tc2V0dGluZ3MucG5nJyksXG4gICAgICAgICAgICAnbG9jYXRpb25fbG9nbyc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tbG9nby5wbmcnKSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLmVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBlbGVtZW50ID0gcmVzcG9uc2UuZWxlbWVudHNbaV07XG4gICAgICAgIGVsZW1lbnRzW2VsZW1lbnQuc2xvdF0gPSBlbGVtZW50LnNyYztcbiAgICAgIH1cblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICAgIH0pO1xuICB9XG5cbiAgZm9ybWF0UHJpY2UocHJpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbC5wcmljZUZvcm1hdC5yZXBsYWNlKC97KFxcZCspfS9nLCAoKSA9PiBwcmljZS50b0ZpeGVkKDIpKTtcbiAgfVxuXG4gIGdldFBhZ2VCYWNrZ3JvdW5kcyhsb2NhdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsLnBhZ2VCYWNrZ3JvdW5kcy5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICByZXR1cm4gaXRlbS5kZXN0aW5hdGlvbi50eXBlID09PSBsb2NhdGlvbi50eXBlICYmXG4gICAgICAgIChpdGVtLmRlc3RpbmF0aW9uLnRva2VuID09PSBsb2NhdGlvbi50b2tlbiAmJiBsb2NhdGlvbi50b2tlbiB8fFxuICAgICAgICAgaXRlbS5kZXN0aW5hdGlvbi51cmwgPT09IGxvY2F0aW9uLnVybCAmJiBsb2NhdGlvbi51cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0QXNzZXRVcmwoZmlsZSkge1xuICAgIHZhciBob3N0ID0gdGhpcy5fSG9zdHMuc3RhdGljLmhvc3QgP1xuICAgICAgYC8vJHt0aGlzLl9Ib3N0cy5zdGF0aWMuaG9zdH0ke3RoaXMuX0hvc3RzLnN0YXRpYy5wYXRofWAgOlxuICAgICAgJyc7XG5cbiAgICByZXR1cm4gdGhpcy4kJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoYCR7aG9zdH0vYXNzZXRzLyR7dGhpcy5fQ29uZmlnLnRoZW1lLmxheW91dH0vJHtmaWxlfWApO1xuICB9XG5cbiAgZ2V0UGFydGlhbFVybChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXNzZXRVcmwoYHBhcnRpYWxzLyR7bmFtZX0uaHRtbGApO1xuICB9XG5cbiAgZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikge1xuICAgIGlmICghbWVkaWEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWVkaWEgPT09ICdzdHJpbmcnIHx8IG1lZGlhIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICBpZiAobWVkaWEuc3Vic3RyaW5nKDAsIDQpICE9PSAnaHR0cCcgJiYgbWVkaWEuc3Vic3RyaW5nKDAsIDIpICE9PSAnLy8nKSB7XG4gICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbiB8fCAnanBnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7dGhpcy5fSG9zdHMubWVkaWEuaG9zdH1gICtcbiAgICAgICAgICBgL21lZGlhLyR7bWVkaWF9XyR7d2lkdGh9XyR7aGVpZ2h0fS4ke2V4dGVuc2lvbn1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lZGlhO1xuICAgIH1cblxuICAgIGlmICghbWVkaWEudG9rZW4pIHtcbiAgICAgIHJldHVybiBtZWRpYTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlKG1lZGlhKTtcbiAgICB2YXIgdXJsID0gYCR7d2luZG93LmxvY2F0aW9uLnByb3RvY29sfS8vJHt0aGlzLl9Ib3N0cy5tZWRpYS5ob3N0fS9tZWRpYS8ke21lZGlhLnRva2VufWA7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndmlkZW8nKSB7XG4gICAgICB1cmwgKz0gJy53ZWJtJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ZsYXNoJykge1xuICAgICAgdXJsICs9ICcuc3dmJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJykge1xuICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICB1cmwgKz0gJ18nICsgd2lkdGggKyAnXycgKyBoZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgdXJsICs9ICcuJyArIGV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAobWVkaWEubWltZV90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaW1hZ2UvcG5nJzpcbiAgICAgICAgICAgIHVybCArPSAnLnBuZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdXJsICs9ICcuanBnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHVybCk7XG4gIH1cblxuICBnZXRNZWRpYVR5cGUobWVkaWEpIHtcbiAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICdpbWFnZScpe1xuICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiAndmlkZW8nO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS5taW1lX3R5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcpIHtcbiAgICAgIHJldHVybiAnZmxhc2gnO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgdGlsZVN0eWxlKCkge1xuICAgIHZhciBzdHlsZSA9ICd0aWxlJztcblxuICAgIHN3aXRjaCAodGhpcy5fQ29uZmlnLnRoZW1lLnRpbGVzX3N0eWxlKSB7XG4gICAgICBjYXNlICdyZWd1bGFyJzpcbiAgICAgICAgc3R5bGUgKz0gJyB0aWxlLXJlZ3VsYXInO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9zdHlsZSArPSAnIHRpbGUtcmVndWxhcic7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG5cbiAgZ2V0IHByZWRpY2F0ZUV2ZW4oKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICByZXR1cm4gKCkgPT4gaW5kZXgrKyAlIDIgPT09IDE7XG4gIH1cblxuICBnZXQgcHJlZGljYXRlT2RkKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuICgpID0+IGluZGV4KysgJSAyID09PSAwO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2hlbGxtb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTW9kZWwgPSBjbGFzcyBTaGVsbE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IFtdO1xuICAgIHRoaXMuYmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gW107XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fcGFnZUJhY2tncm91bmRzID0gW107XG4gICAgdGhpcy5wYWdlQmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmVsZW1lbnRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jdXJyZW5jeSA9ICcnO1xuICAgIHRoaXMuY3VycmVuY3lDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgYmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRzO1xuICB9XG5cbiAgc2V0IGJhY2tncm91bmRzKHZhbHVlKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLmJhY2tncm91bmRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgc2NyZWVuc2F2ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JlZW5zYXZlcnM7XG4gIH1cblxuICBzZXQgc2NyZWVuc2F2ZXJzKHZhbHVlKSB7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gdmFsdWU7XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYWdlQmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcztcbiAgfVxuXG4gIHNldCBwYWdlQmFja2dyb3VuZHModmFsdWUpIHtcbiAgICB0aGlzLl9wYWdlQmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLnBhZ2VCYWNrZ3JvdW5kc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcbiAgfVxuXG4gIHNldCBlbGVtZW50cyh2YWx1ZSkge1xuICAgIHRoaXMuX2VsZW1lbnRzID0gdmFsdWU7XG4gICAgdGhpcy5lbGVtZW50c0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHByaWNlRm9ybWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9wcmljZUZvcm1hdDtcbiAgfVxuXG4gIHNldCBwcmljZUZvcm1hdCh2YWx1ZSkge1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gdmFsdWU7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbmN5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW5jeTtcbiAgfVxuXG4gIHNldCBjdXJyZW5jeSh2YWx1ZSkge1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gdmFsdWU7XG4gICAgdGhpcy5jdXJyZW5jeUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc29jaWFsbWFuYWdlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLyogZ2xvYmFsIFVSSSAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2NpYWxNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvY2lhbE1hbmFnZXIgPSBmdW5jdGlvbihTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9XZWJCcm93c2VyID0gV2ViQnJvd3NlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH07XG5cbiAgd2luZG93LmFwcC5Tb2NpYWxNYW5hZ2VyID0gU29jaWFsTWFuYWdlcjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIExvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5sb2dpbkZhY2Vib29rID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmYWNlYm9va0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5mYWNlYm9va19hcHBsaWNhdGlvbixcbiAgICAgICAgY3VzdG9tZXJBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuY3VzdG9tZXJfYXBwbGljYXRpb247XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBGYWNlYm9vazogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBmYWNlYm9va0F1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGZhY2Vib29rQXV0aC5lcnJvciB8fCAhZmFjZWJvb2tBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayBlcnJvcjogJyArIGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBGYWNlYm9vayh7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyBjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBGYWNlYm9vay4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2RpYWxvZy9vYXV0aCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2NsaWVudF9pZCcsIGZhY2Vib29rQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ3Rva2VuJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc2NvcGUnLCAncHVibGljX3Byb2ZpbGUsZW1haWwnKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Hb29nbGVQbHVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBnb29nbGVwbHVzQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50Lmdvb2dsZXBsdXNfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHN0YXRlID0gc2VsZi5fZ2VuZXJhdGVUb2tlbigpO1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBHb29nbGU6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZihnb29nbGVwbHVzQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZ29vZ2xlcGx1c0F1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoZ29vZ2xlcGx1c0F1dGguZXJyb3IgfHwgIWdvb2dsZXBsdXNBdXRoLmNvZGUgfHwgZ29vZ2xlcGx1c0F1dGguc3RhdGUgIT09IHN0YXRlKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayBlcnJvcjogJyArIGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZ29vZ2xlcGx1c0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGNhbGxiYWNrIHJlY2VpdmVkLicpO1xuXG4gICAgICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcEdvb2dsZVBsdXMoe1xuICAgICAgICAgICAgY29kZTogZ29vZ2xlcGx1c0F1dGguY29kZSxcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbih0aWNrZXQpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBsb2dpbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgIHJlc29sdmUoY3VzdG9tZXJBdXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLmFkZChvbk5hdmlnYXRlZCk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9nZ2luZyBpbiB3aXRoIEdvb2dsZS4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBnb29nbGVwbHVzQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Jlc3BvbnNlX3R5cGUnLCAnY29kZScpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvcGx1cy5sb2dpbiBlbWFpbCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2FjY2Vzc190eXBlJywgJ29mZmxpbmUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzdGF0ZScsIHN0YXRlKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Ud2l0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0d2l0dGVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LnR3aXR0ZXJfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHRva2VuU2VjcmV0O1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBUd2l0dGVyOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKHR3aXR0ZXJBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciB0d2l0dGVyQXV0aCA9IFVSSSh1cmwpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmICh0d2l0dGVyQXV0aC5lcnJvciB8fCAhdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayBlcnJvcjogJyArIHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QodHdpdHRlckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBUd2l0dGVyKHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbjogdHdpdHRlckF1dGgub2F1dGhfdG9rZW4sXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3NlY3JldDogdG9rZW5TZWNyZXQsXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3ZlcmlmaWVyOiB0d2l0dGVyQXV0aC5vYXV0aF92ZXJpZmllclxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgc2lnbmluIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VsZi5fRHRzQXBpLm9hdXRoMi5nZXRBdXRoQ29uZmlybVVybCh0aWNrZXQudGlja2V0X2lkLCB7XG4gICAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgICByZXNwb25zZV90eXBlOiAndG9rZW4nLFxuICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodXJsLmluZGV4T2YoY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBjdXN0b21lckF1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGN1c3RvbWVyQXV0aC5lcnJvciB8fCAhY3VzdG9tZXJBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBUd2l0dGVyLicpO1xuXG4gICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlclJlcXVlc3RUb2tlbih7XG4gICAgICAgIG9hdXRoX2NhbGxiYWNrOiB0d2l0dGVyQXBwLnJlZGlyZWN0X3VybFxuICAgICAgfSkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICB2YXIgdXJsID0gVVJJKCdodHRwczovL2FwaS50d2l0dGVyLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdvYXV0aF90b2tlbicsIHRva2VuLm9hdXRoX3Rva2VuKVxuICAgICAgICAuYWRkU2VhcmNoKCdmb3JjZV9sb2dpbicsICd0cnVlJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHJlcXVlc3QgdG9rZW4gcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgdG9rZW5TZWNyZXQgPSB0b2tlbi5vYXV0aF90b2tlbl9zZWNyZXQ7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEhlbHBlcnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLl9nZW5lcmF0ZVRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH07XG5cbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zb2NrZXRjbGllbnQuanNcblxud2luZG93LmFwcC5Tb2NrZXRDbGllbnQgPSBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBjb25zdHJ1Y3RvcihTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX1Nlc3Npb25Qcm92aWRlciA9IFNlc3Npb25Qcm92aWRlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0Q2x1c3Rlci5jb25uZWN0KHtcbiAgICAgIHBhdGg6ICcvc29ja2V0cy8nLFxuICAgICAgcG9ydDogODA4MFxuICAgIH0pO1xuICAgIHRoaXMuX3NvY2tldC5vbignY29ubmVjdCcsIHN0YXR1cyA9PiB7XG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYFNvY2tldCBjb25uZWN0ZWQuYCk7XG4gICAgICBzZWxmLl9hdXRoZW50aWNhdGUoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYFNvY2tldCBkaXNjb25uZWN0ZWQuYCk7XG4gICAgICBzZWxmLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2goc2VsZi5pc0Nvbm5lY3RlZCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgc3Vic2NyaWJlKHRvcGljLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5fZ2V0Q2hhbm5lbCh0b3BpYykud2F0Y2goaGFuZGxlcik7XG4gIH1cblxuICBzZW5kKHRvcGljLCBkYXRhKSB7XG4gICAgdGhpcy5fZ2V0Q2hhbm5lbCh0b3BpYykucHVibGlzaChkYXRhKTtcbiAgfVxuXG4gIF9nZXRDaGFubmVsKHRvcGljKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYW5uZWxzW3RvcGljXSB8fCAodGhpcy5fY2hhbm5lbHNbdG9waWNdID0gdGhpcy5fc29ja2V0LnN1YnNjcmliZSh0b3BpYykpO1xuICB9XG5cbiAgX2F1dGhlbnRpY2F0ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fU2Vzc2lvblByb3ZpZGVyLmdldEJ1c2luZXNzVG9rZW4oKS50aGVuKHRva2VuID0+IHtcbiAgICAgIHNlbGYuX3NvY2tldC5lbWl0KCdhdXRoZW50aWNhdGUnLCB7XG4gICAgICAgIGFjY2Vzc190b2tlbjogdG9rZW5cbiAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIud2FybihgVW5hYmxlIHRvIGF1dGhlbnRpY2F0ZSBzb2NrZXQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmlzQ29ubmVjdGVkKTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLndhcm4oYFVuYWJsZSB0byBwZXJmb3JtIHNvY2tldCBhdXRoZW50aWNhdGlvbjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zb2Z0d2FyZW1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2Z0d2FyZU1hbmFnZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgU29mdHdhcmVNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29mdHdhcmVNYW5hZ2VyID0gU29mdHdhcmVNYW5hZ2VyO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAnY3VycmVudFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXR0ZXJuID0gLyhTTkFQKVxcLyhbMC05Ll0rKS8sXG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuICc4LjguOC44JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICdyZXF1aXJlZFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucmVxdWlyZW1lbnRzW3RoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybV07XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ3VwZGF0ZVJlcXVpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmVyc2lvbkNvbXBhcmUodGhpcy5jdXJyZW50VmVyc2lvbiwgdGhpcy5yZXF1aXJlZFZlcnNpb24pID09PSAtMTtcbiAgICB9XG4gIH0pO1xuXG4gIFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUuX3ZlcnNpb25Db21wYXJlID0gZnVuY3Rpb24odjEsIHYyLCBvcHRpb25zKSB7XG4gICAgaWYgKCF2MSB8fCAhdjIpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBsZXhpY29ncmFwaGljYWwgPSBvcHRpb25zICYmIG9wdGlvbnMubGV4aWNvZ3JhcGhpY2FsLFxuICAgICAgICB6ZXJvRXh0ZW5kID0gb3B0aW9ucyAmJiBvcHRpb25zLnplcm9FeHRlbmQsXG4gICAgICAgIHYxcGFydHMgPSB2MS5zcGxpdCgnLicpLFxuICAgICAgICB2MnBhcnRzID0gdjIuc3BsaXQoJy4nKTtcblxuICAgIGZ1bmN0aW9uIGlzVmFsaWRQYXJ0KHgpIHtcbiAgICAgIHJldHVybiAobGV4aWNvZ3JhcGhpY2FsID8gL15cXGQrW0EtWmEtel0qJC8gOiAvXlxcZCskLykudGVzdCh4KTtcbiAgICB9XG5cbiAgICBpZiAoIXYxcGFydHMuZXZlcnkoaXNWYWxpZFBhcnQpIHx8ICF2MnBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSkge1xuICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG5cbiAgICBpZiAoemVyb0V4dGVuZCkge1xuICAgICAgd2hpbGUgKHYxcGFydHMubGVuZ3RoIDwgdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjFwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodjJwYXJ0cy5sZW5ndGggPCB2MXBhcnRzLmxlbmd0aCkge1xuICAgICAgICB2MnBhcnRzLnB1c2goJzAnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWxleGljb2dyYXBoaWNhbCkge1xuICAgICAgdjFwYXJ0cyA9IHYxcGFydHMubWFwKE51bWJlcik7XG4gICAgICB2MnBhcnRzID0gdjJwYXJ0cy5tYXAoTnVtYmVyKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHYxcGFydHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh2MnBhcnRzLmxlbmd0aCA9PT0gaSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKHYxcGFydHNbaV0gPT09IHYycGFydHNbaV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2MXBhcnRzW2ldID4gdjJwYXJ0c1tpXSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHYxcGFydHMubGVuZ3RoICE9PSB2MnBhcnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL3N0b3JlLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RvcmVcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgU3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gbnVsbDtcbiAgfTtcblxuICB3aW5kb3cuYXBwLlN0b3JlID0gU3RvcmU7XG5cbiAgU3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IG51bGw7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlc29sdmUoc2VsZi5fc3RvcmFnZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5fc3RvcmFnZSA9IHZhbHVlO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL3N0b3JlLmxvY2Fsc3RvcmFnZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIExvY2FsU3RvcmFnZVN0b3JlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIExvY2FsU3RvcmFnZVN0b3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgICBhcHAuU3RvcmUuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9pZCA9IGlkO1xuICB9O1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoYXBwLlN0b3JlLnByb3RvdHlwZSk7XG5cbiAgTG9jYWxTdG9yYWdlU3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgc3RvcmUucmVtb3ZlKHRoaXMuX2lkKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG5cbiAgTG9jYWxTdG9yYWdlU3RvcmUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHN0b3JlLmdldCh0aGlzLl9pZCkpO1xuICB9O1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHRoaXMuX2lkLCB2YWx1ZSk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuTG9jYWxTdG9yYWdlU3RvcmUgPSBMb2NhbFN0b3JhZ2VTdG9yZTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zdXJ2ZXltYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TWFuYWdlciA9IGNsYXNzIFN1cnZleU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG5cbiAgICBpZiAodGhpcy5fU3VydmV5TW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLl9EYXRhUHJvdmlkZXIuc3VydmV5cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNlbGYuX1N1cnZleU1vZGVsLmZlZWRiYWNrU3VydmV5ID0gZGF0YS5zdXJ2ZXlzWzBdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TdXJ2ZXlNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHNlbGYuX1N1cnZleU1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgICBzZWxmLl9TdXJ2ZXlNb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3N1cnZleW1vZGVsLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TW9kZWwgPSBjbGFzcyBTdXJ2ZXlNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBCb29sZWFuKENvbmZpZy5zdXJ2ZXlzKTtcbiAgICB0aGlzLl9zdXJ2ZXlzID0ge307XG5cbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zdXJ2ZXknKTtcblxuICAgIHRoaXMuX2ZlZWRiYWNrU3VydmV5ID0gbnVsbDtcbiAgICB0aGlzLmZlZWRiYWNrU3VydmV5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5zdXJ2ZXlDb21wbGV0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX3N0b3JlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYuX3N1cnZleXMgPSB2YWx1ZSB8fCBzZWxmLl9zdXJ2ZXlzO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9pc0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGZlZWRiYWNrU3VydmV5KCkge1xuICAgIHJldHVybiB0aGlzLl9mZWVkYmFja1N1cnZleTtcbiAgfVxuXG4gIHNldCBmZWVkYmFja1N1cnZleSh2YWx1ZSkge1xuICAgIHRoaXMuX2ZlZWRiYWNrU3VydmV5ID0gdmFsdWU7XG4gICAgdGhpcy5mZWVkYmFja1N1cnZleUNoYW5nZWQuZGlzcGF0Y2godGhpcy5fZmVlZGJhY2tTdXJ2ZXkpO1xuICB9XG5cbiAgZ2V0IGZlZWRiYWNrU3VydmV5Q29tcGxldGUoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fc3VydmV5cy5mZWVkYmFjayk7XG4gIH1cblxuICBzZXQgZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSh2YWx1ZSkge1xuICAgIHRoaXMuX3N1cnZleXMuZmVlZGJhY2sgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zdXJ2ZXlzKTtcblxuICAgIHRoaXMuc3VydmV5Q29tcGxldGVkLmRpc3BhdGNoKHRoaXMuZmVlZGJhY2tTdXJ2ZXkpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvdGVsZW1ldHJ5c2VydmljZS5qc1xuXG53aW5kb3cuYXBwLlRlbGVtZXRyeVNlcnZpY2UgPSBjbGFzcyBUZWxlbWV0cnlTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlKSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3N1Ym1pdFRlbGVtZXRyeSc6ICRyZXNvdXJjZSgnL3NuYXAvdGVsZW1ldHJ5Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KSxcbiAgICAgICdzdWJtaXRMb2dzJzogJHJlc291cmNlKCcvc25hcC9sb2dzJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KVxuICAgIH07XG4gIH1cblxuICBzdWJtaXRUZWxlbWV0cnkoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0VGVsZW1ldHJ5LnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG5cbiAgc3VibWl0TG9ncyhkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zdWJtaXRMb2dzLnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvd2ViYnJvd3Nlci5qc1xuXG53aW5kb3cuYXBwLldlYkJyb3dzZXIgPSBjbGFzcyBXZWJCcm93c2VyIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMsIFVSSSAqL1xuXG4gIGNvbnN0cnVjdG9yKCR3aW5kb3csIEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpIHtcbiAgICB0aGlzLiQkd2luZG93ID0gJHdpbmRvdztcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5fbG9jYWxIb3N0cyA9IE9iamVjdC5rZXlzKFNOQVBIb3N0cykubWFwKHAgPT4gU05BUEhvc3RzW3BdLmhvc3QpO1xuICAgIHRoaXMuX2xvY2FsSG9zdHMucHVzaCgnbG9jYWxob3N0Jyk7XG5cbiAgICB0aGlzLm9uT3BlbiA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DbG9zZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGdldCBpc0V4dGVybmFsKCkge1xuICAgIHJldHVybiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gIT09ICd3ZWInO1xuICB9XG5cbiAgbmF2aWdhdGVkKHVybCkge1xuICAgIHRoaXMub25OYXZpZ2F0ZWQuZGlzcGF0Y2godXJsKTtcblxuICAgIGxldCBob3N0ID0gVVJJKHVybCkuaG9zdG5hbWUoKTtcblxuICAgIGlmICh0aGlzLl9sb2NhbEhvc3RzLmluZGV4T2YoaG9zdCkgPT09IC0xKSB7XG4gICAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dVcmwodXJsKTtcbiAgICB9XG4gIH1cblxuICBvcGVuKHVybCkge1xuICAgIGlmICh0aGlzLmlzRXh0ZXJuYWwpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLm9wZW5Ccm93c2VyKHVybCk7XG4gICAgfVxuXG4gICAgdGhpcy5vbk9wZW4uZGlzcGF0Y2godXJsKTtcbiAgICB0aGlzLl9icm93c2VyT3BlbmVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLl9icm93c2VyT3BlbmVkKSB7XG4gICAgICBpZiAodGhpcy5pc0V4dGVybmFsKSB7XG4gICAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLmNsb3NlQnJvd3NlcigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9uQ2xvc2UuZGlzcGF0Y2goKTtcbiAgICAgIHRoaXMuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRBcHBVcmwodXJsKSB7XG4gICAgdmFyIGhvc3QgPSB0aGlzLiQkd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHRoaXMuJCR3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgK1xuICAgICAgKHRoaXMuJCR3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHRoaXMuJCR3aW5kb3cubG9jYXRpb24ucG9ydDogJycpO1xuICAgIHJldHVybiBob3N0ICsgdXJsO1xuICB9XG59O1xuXG4vL3NyYy9qcy9hcHBzLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gX3N0YXRpY0hvc3RSZWdleChTTkFQX0hPU1RTX0NPTkZJRykge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCcuKicgKyBTTkFQX0hPU1RTX0NPTkZJRy5zdGF0aWMgKyAnLionKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9nZXRQYXJ0aWFsVXJsKFNOQVBfQ09ORklHLCBTTkFQX0hPU1RTX0NPTkZJRywgU05BUF9FTlZJUk9OTUVOVCwgbmFtZSkge1xuICAgIHZhciBob3N0ID0gU05BUF9IT1NUU19DT05GSUcuc3RhdGljLmhvc3QgP1xuICAgICAgYC8vJHtTTkFQX0hPU1RTX0NPTkZJRy5zdGF0aWMuaG9zdH0ke1NOQVBfSE9TVFNfQ09ORklHLnN0YXRpYy5wYXRofWAgOlxuICAgICAgJyc7XG5cbiAgICByZXR1cm4gYCR7aG9zdH0vYXNzZXRzLyR7U05BUF9DT05GSUcudGhlbWUubGF5b3V0fS9wYXJ0aWFscy8ke25hbWV9Lmh0bWxgO1xuICB9XG5cbiAgYW5ndWxhci5tb2R1bGUoJ1NOQVBBcHBsaWNhdGlvbicsIFtcbiAgICAnbmdSb3V0ZScsXG4gICAgJ25nQW5pbWF0ZScsXG4gICAgJ25nVG91Y2gnLFxuICAgICduZ1Nhbml0aXplJyxcbiAgICAnU05BUC5jb25maWdzJyxcbiAgICAnU05BUC5jb250cm9sbGVycycsXG4gICAgJ1NOQVAuZGlyZWN0aXZlcycsXG4gICAgJ1NOQVAuZmlsdGVycycsXG4gICAgJ1NOQVAuc2VydmljZXMnXG4gIF0pLlxuICBjb25maWcoXG4gICAgWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsICckc2NlRGVsZWdhdGVQcm92aWRlcicsICdTTkFQQ29uZmlnJywgJ1NOQVBIb3N0cycsICdTTkFQRW52aXJvbm1lbnQnLFxuICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIsICRzY2VEZWxlZ2F0ZVByb3ZpZGVyLCBTTkFQQ29uZmlnLCBTTkFQSG9zdHMsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICAgdmFyIGdldFBhcnRpYWxVcmwgPSBuYW1lID0+IF9nZXRQYXJ0aWFsVXJsKFNOQVBDb25maWcsIFNOQVBIb3N0cywgU05BUEVudmlyb25tZW50LCBuYW1lKSxcbiAgICAgICAgc3RhdGljSG9zdFJlZ2V4ID0gKCkgPT4gX3N0YXRpY0hvc3RSZWdleChTTkFQSG9zdHMpO1xuXG4gICAgaWYgKFNOQVBIb3N0cy5zdGF0aWMuaG9zdCkge1xuICAgICAgJHNjZURlbGVnYXRlUHJvdmlkZXIucmVzb3VyY2VVcmxXaGl0ZWxpc3QoWydzZWxmJywgc3RhdGljSG9zdFJlZ2V4KCldKTtcbiAgICB9XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoZmFsc2UpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0hvbWVCYXNlQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL21lbnUvOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnTWVudUJhc2VDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2F0ZWdvcnkvOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnQ2F0ZWdvcnlCYXNlQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2l0ZW0vOnRva2VuJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnSXRlbUJhc2VDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvdXJsLzp1cmwnLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdVcmxDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hlY2tvdXQnLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdjaGVja291dCcpLCBjb250cm9sbGVyOiAnQ2hlY2tvdXRDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvc2lnbmluJywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnc2lnbmluJyksIGNvbnRyb2xsZXI6ICdTaWduSW5DdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvYWNjb3VudCcsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2FjY291bnQnKSwgY29udHJvbGxlcjogJ0FjY291bnRDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hhdCcsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2NoYXQnKSwgY29udHJvbGxlcjogJ0NoYXRDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvY2hhdG1hcCcsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2NoYXRtYXAnKSwgY29udHJvbGxlcjogJ0NoYXRNYXBDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvc3VydmV5JywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnc3VydmV5JyksIGNvbnRyb2xsZXI6ICdTdXJ2ZXlDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoeyByZWRpcmVjdFRvOiAnLycgfSk7XG4gIH1dKTtcblxuICBhbmd1bGFyLm1vZHVsZSgnU05BUFN0YXJ0dXAnLCBbXG4gICAgJ25nUm91dGUnLFxuICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAnU05BUC5zZXJ2aWNlcydcbiAgXSkuXG4gIGNvbmZpZygoKSA9PiB7fSk7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ1NOQVBBdXhpbGlhcmVzJywgW1xuICAgICduZ1JvdXRlJyxcbiAgICAnbmdBbmltYXRlJyxcbiAgICAnbmdUb3VjaCcsXG4gICAgJ25nU2FuaXRpemUnLFxuICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAnU05BUC5zZXJ2aWNlcydcbiAgXSkuXG4gIGNvbmZpZyhcbiAgICBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyRyb3V0ZVByb3ZpZGVyJywgJ1NOQVBDb25maWcnLCAnU05BUEhvc3RzJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlciwgU05BUENvbmZpZywgU05BUEhvc3RzLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAgIHZhciBnZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBfZ2V0UGFydGlhbFVybChTTkFQQ29uZmlnLCBTTkFQSG9zdHMsIFNOQVBFbnZpcm9ubWVudCwgbmFtZSk7XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoZmFsc2UpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2NoYXRyb29tJyksIGNvbnRyb2xsZXI6ICdDaGF0Um9vbUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7IHJlZGlyZWN0VG86ICcvJyB9KTtcbiAgfV0pO1xufSkoKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvX2Jhc2UuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnLCBbJ2FuZ3VsYXItYmFjb24nXSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2FjY291bnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgWyckc2NvcGUnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsIEN1c3RvbWVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENvbnN0YW50c1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQcm9maWxlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJvZmlsZSA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlO1xuICAkc2NvcGUuY2FuQ2hhbmdlUGFzc3dvcmQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gIHZhciBwcm9maWxlID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3Byb2ZpbGUnKTtcblxuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgJHNjb3BlLnByb2ZpbGUgPSB2YWx1ZTtcbiAgICAkc2NvcGUuY2FuQ2hhbmdlUGFzc3dvcmQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gICAgJHNjb3BlLmNhbkNoYW5nZUVtYWlsID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFNwbGFzaCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5lZGl0UHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9maWxlZWRpdCA9IGFuZ3VsYXIuY29weSgkc2NvcGUucHJvZmlsZSk7XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmVkaXRQYXNzd29yZCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wYXNzd29yZGVkaXQgPSB7XG4gICAgICBvbGRfcGFzc3dvcmQ6ICcnLFxuICAgICAgbmV3X3Bhc3N3b3JkOiAnJ1xuICAgIH07XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZWRpdFBheW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1BheW1lbnRFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFByb2ZpbGUgZWRpdCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wcm9maWxlRWRpdFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIudXBkYXRlUHJvZmlsZSgkc2NvcGUucHJvZmlsZWVkaXQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucHJvZmlsZUVkaXRDYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYXNzd29yZCBlZGl0IHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhc3N3b3JkRWRpdFN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIuY2hhbmdlUGFzc3dvcmQoJHNjb3BlLnBhc3N3b3JkZWRpdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IGZhbHNlO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRFZGl0Q2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSBmYWxzZTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvYmFja2dyb3VuZC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQmFja2dyb3VuZEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG5cbiAgZnVuY3Rpb24gc2hvd0ltYWdlcyh2YWx1ZXMpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pbWFnZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0ubWVkaWEsIDE5MjAsIDEwODAsICdqcGcnKSxcbiAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGl0ZW0ubWVkaWEpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBiYWNrZ3JvdW5kcyA9IFNoZWxsTWFuYWdlci5tb2RlbC5iYWNrZ3JvdW5kcyxcbiAgICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG51bGw7XG5cbiAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5iYWNrZ3JvdW5kc0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICBiYWNrZ3JvdW5kcyA9IHZhbHVlO1xuICAgIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgdmFyIG5ld1BhZ2VCYWNrZ3JvdW5kcyA9IFNoZWxsTWFuYWdlci5nZXRQYWdlQmFja2dyb3VuZHMobG9jYXRpb24pO1xuXG4gICAgaWYgKG5ld1BhZ2VCYWNrZ3JvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBwYWdlQmFja2dyb3VuZHMgPSBuZXdQYWdlQmFja2dyb3VuZHM7XG4gICAgICBzaG93SW1hZ2VzKHBhZ2VCYWNrZ3JvdW5kcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHBhZ2VCYWNrZ3JvdW5kcykge1xuICAgICAgc3dpdGNoIChsb2NhdGlvbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21lbnUnOlxuICAgICAgICBjYXNlICdjYXRlZ29yeSc6XG4gICAgICAgIGNhc2UgJ2l0ZW0nOlxuICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYWdlQmFja2dyb3VuZHMgPSBudWxsO1xuICAgIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2FydC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2FydEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICckc2NlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnQ2hhdE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgJHNjZSwgQ3VzdG9tZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIENhcnRNb2RlbCwgTG9jYXRpb25Nb2RlbCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuICAkc2NvcGUub3B0aW9ucyA9IHt9O1xuXG4gICRzY29wZS5zdGF0ZSA9IENhcnRNb2RlbC5jYXJ0U3RhdGU7XG4gIENhcnRNb2RlbC5jYXJ0U3RhdGVDaGFuZ2VkLmFkZChzdGF0ZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RhdGUgPSBzdGF0ZSkpO1xuXG4gICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IHZhbHVlKTtcblxuICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja0NoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSB0cnVlO1xuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gdHJ1ZTtcbiAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgJHNjb3BlLnZpc2libGUgPSBDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgICAkc2NvcGUudmlzaWJsZSA9IHZhbHVlO1xuICB9KTtcblxuICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID9cbiAgICBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6XG4gICAgJ1RhYmxlJztcblxuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+ICRzY29wZS5zZWF0X25hbWUgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJyk7XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QgPT0gbnVsbDtcbiAgfTtcbiAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgPT0gbnVsbDtcbiAgfTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuICByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLmNhbGN1bGF0ZURlc2NyaXB0aW9uID0gZW50cnkgPT4ge1xuICAgIHZhciByZXN1bHQgPSBlbnRyeS5uYW1lIHx8IGVudHJ5Lml0ZW0udGl0bGU7XG5cbiAgICByZXN1bHQgKz0gZW50cnkubW9kaWZpZXJzLnJlZHVjZSgob3V0cHV0LCBjYXRlZ29yeSkgPT4ge1xuICAgICAgcmV0dXJuIG91dHB1dCArIGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKG91dHB1dCwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIG91dHB1dCArIChtb2RpZmllci5pc1NlbGVjdGVkID9cbiAgICAgICAgICAnPGJyLz4tICcgKyBtb2RpZmllci5kYXRhLnRpdGxlIDpcbiAgICAgICAgICAnJyk7XG4gICAgICB9LCAnJyk7XG4gICAgfSwgJycpO1xuXG4gICAgcmV0dXJuICRzY2UudHJ1c3RBc0h0bWwocmVzdWx0KTtcbiAgfTtcblxuICAkc2NvcGUuY2FsY3VsYXRlUHJpY2UgPSBlbnRyeSA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgJHNjb3BlLmVkaXRJdGVtID0gZW50cnkgPT4gQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIGZhbHNlKTtcbiAgJHNjb3BlLnJlbW92ZUZyb21DYXJ0ID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydChlbnRyeSk7XG4gICRzY29wZS5yZW9yZGVySXRlbSA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5LmNsb25lKCkpO1xuXG4gICRzY29wZS5zdWJtaXRDYXJ0ID0gKCkgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICB2YXIgb3B0aW9ucyA9ICRzY29wZS5vcHRpb25zLnRvX2dvX29yZGVyID8gMiA6IDA7XG5cbiAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2xlYXJDYXJ0ID0gKCkgPT4ge1xuICAgICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmNsZWFyQ2FydCgpO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNhcnQgPSAoKSA9PiB7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd0hpc3RvcnkgPSAoKSA9PiBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICRzY29wZS5zaG93Q2FydCA9ICgpID0+IENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcblxuICAkc2NvcGUucGF5Q2hlY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoZWNrb3V0JyB9O1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXQgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jYXRlZ29yeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2F0ZWdvcnlCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXRlZ29yeUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTTkFQRW52aXJvbm1lbnQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU05BUEVudmlyb25tZW50LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICB2YXIgQ2F0ZWdvcnlMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGlsZUNsYXNzTmFtZSA9IFNoZWxsTWFuYWdlci50aWxlU3R5bGU7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKGZ1bmN0aW9uKHRpbGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB0aWxlQ2xhc3NOYW1lLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDM3MCwgMzcwKSArICcpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaSkge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7IGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBEYXRhTWFuYWdlci5jYXRlZ29yeSA9IGxvY2F0aW9uLnR5cGUgPT09ICdjYXRlZ29yeScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuY2F0ZWdvcnkpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5jYXRlZ29yeUNoYW5nZWQuYWRkKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMsXG4gICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXMgfHwgW107XG4gICAgdGlsZXMgPSBkYXRhLml0ZW1zIHx8IFtdO1xuICAgIHRpbGVzID0gY2F0ZWdvcmllcy5jb25jYXQodGlsZXMpO1xuXG4gICAgaWYgKFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSAhPT0gJ2Rlc2t0b3AnKSB7XG4gICAgICB0aWxlcyA9IHRpbGVzLmZpbHRlcih0aWxlID0+IHRpbGUudHlwZSAhPT0gMyk7XG4gICAgfVxuXG4gICAgdGlsZXMuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgIHRpbGUudXJsID0gJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aCh0aWxlLmRlc3RpbmF0aW9uKTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcnlMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50LWNhdGVnb3J5JylcbiAgICApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnQ2hhdE1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQQ29uZmlnJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTWFuYWdlciwgQ2hhdE1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTaGVsbE1hbmFnZXIsIFNOQVBDb25maWcpID0+IHtcblxuICBpZiAoIVNOQVBDb25maWcuY2hhdCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUENvbmZpZy5sb2NhdGlvbl9uYW1lO1xuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcblxuICAkc2NvcGUuY2hhdEVuYWJsZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2hhdEVuYWJsZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5hY3RpdmVEZXZpY2VzID0gQ2hhdE1hbmFnZXIubW9kZWwuYWN0aXZlRGV2aWNlcztcbiAgQ2hhdE1hbmFnZXIubW9kZWwuYWN0aXZlRGV2aWNlc0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuYWN0aXZlRGV2aWNlcyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gIH0pO1xuXG4gICRzY29wZS5naWZ0RGV2aWNlID0gQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZUNoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdERldmljZSA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnRvZ2dsZUNoYXQgPSAoKSA9PiB7XG4gICAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkID0gIUNoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgfTtcblxuICAkc2NvcGUub3Blbk1hcCA9ICgpID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXRtYXAnIH07XG4gIH07XG5cbiAgJHNjb3BlLmdldERldmljZU5hbWUgPSBkZXZpY2VfdG9rZW4gPT4gQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2VfdG9rZW4pO1xuXG4gICRzY29wZS5nZXRTZWF0TnVtYmVyID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKTtcblxuICAgIGZvciAodmFyIHAgaW4gTG9jYXRpb25Nb2RlbC5zZWF0cykge1xuICAgICAgaWYgKExvY2F0aW9uTW9kZWwuc2VhdHNbcF0udG9rZW4gPT09IGRldmljZS5zZWF0KSB7XG4gICAgICAgIGxldCBtYXRjaCA9IExvY2F0aW9uTW9kZWwuc2VhdHNbcF0ubmFtZS5tYXRjaCgvXFxkKy8pO1xuICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFswXSB8fCAnJyA6ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJztcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDaGF0ID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oJ0FyZSB5b3Ugc3VyZSB5b3Ugd291bGQgbGlrZSB0byBjbG9zZSB0aGUgY2hhdCB3aXRoICcgKyAkc2NvcGUuZ2V0RGV2aWNlTmFtZShkZXZpY2VfdG9rZW4pICsgJz8nKVxuICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgQ2hhdE1hbmFnZXIuZGVjbGluZURldmljZShkZXZpY2VfdG9rZW4pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5nZXRVbnJlYWRDb3VudCA9IGRldmljZV90b2tlbiA9PiBDaGF0TWFuYWdlci5nZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pO1xuXG4gICRzY29wZS5zZW5kR2lmdCA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKGRldmljZV90b2tlbiksXG4gICAgICAgIHNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoZGV2aWNlLnNlYXQpO1xuXG4gICAgaWYgKCFzZWF0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKGBBcmUgeW91IHN1cmUgdGhhdCB5b3Ugd2FudCB0byBzZW5kIGEgZ2lmdCB0byAke3NlYXQubmFtZX0/YCkudGhlbigoKSA9PiB7XG4gICAgICBDaGF0TWFuYWdlci5zdGFydEdpZnQoZGV2aWNlX3Rva2VuKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsR2lmdCA9ICgpID0+IENoYXRNYW5hZ2VyLmVuZEdpZnQoKTtcblxuICBDaGF0TWFuYWdlci5pc1ByZXNlbnQgPSB0cnVlO1xuXG4gIHZhciB3YXRjaExvY2F0aW9uID0gdHJ1ZTtcblxuICAkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsICgpID0+IHtcbiAgICBpZiAod2F0Y2hMb2NhdGlvbikge1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuaXNQcmVzZW50ID0gZmFsc2U7XG4gICAgICB3YXRjaExvY2F0aW9uID0gZmFsc2U7XG4gICAgfVxuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdGJveC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdEJveEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICckYXR0cnMnLCAnQ2hhdE1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsICRhdHRycywgQ2hhdE1hbmFnZXIsIExvY2F0aW9uTW9kZWwpIHtcbiAgdmFyIHRvX2RldmljZSA9ICRzY29wZS5kZXZpY2UsXG4gICAgICB0eXBlID0gdG9fZGV2aWNlID9cbiAgICAgICAgQ2hhdE1hbmFnZXIuTUVTU0FHRV9UWVBFUy5ERVZJQ0UgOlxuICAgICAgICBDaGF0TWFuYWdlci5NRVNTQUdFX1RZUEVTLkxPQ0FUSU9OO1xuXG4gIHZhciBkZXZpY2UgPSB0b19kZXZpY2UgPyBMb2NhdGlvbk1vZGVsLmdldERldmljZSh0b19kZXZpY2UpIDogbnVsbDtcblxuICAkc2NvcGUucmVhZG9ubHkgPSBCb29sZWFuKCRhdHRycy5yZWFkb25seSk7XG4gICRzY29wZS5jaGF0ID0ge307XG4gICRzY29wZS5tZXNzYWdlcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlcygpIHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUubWVzc2FnZXMgPSBDaGF0TWFuYWdlci5tb2RlbC5oaXN0b3J5LmZpbHRlcihtZXNzYWdlID0+IHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2UudHlwZSA9PT0gdHlwZSAmJiAoXG4gICAgICAgICAgbWVzc2FnZS5kZXZpY2UgPT09IHRvX2RldmljZSB8fFxuICAgICAgICAgIG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2VcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYXRFbmFibGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNoYXRFbmFibGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuaXNDb25uZWN0ZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0Nvbm5lY3RlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNDb25uZWN0ZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmlzQ29ubmVjdGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuc2VuZE1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUuaXNDb25uZWN0ZWQgfHwgISRzY29wZS5jaGF0Lm1lc3NhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbWVzc2FnZSA9IHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICB0b19kZXZpY2U6IHRvX2RldmljZSxcbiAgICAgIHRleHQ6ICRzY29wZS5jaGF0Lm1lc3NhZ2VcbiAgICB9O1xuXG4gICAgQ2hhdE1hbmFnZXIuc2VuZE1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICAkc2NvcGUuY2hhdC5tZXNzYWdlID0gJyc7XG4gIH07XG5cbiAgJHNjb3BlLmdldEZyb21OYW1lID0gbWVzc2FnZSA9PiBDaGF0TWFuYWdlci5nZXRNZXNzYWdlTmFtZShtZXNzYWdlKTtcblxuICAkc2NvcGUuZ2V0U3RhdHVzVGV4dCA9IG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ1lvdSBoYXZlIHJlcXVlc3RlZCB0byBjaGF0IHdpdGggJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUobWVzc2FnZS50b19kZXZpY2UpO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRDpcbiAgICAgICAgICByZXR1cm4gJ0Nsb3NlZCB0aGUgY2hhdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdHaWZ0IHJlcXVlc3Qgc2VudCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgYSBnaWZ0JztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgc3dpdGNoKG1lc3NhZ2Uuc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5nZXRGcm9tTmFtZShtZXNzYWdlKSArICcgd291bGQgbGlrZSB0byBjaGF0IHdpdGggeW91JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQ6XG4gICAgICAgICAgcmV0dXJuICdDbG9zZWQgdGhlIGNoYXQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnV291bGQgbGlrZSB0byBzZW5kIHlvdSBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGEgZ2lmdCc7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5pc1VucmVhZCA9IG1lc3NhZ2UgPT4ge1xuICAgIGlmIChtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIENoYXRNYW5hZ2VyLmNoZWNrSWZVbnJlYWQodG9fZGV2aWNlLCBtZXNzYWdlKTtcbiAgfTtcblxuICAkc2NvcGUubWFya0FzUmVhZCA9ICgpID0+IHtcbiAgICBpZiAoIXRvX2RldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENoYXRNYW5hZ2VyLm1hcmtBc1JlYWQodG9fZGV2aWNlKTtcbiAgfTtcblxuICAkc2NvcGUub25LZXlkb3duID0ga2V5Y29kZSA9PiB7XG4gICAgaWYgKGtleWNvZGUgPT09IDEzKSB7XG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnNlbmRNZXNzYWdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0c0NoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmhpc3RvcnlDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBzaG93TWVzc2FnZXMoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdG1hcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdE1hcEN0cmwnLFxuWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsXG4oJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIFNoZWxsTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwpID0+IHtcblxuICAkc2NvcGUuc2VhdHMgPSBbXTtcblxuICAkc2NvcGUubWFwSW1hZ2UgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHMubG9jYXRpb25fbWFwO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHNDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLm1hcEltYWdlID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzLmxvY2F0aW9uX21hcCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkTWFwKCkge1xuICAgIGlmICghTG9jYXRpb25Nb2RlbC5zZWF0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc2VhdHMgPSBMb2NhdGlvbk1vZGVsLnNlYXRzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oc2VhdCkgeyByZXR1cm4gc2VhdC50b2tlbiAhPT0gTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuOyB9KVxuICAgICAgICAubWFwKGZ1bmN0aW9uKHNlYXQpIHtcbiAgICAgICAgICB2YXIgZGV2aWNlcyA9IExvY2F0aW9uTW9kZWwuZGV2aWNlc1xuICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkZXZpY2UpIHsgcmV0dXJuIGRldmljZS5zZWF0ID09PSBzZWF0LnRva2VuOyB9KVxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihkZXZpY2UpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2tlbjogZGV2aWNlLnRva2VuLFxuICAgICAgICAgICAgICAgIHNlYXQ6IGRldmljZS5zZWF0LFxuICAgICAgICAgICAgICAgIGlzX2F2YWlsYWJsZTogZGV2aWNlLmlzX2F2YWlsYWJsZSxcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogZGV2aWNlLnVzZXJuYW1lXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b2tlbjogc2VhdC50b2tlbixcbiAgICAgICAgICAgIG5hbWU6IHNlYXQubmFtZSxcbiAgICAgICAgICAgIGRldmljZXM6IGRldmljZXMsXG4gICAgICAgICAgICBtYXBfcG9zaXRpb25feDogc2VhdC5tYXBfcG9zaXRpb25feCxcbiAgICAgICAgICAgIG1hcF9wb3NpdGlvbl95OiBzZWF0Lm1hcF9wb3NpdGlvbl95LFxuICAgICAgICAgICAgaXNfYXZhaWxhYmxlOiBkZXZpY2VzXG4gICAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZGV2aWNlKSB7IHJldHVybiBkZXZpY2UuaXNfYXZhaWxhYmxlOyB9KVxuICAgICAgICAgICAgICAubGVuZ3RoID4gMFxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgTG9jYXRpb25Nb2RlbC5kZXZpY2VzQ2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRzQ2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIGJ1aWxkTWFwKCk7XG5cbiAgJHNjb3BlLmNob29zZVNlYXQgPSBmdW5jdGlvbihzZWF0KSB7XG4gICAgdmFyIGRldmljZSA9IHNlYXQuZGV2aWNlc1swXTtcblxuICAgIGlmICghc2VhdC5pc19hdmFpbGFibGUgfHwgIWRldmljZSkge1xuICAgICAgdmFyIGRldmljZU5hbWUgPSBkZXZpY2UgJiYgZGV2aWNlLnVzZXJuYW1lID8gZGV2aWNlLnVzZXJuYW1lIDogc2VhdC5uYW1lO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChkZXZpY2VOYW1lICsgJyBpcyB1bmF2YWlsYWJsZSBmb3IgY2hhdCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENoYXRNYW5hZ2VyLmFwcHJvdmVEZXZpY2UoZGV2aWNlLnRva2VuKTtcbiAgICAkc2NvcGUuZXhpdE1hcCgpO1xuICB9O1xuXG4gICRzY29wZS5leGl0TWFwID0gZnVuY3Rpb24oKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0cm9vbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hhdFJvb21DdHJsJyxcblsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQQ29uZmlnJyxcbigkc2NvcGUsICR0aW1lb3V0LCBDaGF0TWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgU05BUENvbmZpZykgPT4ge1xuICBcbiAgaWYgKCFTTkFQQ29uZmlnLmNoYXQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IFNOQVBDb25maWcubG9jYXRpb25fbmFtZTtcblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dEN0cmwnLFxuICBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdTdXJ2ZXlNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2Vzc2lvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgU3VydmV5TWFuYWdlcikgPT4ge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDb25zdGFudHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrIHNwbGl0IHR5cGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5DSEVDS19TUExJVF9OT05FID0gMDtcbiAgJHNjb3BlLkNIRUNLX1NQTElUX0JZX0lURU1TID0gMTtcbiAgJHNjb3BlLkNIRUNLX1NQTElUX0VWRU5MWSA9IDI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYXltZW50IG1ldGhvZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBUkQgPSAxO1xuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FTSCA9IDI7XG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9QQVlQQUwgPSAzO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVjZWlwdCBtZXRob2RcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9OT05FID0gMDtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMID0gMTtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUyA9IDI7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9QUklOVCA9IDM7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVja291dCBzdGVwXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCA9IDA7XG4gICRzY29wZS5TVEVQX1BBWU1FTlRfTUVUSE9EID0gMTtcbiAgJHNjb3BlLlNURVBfVElQUElORyA9IDI7XG4gICRzY29wZS5TVEVQX1NJR05BVFVSRSA9IDM7XG4gICRzY29wZS5TVEVQX1JFQ0VJUFQgPSA0O1xuICAkc2NvcGUuU1RFUF9DT01QTEVURSA9IDU7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUub3B0aW9ucyA9IHt9O1xuICAkc2NvcGUuZGF0YSA9IFt7XG4gICAgaXRlbXM6IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrXG4gIH1dO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2tcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vQ2hlY2tzIGRhdGFcbiAgdmFyIGRhdGEgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnZGF0YScpO1xuICBkYXRhXG4gIC5jaGFuZ2VzKClcbiAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZS52YWx1ZSkge1xuICAgICAgdmFyIGRhdGEgPSB2YWx1ZS52YWx1ZSgpO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuY291bnQgPSBkYXRhLmxlbmd0aDtcbiAgICB9XG5cbiAgICAkc2NvcGUub3B0aW9ucy5pbmRleCA9IDA7XG4gIH0pO1xuXG4gIC8vTWF4aW11bSBudW1iZXIgb2YgZ3Vlc3RzXG4gICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50X21heCA9IE1hdGgubWF4KFxuICAgIFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQsXG4gICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2sucmVkdWNlKChpLCBpdGVtKSA9PiBpICsgaXRlbS5xdWFudGl0eSwgMClcbiAgKTtcblxuICAvL051bWJlciBvZiBndWVzdHNcbiAgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQgPSBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50O1xuXG4gIC8vQ2hlY2sgc3BsaXQgbW9kZVxuICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9ICRzY29wZS5DSEVDS19TUExJVF9OT05FO1xuXG4gIC8vQ2hlY2sgaW5kZXhcbiAgJHNjb3BlLm9wdGlvbnMuaW5kZXggPSAwO1xuICB2YXIgaW5kZXggPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5pbmRleCcpO1xuICBCYWNvbi5jb21iaW5lQXNBcnJheShpbmRleCwgZGF0YSlcbiAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudCA9ICRzY29wZS5kYXRhWyRzY29wZS5vcHRpb25zLmluZGV4XTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNHdWVzdCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSA9ICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgfHwgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUucGhvbmU7XG4gICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzID9cbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZW1haWwgOlxuICAgICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUuY3VycmVudC5pdGVtcykge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuc3VidG90YWwgPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZSgkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgICAkc2NvcGUuY3VycmVudC50YXggPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVGF4KCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICB9XG5cbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnRpcCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQudGlwID0gMDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTmF2aWdhdGlvblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9DdXJyZW50IHN0ZXBcbiAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50X21heCA+IDEgP1xuICAgICRzY29wZS5TVEVQX0NIRUNLX1NQTElUIDpcbiAgICAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAgIC5za2lwRHVwbGljYXRlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCF2YWx1ZS52YWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGVwID0gdmFsdWUudmFsdWUoKTtcblxuICAgICAgaWYgKHN0ZXAgPT09ICRzY29wZS5TVEVQX0NPTVBMRVRFKSB7XG4gICAgICAgIHN0YXJ0TmV4dENoZWNrKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBNaXNjXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1NlYXQgbmFtZVxuICAkc2NvcGUub3B0aW9ucy5zZWF0ID0gTG9jYXRpb25Nb2RlbC5zZWF0ID8gTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOiAnVGFibGUnO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+IHtcbiAgICAkc2NvcGUub3B0aW9ucy5zZWF0ID0gc2VhdCA/IHNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL1Byb2NlZWQgd2l0aCB0aGUgbmV4dCBjaGVja1xuICBmdW5jdGlvbiBzdGFydE5leHRDaGVjaygpIHtcbiAgICB2YXIgY2hlY2sgPSAkc2NvcGUuY3VycmVudDtcblxuICAgIGlmICgkc2NvcGUub3B0aW9ucy5pbmRleCA9PT0gJHNjb3BlLm9wdGlvbnMuY291bnQgLSAxKSB7XG4gICAgICBPcmRlck1hbmFnZXIuY2xlYXJDaGVjaygpO1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7XG4gICAgICAgIHR5cGU6IFN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkID8gJ3N1cnZleScgOiAnaG9tZSdcbiAgICAgIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5pbmRleCsrO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG5cbiAgLy9DYWxjdWxhdGUgYSBjYXJ0IGl0ZW0gdGl0bGVcbiAgJHNjb3BlLmNhbGN1bGF0ZVRpdGxlID0gZW50cnkgPT4gZW50cnkubmFtZSB8fCBlbnRyeS5pdGVtLnRpdGxlO1xuXG4gIC8vQ2FsY3VsYXRlIGEgY2FydCBpdGVtIHByaWNlXG4gICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG5cbiAgLy9DYWxjdWxhdGUgY2FydCBpdGVtcyBwcmljZVxuICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgLy9PdXRwdXQgYSBmb3JtYXR0ZWQgcHJpY2Ugc3RyaW5nXG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSB8fCAwKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnc2lnbmluJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5pbml0aWFsaXplZCA9IHRydWU7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0bWV0aG9kLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dE1ldGhvZEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1vZGVsJywgJ0NhcmRSZWFkZXInLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9nZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTW9kZWwsIENhcmRSZWFkZXIsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlciwgTG9nZ2VyKSA9PiB7XG5cbiAgQ2FyZFJlYWRlci5vblJlY2VpdmVkLmFkZChkYXRhID0+IHtcbiAgICBMb2dnZXIuZGVidWcoYENhcmQgcmVhZGVyIHJlc3VsdDogJHtKU09OLnN0cmluZ2lmeShkYXRhKX1gKTtcbiAgICB2YXIgY2FyZCA9IHtcbiAgICAgIG51bWJlcjogZGF0YS5jYXJkX251bWJlcixcbiAgICAgIG1vbnRoOiBkYXRhLmV4cGlyYXRpb25fbW9udGgsXG4gICAgICB5ZWFyOiBkYXRhLmV4cGlyYXRpb25feWVhcixcbiAgICAgIGRhdGE6IGRhdGEuZGF0YVxuICAgIH07XG5cbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgICBjYXJkRGF0YVJlY2VpdmVkKGNhcmQpO1xuICB9KTtcblxuICBDYXJkUmVhZGVyLm9uRXJyb3IuYWRkKGUgPT4ge1xuICAgIExvZ2dlci5kZWJ1ZyhgQ2FyZCByZWFkZXIgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9DQVJEUkVBREVSX0VSUk9SKTtcbiAgfSk7XG5cbiAgJHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoKSA9PiB7XG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gIH0pO1xuXG4gIC8vR2VuZXJhdGUgYSBwYXltZW50IHRva2VuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlUGF5bWVudFRva2VuKCkge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIuZ2VuZXJhdGVQYXltZW50VG9rZW4oKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFBheW1lbnQgdG9rZW4gZ2VuZXJhdGlvbiBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vQ2FsbGVkIHdoZW4gYSBjYXJkIGRhdGEgaXMgcmVjZWl2ZWRcbiAgZnVuY3Rpb24gY2FyZERhdGFSZWNlaXZlZChjYXJkKSB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgT3JkZXJNYW5hZ2VyLmNsZWFyQ2hlY2soJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgICAgJHNjb3BlLmN1cnJlbnQuY2FyZF9kYXRhID0gY2FyZC5kYXRhO1xuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1NJR05BVFVSRTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vQ2hvb3NlIHRvIHBheSB3aXRoIGEgY3JlZGl0IGNhcmRcbiAgJHNjb3BlLnBheUNhcmQgPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FSRDtcbiAgICBDYXJkUmVhZGVyLnN0YXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLnBheUNhcmRDYW5jZWwgPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSB1bmRlZmluZWQ7XG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcGF5IHdpdGggY2FzaFxuICAkc2NvcGUucGF5Q2FzaCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9ICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVNIO1xuXG4gICAgaWYgKE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QgIT0gbnVsbCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFJlcXVlc3QgY2xvc2VvdXQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgZ2VuZXJhdGVQYXltZW50VG9rZW4oKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRyZWNlaXB0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFJlY2VpcHRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCBcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIC8vQ2hvb3NlIHRvIGhhdmUgbm8gcmVjZWlwdFxuICAkc2NvcGUucmVjZWlwdE5vbmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9OT05FO1xuICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcmVjZWlwdCBieSBlLW1haWxcbiAgJHNjb3BlLnJlY2VpcHRFbWFpbCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHJlY2VpcHQgYnkgc21zXG4gICRzY29wZS5yZWNlaXB0U21zID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVM7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcHJpbnRlZCByZWNlaXB0XG4gICRzY29wZS5yZWNlaXB0UHJpbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9QUklOVDtcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlcXVlc3RSZWNlaXB0KCkge1xuICAgIHZhciBpdGVtID0gJHNjb3BlLmN1cnJlbnQ7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGNoZWNrb3V0X3Rva2VuOiBpdGVtLmNoZWNrb3V0X3Rva2VuLFxuICAgICAgcmVjZWlwdF9tZXRob2Q6IGl0ZW0ucmVjZWlwdF9tZXRob2RcbiAgICB9O1xuXG4gICAgaWYgKGl0ZW0ucmVjZWlwdF9tZXRob2QgPT09ICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTCkge1xuICAgICAgcmVxdWVzdC5yZWNlaXB0X2VtYWlsID0gaXRlbS5yZWNlaXB0X2VtYWlsO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLnJlY2VpcHRfbWV0aG9kID09PSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TKSB7XG4gICAgICByZXF1ZXN0LnJlY2VpcHRfcGhvbmUgPSBpdGVtLnJlY2VpcHRfcGhvbmU7XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHNpZ25hdHVyZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRTaWduYXR1cmVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9nZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIsIE9yZGVyTWFuYWdlciwgTG9nZ2VyKSA9PiB7XG5cbiAgLy9DbGVhciB0aGUgY3VycmVudCBzaWduYXR1cmVcbiAgdmFyIHJlc2V0U2lnbmF0dXJlID0gKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5jdXJyZW50LnNpZ25hdHVyZV90b2tlbiA9IHVuZGVmaW5lZDtcblxuICAgICAgdmFyIHNpZ25hdHVyZSA9ICQoJyNjaGVja291dC1zaWduYXR1cmUtaW5wdXQnKTtcbiAgICAgIHNpZ25hdHVyZS5lbXB0eSgpO1xuICAgICAgc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2luaXQnLCB7XG4gICAgICAgICdjb2xvcicgOiAnIzAwMCcsXG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmZmYnLFxuICAgICAgICAnZGVjb3ItY29sb3InOiAnI2ZmZicsXG4gICAgICAgICd3aWR0aCc6ICcxMDAlJyxcbiAgICAgICAgJ2hlaWdodCc6ICcyMDBweCdcbiAgICAgIH0pO1xuICAgIH0sIDMwMCk7XG4gIH07XG5cbiAgLy9TdWJtaXQgdGhlIGN1cnJlbnQgc2lnbmF0dXJlIGlucHV0XG4gICRzY29wZS5zaWduYXR1cmVTdWJtaXQgPSAoKSA9PiB7XG4gICAgdmFyIHNpZ25hdHVyZSA9ICQoJyNjaGVja291dC1zaWduYXR1cmUtaW5wdXQnKTtcblxuICAgIGlmIChzaWduYXR1cmUualNpZ25hdHVyZSgnZ2V0RGF0YScsICduYXRpdmUnKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgIHZhciBzaWcgPSBzaWduYXR1cmUualNpZ25hdHVyZSgnZ2V0RGF0YScsICdpbWFnZScpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnVwbG9hZFNpZ25hdHVyZShzaWdbMV0pLnRoZW4odG9rZW4gPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50LnNpZ25hdHVyZV90b2tlbiA9IHRva2VuO1xuICAgICAgICBjb21wbGV0ZUNoZWNrb3V0KCk7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgU2lnbmF0dXJlIHVwbG9hZCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvL0NhbmNlbCB0aGUgY3VycmVudCBzaWduYXR1cmUgaW5wdXRcbiAgJHNjb3BlLnNpZ25hdHVyZUNhbmNlbCA9ICgpID0+IHtcbiAgICByZXNldFNpZ25hdHVyZSgpO1xuICB9O1xuXG4gIC8vQ29tcGxldGUgdGhlIGNoZWNrb3V0XG4gIGZ1bmN0aW9uIGNvbXBsZXRlQ2hlY2tvdXQoKSB7XG4gICAgdmFyIGl0ZW0gPSAkc2NvcGUuY3VycmVudDtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBhbW91bnRfc3VidG90YWw6IGl0ZW0uc3VidG90YWwsXG4gICAgICBhbW91bnRfdGF4OiBpdGVtLnRheCxcbiAgICAgIGFtb3VudF90aXA6IGl0ZW0udGlwLFxuICAgICAgY2FyZF9kYXRhOiBpdGVtLmNhcmRfZGF0YSxcbiAgICAgIHNpZ25hdHVyZV90b2tlbjogaXRlbS5zaWduYXR1cmVfdG9rZW4sXG4gICAgICBvcmRlcl90b2tlbnM6IGl0ZW0uaXRlbXMgIT0gbnVsbCA/XG4gICAgICAgIGl0ZW0uaXRlbXMucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgaXRlbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtLnF1YW50aXR5OyBpKyspIHtcbiAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbS5yZXF1ZXN0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9LCBbXSlcbiAgICAgICAgOiBudWxsXG4gICAgfTtcblxuICAgIE9yZGVyTWFuYWdlci5wYXlPcmRlcihyZXF1ZXN0KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuXG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5jdXJyZW50LmNoZWNrb3V0X3Rva2VuID0gcmVzdWx0LnRva2VuO1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfUkVDRUlQVDtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBPcmRlciBwYXltZW50IGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgLnNraXBEdXBsaWNhdGVzKClcbiAgLnN1YnNjcmliZSh2YWx1ZSA9PiB7XG4gICAgaWYgKCF2YWx1ZS52YWx1ZSB8fCB2YWx1ZS52YWx1ZSgpICE9PSAkc2NvcGUuU1RFUF9TSUdOQVRVUkUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXNldFNpZ25hdHVyZSgpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRzcGxpdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRTcGxpdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdPcmRlck1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgLy9TcGxpdCB0aGUgY3VycmVudCBvcmRlciBpbiB0aGUgc2VsZWN0ZWQgd2F5XG4gICRzY29wZS5zcGxpdENoZWNrID0gZnVuY3Rpb24odHlwZSkge1xuICAgIHZhciBpLCBkYXRhID0gW107XG5cbiAgICBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkUpIHtcbiAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgIGl0ZW1zOiBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfRVZFTkxZKSB7XG4gICAgICB2YXIgY2hlY2sgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjayxcbiAgICAgICAgICBzdWJ0b3RhbCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGNoZWNrKSxcbiAgICAgICAgICB0YXggPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVGF4KGNoZWNrKTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICBzdWJ0b3RhbDogTWF0aC5yb3VuZCgoc3VidG90YWwgLyAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCkgKiAxMDApIC8gMTAwLFxuICAgICAgICAgIHRheDogTWF0aC5yb3VuZCgodGF4IC8gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQpICogMTAwKSAvIDEwMFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9CWV9JVEVNUykge1xuICAgICAgZm9yIChpID0gMDsgaSA8ICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50OyBpKyspIHtcbiAgICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcyA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLnNsaWNlKDApLm1hcChpdGVtID0+IGl0ZW0uY2xvbmUoKSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLiRwYXJlbnQuZGF0YSA9IGRhdGE7XG4gICAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSB0eXBlO1xuICB9O1xuXG4gIC8vTW92ZSBhbiBpdGVtIHRvIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5hZGRUb0NoZWNrID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSAkc2NvcGUuc3BsaXRfaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgIT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLnF1YW50aXR5ID4gMSkge1xuICAgICAgICBpdGVtLnF1YW50aXR5LS07XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pXG4gICAgLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtICE9IG51bGw7IH0pO1xuXG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSAkc2NvcGUuY3VycmVudC5pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCA9PT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICBleGlzdHMgPSB0cnVlO1xuICAgICAgICBpdGVtLnF1YW50aXR5Kys7XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHZhciBjbG9uZSA9IGVudHJ5LmNsb25lKCk7XG4gICAgICBjbG9uZS5xdWFudGl0eSA9IDE7XG5cbiAgICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLnB1c2goY2xvbmUpO1xuICAgIH1cbiAgfTtcblxuICAvL1JlbW92ZSBhbiBpdGVtIGZyb20gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLnJlbW92ZUZyb21DaGVjayA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSAkc2NvcGUuY3VycmVudC5pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCAhPT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ucXVhbnRpdHkgPiAxKSB7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHktLTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gIT0gbnVsbDsgfSk7XG5cbiAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSAkc2NvcGUuc3BsaXRfaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgPT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5xdWFudGl0eSsrO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KTtcblxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB2YXIgY2xvbmUgPSBlbnRyeS5jbG9uZSgpO1xuICAgICAgY2xvbmUucXVhbnRpdHkgPSAxO1xuXG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMucHVzaChjbG9uZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vTW92ZSBhbGwgYXZhaWxhYmxlIGl0ZW1zIHRvIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5hZGRBbGxUb0NoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goJHNjb3BlLmFkZFRvQ2hlY2spO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihuZXdpdGVtKSB7XG4gICAgICAgIGlmIChuZXdpdGVtLnJlcXVlc3QgPT09IGl0ZW0ucmVxdWVzdCkge1xuICAgICAgICAgIG5ld2l0ZW0ucXVhbnRpdHkgKz0gaXRlbS5xdWFudGl0eTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSBbXTtcbiAgfTtcblxuICAvL1JlbW92ZSBhbGwgaXRlbXMgZnJvbSB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUucmVtb3ZlQWxsRnJvbUNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaCgkc2NvcGUucmVtb3ZlRnJvbUNoZWNrKTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zLmZvckVhY2goZnVuY3Rpb24obmV3aXRlbSkge1xuICAgICAgICBpZiAobmV3aXRlbS5yZXF1ZXN0ID09PSBpdGVtLnJlcXVlc3QpIHtcbiAgICAgICAgICBuZXdpdGVtLnF1YW50aXR5ICs9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMgPSBbXTtcbiAgfTtcblxuICAvL1Byb2NlZWQgd2l0aCB0aGUgbmV4dCBjaGVjayBzcGxpdHRpbmdcbiAgJHNjb3BlLnNwbGl0TmV4dENoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5vcHRpb25zLmluZGV4IDwgJHNjb3BlLm9wdGlvbnMuY291bnQgLSAxICYmICRzY29wZS5zcGxpdF9pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5pbmRleCsrO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUuc3BsaXRfaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgJHNjb3BlLmFkZEFsbFRvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS4kcGFyZW50LmRhdGEgPSAkc2NvcGUuJHBhcmVudC5kYXRhLmZpbHRlcihmdW5jdGlvbihjaGVjaykge1xuICAgICAgICByZXR1cm4gY2hlY2suaXRlbXMubGVuZ3RoID4gMDtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAuc2tpcER1cGxpY2F0ZXMoKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZS52YWx1ZSB8fCB2YWx1ZS52YWx1ZSgpICE9PSAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0dGlwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFRpcEN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdPcmRlck1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBPcmRlck1hbmFnZXIpIHtcblxuICAvL0FkZCBhIHRpcFxuICAkc2NvcGUuYWRkVGlwID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgJHNjb3BlLmN1cnJlbnQudGlwID0gTWF0aC5yb3VuZCgoJHNjb3BlLmN1cnJlbnQuc3VidG90YWwgKiBhbW91bnQpICogMTAwKSAvIDEwMDtcbiAgfTtcblxuICAvL0FwcGx5IHRoZSBzZWxlY3RlZCB0aXAgYW1vdW50IGFuZCBwcm9jZWVkIGZ1cnRoZXJcbiAgJHNjb3BlLmFwcGx5VGlwID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1BBWU1FTlRfTUVUSE9EO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9mbGlwc2NyZWVuLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kRmxpcFNjcmVlbicsIFsnTWFuYWdlbWVudFNlcnZpY2UnLCBmdW5jdGlvbihNYW5hZ2VtZW50U2VydmljZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uucm90YXRlU2NyZWVuKCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3Jlc2V0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kUmVzZXQnLCBbJ0FuYWx5dGljc01hbmFnZXInLCAnQ2hhdE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ0xvZ2dlcicsIGZ1bmN0aW9uKEFuYWx5dGljc01hbmFnZXIsIENoYXRNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU2Vzc2lvbk1hbmFnZXIsIFN1cnZleU1hbmFnZXIsIE1hbmFnZW1lbnRTZXJ2aWNlLCBMb2dnZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIGZhaWwoZSkge1xuICAgICAgTG9nZ2VyLndhcm4oJ1VuYWJsZSB0byByZXNldCBwcm9wZXJseTogJyArIGUubWVzc2FnZSk7XG4gICAgICBNYW5hZ2VtZW50U2VydmljZS5yZXNldCgpO1xuICAgIH1cblxuICAgIFNlc3Npb25NYW5hZ2VyLmVuZFNlc3Npb24oKTtcblxuICAgIEFuYWx5dGljc01hbmFnZXIuc3VibWl0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIFN1cnZleU1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgQ2hhdE1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBNYW5hZ2VtZW50U2VydmljZS5yZXNldCgpO1xuICAgICAgICAgICAgfSwgZmFpbCk7XG4gICAgICAgICAgfSwgZmFpbCk7XG4gICAgICAgIH0sIGZhaWwpO1xuICAgICAgfSwgZmFpbCk7XG4gICAgfSwgZmFpbCk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3N0YXJ0dXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRTdGFydHVwJywgWydMb2dnZXInLCAnQXBwQ2FjaGUnLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgJ1NOQVBDb25maWcnLCBmdW5jdGlvbihMb2dnZXIsIEFwcENhY2hlLCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU3VydmV5TWFuYWdlciwgU05BUENvbmZpZykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gZmFpbChlKSB7XG4gICAgICBMb2dnZXIud2FybihgVW5hYmxlIHRvIHN0YXJ0dXAgcHJvcGVybHk6ICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhY2hlQ29tcGxldGUodXBkYXRlZCkge1xuICAgICAgaWYgKHVwZGF0ZWQpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBEYXRhTWFuYWdlci5pbml0aWFsaXplKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKEFwcENhY2hlLmlzVXBkYXRlZCkge1xuICAgICAgY2FjaGVDb21wbGV0ZSh0cnVlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoQXBwQ2FjaGUuaXNDb21wbGV0ZSkge1xuICAgICAgY2FjaGVDb21wbGV0ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgQXBwQ2FjaGUuY29tcGxldGUuYWRkKGNhY2hlQ29tcGxldGUpO1xuXG4gICAgU2hlbGxNYW5hZ2VyLmluaXRpYWxpemUoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzaWduaW4nIH07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBDdXN0b21lck1hbmFnZXIuZ3Vlc3RMb2dpbigpO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvc3VibWl0b3JkZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gIFsnRGlhbG9nTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ09yZGVyTWFuYWdlcicsXG4gIChEaWFsb2dNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1hbmFnZXIpID0+IHtcblxuICByZXR1cm4gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghTG9jYXRpb25Nb2RlbC5zZWF0IHx8ICFMb2NhdGlvbk1vZGVsLnNlYXQudG9rZW4pIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfRVJST1JfTk9fU0VBVCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IDA7XG5cbiAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9kaWFsb2cuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0RpYWxvZ0N0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnRGlhbG9nTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICB2YXIgYWxlcnRTdGFjayA9IFtdLFxuICAgICAgY29uZmlybVN0YWNrID0gW107XG4gIHZhciBhbGVydEluZGV4ID0gLTEsXG4gICAgICBjb25maXJtSW5kZXggPSAtMTtcbiAgdmFyIGFsZXJ0VGltZXI7XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc0J1c3ksIHNob3dBbGVydCwgc2hvd0NvbmZpcm0pIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pc0J1c3kgPSBpc0J1c3kgIT09IHVuZGVmaW5lZCA/IGlzQnVzeSA6ICRzY29wZS5pc0J1c3k7XG4gICAgICAkc2NvcGUuc2hvd0FsZXJ0ID0gc2hvd0FsZXJ0ICE9PSB1bmRlZmluZWQgPyBzaG93QWxlcnQgOiAkc2NvcGUuc2hvd0FsZXJ0O1xuICAgICAgJHNjb3BlLnNob3dDb25maXJtID0gc2hvd0NvbmZpcm0gIT09IHVuZGVmaW5lZCA/IHNob3dDb25maXJtIDogJHNjb3BlLnNob3dDb25maXJtO1xuICAgICAgJHNjb3BlLnZpc2libGUgPSAkc2NvcGUuaXNCdXN5IHx8ICRzY29wZS5zaG93QWxlcnQgfHwgJHNjb3BlLnNob3dDb25maXJtO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd05leHRBbGVydCgpIHtcbiAgICBpZiAoYWxlcnRUaW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKGFsZXJ0VGltZXIpO1xuICAgIH1cblxuICAgIHZhciBhbGVydCA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF07XG5cbiAgICBpZiAoYWxlcnQgJiYgYWxlcnQucmVzb2x2ZSkge1xuICAgICAgYWxlcnQucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIGFsZXJ0SW5kZXgrKztcblxuICAgIGlmIChhbGVydEluZGV4ID09PSBhbGVydFN0YWNrLmxlbmd0aCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIGFsZXJ0U3RhY2sgPSBbXTtcbiAgICAgIGFsZXJ0SW5kZXggPSAtMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5hbGVydFRpdGxlID0gYWxlcnRTdGFja1thbGVydEluZGV4XS50aXRsZTtcbiAgICAgICRzY29wZS5hbGVydFRleHQgPSBhbGVydFN0YWNrW2FsZXJ0SW5kZXhdLm1lc3NhZ2U7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBhbGVydFRpbWVyID0gJHRpbWVvdXQoc2hvd05leHRBbGVydCwgMTAwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd05leHRDb25maXJtKCkge1xuICAgIGNvbmZpcm1JbmRleCsrO1xuXG4gICAgaWYgKGNvbmZpcm1JbmRleCA9PT0gY29uZmlybVN0YWNrLmxlbmd0aCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgY29uZmlybVN0YWNrID0gW107XG4gICAgICBjb25maXJtSW5kZXggPSAtMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5jb25maXJtVGV4dCA9IGNvbmZpcm1TdGFja1tjb25maXJtSW5kZXhdLm1lc3NhZ2U7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlICE9PSAnc3RyaW5nJykge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UpIHtcbiAgICAgICAgICBjYXNlIEFMRVJUX0dFTkVSSUNfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPb3BzISBNeSBiaXRzIGFyZSBmaWRkbGVkLiBPdXIgcmVxdWVzdCBzeXN0ZW0gaGFzIGJlZW4gZGlzY29ubmVjdGVkLiBQbGVhc2Ugbm90aWZ5IGEgc2VydmVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9vcHMhIE15IGJpdHMgYXJlIGZpZGRsZWQuIE91ciByZXF1ZXN0IHN5c3RlbSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuIFBsZWFzZSBub3RpZnkgYSBzZXJ2ZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQ2FsbCBTZXJ2ZXIgcmVxdWVzdCB3YXMgc2VudCBzdWNjZXNzZnVsbHkuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgcmVxdWVzdCBmb3Igc2VydmVyIGFzc2lzdGFuY2UgaGFzIGJlZW4gc2VlbiwgYW5kIGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJSZXF1ZXN0IGNoZWNrIHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5LlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciBjaGVjayByZXF1ZXN0IGhhcyBiZWVuIHNlZW4sIGFuZCBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT3JkZXIgc2VudCEgWW91IHdpbGwgYmUgbm90aWZpZWQgd2hlbiB5b3VyIHdhaXRlciBhY2NlcHRzIHRoZSBvcmRlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgb3JkZXIgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9TSUdOSU5fUkVRVUlSRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3UgbXVzdCBiZSBsb2dnZWQgaW50byBTTkFQIHRvIGFjY2VzcyB0aGlzIHBhZ2UuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0U6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gY2FsbCB0aGUgd2FpdGVyP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9DTE9TRU9VVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXF1ZXN0IHlvdXIgY2hlY2s/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX1JFU0VUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlc2V0P1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9ERUxFVF9DQVJEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlbW92ZSB0aGlzIHBheW1lbnQgbWV0aG9kP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9QQVNTV09SRF9SRVNFVF9DT01QTEVURTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkEgbGluayB0byBjaGFuZ2UgeW91ciBwYXNzd29yZCBoYXMgYmVlbiBlbWFpbGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9TT0ZUV0FSRV9PVVREQVRFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkEgc29mdHdhcmUgdXBkYXRlIGlzIGF2YWlsYWJsZS4gUGxlYXNlIHJlc3RhcnQgdGhlIGFwcGxpY2F0aW9uLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9DQVJEUkVBREVSX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiVW5hYmxlIHRvIHJlYWQgdGhlIGNhcmQgZGF0YS4gUGxlYXNlIHRyeSBhZ2Fpbi5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfRVJST1JfTk9fU0VBVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkRldmljZSBpcyBub3QgYXNzaWduZWQgdG8gYW55IHRhYmxlLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cblxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuICAkc2NvcGUuaXNCdXN5ID0gZmFsc2U7XG4gICRzY29wZS5zaG93QWxlcnQgPSBmYWxzZTtcbiAgJHNjb3BlLnNob3dDb25maXJtID0gZmFsc2U7XG5cbiAgJHNjb3BlLmNsb3NlQWxlcnQgPSBmdW5jdGlvbigpIHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIHNob3dOZXh0QWxlcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDb25maXJtID0gZnVuY3Rpb24oY29uZmlybWVkKSB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIHZhciBjb25maXJtID0gY29uZmlybVN0YWNrW2NvbmZpcm1JbmRleF07XG5cbiAgICBpZiAoY29uZmlybSkge1xuICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICBpZiAoY29uZmlybS5yZXNvbHZlKSB7XG4gICAgICAgICAgY29uZmlybS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoY29uZmlybS5yZWplY3QpIHtcbiAgICAgICAgICBjb25maXJtLnJlamVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2hvd05leHRDb25maXJtKCk7XG4gIH07XG5cbiAgRGlhbG9nTWFuYWdlci5hbGVydFJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSwgdGl0bGUsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgYWxlcnRTdGFjay5wdXNoKHsgdGl0bGU6IHRpdGxlLCBtZXNzYWdlOiBtZXNzYWdlLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dBbGVydCkge1xuICAgICAgJHRpbWVvdXQoc2hvd05leHRBbGVydCk7XG4gICAgfVxuICB9KTtcblxuICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm1SZXF1ZXN0ZWQuYWRkKGZ1bmN0aW9uKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgY29uZmlybVN0YWNrLnB1c2goeyBtZXNzYWdlOiBtZXNzYWdlLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dDb25maXJtKSB7XG4gICAgICAkdGltZW91dChzaG93TmV4dENvbmZpcm0pO1xuICAgIH1cbiAgfSk7XG5cbiAgRGlhbG9nTWFuYWdlci5qb2JTdGFydGVkLmFkZChmdW5jdGlvbigpIHtcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVWaXNpYmlsaXR5KHRydWUpO1xuICB9KTtcblxuICBEaWFsb2dNYW5hZ2VyLmpvYkVuZGVkLmFkZChmdW5jdGlvbigpIHtcbiAgICB1cGRhdGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2FkdmVydGlzZW1lbnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzQWR2ZXJ0aXNlbWVudEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQW5hbHl0aWNzTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdTaGVsbE1hbmFnZXInLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBBbmFseXRpY3NNb2RlbCwgaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS52aXNpYmxlKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gZGF0YS5tYWluXG4gICAgICAgIC5tYXAoYWQgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgICAgICAgIHRva2VuOiBhZC50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2NhcnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNDYXJ0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRzY2UnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdDaGF0TWFuYWdlcicsXG4gICAgKCRzY29wZSwgJHRpbWVvdXQsICRzY2UsIEN1c3RvbWVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgICAgICRzY29wZS5TVEFURV9DQVJUID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgICAkc2NvcGUuU1RBVEVfSElTVE9SWSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuXG4gICAgICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAgICAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcbiAgICAgICRzY29wZS5vcHRpb25zID0ge307XG5cbiAgICAgICRzY29wZS5jdXJyZW5jeSA9IFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeTtcbiAgICAgIFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeUNoYW5nZWQuYWRkKGN1cnJlbmN5ID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXJyZW5jeSA9IGN1cnJlbmN5KSk7XG5cbiAgICAgICRzY29wZS5zdGF0ZSA9IENhcnRNb2RlbC5jYXJ0U3RhdGU7XG4gICAgICBDYXJ0TW9kZWwuY2FydFN0YXRlQ2hhbmdlZC5hZGQoc3RhdGUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0YXRlID0gc3RhdGUpKTtcblxuICAgICAgJHNjb3BlLmVkaXRhYmxlSXRlbSA9IENhcnRNb2RlbC5lZGl0YWJsZUl0ZW07XG4gICAgICBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtQ2hhbmdlZC5hZGQoaXRlbSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWRpdGFibGVJdGVtID0gaXRlbSkpO1xuXG4gICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gdmFsdWUpO1xuXG4gICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcblxuICAgICAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgICAgIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gICAgICAkc2NvcGUudmlzaWJsZSA9IENhcnRNb2RlbC5pc0NhcnRPcGVuO1xuXG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID9cbiAgICAgICAgTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOlxuICAgICAgICAnVGFibGUnO1xuXG4gICAgICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+ICRzY29wZS5zZWF0X25hbWUgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJyk7XG5cbiAgICAgIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcbiAgICAgIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJzID0gZW50cnkgPT4ge1xuICAgICAgICBpZiAoIWVudHJ5Lm1vZGlmaWVycykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgbGV0IG1vZGlmaWVycyA9IGNhdGVnb3J5Lm1vZGlmaWVycy5maWx0ZXIobW9kaWZpZXIgPT4gbW9kaWZpZXIuaXNTZWxlY3RlZCk7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChtb2RpZmllcnMpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICAgICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgICAgICRzY29wZS5lZGl0SXRlbSA9IGVudHJ5ID0+IENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCBmYWxzZSk7XG5cbiAgICAgICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIGlmIChjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIG0gPT4gbS5pc1NlbGVjdGVkID0gKG0gPT09IG1vZGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KGVudHJ5KTtcbiAgICAgICRzY29wZS5yZW9yZGVySXRlbSA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5LmNsb25lKCkpO1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2FydCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9ICRzY29wZS5vcHRpb25zLnRvR28gPyAyIDogMDtcblxuICAgICAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgICAgICAgICRzY29wZS5vcHRpb25zLnRvR28gPSBmYWxzZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsZWFyQ2FydCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMudG9HbyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmNsZWFyQ2FydCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsb3NlRWRpdG9yID0gKCkgPT4ge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jbG9zZUNhcnQgPSAoKSA9PiB7XG4gICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgICAgIENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dIaXN0b3J5ID0gKCkgPT4gQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICAgICAkc2NvcGUuc2hvd0NhcnQgPSAoKSA9PiBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcblxuICAgICAgJHNjb3BlLnBheUNoZWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGVja291dCcgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9jYXRlZ29yeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNDYXRlZ29yeUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgdmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5jYXRlZ29yeUNoYW5nZWQuYWRkKGNhdGVnb3J5ID0+IHtcbiAgICBpZiAoIWNhdGVnb3J5KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhdGVnb3J5ID0gbnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1zID0gY2F0ZWdvcnkuaXRlbXMgfHwgW10sXG4gICAgICAgIGNhdGVnb3JpZXMgPSBjYXRlZ29yeS5jYXRlZ29yaWVzIHx8IFtdO1xuXG4gICAgdmFyIHRpbGVzID0gY2F0ZWdvcmllcy5jb25jYXQoaXRlbXMpLm1hcChpdGVtID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICBpbWFnZTogaXRlbS5pbWFnZSxcbiAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGl0ZW0uZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogaXRlbS5kZXN0aW5hdGlvblxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcnlMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWNhdGVnb3J5LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIGlmIChsb2NhdGlvbi50eXBlID09PSAnaXRlbScpIHtcbiAgICAgICRzY29wZS5zaG93TW9kYWwgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5zaG93TW9kYWwgPSBmYWxzZTtcblxuICAgIERhdGFNYW5hZ2VyLmNhdGVnb3J5ID0gbG9jYXRpb24udHlwZSA9PT0gJ2NhdGVnb3J5JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5jYXRlZ29yeSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2hvbWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnU05BUENvbmZpZycsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgU05BUENvbmZpZykgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHJvd3MgPSBbXSxcbiAgICAgICAgICBob21lID0gdGhpcy5wcm9wcy5ob21lO1xuXG4gICAgICBpZiAoQm9vbGVhbihob21lLmludHJvKSkge1xuICAgICAgICByb3dzLnB1c2goUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtaW5mbycsXG4gICAgICAgICAga2V5OiAnaW50cm8nXG4gICAgICAgIH0sIFJlYWN0LkRPTS5kaXYoe30sIFtcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMSh7IGtleTogJ2ludHJvLXRpdGxlJyB9LFxuICAgICAgICAgICAgICBob21lLmludHJvLnRpdGxlIHx8IGBXZWxjb21lIHRvICR7U05BUENvbmZpZy5sb2NhdGlvbl9uYW1lfWBcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7IGtleTogJ2ludHJvLXRleHQnIH0sXG4gICAgICAgICAgICAgIGhvbWUuaW50cm8udGV4dFxuICAgICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRpbGVzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgdmFyIGJhY2tncm91bmQgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgNDcwLCA0MTApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtcmVndWxhcicsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kID8gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKScgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByb3dzID0gcm93cy5jb25jYXQodGlsZXMpXG4gICAgICAucmVkdWNlKChyZXN1bHQsIHZhbHVlKSA9PiB7XG4gICAgICAgIHJlc3VsdFswXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmhvbWVDaGFuZ2VkLmFkZChob21lID0+IHtcbiAgICBpZiAoIWhvbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBob21lLm1lbnVzXG4gICAgLm1hcChtZW51ID0+IHtcbiAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgIGltYWdlOiBtZW51LmltYWdlLFxuICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVNZW51LCB7IHRpbGVzOiB0aWxlcywgaG9tZTogaG9tZSB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWhvbWUtbWVudScpXG4gICAgKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLmhvbWUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmhvbWUpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9pdGVtLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0l0ZW1DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdXZWJCcm93c2VyJywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBXZWJCcm93c2VyLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuXG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSAkc2NvcGUuZW50cmllcyA9IG51bGw7XG4gICAgICAgICRzY29wZS50eXBlID0gMTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAwO1xuICAgICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IGl0ZW0udHlwZTtcblxuICAgIGlmICh0eXBlID09PSAyICYmIGl0ZW0ud2Vic2l0ZSkge1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKGl0ZW0ud2Vic2l0ZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzICYmIGl0ZW0uZmxhc2gpIHtcbiAgICAgIGxldCBmbGFzaFVybCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLmZsYXNoLm1lZGlhLCAwLCAwLCAnc3dmJyksXG4gICAgICAgICAgdXJsID0gJy9mbGFzaCN1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChmbGFzaFVybCkgK1xuICAgICAgICAgICAgICAgICcmd2lkdGg9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLndpZHRoKSArXG4gICAgICAgICAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLmhlaWdodCk7XG5cbiAgICAgIFdlYkJyb3dzZXIub3BlbihXZWJCcm93c2VyLmdldEFwcFVybCh1cmwpKTtcbiAgICB9XG5cbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKGl0ZW0sIDEpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHlwZSA9IHR5cGU7XG4gICAgICAkc2NvcGUuc3RlcCA9IDA7XG4gICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgdywgaCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHcsIGgsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IHZhbHVlID8gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKSA6IDA7XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gKCkgPT4ge1xuICAgIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgaWYgKCRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMgPSAkc2NvcGUuZW50cnkuY2xvbmVNYW55KCk7XG4gICAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1skc2NvcGUuZW50cnlJbmRleCA9IDBdO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDI7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCRzY29wZS5zdGVwID09PSAxKSB7XG4gICAgICBpZiAoJHNjb3BlLmVudHJ5SW5kZXggPT09ICRzY29wZS5lbnRyaWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KSk7XG4gICAgICAgICRzY29wZS5zdGVwID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbKyskc2NvcGUuZW50cnlJbmRleF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5wcmV2aW91c1N0ZXAgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zdGVwID09PSAxICYmICRzY29wZS5lbnRyeUluZGV4ID4gMCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWy0tJHNjb3BlLmVudHJ5SW5kZXhdO1xuICAgIH1cbiAgICBlbHNlIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgJHNjb3BlLmdvQmFjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5zdGVwLS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgaWYgKGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBtID0+IG0uaXNTZWxlY3RlZCA9IChtID09PSBtb2RpZmllcikpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIENvbW1hbmRTdWJtaXRPcmRlcigpO1xuICAgICRzY29wZS5nb0JhY2soKTtcbiAgfTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaXRlbWVkaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdDb21tYW5kU3VibWl0T3JkZXInLFxuICAgICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAgICAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgICAgICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG5cbiAgICAgIHZhciBjdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc2NvcGUuZW50cnkgJiYgJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgICAgICRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAkc2NvcGUuaGFzUHJldmlvdXNDYXRlZ29yeSA9IGN1cnJlbnRJbmRleCA+IDA7XG4gICAgICAgICAgJHNjb3BlLmNhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdO1xuICAgICAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICAgICAkc2NvcGUuY2FuRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnbWVudScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5lbnRyeSAhPSBudWxsO1xuXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgIGluaXQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG5cbiAgICAgIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpbml0KHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBtb2RpZmllci5kYXRhLnRpdGxlICsgKG1vZGlmaWVyLmRhdGEucHJpY2UgPiAwID9cbiAgICAgICAgICAgICcgKCsnICsgU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKG1vZGlmaWVyLmRhdGEucHJpY2UpICsgJyknIDpcbiAgICAgICAgICAgICAgJydcbiAgICAgICAgICApO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zaG93TGVmdEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoY3VycmVudEluZGV4ID4gMCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vTWFrZSBzdXJlIFBpY2sgMSBtb2RpZmllciBjYXRlZ29yaWVzIGhhdmUgbWV0IHRoZSBzZWxlY3Rpb24gY29uZGl0aW9uLlxuICAgICAgICBpZigkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0uZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0ubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAgICAgLy9UT0RPOiBBZGQgbW9kYWwgcG9wdXAuIE11c3QgbWFrZSAxIHNlbGVjdGlvbiFcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJHNjb3BlLm5leHRDYXRlZ29yeSgpIDogJHNjb3BlLmRvbmUoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yaWdodEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJ05leHQnIDogJ0RvbmUnO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dSaWdodEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJyZW50SW5kZXgtLTtcbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5uZXh0Q2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gZnVuY3Rpb24oY2F0ZWdvcnksIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgICAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2hhbmdlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldykge1xuICAgICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdvQmFjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gIHZhciBNZW51TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQobWVudSA9PiB7XG4gICAgaWYgKCFtZW51KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLm1lbnUgPSBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBtZW51LmNhdGVnb3JpZXNcbiAgICAgIC5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ2NhdGVnb3J5JyxcbiAgICAgICAgICB0b2tlbjogY2F0ZWdvcnkudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBjYXRlZ29yeS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogY2F0ZWdvcnkuaW1hZ2UsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZS1tZW51LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUubWVudSA9IG1lbnU7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLm1lbnUgPSBsb2NhdGlvbi50eXBlID09PSAnbWVudScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIubWVudSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL25hdmlnYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdNYW5hZ2VtZW50U2VydmljZScsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ29tbWFuZFJlc2V0LCBDb21tYW5kU3VibWl0T3JkZXIsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50Q2xpY2sgPSBpdGVtID0+IHtcbiAgICBpZiAoaXRlbS5ocmVmKSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3VybCcsIHVybDogaXRlbS5ocmVmLnVybCB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQ7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gaXRlbTtcblxuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS5tZW51T3Blbikge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuYWR2ZXJ0aXNlbWVudHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IGRhdGEubWlzY1xuICAgICAgICAubWFwKGFkID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoYWQuc3JjLCAzMDAsIDI1MCksXG4gICAgICAgICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gICRzY29wZS5uYXZpZ2F0ZUJhY2sgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDb21tYW5kRmxpcFNjcmVlbigpO1xuICB9O1xuXG4gICRzY29wZS5vcGVuQ2FydCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9ICFDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcbiAgfTtcblxuICAkc2NvcGUuc2VhdE5hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZWF0TmFtZSA9IHZhbHVlID8gdmFsdWUubmFtZSA6ICdUYWJsZScpKTtcblxuICAkc2NvcGUucmVzZXRUYWJsZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUubWVudU9wZW4gPSAhJHNjb3BlLm1lbnVPcGVuO1xuXG4gICAgaWYgKCRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudCAmJiAkc2NvcGUubWVudU9wZW4pIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50LnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVTZXR0aW5ncyA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSAhJHNjb3BlLnNldHRpbmdzT3BlbjtcbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5jYXJ0Q291bnQgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKGNhcnQgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXJ0Q291bnQgPSBjYXJ0Lmxlbmd0aCk7XG4gIH0pO1xuXG4gICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuXG4gICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgQ29tbWFuZFN1Ym1pdE9yZGVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnZpZXdPcmRlciA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUucGF5QmlsbCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZGlzcGxheUJyaWdodG5lc3M6IDEwMCxcbiAgICBzb3VuZFZvbHVtZTogMTAwXG4gIH07XG5cbiAgJHNjb3BlLiR3YXRjaCgnc2V0dGluZ3Muc291bmRWb2x1bWUnLCAodmFsdWUsIG9sZCkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gb2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5zZXRTb3VuZFZvbHVtZSh2YWx1ZSk7XG4gIH0pO1xuICBNYW5hZ2VtZW50U2VydmljZS5nZXRTb3VuZFZvbHVtZSgpLnRoZW4oXG4gICAgcmVzcG9uc2UgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNldHRpbmdzLnNvdW5kVm9sdW1lID0gcmVzcG9uc2Uudm9sdW1lKSxcbiAgICBlID0+IHsgfVxuICApO1xuXG4gICRzY29wZS4kd2F0Y2goJ3NldHRpbmdzLmRpc3BsYXlCcmlnaHRuZXNzJywgKHZhbHVlLCBvbGQpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uuc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpO1xuICB9KTtcbiAgTWFuYWdlbWVudFNlcnZpY2UuZ2V0RGlzcGxheUJyaWdodG5lc3MoKS50aGVuKFxuICAgIHJlc3BvbnNlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZXR0aW5ncy5kaXNwbGF5QnJpZ2h0bmVzcyA9IHJlc3BvbnNlLmJyaWdodG5lc3MpLFxuICAgIGUgPT4geyB9XG4gICk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlID0gZGVzdGluYXRpb24gPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJztcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnaXRlbScpIHtcbiAgICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgICAgbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG4gICAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ob21lLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdIb21lQmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1N1cnZleU1hbmFnZXInLCAnU05BUENvbmZpZycsICdTTkFQRW52aXJvbm1lbnQnLCAnQ29tbWFuZFJlc2V0JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIFNoZWxsTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTdXJ2ZXlNYW5hZ2VyLCBTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIENvbW1hbmRSZXNldCkgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFsgUmVhY3QuRE9NLnRkKHsga2V5OiAtMSB9KSBdO1xuXG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvbWUtbWVudS1pdGVtJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7XG4gICAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDE2MCwgMTYwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocm93cyk7XG4gICAgICByZXN1bHQucHVzaChSZWFjdC5ET00udGQoeyBrZXk6IHJlc3VsdC5sZW5ndGggfSkpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKG51bGwsIHJlc3VsdCk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBbXTtcblxuICAgIHJlc3BvbnNlLm1lbnVzXG4gICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAucmVkdWNlKCh0aWxlcywgbWVudSkgPT4ge1xuICAgICAgaWYgKG1lbnUucHJvbW9zICYmIG1lbnUucHJvbW9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWVudS5wcm9tb3NcbiAgICAgICAgLmZpbHRlcihwcm9tbyA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBwcm9tby50eXBlICE9PSAzKVxuICAgICAgICAuZm9yRWFjaChwcm9tbyA9PiB7XG4gICAgICAgICAgdGlsZXMucHVzaCh7XG4gICAgICAgICAgICB0aXRsZTogcHJvbW8udGl0bGUsXG4gICAgICAgICAgICBpbWFnZTogcHJvbW8uaW1hZ2UsXG4gICAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgocHJvbW8uZGVzdGluYXRpb24pLFxuICAgICAgICAgICAgZGVzdGluYXRpb246IHByb21vLmRlc3RpbmF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICB0aWxlcy5wdXNoKHtcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogbWVudS5pbWFnZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH0sIHRpbGVzKTtcblxuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIb21lTWVudSwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdob21lLW1lbnUtbWFpbicpXG4gICAgICApO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4geyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUucHJlbG9hZCA9IGRlc3RpbmF0aW9uID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuICB9O1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5wcmVkaWNhdGVFdmVuID0gU2hlbGxNYW5hZ2VyLnByZWRpY2F0ZUV2ZW47XG4gICRzY29wZS5wcmVkaWNhdGVPZGQgPSBTaGVsbE1hbmFnZXIucHJlZGljYXRlT2RkO1xuXG4gICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gdmFsdWUgPyB2YWx1ZS5uYW1lIDogJ1RhYmxlJztcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmN1c3RvbWVyX25hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJfbmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QpO1xuICB9O1xuICB2YXIgcmVmcmVzaFN1cnZleSA9ICgpID0+IHtcbiAgICAkc2NvcGUuc3VydmV5QXZhaWxhYmxlID0gU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSAmJiAhU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG4gIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmFkZChyZWZyZXNoU3VydmV5KTtcbiAgU3VydmV5TWFuYWdlci5tb2RlbC5zdXJ2ZXlDb21wbGV0ZWQuYWRkKHJlZnJlc2hTdXJ2ZXkpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcbiAgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCgpO1xuICByZWZyZXNoU3VydmV5KCk7XG5cbiAgJHNjb3BlLmNoYXRBdmFpbGFibGUgPSBCb29sZWFuKFNOQVBDb25maWcuY2hhdCk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQ0xPU0VPVVQpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5TdXJ2ZXkgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUuc3VydmV5QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzdXJ2ZXknIH07XG4gIH07XG5cbiAgJHNjb3BlLnNlYXRDbGlja2VkID0gKCkgPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJDbGlja2VkID0gKCkgPT4ge1xuICAgIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNHdWVzdCkge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdhY2NvdW50JyB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DaGF0ID0gKCkgPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaXRlbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSXRlbUJhc2VDdHJsJyxcbiAgWyckc2NvcGUnLCAoJHNjb3BlKSA9PiB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FuYWx5dGljc01vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnRGF0YU1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JywgJ0NoYXRNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICB2YXIgSXRlbUltYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7XG4gICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRoaXMucHJvcHMubWVkaWEsIDYwMCwgNjAwKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlICYmICgkc2NvcGUud2Vic2l0ZVVybCB8fCAkc2NvcGUuZmxhc2hVcmwpKSB7XG4gICAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLndlYnNpdGVVcmwgPSBudWxsO1xuICAgICRzY29wZS5mbGFzaFVybCA9IG51bGw7XG5cbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBudWxsO1xuXG4gICAgICBpZiAoJHNjb3BlLnR5cGUgPT09IDEpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0tcGhvdG8nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnR5cGUgPSAxO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdHlwZSA9IHJlc3BvbnNlLnR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gMiAmJiByZXNwb25zZS53ZWJzaXRlKSB7XG4gICAgICAkc2NvcGUud2Vic2l0ZVVybCA9IHJlc3BvbnNlLndlYnNpdGUudXJsO1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKCRzY29wZS53ZWJzaXRlVXJsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMyAmJiByZXNwb25zZS5mbGFzaCkge1xuICAgICAgdmFyIHVybCA9ICcvZmxhc2gjdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQoZ2V0TWVkaWFVcmwocmVzcG9uc2UuZmxhc2gubWVkaWEsIDAsIDAsICdzd2YnKSkgK1xuICAgICAgICAnJndpZHRoPScgKyBlbmNvZGVVUklDb21wb25lbnQocmVzcG9uc2UuZmxhc2gud2lkdGgpICtcbiAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5mbGFzaC5oZWlnaHQpO1xuICAgICAgJHNjb3BlLmZsYXNoVXJsID0gV2ViQnJvd3Nlci5nZXRBcHBVcmwodXJsKTtcbiAgICAgIFdlYkJyb3dzZXIub3Blbigkc2NvcGUuZmxhc2hVcmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKHJlc3BvbnNlLCAxKTtcblxuICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEl0ZW1JbWFnZSwgeyBtZWRpYTogJHNjb3BlLmVudHJ5Lml0ZW0uaW1hZ2UgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtLXBob3RvJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnR5cGUgPSB0eXBlO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiB2YWx1ZSA/IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSkgOiAwO1xuXG4gICRzY29wZS5hZGRUb0NhcnQgPSAoKSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlbnRyeSA9ICRzY29wZS5lbnRyeTtcblxuICAgIGlmIChlbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgIENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCB0cnVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KTtcbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsR2lmdCA9ICgpID0+IENoYXRNYW5hZ2VyLmNhbmNlbEdpZnQoKTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2l0ZW1lZGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsXG4gICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsKSA9PiB7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcblxuICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG5cbiAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5lbnRyeSAmJiAkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAkc2NvcGUuaGFzTmV4dENhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggPiAxICYmXG4gICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICRzY29wZS5oYXNQcmV2aW91c0NhdGVnb3J5ID0gY3VycmVudEluZGV4ID4gMDtcbiAgICAgICRzY29wZS5jYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XTtcbiAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICRzY29wZS5jYW5Eb25lID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ21lbnUnICYmIGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICRzY29wZS5leGl0KCk7XG4gICAgfVxuICB9KTtcblxuICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAkc2NvcGUuZXhpdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGluaXQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmVudHJ5ICE9IG51bGw7XG5cbiAgICBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICBpbml0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuXG4gIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgIGluaXQodmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgcmV0dXJuIG1vZGlmaWVyLmRhdGEudGl0bGUgKyAobW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgJyAoKycgKyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UobW9kaWZpZXIuZGF0YS5wcmljZSkgKyAnKScgOlxuICAgICAgJydcbiAgICApO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgfTtcblxuICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgLy9NYWtlIHN1cmUgUGljayAxIG1vZGlmaWVyIGNhdGVnb3JpZXMgaGF2ZSBtZXQgdGhlIHNlbGVjdGlvbiBjb25kaXRpb24uXG4gICAgaWYoJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgaWYgKG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAvL1RPRE86IEFkZCBtb2RhbCBwb3B1cC4gTXVzdCBtYWtlIDEgc2VsZWN0aW9uIVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9ICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICRzY29wZS5uZXh0Q2F0ZWdvcnkoKSA6ICRzY29wZS5kb25lKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJpZ2h0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICdOZXh0JyA6ICdEb25lJztcbiAgfTtcblxuICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleC0tO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleCsrO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBtb2RpZmllcikge1xuICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkICYmIGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXcpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmV4aXQoKTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbmF1eC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWFpbkF1eEN0cmwnLCBbJyRzY29wZScsICdDb21tYW5kU3RhcnR1cCcsIGZ1bmN0aW9uKCRzY29wZSwgQ29tbWFuZFN0YXJ0dXApIHtcbiAgQ29tbWFuZFN0YXJ0dXAoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbnNuYXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01haW5TbmFwQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FwcENhY2hlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdBY3Rpdml0eU1vbml0b3InLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU29mdHdhcmVNYW5hZ2VyJywgJ1NOQVBDb25maWcnLCAnQ29tbWFuZFN0YXJ0dXAnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQXBwQ2FjaGUsIEN1c3RvbWVyTWFuYWdlciwgQWN0aXZpdHlNb25pdG9yLCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBOYXZpZ2F0aW9uTWFuYWdlciwgU29mdHdhcmVNYW5hZ2VyLCBTTkFQQ29uZmlnLCBDb21tYW5kU3RhcnR1cCkgPT4ge1xuXG4gIENvbW1hbmRTdGFydHVwKCk7XG5cbiAgJHNjb3BlLnRvdWNoID0gKCkgPT4gQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5hZGQodG9rZW4gPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKHRva2VuKSArICcgd291bGQgbGlrZSB0byBjaGF0IHdpdGggeW91LicpLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuYXBwcm92ZURldmljZSh0b2tlbik7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgfSwgKCkgPT4gQ2hhdE1hbmFnZXIuZGVjbGluZURldmljZSh0b2tlbikpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVxdWVzdFJlY2VpdmVkLmFkZCgodG9rZW4sIGRlc2NyaXB0aW9uKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUodG9rZW4pICsgJyB3b3VsZCBsaWtlIHRvIGdpZnQgeW91IGEgJyArIGRlc2NyaXB0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLmFjY2VwdEdpZnQodG9rZW4pO1xuICAgIH0sICgpID0+IENoYXRNYW5hZ2VyLmRlY2xpbmVHaWZ0KHRva2VuKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5hZGQobWVzc2FnZSA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydCgnQ2hhdCB3aXRoICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBkZWNsaW5lZC4gJyArXG4gICAgICAnVG8gc3RvcCByZWNpZXZpbmcgY2hhdCByZXF1ZXN0cywgb3BlbiB0aGUgY2hhdCBzY3JlZW4gYW5kIHRvdWNoIHRoZSBcIkNoYXQgb24vb2ZmXCIgYnV0dG9uLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoJ1lvdXIgY2hhdCByZXF1ZXN0IHRvICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBhY2NlcHRlZC4nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGFjY2VwdGVkIHlvdXIgZ2lmdC4gVGhlIGl0ZW0gd2lsbCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgZGVjbGluZWQgeW91ciBnaWZ0LiBUaGUgaXRlbSB3aWxsIE5PVCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cblxuICAgIGlmIChOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi50eXBlID09PSAnY2hhdCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGNsb3NlZCB0aGUgY2hhdCcpO1xuICAgIH1cbiAgICBlbHNlIGlmKCFtZXNzYWdlLnN0YXR1cyAmJiBtZXNzYWdlLnRvX2RldmljZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb24oJ05ldyBtZXNzYWdlIGZyb20gJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSk7XG4gICAgfVxuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVhZHkuYWRkKCgpID0+IHtcbiAgICBDaGF0TWFuYWdlci5zZW5kR2lmdChPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0KTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRBY2NlcHRlZC5hZGQoc3RhdHVzID0+IHtcbiAgICBpZiAoIXN0YXR1cyB8fCAhQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZSkge1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG5cbiAgICAgICAgQ2hhdE1hbmFnZXIuZW5kR2lmdCgpO1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNZW51QmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpID0+IHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIE1lbnVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGlsZUNsYXNzTmFtZSA9IFNoZWxsTWFuYWdlci50aWxlU3R5bGU7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKGZ1bmN0aW9uKHRpbGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB0aWxlQ2xhc3NOYW1lLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDM3MCwgMzcwKSArICcpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaSkge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7IGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBEYXRhTWFuYWdlci5tZW51ID0gbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLm1lbnUpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQoZnVuY3Rpb24obWVudSkge1xuICAgIGlmICghbWVudSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lbnUuY2F0ZWdvcmllcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS51cmwgPSAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHRpbGUuZGVzdGluYXRpb24pO1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogbWVudS5jYXRlZ29yaWVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQtbWVudScpXG4gICAgKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21vZGFsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNb2RhbEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICAgIERpYWxvZ01hbmFnZXIubW9kYWxTdGFydGVkLmFkZCgoKSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUudmlzaWJsZSA9IHRydWUpKTtcbiAgICBEaWFsb2dNYW5hZ2VyLm1vZGFsRW5kZWQuYWRkKCgpID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS52aXNpYmxlID0gZmFsc2UpKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbmF2aWdhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLm5hdmlnYXRlQmFjayA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIENvbW1hbmRGbGlwU2NyZWVuKCk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DYXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gIUNhcnRNb2RlbC5pc0NhcnRPcGVuO1xuICB9O1xuXG4gICRzY29wZS5vcGVuU2V0dGluZ3MgPSAoKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5tZW51T3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVNZW51ID0gKCkgPT4ge1xuICAgICRzY29wZS5tZW51T3BlbiA9ICEkc2NvcGUubWVudU9wZW47XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICEkc2NvcGUud2lkZSkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50c0FsbCA9IFtdO1xuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AgPSBbXTtcbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQm90dG9tID0gW107XG4gIHZhciBtYXBBZHZlcnRpc2VtZW50ID0gYWQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgIHRva2VuOiBhZC50b2tlblxuICAgIH07XG4gIH07XG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcCA9IHJlc3BvbnNlLnRvcC5tYXAobWFwQWR2ZXJ0aXNlbWVudCk7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20gPSByZXNwb25zZS5ib3R0b20ubWFwKG1hcEFkdmVydGlzZW1lbnQpO1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQWxsID0gJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wLmNvbmNhdCgkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20pO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuY2FydENvdW50ID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGg7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZChjYXJ0ID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2FydENvdW50ID0gY2FydC5sZW5ndGgpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCk7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuXG4gICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZSA9IGRlc3RpbmF0aW9uID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgIC8vbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ub3RpZmljYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ05vdGlmaWNhdGlvbkN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlcikge1xuICB2YXIgdGltZXI7XG5cbiAgJHNjb3BlLm1lc3NhZ2VzID0gW107XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc1Zpc2libGUpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gaXNWaXNpYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU5leHQoKSB7XG4gICAgdmFyIG1lc3NhZ2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8ICRzY29wZS5tZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWVzc2FnZXMucHVzaCgkc2NvcGUubWVzc2FnZXNbaV0pO1xuICAgIH1cblxuICAgICRzY29wZS5tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuXG4gICAgaWYgKCRzY29wZS5tZXNzYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRpbWVyID0gJHRpbWVvdXQoaGlkZU5leHQsIDQwMDApO1xuICB9XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvblJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2VzLnB1c2goeyB0ZXh0OiBtZXNzYWdlIH0pO1xuICAgIH0pO1xuXG4gICAgdXBkYXRlVmlzaWJpbGl0eSh0cnVlKTtcblxuICAgIGlmICh0aW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9XG5cbiAgICB0aW1lciA9ICR0aW1lb3V0KGhpZGVOZXh0LCA0MDAwKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3NjcmVlbnNhdmVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTY3JlZW5zYXZlckN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLCAnQWN0aXZpdHlNb25pdG9yJywgJ0RhdGFQcm92aWRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBTaGVsbE1hbmFnZXIsIEFjdGl2aXR5TW9uaXRvciwgRGF0YVByb3ZpZGVyKSA9PiB7XG4gICAgXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gc2hvd0ltYWdlcyh2YWx1ZXMpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pbWFnZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0ubWVkaWEsIDE5MjAsIDEwODAsICdqcGcnKSxcbiAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGl0ZW0ubWVkaWEpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNob3dJbWFnZXMoU2hlbGxNYW5hZ2VyLm1vZGVsLnNjcmVlbnNhdmVycyk7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5zY3JlZW5zYXZlcnNDaGFuZ2VkLmFkZChzaG93SW1hZ2VzKTtcblxuICBBY3Rpdml0eU1vbml0b3IuYWN0aXZlQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gdmFsdWUgPT09IGZhbHNlICYmICgkc2NvcGUuaW1hZ2VzICYmICRzY29wZS5pbWFnZXMubGVuZ3RoID4gMCk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zaWduaW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1NpZ25JbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTb2NpYWxNYW5hZ2VyJywgJ1NOQVBDb25maWcnLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU29jaWFsTWFuYWdlciwgU05BUENvbmZpZywgV2ViQnJvd3NlcikgPT4ge1xuXG4gIHZhciBTVEVQX1NQTEFTSCA9IDEsXG4gICAgICBTVEVQX0xPR0lOID0gMixcbiAgICAgIFNURVBfUkVHSVNUUkFUSU9OID0gMyxcbiAgICAgIFNURVBfR1VFU1RTID0gNCxcbiAgICAgIFNURVBfRVZFTlQgPSA1LFxuICAgICAgU1RFUF9SRVNFVCA9IDY7XG5cbiAgJHNjb3BlLlNURVBfU1BMQVNIID0gU1RFUF9TUExBU0g7XG4gICRzY29wZS5TVEVQX0xPR0lOID0gU1RFUF9MT0dJTjtcbiAgJHNjb3BlLlNURVBfUkVHSVNUUkFUSU9OID0gU1RFUF9SRUdJU1RSQVRJT047XG4gICRzY29wZS5TVEVQX0dVRVNUUyA9IFNURVBfR1VFU1RTO1xuICAkc2NvcGUuU1RFUF9FVkVOVCA9IFNURVBfRVZFTlQ7XG4gICRzY29wZS5TVEVQX1JFU0VUID0gU1RFUF9SRVNFVDtcblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUENvbmZpZy5sb2NhdGlvbl9uYW1lO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTG9naW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5sb2dpbiA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3JlZGVudGlhbHMgPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfTE9HSU47XG4gIH07XG5cbiAgJHNjb3BlLmd1ZXN0TG9naW4gPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5ndWVzdExvZ2luKCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5kb0xvZ2luID0gKGNyZWRlbnRpYWxzKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbihjcmVkZW50aWFscyB8fCAkc2NvcGUuY3JlZGVudGlhbHMpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0dFTkVSSUNfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgU29jaWFsIGxvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUubG9naW5GYWNlYm9vayA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgU29jaWFsTWFuYWdlci5sb2dpbkZhY2Vib29rKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpblR3aXR0ZXIgPSAoKSA9PiB7XG4gICAgc29jaWFsQnVzeSgpO1xuICAgIFNvY2lhbE1hbmFnZXIubG9naW5Ud2l0dGVyKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpbkdvb2dsZSA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgU29jaWFsTWFuYWdlci5sb2dpbkdvb2dsZVBsdXMoKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZWdpc3RyYXRpb25cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5yZWdpc3RlciA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVnaXN0cmF0aW9uID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1JFR0lTVFJBVElPTjtcbiAgfTtcblxuICAkc2NvcGUuZG9SZWdpc3RyYXRpb24gPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICRzY29wZS5yZWdpc3RyYXRpb24udXNlcm5hbWUgPSAkc2NvcGUucmVnaXN0cmF0aW9uLmVtYWlsO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnNpZ25VcCgkc2NvcGUucmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmRvTG9naW4oe1xuICAgICAgICAgIGxvZ2luOiAkc2NvcGUucmVnaXN0cmF0aW9uLnVzZXJuYW1lLFxuICAgICAgICAgIHBhc3N3b3JkOiAkc2NvcGUucmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEd1ZXN0IGNvdW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuc2Vzc2lvbiA9IHtcbiAgICBndWVzdENvdW50OiAxLFxuICAgIHNwZWNpYWw6IGZhbHNlXG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdEd1ZXN0Q291bnQgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zZXNzaW9uLmd1ZXN0Q291bnQgPiAxKSB7XG4gICAgICBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50ID0gJHNjb3BlLnNlc3Npb24uZ3Vlc3RDb3VudDtcbiAgICAgICRzY29wZS5zdGVwID0gU1RFUF9FVkVOVDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmRTaWduSW4oKTtcbiAgICB9XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBFdmVudFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnN1Ym1pdFNwZWNpYWxFdmVudCA9ICh2YWx1ZSkgPT4ge1xuICAgICRzY29wZS5zZXNzaW9uLnNwZWNpYWwgPSBTZXNzaW9uTWFuYWdlci5zcGVjaWFsRXZlbnQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICBlbmRTaWduSW4oKTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlc2V0IHBhc3N3b3JkXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucmVzZXRQYXNzd29yZCA9ICgpID0+IHtcbiAgICAkc2NvcGUucGFzc3dvcmRyZXNldCA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9SRVNFVDtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRSZXNldFN1Ym1pdCA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnJlc2V0UGFzc3dvcmQoJHNjb3BlLnBhc3N3b3JkcmVzZXQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5wYXNzd29yZFJlc2V0ID0gZmFsc2U7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkUmVzZXRDYW5jZWwgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1NQTEFTSDtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZnVuY3Rpb24gc29jaWFsTG9naW4oYXV0aCkge1xuICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpblNvY2lhbChhdXRoKS50aGVuKCgpID0+IHtcbiAgICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfR0VORVJJQ19FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxFcnJvcigpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG4gICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9HRU5FUklDX0VSUk9SKTtcbiAgfVxuXG4gIHZhciBzb2NpYWxKb2IsIHNvY2lhbFRpbWVyO1xuXG4gIGZ1bmN0aW9uIHNvY2lhbEJ1c3koKSB7XG4gICAgc29jaWFsQnVzeUVuZCgpO1xuXG4gICAgc29jaWFsSm9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgIHNvY2lhbFRpbWVyID0gJHRpbWVvdXQoc29jaWFsQnVzeUVuZCwgMTIwICogMTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxCdXN5RW5kKCkge1xuICAgIGlmIChzb2NpYWxKb2IpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKHNvY2lhbEpvYik7XG4gICAgICBzb2NpYWxKb2IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChzb2NpYWxUaW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHNvY2lhbFRpbWVyKTtcbiAgICAgIHNvY2lhbFRpbWVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbmRTaWduSW4oKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIHJldHVybiBlbmRTaWduSW4oKTtcbiAgfVxuXG4gICRzY29wZS5pbml0aWFsaXplZCA9IHRydWU7XG4gICRzY29wZS5zdGVwID0gU1RFUF9TUExBU0g7XG5cbiAgdmFyIG1vZGFsID0gRGlhbG9nTWFuYWdlci5zdGFydE1vZGFsKCk7XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuICAgIERpYWxvZ01hbmFnZXIuZW5kTW9kYWwobW9kYWwpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc3RhcnR1cC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU3RhcnR1cEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICB2YXIgam9iO1xuXG4gICR0aW1lb3V0KCgpID0+IHtcbiAgICBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gIH0sIDEwMDApO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zdXJ2ZXkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1N1cnZleUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1hbmFnZXInLCAnQ3VzdG9tZXJNb2RlbCcsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTWFuYWdlciwgQ3VzdG9tZXJNb2RlbCwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU3VydmV5TWFuYWdlcikge1xuXG4gIGlmICghU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgIVN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkgfHwgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmNvbW1lbnQgPSAnJztcbiAgJHNjb3BlLmVtYWlsID0gJyc7XG4gICRzY29wZS5oYWRfcHJvYmxlbXMgPSBmYWxzZTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBhZ2VzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZXMgPSBbXTtcbiAgdmFyIHBhZ2VzID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VzJyk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBJbmRleFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VJbmRleCA9IC0xO1xuICB2YXIgcGFnZUluZGV4ID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VJbmRleCcpO1xuICBwYWdlSW5kZXguY2hhbmdlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wYWdlID0gJHNjb3BlLnBhZ2VJbmRleCA+IC0xID8gJHNjb3BlLnBhZ2VzWyRzY29wZS5wYWdlSW5kZXhdIDogeyBxdWVzdGlvbnM6IFtdIH07XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUucGFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJCgnI3JhdGUtJyArIGl0ZW0udG9rZW4pLnJhdGVpdCh7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDUsXG4gICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgcmVzZXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tpbmdmbGQ6ICcjcmFuZ2UtJyArIGl0ZW0udG9rZW5cbiAgICAgICAgICB9KS5iaW5kKCdyYXRlZCcsIGZ1bmN0aW9uKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaXRlbS5mZWVkYmFjayA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ291bnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlQ291bnQgPSAwO1xuICBwYWdlcy5jaGFuZ2VzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBhZ2VDb3VudCA9ICRzY29wZS5wYWdlcy5sZW5ndGg7XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBnZW5lcmF0ZVBhc3N3b3JkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IDgsXG4gICAgICAgIGNoYXJzZXQgPSAnYWJjZGVmZ2hrbnBxcnN0dXZ3eHl6QUJDREVGR0hLTU5QUVJTVFVWV1hZWjIzNDU2Nzg5JyxcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGFyc2V0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBzdWJtaXRGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wYWdlcy5yZWR1Y2UoKGFuc3dlcnMsIHBhZ2UpID0+IHtcbiAgICAgIHJldHVybiBwYWdlLnJlZHVjZSgoYW5zd2VycywgcXVlc3Rpb24pID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQocXVlc3Rpb24uZmVlZGJhY2spO1xuXG4gICAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgICBhbnN3ZXJzLnB1c2goe1xuICAgICAgICAgICAgc3VydmV5OiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5LnRva2VuLFxuICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnRva2VuLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW5zd2VycztcbiAgICAgIH0sIGFuc3dlcnMpO1xuICAgIH0sIFtdKVxuICAgIC5mb3JFYWNoKGFuc3dlciA9PiBBbmFseXRpY3NNb2RlbC5sb2dBbnN3ZXIoYW5zd2VyKSk7XG5cbiAgICBpZiAoJHNjb3BlLmNvbW1lbnQgJiYgJHNjb3BlLmNvbW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQ29tbWVudCh7XG4gICAgICAgIHR5cGU6ICdmZWVkYmFjaycsXG4gICAgICAgIHRleHQ6ICRzY29wZS5jb21tZW50XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGUgPSB0cnVlO1xuXG4gICAgaWYgKCRzY29wZS5oYWRfcHJvYmxlbXMgJiYgIU9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCkge1xuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuZW1haWwgJiYgJHNjb3BlLmVtYWlsLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBnZW5lcmF0ZVBhc3N3b3JkKCk7XG5cbiAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbih7XG4gICAgICAgIGVtYWlsOiAkc2NvcGUuZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogJHNjb3BlLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIH1cbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJldmlvdXNQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5wYWdlSW5kZXggPiAwKSB7XG4gICAgICAkc2NvcGUucGFnZUluZGV4LS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5uZXh0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGFnZUluZGV4IDwgJHNjb3BlLnBhZ2VDb3VudCAtIDEpIHtcbiAgICAgICRzY29wZS5wYWdlSW5kZXgrKztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuc3RlcCA8IDMpIHtcbiAgICAgICRzY29wZS5zdGVwKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLnN0ZXAgPCAyKSB7XG4gICAgICAkc2NvcGUuc3RlcCsrO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zdWJtaXRQcm9ibGVtID0gZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgJHNjb3BlLmhhZF9wcm9ibGVtcyA9IEJvb2xlYW4oc3RhdHVzKTtcbiAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuc3RlcCA+IDApIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYWdlO1xuXG4gICAgJHNjb3BlLmhhc19lbWFpbCA9IEN1c3RvbWVyTW9kZWwuaGFzQ3JlZGVudGlhbHM7XG5cbiAgICBmdW5jdGlvbiBidWlsZFN1cnZleSgpIHtcbiAgICAgIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkucXVlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYWdlIHx8IHBhZ2UubGVuZ3RoID4gNCkge1xuICAgICAgICAgIHBhZ2UgPSBbXTtcbiAgICAgICAgICAkc2NvcGUucGFnZXMucHVzaChwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW0uZmVlZGJhY2sgPSAwO1xuICAgICAgICBwYWdlLnB1c2goaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSkge1xuICAgICAgYnVpbGRTdXJ2ZXkoKTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5hZGQoKCkgPT4gYnVpbGRTdXJ2ZXkoKSk7XG5cbiAgICAkc2NvcGUucGFnZUluZGV4ID0gMDtcbiAgICAkc2NvcGUuc3RlcCA9IDA7XG4gIH0pKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3VybC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignVXJsQ3RybCcsXG4gIFsnJHNjb3BlJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1dlYkJyb3dzZXInLFxuICAoJHNjb3BlLCBOYXZpZ2F0aW9uTWFuYWdlciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gIFdlYkJyb3dzZXIub3BlbihOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi51cmwpO1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3dlYi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignV2ViQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gICRzY29wZS5uYXZpZ2F0ZWQgPSBlID0+IFdlYkJyb3dzZXIubmF2aWdhdGVkKGUudGFyZ2V0LnNyYyk7XG5cbiAgV2ViQnJvd3Nlci5vbk9wZW4uYWRkKHVybCA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgIGlmICghV2ViQnJvd3Nlci5pc0V4dGVybmFsKSB7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5icm93c2VyVXJsID0gdXJsO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIFdlYkJyb3dzZXIub25DbG9zZS5hZGQoKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGlmICghV2ViQnJvd3Nlci5pc0V4dGVybmFsKSB7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5icm93c2VyVXJsID0gV2ViQnJvd3Nlci5nZXRBcHBVcmwoJy9ibGFuaycpO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJywgWydhbmd1bGFyLWJhY29uJ10pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL2dhbGxlcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdnYWxsZXJ5JywgW1xuICAnQWN0aXZpdHlNb25pdG9yJywgJ1NoZWxsTWFuYWdlcicsICckdGltZW91dCcsXG4gIChBY3Rpdml0eU1vbml0b3IsIFNoZWxsTWFuYWdlciwgJHRpbWVvdXQpID0+IHtcblxuICB2YXIgc2xpZGVyLFxuICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgIG1vZGU6ICdmYWRlJyxcbiAgICAgICAgd3JhcHBlckNsYXNzOiAncGhvdG8tZ2FsbGVyeSdcbiAgICAgIH07XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIHNjb3BlOiB7XG4gICAgICBpbWFnZXM6ICc9JyxcbiAgICAgIGltYWdld2lkdGggOiAnPT8nLFxuICAgICAgaW1hZ2VoZWlnaHQ6ICc9PydcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnZ2FsbGVyeScpLFxuICAgIGxpbms6IChzY29wZSwgZWxlbSwgYXR0cnMpID0+IHtcbiAgICAgIGVsZW0ucmVhZHkoKCkgPT4ge1xuICAgICAgICBzbGlkZXIgPSAkKCcuYnhzbGlkZXInLCBlbGVtKS5ieFNsaWRlcihzZXR0aW5ncyk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdpbWFnZXMnLCAoKSA9PiB7XG4gICAgICAgIHNjb3BlLm1lZGlhcyA9IChzY29wZS5pbWFnZXMgfHwgW10pLm1hcChpbWFnZSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaW1hZ2UsIGF0dHJzLmltYWdld2lkdGgsIGF0dHJzLmltYWdlaGVpZ2h0KSk7XG4gICAgICAgIHNldHRpbmdzLnBhZ2VyID0gc2NvcGUubWVkaWFzLmxlbmd0aCA+IDE7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHNsaWRlci5yZWxvYWRTbGlkZXIoc2V0dGluZ3MpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9vbmlmcmFtZWxvYWQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdvbklmcmFtZUxvYWQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiB7XG4gICAgICBjYWxsYmFjazogJyZvbklmcmFtZUxvYWQnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoc2NvcGUuY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgc2NvcGUuY2FsbGJhY2soeyBldmVudDogZSB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvb25rZXlkb3duLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnb25LZXlkb3duJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBmdW5jdGlvblRvQ2FsbCA9IHNjb3BlLiRldmFsKGF0dHJzLm9uS2V5ZG93bik7XG4gICAgICBlbGVtLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGZ1bmN0aW9uVG9DYWxsKGUud2hpY2gpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvcXVhbnRpdHkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdxdWFudGl0eScsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgcXVhbnRpdHk6ICc9JyxcbiAgICAgIG1pbjogJz0nLFxuICAgICAgbWF4OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUubWluID0gc2NvcGUubWluIHx8IDE7XG4gICAgICBzY29wZS5tYXggPSBzY29wZS5tYXggfHwgOTtcbiAgICAgIHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIG1pbjogc2NvcGUubWluLFxuICAgICAgICBtYXg6IHNjb3BlLm1heCxcbiAgICAgICAgcXVhbnRpdHk6IHBhcnNlSW50KHNjb3BlLnF1YW50aXR5KVxuICAgICAgfTtcblxuICAgICAgc2NvcGUuZGVjcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPiBzY29wZS5kYXRhLm1pbiA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSAtIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWluO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuaW5jcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPCBzY29wZS5kYXRhLm1heCA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSArIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWF4O1xuICAgICAgfTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnaW5wdXQtcXVhbnRpdHknKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3Njcm9sbGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2Nyb2xsZXInLCBbJ0FjdGl2aXR5TW9uaXRvcicsICdTTkFQRW52aXJvbm1lbnQnLCBmdW5jdGlvbiAoQWN0aXZpdHlNb25pdG9yLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0MnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgaWYgKFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnKSB7XG4gICAgICAgICQoZWxlbSkua2luZXRpYyh7XG4gICAgICAgICAgeTogZmFsc2UsIHN0b3BwZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2Nyb2xsZ2x1ZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3Njcm9sbGdsdWUnLCBbJyRwYXJzZScsIGZ1bmN0aW9uICgkcGFyc2UpIHtcbiAgZnVuY3Rpb24gdW5ib3VuZFN0YXRlKGluaXRWYWx1ZSl7XG4gICAgdmFyIGFjdGl2YXRlZCA9IGluaXRWYWx1ZTtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgYWN0aXZhdGVkID0gdmFsdWU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZVdheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNjb3BlKXtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXR0ZXIoc2NvcGUpO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbigpe31cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gdHdvV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2V0dGVyLCBzY29wZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHNjb3BlKTtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBpZih2YWx1ZSAhPT0gZ2V0dGVyKHNjb3BlKSl7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZXR0ZXIoc2NvcGUsIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0ciwgc2NvcGUpe1xuICAgIGlmKGF0dHIgIT09IFwiXCIpe1xuICAgICAgdmFyIGdldHRlciA9ICRwYXJzZShhdHRyKTtcbiAgICAgIGlmKGdldHRlci5hc3NpZ24gIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBnZXR0ZXIuYXNzaWduLCBzY29wZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5ib3VuZFN0YXRlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcHJpb3JpdHk6IDEsXG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgJGVsLCBhdHRycyl7XG4gICAgICB2YXIgZWwgPSAkZWxbMF0sXG4gICAgICBhY3RpdmF0aW9uU3RhdGUgPSBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0cnMuc2Nyb2xsZ2x1ZSwgc2NvcGUpO1xuXG4gICAgICBmdW5jdGlvbiBzY3JvbGxUb0JvdHRvbSgpe1xuICAgICAgICBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uU2NvcGVDaGFuZ2VzKCl7XG4gICAgICAgIGlmKGFjdGl2YXRpb25TdGF0ZS5nZXRWYWx1ZSgpICYmICFzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKSl7XG4gICAgICAgICAgc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKXtcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFRvcCArIGVsLmNsaWVudEhlaWdodCArIDEgPj0gZWwuc2Nyb2xsSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblNjcm9sbCgpe1xuICAgICAgICBhY3RpdmF0aW9uU3RhdGUuc2V0VmFsdWUoc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCkpO1xuICAgICAgfVxuXG4gICAgICBzY29wZS4kd2F0Y2gob25TY29wZUNoYW5nZXMpO1xuICAgICAgJGVsLmJpbmQoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2xpZGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2xpZGVyJyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNvdXJjZTogJz0nLFxuICAgICAgc2xpZGVjbGljazogJz0nLFxuICAgICAgc2xpZGVzaG93OiAnPScsXG4gICAgICB0aW1lb3V0OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgdmFyIHRpbWVvdXQgPSBzY29wZS50aW1lb3V0IHx8IDUwMDA7XG4gICAgICBzY29wZS5zb3VyY2UgPSBzY29wZS5zb3VyY2UgfHwgW107XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIGNoYW5nZUltYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzY29wZS5zb3VyY2UubGVuZ3RoID09PSAwIHx8IHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcblxuICAgICAgICBzY29wZS5zb3VyY2UuZm9yRWFjaChmdW5jdGlvbihlbnRyeSwgaSl7XG4gICAgICAgICAgZW50cnkudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZW50cnkgPSBzY29wZS5zb3VyY2Vbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgICAgZW50cnkudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNjb3BlLnNsaWRlc2hvdykge1xuICAgICAgICAgIHNjb3BlLnNsaWRlc2hvdyhlbnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHZhciB2ID0gJCgndmlkZW8nLCBlbGVtKTtcbiAgICAgICAgICB2LmF0dHIoJ3NyYycsIGVudHJ5LnNyYyk7XG4gICAgICAgICAgdmFyIHZpZGVvID0gdi5nZXQoMCk7XG5cbiAgICAgICAgICBpZiAoIXZpZGVvKSB7XG4gICAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIDMwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9uVmlkZW9FbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBzY29wZS5uZXh0KCk7IH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgb25WaWRlb0Vycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25WaWRlb0Vycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgc2NvcGUubmV4dCgpOyB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uVmlkZW9FcnJvciwgZmFsc2UpO1xuXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAge1xuICAgICAgICAgICAgdmlkZW8ubG9hZCgpO1xuICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmFibGUgdG8gcGxheSB2aWRlbzogJyArIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA8IHNjb3BlLnNvdXJjZS5sZW5ndGgtMSA/XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4KysgOlxuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgIGNoYW5nZUltYWdlKCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5wcmV2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA+IDAgP1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleC0tIDpcbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5zb3VyY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgY2hhbmdlSW1hZ2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB0aW1lcjtcblxuICAgICAgdmFyIHNsaWRlckZ1bmMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNjb3BlLnNvdXJjZS5sZW5ndGggPT09IDAgfHwgc2NvcGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY29wZS5uZXh0KCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ3NvdXJjZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdkaXNhYmxlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2xpZGVyRnVuYygpO1xuXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnc2xpZGVyJylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zd2l0Y2guanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzd2l0Y2gnLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRpc2FibGVkOiAnPT8nLFxuICAgICAgc2VsZWN0ZWQ6ICc9PydcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUuZGlzYWJsZWQgPSBCb29sZWFuKHNjb3BlLmRpc2FibGVkKTtcbiAgICAgIHNjb3BlLnNlbGVjdGVkID0gQm9vbGVhbihzY29wZS5zZWxlY3RlZCk7XG4gICAgICBzY29wZS5kYXRhID0ge1xuICAgICAgICBkaXNhYmxlZDogQm9vbGVhbihzY29wZS5kaXNhYmxlZCksXG4gICAgICAgIHNlbGVjdGVkOiBCb29sZWFuKHNjb3BlLnNlbGVjdGVkKSxcbiAgICAgICAgY2hhbmdlZDogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUuc2VsZWN0ZWQgPSBzY29wZS5kYXRhLnNlbGVjdGVkID0gIXNjb3BlLmRhdGEuc2VsZWN0ZWQ7XG4gICAgICAgIHNjb3BlLmRhdGEuY2hhbmdlZCA9IHRydWU7XG4gICAgICB9O1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdpbnB1dC1zd2l0Y2gnKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnLCBbXSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvcGFydGlhbC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3BhcnRpYWwnLCBbJ1NoZWxsTWFuYWdlcicsIChTaGVsbE1hbmFnZXIpID0+IHtcbiAgcmV0dXJuIChuYW1lKSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy90aHVtYm5haWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCd0aHVtYm5haWwnLCBbJ1NoZWxsTWFuYWdlcicsIFNoZWxsTWFuYWdlciA9PiB7XG4gIHJldHVybiAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3RydXN0dXJsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigndHJ1c3RVcmwnLCBbJyRzY2UnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwodmFsKTtcbiAgICB9O1xufV0pO1xuXG4vL3NyYy9qcy9zZXJ2aWNlcy5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5zZXJ2aWNlcycsIFsnbmdSZXNvdXJjZScsICdTTkFQLmNvbmZpZ3MnXSlcblxuICAuZmFjdG9yeSgnTG9nZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAoU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9nZ2VyKFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnJGV4Y2VwdGlvbkhhbmRsZXInLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gKGV4Y2VwdGlvbiwgY2F1c2UpID0+IHtcbiAgICAgIExvZ2dlci5mYXRhbChleGNlcHRpb24uc3RhY2ssIGNhdXNlLCBleGNlcHRpb24pO1xuICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgIH07XG4gIH1dKVxuXG4gIC8vU2VydmljZXNcblxuICAuZmFjdG9yeSgnQ2FyZFJlYWRlcicsIFsnTWFuYWdlbWVudFNlcnZpY2UnLCAoTWFuYWdlbWVudFNlcnZpY2UpID0+IHtcbiAgICB3aW5kb3cuU25hcENhcmRSZWFkZXIgPSBuZXcgYXBwLkNhcmRSZWFkZXIoTWFuYWdlbWVudFNlcnZpY2UpO1xuICAgIHJldHVybiB3aW5kb3cuU25hcENhcmRSZWFkZXI7XG4gIH1dKVxuICAuZmFjdG9yeSgnRHRzQXBpJywgWydTTkFQSG9zdHMnLCAnU2Vzc2lvblByb3ZpZGVyJywgKFNOQVBIb3N0cywgU2Vzc2lvblByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQmFja2VuZEFwaShTTkFQSG9zdHMsIFNlc3Npb25Qcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnTWFuYWdlbWVudFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICdTTkFQRW52aXJvbm1lbnQnLCAoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5NYW5hZ2VtZW50U2VydmljZSgkcmVzb3VyY2UsIFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvblNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICgkcmVzb3VyY2UpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uU2VydmljZSgkcmVzb3VyY2UpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvY2tldENsaWVudCcsIFsnU2Vzc2lvblByb3ZpZGVyJywgJ0xvZ2dlcicsIChTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvY2tldENsaWVudChTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnVGVsZW1ldHJ5U2VydmljZScsIFsnJHJlc291cmNlJywgKCRyZXNvdXJjZSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlRlbGVtZXRyeVNlcnZpY2UoJHJlc291cmNlKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdXZWJCcm93c2VyJywgWyckd2luZG93JywgJ0FuYWx5dGljc01vZGVsJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQSG9zdHMnLCAoJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykgPT4ge1xuICAgIHdpbmRvdy5TbmFwV2ViQnJvd3NlciA9IG5ldyBhcHAuV2ViQnJvd3Nlcigkd2luZG93LCBBbmFseXRpY3NNb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICByZXR1cm4gd2luZG93LlNuYXBXZWJCcm93c2VyO1xuICB9XSlcblxuICAvL01vZGVsc1xuXG4gIC5mYWN0b3J5KCdBcHBDYWNoZScsIFsnTG9nZ2VyJywgKExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFwcENhY2hlKExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTW9kZWwnLCBbJ1N0b3JhZ2VQcm92aWRlcicsICdIZWF0TWFwJywgKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01vZGVsKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2FydE1vZGVsJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnQ2hhdE1vZGVsJywgWydTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DaGF0TW9kZWwoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0N1c3RvbWVyTW9kZWwnLCBbJ1NOQVBDb25maWcnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTW9kZWwoU05BUENvbmZpZywgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEYXRhUHJvdmlkZXInLCBbJ1NOQVBDb25maWcnLCAnRHRzQXBpJywgKFNOQVBDb25maWcsIER0c0FwaSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRhdGFQcm92aWRlcihTTkFQQ29uZmlnLCBEdHNBcGkpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0hlYXRNYXAnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuSGVhdE1hcChkb2N1bWVudC5ib2R5KTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0xvY2F0aW9uTW9kZWwnLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Mb2NhdGlvbk1vZGVsKFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAoU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuT3JkZXJNb2RlbChTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NoZWxsTW9kZWwnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2hlbGxNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnU3VydmV5TW9kZWwnLCBbJ1NOQVBDb25maWcnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlN1cnZleU1vZGVsKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvblByb3ZpZGVyJywgWydTZXNzaW9uU2VydmljZScsICdTdG9yYWdlUHJvdmlkZXInLCAoU2Vzc2lvblNlcnZpY2UsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25Qcm92aWRlcihTZXNzaW9uU2VydmljZSwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTdG9yYWdlUHJvdmlkZXInLCAoKSA9PiAge1xuICAgIHJldHVybiAoaWQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgYXBwLkxvY2FsU3RvcmFnZVN0b3JlKGlkKTtcbiAgICB9O1xuICB9KVxuXG4gIC8vTWFuYWdlcnNcblxuICAuZmFjdG9yeSgnQWN0aXZpdHlNb25pdG9yJywgWyckcm9vdFNjb3BlJywgJyR0aW1lb3V0JywgKCRyb290U2NvcGUsICR0aW1lb3V0KSA9PiB7XG4gICAgdmFyIG1vbml0b3IgPSBuZXcgYXBwLkFjdGl2aXR5TW9uaXRvcigkcm9vdFNjb3BlLCAkdGltZW91dCk7XG4gICAgbW9uaXRvci50aW1lb3V0ID0gMzAwMDA7XG4gICAgcmV0dXJuIG1vbml0b3I7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTWFuYWdlcicsIFsnVGVsZW1ldHJ5U2VydmljZScsICdBbmFseXRpY3NNb2RlbCcsICdMb2dnZXInLCAoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01hbmFnZXIoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ3VzdG9tZXJNYW5hZ2VyJywgWydTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdEdHNBcGknLCAnQ3VzdG9tZXJNb2RlbCcsIChTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTWFuYWdlcihTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2hhdE1hbmFnZXInLCBbJ0FuYWx5dGljc01vZGVsJywgJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU29ja2V0Q2xpZW50JywgKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNoYXRNYW5hZ2VyKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGF0YU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdMb2dnZXInLCAnU05BUEVudmlyb25tZW50JywgKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EYXRhTWFuYWdlcihEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEaWFsb2dNYW5hZ2VyJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRpYWxvZ01hbmFnZXIoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ05hdmlnYXRpb25NYW5hZ2VyJywgWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckd2luZG93JywgJ0FuYWx5dGljc01vZGVsJywgKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5OYXZpZ2F0aW9uTWFuYWdlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIEFuYWx5dGljc01vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1hbmFnZXInLCBbJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0RhdGFQcm92aWRlcicsICdEdHNBcGknLCAnTG9jYXRpb25Nb2RlbCcsICdPcmRlck1vZGVsJywgKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5PcmRlck1hbmFnZXIoQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBEYXRhUHJvdmlkZXIsIER0c0FwaSwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvbk1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNb2RlbCcsICdTdXJ2ZXlNb2RlbCcsICdTdG9yYWdlUHJvdmlkZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25NYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2hlbGxNYW5hZ2VyJywgWyckc2NlJywgJ0RhdGFQcm92aWRlcicsICdTaGVsbE1vZGVsJywgJ1NOQVBDb25maWcnLCAnU05BUEVudmlyb25tZW50JywgJ1NOQVBIb3N0cycsICgkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKSA9PiB7XG4gICAgbGV0IG1hbmFnZXIgPSBuZXcgYXBwLlNoZWxsTWFuYWdlcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICBEYXRhUHJvdmlkZXIuX2dldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IG1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7IC8vVG9EbzogcmVmYWN0b3JcbiAgICByZXR1cm4gbWFuYWdlcjtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2NpYWxNYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAnRHRzQXBpJywgJ1dlYkJyb3dzZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2NpYWxNYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvZnR3YXJlTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgKFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvZnR3YXJlTWFuYWdlcihTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1N1cnZleU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdTdXJ2ZXlNb2RlbCcsIChEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU3VydmV5TWFuYWdlcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKTtcbiAgfV0pO1xuIl19
