var mubUser = angular.module("ubUserProfile",[]);


mubUser.factory('User', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.resource = $resource(API_URL + "user.json");

  return obj;
});

mubUser.factory('Events', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 1;
  obj.pageSize = 4;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});


mubUser.factory('Addas', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 1;
  obj.pageSize = 4;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});

mubUser.factory('Reviews', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 1;
  obj.pageSize = 4;
  //obj.resource = $resource(API_URL + "reviews.json");

  return obj;
});

mubUser.filter('timeLeft', [function() {
  return function(time) {
      var left = null;
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      var days = Math.floor( ( new Date().getTime() - time ) / millisecondsPerDay );
      if(days > 365) {
        left = Math.floor(days/365.25) + ' years';
      } else if(days <= 365 && days > 30) {
        left = Math.floor(days/30) + ' months';
      } else {
        left = days + ' days';
      }
      return left;
  }
}]);

mubUser.controller('userCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User','$modal',
	function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User,$modal) {

		/* save current route for login mechanism*/
		ubSharedService.sethistory('/');

    $scope.tabs = [
         {'title':'Overview', 'page': "html/user-overview.html"},
         {'title':'List', 'page': "html/user-list.html"},
         {'title':'Reviews', 'page': "html/user-reviews.html"},
         {'title':'Addas', 'page': "html/user-addas.html"},
         {'title':'Edit Profile', 'page': "html/user-edit-profile.html"}
    ];
    $scope.tabs.activeTab = 0;

    $scope.user = null;
    User.resource.query(function(data) {
        $scope.user = data[0];
        //console.log($scope.user )
    })

    $scope.password = {};
    $scope.changePassword = function(hide) {
      if($scope.password.renew != $scope.password.new) {
        alert('New Password & Repeat Password did not match');
        return;
      }
      console.log($scope.password)
      alert(JSON.stringify($scope.password));
      hide();
    }

	}
]);


mubUser.controller('UserOverViewCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User', 'Events',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User, Events) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    $scope.user = null;
    $scope.allEvents = null;
    $scope.A = 0;
    $scope.events = null;

    $scope.tabs = [
       {'title':'All Events' },
       {'title':'Upcoming Events'},
       {'title':'Past Events'}
    ];
    $scope.tabs.activeTab = 1;

    
    $scope.loadUser = function() {
      User.resource.query(function(data) {
        $scope.user = data[0];
        $scope.allEvents = $scope.user.Overview;
        $scope.loadEvents($scope.tabs.activeTab)
      })
    }

    // $scope.loadAllEvents = function() {
    //   Events.resource.query(function(data) {
    //     $scope.allEvents = data;
    //     if($scope.allEvents != null && $scope.allEvents.length > 0) $scope.events = [];
    //     //console.log($scope.allEvents )
    //     $scope.loadEvents($scope.tabs.activeTab, null);
    //   });
    // }

    $scope.init = function() {
      $scope.loadUser();
    }

    $scope.$watch('tabs.activeTab', function(newValue, oldValue) {
      console.log('newValue', newValue)
      console.log('oldValue', oldValue)
       $scope.loadEvents(newValue, oldValue);
    });

    $scope.loadEvents = function(N, O) {
      if($scope.allEvents == null) return;
      $scope.A = 0;
      $scope.events = [];
      Events.page = 0;
      $scope.moreEvents(N);
    }

    $scope.moreEvents = function(N) {
      Events.page = Events.page + 1;
      var i = 0;
      for(; $scope.A < $scope.allEvents.length; $scope.A++) {
        if(N == 0) {
          $scope.events.push($scope.allEvents[$scope.A]);
          i++; 
        } else if(N == 1 && !$scope.allEvents[$scope.A].isExpired) {
          $scope.events.push($scope.allEvents[$scope.A]);
          i++; 
        } else if(N == 2 && $scope.allEvents[$scope.A].isExpired) {
          $scope.events.push($scope.allEvents[$scope.A]);
          i++; 
        }  
        if(i >=4 ) {
          $scope.A++;
          break;
        }
      }
    }

    $scope.init();
  }
]);


mubUser.controller('UserListsCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User', 'Events',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User, Events) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    $scope.user = null;
    $scope.allEvents = null;
    $scope.I = 0;
    $scope.events = null;
    
    $scope.loadUser = function() {
      User.resource.query(function(data) {
        $scope.user = data[0];
        $scope.allEvents = $scope.user.wishlist;
        $scope.loadEvents()
      })
    }

    $scope.init = function() {
      $scope.loadUser();
    }

    $scope.loadEvents = function() {
      if($scope.allEvents == null) return;
      $scope.A = 0;
      $scope.events = [];
      Events.page = 0;
      $scope.moreEvents();
    }

    $scope.moreEvents = function() {
      for(var i = 0; i <  Events.pageSize ; i++) {
          $scope.events.push($scope.allEvents[ Events.page * Events.pageSize + i]);
      }
      Events.page = Events.page + 1;
    }

    $scope.init();
  }
]);


