window.app.SurveyManager = class SurveyManager {
  constructor(DataProvider, SurveyModel) {
    var self = this;

    this._DataProvider = DataProvider;
    this._SurveyModel = SurveyModel;

    if (this._SurveyModel.isEnabled) {
      this._DataProvider.surveys().then(data => {
        self._SurveyModel.feedbackSurvey = data.surveys[0];
      });
    }
  }

  get model() {
    return this._SurveyModel;
  }

  reset() {
    var self = this;
    return new Promise((resolve, reject) => {
      if (self._SurveyModel.isEnabled) {
        self._SurveyModel.feedbackSurveyComplete = false;
      }

      resolve();
    });
  }
};
