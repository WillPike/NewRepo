angular.module('SNAP.controllers')
.controller('NavigationCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'CustomerManager', 'AnalyticsModel', 'CartModel', 'ShellManager', 'DataManager', 'DataModel', 'DialogManager', 'NavigationManager', 'OrderManager', 'CommandCloseTable', 'CommandFlipScreen', 'WebBrowser', 'SNAPEnvironment',
  ($scope, $timeout, ActivityMonitor, CustomerManager, AnalyticsModel, CartModel, ShellManager, DataManager, DataModel, DialogManager, NavigationManager, OrderManager, CommandCloseTable, CommandFlipScreen, WebBrowser, SNAPEnvironment) => {

  $scope.menus = [];

  DataModel.home().then(response => {
    if (!response) {
      return;
    }

    let location = NavigationManager.location,
        limit = SNAPEnvironment.platform === 'desktop' ? 4 : 3;

    $scope.menus = response.menus
      .filter(menu => SNAPEnvironment.platform === 'desktop' || menu.type !== 3)
      .filter((menu, i) => i < limit)
      .map(menu => {
        let destination = {
          type: 'menu',
          token: menu.token
        };
        return {
          token: menu.token,
          title: menu.title,
          url: '#' + NavigationManager.getPath(destination),
          destination: destination,
          selected: location.type === 'menu' && menu.token === location.token
        };
      });
  });

  $scope.navigateHome = () => {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.confirm(app.Alert.TABLE_RESET).then(() => {
        var job = DialogManager.startJob();
        CommandCloseTable().then(() => DialogManager.endJob(job));
      });
      return;
    }

    NavigationManager.location = { type: 'home' };
    CartModel.isCartOpen = false;
  };

  $scope.navigateBack = () => {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(app.Alert.SIGNIN_REQUIRED);
      return;
    }

    NavigationManager.goBack();

    CartModel.isCartOpen = false;
  };

  $scope.rotateScreen = () => {
    ActivityMonitor.activityDetected();
    CommandFlipScreen();
  };

  $scope.openCart = () => {
    ActivityMonitor.activityDetected();

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(app.Alert.SIGNIN_REQUIRED);
      return;
    }

    CartModel.isCartOpen = !CartModel.isCartOpen;
  };

  $scope.openSettings = () => {
    DialogManager.confirm(app.Alert.TABLE_RESET).then(() => {
      var job = DialogManager.startJob();
      CommandCloseTable().then(() => DialogManager.endJob(job));
    });
  };

  $scope.menuOpen = false;

  $scope.toggleMenu = () => {
    $scope.menuOpen = !$scope.menuOpen;
  };

  $scope.advertisementClick = item => {
    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(app.Alert.SIGNIN_REQUIRED);
      return;
    }

    AnalyticsModel.logAdvertisement({
      token: item.token,
      type: 'click'
    });

    if (item.href) {
      WebBrowser.open(item.href.url);
    }
  };

  $scope.advertisementImpression = item => {
    if (ActivityMonitor.active && !$scope.wide) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(value => {
    $timeout(() => $scope.elements = value);
  });

  $scope.advertisementsAll = [];
  $scope.advertisementsTop = [];
  $scope.advertisementsBottom = [];
  var mapAdvertisement = ad => {
    return {
      src: ShellManager.getMediaUrl(ad.src, 970, 90),
      href: ad.href,
      type: ShellManager.getMediaType(ad.src),
      token: ad.token
    };
  };
  DataModel.advertisements().then(response => {
    $timeout(() => {
      $scope.advertisementsTop = response.top.map(mapAdvertisement);
      $scope.advertisementsBottom = response.bottom.map(mapAdvertisement);
      $scope.advertisementsAll = $scope.advertisementsTop.concat($scope.advertisementsBottom);
    });
  });

  $scope.cartCount = OrderManager.model.orderCart.length;
  OrderManager.model.orderCartChanged.add(cart => {
    $timeout(() => $scope.cartCount = cart.length);
  });

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

  var refreshAssistanceRequest = () => {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  refreshAssistanceRequest();

  $scope.customerName = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(() => {
    $timeout(() => $scope.customerName = CustomerManager.customerName);
  });

  $scope.navigate = destination => NavigationManager.location = destination;

  NavigationManager.locationChanged.add(location => {
    $timeout(() => {
      $scope.menus.forEach(menu => {
        //menu.selected = (location.type === 'menu' && menu.token === location.token);
      });
    });
  });
}]);
