window.app.LocationManager = class LocationManager {
  constructor(DataProvider, DtsApi, LocationModel, Logger) {
    this._DataProvider = DataProvider;
    this._DtsApi = DtsApi;
    this._LocationModel = LocationModel;
    this._Logger = Logger;
  }

  loadConfig() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._Logger.debug('Loading current device info...');

      self._DtsApi.hardware.getCurrentDevice().then(device => {
        self._Logger.debug(`Current device: token=${device.token};location=${device.location_token}`);

        self._LocationModel.device = device;
        var locationToken = device.location_token;

        self._Logger.debug('Loading location config...');

        self._DtsApi.snap.getConfig(locationToken).then(location => {
          self._Logger.debug('Location config loaded.');

          self._LocationModel.location = location;
          resolve(location);
        }, reject);
      }, reject);
    });
  }

  loadSeats() {
    var self = this;
    return new Promise((resolve, reject) => {
      self._Logger.debug('Loading location seats...');

      self._DataProvider.seats().then(seats => {
        self._Logger.debug(`Location seats (${seats.length}) loaded.`);

        self._LocationModel.seats = seats;

        self._Logger.debug('Loading current seat info...');

        self._DtsApi.location.getCurrentSeat().then(seat => {
          self._Logger.debug(`Current seat loaded: token=${seat.token}`);

          self._LocationModel.seat = seat;
          resolve(seat);
        }, reject);
      }, reject);
    });
  }
};
