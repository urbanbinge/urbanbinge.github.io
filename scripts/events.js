var mubEvents = angular.module("ubEvents",["google-maps"]);

/* UrbanBingeAppCtrl territory*/
function ListDisplayWindow(winsize, maxstride)
{
    var animsize = winsize + (maxstride * 2);
    return {
	'items'    : [],
	'winsize'  : winsize,
	'maxstride': maxstride, 
	'animsize' : animsize,
	'disphalf' : Math.floor(winsize / 2),
	'half'     : Math.floor(animsize / 2),
	'idx'      : 0,
	'dx'       : 0,
    };
}

function ContainerDisplayWindow(winsize, vertwin)
{
    return {
	'items'    : [],
	'winsize'  : winsize,
	'vertwin': vertwin,
    };
}

function ubListCommonControl($scope, $timeout) {
    /* TODO: Set fall back activate func, for e.g. loadWindow() */
    $scope.$watch('activateOn', function () {
	if ($scope.activateOn)
	{
	    $scope.$eval($scope.activateFunc);
	}
    });

    $scope.$watch('activateFunc', function () {
	if ($scope.activateOn)
	{
	    $scope.$eval($scope.activateFunc);
	}
    });

    $scope.windowSize = 6;
    $scope.dw = new ListDisplayWindow($scope.windowSize, Math.floor($scope.windowSize/2));

    $scope.$watch('windowSize', function() {
	/* Construct a display window : set to winsize + 2 winsize, a page on left and right */
	$scope.dw = new ListDisplayWindow($scope.windowSize, Math.floor($scope.windowSize/2));
	$scope.update();
    });

    /* Jump to any position and load (with animation states) */
    $scope.moveToIdx = function(targetIdx) {
	var dx = targetIdx - $scope.dw.idx;
	$scope.move(dx);
    };

};

