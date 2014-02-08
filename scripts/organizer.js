var mubOrganizer = angular.module('ubOrganizer',['$strap.directives',"google-maps"]);

function AddEventInit($scope,ubapi)
{
    $scope.event = [];
	$scope.loadevent = function() {
	ubapi.addNewEvent(
	    function (obj) {
		if ($scope != undefined && obj != null) {
		    $scope.event = obj;
		}
	    },
	    function _error() {
		if ($scope != undefined) {
		    $scope.error = -1;
		}
		console.log("Error = ", code);
	    });
	};
	$scope.loadevent();
}

mubOrganizer.directive('ubEventSideBar',function(){
	return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : true,
	controller:['$scope', 'addActivityPanel', 'GoodBye','ubSharedService',
        function ($scope, addActivityPanel, GoodBye,ubSharedService) {
            $scope.currentPanel = '';
            $scope.activeState = 'active';
            $scope.isAnonymousUser = function () {
                return !ubSharedService.getLoginStatus();
            };
            $scope.panels = addActivityPanel;
            $scope.setCurrentPanel = function (panel) {
                if ($scope.currentPanel === panel["class"]) {
                    return $scope.currentPanel = void 0;
                } else {
                    if (panel.link) {
                        return window.location = panel.link;
                    } else {
                        return $scope.currentPanel = panel["class"];
                    }
                }
            };
            $scope.closeCurrentPanel = function () {
                return $scope.currentPanel = void 0;
            };
            $scope.$on('sidebar:close', function () {
                return $scope.closeCurrentPanel();
            });
            $scope.isCurrentPanel = function (panel) {
                return $scope.currentPanel === panel["class"];
            };
            //return GoodBye.On(function () {
             //   return 'You have started creating or editing an event. Be sure to save your changes before leaving the page.';
            //});
        }
    ],
	templateUrl: 'html/sidebar.html',
	};
});

mubOrganizer.directive('ubSidebarEventInfo',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['LocationService', 'TimeService', '$scope','ubconfig',
        function (LocationService, TimeService, $scope,ubconfig) {
			$scope.launchImageuploader = false;
			$scope.addImage = function () {
				$scope.launchImageuploader = true;
			};
			$scope.close_overlay = function() {
				$scope.launchImageuploader = false;
			};
			$scope.panel_style = function() {
			var config = ubconfig.get('panel_config');
			var style = {
				'width':config.item.w + 'px',
				'top'  :config.container.t + 'px',
				'left':config.container.l + 'px',
				'height':config.item.h + 'px',
				};
				return style;
			};
            $scope.$watch('event.startDate', function (newVal) {
				//hack
				//$scope.readableDate = $scope.convertToReadableDate();
                if ($scope.event.startDate > $scope.event.endDate) {
						$scope.event.endDate = newVal;
                }
            });
			$scope.$watch('event.endDate', function (newVal) {
                if ($scope.event.startDate > $scope.event.endDate) {
						$scope.event.endDate = newVal;
                }
            });
            $scope.setStartTime = function () {
                return $scope.startTime = TimeService.twentyFourHourToMeridiem($scope.event.start_time);
            };
            $scope.setEndTime = function () {
                return $scope.endTime = TimeService.twentyFourHourToMeridiem($scope.event.end_time);
            };
            $scope.setStartTime();
            $scope.setEndTime();
            $scope.$on('eventTime.set', function () {
                $scope.setStartTime();
                return $scope.setEndTime();
            });
            $scope.cities = LocationService.getCities();
			$scope.closeCurrentPanel = function (){
				$scope.$emit('sidebar:close');
			}
			
        }
    ],
	templateUrl:'html/sidebarEvtInfo.html',
	};
});


