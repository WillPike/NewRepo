angular.module('SNAP.controllers')
.factory('CommandSubmitOrder',
  ['DialogManager', 'LocationModel', 'OrderManager',
  (DialogManager, LocationModel, OrderManager) => {

  return function(options) {
    if (!LocationModel.seat || !LocationModel.seat.token) {
      DialogManager.alert(app.Alert.ERROR_NO_SEAT);
      return;
    }

    var job = DialogManager.startJob();

    options = options || 0;

    OrderManager.submitCart(options).then(() => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_ORDER_SENT);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };
}]);
