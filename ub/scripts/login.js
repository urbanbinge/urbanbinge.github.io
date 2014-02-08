var mublogin = angular.module("ublogin",['ubsecurityProvider']);

mublogin.controller('loginCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location','security','localizedMessages',
	function loginCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location,security,localizedMessages) {
		$scope.signIn = 1;
		$scope.text = "Sign Up for Free";
		
		$scope.user = {};
		// Any error message from failing to login
		$scope.authError = null;
		// The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
		// We could do something diffent for each reason here but to keep it simple...
		$scope.authReason = null;
		if ( security.getLoginReason() ) {
		$scope.authReason = ( security.isAuthenticated() ) ?
		  localizedMessages.get('login.reason.notAuthorized') :
		  localizedMessages.get('login.reason.notAuthenticated');
		}

		// Attempt to authenticate the user specified in the form's model
		$scope.login_submit = function() {
		// Clear any previous security errors
		$scope.authError = null;
		// Try to login
		security.login($scope.jUsername, $scope.jPassword,$scope.Jrememberme);/*.then(function(loggedIn) {
			  if ( !loggedIn ) {
				// If we get here then the login failed due to bad credentials
				$scope.authError = localizedMessages.get('login.error.invalidCredentials');
			  }
			}, function(x) {
			  // If we get here then there was a problem with the login request to the server
			  $scope.authError = localizedMessages.get('login.error.serverError');
			});
			};*/
		};
		
		$scope.signin_submit = function() {
			ubapi.signin_check(function (response) {
			//$scope.$emit('loginStatus',0);
			$location.path('/login');
			},
			function _error(code) {
				console.log("Error = ", code);
			},{
				name:$scope.jUsername,
				emailId: $scope.jEmail,
				password: $scope.jPassword
		});
		
		};
		$scope.clearForm = function() {
			$scope.jUsername = ''; 
			$scope.jPassword = '';
			$scope.Jrememberme = false;
			user = {};
		};

		$scope.cancelLogin = function() {
			security.cancelLogin();
		};
		/*$scope.login_panel_close = function() {
			//$scope.$emit('loginStatus',0);
			$location.path(ubSharedService.gethistory());
		};*/
		
		
		$scope.trigger_signup = function() {
			$scope.signIn ^= 1;
			if($scope.signIn) $scope.text = "Sign Up for Free";
			else $scope.text = "Sign In";
		};
	}
]);

// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user