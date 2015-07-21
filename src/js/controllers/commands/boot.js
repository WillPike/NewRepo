angular.module('SNAP.controllers')
.factory('CommandBoot',
  ['Logger',
  (Logger) => {

  return function() {
    return new Promise((result, reject) => {

      return result();
    });
  };
}]);
