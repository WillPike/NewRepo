angular.module('SNAP.controllers')
.controller('SurveyCtrl', ['$scope', '$timeout', 'AnalyticsModel', 'CustomerManager', 'CustomerModel', 'DialogManager', 'NavigationManager', 'OrderManager', 'SurveyManager', function($scope, $timeout, AnalyticsModel, CustomerManager, CustomerModel, DialogManager, NavigationManager, OrderManager, SurveyManager) {

  if (!SurveyManager.model.isEnabled || !SurveyManager.model.feedbackSurvey || SurveyManager.model.feedbackSurveyComplete) {
    NavigationManager.location = { type: 'home' };
    return;
  }

  //------------------------------------------------------------------------
  //
  //  Properties
  //
  //------------------------------------------------------------------------

  $scope.comment = '';
  $scope.email = '';
  $scope.had_problems = false;

  //-----------------------------------------------
  //    Pages
  //-----------------------------------------------

  $scope.pages = [];
  var pages = $scope.$watchAsProperty('pages');

  //-----------------------------------------------
  //    Index
  //-----------------------------------------------

  $scope.pageIndex = -1;
  var pageIndex = $scope.$watchAsProperty('pageIndex');
  pageIndex.changes()
    .subscribe(function() {
      $scope.page = $scope.pageIndex > -1 ? $scope.pages[$scope.pageIndex] : { questions: [] };

      $timeout(function() {
        $scope.page.forEach(function(item) {
          if (item.type !== 1) {
            return;
          }

          $('#rate-' + item.token).rateit({
            min: 0,
            max: 5,
            step: 1,
            resetable: false,
            backingfld: '#range-' + item.token
          }).bind('rated', function(event, value) {
            item.feedback = value;
          });
        });
      });
    });

  //-----------------------------------------------
  //    Count
  //-----------------------------------------------

  $scope.pageCount = 0;
  pages.changes()
    .subscribe(function() {
      $scope.pageCount = $scope.pages.length;
    });

  //------------------------------------------------------------------------
  //
  //  Private methods
  //
  //------------------------------------------------------------------------

  var generatePassword = function() {
    var length = 8,
        charset = 'abcdefghknpqrstuvwxyzABCDEFGHKMNPQRSTUVWXYZ23456789',
        result = '';
    for (var i = 0, n = charset.length; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * n));
    }
    return result;
  };

  var submitFeedback = function() {
    $scope.pages.reduce((answers, page) => {
      return page.reduce((answers, question) => {
        let value = parseInt(question.feedback);

        if (value > 0) {
          answers.push({
            survey: SurveyManager.model.feedbackSurvey.token,
            question: question.token,
            value: value
          });
        }

        return answers;
      }, answers);
    }, [])
    .forEach(answer => AnalyticsModel.logAnswer(answer));

    if ($scope.comment && $scope.comment.length > 0) {
      AnalyticsModel.logComment({
        type: 'feedback',
        text: $scope.comment
      });
    }

    SurveyManager.model.feedbackSurveyComplete = true;

    if ($scope.had_problems && !OrderManager.model.assistanceRequest) {
      OrderManager.requestAssistance();
    }

    if (CustomerModel.isGuest && $scope.email && $scope.email.length > 0) {
      var job = DialogManager.startJob();
      var password = generatePassword();

      CustomerManager.login({
        email: $scope.email,
        password: password
      }).then(function() {
        CustomerManager.login({
          login: $scope.email,
          password: password
        }).then(function() {
          DialogManager.endJob(job);
          NavigationManager.location = { type: 'home' };
        }, function() {
          DialogManager.endJob(job);
          NavigationManager.location = { type: 'home' };
        });
      }, function() {
        DialogManager.endJob(job);
        NavigationManager.location = { type: 'home' };
      });
    }
    else {
      NavigationManager.location = { type: 'home' };
    }
  };

  //------------------------------------------------------------------------
  //
  //  Public methods
  //
  //------------------------------------------------------------------------

  $scope.previousPage = function() {
    if ($scope.pageIndex > 0) {
      $scope.pageIndex--;
    }
  };

  $scope.nextPage = function() {
    if ($scope.pageIndex < $scope.pageCount - 1) {
      $scope.pageIndex++;
    }
    else {
      $scope.nextStep();
    }
  };

  $scope.nextStep = function() {
    if (CustomerModel.isGuest && $scope.step < 3) {
      $scope.step++;
    }
    else if (!CustomerModel.isGuest && $scope.step < 2) {
      $scope.step++;
    }
    else {
      submitFeedback();
    }
  };

  $scope.submitProblem = function(status) {
    $scope.had_problems = Boolean(status);
    $scope.nextStep();
  };

  $scope.exit = function() {
    if ($scope.step > 0) {
      submitFeedback();
    }

    NavigationManager.location = { type: 'home' };
  };

  //------------------------------------------------------------------------
  //
  //  Startup
  //
  //------------------------------------------------------------------------

  (function() {
    var page;

    $scope.has_email = CustomerModel.hasCredentials;

    function buildSurvey() {
      SurveyManager.model.feedbackSurvey.questions.forEach(function(item) {
        if (item.type !== 1) {
          return;
        }

        if (!page || page.length > 4) {
          page = [];
          $scope.pages.push(page);
        }

        item.feedback = 0;
        page.push(item);
      });
    }

    if (SurveyManager.model.isEnabled && SurveyManager.model.feedbackSurvey) {
      buildSurvey();
    }

    SurveyManager.model.feedbackSurveyChanged.add(() => buildSurvey());

    $scope.pageIndex = 0;
    $scope.step = 0;
  })();
}]);
