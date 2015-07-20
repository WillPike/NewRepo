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
//# sourceMappingURL=data:application/json;base64,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ZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ2pELENBQUMsQ0FBQyxDQUNGLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxjQUFjLEVBQUUsYUFBYSxFQUFFLFVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBSztBQUN2RixTQUFPLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDekQsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoidGVtcC9zbmFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy9zcmMvanMvc2hhcmVkL19iYXNlLmpzXG5cbndpbmRvdy5hcHAgPSB7fTtcblxudmFyIEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SID0gMSxcbiAgICBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCA9IDEwLFxuICAgIEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRCA9IDExLFxuICAgIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCA9IDIwLFxuICAgIEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfUkVDRUlWRUQgPSAyMSxcbiAgICBBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQgPSAzMCxcbiAgICBBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEID0gMzEsXG4gICAgQUxFUlRfU0lHTklOX1JFUVVJUkVEID0gNDAsXG4gICAgQUxFUlRfVEFCTEVfUkVTRVQgPSA1MCxcbiAgICBBTEVSVF9UQUJMRV9BU1NJU1RBTkNFID0gNTEsXG4gICAgQUxFUlRfVEFCTEVfQ0xPU0VPVVQgPSA1MixcbiAgICBBTEVSVF9HRU5FUklDX0VSUk9SID0gMTAwLFxuICAgIEFMRVJUX0RFTEVUX0NBUkQgPSAyMDAsXG4gICAgQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEUgPSAyMTAsXG4gICAgQUxFUlRfU09GVFdBUkVfT1VUREFURUQgPSAyMjAsXG4gICAgQUxFUlRfQ0FSRFJFQURFUl9FUlJPUiA9IDMxMCxcbiAgICBBTEVSVF9FUlJPUl9OT19TRUFUID0gNDEwO1xuXG4vL3NyYy9qcy9zaGFyZWQvYWN0aXZpdHltb25pdG9yLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICB2YXIgQWN0aXZpdHlNb25pdG9yID0gZnVuY3Rpb24oJHJvb3RTY29wZSwgJHRpbWVvdXQpIHtcbiAgICB0aGlzLiQkcm9vdFNjb3BlID0gJHJvb3RTY29wZTtcbiAgICB0aGlzLiQkdGltZW91dCA9ICR0aW1lb3V0O1xuICAgIHRoaXMuX3RpbWVvdXQgPSAxMDAwMDtcblxuICAgIHRoaXMuX2FjdGl2ZUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy4kJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLmVuYWJsZWQpIHtcbiAgICAgICAgc2VsZi5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgfTtcblxuICBBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlID0ge307XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFjdGl2aXR5TW9uaXRvci5wcm90b3R5cGUsICd0aW1lb3V0Jywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl90aW1lb3V0OyB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgdGhpcy5fdGltZW91dCA9IHZhbHVlO1xuICAgICAgICB0aGlzLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBY3Rpdml0eU1vbml0b3IucHJvdG90eXBlLCAnZW5hYmxlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fZW5hYmxlZDsgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7IHRoaXMuX2VuYWJsZWQgPSB2YWx1ZTsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ2FjdGl2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5fdGltZXIgIT0gbnVsbDsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZSwgJ2FjdGl2ZUNoYW5nZWQnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX2FjdGl2ZUNoYW5nZWQ7IH1cbiAgfSk7XG5cbiAgQWN0aXZpdHlNb25pdG9yLnByb3RvdHlwZS5hY3Rpdml0eURldGVjdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoYW5nZWQ7XG5cbiAgICBpZiAodGhpcy5fdGltZXIpIHtcbiAgICAgIHRoaXMuJCR0aW1lb3V0LmNhbmNlbCh0aGlzLl90aW1lcik7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuX3RpbWVyID09PSBudWxsKSB7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgb25UaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLl90aW1lciA9IG51bGw7XG5cbiAgICAgIHNlbGYuJCRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5lbmFibGVkKSB7XG4gICAgICAgICAgc2VsZi5hY3RpdmVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX3RpbWVyID0gdGhpcy4kJHRpbWVvdXQob25UaW1lb3V0LCB0aGlzLl90aW1lb3V0KTtcblxuICAgIGlmIChjaGFuZ2VkICYmIHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy5hY3RpdmVDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuYWN0aXZlKTtcbiAgICB9XG4gIH07XG5cbiAgd2luZG93LmFwcC5BY3Rpdml0eU1vbml0b3IgPSBBY3Rpdml0eU1vbml0b3I7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvYW5hbHl0aWNzZGF0YS5qc1xuXG53aW5kb3cuYXBwLkFuYWx5dGljc0RhdGEgPSBjbGFzcyBBbmFseXRpY3NEYXRhIHtcbiAgY29uc3RydWN0b3IobmFtZSwgc3RvcmFnZVByb3ZpZGVyLCBkZWZhdWx0VmFsdWUpIHtcbiAgICB0aGlzLl9kZWZhdWx0VmFsdWUgPSBkZWZhdWx0VmFsdWUgfHwgKCgpID0+IFtdKTtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGVmYXVsdFZhbHVlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfYW5hbHl0aWNzXycgKyBuYW1lKTtcbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbihkYXRhID0+IHNlbGYuX2RhdGEgPSBkYXRhIHx8IHNlbGYuX2RhdGEpO1xuICB9XG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cblxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YTtcbiAgfVxuXG4gIHNldCBkYXRhKHZhbHVlKSB7XG4gICAgdGhpcy5fZGF0YSA9IHZhbHVlO1xuICAgIHN0b3JlKCk7XG4gIH1cblxuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLmxlbmd0aDtcbiAgfVxuXG4gIGdldCBsYXN0KCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhW3RoaXMubGVuZ3RoIC0gMV07XG4gIH1cblxuICBwdXNoKGl0ZW0pIHtcbiAgICB0aGlzLl9kYXRhLnB1c2goaXRlbSk7XG4gICAgc3RvcmUoKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kZWZhdWx0VmFsdWUoKTtcbiAgICBzdG9yZSgpO1xuICB9XG5cbiAgc3RvcmUoKSB7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fZGF0YSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9hbmFseXRpY3NtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQW5hbHl0aWNzTWFuYWdlciA9IGNsYXNzIEFuYWx5dGljc01hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihUZWxlbWV0cnlTZXJ2aWNlLCBBbmFseXRpY3NNb2RlbCwgTG9nZ2VyKSB7XG4gICAgdGhpcy5fVGVsZW1ldHJ5U2VydmljZSA9IFRlbGVtZXRyeVNlcnZpY2U7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gIH1cblxuICBzdWJtaXQoKSB7XG4gICAgdGhpcy5fTG9nZ2VyLmRlYnVnKGBTdWJtaXR0aW5nIGFuYWx5dGljcyBkYXRhIHdpdGggYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5zZXNzaW9ucy5sZW5ndGh9IHNlYXQgc2Vzc2lvbnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuYW5zd2Vycy5sZW5ndGh9IGFuc3dlcnMsIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwuY2hhdHMubGVuZ3RofSBjaGF0cywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5jb21tZW50cy5sZW5ndGh9IGNvbW1lbnRzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmNsaWNrcy5sZW5ndGh9IGNsaWNrcywgYCArXG4gICAgICBgJHt0aGlzLl9BbmFseXRpY3NNb2RlbC5wYWdlcy5sZW5ndGh9IHBhZ2VzLCBgICtcbiAgICAgIGAke3RoaXMuX0FuYWx5dGljc01vZGVsLmFkdmVydGlzZW1lbnRzLmxlbmd0aH0gYWR2ZXJ0aXNlbWVudHMgYW5kIGAgK1xuICAgICAgYCR7dGhpcy5fQW5hbHl0aWNzTW9kZWwudXJscy5sZW5ndGh9IFVSTHMuYCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX1RlbGVtZXRyeVNlcnZpY2Uuc3VibWl0VGVsZW1ldHJ5KHtcbiAgICAgICAgc2Vzc2lvbnM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnNlc3Npb25zLmRhdGEsXG4gICAgICAgIGFkdmVydGlzZW1lbnRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hZHZlcnRpc2VtZW50cy5kYXRhLFxuICAgICAgICBhbnN3ZXJzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5hbnN3ZXJzLmRhdGEsXG4gICAgICAgIGNoYXRzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jaGF0cy5kYXRhLFxuICAgICAgICBjb21tZW50czogc2VsZi5fQW5hbHl0aWNzTW9kZWwuY29tbWVudHMuZGF0YSxcbiAgICAgICAgY2xpY2tzOiBzZWxmLl9BbmFseXRpY3NNb2RlbC5jbGlja3MuZGF0YSxcbiAgICAgICAgcGFnZXM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnBhZ2VzLmRhdGEsXG4gICAgICAgIHVybHM6IHNlbGYuX0FuYWx5dGljc01vZGVsLnVybHMuZGF0YVxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuX0FuYWx5dGljc01vZGVsLmNsZWFyKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIGUgPT4ge1xuICAgICAgICBzZWxmLl9Mb2dnZXIud2FybignVW5hYmxlIHRvIHN1Ym1pdCBhbmFseXRpY3MgZGF0YTogJyArIGUubWVzc2FnZSk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvYW5hbHl0aWNzbW9kZWwuanNcblxud2luZG93LmFwcC5BbmFseXRpY3NNb2RlbCA9IGNsYXNzIEFuYWx5dGljc01vZGVsIHtcbiAgY29uc3RydWN0b3Ioc3RvcmFnZVByb3ZpZGVyLCBoZWF0bWFwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX2RhdGEgPSBbXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3Nlc3Npb25zJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnYWR2ZXJ0aXNlbWVudHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdhbnN3ZXJzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgnY2hhdHMnLCBzdG9yYWdlUHJvdmlkZXIpLFxuICAgICAgbmV3IGFwcC5BbmFseXRpY3NEYXRhKCdjb21tZW50cycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ2NsaWNrcycsIHN0b3JhZ2VQcm92aWRlciksXG4gICAgICBuZXcgYXBwLkFuYWx5dGljc0RhdGEoJ3BhZ2VzJywgc3RvcmFnZVByb3ZpZGVyKSxcbiAgICAgIG5ldyBhcHAuQW5hbHl0aWNzRGF0YSgndXJscycsIHN0b3JhZ2VQcm92aWRlcilcbiAgICBdLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgICByZXN1bHRbaXRlbS5uYW1lXSA9IGl0ZW07XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIHt9KTtcblxuICAgIGhlYXRtYXAuY2xpY2tlZC5hZGQoY2xpY2sgPT4ge1xuICAgICAgc2VsZi5fbG9nQ2xpY2soY2xpY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbG9nU2Vzc2lvbihzZXNzaW9uKSB7XG4gICAgdGhpcy5fZGF0YS5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICB9XG5cbiAgZ2V0IHNlc3Npb25zKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnNlc3Npb25zO1xuICB9XG5cbiAgbG9nTmF2aWdhdGlvbihkZXN0aW5hdGlvbikge1xuICAgIHRoaXMuX2RhdGEucGFnZXMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5zdG9yZSgpO1xuICB9XG5cbiAgZ2V0IHBhZ2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnBhZ2VzO1xuICB9XG5cbiAgbG9nQWR2ZXJ0aXNlbWVudChhZHZlcnRpc2VtZW50KSB7XG4gICAgdGhpcy5fZGF0YS5hZHZlcnRpc2VtZW50cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBhZHZlcnRpc2VtZW50OiBhZHZlcnRpc2VtZW50XG4gICAgfSk7XG4gIH1cblxuICBnZXQgYWR2ZXJ0aXNlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuYWR2ZXJ0aXNlbWVudHM7XG4gIH1cblxuICBsb2dBbnN3ZXIoYW5zd2VyKSB7XG4gICAgdGhpcy5fZGF0YS5hbnN3ZXJzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGFuc3dlcjogYW5zd2VyXG4gICAgfSk7XG4gIH1cblxuICBnZXQgYW5zd2VycygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5hbnN3ZXJzO1xuICB9XG5cbiAgbG9nQ2hhdChjaGF0KSB7XG4gICAgdGhpcy5fZGF0YS5jaGF0cy5wdXNoKHtcbiAgICAgIHRpbWU6IG5ldyBEYXRlKCksXG4gICAgICBjaGF0OiBjaGF0XG4gICAgfSk7XG4gIH1cblxuICBnZXQgY2hhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY2hhdHM7XG4gIH1cblxuICBsb2dDb21tZW50KGNvbW1lbnQpIHtcbiAgICB0aGlzLl9kYXRhLmNvbW1lbnRzLnB1c2goe1xuICAgICAgdGltZTogbmV3IERhdGUoKSxcbiAgICAgIGNvbW1lbnQ6IGNvbW1lbnRcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBjb21tZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jb21tZW50cztcbiAgfVxuXG4gIGxvZ1VybCh1cmwpIHtcbiAgICB0aGlzLl9kYXRhLnVybHMucHVzaCh7XG4gICAgICB0aW1lOiBuZXcgRGF0ZSgpLFxuICAgICAgdXJsOiB1cmxcbiAgICB9KTtcbiAgfVxuXG4gIGdldCB1cmxzKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVybHM7XG4gIH1cblxuICBnZXQgY2xpY2tzKCkge1xuICAgIHRoaXMuX2RhdGEuY2xpY2tzLnN0b3JlKCk7XG5cbiAgICByZXR1cm4gdGhpcy5fZGF0YS5jbGlja3M7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBmb3IgKHZhciBrIGluIHRoaXMuX2RhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba10ucmVzZXQoKTtcbiAgICB9XG4gIH1cblxuICBfbG9nQ2xpY2soY2xpY2spIHtcbiAgICBjbGljay50aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLl9kYXRhLmNsaWNrcy5kYXRhLnB1c2goY2xpY2spO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvYXBwY2FjaGUuanNcblxuKGZ1bmN0aW9uKCkge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBBcHBDYWNoZVxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBBcHBDYWNoZSA9IGZ1bmN0aW9uKExvZ2dlcikge1xuICAgIHRoaXMuX0xvZ2dlciA9IExvZ2dlcjtcbiAgICB0aGlzLl9jYWNoZSA9IHdpbmRvdy5hcHBsaWNhdGlvbkNhY2hlO1xuICAgIHRoaXMuX2FwcENhY2hlRXZlbnRzID0gW1xuICAgICAgJ2NhY2hlZCcsXG4gICAgICAnY2hlY2tpbmcnLFxuICAgICAgJ2Rvd25sb2FkaW5nJyxcbiAgICAgICdjYWNoZWQnLFxuICAgICAgJ25vdXBkYXRlJyxcbiAgICAgICdvYnNvbGV0ZScsXG4gICAgICAndXBkYXRlcmVhZHknLFxuICAgICAgJ3Byb2dyZXNzJ1xuICAgIF07XG5cbiAgICB2YXIgc3RhdHVzID0gdGhpcy5fZ2V0Q2FjaGVTdGF0dXMoKTtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGUgc3RhdHVzOiAnICsgc3RhdHVzKTtcblxuICAgIHRoaXMuY29tcGxldGUgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9pc0NvbXBsZXRlID0gZmFsc2U7XG4gICAgdGhpcy5faXNVcGRhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5faGFkRXJyb3JzID0gZmFsc2U7XG5cbiAgICBpZiAoc3RhdHVzID09PSAnVU5DQUNIRUQnKSB7XG4gICAgICB0aGlzLl9pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29tcGxldGUuZGlzcGF0Y2goZmFsc2UpO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9lcnJvckhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLl9oYW5kbGVDYWNoZUVycm9yKGUpO1xuICAgIH07XG4gICAgdGhpcy5fZXZlbnRIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5faGFuZGxlQ2FjaGVFdmVudChlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fYWRkRXZlbnRMaXN0ZW5lcnMoKTtcbiAgfTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXBwQ2FjaGUucHJvdG90eXBlLCAnaXNDb21wbGV0ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faXNDb21wbGV0ZTsgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXBwQ2FjaGUucHJvdG90eXBlLCAnaXNVcGRhdGVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLl9pc1VwZGF0ZWQ7IH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEFwcENhY2hlLnByb3RvdHlwZSwgJ2hhZEVycm9ycycsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5faGFkRXJyb3JzOyB9XG4gIH0pO1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5fZ2V0Q2FjaGVTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICBzd2l0Y2ggKHRoaXMuX2NhY2hlLnN0YXR1cykge1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5VTkNBQ0hFRDpcbiAgICAgICAgcmV0dXJuICdVTkNBQ0hFRCc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLklETEU6XG4gICAgICAgIHJldHVybiAnSURMRSc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLkNIRUNLSU5HOlxuICAgICAgICByZXR1cm4gJ0NIRUNLSU5HJztcbiAgICAgIGNhc2UgdGhpcy5fY2FjaGUuRE9XTkxPQURJTkc6XG4gICAgICAgIHJldHVybiAnRE9XTkxPQURJTkcnO1xuICAgICAgY2FzZSB0aGlzLl9jYWNoZS5VUERBVEVSRUFEWTpcbiAgICAgICAgcmV0dXJuICdVUERBVEVSRUFEWSc7XG4gICAgICBjYXNlIHRoaXMuX2NhY2hlLk9CU09MRVRFOlxuICAgICAgICByZXR1cm4gJ09CU09MRVRFJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnVUtOT1dOIENBQ0hFIFNUQVRVUyc7XG4gICAgfVxuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5fcmVzdWx0ID0gZnVuY3Rpb24oZXJyb3IsIHVwZGF0ZWQpIHtcbiAgICB0aGlzLl9pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgICB0aGlzLl9pc1VwZGF0ZWQgPSB1cGRhdGVkO1xuICAgIHRoaXMuX2hhZEVycm9ycyA9IChlcnJvciAhPSBudWxsKTtcbiAgICB0aGlzLmNvbXBsZXRlLmRpc3BhdGNoKHVwZGF0ZWQpO1xuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5fYWRkRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fY2FjaGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9lcnJvckhhbmRsZXIpO1xuICAgIHRoaXMuX2FwcENhY2hlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5fY2FjaGUuYWRkRXZlbnRMaXN0ZW5lcihlLCBzZWxmLl9ldmVudEhhbmRsZXIpO1xuICAgIH0pO1xuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5fcmVtb3ZlRXZlbnRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fY2FjaGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCB0aGlzLl9lcnJvckhhbmRsZXIpO1xuICAgIHRoaXMuX2FwcENhY2hlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgICAgc2VsZi5fY2FjaGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBzZWxmLl9ldmVudEhhbmRsZXIpO1xuICAgIH0pO1xuICB9O1xuXG4gIEFwcENhY2hlLnByb3RvdHlwZS5faGFuZGxlQ2FjaGVFdmVudCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS50eXBlICE9PSAncHJvZ3Jlc3MnKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hlIGV2ZW50OiAnICsgZS50eXBlKTtcbiAgICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnQ2FjaGUgc3RhdHVzOiAnICsgdGhpcy5fZ2V0Q2FjaGVTdGF0dXMoKSk7XG4gICAgfVxuXG4gICAgaWYgKGUudHlwZSA9PT0gJ3VwZGF0ZXJlYWR5Jykge1xuICAgICAgdGhpcy5fTG9nZ2VyLmRlYnVnKCdDYWNoaW5nIGNvbXBsZXRlLiBTd2FwcGluZyB0aGUgY2FjaGUuJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9jYWNoZS5zd2FwQ2FjaGUoKTtcblxuICAgICAgdGhpcy5fcmVzdWx0KG51bGwsIHRydWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIGlmIChlLnR5cGUgPT09ICdjYWNoZWQnKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hpbmcgY29tcGxldGUuIENhY2hlIHNhdmVkLicpO1xuXG4gICAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgICAgdGhpcy5fcmVzdWx0KG51bGwsIGZhbHNlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZS50eXBlID09PSAnbm91cGRhdGUnKSB7XG4gICAgICB0aGlzLl9Mb2dnZXIuZGVidWcoJ0NhY2hpbmcgY29tcGxldGUuIE5vIHVwZGF0ZXMuJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB0aGlzLl9yZXN1bHQobnVsbCwgZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBBcHBDYWNoZS5wcm90b3R5cGUuX2hhbmRsZUNhY2hlRXJyb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5lcnJvcignQ2FjaGUgdXBkYXRlIGVycm9yOiAnICsgZS5tZXNzYWdlKTtcbiAgICB0aGlzLl9yZW1vdmVFdmVudExpc3RlbmVycygpO1xuICAgIHRoaXMuX3Jlc3VsdChlLCBmYWxzZSk7XG4gIH07XG5cbiAgd2luZG93LmFwcC5BcHBDYWNoZSA9IEFwcENhY2hlO1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL2JhY2tlbmRhcGkuanNcblxud2luZG93LmFwcC5CYWNrZW5kQXBpID0gY2xhc3MgQmFja2VuZEFwaSB7XG4gIGNvbnN0cnVjdG9yKEhvc3RzLCBTZXNzaW9uUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9TZXNzaW9uUHJvdmlkZXIgPSBTZXNzaW9uUHJvdmlkZXI7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBidXNpbmVzc1Rva2VuUHJvdmlkZXIoKSB7XG4gICAgICByZXR1cm4gc2VsZi5fU2Vzc2lvblByb3ZpZGVyLmdldEJ1c2luZXNzVG9rZW4oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXN0b21lclRva2VuUHJvdmlkZXIoKSB7XG4gICAgICByZXR1cm4gc2VsZi5fU2Vzc2lvblByb3ZpZGVyLmdldEN1c3RvbWVyVG9rZW4oKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gRHRzQXBpQ2xpZW50KSB7XG4gICAgICBsZXQgY29uZmlnID0ge1xuICAgICAgICBob3N0OiB7XG4gICAgICAgICAgZG9tYWluOiBIb3N0cy5hcGkuaG9zdCxcbiAgICAgICAgICBzZWN1cmU6IEhvc3RzLmFwaS5zZWN1cmUgPT09ICd0cnVlJ1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBsZXQgcHJvdmlkZXIgPSBidXNpbmVzc1Rva2VuUHJvdmlkZXI7XG5cbiAgICAgIGlmIChrZXkgPT09ICdzbmFwJykge1xuICAgICAgICBjb25maWcuaG9zdC5kb21haW4gPSBIb3N0cy5jb250ZW50Lmhvc3Q7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChrZXkgPT09ICdjdXN0b21lcicpIHtcbiAgICAgICAgcHJvdmlkZXIgPSBjdXN0b21lclRva2VuUHJvdmlkZXI7XG4gICAgICB9XG5cbiAgICAgIHRoaXNba2V5XSA9IG5ldyBEdHNBcGlDbGllbnRba2V5XShjb25maWcsIHByb3ZpZGVyKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jYXJkcmVhZGVyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDYXJkUmVhZGVyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcmRSZWFkZXIgPSBmdW5jdGlvbihNYW5hZ2VtZW50U2VydmljZSkge1xuICAgIHRoaXMuX01hbmFnZW1lbnRTZXJ2aWNlID0gTWFuYWdlbWVudFNlcnZpY2U7XG4gICAgdGhpcy5vblJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vbkVycm9yID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH07XG5cbiAgQ2FyZFJlYWRlci5wcm90b3R5cGUucmVjZWl2ZWQgPSBmdW5jdGlvbihjYXJkKSB7XG4gICAgdGhpcy5vblJlY2VpdmVkLmRpc3BhdGNoKGNhcmQpO1xuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oZSkge1xuICAgIHRoaXMub25FcnJvci5kaXNwYXRjaChlKTtcbiAgfTtcblxuICBDYXJkUmVhZGVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdGFydENhcmRSZWFkZXIoKTtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIENhcmRSZWFkZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5zdG9wQ2FyZFJlYWRlcigpO1xuICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIHdpbmRvdy5hcHAuQ2FyZFJlYWRlciA9IENhcmRSZWFkZXI7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvY2FydGl0ZW0uanNcblxud2luZG93LmFwcC5DYXJ0SXRlbSA9IGNsYXNzIENhcnRJdGVtIHtcbiAgY29uc3RydWN0b3IoaXRlbSwgcXVhbnRpdHksIG5hbWUsIG1vZGlmaWVycywgcmVxdWVzdCkge1xuICAgIHRoaXMuaXRlbSA9IGl0ZW07XG4gICAgdGhpcy5xdWFudGl0eSA9IHF1YW50aXR5O1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxdWVzdDtcblxuICAgIGlmICghdGhpcy5oYXNNb2RpZmllcnMpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gW107XG4gICAgfVxuICAgIGVsc2UgaWYgKCFtb2RpZmllcnMpIHtcbiAgICAgIHRoaXMubW9kaWZpZXJzID0gaXRlbS5tb2RpZmllcnMubWFwKGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5KGNhdGVnb3J5LCBjYXRlZ29yeS5pdGVtcy5tYXAoZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXIobW9kaWZpZXIpO1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm1vZGlmaWVycyA9IG1vZGlmaWVycztcbiAgICB9XG4gIH1cblxuICBnZXQgaGFzTW9kaWZpZXJzKCkge1xuICAgIHJldHVybiB0aGlzLml0ZW0ubW9kaWZpZXJzICE9IG51bGwgJiYgdGhpcy5pdGVtLm1vZGlmaWVycy5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0IHNlbGVjdGVkTW9kaWZpZXJzKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGlmaWVycy5yZWR1Y2UoZnVuY3Rpb24ocHJldmlvdXNDYXRlZ29yeSwgY2F0ZWdvcnksIGksIGFycmF5KSB7XG4gICAgICByZXR1cm4gYXJyYXkuY29uY2F0KGNhdGVnb3J5Lml0ZW1zLmZpbHRlcihmdW5jdGlvbihtb2RpZmllcikge1xuICAgICAgICByZXR1cm4gbW9kaWZpZXIuaXNTZWxlY3RlZDtcbiAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gIH1cblxuICBjbG9uZShjb3VudCkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRJdGVtKFxuICAgICAgdGhpcy5pdGVtLFxuICAgICAgdGhpcy5xdWFudGl0eSxcbiAgICAgIHRoaXMubmFtZSxcbiAgICAgIHRoaXMubW9kaWZpZXJzLm1hcChjYXRlZ29yeSA9PiBjYXRlZ29yeS5jbG9uZSgpKSxcbiAgICAgIHRoaXMucmVxdWVzdCk7XG4gIH1cblxuICBjbG9uZU1hbnkoY291bnQpIHtcbiAgICBjb3VudCA9IGNvdW50IHx8IHRoaXMucXVhbnRpdHk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChuZXcgYXBwLkNhcnRJdGVtKFxuICAgICAgICB0aGlzLml0ZW0sXG4gICAgICAgIDEsXG4gICAgICAgIHRoaXMubmFtZSxcbiAgICAgICAgdGhpcy5tb2RpZmllcnMubWFwKGNhdGVnb3J5ID0+IGNhdGVnb3J5LmNsb25lKCkpLFxuICAgICAgICB0aGlzLnJlcXVlc3QpXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICByZXN0b3JlKGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0SXRlbShcbiAgICAgIGRhdGEuaXRlbSxcbiAgICAgIGRhdGEucXVhbnRpdHksXG4gICAgICBkYXRhLm5hbWUsXG4gICAgICBkYXRhLm1vZGlmaWVycy5tYXAoYXBwLkNhcnRNb2RpZmllckNhdGVnb3J5LnByb3RvdHlwZS5yZXN0b3JlKSxcbiAgICAgIGRhdGEucmVxdWVzdFxuICAgICk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jYXJ0bW9kZWwuanNcblxud2luZG93LmFwcC5DYXJ0TW9kZWwgPSBjbGFzcyBDYXJ0TW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLlNUQVRFX0NBUlQgPSAnY2FydCc7XG4gICAgdGhpcy5TVEFURV9ISVNUT1JZID0gJ2hpc3RvcnknO1xuXG4gICAgdGhpcy5faXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgIHRoaXMuaXNDYXJ0T3BlbkNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9jYXJ0U3RhdGUgPSB0aGlzLlNUQVRFX0NBUlQ7XG4gICAgdGhpcy5jYXJ0U3RhdGVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fZWRpdGFibGVJdGVtID0gbnVsbDtcbiAgICB0aGlzLmVkaXRhYmxlSXRlbUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgfVxuXG4gIGdldCBpc0NhcnRPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0NhcnRPcGVuO1xuICB9XG5cbiAgc2V0IGlzQ2FydE9wZW4odmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNDYXJ0T3BlbiA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faXNDYXJ0T3BlbiA9IHZhbHVlO1xuICAgIHRoaXMuaXNDYXJ0T3BlbkNoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IGNhcnRTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FydFN0YXRlO1xuICB9XG5cbiAgc2V0IGNhcnRTdGF0ZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9jYXJ0U3RhdGUgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2NhcnRTdGF0ZSA9IHZhbHVlO1xuICAgIHRoaXMuY2FydFN0YXRlQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgZWRpdGFibGVJdGVtKCkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0YWJsZUl0ZW07XG4gIH1cblxuICBnZXQgZWRpdGFibGVJdGVtTmV3KCkge1xuICAgIHJldHVybiB0aGlzLl9lZGl0YWJsZUl0ZW1OZXc7XG4gIH1cblxuICBvcGVuRWRpdG9yKGl0ZW0sIGlzTmV3KSB7XG4gICAgaWYgKHRoaXMuX2VkaXRhYmxlSXRlbSA9PT0gaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW1OZXcgPSBpc05ldyB8fCBmYWxzZTtcbiAgICB0aGlzLl9lZGl0YWJsZUl0ZW0gPSBpdGVtO1xuICAgIHRoaXMuZWRpdGFibGVJdGVtQ2hhbmdlZC5kaXNwYXRjaChpdGVtKTtcbiAgfVxuXG4gIGNsb3NlRWRpdG9yKCkge1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbU5ldyA9IGZhbHNlO1xuICAgIHRoaXMuX2VkaXRhYmxlSXRlbSA9IG51bGw7XG4gICAgdGhpcy5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmRpc3BhdGNoKG51bGwpO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY2FydG1vZGlmaWVyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ2FydE1vZGlmaWVyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcnRNb2RpZmllciA9IGZ1bmN0aW9uKGRhdGEsIGlzU2VsZWN0ZWQpIHtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMuaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQgfHwgZmFsc2U7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllcih0aGlzLmRhdGEsIHRoaXMuaXNTZWxlY3RlZCk7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5yZXN0b3JlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RpZmllcihkYXRhLmRhdGEsIGRhdGEuaXNTZWxlY3RlZCk7XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJ0TW9kaWZpZXIgPSBDYXJ0TW9kaWZpZXI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIENhcnRNb2RpZmllckNhdGVnb3J5XG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIENhcnRNb2RpZmllckNhdGVnb3J5ID0gZnVuY3Rpb24oZGF0YSwgbW9kaWZpZXJzKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLm1vZGlmaWVycyA9IG1vZGlmaWVycztcbiAgfTtcblxuICBDYXJ0TW9kaWZpZXJDYXRlZ29yeS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbW9kaWZpZXJzID0gdGhpcy5tb2RpZmllcnMubWFwKGZ1bmN0aW9uKG1vZGlmaWVyKSB7XG4gICAgICByZXR1cm4gbW9kaWZpZXIuY2xvbmUoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IGFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeSh0aGlzLmRhdGEsIG1vZGlmaWVycyk7XG4gIH07XG5cbiAgQ2FydE1vZGlmaWVyQ2F0ZWdvcnkucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQ2FydE1vZGlmaWVyQ2F0ZWdvcnkoZGF0YS5kYXRhLCBkYXRhLm1vZGlmaWVycy5tYXAoQ2FydE1vZGlmaWVyLnByb3RvdHlwZS5yZXN0b3JlKSk7XG4gIH07XG5cbiAgd2luZG93LmFwcC5DYXJ0TW9kaWZpZXJDYXRlZ29yeSA9IENhcnRNb2RpZmllckNhdGVnb3J5O1xufSkoKTtcblxuLy9zcmMvanMvc2hhcmVkL2NoYXRtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQ2hhdE1hbmFnZXIgPSBjbGFzcyBDaGF0TWFuYWdlciB7XG4gIC8qIGdsb2JhbCBtb21lbnQsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihBbmFseXRpY3NNb2RlbCwgQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBTb2NrZXRDbGllbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLk1FU1NBR0VfVFlQRVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uJyxcbiAgICAgIERFVklDRTogJ2RldmljZSdcbiAgICB9O1xuICAgIHRoaXMuTUVTU0FHRV9TVEFUVVNFUyA9IHtcbiAgICAgIENIQVRfUkVRVUVTVDogJ2NoYXRfcmVxdWVzdCcsXG4gICAgICBDSEFUX1JFUVVFU1RfQUNDRVBURUQ6ICdjaGF0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOiAnY2hhdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIEdJRlRfUkVRVUVTVDogJ2dpZnRfcmVxdWVzdCcsXG4gICAgICBHSUZUX1JFUVVFU1RfQUNDRVBURUQ6ICdnaWZ0X3JlcXVlc3RfYWNjZXB0ZWQnLFxuICAgICAgR0lGVF9SRVFVRVNUX0RFQ0xJTkVEOiAnZ2lmdF9yZXF1ZXN0X2RlY2xpbmVkJyxcbiAgICAgIENIQVRfQ0xPU0VEOiAnY2hhdF9jbG9zZWQnXG4gICAgfTtcbiAgICB0aGlzLk9QRVJBVElPTlMgPSB7XG4gICAgICBDSEFUX01FU1NBR0U6ICdjaGF0X21lc3NhZ2UnLFxuICAgICAgU1RBVFVTX1JFUVVFU1Q6ICdzdGF0dXNfcmVxdWVzdCcsXG4gICAgICBTVEFUVVNfVVBEQVRFOiAnc3RhdHVzX3VwZGF0ZSdcbiAgICB9O1xuICAgIHRoaXMuUk9PTVMgPSB7XG4gICAgICBMT0NBVElPTjogJ2xvY2F0aW9uXycsXG4gICAgICBERVZJQ0U6ICdkZXZpY2VfJ1xuICAgIH07XG5cbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsID0gTG9jYXRpb25Nb2RlbDtcbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQgPSBTb2NrZXRDbGllbnQ7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DaGF0TW9kZWwuaXNQcmVzZW50Q2hhbmdlZC5hZGQoKCkgPT4gc2VsZi5fc2VuZFN0YXR1c1VwZGF0ZSgpKTtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCkpO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKCgpID0+IHNlbGYuX3NlbmRTdGF0dXNVcGRhdGUoKSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuaXNDb25uZWN0ZWRDaGFuZ2VkLmFkZChpc0Nvbm5lY3RlZCA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmlzQ29ubmVjdGVkID0gaXNDb25uZWN0ZWQ7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzVXBkYXRlKCk7XG4gICAgICBzZWxmLl9zZW5kU3RhdHVzUmVxdWVzdCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnN1YnNjcmliZSh0aGlzLlJPT01TLkxPQ0FUSU9OICsgdGhpcy5fTG9jYXRpb25Nb2RlbC5sb2NhdGlvbiwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19SRVFVRVNUOlxuICAgICAgICAgIHNlbGYuX29uU3RhdHVzUmVxdWVzdChtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBzZWxmLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURTpcbiAgICAgICAgICBzZWxmLl9vblN0YXR1c1VwZGF0ZShtZXNzYWdlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX1NvY2tldENsaWVudC5zdWJzY3JpYmUodGhpcy5ST09NUy5ERVZJQ0UgKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSwgbWVzc2FnZSA9PiB7XG4gICAgICBzd2l0Y2ggKG1lc3NhZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRTpcbiAgICAgICAgICBzZWxmLl9vbk1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Ugc2VsZi5PUEVSQVRJT05TLlNUQVRVU19VUERBVEU6XG4gICAgICAgICAgc2VsZi5fb25TdGF0dXNVcGRhdGUobWVzc2FnZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgbW9kZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuX0NoYXRNb2RlbDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubW9kZWwucmVzZXQoKTtcblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTWVzc2FnaW5nXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBzZW5kTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5kZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZTtcbiAgICBtZXNzYWdlLm9wZXJhdGlvbiA9IHRoaXMuT1BFUkFUSU9OUy5DSEFUX01FU1NBR0U7XG4gICAgbWVzc2FnZS50eXBlID0gbWVzc2FnZS50b19kZXZpY2UgP1xuICAgICAgdGhpcy5NRVNTQUdFX1RZUEVTLkRFVklDRSA6XG4gICAgICB0aGlzLk1FU1NBR0VfVFlQRVMuTE9DQVRJT047XG5cbiAgICB0aGlzLl9hZGRNZXNzYWdlSUQobWVzc2FnZSk7XG4gICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KG1lc3NhZ2UpO1xuXG4gICAgdmFyIHRvcGljID0gdGhpcy5fZ2V0VG9waWMobWVzc2FnZSk7XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0b3BpYywgbWVzc2FnZSk7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nQ2hhdChtZXNzYWdlKTtcbiAgfVxuXG4gIGFwcHJvdmVEZXZpY2UodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgdGhpcy5tb2RlbC5zZXRMYXN0UmVhZCh0b2tlbiwgbW9tZW50KCkudW5peCgpKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzUGVuZGluZ0RldmljZShkZXZpY2UpKSB7XG4gICAgICB0aGlzLm1vZGVsLnJlbW92ZVBlbmRpbmdEZXZpY2UoZGV2aWNlKTtcblxuICAgICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1QsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5hZGRBY3RpdmVEZXZpY2UoZGV2aWNlKTtcbiAgICB9XG4gIH1cblxuICBkZWNsaW5lRGV2aWNlKHRva2VuKSB7XG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKHRva2VuKTtcblxuICAgIGlmICh0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwucmVtb3ZlQWN0aXZlRGV2aWNlKGRldmljZSk7XG5cbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCxcbiAgICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICBzdGF0dXM6IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQsXG4gICAgICAgIHRvX2RldmljZTogZGV2aWNlLnRva2VuXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXRNZXNzYWdlTmFtZShtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgcmV0dXJuICdNZSc7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2UudXNlcm5hbWUgfHwgdGhpcy5nZXREZXZpY2VOYW1lKG1lc3NhZ2UuZGV2aWNlKTtcbiAgfVxuXG4gIGdldERldmljZU5hbWUodG9rZW4pIHtcbiAgICB2YXIgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9rZW4pO1xuXG4gICAgaWYgKGRldmljZSkge1xuICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlID09PSBkZXZpY2UudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuICdNZSc7XG4gICAgICB9XG5cbiAgICAgIGlmIChkZXZpY2UudXNlcm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGRldmljZS51c2VybmFtZTtcbiAgICAgIH1cblxuICAgICAgZm9yKHZhciBwIGluIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHMpIHtcbiAgICAgICAgaWYgKHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0udG9rZW4gPT09IGRldmljZS5zZWF0KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdHNbcF0ubmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnR3Vlc3QnO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBOb3RpZmljYXRpb25zXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBjaGVja0lmVW5yZWFkKGRldmljZV90b2tlbiwgbWVzc2FnZSkge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1vbWVudC51bml4KG1lc3NhZ2UucmVjZWl2ZWQpLmlzQWZ0ZXIobW9tZW50LnVuaXgobGFzdFJlYWQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRVbnJlYWRDb3VudChkZXZpY2VfdG9rZW4pID4gMDtcbiAgfVxuXG4gIGdldFVucmVhZENvdW50KGRldmljZV90b2tlbikge1xuICAgIGxldCBsYXN0UmVhZCA9IHRoaXMubW9kZWwuZ2V0TGFzdFJlYWQoZGV2aWNlX3Rva2VuKTtcblxuICAgIGlmICghbGFzdFJlYWQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZnJvbURhdGUgPSBtb21lbnQudW5peChsYXN0UmVhZCk7XG5cbiAgICByZXR1cm4gdGhpcy5tb2RlbC5oaXN0b3J5XG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS50eXBlID09PSBzZWxmLk1FU1NBR0VfVFlQRVMuREVWSUNFICYmIG1lc3NhZ2UuZGV2aWNlID09PSBkZXZpY2VfdG9rZW4pXG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbW9tZW50LnVuaXgobWVzc2FnZS5yZWNlaXZlZCkuaXNBZnRlcihmcm9tRGF0ZSkpXG4gICAgICAubGVuZ3RoO1xuICB9XG5cbiAgbWFya0FzUmVhZChkZXZpY2VfdG9rZW4pIHtcbiAgICB0aGlzLm1vZGVsLnNldExhc3RSZWFkKGRldmljZV90b2tlbiwgbW9tZW50KCkudW5peCgpKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgR2lmdHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHNlbmRHaWZ0KGl0ZW1zKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmdpZnREZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHN0YXR1czogdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVCxcbiAgICAgIHRvX2RldmljZTogdGhpcy5tb2RlbC5naWZ0RGV2aWNlLFxuICAgICAgdGV4dDogaXRlbXMucmVkdWNlKChyZXN1bHQsIGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gJycpIHtcbiAgICAgICAgICByZXN1bHQgKz0gJywgJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gaXRlbS5pdGVtLnRpdGxlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgJycpXG4gICAgfSk7XG4gIH1cblxuICBhY2NlcHRHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIGRlY2xpbmVHaWZ0KGRldmljZSkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVELFxuICAgICAgdG9fZGV2aWNlOiBkZXZpY2UudG9rZW5cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0R2lmdChkZXZpY2VfdG9rZW4pIHtcbiAgICBsZXQgZGV2aWNlID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UoZGV2aWNlX3Rva2VuKTtcbiAgXG4gICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gZGV2aWNlX3Rva2VuO1xuICAgIHRoaXMubW9kZWwuZ2lmdFNlYXQgPSBkZXZpY2Uuc2VhdDtcbiAgfVxuXG4gIGVuZEdpZnQoKSB7XG4gICAgdGhpcy5tb2RlbC5naWZ0RGV2aWNlID0gbnVsbDtcbiAgICB0aGlzLm1vZGVsLmdpZnRTZWF0ID0gbnVsbDtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBfb25NZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBpZiAoIW1lc3NhZ2UuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5tb2RlbC5oaXN0b3J5LmZpbHRlcihtc2cgPT4gbXNnLmlkID09PSBtZXNzYWdlLmlkKS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWVzc2FnZS5yZWNlaXZlZCA9IG1vbWVudCgpLnVuaXgoKTtcblxuICAgIHZhciBkZXZpY2UgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmdldERldmljZShtZXNzYWdlLmRldmljZSksXG4gICAgICAgIGdpZnREZXZpY2UgPSB0aGlzLm1vZGVsLmdpZnREZXZpY2UsXG4gICAgICAgIHNlYXQgPSB0aGlzLl9Mb2NhdGlvbk1vZGVsLnNlYXQudG9rZW47XG5cbiAgICBpZiAoIWRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgobWVzc2FnZS5zdGF0dXMgPT09IHRoaXMuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1QpICYmXG4gICAgICAgICF0aGlzLm1vZGVsLmlzUGVuZGluZ0RldmljZShkZXZpY2UpICYmXG4gICAgICAgICF0aGlzLm1vZGVsLmlzQWN0aXZlRGV2aWNlKGRldmljZSkpIHtcbiAgICAgIHRoaXMubW9kZWwuYWRkUGVuZGluZ0RldmljZShkZXZpY2UpO1xuICAgICAgdGhpcy5tb2RlbC5jaGF0UmVxdWVzdFJlY2VpdmVkLmRpc3BhdGNoKGRldmljZS50b2tlbik7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUICYmXG4gICAgICAgIHRoaXMubW9kZWwuaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSkge1xuICAgICAgdGhpcy5tb2RlbC5naWZ0UmVxdWVzdFJlY2VpdmVkLmRpc3BhdGNoKGRldmljZSwgbWVzc2FnZS50ZXh0KTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UpIHtcbiAgICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gdGhpcy5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRCkge1xuICAgICAgICBpZiAoZ2lmdERldmljZSAmJiBnaWZ0RGV2aWNlID09PSBtZXNzYWdlLmRldmljZSkge1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdEFjY2VwdGVkLmRpc3BhdGNoKHRydWUpO1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICAgIGlmIChnaWZ0RGV2aWNlICYmIGdpZnREZXZpY2UgPT09IG1lc3NhZ2UuZGV2aWNlKSB7XG4gICAgICAgICAgdGhpcy5tb2RlbC5naWZ0QWNjZXB0ZWQuZGlzcGF0Y2goZmFsc2UpO1xuICAgICAgICAgIHRoaXMubW9kZWwuZ2lmdERldmljZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICAgIHRoaXMuZGVjbGluZURldmljZShkZXZpY2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLm9wZXJhdGlvbiA9PT0gdGhpcy5PUEVSQVRJT05TLkNIQVRfTUVTU0FHRSkge1xuICAgICAgbWVzc2FnZS51c2VybmFtZSA9IHRoaXMuZ2V0RGV2aWNlTmFtZShkZXZpY2UpO1xuICAgICAgdGhpcy5tb2RlbC5hZGRIaXN0b3J5KG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIHRoaXMubW9kZWwubWVzc2FnZVJlY2VpdmVkLmRpc3BhdGNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgX29uU3RhdHVzUmVxdWVzdChtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3NlbmRTdGF0dXNVcGRhdGUobWVzc2FnZS5kZXZpY2UpO1xuICB9XG5cbiAgX29uU3RhdHVzVXBkYXRlKG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5kZXZpY2UgPT09IHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRldmljZSA9IHRoaXMuX0xvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKG1lc3NhZ2UuZGV2aWNlKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICBkZXZpY2UgPSB7XG4gICAgICAgIHRva2VuOiBtZXNzYWdlLmRldmljZSxcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwuYWRkRGV2aWNlKGRldmljZSk7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmlzX2F2YWlsYWJsZSAmJiBkZXZpY2UuaXNfYXZhaWxhYmxlKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHtcbiAgICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuQ0hBVF9NRVNTQUdFLFxuICAgICAgICB0eXBlOiB0aGlzLk1FU1NBR0VfVFlQRVMuREVWSUNFLFxuICAgICAgICBkZXZpY2U6IGRldmljZS50b2tlbixcbiAgICAgICAgc3RhdHVzOiB0aGlzLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQsXG4gICAgICAgIHRvX2RldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VcbiAgICAgIH07XG4gICAgICB0aGlzLl9hZGRNZXNzYWdlSUQoaGlzdG9yeSk7XG4gICAgICB0aGlzLm1vZGVsLmFkZEhpc3RvcnkoaGlzdG9yeSk7XG4gICAgfVxuXG4gICAgZGV2aWNlLmlzX2F2YWlsYWJsZSA9IEJvb2xlYW4obWVzc2FnZS5pc19hdmFpbGFibGUpO1xuICAgIGRldmljZS5pc19wcmVzZW50ID0gQm9vbGVhbihtZXNzYWdlLmlzX3ByZXNlbnQpO1xuICAgIGRldmljZS5zZWF0ID0gbWVzc2FnZS5zZWF0O1xuICAgIGRldmljZS51c2VybmFtZSA9IG1lc3NhZ2UudXNlcm5hbWU7XG5cbiAgICB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZXNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX0xvY2F0aW9uTW9kZWwuZGV2aWNlcyk7XG4gIH1cblxuICBfc2VuZFN0YXR1c1JlcXVlc3QoKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmlzQ29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG1lc3NhZ2UgPSB7XG4gICAgICBvcGVyYXRpb246IHRoaXMuT1BFUkFUSU9OUy5TVEFUVVNfUkVRVUVTVCxcbiAgICAgIGRldmljZTogdGhpcy5fTG9jYXRpb25Nb2RlbC5kZXZpY2VcbiAgICB9O1xuXG4gICAgdGhpcy5fU29ja2V0Q2xpZW50LnNlbmQodGhpcy5fZ2V0VG9waWMobWVzc2FnZSksIG1lc3NhZ2UpO1xuICB9XG5cbiAgX3NlbmRTdGF0dXNVcGRhdGUoZGV2aWNlKSB7XG4gICAgaWYgKCF0aGlzLm1vZGVsLmlzQ29ubmVjdGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHByb2ZpbGUgPSB0aGlzLl9DdXN0b21lck1vZGVsLnByb2ZpbGUsXG4gICAgICAgIHVzZXJuYW1lO1xuXG4gICAgaWYgKHByb2ZpbGUgJiYgcHJvZmlsZS5maXJzdF9uYW1lKSB7XG4gICAgICB1c2VybmFtZSA9IHByb2ZpbGUuZmlyc3RfbmFtZSArICcgJyArIHByb2ZpbGUubGFzdF9uYW1lO1xuICAgIH1cblxuICAgIGxldCBtZXNzYWdlID0ge1xuICAgICAgb3BlcmF0aW9uOiB0aGlzLk9QRVJBVElPTlMuU1RBVFVTX1VQREFURSxcbiAgICAgIHRvX2RldmljZTogZGV2aWNlLFxuICAgICAgZGV2aWNlOiB0aGlzLl9Mb2NhdGlvbk1vZGVsLmRldmljZSxcbiAgICAgIHNlYXQ6IHRoaXMuX0xvY2F0aW9uTW9kZWwuc2VhdC50b2tlbixcbiAgICAgIGlzX2F2YWlsYWJsZTogdGhpcy5tb2RlbC5pc0VuYWJsZWQsXG4gICAgICBpc19wcmVzZW50OiB0aGlzLm1vZGVsLmlzUHJlc2VudCxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZVxuICAgIH07XG5cbiAgICB0aGlzLl9Tb2NrZXRDbGllbnQuc2VuZCh0aGlzLl9nZXRUb3BpYyhtZXNzYWdlKSwgbWVzc2FnZSk7XG4gIH1cblxuICBfZ2V0VG9waWMobWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1lc3NhZ2UudG9fZGV2aWNlID9cbiAgICAgICAgdGhpcy5ST09NUy5ERVZJQ0UgKyBtZXNzYWdlLnRvX2RldmljZSA6XG4gICAgICAgIHRoaXMuUk9PTVMuTE9DQVRJT04gKyB0aGlzLl9Mb2NhdGlvbk1vZGVsLmxvY2F0aW9uO1xuICB9XG5cbiAgX2FkZE1lc3NhZ2VJRChtZXNzYWdlKSB7XG4gICAgbWVzc2FnZS5pZCA9IG1lc3NhZ2UuaWQgfHwgJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBjID0+IHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2fDAsXG4gICAgICAgICAgdiA9IGMgPT09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2NoYXRtb2RlbC5qc1xuXG53aW5kb3cuYXBwLkNoYXRNb2RlbCA9IGNsYXNzIENoYXRNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2NoYXRfcHJlZmVyZW5jZXMnKTtcbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY2hhdF9oaXN0b3J5Jyk7XG5cbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuaXNFbmFibGVkQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuaXNQcmVzZW50Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMucGVuZGluZ0RldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jaGF0UmVxdWVzdFJlY2VpdmVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLmhpc3RvcnlDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5tZXNzYWdlUmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICBcbiAgICB0aGlzLmdpZnRSZXF1ZXN0UmVjZWl2ZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmdpZnRBY2NlcHRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fZ2lmdFNlYXQgPSBudWxsO1xuICAgIHRoaXMuZ2lmdFNlYXRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9naWZ0RGV2aWNlID0gbnVsbDtcbiAgICB0aGlzLmdpZnREZXZpY2VDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLmdpZnRSZWFkeSA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuZ2lmdEFjY2VwdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBTTkFQQ29uZmlnLmNoYXQ7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMgPSBbXTtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzID0gW107XG4gICAgdGhpcy5fbGFzdFJlYWRzID0ge307XG5cbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLnJlYWQoKS50aGVuKHByZWZzID0+IHtcbiAgICAgIGlmICghcHJlZnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9pc0VuYWJsZWQgPSBCb29sZWFuKHByZWZzLmlzX2VuYWJsZWQpO1xuXG4gICAgICBzZWxmLl9hY3RpdmVEZXZpY2VzID0gcHJlZnMuYWN0aXZlX2RldmljZXMgfHwgW107XG4gICAgICBzZWxmLl9wZW5kaW5nRGV2aWNlcyA9IHByZWZzLnBlbmRpbmdfZGV2aWNlcyB8fCBbXTtcbiAgICAgIHNlbGYuX2xhc3RSZWFkcyA9IHByZWZzLmxhc3RfcmVhZHMgfHwge307XG4gICAgfSk7XG5cbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUucmVhZCgpLnRoZW4oaGlzdG9yeSA9PiB7XG4gICAgICBzZWxmLl9oaXN0b3J5ID0gaGlzdG9yeSB8fCBbXTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0Nvbm5lY3RlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBzZXQgaXNDb25uZWN0ZWQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5faXNDb25uZWN0ZWQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzQ29ubmVjdGVkQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9pc0Nvbm5lY3RlZCk7XG4gIH1cblxuICBnZXQgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0VuYWJsZWQ7XG4gIH1cblxuICBzZXQgaXNFbmFibGVkKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzRW5hYmxlZCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzRW5hYmxlZENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNFbmFibGVkKTtcblxuICAgIHRoaXMuX3VwZGF0ZVByZWZlcmVuY2VzKCk7XG4gIH1cblxuICBnZXQgaXNQcmVzZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9pc1ByZXNlbnQ7XG4gIH1cblxuICBzZXQgaXNQcmVzZW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2lzUHJlc2VudCA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1ByZXNlbnQgPSBCb29sZWFuKHZhbHVlKTtcbiAgICB0aGlzLmlzUHJlc2VudENoYW5nZWQuZGlzcGF0Y2godGhpcy5faXNQcmVzZW50KTtcbiAgfVxuXG4gIGdldCBnaWZ0RGV2aWNlKCkge1xuICAgIHJldHVybiB0aGlzLl9naWZ0RGV2aWNlO1xuICB9XG5cbiAgc2V0IGdpZnREZXZpY2UodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZ2lmdERldmljZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9naWZ0RGV2aWNlID0gdmFsdWU7XG4gICAgdGhpcy5naWZ0RGV2aWNlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9naWZ0RGV2aWNlKTtcbiAgfVxuXG4gIGdldCBnaWZ0U2VhdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2lmdFNlYXQ7XG4gIH1cblxuICBzZXQgZ2lmdFNlYXQodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZ2lmdFNlYXQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZ2lmdFNlYXQgPSB2YWx1ZTtcbiAgICB0aGlzLmdpZnRTZWF0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9naWZ0U2VhdCk7XG4gIH1cblxuICBnZXQgcGVuZGluZ0RldmljZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BlbmRpbmdEZXZpY2VzO1xuICB9XG5cbiAgc2V0IHBlbmRpbmdEZXZpY2VzKHZhbHVlKSB7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLnBlbmRpbmdEZXZpY2VzKTtcbiAgfVxuXG4gIGdldCBhY3RpdmVEZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmVEZXZpY2VzO1xuICB9XG5cbiAgc2V0IGFjdGl2ZURldmljZXModmFsdWUpIHtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLmFjdGl2ZURldmljZXMpO1xuICB9XG5cbiAgaXNBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpICE9PSAtMTtcbiAgfVxuXG4gIGlzUGVuZGluZ0RldmljZShkZXZpY2UpIHtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nRGV2aWNlcy5pbmRleE9mKGRldmljZS50b2tlbiB8fCBkZXZpY2UpICE9PSAtMTtcbiAgfVxuXG4gIGFkZEFjdGl2ZURldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9hY3RpdmVEZXZpY2VzLnB1c2goZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5hY3RpdmVEZXZpY2VzID0gdGhpcy5fYWN0aXZlRGV2aWNlcztcbiAgfVxuXG4gIGFkZFBlbmRpbmdEZXZpY2UoZGV2aWNlKSB7XG4gICAgdGhpcy5fcGVuZGluZ0RldmljZXMucHVzaChkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLnBlbmRpbmdEZXZpY2VzID0gdGhpcy5fcGVuZGluZ0RldmljZXM7XG4gIH1cblxuICByZW1vdmVBY3RpdmVEZXZpY2UoZGV2aWNlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5hY3RpdmVEZXZpY2VzLmluZGV4T2YoZGV2aWNlLnRva2VuIHx8IGRldmljZSk7XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMuYWN0aXZlRGV2aWNlcyA9IHRoaXMuX2FjdGl2ZURldmljZXM7XG4gIH1cblxuICByZW1vdmVQZW5kaW5nRGV2aWNlKGRldmljZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMucGVuZGluZ0RldmljZXMuaW5kZXhPZihkZXZpY2UudG9rZW4gfHwgZGV2aWNlKTtcbiAgICB0aGlzLl9wZW5kaW5nRGV2aWNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMucGVuZGluZ0RldmljZXMgPSB0aGlzLl9wZW5kaW5nRGV2aWNlcztcbiAgfVxuXG4gIGdldCBoaXN0b3J5KCkge1xuICAgIHJldHVybiB0aGlzLl9oaXN0b3J5O1xuICB9XG5cbiAgc2V0IGhpc3RvcnkodmFsdWUpIHtcbiAgICB0aGlzLl9oaXN0b3J5ID0gdmFsdWUgfHwgW107XG5cbiAgICB0aGlzLmhpc3RvcnlDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2hpc3RvcnkpO1xuICAgIHRoaXMuX3VwZGF0ZUhpc3RvcnkoKTtcbiAgfVxuXG4gIGFkZEhpc3RvcnkobWVzc2FnZSkge1xuICAgIHRoaXMuX2hpc3RvcnkucHVzaChtZXNzYWdlKTtcbiAgICB0aGlzLmhpc3RvcnkgPSB0aGlzLl9oaXN0b3J5O1xuICB9XG5cbiAgZ2V0TGFzdFJlYWQoZGV2aWNlKSB7XG4gICAgbGV0IHRva2VuID0gZGV2aWNlLnRva2VuIHx8IGRldmljZTtcbiAgICByZXR1cm4gdGhpcy5fbGFzdFJlYWRzW3Rva2VuXSB8fCBudWxsO1xuICB9XG5cbiAgc2V0TGFzdFJlYWQoZGV2aWNlLCB2YWx1ZSkge1xuICAgIGxldCB0b2tlbiA9IGRldmljZS50b2tlbiB8fCBkZXZpY2U7XG4gICAgdGhpcy5fbGFzdFJlYWRzW3Rva2VuXSA9IHZhbHVlO1xuICAgIHRoaXMuX3VwZGF0ZVByZWZlcmVuY2VzKCk7XG4gIH1cblxuICBzYXZlKCkge1xuICAgIHRoaXMuX3VwZGF0ZUhpc3RvcnkoKTtcbiAgICB0aGlzLl91cGRhdGVQcmVmZXJlbmNlcygpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0aGlzLl9pc0VuYWJsZWQgPSB0aGlzLl9pc1ByZXNlbnQgPSBmYWxzZTtcbiAgICB0aGlzLl9oaXN0b3J5ID0gW107XG4gICAgdGhpcy5fYWN0aXZlRGV2aWNlcyA9IFtdO1xuICAgIHRoaXMuX3BlbmRpbmdEZXZpY2VzID0gW107XG5cbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUuY2xlYXIoKTtcbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLmNsZWFyKCk7XG4gIH1cblxuICBfdXBkYXRlSGlzdG9yeSgpIHtcbiAgICB0aGlzLl9oaXN0b3J5U3RvcmUud3JpdGUodGhpcy5oaXN0b3J5KTtcbiAgfVxuXG4gIF91cGRhdGVQcmVmZXJlbmNlcygpIHtcbiAgICB0aGlzLl9wcmVmZXJlbmNlc1N0b3JlLndyaXRlKHtcbiAgICAgIGlzX2VuYWJsZWQ6IHRoaXMuaXNFbmFibGVkLFxuICAgICAgYWN0aXZlX2RldmljZXM6IHRoaXMuYWN0aXZlRGV2aWNlcyxcbiAgICAgIHBlbmRpbmdfZGV2aWNlczogdGhpcy5wZW5kaW5nRGV2aWNlcyxcbiAgICAgIGxhc3RfcmVhZHM6IHRoaXMuX2xhc3RSZWFkc1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvY3VzdG9tZXJtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuQ3VzdG9tZXJNYW5hZ2VyID0gY2xhc3MgQ3VzdG9tZXJNYW5hZ2VyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCAqL1xuXG4gIGNvbnN0cnVjdG9yKENvbmZpZywgRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCkge1xuICAgIHRoaXMuX2FwaSA9IER0c0FwaTtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9jdXN0b21lckFwcElkID0gRW52aXJvbm1lbnQuY3VzdG9tZXJfYXBwbGljYXRpb24uY2xpZW50X2lkO1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9DdXN0b21lck1vZGVsO1xuICB9XG5cbiAgZ2V0IGN1c3RvbWVyTmFtZSgpIHtcbiAgICBpZiAodGhpcy5tb2RlbC5pc0VuYWJsZWQgJiYgdGhpcy5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIXRoaXMubW9kZWwuaXNHdWVzdCkge1xuICAgICAgdmFyIG5hbWUgPSAnJztcblxuICAgICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmZpcnN0X25hbWUpIHtcbiAgICAgICAgbmFtZSArPSBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZS5maXJzdF9uYW1lO1xuICAgICAgfVxuXG4gICAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUubGFzdF9uYW1lKSB7XG4gICAgICAgIG5hbWUgKz0gJyAnICsgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGUubGFzdF9uYW1lO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICByZXR1cm4gJ0d1ZXN0JztcbiAgfVxuXG4gIGxvZ291dCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlID0gbnVsbDtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGd1ZXN0TG9naW4oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9ICdndWVzdCc7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICBsb2dpbihjcmVkZW50aWFscykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLm9hdXRoMi5nZXRUb2tlbldpdGhDcmVkZW50aWFscyhcbiAgICAgICAgc2VsZi5fY3VzdG9tZXJBcHBJZCxcbiAgICAgICAgY3JlZGVudGlhbHMubG9naW4sXG4gICAgICAgIGNyZWRlbnRpYWxzLnBhc3N3b3JkXG4gICAgICApLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmVycm9yIHx8ICFyZXN1bHQuYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChyZXN1bHQuZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlc3Npb24gPSB7XG4gICAgICAgICAgYWNjZXNzX3Rva2VuOiByZXN1bHQuYWNjZXNzX3Rva2VuXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc3VsdC5leHBpcmVzX2luKSB7XG4gICAgICAgICAgc2Vzc2lvbi5leHBpcmVzID0gbW9tZW50KCkuYWRkKHJlc3VsdC5leHBpcmVzX2luLCAnc2Vjb25kcycpLnVuaXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwuc2Vzc2lvbiA9IHNlc3Npb247XG5cbiAgICAgICAgc2VsZi5fbG9hZFByb2ZpbGUoKS50aGVuKHJlc29sdmUsIGUgPT4ge1xuICAgICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwuc2Vzc2lvbiA9IG51bGw7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBsb2dpblNvY2lhbCh0b2tlbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIHNlc3Npb24gPSB7XG4gICAgICAgIGFjY2Vzc190b2tlbjogdG9rZW4uYWNjZXNzX3Rva2VuXG4gICAgICB9O1xuXG4gICAgICBpZiAodG9rZW4uZXhwaXJlc19pbikge1xuICAgICAgICBzZXNzaW9uLmV4cGlyZXMgPSBtb21lbnQoKS5hZGQodG9rZW4uZXhwaXJlc19pbiwgJ3NlY29uZHMnKS51bml4KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwuc2Vzc2lvbiA9IHNlc3Npb247XG5cbiAgICAgIHNlbGYuX2xvYWRQcm9maWxlKCkudGhlbihyZXNvbHZlLCBlID0+IHtcbiAgICAgICAgc2VsZi5fQ3VzdG9tZXJNb2RlbC5zZXNzaW9uID0gbnVsbDtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzaWduVXAocmVnaXN0cmF0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZWdpc3RyYXRpb24uY2xpZW50X2lkID0gc2VsZi5fY3VzdG9tZXJBcHBJZDtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci5zaWduVXAocmVnaXN0cmF0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5sb2dpbih7XG4gICAgICAgICAgbG9naW46IHJlZ2lzdHJhdGlvbi51c2VybmFtZSxcbiAgICAgICAgICBwYXNzd29yZDogcmVnaXN0cmF0aW9uLnBhc3N3b3JkXG4gICAgICAgIH0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVQcm9maWxlKHByb2ZpbGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5jdXN0b21lci51cGRhdGVQcm9maWxlKHByb2ZpbGUpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9DdXN0b21lck1vZGVsLnByb2ZpbGUgPSBwcm9maWxlO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgY2hhbmdlUGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLmNoYW5nZVBhc3N3b3JkKHJlcXVlc3QpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogc2VsZi5fQ3VzdG9tZXJNb2RlbC5lbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcmVxdWVzdC5uZXdfcGFzc3dvcmRcbiAgICAgICAgfSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0UGFzc3dvcmQocmVxdWVzdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fYXBpLmN1c3RvbWVyLnJlc2V0UGFzc3dvcmQocmVxdWVzdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBfbG9hZFByb2ZpbGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLl9hcGkuY3VzdG9tZXIuZ2V0UHJvZmlsZSgpLnRoZW4ocHJvZmlsZSA9PiB7XG4gICAgICAgIHNlbGYuX0N1c3RvbWVyTW9kZWwucHJvZmlsZSA9IHByb2ZpbGU7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9jdXN0b21lcm1vZGVsLmpzXG5cbndpbmRvdy5hcHAuQ3VzdG9tZXJNb2RlbCA9IGNsYXNzIEN1c3RvbWVyTW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKENvbmZpZywgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fYWNjb3VudFN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2N1c3RvbWVyJyk7XG4gICAgdGhpcy5fc2Vzc2lvblN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2N1c3RvbWVyX2FjY2Vzc3Rva2VuJyk7XG5cbiAgICB0aGlzLl9wcm9maWxlID0gbnVsbDtcbiAgICB0aGlzLl9zZXNzaW9uID0gbnVsbDtcblxuICAgIHRoaXMuX2lzR3Vlc3QgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0VuYWJsZWQgPSBCb29sZWFuKENvbmZpZy5hY2NvdW50cyk7XG5cbiAgICB0aGlzLnByb2ZpbGVDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9hY2NvdW50U3RvcmUucmVhZCgpLnRoZW4oYWNjb3VudCA9PiB7XG4gICAgICBzZWxmLl9pc0d1ZXN0ID0gYWNjb3VudCAmJiBhY2NvdW50LmlzX2d1ZXN0O1xuXG4gICAgICBpZiAoIWFjY291bnQgfHwgYWNjb3VudC5pc19ndWVzdCkge1xuICAgICAgICBzZWxmLl9wcm9maWxlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzZWxmLl9wcm9maWxlID0gYWNjb3VudC5wcm9maWxlO1xuICAgICAgfVxuXG4gICAgICBzZWxmLnByb2ZpbGVDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX3Byb2ZpbGUpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9pc0VuYWJsZWQpO1xuICB9XG5cbiAgZ2V0IGlzQXV0aGVudGljYXRlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQgJiYgKEJvb2xlYW4odGhpcy5wcm9maWxlKSB8fCB0aGlzLmlzR3Vlc3QpO1xuICB9XG5cbiAgZ2V0IGlzR3Vlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNFbmFibGVkICYmIEJvb2xlYW4odGhpcy5faXNHdWVzdCk7XG4gIH1cblxuICBnZXQgaGFzQ3JlZGVudGlhbHMoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5pc0F1dGhlbnRpY2F0ZWQgJiYgIXRoaXMuaXNHdWVzdCAmJiB0aGlzLnByb2ZpbGUudHlwZSA9PT0gMSk7XG4gIH1cblxuICBnZXQgcHJvZmlsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvZmlsZTtcbiAgfVxuXG4gIHNldCBwcm9maWxlKHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX3Byb2ZpbGUgPSB2YWx1ZSB8fCBudWxsO1xuICAgIHRoaXMuX2lzR3Vlc3QgPSB2YWx1ZSA9PT0gJ2d1ZXN0JztcblxuICAgIGlmICghdmFsdWUpIHtcbiAgICAgIHRoaXMuX2FjY291bnRTdG9yZS5jbGVhcigpLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZWxmLl9pc0d1ZXN0ID0gZmFsc2U7XG4gICAgICAgIHNlbGYucHJvZmlsZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fcHJvZmlsZSk7XG4gICAgICAgIHNlbGYuc2Vzc2lvbiA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9hY2NvdW50U3RvcmUud3JpdGUoe1xuICAgICAgICBwcm9maWxlOiB0aGlzLl9wcm9maWxlLFxuICAgICAgICBpc19ndWVzdDogdGhpcy5faXNHdWVzdFxuICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYucHJvZmlsZUNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fcHJvZmlsZSk7XG5cbiAgICAgICAgaWYgKCF2YWx1ZSB8fCBzZWxmLl9pc0d1ZXN0KSB7XG4gICAgICAgICAgc2VsZi5zZXNzaW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb247XG4gIH1cblxuICBzZXQgc2Vzc2lvbih2YWx1ZSkge1xuICAgIHRoaXMuX3Nlc3Npb24gPSB2YWx1ZSB8fCBudWxsO1xuXG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgdGhpcy5fc2Vzc2lvblN0b3JlLmNsZWFyKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fc2Vzc2lvblN0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2RhdGFtYW5hZ2VyLmpzXG5cbndpbmRvdy5hcHAuRGF0YU1hbmFnZXIgPSBjbGFzcyBEYXRhTWFuYWdlciB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoRGF0YVByb3ZpZGVyLCBMb2dnZXIsIFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9Mb2dnZXIgPSBMb2dnZXI7XG4gICAgdGhpcy5fU05BUEVudmlyb25tZW50ID0gU05BUEVudmlyb25tZW50O1xuXG4gICAgdGhpcy5ob21lQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubWVudUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmNhdGVnb3J5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuaXRlbUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX0NBQ0hFQUJMRV9NRURJQV9LSU5EUyA9IFtcbiAgICAgIDQxLCA1MSwgNTgsIDYxXG4gICAgXTtcbiAgfVxuXG4gIGdldCBwcm92aWRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5fRGF0YVByb3ZpZGVyO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fY2FjaGUgPSB7XG4gICAgICBtZW51OiB7fSxcbiAgICAgIGNhdGVnb3J5OiB7fSxcbiAgICAgIGl0ZW06IHt9LFxuICAgICAgbWVkaWE6IHt9XG4gICAgfTtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZygnSW5pdGlhbGl6aW5nIGRhdGEgbWFuYWdlci4nKTtcblxuICAgIHRoaXMucHJvdmlkZXIuZGlnZXN0KCkudGhlbihkaWdlc3QgPT4ge1xuICAgICAgdmFyIG1lbnVTZXRzID0gZGlnZXN0Lm1lbnVfc2V0cy5tYXAobWVudSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5wcm92aWRlci5tZW51KG1lbnUudG9rZW4pXG4gICAgICAgICAgICAudGhlbihkYXRhID0+IHNlbGYuX2NhY2hlLm1lbnVbbWVudS50b2tlbl0gPSBzZWxmLl9maWx0ZXJNZW51KGRhdGEpKVxuICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSwgcmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBtZW51Q2F0ZWdvcmllcyA9IGRpZ2VzdC5tZW51X2NhdGVnb3JpZXMubWFwKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnByb3ZpZGVyLmNhdGVnb3J5KGNhdGVnb3J5LnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5jYXRlZ29yeVtjYXRlZ29yeS50b2tlbl0gPSBzZWxmLl9maWx0ZXJDYXRlZ29yeShkYXRhKSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVudUl0ZW1zID0gZGlnZXN0Lm1lbnVfaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYucHJvdmlkZXIuaXRlbShpdGVtLnRva2VuKVxuICAgICAgICAgICAgLnRoZW4oZGF0YSA9PiBzZWxmLl9jYWNoZS5pdGVtW2l0ZW0udG9rZW5dID0gZGF0YSlcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgbWVkaWFzID0gZGlnZXN0Lm1lZGlhXG4gICAgICAgIC5maWx0ZXIobWVkaWEgPT4gc2VsZi5fQ0FDSEVBQkxFX01FRElBX0tJTkRTLmluZGV4T2YobWVkaWEua2luZCkgIT09IC0xKVxuICAgICAgICAubWFwKG1lZGlhID0+IHtcbiAgICAgICAgICB2YXIgd2lkdGgsIGhlaWdodDtcblxuICAgICAgICAgIHN3aXRjaCAobWVkaWEua2luZCkge1xuICAgICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICAgIHdpZHRoID0gMzcwO1xuICAgICAgICAgICAgICBoZWlnaHQgPSAzNzA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICAgICAgd2lkdGggPSA2MDA7XG4gICAgICAgICAgICAgIGhlaWdodCA9IDYwMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgICB3aWR0aCA9IDEwMDtcbiAgICAgICAgICAgICAgaGVpZ2h0ID0gMTAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtZWRpYS53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIG1lZGlhLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICAgIHJldHVybiBtZWRpYTtcbiAgICAgICAgfSlcbiAgICAgICAgLm1hcChtZWRpYSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHNlbGYucHJvdmlkZXIubWVkaWEobWVkaWEpXG4gICAgICAgICAgICAgIC50aGVuKGltZyA9PiBzZWxmLl9jYWNoZS5tZWRpYVttZWRpYS50b2tlbl0gPSBpbWcpXG4gICAgICAgICAgICAgIC50aGVuKHJlc29sdmUsIHJlc29sdmUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBEaWdlc3QgY29udGFpbnMgJHttZW51U2V0cy5sZW5ndGh9IG1lbnVzLCBgICtcbiAgICAgICAgYCR7bWVudUNhdGVnb3JpZXMubGVuZ3RofSBjYXRlZ29yaWVzLCBgICtcbiAgICAgICAgYCR7bWVudUl0ZW1zLmxlbmd0aH0gaXRlbXMgYW5kIGAgK1xuICAgICAgICBgJHttZWRpYXMubGVuZ3RofSBmaWxlcy5gKTtcblxuICAgICAgdmFyIHRhc2tzID0gW11cbiAgICAgICAgLmNvbmNhdChtZW51U2V0cylcbiAgICAgICAgLmNvbmNhdChtZW51Q2F0ZWdvcmllcylcbiAgICAgICAgLmNvbmNhdChtZW51SXRlbXMpO1xuXG4gICAgICBQcm9taXNlLmFsbCh0YXNrcykudGhlbigoKSA9PiB7XG4gICAgICAgIFByb21pc2UuYWxsKG1lZGlhcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBob21lKCkgeyByZXR1cm4gdGhpcy5faG9tZTsgfVxuICBzZXQgaG9tZSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9ob21lID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5faG9tZSA9IHZhbHVlO1xuICAgICAgdGhpcy5wcm92aWRlci5ob21lKCkudGhlbihob21lID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2hvbWUpIHtcbiAgICAgICAgICBob21lID0gc2VsZi5fZmlsdGVySG9tZShob21lKTtcbiAgICAgICAgICBzZWxmLmhvbWVDaGFuZ2VkLmRpc3BhdGNoKGhvbWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9ob21lID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5ob21lQ2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBtZW51KCkgeyByZXR1cm4gdGhpcy5fbWVudTsgfVxuICBzZXQgbWVudSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9tZW51ID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5fbWVudSA9IHZhbHVlO1xuXG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX2NhY2hlZCgnbWVudScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudUNoYW5nZWQuZGlzcGF0Y2goZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJvdmlkZXIubWVudSh2YWx1ZSkudGhlbihtZW51ID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX21lbnUpIHtcbiAgICAgICAgICBtZW51ID0gc2VsZi5fZmlsdGVyTWVudShtZW51KTtcbiAgICAgICAgICBzZWxmLm1lbnVDaGFuZ2VkLmRpc3BhdGNoKG1lbnUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9tZW51ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5tZW51Q2hhbmdlZC5kaXNwYXRjaCh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjYXRlZ29yeSgpIHsgcmV0dXJuIHRoaXMuX2NhdGVnb3J5OyB9XG4gIHNldCBjYXRlZ29yeSh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9jYXRlZ29yeSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuX2NhdGVnb3J5ID0gdmFsdWU7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVkKCdjYXRlZ29yeScsIHZhbHVlKTtcblxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKGRhdGEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnByb3ZpZGVyLmNhdGVnb3J5KHZhbHVlKS50aGVuKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgaWYgKHNlbGYuX2NhdGVnb3J5KSB7XG4gICAgICAgICAgY2F0ZWdvcnkgPSBzZWxmLl9maWx0ZXJDYXRlZ29yeShjYXRlZ29yeSk7XG4gICAgICAgICAgc2VsZi5jYXRlZ29yeUNoYW5nZWQuZGlzcGF0Y2goY2F0ZWdvcnkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9jYXRlZ29yeSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuY2F0ZWdvcnlDaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGl0ZW0oKSB7IHJldHVybiB0aGlzLl9pdGVtOyB9XG4gIHNldCBpdGVtKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX2l0ZW0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB0aGlzLl9pdGVtID0gdmFsdWU7XG5cbiAgICAgIHZhciBkYXRhID0gdGhpcy5fY2FjaGVkKCdpdGVtJywgdmFsdWUpO1xuXG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5pdGVtQ2hhbmdlZC5kaXNwYXRjaChkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm92aWRlci5pdGVtKHZhbHVlKS50aGVuKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoc2VsZi5faXRlbSkge1xuICAgICAgICAgIHNlbGYuaXRlbUNoYW5nZWQuZGlzcGF0Y2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2l0ZW0gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLml0ZW1DaGFuZ2VkLmRpc3BhdGNoKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgX2NhY2hlZChncm91cCwgaWQpIHtcbiAgICBpZiAoIXRoaXMuX2NhY2hlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdICYmIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0pIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZVtncm91cF1baWRdO1xuICAgIH1cbiAgICBlbHNlIGlmICghaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVbZ3JvdXBdO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgX2ZpbHRlckhvbWUoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBkYXRhLm1lbnVzID0gZGF0YS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IHNlbGYuX1NOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMyk7XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIF9maWx0ZXJNZW51KGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIF9maWx0ZXJDYXRlZ29yeShkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRhdGEuaXRlbXMgPSBkYXRhLml0ZW1zXG4gICAgICAuZmlsdGVyKGl0ZW0gPT4gc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgaXRlbS50eXBlICE9PSAzKTtcblxuICAgIHJldHVybiBkYXRhO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZGF0YXByb3ZpZGVyLmpzXG5cbndpbmRvdy5hcHAuRGF0YVByb3ZpZGVyID0gY2xhc3MgRGF0YVByb3ZpZGVyIHtcbiAgY29uc3RydWN0b3IoY29uZmlnLCBzZXJ2aWNlKSB7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX3NlcnZpY2UgPSBzZXJ2aWNlO1xuICAgIHRoaXMuX2NhY2hlID0ge307XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2NhY2hlID0ge307XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICBkaWdlc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdkaWdlc3QnLCAnZ2V0RGlnZXN0Jyk7XG4gIH1cblxuICBob21lKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnaG9tZScsICdnZXRNZW51cycpO1xuICB9XG5cbiAgYWR2ZXJ0aXNlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdhZHZlcnRpc2VtZW50cycsICdnZXRBZHZlcnRpc2VtZW50cycpO1xuICB9XG5cbiAgYmFja2dyb3VuZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdiYWNrZ3JvdW5kcycsICdnZXRCYWNrZ3JvdW5kcycpO1xuICB9XG5cbiAgZWxlbWVudHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFNuYXBEYXRhKCdlbGVtZW50cycsICdnZXRFbGVtZW50cycpO1xuICB9XG5cbiAgbWVudShpZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnbWVudScsICdnZXRNZW51JywgaWQpO1xuICB9XG5cbiAgY2F0ZWdvcnkoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2NhdGVnb3J5JywgJ2dldE1lbnVDYXRlZ29yeScsIGlkKTtcbiAgfVxuXG4gIGl0ZW0oaWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0U25hcERhdGEoJ2l0ZW0nLCAnZ2V0TWVudUl0ZW0nLCBpZCk7XG4gIH1cblxuICBzdXJ2ZXlzKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRTbmFwRGF0YSgnc3VydmV5cycsICdnZXRTdXJ2ZXlzJyk7XG4gIH1cblxuICBzZWF0cygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZCgnc2VhdHMnKSB8fCB0aGlzLl9zZXJ2aWNlLmxvY2F0aW9uLmdldFNlYXRzKCkudGhlbihkYXRhID0+IHtcbiAgICAgIGRhdGEgPSBkYXRhIHx8IFtdO1xuICAgICAgc2VsZi5fc3RvcmUoZGF0YSwgJ3NlYXRzJyk7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LCB0aGlzLl9vbkVycm9yKTtcbiAgfVxuXG4gIG1lZGlhKG1lZGlhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB0b2tlbiA9IG1lZGlhLnRva2VuICsgJ18nICsgbWVkaWEud2lkdGggKyAnXycgKyBtZWRpYS5oZWlnaHQ7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZCgnbWVkaWEnLCB0b2tlbikgfHwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKG1lZGlhLndpZHRoICYmIG1lZGlhLmhlaWdodCkge1xuICAgICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZyk7XG4gICAgICAgIGltZy5vbmVycm9yID0gKGUpID0+IHJlamVjdChlKTtcbiAgICAgICAgaW1nLnNyYyA9IHNlbGYuX2dldE1lZGlhVXJsKG1lZGlhLCBtZWRpYS53aWR0aCwgbWVkaWEuaGVpZ2h0LCBtZWRpYS5leHRlbnNpb24pO1xuXG4gICAgICAgIHNlbGYuX3N0b3JlKGltZywgJ21lZGlhJywgdG9rZW4pO1xuXG4gICAgICAgIGlmIChpbWcuY29tcGxldGUpIHtcbiAgICAgICAgICByZXNvbHZlKGltZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZWplY3QoJ01pc3NpbmcgaW1hZ2UgZGltZW5zaW9ucycpO1xuICAgICAgfVxuICAgIH0sIHRoaXMuX29uRXJyb3IpO1xuICB9XG5cbiAgX2dldFNuYXBEYXRhKG5hbWUsIG1ldGhvZCwgaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZChuYW1lLCBpZCkgfHwgdGhpcy5fc2VydmljZS5zbmFwW21ldGhvZF0odGhpcy5fY29uZmlnLmxvY2F0aW9uLCBpZCkudGhlbihkYXRhID0+IHtcbiAgICAgIGRhdGEgPSBkYXRhIHx8IFtdO1xuICAgICAgc2VsZi5fc3RvcmUoZGF0YSwgbmFtZSwgaWQpO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSwgdGhpcy5fb25FcnJvcik7XG4gIH1cblxuICBfb25FcnJvcihlKSB7XG4gICAgY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpO1xuICAgIHJldHVybiBlO1xuICB9XG5cbiAgX2NhY2hlZChncm91cCwgaWQpIHtcbiAgICBpZiAoaWQgJiYgdGhpcy5fY2FjaGVbZ3JvdXBdICYmIHRoaXMuX2NhY2hlW2dyb3VwXVtpZF0pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY2FjaGVbZ3JvdXBdW2lkXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFpZCAmJiB0aGlzLl9jYWNoZVtncm91cF0pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY2FjaGVbZ3JvdXBdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIF9zdG9yZShkYXRhLCBncm91cCwgaWQpIHtcbiAgICBpZiAoaWQpIHtcbiAgICAgIGlmICghdGhpcy5fY2FjaGVbZ3JvdXBdKSB7XG4gICAgICAgIHRoaXMuX2NhY2hlW2dyb3VwXSA9IHt9O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jYWNoZVtncm91cF1baWRdID0gZGF0YTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9jYWNoZVtncm91cF0gPSBkYXRhO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRNZWRpYVVybCgpIHtcblxuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvZGlhbG9nbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLkRpYWxvZ01hbmFnZXIgPSBjbGFzcyBEaWFsb2dNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hbGVydFJlcXVlc3RlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubm90aWZpY2F0aW9uUmVxdWVzdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5jb25maXJtUmVxdWVzdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5qb2JTdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5qb2JFbmRlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubW9kYWxTdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5tb2RhbEVuZGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fam9icyA9IDA7XG4gICAgdGhpcy5fbW9kYWxzID0gMDtcbiAgfVxuXG4gIGFsZXJ0KG1lc3NhZ2UsIHRpdGxlKSB7XG4gICAgdGhpcy5hbGVydFJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlLCB0aXRsZSk7XG4gIH1cblxuICBub3RpZmljYXRpb24obWVzc2FnZSkge1xuICAgIHRoaXMubm90aWZpY2F0aW9uUmVxdWVzdGVkLmRpc3BhdGNoKG1lc3NhZ2UpO1xuICB9XG5cbiAgY29uZmlybShtZXNzYWdlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHNlbGYuY29uZmlybVJlcXVlc3RlZC5kaXNwYXRjaChtZXNzYWdlLCByZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRKb2IoKSB7XG4gICAgdGhpcy5fam9icysrO1xuXG4gICAgaWYgKHRoaXMuX2pvYnMgPT09IDEpIHtcbiAgICAgIHRoaXMuam9iU3RhcnRlZC5kaXNwYXRjaCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9qb2JzO1xuICB9XG5cbiAgZW5kSm9iKGlkKSB7XG4gICAgdGhpcy5fam9icy0tO1xuXG4gICAgaWYgKHRoaXMuX2pvYnMgPT09IDApIHtcbiAgICAgIHRoaXMuam9iRW5kZWQuZGlzcGF0Y2goKTtcbiAgICB9XG4gIH1cblxuICBzdGFydE1vZGFsKCkge1xuICAgIHRoaXMuX21vZGFscysrO1xuXG4gICAgaWYgKHRoaXMuX21vZGFscyA9PT0gMSkge1xuICAgICAgdGhpcy5tb2RhbFN0YXJ0ZWQuZGlzcGF0Y2goKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbW9kYWxzO1xuICB9XG5cbiAgZW5kTW9kYWwoaWQpIHtcbiAgICB0aGlzLl9tb2RhbHMtLTtcblxuICAgIGlmICh0aGlzLl9tb2RhbHMgPT09IDApIHtcbiAgICAgIHRoaXMubW9kYWxFbmRlZC5kaXNwYXRjaCgpO1xuICAgIH1cbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2hlYXRtYXAuanNcblxud2luZG93LmFwcC5IZWF0TWFwID0gY2xhc3MgSGVhdE1hcCB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9saXN0ZW5lciA9IGUgPT4ge1xuICAgICAgc2VsZi5fb25DbGljayhlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2xpc3RlbmVyKTtcblxuICAgIHRoaXMuY2xpY2tlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fbGlzdGVuZXIpO1xuICB9XG5cbiAgX29uQ2xpY2soZSkge1xuICAgIGxldCBkYXRhID0ge1xuICAgICAgeDogZS5sYXllclggLyB0aGlzLl9lbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgeTogZS5sYXllclkgLyB0aGlzLl9lbGVtZW50LmNsaWVudEhlaWdodFxuICAgIH07XG5cbiAgICBpZiAoZGF0YS54IDwgMCB8fCBkYXRhLnkgPCAwIHx8IGRhdGEueCA+IDEgfHwgZGF0YS55ID4gMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2xpY2tlZC5kaXNwYXRjaChkYXRhKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL2xvY2F0aW9ubW9kZWwuanNcblxud2luZG93LmFwcC5Mb2NhdGlvbk1vZGVsID0gY2xhc3MgTG9jYXRpb25Nb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoU05BUEVudmlyb25tZW50LCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9sb2NhdGlvbiA9IFNOQVBFbnZpcm9ubWVudC5sb2NhdGlvbjtcblxuICAgIHRoaXMuX3NlYXRTdG9yZSA9IHN0b3JhZ2VQcm92aWRlcignc25hcF9zZWF0Jyk7XG5cbiAgICB0aGlzLl9zZWF0ID0ge307XG4gICAgdGhpcy5zZWF0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fc2VhdHMgPSBbXTtcbiAgICB0aGlzLnNlYXRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgdGhpcy5fZGV2aWNlID0gU05BUEVudmlyb25tZW50LmRldmljZTtcblxuICAgIHRoaXMuX2RldmljZXMgPSBbXTtcbiAgICB0aGlzLmRldmljZXNDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9zZWF0U3RvcmUucmVhZCgpLnRoZW4oc2VhdCA9PiB7XG4gICAgICBzZWxmLl9zZWF0ID0gc2VhdDtcblxuICAgICAgaWYgKHNlYXQpIHtcbiAgICAgICAgc2VsZi5zZWF0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLl9zZWF0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldCBsb2NhdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb247XG4gIH1cblxuICBnZXQgc2VhdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VhdDtcbiAgfVxuXG4gIHNldCBzZWF0KHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBvbGRTZWF0ID0gdGhpcy5fc2VhdCB8fCB7fTtcbiAgICB0aGlzLl9zZWF0ID0gdmFsdWUgfHwge307XG5cbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICB0aGlzLl9zZWF0U3RvcmUuY2xlYXIoKS50aGVuKCgpID0+IHtcbiAgICAgICAgc2VsZi5zZWF0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLl9zZWF0KTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fc2VhdCA9IG9sZFNlYXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9zZWF0U3RvcmUud3JpdGUodGhpcy5fc2VhdCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbGYuc2VhdENoYW5nZWQuZGlzcGF0Y2goc2VsZi5fc2VhdCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHNlbGYuX3NlYXQgPSBvbGRTZWF0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHNlYXRzKCkge1xuICAgIHJldHVybiB0aGlzLl9zZWF0cztcbiAgfVxuXG4gIHNldCBzZWF0cyh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9zZWF0cyA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWF0cyA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMuc2VhdHNDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX3NlYXRzKTtcbiAgfVxuXG4gIGdldCBkZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RldmljZTtcbiAgfVxuXG4gIGdldCBkZXZpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9kZXZpY2VzO1xuICB9XG5cbiAgc2V0IGRldmljZXModmFsdWUpIHtcbiAgICBpZiAodGhpcy5fZGV2aWNlcyA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9kZXZpY2VzID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5kZXZpY2VzQ2hhbmdlZC5kaXNwYXRjaCh0aGlzLl9kZXZpY2VzKTtcbiAgfVxuXG4gIGFkZERldmljZShkZXZpY2UpIHtcbiAgICB0aGlzLl9kZXZpY2VzLnB1c2goZGV2aWNlKTtcbiAgICB0aGlzLmRldmljZXMgPSB0aGlzLl9kZXZpY2VzO1xuICB9XG5cbiAgZ2V0U2VhdCh0b2tlbikge1xuICAgIHJldHVybiB0aGlzLnNlYXRzLmZpbHRlcihzZWF0ID0+IHNlYXQudG9rZW4gPT09IHRva2VuKVswXSB8fCBudWxsO1xuICB9XG5cbiAgZ2V0RGV2aWNlKGRldmljZSkge1xuICAgIHJldHVybiB0aGlzLmRldmljZXMuZmlsdGVyKGQgPT4gKGRldmljZS50b2tlbiB8fCBkZXZpY2UpID09PSBkLnRva2VuKVswXSB8fCBudWxsO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvbG9nZ2VyLmpzXG5cbndpbmRvdy5hcHAuTG9nZ2VyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQpIHtcbiAgICB0aGlzLl9TTkFQRW52aXJvbm1lbnQgPSBTTkFQRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fbG9nID0gbG9nNGphdmFzY3JpcHQuZ2V0TG9nZ2VyKCk7XG5cbiAgICB2YXIgYWpheEFwcGVuZGVyID0gbmV3IGxvZzRqYXZhc2NyaXB0LkFqYXhBcHBlbmRlcignL3NuYXAvbG9nJyk7XG4gICAgYWpheEFwcGVuZGVyLnNldFdhaXRGb3JSZXNwb25zZSh0cnVlKTtcbiAgICBhamF4QXBwZW5kZXIuc2V0TGF5b3V0KG5ldyBsb2c0amF2YXNjcmlwdC5Kc29uTGF5b3V0KCkpO1xuICAgIGFqYXhBcHBlbmRlci5zZXRUaHJlc2hvbGQobG9nNGphdmFzY3JpcHQuTGV2ZWwuRVJST1IpO1xuXG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKGFqYXhBcHBlbmRlcik7XG4gICAgdGhpcy5fbG9nLmFkZEFwcGVuZGVyKG5ldyBsb2c0amF2YXNjcmlwdC5Ccm93c2VyQ29uc29sZUFwcGVuZGVyKCkpO1xuICB9XG5cbiAgZGVidWcoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5kZWJ1ZyguLi5hcmdzKTtcbiAgfVxuXG4gIGluZm8oLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5pbmZvKC4uLmFyZ3MpO1xuICB9XG5cbiAgd2FybiguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLndhcm4oLi4uYXJncyk7XG4gIH1cblxuICBlcnJvciguLi5hcmdzKSB7XG4gICAgdGhpcy5fbG9nLmVycm9yKC4uLmFyZ3MpO1xuICB9XG5cbiAgZmF0YWwoLi4uYXJncykge1xuICAgIHRoaXMuX2xvZy5mYXRhbCguLi5hcmdzKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21hbmFnZW1lbnRzZXJ2aWNlLmpzXG5cbndpbmRvdy5hcHAuTWFuYWdlbWVudFNlcnZpY2UgPSBjbGFzcyBNYW5hZ2VtZW50U2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSwgU05BUEVudmlyb25tZW50KSB7XG4gICAgdGhpcy5fYXBpID0ge1xuICAgICAgJ3JvdGF0ZVNjcmVlbic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvcm90YXRlLXNjcmVlbicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdvcGVuQnJvd3Nlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvb3Blbi1icm93c2VyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ2Nsb3NlQnJvd3Nlcic6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvY2xvc2UtYnJvd3NlcicsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdzdGFydENhcmRSZWFkZXInOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L3N0YXJ0LWNhcmQtcmVhZGVyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3N0b3BDYXJkUmVhZGVyJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9zdG9wLWNhcmQtcmVhZGVyJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3Jlc2V0JzogJHJlc291cmNlKCcvbWFuYWdlbWVudC9yZXNldCcsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ0dFVCcgfSB9KSxcbiAgICAgICdnZXRTb3VuZFZvbHVtZSc6ICRyZXNvdXJjZSgnL21hbmFnZW1lbnQvdm9sdW1lJywge30sIHsgcXVlcnk6IHsgbWV0aG9kOiAnR0VUJyB9IH0pLFxuICAgICAgJ3NldFNvdW5kVm9sdW1lJzogJHJlc291cmNlKCcvbWFuYWdlbWVudC92b2x1bWUnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnZ2V0RGlzcGxheUJyaWdodG5lc3MnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L2JyaWdodG5lc3MnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSksXG4gICAgICAnc2V0RGlzcGxheUJyaWdodG5lc3MnOiAkcmVzb3VyY2UoJy9tYW5hZ2VtZW50L2JyaWdodG5lc3MnLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSlcbiAgICB9O1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgfVxuXG4gIHJvdGF0ZVNjcmVlbigpIHtcbiAgICB0aGlzLl9hcGkucm90YXRlU2NyZWVuLnF1ZXJ5KCk7XG4gIH1cblxuICBvcGVuQnJvd3Nlcih1cmwpIHtcbiAgICB0aGlzLl9hcGkub3BlbkJyb3dzZXIucXVlcnkoeyB1cmw6IHVybCB9KTtcbiAgfVxuXG4gIGNsb3NlQnJvd3NlcigpIHtcbiAgICB0aGlzLl9hcGkuY2xvc2VCcm93c2VyLnF1ZXJ5KCk7XG4gIH1cblxuICBzdGFydENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0YXJ0Q2FyZFJlYWRlci5xdWVyeSgpO1xuICB9XG5cbiAgc3RvcENhcmRSZWFkZXIoKSB7XG4gICAgdGhpcy5fYXBpLnN0b3BDYXJkUmVhZGVyLnF1ZXJ5KCk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYuX2FwaS5yZXNldC5xdWVyeSgpLiRwcm9taXNlLnRoZW4ocmVzb2x2ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hc3NpZ24oJy9zbmFwLycgKyBlbmNvZGVVUklDb21wb25lbnQoc2VsZi5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFNvdW5kVm9sdW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuZ2V0U291bmRWb2x1bWUucXVlcnkoKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHNldFNvdW5kVm9sdW1lKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zZXRTb3VuZFZvbHVtZS5xdWVyeSh7IHZhbHVlOiB2YWx1ZSB9KS4kcHJvbWlzZTtcbiAgfVxuXG4gIGdldERpc3BsYXlCcmlnaHRuZXNzKCkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuZ2V0RGlzcGxheUJyaWdodG5lc3MucXVlcnkoKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHNldERpc3BsYXlCcmlnaHRuZXNzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FwaS5zZXREaXNwbGF5QnJpZ2h0bmVzcy5xdWVyeSh7IHZhbHVlOiB2YWx1ZSB9KS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL21lZGlhc3RhcnRlci5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIC8qIGdsb2JhbCBzd2ZvYmplY3QgKi9cblxuICBmdW5jdGlvbiBNZWRpYVN0YXJ0ZXIoaWQpIHtcblxuICAgIHZhciBmbGFzaHZhcnMgPSB7fTtcbiAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgbWVudTogJ2ZhbHNlJyxcbiAgICAgIHdtb2RlOiAnZGlyZWN0JyxcbiAgICAgIGFsbG93RnVsbFNjcmVlbjogJ2ZhbHNlJ1xuICAgIH07XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBuYW1lOiBpZFxuICAgIH07XG5cbiAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICB0aGlzLl9nZXRRdWVyeVBhcmFtZXRlcigndXJsJyksXG4gICAgICBpZCxcbiAgICAgIHRoaXMuX2dldFF1ZXJ5UGFyYW1ldGVyKCd3aWR0aCcpLFxuICAgICAgdGhpcy5fZ2V0UXVlcnlQYXJhbWV0ZXIoJ2hlaWdodCcpLFxuICAgICAgJzE2LjAuMCcsXG4gICAgICAnZXhwcmVzc0luc3RhbGwuc3dmJyxcbiAgICAgIGZsYXNodmFycyxcbiAgICAgIHBhcmFtcyxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdWNjZXNzICE9PSB0cnVlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIE1lZGlhU3RhcnRlci5wcm90b3R5cGUuX2dldFF1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sIFwiXFxcXF1cIik7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChcIltcXFxcIyZdXCIgKyBuYW1lICsgXCI9KFteJiNdKilcIiksXG4gICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uaGFzaCk7XG4gICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyB1bmRlZmluZWQgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLk1lZGlhU3RhcnRlciA9IE1lZGlhU3RhcnRlcjtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9uYXZpZ2F0aW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLk5hdmlnYXRpb25NYW5hZ2VyID0gY2xhc3MgTmF2aWdhdGlvbk1hbmFnZXIge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpIHtcbiAgICB0aGlzLiQkbG9jYXRpb24gPSAkbG9jYXRpb247XG4gICAgdGhpcy4kJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2luZyA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsICgpID0+IHtcbiAgICAgIHZhciBwYXRoID0gc2VsZi4kJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgaWYgKHBhdGggPT09IHNlbGYuX3BhdGgpIHtcbiAgICAgICAgc2VsZi5sb2NhdGlvbkNoYW5nZWQuZGlzcGF0Y2goc2VsZi5fbG9jYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BhdGggPSBwYXRoO1xuICAgICAgc2VsZi5fbG9jYXRpb24gPSBzZWxmLmdldExvY2F0aW9uKHBhdGgpO1xuICAgICAgc2VsZi5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICAgIHNlbGYubG9jYXRpb25DaGFuZ2VkLmRpc3BhdGNoKHNlbGYuX2xvY2F0aW9uKTtcbiAgICB9KTtcblxuICAgIHRoaXMubG9jYXRpb25DaGFuZ2VkLmFkZChsb2NhdGlvbiA9PiBzZWxmLl9BbmFseXRpY3NNb2RlbC5sb2dOYXZpZ2F0aW9uKGxvY2F0aW9uKSk7XG4gIH1cblxuICBnZXQgcGF0aCgpIHsgcmV0dXJuIHRoaXMuX3BhdGg7IH1cbiAgc2V0IHBhdGgodmFsdWUpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmluZGV4T2YoJyMnKSxcbiAgICAgICAgcGF0aCA9IGkgIT09IC0xID8gdmFsdWUuc3Vic3RyaW5nKGkgKyAxKSA6IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbiA9IHRoaXMuZ2V0TG9jYXRpb24ocGF0aCk7XG4gIH1cblxuICBnZXQgbG9jYXRpb24oKSB7IHJldHVybiB0aGlzLl9sb2NhdGlvbjsgfVxuICBzZXQgbG9jYXRpb24odmFsdWUpIHtcbiAgICB0aGlzLl9sb2NhdGlvbiA9IHZhbHVlO1xuXG4gICAgdGhpcy5sb2NhdGlvbkNoYW5naW5nLmRpc3BhdGNoKHRoaXMuX2xvY2F0aW9uKTtcblxuICAgIHZhciBwYXRoID0gdGhpcy5fcGF0aCA9IHRoaXMuZ2V0UGF0aCh0aGlzLl9sb2NhdGlvbik7XG4gICAgdGhpcy4kJGxvY2F0aW9uLnBhdGgocGF0aCk7XG4gIH1cblxuICBnZXRQYXRoKGxvY2F0aW9uKSB7XG4gICAgaWYgKCFsb2NhdGlvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnRva2VuKSB7XG4gICAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZSArICcvJyArIGxvY2F0aW9uLnRva2VuO1xuICAgIH1cbiAgICBlbHNlIGlmIChsb2NhdGlvbi51cmwpIHtcbiAgICAgIHJldHVybiAnLycgKyBsb2NhdGlvbi50eXBlICsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGxvY2F0aW9uLnVybCk7XG4gICAgfVxuXG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdob21lJykge1xuICAgICAgcmV0dXJuICcvJztcbiAgICB9XG5cbiAgICByZXR1cm4gJy8nICsgbG9jYXRpb24udHlwZTtcbiAgfVxuXG4gIGdldExvY2F0aW9uKHBhdGgpIHtcbiAgICB2YXIgbWF0Y2ggPSAvXFwvKFxcdyspPyhcXC8oLispKT8vLmV4ZWMocGF0aCk7XG5cbiAgICBpZiAobWF0Y2ggJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHR5cGUgPSBtYXRjaFsxXTtcbiAgICAgIHZhciBwYXJhbSA9IG1hdGNoWzNdO1xuXG4gICAgICBpZiAocGFyYW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2godHlwZSkge1xuICAgICAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB1cmw6IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbSkgfTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4geyB0eXBlOiB0eXBlLCB0b2tlbjogcGFyYW0gfTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgdHlwZSA9ICdob21lJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsgdHlwZTogdHlwZSB9O1xuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGdvQmFjaygpIHtcbiAgICBpZiAodGhpcy5sb2NhdGlvbi50eXBlICE9PSAnaG9tZScgJiYgdGhpcy5sb2NhdGlvbi50eXBlICE9PSAnc2lnbmluJykge1xuICAgICAgdGhpcy4kJHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9vcmRlcm1hbmFnZXIuanNcblxud2luZG93LmFwcC5PcmRlck1hbmFnZXIgPSBjbGFzcyBPcmRlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIERhdGFQcm92aWRlciwgRHRzQXBpLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5fRHRzQXBpID0gRHRzQXBpO1xuICAgIHRoaXMuX0NoYXRNb2RlbCA9IENoYXRNb2RlbDtcbiAgICB0aGlzLl9DdXN0b21lck1vZGVsID0gQ3VzdG9tZXJNb2RlbDtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbCA9IExvY2F0aW9uTW9kZWw7XG4gICAgdGhpcy5fT3JkZXJNb2RlbCA9IE9yZGVyTW9kZWw7XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZChnaWZ0U2VhdCA9PiB7XG4gICAgICBpZiAoc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaCA9IHNlbGYubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydCA9IFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWdpZnRTZWF0KSB7XG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDYXJ0ID0gc2VsZi5tb2RlbC5vcmRlckNhcnRTdGFzaDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlci5zZWF0cygpLnRoZW4oc2VhdHMgPT4ge1xuICAgICAgc2VsZi5fTG9jYXRpb25Nb2RlbC5zZWF0cyA9IHNlYXRzO1xuICAgICAgc2VsZi5fRHRzQXBpLmxvY2F0aW9uLmdldEN1cnJlbnRTZWF0KCkudGhlbihzZWF0ID0+IHtcbiAgICAgICAgc2VsZi5fTG9jYXRpb25Nb2RlbC5zZWF0ID0gc2VhdDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9PcmRlck1vZGVsO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9PUkRFUik7XG4gICAgICBzZWxmLm1vZGVsLmNsZWFyV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFKTtcbiAgICAgIHNlbGYubW9kZWwuY2xlYXJXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VUKTtcblxuICAgICAgc2VsZi5jbGVhckNhcnQoKTtcbiAgICAgIHNlbGYuY2xlYXJDaGVjaygpO1xuICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHt9O1xuXG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENhcnQgYW5kIGNoZWNrc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgYWRkVG9DYXJ0KGl0ZW0pIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydC5wdXNoKGl0ZW0pO1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaCh0aGlzLm1vZGVsLm9yZGVyQ2FydCk7XG5cbiAgICBpZiAodGhpcy5fQ2hhdE1vZGVsLmdpZnRTZWF0KSB7XG4gICAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFJlYWR5LmRpc3BhdGNoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubW9kZWwub3JkZXJDYXJ0O1xuICB9XG5cbiAgcmVtb3ZlRnJvbUNhcnQoaXRlbSkge1xuICAgIHRoaXMubW9kZWwub3JkZXJDYXJ0ID0gdGhpcy5tb2RlbC5vcmRlckNhcnQuZmlsdGVyKGVudHJ5ID0+IGVudHJ5ICE9PSBpdGVtKTtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5vcmRlckNhcnQ7XG4gIH1cblxuICBjbGVhckNhcnQoKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlckNhcnQgPSBbXTtcbiAgICB0aGlzLm1vZGVsLm9yZGVyQ2FydFN0YXNoID0gW107XG5cbiAgICB0aGlzLl9DaGF0TW9kZWwuZ2lmdFNlYXQgPSBudWxsO1xuICB9XG5cbiAgY2xlYXJDaGVjayhpdGVtcykge1xuICAgIHZhciByZXN1bHQgPSBbXTtcblxuICAgIGlmIChpdGVtcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1vZGVsLm9yZGVyQ2hlY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBpdGVtcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2hlY2tbaV0gPT09IGl0ZW1zW2pdKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5tb2RlbC5vcmRlckNoZWNrW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubW9kZWwub3JkZXJDaGVjayA9IHJlc3VsdDtcbiAgfVxuXG4gIHN1Ym1pdENhcnQob3B0aW9ucykge1xuICAgIGlmICh0aGlzLm1vZGVsLm9yZGVyQ2FydC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCAwO1xuXG4gICAgaWYgKHRoaXMuX0NoYXRNb2RlbC5naWZ0U2VhdCkge1xuICAgICAgb3B0aW9ucyB8PSA0O1xuICAgIH1cblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfT1JERVIsXG4gICAgICBpdGVtczogdGhpcy5tb2RlbC5vcmRlckNhcnQubWFwKGVudHJ5ID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogZW50cnkuaXRlbS5vcmRlci50b2tlbixcbiAgICAgICAgICBxdWFudGl0eTogZW50cnkucXVhbnRpdHksXG4gICAgICAgICAgbW9kaWZpZXJzOiBlbnRyeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNvbmNhdChjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKChyZXN1bHQsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobW9kaWZpZXIuZGF0YS50b2tlbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0sIFtdKSk7XG4gICAgICAgICAgfSwgW10pLFxuICAgICAgICAgIG5vdGU6IGVudHJ5Lm5hbWUgfHwgJydcbiAgICAgICAgfTtcbiAgICAgIH0pLFxuICAgICAgdGlja2V0X3Rva2VuOiBzZWxmLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgICAgc2VhdF90b2tlbjogc2VsZi5fQ2hhdE1vZGVsLmdpZnRTZWF0LFxuICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fRHRzQXBpLndhaXRlci5wbGFjZU9yZGVyKHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAocmVzcG9uc2UuaXRlbV90b2tlbnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3BvbnNlLml0ZW1fdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLm1vZGVsLm9yZGVyQ2FydFtpXS5yZXF1ZXN0ID0gcmVzcG9uc2UuaXRlbV90b2tlbnNbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5tb2RlbC5vcmRlclRpY2tldCA9IHsgdG9rZW46IHJlc3BvbnNlLnRpY2tldF90b2tlbiB9O1xuXG4gICAgICAgIHNlbGYubW9kZWwub3JkZXJDaGVjayA9IHNlbGYubW9kZWwub3JkZXJDaGVjay5jb25jYXQoc2VsZi5tb2RlbC5vcmRlckNhcnQpO1xuICAgICAgICBzZWxmLmNsZWFyQ2FydCgpO1xuXG4gICAgICAgIHNlbGYuX0NoYXRNb2RlbC5naWZ0U2VhdCA9IG51bGw7XG5cbiAgICAgICAgbGV0IHdhdGNoZXIgPSBzZWxmLl9jcmVhdGVXYXRjaGVyKHNlbGYubW9kZWwuUkVRVUVTVF9LSU5EX09SREVSLCByZXNwb25zZSk7XG4gICAgICAgIHJlc29sdmUod2F0Y2hlcik7XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdENsb3Nlb3V0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMubW9kZWwuUkVRVUVTVF9LSU5EX0NMT1NFT1VULFxuICAgICAgdGlja2V0X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnRva2VuLFxuICAgIH07XG5cbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5wbGFjZVJlcXVlc3QocmVxdWVzdCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBzZWxmLm1vZGVsLm9yZGVyVGlja2V0ID0geyB0b2tlbjogcmVzcG9uc2UudGlja2V0X3Rva2VuIH07XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9DTE9TRU9VVCwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVxdWVzdEFzc2lzdGFuY2UoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAga2luZDogdGhpcy5tb2RlbC5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSxcbiAgICAgIHRpY2tldF90b2tlbjogdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbixcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIucGxhY2VSZXF1ZXN0KHJlcXVlc3QpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgc2VsZi5fc2F2ZVRpY2tldChyZXNwb25zZSk7XG4gICAgICByZXR1cm4gc2VsZi5fY3JlYXRlV2F0Y2hlcihzZWxmLm1vZGVsLlJFUVVFU1RfS0lORF9BU1NJU1RBTkNFLCByZXNwb25zZSk7XG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQcmljZShlbnRyeSkge1xuICAgIHZhciBtb2RpZmllcnMgPSBlbnRyeS5tb2RpZmllcnMucmVkdWNlKCh0b3RhbCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgIHJldHVybiB0b3RhbCArIGNhdGVnb3J5Lm1vZGlmaWVycy5yZWR1Y2UoKHRvdGFsLCBtb2RpZmllcikgPT4ge1xuICAgICAgICByZXR1cm4gdG90YWwgKyAobW9kaWZpZXIuaXNTZWxlY3RlZCAmJiBtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAgICAgbW9kaWZpZXIuZGF0YS5wcmljZSA6XG4gICAgICAgICAgMFxuICAgICAgICApO1xuICAgICAgfSwgMCk7XG4gICAgfSwgMCk7XG5cbiAgICByZXR1cm4gZW50cnkucXVhbnRpdHkgKiAobW9kaWZpZXJzICsgZW50cnkuaXRlbS5vcmRlci5wcmljZSk7XG4gIH1cblxuICBjYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpIHtcbiAgICByZXR1cm4gKGVudHJpZXMgPyBlbnRyaWVzLnJlZHVjZSgodG90YWwsIGVudHJ5KSA9PiB7XG4gICAgICByZXR1cm4gdG90YWwgKyBPcmRlck1hbmFnZXIucHJvdG90eXBlLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgICB9LCAwKSA6IDApO1xuICB9XG5cbiAgY2FsY3VsYXRlVGF4KGVudHJpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpICogdGhpcy5tb2RlbC50YXg7XG4gIH1cblxuICB1cGxvYWRTaWduYXR1cmUoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9EdHNBcGkudXBsb2FkLnVwbG9hZFRlbXAoZGF0YSwgJ2ltYWdlL3BuZycsICdzaWduYXR1cmUucG5nJylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRva2VuKTtcbiAgfVxuXG4gIGdlbmVyYXRlUGF5bWVudFRva2VuKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh0aGlzLl9DdXN0b21lck1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhdGhpcy5fQ3VzdG9tZXJNb2RlbC5pc0d1ZXN0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fRHRzQXBpLmN1c3RvbWVyLmluaXRpYWxpemVQYXltZW50KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuaW5pdGlhbGl6ZVBheW1lbnQoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIHNlbGYuX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpO1xuICAgIH0pO1xuICB9XG5cbiAgcGF5T3JkZXIocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXF1ZXN0LnBheW1lbnRfdG9rZW4gPSB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW47XG4gICAgcmV0dXJuIHRoaXMuX0R0c0FwaS53YWl0ZXIuc3VibWl0Q2hlY2tvdXRQYXltZW50KHJlcXVlc3QpO1xuICB9XG5cbiAgcmVxdWVzdFJlY2VpcHQocmVxdWVzdCkge1xuICAgIHJlcXVlc3QudGlja2V0X3Rva2VuID0gdGhpcy5tb2RlbC5vcmRlclRpY2tldC50b2tlbjtcbiAgICByZXR1cm4gdGhpcy5fRHRzQXBpLndhaXRlci5yZXF1ZXN0UmVjZWlwdChyZXF1ZXN0KTtcbiAgfVxuXG4gIF9zYXZlVGlja2V0KHJlc3BvbnNlKSB7XG4gICAgdGhpcy5tb2RlbC5vcmRlclRpY2tldCA9IHtcbiAgICAgIHRva2VuOiByZXNwb25zZS50aWNrZXRfdG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiB0aGlzLm1vZGVsLm9yZGVyVGlja2V0LnBheW1lbnRfdG9rZW5cbiAgICB9O1xuICB9XG5cbiAgX3NhdmVQYXltZW50VG9rZW4ocmVzcG9uc2UpIHtcbiAgICB0aGlzLm1vZGVsLm9yZGVyVGlja2V0ID0ge1xuICAgICAgdG9rZW46IHRoaXMubW9kZWwub3JkZXJUaWNrZXQudG9rZW4sXG4gICAgICBwYXltZW50X3Rva2VuOiByZXNwb25zZS50b2tlblxuICAgIH07XG4gIH1cblxuICBfY3JlYXRlV2F0Y2hlcihraW5kLCB0aWNrZXQpIHtcbiAgICBsZXQgd2F0Y2hlciA9IG5ldyBhcHAuUmVxdWVzdFdhdGNoZXIodGlja2V0LCB0aGlzLl9EdHNBcGkpO1xuICAgIHRoaXMubW9kZWwuYWRkV2F0Y2hlcihraW5kLCB3YXRjaGVyKTtcblxuICAgIHJldHVybiB3YXRjaGVyO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvb3JkZXJtb2RlbC5qc1xuXG53aW5kb3cuYXBwLk9yZGVyTW9kZWwgPSBjbGFzcyBPcmRlck1vZGVsIHtcbiAgLyogZ2xvYmFsIHNpZ25hbHMgKi9cblxuICBjb25zdHJ1Y3RvcihzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLlJFUVVFU1RfS0lORF9PUkRFUiA9IDE7XG4gICAgdGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRSA9IDI7XG4gICAgdGhpcy5SRVFVRVNUX0tJTkRfQ0xPU0VPVVQgPSAzO1xuXG4gICAgdGhpcy5wcmljZUZvcm1hdCA9ICd7MH0nO1xuICAgIHRoaXMudGF4ID0gMDtcblxuICAgIHRoaXMuX29yZGVyQ2FydCA9IFtdO1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoID0gW107XG4gICAgdGhpcy5fb3JkZXJDaGVjayA9IFtdO1xuICAgIHRoaXMuX29yZGVyVGlja2V0ID0ge307XG5cbiAgICB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnMgPSB7fTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyAgICBTaWduYWxzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgdGhpcy5vcmRlckNhcnRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlckNhcnRTdGFzaENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyQ2hlY2tDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5vcmRlclRpY2tldENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9yZGVyUmVxdWVzdENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vICAgIEluaXRpYWxpemF0aW9uXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZUNhcnREYXRhKGl0ZW1zKSB7XG4gICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzdG9yZUNhcnREYXRhKGl0ZW1zKSB7XG4gICAgICByZXR1cm4gaXRlbXMubWFwID8gaXRlbXMubWFwKGFwcC5DYXJ0SXRlbS5wcm90b3R5cGUucmVzdG9yZSkgOiBbXTtcbiAgICB9XG5cbiAgICB0aGlzLl9vcmRlckNhcnRTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX2NhcnQnKTtcbiAgICB0aGlzLl9vcmRlckNhcnRTdG9yYWdlLnJlYWQoKS50aGVuKHZhbHVlID0+IHtcbiAgICAgIHNlbGYub3JkZXJDYXJ0ID0gcmVzdG9yZUNhcnREYXRhKHZhbHVlIHx8IFtdKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2FydCk7XG4gICAgICBzZWxmLm9yZGVyQ2FydENoYW5nZWQuYWRkKGl0ZW1zID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJDYXJ0U3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJDYXJ0U3Rhc2hTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX2NhcnRfc3Rhc2gnKTtcbiAgICB0aGlzLl9vcmRlckNhcnRTdGFzaFN0b3JhZ2UucmVhZCgpLnRoZW4odmFsdWUgPT4ge1xuICAgICAgc2VsZi5vcmRlckNhcnRTdGFzaCA9IHJlc3RvcmVDYXJ0RGF0YSh2YWx1ZSB8fCBbXSk7XG4gICAgICBzZWxmLm9yZGVyQ2FydFN0YXNoQ2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2FydFN0YXNoKTtcbiAgICAgIHNlbGYub3JkZXJDYXJ0U3Rhc2hDaGFuZ2VkLmFkZChpdGVtcyA9PiB7XG4gICAgICAgIHNlbGYuX29yZGVyQ2FydFN0YXNoU3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJDaGVja1N0b3JhZ2UgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfb3JkZXJfY2hlY2snKTtcbiAgICB0aGlzLl9vcmRlckNoZWNrU3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyQ2hlY2sgPSByZXN0b3JlQ2FydERhdGEodmFsdWUgfHwgW10pO1xuICAgICAgc2VsZi5vcmRlckNoZWNrQ2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyQ2hlY2spO1xuICAgICAgc2VsZi5vcmRlckNoZWNrQ2hhbmdlZC5hZGQoaXRlbXMgPT4ge1xuICAgICAgICBzZWxmLl9vcmRlckNoZWNrU3RvcmFnZS53cml0ZShwcmVwYXJlQ2FydERhdGEoaXRlbXMpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fb3JkZXJUaWNrZXRTdG9yYWdlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX29yZGVyX3RpY2tldCcpO1xuICAgIHRoaXMuX29yZGVyVGlja2V0U3RvcmFnZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLm9yZGVyVGlja2V0ID0gdmFsdWUgfHwge307XG4gICAgICBzZWxmLm9yZGVyVGlja2V0Q2hhbmdlZC5kaXNwYXRjaChzZWxmLm9yZGVyVGlja2V0KTtcbiAgICAgIHNlbGYub3JkZXJUaWNrZXRDaGFuZ2VkLmFkZChkYXRhID0+IHtcbiAgICAgICAgc2VsZi5fb3JkZXJUaWNrZXRTdG9yYWdlLndyaXRlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGdldCBvcmRlckNhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQ2FydDtcbiAgfVxuXG4gIHNldCBvcmRlckNhcnQodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlckNhcnQgPSB2YWx1ZSB8fCBbXTtcbiAgICB0aGlzLm9yZGVyQ2FydENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNhcnQpO1xuICB9XG5cbiAgZ2V0IG9yZGVyQ2FydFN0YXNoKCkge1xuICAgIHJldHVybiB0aGlzLl9vcmRlckNhcnRTdGFzaDtcbiAgfVxuXG4gIHNldCBvcmRlckNhcnRTdGFzaCh2YWx1ZSkge1xuICAgIHRoaXMuX29yZGVyQ2FydFN0YXNoID0gdmFsdWUgfHwgW107XG4gICAgdGhpcy5vcmRlckNhcnRTdGFzaENoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNhcnRTdGFzaCk7XG4gIH1cblxuICBnZXQgb3JkZXJDaGVjaygpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJDaGVjaztcbiAgfVxuXG4gIHNldCBvcmRlckNoZWNrKHZhbHVlKSB7XG4gICAgdGhpcy5fb3JkZXJDaGVjayA9IHZhbHVlIHx8IFtdO1xuICAgIHRoaXMub3JkZXJDaGVja0NoYW5nZWQuZGlzcGF0Y2godGhpcy5vcmRlckNoZWNrKTtcbiAgfVxuXG4gIGdldCBvcmRlclRpY2tldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fb3JkZXJUaWNrZXQ7XG4gIH1cblxuICBzZXQgb3JkZXJUaWNrZXQodmFsdWUpIHtcbiAgICB0aGlzLl9vcmRlclRpY2tldCA9IHZhbHVlIHx8IHt9O1xuICAgIHRoaXMub3JkZXJUaWNrZXRDaGFuZ2VkLmRpc3BhdGNoKHRoaXMub3JkZXJUaWNrZXQpO1xuICB9XG5cbiAgZ2V0IG9yZGVyUmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX09SREVSKTtcbiAgfVxuXG4gIGdldCBhc3Npc3RhbmNlUmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX0FTU0lTVEFOQ0UpO1xuICB9XG5cbiAgZ2V0IGNsb3Nlb3V0UmVxdWVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRXYXRjaGVyKHRoaXMuUkVRVUVTVF9LSU5EX0NMT1NFT1VUKTtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQdWJsaWMgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVxdWVzdCB3YXRjaGVyc1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgZ2V0V2F0Y2hlcihraW5kKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXTtcbiAgfVxuXG4gIGFkZFdhdGNoZXIoa2luZCwgd2F0Y2hlcikge1xuICAgIHRoaXMuY2xlYXJXYXRjaGVyKGtpbmQpO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHdhdGNoZXIucHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChzZWxmLmdldFdhdGNoZXIoa2luZCkgIT09IHdhdGNoZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VsZi5jbGVhcldhdGNoZXIoa2luZCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZXF1ZXN0V2F0Y2hlcnNba2luZF0gPSB3YXRjaGVyO1xuICAgIHRoaXMuX25vdGlmeUNoYW5nZShraW5kKTtcbiAgfVxuXG4gIGNsZWFyV2F0Y2hlcihraW5kKSB7XG4gICAgdmFyIHdhdGNoZXIgPSB0aGlzLmdldFdhdGNoZXIoa2luZCk7XG5cbiAgICBpZiAod2F0Y2hlcikge1xuICAgICAgd2F0Y2hlci5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMuX3JlcXVlc3RXYXRjaGVyc1traW5kXTtcbiAgICB0aGlzLl9ub3RpZnlDaGFuZ2Uoa2luZCk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgX25vdGlmeUNoYW5nZShraW5kKSB7XG4gICAgdmFyIHNpZ25hbDtcblxuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9PUkRFUjpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5vcmRlclJlcXVlc3RDaGFuZ2VkO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdGhpcy5SRVFVRVNUX0tJTkRfQVNTSVNUQU5DRTpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0aGlzLlJFUVVFU1RfS0lORF9DTE9TRU9VVDpcbiAgICAgICAgc2lnbmFsID0gdGhpcy5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc2lnbmFsKSB7XG4gICAgICBzaWduYWwuZGlzcGF0Y2godGhpcy5nZXRXYXRjaGVyKGtpbmQpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9yZXF1ZXN0d2F0Y2hlci5qc1xuXG53aW5kb3cuYXBwLlJlcXVlc3RXYXRjaGVyID0gY2xhc3MgUmVxdWVzdFdhdGNoZXIge1xuICBjb25zdHJ1Y3Rvcih0aWNrZXQsIER0c0FwaSkge1xuICAgIHRoaXMuX3Rva2VuID0gdGlja2V0LnRva2VuO1xuICAgIHRoaXMuX3JlbW90ZSA9IER0c0FwaTtcblxuICAgIHRoaXMuUE9MTElOR19JTlRFUlZBTCA9IDUwMDA7XG5cbiAgICB0aGlzLlJFUVVFU1RfU1RBVFVTX1BFTkRJTkcgPSAxO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfUkVDRUlWRUQgPSAyO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQgPSAzO1xuICAgIHRoaXMuUkVRVUVTVF9TVEFUVVNfRVhQSVJFRCA9IDI1NTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICBzZWxmLl9zdGF0dXNVcGRhdGVSZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG5cbiAgICB0aGlzLl90aWNrZXQgPSB7IHN0YXR1czogMCB9O1xuICAgIHRoaXMuX3dhdGNoU3RhdHVzKCk7XG4gIH1cblxuICBnZXQgdG9rZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Rva2VuO1xuICB9XG5cbiAgZ2V0IHRpY2tldCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGlja2V0O1xuICB9XG5cbiAgZ2V0IHByb21pc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl90aW1lb3V0SWQpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fdGltZW91dElkKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGlja2V0LnN0YXR1cyA8IHRoaXMuUkVRVUVTVF9TVEFUVVNfQUNDRVBURUQpIHtcbiAgICAgIHRoaXMuX3N0YXR1c1VwZGF0ZVJlamVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIF93YXRjaFN0YXR1cygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fdGltZW91dElkKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXRJZCk7XG4gICAgfVxuXG4gICAgdmFyIG9uVGltZW91dCA9ICgpID0+IHtcbiAgICAgIHNlbGYuX3JlbW90ZS53YWl0ZXIuZ2V0U3RhdHVzKHNlbGYuX3Rva2VuKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgc2VsZi5fc2V0VGlja2V0KHJlc3BvbnNlKTtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgc2VsZi5fd2F0Y2hTdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBpZiAoc2VsZi5fdGlja2V0LnN0YXR1cyA9PT0gc2VsZi5SRVFVRVNUX1NUQVRVU19BQ0NFUFRFRCkge1xuICAgICAgc2VsZi5fc3RhdHVzVXBkYXRlUmVzb2x2ZSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzZWxmLl90aWNrZXQuc3RhdHVzICE9PSBzZWxmLlJFUVVFU1RfU1RBVFVTX0VYUElSRUQpIHtcbiAgICAgIHNlbGYuX3RpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KG9uVGltZW91dCwgdGhpcy5QT0xMSU5HX0lOVEVSVkFMKTtcbiAgICB9XG4gIH1cblxuICBfc2V0VGlja2V0KHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHNlbGYuX3RpY2tldC5zdGF0dXMgPT09IHZhbHVlLnN0YXR1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuX3RpY2tldCA9IHZhbHVlO1xuICAgIHNlbGYuX3dhdGNoU3RhdHVzKCk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXNzaW9ubWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLlNlc3Npb25NYW5hZ2VyID0gY2xhc3MgU2Vzc2lvbk1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihTTkFQRW52aXJvbm1lbnQsIEFuYWx5dGljc01vZGVsLCBDdXN0b21lck1vZGVsLCBMb2NhdGlvbk1vZGVsLCBPcmRlck1vZGVsLCBTdXJ2ZXlNb2RlbCwgc3RvcmFnZVByb3ZpZGVyLCBMb2dnZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnNlc3Npb25TdGFydGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5zZXNzaW9uRW5kZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9BbmFseXRpY3NNb2RlbCA9IEFuYWx5dGljc01vZGVsO1xuICAgIHRoaXMuX0N1c3RvbWVyTW9kZWwgPSBDdXN0b21lck1vZGVsO1xuICAgIHRoaXMuX0xvY2F0aW9uTW9kZWwgPSBMb2NhdGlvbk1vZGVsO1xuICAgIHRoaXMuX09yZGVyTW9kZWwgPSBPcmRlck1vZGVsO1xuICAgIHRoaXMuX1N1cnZleU1vZGVsID0gU3VydmV5TW9kZWw7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfc2VhdF9zZXNzaW9uJyk7XG4gICAgdGhpcy5fc3RvcmUucmVhZCgpLnRoZW4oZGF0YSA9PiB7XG4gICAgICBzZWxmLl9zZXNzaW9uID0gZGF0YTtcblxuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHNlbGYuX3N0YXJ0U2Vzc2lvbigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fQ3VzdG9tZXJNb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoY3VzdG9tZXIgPT4ge1xuICAgICAgaWYgKCFzZWxmLl9zZXNzaW9uIHx8ICFjdXN0b21lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Nlc3Npb24uY3VzdG9tZXIgPSBjdXN0b21lci50b2tlbjtcbiAgICAgIHNlbGYuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiB7XG4gICAgICBpZiAoIXNlbGYuX3Nlc3Npb24gfHwgIXNlYXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zZXNzaW9uLnNlYXQgPSBzZWF0LnRva2VuO1xuICAgICAgc2VsZi5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9PcmRlck1vZGVsLm9yZGVyVGlja2V0Q2hhbmdlZC5hZGQodGlja2V0ID0+IHtcbiAgICAgIGlmICghc2VsZi5fc2Vzc2lvbiB8fCAhdGlja2V0IHx8ICF0aWNrZXQudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zZXNzaW9uLnRpY2tldCA9IHRpY2tldC50b2tlbjtcbiAgICAgIHNlbGYuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IHNlc3Npb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb247XG4gIH1cblxuICBlbmRTZXNzaW9uKCkge1xuICAgIGlmICghdGhpcy5fc2Vzc2lvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZyhgU2VhdCBzZXNzaW9uICR7dGhpcy5fc2Vzc2lvbi5pZH0gZW5kZWQuYCk7XG5cbiAgICB2YXIgcyA9IHRoaXMuX3Nlc3Npb247XG4gICAgcy5lbmRlZCA9IG5ldyBEYXRlKCk7XG5cbiAgICB0aGlzLl9zZXNzaW9uID0gbnVsbDtcbiAgICB0aGlzLl9zdG9yZS5jbGVhcigpO1xuXG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nU2Vzc2lvbihzKTtcblxuICAgIHRoaXMuc2Vzc2lvbkVuZGVkLmRpc3BhdGNoKHMpO1xuICB9XG5cbiAgZ2V0IGd1ZXN0Q291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Nlc3Npb24uZ3Vlc3RfY291bnQgfHwgMTtcbiAgfVxuXG4gIHNldCBndWVzdENvdW50KHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uZ3Vlc3RfY291bnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Vzc2lvbi5ndWVzdF9jb3VudCA9IHZhbHVlO1xuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICB9XG5cbiAgZ2V0IHNwZWNpYWxFdmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Vzc2lvbi5zcGVjaWFsX2V2ZW50O1xuICB9XG5cbiAgc2V0IHNwZWNpYWxFdmVudCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLl9zZXNzaW9uLnNwZWNpYWxfZXZlbnQgPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc2Vzc2lvbi5zcGVjaWFsX2V2ZW50ID0gdmFsdWU7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBfc3RhcnRTZXNzaW9uKCkge1xuICAgIGxldCBzZWF0ID0gdGhpcy5fTG9jYXRpb25Nb2RlbC5zZWF0O1xuXG4gICAgdGhpcy5fc2Vzc2lvbiA9IHtcbiAgICAgIGlkOiB0aGlzLl9nZW5lcmF0ZUlEKCksXG4gICAgICBzZWF0OiBzZWF0ID8gc2VhdC50b2tlbiA6IHVuZGVmaW5lZCxcbiAgICAgIHBsYXRmb3JtOiB0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm0sXG4gICAgICBzdGFydGVkOiBuZXcgRGF0ZSgpXG4gICAgfTtcblxuICAgIHRoaXMuX0xvZ2dlci5kZWJ1ZyhgU2VhdCBzZXNzaW9uICR7dGhpcy5fc2Vzc2lvbi5pZH0gc3RhcnRlZC5gKTtcblxuICAgIHRoaXMuX3N0b3JlLndyaXRlKHRoaXMuX3Nlc3Npb24pO1xuICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQuZGlzcGF0Y2godGhpcy5fc2Vzc2lvbik7XG4gIH1cblxuICBfZ2VuZXJhdGVJRCgpe1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc2Vzc2lvbnByb3ZpZGVyLmpzXG5cbndpbmRvdy5hcHAuU2Vzc2lvblByb3ZpZGVyID0gY2xhc3MgU2Vzc2lvblByb3ZpZGVyIHtcbiAgLyogZ2xvYmFsIG1vbWVudCwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKFNlc3Npb25TZXJ2aWNlLCBzdG9yYWdlUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9TZXNzaW9uU2VydmljZSA9IFNlc3Npb25TZXJ2aWNlO1xuICAgIHRoaXMuX0J1c2luZXNzU2Vzc2lvblN0b3JlID0gc3RvcmFnZVByb3ZpZGVyKCdzbmFwX2FjY2Vzc3Rva2VuJyk7XG4gICAgdGhpcy5fQ3VzdG9tZXJTZXNzaW9uU3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfY3VzdG9tZXJfYWNjZXNzdG9rZW4nKTtcblxuICAgIHRoaXMuYnVzaW5lc3NTZXNzaW9uRXhwaXJlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuY3VzdG9tZXJTZXNzaW9uRXhwaXJlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZ2V0QnVzaW5lc3NUb2tlbigpIHtcbiAgICBpZiAodGhpcy5fcGVuZGluZ1Byb21pc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wZW5kaW5nUHJvbWlzZTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9wZW5kaW5nUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5fQnVzaW5lc3NTZXNzaW9uU3RvcmUucmVhZCgpLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuICYmIHRva2VuLmFjY2Vzc190b2tlbikge1xuICAgICAgICAgIGlmICh0b2tlbi5leHBpcmVzKSB7XG4gICAgICAgICAgICB2YXIgZXhwaXJlcyA9IG1vbWVudC51bml4KHRva2VuLmV4cGlyZXMgLSAxMjApO1xuXG4gICAgICAgICAgICBpZiAoZXhwaXJlcy5pc0FmdGVyKG1vbWVudCgpKSkge1xuICAgICAgICAgICAgICBzZWxmLl9wZW5kaW5nUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5fcGVuZGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUodG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9TZXNzaW9uU2VydmljZS5nZXRTZXNzaW9uKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgc2VsZi5fcGVuZGluZ1Byb21pc2UgPSBudWxsO1xuICAgICAgICAgIHNlbGYuX0J1c2luZXNzU2Vzc2lvblN0b3JlLndyaXRlKGRhdGEpO1xuICAgICAgICAgIHJlc29sdmUoZGF0YS5hY2Nlc3NfdG9rZW4pO1xuICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgc2VsZi5fcGVuZGluZ1Byb21pc2UgPSBudWxsO1xuXG4gICAgICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgIHNlbGYuX0J1c2luZXNzU2Vzc2lvblN0b3JlLmNsZWFyKCk7XG4gICAgICAgICAgICBzZWxmLmJ1c2luZXNzU2Vzc2lvbkV4cGlyZWQuZGlzcGF0Y2goKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZWplY3QoeyBjb2RlOiBlLnN0YXR1cyB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fcGVuZGluZ1Byb21pc2U7XG4gIH1cblxuICBnZXRDdXN0b21lclRva2VuKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBzZWxmLl9DdXN0b21lclNlc3Npb25TdG9yZS5yZWFkKCkudGhlbihmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAoIXRva2VuIHx8ICF0b2tlbi5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRva2VuLmV4cGlyZXMpIHtcbiAgICAgICAgICB2YXIgZXhwaXJlcyA9IG1vbWVudC51bml4KHRva2VuLmV4cGlyZXMpO1xuXG4gICAgICAgICAgaWYgKCFleHBpcmVzLmlzQWZ0ZXIobW9tZW50KCkpKSB7XG4gICAgICAgICAgICBzZWxmLl9DdXN0b21lclNlc3Npb25TdG9yZS5jbGVhcigpO1xuICAgICAgICAgICAgc2VsZi5jdXN0b21lclNlc3Npb25FeHBpcmVkLmRpc3BhdGNoKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc29sdmUodG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zZXNzaW9uc2VydmljZS5qc1xuXG53aW5kb3cuYXBwLlNlc3Npb25TZXJ2aWNlID0gY2xhc3MgU2Vzc2lvblNlcnZpY2Uge1xuICBjb25zdHJ1Y3RvcigkcmVzb3VyY2UpIHtcbiAgICB0aGlzLl9hcGkgPSB7XG4gICAgICAnc2Vzc2lvbic6ICRyZXNvdXJjZSgnL29hdXRoMi9zbmFwL3Nlc3Npb24nLCB7fSwgeyBxdWVyeTogeyBtZXRob2Q6ICdHRVQnIH0gfSlcbiAgICB9O1xuICB9XG5cbiAgZ2V0U2Vzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnNlc3Npb24ucXVlcnkoKS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NoZWxsbWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLlNoZWxsTWFuYWdlciA9IGNsYXNzIFNoZWxsTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCRzY2UsIERhdGFQcm92aWRlciwgU2hlbGxNb2RlbCwgQ29uZmlnLCBFbnZpcm9ubWVudCwgSG9zdHMpIHtcbiAgICB0aGlzLiQkc2NlID0gJHNjZTtcbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIgPSBEYXRhUHJvdmlkZXI7XG4gICAgdGhpcy5fU2hlbGxNb2RlbCA9IFNoZWxsTW9kZWw7XG4gICAgdGhpcy5fQ29uZmlnID0gQ29uZmlnO1xuICAgIHRoaXMuX0Vudmlyb25tZW50ID0gRW52aXJvbm1lbnQ7XG4gICAgdGhpcy5fSG9zdHMgPSBIb3N0cztcblxuICAgIHRoaXMubG9jYWxlID0gQ29uZmlnLmxvY2FsZTtcbiAgfVxuXG4gIGdldCBsb2NhbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgfVxuXG4gIHNldCBsb2NhbGUodmFsdWUpIHtcbiAgICBpZiAodGhpcy5fbG9jYWxlID09PSB2YWx1ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9sb2NhbGUgPSB2YWx1ZTtcblxuICAgIHZhciBmb3JtYXQgPSAnezB9JyxcbiAgICAgICAgY3VycmVuY3kgPSAnJztcblxuICAgIHN3aXRjaCAodGhpcy5fbG9jYWxlKSB7XG4gICAgICBjYXNlICdyb19NRCc6XG4gICAgICAgIGZvcm1hdCA9ICd7MH0gTGVpJztcbiAgICAgICAgY3VycmVuY3kgPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd6aF9NTyc6XG4gICAgICAgIGZvcm1hdCA9ICdNT1AkIHswfSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJyc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW5fVVMnOlxuICAgICAgICBmb3JtYXQgPSAnJHswfSc7XG4gICAgICAgIGN1cnJlbmN5ID0gJ1VTRCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHRoaXMuX1NoZWxsTW9kZWwucHJpY2VGb3JtYXQgPSBmb3JtYXQ7XG4gICAgdGhpcy5fU2hlbGxNb2RlbC5jdXJyZW5jeSA9IGN1cnJlbmN5O1xuICB9XG5cbiAgZ2V0IG1vZGVsKCkge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9EYXRhUHJvdmlkZXIuYmFja2dyb3VuZHMoKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLmJhY2tncm91bmRzID0gcmVzcG9uc2UubWFpbi5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uc3JjXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5zY3JlZW5zYXZlcnMgPSByZXNwb25zZS5zY3JlZW5zYXZlci5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uc3JjXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgc2VsZi5fU2hlbGxNb2RlbC5wYWdlQmFja2dyb3VuZHMgPSByZXNwb25zZS5wYWdlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbWVkaWE6IGl0ZW0uYmFja2dyb3VuZC5zcmMsXG4gICAgICAgICAgZGVzdGluYXRpb246IGl0ZW0uZGVzdGluYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fRGF0YVByb3ZpZGVyLmVsZW1lbnRzKCkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgdmFyIGxheW91dCA9IHNlbGYuX0NvbmZpZy50aGVtZS5sYXlvdXQ7XG5cbiAgICAgIHZhciBlbGVtZW50cyA9IHt9O1xuXG4gICAgICBzd2l0Y2ggKGxheW91dCkge1xuICAgICAgICBjYXNlICdjbGFzc2ljJzpcbiAgICAgICAgICBlbGVtZW50cyA9IHtcbiAgICAgICAgICAgICdidXR0b25faG9tZSc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24taG9tZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fYmFjayc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYmFjay5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2FydCc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tY2FydC5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fcm90YXRlJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1yb3RhdGUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3dhaXRlcic6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYXNzaXN0YW5jZS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2hlY2snOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLWNsb3Nlb3V0LnBuZycpLFxuICAgICAgICAgICAgJ2J1dHRvbl9zdXJ2ZXknOiBzZWxmLmdldEFzc2V0VXJsKCdpbWFnZXMvYnV0dG9uLXN1cnZleS5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fY2hhdCc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tY2hhdC5wbmcnKVxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dhbGF4aWVzJzpcbiAgICAgICAgICBlbGVtZW50cyA9IHtcbiAgICAgICAgICAgICdidXR0b25fYmFjayc6IHNlbGYuZ2V0QXNzZXRVcmwoJ2ltYWdlcy9idXR0b24tYmFjay5wbmcnKSxcbiAgICAgICAgICAgICdidXR0b25fcm90YXRlJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1yb3RhdGUucG5nJyksXG4gICAgICAgICAgICAnYnV0dG9uX3NldHRpbmdzJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1zZXR0aW5ncy5wbmcnKSxcbiAgICAgICAgICAgICdsb2NhdGlvbl9sb2dvJzogc2VsZi5nZXRBc3NldFVybCgnaW1hZ2VzL2J1dHRvbi1sb2dvLnBuZycpLFxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2UuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGVsZW1lbnQgPSByZXNwb25zZS5lbGVtZW50c1tpXTtcbiAgICAgICAgZWxlbWVudHNbZWxlbWVudC5zbG90XSA9IGVsZW1lbnQuc3JjO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9TaGVsbE1vZGVsLmVsZW1lbnRzID0gZWxlbWVudHM7XG4gICAgfSk7XG4gIH1cblxuICBmb3JtYXRQcmljZShwcmljZSkge1xuICAgIHJldHVybiB0aGlzLl9TaGVsbE1vZGVsLnByaWNlRm9ybWF0LnJlcGxhY2UoL3soXFxkKyl9L2csICgpID0+IHByaWNlLnRvRml4ZWQoMikpO1xuICB9XG5cbiAgZ2V0UGFnZUJhY2tncm91bmRzKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX1NoZWxsTW9kZWwucGFnZUJhY2tncm91bmRzLmZpbHRlcihpdGVtID0+IHtcbiAgICAgIHJldHVybiBpdGVtLmRlc3RpbmF0aW9uLnR5cGUgPT09IGxvY2F0aW9uLnR5cGUgJiZcbiAgICAgICAgKGl0ZW0uZGVzdGluYXRpb24udG9rZW4gPT09IGxvY2F0aW9uLnRva2VuICYmIGxvY2F0aW9uLnRva2VuIHx8XG4gICAgICAgICBpdGVtLmRlc3RpbmF0aW9uLnVybCA9PT0gbG9jYXRpb24udXJsICYmIGxvY2F0aW9uLnVybCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRBc3NldFVybChmaWxlKSB7XG4gICAgcmV0dXJuIHRoaXMuJCRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGAvLyR7dGhpcy5fSG9zdHMuc3RhdGljLmhvc3R9JHt0aGlzLl9Ib3N0cy5zdGF0aWMucGF0aH0vZGlzdC8ke3RoaXMuX0Vudmlyb25tZW50LnZlcnNpb259YCArXG4gICAgICBgL2Fzc2V0cy8ke3RoaXMuX0NvbmZpZy50aGVtZS5sYXlvdXR9LyR7ZmlsZX1gKTtcbiAgfVxuXG4gIGdldFBhcnRpYWxVcmwobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdldEFzc2V0VXJsKGBwYXJ0aWFscy8ke25hbWV9Lmh0bWxgKTtcbiAgfVxuXG4gIGdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pIHtcbiAgICBpZiAoIW1lZGlhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1lZGlhID09PSAnc3RyaW5nJyB8fCBtZWRpYSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgaWYgKG1lZGlhLnN1YnN0cmluZygwLCA0KSAhPT0gJ2h0dHAnICYmIG1lZGlhLnN1YnN0cmluZygwLCAyKSAhPT0gJy8vJykge1xuICAgICAgICBleHRlbnNpb24gPSBleHRlbnNpb24gfHwgJ2pwZyc7XG4gICAgICAgIHJldHVybiB0aGlzLiQkc2NlLnRydXN0QXNSZXNvdXJjZVVybChgJHt3aW5kb3cubG9jYXRpb24ucHJvdG9jb2x9Ly8ke3RoaXMuX0hvc3RzLm1lZGlhLmhvc3R9YCArXG4gICAgICAgICAgYC9tZWRpYS8ke21lZGlhfV8ke3dpZHRofV8ke2hlaWdodH0uJHtleHRlbnNpb259YCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZWRpYTtcbiAgICB9XG5cbiAgICBpZiAoIW1lZGlhLnRva2VuKSB7XG4gICAgICByZXR1cm4gbWVkaWE7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSB0aGlzLmdldE1lZGlhVHlwZShtZWRpYSk7XG4gICAgdmFyIHVybCA9IGAke3dpbmRvdy5sb2NhdGlvbi5wcm90b2NvbH0vLyR7dGhpcy5fSG9zdHMubWVkaWEuaG9zdH0vbWVkaWEvJHttZWRpYS50b2tlbn1gO1xuXG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgdXJsICs9ICcud2VibSc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdmbGFzaCcpIHtcbiAgICAgIHVybCArPSAnLnN3Zic7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdpbWFnZScpIHtcbiAgICAgIGlmICh3aWR0aCAmJiBoZWlnaHQpIHtcbiAgICAgICAgdXJsICs9ICdfJyArIHdpZHRoICsgJ18nICsgaGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBpZiAoZXh0ZW5zaW9uKSB7XG4gICAgICAgIHVybCArPSAnLicgKyBleHRlbnNpb247XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKCFtZWRpYSB8fCAhbWVkaWEubWltZV90eXBlKSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKG1lZGlhLm1pbWVfdHlwZSkge1xuICAgICAgICAgIGNhc2UgJ2ltYWdlL3BuZyc6XG4gICAgICAgICAgICB1cmwgKz0gJy5wbmcnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHVybCArPSAnLmpwZyc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiQkc2NlLnRydXN0QXNSZXNvdXJjZVVybCh1cmwpO1xuICB9XG5cbiAgZ2V0TWVkaWFUeXBlKG1lZGlhKSB7XG4gICAgaWYgKCFtZWRpYSB8fCAhbWVkaWEubWltZV90eXBlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChtZWRpYS5taW1lX3R5cGUuc3Vic3RyaW5nKDAsIDUpID09PSAnaW1hZ2UnKXtcbiAgICAgIHJldHVybiAnaW1hZ2UnO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS5taW1lX3R5cGUuc3Vic3RyaW5nKDAsIDUpID09PSAndmlkZW8nKSB7XG4gICAgICByZXR1cm4gJ3ZpZGVvJztcbiAgICB9XG4gICAgZWxzZSBpZiAobWVkaWEubWltZV90eXBlID09PSAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnKSB7XG4gICAgICByZXR1cm4gJ2ZsYXNoJztcbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IHRpbGVTdHlsZSgpIHtcbiAgICB2YXIgc3R5bGUgPSAndGlsZSc7XG5cbiAgICBzd2l0Y2ggKHRoaXMuX0NvbmZpZy50aGVtZS50aWxlc19zdHlsZSkge1xuICAgICAgY2FzZSAncmVndWxhcic6XG4gICAgICAgIHN0eWxlICs9ICcgdGlsZS1yZWd1bGFyJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vc3R5bGUgKz0gJyB0aWxlLXJlZ3VsYXInO1xuICAgIHJldHVybiBzdHlsZTtcbiAgfVxuXG4gIGdldCBwcmVkaWNhdGVFdmVuKCkge1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgcmV0dXJuICgpID0+IGluZGV4KysgJSAyID09PSAxO1xuICB9XG5cbiAgZ2V0IHByZWRpY2F0ZU9kZCgpIHtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHJldHVybiAoKSA9PiBpbmRleCsrICUgMiA9PT0gMDtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NoZWxsbW9kZWwuanNcblxud2luZG93LmFwcC5TaGVsbE1vZGVsID0gY2xhc3MgU2hlbGxNb2RlbCB7XG4gIC8qIGdsb2JhbCBzaWduYWxzICovXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fYmFja2dyb3VuZHMgPSBbXTtcbiAgICB0aGlzLmJhY2tncm91bmRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3NjcmVlbnNhdmVycyA9IFtdO1xuICAgIHRoaXMuc2NyZWVuc2F2ZXJzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX3BhZ2VCYWNrZ3JvdW5kcyA9IFtdO1xuICAgIHRoaXMucGFnZUJhY2tncm91bmRzQ2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICAgIHRoaXMuX2VsZW1lbnRzID0gW107XG4gICAgdGhpcy5lbGVtZW50c0NoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLl9wcmljZUZvcm1hdCA9ICd7MH0nO1xuICAgIHRoaXMucHJpY2VGb3JtYXRDaGFuZ2VkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gICAgdGhpcy5fY3VycmVuY3kgPSAnJztcbiAgICB0aGlzLmN1cnJlbmN5Q2hhbmdlZCA9IG5ldyBzaWduYWxzLlNpZ25hbCgpO1xuICB9XG5cbiAgZ2V0IGJhY2tncm91bmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kcztcbiAgfVxuXG4gIHNldCBiYWNrZ3JvdW5kcyh2YWx1ZSkge1xuICAgIHRoaXMuX2JhY2tncm91bmRzID0gdmFsdWU7XG4gICAgdGhpcy5iYWNrZ3JvdW5kc0NoYW5nZWQuZGlzcGF0Y2godmFsdWUpO1xuICB9XG5cbiAgZ2V0IHNjcmVlbnNhdmVycygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2NyZWVuc2F2ZXJzO1xuICB9XG5cbiAgc2V0IHNjcmVlbnNhdmVycyh2YWx1ZSkge1xuICAgIHRoaXMuX3NjcmVlbnNhdmVycyA9IHZhbHVlO1xuICAgIHRoaXMuc2NyZWVuc2F2ZXJzQ2hhbmdlZC5kaXNwYXRjaCh2YWx1ZSk7XG4gIH1cblxuICBnZXQgcGFnZUJhY2tncm91bmRzKCkge1xuICAgIHJldHVybiB0aGlzLl9wYWdlQmFja2dyb3VuZHM7XG4gIH1cblxuICBzZXQgcGFnZUJhY2tncm91bmRzKHZhbHVlKSB7XG4gICAgdGhpcy5fcGFnZUJhY2tncm91bmRzID0gdmFsdWU7XG4gICAgdGhpcy5wYWdlQmFja2dyb3VuZHNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBlbGVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudHM7XG4gIH1cblxuICBzZXQgZWxlbWVudHModmFsdWUpIHtcbiAgICB0aGlzLl9lbGVtZW50cyA9IHZhbHVlO1xuICAgIHRoaXMuZWxlbWVudHNDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBwcmljZUZvcm1hdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJpY2VGb3JtYXQ7XG4gIH1cblxuICBzZXQgcHJpY2VGb3JtYXQodmFsdWUpIHtcbiAgICB0aGlzLl9wcmljZUZvcm1hdCA9IHZhbHVlO1xuICAgIHRoaXMucHJpY2VGb3JtYXRDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxuXG4gIGdldCBjdXJyZW5jeSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVuY3k7XG4gIH1cblxuICBzZXQgY3VycmVuY3kodmFsdWUpIHtcbiAgICB0aGlzLl9jdXJyZW5jeSA9IHZhbHVlO1xuICAgIHRoaXMuY3VycmVuY3lDaGFuZ2VkLmRpc3BhdGNoKHZhbHVlKTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3NvY2lhbG1hbmFnZXIuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8qIGdsb2JhbCBVUkkgKi9cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29jaWFsTWFuYWdlclxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBTb2NpYWxNYW5hZ2VyID0gZnVuY3Rpb24oU05BUEVudmlyb25tZW50LCBEdHNBcGksIFdlYkJyb3dzZXIsIExvZ2dlcikge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgICB0aGlzLl9EdHNBcGkgPSBEdHNBcGk7XG4gICAgdGhpcy5fV2ViQnJvd3NlciA9IFdlYkJyb3dzZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuICB9O1xuXG4gIHdpbmRvdy5hcHAuU29jaWFsTWFuYWdlciA9IFNvY2lhbE1hbmFnZXI7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBMb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgU29jaWFsTWFuYWdlci5wcm90b3R5cGUubG9naW5GYWNlYm9vayA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZmFjZWJvb2tBcHAgPSB0aGlzLl9TTkFQRW52aXJvbm1lbnQuZmFjZWJvb2tfYXBwbGljYXRpb24sXG4gICAgICAgIGN1c3RvbWVyQXBwID0gdGhpcy5fU05BUEVudmlyb25tZW50LmN1c3RvbWVyX2FwcGxpY2F0aW9uO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggRmFjZWJvb2s6ICcgKyBlKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVqZWN0KGUpO1xuICAgICAgfTtcbiAgICAgIHJlc29sdmUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgbG9naW4gY29tcGxldGUuJyk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3Jlc29sdmUoZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBvbk5hdmlnYXRlZCh1cmwpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgZmFjZWJvb2tBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChmYWNlYm9va0F1dGguZXJyb3IgfHwgIWZhY2Vib29rQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgZXJyb3I6ICcgKyBmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChmYWNlYm9va0F1dGguZXJyb3IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnRmFjZWJvb2sgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwRmFjZWJvb2soe1xuICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBmYWNlYm9va0F1dGguYWNjZXNzX3Rva2VuLFxuICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWRcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdGYWNlYm9vayBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGNhbGxiYWNrIGVycm9yOiAnICsgY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoY3VzdG9tZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0ZhY2Vib29rIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggRmFjZWJvb2suJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9kaWFsb2cvb2F1dGgnKVxuICAgICAgICAuYWRkU2VhcmNoKCdjbGllbnRfaWQnLCBmYWNlYm9va0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGZhY2Vib29rQXBwLnJlZGlyZWN0X3VybClcbiAgICAgICAgLmFkZFNlYXJjaCgncmVzcG9uc2VfdHlwZScsICd0b2tlbicpXG4gICAgICAgIC5hZGRTZWFyY2goJ3Njb3BlJywgJ3B1YmxpY19wcm9maWxlLGVtYWlsJylcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luR29vZ2xlUGx1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZ29vZ2xlcGx1c0FwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5nb29nbGVwbHVzX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHNlbGYuX2dlbmVyYXRlVG9rZW4oKTtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggR29vZ2xlOiAnICsgZSk7XG4gICAgICAgIGRpc3Bvc2UoKTtcbiAgICAgICAgX3JlamVjdChlKTtcbiAgICAgIH07XG4gICAgICByZXNvbHZlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBsb2dpbiBjb21wbGV0ZS4nKTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgICAgICBfcmVzb2x2ZShkYXRhKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uTmF2aWdhdGVkKHVybCkge1xuICAgICAgICBpZiAodXJsLmluZGV4T2YoZ29vZ2xlcGx1c0FwcC5yZWRpcmVjdF91cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGdvb2dsZXBsdXNBdXRoID0gVVJJKHVybCkuc2VhcmNoKHRydWUpO1xuXG4gICAgICAgICAgaWYgKGdvb2dsZXBsdXNBdXRoLmVycm9yIHx8ICFnb29nbGVwbHVzQXV0aC5jb2RlIHx8IGdvb2dsZXBsdXNBdXRoLnN0YXRlICE9PSBzdGF0ZSkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY2FsbGJhY2sgZXJyb3I6ICcgKyBnb29nbGVwbHVzQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGdvb2dsZXBsdXNBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjYWxsYmFjayByZWNlaXZlZC4nKTtcblxuICAgICAgICAgIHNlbGYuX0R0c0FwaS5jdXN0b21lci5zaWduVXBHb29nbGVQbHVzKHtcbiAgICAgICAgICAgIGNvZGU6IGdvb2dsZXBsdXNBdXRoLmNvZGUsXG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZFxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odGlja2V0KSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBzaWduaW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZWxmLl9EdHNBcGkub2F1dGgyLmdldEF1dGhDb25maXJtVXJsKHRpY2tldC50aWNrZXRfaWQsIHtcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiBjdXN0b21lckFwcC5jbGllbnRfaWQsXG4gICAgICAgICAgICAgIHJlc3BvbnNlX3R5cGU6ICd0b2tlbicsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogY3VzdG9tZXJBcHAuY2FsbGJhY2tfdXJsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vcGVuKHVybCk7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1cmwuaW5kZXhPZihjdXN0b21lckFwcC5jYWxsYmFja191cmwpID09PSAwKSB7XG4gICAgICAgICAgdmFyIGN1c3RvbWVyQXV0aCA9IFVSSSgnPycgKyBVUkkodXJsKS5mcmFnbWVudCgpKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAoY3VzdG9tZXJBdXRoLmVycm9yIHx8ICFjdXN0b21lckF1dGguYWNjZXNzX3Rva2VuKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0dvb2dsZSBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdHb29nbGUgY3VzdG9tZXIgbG9naW4gY29tcGxldGUuJyk7XG5cbiAgICAgICAgICByZXNvbHZlKGN1c3RvbWVyQXV0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5hZGQob25OYXZpZ2F0ZWQpO1xuXG4gICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ0xvZ2dpbmcgaW4gd2l0aCBHb29nbGUuJyk7XG5cbiAgICAgIHZhciB1cmwgPSBVUkkoJ2h0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbS9vL29hdXRoMi9hdXRoJylcbiAgICAgICAgLmFkZFNlYXJjaCgnY2xpZW50X2lkJywgZ29vZ2xlcGx1c0FwcC5jbGllbnRfaWQpXG4gICAgICAgIC5hZGRTZWFyY2goJ3JlZGlyZWN0X3VyaScsIGdvb2dsZXBsdXNBcHAucmVkaXJlY3RfdXJsKVxuICAgICAgICAuYWRkU2VhcmNoKCdyZXNwb25zZV90eXBlJywgJ2NvZGUnKVxuICAgICAgICAuYWRkU2VhcmNoKCdzY29wZScsICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3BsdXMubG9naW4gZW1haWwnKVxuICAgICAgICAuYWRkU2VhcmNoKCdhY2Nlc3NfdHlwZScsICdvZmZsaW5lJylcbiAgICAgICAgLmFkZFNlYXJjaCgnc3RhdGUnLCBzdGF0ZSlcbiAgICAgICAgLnRvU3RyaW5nKCk7XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub3Blbih1cmwpO1xuICAgIH0pO1xuICB9O1xuXG4gIFNvY2lhbE1hbmFnZXIucHJvdG90eXBlLmxvZ2luVHdpdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgdHdpdHRlckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC50d2l0dGVyX2FwcGxpY2F0aW9uLFxuICAgICAgICBjdXN0b21lckFwcCA9IHRoaXMuX1NOQVBFbnZpcm9ubWVudC5jdXN0b21lcl9hcHBsaWNhdGlvbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciB0b2tlblNlY3JldDtcblxuICAgICAgZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgc2VsZi5fV2ViQnJvd3Nlci5vbk5hdmlnYXRlZC5yZW1vdmUob25OYXZpZ2F0ZWQpO1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBfcmVqZWN0ID0gcmVqZWN0LCBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICByZWplY3QgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVW5hYmxlIHRvIGxvZ2luIHdpdGggVHdpdHRlcjogJyArIGUpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZWplY3QoZSk7XG4gICAgICB9O1xuICAgICAgcmVzb2x2ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGxvZ2luIGNvbXBsZXRlLicpO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgICAgIF9yZXNvbHZlKGRhdGEpO1xuICAgICAgfTtcblxuICAgICAgZnVuY3Rpb24gb25OYXZpZ2F0ZWQodXJsKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZih0d2l0dGVyQXBwLnJlZGlyZWN0X3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgdHdpdHRlckF1dGggPSBVUkkodXJsKS5zZWFyY2godHJ1ZSk7XG5cbiAgICAgICAgICBpZiAodHdpdHRlckF1dGguZXJyb3IgfHwgIXR3aXR0ZXJBdXRoLm9hdXRoX3ZlcmlmaWVyKSB7XG4gICAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgZXJyb3I6ICcgKyB0d2l0dGVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KHR3aXR0ZXJBdXRoLmVycm9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9Mb2dnZXIuZGVidWcoJ1R3aXR0ZXIgY2FsbGJhY2sgcmVjZWl2ZWQuJyk7XG5cbiAgICAgICAgICBzZWxmLl9EdHNBcGkuY3VzdG9tZXIuc2lnblVwVHdpdHRlcih7XG4gICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgIHJlcXVlc3RfdG9rZW46IHR3aXR0ZXJBdXRoLm9hdXRoX3Rva2VuLFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl9zZWNyZXQ6IHRva2VuU2VjcmV0LFxuICAgICAgICAgICAgcmVxdWVzdF90b2tlbl92ZXJpZmllcjogdHdpdHRlckF1dGgub2F1dGhfdmVyaWZpZXJcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHRpY2tldCkge1xuICAgICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIHNpZ25pbiBjb21wbGV0ZS4nKTtcblxuICAgICAgICAgICAgdmFyIHVybCA9IHNlbGYuX0R0c0FwaS5vYXV0aDIuZ2V0QXV0aENvbmZpcm1VcmwodGlja2V0LnRpY2tldF9pZCwge1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGN1c3RvbWVyQXBwLmNsaWVudF9pZCxcbiAgICAgICAgICAgICAgcmVzcG9uc2VfdHlwZTogJ3Rva2VuJyxcbiAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBjdXN0b21lckFwcC5jYWxsYmFja191cmxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVybC5pbmRleE9mKGN1c3RvbWVyQXBwLmNhbGxiYWNrX3VybCkgPT09IDApIHtcbiAgICAgICAgICB2YXIgY3VzdG9tZXJBdXRoID0gVVJJKCc/JyArIFVSSSh1cmwpLmZyYWdtZW50KCkpLnNlYXJjaCh0cnVlKTtcblxuICAgICAgICAgIGlmIChjdXN0b21lckF1dGguZXJyb3IgfHwgIWN1c3RvbWVyQXV0aC5hY2Nlc3NfdG9rZW4pIHtcbiAgICAgICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciBjdXN0b21lciBjYWxsYmFjayBlcnJvcjogJyArIGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGN1c3RvbWVyQXV0aC5lcnJvcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdUd2l0dGVyIGN1c3RvbWVyIGxvZ2luIGNvbXBsZXRlLicpO1xuXG4gICAgICAgICAgcmVzb2x2ZShjdXN0b21lckF1dGgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX1dlYkJyb3dzZXIub25OYXZpZ2F0ZWQuYWRkKG9uTmF2aWdhdGVkKTtcblxuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKCdMb2dnaW5nIGluIHdpdGggVHdpdHRlci4nKTtcblxuICAgICAgc2VsZi5fRHRzQXBpLmN1c3RvbWVyLnNpZ25VcFR3aXR0ZXJSZXF1ZXN0VG9rZW4oe1xuICAgICAgICBvYXV0aF9jYWxsYmFjazogdHdpdHRlckFwcC5yZWRpcmVjdF91cmxcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgdmFyIHVybCA9IFVSSSgnaHR0cHM6Ly9hcGkudHdpdHRlci5jb20vb2F1dGgvYXV0aGVudGljYXRlJylcbiAgICAgICAgLmFkZFNlYXJjaCgnb2F1dGhfdG9rZW4nLCB0b2tlbi5vYXV0aF90b2tlbilcbiAgICAgICAgLmFkZFNlYXJjaCgnZm9yY2VfbG9naW4nLCAndHJ1ZScpXG4gICAgICAgIC50b1N0cmluZygpO1xuXG4gICAgICAgIHNlbGYuX0xvZ2dlci5kZWJ1ZygnVHdpdHRlciByZXF1ZXN0IHRva2VuIHJlY2VpdmVkLicpO1xuXG4gICAgICAgIHRva2VuU2VjcmV0ID0gdG9rZW4ub2F1dGhfdG9rZW5fc2VjcmV0O1xuICAgICAgICBzZWxmLl9XZWJCcm93c2VyLm9wZW4odXJsKTtcbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBIZWxwZXJzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBTb2NpYWxNYW5hZ2VyLnByb3RvdHlwZS5fZ2VuZXJhdGVUb2tlbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9O1xuXG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvc29ja2V0Y2xpZW50LmpzXG5cbndpbmRvdy5hcHAuU29ja2V0Q2xpZW50ID0gY2xhc3MgU29ja2V0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IoU2Vzc2lvblByb3ZpZGVyLCBMb2dnZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLl9TZXNzaW9uUHJvdmlkZXIgPSBTZXNzaW9uUHJvdmlkZXI7XG4gICAgdGhpcy5fTG9nZ2VyID0gTG9nZ2VyO1xuXG4gICAgdGhpcy5pc0Nvbm5lY3RlZENoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuX2NoYW5uZWxzID0ge307XG4gICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldENsdXN0ZXIuY29ubmVjdCh7XG4gICAgICBwYXRoOiAnL3NvY2tldHMvJyxcbiAgICAgIHBvcnQ6IDgwODBcbiAgICB9KTtcbiAgICB0aGlzLl9zb2NrZXQub24oJ2Nvbm5lY3QnLCBzdGF0dXMgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBTb2NrZXQgY29ubmVjdGVkLmApO1xuICAgICAgc2VsZi5fYXV0aGVudGljYXRlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5fc29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuICAgICAgc2VsZi5fTG9nZ2VyLmRlYnVnKGBTb2NrZXQgZGlzY29ubmVjdGVkLmApO1xuICAgICAgc2VsZi5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHNlbGYuaXNDb25uZWN0ZWRDaGFuZ2VkLmRpc3BhdGNoKHNlbGYuaXNDb25uZWN0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0IGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLl9pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIHN1YnNjcmliZSh0b3BpYywgaGFuZGxlcikge1xuICAgIHRoaXMuX2dldENoYW5uZWwodG9waWMpLndhdGNoKGhhbmRsZXIpO1xuICB9XG5cbiAgc2VuZCh0b3BpYywgZGF0YSkge1xuICAgIHRoaXMuX2dldENoYW5uZWwodG9waWMpLnB1Ymxpc2goZGF0YSk7XG4gIH1cblxuICBfZ2V0Q2hhbm5lbCh0b3BpYykge1xuICAgIHJldHVybiB0aGlzLl9jaGFubmVsc1t0b3BpY10gfHwgKHRoaXMuX2NoYW5uZWxzW3RvcGljXSA9IHRoaXMuX3NvY2tldC5zdWJzY3JpYmUodG9waWMpKTtcbiAgfVxuXG4gIF9hdXRoZW50aWNhdGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuX1Nlc3Npb25Qcm92aWRlci5nZXRCdXNpbmVzc1Rva2VuKCkudGhlbih0b2tlbiA9PiB7XG4gICAgICBzZWxmLl9zb2NrZXQuZW1pdCgnYXV0aGVudGljYXRlJywge1xuICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuXG4gICAgICB9LCBlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgc2VsZi5fTG9nZ2VyLndhcm4oYFVuYWJsZSB0byBhdXRoZW50aWNhdGUgc29ja2V0OiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5pc0Nvbm5lY3RlZENoYW5nZWQuZGlzcGF0Y2goc2VsZi5pc0Nvbm5lY3RlZCk7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIHNlbGYuX0xvZ2dlci53YXJuKGBVbmFibGUgdG8gcGVyZm9ybSBzb2NrZXQgYXV0aGVudGljYXRpb246ICR7ZS5tZXNzYWdlfWApO1xuICAgIH0pO1xuICB9XG59O1xuXG4vL3NyYy9qcy9zaGFyZWQvc29mdHdhcmVtYW5hZ2VyLmpzXG5cbihmdW5jdGlvbigpIHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU29mdHdhcmVNYW5hZ2VyXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFNvZnR3YXJlTWFuYWdlciA9IGZ1bmN0aW9uKFNOQVBFbnZpcm9ubWVudCkge1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcbiAgfTtcblxuICB3aW5kb3cuYXBwLlNvZnR3YXJlTWFuYWdlciA9IFNvZnR3YXJlTWFuYWdlcjtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU29mdHdhcmVNYW5hZ2VyLnByb3RvdHlwZSwgJ2N1cnJlbnRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0dGVybiA9IC8oU05BUClcXC8oWzAtOS5dKykvLFxuICAgICAgICAgIG1hdGNoID0gcGF0dGVybi5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiAnOC44LjguOCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLCAncmVxdWlyZWRWZXJzaW9uJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fU05BUEVudmlyb25tZW50LnJlcXVpcmVtZW50c1t0aGlzLl9TTkFQRW52aXJvbm1lbnQucGxhdGZvcm1dO1xuICAgIH1cbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvZnR3YXJlTWFuYWdlci5wcm90b3R5cGUsICd1cGRhdGVSZXF1aXJlZCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZlcnNpb25Db21wYXJlKHRoaXMuY3VycmVudFZlcnNpb24sIHRoaXMucmVxdWlyZWRWZXJzaW9uKSA9PT0gLTE7XG4gICAgfVxuICB9KTtcblxuICBTb2Z0d2FyZU1hbmFnZXIucHJvdG90eXBlLl92ZXJzaW9uQ29tcGFyZSA9IGZ1bmN0aW9uKHYxLCB2Miwgb3B0aW9ucykge1xuICAgIGlmICghdjEgfHwgIXYyKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICB2YXIgbGV4aWNvZ3JhcGhpY2FsID0gb3B0aW9ucyAmJiBvcHRpb25zLmxleGljb2dyYXBoaWNhbCxcbiAgICAgICAgemVyb0V4dGVuZCA9IG9wdGlvbnMgJiYgb3B0aW9ucy56ZXJvRXh0ZW5kLFxuICAgICAgICB2MXBhcnRzID0gdjEuc3BsaXQoJy4nKSxcbiAgICAgICAgdjJwYXJ0cyA9IHYyLnNwbGl0KCcuJyk7XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkUGFydCh4KSB7XG4gICAgICByZXR1cm4gKGxleGljb2dyYXBoaWNhbCA/IC9eXFxkK1tBLVphLXpdKiQvIDogL15cXGQrJC8pLnRlc3QoeCk7XG4gICAgfVxuXG4gICAgaWYgKCF2MXBhcnRzLmV2ZXJ5KGlzVmFsaWRQYXJ0KSB8fCAhdjJwYXJ0cy5ldmVyeShpc1ZhbGlkUGFydCkpIHtcbiAgICAgIHJldHVybiBOYU47XG4gICAgfVxuXG4gICAgaWYgKHplcm9FeHRlbmQpIHtcbiAgICAgIHdoaWxlICh2MXBhcnRzLmxlbmd0aCA8IHYycGFydHMubGVuZ3RoKSB7XG4gICAgICAgIHYxcGFydHMucHVzaCgnMCcpO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHYycGFydHMubGVuZ3RoIDwgdjFwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgdjJwYXJ0cy5wdXNoKCcwJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFsZXhpY29ncmFwaGljYWwpIHtcbiAgICAgIHYxcGFydHMgPSB2MXBhcnRzLm1hcChOdW1iZXIpO1xuICAgICAgdjJwYXJ0cyA9IHYycGFydHMubWFwKE51bWJlcik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2MXBhcnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAodjJwYXJ0cy5sZW5ndGggPT09IGkpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG5cbiAgICAgIGlmICh2MXBhcnRzW2ldID09PSB2MnBhcnRzW2ldKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodjFwYXJ0c1tpXSA+IHYycGFydHNbaV0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2MXBhcnRzLmxlbmd0aCAhPT0gdjJwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zdG9yZS5qc1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0b3JlXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIFN0b3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IG51bGw7XG4gIH07XG5cbiAgd2luZG93LmFwcC5TdG9yZSA9IFN0b3JlO1xuXG4gIFN0b3JlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3N0b3JhZ2UgPSBudWxsO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfTtcblxuICBTdG9yZS5wcm90b3R5cGUucmVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZXNvbHZlKHNlbGYuX3N0b3JhZ2UpO1xuICAgIH0pO1xuICB9O1xuXG4gIFN0b3JlLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHNlbGYuX3N0b3JhZ2UgPSB2YWx1ZTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgfTtcbn0pKCk7XG5cbi8vc3JjL2pzL3NoYXJlZC9zdG9yZS5sb2NhbHN0b3JhZ2UuanNcblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBMb2NhbFN0b3JhZ2VTdG9yZVxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBMb2NhbFN0b3JhZ2VTdG9yZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgYXBwLlN0b3JlLmNhbGwodGhpcyk7XG4gICAgdGhpcy5faWQgPSBpZDtcbiAgfTtcblxuICBMb2NhbFN0b3JhZ2VTdG9yZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGFwcC5TdG9yZS5wcm90b3R5cGUpO1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHN0b3JlLnJlbW92ZSh0aGlzLl9pZCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9O1xuXG4gIExvY2FsU3RvcmFnZVN0b3JlLnByb3RvdHlwZS5yZWFkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzdG9yZS5nZXQodGhpcy5faWQpKTtcbiAgfTtcblxuICBMb2NhbFN0b3JhZ2VTdG9yZS5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHN0b3JlLnNldCh0aGlzLl9pZCwgdmFsdWUpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfTtcblxuICB3aW5kb3cuYXBwLkxvY2FsU3RvcmFnZVN0b3JlID0gTG9jYWxTdG9yYWdlU3RvcmU7XG59KSgpO1xuXG4vL3NyYy9qcy9zaGFyZWQvc3VydmV5bWFuYWdlci5qc1xuXG53aW5kb3cuYXBwLlN1cnZleU1hbmFnZXIgPSBjbGFzcyBTdXJ2ZXlNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoRGF0YVByb3ZpZGVyLCBTdXJ2ZXlNb2RlbCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuX0RhdGFQcm92aWRlciA9IERhdGFQcm92aWRlcjtcbiAgICB0aGlzLl9TdXJ2ZXlNb2RlbCA9IFN1cnZleU1vZGVsO1xuXG4gICAgaWYgKHRoaXMuX1N1cnZleU1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgdGhpcy5fRGF0YVByb3ZpZGVyLnN1cnZleXMoKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICBzZWxmLl9TdXJ2ZXlNb2RlbC5mZWVkYmFja1N1cnZleSA9IGRhdGEuc3VydmV5c1swXTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldCBtb2RlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fU3VydmV5TW9kZWw7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmIChzZWxmLl9TdXJ2ZXlNb2RlbC5pc0VuYWJsZWQpIHtcbiAgICAgICAgc2VsZi5fU3VydmV5TW9kZWwuZmVlZGJhY2tTdXJ2ZXlDb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbi8vc3JjL2pzL3NoYXJlZC9zdXJ2ZXltb2RlbC5qc1xuXG53aW5kb3cuYXBwLlN1cnZleU1vZGVsID0gY2xhc3MgU3VydmV5TW9kZWwge1xuICAvKiBnbG9iYWwgc2lnbmFscyAqL1xuXG4gIGNvbnN0cnVjdG9yKENvbmZpZywgc3RvcmFnZVByb3ZpZGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5faXNFbmFibGVkID0gQm9vbGVhbihDb25maWcuc3VydmV5cyk7XG4gICAgdGhpcy5fc3VydmV5cyA9IHt9O1xuXG4gICAgdGhpcy5fc3RvcmUgPSBzdG9yYWdlUHJvdmlkZXIoJ3NuYXBfc3VydmV5Jyk7XG5cbiAgICB0aGlzLl9mZWVkYmFja1N1cnZleSA9IG51bGw7XG4gICAgdGhpcy5mZWVkYmFja1N1cnZleUNoYW5nZWQgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcblxuICAgIHRoaXMuc3VydmV5Q29tcGxldGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG5cbiAgICB0aGlzLl9zdG9yZS5yZWFkKCkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBzZWxmLl9zdXJ2ZXlzID0gdmFsdWUgfHwgc2VsZi5fc3VydmV5cztcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpc0VuYWJsZWQoKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5faXNFbmFibGVkKTtcbiAgfVxuXG4gIGdldCBmZWVkYmFja1N1cnZleSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZmVlZGJhY2tTdXJ2ZXk7XG4gIH1cblxuICBzZXQgZmVlZGJhY2tTdXJ2ZXkodmFsdWUpIHtcbiAgICB0aGlzLl9mZWVkYmFja1N1cnZleSA9IHZhbHVlO1xuICAgIHRoaXMuZmVlZGJhY2tTdXJ2ZXlDaGFuZ2VkLmRpc3BhdGNoKHRoaXMuX2ZlZWRiYWNrU3VydmV5KTtcbiAgfVxuXG4gIGdldCBmZWVkYmFja1N1cnZleUNvbXBsZXRlKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX3N1cnZleXMuZmVlZGJhY2spO1xuICB9XG5cbiAgc2V0IGZlZWRiYWNrU3VydmV5Q29tcGxldGUodmFsdWUpIHtcbiAgICB0aGlzLl9zdXJ2ZXlzLmZlZWRiYWNrID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgdGhpcy5fc3RvcmUud3JpdGUodGhpcy5fc3VydmV5cyk7XG5cbiAgICB0aGlzLnN1cnZleUNvbXBsZXRlZC5kaXNwYXRjaCh0aGlzLmZlZWRiYWNrU3VydmV5KTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3RlbGVtZXRyeXNlcnZpY2UuanNcblxud2luZG93LmFwcC5UZWxlbWV0cnlTZXJ2aWNlID0gY2xhc3MgVGVsZW1ldHJ5U2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCRyZXNvdXJjZSkge1xuICAgIHRoaXMuX2FwaSA9IHtcbiAgICAgICdzdWJtaXRUZWxlbWV0cnknOiAkcmVzb3VyY2UoJy9zbmFwL3RlbGVtZXRyeScsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSksXG4gICAgICAnc3VibWl0TG9ncyc6ICRyZXNvdXJjZSgnL3NuYXAvbG9ncycsIHt9LCB7IHF1ZXJ5OiB7IG1ldGhvZDogJ1BPU1QnIH0gfSlcbiAgICB9O1xuICB9XG5cbiAgc3VibWl0VGVsZW1ldHJ5KGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fYXBpLnN1Ym1pdFRlbGVtZXRyeS5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxuXG4gIHN1Ym1pdExvZ3MoZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9hcGkuc3VibWl0TG9ncy5xdWVyeShkYXRhKS4kcHJvbWlzZTtcbiAgfVxufTtcblxuLy9zcmMvanMvc2hhcmVkL3dlYmJyb3dzZXIuanNcblxud2luZG93LmFwcC5XZWJCcm93c2VyID0gY2xhc3MgV2ViQnJvd3NlciB7XG4gIC8qIGdsb2JhbCBzaWduYWxzLCBVUkkgKi9cblxuICBjb25zdHJ1Y3Rvcigkd2luZG93LCBBbmFseXRpY3NNb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKSB7XG4gICAgdGhpcy4kJHdpbmRvdyA9ICR3aW5kb3c7XG4gICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwgPSBBbmFseXRpY3NNb2RlbDtcbiAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZSA9IE1hbmFnZW1lbnRTZXJ2aWNlO1xuICAgIHRoaXMuX1NOQVBFbnZpcm9ubWVudCA9IFNOQVBFbnZpcm9ubWVudDtcblxuICAgIHRoaXMuX2xvY2FsSG9zdHMgPSBPYmplY3Qua2V5cyhTTkFQSG9zdHMpLm1hcChwID0+IFNOQVBIb3N0c1twXS5ob3N0KTtcbiAgICB0aGlzLl9sb2NhbEhvc3RzLnB1c2goJ2xvY2FsaG9zdCcpO1xuXG4gICAgdGhpcy5vbk9wZW4gPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uQ2xvc2UgPSBuZXcgc2lnbmFscy5TaWduYWwoKTtcbiAgICB0aGlzLm9uTmF2aWdhdGVkID0gbmV3IHNpZ25hbHMuU2lnbmFsKCk7XG4gIH1cblxuICBnZXQgaXNFeHRlcm5hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fU05BUEVudmlyb25tZW50LnBsYXRmb3JtICE9PSAnd2ViJztcbiAgfVxuXG4gIG5hdmlnYXRlZCh1cmwpIHtcbiAgICB0aGlzLm9uTmF2aWdhdGVkLmRpc3BhdGNoKHVybCk7XG5cbiAgICBsZXQgaG9zdCA9IFVSSSh1cmwpLmhvc3RuYW1lKCk7XG5cbiAgICBpZiAodGhpcy5fbG9jYWxIb3N0cy5pbmRleE9mKGhvc3QpID09PSAtMSkge1xuICAgICAgdGhpcy5fQW5hbHl0aWNzTW9kZWwubG9nVXJsKHVybCk7XG4gICAgfVxuICB9XG5cbiAgb3Blbih1cmwpIHtcbiAgICBpZiAodGhpcy5pc0V4dGVybmFsKSB7XG4gICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5vcGVuQnJvd3Nlcih1cmwpO1xuICAgIH1cblxuICAgIHRoaXMub25PcGVuLmRpc3BhdGNoKHVybCk7XG4gICAgdGhpcy5fYnJvd3Nlck9wZW5lZCA9IHRydWU7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5fYnJvd3Nlck9wZW5lZCkge1xuICAgICAgaWYgKHRoaXMuaXNFeHRlcm5hbCkge1xuICAgICAgICB0aGlzLl9NYW5hZ2VtZW50U2VydmljZS5jbG9zZUJyb3dzZXIoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vbkNsb3NlLmRpc3BhdGNoKCk7XG4gICAgICB0aGlzLl9icm93c2VyT3BlbmVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZ2V0QXBwVXJsKHVybCkge1xuICAgIHZhciBob3N0ID0gdGhpcy4kJHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyB0aGlzLiQkd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lICtcbiAgICAgICh0aGlzLiQkd2luZG93LmxvY2F0aW9uLnBvcnQgPyAnOicgKyB0aGlzLiQkd2luZG93LmxvY2F0aW9uLnBvcnQ6ICcnKTtcbiAgICByZXR1cm4gaG9zdCArIHVybDtcbiAgfVxufTtcblxuLy9zcmMvanMvYXBwcy5qc1xuXG4oZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHN0YXRpY0hvc3RSZWdleCgpIHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCgnLionICsgU05BUF9IT1NUU19DT05GSUcuc3RhdGljICsgJy4qJyk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRQYXJ0aWFsVXJsKG5hbWUpIHtcbiAgICByZXR1cm4gYC8vJHtTTkFQX0hPU1RTX0NPTkZJRy5zdGF0aWMuaG9zdH0ke1NOQVBfSE9TVFNfQ09ORklHLnN0YXRpYy5wYXRofS9kaXN0LyR7U05BUF9FTlZJUk9OTUVOVC52ZXJzaW9ufWAgK1xuICAgICAgYC9hc3NldHMvJHtTTkFQX0NPTkZJRy50aGVtZS5sYXlvdXR9L3BhcnRpYWxzLyR7bmFtZX0uaHRtbGA7XG4gIH1cblxuICBhbmd1bGFyLm1vZHVsZSgnU05BUEFwcGxpY2F0aW9uJywgW1xuICAgICduZ1JvdXRlJyxcbiAgICAnbmdBbmltYXRlJyxcbiAgICAnbmdUb3VjaCcsXG4gICAgJ25nU2FuaXRpemUnLFxuICAgICdTTkFQLmNvbmZpZ3MnLFxuICAgICdTTkFQLmNvbnRyb2xsZXJzJyxcbiAgICAnU05BUC5kaXJlY3RpdmVzJyxcbiAgICAnU05BUC5maWx0ZXJzJyxcbiAgICAnU05BUC5zZXJ2aWNlcydcbiAgXSkuXG4gIGNvbmZpZyhcbiAgICBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyRyb3V0ZVByb3ZpZGVyJywgJyRzY2VEZWxlZ2F0ZVByb3ZpZGVyJyxcbiAgICAoJGxvY2F0aW9uUHJvdmlkZXIsICRyb3V0ZVByb3ZpZGVyLCAkc2NlRGVsZWdhdGVQcm92aWRlcikgPT4ge1xuXG4gICAgJHNjZURlbGVnYXRlUHJvdmlkZXIucmVzb3VyY2VVcmxXaGl0ZWxpc3QoWydzZWxmJywgc3RhdGljSG9zdFJlZ2V4KCldKTtcblxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZShmYWxzZSk7XG5cbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvJywgeyB0ZW1wbGF0ZTogJyAnLCBjb250cm9sbGVyOiAnSG9tZUJhc2VDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvbWVudS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdNZW51QmFzZUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jYXRlZ29yeS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdDYXRlZ29yeUJhc2VDdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKCcvaXRlbS86dG9rZW4nLCB7IHRlbXBsYXRlOiAnICcsIGNvbnRyb2xsZXI6ICdJdGVtQmFzZUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy91cmwvOnVybCcsIHsgdGVtcGxhdGU6ICcgJywgY29udHJvbGxlcjogJ1VybEN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGVja291dCcsIHsgdGVtcGxhdGVVcmw6IGdldFBhcnRpYWxVcmwoJ2NoZWNrb3V0JyksIGNvbnRyb2xsZXI6ICdDaGVja291dEN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9zaWduaW4nLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdzaWduaW4nKSwgY29udHJvbGxlcjogJ1NpZ25JbkN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9hY2NvdW50JywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnYWNjb3VudCcpLCBjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGF0JywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnY2hhdCcpLCBjb250cm9sbGVyOiAnQ2hhdEN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9jaGF0bWFwJywgeyB0ZW1wbGF0ZVVybDogZ2V0UGFydGlhbFVybCgnY2hhdG1hcCcpLCBjb250cm9sbGVyOiAnQ2hhdE1hcEN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy9zdXJ2ZXknLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdzdXJ2ZXknKSwgY29udHJvbGxlcjogJ1N1cnZleUN0cmwnIH0pO1xuICAgICRyb3V0ZVByb3ZpZGVyLm90aGVyd2lzZSh7IHJlZGlyZWN0VG86ICcvJyB9KTtcbiAgfV0pO1xuXG4gIGFuZ3VsYXIubW9kdWxlKCdTTkFQQXV4aWxpYXJlcycsIFtcbiAgICAnbmdSb3V0ZScsXG4gICAgJ25nQW5pbWF0ZScsXG4gICAgJ25nVG91Y2gnLFxuICAgICduZ1Nhbml0aXplJyxcbiAgICAnU05BUC5jb25maWdzJyxcbiAgICAnU05BUC5jb250cm9sbGVycycsXG4gICAgJ1NOQVAuZGlyZWN0aXZlcycsXG4gICAgJ1NOQVAuZmlsdGVycycsXG4gICAgJ1NOQVAuc2VydmljZXMnXG4gIF0pLlxuICBjb25maWcoXG4gICAgWyckbG9jYXRpb25Qcm92aWRlcicsICckcm91dGVQcm92aWRlcicsXG4gICAgKCRsb2NhdGlvblByb3ZpZGVyLCAkcm91dGVQcm92aWRlcikgPT4ge1xuXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKGZhbHNlKTtcblxuICAgICRyb3V0ZVByb3ZpZGVyLndoZW4oJy8nLCB7IHRlbXBsYXRlVXJsOiBnZXRQYXJ0aWFsVXJsKCdjaGF0cm9vbScpLCBjb250cm9sbGVyOiAnQ2hhdFJvb21DdHJsJyB9KTtcbiAgICAkcm91dGVQcm92aWRlci5vdGhlcndpc2UoeyByZWRpcmVjdFRvOiAnLycgfSk7XG4gIH1dKTtcbn0pKCk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJywgWydhbmd1bGFyLWJhY29uJ10pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9hY2NvdW50LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIFsnJHNjb3BlJywgJ0N1c3RvbWVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCBDdXN0b21lck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG5cbiAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkIHx8ICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBDb25zdGFudHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJvcGVydGllc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUHJvZmlsZVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnByb2ZpbGUgPSBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZTtcbiAgJHNjb3BlLmNhbkNoYW5nZVBhc3N3b3JkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICB2YXIgcHJvZmlsZSA9ICRzY29wZS4kd2F0Y2hBc1Byb3BlcnR5KCdwcm9maWxlJyk7XG5cbiAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZChmdW5jdGlvbih2YWx1ZSkge1xuICAgICRzY29wZS5wcm9maWxlID0gdmFsdWU7XG4gICAgJHNjb3BlLmNhbkNoYW5nZVBhc3N3b3JkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmhhc0NyZWRlbnRpYWxzO1xuICAgICRzY29wZS5jYW5DaGFuZ2VFbWFpbCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscztcbiAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBTcGxhc2ggc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuZWRpdFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvZmlsZWVkaXQgPSBhbmd1bGFyLmNvcHkoJHNjb3BlLnByb2ZpbGUpO1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5lZGl0UGFzc3dvcmQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGFzc3dvcmRlZGl0ID0ge1xuICAgICAgb2xkX3Bhc3N3b3JkOiAnJyxcbiAgICAgIG5ld19wYXNzd29yZDogJydcbiAgICB9O1xuICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgICAkc2NvcGUuc2hvd1Bhc3N3b3JkRWRpdCA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLmVkaXRQYXltZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQYXltZW50RWRpdCA9IHRydWU7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBQcm9maWxlIGVkaXQgc2NyZWVuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJvZmlsZUVkaXRTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLnVwZGF0ZVByb2ZpbGUoJHNjb3BlLnByb2ZpbGVlZGl0KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICRzY29wZS5zaG93UHJvZmlsZUVkaXQgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnByb2ZpbGVFZGl0Q2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dQcm9maWxlRWRpdCA9IGZhbHNlO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUGFzc3dvcmQgZWRpdCBzY3JlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYXNzd29yZEVkaXRTdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLmNoYW5nZVBhc3N3b3JkKCRzY29wZS5wYXNzd29yZGVkaXQpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnNob3dQYXNzd29yZEVkaXQgPSBmYWxzZTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnBhc3N3b3JkRWRpdENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zaG93UGFzc3dvcmRFZGl0ID0gZmFsc2U7XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2JhY2tncm91bmQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0JhY2tncm91bmRDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xuXG4gIGZ1bmN0aW9uIHNob3dJbWFnZXModmFsdWVzKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaW1hZ2VzID0gdmFsdWVzLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChpdGVtLm1lZGlhLCAxOTIwLCAxMDgwLCAnanBnJyksXG4gICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShpdGVtLm1lZGlhKVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB2YXIgYmFja2dyb3VuZHMgPSBTaGVsbE1hbmFnZXIubW9kZWwuYmFja2dyb3VuZHMsXG4gICAgICBwYWdlQmFja2dyb3VuZHMgPSBudWxsO1xuXG4gIHNob3dJbWFnZXMoYmFja2dyb3VuZHMpO1xuICBTaGVsbE1hbmFnZXIubW9kZWwuYmFja2dyb3VuZHNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgYmFja2dyb3VuZHMgPSB2YWx1ZTtcbiAgICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgfSk7XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2VkLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIHZhciBuZXdQYWdlQmFja2dyb3VuZHMgPSBTaGVsbE1hbmFnZXIuZ2V0UGFnZUJhY2tncm91bmRzKGxvY2F0aW9uKTtcblxuICAgIGlmIChuZXdQYWdlQmFja2dyb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgcGFnZUJhY2tncm91bmRzID0gbmV3UGFnZUJhY2tncm91bmRzO1xuICAgICAgc2hvd0ltYWdlcyhwYWdlQmFja2dyb3VuZHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChwYWdlQmFja2dyb3VuZHMpIHtcbiAgICAgIHN3aXRjaCAobG9jYXRpb24udHlwZSkge1xuICAgICAgICBjYXNlICdtZW51JzpcbiAgICAgICAgY2FzZSAnY2F0ZWdvcnknOlxuICAgICAgICBjYXNlICdpdGVtJzpcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFnZUJhY2tncm91bmRzID0gbnVsbDtcbiAgICBzaG93SW1hZ2VzKGJhY2tncm91bmRzKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NhcnQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhcnRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJHNjZScsICdDdXN0b21lck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ0NoYXRNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsICRzY2UsIEN1c3RvbWVyTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIENoYXRNYW5hZ2VyKSA9PiB7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcbiAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcblxuICAkc2NvcGUuc3RhdGUgPSBDYXJ0TW9kZWwuY2FydFN0YXRlO1xuICBDYXJ0TW9kZWwuY2FydFN0YXRlQ2hhbmdlZC5hZGQoc3RhdGUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0YXRlID0gc3RhdGUpKTtcblxuICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSB2YWx1ZSk7XG5cbiAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiAkc2NvcGUudG90YWxPcmRlciA9IHZhbHVlKTtcblxuICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdENoYW5nZWQuYWRkKHRva2VuID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQodG9rZW4pKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gdHJ1ZTtcbiAgJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSA9IHRydWU7XG4gICRzY29wZS5jaGVja291dEVuYWJsZWQgPSBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICRzY29wZS52aXNpYmxlID0gQ2FydE1vZGVsLmlzQ2FydE9wZW47XG5cbiAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQobG9jYXRpb24gPT4ge1xuICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHNjb3BlLnNob3dDYXJ0KCk7XG4gICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNlYXRfbmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/XG4gICAgTG9jYXRpb25Nb2RlbC5zZWF0Lm5hbWUgOlxuICAgICdUYWJsZSc7XG5cbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiAkc2NvcGUuc2VhdF9uYW1lID0gc2VhdCA/IHNlYXQubmFtZSA6ICdUYWJsZScpO1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gIH07XG4gIHZhciByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0ID0gKCkgPT4ge1xuICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG4gIH07XG5cbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hDbG9zZW91dFJlcXVlc3QpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcbiAgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCgpO1xuXG4gICRzY29wZS5jYWxjdWxhdGVEZXNjcmlwdGlvbiA9IGVudHJ5ID0+IHtcbiAgICB2YXIgcmVzdWx0ID0gZW50cnkubmFtZSB8fCBlbnRyeS5pdGVtLnRpdGxlO1xuXG4gICAgcmVzdWx0ICs9IGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKG91dHB1dCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgIHJldHVybiBvdXRwdXQgKyBjYXRlZ29yeS5tb2RpZmllcnMucmVkdWNlKChvdXRwdXQsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAgIHJldHVybiBvdXRwdXQgKyAobW9kaWZpZXIuaXNTZWxlY3RlZCA/XG4gICAgICAgICAgJzxici8+LSAnICsgbW9kaWZpZXIuZGF0YS50aXRsZSA6XG4gICAgICAgICAgJycpO1xuICAgICAgfSwgJycpO1xuICAgIH0sICcnKTtcblxuICAgIHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHJlc3VsdCk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgJHNjb3BlLmNhbGN1bGF0ZVRvdGFsUHJpY2UgPSBlbnRyaWVzID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpO1xuXG4gICRzY29wZS5lZGl0SXRlbSA9IGVudHJ5ID0+IENhcnRNb2RlbC5vcGVuRWRpdG9yKGVudHJ5LCBmYWxzZSk7XG4gICRzY29wZS5yZW1vdmVGcm9tQ2FydCA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIucmVtb3ZlRnJvbUNhcnQoZW50cnkpO1xuICAkc2NvcGUucmVvcmRlckl0ZW0gPSBlbnRyeSA9PiAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChlbnRyeS5jbG9uZSgpKTtcblxuICAkc2NvcGUuc3VibWl0Q2FydCA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSAkc2NvcGUub3B0aW9ucy50b19nb19vcmRlciA/IDIgOiAwO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQob3B0aW9ucykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuY3VycmVudE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydDtcbiAgICAgICAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgICAgICAgJHNjb3BlLnRvR29PcmRlciA9IGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9PUkRFUl9TRU5UKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmNsZWFyQ2FydCA9ICgpID0+IHtcbiAgICAkc2NvcGUudG9Hb09yZGVyID0gZmFsc2U7XG4gICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5jbGVhckNhcnQoKTtcbiAgfTtcblxuICAkc2NvcGUuY2xvc2VDYXJ0ID0gKCkgPT4ge1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gZmFsc2U7XG4gICAgJHNjb3BlLnNob3dDYXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLnNob3dIaXN0b3J5ID0gKCkgPT4gQ2FydE1vZGVsLmNhcnRTdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9ISVNUT1JZO1xuICAkc2NvcGUuc2hvd0NhcnQgPSAoKSA9PiBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG5cbiAgJHNjb3BlLnBheUNoZWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGVja291dCcgfTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0NMT1NFT1VUX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2F0ZWdvcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NhdGVnb3J5QmFzZUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2F0ZWdvcnlDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU05BUEVudmlyb25tZW50JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNOQVBFbnZpcm9ubWVudCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgdmFyIENhdGVnb3J5TGlzdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbGVDbGFzc05hbWUgPSBTaGVsbE1hbmFnZXIudGlsZVN0eWxlO1xuICAgICAgdmFyIHJvd3MgPSB0aGlzLnByb3BzLnRpbGVzLm1hcChmdW5jdGlvbih0aWxlLCBpKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogdGlsZUNsYXNzTmFtZSxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6ICd1cmwoJyArIFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCAzNzAsIDM3MCkgKyAnKSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSkucmVkdWNlKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGkpIHtcbiAgICAgICAgcmVzdWx0W2kgJSAyXS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIFtbXSwgW11dKVxuICAgICAgLm1hcChmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgICAgcmV0dXJuIFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUoeyBjbGFzc05hbWU6ICd0aWxlLXRhYmxlJyB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgRGF0YU1hbmFnZXIuY2F0ZWdvcnkgPSBsb2NhdGlvbi50eXBlID09PSAnY2F0ZWdvcnknID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmNhdGVnb3J5KTtcbiAgICAkdGltZW91dChmdW5jdGlvbigpIHsgJHNjb3BlLiRhcHBseSgpOyB9KTtcbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuY2F0ZWdvcnlDaGFuZ2VkLmFkZChmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIHRpbGVzLFxuICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzIHx8IFtdO1xuICAgIHRpbGVzID0gZGF0YS5pdGVtcyB8fCBbXTtcbiAgICB0aWxlcyA9IGNhdGVnb3JpZXMuY29uY2F0KHRpbGVzKTtcblxuICAgIGlmIChTTkFQRW52aXJvbm1lbnQucGxhdGZvcm0gIT09ICdkZXNrdG9wJykge1xuICAgICAgdGlsZXMgPSB0aWxlcy5maWx0ZXIodGlsZSA9PiB0aWxlLnR5cGUgIT09IDMpO1xuICAgIH1cblxuICAgIHRpbGVzLmZvckVhY2godGlsZSA9PiB7XG4gICAgICB0aWxlLnVybCA9ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgodGlsZS5kZXN0aW5hdGlvbik7XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KENhdGVnb3J5TGlzdCwgeyB0aWxlczogdGlsZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudC1jYXRlZ29yeScpXG4gICAgKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0NoYXRNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnU05BUENvbmZpZycsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIENoYXRNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgU2hlbGxNYW5hZ2VyLCBTTkFQQ29uZmlnKSA9PiB7XG5cbiAgaWYgKCFTTkFQQ29uZmlnLmNoYXQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgJHNjb3BlLmxvY2F0aW9uTmFtZSA9IFNOQVBDb25maWcubG9jYXRpb25fbmFtZTtcblxuICAkc2NvcGUuZ2V0UGFydGlhbFVybCA9IG5hbWUgPT4gU2hlbGxNYW5hZ2VyLmdldFBhcnRpYWxVcmwobmFtZSk7XG5cbiAgJHNjb3BlLmNoYXRFbmFibGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkO1xuICBDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWRDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNoYXRFbmFibGVkID0gdmFsdWUpO1xuICB9KTtcblxuICAkc2NvcGUuYWN0aXZlRGV2aWNlcyA9IENoYXRNYW5hZ2VyLm1vZGVsLmFjdGl2ZURldmljZXM7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmFjdGl2ZURldmljZXNDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmFjdGl2ZURldmljZXMgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcblxuICAkc2NvcGUuZ2lmdERldmljZSA9IENoYXRNYW5hZ2VyLm1vZGVsLmdpZnREZXZpY2U7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnREZXZpY2VDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmdpZnREZXZpY2UgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS50b2dnbGVDaGF0ID0gKCkgPT4ge1xuICAgIENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCA9ICFDaGF0TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5NYXAgPSAoKSA9PiB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0bWFwJyB9O1xuICB9O1xuXG4gICRzY29wZS5nZXREZXZpY2VOYW1lID0gZGV2aWNlX3Rva2VuID0+IENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlX3Rva2VuKTtcblxuICAkc2NvcGUuZ2V0U2VhdE51bWJlciA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgdmFyIGRldmljZSA9IExvY2F0aW9uTW9kZWwuZ2V0RGV2aWNlKGRldmljZV90b2tlbik7XG5cbiAgICBmb3IgKHZhciBwIGluIExvY2F0aW9uTW9kZWwuc2VhdHMpIHtcbiAgICAgIGlmIChMb2NhdGlvbk1vZGVsLnNlYXRzW3BdLnRva2VuID09PSBkZXZpY2Uuc2VhdCkge1xuICAgICAgICBsZXQgbWF0Y2ggPSBMb2NhdGlvbk1vZGVsLnNlYXRzW3BdLm5hbWUubWF0Y2goL1xcZCsvKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gfHwgJycgOiAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ2hhdCA9IGRldmljZV90b2tlbiA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKCdBcmUgeW91IHN1cmUgeW91IHdvdWxkIGxpa2UgdG8gY2xvc2UgdGhlIGNoYXQgd2l0aCAnICsgJHNjb3BlLmdldERldmljZU5hbWUoZGV2aWNlX3Rva2VuKSArICc/JylcbiAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIENoYXRNYW5hZ2VyLmRlY2xpbmVEZXZpY2UoZGV2aWNlX3Rva2VuKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuZ2V0VW5yZWFkQ291bnQgPSBkZXZpY2VfdG9rZW4gPT4gQ2hhdE1hbmFnZXIuZ2V0VW5yZWFkQ291bnQoZGV2aWNlX3Rva2VuKTtcblxuICAkc2NvcGUuc2VuZEdpZnQgPSBkZXZpY2VfdG9rZW4gPT4ge1xuICAgIHZhciBkZXZpY2UgPSBMb2NhdGlvbk1vZGVsLmdldERldmljZShkZXZpY2VfdG9rZW4pLFxuICAgICAgICBzZWF0ID0gTG9jYXRpb25Nb2RlbC5nZXRTZWF0KGRldmljZS5zZWF0KTtcblxuICAgIGlmICghc2VhdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShgQXJlIHlvdSBzdXJlIHRoYXQgeW91IHdhbnQgdG8gc2VuZCBhIGdpZnQgdG8gJHtzZWF0Lm5hbWV9P2ApLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuc3RhcnRHaWZ0KGRldmljZV90b2tlbik7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbEdpZnQgPSAoKSA9PiBDaGF0TWFuYWdlci5lbmRHaWZ0KCk7XG5cbiAgQ2hhdE1hbmFnZXIuaXNQcmVzZW50ID0gdHJ1ZTtcblxuICB2YXIgd2F0Y2hMb2NhdGlvbiA9IHRydWU7XG5cbiAgJHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoKSA9PiB7XG4gICAgaWYgKHdhdGNoTG9jYXRpb24pIHtcbiAgICAgIENoYXRNYW5hZ2VyLm1vZGVsLmlzUHJlc2VudCA9IGZhbHNlO1xuICAgICAgd2F0Y2hMb2NhdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRib3guanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRCb3hDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJGF0dHJzJywgJ0NoYXRNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCAkYXR0cnMsIENoYXRNYW5hZ2VyLCBMb2NhdGlvbk1vZGVsKSB7XG4gIHZhciB0b19kZXZpY2UgPSAkc2NvcGUuZGV2aWNlLFxuICAgICAgdHlwZSA9IHRvX2RldmljZSA/XG4gICAgICAgIENoYXRNYW5hZ2VyLk1FU1NBR0VfVFlQRVMuREVWSUNFIDpcbiAgICAgICAgQ2hhdE1hbmFnZXIuTUVTU0FHRV9UWVBFUy5MT0NBVElPTjtcblxuICB2YXIgZGV2aWNlID0gdG9fZGV2aWNlID8gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UodG9fZGV2aWNlKSA6IG51bGw7XG5cbiAgJHNjb3BlLnJlYWRvbmx5ID0gQm9vbGVhbigkYXR0cnMucmVhZG9ubHkpO1xuICAkc2NvcGUuY2hhdCA9IHt9O1xuICAkc2NvcGUubWVzc2FnZXMgPSBbXTtcblxuICBmdW5jdGlvbiBzaG93TWVzc2FnZXMoKSB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLm1lc3NhZ2VzID0gQ2hhdE1hbmFnZXIubW9kZWwuaGlzdG9yeS5maWx0ZXIobWVzc2FnZSA9PiB7XG4gICAgICAgIHJldHVybiBtZXNzYWdlLnR5cGUgPT09IHR5cGUgJiYgKFxuICAgICAgICAgIG1lc3NhZ2UuZGV2aWNlID09PSB0b19kZXZpY2UgfHxcbiAgICAgICAgICBtZXNzYWdlLnRvX2RldmljZSA9PT0gdG9fZGV2aWNlXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jaGF0RW5hYmxlZCA9IENoYXRNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgQ2hhdE1hbmFnZXIubW9kZWwuaXNFbmFibGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jaGF0RW5hYmxlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmlzQ29ubmVjdGVkID0gQ2hhdE1hbmFnZXIubW9kZWwuaXNDb25uZWN0ZWQ7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmlzQ29ubmVjdGVkQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5pc0Nvbm5lY3RlZCA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNlbmRNZXNzYWdlID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLmlzQ29ubmVjdGVkIHx8ICEkc2NvcGUuY2hhdC5tZXNzYWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSB7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdG9fZGV2aWNlOiB0b19kZXZpY2UsXG4gICAgICB0ZXh0OiAkc2NvcGUuY2hhdC5tZXNzYWdlXG4gICAgfTtcblxuICAgIENoYXRNYW5hZ2VyLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgJHNjb3BlLmNoYXQubWVzc2FnZSA9ICcnO1xuICB9O1xuXG4gICRzY29wZS5nZXRGcm9tTmFtZSA9IG1lc3NhZ2UgPT4gQ2hhdE1hbmFnZXIuZ2V0TWVzc2FnZU5hbWUobWVzc2FnZSk7XG5cbiAgJHNjb3BlLmdldFN0YXR1c1RleHQgPSBtZXNzYWdlID0+IHtcbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgc3dpdGNoKG1lc3NhZ2Uuc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1Q6XG4gICAgICAgICAgcmV0dXJuICdZb3UgaGF2ZSByZXF1ZXN0ZWQgdG8gY2hhdCB3aXRoICcgKyBDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKG1lc3NhZ2UudG9fZGV2aWNlKTtcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGNoYXQgcmVxdWVzdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9DTE9TRUQ6XG4gICAgICAgICAgcmV0dXJuICdDbG9zZWQgdGhlIGNoYXQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAnR2lmdCByZXF1ZXN0IHNlbnQnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuR0lGVF9SRVFVRVNUX0FDQ0VQVEVEOlxuICAgICAgICAgIHJldHVybiAnQWNjZXB0ZWQgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRDpcbiAgICAgICAgICByZXR1cm4gJ0RlY2xpbmVkIGEgZ2lmdCc7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2UuZGV2aWNlID09PSB0b19kZXZpY2UpIHtcbiAgICAgIHN3aXRjaChtZXNzYWdlLnN0YXR1cykge1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUOlxuICAgICAgICAgIHJldHVybiAkc2NvcGUuZ2V0RnJvbU5hbWUobWVzc2FnZSkgKyAnIHdvdWxkIGxpa2UgdG8gY2hhdCB3aXRoIHlvdSc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX1JFUVVFU1RfQUNDRVBURUQ6XG4gICAgICAgICAgcmV0dXJuICdBY2NlcHRlZCBjaGF0IHJlcXVlc3QnO1xuICAgICAgICBjYXNlIENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEOlxuICAgICAgICAgIHJldHVybiAnRGVjbGluZWQgY2hhdCByZXF1ZXN0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfQ0xPU0VEOlxuICAgICAgICAgIHJldHVybiAnQ2xvc2VkIHRoZSBjaGF0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVDpcbiAgICAgICAgICByZXR1cm4gJ1dvdWxkIGxpa2UgdG8gc2VuZCB5b3UgYSBnaWZ0JztcbiAgICAgICAgY2FzZSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9BQ0NFUFRFRDpcbiAgICAgICAgICByZXR1cm4gJ0FjY2VwdGVkIGEgZ2lmdCc7XG4gICAgICAgIGNhc2UgQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfREVDTElORUQ6XG4gICAgICAgICAgcmV0dXJuICdEZWNsaW5lZCBhIGdpZnQnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuaXNVbnJlYWQgPSBtZXNzYWdlID0+IHtcbiAgICBpZiAobWVzc2FnZS50b19kZXZpY2UgPT09IHRvX2RldmljZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBDaGF0TWFuYWdlci5jaGVja0lmVW5yZWFkKHRvX2RldmljZSwgbWVzc2FnZSk7XG4gIH07XG5cbiAgJHNjb3BlLm1hcmtBc1JlYWQgPSAoKSA9PiB7XG4gICAgaWYgKCF0b19kZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDaGF0TWFuYWdlci5tYXJrQXNSZWFkKHRvX2RldmljZSk7XG4gIH07XG5cbiAgJHNjb3BlLm9uS2V5ZG93biA9IGtleWNvZGUgPT4ge1xuICAgIGlmIChrZXljb2RlID09PSAxMykge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zZW5kTWVzc2FnZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIExvY2F0aW9uTW9kZWwuZGV2aWNlc0NoYW5nZWQuYWRkKHNob3dNZXNzYWdlcyk7XG4gIExvY2F0aW9uTW9kZWwuc2VhdHNDaGFuZ2VkLmFkZChzaG93TWVzc2FnZXMpO1xuICBDaGF0TWFuYWdlci5tb2RlbC5oaXN0b3J5Q2hhbmdlZC5hZGQoc2hvd01lc3NhZ2VzKTtcbiAgc2hvd01lc3NhZ2VzKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoYXRtYXAuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRNYXBDdHJsJyxcblsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLFxuKCRzY29wZSwgJHRpbWVvdXQsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBMb2NhdGlvbk1vZGVsKSA9PiB7XG5cbiAgJHNjb3BlLnNlYXRzID0gW107XG5cbiAgJHNjb3BlLm1hcEltYWdlID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzLmxvY2F0aW9uX21hcDtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5tYXBJbWFnZSA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cy5sb2NhdGlvbl9tYXApO1xuICB9KTtcblxuICBmdW5jdGlvbiBidWlsZE1hcCgpIHtcbiAgICBpZiAoIUxvY2F0aW9uTW9kZWwuc2VhdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnNlYXRzID0gTG9jYXRpb25Nb2RlbC5zZWF0c1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKHNlYXQpIHsgcmV0dXJuIHNlYXQudG9rZW4gIT09IExvY2F0aW9uTW9kZWwuc2VhdC50b2tlbjsgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbihzZWF0KSB7XG4gICAgICAgICAgdmFyIGRldmljZXMgPSBMb2NhdGlvbk1vZGVsLmRldmljZXNcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24oZGV2aWNlKSB7IHJldHVybiBkZXZpY2Uuc2VhdCA9PT0gc2VhdC50b2tlbjsgfSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oZGV2aWNlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9rZW46IGRldmljZS50b2tlbixcbiAgICAgICAgICAgICAgICBzZWF0OiBkZXZpY2Uuc2VhdCxcbiAgICAgICAgICAgICAgICBpc19hdmFpbGFibGU6IGRldmljZS5pc19hdmFpbGFibGUsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IGRldmljZS51c2VybmFtZVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG9rZW46IHNlYXQudG9rZW4sXG4gICAgICAgICAgICBuYW1lOiBzZWF0Lm5hbWUsXG4gICAgICAgICAgICBkZXZpY2VzOiBkZXZpY2VzLFxuICAgICAgICAgICAgbWFwX3Bvc2l0aW9uX3g6IHNlYXQubWFwX3Bvc2l0aW9uX3gsXG4gICAgICAgICAgICBtYXBfcG9zaXRpb25feTogc2VhdC5tYXBfcG9zaXRpb25feSxcbiAgICAgICAgICAgIGlzX2F2YWlsYWJsZTogZGV2aWNlc1xuICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKGRldmljZSkgeyByZXR1cm4gZGV2aWNlLmlzX2F2YWlsYWJsZTsgfSlcbiAgICAgICAgICAgICAgLmxlbmd0aCA+IDBcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIExvY2F0aW9uTW9kZWwuZGV2aWNlc0NoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0c0NoYW5nZWQuYWRkKGJ1aWxkTWFwKTtcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoYnVpbGRNYXApO1xuICBidWlsZE1hcCgpO1xuXG4gICRzY29wZS5jaG9vc2VTZWF0ID0gZnVuY3Rpb24oc2VhdCkge1xuICAgIHZhciBkZXZpY2UgPSBzZWF0LmRldmljZXNbMF07XG5cbiAgICBpZiAoIXNlYXQuaXNfYXZhaWxhYmxlIHx8ICFkZXZpY2UpIHtcbiAgICAgIHZhciBkZXZpY2VOYW1lID0gZGV2aWNlICYmIGRldmljZS51c2VybmFtZSA/IGRldmljZS51c2VybmFtZSA6IHNlYXQubmFtZTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoZGV2aWNlTmFtZSArICcgaXMgdW5hdmFpbGFibGUgZm9yIGNoYXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDaGF0TWFuYWdlci5hcHByb3ZlRGV2aWNlKGRldmljZS50b2tlbik7XG4gICAgJHNjb3BlLmV4aXRNYXAoKTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hhdHJvb20uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoYXRSb29tQ3RybCcsXG5bJyRzY29wZScsICckdGltZW91dCcsICdDaGF0TWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnU05BUENvbmZpZycsXG4oJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIFNOQVBDb25maWcpID0+IHtcbiAgXG4gIGlmICghU05BUENvbmZpZy5jaGF0KSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQQ29uZmlnLmxvY2F0aW9uX25hbWU7XG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICckdGltZW91dCcsICdDdXN0b21lck1hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU2Vzc2lvbk1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU3VydmV5TWFuYWdlcicsXG4gICgkc2NvcGUsICRyb290U2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFN1cnZleU1hbmFnZXIpID0+IHtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgQ29uc3RhbnRzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBDaGVjayBzcGxpdCB0eXBlXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORSA9IDA7XG4gICRzY29wZS5DSEVDS19TUExJVF9CWV9JVEVNUyA9IDE7XG4gICRzY29wZS5DSEVDS19TUExJVF9FVkVOTFkgPSAyO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUGF5bWVudCBtZXRob2RcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5QQVlNRU5UX01FVEhPRF9DQVJEID0gMTtcbiAgJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBU0ggPSAyO1xuICAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfUEFZUEFMID0gMztcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlY2VpcHQgbWV0aG9kXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfTk9ORSA9IDA7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTCA9IDE7XG4gICRzY29wZS5SRUNFSVBUX01FVEhPRF9TTVMgPSAyO1xuICAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfUFJJTlQgPSAzO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ2hlY2tvdXQgc3RlcFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQgPSAwO1xuICAkc2NvcGUuU1RFUF9QQVlNRU5UX01FVEhPRCA9IDE7XG4gICRzY29wZS5TVEVQX1RJUFBJTkcgPSAyO1xuICAkc2NvcGUuU1RFUF9TSUdOQVRVUkUgPSAzO1xuICAkc2NvcGUuU1RFUF9SRUNFSVBUID0gNDtcbiAgJHNjb3BlLlNURVBfQ09NUExFVEUgPSA1O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcbiAgJHNjb3BlLmRhdGEgPSBbe1xuICAgIGl0ZW1zOiBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja1xuICB9XTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIENoZWNrXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvL0NoZWNrcyBkYXRhXG4gIHZhciBkYXRhID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ2RhdGEnKTtcbiAgZGF0YVxuICAuY2hhbmdlcygpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUudmFsdWUpIHtcbiAgICAgIHZhciBkYXRhID0gdmFsdWUudmFsdWUoKTtcbiAgICAgICRzY29wZS5vcHRpb25zLmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgfVxuXG4gICAgJHNjb3BlLm9wdGlvbnMuaW5kZXggPSAwO1xuICB9KTtcblxuICAvL01heGltdW0gbnVtYmVyIG9mIGd1ZXN0c1xuICAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudF9tYXggPSBNYXRoLm1heChcbiAgICBTZXNzaW9uTWFuYWdlci5ndWVzdENvdW50LFxuICAgIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrLnJlZHVjZSgoaSwgaXRlbSkgPT4gaSArIGl0ZW0ucXVhbnRpdHksIDApXG4gICk7XG5cbiAgLy9OdW1iZXIgb2YgZ3Vlc3RzXG4gICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50ID0gU2Vzc2lvbk1hbmFnZXIuZ3Vlc3RDb3VudDtcblxuICAvL0NoZWNrIHNwbGl0IG1vZGVcbiAgJHNjb3BlLm9wdGlvbnMuY2hlY2tfc3BsaXQgPSAkc2NvcGUuQ0hFQ0tfU1BMSVRfTk9ORTtcblxuICAvL0NoZWNrIGluZGV4XG4gICRzY29wZS5vcHRpb25zLmluZGV4ID0gMDtcbiAgdmFyIGluZGV4ID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuaW5kZXgnKTtcbiAgQmFjb24uY29tYmluZUFzQXJyYXkoaW5kZXgsIGRhdGEpXG4gIC5zdWJzY3JpYmUoZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQgPSAkc2NvcGUuZGF0YVskc2NvcGUub3B0aW9ucy5pbmRleF07XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzR3Vlc3QpIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgPSAkc2NvcGUuY3VycmVudC5yZWNlaXB0X3Bob25lIHx8IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLnBob25lO1xuICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5oYXNDcmVkZW50aWFscyA/XG4gICAgICAgIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlLmVtYWlsIDpcbiAgICAgICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9lbWFpbDtcbiAgICB9XG5cbiAgICBpZiAoJHNjb3BlLmN1cnJlbnQuaXRlbXMpIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnN1YnRvdGFsID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRvdGFsUHJpY2UoJHNjb3BlLmN1cnJlbnQuaXRlbXMpO1xuICAgICAgJHNjb3BlLmN1cnJlbnQudGF4ID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRheCgkc2NvcGUuY3VycmVudC5pdGVtcyk7XG4gICAgfVxuXG4gICAgaWYgKCEkc2NvcGUuY3VycmVudC50aXApIHtcbiAgICAgICRzY29wZS5jdXJyZW50LnRpcCA9IDA7XG4gICAgfVxuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIE5hdmlnYXRpb25cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vQ3VycmVudCBzdGVwXG4gICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudF9tYXggPiAxID9cbiAgICAkc2NvcGUuU1RFUF9DSEVDS19TUExJVCA6XG4gICAgJHNjb3BlLlNURVBfVElQUElORztcbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgICAuc2tpcER1cGxpY2F0ZXMoKVxuICAgIC5zdWJzY3JpYmUoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdmFsdWUudmFsdWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RlcCA9IHZhbHVlLnZhbHVlKCk7XG5cbiAgICAgIGlmIChzdGVwID09PSAkc2NvcGUuU1RFUF9DT01QTEVURSkge1xuICAgICAgICBzdGFydE5leHRDaGVjaygpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgTWlzY1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9TZWF0IG5hbWVcbiAgJHNjb3BlLm9wdGlvbnMuc2VhdCA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQoc2VhdCA9PiB7XG4gICAgJHNjb3BlLm9wdGlvbnMuc2VhdCA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnO1xuICB9KTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHJpdmF0ZSBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy9Qcm9jZWVkIHdpdGggdGhlIG5leHQgY2hlY2tcbiAgZnVuY3Rpb24gc3RhcnROZXh0Q2hlY2soKSB7XG4gICAgdmFyIGNoZWNrID0gJHNjb3BlLmN1cnJlbnQ7XG5cbiAgICBpZiAoJHNjb3BlLm9wdGlvbnMuaW5kZXggPT09ICRzY29wZS5vcHRpb25zLmNvdW50IC0gMSkge1xuICAgICAgT3JkZXJNYW5hZ2VyLmNsZWFyQ2hlY2soKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0ge1xuICAgICAgICB0eXBlOiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCA/ICdzdXJ2ZXknIDogJ2hvbWUnXG4gICAgICB9O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuaW5kZXgrKztcbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH0pO1xuICB9XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmdldFBhcnRpYWxVcmwgPSBuYW1lID0+IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKG5hbWUpO1xuXG4gIC8vQ2FsY3VsYXRlIGEgY2FydCBpdGVtIHRpdGxlXG4gICRzY29wZS5jYWxjdWxhdGVUaXRsZSA9IGVudHJ5ID0+IGVudHJ5Lm5hbWUgfHwgZW50cnkuaXRlbS50aXRsZTtcblxuICAvL0NhbGN1bGF0ZSBhIGNhcnQgaXRlbSBwcmljZVxuICAkc2NvcGUuY2FsY3VsYXRlUHJpY2UgPSBlbnRyeSA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlUHJpY2UoZW50cnkpO1xuXG4gIC8vQ2FsY3VsYXRlIGNhcnQgaXRlbXMgcHJpY2VcbiAgJHNjb3BlLmNhbGN1bGF0ZVRvdGFsUHJpY2UgPSBlbnRyaWVzID0+IE9yZGVyTWFuYWdlci5jYWxjdWxhdGVUb3RhbFByaWNlKGVudHJpZXMpO1xuXG4gIC8vT3V0cHV0IGEgZm9ybWF0dGVkIHByaWNlIHN0cmluZ1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUgfHwgMCk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFN0YXJ0dXBcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBpZiAoIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3NpZ25pbicgfTtcbiAgICByZXR1cm47XG4gIH1cblxuICAkc2NvcGUuaW5pdGlhbGl6ZWQgPSB0cnVlO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dG1ldGhvZC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRNZXRob2RDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQ3VzdG9tZXJNb2RlbCcsICdDYXJkUmVhZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvZ2dlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBDdXN0b21lck1vZGVsLCBDYXJkUmVhZGVyLCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvZ2dlcikgPT4ge1xuXG4gIENhcmRSZWFkZXIub25SZWNlaXZlZC5hZGQoZGF0YSA9PiB7XG4gICAgTG9nZ2VyLmRlYnVnKGBDYXJkIHJlYWRlciByZXN1bHQ6ICR7SlNPTi5zdHJpbmdpZnkoZGF0YSl9YCk7XG4gICAgdmFyIGNhcmQgPSB7XG4gICAgICBudW1iZXI6IGRhdGEuY2FyZF9udW1iZXIsXG4gICAgICBtb250aDogZGF0YS5leHBpcmF0aW9uX21vbnRoLFxuICAgICAgeWVhcjogZGF0YS5leHBpcmF0aW9uX3llYXIsXG4gICAgICBkYXRhOiBkYXRhLmRhdGFcbiAgICB9O1xuXG4gICAgQ2FyZFJlYWRlci5zdG9wKCk7XG4gICAgY2FyZERhdGFSZWNlaXZlZChjYXJkKTtcbiAgfSk7XG5cbiAgQ2FyZFJlYWRlci5vbkVycm9yLmFkZChlID0+IHtcbiAgICBMb2dnZXIuZGVidWcoYENhcmQgcmVhZGVyIGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfQ0FSRFJFQURFUl9FUlJPUik7XG4gIH0pO1xuXG4gICRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKCkgPT4ge1xuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICB9KTtcblxuICAvL0dlbmVyYXRlIGEgcGF5bWVudCB0b2tlblxuICBmdW5jdGlvbiBnZW5lcmF0ZVBheW1lbnRUb2tlbigpIHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgT3JkZXJNYW5hZ2VyLmdlbmVyYXRlUGF5bWVudFRva2VuKCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBQYXltZW50IHRva2VuIGdlbmVyYXRpb24gZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cblxuICAvL0NhbGxlZCB3aGVuIGEgY2FyZCBkYXRhIGlzIHJlY2VpdmVkXG4gIGZ1bmN0aW9uIGNhcmREYXRhUmVjZWl2ZWQoY2FyZCkge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIE9yZGVyTWFuYWdlci5jbGVhckNoZWNrKCRzY29wZS5jdXJyZW50Lml0ZW1zKTtcbiAgICAgICRzY29wZS5jdXJyZW50LmNhcmRfZGF0YSA9IGNhcmQuZGF0YTtcbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9TSUdOQVRVUkU7XG4gICAgfSk7XG4gIH1cblxuICAvL0Nob29zZSB0byBwYXkgd2l0aCBhIGNyZWRpdCBjYXJkXG4gICRzY29wZS5wYXlDYXJkID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gJHNjb3BlLlBBWU1FTlRfTUVUSE9EX0NBUkQ7XG4gICAgQ2FyZFJlYWRlci5zdGFydCgpO1xuICB9O1xuXG4gICRzY29wZS5wYXlDYXJkQ2FuY2VsID0gKCkgPT4ge1xuICAgICRzY29wZS5jdXJyZW50LnBheW1lbnRfbWV0aG9kID0gdW5kZWZpbmVkO1xuICAgIENhcmRSZWFkZXIuc3RvcCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHBheSB3aXRoIGNhc2hcbiAgJHNjb3BlLnBheUNhc2ggPSAoKSA9PiB7XG4gICAgJHNjb3BlLmN1cnJlbnQucGF5bWVudF9tZXRob2QgPSAkc2NvcGUuUEFZTUVOVF9NRVRIT0RfQ0FTSDtcblxuICAgIGlmIChPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ICE9IG51bGwpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX0NPTVBMRVRFO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQ0xPU0VPVVRfU0VOVCk7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9DT01QTEVURTtcbiAgICAgIH0pO1xuICAgIH0sIGUgPT4ge1xuICAgICAgTG9nZ2VyLmRlYnVnKGBSZXF1ZXN0IGNsb3Nlb3V0IGVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIGdlbmVyYXRlUGF5bWVudFRva2VuKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0cmVjZWlwdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRSZWNlaXB0Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIpID0+IHtcblxuICAvL0Nob29zZSB0byBoYXZlIG5vIHJlY2VpcHRcbiAgJHNjb3BlLnJlY2VpcHROb25lID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfTk9ORTtcbiAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHJlY2VpcHQgYnkgZS1tYWlsXG4gICRzY29wZS5yZWNlaXB0RW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5jdXJyZW50LnJlY2VpcHRfZW1haWwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkc2NvcGUuY3VycmVudC5yZWNlaXB0X21ldGhvZCA9ICRzY29wZS5SRUNFSVBUX01FVEhPRF9FTUFJTDtcbiAgICByZXF1ZXN0UmVjZWlwdCgpO1xuICB9O1xuXG4gIC8vQ2hvb3NlIHRvIHJlY2VpdmUgYSByZWNlaXB0IGJ5IHNtc1xuICAkc2NvcGUucmVjZWlwdFNtcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9waG9uZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgICRzY29wZS5jdXJyZW50LnJlY2VpcHRfcGhvbmUgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfU01TO1xuICAgIHJlcXVlc3RSZWNlaXB0KCk7XG4gIH07XG5cbiAgLy9DaG9vc2UgdG8gcmVjZWl2ZSBhIHByaW50ZWQgcmVjZWlwdFxuICAkc2NvcGUucmVjZWlwdFByaW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLmN1cnJlbnQucmVjZWlwdF9tZXRob2QgPSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfUFJJTlQ7XG4gICAgcmVxdWVzdFJlY2VpcHQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiByZXF1ZXN0UmVjZWlwdCgpIHtcbiAgICB2YXIgaXRlbSA9ICRzY29wZS5jdXJyZW50O1xuXG4gICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICBjaGVja291dF90b2tlbjogaXRlbS5jaGVja291dF90b2tlbixcbiAgICAgIHJlY2VpcHRfbWV0aG9kOiBpdGVtLnJlY2VpcHRfbWV0aG9kXG4gICAgfTtcblxuICAgIGlmIChpdGVtLnJlY2VpcHRfbWV0aG9kID09PSAkc2NvcGUuUkVDRUlQVF9NRVRIT0RfRU1BSUwpIHtcbiAgICAgIHJlcXVlc3QucmVjZWlwdF9lbWFpbCA9IGl0ZW0ucmVjZWlwdF9lbWFpbDtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5yZWNlaXB0X21ldGhvZCA9PT0gJHNjb3BlLlJFQ0VJUFRfTUVUSE9EX1NNUykge1xuICAgICAgcmVxdWVzdC5yZWNlaXB0X3Bob25lID0gaXRlbS5yZWNlaXB0X3Bob25lO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBPcmRlck1hbmFnZXIucmVxdWVzdFJlY2VpcHQocmVxdWVzdCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfQ09NUExFVEU7XG4gICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH1cbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY2hlY2tvdXRzaWduYXR1cmUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0U2lnbmF0dXJlQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCAnT3JkZXJNYW5hZ2VyJywgJ0xvZ2dlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvZ2dlcikgPT4ge1xuXG4gIC8vQ2xlYXIgdGhlIGN1cnJlbnQgc2lnbmF0dXJlXG4gIHZhciByZXNldFNpZ25hdHVyZSA9ICgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuY3VycmVudC5zaWduYXR1cmVfdG9rZW4gPSB1bmRlZmluZWQ7XG5cbiAgICAgIHZhciBzaWduYXR1cmUgPSAkKCcjY2hlY2tvdXQtc2lnbmF0dXJlLWlucHV0Jyk7XG4gICAgICBzaWduYXR1cmUuZW1wdHkoKTtcbiAgICAgIHNpZ25hdHVyZS5qU2lnbmF0dXJlKCdpbml0Jywge1xuICAgICAgICAnY29sb3InIDogJyMwMDAnLFxuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmZmJyxcbiAgICAgICAgJ2RlY29yLWNvbG9yJzogJyNmZmYnLFxuICAgICAgICAnd2lkdGgnOiAnMTAwJScsXG4gICAgICAgICdoZWlnaHQnOiAnMjAwcHgnXG4gICAgICB9KTtcbiAgICB9LCAzMDApO1xuICB9O1xuXG4gIC8vU3VibWl0IHRoZSBjdXJyZW50IHNpZ25hdHVyZSBpbnB1dFxuICAkc2NvcGUuc2lnbmF0dXJlU3VibWl0ID0gKCkgPT4ge1xuICAgIHZhciBzaWduYXR1cmUgPSAkKCcjY2hlY2tvdXQtc2lnbmF0dXJlLWlucHV0Jyk7XG5cbiAgICBpZiAoc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2dldERhdGEnLCAnbmF0aXZlJykubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICB2YXIgc2lnID0gc2lnbmF0dXJlLmpTaWduYXR1cmUoJ2dldERhdGEnLCAnaW1hZ2UnKTtcblxuICAgIE9yZGVyTWFuYWdlci51cGxvYWRTaWduYXR1cmUoc2lnWzFdKS50aGVuKHRva2VuID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuY3VycmVudC5zaWduYXR1cmVfdG9rZW4gPSB0b2tlbjtcbiAgICAgICAgY29tcGxldGVDaGVja291dCgpO1xuICAgICAgfSk7XG4gICAgfSwgZSA9PiB7XG4gICAgICBMb2dnZXIuZGVidWcoYFNpZ25hdHVyZSB1cGxvYWQgZXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy9DYW5jZWwgdGhlIGN1cnJlbnQgc2lnbmF0dXJlIGlucHV0XG4gICRzY29wZS5zaWduYXR1cmVDYW5jZWwgPSAoKSA9PiB7XG4gICAgcmVzZXRTaWduYXR1cmUoKTtcbiAgfTtcblxuICAvL0NvbXBsZXRlIHRoZSBjaGVja291dFxuICBmdW5jdGlvbiBjb21wbGV0ZUNoZWNrb3V0KCkge1xuICAgIHZhciBpdGVtID0gJHNjb3BlLmN1cnJlbnQ7XG4gICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgYW1vdW50X3N1YnRvdGFsOiBpdGVtLnN1YnRvdGFsLFxuICAgICAgYW1vdW50X3RheDogaXRlbS50YXgsXG4gICAgICBhbW91bnRfdGlwOiBpdGVtLnRpcCxcbiAgICAgIGNhcmRfZGF0YTogaXRlbS5jYXJkX2RhdGEsXG4gICAgICBzaWduYXR1cmVfdG9rZW46IGl0ZW0uc2lnbmF0dXJlX3Rva2VuLFxuICAgICAgb3JkZXJfdG9rZW5zOiBpdGVtLml0ZW1zICE9IG51bGwgP1xuICAgICAgICBpdGVtLml0ZW1zLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGl0ZW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbS5xdWFudGl0eTsgaSsrKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGl0ZW0ucmVxdWVzdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgfSwgW10pXG4gICAgICAgIDogbnVsbFxuICAgIH07XG5cbiAgICBPcmRlck1hbmFnZXIucGF5T3JkZXIocmVxdWVzdCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcblxuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuY3VycmVudC5jaGVja291dF90b2tlbiA9IHJlc3VsdC50b2tlbjtcbiAgICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1JFQ0VJUFQ7XG4gICAgICB9KTtcbiAgICB9LCBlID0+IHtcbiAgICAgIExvZ2dlci5kZWJ1ZyhgT3JkZXIgcGF5bWVudCBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBzdGVwID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ29wdGlvbnMuc3RlcCcpO1xuICBzdGVwXG4gIC5za2lwRHVwbGljYXRlcygpXG4gIC5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgIGlmICghdmFsdWUudmFsdWUgfHwgdmFsdWUudmFsdWUoKSAhPT0gJHNjb3BlLlNURVBfU0lHTkFUVVJFKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzZXRTaWduYXR1cmUoKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NoZWNrb3V0c3BsaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0NoZWNrb3V0U3BsaXRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnT3JkZXJNYW5hZ2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIE9yZGVyTWFuYWdlcikgPT4ge1xuXG4gIC8vU3BsaXQgdGhlIGN1cnJlbnQgb3JkZXIgaW4gdGhlIHNlbGVjdGVkIHdheVxuICAkc2NvcGUuc3BsaXRDaGVjayA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgaSwgZGF0YSA9IFtdO1xuXG4gICAgaWYgKHR5cGUgPT09ICRzY29wZS5DSEVDS19TUExJVF9OT05FKSB7XG4gICAgICBkYXRhLnB1c2goe1xuICAgICAgICBpdGVtczogT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUub3B0aW9ucy5zdGVwID0gJHNjb3BlLlNURVBfVElQUElORztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gJHNjb3BlLkNIRUNLX1NQTElUX0VWRU5MWSkge1xuICAgICAgdmFyIGNoZWNrID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2ssXG4gICAgICAgICAgc3VidG90YWwgPSBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShjaGVjayksXG4gICAgICAgICAgdGF4ID0gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVRheChjaGVjayk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudDsgaSsrKSB7XG4gICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgc3VidG90YWw6IE1hdGgucm91bmQoKHN1YnRvdGFsIC8gJHNjb3BlLm9wdGlvbnMuZ3Vlc3RfY291bnQpICogMTAwKSAvIDEwMCxcbiAgICAgICAgICB0YXg6IE1hdGgucm91bmQoKHRheCAvICRzY29wZS5vcHRpb25zLmd1ZXN0X2NvdW50KSAqIDEwMCkgLyAxMDBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9USVBQSU5HO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAkc2NvcGUuQ0hFQ0tfU1BMSVRfQllfSVRFTVMpIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkc2NvcGUub3B0aW9ucy5ndWVzdF9jb3VudDsgaSsrKSB7XG4gICAgICAgIGRhdGEucHVzaCh7XG4gICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc3BsaXRfaXRlbXMgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjay5zbGljZSgwKS5tYXAoaXRlbSA9PiBpdGVtLmNsb25lKCkpO1xuICAgIH1cblxuICAgICRzY29wZS4kcGFyZW50LmRhdGEgPSBkYXRhO1xuICAgICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gdHlwZTtcbiAgfTtcblxuICAvL01vdmUgYW4gaXRlbSB0byB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUuYWRkVG9DaGVjayA9IGZ1bmN0aW9uKGVudHJ5KSB7XG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gJHNjb3BlLnNwbGl0X2l0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ICE9PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5xdWFudGl0eSA+IDEpIHtcbiAgICAgICAgaXRlbS5xdWFudGl0eS0tO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbSAhPSBudWxsOyB9KTtcblxuICAgIHZhciBleGlzdHMgPSBmYWxzZTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gJHNjb3BlLmN1cnJlbnQuaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgPT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgZXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5xdWFudGl0eSsrO1xuICAgICAgICByZXR1cm4gaXRlbS5jbG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KTtcblxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB2YXIgY2xvbmUgPSBlbnRyeS5jbG9uZSgpO1xuICAgICAgY2xvbmUucXVhbnRpdHkgPSAxO1xuXG4gICAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5wdXNoKGNsb25lKTtcbiAgICB9XG4gIH07XG5cbiAgLy9SZW1vdmUgYW4gaXRlbSBmcm9tIHRoZSBjdXJyZW50IGNoZWNrXG4gICRzY29wZS5yZW1vdmVGcm9tQ2hlY2sgPSBmdW5jdGlvbihlbnRyeSkge1xuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gJHNjb3BlLmN1cnJlbnQuaXRlbXNcbiAgICAubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLnJlcXVlc3QgIT09IGVudHJ5LnJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtLnF1YW50aXR5ID4gMSkge1xuICAgICAgICBpdGVtLnF1YW50aXR5LS07XG4gICAgICAgIHJldHVybiBpdGVtLmNsb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pXG4gICAgLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtICE9IG51bGw7IH0pO1xuXG4gICAgdmFyIGV4aXN0cyA9IGZhbHNlO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gJHNjb3BlLnNwbGl0X2l0ZW1zXG4gICAgLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBpZiAoaXRlbS5yZXF1ZXN0ID09PSBlbnRyeS5yZXF1ZXN0KSB7XG4gICAgICAgIGV4aXN0cyA9IHRydWU7XG4gICAgICAgIGl0ZW0ucXVhbnRpdHkrKztcbiAgICAgICAgcmV0dXJuIGl0ZW0uY2xvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG5cbiAgICBpZiAoIWV4aXN0cykge1xuICAgICAgdmFyIGNsb25lID0gZW50cnkuY2xvbmUoKTtcbiAgICAgIGNsb25lLnF1YW50aXR5ID0gMTtcblxuICAgICAgJHNjb3BlLnNwbGl0X2l0ZW1zLnB1c2goY2xvbmUpO1xuICAgIH1cbiAgfTtcblxuICAvL01vdmUgYWxsIGF2YWlsYWJsZSBpdGVtcyB0byB0aGUgY3VycmVudCBjaGVja1xuICAkc2NvcGUuYWRkQWxsVG9DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKCRzY29wZS5hZGRUb0NoZWNrKTtcblxuICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goZnVuY3Rpb24obmV3aXRlbSkge1xuICAgICAgICBpZiAobmV3aXRlbS5yZXF1ZXN0ID09PSBpdGVtLnJlcXVlc3QpIHtcbiAgICAgICAgICBuZXdpdGVtLnF1YW50aXR5ICs9IGl0ZW0ucXVhbnRpdHk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnNwbGl0X2l0ZW1zID0gW107XG4gIH07XG5cbiAgLy9SZW1vdmUgYWxsIGl0ZW1zIGZyb20gdGhlIGN1cnJlbnQgY2hlY2tcbiAgJHNjb3BlLnJlbW92ZUFsbEZyb21DaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zLmZvckVhY2goJHNjb3BlLnJlbW92ZUZyb21DaGVjayk7XG5cbiAgICAkc2NvcGUuY3VycmVudC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICRzY29wZS5zcGxpdF9pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKG5ld2l0ZW0pIHtcbiAgICAgICAgaWYgKG5ld2l0ZW0ucmVxdWVzdCA9PT0gaXRlbS5yZXF1ZXN0KSB7XG4gICAgICAgICAgbmV3aXRlbS5xdWFudGl0eSArPSBpdGVtLnF1YW50aXR5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgICRzY29wZS5jdXJyZW50Lml0ZW1zID0gW107XG4gIH07XG5cbiAgLy9Qcm9jZWVkIHdpdGggdGhlIG5leHQgY2hlY2sgc3BsaXR0aW5nXG4gICRzY29wZS5zcGxpdE5leHRDaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUub3B0aW9ucy5pbmRleCA8ICRzY29wZS5vcHRpb25zLmNvdW50IC0gMSAmJiAkc2NvcGUuc3BsaXRfaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgJHNjb3BlLm9wdGlvbnMuaW5kZXgrKztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoJHNjb3BlLnNwbGl0X2l0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICRzY29wZS5hZGRBbGxUb0NoZWNrKCk7XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuJHBhcmVudC5kYXRhID0gJHNjb3BlLiRwYXJlbnQuZGF0YS5maWx0ZXIoZnVuY3Rpb24oY2hlY2spIHtcbiAgICAgICAgcmV0dXJuIGNoZWNrLml0ZW1zLmxlbmd0aCA+IDA7XG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLm9wdGlvbnMuc3RlcCA9ICRzY29wZS5TVEVQX1RJUFBJTkc7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHN0ZXAgPSAkc2NvcGUuJHdhdGNoQXNQcm9wZXJ0eSgnb3B0aW9ucy5zdGVwJyk7XG4gIHN0ZXBcbiAgLnNraXBEdXBsaWNhdGVzKClcbiAgLnN1YnNjcmliZShmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghdmFsdWUudmFsdWUgfHwgdmFsdWUudmFsdWUoKSAhPT0gJHNjb3BlLlNURVBfQ0hFQ0tfU1BMSVQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5vcHRpb25zLmNoZWNrX3NwbGl0ID0gJHNjb3BlLkNIRUNLX1NQTElUX05PTkU7XG4gICAgfSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jaGVja291dHRpcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignQ2hlY2tvdXRUaXBDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnT3JkZXJNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgT3JkZXJNYW5hZ2VyKSB7XG5cbiAgLy9BZGQgYSB0aXBcbiAgJHNjb3BlLmFkZFRpcCA9IGZ1bmN0aW9uKGFtb3VudCkge1xuICAgICRzY29wZS5jdXJyZW50LnRpcCA9IE1hdGgucm91bmQoKCRzY29wZS5jdXJyZW50LnN1YnRvdGFsICogYW1vdW50KSAqIDEwMCkgLyAxMDA7XG4gIH07XG5cbiAgLy9BcHBseSB0aGUgc2VsZWN0ZWQgdGlwIGFtb3VudCBhbmQgcHJvY2VlZCBmdXJ0aGVyXG4gICRzY29wZS5hcHBseVRpcCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5vcHRpb25zLnN0ZXAgPSAkc2NvcGUuU1RFUF9QQVlNRU5UX01FVEhPRDtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvY29tbWFuZHMvZmxpcHNjcmVlbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZEZsaXBTY3JlZW4nLCBbJ01hbmFnZW1lbnRTZXJ2aWNlJywgZnVuY3Rpb24oTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnJvdGF0ZVNjcmVlbigpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9yZXNldC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uZmFjdG9yeSgnQ29tbWFuZFJlc2V0JywgWydBbmFseXRpY3NNYW5hZ2VyJywgJ0NoYXRNYW5hZ2VyJywgJ0N1c3RvbWVyTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU2Vzc2lvbk1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsICdNYW5hZ2VtZW50U2VydmljZScsICdMb2dnZXInLCBmdW5jdGlvbihBbmFseXRpY3NNYW5hZ2VyLCBDaGF0TWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTdXJ2ZXlNYW5hZ2VyLCBNYW5hZ2VtZW50U2VydmljZSwgTG9nZ2VyKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcbiAgICAgIExvZ2dlci53YXJuKCdVbmFibGUgdG8gcmVzZXQgcHJvcGVybHk6ICcgKyBlLm1lc3NhZ2UpO1xuICAgICAgTWFuYWdlbWVudFNlcnZpY2UucmVzZXQoKTtcbiAgICB9XG5cbiAgICBTZXNzaW9uTWFuYWdlci5lbmRTZXNzaW9uKCk7XG5cbiAgICBBbmFseXRpY3NNYW5hZ2VyLnN1Ym1pdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICBPcmRlck1hbmFnZXIucmVzZXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTdXJ2ZXlNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBDdXN0b21lck1hbmFnZXIubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIENoYXRNYW5hZ2VyLnJlc2V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgTWFuYWdlbWVudFNlcnZpY2UucmVzZXQoKTtcbiAgICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICAgIH0sIGZhaWwpO1xuICAgICAgICB9LCBmYWlsKTtcbiAgICAgIH0sIGZhaWwpO1xuICAgIH0sIGZhaWwpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9jb21tYW5kcy9zdGFydHVwLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kU3RhcnR1cCcsIFsnTG9nZ2VyJywgJ0FwcENhY2hlJywgJ0NoYXRNYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdDdXN0b21lck1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnU3VydmV5TWFuYWdlcicsICdTTkFQQ29uZmlnJywgZnVuY3Rpb24oTG9nZ2VyLCBBcHBDYWNoZSwgQ2hhdE1hbmFnZXIsIFNoZWxsTWFuYWdlciwgQ3VzdG9tZXJNYW5hZ2VyLCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFN1cnZleU1hbmFnZXIsIFNOQVBDb25maWcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIGZhaWwoZSkge1xuICAgICAgTG9nZ2VyLndhcm4oYFVuYWJsZSB0byBzdGFydHVwIHByb3Blcmx5OiAke2UubWVzc2FnZX1gKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWNoZUNvbXBsZXRlKHVwZGF0ZWQpIHtcbiAgICAgIGlmICh1cGRhdGVkKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgRGF0YU1hbmFnZXIuaW5pdGlhbGl6ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChBcHBDYWNoZS5pc1VwZGF0ZWQpIHtcbiAgICAgIGNhY2hlQ29tcGxldGUodHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2UgaWYgKEFwcENhY2hlLmlzQ29tcGxldGUpIHtcbiAgICAgIGNhY2hlQ29tcGxldGUoZmFsc2UpO1xuICAgIH1cblxuICAgIEFwcENhY2hlLmNvbXBsZXRlLmFkZChjYWNoZUNvbXBsZXRlKTtcblxuICAgIFNoZWxsTWFuYWdlci5pbml0aWFsaXplKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCkge1xuICAgICAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnc2lnbmluJyB9O1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmd1ZXN0TG9naW4oKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2NvbW1hbmRzL3N1Ym1pdG9yZGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5mYWN0b3J5KCdDb21tYW5kU3VibWl0T3JkZXInLFxuICBbJ0RpYWxvZ01hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdPcmRlck1hbmFnZXInLFxuICAoRGlhbG9nTWFuYWdlciwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBpZiAoIUxvY2F0aW9uTW9kZWwuc2VhdCB8fCAhTG9jYXRpb25Nb2RlbC5zZWF0LnRva2VuKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0VSUk9SX05PX1NFQVQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCAwO1xuXG4gICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQob3B0aW9ucykudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZGlhbG9nLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdEaWFsb2dDdHJsJywgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQWN0aXZpdHlNb25pdG9yJywgJ0RpYWxvZ01hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIERpYWxvZ01hbmFnZXIpIHtcbiAgdmFyIGFsZXJ0U3RhY2sgPSBbXSxcbiAgICAgIGNvbmZpcm1TdGFjayA9IFtdO1xuICB2YXIgYWxlcnRJbmRleCA9IC0xLFxuICAgICAgY29uZmlybUluZGV4ID0gLTE7XG4gIHZhciBhbGVydFRpbWVyO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpc2liaWxpdHkoaXNCdXN5LCBzaG93QWxlcnQsIHNob3dDb25maXJtKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaXNCdXN5ID0gaXNCdXN5ICE9PSB1bmRlZmluZWQgPyBpc0J1c3kgOiAkc2NvcGUuaXNCdXN5O1xuICAgICAgJHNjb3BlLnNob3dBbGVydCA9IHNob3dBbGVydCAhPT0gdW5kZWZpbmVkID8gc2hvd0FsZXJ0IDogJHNjb3BlLnNob3dBbGVydDtcbiAgICAgICRzY29wZS5zaG93Q29uZmlybSA9IHNob3dDb25maXJtICE9PSB1bmRlZmluZWQgPyBzaG93Q29uZmlybSA6ICRzY29wZS5zaG93Q29uZmlybTtcbiAgICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmlzQnVzeSB8fCAkc2NvcGUuc2hvd0FsZXJ0IHx8ICRzY29wZS5zaG93Q29uZmlybTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dOZXh0QWxlcnQoKSB7XG4gICAgaWYgKGFsZXJ0VGltZXIpIHtcbiAgICAgICR0aW1lb3V0LmNhbmNlbChhbGVydFRpbWVyKTtcbiAgICB9XG5cbiAgICBhbGVydEluZGV4Kys7XG5cbiAgICBpZiAoYWxlcnRJbmRleCA9PT0gYWxlcnRTdGFjay5sZW5ndGgpIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICBhbGVydFN0YWNrID0gW107XG4gICAgICBhbGVydEluZGV4ID0gLTE7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuYWxlcnRUaXRsZSA9IGFsZXJ0U3RhY2tbYWxlcnRJbmRleF0udGl0bGU7XG4gICAgICAkc2NvcGUuYWxlcnRUZXh0ID0gYWxlcnRTdGFja1thbGVydEluZGV4XS5tZXNzYWdlO1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgYWxlcnRUaW1lciA9ICR0aW1lb3V0KHNob3dOZXh0QWxlcnQsIDEwMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dOZXh0Q29uZmlybSgpIHtcbiAgICBjb25maXJtSW5kZXgrKztcblxuICAgIGlmIChjb25maXJtSW5kZXggPT09IGNvbmZpcm1TdGFjay5sZW5ndGgpIHtcbiAgICAgIHVwZGF0ZVZpc2liaWxpdHkodW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKTtcbiAgICAgIGNvbmZpcm1TdGFjayA9IFtdO1xuICAgICAgY29uZmlybUluZGV4ID0gLTE7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuY29uZmlybVRleHQgPSBjb25maXJtU3RhY2tbY29uZmlybUluZGV4XS5tZXNzYWdlO1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3dpdGNoIChtZXNzYWdlKSB7XG4gICAgICAgICAgY2FzZSBBTEVSVF9HRU5FUklDX0VSUk9SOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiT29wcyEgTXkgYml0cyBhcmUgZmlkZGxlZC4gT3VyIHJlcXVlc3Qgc3lzdGVtIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC4gUGxlYXNlIG5vdGlmeSBhIHNlcnZlci5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1I6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJPb3BzISBNeSBiaXRzIGFyZSBmaWRkbGVkLiBPdXIgcmVxdWVzdCBzeXN0ZW0gaGFzIGJlZW4gZGlzY29ubmVjdGVkLiBQbGVhc2Ugbm90aWZ5IGEgc2VydmVyLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkNhbGwgU2VydmVyIHJlcXVlc3Qgd2FzIHNlbnQgc3VjY2Vzc2Z1bGx5LlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIHJlcXVlc3QgZm9yIHNlcnZlciBhc3Npc3RhbmNlIGhhcyBiZWVuIHNlZW4sIGFuZCBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiUmVxdWVzdCBjaGVjayByZXF1ZXN0IHdhcyBzZW50IHN1Y2Nlc3NmdWxseS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9SRUNFSVZFRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIllvdXIgY2hlY2sgcmVxdWVzdCBoYXMgYmVlbiBzZWVuLCBhbmQgYWNjZXB0ZWQuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfT1JERVJfU0VOVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk9yZGVyIHNlbnQhIFlvdSB3aWxsIGJlIG5vdGlmaWVkIHdoZW4geW91ciB3YWl0ZXIgYWNjZXB0cyB0aGUgb3JkZXIuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX1JFUVVFU1RfT1JERVJfUkVDRUlWRUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJZb3VyIG9yZGVyIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhY2NlcHRlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfU0lHTklOX1JFUVVJUkVEOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiWW91IG11c3QgYmUgbG9nZ2VkIGludG8gU05BUCB0byBhY2Nlc3MgdGhpcyBwYWdlLlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9BU1NJU1RBTkNFOlxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNhbGwgdGhlIHdhaXRlcj9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfVEFCTEVfQ0xPU0VPVVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVxdWVzdCB5b3VyIGNoZWNrP1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBBTEVSVF9UQUJMRV9SRVNFVDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZXNldD9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfREVMRVRfQ0FSRDpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byByZW1vdmUgdGhpcyBwYXltZW50IG1ldGhvZD9cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEU6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBIGxpbmsgdG8gY2hhbmdlIHlvdXIgcGFzc3dvcmQgaGFzIGJlZW4gZW1haWxlZC5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfU09GVFdBUkVfT1VUREFURUQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJBIHNvZnR3YXJlIHVwZGF0ZSBpcyBhdmFpbGFibGUuIFBsZWFzZSByZXN0YXJ0IHRoZSBhcHBsaWNhdGlvbi5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgQUxFUlRfQ0FSRFJFQURFUl9FUlJPUjpcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlVuYWJsZSB0byByZWFkIHRoZSBjYXJkIGRhdGEuIFBsZWFzZSB0cnkgYWdhaW4uXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEFMRVJUX0VSUk9SX05PX1NFQVQ6XG4gICAgICAgICAgICBtZXNzYWdlID0gXCJEZXZpY2UgaXMgbm90IGFzc2lnbmVkIHRvIGFueSB0YWJsZS5cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLmlzQnVzeSA9IGZhbHNlO1xuICAkc2NvcGUuc2hvd0FsZXJ0ID0gZmFsc2U7XG4gICRzY29wZS5zaG93Q29uZmlybSA9IGZhbHNlO1xuXG4gICRzY29wZS5jbG9zZUFsZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBzaG93TmV4dEFsZXJ0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmNsb3NlQ29uZmlybSA9IGZ1bmN0aW9uKGNvbmZpcm1lZCkge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICB2YXIgY29uZmlybSA9IGNvbmZpcm1TdGFja1tjb25maXJtSW5kZXhdO1xuXG4gICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgaWYgKGNvbmZpcm0ucmVzb2x2ZSkge1xuICAgICAgICBjb25maXJtLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoY29uZmlybS5yZWplY3QpIHtcbiAgICAgICAgY29uZmlybS5yZWplY3QoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93TmV4dENvbmZpcm0oKTtcbiAgfTtcblxuICBEaWFsb2dNYW5hZ2VyLmFsZXJ0UmVxdWVzdGVkLmFkZChmdW5jdGlvbihtZXNzYWdlLCB0aXRsZSkge1xuICAgIG1lc3NhZ2UgPSBnZXRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgYWxlcnRTdGFjay5wdXNoKHsgdGl0bGU6IHRpdGxlLCBtZXNzYWdlOiBtZXNzYWdlIH0pO1xuXG4gICAgaWYgKCEkc2NvcGUuc2hvd0FsZXJ0KSB7XG4gICAgICAkdGltZW91dChzaG93TmV4dEFsZXJ0KTtcbiAgICB9XG4gIH0pO1xuXG4gIERpYWxvZ01hbmFnZXIuY29uZmlybVJlcXVlc3RlZC5hZGQoZnVuY3Rpb24obWVzc2FnZSwgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgbWVzc2FnZSA9IGdldE1lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICBjb25maXJtU3RhY2sucHVzaCh7IG1lc3NhZ2U6IG1lc3NhZ2UsIHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0IH0pO1xuXG4gICAgaWYgKCEkc2NvcGUuc2hvd0NvbmZpcm0pIHtcbiAgICAgICR0aW1lb3V0KHNob3dOZXh0Q29uZmlybSk7XG4gICAgfVxuICB9KTtcblxuICBEaWFsb2dNYW5hZ2VyLmpvYlN0YXJ0ZWQuYWRkKGZ1bmN0aW9uKCkge1xuICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgIH1cblxuICAgIHVwZGF0ZVZpc2liaWxpdHkodHJ1ZSk7XG4gIH0pO1xuXG4gIERpYWxvZ01hbmFnZXIuam9iRW5kZWQuYWRkKGZ1bmN0aW9uKCkge1xuICAgIHVwZGF0ZVZpc2liaWxpdHkoZmFsc2UpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvYWR2ZXJ0aXNlbWVudC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNBZHZlcnRpc2VtZW50Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdBbmFseXRpY3NNb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGF0YVByb3ZpZGVyJywgJ0RpYWxvZ01hbmFnZXInLCAnTmF2aWdhdGlvbk1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1NoZWxsTWFuYWdlcicsICdXZWJCcm93c2VyJywgJ1NOQVBFbnZpcm9ubWVudCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBY3Rpdml0eU1vbml0b3IsIEFuYWx5dGljc01vZGVsLCBoZWxsTWFuYWdlciwgRGF0YU1hbmFnZXIsIERhdGFQcm92aWRlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIENvbW1hbmRSZXNldCwgQ29tbWFuZEZsaXBTY3JlZW4sIFNoZWxsTWFuYWdlciwgV2ViQnJvd3NlciwgU05BUEVudmlyb25tZW50KSA9PiB7XG5cbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudENsaWNrID0gaXRlbSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgdHlwZTogJ2NsaWNrJ1xuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0uaHJlZikge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICd1cmwnLCB1cmw6IGl0ZW0uaHJlZi51cmwgfTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgJHNjb3BlLnZpc2libGUpIHtcbiAgICAgIEFuYWx5dGljc01vZGVsLmxvZ0FkdmVydGlzZW1lbnQoe1xuICAgICAgICB0b2tlbjogaXRlbS50b2tlbixcbiAgICAgICAgdHlwZTogJ2ltcHJlc3Npb24nXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gW107XG5cbiAgRGF0YVByb3ZpZGVyLmFkdmVydGlzZW1lbnRzKCkudGhlbihkYXRhID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHMgPSBkYXRhLm1haW5cbiAgICAgICAgLm1hcChhZCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGFkLnNyYywgOTcwLCA5MCksXG4gICAgICAgICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvY2FydC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdHYWxheGllc0NhcnRDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnJHNjZScsICdDdXN0b21lck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ0NhcnRNb2RlbCcsICdMb2NhdGlvbk1vZGVsJywgJ0NoYXRNYW5hZ2VyJyxcbiAgICAoJHNjb3BlLCAkdGltZW91dCwgJHNjZSwgQ3VzdG9tZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIERpYWxvZ01hbmFnZXIsIENhcnRNb2RlbCwgTG9jYXRpb25Nb2RlbCwgQ2hhdE1hbmFnZXIpID0+IHtcblxuICAgICAgJHNjb3BlLlNUQVRFX0NBUlQgPSBDYXJ0TW9kZWwuU1RBVEVfQ0FSVDtcbiAgICAgICRzY29wZS5TVEFURV9ISVNUT1JZID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG5cbiAgICAgICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICAgICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuICAgICAgJHNjb3BlLm9wdGlvbnMgPSB7fTtcblxuICAgICAgJHNjb3BlLmN1cnJlbmN5ID0gU2hlbGxNYW5hZ2VyLm1vZGVsLmN1cnJlbmN5O1xuICAgICAgU2hlbGxNYW5hZ2VyLm1vZGVsLmN1cnJlbmN5Q2hhbmdlZC5hZGQoY3VycmVuY3kgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmN1cnJlbmN5ID0gY3VycmVuY3kpKTtcblxuICAgICAgJHNjb3BlLnN0YXRlID0gQ2FydE1vZGVsLmNhcnRTdGF0ZTtcbiAgICAgIENhcnRNb2RlbC5jYXJ0U3RhdGVDaGFuZ2VkLmFkZChzdGF0ZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RhdGUgPSBzdGF0ZSkpO1xuXG4gICAgICAkc2NvcGUuZWRpdGFibGVJdGVtID0gQ2FydE1vZGVsLmVkaXRhYmxlSXRlbTtcbiAgICAgIENhcnRNb2RlbC5lZGl0YWJsZUl0ZW1DaGFuZ2VkLmFkZChpdGVtID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS5lZGl0YWJsZUl0ZW0gPSBpdGVtKSk7XG5cbiAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0O1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSB2YWx1ZSk7XG5cbiAgICAgICRzY29wZS50b3RhbE9yZGVyID0gT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2s7XG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVja0NoYW5nZWQuYWRkKHZhbHVlID0+ICRzY29wZS50b3RhbE9yZGVyID0gdmFsdWUpO1xuXG4gICAgICAkc2NvcGUuZ2lmdFNlYXQgPSBMb2NhdGlvbk1vZGVsLmdldFNlYXQoQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXQpO1xuICAgICAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdFNlYXRDaGFuZ2VkLmFkZCh0b2tlbiA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICAgICAgQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLnByb2ZpbGVDaGFuZ2VkLmFkZCgoKSA9PiB7XG4gICAgICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgICAkc2NvcGUuY2hlY2tvdXRFbmFibGVkID0gQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZDtcbiAgICAgICRzY29wZS52aXNpYmxlID0gQ2FydE1vZGVsLmlzQ2FydE9wZW47XG5cbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdjYXRlZ29yeScpIHtcbiAgICAgICAgICBDYXJ0TW9kZWwuaXNDYXJ0T3BlbiA9IGZhbHNlO1xuICAgICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW5DaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgICAgICRzY29wZS5zaG93Q2FydCgpO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IHZhbHVlO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5zZWF0X25hbWUgPSBMb2NhdGlvbk1vZGVsLnNlYXQgP1xuICAgICAgICBMb2NhdGlvbk1vZGVsLnNlYXQubmFtZSA6XG4gICAgICAgICdUYWJsZSc7XG5cbiAgICAgIExvY2F0aW9uTW9kZWwuc2VhdENoYW5nZWQuYWRkKHNlYXQgPT4gJHNjb3BlLnNlYXRfbmFtZSA9IHNlYXQgPyBzZWF0Lm5hbWUgOiAnVGFibGUnKTtcblxuICAgICAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0ID09IG51bGw7XG4gICAgICB9O1xuICAgICAgdmFyIHJlZnJlc2hDbG9zZW91dFJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICAgICAgT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hDbG9zZW91dFJlcXVlc3QpO1xuXG4gICAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QgPT0gbnVsbDtcbiAgICAgICRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUgPSBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0ID09IG51bGw7XG5cbiAgICAgICRzY29wZS5nZXRNb2RpZmllcnMgPSBlbnRyeSA9PiB7XG4gICAgICAgIGlmICghZW50cnkubW9kaWZpZXJzKSB7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVudHJ5Lm1vZGlmaWVycy5yZWR1Y2UoKHJlc3VsdCwgY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICBsZXQgbW9kaWZpZXJzID0gY2F0ZWdvcnkubW9kaWZpZXJzLmZpbHRlcihtb2RpZmllciA9PiBtb2RpZmllci5pc1NlbGVjdGVkKTtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KG1vZGlmaWVycyk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSwgW10pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNhbGN1bGF0ZVByaWNlID0gZW50cnkgPT4gT3JkZXJNYW5hZ2VyLmNhbGN1bGF0ZVByaWNlKGVudHJ5KTtcbiAgICAgICRzY29wZS5jYWxjdWxhdGVUb3RhbFByaWNlID0gZW50cmllcyA9PiBPcmRlck1hbmFnZXIuY2FsY3VsYXRlVG90YWxQcmljZShlbnRyaWVzKTtcblxuICAgICAgJHNjb3BlLmVkaXRJdGVtID0gZW50cnkgPT4gQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIGZhbHNlKTtcblxuICAgICAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IChjYXRlZ29yeSwgbW9kaWZpZXIpID0+IHtcbiAgICAgICAgaWYgKGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgbSA9PiBtLmlzU2VsZWN0ZWQgPSAobSA9PT0gbW9kaWZpZXIpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBtb2RpZmllci5pc1NlbGVjdGVkID0gIW1vZGlmaWVyLmlzU2VsZWN0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yZW1vdmVGcm9tQ2FydCA9IGVudHJ5ID0+ICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIucmVtb3ZlRnJvbUNhcnQoZW50cnkpO1xuICAgICAgJHNjb3BlLnJlb3JkZXJJdGVtID0gZW50cnkgPT4gJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkuY2xvbmUoKSk7XG5cbiAgICAgICRzY29wZS5zdWJtaXRDYXJ0ID0gKCkgPT4ge1xuICAgICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gJHNjb3BlLm9wdGlvbnMudG9HbyA/IDIgOiAwO1xuXG4gICAgICAgIE9yZGVyTWFuYWdlci5zdWJtaXRDYXJ0KG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcblxuICAgICAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQ7XG4gICAgICAgICAgICAkc2NvcGUudG90YWxPcmRlciA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNoZWNrO1xuICAgICAgICAgICAgJHNjb3BlLm9wdGlvbnMudG9HbyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1NFTlQpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2xlYXJDYXJ0ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUub3B0aW9ucy50b0dvID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5jdXJyZW50T3JkZXIgPSBPcmRlck1hbmFnZXIuY2xlYXJDYXJ0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuY2xvc2VFZGl0b3IgPSAoKSA9PiB7XG4gICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLmNsb3NlQ2FydCA9ICgpID0+IHtcbiAgICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgICAgICAgQ2FydE1vZGVsLnN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2hvd0hpc3RvcnkgPSAoKSA9PiBDYXJ0TW9kZWwuc3RhdGUgPSBDYXJ0TW9kZWwuU1RBVEVfSElTVE9SWTtcbiAgICAgICRzY29wZS5zaG93Q2FydCA9ICgpID0+IENhcnRNb2RlbC5zdGF0ZSA9IENhcnRNb2RlbC5TVEFURV9DQVJUO1xuXG4gICAgICAkc2NvcGUucGF5Q2hlY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2NoZWNrb3V0JyB9O1xuXG4gICAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5yZXF1ZXN0Q2xvc2VvdXRBdmFpbGFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0Q2xvc2VvdXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2NhdGVnb3J5LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdHYWxheGllc0NhdGVnb3J5Q3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBEYXRhTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNoZWxsTWFuYWdlcikgPT4ge1xuXG4gICRzY29wZS5nb0JhY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICB2YXIgQ2F0ZWdvcnlMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDQ3MCwgNDEwKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLXJlZ3VsYXInLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZCA/ICd1cmwoXCInICsgYmFja2dyb3VuZCArICdcIiknIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCB2YWx1ZSwgaSkgPT4ge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLmNhdGVnb3J5Q2hhbmdlZC5hZGQoY2F0ZWdvcnkgPT4ge1xuICAgIGlmICghY2F0ZWdvcnkpIHtcbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiAkc2NvcGUuY2F0ZWdvcnkgPSBudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgaXRlbXMgPSBjYXRlZ29yeS5pdGVtcyB8fCBbXSxcbiAgICAgICAgY2F0ZWdvcmllcyA9IGNhdGVnb3J5LmNhdGVnb3JpZXMgfHwgW107XG5cbiAgICB2YXIgdGlsZXMgPSBjYXRlZ29yaWVzLmNvbmNhdChpdGVtcykubWFwKGl0ZW0gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGl0bGU6IGl0ZW0udGl0bGUsXG4gICAgICAgIGltYWdlOiBpdGVtLmltYWdlLFxuICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoaXRlbS5kZXN0aW5hdGlvbiksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBpdGVtLmRlc3RpbmF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChDYXRlZ29yeUxpc3QsIHsgdGlsZXM6IHRpbGVzIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2UtY2F0ZWdvcnktY29udGVudCcpXG4gICAgKTtcblxuICAgICRzY29wZS5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICdpdGVtJykge1xuICAgICAgJHNjb3BlLnNob3dNb2RhbCA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgJHNjb3BlLnNob3dNb2RhbCA9IGZhbHNlO1xuXG4gICAgRGF0YU1hbmFnZXIuY2F0ZWdvcnkgPSBsb2NhdGlvbi50eXBlID09PSAnY2F0ZWdvcnknID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLmNhdGVnb3J5KTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvaG9tZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNIb21lQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1NoZWxsTWFuYWdlcicsICdTTkFQQ29uZmlnJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgU2hlbGxNYW5hZ2VyLCBTTkFQQ29uZmlnKSA9PiB7XG5cbiAgdmFyIEhvbWVNZW51ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgcm93cyA9IFtdLFxuICAgICAgICAgIGhvbWUgPSB0aGlzLnByb3BzLmhvbWU7XG5cbiAgICAgIGlmIChCb29sZWFuKGhvbWUuaW50cm8pKSB7XG4gICAgICAgIHJvd3MucHVzaChSZWFjdC5ET00udGQoe1xuICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1pbmZvJyxcbiAgICAgICAgICBrZXk6ICdpbnRybydcbiAgICAgICAgfSwgUmVhY3QuRE9NLmRpdih7fSwgW1xuICAgICAgICAgICAgUmVhY3QuRE9NLmgxKHsga2V5OiAnaW50cm8tdGl0bGUnIH0sXG4gICAgICAgICAgICAgIGhvbWUuaW50cm8udGl0bGUgfHwgYFdlbGNvbWUgdG8gJHtTTkFQQ29uZmlnLmxvY2F0aW9uX25hbWV9YFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5wKHsga2V5OiAnaW50cm8tdGV4dCcgfSxcbiAgICAgICAgICAgICAgaG9tZS5pbnRyby50ZXh0XG4gICAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGlsZXMgPSB0aGlzLnByb3BzLnRpbGVzLm1hcCgodGlsZSwgaSkgPT4ge1xuICAgICAgICB2YXIgYmFja2dyb3VuZCA9IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybCh0aWxlLmltYWdlLCA0NzAsIDQxMCk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgUmVhY3QuRE9NLnRkKHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RpbGUgdGlsZS1yZWd1bGFyJyxcbiAgICAgICAgICAgIGtleTogaVxuICAgICAgICAgIH0sIFJlYWN0LkRPTS5hKHtcbiAgICAgICAgICAgIG9uQ2xpY2s6IGUgPT4ge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gdGlsZS5kZXN0aW5hdGlvbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U6IGJhY2tncm91bmQgPyAndXJsKFwiJyArIGJhY2tncm91bmQgKyAnXCIpJyA6IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgICAgUmVhY3QuRE9NLnNwYW4obnVsbCwgdGlsZS50aXRsZSlcbiAgICAgICAgICApKVxuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHJvd3MgPSByb3dzLmNvbmNhdCh0aWxlcylcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmFsdWUpID0+IHtcbiAgICAgICAgcmVzdWx0WzBdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdXSlcbiAgICAgIC5tYXAoKHJvdywgaSkgPT4gUmVhY3QuRE9NLnRyKHsga2V5OiBpIH0sIHJvdykpO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHtcbiAgICAgICAgY2xhc3NOYW1lOiAndGlsZS10YWJsZSdcbiAgICAgIH0sIHJvd3MpO1xuICAgIH1cbiAgfSk7XG5cbiAgRGF0YU1hbmFnZXIuaG9tZUNoYW5nZWQuYWRkKGhvbWUgPT4ge1xuICAgIGlmICghaG9tZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IGhvbWUubWVudXNcbiAgICAubWFwKG1lbnUgPT4ge1xuICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgIHRva2VuOiBtZW51LnRva2VuXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgaW1hZ2U6IG1lbnUuaW1hZ2UsXG4gICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSG9tZU1lbnUsIHsgdGlsZXM6IHRpbGVzLCBob21lOiBob21lIH0pLFxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhZ2UtaG9tZS1tZW51JylcbiAgICApO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIuaG9tZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIuaG9tZSk7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLiRhcHBseSgpKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL2l0ZW0uanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzSXRlbUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnU2hlbGxNYW5hZ2VyJywgJ1dlYkJyb3dzZXInLCAnQ29tbWFuZFN1Ym1pdE9yZGVyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIFdlYkJyb3dzZXIsIENvbW1hbmRTdWJtaXRPcmRlcikgPT4ge1xuXG4gICRzY29wZS5nb0JhY2sgPSAoKSA9PiBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcblxuICBEYXRhTWFuYWdlci5pdGVtQ2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG5cbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9ICRzY29wZS5lbnRyaWVzID0gbnVsbDtcbiAgICAgICAgJHNjb3BlLnR5cGUgPSAxO1xuICAgICAgICAkc2NvcGUuc3RlcCA9IDA7XG4gICAgICAgICRzY29wZS5lbnRyeUluZGV4ID0gMDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gaXRlbS50eXBlO1xuXG4gICAgaWYgKHR5cGUgPT09IDIgJiYgaXRlbS53ZWJzaXRlKSB7XG4gICAgICBXZWJCcm93c2VyLm9wZW4oaXRlbS53ZWJzaXRlLnVybCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDMgJiYgaXRlbS5mbGFzaCkge1xuICAgICAgbGV0IGZsYXNoVXJsID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGl0ZW0uZmxhc2gubWVkaWEsIDAsIDAsICdzd2YnKSxcbiAgICAgICAgICB1cmwgPSAnL2ZsYXNoI3VybD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGZsYXNoVXJsKSArXG4gICAgICAgICAgICAgICAgJyZ3aWR0aD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0uZmxhc2gud2lkdGgpICtcbiAgICAgICAgICAgICAgICAnJmhlaWdodD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0uZmxhc2guaGVpZ2h0KTtcblxuICAgICAgV2ViQnJvd3Nlci5vcGVuKFdlYkJyb3dzZXIuZ2V0QXBwVXJsKHVybCkpO1xuICAgIH1cblxuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICRzY29wZS5lbnRyeSA9IG5ldyBhcHAuQ2FydEl0ZW0oaXRlbSwgMSk7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS50eXBlID0gdHlwZTtcbiAgICAgICRzY29wZS5zdGVwID0gMDtcbiAgICAgICRzY29wZS5lbnRyeUluZGV4ID0gMDtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3LCBoLCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgdywgaCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gdmFsdWUgPyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpIDogMDtcblxuICAkc2NvcGUubmV4dFN0ZXAgPSAoKSA9PiB7XG4gICAgaWYgKCRzY29wZS5zdGVwID09PSAwKSB7XG4gICAgICBpZiAoJHNjb3BlLmVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgICAkc2NvcGUuZW50cmllcyA9ICRzY29wZS5lbnRyeS5jbG9uZU1hbnkoKTtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRFbnRyeSA9ICRzY29wZS5lbnRyaWVzWyRzY29wZS5lbnRyeUluZGV4ID0gMF07XG4gICAgICAgICRzY29wZS5zdGVwID0gMTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBPcmRlck1hbmFnZXIuYWRkVG9DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgICRzY29wZS5zdGVwID0gMjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoJHNjb3BlLnN0ZXAgPT09IDEpIHtcbiAgICAgIGlmICgkc2NvcGUuZW50cnlJbmRleCA9PT0gJHNjb3BlLmVudHJpZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAkc2NvcGUuZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkpKTtcbiAgICAgICAgJHNjb3BlLnN0ZXAgPSAyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50RW50cnkgPSAkc2NvcGUuZW50cmllc1srKyRzY29wZS5lbnRyeUluZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnByZXZpb3VzU3RlcCA9ICgpID0+IHtcbiAgICBpZiAoJHNjb3BlLnN0ZXAgPT09IDEgJiYgJHNjb3BlLmVudHJ5SW5kZXggPiAwKSB7XG4gICAgICAkc2NvcGUuY3VycmVudEVudHJ5ID0gJHNjb3BlLmVudHJpZXNbLS0kc2NvcGUuZW50cnlJbmRleF07XG4gICAgfVxuICAgIGVsc2UgaWYgKCRzY29wZS5zdGVwID09PSAwKSB7XG4gICAgICAkc2NvcGUuZ29CYWNrKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJHNjb3BlLnN0ZXAtLTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnVwZGF0ZU1vZGlmaWVycyA9IChjYXRlZ29yeSwgbW9kaWZpZXIpID0+IHtcbiAgICBpZiAoY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIG0gPT4gbS5pc1NlbGVjdGVkID0gKG0gPT09IG1vZGlmaWVyKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc3VibWl0T3JkZXIgPSAoKSA9PiB7XG4gICAgQ29tbWFuZFN1Ym1pdE9yZGVyKCk7XG4gICAgJHNjb3BlLmdvQmFjaygpO1xuICB9O1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5pdGVtID0gbG9jYXRpb24udHlwZSA9PT0gJ2l0ZW0nID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLml0ZW0pO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9nYWxheGllcy9pdGVtZWRpdC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdHYWxheGllc0l0ZW1FZGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJywgJ0NvbW1hbmRTdWJtaXRPcmRlcicsXG4gICAgKCRzY29wZSwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwsIENvbW1hbmRTdWJtaXRPcmRlcikgPT4ge1xuXG4gICAgICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAgICAgJHNjb3BlLmZvcm1hdFByaWNlID0gdmFsdWUgPT4gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKTtcblxuICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IC0xO1xuXG4gICAgICB2YXIgcmVmcmVzaE5hdmlnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRzY29wZS5lbnRyeSAmJiAkc2NvcGUuZW50cnkuaGFzTW9kaWZpZXJzKSB7XG4gICAgICAgICAgJHNjb3BlLmhhc05leHRDYXRlZ29yeSA9ICRzY29wZS5lbnRyeS5tb2RpZmllcnMubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgY3VycmVudEluZGV4IDwgJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggLSAxO1xuICAgICAgICAgICRzY29wZS5oYXNQcmV2aW91c0NhdGVnb3J5ID0gY3VycmVudEluZGV4ID4gMDtcbiAgICAgICAgICAkc2NvcGUuY2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF07XG4gICAgICAgICAgJHNjb3BlLmNhbkV4aXQgPSBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3O1xuICAgICAgICAgICRzY29wZS5jYW5Eb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb25DaGFuZ2luZy5hZGQoZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgICAgaWYgKGxvY2F0aW9uLnR5cGUgIT09ICdtZW51JyAmJiBsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknKSB7XG4gICAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbml0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgJHNjb3BlLmVudHJ5ID0gdmFsdWU7XG4gICAgICAgICRzY29wZS52aXNpYmxlID0gJHNjb3BlLmVudHJ5ICE9IG51bGw7XG5cbiAgICAgICAgY3VycmVudEluZGV4ID0gMDtcblxuICAgICAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICAgICAgfTtcblxuICAgICAgaW5pdChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcblxuICAgICAgQ2FydE1vZGVsLmVkaXRhYmxlSXRlbUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGluaXQodmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5nZXRNb2RpZmllclRpdGxlID0gZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyLmRhdGEudGl0bGUgKyAobW9kaWZpZXIuZGF0YS5wcmljZSA+IDAgP1xuICAgICAgICAgICAgJyAoKycgKyBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UobW9kaWZpZXIuZGF0YS5wcmljZSkgKyAnKScgOlxuICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubGVmdEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHJlc3VsdCA9IChjdXJyZW50SW5kZXggPiAwKSA/ICgkc2NvcGUucHJldmlvdXNDYXRlZ29yeSgpKSA6ICRzY29wZS5leGl0KCk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUubGVmdEJ1dHRvblRleHQgPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gKGN1cnJlbnRJbmRleCA+IDApID8gJ0JhY2snIDogJ0V4aXQnO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnNob3dMZWZ0QnV0dG9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIChjdXJyZW50SW5kZXggPiAwKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5yaWdodEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy9NYWtlIHN1cmUgUGljayAxIG1vZGlmaWVyIGNhdGVnb3JpZXMgaGF2ZSBtZXQgdGhlIHNlbGVjdGlvbiBjb25kaXRpb24uXG4gICAgICAgIGlmKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5kYXRhLnNlbGVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgIHZhciBudW1TZWxlY3RlZCA9IDA7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5lbnRyeS5tb2RpZmllcnNbY3VycmVudEluZGV4XS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgIGlmIChtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgbnVtU2VsZWN0ZWQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmKG51bVNlbGVjdGVkICE9PSAxKSB7XG4gICAgICAgICAgICAvL1RPRE86IEFkZCBtb2RhbCBwb3B1cC4gTXVzdCBtYWtlIDEgc2VsZWN0aW9uIVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHQgPSAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAkc2NvcGUubmV4dENhdGVnb3J5KCkgOiAkc2NvcGUuZG9uZSgpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnJpZ2h0QnV0dG9uVGV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAoJHNjb3BlLmhhc05leHRDYXRlZ29yeSkgPyAnTmV4dCcgOiAnRG9uZSc7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2hvd1JpZ2h0QnV0dG9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICgkc2NvcGUuaGFzTmV4dENhdGVnb3J5KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5wcmV2aW91c0NhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnJlbnRJbmRleC0tO1xuICAgICAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLm5leHRDYXRlZ29yeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjdXJyZW50SW5kZXgrKztcbiAgICAgICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS51cGRhdGVNb2RpZmllcnMgPSBmdW5jdGlvbihjYXRlZ29yeSwgbW9kaWZpZXIpIHtcbiAgICAgICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuXG4gICAgICAgIGlmIChtb2RpZmllci5pc1NlbGVjdGVkICYmIGNhdGVnb3J5LmRhdGEuc2VsZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGNhdGVnb3J5Lm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgbS5pc1NlbGVjdGVkID0gbSA9PT0gbW9kaWZpZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5zdWJtaXRDaGFuZ2VzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgT3JkZXJNYW5hZ2VyLnJlbW92ZUZyb21DYXJ0KCRzY29wZS5lbnRyeSk7XG4gICAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoJHNjb3BlLmVudHJ5KTtcbiAgICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3KSB7XG4gICAgICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5leGl0KCk7XG4gICAgICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5leGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICAgICAgfTtcbiAgICB9XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2dhbGF4aWVzL21lbnUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0dhbGF4aWVzTWVudUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICAkc2NvcGUuZ29CYWNrID0gKCkgPT4gTmF2aWdhdGlvbk1hbmFnZXIuZ29CYWNrKCk7XG5cbiAgdmFyIE1lbnVMaXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcm93cyA9IHRoaXMucHJvcHMudGlsZXMubWFwKCh0aWxlLCBpKSA9PiB7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKHRpbGUuaW1hZ2UsIDQ3MCwgNDEwKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAndGlsZSB0aWxlLXJlZ3VsYXInLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZTogYmFja2dyb3VuZCA/ICd1cmwoXCInICsgYmFja2dyb3VuZCArICdcIiknIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uc3BhbihudWxsLCB0aWxlLnRpdGxlKVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnJlZHVjZSgocmVzdWx0LCB2YWx1ZSwgaSkgPT4ge1xuICAgICAgICByZXN1bHRbaSAlIDJdLnB1c2godmFsdWUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwgW1tdLCBbXV0pXG4gICAgICAubWFwKChyb3csIGkpID0+IFJlYWN0LkRPTS50cih7IGtleTogaSB9LCByb3cpKTtcblxuICAgICAgcmV0dXJuIFJlYWN0LkRPTS50YWJsZSh7XG4gICAgICAgIGNsYXNzTmFtZTogJ3RpbGUtdGFibGUnXG4gICAgICB9LCByb3dzKTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLm1lbnVDaGFuZ2VkLmFkZChtZW51ID0+IHtcbiAgICBpZiAoIW1lbnUpIHtcbiAgICAgIHJldHVybiAkdGltZW91dCgoKSA9PiAkc2NvcGUubWVudSA9IG51bGwpO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IG1lbnUuY2F0ZWdvcmllc1xuICAgICAgLm1hcChjYXRlZ29yeSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnY2F0ZWdvcnknLFxuICAgICAgICAgIHRva2VuOiBjYXRlZ29yeS50b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdGl0bGU6IGNhdGVnb3J5LnRpdGxlLFxuICAgICAgICAgIGltYWdlOiBjYXRlZ29yeS5pbWFnZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVMaXN0LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYWdlLW1lbnUtY29udGVudCcpXG4gICAgKTtcblxuICAgICRzY29wZS5tZW51ID0gbWVudTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChsb2NhdGlvbiA9PiB7XG4gICAgRGF0YU1hbmFnZXIubWVudSA9IGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyA/IGxvY2F0aW9uLnRva2VuIDogdW5kZWZpbmVkO1xuICAgICRzY29wZS52aXNpYmxlID0gQm9vbGVhbihEYXRhTWFuYWdlci5tZW51KTtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvZ2FsYXhpZXMvbmF2aWdhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignR2FsYXhpZXNOYXZpZ2F0aW9uQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdDdXN0b21lck1hbmFnZXInLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ2FydE1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnRGlhbG9nTWFuYWdlcicsICdMb2NhdGlvbk1vZGVsJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDb21tYW5kUmVzZXQnLCAnQ29tbWFuZFN1Ym1pdE9yZGVyJywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgQ3VzdG9tZXJNYW5hZ2VyLCBBbmFseXRpY3NNb2RlbCwgQ2FydE1vZGVsLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDb21tYW5kUmVzZXQsIENvbW1hbmRTdWJtaXRPcmRlciwgQ29tbWFuZEZsaXBTY3JlZW4sIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS5tZW51cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsb2NhdGlvbiA9IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLFxuICAgICAgICBsaW1pdCA9IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnID8gNCA6IDM7XG5cbiAgICAkc2NvcGUubWVudXMgPSByZXNwb25zZS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAgIC5maWx0ZXIoKG1lbnUsIGkpID0+IGkgPCBsaW1pdClcbiAgICAgIC5tYXAobWVudSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlbixcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcbiAgICAgICAgICBzZWxlY3RlZDogbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRDbGljayA9IGl0ZW0gPT4ge1xuICAgIGlmIChpdGVtLmhyZWYpIHtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAndXJsJywgdXJsOiBpdGVtLmhyZWYudXJsIH07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5jdXJyZW50QWR2ZXJ0aXNlbWVudDtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudEltcHJlc3Npb24gPSBpdGVtID0+IHtcbiAgICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQgPSBpdGVtO1xuXG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgJHNjb3BlLm1lbnVPcGVuKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5hZHZlcnRpc2VtZW50cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5hZHZlcnRpc2VtZW50cygpLnRoZW4oZGF0YSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzID0gZGF0YS5taXNjXG4gICAgICAgIC5tYXAoYWQgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChhZC5zcmMsIDMwMCwgMjUwKSxcbiAgICAgICAgICAgIGhyZWY6IGFkLmhyZWYsXG4gICAgICAgICAgICB0eXBlOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFUeXBlKGFkLnNyYyksXG4gICAgICAgICAgICB0b2tlbjogYWQudG9rZW5cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlSG9tZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gIH07XG5cbiAgJHNjb3BlLm5hdmlnYXRlQmFjayA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5nb0JhY2soKTtcbiAgfTtcblxuICAkc2NvcGUucm90YXRlU2NyZWVuID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIENvbW1hbmRGbGlwU2NyZWVuKCk7XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5DYXJ0ID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gIUNhcnRNb2RlbC5pc0NhcnRPcGVuO1xuICB9O1xuXG4gICRzY29wZS5zZWF0TmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQodmFsdWUgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNlYXROYW1lID0gdmFsdWUgPyB2YWx1ZS5uYW1lIDogJ1RhYmxlJykpO1xuXG4gICRzY29wZS5yZXNldFRhYmxlID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICBDb21tYW5kUmVzZXQoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUubWVudU9wZW4gPSBmYWxzZTtcblxuICAkc2NvcGUudG9nZ2xlTWVudSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgICRzY29wZS5tZW51T3BlbiA9ICEkc2NvcGUubWVudU9wZW47XG5cbiAgICBpZiAoJHNjb3BlLmN1cnJlbnRBZHZlcnRpc2VtZW50ICYmICRzY29wZS5tZW51T3Blbikge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQWR2ZXJ0aXNlbWVudCh7XG4gICAgICAgIHRva2VuOiAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQudG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUuY3VycmVudEFkdmVydGlzZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZVNldHRpbmdzID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9ICEkc2NvcGUuc2V0dGluZ3NPcGVuO1xuICB9O1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmNhcnRDb3VudCA9IE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQubGVuZ3RoO1xuICBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Q2hhbmdlZC5hZGQoY2FydCA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLmNhcnRDb3VudCA9IGNhcnQubGVuZ3RoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmNoZWNrb3V0RW5hYmxlZCA9IEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQ7XG5cbiAgJHNjb3BlLnRvdGFsT3JkZXIgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDaGVjaztcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2hlY2tDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnRvdGFsT3JkZXIgPSB2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfQVNTSVNUQU5DRSkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdEFzc2lzdGFuY2UoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX0FTU0lTVEFOQ0VfU0VOVCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpO1xuICB9O1xuICBPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QpO1xuICByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QoKTtcblxuICAkc2NvcGUuc3VibWl0T3JkZXIgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICAkc2NvcGUuc2V0dGluZ3NPcGVuID0gZmFsc2U7XG5cbiAgICBDb21tYW5kU3VibWl0T3JkZXIoKTtcbiAgfTtcblxuICAkc2NvcGUudmlld09yZGVyID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0NBUlQ7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5wYXlCaWxsID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgJHNjb3BlLnNldHRpbmdzT3BlbiA9IGZhbHNlO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBDYXJ0TW9kZWwuY2FydFN0YXRlID0gQ2FydE1vZGVsLlNUQVRFX0hJU1RPUlk7XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICB9O1xuXG4gICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lO1xuICBDdXN0b21lck1hbmFnZXIubW9kZWwucHJvZmlsZUNoYW5nZWQuYWRkKCgpID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuY3VzdG9tZXJOYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBkaXNwbGF5QnJpZ2h0bmVzczogMTAwLFxuICAgIHNvdW5kVm9sdW1lOiAxMDBcbiAgfTtcblxuICAkc2NvcGUuJHdhdGNoKCdzZXR0aW5ncy5zb3VuZFZvbHVtZScsICh2YWx1ZSwgb2xkKSA9PiB7XG4gICAgaWYgKHZhbHVlID09PSBvbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuICAgIE1hbmFnZW1lbnRTZXJ2aWNlLnNldFNvdW5kVm9sdW1lKHZhbHVlKTtcbiAgfSk7XG4gIE1hbmFnZW1lbnRTZXJ2aWNlLmdldFNvdW5kVm9sdW1lKCkudGhlbihcbiAgICByZXNwb25zZSA9PiAkdGltZW91dCgoKSA9PiAkc2NvcGUuc2V0dGluZ3Muc291bmRWb2x1bWUgPSByZXNwb25zZS52b2x1bWUpLFxuICAgIGUgPT4geyB9XG4gICk7XG5cbiAgJHNjb3BlLiR3YXRjaCgnc2V0dGluZ3MuZGlzcGxheUJyaWdodG5lc3MnLCAodmFsdWUsIG9sZCkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gb2xkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcbiAgICBNYW5hZ2VtZW50U2VydmljZS5zZXREaXNwbGF5QnJpZ2h0bmVzcyh2YWx1ZSk7XG4gIH0pO1xuICBNYW5hZ2VtZW50U2VydmljZS5nZXREaXNwbGF5QnJpZ2h0bmVzcygpLnRoZW4oXG4gICAgcmVzcG9uc2UgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnNldHRpbmdzLmRpc3BsYXlCcmlnaHRuZXNzID0gcmVzcG9uc2UuYnJpZ2h0bmVzcyksXG4gICAgZSA9PiB7IH1cbiAgKTtcblxuICAkc2NvcGUubmF2aWdhdGUgPSBkZXN0aW5hdGlvbiA9PiBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IGRlc3RpbmF0aW9uO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgIT09ICdzaWduaW4nO1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS4kYXBwbHkoKSk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdlZC5hZGQobG9jYXRpb24gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnY2F0ZWdvcnknICYmIGxvY2F0aW9uLnR5cGUgIT09ICdpdGVtJykge1xuICAgICAgICAkc2NvcGUubWVudXMuZm9yRWFjaChtZW51ID0+IHtcbiAgICAgICAgICBtZW51LnNlbGVjdGVkID0gKGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUubWVudU9wZW4gPSBmYWxzZTtcbiAgICAgICRzY29wZS5zZXR0aW5nc09wZW4gPSBmYWxzZTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL2hvbWUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0hvbWVCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyKSB7XG59XSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdIb21lQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0NoYXRNYW5hZ2VyJywgJ0RhdGFQcm92aWRlcicsICdTaGVsbE1hbmFnZXInLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ0xvY2F0aW9uTW9kZWwnLCAnU3VydmV5TWFuYWdlcicsICdTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdDb21tYW5kUmVzZXQnLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQ2hhdE1hbmFnZXIsIERhdGFQcm92aWRlciwgU2hlbGxNYW5hZ2VyLCBDdXN0b21lck1hbmFnZXIsIE9yZGVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIFN1cnZleU1hbmFnZXIsIFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgQ29tbWFuZFJlc2V0KSA9PiB7XG5cbiAgdmFyIEhvbWVNZW51ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gWyBSZWFjdC5ET00udGQoeyBrZXk6IC0xIH0pIF07XG5cbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoKHRpbGUsIGkpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBSZWFjdC5ET00udGQoe1xuICAgICAgICAgICAgY2xhc3NOYW1lOiAnaG9tZS1tZW51LWl0ZW0nLFxuICAgICAgICAgICAga2V5OiBpXG4gICAgICAgICAgfSwgUmVhY3QuRE9NLmEoe1xuICAgICAgICAgICAgb25DbGljazogZSA9PiB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB0aWxlLmRlc3RpbmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgICBSZWFjdC5ET00uaW1nKHtcbiAgICAgICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMTYwLCAxNjApXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICkpXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChyb3dzKTtcbiAgICAgIHJlc3VsdC5wdXNoKFJlYWN0LkRPTS50ZCh7IGtleTogcmVzdWx0Lmxlbmd0aCB9KSk7XG5cbiAgICAgIHJldHVybiBSZWFjdC5ET00udGFibGUobnVsbCwgcmVzdWx0KTtcbiAgICB9XG4gIH0pO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgcmVzcG9uc2UubWVudXNcbiAgICAuZmlsdGVyKG1lbnUgPT4gU05BUEVudmlyb25tZW50LnBsYXRmb3JtID09PSAnZGVza3RvcCcgfHwgbWVudS50eXBlICE9PSAzKVxuICAgIC5yZWR1Y2UoKHRpbGVzLCBtZW51KSA9PiB7XG4gICAgICBpZiAobWVudS5wcm9tb3MgJiYgbWVudS5wcm9tb3MubGVuZ3RoID4gMCkge1xuICAgICAgICBtZW51LnByb21vc1xuICAgICAgICAuZmlsdGVyKHByb21vID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IHByb21vLnR5cGUgIT09IDMpXG4gICAgICAgIC5mb3JFYWNoKHByb21vID0+IHtcbiAgICAgICAgICB0aWxlcy5wdXNoKHtcbiAgICAgICAgICAgIHRpdGxlOiBwcm9tby50aXRsZSxcbiAgICAgICAgICAgIGltYWdlOiBwcm9tby5pbWFnZSxcbiAgICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChwcm9tby5kZXN0aW5hdGlvbiksXG4gICAgICAgICAgICBkZXN0aW5hdGlvbjogcHJvbW8uZGVzdGluYXRpb25cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge1xuICAgICAgICAgIHR5cGU6ICdtZW51JyxcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlblxuICAgICAgICB9O1xuXG4gICAgICAgIHRpbGVzLnB1c2goe1xuICAgICAgICAgIHRpdGxlOiBtZW51LnRpdGxlLFxuICAgICAgICAgIGltYWdlOiBtZW51LmltYWdlLFxuICAgICAgICAgIHVybDogJyMnICsgTmF2aWdhdGlvbk1hbmFnZXIuZ2V0UGF0aChkZXN0aW5hdGlvbiksXG4gICAgICAgICAgZGVzdGluYXRpb246IGRlc3RpbmF0aW9uXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGlsZXM7XG4gICAgfSwgdGlsZXMpO1xuXG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVNZW51LCB7IHRpbGVzOiB0aWxlcyB9KSxcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hvbWUtbWVudS1tYWluJylcbiAgICAgICk7XG4gICAgfSwgMTAwMCk7XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkc2NvcGUudmlzaWJsZSA9IGxvY2F0aW9uLnR5cGUgPT09ICdob21lJztcbiAgICAkdGltZW91dCgoKSA9PiB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5wcmVsb2FkID0gZGVzdGluYXRpb24gPT4ge1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0gZGVzdGluYXRpb247XG4gIH07XG5cbiAgJHNjb3BlLmdldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IFNoZWxsTWFuYWdlci5nZXRNZWRpYVVybChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKTtcbiAgJHNjb3BlLnByZWRpY2F0ZUV2ZW4gPSBTaGVsbE1hbmFnZXIucHJlZGljYXRlRXZlbjtcbiAgJHNjb3BlLnByZWRpY2F0ZU9kZCA9IFNoZWxsTWFuYWdlci5wcmVkaWNhdGVPZGQ7XG5cbiAgJHNjb3BlLnNlYXRfbmFtZSA9IExvY2F0aW9uTW9kZWwuc2VhdCA/IExvY2F0aW9uTW9kZWwuc2VhdC5uYW1lIDogJ1RhYmxlJztcbiAgTG9jYXRpb25Nb2RlbC5zZWF0Q2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+IHtcbiAgICAgICRzY29wZS5zZWF0X25hbWUgPSB2YWx1ZSA/IHZhbHVlLm5hbWUgOiAnVGFibGUnO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuY3VzdG9tZXJfbmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lcl9uYW1lID0gQ3VzdG9tZXJNYW5hZ2VyLmN1c3RvbWVyTmFtZSk7XG4gIH0pO1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgdmFyIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUgPSAhQm9vbGVhbihPcmRlck1hbmFnZXIubW9kZWwuYXNzaXN0YW5jZVJlcXVlc3QpO1xuICB9O1xuICB2YXIgcmVmcmVzaENsb3Nlb3V0UmVxdWVzdCA9ICgpID0+IHtcbiAgICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0QXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmNsb3Nlb3V0UmVxdWVzdCk7XG4gIH07XG4gIHZhciByZWZyZXNoU3VydmV5ID0gKCkgPT4ge1xuICAgICRzY29wZS5zdXJ2ZXlBdmFpbGFibGUgPSBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5ICYmICFTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGU7XG4gIH07XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCk7XG4gIE9yZGVyTWFuYWdlci5tb2RlbC5jbG9zZW91dFJlcXVlc3RDaGFuZ2VkLmFkZChyZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KTtcbiAgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNoYW5nZWQuYWRkKHJlZnJlc2hTdXJ2ZXkpO1xuICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLnN1cnZleUNvbXBsZXRlZC5hZGQocmVmcmVzaFN1cnZleSk7XG4gIHJlZnJlc2hBc3Npc3RhbmNlUmVxdWVzdCgpO1xuICByZWZyZXNoQ2xvc2VvdXRSZXF1ZXN0KCk7XG4gIHJlZnJlc2hTdXJ2ZXkoKTtcblxuICAkc2NvcGUuY2hhdEF2YWlsYWJsZSA9IEJvb2xlYW4oU05BUENvbmZpZy5jaGF0KTtcblxuICAkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2UgPSAoKSA9PiB7XG4gICAgaWYgKCEkc2NvcGUucmVxdWVzdEFzc2lzdGFuY2VBdmFpbGFibGUpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9BU1NJU1RBTkNFKS50aGVuKCgpID0+IHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICAgIE9yZGVyTWFuYWdlci5yZXF1ZXN0QXNzaXN0YW5jZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucmVxdWVzdENsb3Nlb3V0ID0gKCkgPT4ge1xuICAgIGlmICghJHNjb3BlLnJlcXVlc3RDbG9zZW91dEF2YWlsYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9DTE9TRU9VVCkudGhlbigoKSA9PiB7XG4gICAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgICBPcmRlck1hbmFnZXIucmVxdWVzdENsb3Nlb3V0KCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9TRU5UKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUub3BlblN1cnZleSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5zdXJ2ZXlBdmFpbGFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ3N1cnZleScgfTtcbiAgfTtcblxuICAkc2NvcGUuc2VhdENsaWNrZWQgPSAoKSA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX1JFU0VUKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgIENvbW1hbmRSZXNldCgpO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jdXN0b21lckNsaWNrZWQgPSAoKSA9PiB7XG4gICAgaWYgKCFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0d1ZXN0KSB7XG4gICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2FjY291bnQnIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUub3BlbkNoYXQgPSAoKSA9PiB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9pdGVtLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdJdGVtQmFzZUN0cmwnLFxuICBbJyRzY29wZScsICgkc2NvcGUpID0+IHtcbn1dKTtcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0l0ZW1DdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ3VzdG9tZXJNb2RlbCcsICdEYXRhTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdDYXJ0TW9kZWwnLCAnTG9jYXRpb25Nb2RlbCcsICdTaGVsbE1hbmFnZXInLCAnV2ViQnJvd3NlcicsICdTTkFQRW52aXJvbm1lbnQnLCAnQ2hhdE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIERhdGFNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwsIExvY2F0aW9uTW9kZWwsIFNoZWxsTWFuYWdlciwgV2ViQnJvd3NlciwgU05BUEVudmlyb25tZW50LCBDaGF0TWFuYWdlcikgPT4ge1xuXG4gIHZhciBJdGVtSW1hZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBSZWFjdC5ET00uaW1nKHtcbiAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGhpcy5wcm9wcy5tZWRpYSwgNjAwLCA2MDApXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uQ2hhbmdpbmcuYWRkKGxvY2F0aW9uID0+IHtcbiAgICBEYXRhTWFuYWdlci5pdGVtID0gbG9jYXRpb24udHlwZSA9PT0gJ2l0ZW0nID8gbG9jYXRpb24udG9rZW4gOiB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnZpc2libGUgPSBCb29sZWFuKERhdGFNYW5hZ2VyLml0ZW0pO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyAkc2NvcGUuJGFwcGx5KCk7IH0pO1xuICB9KTtcblxuICBEYXRhTWFuYWdlci5pdGVtQ2hhbmdlZC5hZGQocmVzcG9uc2UgPT4ge1xuICAgIGlmICghcmVzcG9uc2UgJiYgKCRzY29wZS53ZWJzaXRlVXJsIHx8ICRzY29wZS5mbGFzaFVybCkpIHtcbiAgICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAkc2NvcGUud2Vic2l0ZVVybCA9IG51bGw7XG4gICAgJHNjb3BlLmZsYXNoVXJsID0gbnVsbDtcblxuICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICRzY29wZS5lbnRyeSA9IG51bGw7XG5cbiAgICAgIGlmICgkc2NvcGUudHlwZSA9PT0gMSkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXRlbS1waG90bycpLmlubmVySFRNTCA9ICcnO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHlwZSA9IDE7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuJGFwcGx5KCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB0eXBlID0gcmVzcG9uc2UudHlwZTtcblxuICAgIGlmICh0eXBlID09PSAyICYmIHJlc3BvbnNlLndlYnNpdGUpIHtcbiAgICAgICRzY29wZS53ZWJzaXRlVXJsID0gcmVzcG9uc2Uud2Vic2l0ZS51cmw7XG4gICAgICBXZWJCcm93c2VyLm9wZW4oJHNjb3BlLndlYnNpdGVVcmwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlID09PSAzICYmIHJlc3BvbnNlLmZsYXNoKSB7XG4gICAgICB2YXIgdXJsID0gJy9mbGFzaCN1cmw9JyArIGVuY29kZVVSSUNvbXBvbmVudChnZXRNZWRpYVVybChyZXNwb25zZS5mbGFzaC5tZWRpYSwgMCwgMCwgJ3N3ZicpKSArXG4gICAgICAgICcmd2lkdGg9JyArIGVuY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5mbGFzaC53aWR0aCkgK1xuICAgICAgICAnJmhlaWdodD0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHJlc3BvbnNlLmZsYXNoLmhlaWdodCk7XG4gICAgICAkc2NvcGUuZmxhc2hVcmwgPSBXZWJCcm93c2VyLmdldEFwcFVybCh1cmwpO1xuICAgICAgV2ViQnJvd3Nlci5vcGVuKCRzY29wZS5mbGFzaFVybCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICRzY29wZS5lbnRyeSA9IG5ldyBhcHAuQ2FydEl0ZW0ocmVzcG9uc2UsIDEpO1xuXG4gICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoSXRlbUltYWdlLCB7IG1lZGlhOiAkc2NvcGUuZW50cnkuaXRlbS5pbWFnZSB9KSxcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0tcGhvdG8nKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAkc2NvcGUudHlwZSA9IHR5cGU7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNZWRpYVVybCA9IChtZWRpYSwgd2lkdGgsIGhlaWdodCwgZXh0ZW5zaW9uKSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7XG4gICRzY29wZS5mb3JtYXRQcmljZSA9IHZhbHVlID0+IHZhbHVlID8gU2hlbGxNYW5hZ2VyLmZvcm1hdFByaWNlKHZhbHVlKSA6IDA7XG5cbiAgJHNjb3BlLmFkZFRvQ2FydCA9ICgpID0+IHtcbiAgICBpZiAoQ3VzdG9tZXJNb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGVudHJ5ID0gJHNjb3BlLmVudHJ5O1xuXG4gICAgaWYgKGVudHJ5Lmhhc01vZGlmaWVycykge1xuICAgICAgQ2FydE1vZGVsLm9wZW5FZGl0b3IoZW50cnksIHRydWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIE9yZGVyTWFuYWdlci5hZGRUb0NhcnQoZW50cnkpO1xuICAgICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxHaWZ0ID0gKCkgPT4gQ2hhdE1hbmFnZXIuY2FuY2VsR2lmdCgpO1xuXG4gICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdChDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCk7XG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRTZWF0Q2hhbmdlZC5hZGQodG9rZW4gPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5naWZ0U2VhdCA9IExvY2F0aW9uTW9kZWwuZ2V0U2VhdCh0b2tlbikpO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvaXRlbWVkaXQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ0l0ZW1FZGl0Q3RybCcsXG4gIFsnJHNjb3BlJywgJ1NoZWxsTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ2FydE1vZGVsJyxcbiAgKCRzY29wZSwgU2hlbGxNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlciwgT3JkZXJNYW5hZ2VyLCBDYXJ0TW9kZWwpID0+IHtcblxuICAkc2NvcGUuZ2V0TWVkaWFVcmwgPSAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xuICAkc2NvcGUuZm9ybWF0UHJpY2UgPSB2YWx1ZSA9PiBTaGVsbE1hbmFnZXIuZm9ybWF0UHJpY2UodmFsdWUpO1xuXG4gIHZhciBjdXJyZW50SW5kZXggPSAtMTtcblxuICB2YXIgcmVmcmVzaE5hdmlnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmVudHJ5ICYmICRzY29wZS5lbnRyeS5oYXNNb2RpZmllcnMpIHtcbiAgICAgICRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkgPSAkc2NvcGUuZW50cnkubW9kaWZpZXJzLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgY3VycmVudEluZGV4IDwgJHNjb3BlLmVudHJ5Lm1vZGlmaWVycy5sZW5ndGggLSAxO1xuICAgICAgJHNjb3BlLmhhc1ByZXZpb3VzQ2F0ZWdvcnkgPSBjdXJyZW50SW5kZXggPiAwO1xuICAgICAgJHNjb3BlLmNhdGVnb3J5ID0gJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdO1xuICAgICAgJHNjb3BlLmNhbkV4aXQgPSBDYXJ0TW9kZWwuZWRpdGFibGVJdGVtTmV3O1xuICAgICAgJHNjb3BlLmNhbkRvbmUgPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIGlmIChsb2NhdGlvbi50eXBlICE9PSAnbWVudScgJiYgbG9jYXRpb24udHlwZSAhPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgJHNjb3BlLmV4aXQoKTtcbiAgICB9XG4gIH0pO1xuXG4gIENhcnRNb2RlbC5pc0NhcnRPcGVuQ2hhbmdlZC5hZGQoZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICRzY29wZS5leGl0KCk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgaW5pdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgJHNjb3BlLmVudHJ5ID0gdmFsdWU7XG4gICAgJHNjb3BlLnZpc2libGUgPSAkc2NvcGUuZW50cnkgIT0gbnVsbDtcblxuICAgIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgICByZWZyZXNoTmF2aWdhdGlvbigpO1xuICB9O1xuXG4gIGluaXQoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbSk7XG5cbiAgQ2FydE1vZGVsLmVkaXRhYmxlSXRlbUNoYW5nZWQuYWRkKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaW5pdCh2YWx1ZSk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRNb2RpZmllclRpdGxlID0gZnVuY3Rpb24obW9kaWZpZXIpIHtcbiAgICByZXR1cm4gbW9kaWZpZXIuZGF0YS50aXRsZSArIChtb2RpZmllci5kYXRhLnByaWNlID4gMCA/XG4gICAgICAnICgrJyArIFNoZWxsTWFuYWdlci5mb3JtYXRQcmljZShtb2RpZmllci5kYXRhLnByaWNlKSArICcpJyA6XG4gICAgICAnJ1xuICAgICk7XG4gIH07XG5cbiAgJHNjb3BlLmxlZnRCdXR0b25DbGljayA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHJlc3VsdCA9IChjdXJyZW50SW5kZXggPiAwKSA/ICgkc2NvcGUucHJldmlvdXNDYXRlZ29yeSgpKSA6ICRzY29wZS5leGl0KCk7XG4gIH07XG5cbiAgJHNjb3BlLmxlZnRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gKGN1cnJlbnRJbmRleCA+IDApID8gJ0JhY2snIDogJ0V4aXQnO1xuICB9O1xuXG4gICRzY29wZS5yaWdodEJ1dHRvbkNsaWNrID0gZnVuY3Rpb24oKXtcbiAgICAvL01ha2Ugc3VyZSBQaWNrIDEgbW9kaWZpZXIgY2F0ZWdvcmllcyBoYXZlIG1ldCB0aGUgc2VsZWN0aW9uIGNvbmRpdGlvbi5cbiAgICBpZigkc2NvcGUuZW50cnkubW9kaWZpZXJzW2N1cnJlbnRJbmRleF0uZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIHZhciBudW1TZWxlY3RlZCA9IDA7XG4gICAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmVudHJ5Lm1vZGlmaWVyc1tjdXJyZW50SW5kZXhdLm1vZGlmaWVycywgZnVuY3Rpb24obSkge1xuICAgICAgICBpZiAobS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgbnVtU2VsZWN0ZWQrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmKG51bVNlbGVjdGVkICE9PSAxKSB7XG4gICAgICAgIC8vVE9ETzogQWRkIG1vZGFsIHBvcHVwLiBNdXN0IG1ha2UgMSBzZWxlY3Rpb24hXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJHNjb3BlLm5leHRDYXRlZ29yeSgpIDogJHNjb3BlLmRvbmUoKTtcbiAgfTtcblxuICAkc2NvcGUucmlnaHRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gKCRzY29wZS5oYXNOZXh0Q2F0ZWdvcnkpID8gJ05leHQnIDogJ0RvbmUnO1xuICB9O1xuXG4gICRzY29wZS5wcmV2aW91c0NhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudEluZGV4LS07XG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICAkc2NvcGUubmV4dENhdGVnb3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY3VycmVudEluZGV4Kys7XG4gICAgcmVmcmVzaE5hdmlnYXRpb24oKTtcbiAgfTtcblxuICAkc2NvcGUudXBkYXRlTW9kaWZpZXJzID0gZnVuY3Rpb24oY2F0ZWdvcnksIG1vZGlmaWVyKSB7XG4gICAgbW9kaWZpZXIuaXNTZWxlY3RlZCA9ICFtb2RpZmllci5pc1NlbGVjdGVkO1xuXG4gICAgaWYgKG1vZGlmaWVyLmlzU2VsZWN0ZWQgJiYgY2F0ZWdvcnkuZGF0YS5zZWxlY3Rpb24gPT09IDEpIHtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChjYXRlZ29yeS5tb2RpZmllcnMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgbS5pc1NlbGVjdGVkID0gbSA9PT0gbW9kaWZpZXI7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmRvbmUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoQ2FydE1vZGVsLmVkaXRhYmxlSXRlbU5ldykge1xuICAgICAgT3JkZXJNYW5hZ2VyLmFkZFRvQ2FydChDYXJ0TW9kZWwuZWRpdGFibGVJdGVtKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZXhpdCgpO1xuICAgIENhcnRNb2RlbC5pc0NhcnRPcGVuID0gdHJ1ZTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgIENhcnRNb2RlbC5jbG9zZUVkaXRvcigpO1xuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tYWluYXV4LmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdNYWluQXV4Q3RybCcsIFsnJHNjb3BlJywgJ0NvbW1hbmRTdGFydHVwJywgZnVuY3Rpb24oJHNjb3BlLCBDb21tYW5kU3RhcnR1cCkge1xuICBDb21tYW5kU3RhcnR1cCgpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9tYWluc25hcC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWFpblNuYXBDdHJsJyxcbiAgWyckc2NvcGUnLCAnJHRpbWVvdXQnLCAnQXBwQ2FjaGUnLCAnQ3VzdG9tZXJNYW5hZ2VyJywgJ0FjdGl2aXR5TW9uaXRvcicsICdDaGF0TWFuYWdlcicsICdTaGVsbE1hbmFnZXInLCAnRGF0YU1hbmFnZXInLCAnRGlhbG9nTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnTG9jYXRpb25Nb2RlbCcsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTb2Z0d2FyZU1hbmFnZXInLCAnU05BUENvbmZpZycsICdDb21tYW5kU3RhcnR1cCcsXG4gICgkc2NvcGUsICR0aW1lb3V0LCBBcHBDYWNoZSwgQ3VzdG9tZXJNYW5hZ2VyLCBBY3Rpdml0eU1vbml0b3IsIENoYXRNYW5hZ2VyLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEaWFsb2dNYW5hZ2VyLCBPcmRlck1hbmFnZXIsIExvY2F0aW9uTW9kZWwsIE5hdmlnYXRpb25NYW5hZ2VyLCBTb2Z0d2FyZU1hbmFnZXIsIFNOQVBDb25maWcsIENvbW1hbmRTdGFydHVwKSA9PiB7XG5cbiAgQ29tbWFuZFN0YXJ0dXAoKTtcblxuICAkc2NvcGUudG91Y2ggPSAoKSA9PiBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlclJlcXVlc3RDaGFuZ2VkLmFkZChpdGVtID0+IHtcbiAgICBpZiAoIWl0ZW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaXRlbS5wcm9taXNlLnRoZW4oKCkgPT4gRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX09SREVSX1JFQ0VJVkVEKSk7XG4gIH0pO1xuXG4gIE9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdENoYW5nZWQuYWRkKGl0ZW0gPT4ge1xuICAgIGlmICghaXRlbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpdGVtLnByb21pc2UudGhlbigoKSA9PiBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfQVNTSVNUQU5DRV9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBPcmRlck1hbmFnZXIubW9kZWwuY2xvc2VvdXRSZXF1ZXN0Q2hhbmdlZC5hZGQoaXRlbSA9PiB7XG4gICAgaWYgKCFpdGVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGl0ZW0ucHJvbWlzZS50aGVuKCgpID0+IERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9DTE9TRU9VVF9SRUNFSVZFRCkpO1xuICB9KTtcblxuICBDaGF0TWFuYWdlci5tb2RlbC5jaGF0UmVxdWVzdFJlY2VpdmVkLmFkZCh0b2tlbiA9PiB7XG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUodG9rZW4pICsgJyB3b3VsZCBsaWtlIHRvIGNoYXQgd2l0aCB5b3UuJykudGhlbigoKSA9PiB7XG4gICAgICBDaGF0TWFuYWdlci5hcHByb3ZlRGV2aWNlKHRva2VuKTtcbiAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICB9LCAoKSA9PiBDaGF0TWFuYWdlci5kZWNsaW5lRGV2aWNlKHRva2VuKSk7XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRSZXF1ZXN0UmVjZWl2ZWQuYWRkKCh0b2tlbiwgZGVzY3JpcHRpb24pID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZSh0b2tlbikgKyAnIHdvdWxkIGxpa2UgdG8gZ2lmdCB5b3UgYSAnICsgZGVzY3JpcHRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgQ2hhdE1hbmFnZXIuYWNjZXB0R2lmdCh0b2tlbik7XG4gICAgfSwgKCkgPT4gQ2hhdE1hbmFnZXIuZGVjbGluZUdpZnQodG9rZW4pKTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwubWVzc2FnZVJlY2VpdmVkLmFkZChtZXNzYWdlID0+IHtcbiAgICB2YXIgZGV2aWNlID0gTG9jYXRpb25Nb2RlbC5nZXREZXZpY2UobWVzc2FnZS5kZXZpY2UpO1xuXG4gICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5zdGF0dXMgPT09IENoYXRNYW5hZ2VyLk1FU1NBR0VfU1RBVFVTRVMuQ0hBVF9SRVFVRVNUX0RFQ0xJTkVEKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KCdDaGF0IHdpdGggJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgd2FzIGRlY2xpbmVkLiAnICtcbiAgICAgICdUbyBzdG9wIHJlY2lldmluZyBjaGF0IHJlcXVlc3RzLCBvcGVuIHRoZSBjaGF0IHNjcmVlbiBhbmQgdG91Y2ggdGhlIFwiQ2hhdCBvbi9vZmZcIiBidXR0b24uJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkNIQVRfUkVRVUVTVF9BQ0NFUFRFRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydCgnWW91ciBjaGF0IHJlcXVlc3QgdG8gJyArIENoYXRNYW5hZ2VyLmdldERldmljZU5hbWUoZGV2aWNlLnRva2VuKSArICcgd2FzIGFjY2VwdGVkLicpO1xuICAgIH1cbiAgICBlbHNlIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5HSUZUX1JFUVVFU1RfQUNDRVBURUQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgYWNjZXB0ZWQgeW91ciBnaWZ0LiBUaGUgaXRlbSB3aWxsIGJlIGFkZGVkIHRvIHlvdXIgY2hlY2suJyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1lc3NhZ2Uuc3RhdHVzID09PSBDaGF0TWFuYWdlci5NRVNTQUdFX1NUQVRVU0VTLkdJRlRfUkVRVUVTVF9ERUNMSU5FRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChDaGF0TWFuYWdlci5nZXREZXZpY2VOYW1lKGRldmljZS50b2tlbikgKyAnIGhhcyBkZWNsaW5lZCB5b3VyIGdpZnQuIFRoZSBpdGVtIHdpbGwgTk9UIGJlIGFkZGVkIHRvIHlvdXIgY2hlY2suJyk7XG4gICAgfVxuXG4gICAgaWYgKE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLnR5cGUgPT09ICdjaGF0Jykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLnN0YXR1cyA9PT0gQ2hhdE1hbmFnZXIuTUVTU0FHRV9TVEFUVVNFUy5DSEFUX0NMT1NFRCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5ub3RpZmljYXRpb24oQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pICsgJyBoYXMgY2xvc2VkIHRoZSBjaGF0Jyk7XG4gICAgfVxuICAgIGVsc2UgaWYoIW1lc3NhZ2Uuc3RhdHVzICYmIG1lc3NhZ2UudG9fZGV2aWNlKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLm5vdGlmaWNhdGlvbignTmV3IG1lc3NhZ2UgZnJvbSAnICsgQ2hhdE1hbmFnZXIuZ2V0RGV2aWNlTmFtZShkZXZpY2UudG9rZW4pKTtcbiAgICB9XG4gIH0pO1xuXG4gIENoYXRNYW5hZ2VyLm1vZGVsLmdpZnRSZWFkeS5hZGQoKCkgPT4ge1xuICAgIENoYXRNYW5hZ2VyLnNlbmRHaWZ0KE9yZGVyTWFuYWdlci5tb2RlbC5vcmRlckNhcnQpO1xuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgfSk7XG5cbiAgQ2hhdE1hbmFnZXIubW9kZWwuZ2lmdEFjY2VwdGVkLmFkZChzdGF0dXMgPT4ge1xuICAgIGlmICghc3RhdHVzIHx8ICFDaGF0TWFuYWdlci5tb2RlbC5naWZ0RGV2aWNlKSB7XG4gICAgICBDaGF0TWFuYWdlci5tb2RlbC5naWZ0U2VhdCA9IG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnN1Ym1pdENhcnQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdjaGF0JyB9O1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcblxuICAgICAgICBDaGF0TWFuYWdlci5lbmRHaWZ0KCk7XG4gICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnY2hhdCcgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL21lbnUuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01lbnVCYXNlQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RhdGFNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgKCRzY29wZSwgJHRpbWVvdXQsIERhdGFNYW5hZ2VyLCBOYXZpZ2F0aW9uTWFuYWdlcikgPT4ge1xufV0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTWVudUN0cmwnLFxuICBbJyRzY29wZScsICckdGltZW91dCcsICdEYXRhTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdTaGVsbE1hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGF0YU1hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICB2YXIgTWVudUxpc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aWxlQ2xhc3NOYW1lID0gU2hlbGxNYW5hZ2VyLnRpbGVTdHlsZTtcbiAgICAgIHZhciByb3dzID0gdGhpcy5wcm9wcy50aWxlcy5tYXAoZnVuY3Rpb24odGlsZSwgaSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIFJlYWN0LkRPTS50ZCh7XG4gICAgICAgICAgICBjbGFzc05hbWU6IHRpbGVDbGFzc05hbWUsXG4gICAgICAgICAgICBrZXk6IGlcbiAgICAgICAgICB9LCBSZWFjdC5ET00uYSh7XG4gICAgICAgICAgICBvbkNsaWNrOiBlID0+IHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHRpbGUuZGVzdGluYXRpb247XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwodGlsZS5pbWFnZSwgMzcwLCAzNzApICsgJyknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAgIFJlYWN0LkRPTS5zcGFuKG51bGwsIHRpbGUudGl0bGUpXG4gICAgICAgICAgKSlcbiAgICAgICAgKTtcbiAgICAgIH0pLnJlZHVjZShmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBpKSB7XG4gICAgICAgIHJlc3VsdFtpICUgMl0ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCBbW10sIFtdXSlcbiAgICAgIC5tYXAoZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICAgIHJldHVybiBSZWFjdC5ET00udHIoeyBrZXk6IGkgfSwgcm93KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gUmVhY3QuRE9NLnRhYmxlKHsgY2xhc3NOYW1lOiAndGlsZS10YWJsZScgfSwgcm93cyk7XG4gICAgfVxuICB9KTtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5naW5nLmFkZChmdW5jdGlvbihsb2NhdGlvbikge1xuICAgIERhdGFNYW5hZ2VyLm1lbnUgPSBsb2NhdGlvbi50eXBlID09PSAnbWVudScgPyBsb2NhdGlvbi50b2tlbiA6IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudmlzaWJsZSA9IEJvb2xlYW4oRGF0YU1hbmFnZXIubWVudSk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7ICRzY29wZS4kYXBwbHkoKTsgfSk7XG4gIH0pO1xuXG4gIERhdGFNYW5hZ2VyLm1lbnVDaGFuZ2VkLmFkZChmdW5jdGlvbihtZW51KSB7XG4gICAgaWYgKCFtZW51KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbWVudS5jYXRlZ29yaWVzLmZvckVhY2godGlsZSA9PiB7XG4gICAgICB0aWxlLnVybCA9ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgodGlsZS5kZXN0aW5hdGlvbik7XG4gICAgfSk7XG5cbiAgICBSZWFjdC5yZW5kZXIoXG4gICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KE1lbnVMaXN0LCB7IHRpbGVzOiBtZW51LmNhdGVnb3JpZXMgfSksXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudC1tZW51JylcbiAgICApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvbW9kYWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ01vZGFsQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLFxuICAoJHNjb3BlLCAkdGltZW91dCwgRGlhbG9nTWFuYWdlcikgPT4ge1xuXG4gICAgRGlhbG9nTWFuYWdlci5tb2RhbFN0YXJ0ZWQuYWRkKCgpID0+ICR0aW1lb3V0KCgpID0+ICRzY29wZS52aXNpYmxlID0gdHJ1ZSkpO1xuICAgIERpYWxvZ01hbmFnZXIubW9kYWxFbmRlZC5hZGQoKCkgPT4gJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnZpc2libGUgPSBmYWxzZSkpO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9uYXZpZ2F0aW9uLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmNvbnRyb2xsZXJzJylcbi5jb250cm9sbGVyKCdOYXZpZ2F0aW9uQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdDdXN0b21lck1hbmFnZXInLCAnQW5hbHl0aWNzTW9kZWwnLCAnQ2FydE1vZGVsJywgJ1NoZWxsTWFuYWdlcicsICdEYXRhTWFuYWdlcicsICdEYXRhUHJvdmlkZXInLCAnRGlhbG9nTWFuYWdlcicsICdOYXZpZ2F0aW9uTWFuYWdlcicsICdPcmRlck1hbmFnZXInLCAnQ29tbWFuZFJlc2V0JywgJ0NvbW1hbmRGbGlwU2NyZWVuJywgJ1dlYkJyb3dzZXInLCAnU05BUEVudmlyb25tZW50JyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgQ3VzdG9tZXJNYW5hZ2VyLCBBbmFseXRpY3NNb2RlbCwgQ2FydE1vZGVsLCBTaGVsbE1hbmFnZXIsIERhdGFNYW5hZ2VyLCBEYXRhUHJvdmlkZXIsIERpYWxvZ01hbmFnZXIsIE5hdmlnYXRpb25NYW5hZ2VyLCBPcmRlck1hbmFnZXIsIENvbW1hbmRSZXNldCwgQ29tbWFuZEZsaXBTY3JlZW4sIFdlYkJyb3dzZXIsIFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuXG4gICRzY29wZS5tZW51cyA9IFtdO1xuXG4gIERhdGFQcm92aWRlci5ob21lKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBsb2NhdGlvbiA9IE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uLFxuICAgICAgICBsaW1pdCA9IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnID8gNCA6IDM7XG5cbiAgICAkc2NvcGUubWVudXMgPSByZXNwb25zZS5tZW51c1xuICAgICAgLmZpbHRlcihtZW51ID0+IFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnIHx8IG1lbnUudHlwZSAhPT0gMylcbiAgICAgIC5maWx0ZXIoKG1lbnUsIGkpID0+IGkgPCBsaW1pdClcbiAgICAgIC5tYXAobWVudSA9PiB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHtcbiAgICAgICAgICB0eXBlOiAnbWVudScsXG4gICAgICAgICAgdG9rZW46IG1lbnUudG9rZW5cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0b2tlbjogbWVudS50b2tlbixcbiAgICAgICAgICB0aXRsZTogbWVudS50aXRsZSxcbiAgICAgICAgICB1cmw6ICcjJyArIE5hdmlnYXRpb25NYW5hZ2VyLmdldFBhdGgoZGVzdGluYXRpb24pLFxuICAgICAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcbiAgICAgICAgICBzZWxlY3RlZDogbG9jYXRpb24udHlwZSA9PT0gJ21lbnUnICYmIG1lbnUudG9rZW4gPT09IGxvY2F0aW9uLnRva2VuXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlSG9tZSA9ICgpID0+IHtcbiAgICBBY3Rpdml0eU1vbml0b3IuYWN0aXZpdHlEZXRlY3RlZCgpO1xuXG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuY29uZmlybShBTEVSVF9UQUJMRV9SRVNFVCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcbiAgICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICAkc2NvcGUubmF2aWdhdGVCYWNrID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG5cbiAgICBpZiAoQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCAmJiAhQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzQXV0aGVudGljYXRlZCkge1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9TSUdOSU5fUkVRVUlSRUQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE5hdmlnYXRpb25NYW5hZ2VyLmdvQmFjaygpO1xuXG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSBmYWxzZTtcbiAgfTtcblxuICAkc2NvcGUucm90YXRlU2NyZWVuID0gKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgQ29tbWFuZEZsaXBTY3JlZW4oKTtcbiAgfTtcblxuICAkc2NvcGUub3BlbkNhcnQgPSAoKSA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmFjdGl2aXR5RGV0ZWN0ZWQoKTtcblxuICAgIGlmIChDdXN0b21lck1hbmFnZXIubW9kZWwuaXNFbmFibGVkICYmICFDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1NJR05JTl9SRVFVSVJFRCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgQ2FydE1vZGVsLmlzQ2FydE9wZW4gPSAhQ2FydE1vZGVsLmlzQ2FydE9wZW47XG4gIH07XG5cbiAgJHNjb3BlLm9wZW5TZXR0aW5ncyA9ICgpID0+IHtcbiAgICBEaWFsb2dNYW5hZ2VyLmNvbmZpcm0oQUxFUlRfVEFCTEVfUkVTRVQpLnRoZW4oKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuICAgICAgQ29tbWFuZFJlc2V0KCk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLm1lbnVPcGVuID0gZmFsc2U7XG5cbiAgJHNjb3BlLnRvZ2dsZU1lbnUgPSAoKSA9PiB7XG4gICAgJHNjb3BlLm1lbnVPcGVuID0gISRzY29wZS5tZW51T3BlbjtcbiAgfTtcblxuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudENsaWNrID0gaXRlbSA9PiB7XG4gICAgaWYgKEN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgIUN1c3RvbWVyTWFuYWdlci5tb2RlbC5pc0F1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfU0lHTklOX1JFUVVJUkVEKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgIHRva2VuOiBpdGVtLnRva2VuLFxuICAgICAgdHlwZTogJ2NsaWNrJ1xuICAgIH0pO1xuXG4gICAgaWYgKGl0ZW0uaHJlZikge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICd1cmwnLCB1cmw6IGl0ZW0uaHJlZi51cmwgfTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRJbXByZXNzaW9uID0gaXRlbSA9PiB7XG4gICAgaWYgKEFjdGl2aXR5TW9uaXRvci5hY3RpdmUgJiYgISRzY29wZS53aWRlKSB7XG4gICAgICBBbmFseXRpY3NNb2RlbC5sb2dBZHZlcnRpc2VtZW50KHtcbiAgICAgICAgdG9rZW46IGl0ZW0udG9rZW4sXG4gICAgICAgIHR5cGU6ICdpbXByZXNzaW9uJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5lbGVtZW50cyA9IFNoZWxsTWFuYWdlci5tb2RlbC5lbGVtZW50cztcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLmVsZW1lbnRzQ2hhbmdlZC5hZGQodmFsdWUgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5lbGVtZW50cyA9IHZhbHVlKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmFkdmVydGlzZW1lbnRzQWxsID0gW107XG4gICRzY29wZS5hZHZlcnRpc2VtZW50c1RvcCA9IFtdO1xuICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNCb3R0b20gPSBbXTtcbiAgdmFyIG1hcEFkdmVydGlzZW1lbnQgPSBhZCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNyYzogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKGFkLnNyYywgOTcwLCA5MCksXG4gICAgICBocmVmOiBhZC5ocmVmLFxuICAgICAgdHlwZTogU2hlbGxNYW5hZ2VyLmdldE1lZGlhVHlwZShhZC5zcmMpLFxuICAgICAgdG9rZW46IGFkLnRva2VuXG4gICAgfTtcbiAgfTtcbiAgRGF0YVByb3ZpZGVyLmFkdmVydGlzZW1lbnRzKCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLmFkdmVydGlzZW1lbnRzVG9wID0gcmVzcG9uc2UudG9wLm1hcChtYXBBZHZlcnRpc2VtZW50KTtcbiAgICAgICRzY29wZS5hZHZlcnRpc2VtZW50c0JvdHRvbSA9IHJlc3BvbnNlLmJvdHRvbS5tYXAobWFwQWR2ZXJ0aXNlbWVudCk7XG4gICAgICAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNBbGwgPSAkc2NvcGUuYWR2ZXJ0aXNlbWVudHNUb3AuY29uY2F0KCRzY29wZS5hZHZlcnRpc2VtZW50c0JvdHRvbSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gICRzY29wZS5jYXJ0Q291bnQgPSBPcmRlck1hbmFnZXIubW9kZWwub3JkZXJDYXJ0Lmxlbmd0aDtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLm9yZGVyQ2FydENoYW5nZWQuYWRkKGNhcnQgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jYXJ0Q291bnQgPSBjYXJ0Lmxlbmd0aCk7XG4gIH0pO1xuXG4gICRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZSA9ICgpID0+IHtcbiAgICBpZiAoISRzY29wZS5yZXF1ZXN0QXNzaXN0YW5jZUF2YWlsYWJsZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgRGlhbG9nTWFuYWdlci5jb25maXJtKEFMRVJUX1RBQkxFX0FTU0lTVEFOQ0UpLnRoZW4oKCkgPT4ge1xuICAgICAgdmFyIGpvYiA9IERpYWxvZ01hbmFnZXIuc3RhcnRKb2IoKTtcblxuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCkudGhlbigoKSA9PiB7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9BU1NJU1RBTkNFX1NFTlQpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHZhciByZWZyZXNoQXNzaXN0YW5jZVJlcXVlc3QgPSAoKSA9PiB7XG4gICAgJHNjb3BlLnJlcXVlc3RBc3Npc3RhbmNlQXZhaWxhYmxlID0gIUJvb2xlYW4oT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgfTtcbiAgT3JkZXJNYW5hZ2VyLm1vZGVsLmFzc2lzdGFuY2VSZXF1ZXN0Q2hhbmdlZC5hZGQocmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KTtcbiAgcmVmcmVzaEFzc2lzdGFuY2VSZXF1ZXN0KCk7XG5cbiAgJHNjb3BlLmN1c3RvbWVyTmFtZSA9IEN1c3RvbWVyTWFuYWdlci5jdXN0b21lck5hbWU7XG4gIEN1c3RvbWVyTWFuYWdlci5tb2RlbC5wcm9maWxlQ2hhbmdlZC5hZGQoKCkgPT4ge1xuICAgICR0aW1lb3V0KCgpID0+ICRzY29wZS5jdXN0b21lck5hbWUgPSBDdXN0b21lck1hbmFnZXIuY3VzdG9tZXJOYW1lKTtcbiAgfSk7XG5cbiAgJHNjb3BlLm5hdmlnYXRlID0gZGVzdGluYXRpb24gPT4gTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSBkZXN0aW5hdGlvbjtcblxuICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbkNoYW5nZWQuYWRkKGxvY2F0aW9uID0+IHtcbiAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAkc2NvcGUubWVudXMuZm9yRWFjaChtZW51ID0+IHtcbiAgICAgICAgLy9tZW51LnNlbGVjdGVkID0gKGxvY2F0aW9uLnR5cGUgPT09ICdtZW51JyAmJiBtZW51LnRva2VuID09PSBsb2NhdGlvbi50b2tlbik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL25vdGlmaWNhdGlvbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignTm90aWZpY2F0aW9uQ3RybCcsIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0RpYWxvZ01hbmFnZXInLCBmdW5jdGlvbigkc2NvcGUsICR0aW1lb3V0LCBEaWFsb2dNYW5hZ2VyKSB7XG4gIHZhciB0aW1lcjtcblxuICAkc2NvcGUubWVzc2FnZXMgPSBbXTtcblxuICBmdW5jdGlvbiB1cGRhdGVWaXNpYmlsaXR5KGlzVmlzaWJsZSkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnZpc2libGUgPSBpc1Zpc2libGU7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlTmV4dCgpIHtcbiAgICB2YXIgbWVzc2FnZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgJHNjb3BlLm1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtZXNzYWdlcy5wdXNoKCRzY29wZS5tZXNzYWdlc1tpXSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLm1lc3NhZ2VzID0gbWVzc2FnZXM7XG5cbiAgICBpZiAoJHNjb3BlLm1lc3NhZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdXBkYXRlVmlzaWJpbGl0eShmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGltZXIgPSAkdGltZW91dChoaWRlTmV4dCwgNDAwMCk7XG4gIH1cblxuICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuXG4gIERpYWxvZ01hbmFnZXIubm90aWZpY2F0aW9uUmVxdWVzdGVkLmFkZChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZXMucHVzaCh7IHRleHQ6IG1lc3NhZ2UgfSk7XG4gICAgfSk7XG5cbiAgICB1cGRhdGVWaXNpYmlsaXR5KHRydWUpO1xuXG4gICAgaWYgKHRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgIH1cblxuICAgIHRpbWVyID0gJHRpbWVvdXQoaGlkZU5leHQsIDQwMDApO1xuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvY29udHJvbGxlcnMvc2NyZWVuc2F2ZXIuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1NjcmVlbnNhdmVyQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsICdBY3Rpdml0eU1vbml0b3InLCAnRGF0YVByb3ZpZGVyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIFNoZWxsTWFuYWdlciwgQWN0aXZpdHlNb25pdG9yLCBEYXRhUHJvdmlkZXIpID0+IHtcbiAgICBcbiAgJHNjb3BlLnZpc2libGUgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBzaG93SW1hZ2VzKHZhbHVlcykge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLmltYWdlcyA9IHZhbHVlcy5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3JjOiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaXRlbS5tZWRpYSwgMTkyMCwgMTA4MCwgJ2pwZycpLFxuICAgICAgICAgIHR5cGU6IFNoZWxsTWFuYWdlci5nZXRNZWRpYVR5cGUoaXRlbS5tZWRpYSlcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2hvd0ltYWdlcyhTaGVsbE1hbmFnZXIubW9kZWwuc2NyZWVuc2F2ZXJzKTtcbiAgU2hlbGxNYW5hZ2VyLm1vZGVsLnNjcmVlbnNhdmVyc0NoYW5nZWQuYWRkKHNob3dJbWFnZXMpO1xuXG4gIEFjdGl2aXR5TW9uaXRvci5hY3RpdmVDaGFuZ2VkLmFkZCh2YWx1ZSA9PiB7XG4gICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgJHNjb3BlLnZpc2libGUgPSB2YWx1ZSA9PT0gZmFsc2UgJiYgKCRzY29wZS5pbWFnZXMgJiYgJHNjb3BlLmltYWdlcy5sZW5ndGggPiAwKTtcbiAgICB9KTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3NpZ25pbi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignU2lnbkluQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0N1c3RvbWVyTWFuYWdlcicsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1Nlc3Npb25NYW5hZ2VyJywgJ1NvY2lhbE1hbmFnZXInLCAnU05BUENvbmZpZycsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEN1c3RvbWVyTWFuYWdlciwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIFNlc3Npb25NYW5hZ2VyLCBTb2NpYWxNYW5hZ2VyLCBTTkFQQ29uZmlnLCBXZWJCcm93c2VyKSA9PiB7XG5cbiAgdmFyIFNURVBfU1BMQVNIID0gMSxcbiAgICAgIFNURVBfTE9HSU4gPSAyLFxuICAgICAgU1RFUF9SRUdJU1RSQVRJT04gPSAzLFxuICAgICAgU1RFUF9HVUVTVFMgPSA0LFxuICAgICAgU1RFUF9FVkVOVCA9IDUsXG4gICAgICBTVEVQX1JFU0VUID0gNjtcblxuICAkc2NvcGUuU1RFUF9TUExBU0ggPSBTVEVQX1NQTEFTSDtcbiAgJHNjb3BlLlNURVBfTE9HSU4gPSBTVEVQX0xPR0lOO1xuICAkc2NvcGUuU1RFUF9SRUdJU1RSQVRJT04gPSBTVEVQX1JFR0lTVFJBVElPTjtcbiAgJHNjb3BlLlNURVBfR1VFU1RTID0gU1RFUF9HVUVTVFM7XG4gICRzY29wZS5TVEVQX0VWRU5UID0gU1RFUF9FVkVOVDtcbiAgJHNjb3BlLlNURVBfUkVTRVQgPSBTVEVQX1JFU0VUO1xuXG4gICRzY29wZS5sb2NhdGlvbk5hbWUgPSBTTkFQQ29uZmlnLmxvY2F0aW9uX25hbWU7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFB1YmxpYyBtZXRob2RzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBMb2dpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmxvZ2luID0gKCkgPT4ge1xuICAgICRzY29wZS5jcmVkZW50aWFscyA9IHt9O1xuICAgICRzY29wZS5zdGVwID0gU1RFUF9MT0dJTjtcbiAgfTtcblxuICAkc2NvcGUuZ3Vlc3RMb2dpbiA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLmd1ZXN0TG9naW4oKS50aGVuKCgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUuc3RlcCA9IFNURVBfR1VFU1RTKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9SRVFVRVNUX1NVQk1JVF9FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmRvTG9naW4gPSAoY3JlZGVudGlhbHMpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKGNyZWRlbnRpYWxzIHx8ICRzY29wZS5jcmVkZW50aWFscykudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfR0VORVJJQ19FUlJPUik7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBTb2NpYWwgbG9naW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5sb2dpbkZhY2Vib29rID0gKCkgPT4ge1xuICAgIHNvY2lhbEJ1c3koKTtcbiAgICBTb2NpYWxNYW5hZ2VyLmxvZ2luRmFjZWJvb2soKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luVHdpdHRlciA9ICgpID0+IHtcbiAgICBzb2NpYWxCdXN5KCk7XG4gICAgU29jaWFsTWFuYWdlci5sb2dpblR3aXR0ZXIoKS50aGVuKHNvY2lhbExvZ2luLCBzb2NpYWxFcnJvcik7XG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luR29vZ2xlID0gKCkgPT4ge1xuICAgIHNvY2lhbEJ1c3koKTtcbiAgICBTb2NpYWxNYW5hZ2VyLmxvZ2luR29vZ2xlUGx1cygpLnRoZW4oc29jaWFsTG9naW4sIHNvY2lhbEVycm9yKTtcbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFJlZ2lzdHJhdGlvblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnJlZ2lzdGVyID0gKCkgPT4ge1xuICAgICRzY29wZS5yZWdpc3RyYXRpb24gPSB7fTtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfUkVHSVNUUkFUSU9OO1xuICB9O1xuXG4gICRzY29wZS5kb1JlZ2lzdHJhdGlvbiA9ICgpID0+IHtcbiAgICB2YXIgam9iID0gRGlhbG9nTWFuYWdlci5zdGFydEpvYigpO1xuXG4gICAgJHNjb3BlLnJlZ2lzdHJhdGlvbi51c2VybmFtZSA9ICRzY29wZS5yZWdpc3RyYXRpb24uZW1haWw7XG5cbiAgICBDdXN0b21lck1hbmFnZXIuc2lnblVwKCRzY29wZS5yZWdpc3RyYXRpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAkc2NvcGUuZG9Mb2dpbih7XG4gICAgICAgICAgbG9naW46ICRzY29wZS5yZWdpc3RyYXRpb24udXNlcm5hbWUsXG4gICAgICAgICAgcGFzc3dvcmQ6ICRzY29wZS5yZWdpc3RyYXRpb24ucGFzc3dvcmRcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUkVRVUVTVF9TVUJNSVRfRVJST1IpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgR3Vlc3QgY291bnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5zZXNzaW9uID0ge1xuICAgIGd1ZXN0Q291bnQ6IDEsXG4gICAgc3BlY2lhbDogZmFsc2VcbiAgfTtcblxuICAkc2NvcGUuc3VibWl0R3Vlc3RDb3VudCA9ICgpID0+IHtcbiAgICBpZiAoJHNjb3BlLnNlc3Npb24uZ3Vlc3RDb3VudCA+IDEpIHtcbiAgICAgIFNlc3Npb25NYW5hZ2VyLmd1ZXN0Q291bnQgPSAkc2NvcGUuc2Vzc2lvbi5ndWVzdENvdW50O1xuICAgICAgJHNjb3BlLnN0ZXAgPSBTVEVQX0VWRU5UO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVuZFNpZ25JbigpO1xuICAgIH1cbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIEV2ZW50XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUuc3VibWl0U3BlY2lhbEV2ZW50ID0gKHZhbHVlKSA9PiB7XG4gICAgJHNjb3BlLnNlc3Npb24uc3BlY2lhbCA9IFNlc3Npb25NYW5hZ2VyLnNwZWNpYWxFdmVudCA9IEJvb2xlYW4odmFsdWUpO1xuICAgIGVuZFNpZ25JbigpO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgUmVzZXQgcGFzc3dvcmRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5yZXNldFBhc3N3b3JkID0gKCkgPT4ge1xuICAgICRzY29wZS5wYXNzd29yZHJlc2V0ID0ge307XG4gICAgJHNjb3BlLnN0ZXAgPSBTVEVQX1JFU0VUO1xuICB9O1xuXG4gICRzY29wZS5wYXNzd29yZFJlc2V0U3VibWl0ID0gKCkgPT4ge1xuICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG5cbiAgICBDdXN0b21lck1hbmFnZXIucmVzZXRQYXNzd29yZCgkc2NvcGUucGFzc3dvcmRyZXNldCkudGhlbigoKSA9PiB7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgJHNjb3BlLnBhc3N3b3JkUmVzZXQgPSBmYWxzZTtcbiAgICAgIERpYWxvZ01hbmFnZXIuYWxlcnQoQUxFUlRfUEFTU1dPUkRfUkVTRVRfQ09NUExFVEUpO1xuICAgIH0sICgpID0+IHtcbiAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX1JFUVVFU1RfU1VCTUlUX0VSUk9SKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUucGFzc3dvcmRSZXNldENhbmNlbCA9ICgpID0+IHtcbiAgICAkc2NvcGUuc3RlcCA9IFNURVBfU1BMQVNIO1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcml2YXRlIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBmdW5jdGlvbiBzb2NpYWxMb2dpbihhdXRoKSB7XG4gICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luU29jaWFsKGF1dGgpLnRoZW4oKCkgPT4ge1xuICAgICAgc29jaWFsQnVzeUVuZCgpO1xuICAgICAgJHRpbWVvdXQoKCkgPT4gJHNjb3BlLnN0ZXAgPSBTVEVQX0dVRVNUUyk7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgc29jaWFsQnVzeUVuZCgpO1xuICAgICAgRGlhbG9nTWFuYWdlci5hbGVydChBTEVSVF9HRU5FUklDX0VSUk9SKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNvY2lhbEVycm9yKCkge1xuICAgIHNvY2lhbEJ1c3lFbmQoKTtcbiAgICBEaWFsb2dNYW5hZ2VyLmFsZXJ0KEFMRVJUX0dFTkVSSUNfRVJST1IpO1xuICB9XG5cbiAgdmFyIHNvY2lhbEpvYiwgc29jaWFsVGltZXI7XG5cbiAgZnVuY3Rpb24gc29jaWFsQnVzeSgpIHtcbiAgICBzb2NpYWxCdXN5RW5kKCk7XG5cbiAgICBzb2NpYWxKb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgc29jaWFsVGltZXIgPSAkdGltZW91dChzb2NpYWxCdXN5RW5kLCAxMjAgKiAxMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNvY2lhbEJ1c3lFbmQoKSB7XG4gICAgaWYgKHNvY2lhbEpvYikge1xuICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioc29jaWFsSm9iKTtcbiAgICAgIHNvY2lhbEpvYiA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHNvY2lhbFRpbWVyKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwoc29jaWFsVGltZXIpO1xuICAgICAgc29jaWFsVGltZXIgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuZFNpZ25JbigpIHtcbiAgICBOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbiA9IHsgdHlwZTogJ2hvbWUnIH07XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgU3RhcnR1cFxuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIGlmICghQ3VzdG9tZXJNYW5hZ2VyLm1vZGVsLmlzRW5hYmxlZCB8fCBDdXN0b21lck1hbmFnZXIubW9kZWwuaXNBdXRoZW50aWNhdGVkKSB7XG4gICAgcmV0dXJuIGVuZFNpZ25JbigpO1xuICB9XG5cbiAgJHNjb3BlLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgJHNjb3BlLnN0ZXAgPSBTVEVQX1NQTEFTSDtcblxuICB2YXIgbW9kYWwgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0TW9kYWwoKTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICBXZWJCcm93c2VyLmNsb3NlKCk7XG4gICAgRGlhbG9nTWFuYWdlci5lbmRNb2RhbChtb2RhbCk7XG4gIH0pO1xufV0pO1xuXG4vL3NyYy9qcy9jb250cm9sbGVycy9zdXJ2ZXkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuY29udHJvbGxlcnMnKVxuLmNvbnRyb2xsZXIoJ1N1cnZleUN0cmwnLCBbJyRzY29wZScsICckdGltZW91dCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1hbmFnZXInLCAnQ3VzdG9tZXJNb2RlbCcsICdEaWFsb2dNYW5hZ2VyJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ09yZGVyTWFuYWdlcicsICdTdXJ2ZXlNYW5hZ2VyJywgZnVuY3Rpb24oJHNjb3BlLCAkdGltZW91dCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTWFuYWdlciwgQ3VzdG9tZXJNb2RlbCwgRGlhbG9nTWFuYWdlciwgTmF2aWdhdGlvbk1hbmFnZXIsIE9yZGVyTWFuYWdlciwgU3VydmV5TWFuYWdlcikge1xuXG4gIGlmICghU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgfHwgIVN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkgfHwgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleUNvbXBsZXRlKSB7XG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBQcm9wZXJ0aWVzXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLmNvbW1lbnQgPSAnJztcbiAgJHNjb3BlLmVtYWlsID0gJyc7XG4gICRzY29wZS5oYWRfcHJvYmxlbXMgPSBmYWxzZTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vICAgIFBhZ2VzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucGFnZXMgPSBbXTtcbiAgdmFyIHBhZ2VzID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VzJyk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAgICBJbmRleFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgJHNjb3BlLnBhZ2VJbmRleCA9IC0xO1xuICB2YXIgcGFnZUluZGV4ID0gJHNjb3BlLiR3YXRjaEFzUHJvcGVydHkoJ3BhZ2VJbmRleCcpO1xuICBwYWdlSW5kZXguY2hhbmdlcygpXG4gICAgLnN1YnNjcmliZShmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wYWdlID0gJHNjb3BlLnBhZ2VJbmRleCA+IC0xID8gJHNjb3BlLnBhZ2VzWyRzY29wZS5wYWdlSW5kZXhdIDogeyBxdWVzdGlvbnM6IFtdIH07XG5cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUucGFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJCgnI3JhdGUtJyArIGl0ZW0udG9rZW4pLnJhdGVpdCh7XG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICBtYXg6IDUsXG4gICAgICAgICAgICBzdGVwOiAxLFxuICAgICAgICAgICAgcmVzZXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tpbmdmbGQ6ICcjcmFuZ2UtJyArIGl0ZW0udG9rZW5cbiAgICAgICAgICB9KS5iaW5kKCdyYXRlZCcsIGZ1bmN0aW9uKGV2ZW50LCB2YWx1ZSkge1xuICAgICAgICAgICAgaXRlbS5mZWVkYmFjayA9IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gICAgQ291bnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICRzY29wZS5wYWdlQ291bnQgPSAwO1xuICBwYWdlcy5jaGFuZ2VzKClcbiAgICAuc3Vic2NyaWJlKGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnBhZ2VDb3VudCA9ICRzY29wZS5wYWdlcy5sZW5ndGg7XG4gICAgfSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy9cbiAgLy8gIFByaXZhdGUgbWV0aG9kc1xuICAvL1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciBnZW5lcmF0ZVBhc3N3b3JkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aCA9IDgsXG4gICAgICAgIGNoYXJzZXQgPSAnYWJjZGVmZ2hrbnBxcnN0dXZ3eHl6QUJDREVGR0hLTU5QUVJTVFVWV1hZWjIzNDU2Nzg5JyxcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGFyc2V0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gY2hhcnNldC5jaGFyQXQoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBzdWJtaXRGZWVkYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wYWdlcy5yZWR1Y2UoKGFuc3dlcnMsIHBhZ2UpID0+IHtcbiAgICAgIHJldHVybiBwYWdlLnJlZHVjZSgoYW5zd2VycywgcXVlc3Rpb24pID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQocXVlc3Rpb24uZmVlZGJhY2spO1xuXG4gICAgICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgICBhbnN3ZXJzLnB1c2goe1xuICAgICAgICAgICAgc3VydmV5OiBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5LnRva2VuLFxuICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnRva2VuLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW5zd2VycztcbiAgICAgIH0sIGFuc3dlcnMpO1xuICAgIH0sIFtdKVxuICAgIC5mb3JFYWNoKGFuc3dlciA9PiBBbmFseXRpY3NNb2RlbC5sb2dBbnN3ZXIoYW5zd2VyKSk7XG5cbiAgICBpZiAoJHNjb3BlLmNvbW1lbnQgJiYgJHNjb3BlLmNvbW1lbnQubGVuZ3RoID4gMCkge1xuICAgICAgQW5hbHl0aWNzTW9kZWwubG9nQ29tbWVudCh7XG4gICAgICAgIHR5cGU6ICdmZWVkYmFjaycsXG4gICAgICAgIHRleHQ6ICRzY29wZS5jb21tZW50XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q29tcGxldGUgPSB0cnVlO1xuXG4gICAgaWYgKCRzY29wZS5oYWRfcHJvYmxlbXMgJiYgIU9yZGVyTWFuYWdlci5tb2RlbC5hc3Npc3RhbmNlUmVxdWVzdCkge1xuICAgICAgT3JkZXJNYW5hZ2VyLnJlcXVlc3RBc3Npc3RhbmNlKCk7XG4gICAgfVxuXG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuZW1haWwgJiYgJHNjb3BlLmVtYWlsLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBqb2IgPSBEaWFsb2dNYW5hZ2VyLnN0YXJ0Sm9iKCk7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBnZW5lcmF0ZVBhc3N3b3JkKCk7XG5cbiAgICAgIEN1c3RvbWVyTWFuYWdlci5sb2dpbih7XG4gICAgICAgIGVtYWlsOiAkc2NvcGUuZW1haWwsXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgQ3VzdG9tZXJNYW5hZ2VyLmxvZ2luKHtcbiAgICAgICAgICBsb2dpbjogJHNjb3BlLmVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIERpYWxvZ01hbmFnZXIuZW5kSm9iKGpvYik7XG4gICAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBEaWFsb2dNYW5hZ2VyLmVuZEpvYihqb2IpO1xuICAgICAgICAgIE5hdmlnYXRpb25NYW5hZ2VyLmxvY2F0aW9uID0geyB0eXBlOiAnaG9tZScgfTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgRGlhbG9nTWFuYWdlci5lbmRKb2Ioam9iKTtcbiAgICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICAgIH1cbiAgfTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvL1xuICAvLyAgUHVibGljIG1ldGhvZHNcbiAgLy9cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAkc2NvcGUucHJldmlvdXNQYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5wYWdlSW5kZXggPiAwKSB7XG4gICAgICAkc2NvcGUucGFnZUluZGV4LS07XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5uZXh0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUucGFnZUluZGV4IDwgJHNjb3BlLnBhZ2VDb3VudCAtIDEpIHtcbiAgICAgICRzY29wZS5wYWdlSW5kZXgrKztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm5leHRTdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKEN1c3RvbWVyTW9kZWwuaXNHdWVzdCAmJiAkc2NvcGUuc3RlcCA8IDMpIHtcbiAgICAgICRzY29wZS5zdGVwKys7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFDdXN0b21lck1vZGVsLmlzR3Vlc3QgJiYgJHNjb3BlLnN0ZXAgPCAyKSB7XG4gICAgICAkc2NvcGUuc3RlcCsrO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zdWJtaXRQcm9ibGVtID0gZnVuY3Rpb24oc3RhdHVzKSB7XG4gICAgJHNjb3BlLmhhZF9wcm9ibGVtcyA9IEJvb2xlYW4oc3RhdHVzKTtcbiAgICAkc2NvcGUubmV4dFN0ZXAoKTtcbiAgfTtcblxuICAkc2NvcGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuc3RlcCA+IDApIHtcbiAgICAgIHN1Ym1pdEZlZWRiYWNrKCk7XG4gICAgfVxuXG4gICAgTmF2aWdhdGlvbk1hbmFnZXIubG9jYXRpb24gPSB7IHR5cGU6ICdob21lJyB9O1xuICB9O1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vXG4gIC8vICBTdGFydHVwXG4gIC8vXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYWdlO1xuXG4gICAgJHNjb3BlLmhhc19lbWFpbCA9IEN1c3RvbWVyTW9kZWwuaGFzQ3JlZGVudGlhbHM7XG5cbiAgICBmdW5jdGlvbiBidWlsZFN1cnZleSgpIHtcbiAgICAgIFN1cnZleU1hbmFnZXIubW9kZWwuZmVlZGJhY2tTdXJ2ZXkucXVlc3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoaXRlbS50eXBlICE9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYWdlIHx8IHBhZ2UubGVuZ3RoID4gNCkge1xuICAgICAgICAgIHBhZ2UgPSBbXTtcbiAgICAgICAgICAkc2NvcGUucGFnZXMucHVzaChwYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW0uZmVlZGJhY2sgPSAwO1xuICAgICAgICBwYWdlLnB1c2goaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoU3VydmV5TWFuYWdlci5tb2RlbC5pc0VuYWJsZWQgJiYgU3VydmV5TWFuYWdlci5tb2RlbC5mZWVkYmFja1N1cnZleSkge1xuICAgICAgYnVpbGRTdXJ2ZXkoKTtcbiAgICB9XG5cbiAgICBTdXJ2ZXlNYW5hZ2VyLm1vZGVsLmZlZWRiYWNrU3VydmV5Q2hhbmdlZC5hZGQoKCkgPT4gYnVpbGRTdXJ2ZXkoKSk7XG5cbiAgICAkc2NvcGUucGFnZUluZGV4ID0gMDtcbiAgICAkc2NvcGUuc3RlcCA9IDA7XG4gIH0pKCk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3VybC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignVXJsQ3RybCcsXG4gIFsnJHNjb3BlJywgJ05hdmlnYXRpb25NYW5hZ2VyJywgJ1dlYkJyb3dzZXInLFxuICAoJHNjb3BlLCBOYXZpZ2F0aW9uTWFuYWdlciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gIFdlYkJyb3dzZXIub3BlbihOYXZpZ2F0aW9uTWFuYWdlci5sb2NhdGlvbi51cmwpO1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgIFdlYkJyb3dzZXIuY2xvc2UoKTtcbiAgfSk7XG59XSk7XG5cbi8vc3JjL2pzL2NvbnRyb2xsZXJzL3dlYi5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5jb250cm9sbGVycycpXG4uY29udHJvbGxlcignV2ViQ3RybCcsXG4gIFsnJHNjb3BlJywgJyR0aW1lb3V0JywgJ0FjdGl2aXR5TW9uaXRvcicsICdXZWJCcm93c2VyJyxcbiAgKCRzY29wZSwgJHRpbWVvdXQsIEFjdGl2aXR5TW9uaXRvciwgV2ViQnJvd3NlcikgPT4ge1xuXG4gICRzY29wZS5uYXZpZ2F0ZWQgPSBlID0+IFdlYkJyb3dzZXIubmF2aWdhdGVkKGUudGFyZ2V0LnNyYyk7XG5cbiAgV2ViQnJvd3Nlci5vbk9wZW4uYWRkKHVybCA9PiB7XG4gICAgQWN0aXZpdHlNb25pdG9yLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgIGlmICghV2ViQnJvd3Nlci5pc0V4dGVybmFsKSB7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5icm93c2VyVXJsID0gdXJsO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIFdlYkJyb3dzZXIub25DbG9zZS5hZGQoKCkgPT4ge1xuICAgIEFjdGl2aXR5TW9uaXRvci5lbmFibGVkID0gdHJ1ZTtcblxuICAgIGlmICghV2ViQnJvd3Nlci5pc0V4dGVybmFsKSB7XG4gICAgICAkdGltZW91dCgoKSA9PiB7XG4gICAgICAgICRzY29wZS5icm93c2VyVXJsID0gV2ViQnJvd3Nlci5nZXRBcHBVcmwoJy9ibGFuaycpO1xuICAgICAgICAkc2NvcGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9fYmFzZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJywgWydhbmd1bGFyLWJhY29uJ10pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL2dhbGxlcnkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdnYWxsZXJ5JywgW1xuICAnQWN0aXZpdHlNb25pdG9yJywgJ1NoZWxsTWFuYWdlcicsICckdGltZW91dCcsXG4gIChBY3Rpdml0eU1vbml0b3IsIFNoZWxsTWFuYWdlciwgJHRpbWVvdXQpID0+IHtcblxuICB2YXIgc2xpZGVyLFxuICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgIG1vZGU6ICdmYWRlJyxcbiAgICAgICAgd3JhcHBlckNsYXNzOiAncGhvdG8tZ2FsbGVyeSdcbiAgICAgIH07XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIHNjb3BlOiB7XG4gICAgICBpbWFnZXM6ICc9JyxcbiAgICAgIGltYWdld2lkdGggOiAnPT8nLFxuICAgICAgaW1hZ2VoZWlnaHQ6ICc9PydcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnZ2FsbGVyeScpLFxuICAgIGxpbms6IChzY29wZSwgZWxlbSwgYXR0cnMpID0+IHtcbiAgICAgIGVsZW0ucmVhZHkoKCkgPT4ge1xuICAgICAgICBzbGlkZXIgPSAkKCcuYnhzbGlkZXInLCBlbGVtKS5ieFNsaWRlcihzZXR0aW5ncyk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdpbWFnZXMnLCAoKSA9PiB7XG4gICAgICAgIHNjb3BlLm1lZGlhcyA9IChzY29wZS5pbWFnZXMgfHwgW10pLm1hcChpbWFnZSA9PiBTaGVsbE1hbmFnZXIuZ2V0TWVkaWFVcmwoaW1hZ2UsIGF0dHJzLmltYWdld2lkdGgsIGF0dHJzLmltYWdlaGVpZ2h0KSk7XG4gICAgICAgIHNldHRpbmdzLnBhZ2VyID0gc2NvcGUubWVkaWFzLmxlbmd0aCA+IDE7XG4gICAgICAgICR0aW1lb3V0KCgpID0+IHNsaWRlci5yZWxvYWRTbGlkZXIoc2V0dGluZ3MpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9vbmlmcmFtZWxvYWQuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdvbklmcmFtZUxvYWQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHNjb3BlOiB7XG4gICAgICBjYWxsYmFjazogJyZvbklmcmFtZUxvYWQnXG4gICAgfSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgIGVsZW1lbnQuYmluZCgnbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoc2NvcGUuY2FsbGJhY2spID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgc2NvcGUuY2FsbGJhY2soeyBldmVudDogZSB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvb25rZXlkb3duLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnb25LZXlkb3duJywgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cnMpIHtcbiAgICAgIHZhciBmdW5jdGlvblRvQ2FsbCA9IHNjb3BlLiRldmFsKGF0dHJzLm9uS2V5ZG93bik7XG4gICAgICBlbGVtLm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGZ1bmN0aW9uVG9DYWxsKGUud2hpY2gpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvcXVhbnRpdHkuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdxdWFudGl0eScsXG4gIFsnJHRpbWVvdXQnLCAnU2hlbGxNYW5hZ2VyJyxcbiAgKCR0aW1lb3V0LCBTaGVsbE1hbmFnZXIpID0+IHtcblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgcmVwbGFjZTogdHJ1ZSxcbiAgICBzY29wZToge1xuICAgICAgcXVhbnRpdHk6ICc9JyxcbiAgICAgIG1pbjogJz0nLFxuICAgICAgbWF4OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUubWluID0gc2NvcGUubWluIHx8IDE7XG4gICAgICBzY29wZS5tYXggPSBzY29wZS5tYXggfHwgOTtcbiAgICAgIHNjb3BlLmRhdGEgPSB7XG4gICAgICAgIG1pbjogc2NvcGUubWluLFxuICAgICAgICBtYXg6IHNjb3BlLm1heCxcbiAgICAgICAgcXVhbnRpdHk6IHBhcnNlSW50KHNjb3BlLnF1YW50aXR5KVxuICAgICAgfTtcblxuICAgICAgc2NvcGUuZGVjcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPiBzY29wZS5kYXRhLm1pbiA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSAtIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWluO1xuICAgICAgfTtcblxuICAgICAgc2NvcGUuaW5jcmVhc2UgPSAoKSA9PiB7XG4gICAgICAgIHNjb3BlLnF1YW50aXR5ID0gc2NvcGUuZGF0YS5xdWFudGl0eSA9IHNjb3BlLmRhdGEucXVhbnRpdHkgPCBzY29wZS5kYXRhLm1heCA/XG4gICAgICAgICAgc2NvcGUuZGF0YS5xdWFudGl0eSArIDEgOlxuICAgICAgICAgIHNjb3BlLmRhdGEubWF4O1xuICAgICAgfTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnaW5wdXQtcXVhbnRpdHknKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9kaXJlY3RpdmVzL3Njcm9sbGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2Nyb2xsZXInLCBbJ0FjdGl2aXR5TW9uaXRvcicsICdTTkFQRW52aXJvbm1lbnQnLCBmdW5jdGlvbiAoQWN0aXZpdHlNb25pdG9yLCBTTkFQRW52aXJvbm1lbnQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0MnLFxuICAgIHJlcGxhY2U6IGZhbHNlLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgaWYgKFNOQVBFbnZpcm9ubWVudC5wbGF0Zm9ybSA9PT0gJ2Rlc2t0b3AnKSB7XG4gICAgICAgICQoZWxlbSkua2luZXRpYyh7XG4gICAgICAgICAgeTogZmFsc2UsIHN0b3BwZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEFjdGl2aXR5TW9uaXRvci5hY3Rpdml0eURldGVjdGVkKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2Nyb2xsZ2x1ZS5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5kaXJlY3RpdmVzJylcbi5kaXJlY3RpdmUoJ3Njcm9sbGdsdWUnLCBbJyRwYXJzZScsIGZ1bmN0aW9uICgkcGFyc2UpIHtcbiAgZnVuY3Rpb24gdW5ib3VuZFN0YXRlKGluaXRWYWx1ZSl7XG4gICAgdmFyIGFjdGl2YXRlZCA9IGluaXRWYWx1ZTtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBhY3RpdmF0ZWQ7XG4gICAgICB9LFxuICAgICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgYWN0aXZhdGVkID0gdmFsdWU7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZVdheUJpbmRpbmdTdGF0ZShnZXR0ZXIsIHNjb3BlKXtcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBnZXR0ZXIoc2NvcGUpO1xuICAgICAgfSxcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbigpe31cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gdHdvV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2V0dGVyLCBzY29wZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldFZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZ2V0dGVyKHNjb3BlKTtcbiAgICAgIH0sXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICBpZih2YWx1ZSAhPT0gZ2V0dGVyKHNjb3BlKSl7XG4gICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZXR0ZXIoc2NvcGUsIHZhbHVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0ciwgc2NvcGUpe1xuICAgIGlmKGF0dHIgIT09IFwiXCIpe1xuICAgICAgdmFyIGdldHRlciA9ICRwYXJzZShhdHRyKTtcbiAgICAgIGlmKGdldHRlci5hc3NpZ24gIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybiB0d29XYXlCaW5kaW5nU3RhdGUoZ2V0dGVyLCBnZXR0ZXIuYXNzaWduLCBzY29wZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gb25lV2F5QmluZGluZ1N0YXRlKGdldHRlciwgc2NvcGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5ib3VuZFN0YXRlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcHJpb3JpdHk6IDEsXG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgJGVsLCBhdHRycyl7XG4gICAgICB2YXIgZWwgPSAkZWxbMF0sXG4gICAgICBhY3RpdmF0aW9uU3RhdGUgPSBjcmVhdGVBY3RpdmF0aW9uU3RhdGUoYXR0cnMuc2Nyb2xsZ2x1ZSwgc2NvcGUpO1xuXG4gICAgICBmdW5jdGlvbiBzY3JvbGxUb0JvdHRvbSgpe1xuICAgICAgICBlbC5zY3JvbGxUb3AgPSBlbC5zY3JvbGxIZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uU2NvcGVDaGFuZ2VzKCl7XG4gICAgICAgIGlmKGFjdGl2YXRpb25TdGF0ZS5nZXRWYWx1ZSgpICYmICFzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKSl7XG4gICAgICAgICAgc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG91bGRBY3RpdmF0ZUF1dG9TY3JvbGwoKXtcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFRvcCArIGVsLmNsaWVudEhlaWdodCArIDEgPj0gZWwuc2Nyb2xsSGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblNjcm9sbCgpe1xuICAgICAgICBhY3RpdmF0aW9uU3RhdGUuc2V0VmFsdWUoc2hvdWxkQWN0aXZhdGVBdXRvU2Nyb2xsKCkpO1xuICAgICAgfVxuXG4gICAgICBzY29wZS4kd2F0Y2gob25TY29wZUNoYW5nZXMpO1xuICAgICAgJGVsLmJpbmQoJ3Njcm9sbCcsIG9uU2Nyb2xsKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbi8vc3JjL2pzL2RpcmVjdGl2ZXMvc2xpZGVyLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmRpcmVjdGl2ZXMnKVxuLmRpcmVjdGl2ZSgnc2xpZGVyJyxcbiAgWyckdGltZW91dCcsICdTaGVsbE1hbmFnZXInLFxuICAoJHRpbWVvdXQsIFNoZWxsTWFuYWdlcikgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIHNvdXJjZTogJz0nLFxuICAgICAgc2xpZGVjbGljazogJz0nLFxuICAgICAgc2xpZGVzaG93OiAnPScsXG4gICAgICB0aW1lb3V0OiAnPSdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgdmFyIHRpbWVvdXQgPSBzY29wZS50aW1lb3V0IHx8IDUwMDA7XG4gICAgICBzY29wZS5zb3VyY2UgPSBzY29wZS5zb3VyY2UgfHwgW107XG4gICAgICBzY29wZS5jdXJyZW50SW5kZXggPSAtMTtcblxuICAgICAgdmFyIGNoYW5nZUltYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzY29wZS5zb3VyY2UubGVuZ3RoID09PSAwIHx8IHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcblxuICAgICAgICBzY29wZS5zb3VyY2UuZm9yRWFjaChmdW5jdGlvbihlbnRyeSwgaSl7XG4gICAgICAgICAgZW50cnkudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgZW50cnkgPSBzY29wZS5zb3VyY2Vbc2NvcGUuY3VycmVudEluZGV4XTtcbiAgICAgICAgZW50cnkudmlzaWJsZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNjb3BlLnNsaWRlc2hvdykge1xuICAgICAgICAgIHNjb3BlLnNsaWRlc2hvdyhlbnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHZhciB2ID0gJCgndmlkZW8nLCBlbGVtKTtcbiAgICAgICAgICB2LmF0dHIoJ3NyYycsIGVudHJ5LnNyYyk7XG4gICAgICAgICAgdmFyIHZpZGVvID0gdi5nZXQoMCk7XG5cbiAgICAgICAgICBpZiAoIXZpZGVvKSB7XG4gICAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIDMwMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIG9uVmlkZW9FbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkgeyBzY29wZS5uZXh0KCk7IH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgb25WaWRlb0Vycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25WaWRlb0Vycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgc2NvcGUubmV4dCgpOyB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCBvblZpZGVvRW5kZWQsIGZhbHNlKTtcbiAgICAgICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uVmlkZW9FcnJvciwgZmFsc2UpO1xuXG4gICAgICAgICAgdHJ5XG4gICAgICAgICAge1xuICAgICAgICAgICAgdmlkZW8ubG9hZCgpO1xuICAgICAgICAgICAgdmlkZW8ucGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmFibGUgdG8gcGxheSB2aWRlbzogJyArIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aW1lciA9ICR0aW1lb3V0KHNsaWRlckZ1bmMsIHRpbWVvdXQpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA8IHNjb3BlLnNvdXJjZS5sZW5ndGgtMSA/XG4gICAgICAgICAgc2NvcGUuY3VycmVudEluZGV4KysgOlxuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgIGNoYW5nZUltYWdlKCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS5wcmV2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA+IDAgP1xuICAgICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleC0tIDpcbiAgICAgICAgICBzY29wZS5jdXJyZW50SW5kZXggPSBzY29wZS5zb3VyY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgY2hhbmdlSW1hZ2UoKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB0aW1lcjtcblxuICAgICAgdmFyIHNsaWRlckZ1bmMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNjb3BlLnNvdXJjZS5sZW5ndGggPT09IDAgfHwgc2NvcGUuZGlzYWJsZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzY29wZS5uZXh0KCk7XG4gICAgICB9O1xuXG4gICAgICBzY29wZS4kd2F0Y2goJ3NvdXJjZScsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJHdhdGNoKCdkaXNhYmxlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjb3BlLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICBzbGlkZXJGdW5jKCk7XG4gICAgICB9KTtcblxuICAgICAgc2xpZGVyRnVuYygpO1xuXG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICR0aW1lb3V0LmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHRlbXBsYXRlVXJsOiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybCgnc2xpZGVyJylcbiAgfTtcbn1dKTtcblxuLy9zcmMvanMvZGlyZWN0aXZlcy9zd2l0Y2guanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZGlyZWN0aXZlcycpXG4uZGlyZWN0aXZlKCdzd2l0Y2gnLFxuICBbJyR0aW1lb3V0JywgJ1NoZWxsTWFuYWdlcicsXG4gICgkdGltZW91dCwgU2hlbGxNYW5hZ2VyKSA9PiB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHJlcGxhY2U6IHRydWUsXG4gICAgc2NvcGU6IHtcbiAgICAgIGRpc2FibGVkOiAnPT8nLFxuICAgICAgc2VsZWN0ZWQ6ICc9PydcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgc2NvcGUuZGlzYWJsZWQgPSBCb29sZWFuKHNjb3BlLmRpc2FibGVkKTtcbiAgICAgIHNjb3BlLnNlbGVjdGVkID0gQm9vbGVhbihzY29wZS5zZWxlY3RlZCk7XG4gICAgICBzY29wZS5kYXRhID0ge1xuICAgICAgICBkaXNhYmxlZDogQm9vbGVhbihzY29wZS5kaXNhYmxlZCksXG4gICAgICAgIHNlbGVjdGVkOiBCb29sZWFuKHNjb3BlLnNlbGVjdGVkKSxcbiAgICAgICAgY2hhbmdlZDogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHNjb3BlLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNjb3BlLmRpc2FibGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcGUuc2VsZWN0ZWQgPSBzY29wZS5kYXRhLnNlbGVjdGVkID0gIXNjb3BlLmRhdGEuc2VsZWN0ZWQ7XG4gICAgICAgIHNjb3BlLmRhdGEuY2hhbmdlZCA9IHRydWU7XG4gICAgICB9O1xuICAgIH0sXG4gICAgdGVtcGxhdGVVcmw6IFNoZWxsTWFuYWdlci5nZXRQYXJ0aWFsVXJsKCdpbnB1dC1zd2l0Y2gnKVxuICB9O1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL19iYXNlLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnLCBbXSk7XG5cbi8vc3JjL2pzL2ZpbHRlcnMvcGFydGlhbC5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5maWx0ZXJzJylcbi5maWx0ZXIoJ3BhcnRpYWwnLCBbJ1NoZWxsTWFuYWdlcicsIChTaGVsbE1hbmFnZXIpID0+IHtcbiAgcmV0dXJuIChuYW1lKSA9PiBTaGVsbE1hbmFnZXIuZ2V0UGFydGlhbFVybChuYW1lKTtcbn1dKTtcblxuLy9zcmMvanMvZmlsdGVycy90aHVtYm5haWwuanNcblxuYW5ndWxhci5tb2R1bGUoJ1NOQVAuZmlsdGVycycpXG4uZmlsdGVyKCd0aHVtYm5haWwnLCBbJ1NoZWxsTWFuYWdlcicsIFNoZWxsTWFuYWdlciA9PiB7XG4gIHJldHVybiAobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbikgPT4gU2hlbGxNYW5hZ2VyLmdldE1lZGlhVXJsKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pO1xufV0pO1xuXG4vL3NyYy9qcy9maWx0ZXJzL3RydXN0dXJsLmpzXG5cbmFuZ3VsYXIubW9kdWxlKCdTTkFQLmZpbHRlcnMnKVxuLmZpbHRlcigndHJ1c3RVcmwnLCBbJyRzY2UnLCBmdW5jdGlvbigkc2NlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICByZXR1cm4gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwodmFsKTtcbiAgICB9O1xufV0pO1xuXG4vL3NyYy9qcy9zZXJ2aWNlcy5qc1xuXG5hbmd1bGFyLm1vZHVsZSgnU05BUC5zZXJ2aWNlcycsIFsnbmdSZXNvdXJjZScsICdTTkFQLmNvbmZpZ3MnXSlcblxuICAuZmFjdG9yeSgnTG9nZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAoU05BUEVudmlyb25tZW50KSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuTG9nZ2VyKFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnJGV4Y2VwdGlvbkhhbmRsZXInLCBbJ0xvZ2dlcicsIChMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gKGV4Y2VwdGlvbiwgY2F1c2UpID0+IHtcbiAgICAgIExvZ2dlci5mYXRhbChleGNlcHRpb24uc3RhY2ssIGNhdXNlLCBleGNlcHRpb24pO1xuICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgIH07XG4gIH1dKVxuXG4gIC8vU2VydmljZXNcblxuICAuZmFjdG9yeSgnQ2FyZFJlYWRlcicsIFsnTWFuYWdlbWVudFNlcnZpY2UnLCAoTWFuYWdlbWVudFNlcnZpY2UpID0+IHtcbiAgICB3aW5kb3cuU25hcENhcmRSZWFkZXIgPSBuZXcgYXBwLkNhcmRSZWFkZXIoTWFuYWdlbWVudFNlcnZpY2UpO1xuICAgIHJldHVybiB3aW5kb3cuU25hcENhcmRSZWFkZXI7XG4gIH1dKVxuICAuZmFjdG9yeSgnRHRzQXBpJywgWydTTkFQSG9zdHMnLCAnU2Vzc2lvblByb3ZpZGVyJywgKFNOQVBIb3N0cywgU2Vzc2lvblByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuQmFja2VuZEFwaShTTkFQSG9zdHMsIFNlc3Npb25Qcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnTWFuYWdlbWVudFNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICdTTkFQRW52aXJvbm1lbnQnLCAoJHJlc291cmNlLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5NYW5hZ2VtZW50U2VydmljZSgkcmVzb3VyY2UsIFNOQVBFbnZpcm9ubWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvblNlcnZpY2UnLCBbJyRyZXNvdXJjZScsICgkcmVzb3VyY2UpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5TZXNzaW9uU2VydmljZSgkcmVzb3VyY2UpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvY2tldENsaWVudCcsIFsnU2Vzc2lvblByb3ZpZGVyJywgJ0xvZ2dlcicsIChTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvY2tldENsaWVudChTZXNzaW9uUHJvdmlkZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnVGVsZW1ldHJ5U2VydmljZScsIFsnJHJlc291cmNlJywgKCRyZXNvdXJjZSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlRlbGVtZXRyeVNlcnZpY2UoJHJlc291cmNlKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdXZWJCcm93c2VyJywgWyckd2luZG93JywgJ0FuYWx5dGljc01vZGVsJywgJ01hbmFnZW1lbnRTZXJ2aWNlJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTTkFQSG9zdHMnLCAoJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwsIE1hbmFnZW1lbnRTZXJ2aWNlLCBTTkFQRW52aXJvbm1lbnQsIFNOQVBIb3N0cykgPT4ge1xuICAgIHdpbmRvdy5TbmFwV2ViQnJvd3NlciA9IG5ldyBhcHAuV2ViQnJvd3Nlcigkd2luZG93LCBBbmFseXRpY3NNb2RlbCwgTWFuYWdlbWVudFNlcnZpY2UsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICByZXR1cm4gd2luZG93LlNuYXBXZWJCcm93c2VyO1xuICB9XSlcblxuICAvL01vZGVsc1xuXG4gIC5mYWN0b3J5KCdBcHBDYWNoZScsIFsnTG9nZ2VyJywgKExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFwcENhY2hlKExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTW9kZWwnLCBbJ1N0b3JhZ2VQcm92aWRlcicsICdIZWF0TWFwJywgKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01vZGVsKFN0b3JhZ2VQcm92aWRlciwgSGVhdE1hcCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2FydE1vZGVsJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNhcnRNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnQ2hhdE1vZGVsJywgWydTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5DaGF0TW9kZWwoU05BUENvbmZpZywgU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0N1c3RvbWVyTW9kZWwnLCBbJ1NOQVBDb25maWcnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTW9kZWwoU05BUENvbmZpZywgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEYXRhUHJvdmlkZXInLCBbJ1NOQVBDb25maWcnLCAnRHRzQXBpJywgKFNOQVBDb25maWcsIER0c0FwaSkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRhdGFQcm92aWRlcihTTkFQQ29uZmlnLCBEdHNBcGkpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ0hlYXRNYXAnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuSGVhdE1hcChkb2N1bWVudC5ib2R5KTtcbiAgfSlcbiAgLmZhY3RvcnkoJ0xvY2F0aW9uTW9kZWwnLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdTdG9yYWdlUHJvdmlkZXInLCAoU05BUEVudmlyb25tZW50LCBTdG9yYWdlUHJvdmlkZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Mb2NhdGlvbk1vZGVsKFNOQVBFbnZpcm9ubWVudCwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1vZGVsJywgWydTdG9yYWdlUHJvdmlkZXInLCAoU3RvcmFnZVByb3ZpZGVyKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuT3JkZXJNb2RlbChTdG9yYWdlUHJvdmlkZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NoZWxsTW9kZWwnLCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU2hlbGxNb2RlbCgpO1xuICB9KVxuICAuZmFjdG9yeSgnU3VydmV5TW9kZWwnLCBbJ1NOQVBDb25maWcnLCAnU3RvcmFnZVByb3ZpZGVyJywgKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlN1cnZleU1vZGVsKFNOQVBDb25maWcsIFN0b3JhZ2VQcm92aWRlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvblByb3ZpZGVyJywgWydTZXNzaW9uU2VydmljZScsICdTdG9yYWdlUHJvdmlkZXInLCAoU2Vzc2lvblNlcnZpY2UsIFN0b3JhZ2VQcm92aWRlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25Qcm92aWRlcihTZXNzaW9uU2VydmljZSwgU3RvcmFnZVByb3ZpZGVyKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTdG9yYWdlUHJvdmlkZXInLCAoKSA9PiAge1xuICAgIHJldHVybiAoaWQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgYXBwLkxvY2FsU3RvcmFnZVN0b3JlKGlkKTtcbiAgICB9O1xuICB9KVxuXG4gIC8vTWFuYWdlcnNcblxuICAuZmFjdG9yeSgnQWN0aXZpdHlNb25pdG9yJywgWyckcm9vdFNjb3BlJywgJyR0aW1lb3V0JywgKCRyb290U2NvcGUsICR0aW1lb3V0KSA9PiB7XG4gICAgdmFyIG1vbml0b3IgPSBuZXcgYXBwLkFjdGl2aXR5TW9uaXRvcigkcm9vdFNjb3BlLCAkdGltZW91dCk7XG4gICAgbW9uaXRvci50aW1lb3V0ID0gMzAwMDA7XG4gICAgcmV0dXJuIG1vbml0b3I7XG4gIH1dKVxuICAuZmFjdG9yeSgnQW5hbHl0aWNzTWFuYWdlcicsIFsnVGVsZW1ldHJ5U2VydmljZScsICdBbmFseXRpY3NNb2RlbCcsICdMb2dnZXInLCAoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkFuYWx5dGljc01hbmFnZXIoVGVsZW1ldHJ5U2VydmljZSwgQW5hbHl0aWNzTW9kZWwsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ3VzdG9tZXJNYW5hZ2VyJywgWydTTkFQQ29uZmlnJywgJ1NOQVBFbnZpcm9ubWVudCcsICdEdHNBcGknLCAnQ3VzdG9tZXJNb2RlbCcsIChTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkN1c3RvbWVyTWFuYWdlcihTTkFQQ29uZmlnLCBTTkFQRW52aXJvbm1lbnQsIER0c0FwaSwgQ3VzdG9tZXJNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnQ2hhdE1hbmFnZXInLCBbJ0FuYWx5dGljc01vZGVsJywgJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnU29ja2V0Q2xpZW50JywgKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkNoYXRNYW5hZ2VyKEFuYWx5dGljc01vZGVsLCBDaGF0TW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIFNvY2tldENsaWVudCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnRGF0YU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdMb2dnZXInLCAnU05BUEVudmlyb25tZW50JywgKERhdGFQcm92aWRlciwgTG9nZ2VyLCBTTkFQRW52aXJvbm1lbnQpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5EYXRhTWFuYWdlcihEYXRhUHJvdmlkZXIsIExvZ2dlciwgU05BUEVudmlyb25tZW50KTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdEaWFsb2dNYW5hZ2VyJywgKCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLkRpYWxvZ01hbmFnZXIoKTtcbiAgfSlcbiAgLmZhY3RvcnkoJ05hdmlnYXRpb25NYW5hZ2VyJywgWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckd2luZG93JywgJ0FuYWx5dGljc01vZGVsJywgKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHdpbmRvdywgQW5hbHl0aWNzTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5OYXZpZ2F0aW9uTWFuYWdlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICR3aW5kb3csIEFuYWx5dGljc01vZGVsKTtcbiAgfV0pXG4gIC5mYWN0b3J5KCdPcmRlck1hbmFnZXInLCBbJ0NoYXRNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0RhdGFQcm92aWRlcicsICdEdHNBcGknLCAnTG9jYXRpb25Nb2RlbCcsICdPcmRlck1vZGVsJywgKENoYXRNb2RlbCwgQ3VzdG9tZXJNb2RlbCwgRGF0YVByb3ZpZGVyLCBEdHNBcGksIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5PcmRlck1hbmFnZXIoQ2hhdE1vZGVsLCBDdXN0b21lck1vZGVsLCBEYXRhUHJvdmlkZXIsIER0c0FwaSwgTG9jYXRpb25Nb2RlbCwgT3JkZXJNb2RlbCk7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2Vzc2lvbk1hbmFnZXInLCBbJ1NOQVBFbnZpcm9ubWVudCcsICdBbmFseXRpY3NNb2RlbCcsICdDdXN0b21lck1vZGVsJywgJ0xvY2F0aW9uTW9kZWwnLCAnT3JkZXJNb2RlbCcsICdTdXJ2ZXlNb2RlbCcsICdTdG9yYWdlUHJvdmlkZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcikgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNlc3Npb25NYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgQW5hbHl0aWNzTW9kZWwsIEN1c3RvbWVyTW9kZWwsIExvY2F0aW9uTW9kZWwsIE9yZGVyTW9kZWwsIFN1cnZleU1vZGVsLCBTdG9yYWdlUHJvdmlkZXIsIExvZ2dlcik7XG4gIH1dKVxuICAuZmFjdG9yeSgnU2hlbGxNYW5hZ2VyJywgWyckc2NlJywgJ0RhdGFQcm92aWRlcicsICdTaGVsbE1vZGVsJywgJ1NOQVBDb25maWcnLCAnU05BUEVudmlyb25tZW50JywgJ1NOQVBIb3N0cycsICgkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKSA9PiB7XG4gICAgbGV0IG1hbmFnZXIgPSBuZXcgYXBwLlNoZWxsTWFuYWdlcigkc2NlLCBEYXRhUHJvdmlkZXIsIFNoZWxsTW9kZWwsIFNOQVBDb25maWcsIFNOQVBFbnZpcm9ubWVudCwgU05BUEhvc3RzKTtcbiAgICBEYXRhUHJvdmlkZXIuX2dldE1lZGlhVXJsID0gKG1lZGlhLCB3aWR0aCwgaGVpZ2h0LCBleHRlbnNpb24pID0+IG1hbmFnZXIuZ2V0TWVkaWFVcmwobWVkaWEsIHdpZHRoLCBoZWlnaHQsIGV4dGVuc2lvbik7IC8vVG9EbzogcmVmYWN0b3JcbiAgICByZXR1cm4gbWFuYWdlcjtcbiAgfV0pXG4gIC5mYWN0b3J5KCdTb2NpYWxNYW5hZ2VyJywgWydTTkFQRW52aXJvbm1lbnQnLCAnRHRzQXBpJywgJ1dlYkJyb3dzZXInLCAnTG9nZ2VyJywgKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpID0+IHtcbiAgICByZXR1cm4gbmV3IGFwcC5Tb2NpYWxNYW5hZ2VyKFNOQVBFbnZpcm9ubWVudCwgRHRzQXBpLCBXZWJCcm93c2VyLCBMb2dnZXIpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1NvZnR3YXJlTWFuYWdlcicsIFsnU05BUEVudmlyb25tZW50JywgKFNOQVBFbnZpcm9ubWVudCkgPT4ge1xuICAgIHJldHVybiBuZXcgYXBwLlNvZnR3YXJlTWFuYWdlcihTTkFQRW52aXJvbm1lbnQpO1xuICB9XSlcbiAgLmZhY3RvcnkoJ1N1cnZleU1hbmFnZXInLCBbJ0RhdGFQcm92aWRlcicsICdTdXJ2ZXlNb2RlbCcsIChEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBhcHAuU3VydmV5TWFuYWdlcihEYXRhUHJvdmlkZXIsIFN1cnZleU1vZGVsKTtcbiAgfV0pO1xuIl19