mubOrganizer.directive('ubEventSocialShareWidget',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope', '$timeout',
        function ($scope, $timeout) {
            $scope.show = function () {
                if ($scope.event.facebookEnabled || $scope.event.twitterEnabled || $scope.event.linkedinEnabled || $scope.event.googleplusEnabled) {
                    return true;
                }
                return false;
            };
            return $scope.$watch('event.googleplusEnabled', function () {
                if ($scope.event.googleplusEnabled === true) {
					$timeout(function () {
                        return gapi.plusone.go();
                    }, 1000);
                }
            });
        }
    ],
	templateUrl:'html/sidebarSocialwidget.html',
	};
});
mubOrganizer.directive('ubEventSettings',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) {
            $scope.filteredPaymentOptions = [{ id: 1, name: 'account transfer', url: 'html/accountTransfer.html'},
											 { id : 2, name: 'cash delivery', url: 'html/cashDelivery.html'}];
			/* TO DO : write proper logic*/
			$scope.paymentOptionTemplate = function(paymentOption_id) {
				var template;
				if(paymentOption_id == 1){
					template = $scope.filteredPaymentOptions[0];
				}
				else if(paymentOption_id == 2) {
					template = $scope.filteredPaymentOptions[1];
				}
				return template;
			}
        }
    ],
	templateUrl:'html/sidebarEvtSettings.html',
	};
});
	
mubOrganizer.directive('ubEventSocialShare',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) {
            $scope.$watch('event.facebookEnabled', function () {
                if ($scope.event.facebookEnabled === true) {
                    return 1;//FB.XFBML.parse();
                }
            });
            $scope.$watch('event.twitterEnabled', function () {
                if ($scope.event.twitterEnabled === true) {
                    return 1;//twttr.widgets.load();
                }
            });
            return $scope.$watch('event.linkedinEnabled', function () {
                if ($scope.event.linkedinEnabled === true) {
                    return 1;//IN.parse();
                }
            });
        }
    ],
	templateUrl:'html/sidebarEvtSocial.html',
	};
});
mubOrganizer.directive('ubEventSponsor',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) {}
    ],
	templateUrl:'html/sidebarEvtEditSponsor.html',
	};
});

mubOrganizer.directive('ubManageEventSponsors',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) {
			$scope.addSponsorClick = 0;
            $scope.currentSponsor = void 0;
            $scope.setCurrentSponsor = function (sponsor) {
                if ($scope.currentSponsor === sponsor) {
                    $scope.currentSponsor = void 0;
                } else {
					$scope.addSponsorClick = 1;
                    $scope.currentSponsor = sponsor;
                }
				return false;
            };
            $scope.closeCurrentSponsor = function () {
				$scope.addSponsorClick = 0;
                return $scope.currentSponsor = void 0;
            };
            $scope.deleteCurrentSponsor = function (survey, sponsor) {
                var _this = this;
				$scope.addSponsorClick = 0;
                if (sponsor.id) {
                    return sponsor.$delete({
                        id: sponsor.id
                    }, function () {
                        $scope.orderedSponsors.splice(_.indexOf($scope.orderedSponsors, sponsor), 1);
                        return $scope.currentSponsor = void 0;
                    }, function () {
                        return console.log("sponsor not deleted");
                    });
                } else {
                    $scope.orderedSponsors.splice(_.indexOf($scope.orderedSponsors, sponsor), 1);
                    return $scope.currentSponsor = void 0;
                }
            };
            $scope.isSponsorVisible = function (sponsor) {
                return $scope.currentSponsor !== void 0;
            };
            $scope.addSponsor = function () {
                var sponsor;
                sponsor = new sponsorTemplate();
                $scope.orderedSponsors.push(sponsor);
                $scope.setCurrentSponsor(sponsor);
            };
        }
    ],
	templateUrl:'html/sidebarEvtSponsors.html',
	};
});
mubOrganizer.directive('ubEventTicket',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) { 
            $scope.$watch('currentTicket.close_date', function () {
                var _ref, _ref1, _ref2;
                if (((_ref = $scope.currentTicket) != null ? _ref.close_date : void 0) === '' || ((_ref1 = $scope.currentTicket) != null ? _ref1.close_date : void 0) === null || ((_ref2 = $scope.currentTicket) != null ? _ref2.close_date : void 0) === void 0) {
                    $scope.closeDateChecked = true;
                } else {
                    $scope.closeDateChecked = false;
                }
            });
            $scope.$watch('closeDateChecked', function () {
                var _ref;
                if ($scope.closeDateChecked === true) {
                    return (_ref = $scope.currentTicket) != null ? _ref.close_date = null : void 0;
                }
            });
            $scope.$watch('currentTicket.type', function () {
                var _ref;
                if (((_ref = $scope.currentTicket) != null ? _ref.type : void 0) === 'free') {
                    return $scope.currentTicket.price = '0.00';
                }
            });
        }
    ],
	templateUrl:'html/sidebarEvtEditTicket.html',
	};
});
mubOrganizer.directive('ubManageEventTickets',function(){
return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope : false,
	controller:['$scope',
        function ($scope) {
			$scope.ticketButtonClick = 0;
            $scope.currentTicket = void 0;
			
            $scope.setCurrentTicket = function (ticket) {
                if ($scope.currentTicket === ticket) {
                    $scope.currentTicket = void 0;
                } else {
					$scope.ticketButtonClick = 1;
                    $scope.currentTicket = ticket;
                }
                return false;
            };
            $scope.closeCurrentTicket = function () {
				$scope.ticketButtonClick = 0;
                return $scope.currentTicket = void 0;
            };
            $scope.deleteCurrentTicket = function (tickets, ticket) {
				$scope.ticketButtonClick = 0;
                var _this = this;
                if (ticket.id) {
                    return ticket.$delete({
                        id: ticket.id
                    }, function () {
                        $scope.regularTickets.splice(_.indexOf($scope.regularTickets, ticket), 1);
                        return $scope.currentTicket = void 0;
                    }, function () {
                        return console.log('ticket not actually removed');
                    });
                } else {
                    $scope.regularTickets.splice(_.indexOf($scope.regularTickets, ticket), 1);
                    return $scope.currentTicket = void 0;
                }
            };
            $scope.isTicketVisible = function (ticket) {
                return $scope.currentTicket !== void 0;
            };
            $scope.addRegularTicket = function () {
                var ticket;
                ticket = new ticketTemplate();
                $scope.regularTickets.push(ticket);
                $scope.setCurrentTicket(ticket);
            };
        }
    ],
	templateUrl:'html/sidebarEvtAddTickets.html',
	};
});

