var __master_config = 	
{
    'topmenu' : {
	'id': 'root',
	'label': 'None',
	'default': 0,
	'errormessages': [
		    { 'login.reason.notAuthorized' : 'You do not have the necessary access permissions.  Do you want to login as someone else?'},
		    { 'login.reason.notAuthenticated' : 'You must be logged in to access this part of the application'},
		    { 'login.error.invalidCredentials' : 'Login failed.  Please check your credentials and try again'},
		    { 'login.error.serverError' : 'There was a problem with authenticating you' },
	],
	'items': [
		{'id'   : 'urbanbinge','label': '','type':'0'},
	    {
		'id'   : 'city',
		'label': 'City',
		'type':'1',
		'items': [
		    { 'id' : '1', 'label': 'Bangalore','poster':'assets/images/bangalore.jpg'},
		    { 'id' : '2', 'label': 'Mysore','poster':'./assets/images/mumbai.jpg'},
		    { 'id' : '3', 'label': 'Mumbai', 'poster':'./assets/images/pune.jpg'},
		    { 'id' : '4', 'label': 'Delhi','poster':'./assets/images/delhi.jpg' },
		    { 'id' : '1', 'label': 'Jaipur','poster':'./assets/images/pune.jpg'},
		    { 'id' : '2', 'label': 'Ahmedabad','poster':'./assets/images/pune.jpg'},
		    { 'id' : '3', 'label': 'Chennai','poster':'./assets/images/pune.jpg'},
		    { 'id' : '1', 'label': 'Hyderabad','poster':'./assets/images/pune.jpg' },
		    { 'id' : '2', 'label': 'Pune' ,'poster':'./assets/images/pune.jpg'},
		    { 'id' : '3', 'label': 'Others','poster':'./assets/images/pune.jpg' },
			{ 'id' : '2', 'label': 'Others','poster':'./assets/images/adda_1.jpg' },
		]
	    },
		{'id'   : 'adda','label': 'Adda','type':'2'},
		{'id'   : 'activity','label': 'Add Activity','type':'3'}
		/*{'id'   : 'signin','label': 'Sign In','type':'4'},
		{'id'   : 'guest','label': 'Guest','type':'5'},
		{'id'   : 'logout','label': 'Logout','type':'6'} */
	],
    },
    'bottomMenu' : {
	'id': 'root',
	'label': 'None',
	'default': 0,
	'items': [
	    {'id'   : 'about','label': 'About'},
	    {'id'   : 'blog','label': 'Blogs'},
	    {'id'   : 'contact','label': 'Contact us'},
	    {'id'   : 'fbck','label': 'Feed Back'},
	    {'id'   : 'faq','label': 'FAQ\'s'},
	    {'id'   : 'organizer','label': 'Organizer Section'},
	    {'id'   : 'termncndt','label': 'Terms and Condition'},
	],
    },
    'ubapi_url' : 'http://localhost:8080/urbanbinge-web/',
    'ubapi_logoPath' : 'assets/images/logo/ublogo.jpg',
    'cdvideo' : {
	'url' : 'cdassets/vid/cdappvid',
	'ext' : 'mp4',
	'min' : 0,
	'max' : 2
    },
    'menuconfig': {
	'item' : { 'w': '','h' : ''},
    },
    'panel_config' : {
	'animtime' : 300,
	'container' : { 't': 150, 'l': 160, 'b': '', 'r': '' },
	'item' : { 'w' : '', 'h' : '', 'aspect_ratio':1.29} ,
    },
    'testconfig' : {
	'animtime' : 300,
	'container' : { 't': 200, 'l': 0, 'b': 800, 'r': 1000 },
	'item' : { 'w' : 150, 'h' : 96} ,
    },
	'ratingconfig' : {
	'max' : 5
    },
    tags: [ "Travel", "Outdoor Recreation", "Concerts", "Arts and Crafts" , 'Kids', 'Music', 'Water Sport', 'Mountain']
};

var mUbConfigProvider = angular.module("ubConfigProvider", []);

