'use strict';

angular.module('auctions',['ngMessages','cgBusy'])
  .controller('AuctionsController',['$scope', '$q', 'user', '$uibModal', 'FireRef', '$firebaseObject', '$firebaseArray', 'notificationService', '$log', function ($scope, $q, user, $uibModal, FireRef, $firebaseObject, $firebaseArray, notificationService, $log){

    $scope.lording = {
      deferred: $q.defer(),
      isDone: false,
      taskToDoFirst:[]
    };

    $scope.lording.promise = $scope.lording.deferred.promise;

    $scope.account = {
      user:user,
      profile: $firebaseObject(FireRef.child('users/'+user.uid)),
      queuedAuctions: $firebaseArray(FireRef.child('auctions/').orderByChild('sellerID').equalTo(user.uid)),
      inventory: $firebaseArray(FireRef.child('inventories/'+user.uid)),
      compromisedInventory : {}
    };

    $scope.currentAuction = $firebaseObject(FireRef.child('currentAuction'));

    $scope.lording.taskToDoFirst.push($scope.account.profile.$loaded());
    $scope.lording.taskToDoFirst.push($scope.account.inventory.$loaded());
    $scope.lording.taskToDoFirst.push($scope.account.queuedAuctions.$loaded());
    $scope.lording.taskToDoFirst.push($scope.currentAuction.$loaded());

    $q.all($scope.lording.taskToDoFirst)
      .then(function(){
        $scope.$watch(function(){
          return $scope.account.queuedAuctions.length;
        },function(){
          $scope.account.compromisedInventory = {};
          angular.forEach($scope.account.queuedAuctions, function(auction){
            $scope.account.compromisedInventory[auction.itemDetails.name] = (typeof $scope.account.compromisedInventory[auction.itemDetails.name] !== 'undefined') ? $scope.account.compromisedInventory[auction.itemDetails.name] : 0;
            $scope.account.compromisedInventory[auction.itemDetails.name] += auction.quantityAuctioned;
          });
        });

        $scope.lording.deferred.resolve();
        $scope.lording.isDone = true;
      }, function (error) {
        notificationService.error(error);
      });

    $scope.forms = {
      placeBid: {}
    };

    var original = angular.copy($scope.model ={
      bid: null
    });

    $scope.$watch(function(){
      return $scope.currentAuction.timeLeft;
    },function(){
      var currentAuction = angular.copy($scope.currentAuction);
      if(currentAuction.timeLeft === 0 && currentAuction.bidderID !== ''){
        notificationService.notifyWithDefaults({
          title: 'The auction is over, the the winner is:',
          text:  '<b>' + currentAuction.sellerDetails.names + '</b>, for ' + currentAuction.winningBid + ' coins.',
          delay: 10000,
          type: 'success'
        });
      }
      if($scope.currentAuction.timeLeft === 0 && $scope.currentAuction.bidderID === ''){
        notificationService.notice('The last auction is over there was no winner.');
      }
    });

    $scope.submit = function(){
      if($scope.forms.placeBid.$valid){

        $scope.currentAuction.bidderID = $scope.account.profile.$id;
        $scope.currentAuction.winningBid = $scope.model.bid;
        $scope.currentAuction.winningBidderDetails = $scope.account.profile;

        $scope.currentAuction.$save()
          .then(function() {
            $scope.model = angular.copy(original);
            $scope.forms.placeBid.$setUntouched();
            $scope.forms.placeBid.$setPristine();
            notificationService.success('The bid has been placed.');
          }, function(error) {
            notificationService.error(error);
          });

      }
    };

    function modalErrors(error){
      switch(error) {
        case 'escape key press':
          notificationService.notice('This action was canceled by the user');
          break;
        case undefined:
          notificationService.notice('This action was canceled by the user');
          break;
        case 'backdrop click':
          notificationService.notice('This action was canceled by the user');
          break;
        default:
          notificationService.error(error);
      }
    }

    $scope.auction = function(item, compromisedInventory, size){
      if((angular.isDefined(compromisedInventory) && compromisedInventory < item.$value) || !angular.isDefined(compromisedInventory)){
        var modalInstance = $uibModal.open({
          templateUrl: 'auctionModal.html',
          controller: 'AuctionModalController',
          size: size,
          resolve: {
            item: function () {
              return item;
            },
            compromisedInventory: function () {
              return compromisedInventory;
            },
            profile: function () {
              return $scope.account.profile;
            }
          }
        });

        modalInstance.result.then(function () {
          notificationService.success('The auction offer has been added.');
        }, function (error) {
          modalErrors(error);
        });
      }else{
        notificationService.error('You have already all the '+ item.$id + ' inventory compromised.');
      }
    };

  }])
  .controller('AuctionModalController',[
    '$scope',
    '$modalInstance',
    '$window',
    'item',
    'compromisedInventory',
    'profile',
    'FireRef',
    '$firebaseArray', function($scope, $modalInstance, $window, item, compromisedInventory, profile, FireRef, $firebaseArray){

    $scope.forms = {
      auctionDetails: {}
    };

    $scope.item = item;
    $scope.compromisedInventory = compromisedInventory;

    $scope.model = {
      quantityAuctioned: null,
      minimumBid:  null
    };

    $scope.submit = function(){
      if($scope.forms.auctionDetails.$valid){

        var auction = {
          quantityAuctioned: $scope.model.quantityAuctioned,
          minimumBid:  $scope.model.minimumBid,
          itemDetails: {
            name: item.$id
          },
          sellerDetails: profile,
          sellerID: profile.$id,
          winningBid: 0,
          bidderID: '',
          winningBidderDetails: {
            names: ''
          },
          timeLeft: 90,
          startedAt: Firebase.ServerValue.TIMESTAMP
        };

        var auctions = $firebaseArray(FireRef.child('auctions'));
        $scope.httpRequestPromise = auctions.$add(auction)
          .then(function(ref) {
            $modalInstance.close();
          },function(error){
            $modalInstance.dismiss(error);
          });
      }
    };

    $scope.cancel = function () {
      $modalInstance.dismiss();
    };

  }])
  .directive('integer', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.integer = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          var INTEGER_REGEXP = /^\-?\d+$/;
          if (INTEGER_REGEXP.test(viewValue)) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }
    };
  });