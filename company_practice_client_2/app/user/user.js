'use strict';

angular.module('myApp.user', ['ui.router'])
.constant('ENDPOINT', {
  baseURL1: 'http://localhost:3000/api/profiles',
  baseURL2: 'http://localhost:3000/api/myProfile',
  baseURL3: 'http://localhost:3000/api/profile/',
  baseURL4: 'http://localhost:3000/api/food/category',
  baseURL5: 'http://localhost:3000/api/food',
  baseURL6: 'http://localhost:3000/api/order'
})
.config(['$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {

        $stateProvider.state("dashboard", {
              abstract: true,
              url: "/api/dashboard",
              templateUrl: "user/user.html",
              resolve: {

              },
              controller: ['$scope', '$window', '$state', 'AuthenticationService', function (  $scope,  $window, $state, AuthenticationService ) {
                $scope.logout = function(){
                    AuthenticationService.isAuthenticated = false;
                    delete $window.sessionStorage.token;
                    console.log("User has been logged out");
                    $state.go('home.landing_page');
                }
                  }],

              data: {
                requireLogin: true
              }

            });

            $stateProvider.state("dashboard.customer", {
                  abstract: true,
                  url: "/customer",
                  views: {
                    "nav": {
                      templateUrl: "user/user.customer-menu.html"
                    }
                  },
                  data: {
                    requireLogin: true
                  }

                });

                $stateProvider.state("dashboard.manager", {
                    abstract: true,
                    url: "/manager",
                    views: {
                      "nav": {
                          templateUrl: "user/user.manager-menu.html"
                      }
                    },
                    data: {
                        requireLogin: true
                    }

                    });

              $stateProvider.state("dashboard.customer.home", {
                url: "",
                resolve: {

                },
                controller: ['$scope', '$state', function (  $scope,   $state ) {

                }],
                templateUrl: "user/user.customer.html"
              });

              $stateProvider.state("dashboard.manager.home", {
                url: "",
                resolve: {

                },
                controller: ['$scope', '$state', function (  $scope,   $state ) {

                }],
                templateUrl: "user/user.manager.html"
              });

              $stateProvider.state("dashboard.customer.profile", {
                abstract: true,
                resolve: {
                  profile: ['UserServices', function(UserServices) {
                    var result = UserServices.getMyProfile();
                    console.log("Result: " + JSON.stringify(result));
                    return result;
                  }]
                },
                url: "",
                templateUrl: "user/user.customer.customerProfile.html",
                controller: ['$scope', '$state', 'profile', function($scope, $state, profile) {
                  $scope.profile = {};
                  $scope.profile = profile;
                  console.log('Profile: ' + $scope.profile);
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.profile.view", {
                url: "/profile",
                templateUrl: "user/user.customer.profile.html",
                controller: ['$scope', '$state', function($scope, $state) {
                  $scope.editProfile = function() {
                    $state.go('dashboard.customer.profile.editProfile');
                  };
                }],
                data: {
                  requireLogin: true
                }
              })

              $stateProvider.state("dashboard.customer.profile.editProfile", {
                url: "/editProfile",
                templateUrl: "user/user.customer.updateProfile.html",
                controller: ['$scope', '$state', 'UserServices', function($scope, $state, UserServices) {

                  $scope.updateProfile = function() {
                    var req = {
                      firstName: $scope.$parent.profile.firstName,
                      lastName: $scope.$parent.profile.lastName,
                      Mobile: $scope.$parent.profile.Mobile,
                      address: {
                        street_address: $scope.$parent.profile.address.street_address,
                        city: $scope.$parent.profile.address.city,
                        pincode: $scope.$parent.profile.address.pincode,
                        state: $scope.$parent.profile.address.state,
                        country: $scope.$parent.profile.address.country
                      }
                    };
                    UserServices.updateProfile(req);
                    $state.go("dashboard.customer.profile.view");
                  };
                  $scope.cancel = function() {
                    $state.go("dashboard.customer.profile.view");
                  };
                }],
                data: {
                  requireLogin: true
                }
              });

              $stateProvider.state("dashboard.manager.profiles", {
                resolve: {
                  profiles: ['UserServices', function(UserServices) {
                    var result = UserServices.getProfiles();
                    console.log(JSON.stringify(result));
                    return result;
                  }]
                },
                url: "/profiles",
                templateUrl: "user/user.manager.view-profiles.html",
                controller: ['$scope', '$state', 'profiles', function($scope, $state, profiles) {
                  $scope.profiles = [];
                  $scope.profiles = profiles;
                  console.log($scope.profiles);
                  $scope.goToProfile = function(id) {
                    console.log("Going to new profile...");
                    console.log(id);
                    $state.go('dashboard.manager.aProfile', {profileId: id});
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.order", {
                url: "/makeOrder",
                templateUrl: "user/user.food-browse.html",
                controller: ['$scope', '$state', function($scope, $state) {
                  $scope.categories = ["Noodles", "Curries", "Rice", "Chicken", "Vegetarian"];
                  $scope.order = new Map();
                  $scope.itemPrice = 0.0;
                  $scope.tax = 0.0;
                  $scope.totalPrice = 0.0;
                  $scope.pickCategory = function(category) {

                    $state.go("dashboard.customer.order.category", { aCategory: category });
                  };

                  $scope.seeOrder = function() {
                    $state.go("dashboard.customer.order.seeOrder");
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.order.seeOrder", {
                url: "/order",
                templateUrl: "user/user.foodOrder.html",
                controller: ['$scope', '$state', 'UserServices', function($scope, $state, UserServices) {
                  $scope.orderList = Array.from($scope.$parent.order.entries());
                  $scope.hideButtons = true;
                  $scope.removeDish = function(dish) {
                    var frequency = dish[1];
                    var index = $scope.orderList.indexOf(dish);
                    $scope.orderList.splice(index, 1);
                    $scope.$parent.order.delete(dish[0]);
                    $scope.$parent.itemPrice -= (dish[0].price * frequency);
                    $scope.$parent.tax -= ((Math.round(dish[0].price * 100 * 0.07) / 100) * frequency);
                    $scope.$parent.totalPrice -= ((Math.round(dish[0].price * 100 * 1.07) / 100) * frequency);
                    /*if (index != -1) {
                      $scope.$parent.order.splice(index, 1);
                      $scope.$parent.itemPrice -= (dish.price);
                      $scope.$parent.tax -= (Math.round(dish.price * 100 * 0.07) / 100);
                      $scope.$parent.totalPrice -= (Math.round(dish.price * 100 * 1.07) / 100);
                    }*/
                  };

                  $scope.showButtons = function() {
                    if ($scope.hideButtons) {
                      $scope.hideButtons = false;
                    } else {
                      $scope.hideButtons = true;
                    }
                  };
                  /*$scope.makeOrder = function() {
                    var itemArray = [];
                    for (i = 0; i < $scope.$parent.order.length; i++) {
                      itemArray.push({ item: $scope.$parent.order[i].name, price: $scope.$parent.order[i].price });
                    }
                    var finalOrder = {
                      cost: $scope.$parent.totalPrice,
                      items: itemArray
                    };
                    UserServices.makeOrder(finalOrder);
                    $state.go("dashboard.customer.order.finishedOrder");
                  };*/

                  $scope.makeOrder = function() {
                    $scope.orderBody = {
                      cost: $scope.$parent.totalPrice,
                      items: $scope.orderList
                    };
                    $scope.orderID = null;
                    console.log(JSON.stringify($scope.orderBody));
                    $scope.order = {};
                    var orderPromise = UserServices.makeOrder($scope.orderBody);
                    orderPromise.then(function(result) {
                      $scope.order = result;
                      //console.log("Order: " + $scope.order);
                      console.log("Result: " + JSON.stringify($scope.order));
                      //console.log("Result ID: " + $scope.order._id);
                      $state.go("dashboard.customer.finishedOrder");
                      /*console.log("Order ID: " + $scope.order.cost);
                      $scope.orderID = $scope.order._id;*/
                    });
                    /*console.log("Order ID: " + $scope.orderID);
                    $state.go("dashboard.customer.finishedOrder", {orderInfo: $scope.orderID});*/
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.finishedOrder", {
                /*resolve: {
                  orderDetails: ['UserServices', function(UserServices) {
                    console.log("Order made!");
                    //console.log($stateParams.orderInfo);
                    return UserServices.getMyOrders();
                  }]
                },*/
                url: "/finishedOrder",
                templateUrl: "user/user.orderDone.html",
                controller: ['$scope', '$state', function($scope, $state) {
                  //console.log($stateParams.orderInfo);
                  /*$scope.orders = orderDetails;
                  $scope.lastOrder = $scope.orders[$scope.orders.length - 1];
                  $scope.orderID = $scope.lastOrder._id;*/
                  $scope.goHome = function() {
                    $state.go('dashboard.customer.home');
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.order.category", {
                resolve: {
                  foodItems: ['$stateParams', 'UserServices', function($stateParams, UserServices) {
                    console.log("Getting stuff");
                    return UserServices.getFoodItems($stateParams.aCategory);
                  }]
                },
                url: "/:aCategory",
                templateUrl: "user/user.food-category.html",
                controller: ['$scope', '$state', 'foodItems', function($scope, $state, foodItems) {
                  console.log("Controler initializing");
                  $scope.foodItems = [];
                  console.log("Loaded stuff");
                  $scope.foodItems = foodItems;
                  console.log("Loaded stuff");
                  //$scope.imageURL = "/images/placeholder.png";
                  $scope.seeDish = function(dish) {
                    $state.go("dashboard.customer.order.category.dish", {aDish: dish._id});
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.order.category.dish", {
                resolve: {
                  foodItem: ['$stateParams', 'UserServices', function($stateParams, UserServices) {
                    console.log("Getting stuff");
                    return UserServices.getFoodItem($stateParams.aDish);
                  }]
                },
                url: "/:aDish",
                templateUrl: "user/user.food-item.html",
                controller: ['$scope', '$stateParams', 'foodItem', function($scope, $stateParams, foodItem) {
                  $scope.dish = {};
                  $scope.dish = foodItem;
                  $scope.price = $scope.dish.price;
                  $scope.dishName = $scope.dish.name;
                  $scope.picURL = $scope.dish.picture;

                  $scope.addToOrder = function() {
                    if ($scope.$parent.$parent.order.get($scope.dish) == undefined) {
                      $scope.$parent.$parent.order.set($scope.dish, 1);
                    } else {
                      $scope.$parent.$parent.order.set($scope.dish, ($scope.$parent.$parent.order.get($scope.dish) + 1))
                    }
                    //$scope.$parent.$parent.order.push($scope.dish);
                    $scope.$parent.$parent.itemPrice += $scope.price;
                    $scope.$parent.$parent.tax += (Math.round($scope.price * 100 * 0.07) / 100);
                    $scope.$parent.$parent.totalPrice += (Math.round($scope.price * 100 * 1.07) / 100);
                    console.log("Number of items in order: " + $scope.$parent.$parent.order.length);
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.manager.aProfile", {
                resolve: {
                  profile: ['$stateParams', 'UserServices', function($stateParams, UserServices) {
                    console.log("returning profile...");
                    return UserServices.getProfile($stateParams.profileId);
                  }]
                },
                url: "/:profileId",
                templateUrl: "user/user.manager.individualProfile.html",
                controller: ['$scope', '$state', 'profile', function($scope, $state, profile) {
                  $scope.profile = {};
                  $scope.profile = profile;
                  $scope.goBack = function() {
                    $state.go('dashboard.manager.profiles');
                  };
                }],
                data: {
                    requireLogin: true
                }
              });

              $stateProvider.state("dashboard.customer.createProfile", {
                url: "/createProfile",
                templateUrl: "user/user.customer.createProfile.html",
                controller: ['$scope', '$state', 'UserServices', function($scope, $state, UserServices) {
                  $scope.firstName = "";
                  $scope.lastName = "";
                  $scope.Mobile = "";
                  $scope.street_address = "";
                  $scope.city = "";
                  $scope.pincode = "";
                  $scope.state = "";
                  $scope.country = "";
                  $scope.createProfile = function() {
                    var reqBody = {
                      firstName: $scope.firstName,
                      lastName: $scope.lastName,
                      mobile: $scope.Mobile,
                      address: {
                        street_address: $scope.street_address,
                        city: $scope.city,
                        pincode: $scope.pincode,
                        state: $scope.state,
                        country: $scope.country
                      }
                    };
                    UserServices.createProfile(reqBody);
                    $state.go('dashboard.customer.home');
                  };
                }],
                data: {
                  requireLogin: true
                }
              });
      }]).factory('UserServices', ['$http', '$q', 'ENDPOINT', function($http, $q, ENDPOINT) {
        var url1 = ENDPOINT.baseURL1;
        var url2 = ENDPOINT.baseURL2;
        var url3 = ENDPOINT.baseURL3;
        var url4 = ENDPOINT.baseURL4;
        var url5 = ENDPOINT.baseURL5;
        var url6 = ENDPOINT.baseURL6;

        var createProfile = function(req_body) {
          var deferred = $q.defer();
          $http.post(url1, req_body).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getMyProfile = function() {
          var deferred = $q.defer();
          $http.get(url2).success(function(data, status, headers, config) {
            deferred.resolve(data.profile);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var updateProfile = function(req_body) {
          var deferred = $q.defer();
          $http.put(url2, req_body).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getProfiles = function() {
          var deferred = $q.defer();
          $http.get(url1).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getProfile = function(id) {
          var deferred = $q.defer();
          $http.get(url1 + "/" + id).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getFoodItems = function(category) {
          var deferred = $q.defer();
          $http.get(url4 + "/" + category).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getFoodItem = function(foodID) {
          var deferred = $q.defer();
          $http.get(url5 + "/" + foodID).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var makeOrder = function(req_body) {
          var deferred = $q.defer();
          console.log(req_body);
          $http.post(url6 + "/", req_body).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        };

        var getMyOrders = function() {
          var deferred = $q.defer();
          $http.get((url6 + "/myOrder")).success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).error(function(data, status, headers, config) {
            deferred.reject();
          });
          return deferred.promise;
        }

        return {
          createProfile: createProfile,
          getMyProfile: getMyProfile,
          getProfiles: getProfiles,
          getProfile: getProfile,
          updateProfile: updateProfile,
          getFoodItems: getFoodItems,
          getFoodItem: getFoodItem,
          makeOrder: makeOrder,
          getMyOrders: getMyOrders
        };
      }]);
