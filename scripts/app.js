/*This material is copyrighted 
*Owned by urbanbinge.com
*All rights reserved. No part of this document may be reproduced or transmitted in any form or by any means, electronic, mechanical, photocopying, *recording, or otherwise, without prior written permission by urbanbinge.com
* Application controller.
*/

var mUrbanBinge = angular.module("UrbanBingeApp",  [
    /* List dependencies */
    'ubapiProvider',
    'ubConfigProvider',
    'ubMainMenu',
    'ubEvents',
    'ubUtils',
	'ubOrganizer',
	'ngResource',
	'ngRoute',
	'ngCookies',
	'ubanalytics',
	'ubAdda',
	'ubUserProfile',
	'ubOrganizerProfile',
	'ublogin',
	'ubsecurityProvider',
	'ubtoaster',
	'wu.masonry',
    'ui.bootstrap'
]);

(function(exports){

    var config = {

        /* List all the roles you wish to use in the app
        * You have a max of 31 before the bit shift pushes the accompanying integer out of
        * the memory footprint for an integer
        */
        roles :[
			'public',
            'U',
            'O'],

        /*
        Build out all the access levels you want referencing the roles listed above
        You can use the "*" symbol to represent access to all roles
         */
        accessLevels : {
            'public' : "*",
            'user' : ['U'],
            'organizer': ['O']
        }

    }

    exports.userRoles = buildRoles(config.roles);
    exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

    /*
        Method to build a distinct bit mask for each role
        It starts off with "1" and shifts the bit to the left for each element in the
        roles array parameter
     */

    function buildRoles(roles){

        var bitMask = "01";
        var userRoles = {};

        for(var role in roles){
            var intCode = parseInt(bitMask, 2);
            userRoles[roles[role]] = {
                bitMask: intCode,
                title: roles[role]
            };
            bitMask = (intCode << 1 ).toString(2)
        }

        return userRoles;
    }

    /*
    This method builds access level bit masks based on the accessLevelDeclaration parameter which must
    contain an array for each access level containing the allowed user roles.
     */
    function buildAccessLevels(accessLevelDeclarations, userRoles){

        var accessLevels = {};
        for(var level in accessLevelDeclarations){

            if(typeof accessLevelDeclarations[level] == 'string'){
                if(accessLevelDeclarations[level] == '*'){

                    var resultBitMask = '';

                    for( var role in userRoles){
                        resultBitMask += "1"
                    }
                    //accessLevels[level] = parseInt(resultBitMask, 2);
                    accessLevels[level] = {
                        bitMask: parseInt(resultBitMask, 2),
                        title: accessLevelDeclarations[level]
                    };
                }
                else console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'")

            }
            else {

                var resultBitMask = 0;
                for(var role in accessLevelDeclarations[level]){
                    if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role]))
                        resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask
                    else console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
                }
                accessLevels[level] = {
                    bitMask: resultBitMask,
                    title: accessLevelDeclarations[level][role]
                };
            }
        }

        return accessLevels;
    }

})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);

mUrbanBinge.config(['$routeProvider',
					'$locationProvider',
					'$httpProvider',
					'$analyticsProvider',

	function($routeProvider, $locationProvider, $httpProvider,$analyticsProvider) {
		var access = routingConfig.accessLevels;
		$routeProvider.
		when('/', {templateUrl: 'html/landing.html',controller:'UrbanBingeAppCtrl',access:access.public}).
		when('/events/:eventId', {templateUrl: 'html/ebdetails.html', controller: 'eventDetailCtrl',access:access.public}).
		when('/404',{templateUrl: 'html/404.html',access:access.public}).
		when('/addEvent',{templateUrl: 'html/addNewEventPage.html',controller:'addEventCtrl',access:access.public}).
		when('/adda/:cityId',{templateUrl: 'html/adda.html',controller:'addaCtrl',access:access.public}).
		when('/user',{templateUrl: 'html/userProfile.html',controller:'userCtrl',access:access.user}).
		when('/organizer',{templateUrl: 'html/organizerProfile.html',controller:'organizerCtrl',access:access.organizer}).
		when('/login',{templateUrl: 'html/login.html',controller:'loginCtrl',access:access.public}).
		otherwise({redirectTo: '/'});
		// Without serve side support html5 must be disabled.
		$locationProvider.html5Mode(false);
}]);

