angular.module('SNAP.controllers')
.controller('DialogCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'DialogManager',
  ($scope, $timeout, ActivityMonitor, DialogManager) => {

  var alertStack = [],
      confirmStack = [];
  var alertIndex = -1,
      confirmIndex = -1;
  var alertTimer;

  function updateVisibility(isBusy, showAlert, showConfirm) {
    $timeout(function() {
      $scope.isBusy = isBusy !== undefined ? isBusy : $scope.isBusy;
      $scope.showAlert = showAlert !== undefined ? showAlert : $scope.showAlert;
      $scope.showConfirm = showConfirm !== undefined ? showConfirm : $scope.showConfirm;
      $scope.visible = $scope.isBusy || $scope.showAlert || $scope.showConfirm;
    });
  }

  function showNextAlert() {
    if (alertTimer) {
      $timeout.cancel(alertTimer);
    }

    var alert = alertStack[alertIndex];

    if (alert && alert.resolve) {
      alert.resolve();
    }

    alertIndex++;

    if (alertIndex === alertStack.length) {
      updateVisibility(undefined, false);
      alertStack = [];
      alertIndex = -1;
      return;
    }

    $timeout(function() {
      $scope.alertTitle = alertStack[alertIndex].title;
      $scope.alertText = alertStack[alertIndex].message;
      updateVisibility(undefined, true);
    });

    alertTimer = $timeout(showNextAlert, 10000);
  }

  function showNextConfirm() {
    confirmIndex++;

    if (confirmIndex === confirmStack.length) {
      updateVisibility(undefined, undefined, false);
      confirmStack = [];
      confirmIndex = -1;
      return;
    }

    $timeout(function() {
      $scope.confirmText = confirmStack[confirmIndex].message;
      updateVisibility(undefined, undefined, true);
    });
  }

  function getMessage(message) {
      if (typeof message !== 'string') {
        switch (message) {
          case app.Alert.GENERIC_ERROR:
            message = "Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.";
            break;
          case app.Alert.REQUEST_SUBMIT_ERROR:
            message = "Oops! My bits are fiddled. Our request system has been disconnected. Please notify a server.";
            break;
          case app.Alert.REQUEST_ASSISTANCE_SENT:
            message = "Call Server request was sent successfully.";
            break;
          case app.Alert.REQUEST_ASSISTANCE_RECEIVED:
            message = "Your request for server assistance has been seen, and accepted.";
            break;
          case app.Alert.REQUEST_CLOSEOUT_SENT:
            message = "Request check request was sent successfully.";
            break;
          case app.Alert.REQUEST_CLOSEOUT_RECEIVED:
            message = "Your check request has been seen, and accepted.";
            break;
          case app.Alert.REQUEST_ORDER_SENT:
            message = "Order sent! You will be notified when your waiter accepts the order.";
            break;
          case app.Alert.REQUEST_ORDER_RECEIVED:
            message = "Your order has been successfully accepted.";
            break;
          case app.Alert.SIGNIN_REQUIRED:
            message = "You must be logged into SNAP to access this page.";
            break;
          case app.Alert.TABLE_ASSISTANCE:
            message = "Are you sure you want to call the waiter?";
            break;
          case app.Alert.TABLE_CLOSEOUT:
            message = "Are you sure you want to request your check?";
            break;
          case app.Alert.TABLE_RESET:
            message = "Are you sure you want to reset?";
            break;
          case app.Alert.DELET_CARD:
            message = "Are you sure you want to remove this payment method?";
            break;
          case app.Alert.PASSWORD_RESET_COMPLETE:
            message = "A link to change your password has been emailed.";
            break;
          case app.Alert.SOFTWARE_OUTDATED:
            message = "A software update is available. Please restart the application.";
            break;
          case app.Alert.CARDREADER_ERROR:
            message = "Unable to read the card data. Please try again.";
            break;
          case app.Alert.ERROR_NO_SEAT:
            message = "Device is not assigned to any table.";
            break;
          case app.Alert.ERROR_STARTUP:
            message = "Unable to start the application.";
            break;
          case app.Alert.ERROR_CACHE_UPDATE:
            message = "Unable to load the application data.";
            break;
          case app.Alert.WARNING_CACHE_OBSOLETE:
            message = "Unable to update the application cache. Falling back to cached version.";
            break;
      }
    }

    return message;
  }

  $scope.visible = false;
  $scope.isBusy = false;
  $scope.showAlert = false;
  $scope.showConfirm = false;

  $scope.closeAlert = () => {
    ActivityMonitor.activityDetected();
    showNextAlert();
  };

  $scope.closeConfirm = confirmed => {
    ActivityMonitor.activityDetected();

    var confirm = confirmStack[confirmIndex];

    if (confirm) {
      if (confirmed) {
        if (confirm.resolve) {
          confirm.resolve();
        }
      }
      else {
        if (confirm.reject) {
          confirm.reject();
        }
      }
    }

    showNextConfirm();
  };

  function alertRequested(message, title, resolve, reject) {
    message = getMessage(message);

    alertStack.push({ title: title, message: message, resolve: resolve, reject: reject });

    if (!$scope.showAlert) {
      $timeout(showNextAlert);
    }
  }

  DialogManager.alertRequested.add(alertRequested);

  function confirmRequested(message, resolve, reject) {
    message = getMessage(message);

    confirmStack.push({ message: message, resolve: resolve, reject: reject });

    if (!$scope.showConfirm) {
      $timeout(showNextConfirm);
    }
  }

  DialogManager.confirmRequested.add(confirmRequested);

  function jobStarted() {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }

    updateVisibility(true);
  }

  DialogManager.jobStarted.add(jobStarted);
  DialogManager.jobEnded.add(function() {
    updateVisibility(false);
  });

  if (DialogManager.jobs > 0) {
    jobStarted();
  }
}]);
