window.app.LocationConfig = class LocationConfig {
  constructor(data) {
    if (data) {
      this.inject(data);
    }
  }
  
  inject(data) {
    Object.keys(data).map(k => {
      this[k] = data[k];
    });
  }
};
