var mubMenu = angular.module("ubMainMenu",['ublogin']);

var _category_class_map = 
    {
	1 :'icon_adv' ,
	5 : 'icon_sights',
	7 : 'icon_water',
	9 :'icon_workshops',
	10 :'icon_camps',
	8 :'icon_mountain',
	6 :'icon_null',
	11 :'icon_couples',
	2 :'icon_kids',
	4 :'icon_music',
	3 :'icon_art',
    };

function ubPosterEventListControl($scope, $timeout) {
    /* TODO: Set fall back activate func, for e.g. loadWindow() */
    $scope.windowSize = 5;
    $scope.dw = new ListDisplayWindow($scope.windowSize, Math.floor($scope.windowSize/2));

    $scope.$watch('windowSize', function() {
	/* Construct a display window : set to winsize + 2 winsize, a page on left and right */
	$scope.dw = new ListDisplayWindow($scope.windowSize, Math.floor($scope.windowSize/2));
    });

    $scope.moveToIdx = function(targetIdx) {
	var dx = targetIdx - $scope.dw.idx;
	$scope.move(dx);
    };
};

mubMenu.directive('ubTopMenu', function() {
    return {
	restrict: 'E',
	replace: true,
	require: '?cdMouseDrag',
	scope: {
	    slistActive:'=',
	    activeCity:'=',
	},
	controller: function($scope, $window, $timeout,$location,ubconfig,ubSharedService,$analytics,$rootScope){
		var url_root = '';//ubconfig.get('ubapi_url');
		var logo_path = ubconfig.get('ubapi_logoPath');
		$scope.menuloginStatus = 0;
		$scope.cityList = 0;
	    $scope.dw = ubconfig.get('topmenu');
		if(ubSharedService.getLoginStatus() == true){
			$scope.menuloginStatus = true;
			//$scope.dw.items.splice( 4,1 );
		}else {
			//$scope.dw.items.splice( 5,2 );
		}
		
	    $scope.city_list = $scope.dw.items[1].items;
		//$scope.signIn = 0;
		$scope.$on('update_loginStatus', function(ev,val) {
			$scope.menuloginStatus = val;
			console.log("login status ",$scope.menuloginStatus);
		});
	    $scope.container_style_param = function() {
		var style = {
		    'width': ($window.innerWidth - 100) + 'px',
		}
		return style;
	    };

	    $scope.item_style = function(idx,type) {
		var style = {
		    'padding-right':'10px',
		    'padding-left' : '10px',
		}
		/* Logo is type 0*/
		if(type == 0)
		{
			style['height'] = '110px';
			style['line-height'] = '0px';
			style['width'] = '130px';
			if($scope.logoUrl != undefined)
				style['background-image'] ='url('+ $scope.logoUrl +')';
			else
				style['background-image'] = 'url('+ url_root + logo_path +')';
				
			if(style['background-image'] == undefined)
			{
				style['background-color'] = 'rgba(252, 243, 27, 1.0)';
				style['color'] = 'black';
				style['height'] = '100px';
				style['line-height'] = '100px';
				
			}
		}

		if(type == 1 || type == 2)
		    style['float'] = 'left';
			
		if( type == 3)
		{
			style['float'] = 'right';
			style['color'] = 'rgb(239, 248, 17)';
			style['width'] = '150px';
			style['margin-top'] = '10px';
			style['height'] = '50px';
			style['border-radius'] = '3px';
			style['font-size'] = '18px';
			style['text-align'] = 'center';
			style['cursor'] = 'pointer';
			style['background-image'] = 'linear-gradient(bottom, rgb(22, 166, 202) 15%, rgb(64, 105, 235) 58%)';
			style['background-image'] = '-o-linear-gradient(bottom, rgb(22, 166, 202) 15%, rgb(64, 105, 235) 58%)';
			style['background-image'] = '-moz-linear-gradient(bottom, rgb(22, 166, 202) 15%, rgb(64, 105, 235) 58%)';
			style['background-image'] = '-webkit-linear-gradient(bottom, rgb(22, 166, 202) 15%, rgb(64, 105, 235) 58%)';
			style['background-image'] = '-ms-linear-gradient(bottom, rgb(22, 166, 202) 15%, rgb(64, 105, 235) 58%)';
			style['background-image'] = '-webkit-gradient( linear, left bottom, left top, color-stop(0.15, rgb(22, 166, 202)), color-stop(0.58, rgb(64, 105, 235)) )';
		}
		
		if(type == 4 || type == 5 || type == 6)
		    style['float'] = 'right';

		return style;
	    };

	    $scope.city_item_style = function(idx) {
		if(idx != undefined)
		    var style = {
			'top' : (idx * 30) + 'px',
		    };
		return style;
	    }


	    $scope.item_click = function(item) {
		if(item.id == 'urbanbinge'){
		    $scope.slistActive ^= 1;
			console.log('location.path = ',$location.path());
			if($location.path() == '/') {
				console.log(' resetCategorySelection on click');
				$scope.$emit('reset_category_selection');
			} else {
				console.log(' routing on click');
				$location.path('/');
			}
		}
		else if(item.id == 'city')
		    $scope.cityList ^= 1;
		else if(item.id == 'signin'){
			$location.path('/login');
		}
		else if(item.id == 'activity') 
			$location.path('/addEvent');
		else if(item.id == 'adda') {
			//$location.path('/adda');
			$location.path('/adda/' + ubSharedService.citySelected.id);
		}
	    };

	    $scope.city_select = function(idx, item) {  
	    	ubSharedService.citySelected = item;
			$scope.citySelected = item.label;
			$scope.activeCity = item;
			$scope.cityList ^= 1;
			$analytics.eventTrack('citySelected', {  category: 'region', label: $scope.citySelected});
	    };
		
		$scope.$on('loginStatus', function(ev,val) {
			//$scope.signIn = val;
		});
	},
	templateUrl: 'html/hmenu.html'
    };
});

