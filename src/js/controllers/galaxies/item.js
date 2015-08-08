angular.module('SNAP.controllers')
.controller('GalaxiesItemCtrl',
  ['$scope', '$timeout', 'DataManager', 'NavigationManager', 'OrderManager', 'ShellManager', 'WebBrowser', 'CommandSubmitOrder',
  ($scope, $timeout, DataManager, NavigationManager, OrderManager, ShellManager, WebBrowser, CommandSubmitOrder) => {

  $scope.goBack = () => NavigationManager.goBack();

  function onClose() {
    if (NavigationManager.location.type === 'item') {
      $timeout(() => $scope.goBack());
    }
  }

  DataManager.itemChanged.add(item => {
    if (!item) {
      return $timeout(() => {
        $scope.entry = $scope.entries = null;
        $scope.type = 1;
        $scope.step = 0;
        $scope.entryIndex = 0;
      });
    }

    var type = item.type;

    if (type === 2 && item.website) {
      WebBrowser
        .open(item.website.url)
        .then(browser => browser.onExit.addOnce(onClose));
    }
    else if (type === 3 && item.flash) {
      let url = WebBrowser.getFlashUrl(item.flash.media.token, item.flash.width, item.flash.height);

      WebBrowser
        .open(url)
        .then(browser => browser.onExit.addOnce(onClose));
    }

    $timeout(() => {
      if (type === 1) {
        $scope.entry = new app.CartItem(item, 1);
      }

      $scope.type = type;
      $scope.step = 0;
      $scope.entryIndex = 0;
    });
  });

  $scope.getMediaUrl = (media, w, h, extension) => ShellManager.getMediaUrl(media, w, h, extension);
  $scope.formatPrice = value => value ? ShellManager.formatPrice(value) : 0;

  $scope.nextStep = () => {
    if ($scope.step === 0) {
      if ($scope.entry.hasModifiers) {
        $scope.entries = $scope.entry.cloneMany();
        $scope.currentEntry = $scope.entries[$scope.entryIndex = 0];
        $scope.step = 1;
      }
      else {
        OrderManager.addToCart($scope.entry);
        $scope.step = 2;
      }
    }
    else if ($scope.step === 1) {
      if ($scope.entryIndex === $scope.entries.length - 1) {
        $scope.entries.forEach(entry => OrderManager.addToCart(entry));
        $scope.step = 2;
      }
      else {
        $scope.currentEntry = $scope.entries[++$scope.entryIndex];
      }
    }
  };

  $scope.previousStep = () => {
    if ($scope.step === 1 && $scope.entryIndex > 0) {
      $scope.currentEntry = $scope.entries[--$scope.entryIndex];
    }
    else if ($scope.step === 0) {
      $scope.goBack();
    }
    else {
      $scope.step--;
    }
  };

  $scope.updateModifiers = (category, modifier) => {
    if (category.data.selection === 1) {
      angular.forEach(category.modifiers, m => m.isSelected = (m === modifier));
    }
    else {
      modifier.isSelected = !modifier.isSelected;
    }
  };

  $scope.submitOrder = () => {
    CommandSubmitOrder();
    $scope.goBack();
  };

  NavigationManager.locationChanging.add(location => {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);
    $timeout(() => $scope.$apply());
  });
}]);