mubEvents.directive('ubSliderList',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: {
	    slistData: '=',
		slistActive: '='
	},
	controller: function($scope, $window , $timeout, ubconfig)
	{
		var backup_image = ubconfig.get('topmenu');
		var idx = 0,prom,isListActive = 0;
		var MAX_SLIDER_ELEMENT_TO_DISPLAY = 5;
		
		$scope.$watch('slistActive',function() {
			//reinitialize
			idx = 0;
			isListActive = $scope.slistActive;
			// get items // temp fix get from search param
			$scope.dw = $scope.slistData.slice(idx,idx+MAX_SLIDER_ELEMENT_TO_DISPLAY);
		});
		
		$scope.$watch('slistData',function() {
			//reinitialize
			idx = 0;
			// get items // temp fix get from search param
			$scope.dw = $scope.slistData.slice(idx,idx+MAX_SLIDER_ELEMENT_TO_DISPLAY);
		});
				
		$scope.move = function() {
			if(($scope.slistData.length > 0) && ( isListActive == 1)){
				console.log('slider move called');
				if(idx < $scope.slistData.length) {
					idx+=MAX_SLIDER_ELEMENT_TO_DISPLAY;
				}
				else if(idx >= $scope.slistData.length) {
					idx = 0;
				}
				if($scope.slistData.length > MAX_SLIDER_ELEMENT_TO_DISPLAY)
					$scope.update();
			}
		};
		
		$scope.$watch('dw', function() {
			prom = $timeout(function(){$scope.move();},8000,true);
			console.log('prom = ',prom);
		});
		
		$scope.update = function() {
			//console.log('update called');
			$scope.dw = $scope.slistData.slice(idx,idx+MAX_SLIDER_ELEMENT_TO_DISPLAY);
		};
		
		$scope.click_right = function() {
			if(idx < $scope.slistData.length) {
				idx+=MAX_SLIDER_ELEMENT_TO_DISPLAY;
			}
			if(idx >= $scope.slistData.length) {
				idx = 0;
			}
			if(prom) {
				$timeout.cancel(prom);
			}
			$scope.dw = $scope.slistData.slice(idx,idx+MAX_SLIDER_ELEMENT_TO_DISPLAY);
		};
		$scope.click_left = function() {
			if(idx <= $scope.slistData.length && idx >= 0) {
				idx-=MAX_SLIDER_ELEMENT_TO_DISPLAY;
			}
			if(idx < 0 ) {
				idx = ($scope.slistData.length - 1);
			}
			if(prom) {
				$timeout.cancel(prom);
			}
			$scope.dw = $scope.slistData.slice(idx,idx+MAX_SLIDER_ELEMENT_TO_DISPLAY);
		};
		
		$scope.thumbnail_image = function(idx) {
			if($scope.dw[idx] != undefined && $scope.dw[idx].eImages[0] != undefined)
			{
				var style = {
				'margin-left':  '20px',
				'margin-top':   '20px',
				'border-color': 'orange',
				'border-width': '1px',
				'border-style': 'solid',
				'background-image':'url('+ $scope.dw[idx].eImages[0].imageURL +')',
				};
				return style;
			}
			else if($scope.dw[idx] != undefined && $scope.dw[idx].eImages[0] == undefined) {
				var style = {
				'margin-left':  '20px',
				'margin-top':   '20px',
				'border-color': 'orange',
				'border-width': '1px',
				'border-style': 'solid',
				'background-image':'url('+ backup_image.items[3].items[0].poster +')',
				};
				return style;
			}
	    };
		
		$scope.slist_panel_close = function() {
			$scope.$emit('activate_slider_list',0);
			if(prom) {
				$timeout.cancel(prom);
			}
		};
	},
	templateUrl:'html/slist.html',
    };
});
/*
mubEvents.directive('ubSliderList',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: {
	    slistData: '=',
		activateOn: '=',
	    activateFunc: '@',
	},
	controller: function($scope, $window , $timeout, ubconfig)
	{
	    ubListCommonControl($scope, $timeout);
		// temp fix for testing to be removed on elastic search impl
		$scope.listData = $scope.slistData.slice(0,6);
	    $scope.update = function () {
		$scope.dw.idx += $scope.dw.dx;
		$scope.dw.dx = 0;

		console.log('The items =',$scope.dw);

		var ll = $scope.listData.length;
		var tmp = [];
		var dw = $scope.dw;
		var min = dw.idx - dw.maxstride;
		var max = dw.idx + dw.maxstride + dw.winsize; // [].splice() takes boundary index 

		if (min < 0) {
		    min = 0;
		}
		if (max >= ll) max = ll;

		var start = dw.maxstride - (dw.idx - min);
		_.each($scope.listData.slice(min, max), function(x, i) { tmp[start+i] = x; });

		if (($scope.haveEmpty != undefined) && ($scope.haveEmpty != false))
		{
		    if (tmp.length < dw.animsize)
			tmp[dw.animsize-1] = undefined;
		}
		$scope.dw.items = tmp;
	    };

	    $scope.start = function() {
		$scope.dw.idx = 0; //$scope.listData.length >= $scope.dw.size ? $scope.dw.disphalf : 0;
		$scope.update();
	    };

	    // Moves dw.idx by dx units and updates 
	    $scope.move = function(dx) {
		var newidx = $scope.dw.idx + dx;
		var ll = $scope.listData.length;
		var rlim = ll-$scope.dw.winsize;
		if (rlim < 0) 
		    newidx = $scope.dw.idx;
		else
		    newidx = (newidx + $scope.dw.winsize >= ll) ? (rlim-1) : ((newidx < 0) ? 0 : newidx);

		dx = newidx - $scope.dw.idx;
		if (dx != 0)
		{
		    $scope.dw.dx = dx;
		    console.log("Update.. dx = ", $scope.dw.dx, " idx = ", $scope.dw.idx, " animtime = ", $scope.animTime);
		    $timeout(function() { $scope.update(); }, $scope.animTime);
		}
	    };

	    $scope.thumbnail_image = function(idx) {
		if($scope.dw.items[idx] != undefined)
		{
		    var style = {
			'background-image':'url('+ $scope.dw.items[idx].eImages[0].imageURL +')',
		    };
		    return style;
		}
	    };
		$scope.slist_panel_close = function() {
			$scope.$emit('activate_slider_list',0);
		};
		if ($scope.activateFunc == undefined) {
			$scope.start();
		}
	},
	templateUrl:'html/slist.html',
    };
});

*/
mubEvents.directive('ubScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        scrollDistance = 0;
        if (attrs.ubScrollDistance != null) {
          scope.$watch(attrs.ubScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.ubScrollDisabled != null) {
          scope.$watch(attrs.ubScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        handler = function() {
          var elementBottom, remaining, shouldScroll, windowBottom;
          windowBottom = $window.height() + $window.scrollTop();
          elementBottom = elem.offset().top + elem.height();
		  //console.log('windowBottom =',windowBottom);
		  //console.log('elementBottom =',elementBottom);
		  //console.log('elem.offset().top =',elem.offset().top);
		  //console.log('elem.height()=',elem.height());
		  //console.log('$window.height()=',$window.height());
		  //console.log('$window.scrollTop()=',$window.scrollTop());
          remaining = elementBottom - windowBottom;
          shouldScroll = remaining <= $window.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.ubScroll);
            } else {
              return scope.$apply(attrs.ubScroll);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        $window.on('scroll', handler);
        scope.$on('$destroy', function() {
          return $window.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.ubScrollImmediateCheck) {
            if (scope.$eval(attrs.ubScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
]);

mubEvents.directive('ubSearchResultList',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope:{
		elist:'=',
	},
	controller: function($scope)
	{
	    $scope.dw = new ContainerDisplayWindow(3, 4);
		
		$scope.loadmore = function() {
			console.log('loadmore triggered');
			var last = $scope.dw.items.length;
			for(var i = 0; i < 15; i++) {
			  if($scope.elist[last+i] == undefined)
				break;
		
			  $scope.dw.items.push($scope.elist[last+i]);
			}
		};
		
		$scope.$on('elist',function(ev,obj) {
			console.log('received searchlist');
			if($scope.elist == undefined){
				$scope.elist_status = $scope.elementStatus[1];
			}
			else{
				$scope.elist_status = $scope.elementStatus[0];
			}	
			if(($scope.elist != undefined) && ($scope.elist.length > 0)) {
				$scope.dw.items = [];
				$scope.loadmore();
			}
		});

	    $scope.event_pricetag = function() {
		return 'event_pricetag icon_94 icon_pricetag';
	    };
		$scope.preview_button = function() {
		return 'preview_button';
	    };
		
	    $scope.list_view_item = function(idx) {
		var translate = '';
		if(idx == 0)
		    translate = 580;
		else
		    translate = (idx * 230) + 600;

		var style = {
		    'position':'absolute',
		    'width':'600px',
		    'right':'250px',
		    'top': + translate + 'px',
		};
		return style;
	    };
		
	    $scope.thumbnail_style = function(idx) {
		if($scope.dw.items[idx] != undefined && $scope.dw.items[idx].eImages[0] != undefined)
		{
		    var style = {
			'background-image':'url('+ $scope.dw.items[idx].eImages[0].imageURL +')',
		    };
		    if($scope.e_list_type == 1)
			style['float'] = 'left';

		    return style;
		}
	    };

		$scope.hasEventRegistration = function(item) {
			if(item.eRegDetails != undefined && item.eRegDetails != null && item.eRegDetails != "" &&
				item.eRegDetails[0].perHeadCharge != 0 && item.eRegDetails[0].perHeadCharge != '0' && 
				item.eRegDetails[0].perHeadCharge != '' && item.eRegDetails[0].perHeadCharge != null && 
				item.eRegDetails[0].perHeadCharge != "" ) {
				
				return true;
			}
			else {
				return false;
			}
		};
	},
	templateUrl:'html/searchResult.html',
    };
});
mubEvents.directive('ubEventList',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: {
	    listData:'=',
	    eventState:'=',
		elistElementStatus:'=',
		categoryName:'=',
	},
	controller: function($scope, $window , $timeout, ubconfig)
	{
		/*var targetIdx = 0 , index = 0,increment = 0;
		var pattern = new Array(5,4,1,1); */
		var backup_image = ubconfig.get('topmenu');
	    $scope.dw = new ContainerDisplayWindow(3, 4);
	    $scope.e_view_type = 0;
		$scope.category_selected = '';
		$scope.loadmore = function() {
			console.log('loadmore triggered');
			var last = $scope.dw.items.length;
			for(var i = 0; i < 15; i++) {
			  if($scope.listData[last+i] == undefined)
				break;
		
			  $scope.dw.items.push($scope.listData[last+i]);
			}
		};

	    $scope.$watch('listData',function(){
		if(($scope.listData != undefined) && ($scope.listData.length > 0)) {
			$scope.dw.items = [];
			//setTimeout("$scope.loadmore()",10000);
			$scope.loadmore();
		    
		}else if(($scope.listData != undefined) && ($scope.listData.length == 0)) {
			$scope.dw.items = [];
		}
	    });
		
		$scope.$watch('elistElementStatus',function(){
			if($scope.elistElementStatus != undefined){
				$scope.elist_status = $scope.elistElementStatus;
			}
	    });
		
		$scope.$watch('categoryName',function(){
			if($scope.categoryName != undefined){
				$scope.category_selected = $scope.categoryName; // no name present in db, so id is used
			}
	    });
		
	    $scope.container_style = function() {
		if($scope.e_view_type != 0)
		    return 'event_list';
		else
		    return 'event_grid';
	    };

	    $scope.container_view_change = function(val) {
		$scope.e_view_type = val;
	    };

	    $scope.event_pricetag = function() {
		return 'event_pricetag icon_94 icon_pricetag';
	    };
		$scope.preview_button = function() {
		return 'preview_button';
	    };
		
	    $scope.list_view_item = function(idx) {
		var translate = '';
		if(idx == 0)
		    translate = 580;
		else
		    translate = (idx * 230) + 600;

		var style = {
		    'position':'absolute',
		    'width':'600px',
		    'right':'250px',
		    'top': + translate + 'px',
		};
		return style;
	    };

	    $scope.item_click = function(item) {
			$scope.event_item_active = item;
			$scope.eventState = 1;
	    };
		
		$scope.thumbnail_style = function(idx) {
			var style = {
				'background-color': 'rgba(10 , 10, 10, 0.75)',
				'background-size': '380px 220px',
				'background-repeat': 'no-repeat',
				'width':'380px',
				'height':'220px',
				'box-sizing':'border-box',
				'border':'5px solid rgba(220, 220, 220, 0.8)',
				'margin-top':'15px',
			};
			if($scope.dw.items[idx] != undefined && $scope.dw.items[idx].eImages[0] != undefined) {
				style['background-image'] = 'url('+ $scope.dw.items[idx].eImages[0].imageURL +')';
				if($scope.e_list_type == 1) {
					style['float'] = 'left';
				}

				return style;
			}
			else if($scope.dw.items[idx] != undefined && $scope.dw.items[idx].eImages[0] == undefined) {
				style['background-image'] = 'url('+ backup_image.items[1].items[0].poster +')';
				if($scope.e_list_type == 1) {
					style['float'] = 'left';
				}

				return style;
			}
	    };

	    $scope.$on('update_event_state',function(ev,val) {
		if(val != undefined)
		    $scope.eventState = val;
	    });
		$scope.hasEventRegistration = function(item) {
			if(item.eRegDetails != undefined && item.eRegDetails != null && item.eRegDetails != "" &&
				item.eRegDetails[0].perHeadCharge != 0 && item.eRegDetails[0].perHeadCharge != '0' && 
				item.eRegDetails[0].perHeadCharge != '' && item.eRegDetails[0].perHeadCharge != null && 
				item.eRegDetails[0].perHeadCharge != "" ) {
				
				return true;
			}
			else {
				return false;
			}
		};
	},
	templateUrl:'html/elist.html',
    };
});



mubEvents.directive('ubEventDetails',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
	    $scope.thumbnail_style = function() {
		if($scope.event_item_active != undefined)
		{
		    var style = {
			'background-image':'url('+ $scope.event_item_active.eImages[0].imageURL +')',
		    };
		    return style;
		}
	    };

	    $scope.event_panel_close = function() {
		$scope.$emit('update_event_state',0);
	    };

	    $scope.panel_style = function() {
		var config = ubconfig.get('panel_config');
		var style = {
		    'width':config.item.w + 'px',
		    'top'  :config.container.t + 'px',
		    'left':config.container.l + 'px',
		};
		return style;
	    };

	    $scope.event_photo_style = function() {
		if($scope.event_item_active != undefined)
		{
		    var style = {
			'background-image':'url('+ $scope.event_item_active.eImages[1].imageURL +')',
		    };
		    return style;
		}
	    };
	},

	templateUrl:'html/edetails.html',
    };
});