mUrbanBinge.run(['$rootScope', '$location', 'security', function ($rootScope, $location, security) {

	$rootScope.$on("$routeChangeStart", function (event, next, current) {
		if (!security.authorize(next.access)) {
			// fire login form event
			security.logout(true);
			$location.path('/login');
		}
	});

}]);
//share common data between controllers
mUrbanBinge.factory('ubSharedService',['$rootScope','$cookieStore', function($rootScope,$cookieStore) {
    var sharedService = {};
    // Current city for the adda
    sharedService.currentCityId = -1;
    sharedService.addas_search_list = [];
    sharedService.currentCity = '';

    sharedService.eventlist;
	sharedService.isAddaSearch = false;
	sharedService.history = '/';

    sharedService.updateEventList = function(eventlst) {
        this.eventlist = eventlst;
    };
	sharedService.setLoginParams = function(status,user) {
		if (user == null) {
			$cookieStore.remove('user');
			$cookieStore.put('login', status);
		}
        else {
			$cookieStore.put('user', user);
			$cookieStore.put('login', status);
		}
	};

	sharedService.getLoginStatus = function() {
		return $cookieStore.get('login');
	};

	sharedService.getLoggedinUser = function() {
		return $cookieStore.get('user');
	};
	sharedService.getIsAddaSearch = function() {
		return this.isAddaSearch;
	};

	sharedService.setIsAddaSearch = function(value) {
		this.isAddaSearch = value;
	};

	sharedService.gethistory = function() {
		return this.history;
	};

	sharedService.sethistory = function(value) {
		this.history = value;
	};

	sharedService.getCurrentCityId = function(){
		return this.currentCityId;
	}

	sharedService.setCurrentCityId = function(cityId){
		this.currentCityId = cityId;
	}


    return sharedService;
}
]);

function EventListInit($scope ,$timeout, ubapi)
{
    $scope.eventlist = [];
    $scope.elist_by_id = [];
	$scope.poster_events = [];
	var temp_poster_list = [];
	var posterCount = 0;
    $scope.loadeventslist = function() {
	ubapi.events_all(
	    function (count, obj) {
		if ($scope != undefined) {
		    var tmp = [];
		    for (i=0; i<count; i++) {
		    	tmp.push(new TEventList(obj[i]));
				$scope.elist_by_id[tmp[i].eid] = tmp[i];
				if(tmp[i].eIsCarousel == "true"){
					temp_poster_list[posterCount] = tmp[i];
					posterCount++;
				}
		    }
		    $scope.eventlist = tmp;
			$scope.poster_events = temp_poster_list;
		}
	    },
	    function _error() {
		if ($scope != undefined) {
		    $scope.error = -1;
		}
		console.log("Error = ", code);
	    });
    };

    $scope.loadeventslist();
}

function PosterEventListInit($scope ,$timeout, ubapi)
{
    $scope.eventlist = [];
    $scope.elist_by_id = [];

    $scope.loadpeventslist = function() {
	ubapi.events_all(
	    function (count, obj) {
		if ($scope != undefined) {
		    var tmp = [];
		    for (i=0; i<count; i++) {
				tmp.push(new TEventList(obj[i]));
				if(tmp[i].eIsCarousel)
					$scope.elist_by_id[tmp[i].eid] = tmp[i];
		    }
		    $scope.poster_events = $scope.elist_by_id;
		}
	    },
	    function _error(code) {
		if ($scope != undefined) {
		    $scope.error = -1;
		}
		console.log("Error = ", code);
	    });
    };

    $scope.loadpeventslist();
}

function CategoryListInit($scope , ubapi)
{
    $scope.category_list = [];

    $scope.loadcatlist = function() {
	ubapi.category_all(
	    function (count, obj) {
		if ($scope != undefined) {
		    var tmp = [];
		    for (i=0; i<count; i++) {
		    	tmp.push(new TCategoryList(obj[i]));
		    }
		    $scope.category_list = tmp;
		}
	    },
	    function _error(code) {
		if ($scope != undefined) {
		    $scope.error = -1;
		}
		console.log("Error = ", code);
	    });
    };

    $scope.loadcatlist();

    $scope.$watch('category_list',function(){
	console.log('category list = ',$scope.category_list);
    });
}

function PrepareCategoryList($scope) {
    $scope.elist_by_cat = [];

    var tmp = _.map($scope.eventlist , function(i){return i.eCategory;});

    /*TODO: Complexity of this to 0(1) */
    for(i = 0; i < tmp.length; i++){
		for(j =  0; j < tmp[i].length; j++){
			if($scope.elist_by_cat[tmp[i][j].id.categoryId] == undefined)
				$scope.elist_by_cat[tmp[i][j].id.categoryId]= [];

			$scope.elist_by_cat[tmp[i][j].id.categoryId].push($scope.elist_by_id[tmp[i][j].id.eventId]);
		}
    }
}

var max_width = window.innerWidth;