mubMenu.directive('ubCategoryMenu', function(){
    return {
	restrict: 'E',
	replace: true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window, $timeout, $location, ubconfig){
	    $scope.cat_ev_list = [];

	    $scope.item_class = function(id) {
		var gicon_class = 'icon_74';
		var cat_class = 'category_list_items';
		if(id != undefined)
		    var icon_class = _category_class_map[id];
		return gicon_class + ' ' + cat_class + ' ' + icon_class;
	    }

	    $scope.category_click = function(item) {
		if(item.cid != undefined)
		    $scope.$emit('update_type',item);
	    };
	},
	templateUrl:'html/category.html',
    };
});

/*
mubMenu.directive('ubLoginForm', function(){
    return {
	restrict: 'E',
	replace: true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window, $timeout,ubconfig,ubapi,ubSharedService,$location){
		var url_root = ubconfig.get('ubapi_url');
		$scope.login_submit = function() {
		    ubapi.login_check(	    
			function () {
				$scope.$emit('loginStatus',0);
				$location.path('/');
				ubSharedService.setLoginStatus(true);
	    },
	    function _error(code) {
			console.log("Error = ", code);
			ubSharedService.setLoginStatus(false);
			},{
                username: $scope.jUsername,
                password: $scope.jPassword,
                rememberme: $scope.Jrememberme
            });
	    };
		
		$scope.login_panel_close = function() {
			$scope.$emit('loginStatus',0);
	    };
	},
	templateUrl:'html/login.html',
    };
});
*/
/*
mubMenu.directive('ubPosterEvents', function() {
    return {
	restrict: 'E',
	replace: true,
	scope: false,
	controller: function($scope, $window, $timeout ,ubconfig){
	    // When we get a poster event, we promote this based on a db variable
	    ubPosterEventListControl($scope, $timeout);

	    // Loads $scope.listData to dw.items from the appropriate $scope.listData[dw.idx] 
		
		console.log('ggb $scope.poster_events = ',$scope.poster_events);
	    $scope.update = function () {
		//console.log(' update called');
		console.log('Dw.idx = ',$scope.dw.idx);
		if($scope.dw.idx == ($scope.poster_events.length - 1))
		    $scope.dw.idx = 0;
		$scope.dw.idx += $scope.dw.dx;
		$scope.dw.dx = 0;

		var ll = $scope.poster_events.length;
		
		var tmp = [];
		var dw = $scope.dw;
		var min = dw.idx - dw.half;
		var max = dw.idx + dw.half;

		if (min < 0) min = 0;
		if (max >= ll) max = ll-1;

		// Changed it to get 5 services on grid-up 
		var start = dw.half - (dw.idx - min) - 2;

		max += 1;
		_.each($scope.poster_events.slice(min, max), function(x, i) {
		    tmp[start+i] = x;
		});
		if (($scope.haveEmpty != undefined) && ($scope.haveEmpty != false))
		{
		    if (tmp.length < dw.animsize)
			tmp[dw.animsize-1] = undefined;
		}
		$scope.dw.items = tmp;
	    };

	    // Moves dw.idx by dx units and updates 
	    $scope.move = function(dx) {
		//console.log(' move called');
		var newidx = $scope.dw.idx + dx;
		var ll = $scope.poster_events.length;
		newidx = (newidx >= ll) ? (ll-1) : ((newidx < -2) ? -2 : newidx);
		dx = newidx - $scope.dw.idx;
		if (dx != 0)
		{
		    $scope.dw.dx = dx;
		    $timeout(function() { $scope.update(); }, 300);
		}
	    };

	    $scope.item_style = function(idx, item) {
		if(item == undefined)
		    return;

		// TODO : Think deeper about the below 
		var hoffs = $window.innerWidth * (idx - $scope.dw.maxstride);
		var style = {
		    '-webkit-transform':'translate('+ hoffs +'px,0px)',
		    '-moz-transform':'translate('+ hoffs +'px,0px)',
		};
		return style;
	    };

	    $scope.item_click = function(item) {
		$scope.event_item_active = item;
		$scope.eventState = 1;
	    };

	    $scope.cover_poster_style = function(idx, item) {
		if(item == undefined)
		    return;
		var style = {
		    'width': $window.innerWidth + 'px',
		    'height':'495px',
		    'background-size': + $window.innerWidth + 'px 495px',
		    'background-repeat':'no-repeat',
		};

		if( $scope.posterUrl != undefined )
		    style['background-image'] ='url('+ $scope.posterUrl +')';
		else if( $scope.dw.items[idx].eImages[0] != undefined)
		    style['background-image'] = 'url('+ $scope.dw.items[idx].eImages[0].imageURL +')';
		else
			console.log('missing url');
			

		return style;
	    };

	    $scope.$watch('dw.idx',function() {
		if($scope.dw.idx != undefined)
		{
		    $timeout(function(){$scope.move(1);},15000,true);
		}
	    });

	    $scope.$watch('poster_events',function(){
		if($scope.poster_events == undefined)
		    return;

		if($scope.poster_events.length > 0)
		{
		    $scope.dw.idx = 0;
		    $scope.update();
		}
	    });

	    $scope.$on('update_event_state',function(ev,val) {
		if(val != undefined)
		    $scope.eventState = val;
	    });
	},
	templateUrl:'html/poster.html',
    };
}); */

