/* Change the factory method to a controller */

var mUbProvider = angular.module('ubapiProvider',[]);

mUbProvider.factory('ubapi', ['$http','ubconfig', function (http,ubconfig) {
    return {
	req: function(url, opt, _success_cb, _error_cb) {
	    var result;
	    var __api_root = ubconfig.get('ubapi_url');
	    delete http.defaults.headers.common['X-Requested-With']; 
	    http({
		method: 'GET',
		url: __api_root + url,
		params: opt
	    })

		.success(function(data, status, headers, config) {
		    // if (data.error.code == 0) {
			_success_cb(data.length, data);
		    // } else {
		    // 	_error_cb(data.error);
		    // }
		})

		.error(function(data, status, headers, config) {
		    _error_cb(data.error);
		});
	},
	event_req: function(url, opt, _success_cb, _error_cb) {
	    var result;
	    //var __api_root = ubconfig.get('ubapi_url');
	    delete http.defaults.headers.common['X-Requested-With']; 
	    http({
		method: 'GET',
		url: 'events.json',
		params: opt
	    })

		.success(function(data, status, headers, config) {
		    // if (data.error.code == 0) {
			_success_cb(data.length, data);
		    // } else {
		    // 	_error_cb(data.error);
		    // }
		})

		.error(function(data, status, headers, config) {
		    _error_cb(data.error);
		});
	},
	category_req: function(url, opt, _success_cb, _error_cb) {
	    var result;
	    //var __api_root = ubconfig.get('ubapi_url');
	    delete http.defaults.headers.common['X-Requested-With']; 
	    http({
		method: 'GET',
		url: 'category.json',
		params: opt
	    })

		.success(function(data, status, headers, config) {
		    // if (data.error.code == 0) {
			_success_cb(data.length, data);
		    // } else {
		    // 	_error_cb(data.error);
		    // }
		})

		.error(function(data, status, headers, config) {
		    _error_cb(data.error);
		});
	},
	post: function(url, opt, _success_cb, _error_cb) {
	    var result;
	    var __api_root = ubconfig.get('ubapi_url');
	    delete http.defaults.headers.common['X-Requested-With']; 
	    http({
		method: 'POST',
		url: __api_root + url,
		params: opt 
	    })

		.success(function(data, status, headers, config) {
		    // if (data.error.code == 0) {
			_success_cb(data);
		    // } else {
		    // 	_error_cb(data.error);
		    // }
		})

		.error(function(data, status, headers, config) {
		    _error_cb(data.error);
		});
	},
	events_all: function(_success_cb, _error_cb, opt) { 
	    this.event_req("events", opt, _success_cb, _error_cb);
	},

	category_all: function(_success_cb, _error_cb, opt) { 
	    this.category_req("category", opt, _success_cb, _error_cb);
	},
	login_check: function(_success_cb, _error_cb, opt) { 
	    this.post("users/mlogin", opt, _success_cb, _error_cb);
	},
	addNewEvent:function(_success_cb, _error_cb, opt) { 
	    this.post("events/add/newEvent", opt, _success_cb, _error_cb);
	},
	signin_check: function(_success_cb, _error_cb, opt) { 
	    this.post("users/add", opt, _success_cb, _error_cb);
	},
	events_limit: function(_success_cb, _error_cb, opt) { 
	   // this.req("events/scroll", opt, _success_cb, _error_cb); if the current eventList impl is bottleneck then enable this.
	   
	}
   };
}]);
