window.app.LocationModel = class LocationModel extends app.AbstractModel {
  constructor(SNAPEnvironment, SNAPLocation, storageProvider) {
    super(storageProvider);

    this._defineProperty('device', 'snap_device');
    this._defineProperty('devices', undefined, []);
    this._defineProperty('location', 'snap_location', SNAPLocation);
    this._defineProperty('seat', 'snap_seat');
    this._defineProperty('seats', 'snap_seats', []);

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
