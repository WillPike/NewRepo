window.app.SurveyModel = class SurveyModel {
  /* global signals */

  constructor(SNAPLocation, storageProvider) {
    var self = this;

    this._isEnabled = Boolean(SNAPLocation.surveys) && SNAPLocation.theme.layout !== 'galaxies'; //ToDo: remove
    this._surveys = {};

    this._store = storageProvider('snap_survey');

    this._feedbackSurvey = null;
    this.feedbackSurveyChanged = new signals.Signal();

    this.surveyCompleted = new signals.Signal();

    this._store.read().then(value => {
      self._surveys = value || self._surveys;
    });
  }

  get isEnabled() {
    return Boolean(this._isEnabled);
  }

  get feedbackSurvey() {
    return this._feedbackSurvey;
  }

  set feedbackSurvey(value) {
    this._feedbackSurvey = value;
    this.feedbackSurveyChanged.dispatch(this._feedbackSurvey);
  }

  get feedbackSurveyComplete() {
    return Boolean(this._surveys.feedback);
  }

  set feedbackSurveyComplete(value) {
    this._surveys.feedback = Boolean(value);
    this._store.write(this._surveys);

    this.surveyCompleted.dispatch(this.feedbackSurvey);
  }
};