mUbConfigProvider.factory('ubconfig', ['$window', function(win) {
    var config = {
	/* 
	 * Implement Xpath like refe "menu.mainmenu" where menu is a key and mainmenu is a subkey.
	 */
	get: function(key) {
	    return __master_config[key];
	}
    };
    return config;
}]);

/*
mUbConfigProvider.factory('ubevents', function($http,ubconfig,ubapi) {
  var ubEvents = function() {
    this.items = [];
    this.busy = false;
    this.after = '';
	this.limit = 15;
  };
  
  ubevents.prototype.nextPage = function() {
    if (this.busy) return;
    this.busy = true;

	var urlParam = this.after + this.limit;
	
    ubapi.events_limit( function _success(data) {
      var items = data.data.children;
      for (var i = 0; i < items.length; i++) {
        this.items.push(items[i].data);
      }
      this.after = this.items[this.items.length - 1].id;
      this.busy = false;
    }.bind(this),
	function error(data){
		console.log('Error' + data );
	},
	urlParam);
  };
  return ubEvents;
});
*/

mUbConfigProvider.factory('LocationService', ['$resource', '$http', '$q', 'ubconfig',
	function ($resource, $http, $q, ubconfig) {
		var _this = this;
		this.baseUrl = ubconfig.get('ubapi_url');
		return {
			City: $resource("" + this.baseUrl + "cities",{
				'get': {
					method: 'GET'
				}
			}),
			cityCache: void 0,
			getCities: function () {
				var cities, deferred, _this = this;
				if (this.cityCache) {
					return this.cityCache;
				} else {
					deferred = $q.defer();
					cities = this.City.get({}, function () {
						_this.cityCache = cities;
						return deferred.resolve(cities);
					}, function () {
						return deferred.reject;
					});
					return deferred.promise;
				}
			},
			setCities: function (cities) {
				var deferred;
				deferred = $q.defer();
				this.cityCache = deferred.promise;
				deferred.resolve(cities);
			},
			getCityById: function (id) {
				var deferred, _this = this;
				deferred = $q.defer();
				this.getCities().then(function (cities) {
					var city;
					city = _.findWhere(cities, {
						id: cityId
					});
					if (city) {
						return deferred.resolve(city);
					} else {
						return deferred.reject(void 0);
					}
				}, function (error) {
					return deferred.reject(error);
				});
				return deferred.promise;
			}
		};
	}
]);

mUbConfigProvider.factory('addActivityPanel', function () {
	return [{
		name: 'Event Info',
		"class": 'event-info',
		icon: '&#xED50;'
	},{
		name: 'Tickets',
		"class": 'event-tickets',
		icon: '&#xE100;'
	},{
		name: 'Social',
		"class": 'event-social',
		icon: '&#xF611;',
		iconClass: 'ss-social'
	}, {
		name: 'Sponsors',
		"class": 'event-sponsors',
		icon: '&#x22C6;'
	},{
		name: 'Settings',
		"class": 'event-settings',
		icon: '&#x2699;'
	}];
});

