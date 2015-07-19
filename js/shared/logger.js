window.app.Logger = class {
  constructor(SNAPEnvironment) {
    this._SNAPEnvironment = SNAPEnvironment;
    this._log = log4javascript.getLogger();

    var ajaxAppender = new log4javascript.AjaxAppender('/snap/log');
    ajaxAppender.setWaitForResponse(true);
    ajaxAppender.setLayout(new log4javascript.JsonLayout());
    ajaxAppender.setThreshold(log4javascript.Level.ERROR);

    this._log.addAppender(ajaxAppender);
    this._log.addAppender(new log4javascript.BrowserConsoleAppender());
  }

  debug(...args) {
    this._log.debug(...args);
  }

  info(...args) {
    this._log.info(...args);
  }

  warn(...args) {
    this._log.warn(...args);
  }

  error(...args) {
    this._log.error(...args);
  }

  fatal(...args) {
    this._log.fatal(...args);
  }
};
