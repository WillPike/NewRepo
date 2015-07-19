angular.module('SNAP.controllers')
  .controller('GalaxiesItemEditCtrl',
  ['$scope', 'ShellManager', 'NavigationManager', 'OrderManager', 'CartModel', 'CommandSubmitOrder',
    ($scope, ShellManager, NavigationManager, OrderManager, CartModel, CommandSubmitOrder) => {

      $scope.getMediaUrl = (media, width, height, extension) => ShellManager.getMediaUrl(media, width, height, extension);
      $scope.formatPrice = value => ShellManager.formatPrice(value);

      var currentIndex = -1;

      var refreshNavigation = function() {
        if ($scope.entry && $scope.entry.hasModifiers) {
          $scope.hasNextCategory = $scope.entry.modifiers.length > 1 &&
            currentIndex < $scope.entry.modifiers.length - 1;
          $scope.hasPreviousCategory = currentIndex > 0;
          $scope.category = $scope.entry.modifiers[currentIndex];
          $scope.canExit = CartModel.editableItemNew;
          $scope.canDone = true;
        }
      };

      NavigationManager.locationChanging.add(function(location) {
        if (location.type !== 'menu' && location.type !== 'category') {
          $scope.exit();
        }
      });

      CartModel.isCartOpenChanged.add(function(value) {
        if (value) {
          $scope.exit();
        }
      });

      var init = function(value) {
        $scope.entry = value;
        $scope.visible = $scope.entry != null;

        currentIndex = 0;

        refreshNavigation();
      };

      init(CartModel.editableItem);

      CartModel.editableItemChanged.add(function(value) {
        init(value);
      });

      $scope.getModifierTitle = function(modifier) {
        return modifier.data.title + (modifier.data.price > 0 ?
            ' (+' + ShellManager.formatPrice(modifier.data.price) + ')' :
              ''
          );
      };

      $scope.leftButtonClick = function(){
        var result = (currentIndex > 0) ? ($scope.previousCategory()) : $scope.exit();
      };

      $scope.leftButtonText = function(){
        return (currentIndex > 0) ? 'Back' : 'Exit';
      };

      $scope.showLeftButton = function(){
        return (currentIndex > 0);
      };

      $scope.rightButtonClick = function(){
        //Make sure Pick 1 modifier categories have met the selection condition.
        if($scope.entry.modifiers[currentIndex].data.selection === 1) {
          var numSelected = 0;
          angular.forEach($scope.entry.modifiers[currentIndex].modifiers, function(m) {
            if (m.isSelected) {
              numSelected++;
            }
          });

          if(numSelected !== 1) {
            //TODO: Add modal popup. Must make 1 selection!
            return;
          }
        }

        var result = ($scope.hasNextCategory) ? $scope.nextCategory() : $scope.done();
      };

      $scope.rightButtonText = function(){
        return ($scope.hasNextCategory) ? 'Next' : 'Done';
      };

      $scope.showRightButton = function(){
        return ($scope.hasNextCategory);
      };

      $scope.previousCategory = function() {
        currentIndex--;
        refreshNavigation();
      };

      $scope.nextCategory = function() {
        currentIndex++;
        refreshNavigation();
      };

      $scope.updateModifiers = function(category, modifier) {
        modifier.isSelected = !modifier.isSelected;

        if (modifier.isSelected && category.data.selection === 1) {
          angular.forEach(category.modifiers, function(m) {
            m.isSelected = m === modifier;
          });
        }
      };

      $scope.submitChanges = function(){
        OrderManager.removeFromCart($scope.entry);
        OrderManager.addToCart($scope.entry);
        $scope.exit();
      };

      $scope.done = function() {
        if (CartModel.editableItemNew) {
          OrderManager.addToCart(CartModel.editableItem);
        }

        $scope.exit();
        CartModel.isCartOpen = true;
      };

      $scope.exit = function() {
        CartModel.closeEditor();
      };
    }]);