function findEventById(eventlist,id){
	var t_eventList;
	for(i = 0 ; i < eventlist.length ; i++ ){
		if(eventlist[i].eid == id ){
			t_eventList = eventlist[i];
			break;
		}
	}
	return t_eventList;
}

mubEvents.directive('ubEventDetailsPhotoGallery',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		var idx = 0,prom;	
		$scope.move = function() {
			console.log('gallery move called');
			if(idx < $scope.event_item_active.eImages.length) {
				idx++;
			}
			else if(idx >= $scope.event_item_active.eImages.length) {
				idx = 0;
			}
			if($scope.event_item_active != undefined && $scope.event_item_active.eImages.length > 1)
				$scope.update();
		};
		
		$scope.$watch('selected', function() {
			prom = $timeout(function(){$scope.move();},10000,true);
		});
		$scope.update = function() {
			//console.log('update called');
			$scope.selected = $scope.event_item_active.eImages[idx];
		};
		
		if($scope.event_item_active != undefined) {
			$scope.selected = $scope.event_item_active.eImages[idx];
		}
		
		$scope.click_right = function() {
			if(idx < $scope.event_item_active.eImages.length) {
				idx++;
			}
			if(idx >= $scope.event_item_active.eImages.length) {
				idx = 0;
			}
			$timeout.cancel(prom);
			$scope.selected = $scope.event_item_active.eImages[idx];
		};
		$scope.click_left = function() {
			if(idx <= $scope.event_item_active.eImages.length && idx >= 0) {
				idx--;
			}
			if(idx < 0 ) {
				idx = ($scope.event_item_active.eImages.length - 1);
			}
			$timeout.cancel(prom);
			$scope.selected = $scope.event_item_active.eImages[idx];
		};
	},
	templateUrl:'html/imagegallery.html',
    };
});

