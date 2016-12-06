window.app.ElectronLogger = class ElectronLogger {
  constructor() {
    if (!require) {
      throw new Error('Node.js context not found.');
    }

    this._ipc = require('ipc');

    if (!this._ipc) {
      throw new Error('IPC module not found.');
    }
  }

  debug(message) {
    this._ipc.send('log', {
      level: 'debug',
      message: message
    });
  }

  info(message) {
    this._ipc.send('log', {
      level: 'info',
      message: message
    });
  }

  warn(message) {
    this._ipc.send('log', {
      level: 'warn',
      message: message
    });
  }

  error(message) {
    this._ipc.send('log', {
      level: 'error',
      message: message
    });
  }

  fatal(message) {
    this._ipc.send('log', {
      level: 'fatal',
      message: message
    });
  }
};
