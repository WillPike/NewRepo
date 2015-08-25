angular.module('SNAP.controllers')
.controller('SignInCtrl',
  ['$scope', '$timeout', 'CommandCustomerLogin', 'CommandCustomerGuestLogin', 'CommandCustomerSocialLogin', 'CommandCustomerSignup', 'CustomerManager', 'DialogManager', 'NavigationManager', 'SessionManager', 'SNAPLocation', 'WebBrowser',
  ($scope, $timeout, CommandCustomerLogin, CommandCustomerGuestLogin, CommandCustomerSocialLogin, CommandCustomerSignup, CustomerManager, DialogManager, NavigationManager, SessionManager, SNAPLocation, WebBrowser) => {

  var STEP_SPLASH = 1,
      STEP_LOGIN = 2,
      STEP_REGISTRATION = 3,
      STEP_GUESTS = 4,
      STEP_EVENT = 5,
      STEP_RESET = 6,
      STEP_SOCIAL = 7;

  $scope.STEP_SPLASH = STEP_SPLASH;
  $scope.STEP_LOGIN = STEP_LOGIN;
  $scope.STEP_REGISTRATION = STEP_REGISTRATION;
  $scope.STEP_GUESTS = STEP_GUESTS;
  $scope.STEP_EVENT = STEP_EVENT;
  $scope.STEP_RESET = STEP_RESET;
  $scope.STEP_SOCIAL = STEP_SOCIAL;

  $scope.locationName = SNAPLocation.location_name;

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Login
  //-----------------------------------------------

  $scope.login = () => {
    $scope.credentials = {};
    $scope.step = STEP_LOGIN;
  };

  $scope.guestLogin = () => {
    var job = DialogManager.startJob();

    CommandCustomerGuestLogin().then(() => {
      DialogManager.endJob(job);
      $timeout(() => $scope.step = STEP_GUESTS);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.doLogin = (credentials) => {
    var job = DialogManager.startJob();

    $scope.credentials.username = $scope.credentials.email;

    CommandCustomerLogin($scope.credentials).then(() => {
      DialogManager.endJob(job);
      $timeout(() => $scope.step = STEP_GUESTS);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.GENERIC_ERROR);
    });
  };

  //-----------------------------------------------
  //    Social login
  //-----------------------------------------------

  $scope.loginFacebook = () => {
    socialBusy();
    CommandCustomerSocialLogin.facebook().then(socialLogin, socialError);
  };

  $scope.loginTwitter = () => {
    socialBusy();
    CommandCustomerSocialLogin.twitter().then(socialLogin, socialError);
  };

  $scope.loginGoogle = () => {
    socialBusy();
    CommandCustomerSocialLogin.googleplus().then(socialLogin, socialError);
  };

  $scope.loginSocialCancel = () => {
    socialBusyEnd();
  };

  //-----------------------------------------------
  //    Registration
  //-----------------------------------------------

  $scope.register = () => {
    $scope.registration = {};
    $scope.step = STEP_REGISTRATION;
  };

  $scope.doRegistration = () => {
    $scope.registration.username = $scope.registration.email;

    var job = DialogManager.startJob();

    CommandCustomerSignup($scope.registration).then(() => {
      DialogManager.endJob(job);
      $timeout(() => $scope.step = STEP_GUESTS);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  //-----------------------------------------------
  //    Guest count
  //-----------------------------------------------

  $scope.session = {
    guestCount: 1,
    special: false
  };

  $scope.submitGuestCount = () => {
    if ($scope.session.guestCount > 1) {
      SessionManager.guestCount = $scope.session.guestCount;
      $scope.step = STEP_EVENT;
    }
    else {
      endSignIn();
    }
  };

  //-----------------------------------------------
  //    Event
  //-----------------------------------------------

  $scope.submitSpecialEvent = (value) => {
    $scope.session.special = SessionManager.specialEvent = Boolean(value);
    endSignIn();
  };

  //-----------------------------------------------
  //    Reset password
  //-----------------------------------------------

  $scope.resetPassword = () => {
    $scope.passwordreset = {};
    $scope.step = STEP_RESET;
  };

  $scope.passwordResetSubmit = () => {
    var job = DialogManager.startJob();

    CustomerManager.resetPassword($scope.passwordreset).then(() => {
      DialogManager.endJob(job);
      $scope.passwordReset = false;
      DialogManager.alert(app.Alert.PASSWORD_RESET_COMPLETE);
    }, () => {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.passwordResetCancel = () => {
    $scope.step = STEP_SPLASH;
  };

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  function socialLogin() {
    socialBusyEnd();
    $timeout(() => $scope.step = STEP_GUESTS);
  }

  function socialError(e) {
    socialBusyEnd();

    if (e) {
      console.error(e);
      DialogManager.alert(app.Alert.GENERIC_ERROR);
    }
  }

  var socialStep;

  function socialBusy() {
    socialStep = $scope.step;
    $scope.step = STEP_SOCIAL;
  }

  function socialBusyEnd() {
    if (socialStep) {
      $scope.step = socialStep;
      socialStep = undefined;

      WebBrowser.close();
    }
  }

  function endSignIn() {
    NavigationManager.location = { type: 'home' };
  }

  //------------------------------------------------------------------------
  //
  //  State
  //
  //------------------------------------------------------------------------

  $scope.$watchAsProperty('step')
    .skipDuplicates()
    .subscribe(value => {
      if (!value.value) {
        return;
      }

      var step = value.value();

      if (step === $scope.STEP_GUESTS) {
        $scope.submitGuestCount();
      }
    });

  //------------------------------------------------------------------------
  //
  //  Startup
  //
  //------------------------------------------------------------------------

  if (!CustomerManager.model.isEnabled || CustomerManager.model.isAuthenticated) {
    return endSignIn();
  }

  $scope.initialized = true;
  $scope.step = STEP_SPLASH;
}]);
