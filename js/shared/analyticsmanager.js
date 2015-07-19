window.app.AnalyticsManager = class AnalyticsManager {
  constructor(TelemetryService, AnalyticsModel, Logger) {
    this._TelemetryService = TelemetryService;
    this._AnalyticsModel = AnalyticsModel;
    this._Logger = Logger;
  }

  submit() {
    this._Logger.debug(`Submitting analytics data with ` +
      `${this._AnalyticsModel.sessions.length} seat sessions, ` +
      `${this._AnalyticsModel.answers.length} answers, ` +
      `${this._AnalyticsModel.chats.length} chats, ` +
      `${this._AnalyticsModel.comments.length} comments, ` +
      `${this._AnalyticsModel.clicks.length} clicks, ` +
      `${this._AnalyticsModel.pages.length} pages, ` +
      `${this._AnalyticsModel.advertisements.length} advertisements and ` +
      `${this._AnalyticsModel.urls.length} URLs.`);

    var self = this;
    return new Promise((resolve, reject) => {
      self._TelemetryService.submitTelemetry({
        sessions: self._AnalyticsModel.sessions.data,
        advertisements: self._AnalyticsModel.advertisements.data,
        answers: self._AnalyticsModel.answers.data,
        chats: self._AnalyticsModel.chats.data,
        comments: self._AnalyticsModel.comments.data,
        clicks: self._AnalyticsModel.clicks.data,
        pages: self._AnalyticsModel.pages.data,
        urls: self._AnalyticsModel.urls.data
      }).then(() => {
        self._AnalyticsModel.clear();
        resolve();
      }, e => {
        self._Logger.warn('Unable to submit analytics data: ' + e.message);
        reject(e);
      });
    });
  }
};
