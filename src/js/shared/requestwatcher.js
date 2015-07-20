window.app.RequestWatcher = class RequestWatcher {
  constructor(ticket, DtsApi) {
    this._token = ticket.token;
    this._remote = DtsApi;

    this.POLLING_INTERVAL = 5000;

    this.REQUEST_STATUS_PENDING = 1;
    this.REQUEST_STATUS_RECEIVED = 2;
    this.REQUEST_STATUS_ACCEPTED = 3;
    this.REQUEST_STATUS_EXPIRED = 255;

    var self = this;
    this._promise = new Promise((resolve, reject) => {
      self._statusUpdateResolve = resolve;
      self._statusUpdateReject = reject;
    });

    this._ticket = { status: 0 };
    this._watchStatus();
  }

  get token() {
    return this._token;
  }

  get ticket() {
    return this._ticket;
  }

  get promise() {
    return this._promise;
  }

  dispose() {
    if (this._timeoutId) {
      window.clearTimeout(this._timeoutId);
    }

    if (this._ticket.status < this.REQUEST_STATUS_ACCEPTED) {
      this._statusUpdateReject();
    }
  }

  _watchStatus() {
    var self = this;

    if (self._timeoutId) {
      window.clearTimeout(self._timeoutId);
    }

    var onTimeout = () => {
      self._remote.waiter.getStatus(self._token).then(response => {
        self._setTicket(response);
        self._watchStatus();
      }, () => {
        self._watchStatus();
      });
    };

    if (self._ticket.status === self.REQUEST_STATUS_ACCEPTED) {
      self._statusUpdateResolve();
    }
    else if (self._ticket.status !== self.REQUEST_STATUS_EXPIRED) {
      self._timeoutId = window.setTimeout(onTimeout, this.POLLING_INTERVAL);
    }
  }

  _setTicket(value) {
    var self = this;

    if (self._ticket.status === value.status) {
      return;
    }

    self._ticket = value;
    self._watchStatus();
  }
};