mubMenu.directive('ubPosterEvents',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		var idx = 0,prom;	
		$scope.move = function() {
			console.log('poster move called');
			if(idx < $scope.poster_events.length) {
				idx++;
			}
			else if(idx >= $scope.poster_events.length) {
				idx = 0;
			}
			if($scope.poster_events.length > 1)
				$scope.update();
		};
		
		$scope.$watch('selected', function() {
			prom = $timeout(function(){$scope.move();},10000,true);
		});
		$scope.update = function() {
			//console.log('update called');
			$scope.selected = $scope.poster_events[idx];
		};
		
		$scope.click_right = function() {
			if(idx < $scope.poster_events.length) {
				idx++;
			}
			if(idx >= $scope.poster_events.length) {
				idx = 0;
			}
			$timeout.cancel(prom);
			$scope.selected = $scope.poster_events[idx];
		};
		$scope.click_left = function() {
			if(idx <= $scope.poster_events.length && idx >= 0) {
				idx--;
			}
			if(idx < 0 ) {
				idx = ($scope.poster_events.length - 1);
			}
			$timeout.cancel(prom);
			$scope.selected = $scope.poster_events[idx];
		};
		
		$scope.cover_poster_style = function() {
		
			var style = {
				'display':'block',
				'width': 'auto',
				'height':'auto',
				'background-repeat':'no-repeat'
			};
			return style;
		}
		
		$scope.item_click = function(item) {
			$scope.event_item_active = item;
			$scope.eventState = 1;
	    };
		
		$scope.$on('update_event_state',function(ev,val) {
		if(val != undefined)
		    $scope.eventState = val;
	    });
		
		$scope.$watch('poster_events',function(){
			console.log('ggb poster = ',$scope.poster_events);
			if($scope.poster_events == undefined) {
				console.log(" display static poster");
				$scope.dw = ubconfig.get('topmenu');
				$scope.item_style = function() {
				var style = {
				'width': 'auto',
				'height':'auto',
				'background-repeat':'no-repeat',
				'margin-top' : '40px'
				}
				style['background-image'] ='url('+ $scope.dw.items[3].items[0].poster +')';
				return style;
				};
			}
			else if($scope.poster_events.length > 0) {
				console.log('actual poster triggered')
				$scope.selected = $scope.poster_events[idx+1];
			}
	    });
		
	},
	templateUrl:'html/poster.html',
    };
});