mubUser.controller('UserReviewsCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User', 'Reviews',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User, Reviews) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    $scope.user = null;
    $scope.allReviews = null;
    $scope.I = 0;
    $scope.reviews = null;
    
    $scope.loadUser = function() {
      User.resource.query(function(data) {
        $scope.user = data[0];
        $scope.allReviews = $scope.user.reviews;
        angular.forEach($scope.allReviews, function(R, j) {
          R.edit = false;
        });
        console.log($scope.allReviews)
        $scope.loadReviews()
      })
    }

    $scope.init = function() {
      $scope.loadUser();
    }

    $scope.loadReviews = function() {
      if($scope.allReviews == null) return;
      $scope.A = 0;
      $scope.reviews = [];
      Reviews.page = 0;
      $scope.moreReviews();
    }

    $scope.moreReviews = function() {
      for(var i = 0; i <  Reviews.pageSize ; i++) {
        console.log(Reviews.page * Reviews.pageSize + i, $scope.allReviews.length)
        if(Reviews.page * Reviews.pageSize + i < $scope.allReviews.length ) {
          $scope.reviews.push($scope.allReviews[ Reviews.page * Reviews.pageSize + i]);
        } else {
          break;
        }
      }
      console.log($scope.reviews)
      Reviews.page = Reviews.page + 1;
    }

    $scope.EditReview = function(i) {
      if($scope.reviews[i].edit)
          $scope.reviews[i].edit = false;
      else {
        $scope.reviews[i].edit = true;
        if($scope.reviews[i].editComment == null)
          $scope.reviews[i].editComment = angular.copy($scope.reviews[i].comment);
      }
    }

    $scope.SaveReview = function(i) {
      console.log('SaveReview')
      $scope.reviews[i].comment = angular.copy($scope.reviews[i].editComment);
      $scope.reviews[i].edit = false;
    }

    $scope.DeleteReview = function(i) {
      $scope.reviews.splice(i, 1);
      console.log('DeleteReview', i);
      $scope.reviews.push($scope.allReviews[ Reviews.page * Reviews.pageSize + (Reviews.pageSize - 1) ]);
    }

    $scope.init();
  }
]);

mubUser.controller('UserAddasCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User', 'Addas',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User, Addas) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    $scope.user = null;
    $scope.allAddas = null;
    $scope.A = 0;
    $scope.addas = null;

    $scope.tabs = [
       {'title':'All Addas' },
       {'title':'Upcoming Addas'},
       {'title':'Past Addas'}
    ];
    $scope.tabs.activeTab = 1;

    
    $scope.loadUser = function() {
      User.resource.query(function(data) {
        $scope.user = data[0];
        $scope.allAddas = $scope.user.addas;
        $scope.loadAddas($scope.tabs.activeTab)
      })
    }

    $scope.init = function() {
      $scope.loadUser();
    }

    $scope.$watch('tabs.activeTab', function(newValue, oldValue) {
      console.log('newValue', newValue)
      console.log('oldValue', oldValue)
       $scope.loadAddas(newValue, oldValue);
    });

    $scope.loadAddas = function(N, O) {
      if($scope.allAddas == null) return;
      $scope.A = 0;
      $scope.addas = [];
      Addas.page = 0;
      $scope.moreAddas(N);
    }

    $scope.moreAddas = function(N) {
      console.log('moreAddas')
      Addas.page = Addas.page + 1;
      var i = 0;
      for(; $scope.A < $scope.allAddas.length; $scope.A++) {
        //console.log($scope.A)
        if(N == 0) {
          $scope.addas.push($scope.allAddas[$scope.A]);
          i++; 
        } else if(N == 1 && $scope.allAddas[$scope.A].isActive) {
          $scope.addas.push($scope.allAddas[$scope.A]);
          i++; 
        } else if(N == 2 && !$scope.allAddas[$scope.A].isActive) {
          $scope.addas.push($scope.allAddas[$scope.A]);
          i++; 
        }
        if(i >= Addas.pageSize ) {
          $scope.A++;
          break;
        }

        console.log($scope.addas)
      }
    }

    $scope.init();
  }
]);


mubUser.controller('UserEditProfileCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'User',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, User) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('UserEditProfileCtrl')

    $scope.user = null;
    $scope.profile = {};
    $scope.profile.settings = {};

    $scope.cities = __master_config.topmenu.items[3].items;

    $scope.loadUser = function() {
      User.resource.query(function(data) {
        $scope.user = data[0];
      })
    }

    $scope.SaveUserProfile = function() {
      console.log($scope.profile)
      alert(JSON.stringify($scope.profile))
    }

    $scope.init = function() {
      $scope.loadUser();
    }

    $scope.init();
  }
]);