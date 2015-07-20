(function() {
  /* global swfobject */

  function MediaStarter(id) {

    var flashvars = {};
    var params = {
      menu: 'false',
      wmode: 'direct',
      allowFullScreen: 'false'
    };
    var attributes = {
      id: id,
      name: id
    };

    swfobject.embedSWF(
      this._getQueryParameter('url'),
      id,
      this._getQueryParameter('width'),
      this._getQueryParameter('height'),
      '16.0.0',
      'expressInstall.swf',
      flashvars,
      params,
      attributes,
      function(res) {
        if (res.success !== true) {
          console.error(res);
        }
      }
    );
  }

  MediaStarter.prototype._getQueryParameter = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\#&]" + name + "=([^&#]*)"),
    results = regex.exec(location.hash);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  window.app.MediaStarter = MediaStarter;
})();