mubMenu.directive('ubBottomMenu', function() {
    return {
	restrict: 'E',
	replace: true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window, $timeout,ubconfig){
	    $scope.dw = ubconfig.get('bottomMenu');
	    $scope.aboutUs = 0;
	    $scope.container_style_param = function() {
		var style = {
		    'width': ($window.innerWidth - 100) + 'px',
		}
		return style;
	    };

	    $scope.item_style = function(idx) {
		var style = {
		    'padding-right':'10px',
		    'padding-left' : '10px',
		}
		style['float'] = 'left';

		return style;
	    };
		
		$scope.item_click = function(item) {
			if(item.label == 'About') {
				$scope.aboutUs = 1;
			}
		};
		
		$scope.$on('aboutus', function(ev,val) {
			$scope.aboutUs = val;
		});
	},
	templateUrl: 'html/bmenu.html'
    };
});


mubMenu.directive('ubAboutUs', function() {
    return {
	restrict: 'E',
	replace: true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window, $timeout,ubconfig){
		$scope.aboutus_panel_close = function() {
			$scope.$emit('aboutus',0);
	    };
		$scope.panel_style = function() {
		var config = ubconfig.get('panel_config');
		var style = {
		    'width':'auto',
		    'top'  :20 + 'px',
			'height' :'auto',
			'bottom': 0 + 'px',
			'right': 20 + 'px',
			'left': 0 + 'px',
			'position': 'fixed',
		};
		return style;
	    };
	},
	templateUrl: 'html/about.html'
    };
});
// The loginToolbar directive is a reusable widget that can show login or logout buttons
// and information the current authenticated user
mubMenu.directive('loginToolbar', ['security','ubSharedService', function(security,ubSharedService) {
  var directive = {
    templateUrl: 'html/toolbar.tpl.html',
    restrict: 'E',
    replace: true,
    scope: true,
    link: function($scope, $element, $attrs, $controller) {
	  $scope.login = security.showLogin;
	  $scope.profile = security.profile;
	  $scope.logout = security.logout;
	  security.currentUser = ubSharedService.getLoggedinUser();
      $scope.$watch(function() {
        return security.currentUser;
      }, function(currentUser) {
        $scope.currentUser = currentUser;
      });
	  
    }
  };
  return directive;
}]);