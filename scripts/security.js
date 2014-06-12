// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('ubsecurityProvider', [
  'security.service',
  'security.interceptor',
  'security.authorization']);
  
function getModifiedUserFromUserObject(user,userRoles){
	if(user != undefined){
		var moduser = user;
		if(user.role == "M"){
			moduser.role = userRoles.M;
		}else if(user.role == "H"){
			moduser.role = userRoles.H;
		}else if(user.role == "A"){
			moduser.role = userRoles.A;
		}else if(user.role == "O"){
			bitmask = userRoles.O;
		}else if(user.role == "public"){
			bitmask = userRoles.public;
		}
		return moduser;
	}
	else {
		return null;
	}

};

angular.module('security.service', [
  'security.retryQueue'    // Keeps track of failed requests that need to be retried once the user logs in
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue','ubSharedService','ubapi','$rootScope','toaster', function($http, $q, $location, queue,			             ubSharedService,ubapi,$rootScope,toaster) {

  // Redirect to the given url (defaults to '/')
  function redirect(url) {
    url = url || ubSharedService.gethistory();
    $location.path(url);
  }

  // Login form dialog stuff
  /*var loginDialog = null;*/
  function openLoginDialog() {
    /* if ( !loginDialog ) {
      loginDialog = $dialog.dialog();
      loginDialog.open('../html/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
     */
	 $location.path('/login');
  }
  function closeLoginDialog(/*success*/) {
    /*if (loginDialog) {
      loginDialog.close(success);
      loginDialog = null;
    }*/
	$location.path(ubSharedService.gethistory());
  }
  function onLoginDialogClose(success) {
    if ( success ) {
      queue.retryAll();
    } else {
      queue.cancelAll();
      redirect();
    }
  }

  // Register a handler for when an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem) {
    if ( queue.hasMore() ) {
      service.showLogin();
    }
  });

  // The public API of the service
  var service = {

    // Get the first reason for needing a login
    getLoginReason: function() {
      return queue.retryReason();
    },

    // Show the modal login dialog
    showLogin: function() {
      //openLoginDialog();
	  $location.path('/login');
    },
	
	profile:function() {
      //openLoginDialog();
	  if(service.currentUser.role == "M" || service.currentUser.role == "H" || service.currentUser.role == "A") {
		$location.path('/user');
	  }else if(service.currentUser.role == "O") {
		$location.path('/organizer');
	  }else {}
    },
	
    // Attempt to authenticate a user by the given email and password
    login: function(email, password,rememberme) {
      /*var request = $http.post('/login', {email: email, password: password});
      return request.then(function(response) {
        service.currentUser = response.data.user;
        if ( service.isAuthenticated() ) {
          closeLoginDialog(/*true*//*);
        }
      }); */
	ubapi.login_check(	    
		function (response) {
			//$scope.$emit('loginStatus',0);
			console.log("response = ",response);
			if(response.error == "Authentication failed") {
				toaster.pop('warning', "", 'Authentication failed, please enter correct login credentials', null, 'trustedHtml');
				console.log("relogin", response.error);
			}
			else {
				$location.path('/');
				ubSharedService.setLoginParams(true,response);
				$rootScope.$broadcast('update_loginStatus',true);
				service.currentUser = response;
				if ( service.isAuthenticated() ) {
					closeLoginDialog(/*true*/);
				}
			}
	    },
	    function _error(code) {
			console.log("Error = ", code);
			ubSharedService.setLoginParams(false,null);
			redirect('/');
		},{
			username: email,
			password: password,
			rememberme:rememberme
		});
    },

    // Give up trying to login and clear the retry queue
    cancelLogin: function() {
      //closeLoginDialog(/*false*/);
	  ubSharedService.setLoginParams(false,null);
      redirect();
    },

    // Logout the current user and redirect
    logout: function(illegalAccess) {
      $http.post('/urbanbinge-web/users/logout').then(function() {
		ubSharedService.setLoginParams(false,null);
		$rootScope.$broadcast('update_loginStatus',false);
        service.currentUser = null;
		/* reset current route for login mechanism*/
		ubSharedService.sethistory('/');
		if(!illegalAccess)
			redirect('/');
      });
    },

    // Ask the backend to see if a user is already authenticated - this may be from a previous session.
    requestCurrentUser: function() {
      if ( service.isAuthenticated() ) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/current-user').then(function(response) {
          service.currentUser = response;
          return service.currentUser;
        });
      }
    },

    // Information about the current user
    currentUser: null,

    // Is the current user authenticated?
    isAuthenticated: function(){
	  console.log("currentUser = ",service.currentUser);
      return !!service.currentUser;
    },
    authorize: function(accessLevel, role) {
		if(accessLevel != undefined){
			var accessLevels = routingConfig.accessLevels
			, userRoles = routingConfig.userRoles
			, currentUser = getModifiedUserFromUserObject(ubSharedService.getLoggedinUser(),userRoles) || { name: '', role: userRoles.public };
			
			if(role === undefined)
					role = currentUser.role;
			return accessLevel.bitMask & role.bitMask;
		}else {
			return true;
		}
    },
    // Is the current user a member?
    isMember: function() {
      if(service.currentUser.role == "M")
		return true;
	  else
		return false;
    },
	// Is the current user an HR of a company?
    isHR: function() {
      if(service.currentUser.role == "H")
		return true;
	  else
		return false;
    },
	// Is the current user owner of an adda?
    isOwner: function() {
      if(service.currentUser.role == "A")
		return true;
	  else
		return false;
    },
	// Is the current user organizer of an event?
    isOrganizer: function() {
      if(service.currentUser.role == "O")
		return true;
	  else
		return false;
    }
  };

  return service;
}]);

