window.app.SessionManager = class SessionManager {
  constructor(SNAPEnvironment, AnalyticsModel, CustomerModel, LocationModel, OrderModel, SurveyModel, storageProvider, Logger) {
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
    this._store.read().then(data => {
      self._session = data;

      if (!data) {
        self._startSession();
      }
    });

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

  get session() {
    return this._session;
  }

  endSession() {
    if (!this._session) {
      return;
    }

    this._Logger.debug(`Seat session ${this._session.id} ended.`);

    var s = this._session;
    s.ended = new Date();

    this._session = null;
    this._store.clear();

    this._AnalyticsModel.logSession(s);

    this.sessionEnded.dispatch(s);
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
