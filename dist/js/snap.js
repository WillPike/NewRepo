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
      this.alertRequested.dispatch(message, title);
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
      return this.$$sce.trustAsResourceUrl('//' + this._Hosts['static'].host + this._Hosts['static'].path + '/dist/' + this._Environment.version + ('/assets/' + this._Config.theme.layout + '/' + file));
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
  function staticHostRegex() {
    return new RegExp('.*' + SNAP_HOSTS_CONFIG['static'] + '.*');
  }

  function getPartialUrl(name) {
    return '//' + SNAP_HOSTS_CONFIG['static'].host + SNAP_HOSTS_CONFIG['static'].path + '/dist/' + SNAP_ENVIRONMENT.version + ('/assets/' + SNAP_CONFIG.theme.layout + '/partials/' + name + '.html');
  }

  angular.module('SNAPApplication', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', function ($locationProvider, $routeProvider, $sceDelegateProvider) {

    $sceDelegateProvider.resourceUrlWhitelist(['self', staticHostRegex()]);

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

  angular.module('SNAPAuxiliares', ['ngRoute', 'ngAnimate', 'ngTouch', 'ngSanitize', 'SNAP.configs', 'SNAP.controllers', 'SNAP.directives', 'SNAP.filters', 'SNAP.services']).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {

    $locationProvider.html5Mode(false);

    $routeProvider.when('/', { templateUrl: getPartialUrl('chatroom'), controller: 'ChatRoomCtrl' });
    $routeProvider.otherwise({ redirectTo: '/' });
  }]);
})();

//src/js/config.js

