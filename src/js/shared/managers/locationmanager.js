window.app.LocationManager = class LocationManager extends app.AbstractManager {
  constructor(DataModel, DtsApi, LocationModel, Logger) {
    super(Logger);

    this._DataModel = DataModel;
    this._DtsApi = DtsApi;
    this._LocationModel = LocationModel;
  }

  get model() {
    return this._LocationModel;
  }

  loadConfig() {
    var self = this,
        model = self._LocationModel;

    return new Promise((resolve, reject) => {
      function loadConfig() {
        self._Logger.debug('Loading location config...');

        model.fetch('location').then(location => {
          self._Logger.debug(`New '${location.location_name}' location config loaded.`);
          resolve(location);
        }, e => {
          if (!model.location) {
            return reject(e);
          }

          self._Logger.debug(`Fallback to stored location '${model.location.location_name}'.`);
          resolve(model.location);
        });
      }

      model.initialize().then(() => {
        self._Logger.debug('Loading device info...');

        model.fetch('device').then(device => {
          self._Logger.debug(`New device loaded: token=${device.token};location=${device.location_token}`);
          loadConfig();
        }, e => {
          if (!model.device) {
            return reject(e);
          }

          self._Logger.debug(`Fallback to stored device: token=${model.device.token};location=${model.device.location_token}`);
          loadConfig();
        });
      }, reject);
    });
  }

  loadSeats() {
    var self = this,
        model = self._LocationModel;

    return new Promise((resolve, reject) => {
      function loadSeat() {
        self._Logger.debug('Loading current seat info...');

        model.fetch('seat').then(seat => {
          self._Logger.debug(`New seat data loaded for #${seat.token}.`);
          resolve(seat);
        }, e => {
          if (!model.seat) {
            return reject(e);
          }

          self._Logger.debug(`Fallback to stored seat #${model.seat.token}.`);
          resolve(model.seat);
        });
      }

      model.initialize().then(() => {
        self._Logger.debug('Loading location seats...');

        model.fetch('seats').then(seats => {
          self._Logger.debug(`Location seats loaded (${seats.length}).`);
          loadSeat();
        }, e => {
          if (!model.seats) {
            return reject(e);
          }

          self._Logger.debug(`Fallback to stored seats (${model.seats.length}).`);
          loadSeat();
        });
      }, reject);
    });
  }
};
