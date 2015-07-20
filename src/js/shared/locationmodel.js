window.app.LocationModel = class LocationModel {
  /* global signals */

  constructor(SNAPEnvironment, storageProvider) {
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

    this._seatStore.read().then(seat => {
      self._seat = seat;

      if (seat) {
        self.seatChanged.dispatch(self._seat);
      }
    });
  }

  get location() {
    return this._location;
  }

  get seat() {
    return this._seat;
  }

  set seat(value) {
    var self = this,
        oldSeat = this._seat || {};
    this._seat = value || {};

    if (!value) {
      this._seatStore.clear().then(() => {
        self.seatChanged.dispatch(self._seat);
      }, () => {
        self._seat = oldSeat;
      });
    }
    else {
      this._seatStore.write(this._seat).then(() => {
        self.seatChanged.dispatch(self._seat);
      }, () => {
        self._seat = oldSeat;
      });
    }
  }

  get seats() {
    return this._seats;
  }

  set seats(value) {
    if (this._seats === value) {
      return;
    }

    this._seats = value || [];
    this.seatsChanged.dispatch(this._seats);
  }

  get device() {
    return this._device;
  }

  get devices() {
    return this._devices;
  }

  set devices(value) {
    if (this._devices === value) {
      return;
    }

    this._devices = value || [];
    this.devicesChanged.dispatch(this._devices);
  }

  addDevice(device) {
    this._devices.push(device);
    this.devices = this._devices;
  }

  getSeat(token) {
    return this.seats.filter(seat => seat.token === token)[0] || null;
  }

  getDevice(device) {
    return this.devices.filter(d => (device.token || device) === d.token)[0] || null;
  }
};
