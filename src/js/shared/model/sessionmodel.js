window.app.SessionModel = class SessionModel extends app.AbstractModel  {
  constructor(storageProvider) {
    super(storageProvider);

    this._defineProperty('apiToken', 'snap_accesstoken');
    this._defineProperty('customerToken', 'snap_customer_accesstoken');

    this.initialize();
  }
};