mUbConfigProvider.factory('TimeService', function () {
        var timezones;
        timezones = [{
            'zone': 'Pacific/Kwajalein',
            'label': '(GMT-12:00) International Date Line West'
        }, {
            'zone': 'Pacific/Midway',
            'label': '(GMT-11:00) Midway Island'
        }, {
            'zone': 'Pacific/Samoa',
            'label': '(GMT-11:00) Samoa'
        }, {
            'zone': 'Pacific/Honolulu',
            'label': '(GMT-10:00) Hawaii'
        }, {
            'zone': 'America/Anchorage',
            'label': '(GMT-09:00) Alaska'
        }, {
            'zone': 'America/Los_Angeles',
            'label': '(GMT-08:00) Pacific Time (US & Canada)'
        }, {
            'zone': 'America/Tijuana',
            'label': '(GMT-08:00) Tijuana, Baja California'
        }, {
            'zone': 'America/Denver',
            'label': '(GMT-07:00) Mountain Time (US & Canada)'
        }, {
            'zone': 'America/Chihuahua',
            'label': '(GMT-07:00) Chihuahua'
        }, {
            'zone': 'America/Mazatlan',
            'label': '(GMT-07:00) Mazatlan'
        }, {
            'zone': 'America/Phoenix',
            'label': '(GMT-07:00) Arizona'
        }, {
            'zone': 'America/Regina',
            'label': '(GMT-06:00) Saskatchewan'
        }, {
            'zone': 'America/Tegucigalpa',
            'label': '(GMT-06:00) Central America'
        }, {
            'zone': 'America/Chicago',
            'label': '(GMT-06:00) Central Time (US & Canada)'
        }, {
            'zone': 'America/Mexico_City',
            'label': '(GMT-06:00) Mexico City'
        }, {
            'zone': 'America/Monterrey',
            'label': '(GMT-06:00) Monterrey'
        }, {
            'zone': 'America/New_York',
            'label': '(GMT-05:00) Eastern Time (US & Canada)'
        }, {
            'zone': 'America/Bogota',
            'label': '(GMT-05:00) Bogota'
        }, {
            'zone': 'America/Lima',
            'label': '(GMT-05:00) Lima'
        }, {
            'zone': 'America/Rio_Branco',
            'label': '(GMT-05:00) Rio Branco'
        }, {
            'zone': 'America/Indiana/Indianapolis',
            'label': '(GMT-05:00) Indiana (East)'
        }, {
            'zone': 'America/Caracas',
            'label': '(GMT-04:30) Caracas'
        }, {
            'zone': 'America/Halifax',
            'label': '(GMT-04:00) Atlantic Time (Canada)'
        }, {
            'zone': 'America/Manaus',
            'label': '(GMT-04:00) Manaus'
        }, {
            'zone': 'America/Santiago',
            'label': '(GMT-04:00) Santiago'
        }, {
            'zone': 'America/La_Paz',
            'label': '(GMT-04:00) La Paz'
        }, {
            'zone': 'America/St_Johns',
            'label': '(GMT-03:30) Newfoundland'
        }, {
            'zone': 'America/Argentina/Buenos_Aires',
            'label': '(GMT-03:00) Georgetown'
        }, {
            'zone': 'America/Sao_Paulo',
            'label': '(GMT-03:00) Brasilia'
        }, {
            'zone': 'America/Godthab',
            'label': '(GMT-03:00) Greenland'
        }, {
            'zone': 'America/Montevideo',
            'label': '(GMT-03:00) Montevideo'
        }, {
            'zone': 'Atlantic/South_Georgia',
            'label': '(GMT-02:00) Mid-Atlantic'
        }, {
            'zone': 'Atlantic/Azores',
            'label': '(GMT-01:00) Azores'
        }, {
            'zone': 'Atlantic/Cape_Verde',
            'label': '(GMT-01:00) Cape Verde Is.'
        }, {
            'zone': 'Europe/Dublin',
            'label': '(GMT) Dublin'
        }, {
            'zone': 'Europe/Lisbon',
            'label': '(GMT) Lisbon'
        }, {
            'zone': 'Europe/London',
            'label': '(GMT) London'
        }, {
            'zone': 'Africa/Monrovia',
            'label': '(GMT) Monrovia'
        }, {
            'zone': 'Atlantic/Reykjavik',
            'label': '(GMT) Reykjavik'
        }, {
            'zone': 'Africa/Casablanca',
            'label': '(GMT) Casablanca'
        }, {
            'zone': 'Europe/Belgrade',
            'label': '(GMT+01:00) Belgrade'
        }, {
            'zone': 'Europe/Bratislava',
            'label': '(GMT+01:00) Bratislava'
        }, {
            'zone': 'Europe/Budapest',
            'label': '(GMT+01:00) Budapest'
        }, {
            'zone': 'Europe/Ljubljana',
            'label': '(GMT+01:00) Ljubljana'
        }, {
            'zone': 'Europe/Prague',
            'label': '(GMT+01:00) Prague'
        }, {
            'zone': 'Europe/Sarajevo',
            'label': '(GMT+01:00) Sarajevo'
        }, {
            'zone': 'Europe/Skopje',
            'label': '(GMT+01:00) Skopje'
        }, {
            'zone': 'Europe/Warsaw',
            'label': '(GMT+01:00) Warsaw'
        }, {
            'zone': 'Europe/Zagreb',
            'label': '(GMT+01:00) Zagreb'
        }, {
            'zone': 'Europe/Brussels',
            'label': '(GMT+01:00) Brussels'
        }, {
            'zone': 'Europe/Copenhagen',
            'label': '(GMT+01:00) Copenhagen'
        }, {
            'zone': 'Europe/Madrid',
            'label': '(GMT+01:00) Madrid'
        }, {
            'zone': 'Europe/Paris',
            'label': '(GMT+01:00) Paris'
        }, {
            'zone': 'Africa/Algiers',
            'label': '(GMT+01:00) West Central Africa'
        }, {
            'zone': 'Europe/Amsterdam',
            'label': '(GMT+01:00) Amsterdam'
        }, {
            'zone': 'Europe/Berlin',
            'label': '(GMT+01:00) Berlin'
        }, {
            'zone': 'Europe/Rome',
            'label': '(GMT+01:00) Rome'
        }, {
            'zone': 'Europe/Stockholm',
            'label': '(GMT+01:00) Stockholm'
        }, {
            'zone': 'Europe/Vienna',
            'label': '(GMT+01:00) Vienna'
        }, {
            'zone': 'Europe/Minsk',
            'label': '(GMT+02:00) Minsk'
        }, {
            'zone': 'Africa/Cairo',
            'label': '(GMT+02:00) Cairo'
        }, {
            'zone': 'Europe/Helsinki',
            'label': '(GMT+02:00) Helsinki'
        }, {
            'zone': 'Europe/Riga',
            'label': '(GMT+02:00) Riga'
        }, {
            'zone': 'Europe/Sofia',
            'label': '(GMT+02:00) Sofia'
        }, {
            'zone': 'Europe/Tallinn',
            'label': '(GMT+02:00) Tallinn'
        }, {
            'zone': 'Europe/Vilnius',
            'label': '(GMT+02:00) Vilnius'
        }, {
            'zone': 'Europe/Athens',
            'label': '(GMT+02:00) Athens'
        }, {
            'zone': 'Europe/Bucharest',
            'label': '(GMT+02:00) Bucharest'
        }, {
            'zone': 'Europe/Istanbul',
            'label': '(GMT+02:00) Istanbul'
        }, {
            'zone': 'Asia/Jerusalem',
            'label': '(GMT+02:00) Jerusalem'
        }, {
            'zone': 'Asia/Amman',
            'label': '(GMT+02:00) Amman'
        }, {
            'zone': 'Asia/Beirut',
            'label': '(GMT+02:00) Beirut'
        }, {
            'zone': 'Africa/Windhoek',
            'label': '(GMT+02:00) Windhoek'
        }, {
            'zone': 'Africa/Harare',
            'label': '(GMT+02:00) Harare'
        }, {
            'zone': 'Asia/Kuwait',
            'label': '(GMT+03:00) Kuwait'
        }, {
            'zone': 'Asia/Riyadh',
            'label': '(GMT+03:00) Riyadh'
        }, {
            'zone': 'Asia/Baghdad',
            'label': '(GMT+03:00) Baghdad'
        }, {
            'zone': 'Africa/Nairobi',
            'label': '(GMT+03:00) Nairobi'
        }, {
            'zone': 'Asia/Tbilisi',
            'label': '(GMT+03:00) Tbilisi'
        }, {
            'zone': 'Europe/Moscow',
            'label': '(GMT+03:00) Moscow'
        }, {
            'zone': 'Europe/Volgograd',
            'label': '(GMT+03:00) Volgograd'
        }, {
            'zone': 'Asia/Tehran',
            'label': '(GMT+03:30) Tehran'
        }, {
            'zone': 'Asia/Muscat',
            'label': '(GMT+04:00) Muscat'
        }, {
            'zone': 'Asia/Baku',
            'label': '(GMT+04:00) Baku'
        }, {
            'zone': 'Asia/Yerevan',
            'label': '(GMT+04:00) Yerevan'
        }, {
            'zone': 'Asia/Yekaterinburg',
            'label': '(GMT+05:00) Ekaterinburg'
        }, {
            'zone': 'Asia/Karachi',
            'label': '(GMT+05:00) Karachi'
        }, {
            'zone': 'Asia/Tashkent',
            'label': '(GMT+05:00) Tashkent'
        }, {
            'zone': 'Asia/Kolkata',
            'label': '(GMT+05:30) Calcutta'
        }, {
            'zone': 'Asia/Colombo',
            'label': '(GMT+05:30) Sri Jayawardenepura'
        }, {
            'zone': 'Asia/Katmandu',
            'label': '(GMT+05:45) Kathmandu'
        }, {
            'zone': 'Asia/Dhaka',
            'label': '(GMT+06:00) Dhaka'
        }, {
            'zone': 'Asia/Almaty',
            'label': '(GMT+06:00) Almaty'
        }, {
            'zone': 'Asia/Novosibirsk',
            'label': '(GMT+06:00) Novosibirsk'
        }, {
            'zone': 'Asia/Rangoon',
            'label': '(GMT+06:30) Yangon (Rangoon)'
        }, {
            'zone': 'Asia/Krasnoyarsk',
            'label': '(GMT+07:00) Krasnoyarsk'
        }, {
            'zone': 'Asia/Bangkok',
            'label': '(GMT+07:00) Bangkok'
        }, {
            'zone': 'Asia/Jakarta',
            'label': '(GMT+07:00) Jakarta'
        }, {
            'zone': 'Asia/Brunei',
            'label': '(GMT+08:00) Beijing'
        }, {
            'zone': 'Asia/Chongqing',
            'label': '(GMT+08:00) Chongqing'
        }, {
            'zone': 'Asia/Hong_Kong',
            'label': '(GMT+08:00) Hong Kong'
        }, {
            'zone': 'Asia/Urumqi',
            'label': '(GMT+08:00) Urumqi'
        }, {
            'zone': 'Asia/Irkutsk',
            'label': '(GMT+08:00) Irkutsk'
        }, {
            'zone': 'Asia/Ulaanbaatar',
            'label': '(GMT+08:00) Ulaan Bataar'
        }, {
            'zone': 'Asia/Kuala_Lumpur',
            'label': '(GMT+08:00) Kuala Lumpur'
        }, {
            'zone': 'Asia/Singapore',
            'label': '(GMT+08:00) Singapore'
        }, {
            'zone': 'Asia/Taipei',
            'label': '(GMT+08:00) Taipei'
        }, {
            'zone': 'Australia/Perth',
            'label': '(GMT+08:00) Perth'
        }, {
            'zone': 'Asia/Seoul',
            'label': '(GMT+09:00) Seoul'
        }, {
            'zone': 'Asia/Tokyo',
            'label': '(GMT+09:00) Tokyo'
        }, {
            'zone': 'Asia/Yakutsk',
            'label': '(GMT+09:00) Yakutsk'
        }, {
            'zone': 'Australia/Darwin',
            'label': '(GMT+09:30) Darwin'
        }, {
            'zone': 'Australia/Adelaide',
            'label': '(GMT+09:30) Adelaide'
        }, {
            'zone': 'Australia/Canberra',
            'label': '(GMT+10:00) Canberra'
        }, {
            'zone': 'Australia/Melbourne',
            'label': '(GMT+10:00) Melbourne'
        }, {
            'zone': 'Australia/Sydney',
            'label': '(GMT+10:00) Sydney'
        }, {
            'zone': 'Australia/Brisbane',
            'label': '(GMT+10:00) Brisbane'
        }, {
            'zone': 'Australia/Hobart',
            'label': '(GMT+10:00) Hobart'
        }, {
            'zone': 'Asia/Vladivostok',
            'label': '(GMT+10:00) Vladivostok'
        }, {
            'zone': 'Pacific/Guam',
            'label': '(GMT+10:00) Guam'
        }, {
            'zone': 'Pacific/Port_Moresby',
            'label': '(GMT+10:00) Port Moresby'
        }, {
            'zone': 'Asia/Magadan',
            'label': '(GMT+11:00) Magadan'
        }, {
            'zone': 'Pacific/Fiji',
            'label': '(GMT+12:00) Fiji'
        }, {
            'zone': 'Asia/Kamchatka',
            'label': '(GMT+12:00) Kamchatka'
        }, {
            'zone': 'Pacific/Auckland',
            'label': '(GMT+12:00) Auckland'
        }, {
            'zone': 'Pacific/Tongatapu',
            'label': '(GMT+13:00) Nukualofa'
        }];
        return {
            timezones: timezones,
            twentyFourHourToMeridiem: function (time) {
                var firstDigits, matchTime;
                if (!time || !_.isString(time)) {
                    return '';
                }
                matchTime = time.match(/([0-2][0-9]):([0-5][0-9])/);
                if (matchTime !== null) {
                    firstDigits = matchTime[1];
                    if (firstDigits === '00') {
                        return ("" + (parseInt(firstDigits) + 12)) + ":" + ("" + matchTime[2]) + " AM";
                    } else if (parseInt(firstDigits) === 12) {
                        return ("" + firstDigits) + ":" + ("" + matchTime[2]) + " PM";
                    } else if (parseInt(firstDigits) > 12) {
                        if (parseInt(firstDigits) < 22) {
                            return "0" + ("" + (parseInt(firstDigits) - 12)) + ":" + ("" + matchTime[2]) + " PM";
                        } else {
                            return ("" + (parseInt(firstDigits) - 12)) + ":" + ("" + matchTime[2]) + " PM";
                        }
                    } else {
                        return ("" + firstDigits) + ":" + ("" + matchTime[2]) + " AM";
                    }
                } else {
                    return '';
                }
            },
            meridiemToTwentyFourHour: function (time) {
                var matchTime;
                if (!time || !_.isString(time)) {
                    return '';
                }
                matchTime = time.match(/(1[0-2]|0[0-9]):([0-5][0-9])\s(AM|PM)/i);
                if (matchTime !== null) {
                    if (matchTime[3].toLowerCase() === 'am') {
                        if (matchTime[1] !== '12') {
                            return ("" + matchTime[1]) + ":" + ("" + matchTime[2]) + ":00";
                        } else {
                            return "0" + ("" + (parseInt(matchTime[1]) - 12)) + ":" + ("" + matchTime[2]) + ":00";
                        }
                    } else {
                        if (matchTime[1] !== '12') {
                            return ("" + (parseInt(matchTime[1]) + 12)) + ":" + ("" + matchTime[2]) + ":00";
                        } else {
                            return ("" + matchTime[1]) + ":" + ("" + matchTime[2]) + ":00";
                        }
                    }
                } else {
                    return '';
                }
            }
        };
    });
mUbConfigProvider.factory('GoodBye', ['$window',
	function ($window) {
		var enabled, handler, self;
		enabled = false;
		handler = void 0;
		self = {
			onbeforeunload_handler: function (evt) {
				var message;
				handler = this.getHandler();
				message = handler ? handler() : "";
				if (typeof evt === 'undefined') {
					evt = window.event;
				}
				if (evt) {
					evt.returnValue = message;
				}
				return message;
			},
			getState: function () {
				return enabled;
			},
			setState: function (newState) {
				enabled = newState;
				if (enabled === true) {
					$window.onbeforeunload = this.onbeforeunload_handler.bind(this);
				} else {
					$window.onbeforeunload = null;
				}
			},
			getHandler: function () {
				return handler;
			},
			Off: function () {
				handler = void 0;
				return this.setState(false);
			},
			On: function (_handler) {
				handler = _handler;
				return this.setState(true);
			}
		};
		return self;
	}
]);