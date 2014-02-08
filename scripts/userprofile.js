var mubUser = angular.module("ubUserProfile",[]);


mubUser.controller('userCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location',
	function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location) {
	
		/* save current route for login mechanism*/
		ubSharedService.sethistory('/');
	}
]);