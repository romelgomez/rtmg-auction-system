'use strict';

angular.module('login',['ngMessages'])
  .controller('LoginController', ['$scope','FireAuth','$location','$q','FireRef','notificationService','$window','$log',function ($scope, FireAuth, $location, $q, FireRef, notificationService, $window, $log) {
    // Manages authentication to any active providers.

    if(FireAuth.$getAuth() !== null){
      $window.location = '/auctions'
    }

    /**
     * Create the user profile
     * @param {Object} user
     **/
    function createProfile(user) {
      var deferred  = $q.defer();

      var userRef = FireRef.child('users').child(user.uid);

      var profile = {};

      userRef.once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);

        if(!exists){
          switch(user.provider) {
            case 'facebook':
              profile.names     = user['facebook'].displayName;
              profile.provider  = user.provider;
              break;
            case 'twitter':
              profile.names           = user['twitter'].displayName;
              profile.twitterAccount  = user['twitter'].username;
              profile.provider        = user.provider;
              break;
          }

          profile.balance = 1000;

          var inventoriesRef = FireRef.child('inventories').child(user.uid);
          var inventory = {
            breads: 30,
            carrots: 18,
            diamonds: 1
          };

          $q.all([userRef.set(profile),inventoriesRef.set(inventory)])
            .then(function(){
              deferred.resolve();
            },function(error){
              deferred.reject(error);
            });

        }else{
          deferred.resolve();
        }

      });

      return deferred.promise;
    }

    $scope.oauthLogin = function(provider) {
      FireAuth.$authWithOAuthPopup(provider, {rememberMe: true})
          .then(function(user){
            return createProfile(user);
          })
          .then(redirect, showError);
    };

    function redirect(){
      $window.location = '/auctions'
    }

    /**
     * Show firebase commons error
     * @param {Object} error
     **/
    function showError(error) {

      switch (error.code) {
        case 'AUTHENTICATION_DISABLED':
          notificationService.error('The requested authentication provider is disabled for this Firebase application.');
          break;
        case 'EMAIL_TAKEN':
          notificationService.error('The new user account cannot be created because the email is already in use.');
          break;
        case 'INVALID_ARGUMENTS':
          notificationService.error('The specified credentials are malformed or incomplete. Please refer to the error message, error details, and Firebase documentation for the required arguments for authenticating with this provider.');
          break;
        case 'INVALID_CONFIGURATION':
          notificationService.error('The requested authentication provider is misconfigured, and the request cannot complete. Please confirm that the provider \'s client ID and secret are correct in your App Dashboard and the app is properly set up on the provider \'s website.');
          break;
        case 'INVALID_CREDENTIALS':
          notificationService.error('The requested authentication provider is misconfigured, and the request cannot complete. Please confirm that the provider \'s client ID and secret are correct in your App Dashboard and the app is properly set up on the provider \'s website.');
          break;
        case 'INVALID_EMAIL':
          notificationService.error('The specified email is not a valid email.');
          break;
        case 'INVALID_ORIGIN':
          notificationService.error('A security error occurred while processing the authentication request. The web origin for the request is not in your list of approved request origins. To approve this origin, visit the Login & Auth tab in your App Dashboard.');
          break;
        case 'INVALID_PASSWORD':
          notificationService.error('The specified user account password is incorrect.');
          break;
        case 'INVALID_PROVIDER':
          notificationService.error('The requested authentication provider does not exist. Please consult the Firebase Authentication documentation for a list of supported providers.');
          break;
        case 'INVALID_TOKEN':
          notificationService.error('The specified authentication token is invalid. This can occur when the token is malformed, expired, or the Firebase app secret that was used to generate it has been revoked.');
          break;
        case 'INVALID_USER':
          notificationService.error('The specified user account does not exist.');
          break;
        case 'NETWORK_ERROR':
          notificationService.error('An error occurred while attempting to contact the authentication server.');
          break;
        case 'PROVIDER_ERROR':
          notificationService.error('A third-party provider error occurred. Please refer to the error message and error details for more information.');
          break;
        case 'TRANSPORT_UNAVAILABLE':
          notificationService.error('The requested login method is not available in the user\'s browser environment. Popups are not available in Chrome for iOS, iOS Preview Panes, or local, file:// URLs. Redirects are not available in PhoneGap / Cordova, or local, file:// URLs.');
          break;
        case 'UNKNOWN_ERROR':
          notificationService.error('An unknown error occurred. Please refer to the error message and error details for more information.');
          break;
        case 'USER_CANCELLED':
          notificationService.error('The current authentication request was cancelled by the user.');
          break;
        case 'USER_DENIED':
          notificationService.error('The user did not authorize the application. This error can occur when the user has cancelled an OAuth authentication request.');
          break;
        default:
          notificationService.error('Undefined Error: ',error);
      }

    }

  }]);
