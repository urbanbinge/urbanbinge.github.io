var mubOrganizerProfile = angular.module("ubOrganizerProfile",[]);


mubOrganizerProfile.controller('organizerCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
	function organizerCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {
		
		/* save current route for login mechanism*/
		ubSharedService.sethistory('/');

		console.log('organizerPage')

		$scope.organizerPage = "html/organizer-profile.html";
		$scope.loadPage = function(page) {
			$scope.organizerPage = "html/organizer-"+page+".html";
		}

		$scope.loadOrganizer = function() {
	    Organizer.resource.query(function(data) {
	        $scope.organizer = data[0];
	        Organizer.data = $scope.organizer;
	      })
	    }

    $scope.init = function() {
    	$scope.loadOrganizer();
    }

    $scope.init();
		
	}
]);

mubUser.factory('Organizer', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.data = null;
  obj.resource = $resource(API_URL + "organizer.json");

  return obj;
});


mubUser.factory('OrganizerEvents', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 0;
  obj.pageSize = 6;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});

mubUser.factory('OrganizerAddas', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 0;
  obj.pageSize = 6;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});

mubUser.factory('OrganizerTickets', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 0;
  obj.pageSize = 6;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});


mubUser.factory('AskOrganizer', function($rootScope, $resource, $routeParams) {
  var obj = {};

  obj.page = 0;
  obj.pageSize = 5;
  //obj.resource = $resource(API_URL + "events.json");

  return obj;
});

mubUser.controller('OrganizerProfileCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer', 'OrganizerEvents', 'OrganizerAddas',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer, OrganizerEvents, OrganizerAddas) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerProfileCtrl')

    $scope.organizer = null;
    $scope.allAddas = [];
    $scope.eventsAttended = [];
    $scope.eventsPosted = [];
    $scope.pageSize = OrganizerEvents.pageSize;

    $scope.eventTabs = [
       {'title':'Your Events'},
       {'title':'Attended Events'}
    ];
    $scope.eventTabs.activeTab = 0;

    $scope.$watch('eventTabs.activeTab', function(newValue, oldValue) {
      $scope.loadEvents(newValue);
    });

    $scope.addaTabs = [
       {'title':'Addas you own'},
       {'title':'Addas you joined'}
    ];
    $scope.addaTabs.activeTab = 0;

    $scope.$watch('addaTabs.activeTab', function(newValue, oldValue) {
      $scope.loadAddas(newValue);
    });

    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
        $scope.allAddas = $scope.organizer.addas;
        $scope.eventsAttended = $scope.organizer.eventsAttended;
        $scope.eventsPosted = $scope.organizer.eventsPosted;
        $scope.clientsTalk = $scope.organizer.clientsTalk;
    		$scope.consolidatedSales = $scope.organizer.consolidatedSales;
    		$scope.tags = $scope.organizer.tags;

        if($scope.allAddas.length > 0) {
          $scope.profileView = 'addas';
          $scope.loadAddas($scope.addaTabs.activeTab);
        } else {
          $scope.profileView = 'events';
          $scope.loadEvents($scope.eventTabs.activeTab);
        }

      });
    }

    $scope.loadView = function(view) {
      $scope.profileView = view;
      if(view == 'addas') {
        $scope.loadAddas($scope.addaTabs.activeTab);
      } else {
        $scope.loadEvents($scope.eventTabs.activeTab);
      }
    }

    $scope.loadEvents = function(T) { //T  - Type
      OrganizerEvents.page = 0;
      $scope.events = [];
      $scope.moreEvents(T);
    }

     $scope.moreEvents = function(T) { //T  - Type
      if( T == 0) { //All
        for(var i = OrganizerEvents.page * OrganizerEvents.pageSize; i < OrganizerEvents.page * OrganizerEvents.pageSize + OrganizerEvents.pageSize && i < $scope.eventsPosted.length; i++) {
          $scope.events.push($scope.eventsPosted[ i ])
        }
      } else if(T == 1) {
        for(var i = OrganizerEvents.page * OrganizerEvents.pageSize; i < OrganizerEvents.page * OrganizerEvents.pageSize + OrganizerEvents.pageSize && i < $scope.eventsAttended.length; i++) {
          $scope.events.push($scope.eventsAttended[ i ])
        }
      }
    }

    $scope.loadAddas = function(T) {
      OrganizerAddas.page = 0;
      $scope.addas = [];
      $scope.moreAddas(T);
    }

     $scope.moreAddas = function(T) {
      console.log('moreAddas', T)
      for(var i = OrganizerAddas.page * OrganizerAddas.pageSize; i < OrganizerAddas.page * OrganizerAddas.pageSize + OrganizerAddas.pageSize && i < $scope.allAddas.length; i++) {
        if($scope.allAddas[i].isOwner) {
          if(T == 0)
            $scope.addas.push($scope.allAddas[ i ])          
        } else if(!$scope.allAddas[i].isOwner) {
          if(T == 1)
            $scope.addas.push($scope.allAddas[ i ])          
        } else {
          break;
        }
      }
    }

    $scope.init = function() {
    	$scope.loadOrganizer();
    }

    $scope.init();
  }
]);