mubEvents.directive('ubEventBookingPanel',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		/* event booking panel close */
		
	    $scope.booking_panel_close = function() {
			$scope.$emit('update_booking_state',0);
	    };
		
		/* event booking panel */
	    $scope.panel_style = function() {
		var config = ubconfig.get('panel_config');
		var style = {
		    'width':config.item.w + 'px',
		    'top'  :config.container.t + 'px',
		    'left':config.container.l + 'px',
			'height' : 400 + 'px',
		};
		return style;
	    };
	},

	templateUrl:'html/bookingPanel.html',
    };
});

mubEvents.directive('ubEventCustomizePanel',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		/* event customize panel close */
		
	    $scope.customize_panel_close = function() {
			$scope.$emit('update_customize_state',0);
	    };
		
		/* event booking panel */
	    $scope.panel_style = function() {
		var config = ubconfig.get('panel_config');
		var style = {
		    'width':config.item.w + 'px',
		    'top'  :config.container.t + 'px',
		    'left':config.container.l + 'px',
			'height' : 400 + 'px',
		};
		return style;
	    };
	},

	templateUrl:'html/customizePanel.html',
    };
});

mubEvents.directive('ubEventRating',function(){
    return {
		restrict: 'A',
		scope: {
		ratingValue: '=',
		max: '=',
		onRatingSelected: '&'
      },
      link: function (scope, elem, attrs) {

        var updateStars = function() {
          scope.stars = [];
          for (var  i = 0; i < scope.max; i++) {
            scope.stars.push({filled: i < scope.ratingValue});
          }
        };

        scope.toggle = function(index) {
          scope.ratingValue = index + 1;
          scope.onRatingSelected({rating: index + 1});
        };

        scope.$watch('ratingValue', function(oldVal, newVal) {
          if (newVal) {
            updateStars();
          }
        });
    },
	templateUrl:'html/eventRating.html',
    };
});

