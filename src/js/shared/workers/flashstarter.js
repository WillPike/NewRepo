window.app.FlashStarter = class FlashStarter {
  /* global swfobject */

  constructor(Logger, SNAPHosts) {
    this._Logger = Logger;
    this._SNAPHosts = SNAPHosts;
  }

  start(containerId, url, width, height) {
    var flashvars = {},
        params = {
          menu: 'false',
          wmode: 'direct',
          allowFullScreen: 'false'
        },
        attributes = {
          id: containerId,
          name: containerId
        },
        self = this;

    swfobject.embedSWF(
      url,
      containerId,
      width,
      height,
      '16.0.0',
      'expressInstall.swf',
      flashvars,
      params,
      attributes,
      function(res) {
        if (res.success !== true) {
          self._Logger.warn(`Unable to start Flash in container #${containerId}: ${url} ${width}/${height}`);
        }
      }
    );
  }
};
