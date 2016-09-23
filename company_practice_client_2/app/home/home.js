'use strict';

var home = angular.module('myApp.home', ['ui.router']);

home.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            abstract: true,
            templateUrl: 'home/home.menu.html',
            controller: ['$scope', '$window', '$state', 'AuthenticationService', 'loginService', 'flash', 'Current_User', function($scope, $window, $state, AuthenticationService, loginService, flash, Current_User){
                $scope.signIn = function(){
                    if($scope.username != undefined && $scope.password != undefined){
                        loginService.login($scope.username, $scope.password).then(function(data) {
                            AuthenticationService.isAuthenticated = true;
                            console.log($scope.username + " logged in");
                            $scope.username = "";
                            $scope.password = "";
                            var role = data.data.role;
                            //console.log(JSON.stringify(data));
                            if(role == "admin") {
                                console.log("I am an administrator");
                            }
                            else if(role == "customer") {
                                $state.go('dashboard.customer.home');
                            }
                            else if(role == "manager") {
                                $state.go('dashboard.manager.home');
                            }
                            else {
                                console.log("My role is not defined, I do not know where to go");
                            }
                        },function(data){
                            console.log($scope.username + " : failed to signin");
                            $scope.password = "";
                        });

                    }else
                        alert("You must provide username and password");
                },
                $scope.signUp = function() {
                    $state.go('home.signup');
                }
            }],
            data: {
                requireLogin: false
            }
       });

        $stateProvider.state('home.landing_page', {
            url: '',
            templateUrl: 'home/home.html',
            //controller: 'HomeCtrl',
            data: {
                requireLogin: false
            }
        });

        $stateProvider.state('home.aboutus', {
            url: '/aboutus',
            templateUrl: 'home/home.aboutus.html',
            //controller: 'HomeCtrl',
            data: {
                requireLogin: false
            }
        });

        $stateProvider.state('home.contactus', {
            url: '/contactus',
            templateUrl: 'home/home.contactus.html',
            //controller: 'HomeCtrl',
            data: {
                requireLogin: false
            }
        });

        $stateProvider.state("home.signup", {
            url: "/signup",
            templateUrl: "home/home.signup.html",
            controller: ['$scope', '$window', '$state', 'AuthenticationService', 'loginService', 'flash', function($scope, $window, $state, AuthenticationService, loginService, flash){
                $scope.register = function(){
                    if($scope.email != undefined && $scope.password != undefined && $scope.confirmPassword != undefined){
                        if($scope.password == $scope.confirmPassword){
                            loginService.register($scope.email, $scope.password).then(function(data){
                                loginService.login($scope.email, $scope.password).then(function(data) {
                                    AuthenticationService.isAuthenticated = true;
                                    var role = data.data.role;
                                    //console.log(JSON.stringify(data));
                                    if(role == "admin") {
                                        console.log("I am an administrator");
                                    }
                                    else if(role == "customer") {
                                        $state.go('dashboard.customer.createProfile');
                                    }
                                    else if(role == "manager") {
                                        $state.go('dashboard.manager.home');
                                    }
                                    else {
                                        console.log("My role is not defined, I do not know where to go");
                                    }
                                })
                            })
                        }
                        else
                            alert("Passwords are different");
                    }else
                        alert("Please fill out the form before submitting!");


                }
            }],
            data: {
                requireLogin: false
            }
        });

    }])

home.factory('flash', function($rootScope) {
    var queue = [];
    var currentMessage = "";

    $rootScope.$on("$stateChangeStart", function() {
        currentMessage = queue.shift() || "";
        console.log('current message is : ' + currentMessage);
    });

    return {
        setMessage: function(message) {
            queue.push(message);
        },
        getMessage: function() {
            return currentMessage;
        }
    };
});

home.factory('Current_User', function() {
    var user_zone = {
        zone: {}
    }

    return user_zone;
});
