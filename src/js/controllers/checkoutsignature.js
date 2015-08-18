angular.module('SNAP.controllers')
.controller('CheckoutSignatureCtrl',
  ['$scope', '$timeout', 'DialogManager', 'OrderManager', 'Logger',
  ($scope, $timeout, DialogManager, OrderManager, Logger) => {

  //Clear the current signature
  var resetSignature = () => {
    $timeout(() => {
      $scope.current.signature_token = undefined;

      var signature = $('#checkout-signature-input');
      signature.empty();
      signature.jSignature('init', {
        'color' : '#000',
        'background-color': '#fff',
        'decor-color': '#fff',
        'width': '100%',
        'height': '200px'
      });
    }, 300);
  };

  //Submit the current signature input
  $scope.signatureSubmit = () => {
    var signature = $('#checkout-signature-input');

    if (signature.jSignature('getData', 'native').length === 0) {
      return;
    }

    var job = DialogManager.startJob();
    var sig = signature.jSignature('getData', 'image');

    OrderManager.uploadSignature(sig[1]).then(token => {
      DialogManager.endJob(job);

      $timeout(function() {
        $scope.current.signature_token = token;
        completeCheckout();
      });
    }, e => {
      Logger.debug(`Signature upload error: ${JSON.stringify(e)}`);
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  };

  //Cancel the current signature input
  $scope.signatureCancel = () => {
    resetSignature();
  };

  //Complete the checkout
  function completeCheckout() {
    var item = $scope.current;
    var job = DialogManager.startJob();

    var request = {
      amount_subtotal: item.subtotal,
      amount_tax: item.tax,
      amount_tip: item.tip,
      card_data: item.card_data,
      signature_token: item.signature_token,
      payment_token: item.payment_token,
      order_tokens: item.items !== null ?
        item.items.reduce(function(result, item) {
            for (var i = 0; i < item.quantity; i++) {
              result.push(item.request);
            }

            return result;
          }, [])
        : null
    };

    OrderManager.payOrder(request).then(result => {
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_CLOSEOUT_SENT);

      $timeout(() => {
        $scope.current.checkout_token = result.token;
        $scope.options.step = $scope.STEP_RECEIPT;
      });
    }, e => {
      Logger.debug(`Order payment error: ${JSON.stringify(e)}`);
      DialogManager.endJob(job);
      DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
    });
  }

  var step = $scope.$watchAsProperty('options.step');
  step
  .skipDuplicates()
  .subscribe(value => {
    if (!value.value || value.value() !== $scope.STEP_SIGNATURE) {
      return;
    }

    resetSignature();
  });
}]);
