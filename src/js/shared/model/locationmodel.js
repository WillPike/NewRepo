window.app.LocationModel = class LocationModel extends app.AbstractModel {
  constructor(DtsApi, SNAPEnvironment, SNAPLocation, storageProvider) {
    super(storageProvider);

    var self = this;

    this._defineProperty('device', 'snap_device', null, () => DtsApi.hardware.getCurrentDevice());
    this._defineProperty('devices', undefined, []);
    this._defineProperty('seat', 'snap_seat', null, () => DtsApi.location.getCurrentSeat());
    this._defineProperty('seats', 'snap_seats', [], () => DtsApi.location.getSeats());
    this._defineProperty('location', 'snap_location', SNAPLocation, () => {
      if (!self.device) {
        return Promise.reject('Device data is missing.');
      }

      return DtsApi.snap.getConfig(self.device.location_token).then(config => {
        SNAPLocation.inject(config);
        return SNAPLocation;
      });
    });

    this.initialize();
  }

  addDevice(device) {
    this.devices.push(device);
    this._propertyChanged('device');
  }

  getSeat(token) {
    return this.seats.filter(seat => seat.token === token)[0] || null;
  }

  getDevice(device) {
    return this.devices.filter(d => (device.token || device) === d.token)[0] || null;
  }
};
