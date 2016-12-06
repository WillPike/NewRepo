window.app.DialogManager = class DialogManager extends app.AbstractManager {
  constructor(Logger) {
    super(Logger);

    this.alertRequested = new signals.Signal();
    this.notificationRequested = new signals.Signal();
    this.confirmRequested = new signals.Signal();
    this.jobStarted = new signals.Signal();
    this.jobEnded = new signals.Signal();
    this._jobs = 0;
  }

  get jobs() { return this._jobs; }

  alert(message, title) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.alertRequested.dispatch(message, title, resolve, reject);
    });
  }

  notification(message) {
    this.notificationRequested.dispatch(message);
  }

  confirm(message) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.confirmRequested.dispatch(message, resolve, reject);
    });
  }

  startJob() {
    this._jobs++;

    if (this._jobs === 1) {
      this.jobStarted.dispatch();
    }

    return this._jobs;
  }

  endJob(id) {
    this._jobs--;

    if (this._jobs === 0) {
      this.jobEnded.dispatch();
    }
  }
};