angular.module('security.retryQueue', [])

// This is a generic retry queue for security failures.  Each item is expected to expose two functions: retry and cancel.
.factory('securityRetryQueue', ['$q', '$log', function($q, $log) {
  var retryQueue = [];
  var service = {
    // The security service puts its own handler in here!
    onItemAddedCallbacks: [],
    
    hasMore: function() {
      return retryQueue.length > 0;
    },
    push: function(retryItem) {
      retryQueue.push(retryItem);
      // Call all the onItemAdded callbacks
      angular.forEach(service.onItemAddedCallbacks, function(cb) {
        try {
          cb(retryItem);
        } catch(e) {
          $log.error('securityRetryQueue.push(retryItem): callback threw an error' + e);
        }
      });
    },
    pushRetryFn: function(reason, retryFn) {
      // The reason parameter is optional
      if ( arguments.length === 1) {
        retryFn = reason;
        reason = undefined;
      }

      // The deferred object that will be resolved or rejected by calling retry or cancel
      var deferred = $q.defer();
      var retryItem = {
        reason: reason,
        retry: function() {
          // Wrap the result of the retryFn into a promise if it is not already
          $q.when(retryFn()).then(function(value) {
            // If it was successful then resolve our deferred
            deferred.resolve(value);
          }, function(value) {
            // Otherwise reject it
            deferred.reject(value);
          });
        },
        cancel: function() {
          // Give up on retrying and reject our deferred
          deferred.reject();
        }
      };
      service.push(retryItem);
      return deferred.promise;
    },
    retryReason: function() {
      return service.hasMore() && retryQueue[0].reason;
    },
    cancelAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().cancel();
      }
    },
    retryAll: function() {
      while(service.hasMore()) {
        retryQueue.shift().retry();
      }
    }
  };
  return service;
}]);

angular.module('security.interceptor', ['security.retryQueue'])

// This http interceptor listens for authentication failures
.factory('securityInterceptor', ['$injector', 'securityRetryQueue', function($injector, queue) {
  return function(promise) {
    // Intercept failed requests
    return promise.then(null, function(originalResponse) {
      if(originalResponse.status === 401) {
        // The request bounced because it was not authorized - add a new request to the retry queue
        promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
          // We must use $injector to get the $http service to prevent circular dependency
          return $injector.get('$http')(originalResponse.config);
        });
      }
      return promise;
    });
  };
}])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config(['$httpProvider', function($httpProvider) {
  $httpProvider.responseInterceptors.push('securityInterceptor');
}]);

angular.module('security.authorization', ['security.service'])

// This service provides guard methods to support AngularJS routes.
// You can add them as resolves to routes to require authorization levels
// before allowing a route change to complete
.provider('securityAuthorization', {

  requireAdminUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAdminUser();
  }],

  requireAuthenticatedUser: ['securityAuthorization', function(securityAuthorization) {
    return securityAuthorization.requireAuthenticatedUser();
  }],

  $get: ['security', 'securityRetryQueue', function(security, queue) {
    var service = {

      // Require that there is an authenticated user
      // (use this in a route resolve to prevent non-authenticated users from entering that route)
      requireAuthenticatedUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAuthenticated() ) {
            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
          }
        });
        return promise;
      },

      // Require that there is an administrator logged in
      // (use this in a route resolve to prevent non-administrators from entering that route)
      requireAdminUser: function() {
        var promise = security.requestCurrentUser().then(function(userInfo) {
          if ( !security.isAdmin() ) {
            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
          }
        });
        return promise;
      }

    };

    return service;
  }]
});