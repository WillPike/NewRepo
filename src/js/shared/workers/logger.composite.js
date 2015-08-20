window.app.CompositeLogger = class CompositeLogger {
  constructor(loggers) {
    this.loggers = loggers;
  }

  debug(message) {
    this.loggers.forEach(logger => logger.debug(message));
  }

  info(message) {
    this.loggers.forEach(logger => logger.info(message));
  }

  warn(message) {
    this.loggers.forEach(logger => logger.warn(message));
  }

  error(message) {
    this.loggers.forEach(logger => logger.error(message));
  }

  fatal(message) {
    this.loggers.forEach(logger => logger.fatal(message));
  }
};
