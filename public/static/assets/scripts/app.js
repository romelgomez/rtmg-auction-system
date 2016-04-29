'use strict';

angular.module('app',[
    'angular-loading-bar',
    'filters',
    'validators',
    'firebase',
    'fire',
    'routes',
    'login',
    'auctions',
    'ui.bootstrap',
    'angular-underscore',
    'jlareau.pnotify'
  ])
  .controller('AppController',['$scope','FireAuth',function($scope,FireAuth){

    $scope.logout = function() { FireAuth.$unauth(); };

    $scope.sizeOf = function(obj) {
      if (typeof obj === 'undefined'){
        obj = {};
      }
      return Object.keys(obj).length;
    };

    $scope.firstObj = function (obj) {
      for (var key in obj) if (obj.hasOwnProperty(key)) return key;
    };

  }]);

