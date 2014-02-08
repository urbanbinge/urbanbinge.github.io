var mubOrganizerProfile = angular.module("ubOrganizerProfile",[]);


mubOrganizerProfile.controller('organizerCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location',
	function organizerCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location) {
		
		/* save current route for login mechanism*/
		ubSharedService.sethistory('/');
		
	}
]);