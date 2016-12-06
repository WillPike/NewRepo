window.app.AnalyticsModel = class AnalyticsModel {
  constructor(storageProvider, heatmap, Logger) {
    var self = this;
    this._data = [
      new app.AnalyticsData('sessions', storageProvider),
      new app.AnalyticsData('advertisements', storageProvider),
      new app.AnalyticsData('answers', storageProvider),
      new app.AnalyticsData('chats', storageProvider),
      new app.AnalyticsData('comments', storageProvider),
      new app.AnalyticsData('clicks', storageProvider),
      new app.AnalyticsData('pages', storageProvider),
      new app.AnalyticsData('urls', storageProvider)
    ].reduce((result, item) => {
      result[item.name] = item;
      return result;
    }, {});

    heatmap.clicked.add(click => {
      self._logClick(click);
    });

    this._Logger = Logger;
  }

  initialize() {
    return Q.allSettled(this._datas.map(d => d.initialize()));
  }

  logSession(session) {
    this._data.sessions.push(session);
  }

  get sessions() {
    return this._data.sessions;
  }

  logNavigation(destination) {
    this._data.pages.push({
      time: new Date(),
      destination: destination
    });

    this._data.clicks.store();
  }

  get pages() {
    return this._data.pages;
  }

  logAdvertisement(advertisement) {
    this._data.advertisements.push({
      time: new Date(),
      advertisement: advertisement
    });
  }

  get advertisements() {
    return this._data.advertisements;
  }

  logAnswer(answer) {
    this._data.answers.push({
      time: new Date(),
      answer: answer
    });
  }

  get answers() {
    return this._data.answers;
  }

  logChat(chat) {
    this._data.chats.push({
      time: new Date(),
      chat: chat
    });
  }

  get chats() {
    return this._data.chats;
  }

  logComment(comment) {
    this._data.comments.push({
      time: new Date(),
      comment: comment
    });
  }

  get comments() {
    return this._data.comments;
  }

  logUrl(url) {
    this._data.urls.push({
      time: new Date(),
      url: url
    });
  }

  get urls() {
    return this._data.urls;
  }

  get clicks() {
    this._data.clicks.store();

    return this._data.clicks;
  }

  get _datas() {
    return Object.keys(this._data).map(x => this._data[x]);
  }

  reset() {
    return Q.allSettled(this._datas.map(d => d.reset()));
  }

  _logClick(click) {
    click.time = new Date();
    this._data.clicks.data.push(click);
  }
};
