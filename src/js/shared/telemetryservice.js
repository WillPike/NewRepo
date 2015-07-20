window.app.TelemetryService = class TelemetryService {
  constructor($resource) {
    this._api = {
      'submitTelemetry': $resource('/snap/telemetry', {}, { query: { method: 'POST' } }),
      'submitLogs': $resource('/snap/logs', {}, { query: { method: 'POST' } })
    };
  }

  submitTelemetry(data) {
    return this._api.submitTelemetry.query(data).$promise;
  }

  submitLogs(data) {
    return this._api.submitLogs.query(data).$promise;
  }
};