/*
    This method builds access level bit masks based on the accessLevelDeclaration parameter which must
    contain an array for each access level containing the allowed user roles.

function buildAccessLevels(accessLevelDeclarations, userRoles){

	var accessLevels = {};
	for(var level in accessLevelDeclarations){

		if(typeof accessLevelDeclarations[level] == 'string'){
			if(accessLevelDeclarations[level] == '*'){

				var resultBitMask = '';

				for( var role in userRoles){
					resultBitMask += "1"
				}
				//accessLevels[level] = parseInt(resultBitMask, 2);
				accessLevels[level] = {
					bitMask: parseInt(resultBitMask, 2),
					title: accessLevelDeclarations[level]
				};
			}
			else console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'")

		}
		else {

			var resultBitMask = 0;
			for(var role in accessLevelDeclarations[level]){
				if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role]))
					resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask
				else console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
			}
			accessLevels[level] = {
				bitMask: resultBitMask,
				title: accessLevelDeclarations[level][role]
			};
		}
	}

	return accessLevels;
}
/*
        Method to build a distinct bit mask for each role
        It starts off with "1" and shifts the bit to the left for each element in the
        roles array parameter

function buildRoles(roles){
	var bitMask = "01";
	var userRoles = {};

	for(var role in roles){
		var intCode = parseInt(bitMask, 2);
		userRoles[roles[role]] = {
			bitMask: intCode,
			title: roles[role]
		};
		bitMask = (intCode << 1 ).toString(2)
	}
	return userRoles;
} */
function PrepareConfigs($scope) {
    /*var panel_width = Math.floor(max_width/130) * 100;
    var aspect_ratio = __master_config.panel_config.item.aspect_ratio;
    __master_config.panel_config.item.w = panel_width;
    __master_config.panel_config.item.h = Math.round(panel_width/aspect_ratio);*/

	$scope.userRoles = buildRoles(ubconfig.get('roles'));
    $scope.accessLevels = buildAccessLevels(ubconfig.get('accessLevels'), $scope.userRoles);

    console.log('$scope.userRoles = ',$scope.userRoles);
	console.log('$scope.accessLevels = ',$scope.accessLevels);
}

mUrbanBinge.controller('UrbanBingeAppCtrl',['$scope','$window','$timeout','$location', 'ubapi','ubconfig','ubSharedService',
	function UrbanBingeAppCtrl($scope, $window, $timeout, $location,  ubapi, ubconfig,ubSharedService) {
		console.log('App Init..');
		$scope.slist_active = 0;
		$scope.active_city = '';
		$scope.active_type = 0;
		$scope.event_state = 0;
		$scope.elementStatus = ['found','notFound'];
		$scope.displaysearchLayout = 0;
		$scope.search_list_data = 0;
		$scope.selected_type = '';
		/* TODO: Mostly Preload Every-thing here */
		//PosterEventListInit($scope ,$timeout, ubapi);
		EventListInit($scope,$timeout, ubapi);
		CategoryListInit($scope ,ubapi);
		//PrepareConfigs($scope);
		// inform search that we want event search (not adda search)
		ubSharedService.setIsAddaSearch(false);

		$scope.$watch('eventlist',function() {
			console.log('received watch eventlist');
			$scope.displaysearchLayout = 0;
			if($scope.eventlist != undefined) {
				if($scope.eventlist.length > 0){
					$scope.elist_by_genre = $scope.eventlist;
					$scope.elist_result = $scope.elementStatus[0];
					//share data
					ubSharedService.updateEventList($scope.eventlist);
				}
			}
			if($scope.eventlist.length != 0)
				PrepareCategoryList($scope);
		});

		$scope.$parent.$on('reset_category_selection',function(ev) {
			console.log('received resetCategorySelection');
			$scope.displaysearchLayout = 0;
			if($scope.eventlist != undefined) {
				if($scope.eventlist.length > 0){
					$scope.elist_by_genre = $scope.eventlist;
					$scope.elist_result = $scope.elementStatus[0];
				}
			}
		});

		$scope.$on('activate_slider_list',function(ev,val) {
			if(val != undefined) {
				$scope.slist_active = val;
			}
			console.log('received: val = , slist_active = ',val,$scope.slist_active);
			});

		$scope.$on('update_type',function(ev,val) {
		if(val != undefined)
			$scope.active_type = val.cid;
			$scope.selected_type = val.cName;
		});

		$scope.$watch('active_type',function() {
            console.log('Location path', $location.path());
			if(($scope.active_type != undefined) && ($scope.active_type != 0)){



				$scope.elist_by_genre = $scope.elist_by_cat[$scope.active_type];
				$scope.displaysearchLayout = 0;
				if($scope.elist_by_genre == undefined){
					$scope.elist_result = $scope.elementStatus[1];
				}
				else{
					$scope.elist_result = $scope.elementStatus[0];
				}

			}
		});
		$scope.$on('searchlist',function(ev,obj) {
			$scope.search_list_data = obj;
			$scope.displaysearchLayout = 1;
		});
	}
]);