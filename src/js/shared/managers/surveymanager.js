window.app.SurveyManager = class SurveyManager extends app.AbstractManager {
  constructor(DataModel, SurveyModel, Logger) {
    super(Logger);

    this._DataModel = DataModel;
    this._SurveyModel = SurveyModel;
  }

  get model() {
    return this._SurveyModel;
  }

  initialize() {
    super.initialize();

    if (this.model.isEnabled) {
      this._DataModel.surveys().then(data => {
        this.model.feedbackSurvey = data.surveys[0];
      });
    }

    return Promise.resolve();
  }

  reset() {
    super.reset();

    return new Promise((resolve, reject) => {
      if (this.model.isEnabled) {
        this.model.feedbackSurveyComplete = false;
      }

      resolve();
    });
  }
};
