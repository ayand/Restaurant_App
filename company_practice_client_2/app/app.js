'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
  'ui.router',
  'myApp.home',
  'myApp.user',
]);

myApp.constant("ENDPOINT_URI", "http://localhost:3000/");

myApp.run([ '$rootScope', '$state', '$stateParams', '$window', 'AuthenticationService',
      function ($rootScope,   $state,   $stateParams, $window, AuthenticationService) {

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

          $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
              var requireLogin = toState.data.requireLogin;
             // console.log("to state = " + toState._name);
              console.log("About to check authorization");
              if (requireLogin && AuthenticationService.isAuthenticated != true ) {
                  alert("Unauthorised");
                  event.preventDefault();
                  // get me a login modal!
              }
          });

        $window.fbAsyncInit = function() {
          FB.init({
            appId: '191698627848637',
            channelUrl: 'home/channel.html',
            status: true,
            cookie: false,
            xfbml: true,
            version: 'v2.5'
          });
          //srvAuth.watchAuthenticationStatusChange();
        };

        (function(d) {
          var js;
          var id = 'facebook-jssdk';
          var ref = d.getElementsByTagName('script')[0];

          if (d.getElementById(id)) {
            return;
          }

          js = d.createElement('script');
          js.id = id;
          js.async = true;
          js.src = "//connect.facebook.net/en_US/sdk.js";

          ref.parentNode.insertBefore(js, ref);
        }(document));
      }
    ]
);

myApp.config(
    [  '$stateProvider', '$urlRouterProvider', '$httpProvider',
      function ($stateProvider,   $urlRouterProvider, $httpProvider) {

         //$urlRouterProvider.when('', '/');

         $urlRouterProvider.otherwise('/home');

          $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

      }
    ]
);

myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

myApp.factory('loginService',['$http', '$q', '$window', 'ENDPOINT_URI', function($http, $q, $window, ENDPOINT_URI){
  var auth = {};
  var urlBase = ENDPOINT_URI;

   auth.login = function(username, password){
       var url = urlBase + "signin/";
       var credentials = {username: username, password: password};
       var deferred = $q.defer();
       return $http.post(url, credentials).success(function(data, status, headers, config) {
           if (status == 200) {
               //console.log('login successful : ' + JSON.stringify(data));
               if(data.token != "undefined"){
                   //console.log("Received token = " + data.token);
                   console.log("User role is : " + data.role);
                   $window.sessionStorage.token = data.token;
                   //$window.sessionStorage.role = data.role;
                   //$window.sessionStorage.zone = data.zone;

               } else {
                   console.log("token is undefined");
               }
                deferred.resolve({message: "User signed in", role: data.role});
           }
       }).error(function(data, status, headers, config){
           console.log('Failed to login : ' + JSON.stringify(data));
           deferred.reject();
       });
       return deferred.promise;
   };

    auth.logout = function(username){
        alert('logout : ' + username + ' ' + password);
    };

   auth.register = function(username, password){
       var url = urlBase + "signup/";
       var credentials = {username: username, password: password};
       var deferred = $q.defer();
       return $http.post(url, credentials).success(function(data, status, headers, config){
          console.log('signup successful : ' + JSON.stringify(data));
           deferred.resolve(data);
      }).error(function(data, status, headers, config){
          console.log('signup error : ' + JSON.stringify(data));
           deferred.reject("Failed to signup");
      });
       return deferred.promise;
   };



  return auth;
}]);

myApp.factory('AuthenticationService', function() {
    var auth = {
        isAuthenticated: false,
        isAdmin: false
    }

    return auth;
});

myApp.factory('TokenInterceptor', function ($timeout, $injector, $q, AuthenticationService) {
    var /*loginModal,*/ $http, $state, $window;

    // this trick must be done so that we don't receive
    // `Uncaught Error: [$injector:cdep] Circular dependency found`
    $timeout(function () {
       // loginModal = $injector.get('loginModal');
        $http = $injector.get('$http');
        $state = $injector.get('$state');
        $window = $injector.get('$window');
    });

    return {
        request: function (config) {
            //console.log("inside request");
            config.headers = config.headers || {};
            //console.log($window.sessionStorage);
            if ((typeof($window) != "undefined") && (typeof($window.sessionStorage) != "undefined") && (typeof($window.sessionStorage.token) != "undefined")) {
                console.log("setting " + "Bearer " + $window.sessionStorage.token + " in the authorization header");
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            } else {
                console.log("nothing to do");
            }

            return config;
        },

        requestError: function(rejection) {
            console.log("inside requestError");
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            console.log("inside response");
            if (response != null && response.status == 200  && $window != "undefined" && $window.sessionStorage != "undefined" && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                console.log("Setting authentication to true");
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            console.log("inside responseError");
            if (rejection != null && rejection.status === 401  && (  $window.sessionStorage.token || AuthenticationService.isAuthenticated) ) {
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.role;
                delete $window.sessionStorage.zone;
                console.log('Received response error -  Deleted token');
                AuthenticationService.isAuthenticated = false;
                $state.go("signIn");
            }

            return $q.reject(rejection);
        }
    };
});
