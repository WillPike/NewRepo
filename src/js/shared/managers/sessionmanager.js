window.app.SessionManager = class SessionManager extends app.AbstractManager {
  constructor(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, storageProvider, Logger) {
    super(Logger);

    var self = this;

    this.sessionStarted = new signals.Signal();
    this.sessionEnded = new signals.Signal();

    this._SNAPEnvironment = SNAPEnvironment;
    this._AnalyticsModel = AnalyticsModel;
    this._CustomerModel = CustomerModel;
    this._LocationModel = LocationModel;
    this._OrderModel = OrderModel;
    this._SurveyModel = SurveyModel;

    this._store = storageProvider('snap_seat_session');

    this._CustomerModel.profileChanged.add(customer => {
      if (!self._session || !customer) {
        return;
      }

      self._session.customer = customer.token;
      self._store.write(this._session);
    });

    this._LocationModel.seatChanged.add(seat => {
      if (!self._session || !seat) {
        return;
      }

      self._session.seat = seat.token;
      self._store.write(this._session);
    });

    this._OrderModel.orderTicketChanged.add(ticket => {
      if (!self._session || !ticket || !ticket.token) {
        return;
      }

      self._session.ticket = ticket.token;
      self._store.write(this._session);
    });
  }

  initialize() {
    super.initialize();

    var self = this;
    return new Promise((resolve, reject) => {
      self._store.read().then(data => {
        self._session = data;

        if (!data) {
          self._startSession();
        }

        resolve();
      }, reject);
    });
  }

  reset() {
    super.reset();

    return this._store.clear();
  }

  get session() {
    return this._session;
  }

  endSession() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._store.read().then(s => {
        self._session = null;

        if (s) {
          self._Logger.debug(`Seat session ${s.id} ended.`);

          s.ended = new Date();
          self._AnalyticsModel.logSession(s);
          self.sessionEnded.dispatch(s);
        }

        self._store.clear().then(resolve, reject);
      }, reject);
    });
  }

  get guestCount() {
    return this._session.guest_count || 1;
  }

  set guestCount(value) {
    if (this._session.guest_count === value) {
      return;
    }

    this._session.guest_count = value;
    this._store.write(this._session);
  }

  get specialEvent() {
    return this._session.special_event;
  }

  set specialEvent(value) {
    if (this._session.special_event === value) {
      return;
    }

    this._session.special_event = value;
    this._store.write(this._session);
  }

  _startSession() {
    let seat = this._LocationModel.seat;

    this._session = {
      id: this._generateID(),
      seat: seat ? seat.token : undefined,
      platform: this._SNAPEnvironment.platform,
      started: new Date()
    };

    this._Logger.debug(`Seat session ${this._session.id} started.`);

    this._store.write(this._session);
    this.sessionStarted.dispatch(this._session);
  }

  _generateID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
};
