angular.module('SNAP.controllers')
.controller('GalaxiesItemCtrl',
  ['$scope', '$timeout', 'CartModel', 'DataManager', 'NavigationManager', 'OrderManager', 'ShellManager', 'WebBrowser', 'CommandSubmitOrder', 'ComponentMenuTitle', 'ComponentItemDescription',
  ($scope, $timeout, CartModel, DataManager, NavigationManager, OrderManager, ShellManager, WebBrowser, CommandSubmitOrder, ComponentMenuTitle, ComponentItemDescription) => {

  const titleId = 'page-item-title';
  const contentId = 'page-item-info';

  $scope.goBack = () => NavigationManager.goBack();
  $scope.goHome = () => NavigationManager.location = { type: 'home' };

  function onClose() {
    if (NavigationManager.location.type === 'item') {
      NavigationManager.goBack();
    }
  }

  function renderTitle(element) {
    if (!element) {
      element = document.getElementById(titleId);
    }

    React.render(
      React.createElement(ComponentMenuTitle, {
        title: '',
        history: []
      }),
      element
    );
  }

  function renderContent(element, entry) {
    if (!element) {
      element = document.getElementById(contentId);
    }

    if (entry) {
      React.render(
        React.createElement(ComponentItemDescription, { entry: entry }),
        element
      );
    }
    else {
      element.innerHTML = '';
    }
  }

  function renderData(entry) {
    var titleElement = document.getElementById(titleId),
        contentElement = document.getElementById(contentId);

    if (titleElement && contentElement) {
      renderTitle(titleElement);
      renderContent(contentElement, entry);
    }
    else {
      $timeout(() => {
        renderTitle(titleElement);
        renderContent(contentElement, entry);
      });
    }
  }

  function reset() {
  }

  DataManager.itemChanged.add(item => {
    if (!item) {
      return;
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

    var entry;

    if (type === 1) {
      entry = new app.CartItem(item, 1);
    }

    renderData(entry);

    $scope.entry = entry;
    $scope.type = type;
    $scope.step = 0;
    $scope.entryIndex = 0;
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
      NavigationManager.goBack();
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
    NavigationManager.goBack();
    CartModel.cartState = CartModel.STATE_CART;
    CartModel.isCartOpen = true;
  };

  NavigationManager.locationChanging.add(location => {
    DataManager.item = location.type === 'item' ? location.token : undefined;
    $scope.visible = Boolean(DataManager.item);

    $timeout(() => reset());
  });
}]);
