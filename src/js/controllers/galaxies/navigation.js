angular.module('SNAP.controllers')
.controller('GalaxiesNavigationCtrl',
  ['$scope', '$timeout', 'ActivityMonitor', 'CustomerManager', 'AnalyticsModel', 'CartModel', 'ShellManager', 'DataManager', 'DataProvider', 'DialogManager', 'LocationModel', 'ManagementService', 'NavigationManager', 'OrderManager', 'CommandReset', 'CommandSubmitOrder', 'CommandFlipScreen', 'WebBrowser', 'SNAPEnvironment',
  ($scope, $timeout, ActivityMonitor, CustomerManager, AnalyticsModel, CartModel, ShellManager, DataManager, DataProvider, DialogManager, LocationModel, ManagementService, NavigationManager, OrderManager, CommandReset, CommandSubmitOrder, CommandFlipScreen, WebBrowser, SNAPEnvironment) => {

  $scope.menus = [];

  DataProvider.home().then(response => {
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

  $scope.advertisementClick = item => {
    if (item.href) {
      NavigationManager.location = { type: 'url', url: item.href.url };
    }
  };

  $scope.currentAdvertisement;

  $scope.advertisementImpression = item => {
    $scope.currentAdvertisement = item;

    if (ActivityMonitor.active && $scope.menuOpen) {
      AnalyticsModel.logAdvertisement({
        token: item.token,
        type: 'impression'
      });
    }
  };

  $scope.advertisements = [];

  DataProvider.advertisements().then(data => {
    $timeout(() => {
      $scope.advertisements = data.misc
        .map(ad => {
          return {
            src: ShellManager.getMediaUrl(ad.src, 300, 250),
            href: ad.href,
            type: ShellManager.getMediaType(ad.src),
            token: ad.token
          };
        });
    });
  });

  $scope.navigateHome = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    NavigationManager.location = { type: 'home' };
  };

  $scope.navigateBack = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    NavigationManager.goBack();
  };

  $scope.rotateScreen = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    CommandFlipScreen();
  };

  $scope.openCart = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    CartModel.isCartOpen = !CartModel.isCartOpen;
  };

  $scope.seatName = LocationModel.seat ? LocationModel.seat.name : 'Table';
  LocationModel.seatChanged.add(value => $timeout(() => $scope.seatName = value ? value.name : 'Table'));

  $scope.resetTable = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;
    DialogManager.confirm(ALERT_TABLE_RESET).then(() => {
      DialogManager.startJob();
      CommandReset();
    });
  };

  $scope.menuOpen = false;

  $scope.toggleMenu = () => {
    ActivityMonitor.activityDetected();
    $scope.menuOpen = !$scope.menuOpen;

    if ($scope.currentAdvertisement && $scope.menuOpen) {
      AnalyticsModel.logAdvertisement({
        token: $scope.currentAdvertisement.token,
        type: 'impression'
      });
      $scope.currentAdvertisement = null;
    }
  };

  $scope.settingsOpen = false;

  $scope.toggleSettings = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = !$scope.settingsOpen;
  };

  $scope.elements = ShellManager.model.elements;
  ShellManager.model.elementsChanged.add(value => {
    $timeout(() => $scope.elements = value);
  });

  $scope.cartCount = OrderManager.model.orderCart.length;
  OrderManager.model.orderCartChanged.add(cart => {
    $timeout(() => $scope.cartCount = cart.length);
  });

  $scope.checkoutEnabled = CustomerManager.model.isEnabled;

  $scope.totalOrder = OrderManager.model.orderCheck;
  OrderManager.model.orderCheckChanged.add(value => {
    $timeout(() => $scope.totalOrder = value);
  });

  $scope.requestAssistance = () => {
    if (!$scope.requestAssistanceAvailable){
      return;
    }

    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    DialogManager.confirm(ALERT_TABLE_ASSISTANCE).then(() => {
      var job = DialogManager.startJob();

      OrderManager.requestAssistance().then(() => {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_ASSISTANCE_SENT);
      }, () => {
        DialogManager.endJob(job);
        DialogManager.alert(ALERT_REQUEST_SUBMIT_ERROR);
      });
    });
  };

  var refreshAssistanceRequest = () => {
    $scope.requestAssistanceAvailable = !Boolean(OrderManager.model.assistanceRequest);
  };
  OrderManager.model.assistanceRequestChanged.add(refreshAssistanceRequest);
  refreshAssistanceRequest();

  $scope.submitOrder = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    CommandSubmitOrder();
  };

  $scope.viewOrder = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    CartModel.cartState = CartModel.STATE_CART;
    CartModel.isCartOpen = true;
  };

  $scope.payBill = () => {
    ActivityMonitor.activityDetected();
    $scope.settingsOpen = false;

    if (CustomerManager.model.isEnabled && !CustomerManager.model.isAuthenticated) {
      DialogManager.alert(ALERT_SIGNIN_REQUIRED);
      return;
    }

    CartModel.cartState = CartModel.STATE_HISTORY;
    CartModel.isCartOpen = true;
  };

  $scope.customerName = CustomerManager.customerName;
  CustomerManager.model.profileChanged.add(() => {
    $timeout(() => $scope.customerName = CustomerManager.customerName);
  });

  $scope.settings = {
    displayBrightness: 100,
    soundVolume: 100
  };

  ManagementService.getSoundVolume().then(
    value => $timeout(() => {
      $scope.settings.soundVolume = value;

      $scope.$watch('settings.soundVolume', (value, old) => {
        if (!value || value === old) {
          return;
        }

        value = parseInt(value);

        ActivityMonitor.activityDetected();
        ManagementService.setSoundVolume(value);
      });
    }),
    e => { }
  );

  ManagementService.getDisplayBrightness().then(
    value => $timeout(() => {
      $scope.settings.displayBrightness = value;

      $scope.$watch('settings.displayBrightness', (value, old) => {
        if (!value || value === old) {
          return;
        }

        value = parseInt(value);

        ActivityMonitor.activityDetected();
        ManagementService.setDisplayBrightness(value);
      });
    }),
    e => { }
  );

  $scope.navigate = destination => NavigationManager.location = destination;

  NavigationManager.locationChanging.add(location => {
    $scope.visible = location.type !== 'signin';
    $timeout(() => $scope.$apply());
  });

  NavigationManager.locationChanged.add(location => {
    $timeout(() => {
      if (location.type !== 'category' && location.type !== 'item') {
        $scope.menus.forEach(menu => {
          menu.selected = (location.type === 'menu' && menu.token === location.token);
        });
      }

      $scope.menuOpen = false;
      $scope.settingsOpen = false;
    });
  });
}]);
