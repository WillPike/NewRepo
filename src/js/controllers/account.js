angular.module('SNAP.controllers')
.controller('AccountCtrl', ['$scope', 'CustomerManager', 'DialogManager', 'NavigationManager', function($scope, CustomerManager, DialogManager, NavigationManager) {

  if (!CustomerManager.model.isEnabled || !CustomerManager.model.isAuthenticated) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  //------------------------------------------------------------------------
  //
  //  Constants
  //
  //------------------------------------------------------------------------

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  //-----------------------------------------------
  //    Profile
  //-----------------------------------------------

  $scope.profile = CustomerManager.model.profile;
  $scope.canChangePassword = CustomerManager.model.hasCredentials;
  var profile = $scope.$watchAsProperty('profile');

  CustomerManager.model.profileChanged.add(function(value) {
    $scope.profile = value;
    $scope.canChangePassword = CustomerManager.model.hasCredentials;
    $scope.canChangeEmail = CustomerManager.model.hasCredentials;
  });

  //-----------------------------------------------
  //    Splash screen
  //-----------------------------------------------

  $scope.editProfile = function() {
    $scope.profileedit = angular.copy($scope.profile);
    $scope.showProfileEdit = true;
  };

  $scope.editPassword = function() {
    $scope.passwordedit = {
      old_password: '',
      new_password: ''
    };
    $scope.showProfileEdit = false;
    $scope.showPasswordEdit = true;
  };

  $scope.editPayment = function() {
    $scope.showPaymentEdit = true;
  };

  //-----------------------------------------------
  //    Profile edit screen
  //-----------------------------------------------

  $scope.profileEditSubmit = function() {
    var job = DialogManager.startJob();

    CustomerManager.updateProfile($scope.profileedit).then(function() {
      DialogManager.endJob(job);
      $scope.showProfileEdit = false;
    }, function(e) {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.profileEditCancel = function() {
    $scope.showProfileEdit = false;
  };

  //-----------------------------------------------
  //    Password edit screen
  //-----------------------------------------------

  $scope.passwordEditSubmit = function() {
    var job = DialogManager.startJob();

    CustomerManager.changePassword($scope.passwordedit).then(function() {
      DialogManager.endJob(job);
      $scope.showPasswordEdit = false;
    }, function(e) {
      DialogManager.endJob(job);
      DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
    });
  };

  $scope.passwordEditCancel = function() {
    $scope.showPasswordEdit = false;
  };
}]);
