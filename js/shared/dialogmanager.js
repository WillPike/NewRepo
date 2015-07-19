window.app.DialogManager = class DialogManager {
  constructor() {
    this.alertRequested = new signals.Signal();
    this.notificationRequested = new signals.Signal();
    this.confirmRequested = new signals.Signal();
    this.jobStarted = new signals.Signal();
    this.jobEnded = new signals.Signal();
    this.modalStarted = new signals.Signal();
    this.modalEnded = new signals.Signal();
    this._jobs = 0;
    this._modals = 0;
  }

  alert(message, title) {
    this.alertRequested.dispatch(message, title);
  }

  notification(message) {
    this.notificationRequested.dispatch(message);
  }

  confirm(message) {
    var self = this;
    return new Promise(function(resolve, reject) {
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

  startModal() {
    this._modals++;

    if (this._modals === 1) {
      this.modalStarted.dispatch();
    }

    return this._modals;
  }

  endModal(id) {
    this._modals--;

    if (this._modals === 0) {
      this.modalEnded.dispatch();
    }
  }
};