mubEvents.directive('ubEventActivityFeed',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope,$timeout)
	{
		// ask organizer panel
		$scope.ask_organizer = 0;
		var feedTracker = 4; // DEFAULT: 4 ELEMENTS ARE THERE IN feedsInFocus 
		var totalFeeds;
		if($scope.event_item_active != undefined) {
			totalFeeds = $scope.event_item_active.eUserCmnts;
			$scope.feedsInFocus = totalFeeds.slice(0,4);
		}
		$scope.move = function(){
			if(totalFeeds != undefined && totalFeeds.length > 1) {
				$scope.feedsInFocus.pop();
				$scope.feedsInFocus.unshift(totalFeeds[feedTracker]);
				feedTracker++;
				if(feedTracker >= totalFeeds.length )
					feedTracker = 0;
				$timeout(function(){$scope.move();},8000,true);
			}
		}
		
		$timeout(function(){$scope.move();},8000,true);
	},
	templateUrl:'html/activityfeed.html',
	};
});

mubEvents.directive('ubAskTheOrganizerPanel',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		/* event booking panel close */
		
	    $scope.ato_panel_close = function($event) {
			$scope.$emit('update_ato_state',0);
	    };
		
		/* event booking panel */
	    $scope.panel_style = function() {
		var config = ubconfig.get('panel_config');
		var style = {
		    'width':config.item.w + 'px',
		    'top'  :config.container.t + 'px',
		    'left':config.container.l + 'px',
			'height' : 400 + 'px',
		};
		return style;
	    };
	},

	templateUrl:'html/askOrganizerPanel.html',
    };
});

