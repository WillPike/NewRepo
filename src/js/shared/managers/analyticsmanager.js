window.app.AnalyticsManager = class AnalyticsManager extends app.AbstractManager {
  constructor(TelemetryService, AnalyticsModel, Logger) {
    super(Logger);
    this._TelemetryService = TelemetryService;
    this._AnalyticsModel = AnalyticsModel;
  }

  initialize() {
    super.initialize();

    return this.model.initialize();
  }

  reset() {
    super.reset();

    return this.model.reset();
  }

  get model() {
    return this._AnalyticsModel;
  }

  submit() {
    this._Logger.debug(`Submitting analytics data with ` +
      `${this.model.sessions.length} seat sessions, ` +
      `${this.model.answers.length} answers, ` +
      `${this.model.chats.length} chats, ` +
      `${this.model.comments.length} comments, ` +
      `${this.model.clicks.length} clicks, ` +
      `${this.model.pages.length} pages, ` +
      `${this.model.advertisements.length} advertisements and ` +
      `${this.model.urls.length} URLs.`);

    return this.reset();

    var self = this;
    return new Promise((resolve, reject) => {
      self._TelemetryService.submitTelemetry({
        sessions: self.model.sessions.data,
        advertisements: self.model.advertisements.data,
        answers: self.model.answers.data,
        chats: self.model.chats.data,
        comments: self.model.comments.data,
        clicks: self.model.clicks.data,
        pages: self.model.pages.data,
        urls: self.model.urls.data
      }).then(() => {
        self.model.reset();
        resolve();
      }, e => {
        self._Logger.warn(`Unable to submit analytics data: ${e.message}`);
        reject(e);
      });
    });
  }
};
