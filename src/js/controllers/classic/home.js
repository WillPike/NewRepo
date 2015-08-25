angular.module('SNAP.controllers')
.controller('HomeBaseCtrl', ['$scope', '$timeout', 'DataManager', 'NavigationManager', function($scope, $timeout, DataManager, NavigationManager) {
}]);

angular.module('SNAP.controllers')
.controller('HomeCtrl',
  ['$scope', '$timeout', 'ChatManager', 'DataModel', 'ShellManager', 'CustomerManager', 'OrderManager', 'DialogManager', 'NavigationManager', 'LocationModel', 'SurveyManager', 'SNAPLocation', 'SNAPEnvironment', 'CommandCloseTable',
  ($scope, $timeout, ChatManager, DataModel, ShellManager, CustomerManager, OrderManager, DialogManager, NavigationManager, LocationModel, SurveyManager, SNAPLocation, SNAPEnvironment, CommandCloseTable) => {

  var HomeMenu = React.createClass({
    render: function() {
      var result = [ React.DOM.td({ key: -1 }) ];

      var rows = this.props.tiles.map((tile, i) => {
        return (
          React.DOM.td({
            className: 'home-menu-item',
            key: i
          }, React.DOM.a({
            onClick: e => {
              e.preventDefault();
              NavigationManager.location = tile.destination;
            }
          },
            React.DOM.img({
              src: ShellManager.getMediaUrl(tile.image, 160, 160)
            })
          ))
        );
      });

      result = result.concat(rows);
      result.push(React.DOM.td({ key: result.length }));

      return React.DOM.table(null, result);
    }
  });

  DataModel.home().then(response => {
    if (!response) {
      return;
    }

    var tiles = [];

    response.menus
    .filter(menu => SNAPEnvironment.platform === 'desktop' || menu.type !== 3)
    .reduce((tiles, menu) => {
      if (menu.promos && menu.promos.length > 0) {
        menu.promos
        .filter(promo => SNAPEnvironment.platform === 'desktop' || promo.type !== 3)
        .forEach(promo => {
          tiles.push({
            title: promo.title,
            image: promo.image,
            url: '#' + NavigationManager.getPath(promo.destination),
            destination: promo.destination
          });
        });
      }
      else {
        let destination = {
          type: 'menu',
          token: menu.token
        };

        tiles.push({
          title: menu.title,
          image: menu.image,
          url: '#' + NavigationManager.getPath(destination),
          destination: destination
        });
      }

      return tiles;
    }, tiles);

    $timeout(() => {
      React.render(
        React.createElement(HomeMenu, { tiles: tiles }),
        document.getElementById('home-menu-main')
      );
    }, 1000);
  });

  NavigationManager.locationChanging.add(location => {
    $scope.visible = location.type === 'home';
    $timeout(() => { $scope.$apply(); });
  });

  $scope.preload = destination => {
    NavigationManager.location = destination;
  };

  $scope.getMediaUrl = (media, width, height, extension) => ShellManager.getMediaUrl(media, width, height, extension);
  $scope.predicateEven = ShellManager.predicateEven;
  $scope.predicateOdd = ShellManager.predicateOdd;

  $scope.seat_name = LocationModel.seat ? LocationModel.seat.name : 'Table';
  LocationModel.seatChanged.add(value => {
    $timeout(() => {
      $scope.seat_name = value ? value.name : 'Table';
    });
  });

  $scope.customer_name = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(() => {
    $timeout(() => $scope.customer_name = CustomerManager.customerName);
  });

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(value => {
    $timeout(() => $scope.elements = value);
  });

  var refreshAssistanceRequest = () => {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  var refreshCloseoutRequest = () => {
    $scope.requestCloseoutAvailable = !Boolean(OrderManager.model.closeoutRequest);
  };
  var refreshSurvey = () => {
    $scope.surveyAvailable = SurveyManager.model.isEnabled && SurveyManager.model.feedbackSurvey && !SurveyManager.model.feedbackSurveyComplete;
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  OrderManager.model.closeoutRequestChanged.add(refreshCloseoutRequest);
  SurveyManager.model.feedbackSurveyChanged.add(refreshSurvey);
  SurveyManager.model.surveyCompleted.add(refreshSurvey);
  refreshAssistanceRequest();
  refreshCloseoutRequest();
  refreshSurvey();

  $scope.chatAvailable = Boolean(SNAPLocation.chat);

  $scope.requestAssistance = () => {
    if (!$scope.requestAssistanceAvailable){
      return;
    }

    DialogManager.confirm(app.Alert.TABLE_ASSISTANCE).then(() => {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(() => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_ASSISTANCE_SENT);
      }, () => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.requestCloseout = () => {
    if (!$scope.requestCloseoutAvailable) {
      return;
    }

    DialogManager.confirm(app.Alert.TABLE_CLOSEOUT).then(() => {
      var job = DialogManager.startJob();

      OrderManager.requestCloseout().then(() => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_CLOSEOUT_SENT);
      }, () => {
        DialogManager.endJob(job);
        DialogManager.alert(app.Alert.REQUEST_SUBMIT_ERROR);
      });
    });
  };

  $scope.openSurvey = () => {
    if (!$scope.surveyAvailable) {
      return;
    }

    NavigationManager.location = { type: 'survey' };
  };

  $scope.seatClicked = () => {
    DialogManager.confirm(app.Alert.TABLE_RESET).then(() => {
      var job = DialogManager.startJob();
      CommandCloseTable().then(() => DialogManager.endJob(job));
    });
  };

  $scope.customerClicked = () => {
    if (!CustomerManager.model.isEnabled) {
      return;
    }

    if (CustomerManager.model.isAuthenticated && !CustomerManager.model.isGuest) {
      NavigationManager.location = { type: 'account' };
    }
    else {
      DialogManager.alert(app.Alert.SIGNIN_REQUIRED);
    }
  };

  $scope.openChat = () => {
    NavigationManager.location = { type: 'chat' };
  };
}]);
