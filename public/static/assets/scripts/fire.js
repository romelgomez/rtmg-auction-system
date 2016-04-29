'use strict';

angular.module('fire',[])
  .constant('FIRE_BASE_URL', 'https://rtmg.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['facebook','twitter'])
  .constant('LOGIN_REDIRECT_PATH', '/auctions')
  .factory('FireAuth', [ '$firebaseAuth', 'FireRef', function($firebaseAuth, FireRef) {
    return $firebaseAuth(FireRef);
  }])
  .factory('FireRef', ['$window', 'FIRE_BASE_URL', function($window, FIRE_BASE_URL) {
    return new $window.Firebase(FIRE_BASE_URL);
  }])
  .directive('ngHideAuth', ['FireAuth', '$timeout', function (FireAuth, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            //$log.log('\n ngHideAuth directive Auth.$getAuth()',Auth.$getAuth());
            //$log.log('ngHideAuth directive !!Auth.$getAuth()',!!Auth.$getAuth());
            el.toggleClass('ng-cloak', !!FireAuth.$getAuth());
          }, 0);
        }

        FireAuth.$onAuth(update);
        update();
      }
    };
  }])
  .directive('ngShowAuth', ['FireAuth', '$timeout', function (FireAuth, $timeout) {
    //  A directive that shows elements only when user is logged out. It also waits for Auth to be initialized so there is no initial flashing of incorrect state.
    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            //$log.log('\n ngShowAuth directive Auth.$getAuth()',Auth.$getAuth());
            //$log.log('ngShowAuth directive !Auth.$getAuth()',!Auth.$getAuth());
            el.toggleClass('ng-cloak', !FireAuth.$getAuth());
          }, 0);
        }

        FireAuth.$onAuth(update);
        update();
      }
    };
  }]);
