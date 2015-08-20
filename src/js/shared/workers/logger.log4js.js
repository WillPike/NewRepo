window.app.Log4JsLogger = class Log4JsLogger {
  constructor() {
    this._log = log4javascript.getLogger();

    // var ajaxAppender = new log4javascript.AjaxAppender('/snap/log');
    // ajaxAppender.setWaitForResponse(true);
    // ajaxAppender.setLayout(new log4javascript.JsonLayout());
    // ajaxAppender.setThreshold(log4javascript.Level.ERROR);
    //
    // this._log.addAppender(ajaxAppender);
    this._log.addAppender(new log4javascript.BrowserConsoleAppender());
  }

  debug(message) {
    this._log.debug(message);
  }

  info(message) {
    this._log.info(message);
  }

  warn(message) {
    this._log.warn(message);
  }

  error(message) {
    this._log.error(message);
  }

  fatal(message) {
    this._log.fatal(message);
  }
};
