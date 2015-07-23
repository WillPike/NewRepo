window.app.HeatMap = class HeatMap {
  constructor(element) {
    var self = this;

    this._listener = e => {
      self._onClick(e);
    };

    this._element = element;
    this._element.addEventListener('click', this._listener);

    this.clicked = new signals.Signal();
  }

  dispose() {
    this._element.removeEventListener('click', this._listener);
  }

  _onClick(e) {
    let data = {
      x: e.layerX / this._element.clientWidth,
      y: e.layerY / this._element.clientHeight
    };

    if (data.x < 0 || data.y < 0 || data.x > 1 || data.y > 1) {
      return;
    }

    this.clicked.dispatch(data);
  }
};