angular.module('SNAP.configs', []).factory('SNAPConfig', [], function () {
  return {
    'accounts': true,
    'chat': true,
    'locale': 'en_US',
    'location': '847429c4-bb61-40b5-b3fa-a4a50151030c',
    'location_name': 'DevTestLocation',
    'offline': false,
    'oms': true,
    'surveys': true,
    'theme': {
      'layout': 'galaxies',
      'tiles_style': 'default'
    }
  };
}).factory('SNAPEnvironment', [], function () {
  return {
    customer_application: { 'client_id': '91381a86b3b444fd876df80b22d7fa6e', 'callback_url': 'https://web.managesnap.com/oauth2/customer/callback' },
    facebook_application: { 'client_id': '349729518545313', 'redirect_url': 'https://web.managesnap.com/callback/facebook' },
    googleplus_application: { 'client_id': '678998250941-1dmebp4ksni9tsjth45tsht8l7cl1mrn.apps.googleusercontent.com', 'redirect_url': 'https://web.managesnap.com/callback/googleplus' },
    twitter_application: { 'consumer_key': 'yQ8XJ15PmaPOi4L5DJPikGCI0', 'redirect_url': 'https://web.managesnap.com/callback/twitter' }
  };
}).factory('SNAPHosts', [], function () {
  return {
    api: { 'host': 'api2.managesnap.com', 'secure': 'true' },
    content: { 'host': 'content.managesnap.com' },
    media: { 'host': 'content.managesnap.com' }
  };
});

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

    if (confirmed) {
      if (confirm.resolve) {
        confirm.resolve();
      }
    } else {
      if (confirm.reject) {
        confirm.reject();
      }
    }

    showNextConfirm();
  };

  DialogManager.alertRequested.add(function (message, title) {
    message = getMessage(message);

    alertStack.push({ title: title, message: message });

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
//# sourceMappingURL=data:application/json;base64,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QUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDakQsQ0FBQyxDQUFDLENBQ0YsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsVUFBQyxZQUFZLEVBQUUsV0FBVyxFQUFLO0FBQ3ZGLFNBQU8sSUFBSSxHQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztDQUN6RCxDQUFDLENBQUMsQ0FBQyIsImZpbGUiOiJ0ZW1wL3NuYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL3NyYy9qcy9zaGFyZWQvX2Jhc2UuanNcblxud2luZG93LmFwcCA9IHt9O1xuXG52YXIgQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IgPSAxLFxuICAgIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UID0gMTAsXG4gICAgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1JFQ0VJVkVEID0gMTEsXG4gICAgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UID0gMjAsXG4gICAgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9SRUNFSVZFRCA9IDIxLFxuICAgIEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCA9IDMwLFxuICAgIEFMRVJUX1JFUVVFU1RfT1JERVJfUkVDRUlWRUQgPSAzMSxcbiAgICBBTEVSVF9TSUdOSU5fUkVRVUlSRUQgPSA0MCxcbiAgICBBTEVSVF9UQUJMRV9SRVNFVCA9IDUwLFxuICAgIEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UgPSA1MSxcbiAgICBBTEVSVF9UQUJMRV9DTE9TRU9VVCA9IDUyLFxuICAgIEFMRVJUX0dFTkVSSUNfRVJST1IgPSAxMDAsXG4gICAgQUxFUlRfREVMRVRfQ0FSRCA9IDIwMCxcbiAgICBBTEVSVF9QQVNTV09SRF9SRVNFVF9DT01QTEVURSA9IDIxMCxcbiAgICBBTEVSVF9TT0ZUV0FSRV9PVVREQVRFRCA9IDIyMCxcbiAgICBBTEVSVF9DQVJEUkVBREVSX0VSUk9SID0gMzEwLFxuICAgIEFMRVJUX0VSUk9SX05PX1NFQVQgPSA0MTA7XG5cbi8vc3JjL2pzL3NoYXJlZC9hY3Rpdml0eW1vbml0b3IuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIHZhciBBY3Rpdml0eU1vbml0b3IgPSBmdW5jdGlvbigkcm9vdFNjb3BlLCAkdGltZW91dCkge1xuICAgIHRoaXMuJCRyb290U2NvcGUgPSAkcm9vdFNjb3BlO1xuICAgIHRoaXMuJCR0aW1lb3V0ID0gJHRpbWVvdXQ7XG4gICAgdGhpcy5fdGltZW91dCA9IDEwMDAwO1xuXG4gICAgdGhpcy5fYWN0aXZlQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLiQkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHNlbGYuZW5hYmxlZCkge1xuICAgICAgICBzZWxmLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICB9O1xuXG4gIEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUgPSB7fTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ3RpbWVvdXQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3RpbWVvdXQ7IH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICB0aGlzLl90aW1lb3V0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICdlbmFibGVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9lbmFibGVkOyB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHsgdGhpcy5fZW5hYmxlZCA9IHZhbHVlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl90aW1lciAhPSBudWxsOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnYWN0aXZlQ2hhbmdlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fYWN0aXZlQ2hhbmdlZDsgfVxuICB9KTtcblxuICBBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLmFjdGl2aXR5RGV0ZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hhbmdlZDtcblxuICAgIGlmICh0aGlzLl90aW1lcikge1xuICAgICAgdGhpcy4kJHRpbWVvdXQuY2FuY2VsKHRoaXMuX3RpbWVyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fdGltZXIgPT09IG51bGwpIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBvblRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX3RpbWVyID0gbnVsbDtcblxuICAgICAgc2VsZi4kJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLmVuYWJsZWQpIHtcbiAgICAgICAgICBzZWxmLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5hY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdGltZXIgPSB0aGlzLiQkdGltZW91dChvblRpbWVvdXQsIHRoaXMuX3RpbWVvdXQpO1xuXG4gICAgaWYgKGNoYW5nZWQgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLmFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2godGhpcy5hY3RpdmUpO1xuICAgIH1cbiAgfTtcblxuICB3aW5kb3cuYXBwLkFjdGl2aXR5TW9uaXRvciA9IEFjdGl2aXR5TW9uaXRvcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9hbmFseXRpY3NkYXRhLmpzXG5cbndpbmRvdy5hcHAuQW5hbHl0aWNzRGF0YSA9IGNsYXNzIEFuYWx5dGljc0RhdGEge1xuICBjb25zdHJ1Y3RvcihuYW1lLCBzdG9yYWdlUHJvdmlkZXIsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHRoaXMuX2RlZmF1bHRWYWx1ZSA9IGRlZmF1bHRWYWx1ZSB8fCAoKCkgPT4gW10pO1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kZWZhdWx0VmFsdWUoKTtcbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9hbmFseXRpY3NfJyArIG5hbWUpO1xuICAgIHRoaXMuX3N0b3JlLnJlYWQoKS50aGVuKGRhdGEgPT4gc2VsZi5fZGF0YSA9IGRhdGEgfHwgc2VsZi5fZGF0YSk7XG4gIH1cblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgfVxuXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhO1xuICB9XG5cbiAgc2V0IGRhdGEodmFsdWUpIHtcbiAgICB0aGlzLl9kYXRhID0gdmFsdWU7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIGdldCBsZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEubGVuZ3RoO1xuICB9XG5cbiAgZ2V0IGxhc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFbdGhpcy5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIHB1c2goaXRlbSkge1xuICAgIHRoaXMuX2RhdGEucHVzaChpdGVtKTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RlZmF1bHRWYWx1ZSgpO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICBzdG9yZSgpIHtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9kYXRhKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2FuYWx5dGljc21hbmFnZXIuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NNYW5hZ2VyID0gY2xhc3MgQW5hbHl0aWNzTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpIHtcbiAgICB0aGlzLl9UZWxlbWV0cnlTZXJ2aWNlID0gVGVsZW1ldHJ5U2VydmljZTtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgfVxuXG4gIHN1Ym1pdCgpIHtcbiAgICB0aGlzLl9Mb2dnZXIuZGVidWcoYFN1Ym1pdHRpbmcgYW5hbHl0aWNzIGRhdGEgd2l0aCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLnNlc3Npb25zLmxlbmd0aH0gc2VhdCBzZXNzaW9ucywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5hbnN3ZXJzLmxlbmd0aH0gYW5zd2VycywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jaGF0cy5sZW5ndGh9IGNoYXRzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNvbW1lbnRzLmxlbmd0aH0gY29tbWVudHMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY2xpY2tzLmxlbmd0aH0gY2xpY2tzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLnBhZ2VzLmxlbmd0aH0gcGFnZXMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuYWR2ZXJ0aXNlbWVudHMubGVuZ3RofSBhZHZlcnRpc2VtZW50cyBhbmQgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC51cmxzLmxlbmd0aH0gVVJMcy5gKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fVGVsZW1ldHJ5U2VydmljZS5zdWJtaXRUZWxlbWV0cnkoe1xuICAgICAgICBzZXNzaW9uczogc2VsZi5fQW5hbHl0aWNzTW9kZWwuc2Vzc2lvbnMuZGF0YSxcbiAgICAgICAgYWR2ZXJ0aXNlbWVudHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmFkdmVydGlzZW1lbnRzLmRhdGEsXG4gICAgICAgIGFuc3dlcnM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmFuc3dlcnMuZGF0YSxcbiAgICAgICAgY2hhdHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLmNoYXRzLmRhdGEsXG4gICAgICAgIGNvbW1lbnRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jb21tZW50cy5kYXRhLFxuICAgICAgICBjbGlja3M6IHNlbGYuX0FuYWx5dGljc01vZGVsLmNsaWNrcy5kYXRhLFxuICAgICAgICBwYWdlczogc2VsZi5fQW5hbHl0aWNzTW9kZWwucGFnZXMuZGF0YSxcbiAgICAgICAgdXJsczogc2VsZi5fQW5hbHl0aWNzTW9kZWwudXJscy5kYXRhXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5fQW5hbHl0aWNzTW9kZWwuY2xlYXIoKTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgZSA9PiB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci53YXJuKCdVbmFibGUgdG8gc3VibWl0IGFuYWx5dGljcyBkYXRhOiAnICsgZS5tZXNzYWdlKTtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9hbmFseXRpY3Ntb2RlbC5qc1xuXG53aW5kb3cuYXBwLkFuYWx5dGljc01vZGVsID0gY2xhc3MgQW5hbHl0aWNzTW9kZWwge1xuICBjb25zdHJ1Y3RvcihzdG9yYWdlUHJvdmlkZXIsIGhlYXRtYXApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fZGF0YSA9IFtcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnc2Vzc2lvbnMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdhZHZlcnRpc2VtZW50cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2Fuc3dlcnMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjaGF0cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NvbW1lbnRzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY2xpY2tzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgncGFnZXMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCd1cmxzJywgc3RvcmFnZVByb3ZpZGVyKVxuICAgIF0ucmVkdWNlKChyZXN1bHQsIGl0ZW0pID0+IHtcbiAgICAgIHJlc3VsdFtpdGVtLm5hbWVdID0gaXRlbTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwge30pO1xuXG4gICAgaGVhdG1hcC5jbGlja2VkLmFkZChjbGljayA9PiB7XG4gICAgICBzZWxmLl9sb2dDbGljayhjbGljayk7XG4gICAgfSk7XG4gIH1cblxuICBsb2dTZXNzaW9uKHNlc3Npb24pIHtcbiAgICB0aGlzLl9kYXRhLnNlc3Npb25zLnB1c2goc2Vzc2lvbik7XG4gIH1cblxuICBnZXQgc2Vzc2lvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuc2Vzc2lvbnM7XG4gIH1cblxuICBsb2dOYXZpZ2F0aW9uKGRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy5fZGF0YS5wYWdlcy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICB9KTtcblxuICAgIHRoaXMuX2RhdGEuY2xpY2tzLnN0b3JlKCk7XG4gIH1cblxuICBnZXQgcGFnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucGFnZXM7XG4gIH1cblxuICBsb2dBZHZlcnRpc2VtZW50KGFkdmVydGlzZW1lbnQpIHtcbiAgICB0aGlzLl9kYXRhLmFkdmVydGlzZW1lbnRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGFkdmVydGlzZW1lbnQ6IGFkdmVydGlzZW1lbnRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBhZHZlcnRpc2VtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5hZHZlcnRpc2VtZW50cztcbiAgfVxuXG4gIGxvZ0Fuc3dlcihhbnN3ZXIpIHtcbiAgICB0aGlzLl9kYXRhLmFuc3dlcnMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgYW5zd2VyOiBhbnN3ZXJcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBhbnN3ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmFuc3dlcnM7XG4gIH1cblxuICBsb2dDaGF0KGNoYXQpIHtcbiAgICB0aGlzLl9kYXRhLmNoYXRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNoYXQ6IGNoYXRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBjaGF0cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jaGF0cztcbiAgfVxuXG4gIGxvZ0NvbW1lbnQoY29tbWVudCkge1xuICAgIHRoaXMuX2RhdGEuY29tbWVudHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgY29tbWVudDogY29tbWVudFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGNvbW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmNvbW1lbnRzO1xuICB9XG5cbiAgbG9nVXJsKHVybCkge1xuICAgIHRoaXMuX2RhdGEudXJscy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICB1cmw6IHVybFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHVybHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEudXJscztcbiAgfVxuXG4gIGdldCBjbGlja3MoKSB7XG4gICAgdGhpcy5fZGF0YS5jbGlja3Muc3RvcmUoKTtcblxuICAgIHJldHVybiB0aGlzLl9kYXRhLmNsaWNrcztcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGZvciAodmFyIGsgaW4gdGhpcy5fZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrXS5yZXNldCgpO1xuICAgIH1cbiAgfVxuXG4gIF9sb2dDbGljayhjbGljaykge1xuICAgIGNsaWNrLnRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMuX2RhdGEuY2xpY2tzLmRhdGEucHVzaChjbGljayk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9hcHBjYWNoZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIEFwcENhY2hlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIEFwcENhY2hlID0gZnVuY3Rpb24oTG9nZ2VyKSB7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICAgIHRoaXMuX2NhY2hlID0gd2luZG93LmFwcGxpY2F0aW9uQ2FjaGU7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMgPSBbXG4gICAgICAnY2FjaGVkJyxcbiAgICAgICdjaGVja2luZycsXG4gICAgICAnZG93bmxvYWRpbmcnLFxuICAgICAgJ2NhY2hlZCcsXG4gICAgICAnbm91cGRhdGUnLFxuICAgICAgJ29ic29sZXRlJyxcbiAgICAgICd1cGRhdGVyZWFkeScsXG4gICAgICAncHJvZ3Jlc3MnXG4gICAgXTtcblxuICAgIHZhciBzdGF0dXMgPSB0aGlzLl9nZXRDYWNoZVN0YXR1cygpO1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyBzdGF0dXMpO1xuXG4gICAgdGhpcy5jb21wbGV0ZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSBmYWxzZTtcbiAgICB0aGlzLl9pc1VwZGF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9oYWRFcnJvcnMgPSBmYWxzZTtcblxuICAgIGlmIChzdGF0dXMgPT09ICdVTkNBQ0hFRCcpIHtcbiAgICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgICAgdGhpcy5jb21wbGV0ZS5kaXNwYXRjaChmYWxzZSk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2Vycm9ySGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHNlbGYuX2hhbmRsZUNhY2hlRXJyb3IoZSk7XG4gICAgfTtcbiAgICB0aGlzLl9ldmVudEhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9oYW5kbGVDYWNoZUV2ZW50KGUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9hZGRFdmVudExpc3RlbmVycygpO1xuICB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc0NvbXBsZXRlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9pc0NvbXBsZXRlOyB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcHBDYWNoZS5wcm90b3R5cGUsICdpc1VwZGF0ZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2lzVXBkYXRlZDsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXBwQ2FjaGUucHJvdG90eXBlLCAnaGFkRXJyb3JzJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9oYWRFcnJvcnM7IH1cbiAgfSk7XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9nZXRDYWNoZVN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5fY2FjaGUuc3RhdHVzKSB7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVOQ0FDSEVEOlxuICAgICAgICByZXR1cm4gJ1VOQ0FDSEVEJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuSURMRTpcbiAgICAgICAgcmV0dXJuICdJRExFJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuQ0hFQ0tJTkc6XG4gICAgICAgIHJldHVybiAnQ0hFQ0tJTkcnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5ET1dOTE9BRElORzpcbiAgICAgICAgcmV0dXJuICdET1dOTE9BRElORyc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLlVQREFURVJFQURZOlxuICAgICAgICByZXR1cm4gJ1VQREFURVJFQURZJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuT0JTT0xFVEU6XG4gICAgICAgIHJldHVybiAnT0JTT0xFVEUnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdVS05PV04gQ0FDSEUgU1RBVFVTJztcbiAgICB9XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZXN1bHQgPSBmdW5jdGlvbihlcnJvciwgdXBkYXRlZCkge1xuICAgIHRoaXMuX2lzQ29tcGxldGUgPSB0cnVlO1xuICAgIHRoaXMuX2lzVXBkYXRlZCA9IHVwZGF0ZWQ7XG4gICAgdGhpcy5faGFkRXJyb3JzID0gKGVycm9yICE9IG51bGwpO1xuICAgIHRoaXMuY29tcGxldGUuZGlzcGF0Y2godXBkYXRlZCk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5hZGRFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9yZW1vdmVFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2Vycm9ySGFuZGxlcik7XG4gICAgdGhpcy5fYXBwQ2FjaGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9jYWNoZS5yZW1vdmVFdmVudExpc3RlbmVyKGUsIHNlbGYuX2V2ZW50SGFuZGxlcik7XG4gICAgfSk7XG4gIH07XG5cbiAgQXBwQ2FjaGUucHJvdG90eXBlLl9oYW5kbGVDYWNoZUV2ZW50ID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLnR5cGUgIT09ICdwcm9ncmVzcycpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGUgZXZlbnQ6ICcgKyBlLnR5cGUpO1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoZSBzdGF0dXM6ICcgKyB0aGlzLl9nZXRDYWNoZVN0YXR1cygpKTtcbiAgICB9XG5cbiAgICBpZiAoZS50eXBlID09PSAndXBkYXRlcmVhZHknKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hpbmcgY29tcGxldGUuIFN3YXBwaW5nIHRoZSBjYWNoZS4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX2NhY2hlLnN3YXBDYWNoZSgpO1xuXG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgdHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKGUudHlwZSA9PT0gJ2NhY2hlZCcpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gQ2FjaGUgc2F2ZWQuJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgZmFsc2UpO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLnR5cGUgPT09ICdub3VwZGF0ZScpIHtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGluZyBjb21wbGV0ZS4gTm8gdXBkYXRlcy4nKTtcblxuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHRoaXMuX3Jlc3VsdChudWxsLCBmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5faGFuZGxlQ2FjaGVFcnJvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYWNoZSB1cGRhdGUgZXJyb3I6ICcgKyBlLm1lc3NhZ2UpO1xuICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fcmVzdWx0KGUsIGZhbHNlKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkFwcENhY2hlID0gQXBwQ2FjaGU7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvYmFja2VuZGFwaS5qc1xuXG53aW5kb3cuYXBwLkJhY2tlbmRBcGkgPSBjbGFzcyBCYWNrZW5kQXBpIHtcbiAgY29uc3RydWN0b3IoSG9zdHMsIFNlc3Npb25Qcm92aWRlcikge1xuICAgIHRoaXMuX1Nlc3Npb25Qcm92aWRlciA9IFNlc3Npb25Qcm92aWRlcjtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGJ1c2luZXNzVG9rZW5Qcm92aWRlcigpIHtcbiAgICAgIHJldHVybiBzZWxmLl9TZXNzaW9uUHJvdmlkZXIuZ2V0QnVzaW5lc3NUb2tlbigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1c3RvbWVyVG9rZW5Qcm92aWRlcigpIHtcbiAgICAgIHJldHVybiBzZWxmLl9TZXNzaW9uUHJvdmlkZXIuZ2V0Q3VzdG9tZXJUb2tlbigpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBEdHNBcGlDbGllbnQpIHtcbiAgICAgIGxldCBjb25maWcgPSB7XG4gICAgICAgIGhvc3Q6IHtcbiAgICAgICAgICBkb21haW46IEhvc3RzLmFwaS5ob3N0LFxuICAgICAgICAgIHNlY3VyZTogSG9zdHMuYXBpLnNlY3VyZSA9PT0gJ3RydWUnXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGxldCBwcm92aWRlciA9IGJ1c2luZXNzVG9rZW5Qcm92aWRlcjtcblxuICAgICAgaWYgKGtleSA9PT0gJ3NuYXAnKSB7XG4gICAgICAgIGNvbmZpZy5ob3N0LmRvbWFpbiA9IEhvc3RzLmNvbnRlbnQuaG9zdDtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ2N1c3RvbWVyJykge1xuICAgICAgICBwcm92aWRlciA9IGN1c3RvbWVyVG9rZW5Qcm92aWRlcjtcbiAgICAgIH1cblxuICAgICAgdGhpc1trZXldID0gbmV3IER0c0FwaUNsaWVudFtrZXldKGNvbmZpZywgcHJvdmlkZXIpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2NhcmRyZWFkZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcmRSZWFkZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQ2FyZFJlYWRlciA9IGZ1bmN0aW9uKE1hbmFnZW1lbnRTZXJ2aWNlKSB7XG4gICAgdGhpcy5fTWFuYWdlbWVudFNlcnZpY2UgPSBNYW5hZ2VtZW50U2VydmljZTtcbiAgICB0aGlzLm9uUmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uRXJyb3IgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5yZWNlaXZlZCA9IGZ1bmN0aW9uKGNhcmQpIHtcbiAgICB0aGlzLm9uUmVjZWl2ZWQuZGlzcGF0Y2goY2FyZCk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5vbkVycm9yLmRpc3BhdGNoKGUpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLnN0YXJ0Q2FyZFJlYWRlcigpO1xuICAgICAgdGhpcy5fYWN0aXZlID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9hY3RpdmUpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLnN0b3BDYXJkUmVhZGVyKCk7XG4gICAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJkUmVhZGVyID0gQ2FyZFJlYWRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9jYXJ0aXRlbS5qc1xuXG53aW5kb3cuYXBwLkNhcnRJdGVtID0gY2xhc3MgQ2FydEl0ZW0ge1xuICBjb25zdHJ1Y3RvcihpdGVtLCBxdWFudGl0eSwgbmFtZSwgbW9kaWZpZXJzLCByZXF1ZXN0KSB7XG4gICAgdGhpcy5pdGVtID0gaXRlbTtcbiAgICB0aGlzLnF1YW50aXR5ID0gcXVhbnRpdHk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXF1ZXN0O1xuXG4gICAgaWYgKCF0aGlzLmhhc01vZGlmaWVycykge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBbXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIW1vZGlmaWVycykge1xuICAgICAgdGhpcy5tb2RpZmllcnMgPSBpdGVtLm1vZGlmaWVycy5tYXAoZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkoY2F0ZWdvcnksIGNhdGVnb3J5Lml0ZW1zLm1hcChmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllcihtb2RpZmllcik7XG4gICAgICAgIH0pKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gbW9kaWZpZXJzO1xuICAgIH1cbiAgfVxuXG4gIGdldCBoYXNNb2RpZmllcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlbS5tb2RpZmllcnMgIT0gbnVsbCAmJiB0aGlzLml0ZW0ubW9kaWZpZXJzLmxlbmd0aCA+IDA7XG4gIH1cblxuICBnZXQgc2VsZWN0ZWRNb2RpZmllcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kaWZpZXJzLnJlZHVjZShmdW5jdGlvbihwcmV2aW91c0NhdGVnb3J5LCBjYXRlZ29yeSwgaSwgYXJyYXkpIHtcbiAgICAgIHJldHVybiBhcnJheS5jb25jYXQoY2F0ZWdvcnkuaXRlbXMuZmlsdGVyKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgICAgfSkpO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIGNsb25lKGNvdW50KSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydEl0ZW0oXG4gICAgICB0aGlzLml0ZW0sXG4gICAgICB0aGlzLnF1YW50aXR5LFxuICAgICAgdGhpcy5uYW1lLFxuICAgICAgdGhpcy5tb2RpZmllcnMubWFwKGNhdGVnb3J5ID0+IGNhdGVnb3J5LmNsb25lKCkpLFxuICAgICAgdGhpcy5yZXF1ZXN0KTtcbiAgfVxuXG4gIGNsb25lTWFueShjb3VudCkge1xuICAgIGNvdW50ID0gY291bnQgfHwgdGhpcy5xdWFudGl0eTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5ldyBhcHAuQ2FydEl0ZW0oXG4gICAgICAgIHRoaXMuaXRlbSxcbiAgICAgICAgMSxcbiAgICAgICAgdGhpcy5uYW1lLFxuICAgICAgICB0aGlzLm1vZGlmaWVycy5tYXAoY2F0ZWdvcnkgPT4gY2F0ZWdvcnkuY2xvbmUoKSksXG4gICAgICAgIHRoaXMucmVxdWVzdClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJlc3RvcmUoZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRJdGVtKFxuICAgICAgZGF0YS5pdGVtLFxuICAgICAgZGF0YS5xdWFudGl0eSxcbiAgICAgIGRhdGEubmFtZSxcbiAgICAgIGRhdGEubW9kaWZpZXJzLm1hcChhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLnJlc3RvcmUpLFxuICAgICAgZGF0YS5yZXF1ZXN0XG4gICAgKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2NhcnRtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkNhcnRNb2RlbCA9IGNsYXNzIENhcnRNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuU1RBVEVfQ0FSVCA9ICdjYXJ0JztcbiAgICB0aGlzLlNUQVRFX0hJU1RPUlkgPSAnaGlzdG9yeSc7XG5cbiAgICB0aGlzLl9pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgdGhpcy5pc0NhcnRPcGVuQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2NhcnRTdGF0ZSA9IHRoaXMuU1RBVEVfQ0FSVDtcbiAgICB0aGlzLmNhcnRTdGF0ZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBudWxsO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZ2V0IGlzQ2FydE9wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ2FydE9wZW47XG4gIH1cblxuICBzZXQgaXNDYXJ0T3Blbih2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0NhcnRPcGVuID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pc0NhcnRPcGVuID0gdmFsdWU7XG4gICAgdGhpcy5pc0NhcnRPcGVuQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgY2FydFN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9jYXJ0U3RhdGU7XG4gIH1cblxuICBzZXQgY2FydFN0YXRlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2NhcnRTdGF0ZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fY2FydFN0YXRlID0gdmFsdWU7XG4gICAgdGhpcy5jYXJ0U3RhdGVDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBlZGl0YWJsZUl0ZW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRhYmxlSXRlbTtcbiAgfVxuXG4gIGdldCBlZGl0YWJsZUl0ZW1OZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRhYmxlSXRlbU5ldztcbiAgfVxuXG4gIG9wZW5FZGl0b3IoaXRlbSwgaXNOZXcpIHtcbiAgICBpZiAodGhpcy5fZWRpdGFibGVJdGVtID09PSBpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2VkaXRhYmxlSXRlbU5ldyA9IGlzTmV3IHx8IGZhbHNlO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IGl0ZW07XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmRpc3BhdGNoKGl0ZW0pO1xuICB9XG5cbiAgY2xvc2VFZGl0b3IoKSB7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtTmV3ID0gZmFsc2U7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gbnVsbDtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQuZGlzcGF0Y2gobnVsbCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jYXJ0bW9kaWZpZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJ0TW9kaWZpZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQ2FydE1vZGlmaWVyID0gZnVuY3Rpb24oZGF0YSwgaXNTZWxlY3RlZCkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZCB8fCBmYWxzZTtcbiAgfTtcblxuICBDYXJ0TW9kaWZpZXIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyKHRoaXMuZGF0YSwgdGhpcy5pc1NlbGVjdGVkKTtcbiAgfTtcblxuICBDYXJ0TW9kaWZpZXIucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyKGRhdGEuZGF0YSwgZGF0YS5pc1NlbGVjdGVkKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkNhcnRNb2RpZmllciA9IENhcnRNb2RpZmllcjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnlcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkgPSBmdW5jdGlvbihkYXRhLCBtb2RpZmllcnMpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMubW9kaWZpZXJzID0gbW9kaWZpZXJzO1xuICB9O1xuXG4gIENhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtb2RpZmllcnMgPSB0aGlzLm1vZGlmaWVycy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgIHJldHVybiBtb2RpZmllci5jbG9uZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KHRoaXMuZGF0YSwgbW9kaWZpZXJzKTtcbiAgfTtcblxuICBDYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeShkYXRhLmRhdGEsIGRhdGEubW9kaWZpZXJzLm1hcChDYXJ0TW9kaWZpZXIucHJvdG90eXBlLnJlc3RvcmUpKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5ID0gQ2FydE1vZGlmaWVyQ2F0ZWdvcnk7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvY2hhdG1hbmFnZXIuanNcblxud2luZG93LmFwcC5DaGF0TWFuYWdlciA9IGNsYXNzIENoYXRNYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuTUVTU0FHRV9UWVBFUyA9IHtcbiAgICAgIExPQ0FUSU9OOiAnbG9jYXRpb24nLFxuICAgICAgREVWSUNFOiAnZGV2aWNlJ1xuICAgIH07XG4gICAgdGhpcy5NRVNTQUdFX1NUQVRVU0VTID0ge1xuICAgICAgQ0hBVF9SRVFVRVNUOiAnY2hhdF9yZXF1ZXN0JyxcbiAgICAgIENIQVRfUkVRVUVTVF9BQ0NFUFRFRDogJ2NoYXRfcmVxdWVzdF9hY2NlcHRlZCcsXG4gICAgICBDSEFUX1JFUVVFU1RfREVDTElORUQ6ICdjaGF0X3JlcXVlc3RfZGVjbGluZWQnLFxuICAgICAgR0lGVF9SRVFVRVNUOiAnZ2lmdF9yZXF1ZXN0JyxcbiAgICAgIEdJRlRfUkVRVUVTVF9BQ0NFUFRFRDogJ2dpZnRfcmVxdWVzdF9hY2NlcHRlZCcsXG4gICAgICBHSUZUX1JFUVVFU1RfREVDTElORUQ6ICdnaWZ0X3JlcXVlc3RfZGVjbGluZWQnLFxuICAgICAgQ0hBVF9DTE9TRUQ6ICdjaGF0X2Nsb3NlZCdcbiAgICB9O1xuICAgIHRoaXMuT1BFUkFUSU9OUyA9IHtcbiAgICAgIENIQVRfTUVTU0FHRTogJ2NoYXRfbWVzc2FnZScsXG4gICAgICBTVEFUVVNfUkVRVUVTVDogJ3N0YXR1c19yZXF1ZXN0JyxcbiAgICAgIFNUQVRVU19VUERBVEU6ICdzdGF0dXNfdXBkYXRlJ1xuICAgIH07XG4gICAgdGhpcy5ST09NUyA9IHtcbiAgICAgIExPQ0FUSU9OOiAnbG9jYXRpb25fJyxcbiAgICAgIERFVklDRTogJ2RldmljZV8nXG4gICAgfTtcblxuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fQ2hhdE1vZGVsID0gQ2hhdE1vZGVsO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwgPSBMb2NhdGlvbk1vZGVsO1xuICAgIHRoaXMuX1NvY2tldENsaWVudCA9IFNvY2tldENsaWVudDtcblxuICAgIHRoaXMuX0NoYXRNb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0NoYXRNb2RlbC5pc1ByZXNlbnRDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5pc0Nvbm5lY3RlZENoYW5nZWQuYWRkKGlzQ29ubmVjdGVkID0+IHtcbiAgICAgIHNlbGYubW9kZWwuaXNDb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZDtcbiAgICAgIHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKTtcbiAgICAgIHNlbGYuX3NlbmRTdGF0dXNSZXF1ZXN0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc3Vic2NyaWJlKHRoaXMuUk9PTVMuTE9DQVRJT04gKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmxvY2F0aW9uLCBtZXNzYWdlID0+IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS5vcGVyYXRpb24pIHtcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFOlxuICAgICAgICAgIHNlbGYuX29uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1JFUVVFU1Q6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNSZXF1ZXN0KG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHNlbGYuT1BFUkFUSU9OUy5TVEFUVVNfVVBEQVRFOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzVXBkYXRlKG1lc3NhZ2UpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnN1YnNjcmliZSh0aGlzLlJPT01TLkRFVklDRSArIHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlLCBtZXNzYWdlID0+IHtcbiAgICAgIHN3aXRjaCAobWVzc2FnZS5vcGVyYXRpb24pIHtcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFOlxuICAgICAgICAgIHNlbGYuX29uTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURTpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fQ2hhdE1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5tb2RlbC5yZXNldCgpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBNZXNzYWdpbmdcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNlbmRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlO1xuICAgIG1lc3NhZ2Uub3BlcmF0aW9uID0gdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTtcbiAgICBtZXNzYWdlLnR5cGUgPSBtZXNzYWdlLnRvX2RldmljZSA/XG4gICAgICB0aGlzLk1FU1NBR0VfVFlQRVMuREVWSUNFIDpcbiAgICAgIHRoaXMuTUVTU0FHRV9UWVBFUy5MT0NBVElPTjtcblxuICAgIHRoaXMuX2FkZE1lc3NhZ2VJRChtZXNzYWdlKTtcbiAgICB0aGlzLm1vZGVsLmFkZEhpc3RvcnkobWVzc2FnZSk7XG5cbiAgICB2YXIgdG9waWMgPSB0aGlzLl9nZXRUb3BpYyhtZXNzYWdlKTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRvcGljLCBtZXNzYWdlKTtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dDaGF0KG1lc3NhZ2UpO1xuICB9XG5cbiAgYXBwcm92ZURldmljZSh0b2tlbikge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZSh0b2tlbik7XG5cbiAgICB0aGlzLm1vZGVsLnNldExhc3RSZWFkKHRva2VuLCBtb21lbnQoKS51bml4KCkpO1xuXG4gICAgaWYgKHRoaXMubW9kZWwuaXNQZW5kaW5nRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlUGVuZGluZ0RldmljZShkZXZpY2UpO1xuXG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVELFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmFkZEFjdGl2ZURldmljZShkZXZpY2UpO1xuICAgIH1cbiAgfVxuXG4gIGRlY2xpbmVEZXZpY2UodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgaWYgKHRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5yZW1vdmVBY3RpdmVEZXZpY2UoZGV2aWNlKTtcblxuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VELFxuICAgICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lc3NhZ2VOYW1lKG1lc3NhZ2UpIHtcbiAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UgPT09IG1lc3NhZ2UuZGV2aWNlKSB7XG4gICAgICByZXR1cm4gJ01lJztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZS51c2VybmFtZSB8fCB0aGlzLmdldERldmljZU5hbWUobWVzc2FnZS5kZXZpY2UpO1xuICB9XG5cbiAgZ2V0RGV2aWNlTmFtZSh0b2tlbikge1xuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZSh0b2tlbik7XG5cbiAgICBpZiAoZGV2aWNlKSB7XG4gICAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UgPT09IGRldmljZS50b2tlbikge1xuICAgICAgICByZXR1cm4gJ01lJztcbiAgICAgIH1cblxuICAgICAgaWYgKGRldmljZS51c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gZGV2aWNlLnVzZXJuYW1lO1xuICAgICAgfVxuXG4gICAgICBmb3IodmFyIHAgaW4gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0cykge1xuICAgICAgICBpZiAodGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0c1twXS50b2tlbiA9PT0gZGV2aWNlLnNlYXQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0c1twXS5uYW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICdHdWVzdCc7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE5vdGlmaWNhdGlvbnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGNoZWNrSWZVbnJlYWQoZGV2aWNlX3Rva2VuLCBtZXNzYWdlKSB7XG4gICAgbGV0IGxhc3RSZWFkID0gdGhpcy5tb2RlbC5nZXRMYXN0UmVhZChkZXZpY2VfdG9rZW4pO1xuXG4gICAgaWYgKCFsYXN0UmVhZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbW9tZW50LnVuaXgobWVzc2FnZS5yZWNlaXZlZCkuaXNBZnRlcihtb21lbnQudW5peChsYXN0UmVhZCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldFVucmVhZENvdW50KGRldmljZV90b2tlbikgPiAwO1xuICB9XG5cbiAgZ2V0VW5yZWFkQ291bnQoZGV2aWNlX3Rva2VuKSB7XG4gICAgbGV0IGxhc3RSZWFkID0gdGhpcy5tb2RlbC5nZXRMYXN0UmVhZChkZXZpY2VfdG9rZW4pO1xuXG4gICAgaWYgKCFsYXN0UmVhZCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmcm9tRGF0ZSA9IG1vbWVudC51bml4KGxhc3RSZWFkKTtcblxuICAgIHJldHVybiB0aGlzLm1vZGVsLmhpc3RvcnlcbiAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtZXNzYWdlLnR5cGUgPT09IHNlbGYuTUVTU0FHRV9UWVBFUy5ERVZJQ0UgJiYgbWVzc2FnZS5kZXZpY2UgPT09IGRldmljZV90b2tlbilcbiAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtb21lbnQudW5peChtZXNzYWdlLnJlY2VpdmVkKS5pc0FmdGVyKGZyb21EYXRlKSlcbiAgICAgIC5sZW5ndGg7XG4gIH1cblxuICBtYXJrQXNSZWFkKGRldmljZV90b2tlbikge1xuICAgIHRoaXMubW9kZWwuc2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuLCBtb21lbnQoKS51bml4KCkpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBHaWZ0c1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgc2VuZEdpZnQoaXRlbXMpIHtcbiAgICBpZiAoIXRoaXMubW9kZWwuZ2lmdERldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNULFxuICAgICAgdG9fZGV2aWNlOiB0aGlzLm1vZGVsLmdpZnREZXZpY2UsXG4gICAgICB0ZXh0OiBpdGVtcy5yZWR1Y2UoKHJlc3VsdCwgaXRlbSkgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ICE9PSAnJykge1xuICAgICAgICAgIHJlc3VsdCArPSAnLCAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBpdGVtLml0ZW0udGl0bGU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCAnJylcbiAgICB9KTtcbiAgfVxuXG4gIGFjY2VwdEdpZnQoZGV2aWNlKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQsXG4gICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgIH0pO1xuICB9XG5cbiAgZGVjbGluZUdpZnQoZGV2aWNlKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQsXG4gICAgICB0b19kZXZpY2U6IGRldmljZS50b2tlblxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRHaWZ0KGRldmljZV90b2tlbikge1xuICAgIGxldCBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pO1xuICBcbiAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBkZXZpY2VfdG9rZW47XG4gICAgdGhpcy5tb2RlbC5naWZ0U2VhdCA9IGRldmljZS5zZWF0O1xuICB9XG5cbiAgZW5kR2lmdCgpIHtcbiAgICB0aGlzLm1vZGVsLmdpZnREZXZpY2UgPSBudWxsO1xuICAgIHRoaXMubW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIF9vbk1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmICghbWVzc2FnZS5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm1vZGVsLmhpc3RvcnkuZmlsdGVyKG1zZyA9PiBtc2cuaWQgPT09IG1lc3NhZ2UuaWQpLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtZXNzYWdlLnJlY2VpdmVkID0gbW9tZW50KCkudW5peCgpO1xuXG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKSxcbiAgICAgICAgZ2lmdERldmljZSA9IHRoaXMubW9kZWwuZ2lmdERldmljZSxcbiAgICAgICAgc2VhdCA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdC50b2tlbjtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVCkgJiZcbiAgICAgICAgIXRoaXMubW9kZWwuaXNQZW5kaW5nRGV2aWNlKGRldmljZSkgJiZcbiAgICAgICAgIXRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5hZGRQZW5kaW5nRGV2aWNlKGRldmljZSk7XG4gICAgICB0aGlzLm1vZGVsLmNoYXRSZXF1ZXN0UmVjZWl2ZWQuZGlzcGF0Y2goZGV2aWNlLnRva2VuKTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1QgJiZcbiAgICAgICAgdGhpcy5tb2RlbC5pc0FjdGl2ZURldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLmdpZnRSZXF1ZXN0UmVjZWl2ZWQuZGlzcGF0Y2goZGV2aWNlLCBtZXNzYWdlLnRleHQpO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnRvX2RldmljZSkge1xuICAgICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEKSB7XG4gICAgICAgIGlmIChnaWZ0RGV2aWNlICYmIGdpZnREZXZpY2UgPT09IG1lc3NhZ2UuZGV2aWNlKSB7XG4gICAgICAgICAgdGhpcy5tb2RlbC5naWZ0QWNjZXB0ZWQuZGlzcGF0Y2godHJ1ZSk7XG4gICAgICAgICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgICAgaWYgKGdpZnREZXZpY2UgJiYgZ2lmdERldmljZSA9PT0gbWVzc2FnZS5kZXZpY2UpIHtcbiAgICAgICAgICB0aGlzLm1vZGVsLmdpZnRBY2NlcHRlZC5kaXNwYXRjaChmYWxzZSk7XG4gICAgICAgICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgICAgdGhpcy5kZWNsaW5lRGV2aWNlKGRldmljZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uub3BlcmF0aW9uID09PSB0aGlzLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFKSB7XG4gICAgICBtZXNzYWdlLnVzZXJuYW1lID0gdGhpcy5nZXREZXZpY2VOYW1lKGRldmljZSk7XG4gICAgICB0aGlzLm1vZGVsLmFkZEhpc3RvcnkobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlbC5tZXNzYWdlUmVjZWl2ZWQuZGlzcGF0Y2gobWVzc2FnZSk7XG4gIH1cblxuICBfb25TdGF0dXNSZXF1ZXN0KG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5kZXZpY2UgPT09IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2VuZFN0YXR1c1VwZGF0ZShtZXNzYWdlLmRldmljZSk7XG4gIH1cblxuICBfb25TdGF0dXNVcGRhdGUobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIGRldmljZSA9IHtcbiAgICAgICAgdG9rZW46IG1lc3NhZ2UuZGV2aWNlLFxuICAgICAgfTtcblxuICAgICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5hZGREZXZpY2UoZGV2aWNlKTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaXNfYXZhaWxhYmxlICYmIGRldmljZS5pc19hdmFpbGFibGUpIHtcbiAgICAgIGxldCBoaXN0b3J5ID0ge1xuICAgICAgICBvcGVyYXRpb246IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0UsXG4gICAgICAgIHR5cGU6IHRoaXMuTUVTU0FHRV9UWVBFUy5ERVZJQ0UsXG4gICAgICAgIGRldmljZTogZGV2aWNlLnRva2VuLFxuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCxcbiAgICAgICAgdG9fZGV2aWNlOiB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZVxuICAgICAgfTtcbiAgICAgIHRoaXMuX2FkZE1lc3NhZ2VJRChoaXN0b3J5KTtcbiAgICAgIHRoaXMubW9kZWwuYWRkSGlzdG9yeShoaXN0b3J5KTtcbiAgICB9XG5cbiAgICBkZXZpY2UuaXNfYXZhaWxhYmxlID0gQm9vbGVhbihtZXNzYWdlLmlzX2F2YWlsYWJsZSk7XG4gICAgZGV2aWNlLmlzX3ByZXNlbnQgPSBCb29sZWFuKG1lc3NhZ2UuaXNfcHJlc2VudCk7XG4gICAgZGV2aWNlLnNlYXQgPSBtZXNzYWdlLnNlYXQ7XG4gICAgZGV2aWNlLnVzZXJuYW1lID0gbWVzc2FnZS51c2VybmFtZTtcblxuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlc0NoYW5nZWQuZGlzcGF0Y2godGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VzKTtcbiAgfVxuXG4gIF9zZW5kU3RhdHVzUmVxdWVzdCgpIHtcbiAgICBpZiAoIXRoaXMubW9kZWwuaXNDb25uZWN0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZSA9IHtcbiAgICAgIG9wZXJhdGlvbjogdGhpcy5PUEVSQVRJT05TLlNUQVRVU19SRVFVRVNULFxuICAgICAgZGV2aWNlOiB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZVxuICAgIH07XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0aGlzLl9nZXRUb3BpYyhtZXNzYWdlKSwgbWVzc2FnZSk7XG4gIH1cblxuICBfc2VuZFN0YXR1c1VwZGF0ZShkZXZpY2UpIHtcbiAgICBpZiAoIXRoaXMubW9kZWwuaXNDb25uZWN0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcHJvZmlsZSA9IHRoaXMuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSxcbiAgICAgICAgdXNlcm5hbWU7XG5cbiAgICBpZiAocHJvZmlsZSAmJiBwcm9maWxlLmZpcnN0X25hbWUpIHtcbiAgICAgIHVzZXJuYW1lID0gcHJvZmlsZS5maXJzdF9uYW1lICsgJyAnICsgcHJvZmlsZS5sYXN0X25hbWU7XG4gICAgfVxuXG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICBvcGVyYXRpb246IHRoaXMuT1BFUkFUSU9OUy5TVEFUVVNfVVBEQVRFLFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UsXG4gICAgICBkZXZpY2U6IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlLFxuICAgICAgc2VhdDogdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuLFxuICAgICAgaXNfYXZhaWxhYmxlOiB0aGlzLm1vZGVsLmlzRW5hYmxlZCxcbiAgICAgIGlzX3ByZXNlbnQ6IHRoaXMubW9kZWwuaXNQcmVzZW50LFxuICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lXG4gICAgfTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zZW5kKHRoaXMuX2dldFRvcGljKG1lc3NhZ2UpLCBtZXNzYWdlKTtcbiAgfVxuXG4gIF9nZXRUb3BpYyhtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gbWVzc2FnZS50b19kZXZpY2UgP1xuICAgICAgICB0aGlzLlJPT01TLkRFVklDRSArIG1lc3NhZ2UudG9fZGV2aWNlIDpcbiAgICAgICAgdGhpcy5ST09NUy5MT0NBVElPTiArIHRoaXMuX0xvY2F0aW9uTW9kZWwubG9jYXRpb247XG4gIH1cblxuICBfYWRkTWVzc2FnZUlEKG1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlLmlkID0gbWVzc2FnZS5pZCB8fCAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGMgPT4ge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTZ8MCxcbiAgICAgICAgICB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY2hhdG1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ2hhdE1vZGVsID0gY2xhc3MgQ2hhdE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY2hhdF9wcmVmZXJlbmNlcycpO1xuICAgIHRoaXMuX2hpc3RvcnlTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jaGF0X2hpc3RvcnknKTtcblxuICAgIHRoaXMuaXNDb25uZWN0ZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc0VuYWJsZWRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pc1ByZXNlbnRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLmFjdGl2ZURldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNoYXRSZXF1ZXN0UmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuaGlzdG9yeUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1lc3NhZ2VSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIFxuICAgIHRoaXMuZ2lmdFJlcXVlc3RSZWNlaXZlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZ2lmdEFjY2VwdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9naWZ0U2VhdCA9IG51bGw7XG4gICAgdGhpcy5naWZ0U2VhdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2dpZnREZXZpY2UgPSBudWxsO1xuICAgIHRoaXMuZ2lmdERldmljZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuZ2lmdFJlYWR5ID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5naWZ0QWNjZXB0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IFNOQVBDb25maWcuY2hhdDtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMgPSBbXTtcbiAgICB0aGlzLl9sYXN0UmVhZHMgPSB7fTtcblxuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUucmVhZCgpLnRoZW4ocHJlZnMgPT4ge1xuICAgICAgaWYgKCFwcmVmcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX2lzRW5hYmxlZCA9IEJvb2xlYW4ocHJlZnMuaXNfZW5hYmxlZCk7XG5cbiAgICAgIHNlbGYuX2FjdGl2ZURldmljZXMgPSBwcmVmcy5hY3RpdmVfZGV2aWNlcyB8fCBbXTtcbiAgICAgIHNlbGYuX3BlbmRpbmdEZXZpY2VzID0gcHJlZnMucGVuZGluZ19kZXZpY2VzIHx8IFtdO1xuICAgICAgc2VsZi5fbGFzdFJlYWRzID0gcHJlZnMubGFzdF9yZWFkcyB8fCB7fTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2hpc3RvcnlTdG9yZS5yZWFkKCkudGhlbihoaXN0b3J5ID0+IHtcbiAgICAgIHNlbGYuX2hpc3RvcnkgPSBoaXN0b3J5IHx8IFtdO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIHNldCBpc0Nvbm5lY3RlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9pc0Nvbm5lY3RlZCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IEJvb2xlYW4odmFsdWUpO1xuICAgIHRoaXMuaXNDb25uZWN0ZWRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2lzQ29ubmVjdGVkKTtcbiAgfVxuXG4gIGdldCBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRW5hYmxlZDtcbiAgfVxuXG4gIHNldCBpc0VuYWJsZWQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNFbmFibGVkID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4odmFsdWUpO1xuICAgIHRoaXMuaXNFbmFibGVkQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9pc0VuYWJsZWQpO1xuXG4gICAgdGhpcy5fdXBkYXRlUHJlZmVyZW5jZXMoKTtcbiAgfVxuXG4gIGdldCBpc1ByZXNlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzUHJlc2VudDtcbiAgfVxuXG4gIHNldCBpc1ByZXNlbnQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNQcmVzZW50ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzUHJlc2VudCA9IEJvb2xlYW4odmFsdWUpO1xuICAgIHRoaXMuaXNQcmVzZW50Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9pc1ByZXNlbnQpO1xuICB9XG5cbiAgZ2V0IGdpZnREZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dpZnREZXZpY2U7XG4gIH1cblxuICBzZXQgZ2lmdERldmljZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9naWZ0RGV2aWNlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2dpZnREZXZpY2UgPSB2YWx1ZTtcbiAgICB0aGlzLmdpZnREZXZpY2VDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2dpZnREZXZpY2UpO1xuICB9XG5cbiAgZ2V0IGdpZnRTZWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9naWZ0U2VhdDtcbiAgfVxuXG4gIHNldCBnaWZ0U2VhdCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9naWZ0U2VhdCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9naWZ0U2VhdCA9IHZhbHVlO1xuICAgIHRoaXMuZ2lmdFNlYXRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2dpZnRTZWF0KTtcbiAgfVxuXG4gIGdldCBwZW5kaW5nRGV2aWNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICBzZXQgcGVuZGluZ0RldmljZXModmFsdWUpIHtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMucGVuZGluZ0RldmljZXNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMucGVuZGluZ0RldmljZXMpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZURldmljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICBzZXQgYWN0aXZlRGV2aWNlcyh2YWx1ZSkge1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLmFjdGl2ZURldmljZXNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuYWN0aXZlRGV2aWNlcyk7XG4gIH1cblxuICBpc0FjdGl2ZURldmljZShkZXZpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSkgIT09IC0xO1xuICB9XG5cbiAgaXNQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmdEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSkgIT09IC0xO1xuICB9XG5cbiAgYWRkQWN0aXZlRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX2FjdGl2ZURldmljZXMucHVzaChkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLmFjdGl2ZURldmljZXMgPSB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgYWRkUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcy5wdXNoKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMucGVuZGluZ0RldmljZXMgPSB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIHJlbW92ZUFjdGl2ZURldmljZShkZXZpY2UpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmFjdGl2ZURldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzID0gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIHJlbW92ZVBlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5wZW5kaW5nRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpO1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzLnNwbGljZShpbmRleCwgMSk7XG4gICAgdGhpcy5wZW5kaW5nRGV2aWNlcyA9IHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgZ2V0IGhpc3RvcnkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hpc3Rvcnk7XG4gIH1cblxuICBzZXQgaGlzdG9yeSh2YWx1ZSkge1xuICAgIHRoaXMuX2hpc3RvcnkgPSB2YWx1ZSB8fCBbXTtcblxuICAgIHRoaXMuaGlzdG9yeUNoYW5nZWQuZGlzcGF0Y2godGhpcy5faGlzdG9yeSk7XG4gICAgdGhpcy5fdXBkYXRlSGlzdG9yeSgpO1xuICB9XG5cbiAgYWRkSGlzdG9yeShtZXNzYWdlKSB7XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoKG1lc3NhZ2UpO1xuICAgIHRoaXMuaGlzdG9yeSA9IHRoaXMuX2hpc3Rvcnk7XG4gIH1cblxuICBnZXRMYXN0UmVhZChkZXZpY2UpIHtcbiAgICBsZXQgdG9rZW4gPSBkZXZpY2UudG9rZW4gfHwgZGV2aWNlO1xuICAgIHJldHVybiB0aGlzLl9sYXN0UmVhZHNbdG9rZW5dIHx8IG51bGw7XG4gIH1cblxuICBzZXRMYXN0UmVhZChkZXZpY2UsIHZhbHVlKSB7XG4gICAgbGV0IHRva2VuID0gZGV2aWNlLnRva2VuIHx8IGRldmljZTtcbiAgICB0aGlzLl9sYXN0UmVhZHNbdG9rZW5dID0gdmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlUHJlZmVyZW5jZXMoKTtcbiAgfVxuXG4gIHNhdmUoKSB7XG4gICAgdGhpcy5fdXBkYXRlSGlzdG9yeSgpO1xuICAgIHRoaXMuX3VwZGF0ZVByZWZlcmVuY2VzKCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IHRoaXMuX2lzRW5hYmxlZCA9IHRoaXMuX2lzUHJlc2VudCA9IGZhbHNlO1xuICAgIHRoaXMuX2hpc3RvcnkgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzID0gW107XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMgPSBbXTtcblxuICAgIHRoaXMuX2hpc3RvcnlTdG9yZS5jbGVhcigpO1xuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUuY2xlYXIoKTtcbiAgfVxuXG4gIF91cGRhdGVIaXN0b3J5KCkge1xuICAgIHRoaXMuX2hpc3RvcnlTdG9yZS53cml0ZSh0aGlzLmhpc3RvcnkpO1xuICB9XG5cbiAgX3VwZGF0ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuX3ByZWZlcmVuY2VzU3RvcmUud3JpdGUoe1xuICAgICAgaXNfZW5hYmxlZDogdGhpcy5pc0VuYWJsZWQsXG4gICAgICBhY3RpdmVfZGV2aWNlczogdGhpcy5hY3RpdmVEZXZpY2VzLFxuICAgICAgcGVuZGluZ19kZXZpY2VzOiB0aGlzLnBlbmRpbmdEZXZpY2VzLFxuICAgICAgbGFzdF9yZWFkczogdGhpcy5fbGFzdFJlYWRzXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jdXN0b21lcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5DdXN0b21lck1hbmFnZXIgPSBjbGFzcyBDdXN0b21lck1hbmFnZXIge1xuICAvKiBnbG9iYWwgbW9tZW50ICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBFbnZpcm9ubWVudCwgRHRzQXBpLCBDdXN0b21lck1vZGVsKSB7XG4gICAgdGhpcy5fYXBpID0gRHRzQXBpO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX2N1c3RvbWVyQXBwSWQgPSBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbi5jbGllbnRfaWQ7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0N1c3RvbWVyTW9kZWw7XG4gIH1cblxuICBnZXQgY3VzdG9tZXJOYW1lKCkge1xuICAgIGlmICh0aGlzLm1vZGVsLmlzRW5hYmxlZCAmJiB0aGlzLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICB2YXIgbmFtZSA9ICcnO1xuXG4gICAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUuZmlyc3RfbmFtZSkge1xuICAgICAgICBuYW1lICs9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmZpcnN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWUpIHtcbiAgICAgICAgbmFtZSArPSAnICcgKyBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5sYXN0X25hbWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgbG9nb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBudWxsO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZ3Vlc3RMb2dpbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gJ2d1ZXN0JztcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ2luKGNyZWRlbnRpYWxzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkub2F1dGgyLmdldFRva2VuV2l0aENyZWRlbnRpYWxzKFxuICAgICAgICBzZWxmLl9jdXN0b21lckFwcElkLFxuICAgICAgICBjcmVkZW50aWFscy5sb2dpbixcbiAgICAgICAgY3JlZGVudGlhbHMucGFzc3dvcmRcbiAgICAgICkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZWplY3QoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQuZXJyb3IgfHwgIXJlc3VsdC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KHJlc3VsdC5lcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Vzc2lvbiA9IHtcbiAgICAgICAgICBhY2Nlc3NfdG9rZW46IHJlc3VsdC5hY2Nlc3NfdG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVzdWx0LmV4cGlyZXNfaW4pIHtcbiAgICAgICAgICBzZXNzaW9uLmV4cGlyZXMgPSBtb21lbnQoKS5hZGQocmVzdWx0LmV4cGlyZXNfaW4sICdzZWNvbmRzJykudW5peCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5zZXNzaW9uID0gc2Vzc2lvbjtcblxuICAgICAgICBzZWxmLl9sb2FkUHJvZmlsZSgpLnRoZW4ocmVzb2x2ZSwgZSA9PiB7XG4gICAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5zZXNzaW9uID0gbnVsbDtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGxvZ2luU29jaWFsKHRva2VuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgc2Vzc2lvbiA9IHtcbiAgICAgICAgYWNjZXNzX3Rva2VuOiB0b2tlbi5hY2Nlc3NfdG9rZW5cbiAgICAgIH07XG5cbiAgICAgIGlmICh0b2tlbi5leHBpcmVzX2luKSB7XG4gICAgICAgIHNlc3Npb24uZXhwaXJlcyA9IG1vbWVudCgpLmFkZCh0b2tlbi5leHBpcmVzX2luLCAnc2Vjb25kcycpLnVuaXgoKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5zZXNzaW9uID0gc2Vzc2lvbjtcblxuICAgICAgc2VsZi5fbG9hZFByb2ZpbGUoKS50aGVuKHJlc29sdmUsIGUgPT4ge1xuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnNlc3Npb24gPSBudWxsO1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNpZ25VcChyZWdpc3RyYXRpb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJlZ2lzdHJhdGlvbi5jbGllbnRfaWQgPSBzZWxmLl9jdXN0b21lckFwcElkO1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnNpZ25VcChyZWdpc3RyYXRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogcmVnaXN0cmF0aW9uLnVzZXJuYW1lLFxuICAgICAgICAgIHBhc3N3b3JkOiByZWdpc3RyYXRpb24ucGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVByb2ZpbGUocHJvZmlsZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnVwZGF0ZVByb2ZpbGUocHJvZmlsZSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFuZ2VQYXNzd29yZChyZXF1ZXN0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuY2hhbmdlUGFzc3dvcmQocmVxdWVzdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYubG9naW4oe1xuICAgICAgICAgIGxvZ2luOiBzZWxmLl9DdXN0b21lck1vZGVsLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiByZXF1ZXN0Lm5ld19wYXNzd29yZFxuICAgICAgICB9KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzZXRQYXNzd29yZChyZXF1ZXN0KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIucmVzZXRQYXNzd29yZChyZXF1ZXN0KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9sb2FkUHJvZmlsZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5nZXRQcm9maWxlKCkudGhlbihwcm9maWxlID0+IHtcbiAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gcHJvZmlsZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2N1c3RvbWVybW9kZWwuanNcblxud2luZG93LmFwcC5DdXN0b21lck1vZGVsID0gY2xhc3MgQ3VzdG9tZXJNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9hY2NvdW50U3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXInKTtcbiAgICB0aGlzLl9zZXNzaW9uU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXJfYWNjZXNzdG9rZW4nKTtcblxuICAgIHRoaXMuX3Byb2ZpbGUgPSBudWxsO1xuICAgIHRoaXMuX3Nlc3Npb24gPSBudWxsO1xuXG4gICAgdGhpcy5faXNHdWVzdCA9IGZhbHNlO1xuICAgIHRoaXMuX2lzRW5hYmxlZCA9IEJvb2xlYW4oQ29uZmlnLmFjY291bnRzKTtcblxuICAgIHRoaXMucHJvZmlsZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2FjY291bnRTdG9yZS5yZWFkKCkudGhlbihhY2NvdW50ID0+IHtcbiAgICAgIHNlbGYuX2lzR3Vlc3QgPSBhY2NvdW50ICYmIGFjY291bnQuaXNfZ3Vlc3Q7XG5cbiAgICAgIGlmICghYWNjb3VudCB8fCBhY2NvdW50LmlzX2d1ZXN0KSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGYuX3Byb2ZpbGUgPSBhY2NvdW50LnByb2ZpbGU7XG4gICAgICB9XG5cbiAgICAgIHNlbGYucHJvZmlsZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fcHJvZmlsZSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2lzRW5hYmxlZCk7XG4gIH1cblxuICBnZXQgaXNBdXRoZW50aWNhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzRW5hYmxlZCAmJiAoQm9vbGVhbih0aGlzLnByb2ZpbGUpIHx8IHRoaXMuaXNHdWVzdCk7XG4gIH1cblxuICBnZXQgaXNHdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQgJiYgQm9vbGVhbih0aGlzLl9pc0d1ZXN0KTtcbiAgfVxuXG4gIGdldCBoYXNDcmVkZW50aWFscygpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5pc0d1ZXN0ICYmIHRoaXMucHJvZmlsZS50eXBlID09PSAxKTtcbiAgfVxuXG4gIGdldCBwcm9maWxlKCkge1xuICAgIHJldHVybiB0aGlzLl9wcm9maWxlO1xuICB9XG5cbiAgc2V0IHByb2ZpbGUodmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fcHJvZmlsZSA9IHZhbHVlIHx8IG51bGw7XG4gICAgdGhpcy5faXNHdWVzdCA9IHZhbHVlID09PSAnZ3Vlc3QnO1xuXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdGhpcy5fYWNjb3VudFN0b3JlLmNsZWFyKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX2lzR3Vlc3QgPSBmYWxzZTtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcbiAgICAgICAgc2VsZi5zZXNzaW9uID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2FjY291bnRTdG9yZS53cml0ZSh7XG4gICAgICAgIHByb2ZpbGU6IHRoaXMuX3Byb2ZpbGUsXG4gICAgICAgIGlzX2d1ZXN0OiB0aGlzLl9pc0d1ZXN0XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5wcm9maWxlQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9wcm9maWxlKTtcblxuICAgICAgICBpZiAoIXZhbHVlIHx8IHNlbGYuX2lzR3Vlc3QpIHtcbiAgICAgICAgICBzZWxmLnNlc3Npb24gPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXQgc2Vzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbjtcbiAgfVxuXG4gIHNldCBzZXNzaW9uKHZhbHVlKSB7XG4gICAgdGhpcy5fc2Vzc2lvbiA9IHZhbHVlIHx8IG51bGw7XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLl9zZXNzaW9uU3RvcmUuY2xlYXIoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9zZXNzaW9uU3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZGF0YW1hbmFnZXIuanNcblxud2luZG93LmFwcC5EYXRhTWFuYWdlciA9IGNsYXNzIERhdGFNYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG5cbiAgICB0aGlzLmhvbWVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5tZW51Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY2F0ZWdvcnlDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5pdGVtQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fQ0FDSEVBQkxFX01FRElBX0tJTkRTID0gW1xuICAgICAgNDEsIDUxLCA1OCwgNjFcbiAgICBdO1xuICB9XG5cbiAgZ2V0IHByb3ZpZGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9EYXRhUHJvdmlkZXI7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jYWNoZSA9IHtcbiAgICAgIG1lbnU6IHt9LFxuICAgICAgY2F0ZWdvcnk6IHt9LFxuICAgICAgaXRlbToge30sXG4gICAgICBtZWRpYToge31cbiAgICB9O1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdJbml0aWFsaXppbmcgZGF0YSBtYW5hZ2VyLicpO1xuXG4gICAgdGhpcy5wcm92aWRlci5kaWdlc3QoKS50aGVuKGRpZ2VzdCA9PiB7XG4gICAgICB2YXIgbWVudVNldHMgPSBkaWdlc3QubWVudV9zZXRzLm1hcChtZW51ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLm1lbnUobWVudS50b2tlbilcbiAgICAgICAgICAgIC50aGVuKGRhdGEgPT4gc2VsZi5fY2FjaGUubWVudVttZW51LnRva2VuXSA9IHNlbGYuX2ZpbHRlck1lbnUoZGF0YSkpXG4gICAgICAgICAgICAudGhlbihyZXNvbHZlLCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdmFyIG1lbnVDYXRlZ29yaWVzID0gZGlnZXN0Lm1lbnVfY2F0ZWdvcmllcy5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIuY2F0ZWdvcnkoY2F0ZWdvcnkudG9rZW4pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHNlbGYuX2NhY2hlLmNhdGVnb3J5W2NhdGVnb3J5LnRva2VuXSA9IHNlbGYuX2ZpbHRlckNhdGVnb3J5KGRhdGEpKVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBtZW51SXRlbXMgPSBkaWdlc3QubWVudV9pdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5pdGVtKGl0ZW0udG9rZW4pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHNlbGYuX2NhY2hlLml0ZW1baXRlbS50b2tlbl0gPSBkYXRhKVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBtZWRpYXMgPSBkaWdlc3QubWVkaWFcbiAgICAgICAgLmZpbHRlcihtZWRpYSA9PiBzZWxmLl9DQUNIRUFCTEVfTUVESUFfS0lORFMuaW5kZXhPZihtZWRpYS5raW5kKSAhPT0gLTEpXG4gICAgICAgIC5tYXAobWVkaWEgPT4ge1xuICAgICAgICAgIHZhciB3aWR0aCwgaGVpZ2h0O1xuXG4gICAgICAgICAgc3dpdGNoIChtZWRpYS5raW5kKSB7XG4gICAgICAgICAgICBjYXNlIDQxOlxuICAgICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgICAgd2lkdGggPSAzNzA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDM3MDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgICB3aWR0aCA9IDYwMDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gNjAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgICAgIHdpZHRoID0gMTAwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSAxMDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG1lZGlhLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgbWVkaWEuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgICAgcmV0dXJuIG1lZGlhO1xuICAgICAgICB9KVxuICAgICAgICAubWFwKG1lZGlhID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc2VsZi5wcm92aWRlci5tZWRpYShtZWRpYSlcbiAgICAgICAgICAgICAgLnRoZW4oaW1nID0+IHNlbGYuX2NhY2hlLm1lZGlhW21lZGlhLnRva2VuXSA9IGltZylcbiAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVzb2x2ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYERpZ2VzdCBjb250YWlucyAke21lbnVTZXRzLmxlbmd0aH0gbWVudXMsIGAgK1xuICAgICAgICBgJHttZW51Q2F0ZWdvcmllcy5sZW5ndGh9IGNhdGVnb3JpZXMsIGAgK1xuICAgICAgICBgJHttZW51SXRlbXMubGVuZ3RofSBpdGVtcyBhbmQgYCArXG4gICAgICAgIGAke21lZGlhcy5sZW5ndGh9IGZpbGVzLmApO1xuXG4gICAgICB2YXIgdGFza3MgPSBbXVxuICAgICAgICAuY29uY2F0KG1lbnVTZXRzKVxuICAgICAgICAuY29uY2F0KG1lbnVDYXRlZ29yaWVzKVxuICAgICAgICAuY29uY2F0KG1lbnVJdGVtcyk7XG5cbiAgICAgIFByb21pc2UuYWxsKHRhc2tzKS50aGVuKCgpID0+IHtcbiAgICAgICAgUHJvbWlzZS5hbGwobWVkaWFzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGhvbWUoKSB7IHJldHVybiB0aGlzLl9ob21lOyB9XG4gIHNldCBob21lKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2hvbWUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9ob21lID0gdmFsdWU7XG4gICAgICB0aGlzLnByb3ZpZGVyLmhvbWUoKS50aGVuKGhvbWUgPT4ge1xuICAgICAgICBpZiAoc2VsZi5faG9tZSkge1xuICAgICAgICAgIGhvbWUgPSBzZWxmLl9maWx0ZXJIb21lKGhvbWUpO1xuICAgICAgICAgIHNlbGYuaG9tZUNoYW5nZWQuZGlzcGF0Y2goaG9tZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2hvbWUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmhvbWVDaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG1lbnUoKSB7IHJldHVybiB0aGlzLl9tZW51OyB9XG4gIHNldCBtZW51KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX21lbnUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9tZW51ID0gdmFsdWU7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVkKCdtZW51JywgdmFsdWUpO1xuXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZW51Q2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5tZW51KHZhbHVlKS50aGVuKG1lbnUgPT4ge1xuICAgICAgICBpZiAoc2VsZi5fbWVudSkge1xuICAgICAgICAgIG1lbnUgPSBzZWxmLl9maWx0ZXJNZW51KG1lbnUpO1xuICAgICAgICAgIHNlbGYubWVudUNoYW5nZWQuZGlzcGF0Y2gobWVudSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX21lbnUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNhdGVnb3J5KCkgeyByZXR1cm4gdGhpcy5fY2F0ZWdvcnk7IH1cbiAgc2V0IGNhdGVnb3J5KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2NhdGVnb3J5ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5fY2F0ZWdvcnkgPSB2YWx1ZTtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZWQoJ2NhdGVnb3J5JywgdmFsdWUpO1xuXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXRlZ29yeUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIuY2F0ZWdvcnkodmFsdWUpLnRoZW4oY2F0ZWdvcnkgPT4ge1xuICAgICAgICBpZiAoc2VsZi5fY2F0ZWdvcnkpIHtcbiAgICAgICAgICBjYXRlZ29yeSA9IHNlbGYuX2ZpbHRlckNhdGVnb3J5KGNhdGVnb3J5KTtcbiAgICAgICAgICBzZWxmLmNhdGVnb3J5Q2hhbmdlZC5kaXNwYXRjaChjYXRlZ29yeSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2NhdGVnb3J5ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5jYXRlZ29yeUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgaXRlbSgpIHsgcmV0dXJuIHRoaXMuX2l0ZW07IH1cbiAgc2V0IGl0ZW0odmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXRlbSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2l0ZW0gPSB2YWx1ZTtcblxuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9jYWNoZWQoJ2l0ZW0nLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLml0ZW0odmFsdWUpLnRoZW4oaXRlbSA9PiB7XG4gICAgICAgIGlmIChzZWxmLl9pdGVtKSB7XG4gICAgICAgICAgc2VsZi5pdGVtQ2hhbmdlZC5kaXNwYXRjaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5faXRlbSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuaXRlbUNoYW5nZWQuZGlzcGF0Y2godW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBfY2FjaGVkKGdyb3VwLCBpZCkge1xuICAgIGlmICghdGhpcy5fY2FjaGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0gJiYgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCFpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZVtncm91cF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBfZmlsdGVySG9tZShkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRhdGEubWVudXMgPSBkYXRhLm1lbnVzXG4gICAgICAuZmlsdGVyKG1lbnUgPT4gc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgbWVudS50eXBlICE9PSAzKTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgX2ZpbHRlck1lbnUoZGF0YSkge1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgX2ZpbHRlckNhdGVnb3J5KGRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZGF0YS5pdGVtcyA9IGRhdGEuaXRlbXNcbiAgICAgIC5maWx0ZXIoaXRlbSA9PiBzZWxmLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBpdGVtLnR5cGUgIT09IDMpO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kYXRhcHJvdmlkZXIuanNcblxud2luZG93LmFwcC5EYXRhUHJvdmlkZXIgPSBjbGFzcyBEYXRhUHJvdmlkZXIge1xuICBjb25zdHJ1Y3Rvcihjb25maWcsIHNlcnZpY2UpIHtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fc2VydmljZSA9IHNlcnZpY2U7XG4gICAgdGhpcy5fY2FjaGUgPSB7fTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fY2FjaGUgPSB7fTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpZ2VzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2RpZ2VzdCcsICdnZXREaWdlc3QnKTtcbiAgfVxuXG4gIGhvbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdob21lJywgJ2dldE1lbnVzJyk7XG4gIH1cblxuICBhZHZlcnRpc2VtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2FkdmVydGlzZW1lbnRzJywgJ2dldEFkdmVydGlzZW1lbnRzJyk7XG4gIH1cblxuICBiYWNrZ3JvdW5kcygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2JhY2tncm91bmRzJywgJ2dldEJhY2tncm91bmRzJyk7XG4gIH1cblxuICBlbGVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2VsZW1lbnRzJywgJ2dldEVsZW1lbnRzJyk7XG4gIH1cblxuICBtZW51KGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdtZW51JywgJ2dldE1lbnUnLCBpZCk7XG4gIH1cblxuICBjYXRlZ29yeShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnY2F0ZWdvcnknLCAnZ2V0TWVudUNhdGVnb3J5JywgaWQpO1xuICB9XG5cbiAgaXRlbShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnaXRlbScsICdnZXRNZW51SXRlbScsIGlkKTtcbiAgfVxuXG4gIHN1cnZleXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdzdXJ2ZXlzJywgJ2dldFN1cnZleXMnKTtcbiAgfVxuXG4gIHNlYXRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdzZWF0cycpIHx8IHRoaXMuX3NlcnZpY2UubG9jYXRpb24uZ2V0U2VhdHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCAnc2VhdHMnKTtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgbWVkaWEobWVkaWEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHRva2VuID0gbWVkaWEudG9rZW4gKyAnXycgKyBtZWRpYS53aWR0aCArICdfJyArIG1lZGlhLmhlaWdodDtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKCdtZWRpYScsIHRva2VuKSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAobWVkaWEud2lkdGggJiYgbWVkaWEuaGVpZ2h0KSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1nKTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSAoZSkgPT4gcmVqZWN0KGUpO1xuICAgICAgICBpbWcuc3JjID0gc2VsZi5fZ2V0TWVkaWFVcmwobWVkaWEsIG1lZGlhLndpZHRoLCBtZWRpYS5oZWlnaHQsIG1lZGlhLmV4dGVuc2lvbik7XG5cbiAgICAgICAgc2VsZi5fc3RvcmUoaW1nLCAnbWVkaWEnLCB0b2tlbik7XG5cbiAgICAgICAgaWYgKGltZy5jb21wbGV0ZSkge1xuICAgICAgICAgIHJlc29sdmUoaW1nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlamVjdCgnTWlzc2luZyBpbWFnZSBkaW1lbnNpb25zJyk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBfZ2V0U25hcERhdGEobmFtZSwgbWV0aG9kLCBpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkKG5hbWUsIGlkKSB8fCB0aGlzLl9zZXJ2aWNlLnNuYXBbbWV0aG9kXSh0aGlzLl9jb25maWcubG9jYXRpb24sIGlkKS50aGVuKGRhdGEgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEgfHwgW107XG4gICAgICBzZWxmLl9zdG9yZShkYXRhLCBuYW1lLCBpZCk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIF9vbkVycm9yKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG4gICAgcmV0dXJuIGU7XG4gIH1cblxuICBfY2FjaGVkKGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0gJiYgdGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF1baWRdKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlkICYmIHRoaXMuX2NhY2hlW2dyb3VwXSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jYWNoZVtncm91cF0pO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgX3N0b3JlKGRhdGEsIGdyb3VwLCBpZCkge1xuICAgIGlmIChpZCkge1xuICAgICAgaWYgKCF0aGlzLl9jYWNoZVtncm91cF0pIHtcbiAgICAgICAgdGhpcy5fY2FjaGVbZ3JvdXBdID0ge307XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0gPSBkYXRhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXSA9IGRhdGE7XG4gICAgfVxuICB9XG5cbiAgX2dldE1lZGlhVXJsKCkge1xuXG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9kaWFsb2dtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuRGlhbG9nTWFuYWdlciA9IGNsYXNzIERpYWxvZ01hbmFnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFsZXJ0UmVxdWVzdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5ub3RpZmljYXRpb25SZXF1ZXN0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNvbmZpcm1SZXF1ZXN0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmpvYlN0YXJ0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmpvYkVuZGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5tb2RhbFN0YXJ0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm1vZGFsRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9qb2JzID0gMDtcbiAgICB0aGlzLl9tb2RhbHMgPSAwO1xuICB9XG5cbiAgYWxlcnQobWVzc2FnZSwgdGl0bGUpIHtcbiAgICB0aGlzLmFsZXJ0UmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHRpdGxlKTtcbiAgfVxuXG4gIG5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgdGhpcy5ub3RpZmljYXRpb25SZXF1ZXN0ZWQuZGlzcGF0Y2gobWVzc2FnZSk7XG4gIH1cblxuICBjb25maXJtKG1lc3NhZ2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5jb25maXJtUmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydEpvYigpIHtcbiAgICB0aGlzLl9qb2JzKys7XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMSkge1xuICAgICAgdGhpcy5qb2JTdGFydGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2pvYnM7XG4gIH1cblxuICBlbmRKb2IoaWQpIHtcbiAgICB0aGlzLl9qb2JzLS07XG5cbiAgICBpZiAodGhpcy5fam9icyA9PT0gMCkge1xuICAgICAgdGhpcy5qb2JFbmRlZC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TW9kYWwoKSB7XG4gICAgdGhpcy5fbW9kYWxzKys7XG5cbiAgICBpZiAodGhpcy5fbW9kYWxzID09PSAxKSB7XG4gICAgICB0aGlzLm1vZGFsU3RhcnRlZC5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9tb2RhbHM7XG4gIH1cblxuICBlbmRNb2RhbChpZCkge1xuICAgIHRoaXMuX21vZGFscy0tO1xuXG4gICAgaWYgKHRoaXMuX21vZGFscyA9PT0gMCkge1xuICAgICAgdGhpcy5tb2RhbEVuZGVkLmRpc3BhdGNoKCk7XG4gICAgfVxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvaGVhdG1hcC5qc1xuXG53aW5kb3cuYXBwLkhlYXRNYXAgPSBjbGFzcyBIZWF0TWFwIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2xpc3RlbmVyID0gZSA9PiB7XG4gICAgICBzZWxmLl9vbkNsaWNrKGUpO1xuICAgIH07XG5cbiAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fbGlzdGVuZXIpO1xuXG4gICAgdGhpcy5jbGlja2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9saXN0ZW5lcik7XG4gIH1cblxuICBfb25DbGljayhlKSB7XG4gICAgbGV0IGRhdGEgPSB7XG4gICAgICB4OiBlLmxheWVyWCAvIHRoaXMuX2VsZW1lbnQuY2xpZW50V2lkdGgsXG4gICAgICB5OiBlLmxheWVyWSAvIHRoaXMuX2VsZW1lbnQuY2xpZW50SGVpZ2h0XG4gICAgfTtcblxuICAgIGlmIChkYXRhLnggPCAwIHx8IGRhdGEueSA8IDAgfHwgZGF0YS54ID4gMSB8fCBkYXRhLnkgPiAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jbGlja2VkLmRpc3BhdGNoKGRhdGEpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbG9jYXRpb25tb2RlbC5qc1xuXG53aW5kb3cuYXBwLkxvY2F0aW9uTW9kZWwgPSBjbGFzcyBMb2NhdGlvbk1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX2xvY2F0aW9uID0gU05BUEVudmlyb25tZW50LmxvY2F0aW9uO1xuXG4gICAgdGhpcy5fc2VhdFN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX3NlYXQnKTtcblxuICAgIHRoaXMuX3NlYXQgPSB7fTtcbiAgICB0aGlzLnNlYXRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9zZWF0cyA9IFtdO1xuICAgIHRoaXMuc2VhdHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9kZXZpY2UgPSBTTkFQRW52aXJvbm1lbnQuZGV2aWNlO1xuXG4gICAgdGhpcy5fZGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuZGV2aWNlc0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX3NlYXRTdG9yZS5yZWFkKCkudGhlbihzZWF0ID0+IHtcbiAgICAgIHNlbGYuX3NlYXQgPSBzZWF0O1xuXG4gICAgICBpZiAoc2VhdCkge1xuICAgICAgICBzZWxmLnNlYXRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3NlYXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGxvY2F0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9sb2NhdGlvbjtcbiAgfVxuXG4gIGdldCBzZWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9zZWF0O1xuICB9XG5cbiAgc2V0IHNlYXQodmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG9sZFNlYXQgPSB0aGlzLl9zZWF0IHx8IHt9O1xuICAgIHRoaXMuX3NlYXQgPSB2YWx1ZSB8fCB7fTtcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHRoaXMuX3NlYXRTdG9yZS5jbGVhcigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLnNlYXRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3NlYXQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBzZWxmLl9zZWF0ID0gb2xkU2VhdDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX3NlYXRTdG9yZS53cml0ZSh0aGlzLl9zZWF0KS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5zZWF0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLl9zZWF0KTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fc2VhdCA9IG9sZFNlYXQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXQgc2VhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlYXRzO1xuICB9XG5cbiAgc2V0IHNlYXRzKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3NlYXRzID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NlYXRzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5zZWF0c0NoYW5nZWQuZGlzcGF0Y2godGhpcy5fc2VhdHMpO1xuICB9XG5cbiAgZ2V0IGRldmljZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGV2aWNlO1xuICB9XG5cbiAgZ2V0IGRldmljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RldmljZXM7XG4gIH1cblxuICBzZXQgZGV2aWNlcyh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9kZXZpY2VzID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2RldmljZXMgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLmRldmljZXNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2RldmljZXMpO1xuICB9XG5cbiAgYWRkRGV2aWNlKGRldmljZSkge1xuICAgIHRoaXMuX2RldmljZXMucHVzaChkZXZpY2UpO1xuICAgIHRoaXMuZGV2aWNlcyA9IHRoaXMuX2RldmljZXM7XG4gIH1cblxuICBnZXRTZWF0KHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VhdHMuZmlsdGVyKHNlYXQgPT4gc2VhdC50b2tlbiA9PT0gdG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cblxuICBnZXREZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlcy5maWx0ZXIoZCA9PiAoZGV2aWNlLnRva2VuIHx8IGRldmljZSkgPT09IGQudG9rZW4pWzBdIHx8IG51bGw7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9sb2dnZXIuanNcblxud2luZG93LmFwcC5Mb2dnZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9sb2cgPSBsb2c0amF2YXNjcmlwdC5nZXRMb2dnZXIoKTtcblxuICAgIHZhciBhamF4QXBwZW5kZXIgPSBuZXcgbG9nNGphdmFzY3JpcHQuQWpheEFwcGVuZGVyKCcvc25hcC9sb2cnKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0V2FpdEZvclJlc3BvbnNlKHRydWUpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRMYXlvdXQobmV3IGxvZzRqYXZhc2NyaXB0Lkpzb25MYXlvdXQoKSk7XG4gICAgYWpheEFwcGVuZGVyLnNldFRocmVzaG9sZChsb2c0amF2YXNjcmlwdC5MZXZlbC5FUlJPUik7XG5cbiAgICB0aGlzLl9sb2cuYWRkQXBwZW5kZXIoYWpheEFwcGVuZGVyKTtcbiAgICB0aGlzLl9sb2cuYWRkQXBwZW5kZXIobmV3IGxvZzRqYXZhc2NyaXB0LkJyb3dzZXJDb25zb2xlQXBwZW5kZXIoKSk7XG4gIH1cblxuICBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmRlYnVnKC4uLmFyZ3MpO1xuICB9XG5cbiAgaW5mbyguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmluZm8oLi4uYXJncyk7XG4gIH1cblxuICB3YXJuKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cud2FybiguLi5hcmdzKTtcbiAgfVxuXG4gIGVycm9yKC4uLmFyZ3MpIHtcbiAgICB0aGlzLl9sb2cuZXJyb3IoLi4uYXJncyk7XG4gIH1cblxuICBmYXRhbCguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmZhdGFsKC4uLmFyZ3MpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWFuYWdlbWVudHNlcnZpY2UuanNcblxud2luZG93LmFwcC5NYW5hZ2VtZW50U2VydmljZSA9IGNsYXNzIE1hbmFnZW1lbnRTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9hcGkgPSB7XG4gICAgICAncm90YXRlU2NyZWVuJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9yb3RhdGUtc2NyZWVuJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ29wZW5Ccm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9vcGVuLWJyb3dzZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnY2xvc2VCcm93c2VyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9jbG9zZS1icm93c2VyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3N0YXJ0Q2FyZFJlYWRlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvc3RhcnQtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc3RvcENhcmRSZWFkZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3N0b3AtY2FyZC1yZWFkZXInLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAncmVzZXQnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3Jlc2V0Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2dldFNvdW5kVm9sdW1lJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC92b2x1bWUnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc2V0U291bmRWb2x1bWUnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3ZvbHVtZScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdnZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzZXREaXNwbGF5QnJpZ2h0bmVzcyc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvYnJpZ2h0bmVzcycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KVxuICAgIH07XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9XG5cbiAgcm90YXRlU2NyZWVuKCkge1xuICAgIHRoaXMuX2FwaS5yb3RhdGVTY3JlZW4ucXVlcnkoKTtcbiAgfVxuXG4gIG9wZW5Ccm93c2VyKHVybCkge1xuICAgIHRoaXMuX2FwaS5vcGVuQnJvd3Nlci5xdWVyeSh7IHVybDogdXJsIH0pO1xuICB9XG5cbiAgY2xvc2VCcm93c2VyKCkge1xuICAgIHRoaXMuX2FwaS5jbG9zZUJyb3dzZXIucXVlcnkoKTtcbiAgfVxuXG4gIHN0YXJ0Q2FyZFJlYWRlcigpIHtcbiAgICB0aGlzLl9hcGkuc3RhcnRDYXJkUmVhZGVyLnF1ZXJ5KCk7XG4gIH1cblxuICBzdG9wQ2FyZFJlYWRlcigpIHtcbiAgICB0aGlzLl9hcGkuc3RvcENhcmRSZWFkZXIucXVlcnkoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLnJlc2V0LnF1ZXJ5KCkuJHByb21pc2UudGhlbihyZXNvbHZlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmFzc2lnbignL3NuYXAvJyArIGVuY29kZVVSSUNvbXBvbmVudChzZWxmLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0pKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0U291bmRWb2x1bWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXRTb3VuZFZvbHVtZS5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0U291bmRWb2x1bWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldFNvdW5kVm9sdW1lLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG5cbiAgZ2V0RGlzcGxheUJyaWdodG5lc3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5nZXREaXNwbGF5QnJpZ2h0bmVzcy5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG5cbiAgc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNldERpc3BsYXlCcmlnaHRuZXNzLnF1ZXJ5KHsgdmFsdWU6IHZhbHVlIH0pLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbWVkaWFzdGFydGVyLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgLyogZ2xvYmFsIHN3Zm9iamVjdCAqL1xuXG4gIGZ1bmN0aW9uIE1lZGlhU3RhcnRlcihpZCkge1xuXG4gICAgdmFyIGZsYXNodmFycyA9IHt9O1xuICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICBtZW51OiAnZmFsc2UnLFxuICAgICAgd21vZGU6ICdkaXJlY3QnLFxuICAgICAgYWxsb3dGdWxsU2NyZWVuOiAnZmFsc2UnXG4gICAgfTtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIG5hbWU6IGlkXG4gICAgfTtcblxuICAgIHN3Zm9iamVjdC5lbWJlZFNXRihcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd1cmwnKSxcbiAgICAgIGlkLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ3dpZHRoJyksXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcignaGVpZ2h0JyksXG4gICAgICAnMTYuMC4wJyxcbiAgICAgICdleHByZXNzSW5zdGFsbC5zd2YnLFxuICAgICAgZmxhc2h2YXJzLFxuICAgICAgcGFyYW1zLFxuICAgICAgYXR0cmlidXRlcyxcbiAgICAgIGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZiAocmVzLnN1Y2Nlc3MgIT09IHRydWUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKHJlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgTWVkaWFTdGFydGVyLnByb3RvdHlwZS5fZ2V0UXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCBcIlxcXFxbXCIpLnJlcGxhY2UoL1tcXF1dLywgXCJcXFxcXVwiKTtcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKFwiW1xcXFwjJl1cIiArIG5hbWUgKyBcIj0oW14mI10qKVwiKSxcbiAgICByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5oYXNoKTtcbiAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuTWVkaWFTdGFydGVyID0gTWVkaWFTdGFydGVyO1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL25hdmlnYXRpb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuTmF2aWdhdGlvbk1hbmFnZXIgPSBjbGFzcyBOYXZpZ2F0aW9uTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBBbmFseXRpY3NNb2RlbCkge1xuICAgIHRoaXMuJCRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICB0aGlzLiQkd2luZG93ID0gJHdpbmRvdztcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5sb2NhdGlvbkNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgKCkgPT4ge1xuICAgICAgdmFyIHBhdGggPSBzZWxmLiQkbG9jYXRpb24ucGF0aCgpO1xuXG4gICAgICBpZiAocGF0aCA9PT0gc2VsZi5fcGF0aCkge1xuICAgICAgICBzZWxmLmxvY2F0aW9uQ2hhbmdlZC5kaXNwYXRjaChzZWxmLl9sb2NhdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fcGF0aCA9IHBhdGg7XG4gICAgICBzZWxmLl9sb2NhdGlvbiA9IHNlbGYuZ2V0TG9jYXRpb24ocGF0aCk7XG4gICAgICBzZWxmLmxvY2F0aW9uQ2hhbmdpbmcuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHNlbGYuX0FuYWx5dGljc01vZGVsLmxvZ05hdmlnYXRpb24obG9jYXRpb24pKTtcbiAgfVxuXG4gIGdldCBwYXRoKCkgeyByZXR1cm4gdGhpcy5fcGF0aDsgfVxuICBzZXQgcGF0aCh2YWx1ZSkge1xuICAgIHZhciBpID0gdmFsdWUuaW5kZXhPZignIycpLFxuICAgICAgICBwYXRoID0gaSAhPT0gLTEgPyB2YWx1ZS5zdWJzdHJpbmcoaSArIDEpIDogdmFsdWU7XG5cbiAgICB0aGlzLmxvY2F0aW9uID0gdGhpcy5nZXRMb2NhdGlvbihwYXRoKTtcbiAgfVxuXG4gIGdldCBsb2NhdGlvbigpIHsgcmV0dXJuIHRoaXMuX2xvY2F0aW9uOyB9XG4gIHNldCBsb2NhdGlvbih2YWx1ZSkge1xuICAgIHRoaXMuX2xvY2F0aW9uID0gdmFsdWU7XG5cbiAgICB0aGlzLmxvY2F0aW9uQ2hhbmdpbmcuZGlzcGF0Y2godGhpcy5fbG9jYXRpb24pO1xuXG4gICAgdmFyIHBhdGggPSB0aGlzLl9wYXRoID0gdGhpcy5nZXRQYXRoKHRoaXMuX2xvY2F0aW9uKTtcbiAgICB0aGlzLiQkbG9jYXRpb24ucGF0aChwYXRoKTtcbiAgfVxuXG4gIGdldFBhdGgobG9jYXRpb24pIHtcbiAgICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobG9jYXRpb24udG9rZW4pIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgbG9jYXRpb24udG9rZW47XG4gICAgfVxuICAgIGVsc2UgaWYgKGxvY2F0aW9uLnVybCkge1xuICAgICAgcmV0dXJuICcvJyArIGxvY2F0aW9uLnR5cGUgKyAnLycgKyBlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24udXJsKTtcbiAgICB9XG5cbiAgICBpZiAobG9jYXRpb24udHlwZSA9PT0gJ2hvbWUnKSB7XG4gICAgICByZXR1cm4gJy8nO1xuICAgIH1cblxuICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlO1xuICB9XG5cbiAgZ2V0TG9jYXRpb24ocGF0aCkge1xuICAgIHZhciBtYXRjaCA9IC9cXC8oXFx3Kyk/KFxcLyguKykpPy8uZXhlYyhwYXRoKTtcblxuICAgIGlmIChtYXRjaCAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICB2YXIgdHlwZSA9IG1hdGNoWzFdO1xuICAgICAgdmFyIHBhcmFtID0gbWF0Y2hbM107XG5cbiAgICAgIGlmIChwYXJhbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN3aXRjaCh0eXBlKSB7XG4gICAgICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIHVybDogZGVjb2RlVVJJQ29tcG9uZW50KHBhcmFtKSB9O1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IHR5cGUsIHRva2VuOiBwYXJhbSB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdHlwZSkge1xuICAgICAgICB0eXBlID0gJ2hvbWUnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyB0eXBlOiB0eXBlIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgZ29CYWNrKCkge1xuICAgIGlmICh0aGlzLmxvY2F0aW9uLnR5cGUgIT09ICdob21lJyAmJiB0aGlzLmxvY2F0aW9uLnR5cGUgIT09ICdzaWduaW4nKSB7XG4gICAgICB0aGlzLiQkd2luZG93Lmhpc3RvcnkuYmFjaygpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL29yZGVybWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk9yZGVyTWFuYWdlciA9IGNsYXNzIE9yZGVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fQ2hhdE1vZGVsID0gQ2hhdE1vZGVsO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9PcmRlck1vZGVsID0gT3JkZXJNb2RlbDtcblxuICAgIHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKGdpZnRTZWF0ID0+IHtcbiAgICAgIGlmIChzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoID0gc2VsZi5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gW107XG4gICAgICB9XG5cbiAgICAgIGlmICghZ2lmdFNlYXQpIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnQgPSBzZWxmLm1vZGVsLm9yZGVyQ2FydFN0YXNoO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLnNlYXRzKCkudGhlbihzZWF0cyA9PiB7XG4gICAgICBzZWxmLl9Mb2NhdGlvbk1vZGVsLnNlYXRzID0gc2VhdHM7XG4gICAgICBzZWxmLl9EdHNBcGkubG9jYXRpb24uZ2V0Q3VycmVudFNlYXQoKS50aGVuKHNlYXQgPT4ge1xuICAgICAgICBzZWxmLl9Mb2NhdGlvbk1vZGVsLnNlYXQgPSBzZWF0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX09yZGVyTW9kZWw7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHNlbGYubW9kZWwuY2xlYXJXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSKTtcbiAgICAgIHNlbGYubW9kZWwuY2xlYXJXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UpO1xuICAgICAgc2VsZi5tb2RlbC5jbGVhcldhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQpO1xuXG4gICAgICBzZWxmLmNsZWFyQ2FydCgpO1xuICAgICAgc2VsZi5jbGVhckNoZWNrKCk7XG4gICAgICBzZWxmLm1vZGVsLm9yZGVyVGlja2V0ID0ge307XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2FydCBhbmQgY2hlY2tzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBhZGRUb0NhcnQoaXRlbSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0LnB1c2goaXRlbSk7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMubW9kZWwub3JkZXJDYXJ0KTtcblxuICAgIGlmICh0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQpIHtcbiAgICAgIHRoaXMuX0NoYXRNb2RlbC5naWZ0UmVhZHkuZGlzcGF0Y2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tb2RlbC5vcmRlckNhcnQ7XG4gIH1cblxuICByZW1vdmVGcm9tQ2FydChpdGVtKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQgPSB0aGlzLm1vZGVsLm9yZGVyQ2FydC5maWx0ZXIoZW50cnkgPT4gZW50cnkgIT09IGl0ZW0pO1xuICAgIHJldHVybiB0aGlzLm1vZGVsLm9yZGVyQ2FydDtcbiAgfVxuXG4gIGNsZWFyQ2FydCgpIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydCA9IFtdO1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0U3Rhc2ggPSBbXTtcblxuICAgIHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gIH1cblxuICBjbGVhckNoZWNrKGl0ZW1zKSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgaWYgKGl0ZW1zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubW9kZWwub3JkZXJDaGVjay5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGl0ZW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHRoaXMubW9kZWwub3JkZXJDaGVja1tpXSA9PT0gaXRlbXNbal0pIHtcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLm1vZGVsLm9yZGVyQ2hlY2tbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5tb2RlbC5vcmRlckNoZWNrID0gcmVzdWx0O1xuICB9XG5cbiAgc3VibWl0Q2FydChvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IDA7XG5cbiAgICBpZiAodGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0KSB7XG4gICAgICBvcHRpb25zIHw9IDQ7XG4gICAgfVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBraW5kOiB0aGlzLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUixcbiAgICAgIGl0ZW1zOiB0aGlzLm1vZGVsLm9yZGVyQ2FydC5tYXAoZW50cnkgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRva2VuOiBlbnRyeS5pdGVtLm9yZGVyLnRva2VuLFxuICAgICAgICAgIHF1YW50aXR5OiBlbnRyeS5xdWFudGl0eSxcbiAgICAgICAgICBtb2RpZmllcnM6IGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKHJlc3VsdCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuY29uY2F0KGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKHJlc3VsdCwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKG1vZGlmaWVyLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtb2RpZmllci5kYXRhLnRva2VuKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgW10pKTtcbiAgICAgICAgICB9LCBbXSksXG4gICAgICAgICAgbm90ZTogZW50cnkubmFtZSB8fCAnJ1xuICAgICAgICB9O1xuICAgICAgfSksXG4gICAgICB0aWNrZXRfdG9rZW46IHNlbGYubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgICBzZWF0X3Rva2VuOiBzZWxmLl9DaGF0TW9kZWwuZ2lmdFNlYXQsXG4gICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9EdHNBcGkud2FpdGVyLnBsYWNlT3JkZXIocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5pdGVtX3Rva2Vucykge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UuaXRlbV90b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0W2ldLnJlcXVlc3QgPSByZXNwb25zZS5pdGVtX3Rva2Vuc1tpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyVGlja2V0ID0geyB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuIH07XG5cbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNoZWNrID0gc2VsZi5tb2RlbC5vcmRlckNoZWNrLmNvbmNhdChzZWxmLm1vZGVsLm9yZGVyQ2FydCk7XG4gICAgICAgIHNlbGYuY2xlYXJDYXJ0KCk7XG5cbiAgICAgICAgc2VsZi5fQ2hhdE1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcblxuICAgICAgICBsZXQgd2F0Y2hlciA9IHNlbGYuX2NyZWF0ZVdhdGNoZXIoc2VsZi5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIsIHJlc3BvbnNlKTtcbiAgICAgICAgcmVzb2x2ZSh3YXRjaGVyKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICByZXF1ZXN0Q2xvc2VvdXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQsXG4gICAgICB0aWNrZXRfdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgfTtcblxuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnBsYWNlUmVxdWVzdChyZXF1ZXN0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYubW9kZWwub3JkZXJUaWNrZXQgPSB7IHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4gfTtcbiAgICAgIHJldHVybiBzZWxmLl9jcmVhdGVXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VULCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXF1ZXN0QXNzaXN0YW5jZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBraW5kOiB0aGlzLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFLFxuICAgICAgdGlja2V0X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5wbGFjZVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLl9zYXZlVGlja2V0KHJlc3BvbnNlKTtcbiAgICAgIHJldHVybiBzZWxmLl9jcmVhdGVXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UsIHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVByaWNlKGVudHJ5KSB7XG4gICAgdmFyIG1vZGlmaWVycyA9IGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKHRvdGFsLCBjYXRlZ29yeSkgPT4ge1xuICAgICAgcmV0dXJuIHRvdGFsICsgY2F0ZWdvcnkubW9kaWZpZXJzLnJlZHVjZSgodG90YWwsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIHJldHVybiB0b3RhbCArIChtb2RpZmllci5pc1NlbGVjdGVkICYmIG1vZGlmaWVyLmRhdGEucHJpY2UgPiAwID9cbiAgICAgICAgICBtb2RpZmllci5kYXRhLnByaWNlIDpcbiAgICAgICAgICAwXG4gICAgICAgICk7XG4gICAgICB9LCAwKTtcbiAgICB9LCAwKTtcblxuICAgIHJldHVybiBlbnRyeS5xdWFudGl0eSAqIChtb2RpZmllcnMgKyBlbnRyeS5pdGVtLm9yZGVyLnByaWNlKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcykge1xuICAgIHJldHVybiAoZW50cmllcyA/IGVudHJpZXMucmVkdWNlKCh0b3RhbCwgZW50cnkpID0+IHtcbiAgICAgIHJldHVybiB0b3RhbCArIE9yZGVyTWFuYWdlci5wcm90b3R5cGUuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuICAgIH0sIDApIDogMCk7XG4gIH1cblxuICBjYWxjdWxhdGVUYXgoZW50cmllcykge1xuICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcykgKiB0aGlzLm1vZGVsLnRheDtcbiAgfVxuXG4gIHVwbG9hZFNpZ25hdHVyZShkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS51cGxvYWQudXBsb2FkVGVtcChkYXRhLCAnaW1hZ2UvcG5nJywgJ3NpZ25hdHVyZS5wbmcnKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudG9rZW4pO1xuICB9XG5cbiAgZ2VuZXJhdGVQYXltZW50VG9rZW4oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuX0N1c3RvbWVyTW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICF0aGlzLl9DdXN0b21lck1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgIHJldHVybiB0aGlzLl9EdHNBcGkuY3VzdG9tZXIuaW5pdGlhbGl6ZVBheW1lbnQoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgc2VsZi5fc2F2ZVBheW1lbnRUb2tlbihyZXNwb25zZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5pbml0aWFsaXplUGF5bWVudCgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5fc2F2ZVBheW1lbnRUb2tlbihyZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBwYXlPcmRlcihyZXF1ZXN0KSB7XG4gICAgcmVxdWVzdC50aWNrZXRfdG9rZW4gPSB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuO1xuICAgIHJlcXVlc3QucGF5bWVudF90b2tlbiA9IHRoaXMubW9kZWwub3JkZXJUaWNrZXQucGF5bWVudF90b2tlbjtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5zdWJtaXRDaGVja291dFBheW1lbnQocmVxdWVzdCk7XG4gIH1cblxuICByZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KSB7XG4gICAgcmVxdWVzdC50aWNrZXRfdG9rZW4gPSB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuO1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkud2FpdGVyLnJlcXVlc3RSZWNlaXB0KHJlcXVlc3QpO1xuICB9XG5cbiAgX3NhdmVUaWNrZXQocmVzcG9uc2UpIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyVGlja2V0ID0ge1xuICAgICAgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbixcbiAgICAgIHBheW1lbnRfdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQucGF5bWVudF90b2tlblxuICAgIH07XG4gIH1cblxuICBfc2F2ZVBheW1lbnRUb2tlbihyZXNwb25zZSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJUaWNrZXQgPSB7XG4gICAgICB0b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICAgIHBheW1lbnRfdG9rZW46IHJlc3BvbnNlLnRva2VuXG4gICAgfTtcbiAgfVxuXG4gIF9jcmVhdGVXYXRjaGVyKGtpbmQsIHRpY2tldCkge1xuICAgIGxldCB3YXRjaGVyID0gbmV3IGFwcC5SZXF1ZXN0V2F0Y2hlcih0aWNrZXQsIHRoaXMuX0R0c0FwaSk7XG4gICAgdGhpcy5tb2RlbC5hZGRXYXRjaGVyKGtpbmQsIHdhdGNoZXIpO1xuXG4gICAgcmV0dXJuIHdhdGNoZXI7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9vcmRlcm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuT3JkZXJNb2RlbCA9IGNsYXNzIE9yZGVyTW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSID0gMTtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFID0gMjtcbiAgICB0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVCA9IDM7XG5cbiAgICB0aGlzLnByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy50YXggPSAwO1xuXG4gICAgdGhpcy5fb3JkZXJDYXJ0ID0gW107XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSBbXTtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gW107XG4gICAgdGhpcy5fb3JkZXJUaWNrZXQgPSB7fTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVycyA9IHt9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICAgIFNpZ25hbHNcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB0aGlzLm9yZGVyQ2FydENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJDaGVja0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyVGlja2V0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub3JkZXJSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gICAgSW5pdGlhbGl6YXRpb25cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0b3JlQ2FydERhdGEoaXRlbXMpIHtcbiAgICAgIHJldHVybiBpdGVtcy5tYXAgPyBpdGVtcy5tYXAoYXBwLkNhcnRJdGVtLnByb3RvdHlwZS5yZXN0b3JlKSA6IFtdO1xuICAgIH1cblxuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNhcnQgPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNhcnRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0KTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNhcnRTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2FydF9zdGFzaCcpO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoU3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDYXJ0U3Rhc2gpO1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaENoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlckNoZWNrU3RvcmFnZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9vcmRlcl9jaGVjaycpO1xuICAgIHRoaXMuX29yZGVyQ2hlY2tTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDaGVjayA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJDaGVjayk7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2hlY2tTdG9yYWdlLndyaXRlKHByZXBhcmVDYXJ0RGF0YShpdGVtcykpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9vcmRlclRpY2tldFN0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfdGlja2V0Jyk7XG4gICAgdGhpcy5fb3JkZXJUaWNrZXRTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXQgPSB2YWx1ZSB8fCB7fTtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYub3JkZXJUaWNrZXQpO1xuICAgICAgc2VsZi5vcmRlclRpY2tldENoYW5nZWQuYWRkKGRhdGEgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlclRpY2tldFN0b3JhZ2Uud3JpdGUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0IG9yZGVyQ2FydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDYXJ0O1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2FydCA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydCk7XG4gIH1cblxuICBnZXQgb3JkZXJDYXJ0U3Rhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2FydFN0YXNoO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2FydFN0YXNoKHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2ggPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2FydFN0YXNoKTtcbiAgfVxuXG4gIGdldCBvcmRlckNoZWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNoZWNrO1xuICB9XG5cbiAgc2V0IG9yZGVyQ2hlY2sodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNoZWNrID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNoZWNrQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLm9yZGVyQ2hlY2spO1xuICB9XG5cbiAgZ2V0IG9yZGVyVGlja2V0KCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlclRpY2tldDtcbiAgfVxuXG4gIHNldCBvcmRlclRpY2tldCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyVGlja2V0ID0gdmFsdWUgfHwge307XG4gICAgdGhpcy5vcmRlclRpY2tldENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlclRpY2tldCk7XG4gIH1cblxuICBnZXQgb3JkZXJSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfT1JERVIpO1xuICB9XG5cbiAgZ2V0IGFzc2lzdGFuY2VSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSk7XG4gIH1cblxuICBnZXQgY2xvc2VvdXRSZXF1ZXN0KCkge1xuICAgIHJldHVybiB0aGlzLmdldFdhdGNoZXIodGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQpO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZXF1ZXN0IHdhdGNoZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBnZXRXYXRjaGVyKGtpbmQpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICB9XG5cbiAgYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKSB7XG4gICAgdGhpcy5jbGVhcldhdGNoZXIoa2luZCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd2F0Y2hlci5wcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHNlbGYuZ2V0V2F0Y2hlcihraW5kKSAhPT0gd2F0Y2hlcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzZWxmLmNsZWFyV2F0Y2hlcihraW5kKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXSA9IHdhdGNoZXI7XG4gICAgdGhpcy5fbm90aWZ5Q2hhbmdlKGtpbmQpO1xuICB9XG5cbiAgY2xlYXJXYXRjaGVyKGtpbmQpIHtcbiAgICB2YXIgd2F0Y2hlciA9IHRoaXMuZ2V0V2F0Y2hlcihraW5kKTtcblxuICAgIGlmICh3YXRjaGVyKSB7XG4gICAgICB3YXRjaGVyLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5fcmVxdWVzdFdhdGNoZXJzW2tpbmRdO1xuICAgIHRoaXMuX25vdGlmeUNoYW5nZShraW5kKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfbm90aWZ5Q2hhbmdlKGtpbmQpIHtcbiAgICB2YXIgc2lnbmFsO1xuXG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX09SREVSOlxuICAgICAgICBzaWduYWwgPSB0aGlzLm9yZGVyUmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUOlxuICAgICAgICBzaWduYWwgPSB0aGlzLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzaWduYWwpIHtcbiAgICAgIHNpZ25hbC5kaXNwYXRjaCh0aGlzLmdldFdhdGNoZXIoa2luZCkpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3JlcXVlc3R3YXRjaGVyLmpzXG5cbndpbmRvdy5hcHAuUmVxdWVzdFdhdGNoZXIgPSBjbGFzcyBSZXF1ZXN0V2F0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKHRpY2tldCwgRHRzQXBpKSB7XG4gICAgdGhpcy5fdG9rZW4gPSB0aWNrZXQudG9rZW47XG4gICAgdGhpcy5fcmVtb3RlID0gRHRzQXBpO1xuXG4gICAgdGhpcy5QT0xMSU5HX0lOVEVSVkFMID0gNTAwMDtcblxuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfUEVORElORyA9IDE7XG4gICAgdGhpcy5SRVFVRVNUX1NUQVRVU19SRUNFSVZFRCA9IDI7XG4gICAgdGhpcy5SRVFVRVNUX1NUQVRVU19BQ0NFUFRFRCA9IDM7XG4gICAgdGhpcy5SRVFVRVNUX1NUQVRVU19FWFBJUkVEID0gMjU1O1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX3Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9zdGF0dXNVcGRhdGVSZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHNlbGYuX3N0YXR1c1VwZGF0ZVJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIHRoaXMuX3RpY2tldCA9IHsgc3RhdHVzOiAwIH07XG4gICAgdGhpcy5fd2F0Y2hTdGF0dXMoKTtcbiAgfVxuXG4gIGdldCB0b2tlbigpIHtcbiAgICByZXR1cm4gdGhpcy5fdG9rZW47XG4gIH1cblxuICBnZXQgdGlja2V0KCkge1xuICAgIHJldHVybiB0aGlzLl90aWNrZXQ7XG4gIH1cblxuICBnZXQgcHJvbWlzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXRJZCkge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl90aW1lb3V0SWQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90aWNrZXQuc3RhdHVzIDwgdGhpcy5SRVFVRVNUX1NUQVRVU19BQ0NFUFRFRCkge1xuICAgICAgdGhpcy5fc3RhdHVzVXBkYXRlUmVqZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgX3dhdGNoU3RhdHVzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl90aW1lb3V0SWQpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoc2VsZi5fdGltZW91dElkKTtcbiAgICB9XG5cbiAgICB2YXIgb25UaW1lb3V0ID0gKCkgPT4ge1xuICAgICAgc2VsZi5fcmVtb3RlLndhaXRlci5nZXRTdGF0dXMoc2VsZi5fdG9rZW4pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBzZWxmLl9zZXRUaWNrZXQocmVzcG9uc2UpO1xuICAgICAgICBzZWxmLl93YXRjaFN0YXR1cygpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBzZWxmLl93YXRjaFN0YXR1cygpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzID09PSBzZWxmLlJFUVVFU1RfU1RBVFVTX0FDQ0VQVEVEKSB7XG4gICAgICBzZWxmLl9zdGF0dXNVcGRhdGVSZXNvbHZlKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgIT09IHNlbGYuUkVRVUVTVF9TVEFUVVNfRVhQSVJFRCkge1xuICAgICAgc2VsZi5fdGltZW91dElkID0gd2luZG93LnNldFRpbWVvdXQob25UaW1lb3V0LCB0aGlzLlBPTExJTkdfSU5URVJWQUwpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRUaWNrZXQodmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyA9PT0gdmFsdWUuc3RhdHVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2VsZi5fdGlja2V0ID0gdmFsdWU7XG4gICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3Nlc3Npb25tYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvbk1hbmFnZXIgPSBjbGFzcyBTZXNzaW9uTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBzdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLnNlc3Npb25FbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0FuYWx5dGljc01vZGVsID0gQW5hbHl0aWNzTW9kZWw7XG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbCA9IEN1c3RvbWVyTW9kZWw7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG4gICAgdGhpcy5fU3VydmV5TW9kZWwgPSBTdXJ2ZXlNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zZWF0X3Nlc3Npb24nKTtcbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbihkYXRhID0+IHtcbiAgICAgIHNlbGYuX3Nlc3Npb24gPSBkYXRhO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgc2VsZi5fc3RhcnRTZXNzaW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZChjdXN0b21lciA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIWN1c3RvbWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc2Vzc2lvbi5jdXN0b21lciA9IGN1c3RvbWVyLnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhc2VhdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24uc2VhdCA9IHNlYXQudG9rZW47XG4gICAgICBzZWxmLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX09yZGVyTW9kZWwub3JkZXJUaWNrZXRDaGFuZ2VkLmFkZCh0aWNrZXQgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICF0aWNrZXQgfHwgIXRpY2tldC50b2tlbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24udGlja2V0ID0gdGlja2V0LnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgc2Vzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbjtcbiAgfVxuXG4gIGVuZFNlc3Npb24oKSB7XG4gICAgaWYgKCF0aGlzLl9zZXNzaW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBlbmRlZC5gKTtcblxuICAgIHZhciBzID0gdGhpcy5fc2Vzc2lvbjtcbiAgICBzLmVuZGVkID0gbmV3IERhdGUoKTtcblxuICAgIHRoaXMuX3Nlc3Npb24gPSBudWxsO1xuICAgIHRoaXMuX3N0b3JlLmNsZWFyKCk7XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dTZXNzaW9uKHMpO1xuXG4gICAgdGhpcy5zZXNzaW9uRW5kZWQuZGlzcGF0Y2gocyk7XG4gIH1cblxuICBnZXQgZ3Vlc3RDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCB8fCAxO1xuICB9XG5cbiAgc2V0IGd1ZXN0Q291bnQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLmd1ZXN0X2NvdW50ID0gdmFsdWU7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBnZXQgc3BlY2lhbEV2ZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQ7XG4gIH1cblxuICBzZXQgc3BlY2lhbEV2ZW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uc3BlY2lhbF9ldmVudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQgPSB2YWx1ZTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9zdGFydFNlc3Npb24oKSB7XG4gICAgbGV0IHNlYXQgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQ7XG5cbiAgICB0aGlzLl9zZXNzaW9uID0ge1xuICAgICAgaWQ6IHRoaXMuX2dlbmVyYXRlSUQoKSxcbiAgICAgIHNlYXQ6IHNlYXQgPyBzZWF0LnRva2VuIDogdW5kZWZpbmVkLFxuICAgICAgcGxhdGZvcm06IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSxcbiAgICAgIHN0YXJ0ZWQ6IG5ldyBEYXRlKClcbiAgICB9O1xuXG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTZWF0IHNlc3Npb24gJHt0aGlzLl9zZXNzaW9uLmlkfSBzdGFydGVkLmApO1xuXG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgdGhpcy5zZXNzaW9uU3RhcnRlZC5kaXNwYXRjaCh0aGlzLl9zZXNzaW9uKTtcbiAgfVxuXG4gIF9nZW5lcmF0ZUlEKCl7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXNzaW9ucHJvdmlkZXIuanNcblxud2luZG93LmFwcC5TZXNzaW9uUHJvdmlkZXIgPSBjbGFzcyBTZXNzaW9uUHJvdmlkZXIge1xuICAvKiBnbG9iYWwgbW9tZW50LCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU2Vzc2lvblNlcnZpY2UsIHN0b3JhZ2VQcm92aWRlcikge1xuICAgIHRoaXMuX1Nlc3Npb25TZXJ2aWNlID0gU2Vzc2lvblNlcnZpY2U7XG4gICAgdGhpcy5fQnVzaW5lc3NTZXNzaW9uU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfYWNjZXNzdG9rZW4nKTtcbiAgICB0aGlzLl9DdXN0b21lclNlc3Npb25TdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9jdXN0b21lcl9hY2Nlc3N0b2tlbicpO1xuXG4gICAgdGhpcy5idXNpbmVzc1Nlc3Npb25FeHBpcmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jdXN0b21lclNlc3Npb25FeHBpcmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXRCdXNpbmVzc1Rva2VuKCkge1xuICAgIGlmICh0aGlzLl9wZW5kaW5nUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX3BlbmRpbmdQcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBzZWxmLl9CdXNpbmVzc1Nlc3Npb25TdG9yZS5yZWFkKCkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4gJiYgdG9rZW4uYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgaWYgKHRva2VuLmV4cGlyZXMpIHtcbiAgICAgICAgICAgIHZhciBleHBpcmVzID0gbW9tZW50LnVuaXgodG9rZW4uZXhwaXJlcyAtIDEyMCk7XG5cbiAgICAgICAgICAgIGlmIChleHBpcmVzLmlzQWZ0ZXIobW9tZW50KCkpKSB7XG4gICAgICAgICAgICAgIHNlbGYuX3BlbmRpbmdQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxmLl9wZW5kaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0b2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX1Nlc3Npb25TZXJ2aWNlLmdldFNlc3Npb24oKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICBzZWxmLl9wZW5kaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgc2VsZi5fQnVzaW5lc3NTZXNzaW9uU3RvcmUud3JpdGUoZGF0YSk7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhLmFjY2Vzc190b2tlbik7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBzZWxmLl9wZW5kaW5nUHJvbWlzZSA9IG51bGw7XG5cbiAgICAgICAgICBpZiAoZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgc2VsZi5fQnVzaW5lc3NTZXNzaW9uU3RvcmUuY2xlYXIoKTtcbiAgICAgICAgICAgIHNlbGYuYnVzaW5lc3NTZXNzaW9uRXhwaXJlZC5kaXNwYXRjaCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlamVjdCh7IGNvZGU6IGUuc3RhdHVzIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9wZW5kaW5nUHJvbWlzZTtcbiAgfVxuXG4gIGdldEN1c3RvbWVyVG9rZW4oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHNlbGYuX0N1c3RvbWVyU2Vzc2lvblN0b3JlLnJlYWQoKS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICghdG9rZW4gfHwgIXRva2VuLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodG9rZW4uZXhwaXJlcykge1xuICAgICAgICAgIHZhciBleHBpcmVzID0gbW9tZW50LnVuaXgodG9rZW4uZXhwaXJlcyk7XG5cbiAgICAgICAgICBpZiAoIWV4cGlyZXMuaXNBZnRlcihtb21lbnQoKSkpIHtcbiAgICAgICAgICAgIHNlbGYuX0N1c3RvbWVyU2Vzc2lvblN0b3JlLmNsZWFyKCk7XG4gICAgICAgICAgICBzZWxmLmN1c3RvbWVyU2Vzc2lvbkV4cGlyZWQuZGlzcGF0Y2goKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh0b2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3Nlc3Npb25zZXJ2aWNlLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvblNlcnZpY2UgPSBjbGFzcyBTZXNzaW9uU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSkge1xuICAgIHRoaXMuX2FwaSA9IHtcbiAgICAgICdzZXNzaW9uJzogJHJlc291cmNlKCcvb2F1dGgyL3NuYXAvc2Vzc2lvbicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KVxuICAgIH07XG4gIH1cblxuICBnZXRTZXNzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc2Vzc2lvbi5xdWVyeSgpLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2hlbGxtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU2hlbGxNYW5hZ2VyID0gY2xhc3MgU2hlbGxNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoJHNjZSwgRGF0YVByb3ZpZGVyLCBTaGVsbE1vZGVsLCBDb25maWcsIEVudmlyb25tZW50LCBIb3N0cykge1xuICAgIHRoaXMuJCRzY2UgPSAkc2NlO1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9TaGVsbE1vZGVsID0gU2hlbGxNb2RlbDtcbiAgICB0aGlzLl9Db25maWcgPSBDb25maWc7XG4gICAgdGhpcy5fRW52aXJvbm1lbnQgPSBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9Ib3N0cyA9IEhvc3RzO1xuXG4gICAgdGhpcy5sb2NhbGUgPSBDb25maWcubG9jYWxlO1xuICB9XG5cbiAgZ2V0IGxvY2FsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxlO1xuICB9XG5cbiAgc2V0IGxvY2FsZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9sb2NhbGUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2xvY2FsZSA9IHZhbHVlO1xuXG4gICAgdmFyIGZvcm1hdCA9ICd7MH0nLFxuICAgICAgICBjdXJyZW5jeSA9ICcnO1xuXG4gICAgc3dpdGNoICh0aGlzLl9sb2NhbGUpIHtcbiAgICAgIGNhc2UgJ3JvX01EJzpcbiAgICAgICAgZm9ybWF0ID0gJ3swfSBMZWknO1xuICAgICAgICBjdXJyZW5jeSA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3poX01PJzpcbiAgICAgICAgZm9ybWF0ID0gJ01PUCQgezB9JztcbiAgICAgICAgY3VycmVuY3kgPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbl9VUyc6XG4gICAgICAgIGZvcm1hdCA9ICckezB9JztcbiAgICAgICAgY3VycmVuY3kgPSAnVVNEJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fU2hlbGxNb2RlbC5wcmljZUZvcm1hdCA9IGZvcm1hdDtcbiAgICB0aGlzLl9TaGVsbE1vZGVsLmN1cnJlbmN5ID0gY3VycmVuY3k7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX1NoZWxsTW9kZWw7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5iYWNrZ3JvdW5kcygpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwuYmFja2dyb3VuZHMgPSByZXNwb25zZS5tYWluLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtZWRpYTogaXRlbS5zcmNcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLnNjcmVlbnNhdmVycyA9IHJlc3BvbnNlLnNjcmVlbnNhdmVyLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtZWRpYTogaXRlbS5zcmNcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLnBhZ2VCYWNrZ3JvdW5kcyA9IHJlc3BvbnNlLnBhZ2VzLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBtZWRpYTogaXRlbS5iYWNrZ3JvdW5kLnNyYyxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogaXRlbS5kZXN0aW5hdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIuZWxlbWVudHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICB2YXIgbGF5b3V0ID0gc2VsZi5fQ29uZmlnLnRoZW1lLmxheW91dDtcblxuICAgICAgdmFyIGVsZW1lbnRzID0ge307XG5cbiAgICAgIHN3aXRjaCAobGF5b3V0KSB7XG4gICAgICAgIGNhc2UgJ2NsYXNzaWMnOlxuICAgICAgICAgIGVsZW1lbnRzID0ge1xuICAgICAgICAgICAgJ2J1dHRvbl9ob21lJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1ob21lLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9iYWNrJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1iYWNrLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9jYXJ0Jzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1jYXJ0LnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9yb3RhdGUnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLXJvdGF0ZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fd2FpdGVyJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1hc3Npc3RhbmNlLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9jaGVjayc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tY2xvc2VvdXQucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3N1cnZleSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tc3VydmV5LnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9jaGF0Jzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1jaGF0LnBuZycpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ2FsYXhpZXMnOlxuICAgICAgICAgIGVsZW1lbnRzID0ge1xuICAgICAgICAgICAgJ2J1dHRvbl9iYWNrJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1iYWNrLnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9yb3RhdGUnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLXJvdGF0ZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fc2V0dGluZ3MnOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLXNldHRpbmdzLnBuZycpLFxuICAgICAgICAgICAgJ2xvY2F0aW9uX2xvZ28nOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWxvZ28ucG5nJyksXG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zZS5lbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgZWxlbWVudCA9IHJlc3BvbnNlLmVsZW1lbnRzW2ldO1xuICAgICAgICBlbGVtZW50c1tlbGVtZW50LnNsb3RdID0gZWxlbWVudC5zcmM7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1NoZWxsTW9kZWwuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgICB9KTtcbiAgfVxuXG4gIGZvcm1hdFByaWNlKHByaWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX1NoZWxsTW9kZWwucHJpY2VGb3JtYXQucmVwbGFjZSgveyhcXGQrKX0vZywgKCkgPT4gcHJpY2UudG9GaXhlZCgyKSk7XG4gIH1cblxuICBnZXRQYWdlQmFja2dyb3VuZHMobG9jYXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fU2hlbGxNb2RlbC5wYWdlQmFja2dyb3VuZHMuZmlsdGVyKGl0ZW0gPT4ge1xuICAgICAgcmV0dXJuIGl0ZW0uZGVzdGluYXRpb24udHlwZSA9PT0gbG9jYXRpb24udHlwZSAmJlxuICAgICAgICAoaXRlbS5kZXN0aW5hdGlvbi50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4gJiYgbG9jYXRpb24udG9rZW4gfHxcbiAgICAgICAgIGl0ZW0uZGVzdGluYXRpb24udXJsID09PSBsb2NhdGlvbi51cmwgJiYgbG9jYXRpb24udXJsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEFzc2V0VXJsKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy4kJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoYC8vJHt0aGlzLl9Ib3N0cy5zdGF0aWMuaG9zdH0ke3RoaXMuX0hvc3RzLnN0YXRpYy5wYXRofS9kaXN0LyR7dGhpcy5fRW52aXJvbm1lbnQudmVyc2lvbn1gICtcbiAgICAgIGAvYXNzZXRzLyR7dGhpcy5fQ29uZmlnLnRoZW1lLmxheW91dH0vJHtmaWxlfWApO1xuICB9XG5cbiAgZ2V0UGFydGlhbFVybChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXNzZXRVcmwoYHBhcnRpYWxzLyR7bmFtZX0uaHRtbGApO1xuICB9XG5cbiAgZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikge1xuICAgIGlmICghbWVkaWEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWVkaWEgPT09ICdzdHJpbmcnIHx8IG1lZGlhIGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICBpZiAobWVkaWEuc3Vic3RyaW5nKDAsIDQpICE9PSAnaHR0cCcgJiYgbWVkaWEuc3Vic3RyaW5nKDAsIDIpICE9PSAnLy8nKSB7XG4gICAgICAgIGV4dGVuc2lvbiA9IGV4dGVuc2lvbiB8fCAnanBnJztcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7dGhpcy5fSG9zdHMubWVkaWEuaG9zdH1gICtcbiAgICAgICAgICBgL21lZGlhLyR7bWVkaWF9XyR7d2lkdGh9XyR7aGVpZ2h0fS4ke2V4dGVuc2lvbn1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lZGlhO1xuICAgIH1cblxuICAgIGlmICghbWVkaWEudG9rZW4pIHtcbiAgICAgIHJldHVybiBtZWRpYTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IHRoaXMuZ2V0TWVkaWFUeXBlKG1lZGlhKTtcbiAgICB2YXIgdXJsID0gYCR7d2luZG93LmxvY2F0aW9uLnByb3RvY29sfS8vJHt0aGlzLl9Ib3N0cy5tZWRpYS5ob3N0fS9tZWRpYS8ke21lZGlhLnRva2VufWA7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAndmlkZW8nKSB7XG4gICAgICB1cmwgKz0gJy53ZWJtJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ZsYXNoJykge1xuICAgICAgdXJsICs9ICcuc3dmJztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ2ltYWdlJykge1xuICAgICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgICB1cmwgKz0gJ18nICsgd2lkdGggKyAnXycgKyBoZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChleHRlbnNpb24pIHtcbiAgICAgICAgdXJsICs9ICcuJyArIGV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAobWVkaWEubWltZV90eXBlKSB7XG4gICAgICAgICAgY2FzZSAnaW1hZ2UvcG5nJzpcbiAgICAgICAgICAgIHVybCArPSAnLnBuZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdXJsICs9ICcuanBnJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHVybCk7XG4gIH1cblxuICBnZXRNZWRpYVR5cGUobWVkaWEpIHtcbiAgICBpZiAoIW1lZGlhIHx8ICFtZWRpYS5taW1lX3R5cGUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICdpbWFnZScpe1xuICAgICAgcmV0dXJuICdpbWFnZSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lZGlhLm1pbWVfdHlwZS5zdWJzdHJpbmcoMCwgNSkgPT09ICd2aWRlbycpIHtcbiAgICAgIHJldHVybiAndmlkZW8nO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS5taW1lX3R5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcpIHtcbiAgICAgIHJldHVybiAnZmxhc2gnO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgdGlsZVN0eWxlKCkge1xuICAgIHZhciBzdHlsZSA9ICd0aWxlJztcblxuICAgIHN3aXRjaCAodGhpcy5fQ29uZmlnLnRoZW1lLnRpbGVzX3N0eWxlKSB7XG4gICAgICBjYXNlICdyZWd1bGFyJzpcbiAgICAgICAgc3R5bGUgKz0gJyB0aWxlLXJlZ3VsYXInO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy9zdHlsZSArPSAnIHRpbGUtcmVndWxhcic7XG4gICAgcmV0dXJuIHN0eWxlO1xuICB9XG5cbiAgZ2V0IHByZWRpY2F0ZUV2ZW4oKSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICByZXR1cm4gKCkgPT4gaW5kZXgrKyAlIDIgPT09IDE7XG4gIH1cblxuICBnZXQgcHJlZGljYXRlT2RkKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuICgpID0+IGluZGV4KysgJSAyID09PSAwO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2hlbGxtb2RlbC5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTW9kZWwgPSBjbGFzcyBTaGVsbE1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kcyA9IFtdO1xuICAgIHRoaXMuYmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gW107XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fcGFnZUJhY2tncm91bmRzID0gW107XG4gICAgdGhpcy5wYWdlQmFja2dyb3VuZHNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmVsZW1lbnRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gJ3swfSc7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jdXJyZW5jeSA9ICcnO1xuICAgIHRoaXMuY3VycmVuY3lDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgYmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRzO1xuICB9XG5cbiAgc2V0IGJhY2tncm91bmRzKHZhbHVlKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLmJhY2tncm91bmRzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgc2NyZWVuc2F2ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JlZW5zYXZlcnM7XG4gIH1cblxuICBzZXQgc2NyZWVuc2F2ZXJzKHZhbHVlKSB7XG4gICAgdGhpcy5fc2NyZWVuc2F2ZXJzID0gdmFsdWU7XG4gICAgdGhpcy5zY3JlZW5zYXZlcnNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwYWdlQmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcztcbiAgfVxuXG4gIHNldCBwYWdlQmFja2dyb3VuZHModmFsdWUpIHtcbiAgICB0aGlzLl9wYWdlQmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICB0aGlzLnBhZ2VCYWNrZ3JvdW5kc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50cztcbiAgfVxuXG4gIHNldCBlbGVtZW50cyh2YWx1ZSkge1xuICAgIHRoaXMuX2VsZW1lbnRzID0gdmFsdWU7XG4gICAgdGhpcy5lbGVtZW50c0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHByaWNlRm9ybWF0KCkge1xuICAgIHJldHVybiB0aGlzLl9wcmljZUZvcm1hdDtcbiAgfVxuXG4gIHNldCBwcmljZUZvcm1hdCh2YWx1ZSkge1xuICAgIHRoaXMuX3ByaWNlRm9ybWF0ID0gdmFsdWU7XG4gICAgdGhpcy5wcmljZUZvcm1hdENoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbmN5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW5jeTtcbiAgfVxuXG4gIHNldCBjdXJyZW5jeSh2YWx1ZSkge1xuICAgIHRoaXMuX2N1cnJlbmN5ID0gdmFsdWU7XG4gICAgdGhpcy5jdXJyZW5jeUNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc29jaWFsbWFuYWdlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLyogZ2xvYmFsIFVSSSAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2NpYWxNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvY2lhbE1hbmFnZXIgPSBmdW5jdGlvbihTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICAgIHRoaXMuX0R0c0FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9XZWJCcm93c2VyID0gV2ViQnJvd3NlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH07XG5cbiAgd2luZG93LmFwcC5Tb2NpYWxNYW5hZ2VyID0gU29jaWFsTWFuYWdlcjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIExvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5sb2dpbkZhY2Vib29rID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmYWNlYm9va0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5mYWNlYm9va19hcHBsaWNhdGlvbixcbiAgICAgICAgY3VzdG9tZXJBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuY3VzdG9tZXJfYXBwbGljYXRpb247XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBGYWNlYm9vazogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBmYWNlYm9va0F1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGZhY2Vib29rQXV0aC5lcnJvciB8fCAhZmFjZWJvb2tBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayBlcnJvcjogJyArIGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGZhY2Vib29rQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBGYWNlYm9vayh7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyBjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChjdXN0b21lckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBGYWNlYm9vay4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2RpYWxvZy9vYXV0aCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2NsaWVudF9pZCcsIGZhY2Vib29rQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZmFjZWJvb2tBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ3Rva2VuJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc2NvcGUnLCAncHVibGljX3Byb2ZpbGUsZW1haWwnKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Hb29nbGVQbHVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBnb29nbGVwbHVzQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50Lmdvb2dsZXBsdXNfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHN0YXRlID0gc2VsZi5fZ2VuZXJhdGVUb2tlbigpO1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBHb29nbGU6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZihnb29nbGVwbHVzQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZ29vZ2xlcGx1c0F1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoZ29vZ2xlcGx1c0F1dGguZXJyb3IgfHwgIWdvb2dsZXBsdXNBdXRoLmNvZGUgfHwgZ29vZ2xlcGx1c0F1dGguc3RhdGUgIT09IHN0YXRlKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayBlcnJvcjogJyArIGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZ29vZ2xlcGx1c0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGNhbGxiYWNrIHJlY2VpdmVkLicpO1xuXG4gICAgICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcEdvb2dsZVBsdXMoe1xuICAgICAgICAgICAgY29kZTogZ29vZ2xlcGx1c0F1dGguY29kZSxcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbih0aWNrZXQpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnR29vZ2xlIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBsb2dpbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgIHJlc29sdmUoY3VzdG9tZXJBdXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLmFkZChvbk5hdmlnYXRlZCk7XG5cbiAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnTG9nZ2luZyBpbiB3aXRoIEdvb2dsZS4nKTtcblxuICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBnb29nbGVwbHVzQXBwLmNsaWVudF9pZClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVkaXJlY3RfdXJpJywgZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Jlc3BvbnNlX3R5cGUnLCAnY29kZScpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgvcGx1cy5sb2dpbiBlbWFpbCcpXG4gICAgICAgIC5hZGRTZWFyY2goJ2FjY2Vzc190eXBlJywgJ29mZmxpbmUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzdGF0ZScsIHN0YXRlKVxuICAgICAgICAudG9TdHJpbmcoKTtcblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgfSk7XG4gIH07XG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5Ud2l0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0d2l0dGVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LnR3aXR0ZXJfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHRva2VuU2VjcmV0O1xuXG4gICAgICBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9uTmF2aWdhdGVkLnJlbW92ZShvbk5hdmlnYXRlZCk7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIF9yZWplY3QgPSByZWplY3QsIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIHJlamVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdVbmFibGUgdG8gbG9naW4gd2l0aCBUd2l0dGVyOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKHR3aXR0ZXJBcHAucmVkaXJlY3RfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciB0d2l0dGVyQXV0aCA9IFVSSSh1cmwpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmICh0d2l0dGVyQXV0aC5lcnJvciB8fCAhdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayBlcnJvcjogJyArIHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QodHdpdHRlckF1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBUd2l0dGVyKHtcbiAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbjogdHdpdHRlckF1dGgub2F1dGhfdG9rZW4sXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3NlY3JldDogdG9rZW5TZWNyZXQsXG4gICAgICAgICAgICByZXF1ZXN0X3Rva2VuX3ZlcmlmaWVyOiB0d2l0dGVyQXV0aC5vYXV0aF92ZXJpZmllclxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgc2lnbmluIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VsZi5fRHRzQXBpLm9hdXRoMi5nZXRBdXRoQ29uZmlybVVybCh0aWNrZXQudGlja2V0X2lkLCB7XG4gICAgICAgICAgICAgIGNsaWVudF9pZDogY3VzdG9tZXJBcHAuY2xpZW50X2lkLFxuICAgICAgICAgICAgICByZXNwb25zZV90eXBlOiAndG9rZW4nLFxuICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodXJsLmluZGV4T2YoY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsKSA9PT0gMCkge1xuICAgICAgICAgIHZhciBjdXN0b21lckF1dGggPSBVUkkoJz8nICsgVVJJKHVybCkuZnJhZ21lbnQoKSkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGN1c3RvbWVyQXV0aC5lcnJvciB8fCAhY3VzdG9tZXJBdXRoLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBUd2l0dGVyLicpO1xuXG4gICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlclJlcXVlc3RUb2tlbih7XG4gICAgICAgIG9hdXRoX2NhbGxiYWNrOiB0d2l0dGVyQXBwLnJlZGlyZWN0X3VybFxuICAgICAgfSkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICB2YXIgdXJsID0gVVJJKCdodHRwczovL2FwaS50d2l0dGVyLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdvYXV0aF90b2tlbicsIHRva2VuLm9hdXRoX3Rva2VuKVxuICAgICAgICAuYWRkU2VhcmNoKCdmb3JjZV9sb2dpbicsICd0cnVlJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHJlcXVlc3QgdG9rZW4gcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgdG9rZW5TZWNyZXQgPSB0b2tlbi5vYXV0aF90b2tlbl9zZWNyZXQ7XG4gICAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEhlbHBlcnNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLl9nZW5lcmF0ZVRva2VuID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH07XG5cbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zb2NrZXRjbGllbnQuanNcblxud2luZG93LmFwcC5Tb2NrZXRDbGllbnQgPSBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBjb25zdHJ1Y3RvcihTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX1Nlc3Npb25Qcm92aWRlciA9IFNlc3Npb25Qcm92aWRlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0Q2x1c3Rlci5jb25uZWN0KHtcbiAgICAgIHBhdGg6ICcvc29ja2V0cy8nLFxuICAgICAgcG9ydDogODA4MFxuICAgIH0pO1xuICAgIHRoaXMuX3NvY2tldC5vbignY29ubmVjdCcsIHN0YXR1cyA9PiB7XG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYFNvY2tldCBjb25uZWN0ZWQuYCk7XG4gICAgICBzZWxmLl9hdXRoZW50aWNhdGUoKTtcbiAgICB9KTtcbiAgICB0aGlzLl9zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoYFNvY2tldCBkaXNjb25uZWN0ZWQuYCk7XG4gICAgICBzZWxmLl9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2goc2VsZi5pc0Nvbm5lY3RlZCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ29ubmVjdGVkO1xuICB9XG5cbiAgc3Vic2NyaWJlKHRvcGljLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5fZ2V0Q2hhbm5lbCh0b3BpYykud2F0Y2goaGFuZGxlcik7XG4gIH1cblxuICBzZW5kKHRvcGljLCBkYXRhKSB7XG4gICAgdGhpcy5fZ2V0Q2hhbm5lbCh0b3BpYykucHVibGlzaChkYXRhKTtcbiAgfVxuXG4gIF9nZXRDaGFubmVsKHRvcGljKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYW5uZWxzW3RvcGljXSB8fCAodGhpcy5fY2hhbm5lbHNbdG9waWNdID0gdGhpcy5fc29ja2V0LnN1YnNjcmliZSh0b3BpYykpO1xuICB9XG5cbiAgX2F1dGhlbnRpY2F0ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fU2Vzc2lvblByb3ZpZGVyLmdldEJ1c2luZXNzVG9rZW4oKS50aGVuKHRva2VuID0+IHtcbiAgICAgIHNlbGYuX3NvY2tldC5lbWl0KCdhdXRoZW50aWNhdGUnLCB7XG4gICAgICAgIGFjY2Vzc190b2tlbjogdG9rZW5cbiAgICAgIH0sIGVyciA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBzZWxmLl9Mb2dnZXIud2FybihgVW5hYmxlIHRvIGF1dGhlbnRpY2F0ZSBzb2NrZXQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaChzZWxmLmlzQ29ubmVjdGVkKTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLndhcm4oYFVuYWJsZSB0byBwZXJmb3JtIHNvY2tldCBhdXRoZW50aWNhdGlvbjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zb2Z0d2FyZW1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTb2Z0d2FyZU1hbmFnZXJcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgU29mdHdhcmVNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29mdHdhcmVNYW5hZ2VyID0gU29mdHdhcmVNYW5hZ2VyO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAnY3VycmVudFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXR0ZXJuID0gLyhTTkFQKVxcLyhbMC05Ll0rKS8sXG4gICAgICAgICAgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuICc4LjguOC44JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICdyZXF1aXJlZFZlcnNpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucmVxdWlyZW1lbnRzW3RoaXMuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybV07XG4gICAgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ3VwZGF0ZVJlcXVpcmVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmVyc2lvbkNvbXBhcmUodGhpcy5jdXJyZW50VmVyc2lvbiwgdGhpcy5yZXF1aXJlZFZlcnNpb24pID09PSAtMTtcbiAgICB9XG4gIH0pO1xuXG4gIFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUuX3ZlcnNpb25Db21wYXJlID0gZnVuY3Rpb24odjEsIHYyLCBvcHRpb25zKSB7XG4gICAgaWYgKCF2MSB8fCAhdjIpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBsZXhpY29ncmFwaGljYWwgPSBvcHRpb25zICYmIG9wdGlvbnMubGV4aWNvZ3JhcGhpY2FsLFxuICAgICAgICB6ZXJvRXh0ZW5kID0gb3B0aW9ucyAmJiBvcHRpb25zLnplcm9FeHRlbmQsXG4gICAgICAgIHYxcGFydHMgPSB2MS5zcGxpdCgnLicpLFxuICAgICAgICB2MnBhcnRzID0gdjIuc3BsaXQoJy4nKTtcblxuICAgIGZ1bmN0aW9uIGlzVmFsaWRQYXJ0KHgpIHtcbiAgICAgIHJldHVybiAobGV4aWNvZ3JhcGhpY2FsID8gL15cXGQrW0EtWmEtel0qJC8gOiAvXlxcZCskLykudGVzdCh4KTtcbiAgICB9XG5cbiAgICBpZiAoIXYxcGFydHMuZXZlcnkoaXNWYWxpZFBhcnQpIHx8ICF2MnBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSkge1xuICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG5cbiAgICBpZiAoemVyb0V4dGVuZCkge1xuICAgICAgd2hpbGUgKHYxcGFydHMubGVuZ3RoIDwgdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjFwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodjJwYXJ0cy5sZW5ndGggPCB2MXBhcnRzLmxlbmd0aCkge1xuICAgICAgICB2MnBhcnRzLnB1c2goJzAnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWxleGljb2dyYXBoaWNhbCkge1xuICAgICAgdjFwYXJ0cyA9IHYxcGFydHMubWFwKE51bWJlcik7XG4gICAgICB2MnBhcnRzID0gdjJwYXJ0cy5tYXAoTnVtYmVyKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHYxcGFydHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICh2MnBhcnRzLmxlbmd0aCA9PT0gaSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKHYxcGFydHNbaV0gPT09IHYycGFydHNbaV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2MXBhcnRzW2ldID4gdjJwYXJ0c1tpXSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHYxcGFydHMubGVuZ3RoICE9PSB2MnBhcnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL3N0b3JlLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RvcmVcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgU3RvcmUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zdG9yYWdlID0gbnVsbDtcbiAgfTtcblxuICB3aW5kb3cuYXBwLlN0b3JlID0gU3RvcmU7XG5cbiAgU3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IG51bGw7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlc29sdmUoc2VsZi5fc3RvcmFnZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgU3RvcmUucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5fc3RvcmFnZSA9IHZhbHVlO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL3N0b3JlLmxvY2Fsc3RvcmFnZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIExvY2FsU3RvcmFnZVN0b3JlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIExvY2FsU3RvcmFnZVN0b3JlID0gZnVuY3Rpb24oaWQpIHtcbiAgICBhcHAuU3RvcmUuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9pZCA9IGlkO1xuICB9O1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoYXBwLlN0b3JlLnByb3RvdHlwZSk7XG5cbiAgTG9jYWxTdG9yYWdlU3RvcmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgc3RvcmUucmVtb3ZlKHRoaXMuX2lkKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH07XG5cbiAgTG9jYWxTdG9yYWdlU3RvcmUucHJvdG90eXBlLnJlYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHN0b3JlLmdldCh0aGlzLl9pZCkpO1xuICB9O1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHRoaXMuX2lkLCB2YWx1ZSk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuTG9jYWxTdG9yYWdlU3RvcmUgPSBMb2NhbFN0b3JhZ2VTdG9yZTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zdXJ2ZXltYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TWFuYWdlciA9IGNsYXNzIFN1cnZleU1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyID0gRGF0YVByb3ZpZGVyO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG5cbiAgICBpZiAodGhpcy5fU3VydmV5TW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICB0aGlzLl9EYXRhUHJvdmlkZXIuc3VydmV5cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgIHNlbGYuX1N1cnZleU1vZGVsLmZlZWRiYWNrU3VydmV5ID0gZGF0YS5zdXJ2ZXlzWzBdO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TdXJ2ZXlNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHNlbGYuX1N1cnZleU1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgICBzZWxmLl9TdXJ2ZXlNb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3N1cnZleW1vZGVsLmpzXG5cbndpbmRvdy5hcHAuU3VydmV5TW9kZWwgPSBjbGFzcyBTdXJ2ZXlNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoQ29uZmlnLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBCb29sZWFuKENvbmZpZy5zdXJ2ZXlzKTtcbiAgICB0aGlzLl9zdXJ2ZXlzID0ge307XG5cbiAgICB0aGlzLl9zdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zdXJ2ZXknKTtcblxuICAgIHRoaXMuX2ZlZWRiYWNrU3VydmV5ID0gbnVsbDtcbiAgICB0aGlzLmZlZWRiYWNrU3VydmV5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5zdXJ2ZXlDb21wbGV0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX3N0b3JlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYuX3N1cnZleXMgPSB2YWx1ZSB8fCBzZWxmLl9zdXJ2ZXlzO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9pc0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGZlZWRiYWNrU3VydmV5KCkge1xuICAgIHJldHVybiB0aGlzLl9mZWVkYmFja1N1cnZleTtcbiAgfVxuXG4gIHNldCBmZWVkYmFja1N1cnZleSh2YWx1ZSkge1xuICAgIHRoaXMuX2ZlZWRiYWNrU3VydmV5ID0gdmFsdWU7XG4gICAgdGhpcy5mZWVkYmFja1N1cnZleUNoYW5nZWQuZGlzcGF0Y2godGhpcy5fZmVlZGJhY2tTdXJ2ZXkpO1xuICB9XG5cbiAgZ2V0IGZlZWRiYWNrU3VydmV5Q29tcGxldGUoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fc3VydmV5cy5mZWVkYmFjayk7XG4gIH1cblxuICBzZXQgZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSh2YWx1ZSkge1xuICAgIHRoaXMuX3N1cnZleXMuZmVlZGJhY2sgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLl9zdG9yZS53cml0ZSh0aGlzLl9zdXJ2ZXlzKTtcblxuICAgIHRoaXMuc3VydmV5Q29tcGxldGVkLmRpc3BhdGNoKHRoaXMuZmVlZGJhY2tTdXJ2ZXkpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvdGVsZW1ldHJ5c2VydmljZS5qc1xuXG53aW5kb3cuYXBwLlRlbGVtZXRyeVNlcnZpY2UgPSBjbGFzcyBUZWxlbWV0cnlTZXJ2aWNlIHtcbiAgY29uc3RydWN0b3IoJHJlc291cmNlKSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3N1Ym1pdFRlbGVtZXRyeSc6ICRyZXNvdXJjZSgnL3NuYXAvdGVsZW1ldHJ5Jywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KSxcbiAgICAgICdzdWJtaXRMb2dzJzogJHJlc291cmNlKCcvc25hcC9sb2dzJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnUE9TVCcgfSB9KVxuICAgIH07XG4gIH1cblxuICBzdWJtaXRUZWxlbWV0cnkoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0VGVsZW1ldHJ5LnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG5cbiAgc3VibWl0TG9ncyhkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zdWJtaXRMb2dzLnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvd2ViYnJvd3Nlci5qc1xuXG53aW5kb3cuYXBwLldlYkJyb3dzZXIgPSBjbGFzcyBXZWJCcm93c2VyIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMsIFVSSSAqL1xuXG4gIGNvbnN0cnVjdG9yKCR3aW5kb3csIEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpIHtcbiAgICB0aGlzLiQkd2luZG93ID0gJHdpbmRvdztcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5fbG9jYWxIb3N0cyA9IE9iamVjdC5rZXlzKFNOQVBIb3N0cykubWFwKHAgPT4gU05BUEhvc3RzW3BdLmhvc3QpO1xuICAgIHRoaXMuX2xvY2FsSG9zdHMucHVzaCgnbG9jYWxob3N0Jyk7XG5cbiAgICB0aGlzLm9uT3BlbiA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25DbG9zZSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMub25OYXZpZ2F0ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGdldCBpc0V4dGVybmFsKCkge1xuICAgIHJldHVybiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gIT09ICd3ZWInO1xuICB9XG5cbiAgbmF2aWdhdGVkKHVybCkge1xuICAgIHRoaXMub25OYXZpZ2F0ZWQuZGlzcGF0Y2godXJsKTtcblxuICAgIGxldCBob3N0ID0gVVJJKHVybCkuaG9zdG5hbWUoKTtcblxuICAgIGlmICh0aGlzLl9sb2NhbEhvc3RzLmluZGV4T2YoaG9zdCkgPT09IC0xKSB7XG4gICAgICB0aGlzLl9BbmFseXRpY3NNb2RlbC5sb2dVcmwodXJsKTtcbiAgICB9XG4gIH1cblxuICBvcGVuKHVybCkge1xuICAgIGlmICh0aGlzLmlzRXh0ZXJuYWwpIHtcbiAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLm9wZW5Ccm93c2VyKHVybCk7XG4gICAgfVxuXG4gICAgdGhpcy5vbk9wZW4uZGlzcGF0Y2godXJsKTtcbiAgICB0aGlzLl9icm93c2VyT3BlbmVkID0gdHJ1ZTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGlmICh0aGlzLl9icm93c2VyT3BlbmVkKSB7XG4gICAgICBpZiAodGhpcy5pc0V4dGVybmFsKSB7XG4gICAgICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlLmNsb3NlQnJvd3NlcigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm9uQ2xvc2UuZGlzcGF0Y2goKTtcbiAgICAgIHRoaXMuX2Jyb3dzZXJPcGVuZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRBcHBVcmwodXJsKSB7XG4gICAgdmFyIGhvc3QgPSB0aGlzLiQkd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHRoaXMuJCR3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgK1xuICAgICAgKHRoaXMuJCR3aW5kb3cubG9jYXRpb24ucG9ydCA/ICc6JyArIHRoaXMuJCR3aW5kb3cubG9jYXRpb24ucG9ydDogJycpO1xuICAgIHJldHVybiBob3N0ICsgdXJsO1xuICB9XG59O1xuXG4vL3NyYy9qcy9hcHBzLmpzXG5cbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gc3RhdGljSG9zdFJlZ2V4KCkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCcuKicgKyBTTkFQX0hPU1RTX0NPTkZJRy5zdGF0aWMgKyAnLionKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBhcnRpYWxVcmwobmFtZSkge1xuICAgIHJldHVybiBgLy8ke1NOQVBfSE9TVFNfQ09ORklHLnN0YXRpYy5ob3N0fSR7U05BUF9IT1NUU19DT05GSUcuc3RhdGljLnBhdGh9L2Rpc3QvJHtTTkFQX0VOVklST05NRU5ULnZlcnNpb259YCArXG4gICAgICBgL2Fzc2V0cy8ke1NOQVBfQ09ORklHLnRoZW1lLmxheW91dH0vcGFydGlhbHMvJHtuYW1lfS5odG1sYDtcbiAgfVxuXG4gIGFuZ3VsYXIubW9kdWxlKCdTTkFQQXBwbGljYXRpb24nLCBbXG4gICAgJ25nUm91dGUnLFxuICAgICduZ0FuaW1hdGUnLFxuICAgICduZ1RvdWNoJyxcbiAgICAnbmdTYW5pdGl6ZScsXG4gICAgJ1NOQVAuY29uZmlncycsXG4gICAgJ1NOQVAuY29udHJvbGxlcnMnLFxuICAgICdTTkFQLmRpcmVjdGl2ZXMnLFxuICAgICdTTkFQLmZpbHRlcnMnLFxuICAgICdTTkFQLnNlcnZpY2VzJ1xuICBdKS5cbiAgY29uZmlnKFxuICAgIFsnJGxvY2F0aW9uUHJvdmlkZXInLCAnJHJvdXRlUHJvdmlkZXInLCAnJHNjZURlbGVnYXRlUHJvdmlkZXInLFxuICAgICgkbG9jYXRpb25Qcm92aWRlciwgJHJvdXRlUHJvdmlkZXIsICRzY2VEZWxlZ2F0ZVByb3ZpZGVyKSA9PiB7XG5cbiAgICAkc2NlRGVsZWdhdGVQcm92aWRlci5yZXNvdXJjZVVybFdoaXRlbGlzdChbJ3NlbGYnLCBzdGF0aWNIb3N0UmVnZXgoKV0pO1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy8nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdIb21lQmFzZUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9tZW51Lzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ01lbnVCYXNlQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NhdGVnb3J5Lzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0NhdGVnb3J5QmFzZUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9pdGVtLzp0b2tlbicsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ0l0ZW1CYXNlQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3VybC86dXJsJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnVXJsQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoZWNrb3V0JywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnY2hlY2tvdXQnKSwgY29udHJvbGxlcjogJ0NoZWNrb3V0Q3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3NpZ25pbicsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ3NpZ25pbicpLCBjb250cm9sbGVyOiAnU2lnbkluQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2FjY291bnQnLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdhY2NvdW50JyksIGNvbnRyb2xsZXI6ICdBY2NvdW50Q3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoYXQnLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdjaGF0JyksIGNvbnRyb2xsZXI6ICdDaGF0Q3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL2NoYXRtYXAnLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdjaGF0bWFwJyksIGNvbnRyb2xsZXI6ICdDaGF0TWFwQ3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignL3N1cnZleScsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ3N1cnZleScpLCBjb250cm9sbGVyOiAnU3VydmV5Q3RybCcgfSk7XG4gICAgJHJvdXRlUHJvdmlkZXIub3RoZXJ3aXNlKHsgcmVkaXJlY3RUbzogJy8nIH0pO1xuICB9XSk7XG5cbiAgYW5ndWxhci5tb2R1bGUoJ1NOQVBBdXhpbGlhcmVzJywgW1xuICAgICduZ1JvdXRlJyxcbiAgICAnbmdBbmltYXRlJyxcbiAgICAnbmdUb3VjaCcsXG4gICAgJ25nU2FuaXRpemUnLFxuICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAnU05BUC5zZXJ2aWNlcydcbiAgXSkuXG4gIGNvbmZpZyhcbiAgICBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyRyb3V0ZVByb3ZpZGVyJyxcbiAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyKSA9PiB7XG5cbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoZmFsc2UpO1xuXG4gICAgJHJvdXRlUHJvdmlkZXIud2hlbignLycsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2NoYXRyb29tJyksIGNvbnRyb2xsZXI6ICdDaGF0Um9vbUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7IHJlZGlyZWN0VG86ICcvJyB9KTtcbiAgfV0pO1xufSkoKTtcblxuLy9zcmMvanMvY29uZmlnLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbmZpZ3MnLCBbXSlcbiAuZmFjdG9yeSgnU05BUENvbmZpZycsIFtdLCBmdW5jdGlvbigpIHtcbiAgIHJldHVybiB7XG4gICAgIFwiYWNjb3VudHNcIjp0cnVlLFxuICAgICBcImNoYXRcIjp0cnVlLFxuICAgICBcImxvY2FsZVwiOlwiZW5fVVNcIixcbiAgICAgXCJsb2NhdGlvblwiOlwiODQ3NDI5YzQtYmI2MS00MGI1LWIzZmEtYTRhNTAxNTEwMzBjXCIsXG4gICAgIFwibG9jYXRpb25fbmFtZVwiOlwiRGV2VGVzdExvY2F0aW9uXCIsXG4gICAgIFwib2ZmbGluZVwiOmZhbHNlLFxuICAgICBcIm9tc1wiOnRydWUsXG4gICAgIFwic3VydmV5c1wiOnRydWUsXG4gICAgIFwidGhlbWVcIjp7XG4gICAgICAgXCJsYXlvdXRcIjpcImdhbGF4aWVzXCIsXG4gICAgICAgXCJ0aWxlc19zdHlsZVwiOlwiZGVmYXVsdFwiXG4gICAgIH1cbiAgIH07XG4gfSlcbiAuZmFjdG9yeSgnU05BUEVudmlyb25tZW50JywgW10sIGZ1bmN0aW9uKCkge1xuICAgcmV0dXJuIHtcbiAgICBjdXN0b21lcl9hcHBsaWNhdGlvbjoge1wiY2xpZW50X2lkXCI6XCI5MTM4MWE4NmIzYjQ0NGZkODc2ZGY4MGIyMmQ3ZmE2ZVwiLFwiY2FsbGJhY2tfdXJsXCI6XCJodHRwczovL3dlYi5tYW5hZ2VzbmFwLmNvbS9vYXV0aDIvY3VzdG9tZXIvY2FsbGJhY2tcIn0sXG4gICAgZmFjZWJvb2tfYXBwbGljYXRpb246IHtcImNsaWVudF9pZFwiOlwiMzQ5NzI5NTE4NTQ1MzEzXCIsXCJyZWRpcmVjdF91cmxcIjpcImh0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL2ZhY2Vib29rXCJ9LFxuICAgIGdvb2dsZXBsdXNfYXBwbGljYXRpb246IHtcImNsaWVudF9pZFwiOlwiNjc4OTk4MjUwOTQxLTFkbWVicDRrc25pOXRzanRoNDV0c2h0OGw3Y2wxbXJuLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXCJyZWRpcmVjdF91cmxcIjpcImh0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL2dvb2dsZXBsdXNcIn0sXG4gICAgdHdpdHRlcl9hcHBsaWNhdGlvbjoge1wiY29uc3VtZXJfa2V5XCI6XCJ5UThYSjE1UG1hUE9pNEw1REpQaWtHQ0kwXCIsXCJyZWRpcmVjdF91cmxcIjpcImh0dHBzOi8vd2ViLm1hbmFnZXNuYXAuY29tL2NhbGxiYWNrL3R3aXR0ZXJcIn1cbiAgfTtcbiB9KVxuIC5mYWN0b3J5KCdTTkFQSG9zdHMnLCBbXSwgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgYXBpOiB7XCJob3N0XCI6XCJhcGkyLm1hbmFnZXNuYXAuY29tXCIsXCJzZWN1cmVcIjpcInRydWVcIn0sXG4gICAgY29udGVudDoge1wiaG9zdFwiOlwiY29udGVudC5tYW5hZ2VzbmFwLmNvbVwifSxcbiAgICBtZWRpYToge1wiaG9zdFwiOlwiY29udGVudC5tYW5hZ2VzbmFwLmNvbVwifVxuICB9O1xuIH0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycsIFsnYW5ndWxhci1iYWNvbiddKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvYWNjb3VudC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBbJyRzY29wZScsICdDdXN0b21lck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgQ3VzdG9tZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCB8fCAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ29uc3RhbnRzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByb3BlcnRpZXNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFByb2ZpbGVcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wcm9maWxlID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGU7XG4gICRzY29wZS5jYW5DaGFuZ2VQYXNzd29yZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgdmFyIHByb2ZpbGUgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgncHJvZmlsZScpO1xuXG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAkc2NvcGUucHJvZmlsZSA9IHZhbHVlO1xuICAgICRzY29wZS5jYW5DaGFuZ2VQYXNzd29yZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgICAkc2NvcGUuY2FuQ2hhbmdlRW1haWwgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHM7XG4gIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgU3BsYXNoIHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmVkaXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2ZpbGVlZGl0ID0gYW5ndWxhci5jb3B5KCRzY29wZS5wcm9maWxlKTtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZWRpdFBhc3N3b3JkID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBhc3N3b3JkZWRpdCA9IHtcbiAgICAgIG9sZF9wYXNzd29yZDogJycsXG4gICAgICBuZXdfcGFzc3dvcmQ6ICcnXG4gICAgfTtcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5lZGl0UGF5bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UGF5bWVudEVkaXQgPSB0cnVlO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUHJvZmlsZSBlZGl0IHNjcmVlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByb2ZpbGVFZGl0U3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci51cGRhdGVQcm9maWxlKCRzY29wZS5wcm9maWxlZWRpdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkc2NvcGUuc2hvd1Byb2ZpbGVFZGl0ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wcm9maWxlRWRpdENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBhc3N3b3JkIGVkaXQgc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFzc3dvcmRFZGl0U3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5jaGFuZ2VQYXNzd29yZCgkc2NvcGUucGFzc3dvcmRlZGl0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gZmFsc2U7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5wYXNzd29yZEVkaXRDYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IGZhbHNlO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9iYWNrZ3JvdW5kLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdCYWNrZ3JvdW5kQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcblxuICBmdW5jdGlvbiBzaG93SW1hZ2VzKHZhbHVlcykge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmltYWdlcyA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaXRlbS5tZWRpYSwgMTkyMCwgMTA4MCwgJ2pwZycpLFxuICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoaXRlbS5tZWRpYSlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGJhY2tncm91bmRzID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmJhY2tncm91bmRzLFxuICAgICAgcGFnZUJhY2tncm91bmRzID0gbnVsbDtcblxuICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmJhY2tncm91bmRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgIGJhY2tncm91bmRzID0gdmFsdWU7XG4gICAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdlZC5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICB2YXIgbmV3UGFnZUJhY2tncm91bmRzID0gU2hlbGxNYW5hZ2VyLmdldFBhZ2VCYWNrZ3JvdW5kcyhsb2NhdGlvbik7XG5cbiAgICBpZiAobmV3UGFnZUJhY2tncm91bmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG5ld1BhZ2VCYWNrZ3JvdW5kcztcbiAgICAgIHNob3dJbWFnZXMocGFnZUJhY2tncm91bmRzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocGFnZUJhY2tncm91bmRzKSB7XG4gICAgICBzd2l0Y2ggKGxvY2F0aW9uLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbWVudSc6XG4gICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgY2FzZSAnaXRlbSc6XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHBhZ2VCYWNrZ3JvdW5kcyA9IG51bGw7XG4gICAgc2hvd0ltYWdlcyhiYWNrZ3JvdW5kcyk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jYXJ0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXJ0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRzY2UnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdDaGF0TWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCAkc2NlLCBDdXN0b21lck1hbmFnZXIsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBDaGF0TWFuYWdlcikgPT4ge1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG4gICRzY29wZS5vcHRpb25zID0ge307XG5cbiAgJHNjb3BlLnN0YXRlID0gQ2FydE1vZGVsLmNhcnRTdGF0ZTtcbiAgQ2FydE1vZGVsLmNhcnRTdGF0ZUNoYW5nZWQuYWRkKHN0YXRlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGF0ZSA9IHN0YXRlKSk7XG5cbiAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gdmFsdWUpO1xuXG4gICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4gJHNjb3BlLnRvdGFsT3JkZXIgPSB2YWx1ZSk7XG5cbiAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KHRva2VuKSk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IHRydWU7XG4gICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSB0cnVlO1xuICAkc2NvcGUuY2hlY2tvdXRFbmFibGVkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAkc2NvcGUudmlzaWJsZSA9IENhcnRNb2RlbC5pc0NhcnRPcGVuO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICRzY29wZS5zaG93Q2FydCgpO1xuICAgICRzY29wZS52aXNpYmxlID0gdmFsdWU7XG4gIH0pO1xuXG4gICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgP1xuICAgIExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDpcbiAgICAnVGFibGUnO1xuXG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4gJHNjb3BlLnNlYXRfbmFtZSA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnKTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICB9O1xuICB2YXIgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuICB9O1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG4gIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QoKTtcblxuICAkc2NvcGUuY2FsY3VsYXRlRGVzY3JpcHRpb24gPSBlbnRyeSA9PiB7XG4gICAgdmFyIHJlc3VsdCA9IGVudHJ5Lm5hbWUgfHwgZW50cnkuaXRlbS50aXRsZTtcblxuICAgIHJlc3VsdCArPSBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChvdXRwdXQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICByZXR1cm4gb3V0cHV0ICsgY2F0ZWdvcnkubW9kaWZpZXJzLnJlZHVjZSgob3V0cHV0LCBtb2RpZmllcikgPT4ge1xuICAgICAgICByZXR1cm4gb3V0cHV0ICsgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgP1xuICAgICAgICAgICc8YnIvPi0gJyArIG1vZGlmaWVyLmRhdGEudGl0bGUgOlxuICAgICAgICAgICcnKTtcbiAgICAgIH0sICcnKTtcbiAgICB9LCAnJyk7XG5cbiAgICByZXR1cm4gJHNjZS50cnVzdEFzSHRtbChyZXN1bHQpO1xuICB9O1xuXG4gICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAkc2NvcGUuZWRpdEl0ZW0gPSBlbnRyeSA9PiBDYXJ0TW9kZWwub3BlbkVkaXRvcihlbnRyeSwgZmFsc2UpO1xuICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KGVudHJ5KTtcbiAgJHNjb3BlLnJlb3JkZXJJdGVtID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkuY2xvbmUoKSk7XG5cbiAgJHNjb3BlLnN1Ym1pdENhcnQgPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIHZhciBvcHRpb25zID0gJHNjb3BlLm9wdGlvbnMudG9fZ29fb3JkZXIgPyAyIDogMDtcblxuICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gICAgICAgICRzY29wZS50b0dvT3JkZXIgPSBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVCk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jbGVhckNhcnQgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuY2xlYXJDYXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ2FydCA9ICgpID0+IHtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgICRzY29wZS5zaG93Q2FydCgpO1xuICB9O1xuXG4gICRzY29wZS5zaG93SGlzdG9yeSA9ICgpID0+IENhcnRNb2RlbC5jYXJ0U3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcbiAgJHNjb3BlLnNob3dDYXJ0ID0gKCkgPT4gQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuXG4gICRzY29wZS5wYXlDaGVjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hlY2tvdXQnIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NhdGVnb3J5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDYXRlZ29yeUJhc2VDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpIHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhdGVnb3J5Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTTkFQRW52aXJvbm1lbnQsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHZhciBDYXRlZ29yeUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aWxlQ2xhc3NOYW1lID0gU2hlbGxNYW5hZ2VyLnRpbGVTdHlsZTtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoZnVuY3Rpb24odGlsZSwgaSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IHRpbGVDbGFzc05hbWUsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMzcwLCAzNzApICsgJyknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpKSB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHsgY2xhc3NOYW1lOiAndGlsZS10YWJsZScgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIERhdGFNYW5hZ2VyLmNhdGVnb3J5ID0gbG9jYXRpb24udHlwZSA9PT0gJ2NhdGVnb3J5JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5jYXRlZ29yeSk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmNhdGVnb3J5Q2hhbmdlZC5hZGQoZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmICghZGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyxcbiAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllcyB8fCBbXTtcbiAgICB0aWxlcyA9IGRhdGEuaXRlbXMgfHwgW107XG4gICAgdGlsZXMgPSBjYXRlZ29yaWVzLmNvbmNhdCh0aWxlcyk7XG5cbiAgICBpZiAoU05BUEVudmlyb25tZW50LnBsYXRmb3JtICE9PSAnZGVza3RvcCcpIHtcbiAgICAgIHRpbGVzID0gdGlsZXMuZmlsdGVyKHRpbGUgPT4gdGlsZS50eXBlICE9PSAzKTtcbiAgICB9XG5cbiAgICB0aWxlcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS51cmwgPSAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHRpbGUuZGVzdGluYXRpb24pO1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYXRlZ29yeUxpc3QsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQtY2F0ZWdvcnknKVxuICAgICk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTWFuYWdlcicsICdDaGF0TWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBDb25maWcnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNYW5hZ2VyLCBDaGF0TWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFNoZWxsTWFuYWdlciwgU05BUENvbmZpZykgPT4ge1xuXG4gIGlmICghU05BUENvbmZpZy5jaGF0KSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQQ29uZmlnLmxvY2F0aW9uX25hbWU7XG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xuXG4gICRzY29wZS5jaGF0RW5hYmxlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jaGF0RW5hYmxlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFjdGl2ZURldmljZXMgPSBDaGF0TWFuYWdlci5tb2RlbC5hY3RpdmVEZXZpY2VzO1xuICBDaGF0TWFuYWdlci5tb2RlbC5hY3RpdmVEZXZpY2VzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5hY3RpdmVEZXZpY2VzID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdpZnREZXZpY2UgPSBDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0RGV2aWNlID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUudG9nZ2xlQ2hhdCA9ICgpID0+IHtcbiAgICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgPSAhQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICB9O1xuXG4gICRzY29wZS5vcGVuTWFwID0gKCkgPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdG1hcCcgfTtcbiAgfTtcblxuICAkc2NvcGUuZ2V0RGV2aWNlTmFtZSA9IGRldmljZV90b2tlbiA9PiBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZV90b2tlbik7XG5cbiAgJHNjb3BlLmdldFNlYXROdW1iZXIgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIHZhciBkZXZpY2UgPSBMb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pO1xuXG4gICAgZm9yICh2YXIgcCBpbiBMb2NhdGlvbk1vZGVsLnNlYXRzKSB7XG4gICAgICBpZiAoTG9jYXRpb25Nb2RlbC5zZWF0c1twXS50b2tlbiA9PT0gZGV2aWNlLnNlYXQpIHtcbiAgICAgICAgbGV0IG1hdGNoID0gTG9jYXRpb25Nb2RlbC5zZWF0c1twXS5uYW1lLm1hdGNoKC9cXGQrLyk7XG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzBdIHx8ICcnIDogJyc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuICcnO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNoYXQgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3b3VsZCBsaWtlIHRvIGNsb3NlIHRoZSBjaGF0IHdpdGggJyArICRzY29wZS5nZXREZXZpY2VOYW1lKGRldmljZV90b2tlbikgKyAnPycpXG4gICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBDaGF0TWFuYWdlci5kZWNsaW5lRGV2aWNlKGRldmljZV90b2tlbik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmdldFVucmVhZENvdW50ID0gZGV2aWNlX3Rva2VuID0+IENoYXRNYW5hZ2VyLmdldFVucmVhZENvdW50KGRldmljZV90b2tlbik7XG5cbiAgJHNjb3BlLnNlbmRHaWZ0ID0gZGV2aWNlX3Rva2VuID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKSxcbiAgICAgICAgc2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChkZXZpY2Uuc2VhdCk7XG5cbiAgICBpZiAoIXNlYXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oYEFyZSB5b3Ugc3VyZSB0aGF0IHlvdSB3YW50IHRvIHNlbmQgYSBnaWZ0IHRvICR7c2VhdC5uYW1lfT9gKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLnN0YXJ0R2lmdChkZXZpY2VfdG9rZW4pO1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxHaWZ0ID0gKCkgPT4gQ2hhdE1hbmFnZXIuZW5kR2lmdCgpO1xuXG4gIENoYXRNYW5hZ2VyLmlzUHJlc2VudCA9IHRydWU7XG5cbiAgdmFyIHdhdGNoTG9jYXRpb24gPSB0cnVlO1xuXG4gICRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKCkgPT4ge1xuICAgIGlmICh3YXRjaExvY2F0aW9uKSB7XG4gICAgICBDaGF0TWFuYWdlci5tb2RlbC5pc1ByZXNlbnQgPSBmYWxzZTtcbiAgICAgIHdhdGNoTG9jYXRpb24gPSBmYWxzZTtcbiAgICB9XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0Ym94LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Qm94Q3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRhdHRycycsICdDaGF0TWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgJGF0dHJzLCBDaGF0TWFuYWdlciwgTG9jYXRpb25Nb2RlbCkge1xuICB2YXIgdG9fZGV2aWNlID0gJHNjb3BlLmRldmljZSxcbiAgICAgIHR5cGUgPSB0b19kZXZpY2UgP1xuICAgICAgICBDaGF0TWFuYWdlci5NRVNTQUdFX1RZUEVTLkRFVklDRSA6XG4gICAgICAgIENoYXRNYW5hZ2VyLk1FU1NBR0VfVFlQRVMuTE9DQVRJT047XG5cbiAgdmFyIGRldmljZSA9IHRvX2RldmljZSA/IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRvX2RldmljZSkgOiBudWxsO1xuXG4gICRzY29wZS5yZWFkb25seSA9IEJvb2xlYW4oJGF0dHJzLnJlYWRvbmx5KTtcbiAgJHNjb3BlLmNoYXQgPSB7fTtcbiAgJHNjb3BlLm1lc3NhZ2VzID0gW107XG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2VzKCkge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5tZXNzYWdlcyA9IENoYXRNYW5hZ2VyLm1vZGVsLmhpc3RvcnkuZmlsdGVyKG1lc3NhZ2UgPT4ge1xuICAgICAgICByZXR1cm4gbWVzc2FnZS50eXBlID09PSB0eXBlICYmIChcbiAgICAgICAgICBtZXNzYWdlLmRldmljZSA9PT0gdG9fZGV2aWNlIHx8XG4gICAgICAgICAgbWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY2hhdEVuYWJsZWQgPSBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2hhdEVuYWJsZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5pc0Nvbm5lY3RlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzQ29ubmVjdGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0Nvbm5lY3RlZENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuaXNDb25uZWN0ZWQgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5zZW5kTWVzc2FnZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5pc0Nvbm5lY3RlZCB8fCAhJHNjb3BlLmNoYXQubWVzc2FnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHRvX2RldmljZTogdG9fZGV2aWNlLFxuICAgICAgdGV4dDogJHNjb3BlLmNoYXQubWVzc2FnZVxuICAgIH07XG5cbiAgICBDaGF0TWFuYWdlci5zZW5kTWVzc2FnZShtZXNzYWdlKTtcblxuICAgICRzY29wZS5jaGF0Lm1lc3NhZ2UgPSAnJztcbiAgfTtcblxuICAkc2NvcGUuZ2V0RnJvbU5hbWUgPSBtZXNzYWdlID0+IENoYXRNYW5hZ2VyLmdldE1lc3NhZ2VOYW1lKG1lc3NhZ2UpO1xuXG4gICRzY29wZS5nZXRTdGF0dXNUZXh0ID0gbWVzc2FnZSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHN3aXRjaChtZXNzYWdlLnN0YXR1cykge1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnWW91IGhhdmUgcmVxdWVzdGVkIHRvIGNoYXQgd2l0aCAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShtZXNzYWdlLnRvX2RldmljZSk7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VEOlxuICAgICAgICAgIHJldHVybiAnQ2xvc2VkIHRoZSBjaGF0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ0dpZnQgcmVxdWVzdCBzZW50JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBhIGdpZnQnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLmRldmljZSA9PT0gdG9fZGV2aWNlKSB7XG4gICAgICBzd2l0Y2gobWVzc2FnZS5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLmdldEZyb21OYW1lKG1lc3NhZ2UpICsgJyB3b3VsZCBsaWtlIHRvIGNoYXQgd2l0aCB5b3UnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRDpcbiAgICAgICAgICByZXR1cm4gJ0Nsb3NlZCB0aGUgY2hhdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdXb3VsZCBsaWtlIHRvIHNlbmQgeW91IGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBhIGdpZnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgYSBnaWZ0JztcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmlzVW5yZWFkID0gbWVzc2FnZSA9PiB7XG4gICAgaWYgKG1lc3NhZ2UudG9fZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ2hhdE1hbmFnZXIuY2hlY2tJZlVucmVhZCh0b19kZXZpY2UsIG1lc3NhZ2UpO1xuICB9O1xuXG4gICRzY29wZS5tYXJrQXNSZWFkID0gKCkgPT4ge1xuICAgIGlmICghdG9fZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2hhdE1hbmFnZXIubWFya0FzUmVhZCh0b19kZXZpY2UpO1xuICB9O1xuXG4gICRzY29wZS5vbktleWRvd24gPSBrZXljb2RlID0+IHtcbiAgICBpZiAoa2V5Y29kZSA9PT0gMTMpIHtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuc2VuZE1lc3NhZ2UoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBMb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBMb2NhdGlvbk1vZGVsLnNlYXRzQ2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaGlzdG9yeUNoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIHNob3dNZXNzYWdlcygpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGF0bWFwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0TWFwQ3RybCcsXG5bJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJyxcbigkc2NvcGUsICR0aW1lb3V0LCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgTG9jYXRpb25Nb2RlbCkgPT4ge1xuXG4gICRzY29wZS5zZWF0cyA9IFtdO1xuXG4gICRzY29wZS5tYXBJbWFnZSA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cy5sb2NhdGlvbl9tYXA7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUubWFwSW1hZ2UgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHMubG9jYXRpb25fbWFwKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gYnVpbGRNYXAoKSB7XG4gICAgaWYgKCFMb2NhdGlvbk1vZGVsLnNlYXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5zZWF0cyA9IExvY2F0aW9uTW9kZWwuc2VhdHNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbihzZWF0KSB7IHJldHVybiBzZWF0LnRva2VuICE9PSBMb2NhdGlvbk1vZGVsLnNlYXQudG9rZW47IH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24oc2VhdCkge1xuICAgICAgICAgIHZhciBkZXZpY2VzID0gTG9jYXRpb25Nb2RlbC5kZXZpY2VzXG4gICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGRldmljZSkgeyByZXR1cm4gZGV2aWNlLnNlYXQgPT09IHNlYXQudG9rZW47IH0pXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGRldmljZSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRva2VuOiBkZXZpY2UudG9rZW4sXG4gICAgICAgICAgICAgICAgc2VhdDogZGV2aWNlLnNlYXQsXG4gICAgICAgICAgICAgICAgaXNfYXZhaWxhYmxlOiBkZXZpY2UuaXNfYXZhaWxhYmxlLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiBkZXZpY2UudXNlcm5hbWVcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRva2VuOiBzZWF0LnRva2VuLFxuICAgICAgICAgICAgbmFtZTogc2VhdC5uYW1lLFxuICAgICAgICAgICAgZGV2aWNlczogZGV2aWNlcyxcbiAgICAgICAgICAgIG1hcF9wb3NpdGlvbl94OiBzZWF0Lm1hcF9wb3NpdGlvbl94LFxuICAgICAgICAgICAgbWFwX3Bvc2l0aW9uX3k6IHNlYXQubWFwX3Bvc2l0aW9uX3ksXG4gICAgICAgICAgICBpc19hdmFpbGFibGU6IGRldmljZXNcbiAgICAgICAgICAgICAgLmZpbHRlcihmdW5jdGlvbihkZXZpY2UpIHsgcmV0dXJuIGRldmljZS5pc19hdmFpbGFibGU7IH0pXG4gICAgICAgICAgICAgIC5sZW5ndGggPiAwXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBMb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdHNDaGFuZ2VkLmFkZChidWlsZE1hcCk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgYnVpbGRNYXAoKTtcblxuICAkc2NvcGUuY2hvb3NlU2VhdCA9IGZ1bmN0aW9uKHNlYXQpIHtcbiAgICB2YXIgZGV2aWNlID0gc2VhdC5kZXZpY2VzWzBdO1xuXG4gICAgaWYgKCFzZWF0LmlzX2F2YWlsYWJsZSB8fCAhZGV2aWNlKSB7XG4gICAgICB2YXIgZGV2aWNlTmFtZSA9IGRldmljZSAmJiBkZXZpY2UudXNlcm5hbWUgPyBkZXZpY2UudXNlcm5hbWUgOiBzZWF0Lm5hbWU7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KGRldmljZU5hbWUgKyAnIGlzIHVuYXZhaWxhYmxlIGZvciBjaGF0Jyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2hhdE1hbmFnZXIuYXBwcm92ZURldmljZShkZXZpY2UudG9rZW4pO1xuICAgICRzY29wZS5leGl0TWFwKCk7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRyb29tLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGF0Um9vbUN0cmwnLFxuWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ2hhdE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ1NOQVBDb25maWcnLFxuKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBTTkFQQ29uZmlnKSA9PiB7XG4gIFxuICBpZiAoIVNOQVBDb25maWcuY2hhdCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUENvbmZpZy5sb2NhdGlvbl9uYW1lO1xuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1N1cnZleU1hbmFnZXInLFxuICAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTdXJ2ZXlNYW5hZ2VyKSA9PiB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENvbnN0YW50c1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2sgc3BsaXQgdHlwZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLkNIRUNLX1NQTElUX05PTkUgPSAwO1xuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfQllfSVRFTVMgPSAxO1xuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfRVZFTkxZID0gMjtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBheW1lbnQgbWV0aG9kXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FSRCA9IDE7XG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVNIID0gMjtcbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX1BBWVBBTCA9IDM7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZWNlaXB0IG1ldGhvZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX05PTkUgPSAwO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUwgPSAxO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TID0gMjtcbiAgJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1BSSU5UID0gMztcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrb3V0IHN0ZXBcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5TVEVQX0NIRUNLX1NQTElUID0gMDtcbiAgJHNjb3BlLlNURVBfUEFZTUVOVF9NRVRIT0QgPSAxO1xuICAkc2NvcGUuU1RFUF9USVBQSU5HID0gMjtcbiAgJHNjb3BlLlNURVBfU0lHTkFUVVJFID0gMztcbiAgJHNjb3BlLlNURVBfUkVDRUlQVCA9IDQ7XG4gICRzY29wZS5TVEVQX0NPTVBMRVRFID0gNTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5vcHRpb25zID0ge307XG4gICRzY29wZS5kYXRhID0gW3tcbiAgICBpdGVtczogT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tcbiAgfV07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVja1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9DaGVja3MgZGF0YVxuICB2YXIgZGF0YSA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdkYXRhJyk7XG4gIGRhdGFcbiAgLmNoYW5nZXMoKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlLnZhbHVlKSB7XG4gICAgICB2YXIgZGF0YSA9IHZhbHVlLnZhbHVlKCk7XG4gICAgICAkc2NvcGUub3B0aW9ucy5jb3VudCA9IGRhdGEubGVuZ3RoO1xuICAgIH1cblxuICAgICRzY29wZS5vcHRpb25zLmluZGV4ID0gMDtcbiAgfSk7XG5cbiAgLy9NYXhpbXVtIG51bWJlciBvZiBndWVzdHNcbiAgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnRfbWF4ID0gTWF0aC5tYXgoXG4gICAgU2Vzc2lvbk1hbmFnZXIuZ3Vlc3RDb3VudCxcbiAgICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjay5yZWR1Y2UoKGksIGl0ZW0pID0+IGkgKyBpdGVtLnF1YW50aXR5LCAwKVxuICApO1xuXG4gIC8vTnVtYmVyIG9mIGd1ZXN0c1xuICAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCA9IFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQ7XG5cbiAgLy9DaGVjayBzcGxpdCBtb2RlXG4gICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkU7XG5cbiAgLy9DaGVjayBpbmRleFxuICAkc2NvcGUub3B0aW9ucy5pbmRleCA9IDA7XG4gIHZhciBpbmRleCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLmluZGV4Jyk7XG4gIEJhY29uLmNvbWJpbmVBc0FycmF5KGluZGV4LCBkYXRhKVxuICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50ID0gJHNjb3BlLmRhdGFbJHNjb3BlLm9wdGlvbnMuaW5kZXhdO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lID0gJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSB8fCBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5waG9uZTtcbiAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWwgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaGFzQ3JlZGVudGlhbHMgP1xuICAgICAgICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5lbWFpbCA6XG4gICAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWw7XG4gICAgfVxuXG4gICAgaWYgKCRzY29wZS5jdXJyZW50Lml0ZW1zKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5zdWJ0b3RhbCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICAgICRzY29wZS5jdXJyZW50LnRheCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUYXgoJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgIH1cblxuICAgIGlmICghJHNjb3BlLmN1cnJlbnQudGlwKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC50aXAgPSAwO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBOYXZpZ2F0aW9uXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL0N1cnJlbnQgc3RlcFxuICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnRfbWF4ID4gMSA/XG4gICAgJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQgOlxuICAgICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gICAgLnNraXBEdXBsaWNhdGVzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlLnZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0ZXAgPSB2YWx1ZS52YWx1ZSgpO1xuXG4gICAgICBpZiAoc3RlcCA9PT0gJHNjb3BlLlNURVBfQ09NUExFVEUpIHtcbiAgICAgICAgc3RhcnROZXh0Q2hlY2soKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE1pc2NcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vU2VhdCBuYW1lXG4gICRzY29wZS5vcHRpb25zLnNlYXQgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4ge1xuICAgICRzY29wZS5vcHRpb25zLnNlYXQgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vUHJvY2VlZCB3aXRoIHRoZSBuZXh0IGNoZWNrXG4gIGZ1bmN0aW9uIHN0YXJ0TmV4dENoZWNrKCkge1xuICAgIHZhciBjaGVjayA9ICRzY29wZS5jdXJyZW50O1xuXG4gICAgaWYgKCRzY29wZS5vcHRpb25zLmluZGV4ID09PSAkc2NvcGUub3B0aW9ucy5jb3VudCAtIDEpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5jbGVhckNoZWNrKCk7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHtcbiAgICAgICAgdHlwZTogU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgPyAnc3VydmV5JyA6ICdob21lJ1xuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmluZGV4Kys7XG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9KTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5nZXRQYXJ0aWFsVXJsID0gbmFtZSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcblxuICAvL0NhbGN1bGF0ZSBhIGNhcnQgaXRlbSB0aXRsZVxuICAkc2NvcGUuY2FsY3VsYXRlVGl0bGUgPSBlbnRyeSA9PiBlbnRyeS5uYW1lIHx8IGVudHJ5Lml0ZW0udGl0bGU7XG5cbiAgLy9DYWxjdWxhdGUgYSBjYXJ0IGl0ZW0gcHJpY2VcbiAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcblxuICAvL0NhbGN1bGF0ZSBjYXJ0IGl0ZW1zIHByaWNlXG4gICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAvL091dHB1dCBhIGZvcm1hdHRlZCBwcmljZSBzdHJpbmdcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlIHx8IDApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzaWduaW4nIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmluaXRpYWxpemVkID0gdHJ1ZTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRtZXRob2QuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0TWV0aG9kQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTW9kZWwnLCAnQ2FyZFJlYWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdMb2dnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ3VzdG9tZXJNb2RlbCwgQ2FyZFJlYWRlciwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2dnZXIpID0+IHtcblxuICBDYXJkUmVhZGVyLm9uUmVjZWl2ZWQuYWRkKGRhdGEgPT4ge1xuICAgIExvZ2dlci5kZWJ1ZyhgQ2FyZCByZWFkZXIgcmVzdWx0OiAke0pTT04uc3RyaW5naWZ5KGRhdGEpfWApO1xuICAgIHZhciBjYXJkID0ge1xuICAgICAgbnVtYmVyOiBkYXRhLmNhcmRfbnVtYmVyLFxuICAgICAgbW9udGg6IGRhdGEuZXhwaXJhdGlvbl9tb250aCxcbiAgICAgIHllYXI6IGRhdGEuZXhwaXJhdGlvbl95ZWFyLFxuICAgICAgZGF0YTogZGF0YS5kYXRhXG4gICAgfTtcblxuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICAgIGNhcmREYXRhUmVjZWl2ZWQoY2FyZCk7XG4gIH0pO1xuXG4gIENhcmRSZWFkZXIub25FcnJvci5hZGQoZSA9PiB7XG4gICAgTG9nZ2VyLmRlYnVnKGBDYXJkIHJlYWRlciBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0NBUkRSRUFERVJfRVJST1IpO1xuICB9KTtcblxuICAkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsICgpID0+IHtcbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgfSk7XG5cbiAgLy9HZW5lcmF0ZSBhIHBheW1lbnQgdG9rZW5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVQYXltZW50VG9rZW4oKSB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5nZW5lcmF0ZVBheW1lbnRUb2tlbigpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgUGF5bWVudCB0b2tlbiBnZW5lcmF0aW9uIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG5cbiAgLy9DYWxsZWQgd2hlbiBhIGNhcmQgZGF0YSBpcyByZWNlaXZlZFxuICBmdW5jdGlvbiBjYXJkRGF0YVJlY2VpdmVkKGNhcmQpIHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBPcmRlck1hbmFnZXIuY2xlYXJDaGVjaygkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgICAkc2NvcGUuY3VycmVudC5jYXJkX2RhdGEgPSBjYXJkLmRhdGE7XG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfU0lHTkFUVVJFO1xuICAgIH0pO1xuICB9XG5cbiAgLy9DaG9vc2UgdG8gcGF5IHdpdGggYSBjcmVkaXQgY2FyZFxuICAkc2NvcGUucGF5Q2FyZCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9ICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVJEO1xuICAgIENhcmRSZWFkZXIuc3RhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUucGF5Q2FyZENhbmNlbCA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3VycmVudC5wYXltZW50X21ldGhvZCA9IHVuZGVmaW5lZDtcbiAgICBDYXJkUmVhZGVyLnN0b3AoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byBwYXkgd2l0aCBjYXNoXG4gICRzY29wZS5wYXlDYXNoID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBU0g7XG5cbiAgICBpZiAoT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCAhPSBudWxsKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgUmVxdWVzdCBjbG9zZW91dCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICBnZW5lcmF0ZVBheW1lbnRUb2tlbigpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHJlY2VpcHQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0UmVjZWlwdEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsIFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgLy9DaG9vc2UgdG8gaGF2ZSBubyByZWNlaXB0XG4gICRzY29wZS5yZWNlaXB0Tm9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX05PTkU7XG4gICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSByZWNlaXB0IGJ5IGUtbWFpbFxuICAkc2NvcGUucmVjZWlwdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC5yZWNlaXB0X2VtYWlsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUw7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICAvL0Nob29zZSB0byByZWNlaXZlIGEgcmVjZWlwdCBieSBzbXNcbiAgJHNjb3BlLnJlY2VpcHRTbXMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUztcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSBwcmludGVkIHJlY2VpcHRcbiAgJHNjb3BlLnJlY2VpcHRQcmludCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfbWV0aG9kID0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1BSSU5UO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVxdWVzdFJlY2VpcHQoKSB7XG4gICAgdmFyIGl0ZW0gPSAkc2NvcGUuY3VycmVudDtcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgY2hlY2tvdXRfdG9rZW46IGl0ZW0uY2hlY2tvdXRfdG9rZW4sXG4gICAgICByZWNlaXB0X21ldGhvZDogaXRlbS5yZWNlaXB0X21ldGhvZFxuICAgIH07XG5cbiAgICBpZiAoaXRlbS5yZWNlaXB0X21ldGhvZCA9PT0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX0VNQUlMKSB7XG4gICAgICByZXF1ZXN0LnJlY2VpcHRfZW1haWwgPSBpdGVtLnJlY2VpcHRfZW1haWw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ucmVjZWlwdF9tZXRob2QgPT09ICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVMpIHtcbiAgICAgIHJlcXVlc3QucmVjZWlwdF9waG9uZSA9IGl0ZW0ucmVjZWlwdF9waG9uZTtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RSZWNlaXB0KHJlcXVlc3QpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0c2lnbmF0dXJlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFNpZ25hdHVyZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdMb2dnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2dnZXIpID0+IHtcblxuICAvL0NsZWFyIHRoZSBjdXJyZW50IHNpZ25hdHVyZVxuICB2YXIgcmVzZXRTaWduYXR1cmUgPSAoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmN1cnJlbnQuc2lnbmF0dXJlX3Rva2VuID0gdW5kZWZpbmVkO1xuXG4gICAgICB2YXIgc2lnbmF0dXJlID0gJCgnI2NoZWNrb3V0LXNpZ25hdHVyZS1pbnB1dCcpO1xuICAgICAgc2lnbmF0dXJlLmVtcHR5KCk7XG4gICAgICBzaWduYXR1cmUualNpZ25hdHVyZSgnaW5pdCcsIHtcbiAgICAgICAgJ2NvbG9yJyA6ICcjMDAwJyxcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZicsXG4gICAgICAgICdkZWNvci1jb2xvcic6ICcjZmZmJyxcbiAgICAgICAgJ3dpZHRoJzogJzEwMCUnLFxuICAgICAgICAnaGVpZ2h0JzogJzIwMHB4J1xuICAgICAgfSk7XG4gICAgfSwgMzAwKTtcbiAgfTtcblxuICAvL1N1Ym1pdCB0aGUgY3VycmVudCBzaWduYXR1cmUgaW5wdXRcbiAgJHNjb3BlLnNpZ25hdHVyZVN1Ym1pdCA9ICgpID0+IHtcbiAgICB2YXIgc2lnbmF0dXJlID0gJCgnI2NoZWNrb3V0LXNpZ25hdHVyZS1pbnB1dCcpO1xuXG4gICAgaWYgKHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdnZXREYXRhJywgJ25hdGl2ZScpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgdmFyIHNpZyA9IHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdnZXREYXRhJywgJ2ltYWdlJyk7XG5cbiAgICBPcmRlck1hbmFnZXIudXBsb2FkU2lnbmF0dXJlKHNpZ1sxXSkudGhlbih0b2tlbiA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQuc2lnbmF0dXJlX3Rva2VuID0gdG9rZW47XG4gICAgICAgIGNvbXBsZXRlQ2hlY2tvdXQoKTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBTaWduYXR1cmUgdXBsb2FkIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vQ2FuY2VsIHRoZSBjdXJyZW50IHNpZ25hdHVyZSBpbnB1dFxuICAkc2NvcGUuc2lnbmF0dXJlQ2FuY2VsID0gKCkgPT4ge1xuICAgIHJlc2V0U2lnbmF0dXJlKCk7XG4gIH07XG5cbiAgLy9Db21wbGV0ZSB0aGUgY2hlY2tvdXRcbiAgZnVuY3Rpb24gY29tcGxldGVDaGVja291dCgpIHtcbiAgICB2YXIgaXRlbSA9ICRzY29wZS5jdXJyZW50O1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGFtb3VudF9zdWJ0b3RhbDogaXRlbS5zdWJ0b3RhbCxcbiAgICAgIGFtb3VudF90YXg6IGl0ZW0udGF4LFxuICAgICAgYW1vdW50X3RpcDogaXRlbS50aXAsXG4gICAgICBjYXJkX2RhdGE6IGl0ZW0uY2FyZF9kYXRhLFxuICAgICAgc2lnbmF0dXJlX3Rva2VuOiBpdGVtLnNpZ25hdHVyZV90b2tlbixcbiAgICAgIG9yZGVyX3Rva2VuczogaXRlbS5pdGVtcyAhPSBudWxsID9cbiAgICAgICAgaXRlbS5pdGVtcy5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCBpdGVtKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW0ucXVhbnRpdHk7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtLnJlcXVlc3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0sIFtdKVxuICAgICAgICA6IG51bGxcbiAgICB9O1xuXG4gICAgT3JkZXJNYW5hZ2VyLnBheU9yZGVyKHJlcXVlc3QpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG5cbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQuY2hlY2tvdXRfdG9rZW4gPSByZXN1bHQudG9rZW47XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9SRUNFSVBUO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYE9yZGVyIHBheW1lbnQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgc3RlcCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdvcHRpb25zLnN0ZXAnKTtcbiAgc3RlcFxuICAuc2tpcER1cGxpY2F0ZXMoKVxuICAuc3Vic2NyaWJlKHZhbHVlID0+IHtcbiAgICBpZiAoIXZhbHVlLnZhbHVlIHx8IHZhbHVlLnZhbHVlKCkgIT09ICRzY29wZS5TVEVQX1NJR05BVFVSRSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc2V0U2lnbmF0dXJlKCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHNwbGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdDaGVja291dFNwbGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ09yZGVyTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBPcmRlck1hbmFnZXIpID0+IHtcblxuICAvL1NwbGl0IHRoZSBjdXJyZW50IG9yZGVyIGluIHRoZSBzZWxlY3RlZCB3YXlcbiAgJHNjb3BlLnNwbGl0Q2hlY2sgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyIGksIGRhdGEgPSBbXTtcblxuICAgIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORSkge1xuICAgICAgZGF0YS5wdXNoKHtcbiAgICAgICAgaXRlbXM6IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrXG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9FVkVOTFkpIHtcbiAgICAgIHZhciBjaGVjayA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLFxuICAgICAgICAgIHN1YnRvdGFsID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoY2hlY2spLFxuICAgICAgICAgIHRheCA9IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUYXgoY2hlY2spO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQ7IGkrKykge1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgIHN1YnRvdGFsOiBNYXRoLnJvdW5kKChzdWJ0b3RhbCAvICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50KSAqIDEwMCkgLyAxMDAsXG4gICAgICAgICAgdGF4OiBNYXRoLnJvdW5kKCh0YXggLyAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudCkgKiAxMDApIC8gMTAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX0JZX0lURU1TKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQ7IGkrKykge1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2suc2xpY2UoMCkubWFwKGl0ZW0gPT4gaXRlbS5jbG9uZSgpKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuJHBhcmVudC5kYXRhID0gZGF0YTtcbiAgICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9IHR5cGU7XG4gIH07XG5cbiAgLy9Nb3ZlIGFuIGl0ZW0gdG8gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLmFkZFRvQ2hlY2sgPSBmdW5jdGlvbihlbnRyeSkge1xuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9ICRzY29wZS5zcGxpdF9pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCAhPT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0ucXVhbnRpdHkgPiAxKSB7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHktLTtcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gIT0gbnVsbDsgfSk7XG5cbiAgICB2YXIgZXhpc3RzID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9ICRzY29wZS5jdXJyZW50Lml0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ID09PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIGV4aXN0cyA9IHRydWU7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHkrKztcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG5cbiAgICBpZiAoIWV4aXN0cykge1xuICAgICAgdmFyIGNsb25lID0gZW50cnkuY2xvbmUoKTtcbiAgICAgIGNsb25lLnF1YW50aXR5ID0gMTtcblxuICAgICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMucHVzaChjbG9uZSk7XG4gICAgfVxuICB9O1xuXG4gIC8vUmVtb3ZlIGFuIGl0ZW0gZnJvbSB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUucmVtb3ZlRnJvbUNoZWNrID0gZnVuY3Rpb24oZW50cnkpIHtcbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9ICRzY29wZS5jdXJyZW50Lml0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ICE9PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5xdWFudGl0eSA+IDEpIHtcbiAgICAgICAgaXRlbS5xdWFudGl0eS0tO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbSAhPSBudWxsOyB9KTtcblxuICAgIHZhciBleGlzdHMgPSBmYWxzZTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9ICRzY29wZS5zcGxpdF9pdGVtc1xuICAgIC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgaWYgKGl0ZW0ucmVxdWVzdCA9PT0gZW50cnkucmVxdWVzdCkge1xuICAgICAgICBleGlzdHMgPSB0cnVlO1xuICAgICAgICBpdGVtLnF1YW50aXR5Kys7XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgaWYgKCFleGlzdHMpIHtcbiAgICAgIHZhciBjbG9uZSA9IGVudHJ5LmNsb25lKCk7XG4gICAgICBjbG9uZS5xdWFudGl0eSA9IDE7XG5cbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcy5wdXNoKGNsb25lKTtcbiAgICB9XG4gIH07XG5cbiAgLy9Nb3ZlIGFsbCBhdmFpbGFibGUgaXRlbXMgdG8gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLmFkZEFsbFRvQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaCgkc2NvcGUuYWRkVG9DaGVjayk7XG5cbiAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKG5ld2l0ZW0pIHtcbiAgICAgICAgaWYgKG5ld2l0ZW0ucmVxdWVzdCA9PT0gaXRlbS5yZXF1ZXN0KSB7XG4gICAgICAgICAgbmV3aXRlbS5xdWFudGl0eSArPSBpdGVtLnF1YW50aXR5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcyA9IFtdO1xuICB9O1xuXG4gIC8vUmVtb3ZlIGFsbCBpdGVtcyBmcm9tIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5yZW1vdmVBbGxGcm9tQ2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKCRzY29wZS5yZW1vdmVGcm9tQ2hlY2spO1xuXG4gICAgJHNjb3BlLmN1cnJlbnQuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMuZm9yRWFjaChmdW5jdGlvbihuZXdpdGVtKSB7XG4gICAgICAgIGlmIChuZXdpdGVtLnJlcXVlc3QgPT09IGl0ZW0ucmVxdWVzdCkge1xuICAgICAgICAgIG5ld2l0ZW0ucXVhbnRpdHkgKz0gaXRlbS5xdWFudGl0eTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcyA9IFtdO1xuICB9O1xuXG4gIC8vUHJvY2VlZCB3aXRoIHRoZSBuZXh0IGNoZWNrIHNwbGl0dGluZ1xuICAkc2NvcGUuc3BsaXROZXh0Q2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm9wdGlvbnMuaW5kZXggPCAkc2NvcGUub3B0aW9ucy5jb3VudCAtIDEgJiYgJHNjb3BlLnNwbGl0X2l0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmluZGV4Kys7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCRzY29wZS5zcGxpdF9pdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAkc2NvcGUuYWRkQWxsVG9DaGVjaygpO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLiRwYXJlbnQuZGF0YSA9ICRzY29wZS4kcGFyZW50LmRhdGEuZmlsdGVyKGZ1bmN0aW9uKGNoZWNrKSB7XG4gICAgICAgIHJldHVybiBjaGVjay5pdGVtcy5sZW5ndGggPiAwO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gIC5za2lwRHVwbGljYXRlcygpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlLnZhbHVlIHx8IHZhbHVlLnZhbHVlKCkgIT09ICRzY29wZS5TVEVQX0NIRUNLX1NQTElUKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUub3B0aW9ucy5jaGVja19zcGxpdCA9ICRzY29wZS5DSEVDS19TUExJVF9OT05FO1xuICAgIH0pO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXR0aXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0VGlwQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ09yZGVyTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIE9yZGVyTWFuYWdlcikge1xuXG4gIC8vQWRkIGEgdGlwXG4gICRzY29wZS5hZGRUaXAgPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICAkc2NvcGUuY3VycmVudC50aXAgPSBNYXRoLnJvdW5kKCgkc2NvcGUuY3VycmVudC5zdWJ0b3RhbCAqIGFtb3VudCkgKiAxMDApIC8gMTAwO1xuICB9O1xuXG4gIC8vQXBwbHkgdGhlIHNlbGVjdGVkIHRpcCBhbW91bnQgYW5kIHByb2NlZWQgZnVydGhlclxuICAkc2NvcGUuYXBwbHlUaXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfUEFZTUVOVF9NRVRIT0Q7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL2ZsaXBzY3JlZW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRGbGlwU2NyZWVuJywgWydNYW5hZ2VtZW50U2VydmljZScsIGZ1bmN0aW9uKE1hbmFnZW1lbnRTZXJ2aWNlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5yb3RhdGVTY3JlZW4oKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvcmVzZXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmZhY3RvcnkoJ0NvbW1hbmRSZXNldCcsIFsnQW5hbHl0aWNzTWFuYWdlcicsICdDaGF0TWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1N1cnZleU1hbmFnZXInLCAnTWFuYWdlbWVudFNlcnZpY2UnLCAnTG9nZ2VyJywgZnVuY3Rpb24oQW5hbHl0aWNzTWFuYWdlciwgQ2hhdE1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU3VydmV5TWFuYWdlciwgTWFuYWdlbWVudFNlcnZpY2UsIExvZ2dlcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gZmFpbChlKSB7XG4gICAgICBMb2dnZXIud2FybignVW5hYmxlIHRvIHJlc2V0IHByb3Blcmx5OiAnICsgZS5tZXNzYWdlKTtcbiAgICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJlc2V0KCk7XG4gICAgfVxuXG4gICAgU2Vzc2lvbk1hbmFnZXIuZW5kU2Vzc2lvbigpO1xuXG4gICAgQW5hbHl0aWNzTWFuYWdlci5zdWJtaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgT3JkZXJNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgU3VydmV5TWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBDaGF0TWFuYWdlci5yZXNldCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJlc2V0KCk7XG4gICAgICAgICAgICB9LCBmYWlsKTtcbiAgICAgICAgICB9LCBmYWlsKTtcbiAgICAgICAgfSwgZmFpbCk7XG4gICAgICB9LCBmYWlsKTtcbiAgICB9LCBmYWlsKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvc3RhcnR1cC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFN0YXJ0dXAnLCBbJ0xvZ2dlcicsICdBcHBDYWNoZScsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1N1cnZleU1hbmFnZXInLCAnU05BUENvbmZpZycsIGZ1bmN0aW9uKExvZ2dlciwgQXBwQ2FjaGUsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIEN1c3RvbWVyTWFuYWdlciwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTdXJ2ZXlNYW5hZ2VyLCBTTkFQQ29uZmlnKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICAgIExvZ2dlci53YXJuKGBVbmFibGUgdG8gc3RhcnR1cCBwcm9wZXJseTogJHtlLm1lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FjaGVDb21wbGV0ZSh1cGRhdGVkKSB7XG4gICAgICBpZiAodXBkYXRlZCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIERhdGFNYW5hZ2VyLmluaXRpYWxpemUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoQXBwQ2FjaGUuaXNVcGRhdGVkKSB7XG4gICAgICBjYWNoZUNvbXBsZXRlKHRydWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChBcHBDYWNoZS5pc0NvbXBsZXRlKSB7XG4gICAgICBjYWNoZUNvbXBsZXRlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBBcHBDYWNoZS5jb21wbGV0ZS5hZGQoY2FjaGVDb21wbGV0ZSk7XG5cbiAgICBTaGVsbE1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQpIHtcbiAgICAgIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3NpZ25pbicgfTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIEN1c3RvbWVyTWFuYWdlci5ndWVzdExvZ2luKCk7XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9zdWJtaXRvcmRlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFN1Ym1pdE9yZGVyJyxcbiAgWydEaWFsb2dNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNYW5hZ2VyJyxcbiAgKERpYWxvZ01hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFMb2NhdGlvbk1vZGVsLnNlYXQgfHwgIUxvY2F0aW9uTW9kZWwuc2VhdC50b2tlbikge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9FUlJPUl9OT19TRUFUKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgMDtcblxuICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2RpYWxvZy5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignRGlhbG9nQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdEaWFsb2dNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBEaWFsb2dNYW5hZ2VyKSB7XG4gIHZhciBhbGVydFN0YWNrID0gW10sXG4gICAgICBjb25maXJtU3RhY2sgPSBbXTtcbiAgdmFyIGFsZXJ0SW5kZXggPSAtMSxcbiAgICAgIGNvbmZpcm1JbmRleCA9IC0xO1xuICB2YXIgYWxlcnRUaW1lcjtcblxuICBmdW5jdGlvbiB1cGRhdGVWaXNpYmlsaXR5KGlzQnVzeSwgc2hvd0FsZXJ0LCBzaG93Q29uZmlybSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmlzQnVzeSA9IGlzQnVzeSAhPT0gdW5kZWZpbmVkID8gaXNCdXN5IDogJHNjb3BlLmlzQnVzeTtcbiAgICAgICRzY29wZS5zaG93QWxlcnQgPSBzaG93QWxlcnQgIT09IHVuZGVmaW5lZCA/IHNob3dBbGVydCA6ICRzY29wZS5zaG93QWxlcnQ7XG4gICAgICAkc2NvcGUuc2hvd0NvbmZpcm0gPSBzaG93Q29uZmlybSAhPT0gdW5kZWZpbmVkID8gc2hvd0NvbmZpcm0gOiAkc2NvcGUuc2hvd0NvbmZpcm07XG4gICAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5pc0J1c3kgfHwgJHNjb3BlLnNob3dBbGVydCB8fCAkc2NvcGUuc2hvd0NvbmZpcm07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TmV4dEFsZXJ0KCkge1xuICAgIGlmIChhbGVydFRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwoYWxlcnRUaW1lcik7XG4gICAgfVxuXG4gICAgYWxlcnRJbmRleCsrO1xuXG4gICAgaWYgKGFsZXJ0SW5kZXggPT09IGFsZXJ0U3RhY2subGVuZ3RoKSB7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgYWxlcnRTdGFjayA9IFtdO1xuICAgICAgYWxlcnRJbmRleCA9IC0xO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmFsZXJ0VGl0bGUgPSBhbGVydFN0YWNrW2FsZXJ0SW5kZXhdLnRpdGxlO1xuICAgICAgJHNjb3BlLmFsZXJ0VGV4dCA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF0ubWVzc2FnZTtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9KTtcblxuICAgIGFsZXJ0VGltZXIgPSAkdGltZW91dChzaG93TmV4dEFsZXJ0LCAxMDAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TmV4dENvbmZpcm0oKSB7XG4gICAgY29uZmlybUluZGV4Kys7XG5cbiAgICBpZiAoY29uZmlybUluZGV4ID09PSBjb25maXJtU3RhY2subGVuZ3RoKSB7XG4gICAgICB1cGRhdGVWaXNpYmlsaXR5KHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICBjb25maXJtU3RhY2sgPSBbXTtcbiAgICAgIGNvbmZpcm1JbmRleCA9IC0xO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmNvbmZpcm1UZXh0ID0gY29uZmlybVN0YWNrW2NvbmZpcm1JbmRleF0ubWVzc2FnZTtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHN3aXRjaCAobWVzc2FnZSkge1xuICAgICAgICAgIGNhc2UgQUxFUlRfR0VORVJJQ19FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9vcHMhIE15IGJpdHMgYXJlIGZpZGRsZWQuIE91ciByZXF1ZXN0IHN5c3RlbSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuIFBsZWFzZSBub3RpZnkgYSBzZXJ2ZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT29wcyEgTXkgYml0cyBhcmUgZmlkZGxlZC4gT3VyIHJlcXVlc3Qgc3lzdGVtIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC4gUGxlYXNlIG5vdGlmeSBhIHNlcnZlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJDYWxsIFNlcnZlciByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciByZXF1ZXN0IGZvciBzZXJ2ZXIgYXNzaXN0YW5jZSBoYXMgYmVlbiBzZWVuLCBhbmQgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlJlcXVlc3QgY2hlY2sgcmVxdWVzdCB3YXMgc2VudCBzdWNjZXNzZnVsbHkuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIGNoZWNrIHJlcXVlc3QgaGFzIGJlZW4gc2VlbiwgYW5kIGFjY2VwdGVkLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPcmRlciBzZW50ISBZb3Ugd2lsbCBiZSBub3RpZmllZCB3aGVuIHlvdXIgd2FpdGVyIGFjY2VwdHMgdGhlIG9yZGVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91ciBvcmRlciBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1NJR05JTl9SRVFVSVJFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdSBtdXN0IGJlIGxvZ2dlZCBpbnRvIFNOQVAgdG8gYWNjZXNzIHRoaXMgcGFnZS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfQVNTSVNUQU5DRTpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBjYWxsIHRoZSB3YWl0ZXI/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1RBQkxFX0NMT1NFT1VUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHJlcXVlc3QgeW91ciBjaGVjaz9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfUkVTRVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQ/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0RFTEVUX0NBUkQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVtb3ZlIHRoaXMgcGF5bWVudCBtZXRob2Q/XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQSBsaW5rIHRvIGNoYW5nZSB5b3VyIHBhc3N3b3JkIGhhcyBiZWVuIGVtYWlsZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1NPRlRXQVJFX09VVERBVEVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQSBzb2Z0d2FyZSB1cGRhdGUgaXMgYXZhaWxhYmxlLiBQbGVhc2UgcmVzdGFydCB0aGUgYXBwbGljYXRpb24uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0NBUkRSRUFERVJfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJVbmFibGUgdG8gcmVhZCB0aGUgY2FyZCBkYXRhLiBQbGVhc2UgdHJ5IGFnYWluLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9FUlJPUl9OT19TRUFUOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiRGV2aWNlIGlzIG5vdCBhc3NpZ25lZCB0byBhbnkgdGFibGUuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVzc2FnZTtcbiAgfVxuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG4gICRzY29wZS5pc0J1c3kgPSBmYWxzZTtcbiAgJHNjb3BlLnNob3dBbGVydCA9IGZhbHNlO1xuICAkc2NvcGUuc2hvd0NvbmZpcm0gPSBmYWxzZTtcblxuICAkc2NvcGUuY2xvc2VBbGVydCA9IGZ1bmN0aW9uKCkge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgc2hvd05leHRBbGVydCgpO1xuICB9O1xuXG4gICRzY29wZS5jbG9zZUNvbmZpcm0gPSBmdW5jdGlvbihjb25maXJtZWQpIHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgdmFyIGNvbmZpcm0gPSBjb25maXJtU3RhY2tbY29uZmlybUluZGV4XTtcblxuICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgIGlmIChjb25maXJtLnJlc29sdmUpIHtcbiAgICAgICAgY29uZmlybS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKGNvbmZpcm0ucmVqZWN0KSB7XG4gICAgICAgIGNvbmZpcm0ucmVqZWN0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2hvd05leHRDb25maXJtKCk7XG4gIH07XG5cbiAgRGlhbG9nTWFuYWdlci5hbGVydFJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSwgdGl0bGUpIHtcbiAgICBtZXNzYWdlID0gZ2V0TWVzc2FnZShtZXNzYWdlKTtcblxuICAgIGFsZXJ0U3RhY2sucHVzaCh7IHRpdGxlOiB0aXRsZSwgbWVzc2FnZTogbWVzc2FnZSB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dBbGVydCkge1xuICAgICAgJHRpbWVvdXQoc2hvd05leHRBbGVydCk7XG4gICAgfVxuICB9KTtcblxuICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm1SZXF1ZXN0ZWQuYWRkKGZ1bmN0aW9uKG1lc3NhZ2UsIHJlc29sdmUsIHJlamVjdCkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgY29uZmlybVN0YWNrLnB1c2goeyBtZXNzYWdlOiBtZXNzYWdlLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCB9KTtcblxuICAgIGlmICghJHNjb3BlLnNob3dDb25maXJtKSB7XG4gICAgICAkdGltZW91dChzaG93TmV4dENvbmZpcm0pO1xuICAgIH1cbiAgfSk7XG5cbiAgRGlhbG9nTWFuYWdlci5qb2JTdGFydGVkLmFkZChmdW5jdGlvbigpIHtcbiAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVWaXNpYmlsaXR5KHRydWUpO1xuICB9KTtcblxuICBEaWFsb2dNYW5hZ2VyLmpvYkVuZGVkLmFkZChmdW5jdGlvbigpIHtcbiAgICB1cGRhdGVWaXNpYmlsaXR5KGZhbHNlKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2FkdmVydGlzZW1lbnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzQWR2ZXJ0aXNlbWVudEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQW5hbHl0aWNzTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdTaGVsbE1hbmFnZXInLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQWN0aXZpdHlNb25pdG9yLCBBbmFseXRpY3NNb2RlbCwgaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS52aXNpYmxlKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gZGF0YS5tYWluXG4gICAgICAgIC5tYXAoYWQgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgICAgICAgIHRva2VuOiBhZC50b2tlblxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2NhcnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNDYXJ0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJyRzY2UnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdDaGF0TWFuYWdlcicsXG4gICAgKCRzY29wZSwgJHRpbWVvdXQsICRzY2UsIEN1c3RvbWVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgICAgICRzY29wZS5TVEFURV9DQVJUID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgICAkc2NvcGUuU1RBVEVfSElTVE9SWSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuXG4gICAgICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAgICAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcbiAgICAgICRzY29wZS5vcHRpb25zID0ge307XG5cbiAgICAgICRzY29wZS5jdXJyZW5jeSA9IFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeTtcbiAgICAgIFNoZWxsTWFuYWdlci5tb2RlbC5jdXJyZW5jeUNoYW5nZWQuYWRkKGN1cnJlbmN5ID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXJyZW5jeSA9IGN1cnJlbmN5KSk7XG5cbiAgICAgICRzY29wZS5zdGF0ZSA9IENhcnRNb2RlbC5jYXJ0U3RhdGU7XG4gICAgICBDYXJ0TW9kZWwuY2FydFN0YXRlQ2hhbmdlZC5hZGQoc3RhdGUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0YXRlID0gc3RhdGUpKTtcblxuICAgICAgJHNjb3BlLmVkaXRhYmxlSXRlbSA9IENhcnRNb2RlbC5lZGl0YWJsZUl0ZW07XG4gICAgICBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtQ2hhbmdlZC5hZGQoaXRlbSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWRpdGFibGVJdGVtID0gaXRlbSkpO1xuXG4gICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gdmFsdWUpO1xuXG4gICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcblxuICAgICAgJHNjb3BlLmdpZnRTZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0KTtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgICAgIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gICAgICAkc2NvcGUudmlzaWJsZSA9IENhcnRNb2RlbC5pc0NhcnRPcGVuO1xuXG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICAgICAkc2NvcGUuc2hvd0NhcnQoKTtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gTG9jYXRpb25Nb2RlbC5zZWF0ID9cbiAgICAgICAgTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOlxuICAgICAgICAnVGFibGUnO1xuXG4gICAgICBMb2NhdGlvbk1vZGVsLnNlYXRDaGFuZ2VkLmFkZChzZWF0ID0+ICRzY29wZS5zZWF0X25hbWUgPSBzZWF0ID8gc2VhdC5uYW1lIDogJ1RhYmxlJyk7XG5cbiAgICAgIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9IE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcbiAgICAgIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuICAgICAgfTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgICAgIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCA9PSBudWxsO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJzID0gZW50cnkgPT4ge1xuICAgICAgICBpZiAoIWVudHJ5Lm1vZGlmaWVycykge1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgbGV0IG1vZGlmaWVycyA9IGNhdGVnb3J5Lm1vZGlmaWVycy5maWx0ZXIobW9kaWZpZXIgPT4gbW9kaWZpZXIuaXNTZWxlY3RlZCk7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChtb2RpZmllcnMpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sIFtdKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jYWxjdWxhdGVQcmljZSA9IGVudHJ5ID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVQcmljZShlbnRyeSk7XG4gICAgICAkc2NvcGUuY2FsY3VsYXRlVG90YWxQcmljZSA9IGVudHJpZXMgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoZW50cmllcyk7XG5cbiAgICAgICRzY29wZS5lZGl0SXRlbSA9IGVudHJ5ID0+IENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCBmYWxzZSk7XG5cbiAgICAgICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIGlmIChjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIG0gPT4gbS5pc1NlbGVjdGVkID0gKG0gPT09IG1vZGlmaWVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmVtb3ZlRnJvbUNhcnQgPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KGVudHJ5KTtcbiAgICAgICRzY29wZS5yZW9yZGVySXRlbSA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5LmNsb25lKCkpO1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2FydCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9ICRzY29wZS5vcHRpb25zLnRvR28gPyAyIDogMDtcblxuICAgICAgICBPcmRlck1hbmFnZXIuc3VibWl0Q2FydChvcHRpb25zKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgICAgICAgICRzY29wZS5vcHRpb25zLnRvR28gPSBmYWxzZTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsZWFyQ2FydCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMudG9HbyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmNsZWFyQ2FydCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsb3NlRWRpdG9yID0gKCkgPT4ge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jbG9zZUNhcnQgPSAoKSA9PiB7XG4gICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgICAgIENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dIaXN0b3J5ID0gKCkgPT4gQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICAgICAkc2NvcGUuc2hvd0NhcnQgPSAoKSA9PiBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcblxuICAgICAgJHNjb3BlLnBheUNoZWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGVja291dCcgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKCEkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9jYXRlZ29yeS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNDYXRlZ29yeUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgdmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5jYXRlZ29yeUNoYW5nZWQuYWRkKGNhdGVnb3J5ID0+IHtcbiAgICBpZiAoIWNhdGVnb3J5KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhdGVnb3J5ID0gbnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIGl0ZW1zID0gY2F0ZWdvcnkuaXRlbXMgfHwgW10sXG4gICAgICAgIGNhdGVnb3JpZXMgPSBjYXRlZ29yeS5jYXRlZ29yaWVzIHx8IFtdO1xuXG4gICAgdmFyIHRpbGVzID0gY2F0ZWdvcmllcy5jb25jYXQoaXRlbXMpLm1hcChpdGVtID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiBpdGVtLnRpdGxlLFxuICAgICAgICBpbWFnZTogaXRlbS5pbWFnZSxcbiAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGl0ZW0uZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogaXRlbS5kZXN0aW5hdGlvblxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoQ2F0ZWdvcnlMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWNhdGVnb3J5LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIGlmIChsb2NhdGlvbi50eXBlID09PSAnaXRlbScpIHtcbiAgICAgICRzY29wZS5zaG93TW9kYWwgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5zaG93TW9kYWwgPSBmYWxzZTtcblxuICAgIERhdGFNYW5hZ2VyLmNhdGVnb3J5ID0gbG9jYXRpb24udHlwZSA9PT0gJ2NhdGVnb3J5JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5jYXRlZ29yeSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2hvbWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnU05BUENvbmZpZycsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlciwgU05BUENvbmZpZykgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHJvd3MgPSBbXSxcbiAgICAgICAgICBob21lID0gdGhpcy5wcm9wcy5ob21lO1xuXG4gICAgICBpZiAoQm9vbGVhbihob21lLmludHJvKSkge1xuICAgICAgICByb3dzLnB1c2goUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtaW5mbycsXG4gICAgICAgICAga2V5OiAnaW50cm8nXG4gICAgICAgIH0sIFJlYWN0LkRPTS5kaXYoe30sIFtcbiAgICAgICAgICAgIFJlYWN0LkRPTS5oMSh7IGtleTogJ2ludHJvLXRpdGxlJyB9LFxuICAgICAgICAgICAgICBob21lLmludHJvLnRpdGxlIHx8IGBXZWxjb21lIHRvICR7U05BUENvbmZpZy5sb2NhdGlvbl9uYW1lfWBcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBSZWFjdC5ET00ucCh7IGtleTogJ2ludHJvLXRleHQnIH0sXG4gICAgICAgICAgICAgIGhvbWUuaW50cm8udGV4dFxuICAgICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHRpbGVzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgdmFyIGJhY2tncm91bmQgPSBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgNDcwLCA0MTApO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0aWxlIHRpbGUtcmVndWxhcicsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiBiYWNrZ3JvdW5kID8gJ3VybChcIicgKyBiYWNrZ3JvdW5kICsgJ1wiKScgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICByb3dzID0gcm93cy5jb25jYXQodGlsZXMpXG4gICAgICAucmVkdWNlKChyZXN1bHQsIHZhbHVlKSA9PiB7XG4gICAgICAgIHJlc3VsdFswXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmhvbWVDaGFuZ2VkLmFkZChob21lID0+IHtcbiAgICBpZiAoIWhvbWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBob21lLm1lbnVzXG4gICAgLm1hcChtZW51ID0+IHtcbiAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgIGltYWdlOiBtZW51LmltYWdlLFxuICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVNZW51LCB7IHRpbGVzOiB0aWxlcywgaG9tZTogaG9tZSB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLWhvbWUtbWVudScpXG4gICAgKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLmhvbWUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmhvbWUpO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9pdGVtLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0l0ZW1DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdXZWJCcm93c2VyJywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBXZWJCcm93c2VyLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuXG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSAkc2NvcGUuZW50cmllcyA9IG51bGw7XG4gICAgICAgICRzY29wZS50eXBlID0gMTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAwO1xuICAgICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9IGl0ZW0udHlwZTtcblxuICAgIGlmICh0eXBlID09PSAyICYmIGl0ZW0ud2Vic2l0ZSkge1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKGl0ZW0ud2Vic2l0ZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzICYmIGl0ZW0uZmxhc2gpIHtcbiAgICAgIGxldCBmbGFzaFVybCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLmZsYXNoLm1lZGlhLCAwLCAwLCAnc3dmJyksXG4gICAgICAgICAgdXJsID0gJy9mbGFzaCN1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChmbGFzaFVybCkgK1xuICAgICAgICAgICAgICAgICcmd2lkdGg9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLndpZHRoKSArXG4gICAgICAgICAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChpdGVtLmZsYXNoLmhlaWdodCk7XG5cbiAgICAgIFdlYkJyb3dzZXIub3BlbihXZWJCcm93c2VyLmdldEFwcFVybCh1cmwpKTtcbiAgICB9XG5cbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodHlwZSA9PT0gMSkge1xuICAgICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKGl0ZW0sIDEpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHlwZSA9IHR5cGU7XG4gICAgICAkc2NvcGUuc3RlcCA9IDA7XG4gICAgICAkc2NvcGUuZW50cnlJbmRleCA9IDA7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgdywgaCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHcsIGgsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IHZhbHVlID8gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKSA6IDA7XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gKCkgPT4ge1xuICAgIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgaWYgKCRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMgPSAkc2NvcGUuZW50cnkuY2xvbmVNYW55KCk7XG4gICAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1skc2NvcGUuZW50cnlJbmRleCA9IDBdO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDI7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCRzY29wZS5zdGVwID09PSAxKSB7XG4gICAgICBpZiAoJHNjb3BlLmVudHJ5SW5kZXggPT09ICRzY29wZS5lbnRyaWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgJHNjb3BlLmVudHJpZXMuZm9yRWFjaChlbnRyeSA9PiBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KSk7XG4gICAgICAgICRzY29wZS5zdGVwID0gMjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbKyskc2NvcGUuZW50cnlJbmRleF07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5wcmV2aW91c1N0ZXAgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zdGVwID09PSAxICYmICRzY29wZS5lbnRyeUluZGV4ID4gMCkge1xuICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWy0tJHNjb3BlLmVudHJ5SW5kZXhdO1xuICAgIH1cbiAgICBlbHNlIGlmICgkc2NvcGUuc3RlcCA9PT0gMCkge1xuICAgICAgJHNjb3BlLmdvQmFjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICRzY29wZS5zdGVwLS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSAoY2F0ZWdvcnksIG1vZGlmaWVyKSA9PiB7XG4gICAgaWYgKGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBtID0+IG0uaXNTZWxlY3RlZCA9IChtID09PSBtb2RpZmllcikpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIENvbW1hbmRTdWJtaXRPcmRlcigpO1xuICAgICRzY29wZS5nb0JhY2soKTtcbiAgfTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaXRlbWVkaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignR2FsYXhpZXNJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdDb21tYW5kU3VibWl0T3JkZXInLFxuICAgICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBDb21tYW5kU3VibWl0T3JkZXIpID0+IHtcblxuICAgICAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgICAgICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSk7XG5cbiAgICAgIHZhciBjdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc2NvcGUuZW50cnkgJiYgJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgICAgICRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAkc2NvcGUuaGFzUHJldmlvdXNDYXRlZ29yeSA9IGN1cnJlbnRJbmRleCA+IDA7XG4gICAgICAgICAgJHNjb3BlLmNhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdO1xuICAgICAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICAgICAkc2NvcGUuY2FuRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnbWVudScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9ICRzY29wZS5lbnRyeSAhPSBudWxsO1xuXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgIGluaXQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG5cbiAgICAgIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpbml0KHZhbHVlKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBtb2RpZmllci5kYXRhLnRpdGxlICsgKG1vZGlmaWVyLmRhdGEucHJpY2UgPiAwID9cbiAgICAgICAgICAgICcgKCsnICsgU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKG1vZGlmaWVyLmRhdGEucHJpY2UpICsgJyknIDpcbiAgICAgICAgICAgICAgJydcbiAgICAgICAgICApO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmxlZnRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zaG93TGVmdEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoY3VycmVudEluZGV4ID4gMCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vTWFrZSBzdXJlIFBpY2sgMSBtb2RpZmllciBjYXRlZ29yaWVzIGhhdmUgbWV0IHRoZSBzZWxlY3Rpb24gY29uZGl0aW9uLlxuICAgICAgICBpZigkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0uZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0ubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICBpZiAobS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAgICAgLy9UT0RPOiBBZGQgbW9kYWwgcG9wdXAuIE11c3QgbWFrZSAxIHNlbGVjdGlvbiFcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0ID0gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJHNjb3BlLm5leHRDYXRlZ29yeSgpIDogJHNjb3BlLmRvbmUoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yaWdodEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJ05leHQnIDogJ0RvbmUnO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dSaWdodEJ1dHRvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJyZW50SW5kZXgtLTtcbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5uZXh0Q2F0ZWdvcnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG4gICAgICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gZnVuY3Rpb24oY2F0ZWdvcnksIG1vZGlmaWVyKSB7XG4gICAgICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgICAgICBpZiAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBjYXRlZ29yeS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc3VibWl0Q2hhbmdlcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIE9yZGVyTWFuYWdlci5yZW1vdmVGcm9tQ2FydCgkc2NvcGUuZW50cnkpO1xuICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldykge1xuICAgICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZXhpdCgpO1xuICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgICAgIH07XG4gICAgfV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdvQmFjayA9ICgpID0+IE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gIHZhciBNZW51TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUsIGkpID0+IHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcCgocm93LCBpKSA9PiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoe1xuICAgICAgICBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJ1xuICAgICAgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQobWVudSA9PiB7XG4gICAgaWYgKCFtZW51KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLm1lbnUgPSBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBtZW51LmNhdGVnb3JpZXNcbiAgICAgIC5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ2NhdGVnb3J5JyxcbiAgICAgICAgICB0b2tlbjogY2F0ZWdvcnkudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRpdGxlOiBjYXRlZ29yeS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogY2F0ZWdvcnkuaW1hZ2UsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFnZS1tZW51LWNvbnRlbnQnKVxuICAgICk7XG5cbiAgICAkc2NvcGUubWVudSA9IG1lbnU7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIERhdGFNYW5hZ2VyLm1lbnUgPSBsb2NhdGlvbi50eXBlID09PSAnbWVudScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIubWVudSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL25hdmlnYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdNYW5hZ2VtZW50U2VydmljZScsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ29tbWFuZFJlc2V0LCBDb21tYW5kU3VibWl0T3JkZXIsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50Q2xpY2sgPSBpdGVtID0+IHtcbiAgICBpZiAoaXRlbS5ocmVmKSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3VybCcsIHVybDogaXRlbS5ocmVmLnVybCB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQ7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gaXRlbTtcblxuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICRzY29wZS5tZW51T3Blbikge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuYWR2ZXJ0aXNlbWVudHMoKS50aGVuKGRhdGEgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IGRhdGEubWlzY1xuICAgICAgICAubWFwKGFkID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoYWQuc3JjLCAzMDAsIDI1MCksXG4gICAgICAgICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gICRzY29wZS5uYXZpZ2F0ZUJhY2sgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDb21tYW5kRmxpcFNjcmVlbigpO1xuICB9O1xuXG4gICRzY29wZS5vcGVuQ2FydCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9ICFDYXJ0TW9kZWwuaXNDYXJ0T3BlbjtcbiAgfTtcblxuICAkc2NvcGUuc2VhdE5hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZWF0TmFtZSA9IHZhbHVlID8gdmFsdWUubmFtZSA6ICdUYWJsZScpKTtcblxuICAkc2NvcGUucmVzZXRUYWJsZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUubWVudU9wZW4gPSAhJHNjb3BlLm1lbnVPcGVuO1xuXG4gICAgaWYgKCRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudCAmJiAkc2NvcGUubWVudU9wZW4pIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50LnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ID0gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVTZXR0aW5ncyA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSAhJHNjb3BlLnNldHRpbmdzT3BlbjtcbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5jYXJ0Q291bnQgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKGNhcnQgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXJ0Q291bnQgPSBjYXJ0Lmxlbmd0aCk7XG4gIH0pO1xuXG4gICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuXG4gICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLnN1Ym1pdE9yZGVyID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgQ29tbWFuZFN1Ym1pdE9yZGVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnZpZXdPcmRlciA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUucGF5QmlsbCA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZTtcbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZGlzcGxheUJyaWdodG5lc3M6IDEwMCxcbiAgICBzb3VuZFZvbHVtZTogMTAwXG4gIH07XG5cbiAgJHNjb3BlLiR3YXRjaCgnc2V0dGluZ3Muc291bmRWb2x1bWUnLCAodmFsdWUsIG9sZCkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gb2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5zZXRTb3VuZFZvbHVtZSh2YWx1ZSk7XG4gIH0pO1xuICBNYW5hZ2VtZW50U2VydmljZS5nZXRTb3VuZFZvbHVtZSgpLnRoZW4oXG4gICAgcmVzcG9uc2UgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNldHRpbmdzLnNvdW5kVm9sdW1lID0gcmVzcG9uc2Uudm9sdW1lKSxcbiAgICBlID0+IHsgfVxuICApO1xuXG4gICRzY29wZS4kd2F0Y2goJ3NldHRpbmdzLmRpc3BsYXlCcmlnaHRuZXNzJywgKHZhbHVlLCBvbGQpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IG9sZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgTWFuYWdlbWVudFNlcnZpY2Uuc2V0RGlzcGxheUJyaWdodG5lc3ModmFsdWUpO1xuICB9KTtcbiAgTWFuYWdlbWVudFNlcnZpY2UuZ2V0RGlzcGxheUJyaWdodG5lc3MoKS50aGVuKFxuICAgIHJlc3BvbnNlID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5zZXR0aW5ncy5kaXNwbGF5QnJpZ2h0bmVzcyA9IHJlc3BvbnNlLmJyaWdodG5lc3MpLFxuICAgIGUgPT4geyB9XG4gICk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlID0gZGVzdGluYXRpb24gPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJztcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnaXRlbScpIHtcbiAgICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgICAgbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG4gICAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ob21lLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdIb21lQmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSG9tZUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ1N1cnZleU1hbmFnZXInLCAnU05BUENvbmZpZycsICdTTkFQRW52aXJvbm1lbnQnLCAnQ29tbWFuZFJlc2V0JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIFNoZWxsTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBTdXJ2ZXlNYW5hZ2VyLCBTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIENvbW1hbmRSZXNldCkgPT4ge1xuXG4gIHZhciBIb21lTWVudSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IFsgUmVhY3QuRE9NLnRkKHsga2V5OiAtMSB9KSBdO1xuXG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2hvbWUtbWVudS1pdGVtJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLmltZyh7XG4gICAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDE2MCwgMTYwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQocm93cyk7XG4gICAgICByZXN1bHQucHVzaChSZWFjdC5ET00udGQoeyBrZXk6IHJlc3VsdC5sZW5ndGggfSkpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKG51bGwsIHJlc3VsdCk7XG4gICAgfVxuICB9KTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdGlsZXMgPSBbXTtcblxuICAgIHJlc3BvbnNlLm1lbnVzXG4gICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAucmVkdWNlKCh0aWxlcywgbWVudSkgPT4ge1xuICAgICAgaWYgKG1lbnUucHJvbW9zICYmIG1lbnUucHJvbW9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbWVudS5wcm9tb3NcbiAgICAgICAgLmZpbHRlcihwcm9tbyA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBwcm9tby50eXBlICE9PSAzKVxuICAgICAgICAuZm9yRWFjaChwcm9tbyA9PiB7XG4gICAgICAgICAgdGlsZXMucHVzaCh7XG4gICAgICAgICAgICB0aXRsZTogcHJvbW8udGl0bGUsXG4gICAgICAgICAgICBpbWFnZTogcHJvbW8uaW1hZ2UsXG4gICAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgocHJvbW8uZGVzdGluYXRpb24pLFxuICAgICAgICAgICAgZGVzdGluYXRpb246IHByb21vLmRlc3RpbmF0aW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcblxuICAgICAgICB0aWxlcy5wdXNoKHtcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICBpbWFnZTogbWVudS5pbWFnZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH0sIHRpbGVzKTtcblxuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChIb21lTWVudSwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdob21lLW1lbnUtbWFpbicpXG4gICAgICApO1xuICAgIH0sIDEwMDApO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHNjb3BlLnZpc2libGUgPSBsb2NhdGlvbi50eXBlID09PSAnaG9tZSc7XG4gICAgJHRpbWVvdXQoKCkgPT4geyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUucHJlbG9hZCA9IGRlc3RpbmF0aW9uID0+IHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuICB9O1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5wcmVkaWNhdGVFdmVuID0gU2hlbGxNYW5hZ2VyLnByZWRpY2F0ZUV2ZW47XG4gICRzY29wZS5wcmVkaWNhdGVPZGQgPSBTaGVsbE1hbmFnZXIucHJlZGljYXRlT2RkO1xuXG4gICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgPyBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6ICdUYWJsZSc7XG4gIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuc2VhdF9uYW1lID0gdmFsdWUgPyB2YWx1ZS5uYW1lIDogJ1RhYmxlJztcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmN1c3RvbWVyX25hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJfbmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWUpO1xuICB9KTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3QpO1xuICB9O1xuICB2YXIgcmVmcmVzaFN1cnZleSA9ICgpID0+IHtcbiAgICAkc2NvcGUuc3VydmV5QXZhaWxhYmxlID0gU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSAmJiAhU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaENsb3Nlb3V0UmVxdWVzdCk7XG4gIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmFkZChyZWZyZXNoU3VydmV5KTtcbiAgU3VydmV5TWFuYWdlci5tb2RlbC5zdXJ2ZXlDb21wbGV0ZWQuYWRkKHJlZnJlc2hTdXJ2ZXkpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcbiAgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCgpO1xuICByZWZyZXNoU3VydmV5KCk7XG5cbiAgJHNjb3BlLmNoYXRBdmFpbGFibGUgPSBCb29sZWFuKFNOQVBDb25maWcuY2hhdCk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dCA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQ0xPU0VPVVQpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RDbG9zZW91dCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5TdXJ2ZXkgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUuc3VydmV5QXZhaWxhYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdzdXJ2ZXknIH07XG4gIH07XG5cbiAgJHNjb3BlLnNlYXRDbGlja2VkID0gKCkgPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY3VzdG9tZXJDbGlja2VkID0gKCkgPT4ge1xuICAgIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNHdWVzdCkge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdhY2NvdW50JyB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DaGF0ID0gKCkgPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaXRlbS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignSXRlbUJhc2VDdHJsJyxcbiAgWyckc2NvcGUnLCAoJHNjb3BlKSA9PiB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FuYWx5dGljc01vZGVsJywgJ0N1c3RvbWVyTW9kZWwnLCAnRGF0YU1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU2hlbGxNYW5hZ2VyJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JywgJ0NoYXRNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICB2YXIgSXRlbUltYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUmVhY3QuRE9NLmltZyh7XG4gICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRoaXMucHJvcHMubWVkaWEsIDYwMCwgNjAwKVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaXRlbSA9IGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5pdGVtKTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuaXRlbUNoYW5nZWQuYWRkKHJlc3BvbnNlID0+IHtcbiAgICBpZiAoIXJlc3BvbnNlICYmICgkc2NvcGUud2Vic2l0ZVVybCB8fCAkc2NvcGUuZmxhc2hVcmwpKSB7XG4gICAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLndlYnNpdGVVcmwgPSBudWxsO1xuICAgICRzY29wZS5mbGFzaFVybCA9IG51bGw7XG5cbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBudWxsO1xuXG4gICAgICBpZiAoJHNjb3BlLnR5cGUgPT09IDEpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0tcGhvdG8nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnR5cGUgPSAxO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdHlwZSA9IHJlc3BvbnNlLnR5cGU7XG5cbiAgICBpZiAodHlwZSA9PT0gMiAmJiByZXNwb25zZS53ZWJzaXRlKSB7XG4gICAgICAkc2NvcGUud2Vic2l0ZVVybCA9IHJlc3BvbnNlLndlYnNpdGUudXJsO1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKCRzY29wZS53ZWJzaXRlVXJsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gMyAmJiByZXNwb25zZS5mbGFzaCkge1xuICAgICAgdmFyIHVybCA9ICcvZmxhc2gjdXJsPScgKyBlbmNvZGVVUklDb21wb25lbnQoZ2V0TWVkaWFVcmwocmVzcG9uc2UuZmxhc2gubWVkaWEsIDAsIDAsICdzd2YnKSkgK1xuICAgICAgICAnJndpZHRoPScgKyBlbmNvZGVVUklDb21wb25lbnQocmVzcG9uc2UuZmxhc2gud2lkdGgpICtcbiAgICAgICAgJyZoZWlnaHQ9JyArIGVuY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5mbGFzaC5oZWlnaHQpO1xuICAgICAgJHNjb3BlLmZsYXNoVXJsID0gV2ViQnJvd3Nlci5nZXRBcHBVcmwodXJsKTtcbiAgICAgIFdlYkJyb3dzZXIub3Blbigkc2NvcGUuZmxhc2hVcmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAkc2NvcGUuZW50cnkgPSBuZXcgYXBwLkNhcnRJdGVtKHJlc3BvbnNlLCAxKTtcblxuICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEl0ZW1JbWFnZSwgeyBtZWRpYTogJHNjb3BlLmVudHJ5Lml0ZW0uaW1hZ2UgfSksXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtLXBob3RvJylcbiAgICAgICk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnR5cGUgPSB0eXBlO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiB2YWx1ZSA/IFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZSh2YWx1ZSkgOiAwO1xuXG4gICRzY29wZS5hZGRUb0NhcnQgPSAoKSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBlbnRyeSA9ICRzY29wZS5lbnRyeTtcblxuICAgIGlmIChlbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgIENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCB0cnVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KGVudHJ5KTtcbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsR2lmdCA9ICgpID0+IENoYXRNYW5hZ2VyLmNhbmNlbEdpZnQoKTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2l0ZW1lZGl0LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtRWRpdEN0cmwnLFxuICBbJyRzY29wZScsICdTaGVsbE1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsXG4gICgkc2NvcGUsIFNoZWxsTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgQ2FydE1vZGVsKSA9PiB7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcblxuICB2YXIgY3VycmVudEluZGV4ID0gLTE7XG5cbiAgdmFyIHJlZnJlc2hOYXZpZ2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5lbnRyeSAmJiAkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAkc2NvcGUuaGFzTmV4dENhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggPiAxICYmXG4gICAgICAgIGN1cnJlbnRJbmRleCA8ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoIC0gMTtcbiAgICAgICRzY29wZS5oYXNQcmV2aW91c0NhdGVnb3J5ID0gY3VycmVudEluZGV4ID4gMDtcbiAgICAgICRzY29wZS5jYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XTtcbiAgICAgICRzY29wZS5jYW5FeGl0ID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldztcbiAgICAgICRzY29wZS5jYW5Eb25lID0gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBpZiAobG9jYXRpb24udHlwZSAhPT0gJ21lbnUnICYmIGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICRzY29wZS5leGl0KCk7XG4gICAgfVxuICB9KTtcblxuICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbkNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAkc2NvcGUuZXhpdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGluaXQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICRzY29wZS5lbnRyeSA9IHZhbHVlO1xuICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmVudHJ5ICE9IG51bGw7XG5cbiAgICBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICBpbml0KENhcnRNb2RlbC5lZGl0YWJsZUl0ZW0pO1xuXG4gIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgIGluaXQodmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0TW9kaWZpZXJUaXRsZSA9IGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgcmV0dXJuIG1vZGlmaWVyLmRhdGEudGl0bGUgKyAobW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgJyAoKycgKyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UobW9kaWZpZXIuZGF0YS5wcmljZSkgKyAnKScgOlxuICAgICAgJydcbiAgICApO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uQ2xpY2sgPSBmdW5jdGlvbigpe1xuICAgIHZhciByZXN1bHQgPSAoY3VycmVudEluZGV4ID4gMCkgPyAoJHNjb3BlLnByZXZpb3VzQ2F0ZWdvcnkoKSkgOiAkc2NvcGUuZXhpdCgpO1xuICB9O1xuXG4gICRzY29wZS5sZWZ0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKSA/ICdCYWNrJyA6ICdFeGl0JztcbiAgfTtcblxuICAkc2NvcGUucmlnaHRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgLy9NYWtlIHN1cmUgUGljayAxIG1vZGlmaWVyIGNhdGVnb3JpZXMgaGF2ZSBtZXQgdGhlIHNlbGVjdGlvbiBjb25kaXRpb24uXG4gICAgaWYoJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICB2YXIgbnVtU2VsZWN0ZWQgPSAwO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgaWYgKG0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgIG51bVNlbGVjdGVkKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZihudW1TZWxlY3RlZCAhPT0gMSkge1xuICAgICAgICAvL1RPRE86IEFkZCBtb2RhbCBwb3B1cC4gTXVzdCBtYWtlIDEgc2VsZWN0aW9uIVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3VsdCA9ICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICRzY29wZS5uZXh0Q2F0ZWdvcnkoKSA6ICRzY29wZS5kb25lKCk7XG4gIH07XG5cbiAgJHNjb3BlLnJpZ2h0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KSA/ICdOZXh0JyA6ICdEb25lJztcbiAgfTtcblxuICAkc2NvcGUucHJldmlvdXNDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleC0tO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgIGN1cnJlbnRJbmRleCsrO1xuICAgIHJlZnJlc2hOYXZpZ2F0aW9uKCk7XG4gIH07XG5cbiAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IGZ1bmN0aW9uKGNhdGVnb3J5LCBtb2RpZmllcikge1xuICAgIG1vZGlmaWVyLmlzU2VsZWN0ZWQgPSAhbW9kaWZpZXIuaXNTZWxlY3RlZDtcblxuICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkICYmIGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICBhbmd1bGFyLmZvckVhY2goY2F0ZWdvcnkubW9kaWZpZXJzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIG0uaXNTZWxlY3RlZCA9IG0gPT09IG1vZGlmaWVyO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1OZXcpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmV4aXQoKTtcbiAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICBDYXJ0TW9kZWwuY2xvc2VFZGl0b3IoKTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbmF1eC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWFpbkF1eEN0cmwnLCBbJyRzY29wZScsICdDb21tYW5kU3RhcnR1cCcsIGZ1bmN0aW9uKCRzY29wZSwgQ29tbWFuZFN0YXJ0dXApIHtcbiAgQ29tbWFuZFN0YXJ0dXAoKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbWFpbnNuYXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01haW5TbmFwQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FwcENhY2hlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdBY3Rpdml0eU1vbml0b3InLCAnQ2hhdE1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0RhdGFNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU29mdHdhcmVNYW5hZ2VyJywgJ1NOQVBDb25maWcnLCAnQ29tbWFuZFN0YXJ0dXAnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQXBwQ2FjaGUsIEN1c3RvbWVyTWFuYWdlciwgQWN0aXZpdHlNb25pdG9yLCBDaGF0TWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsLCBOYXZpZ2F0aW9uTWFuYWdlciwgU29mdHdhcmVNYW5hZ2VyLCBTTkFQQ29uZmlnLCBDb21tYW5kU3RhcnR1cCkgPT4ge1xuXG4gIENvbW1hbmRTdGFydHVwKCk7XG5cbiAgJHNjb3BlLnRvdWNoID0gKCkgPT4gQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQpKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuY2hhdFJlcXVlc3RSZWNlaXZlZC5hZGQodG9rZW4gPT4ge1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKHRva2VuKSArICcgd291bGQgbGlrZSB0byBjaGF0IHdpdGggeW91LicpLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuYXBwcm92ZURldmljZSh0b2tlbik7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgfSwgKCkgPT4gQ2hhdE1hbmFnZXIuZGVjbGluZURldmljZSh0b2tlbikpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVxdWVzdFJlY2VpdmVkLmFkZCgodG9rZW4sIGRlc2NyaXB0aW9uKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUodG9rZW4pICsgJyB3b3VsZCBsaWtlIHRvIGdpZnQgeW91IGEgJyArIGRlc2NyaXB0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgIENoYXRNYW5hZ2VyLmFjY2VwdEdpZnQodG9rZW4pO1xuICAgIH0sICgpID0+IENoYXRNYW5hZ2VyLmRlY2xpbmVHaWZ0KHRva2VuKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLm1lc3NhZ2VSZWNlaXZlZC5hZGQobWVzc2FnZSA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydCgnQ2hhdCB3aXRoICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBkZWNsaW5lZC4gJyArXG4gICAgICAnVG8gc3RvcCByZWNpZXZpbmcgY2hhdCByZXF1ZXN0cywgb3BlbiB0aGUgY2hhdCBzY3JlZW4gYW5kIHRvdWNoIHRoZSBcIkNoYXQgb24vb2ZmXCIgYnV0dG9uLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoJ1lvdXIgY2hhdCByZXF1ZXN0IHRvICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIHdhcyBhY2NlcHRlZC4nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGFjY2VwdGVkIHlvdXIgZ2lmdC4gVGhlIGl0ZW0gd2lsbCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgZGVjbGluZWQgeW91ciBnaWZ0LiBUaGUgaXRlbSB3aWxsIE5PVCBiZSBhZGRlZCB0byB5b3VyIGNoZWNrLicpO1xuICAgIH1cblxuICAgIGlmIChOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi50eXBlID09PSAnY2hhdCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgaGFzIGNsb3NlZCB0aGUgY2hhdCcpO1xuICAgIH1cbiAgICBlbHNlIGlmKCFtZXNzYWdlLnN0YXR1cyAmJiBtZXNzYWdlLnRvX2RldmljZSkge1xuICAgICAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb24oJ05ldyBtZXNzYWdlIGZyb20gJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSk7XG4gICAgfVxuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0UmVhZHkuYWRkKCgpID0+IHtcbiAgICBDaGF0TWFuYWdlci5zZW5kR2lmdChPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0KTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRBY2NlcHRlZC5hZGQoc3RhdHVzID0+IHtcbiAgICBpZiAoIXN0YXR1cyB8fCAhQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdERldmljZSkge1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG5cbiAgICAgICAgQ2hhdE1hbmFnZXIuZW5kR2lmdCgpO1xuICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoYXQnIH07XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tZW51LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNZW51QmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIpID0+IHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01lbnVDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIE1lbnVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGlsZUNsYXNzTmFtZSA9IFNoZWxsTWFuYWdlci50aWxlU3R5bGU7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKGZ1bmN0aW9uKHRpbGUsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiB0aWxlQ2xhc3NOYW1lLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogJ3VybCgnICsgU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDM3MCwgMzcwKSArICcpJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KS5yZWR1Y2UoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgaSkge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgICByZXR1cm4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7IGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICBEYXRhTWFuYWdlci5tZW51ID0gbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLm1lbnUpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5tZW51Q2hhbmdlZC5hZGQoZnVuY3Rpb24obWVudSkge1xuICAgIGlmICghbWVudSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG1lbnUuY2F0ZWdvcmllcy5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgdGlsZS51cmwgPSAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKHRpbGUuZGVzdGluYXRpb24pO1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChNZW51TGlzdCwgeyB0aWxlczogbWVudS5jYXRlZ29yaWVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQtbWVudScpXG4gICAgKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21vZGFsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNb2RhbEN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERpYWxvZ01hbmFnZXIpID0+IHtcblxuICAgIERpYWxvZ01hbmFnZXIubW9kYWxTdGFydGVkLmFkZCgoKSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUudmlzaWJsZSA9IHRydWUpKTtcbiAgICBEaWFsb2dNYW5hZ2VyLm1vZGFsRW5kZWQuYWRkKCgpID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS52aXNpYmxlID0gZmFsc2UpKTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbmF2aWdhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTmF2aWdhdGlvbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FuYWx5dGljc01vZGVsJywgJ0NhcnRNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0NvbW1hbmRSZXNldCcsICdDb21tYW5kRmxpcFNjcmVlbicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEN1c3RvbWVyTWFuYWdlciwgQW5hbHl0aWNzTW9kZWwsIENhcnRNb2RlbCwgU2hlbGxNYW5hZ2VyLCBEYXRhTWFuYWdlciwgRGF0YVByb3ZpZGVyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRGbGlwU2NyZWVuLCBXZWJCcm93c2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcblxuICAkc2NvcGUubWVudXMgPSBbXTtcblxuICBEYXRhUHJvdmlkZXIuaG9tZSgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbG9jYXRpb24gPSBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbixcbiAgICAgICAgbGltaXQgPSBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyA/IDQgOiAzO1xuXG4gICAgJHNjb3BlLm1lbnVzID0gcmVzcG9uc2UubWVudXNcbiAgICAgIC5maWx0ZXIobWVudSA9PiBTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJyB8fCBtZW51LnR5cGUgIT09IDMpXG4gICAgICAuZmlsdGVyKChtZW51LCBpKSA9PiBpIDwgbGltaXQpXG4gICAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7XG4gICAgICAgICAgdHlwZTogJ21lbnUnLFxuICAgICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW4sXG4gICAgICAgICAgdGl0bGU6IG1lbnUudGl0bGUsXG4gICAgICAgICAgdXJsOiAnIycgKyBOYXZpZ2F0aW9uTWFuYWdlci5nZXRQYXRoKGRlc3RpbmF0aW9uKSxcbiAgICAgICAgICBkZXN0aW5hdGlvbjogZGVzdGluYXRpb24sXG4gICAgICAgICAgc2VsZWN0ZWQ6IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlblxuICAgICAgICB9O1xuICAgICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZUhvbWUgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLm5hdmlnYXRlQmFjayA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gIH07XG5cbiAgJHNjb3BlLnJvdGF0ZVNjcmVlbiA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIENvbW1hbmRGbGlwU2NyZWVuKCk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DYXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gIUNhcnRNb2RlbC5pc0NhcnRPcGVuO1xuICB9O1xuXG4gICRzY29wZS5vcGVuU2V0dGluZ3MgPSAoKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5tZW51T3BlbiA9IGZhbHNlO1xuXG4gICRzY29wZS50b2dnbGVNZW51ID0gKCkgPT4ge1xuICAgICRzY29wZS5tZW51T3BlbiA9ICEkc2NvcGUubWVudU9wZW47XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgIHR5cGU6ICdjbGljaydcbiAgICB9KTtcblxuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50SW1wcmVzc2lvbiA9IGl0ZW0gPT4ge1xuICAgIGlmIChBY3Rpdml0eU1vbml0b3IuYWN0aXZlICYmICEkc2NvcGUud2lkZSkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgICB0eXBlOiAnaW1wcmVzc2lvbidcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuZWxlbWVudHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuZWxlbWVudHM7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50c0NoYW5nZWQuYWRkKHZhbHVlID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZWxlbWVudHMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50c0FsbCA9IFtdO1xuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AgPSBbXTtcbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQm90dG9tID0gW107XG4gIHZhciBtYXBBZHZlcnRpc2VtZW50ID0gYWQgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDk3MCwgOTApLFxuICAgICAgaHJlZjogYWQuaHJlZixcbiAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoYWQuc3JjKSxcbiAgICAgIHRva2VuOiBhZC50b2tlblxuICAgIH07XG4gIH07XG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcCA9IHJlc3BvbnNlLnRvcC5tYXAobWFwQWR2ZXJ0aXNlbWVudCk7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20gPSByZXNwb25zZS5ib3R0b20ubWFwKG1hcEFkdmVydGlzZW1lbnQpO1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQWxsID0gJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wLmNvbmNhdCgkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20pO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuY2FydENvdW50ID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGg7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnRDaGFuZ2VkLmFkZChjYXJ0ID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2FydENvdW50ID0gY2FydC5sZW5ndGgpO1xuICB9KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICB2YXIgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSA9ICFCb29sZWFuKE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCk7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuXG4gICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5uYXZpZ2F0ZSA9IGRlc3RpbmF0aW9uID0+IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLm1lbnVzLmZvckVhY2gobWVudSA9PiB7XG4gICAgICAgIC8vbWVudS5zZWxlY3RlZCA9IChsb2NhdGlvbi50eXBlID09PSAnbWVudScgJiYgbWVudS50b2tlbiA9PT0gbG9jYXRpb24udG9rZW4pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9ub3RpZmljYXRpb24uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ05vdGlmaWNhdGlvbkN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEaWFsb2dNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlcikge1xuICB2YXIgdGltZXI7XG5cbiAgJHNjb3BlLm1lc3NhZ2VzID0gW107XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc1Zpc2libGUpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gaXNWaXNpYmxlO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGlkZU5leHQoKSB7XG4gICAgdmFyIG1lc3NhZ2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8ICRzY29wZS5tZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbWVzc2FnZXMucHVzaCgkc2NvcGUubWVzc2FnZXNbaV0pO1xuICAgIH1cblxuICAgICRzY29wZS5tZXNzYWdlcyA9IG1lc3NhZ2VzO1xuXG4gICAgaWYgKCRzY29wZS5tZXNzYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRpbWVyID0gJHRpbWVvdXQoaGlkZU5leHQsIDQwMDApO1xuICB9XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvblJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2VzLnB1c2goeyB0ZXh0OiBtZXNzYWdlIH0pO1xuICAgIH0pO1xuXG4gICAgdXBkYXRlVmlzaWJpbGl0eSh0cnVlKTtcblxuICAgIGlmICh0aW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9XG5cbiAgICB0aW1lciA9ICR0aW1lb3V0KGhpZGVOZXh0LCA0MDAwKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3NjcmVlbnNhdmVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTY3JlZW5zYXZlckN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLCAnQWN0aXZpdHlNb25pdG9yJywgJ0RhdGFQcm92aWRlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBTaGVsbE1hbmFnZXIsIEFjdGl2aXR5TW9uaXRvciwgRGF0YVByb3ZpZGVyKSA9PiB7XG4gICAgXG4gICRzY29wZS52aXNpYmxlID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gc2hvd0ltYWdlcyh2YWx1ZXMpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pbWFnZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0ubWVkaWEsIDE5MjAsIDEwODAsICdqcGcnKSxcbiAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGl0ZW0ubWVkaWEpXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNob3dJbWFnZXMoU2hlbGxNYW5hZ2VyLm1vZGVsLnNjcmVlbnNhdmVycyk7XG4gIFNoZWxsTWFuYWdlci5tb2RlbC5zY3JlZW5zYXZlcnNDaGFuZ2VkLmFkZChzaG93SW1hZ2VzKTtcblxuICBBY3Rpdml0eU1vbml0b3IuYWN0aXZlQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS52aXNpYmxlID0gdmFsdWUgPT09IGZhbHNlICYmICgkc2NvcGUuaW1hZ2VzICYmICRzY29wZS5pbWFnZXMubGVuZ3RoID4gMCk7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zaWduaW4uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1NpZ25JbkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTZXNzaW9uTWFuYWdlcicsICdTb2NpYWxNYW5hZ2VyJywgJ1NOQVBDb25maWcnLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTZXNzaW9uTWFuYWdlciwgU29jaWFsTWFuYWdlciwgU05BUENvbmZpZywgV2ViQnJvd3NlcikgPT4ge1xuXG4gIHZhciBTVEVQX1NQTEFTSCA9IDEsXG4gICAgICBTVEVQX0xPR0lOID0gMixcbiAgICAgIFNURVBfUkVHSVNUUkFUSU9OID0gMyxcbiAgICAgIFNURVBfR1VFU1RTID0gNCxcbiAgICAgIFNURVBfRVZFTlQgPSA1LFxuICAgICAgU1RFUF9SRVNFVCA9IDY7XG5cbiAgJHNjb3BlLlNURVBfU1BMQVNIID0gU1RFUF9TUExBU0g7XG4gICRzY29wZS5TVEVQX0xPR0lOID0gU1RFUF9MT0dJTjtcbiAgJHNjb3BlLlNURVBfUkVHSVNUUkFUSU9OID0gU1RFUF9SRUdJU1RSQVRJT047XG4gICRzY29wZS5TVEVQX0dVRVNUUyA9IFNURVBfR1VFU1RTO1xuICAkc2NvcGUuU1RFUF9FVkVOVCA9IFNURVBfRVZFTlQ7XG4gICRzY29wZS5TVEVQX1JFU0VUID0gU1RFUF9SRVNFVDtcblxuICAkc2NvcGUubG9jYXRpb25OYW1lID0gU05BUENvbmZpZy5sb2NhdGlvbl9uYW1lO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTG9naW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5sb2dpbiA9ICgpID0+IHtcbiAgICAkc2NvcGUuY3JlZGVudGlhbHMgPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfTE9HSU47XG4gIH07XG5cbiAgJHNjb3BlLmd1ZXN0TG9naW4gPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5ndWVzdExvZ2luKCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5kb0xvZ2luID0gKGNyZWRlbnRpYWxzKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbihjcmVkZW50aWFscyB8fCAkc2NvcGUuY3JlZGVudGlhbHMpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0dFTkVSSUNfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgU29jaWFsIGxvZ2luXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUubG9naW5GYWNlYm9vayA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgU29jaWFsTWFuYWdlci5sb2dpbkZhY2Vib29rKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpblR3aXR0ZXIgPSAoKSA9PiB7XG4gICAgc29jaWFsQnVzeSgpO1xuICAgIFNvY2lhbE1hbmFnZXIubG9naW5Ud2l0dGVyKCkudGhlbihzb2NpYWxMb2dpbiwgc29jaWFsRXJyb3IpO1xuICB9O1xuXG4gICRzY29wZS5sb2dpbkdvb2dsZSA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgU29jaWFsTWFuYWdlci5sb2dpbkdvb2dsZVBsdXMoKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBSZWdpc3RyYXRpb25cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5yZWdpc3RlciA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVnaXN0cmF0aW9uID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1JFR0lTVFJBVElPTjtcbiAgfTtcblxuICAkc2NvcGUuZG9SZWdpc3RyYXRpb24gPSAoKSA9PiB7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICRzY29wZS5yZWdpc3RyYXRpb24udXNlcm5hbWUgPSAkc2NvcGUucmVnaXN0cmF0aW9uLmVtYWlsO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnNpZ25VcCgkc2NvcGUucmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLmRvTG9naW4oe1xuICAgICAgICAgIGxvZ2luOiAkc2NvcGUucmVnaXN0cmF0aW9uLnVzZXJuYW1lLFxuICAgICAgICAgIHBhc3N3b3JkOiAkc2NvcGUucmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEd1ZXN0IGNvdW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuc2Vzc2lvbiA9IHtcbiAgICBndWVzdENvdW50OiAxLFxuICAgIHNwZWNpYWw6IGZhbHNlXG4gIH07XG5cbiAgJHNjb3BlLnN1Ym1pdEd1ZXN0Q291bnQgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zZXNzaW9uLmd1ZXN0Q291bnQgPiAxKSB7XG4gICAgICBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50ID0gJHNjb3BlLnNlc3Npb24uZ3Vlc3RDb3VudDtcbiAgICAgICRzY29wZS5zdGVwID0gU1RFUF9FVkVOVDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbmRTaWduSW4oKTtcbiAgICB9XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBFdmVudFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnN1Ym1pdFNwZWNpYWxFdmVudCA9ICh2YWx1ZSkgPT4ge1xuICAgICRzY29wZS5zZXNzaW9uLnNwZWNpYWwgPSBTZXNzaW9uTWFuYWdlci5zcGVjaWFsRXZlbnQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICBlbmRTaWduSW4oKTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlc2V0IHBhc3N3b3JkXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucmVzZXRQYXNzd29yZCA9ICgpID0+IHtcbiAgICAkc2NvcGUucGFzc3dvcmRyZXNldCA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9SRVNFVDtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRSZXNldFN1Ym1pdCA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnJlc2V0UGFzc3dvcmQoJHNjb3BlLnBhc3N3b3JkcmVzZXQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5wYXNzd29yZFJlc2V0ID0gZmFsc2U7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1BBU1NXT1JEX1JFU0VUX0NPTVBMRVRFKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkUmVzZXRDYW5jZWwgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1NQTEFTSDtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZnVuY3Rpb24gc29jaWFsTG9naW4oYXV0aCkge1xuICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpblNvY2lhbChhdXRoKS50aGVuKCgpID0+IHtcbiAgICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5zdGVwID0gU1RFUF9HVUVTVFMpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfR0VORVJJQ19FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxFcnJvcigpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG4gICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9HRU5FUklDX0VSUk9SKTtcbiAgfVxuXG4gIHZhciBzb2NpYWxKb2IsIHNvY2lhbFRpbWVyO1xuXG4gIGZ1bmN0aW9uIHNvY2lhbEJ1c3koKSB7XG4gICAgc29jaWFsQnVzeUVuZCgpO1xuXG4gICAgc29jaWFsSm9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgIHNvY2lhbFRpbWVyID0gJHRpbWVvdXQoc29jaWFsQnVzeUVuZCwgMTIwICogMTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzb2NpYWxCdXN5RW5kKCkge1xuICAgIGlmIChzb2NpYWxKb2IpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKHNvY2lhbEpvYik7XG4gICAgICBzb2NpYWxKb2IgPSBudWxsO1xuICAgIH1cblxuICAgIGlmIChzb2NpYWxUaW1lcikge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHNvY2lhbFRpbWVyKTtcbiAgICAgIHNvY2lhbFRpbWVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbmRTaWduSW4oKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgIHJldHVybiBlbmRTaWduSW4oKTtcbiAgfVxuXG4gICRzY29wZS5pbml0aWFsaXplZCA9IHRydWU7XG4gICRzY29wZS5zdGVwID0gU1RFUF9TUExBU0g7XG5cbiAgdmFyIG1vZGFsID0gRGlhbG9nTWFuYWdlci5zdGFydE1vZGFsKCk7XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgV2ViQnJvd3Nlci5jbG9zZSgpO1xuICAgIERpYWxvZ01hbmFnZXIuZW5kTW9kYWwobW9kYWwpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc3VydmV5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdTdXJ2ZXlDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0N1c3RvbWVyTW9kZWwnLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1hbmFnZXIsIEN1c3RvbWVyTW9kZWwsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIFN1cnZleU1hbmFnZXIpIHtcblxuICBpZiAoIVN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkIHx8ICFTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5IHx8IFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5jb21tZW50ID0gJyc7XG4gICRzY29wZS5lbWFpbCA9ICcnO1xuICAkc2NvcGUuaGFkX3Byb2JsZW1zID0gZmFsc2U7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQYWdlc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VzID0gW107XG4gIHZhciBwYWdlcyA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwYWdlcycpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgSW5kZXhcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlSW5kZXggPSAtMTtcbiAgdmFyIHBhZ2VJbmRleCA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwYWdlSW5kZXgnKTtcbiAgcGFnZUluZGV4LmNoYW5nZXMoKVxuICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucGFnZSA9ICRzY29wZS5wYWdlSW5kZXggPiAtMSA/ICRzY29wZS5wYWdlc1skc2NvcGUucGFnZUluZGV4XSA6IHsgcXVlc3Rpb25zOiBbXSB9O1xuXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnBhZ2UuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgaWYgKGl0ZW0udHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICQoJyNyYXRlLScgKyBpdGVtLnRva2VuKS5yYXRlaXQoe1xuICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgbWF4OiA1LFxuICAgICAgICAgICAgc3RlcDogMSxcbiAgICAgICAgICAgIHJlc2V0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNraW5nZmxkOiAnI3JhbmdlLScgKyBpdGVtLnRva2VuXG4gICAgICAgICAgfSkuYmluZCgncmF0ZWQnLCBmdW5jdGlvbihldmVudCwgdmFsdWUpIHtcbiAgICAgICAgICAgIGl0ZW0uZmVlZGJhY2sgPSB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENvdW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZUNvdW50ID0gMDtcbiAgcGFnZXMuY2hhbmdlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wYWdlQ291bnQgPSAkc2NvcGUucGFnZXMubGVuZ3RoO1xuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgZ2VuZXJhdGVQYXNzd29yZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSA4LFxuICAgICAgICBjaGFyc2V0ID0gJ2FiY2RlZmdoa25wcXJzdHV2d3h5ekFCQ0RFRkdIS01OUFFSU1RVVldYWVoyMzQ1Njc4OScsXG4gICAgICAgIHJlc3VsdCA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gY2hhcnNldC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IGNoYXJzZXQuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG4pKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgc3VibWl0RmVlZGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGFnZXMucmVkdWNlKChhbnN3ZXJzLCBwYWdlKSA9PiB7XG4gICAgICByZXR1cm4gcGFnZS5yZWR1Y2UoKGFuc3dlcnMsIHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KHF1ZXN0aW9uLmZlZWRiYWNrKTtcblxuICAgICAgICBpZiAodmFsdWUgPiAwKSB7XG4gICAgICAgICAgYW5zd2Vycy5wdXNoKHtcbiAgICAgICAgICAgIHN1cnZleTogU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleS50b2tlbixcbiAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi50b2tlbixcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFuc3dlcnM7XG4gICAgICB9LCBhbnN3ZXJzKTtcbiAgICB9LCBbXSlcbiAgICAuZm9yRWFjaChhbnN3ZXIgPT4gQW5hbHl0aWNzTW9kZWwubG9nQW5zd2VyKGFuc3dlcikpO1xuXG4gICAgaWYgKCRzY29wZS5jb21tZW50ICYmICRzY29wZS5jb21tZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0NvbW1lbnQoe1xuICAgICAgICB0eXBlOiAnZmVlZGJhY2snLFxuICAgICAgICB0ZXh0OiAkc2NvcGUuY29tbWVudFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlID0gdHJ1ZTtcblxuICAgIGlmICgkc2NvcGUuaGFkX3Byb2JsZW1zICYmICFPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpIHtcbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpO1xuICAgIH1cblxuICAgIGlmIChDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLmVtYWlsICYmICRzY29wZS5lbWFpbC5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgdmFyIHBhc3N3b3JkID0gZ2VuZXJhdGVQYXNzd29yZCgpO1xuXG4gICAgICBDdXN0b21lck1hbmFnZXIubG9naW4oe1xuICAgICAgICBlbWFpbDogJHNjb3BlLmVtYWlsLFxuICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbih7XG4gICAgICAgICAgbG9naW46ICRzY29wZS5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICB9XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGFnZUluZGV4ID4gMCkge1xuICAgICAgJHNjb3BlLnBhZ2VJbmRleC0tO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUubmV4dFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnBhZ2VJbmRleCA8ICRzY29wZS5wYWdlQ291bnQgLSAxKSB7XG4gICAgICAkc2NvcGUucGFnZUluZGV4Kys7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJHNjb3BlLm5leHRTdGVwKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5uZXh0U3RlcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLnN0ZXAgPCAzKSB7XG4gICAgICAkc2NvcGUuc3RlcCsrO1xuICAgIH1cbiAgICBlbHNlIGlmICghQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0ICYmICRzY29wZS5zdGVwIDwgMikge1xuICAgICAgJHNjb3BlLnN0ZXArKztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzdWJtaXRGZWVkYmFjaygpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc3VibWl0UHJvYmxlbSA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICAgICRzY29wZS5oYWRfcHJvYmxlbXMgPSBCb29sZWFuKHN0YXR1cyk7XG4gICAgJHNjb3BlLm5leHRTdGVwKCk7XG4gIH07XG5cbiAgJHNjb3BlLmV4aXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnN0ZXAgPiAwKSB7XG4gICAgICBzdWJtaXRGZWVkYmFjaygpO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGFnZTtcblxuICAgICRzY29wZS5oYXNfZW1haWwgPSBDdXN0b21lck1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuXG4gICAgZnVuY3Rpb24gYnVpbGRTdXJ2ZXkoKSB7XG4gICAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5LnF1ZXN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKGl0ZW0udHlwZSAhPT0gMSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFnZSB8fCBwYWdlLmxlbmd0aCA+IDQpIHtcbiAgICAgICAgICBwYWdlID0gW107XG4gICAgICAgICAgJHNjb3BlLnBhZ2VzLnB1c2gocGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtLmZlZWRiYWNrID0gMDtcbiAgICAgICAgcGFnZS5wdXNoKGl0ZW0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKFN1cnZleU1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkpIHtcbiAgICAgIGJ1aWxkU3VydmV5KCk7XG4gICAgfVxuXG4gICAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNoYW5nZWQuYWRkKCgpID0+IGJ1aWxkU3VydmV5KCkpO1xuXG4gICAgJHNjb3BlLnBhZ2VJbmRleCA9IDA7XG4gICAgJHNjb3BlLnN0ZXAgPSAwO1xuICB9KSgpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy91cmwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1VybEN0cmwnLFxuICBbJyRzY29wZScsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgTmF2aWdhdGlvbk1hbmFnZXIsIFdlYkJyb3dzZXIpID0+IHtcblxuICBXZWJCcm93c2VyLm9wZW4oTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24udXJsKTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy93ZWIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1dlYkN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdBY3Rpdml0eU1vbml0b3InLCAnV2ViQnJvd3NlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIFdlYkJyb3dzZXIpID0+IHtcblxuICAkc2NvcGUubmF2aWdhdGVkID0gZSA9PiBXZWJCcm93c2VyLm5hdmlnYXRlZChlLnRhcmdldC5zcmMpO1xuXG4gIFdlYkJyb3dzZXIub25PcGVuLmFkZCh1cmwgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5lbmFibGVkID0gZmFsc2U7XG5cbiAgICBpZiAoIVdlYkJyb3dzZXIuaXNFeHRlcm5hbCkge1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuYnJvd3NlclVybCA9IHVybDtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBXZWJCcm93c2VyLm9uQ2xvc2UuYWRkKCgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuZW5hYmxlZCA9IHRydWU7XG5cbiAgICBpZiAoIVdlYkJyb3dzZXIuaXNFeHRlcm5hbCkge1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuYnJvd3NlclVybCA9IFdlYkJyb3dzZXIuZ2V0QXBwVXJsKCcvYmxhbmsnKTtcbiAgICAgICAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvX2Jhc2UuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycsIFsnYW5ndWxhci1iYWNvbiddKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9nYWxsZXJ5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnZ2FsbGVyeScsIFtcbiAgJ0FjdGl2aXR5TW9uaXRvcicsICdTaGVsbE1hbmFnZXInLCAnJHRpbWVvdXQnLFxuICAoQWN0aXZpdHlNb25pdG9yLCBTaGVsbE1hbmFnZXIsICR0aW1lb3V0KSA9PiB7XG5cbiAgdmFyIHNsaWRlcixcbiAgICAgIHNldHRpbmdzID0ge1xuICAgICAgICBtb2RlOiAnZmFkZScsXG4gICAgICAgIHdyYXBwZXJDbGFzczogJ3Bob3RvLWdhbGxlcnknXG4gICAgICB9O1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiBmYWxzZSxcbiAgICBzY29wZToge1xuICAgICAgaW1hZ2VzOiAnPScsXG4gICAgICBpbWFnZXdpZHRoIDogJz0/JyxcbiAgICAgIGltYWdlaGVpZ2h0OiAnPT8nXG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ2dhbGxlcnknKSxcbiAgICBsaW5rOiAoc2NvcGUsIGVsZW0sIGF0dHJzKSA9PiB7XG4gICAgICBlbGVtLnJlYWR5KCgpID0+IHtcbiAgICAgICAgc2xpZGVyID0gJCgnLmJ4c2xpZGVyJywgZWxlbSkuYnhTbGlkZXIoc2V0dGluZ3MpO1xuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnaW1hZ2VzJywgKCkgPT4ge1xuICAgICAgICBzY29wZS5tZWRpYXMgPSAoc2NvcGUuaW1hZ2VzIHx8IFtdKS5tYXAoaW1hZ2UgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGltYWdlLCBhdHRycy5pbWFnZXdpZHRoLCBhdHRycy5pbWFnZWhlaWdodCkpO1xuICAgICAgICBzZXR0aW5ncy5wYWdlciA9IHNjb3BlLm1lZGlhcy5sZW5ndGggPiAxO1xuICAgICAgICAkdGltZW91dCgoKSA9PiBzbGlkZXIucmVsb2FkU2xpZGVyKHNldHRpbmdzKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvb25pZnJhbWVsb2FkLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnb25JZnJhbWVMb2FkJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBzY29wZToge1xuICAgICAgY2FsbGJhY2s6ICcmb25JZnJhbWVMb2FkJ1xuICAgIH0sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICBlbGVtZW50LmJpbmQoJ2xvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKHNjb3BlLmNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHNjb3BlLmNhbGxiYWNrKHsgZXZlbnQ6IGUgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL29ua2V5ZG93bi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ29uS2V5ZG93bicsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW0sIGF0dHJzKSB7XG4gICAgICB2YXIgZnVuY3Rpb25Ub0NhbGwgPSBzY29wZS4kZXZhbChhdHRycy5vbktleWRvd24pO1xuICAgICAgZWxlbS5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBmdW5jdGlvblRvQ2FsbChlLndoaWNoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3F1YW50aXR5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgncXVhbnRpdHknLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHF1YW50aXR5OiAnPScsXG4gICAgICBtaW46ICc9JyxcbiAgICAgIG1heDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHNjb3BlLm1pbiA9IHNjb3BlLm1pbiB8fCAxO1xuICAgICAgc2NvcGUubWF4ID0gc2NvcGUubWF4IHx8IDk7XG4gICAgICBzY29wZS5kYXRhID0ge1xuICAgICAgICBtaW46IHNjb3BlLm1pbixcbiAgICAgICAgbWF4OiBzY29wZS5tYXgsXG4gICAgICAgIHF1YW50aXR5OiBwYXJzZUludChzY29wZS5xdWFudGl0eSlcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmRlY3JlYXNlID0gKCkgPT4ge1xuICAgICAgICBzY29wZS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5ID4gc2NvcGUuZGF0YS5taW4gP1xuICAgICAgICAgIHNjb3BlLmRhdGEucXVhbnRpdHkgLSAxIDpcbiAgICAgICAgICBzY29wZS5kYXRhLm1pbjtcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLmluY3JlYXNlID0gKCkgPT4ge1xuICAgICAgICBzY29wZS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPSBzY29wZS5kYXRhLnF1YW50aXR5IDwgc2NvcGUuZGF0YS5tYXggP1xuICAgICAgICAgIHNjb3BlLmRhdGEucXVhbnRpdHkgKyAxIDpcbiAgICAgICAgICBzY29wZS5kYXRhLm1heDtcbiAgICAgIH07XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ2lucHV0LXF1YW50aXR5JylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zY3JvbGxlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3Njcm9sbGVyJywgWydBY3Rpdml0eU1vbml0b3InLCAnU05BUEVudmlyb25tZW50JywgZnVuY3Rpb24gKEFjdGl2aXR5TW9uaXRvciwgU05BUEVudmlyb25tZW50KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdDJyxcbiAgICByZXBsYWNlOiBmYWxzZSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIGlmIChTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gPT09ICdkZXNrdG9wJykge1xuICAgICAgICAkKGVsZW0pLmtpbmV0aWMoe1xuICAgICAgICAgIHk6IGZhbHNlLCBzdG9wcGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3Njcm9sbGdsdWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzY3JvbGxnbHVlJywgWyckcGFyc2UnLCBmdW5jdGlvbiAoJHBhcnNlKSB7XG4gIGZ1bmN0aW9uIHVuYm91bmRTdGF0ZShpbml0VmFsdWUpe1xuICAgIHZhciBhY3RpdmF0ZWQgPSBpbml0VmFsdWU7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gYWN0aXZhdGVkO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgIGFjdGl2YXRlZCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBvbmVXYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBzY29wZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHNjb3BlKTtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24oKXt9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHR3b1dheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNldHRlciwgc2NvcGUpe1xuICAgIHJldHVybiB7XG4gICAgICBnZXRWYWx1ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGdldHRlcihzY29wZSk7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgaWYodmFsdWUgIT09IGdldHRlcihzY29wZSkpe1xuICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpe1xuICAgICAgICAgICAgc2V0dGVyKHNjb3BlLCB2YWx1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQWN0aXZhdGlvblN0YXRlKGF0dHIsIHNjb3BlKXtcbiAgICBpZihhdHRyICE9PSBcIlwiKXtcbiAgICAgIHZhciBnZXR0ZXIgPSAkcGFyc2UoYXR0cik7XG4gICAgICBpZihnZXR0ZXIuYXNzaWduICE9PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm4gdHdvV2F5QmluZGluZ1N0YXRlKGdldHRlciwgZ2V0dGVyLmFzc2lnbiwgc2NvcGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9uZVdheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNjb3BlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuYm91bmRTdGF0ZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHByaW9yaXR5OiAxLFxuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsICRlbCwgYXR0cnMpe1xuICAgICAgdmFyIGVsID0gJGVsWzBdLFxuICAgICAgYWN0aXZhdGlvblN0YXRlID0gY3JlYXRlQWN0aXZhdGlvblN0YXRlKGF0dHJzLnNjcm9sbGdsdWUsIHNjb3BlKTtcblxuICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9Cb3R0b20oKXtcbiAgICAgICAgZWwuc2Nyb2xsVG9wID0gZWwuc2Nyb2xsSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblNjb3BlQ2hhbmdlcygpe1xuICAgICAgICBpZihhY3RpdmF0aW9uU3RhdGUuZ2V0VmFsdWUoKSAmJiAhc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCkpe1xuICAgICAgICAgIHNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCl7XG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxUb3AgKyBlbC5jbGllbnRIZWlnaHQgKyAxID49IGVsLnNjcm9sbEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25TY3JvbGwoKXtcbiAgICAgICAgYWN0aXZhdGlvblN0YXRlLnNldFZhbHVlKHNob3VsZEFjdGl2YXRlQXV0b1Njcm9sbCgpKTtcbiAgICAgIH1cblxuICAgICAgc2NvcGUuJHdhdGNoKG9uU2NvcGVDaGFuZ2VzKTtcbiAgICAgICRlbC5iaW5kKCdzY3JvbGwnLCBvblNjcm9sbCk7XG4gICAgfVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3NsaWRlci5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3NsaWRlcicsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0FFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBzb3VyY2U6ICc9JyxcbiAgICAgIHNsaWRlY2xpY2s6ICc9JyxcbiAgICAgIHNsaWRlc2hvdzogJz0nLFxuICAgICAgdGltZW91dDogJz0nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHZhciB0aW1lb3V0ID0gc2NvcGUudGltZW91dCB8fCA1MDAwO1xuICAgICAgc2NvcGUuc291cmNlID0gc2NvcGUuc291cmNlIHx8IFtdO1xuICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gLTE7XG5cbiAgICAgIHZhciBjaGFuZ2VJbWFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2NvcGUuc291cmNlLmxlbmd0aCA9PT0gMCB8fCBzY29wZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG5cbiAgICAgICAgc2NvcGUuc291cmNlLmZvckVhY2goZnVuY3Rpb24oZW50cnksIGkpe1xuICAgICAgICAgIGVudHJ5LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGVudHJ5ID0gc2NvcGUuc291cmNlW3Njb3BlLmN1cnJlbnRJbmRleF07XG4gICAgICAgIGVudHJ5LnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIGlmIChzY29wZS5zbGlkZXNob3cpIHtcbiAgICAgICAgICBzY29wZS5zbGlkZXNob3coZW50cnkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB2YXIgdiA9ICQoJ3ZpZGVvJywgZWxlbSk7XG4gICAgICAgICAgdi5hdHRyKCdzcmMnLCBlbnRyeS5zcmMpO1xuICAgICAgICAgIHZhciB2aWRlbyA9IHYuZ2V0KDApO1xuXG4gICAgICAgICAgaWYgKCF2aWRlbykge1xuICAgICAgICAgICAgdGltZXIgPSAkdGltZW91dChzbGlkZXJGdW5jLCAzMDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBvblZpZGVvRW5kZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25WaWRlb0VuZGVkLCBmYWxzZSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgc2NvcGUubmV4dCgpOyB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIG9uVmlkZW9FcnJvciA9IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICB2aWRlby5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uVmlkZW9FcnJvciwgZmFsc2UpO1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7IHNjb3BlLm5leHQoKTsgfSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgb25WaWRlb0VuZGVkLCBmYWxzZSk7XG4gICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvblZpZGVvRXJyb3IsIGZhbHNlKTtcblxuICAgICAgICAgIHRyeVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpZGVvLmxvYWQoKTtcbiAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIHBsYXkgdmlkZW86ICcgKyBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGltZXIgPSAkdGltZW91dChzbGlkZXJGdW5jLCB0aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgc2NvcGUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPCBzY29wZS5zb3VyY2UubGVuZ3RoLTEgP1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCsrIDpcbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICBjaGFuZ2VJbWFnZSgpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUucHJldiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPiAwID9cbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXgtLSA6XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4ID0gc2NvcGUuc291cmNlLmxlbmd0aCAtIDE7XG4gICAgICAgIGNoYW5nZUltYWdlKCk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdGltZXI7XG5cbiAgICAgIHZhciBzbGlkZXJGdW5jID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzY29wZS5zb3VyY2UubGVuZ3RoID09PSAwIHx8IHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUubmV4dCgpO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdzb3VyY2UnLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgc2xpZGVyRnVuYygpO1xuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiR3YXRjaCgnZGlzYWJsZWQnLCBmdW5jdGlvbigpe1xuICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgc2xpZGVyRnVuYygpO1xuICAgICAgfSk7XG5cbiAgICAgIHNsaWRlckZ1bmMoKTtcblxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZW1wbGF0ZVVybDogU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwoJ3NsaWRlcicpXG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc3dpdGNoLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc3dpdGNoJyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHNjb3BlOiB7XG4gICAgICBkaXNhYmxlZDogJz0/JyxcbiAgICAgIHNlbGVjdGVkOiAnPT8nXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIHNjb3BlLmRpc2FibGVkID0gQm9vbGVhbihzY29wZS5kaXNhYmxlZCk7XG4gICAgICBzY29wZS5zZWxlY3RlZCA9IEJvb2xlYW4oc2NvcGUuc2VsZWN0ZWQpO1xuICAgICAgc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgZGlzYWJsZWQ6IEJvb2xlYW4oc2NvcGUuZGlzYWJsZWQpLFxuICAgICAgICBzZWxlY3RlZDogQm9vbGVhbihzY29wZS5zZWxlY3RlZCksXG4gICAgICAgIGNoYW5nZWQ6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICBzY29wZS50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzY29wZS5kaXNhYmxlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLnNlbGVjdGVkID0gc2NvcGUuZGF0YS5zZWxlY3RlZCA9ICFzY29wZS5kYXRhLnNlbGVjdGVkO1xuICAgICAgICBzY29wZS5kYXRhLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnaW5wdXQtc3dpdGNoJylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJywgW10pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3BhcnRpYWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCdwYXJ0aWFsJywgWydTaGVsbE1hbmFnZXInLCAoU2hlbGxNYW5hZ2VyKSA9PiB7XG4gIHJldHVybiAobmFtZSkgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG59XSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvdGh1bWJuYWlsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigndGh1bWJuYWlsJywgWydTaGVsbE1hbmFnZXInLCBTaGVsbE1hbmFnZXIgPT4ge1xuICByZXR1cm4gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy90cnVzdHVybC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3RydXN0VXJsJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHZhbCk7XG4gICAgfTtcbn1dKTtcblxuLy9zcmMvanMvc2VydmljZXMuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuc2VydmljZXMnLCBbJ25nUmVzb3VyY2UnLCAnU05BUC5jb25maWdzJ10pXG5cbiAgLmZhY3RvcnkoJ0xvZ2dlcicsIFsnU05BUEVudmlyb25tZW50JywgKFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkxvZ2dlcihTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJyRleGNlcHRpb25IYW5kbGVyJywgWydMb2dnZXInLCAoTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIChleGNlcHRpb24sIGNhdXNlKSA9PiB7XG4gICAgICBMb2dnZXIuZmF0YWwoZXhjZXB0aW9uLnN0YWNrLCBjYXVzZSwgZXhjZXB0aW9uKTtcbiAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICB9O1xuICB9XSlcblxuICAvL1NlcnZpY2VzXG5cbiAgLmZhY3RvcnkoJ0NhcmRSZWFkZXInLCBbJ01hbmFnZW1lbnRTZXJ2aWNlJywgKE1hbmFnZW1lbnRTZXJ2aWNlKSA9PiB7XG4gICAgd2luZG93LlNuYXBDYXJkUmVhZGVyID0gbmV3IGFwcC5DYXJkUmVhZGVyKE1hbmFnZW1lbnRTZXJ2aWNlKTtcbiAgICByZXR1cm4gd2luZG93LlNuYXBDYXJkUmVhZGVyO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0R0c0FwaScsIFsnU05BUEhvc3RzJywgJ1Nlc3Npb25Qcm92aWRlcicsIChTTkFQSG9zdHMsIFNlc3Npb25Qcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkJhY2tlbmRBcGkoU05BUEhvc3RzLCBTZXNzaW9uUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ01hbmFnZW1lbnRTZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAnU05BUEVudmlyb25tZW50JywgKCRyZXNvdXJjZSwgU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTWFuYWdlbWVudFNlcnZpY2UoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1Nlc3Npb25TZXJ2aWNlJywgWyckcmVzb3VyY2UnLCAoJHJlc291cmNlKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2Vzc2lvblNlcnZpY2UoJHJlc291cmNlKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2NrZXRDbGllbnQnLCBbJ1Nlc3Npb25Qcm92aWRlcicsICdMb2dnZXInLCAoU2Vzc2lvblByb3ZpZGVyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2NrZXRDbGllbnQoU2Vzc2lvblByb3ZpZGVyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1RlbGVtZXRyeVNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICgkcmVzb3VyY2UpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5UZWxlbWV0cnlTZXJ2aWNlKCRyZXNvdXJjZSk7XG4gIH1dKVxuICAuZmFjdG9yeSgnV2ViQnJvd3NlcicsIFsnJHdpbmRvdycsICdBbmFseXRpY3NNb2RlbCcsICdNYW5hZ2VtZW50U2VydmljZScsICdTTkFQRW52aXJvbm1lbnQnLCAnU05BUEhvc3RzJywgKCR3aW5kb3csIEFuYWx5dGljc01vZGVsLCBNYW5hZ2VtZW50U2VydmljZSwgU05BUEVudmlyb25tZW50LCBTTkFQSG9zdHMpID0+IHtcbiAgICB3aW5kb3cuU25hcFdlYkJyb3dzZXIgPSBuZXcgYXBwLldlYkJyb3dzZXIoJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cyk7XG4gICAgcmV0dXJuIHdpbmRvdy5TbmFwV2ViQnJvd3NlcjtcbiAgfV0pXG5cbiAgLy9Nb2RlbHNcblxuICAuZmFjdG9yeSgnQXBwQ2FjaGUnLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BcHBDYWNoZShMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0FuYWx5dGljc01vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAnSGVhdE1hcCcsIChTdG9yYWdlUHJvdmlkZXIsIEhlYXRNYXApID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BbmFseXRpY3NNb2RlbChTdG9yYWdlUHJvdmlkZXIsIEhlYXRNYXApO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0NhcnRNb2RlbCcsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kZWwoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0NoYXRNb2RlbCcsIFsnU05BUENvbmZpZycsICdTTkFQRW52aXJvbm1lbnQnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2hhdE1vZGVsKFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdDdXN0b21lck1vZGVsJywgWydTTkFQQ29uZmlnJywgJ1N0b3JhZ2VQcm92aWRlcicsIChTTkFQQ29uZmlnLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DdXN0b21lck1vZGVsKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGF0YVByb3ZpZGVyJywgWydTTkFQQ29uZmlnJywgJ0R0c0FwaScsIChTTkFQQ29uZmlnLCBEdHNBcGkpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EYXRhUHJvdmlkZXIoU05BUENvbmZpZywgRHRzQXBpKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdIZWF0TWFwJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkhlYXRNYXAoZG9jdW1lbnQuYm9keSk7XG4gIH0pXG4gIC5mYWN0b3J5KCdMb2NhdGlvbk1vZGVsJywgWydTTkFQRW52aXJvbm1lbnQnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9jYXRpb25Nb2RlbChTTkFQRW52aXJvbm1lbnQsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnT3JkZXJNb2RlbCcsIFsnU3RvcmFnZVByb3ZpZGVyJywgKFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLk9yZGVyTW9kZWwoU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTaGVsbE1vZGVsJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNoZWxsTW9kZWwoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ1N1cnZleU1vZGVsJywgWydTTkFQQ29uZmlnJywgJ1N0b3JhZ2VQcm92aWRlcicsIChTTkFQQ29uZmlnLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TdXJ2ZXlNb2RlbChTTkFQQ29uZmlnLCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1Nlc3Npb25Qcm92aWRlcicsIFsnU2Vzc2lvblNlcnZpY2UnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNlc3Npb25TZXJ2aWNlLCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uUHJvdmlkZXIoU2Vzc2lvblNlcnZpY2UsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU3RvcmFnZVByb3ZpZGVyJywgKCkgPT4gIHtcbiAgICByZXR1cm4gKGlkKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IGFwcC5Mb2NhbFN0b3JhZ2VTdG9yZShpZCk7XG4gICAgfTtcbiAgfSlcblxuICAvL01hbmFnZXJzXG5cbiAgLmZhY3RvcnkoJ0FjdGl2aXR5TW9uaXRvcicsIFsnJHJvb3RTY29wZScsICckdGltZW91dCcsICgkcm9vdFNjb3BlLCAkdGltZW91dCkgPT4ge1xuICAgIHZhciBtb25pdG9yID0gbmV3IGFwcC5BY3Rpdml0eU1vbml0b3IoJHJvb3RTY29wZSwgJHRpbWVvdXQpO1xuICAgIG1vbml0b3IudGltZW91dCA9IDMwMDAwO1xuICAgIHJldHVybiBtb25pdG9yO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0FuYWx5dGljc01hbmFnZXInLCBbJ1RlbGVtZXRyeVNlcnZpY2UnLCAnQW5hbHl0aWNzTW9kZWwnLCAnTG9nZ2VyJywgKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5BbmFseXRpY3NNYW5hZ2VyKFRlbGVtZXRyeVNlcnZpY2UsIEFuYWx5dGljc01vZGVsLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0N1c3RvbWVyTWFuYWdlcicsIFsnU05BUENvbmZpZycsICdTTkFQRW52aXJvbm1lbnQnLCAnRHRzQXBpJywgJ0N1c3RvbWVyTW9kZWwnLCAoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DdXN0b21lck1hbmFnZXIoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBEdHNBcGksIEN1c3RvbWVyTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0NoYXRNYW5hZ2VyJywgWydBbmFseXRpY3NNb2RlbCcsICdDaGF0TW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ1NvY2tldENsaWVudCcsIChBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DaGF0TWFuYWdlcihBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0RhdGFNYW5hZ2VyJywgWydEYXRhUHJvdmlkZXInLCAnTG9nZ2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsIChEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuRGF0YU1hbmFnZXIoRGF0YVByb3ZpZGVyLCBMb2dnZXIsIFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGlhbG9nTWFuYWdlcicsICgpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EaWFsb2dNYW5hZ2VyKCk7XG4gIH0pXG4gIC5mYWN0b3J5KCdOYXZpZ2F0aW9uTWFuYWdlcicsIFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJHdpbmRvdycsICdBbmFseXRpY3NNb2RlbCcsICgkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIEFuYWx5dGljc01vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTmF2aWdhdGlvbk1hbmFnZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkd2luZG93LCBBbmFseXRpY3NNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnT3JkZXJNYW5hZ2VyJywgWydDaGF0TW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdEYXRhUHJvdmlkZXInLCAnRHRzQXBpJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNb2RlbCcsIChDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIERhdGFQcm92aWRlciwgRHRzQXBpLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuT3JkZXJNYW5hZ2VyKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1Nlc3Npb25NYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ09yZGVyTW9kZWwnLCAnU3VydmV5TW9kZWwnLCAnU3RvcmFnZVByb3ZpZGVyJywgJ0xvZ2dlcicsIChTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgU3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uTWFuYWdlcihTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgU3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NoZWxsTWFuYWdlcicsIFsnJHNjZScsICdEYXRhUHJvdmlkZXInLCAnU2hlbGxNb2RlbCcsICdTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQSG9zdHMnLCAoJHNjZSwgRGF0YVByb3ZpZGVyLCBTaGVsbE1vZGVsLCBTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykgPT4ge1xuICAgIGxldCBtYW5hZ2VyID0gbmV3IGFwcC5TaGVsbE1hbmFnZXIoJHNjZSwgRGF0YVByb3ZpZGVyLCBTaGVsbE1vZGVsLCBTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cyk7XG4gICAgRGF0YVByb3ZpZGVyLl9nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBtYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pOyAvL1RvRG86IHJlZmFjdG9yXG4gICAgcmV0dXJuIG1hbmFnZXI7XG4gIH1dKVxuICAuZmFjdG9yeSgnU29jaWFsTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgJ0R0c0FwaScsICdXZWJCcm93c2VyJywgJ0xvZ2dlcicsIChTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU29jaWFsTWFuYWdlcihTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgV2ViQnJvd3NlciwgTG9nZ2VyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2Z0d2FyZU1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsIChTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2Z0d2FyZU1hbmFnZXIoU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTdXJ2ZXlNYW5hZ2VyJywgWydEYXRhUHJvdmlkZXInLCAnU3VydmV5TW9kZWwnLCAoRGF0YVByb3ZpZGVyLCBTdXJ2ZXlNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlN1cnZleU1hbmFnZXIoRGF0YVByb3ZpZGVyLCBTdXJ2ZXlNb2RlbCk7XG4gIH1dKTtcbiJdfQ==