function getEventInfo($scope,ubapi,$location) {
    $scope.eventinfo = [];
	var i = 0;
	var urlParts = $location.url().split('/');
	
    loadeventinfo = function() {
		ubapi.event_by_id(
			function (count, obj) {
				$scope.eventinfo.push(new TEventList(obj[i]));
			},
			function _error() {
				console.log("Error = ");
			},urlParts[2]);
	}
	loadeventinfo();
}
/* eventDetailCtrl territory*/
mubEvents.controller('eventDetailCtrl',['$scope','$routeParams','$location','ubSharedService','ubconfig','$analytics','$timeout','ubapi',
	function eventDetailCtrl($scope,$routeParams,$location,ubSharedService,ubconfig,$analytics,$timeout,ubapi){
		var config = ubconfig.get('ratingconfig');
		// user booking panel
		$scope.booking_state = 0;
		$scope.customize_state = 0;
		// activity feed (ask the organizer (ato))
		$scope.ask_organizer = 0;
		//event rating 
		$scope.rating = 2; // get from server
		$scope.iscustomizable = 1; // get from server
		$scope.event_item_active;
		/* save current route for login mechanism*/
		ubSharedService.sethistory($location.path());
		$scope.saveRatingToServer = function(rating) {
		  // save to server
		};
		// event details with id
		$scope.selectCurrentEvent = function() {
			if((ubSharedService.eventlist != undefined) && (ubSharedService.eventlist.length > 0 )){
				$scope.event_item_active = findEventById(ubSharedService.eventlist,$routeParams.eventId);
			}
			if($scope.event_item_active == undefined){
				//$location.path('/404');
				//$location.replace();
				getEventInfo($scope,ubapi,$location);
				$scope.$watch('eventinfo',function() {
					if($scope.eventinfo != undefined) {
						$scope.event_item_active = $scope.eventinfo;
					}
				});
			}
		};
		$scope.$on('update_booking_state',function(ev,state) {
			$scope.booking_state = state;
		});
		
		$scope.item_click = function() {
			$scope.booking_state = 1;
			$analytics.eventTrack('eventBooking', {  category: 'eventDetails', label: $scope.event_item_active.etitle  });
		};
		$scope.$on('update_customize_state',function(ev,state) {
			$scope.customize_state = state;
		});
		
		$scope.item_click_customize = function() {
			$scope.customize_state = 1;
			$analytics.eventTrack('eventCustomize', {  category: 'eventDetails', label: $scope.event_item_active.etitle });
		};
		
		$scope.$on('update_ato_state',function(ev,state) {
			$scope.ask_organizer = state;
		});

		$scope.askOrganizer = function() {
			$scope.ask_organizer = 1;
			$analytics.eventTrack('askOrganizer', {  category: 'eventDetails', label: $scope.event_item_active.etitle  });
		}
		$scope.selectCurrentEvent();
		
		// Google Map
		
		// Enable the new Google Maps visuals until it gets enabled by default.
		
		//var ubEventlatitude = $scope.event_item_active.latitude;
		//var ubEventlongitude = $scope.event_item_active.longitude;
		var lat = 13;
		var longi = 78;
		google.maps.visualRefresh = true;
		angular.extend($scope, {

			position: {
			  coords: {
				latitude: lat,
				longitude: longi
			  }
			},

			/** the initial center of the map */
			centerProperty: {
				latitude: lat,
				longitude: longi
			},

			/** the initial zoom level of the map */
			zoomProperty: 6,

			/** list of markers to put in the map */
			markersProperty: [ {
					latitude: lat,
					longitude: longi
				}],

			// These 2 properties will be set when clicking on the map
			clickedLatitudeProperty: null,	
			clickedLongitudeProperty: null,

			eventsProperty: {
			  click: function (mapModel, eventName, originalEventArgs) {	
				// 'this' is the directive's scope
			  }
			}
		});
	}
]);