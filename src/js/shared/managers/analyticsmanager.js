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

  get model() {
    return this._AnalyticsModel;
  }

  finalize() {
    super.finalize();

    this._Logger.debug(`Submitting analytics data with ` +
      `${this.model.sessions.length} seat sessions, ` +
      `${this.model.answers.length} answers, ` +
      `${this.model.chats.length} chats, ` +
      `${this.model.comments.length} comments, ` +
      `${this.model.clicks.length} clicks, ` +
      `${this.model.pages.length} pages, ` +
      `${this.model.advertisements.length} advertisements and ` +
      `${this.model.urls.length} URLs.`);

    return new Promise((resolve, reject) => {
      this._TelemetryService.submitTelemetry({
        sessions: this.model.sessions.data,
        advertisements: this.model.advertisements.data,
        answers: this.model.answers.data,
        chats: this.model.chats.data,
        comments: this.model.comments.data,
        clicks: this.model.clicks.data,
        pages: this.model.pages.data,
        urls: this.model.urls.data
      }).then(() => {
        this.model.reset();
        resolve();
      }, e => {
        this._Logger.warn(`Unable to submit analytics data: ${e.message}`);
        reject(e);
      });
    });
  }
};