mubOrganizer.directive('ubEditEventDetailsPhotoGallery',function(){
    return {
	restrict : 'E',
	replace : true,
	require: '?cdMouseDrag',
	scope: true,
	controller: function($scope, $window , $timeout, ubconfig)
	{
		var IMAGE_WIDTH = 800;
		
		$scope.$on('update_image_preview', function(ev,path) {
			if( path != undefined){
				$scope.path = path;
				$scope.selected = path[0];
			}
		});
	    $scope.thumbnail_style = function() {
		if($scope.event != undefined)
		{
		    var style = {
			'height':'110px',
			'padding':'2px',
			'width': (( IMAGE_WIDTH - 2*( $scope.path.length + 1)) / $scope.path.length) +'px',
		    };
		    return style;
		}
		else {
			console.log(' no image found !!');
		}
		
	    };
	    
	},

	templateUrl:'html/editEventImagePreview.html',
    };
});

mubOrganizer.controller('addEventCtrl',['$scope','TimeService','LocationService','ubapi','$resource','$filter','ubSharedService','$location',
	function addEventCtrl($scope,TimeService, LocationService,ubapi,$resource,$filter,ubSharedService,$location) {
		console.log(' add event !!');
		
		$scope.event = new createEventObjTemplate();
		$scope.regularTickets = [];
		$scope.orderedSponsors = [];
		/* save current route for login mechanism*/
		ubSharedService.sethistory($location.path());
		return $scope.loadingComplete = function () {
			return true;
		};
		$scope.readableDate = $scope.event.startDate;
		$scope.$watch('$scope.event.startDate', function () {
			return $scope.readableDate = $scope.convertToReadableDate();
		});
		
		$scope.$on('file_upload_done', function() {
			$scope.$broadcast('update_image_preview',$scope.Files);
		
		});
		$scope.findPurchaseableTickets = function (tickets) {
			var openTicketCount, theTicket, _tickets;
			_tickets = [];
			theTicket = null;
			openTicketCount = 0;
			angular.forEach(tickets, function (value, key) {
				_tickets.push(value);
			});
			return _tickets;
		};
		$scope.setPurchaseTicketDefault = function () {
			var tickets;
				tickets = $scope.findPurchaseableTickets($scope.regularTickets);
			
			if (tickets.length === 1 && tickets[0].quantity_selected === void 0) {
				tickets[0].quantity_selected = parseInt(tickets[0].min_quantity, 10) > 0 ? parseInt(tickets[0].min_quantity, 10) : 1;
				return true;
			}
			return false;
		};
		$scope.convertToReadableDate = function () {
			var convertedDate, endDate, endMonth, endYear, startDate, startMonth, startTime, startYear;
			startDate = $scope.event.startDate;
			endDate = $scope.event.endDate;
			startMonth = $filter('date')(startDate, 'M');
			endMonth = $filter('date')(endDate, 'M');
			startYear = $filter('date')(startDate, 'yyyy');
			endYear = $filter('date')(endDate, 'yyyy');
			startTime = $scope.start_time;
			if (startDate === endDate) {
				convertedDate = $filter('date')(startDate, 'MMMM d yyyy');
				if (startTime !== void 0 && startTime !== '' && startTime !== null) {
				convertedDate += ' at ' + startTime;
				}
			} else {
				if (startMonth === endMonth && startYear === endYear) {
					convertedDate = $filter('date')(startDate, 'MMMM d') + '-' + $filter('date')(endDate, 'd yyyy');
				} else if (startYear === endYear) {
					convertedDate = $filter('date')(startDate, 'MMMM d') + '-' + $filter('date')(endDate, 'MMMM d yyyy');
				} else {
					convertedDate = $filter('date')(startDate, 'MMMM d yyyy') + '-' + $filter('date')(endDate, 'MMMM d yyyy');
				}
			}
			return convertedDate;
		};
		$scope.$watch('regularTickets', function () {
			console.log('ggb watch regularTickets');
			$scope.regularTickets = _.sortBy($scope.regularTickets, function (item) {
				return parseInt(item.order, 10);
			});
			console.log('ggb watch regularTickets',$scope.regularTickets);
		}, true );
		return $scope.eventHasVenue = function () {
			if (($scope.event.eventVenue === 0 || $scope.event.eventVenue === '0' || $scope.event.eventVenue === '' || 
				$scope.event.eventVenue === null || $scope.event.eventVenue === void 0)) {
				return false;
			} else {
				return true;
			}
		};
		
		getAllModels = function () {
		var models;
		models = [];
		models.push($scope.event);
		angular.forEach($scope.regularTickets, function (regularTickets) {
			return models.push(regularTickets);
		});
		angular.forEach($scope.orderedSponsors, function (sponsor) {
			return models.push(sponsor);
		});
		return models;
		};
		return $scope.saveAll = function () {
			var savingCount, savingErrors, savingProgress, savingQueue;
			$scope.$broadcast('sidebar:close');
			$scope.$broadcast('eventTime.set');
			savingCount = 0;
			savingProgress = 0;
			savingErrors = 0;
			savingQueue = getAllModels();
			savingCount = savingQueue.length;
			$scope.$broadcast('saving:start');
			return angular.forEach(savingQueue, function (model) {
				if (model.validationErrors) {
					delete model.validationErrors;
				}
				if (model.id) {
					return model.$save(function () {
						savingProgress++;
						$scope.$broadcast('saving:progress', savingProgress / savingCount);
						if (savingProgress === savingCount) {
							return $scope.$broadcast('saving:complete');
						}
					}, function (errors) {
						if (errors.status === 401) {
							console.log("Not Authorized");
						}
						savingProgress++;
						savingErrors++;
						$scope.$broadcast('saving:progress', savingProgress / savingCount);
						if (savingProgress === savingCount) {
							return $scope.$broadcast('saving:complete');
						}
					});
				} else {
					return model.$create(function () {
						savingProgress++;
						$scope.$broadcast('saving:progress', savingProgress / savingCount);
						if (savingProgress === savingCount) {
							return $scope.$broadcast('saving:complete');
						}
					}, function (errors) {
						var _ref18, _ref19;
						if (errors.status === 401) {
							console.log("Not Authorized");
						}
						savingProgress++;
						savingErrors++;
						$scope.$broadcast('saving:progress', savingProgress / savingCount);
						if (savingProgress === savingCount) {
							return $scope.$broadcast('saving:complete');
						}
					});
				}
			});
		};
		
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