mubUser.controller('OrganizerTicketsCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer', 'OrganizerTickets',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer, OrganizerTickets) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerTicketsCtrl')

    $scope.organizer = null;
    $scope.eventsAttended = [];
    $scope.I = 0;
    $scope.tickets = [];
    $scope.pageSize = OrganizerTickets.pageSize;

    $scope.ticketTabs = [
       {'title':'Upcoming Events'},
       {'title':'Past Events'}
    ];
    $scope.ticketTabs.activeTab = 0;

    $scope.$watch('ticketTabs.activeTab', function(newValue, oldValue) {
      $scope.loadTickets(newValue);
    });

    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
        $scope.eventsAttended = $scope.organizer.eventsAttended;
        $scope.loadTickets($scope.ticketTabs.activeTab);
      });
    }

    $scope.loadTickets = function(T) { //T  - Type
      OrganizerTickets.page = 0;
      $scope.I = 0;
      $scope.tickets = [];
      $scope.moreTickets(T);
    }

    $scope.moreTickets = function(T) { //T  - Type
      if($scope.eventsAttended == null || $scope.eventsAttended.length == 0) return;
      console.log("T", T, $scope.I)
      if( T == 0) { //Upcoming
        for(;;) {
          if(!$scope.eventsAttended[$scope.I].isExpired) {
            $scope.tickets.push($scope.eventsAttended[ $scope.I ]);
          }
          $scope.I++;
          if($scope.I >= $scope.eventsAttended.length || ( $scope.tickets.length > 0 && $scope.tickets.length%OrganizerTickets.pageSize == 0) ) {
            break;
          }
        }
      } else if(T == 1) {
        for(;;) {
          console.log($scope.eventsAttended[$scope.I])
          console.log($scope.eventsAttended[$scope.I].isExpired)
          if($scope.eventsAttended[$scope.I].isExpired) {
            $scope.tickets.push($scope.eventsAttended[ $scope.I ]);
          }
          $scope.I++;
          if($scope.I >= $scope.eventsAttended.length || ( $scope.tickets.length > 0 && $scope.tickets.length%OrganizerTickets.pageSize == 0) ) {
            break;
          }
        }
      }
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);



mubUser.controller('OrganizerSettingstrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerSettingstrl')

    $scope.organizer = null;
    $scope.settingsView = 'contactInfo';

    $scope.contact = { firstName: '' };
    $scope.address = { };
    $scope.password = { };

    $scope.settingTabs = [
       {'title':'Contact Info'},
       {'title':'Address'},
       {'title':'Password'}
    ];
    $scope.settingTabs.activeTab = 0;

    $scope.$watch('settingTabs.activeTab', function(newValue, oldValue) {
      $scope.loadView(newValue);
    });

    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
      });
    }

    $scope.loadView = function(view) {
      if(view == '0') {
        $scope.settingsView = 'contactInfo';
      } else if(view == '1') {
        $scope.settingsView = 'address';
      } else {
        $scope.settingsView = 'password';
      }
    }

    $scope.SaveContactInfo = function() {
      console.log($scope.contact)
      alert(JSON.stringify($scope.contact))
    }

    $scope.SaveAddress = function() {
      console.log($scope.address)
      alert(JSON.stringify($scope.address))
    }

    $scope.SavePassword = function() {
      if($scope.password.password != $scope.password.repassword) {
        alert('Password did not match')
        return;
      }
      console.log($scope.password)
      alert(JSON.stringify($scope.password))
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);



mubUser.controller('OrganizerEmailUpdatesCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerEmailUpdatesCtrl')

    $scope.emailUpdates = [];

    $scope.emailUpdate = {};
    
    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
      });
    }

    $scope.SaveEmailUpdate = function() {
      console.log($scope.emailUpdate)
      $scope.emailUpdates.push($scope.emailUpdate);
      $scope.emailUpdate = {};
    }

    $scope.DeleteEmailUpdate = function(i) {
      $scope.emailUpdates.splice(i, 1);
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);



mubUser.controller('OrganizerCompTicketsCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerCompTicketsCtrl')

    $scope.compTickets = {};
    
    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
      });
    }

    $scope.SaveCompTickets = function() {
      console.log($scope.compTickets)
      alert(JSON.stringify($scope.compTickets))
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);


mubUser.controller('OrganizerEntranceListCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerEntranceListCtrl')

    $scope.organizer = null;
    $scope.entranceList = [];
    $scope.eventId = 26;
    $scope.event = {};
    
    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;

        var eventsPosted = $scope.organizer.eventsPosted;
        angular.forEach(eventsPosted, function(E, i) {
          if(E.eventid == $scope.eventId) {
            $scope.event = E;
            $scope.entranceList = E.entranceList;
          }
        });
      });
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);


mubUser.controller('OrganizerSalesReportCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerSalesReportCtrl')

    $scope.organizer = null;
    $scope.queries = [];
    $scope.eventId = 26;
    $scope.sales = {};
    
    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;
        
        if($scope.eventId == null) {
          $scope.sales = $scope.organizer.consolidatedSales[0];
        } else {
          angular.forEach($scope.organizer.eventsPosted, function(E, i) {
            if(E.eventid == $scope.eventId) {
              $scope.sales = E.ticketSales[0];
            }
          });
        }

        $scope.calculate();
      });
    }

    $scope.calculate = function() {
      $scope.sales.total = $scope.sales.invoiced - $scope.sales.refunded;
      $scope.sales.balance = $scope.sales.total - ($scope.sales.tax * $scope.sales.total/100) ;
      $scope.sales.payable = ($scope.sales.fees * $scope.sales.balance) / 100;
    }
    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);




mubUser.controller('OrganizerAskCtrl',['$scope','$window','$timeout','ubapi','ubconfig','ubSharedService','$location', 'Organizer', 'AskOrganizer',
  function userCtrl($scope, $window, $timeout, ubapi, ubconfig,ubSharedService,$location, Organizer, AskOrganizer) {

    /* save current route for login mechanism*/
    ubSharedService.sethistory($location.path());

    console.log('OrganizerAskCtrl')

    $scope.organizer = null;
    $scope.queries = [];
    $scope.allQueries = [];
    $scope.eventId = 26;
    $scope.event = {};
    
    $scope.loadOrganizer = function() {
      Organizer.resource.query(function(data) {
        $scope.organizer = data[0];
        Organizer.data = $scope.organizer;

        var eventsPosted = $scope.organizer.eventsPosted;
        angular.forEach(eventsPosted, function(E, i) {
          if(E.eventid == $scope.eventId) {
            $scope.event = E;
            $scope.allQueries = E.asktheOrganizer;
            angular.forEach($scope.allQueries, function(Q, j) {
                Q.showAll = false;
            });
            $scope.loadQuery();
            return;
          }
        });
      });
    }

    $scope.loadQuery = function() {
      $scope.queries = [];
      AskOrganizer.page = 0;
      $scope.moreQueries();
    }

    $scope.moreQueries = function() {
      for(var i = AskOrganizer.page * AskOrganizer.pageSize; i < AskOrganizer.page * AskOrganizer.pageSize + AskOrganizer.pageSize && i < $scope.allQueries.length; i++) {
        $scope.queries.push($scope.allQueries[ i ]);
      }
    }

    $scope.ShowAll = function(i) {
      if($scope.allQueries[i].showAll)
        $scope.allQueries[i].showAll = false;
      else
        $scope.allQueries[i].showAll = true;
    }

    $scope.init = function() {
      $scope.loadOrganizer();
    }

    $scope.init();
  }
]);
