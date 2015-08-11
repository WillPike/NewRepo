angular.module('SNAP.controllers')
.controller('CheckoutPaymentCtrl',
  ['$scope', '$timeout', 'CustomerModel', 'CardReader', 'DialogManager', 'OrderManager', 'Logger', 'SNAPEnvironment',
  ($scope, $timeout, CustomerModel, CardReader, DialogManager, OrderManager, Logger, SNAPEnvironment) => {

  CardReader.onReceived.add(data => {
    Logger.debug(`Card reader result: ${JSON.stringify(data)}`);
    var card = {
      number: data.card_number,
      month: data.expiration_month,
      year: data.expiration_year,
      data: data.data
    };

    CardReader.stop();
    cardDataReceived(card);
  });

  CardReader.onError.add(e => {
    Logger.debug(`Card reader error: ${JSON.stringify(e)}`);
    DialogManager.alert(ALERT_CARDREADER_ERROR).then(() => {
      $timeout(() => $scope.payCardCancel());
    });
  });

  $scope.$on('$locationChangeStart', () => {
    CardReader.stop();
  });

  //Generate a payment token
  function generatePaymentToken() {
    var job = DialogManager.startJob();

    OrderManager.generatePaymentToken().then(() => {
      DialogManager.endJob(job);
    }, e => {
      Logger.debug(`Payment token generation error: ${JSON.stringify(e)}`);
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  }

  //Called when a card data is received
  function cardDataReceived(card) {
    $timeout(() => {
      if ($scope.current.items) {
        OrderManager.clearCheck($scope.current.items);
      }
      $scope.current.card_data = card.data;
      $scope.options.step = $scope.STEP_SIGNATURE;
    });
  }

  $scope.canPayCard = SNAPEnvironment.platform === 'mobile';

  //Choose to pay with a credit card
  $scope.payCard = () => {
    $scope.current.payment_method = $scope.PAYMENT_METHOD_CARD;
    CardReader.start();
  };

  $scope.payCardCancel = () => {
    $scope.current.payment_method = undefined;
    CardReader.stop();
  };

  //Choose to pay with cash
  $scope.payCash = () => {
    $scope.current.payment_method = $scope.PAYMENT_METHOD_CASH;

    if (OrderManager.model.closeoutRequest !== null) {
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
      $timeout(() => {
        if ($scope.current.items) {
          OrderManager.clearCheck($scope.current.items);
        }
        $scope.options.step = $scope.STEP_COMPLETE;
      });
      return;
    }

    var job = DialogManager.startJob();

    OrderManager.requestCloseout().then(() => {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);
      $timeout(() => {
        if ($scope.current.items) {
          OrderManager.clearCheck($scope.current.items);
        }
        $scope.options.step = $scope.STEP_COMPLETE;
      });
    }, e => {
      Logger.debug(`Request closeout error: ${JSON.stringify(e)}`);
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  generatePaymentToken();
}]);
