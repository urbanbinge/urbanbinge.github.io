var mubUtils = angular.module("ubUtils", ['$strap.directives', 'elasticjs.service', 'ubFileUpload']);

mubUtils.directive('ubSearchBox', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?cdMouseDrag',
        scope: true,
        controller: function ($scope, $timeout, $window, $http, ejsResource, ubconfig, $analytics, ubSharedService) {
            console.log('Search Box');
			$scope.selectedAddress = '';
            // Datepicker directive
			
            $scope.datepicker = {
                Fromdate: new Date(),
                Todate: new Date()
            };
            // events occuring current week
            $scope.eventsThisWeek = function () {
                var curr = new Date; // get current date
                var first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week
                var last = first + 6; // last day is the first day + 6

                var firstday = new Date(curr.setDate(first)).toISOString();
                var lastday = new Date(curr.setDate(last)).toISOString();
                console.log("this week");
                // do date range search
                /* {
                 "filter" : {
                 "range" : {
                 "PublishTime" : {
                 "from" : "20130505T000000",
                 "to" : "20131105T235959"
                 }
                 }
                 }
                 }*/
                // after REST call for search
                if (ubSharedService.getIsAddaSearch() == false)
                    $scope.$emit('activate_slider_list', 1);

                $analytics.eventTrack('thisWeek', {
                    category: 'search',
                    label: 'thisWeek'
                });
            };
            var url_root = ubconfig.get('ubapi_url');
            url_root = url_root.slice(0, -1);
            console.log('url is ', url_root);

            var ejs = ejsResource(url_root);

            var oQuery = ejs.QueryStringQuery().defaultField('eventTitle');

            var client = ejs.Request()
                .indices('events')
                .types('search');

			$scope.$watch('selectedAddress',function(){
				console.log("ggb $scope.selectedAddress = ",$scope.selectedAddress);
			});
            $scope.search = function (term) {
                // do these operation for searching events
                if (ubSharedService.getIsAddaSearch() == false) {
                   /* $scope.results = client
                        .query(oQuery.query($scope.queryTerm || '*'))
                        .doSearch(function (obj) {
                            console.log('query term', $scope.queryTerm);
                            $scope.$emit('searchlist', obj);
                        },
                        function _error(code) {
                            console.log("Error = ", code);
                        });
                    if ($scope.queryTerm != undefined) {
                        $analytics.eventTrack('search', {
                            category: 'search',
                            label: $scope.queryTerm
                        });
                    } */
					return $http.get('search.json').then(function(response) {
						return response.data;
					  });
					
                } else if (ubSharedService.getIsAddaSearch() == true) { //// do these operation for searching addas
                    console.log('Directive ubSearchBox', 'searching adda events');

                    var cityId = ubSharedService.getCurrentCityId();

                    $http.get('adda.json')
                        .then(function (result) {
                            var resultsArray = [];
                            angular.forEach(result.data, function (value, key) {
                                if (value.cityId == cityId) {
                                    var obj = {};
                                    angular.copy(value, obj);
                                    resultsArray.push(obj);
                                }
                            });
                            $scope.$emit('update_addas_search_list', resultsArray);
                        });

                } else {
                    console.log('shouldnt be here');
                }


            };
        },
        templateUrl: 'html/search.html'
    };
});


mubUtils.directive('ubFileUploader', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?cdMouseDrag',
        scope: true,
        controller: ['$scope', '$http', 'ubconfig',
            function ($scope, $http, ubconfig) {
                var url = ubconfig.get('ubapi_url');
                $scope.options = {
                    url: url
                };
                $scope.loadingFiles = true;
                $http.get(url)
                    .then(
                    function (response) {
                        $scope.loadingFiles = false;
                        $scope.queue = response.data.files || [];
                    },
                    function () {
                        $scope.loadingFiles = false;
                    }
                );
            }
        ],
        templateUrl: 'html/fileuploader.html'
    };
});

mubUtils.directive('ubFileDestroyer', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?cdMouseDrag',
        scope: true,
        controller: ['$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
                        $scope.clear(file);
                    };
                }
            }
        ],
        templateUrl: 'html/filedestroyer.html'
    };
});
mubUtils.factory('localizedMessages', ['ubconfig',
    function (ubconfig) {

        var msgArray = ubconfig.get('errormessages');

        return {
            get: function (msgKey) {
                var msg = msgArray[msgKey];
                if (msg) {
                    return msg;
                } else {
                    return "";
                }
            }
        };
    }
]);
/*
 mubUtils.directive('ubPageScroll', [
 '$rootScope', '$window', '$element', function($rootScope, $window, $element) {
 return {
 restrict : 'A',
 replace : true,
 require: '?cdMouseDrag',
 scope : false,
 controller: ['$rootScope','$window','$element',
 function($rootScope, $window,elem) {
 var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
 $window = angular.element($window);
 scrollDistance = 0;
 if ($rootScope.ubpageScrollDistance != null) {
 $rootScope.$watch($rootScope.ubpageScrollDistance, function(value) {
 return scrollDistance = parseInt(value, 10);
 });
 }
 scrollEnabled = true;
 checkWhenEnabled = false;
 if ($rootScope.ubpageScrollDisabled != null) {
 $rootScope.$watch($rootScope.ubpageScrollDisabled, function(value) {
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
 remaining = elementBottom - windowBottom;
 shouldScroll = remaining <= $window.height() * scrollDistance;
 if (shouldScroll && scrollEnabled) {
 if ($rootScope.$$phase) {
 return $rootScope.$eval($rootScope.ubpageScroll);
 } else {
 return $rootScope.$apply($rootScope.ubpageScroll);
 }
 } else if (shouldScroll) {
 return checkWhenEnabled = true;
 }
 };
 $window.on('scroll', handler);
 $rootScope.$on('$destroy', function() {
 return $window.off('scroll', handler);
 });
 return $timeout((function() {
 if ($rootScope.ubpageScrollImmediateCheck) {
 if ($rootScope.$eval($rootScope.ubpageScrollImmediateCheck)) {
 return handler();
 }
 } else {
 return handler();
 }
 }), 0);
 }]
 };
 }
 ]);
 */

// analytics
/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * License: MIT
 */
(function (angular, analytics) {
    'use strict';

    var angulartics = window.angulartics || (window.angulartics = {});
    angulartics.waitForVendorApi = function (objectName, delay, registerFn) {
        if (!window.hasOwnProperty(objectName)) {
            setTimeout(function () {
                angulartics.waitForVendorApi(objectName, delay, registerFn);
            }, delay);
        } else {
            registerFn(window[objectName]);
        }
    };

    /**
     * @ngdoc overview
     * @name angulartics
     */
    angular.module('angulartics', [])
        .provider('$analytics', function () {
            var settings = {
                pageTracking: {
                    autoTrackFirstPage: true,
                    autoTrackVirtualPages: true,
                    bufferFlushDelay: 1000
                },
                eventTracking: {
                    bufferFlushDelay: 1000
                }
            };

            var cache = {
                pageviews: [],
                events: []
            };

            var bufferedPageTrack = function (path) {
                cache.pageviews.push(path);
            };
            var bufferedEventTrack = function (event, properties) {
                cache.events.push({
                    name: event,
                    properties: properties
                });
            };

            var api = {
                settings: settings,
                pageTrack: bufferedPageTrack,
                eventTrack: bufferedEventTrack
            };

            var registerPageTrack = function (fn) {
                api.pageTrack = fn;
                angular.forEach(cache.pageviews, function (path, index) {
                    setTimeout(function () {
                        api.pageTrack(path);
                    }, index * settings.pageTracking.bufferFlushDelay);
                });
            };
            var registerEventTrack = function (fn) {
                api.eventTrack = fn;
                angular.forEach(cache.events, function (event, index) {
                    setTimeout(function () {
                        api.eventTrack(event.name, event.properties);
                    }, index * settings.eventTracking.bufferFlushDelay);
                });
            };

            return {
                $get: function () {
                    return api;
                },
                settings: settings,
                virtualPageviews: function (value) {
                    this.settings.pageTracking.autoTrackVirtualPages = value;
                },
                firstPageview: function (value) {
                    this.settings.pageTracking.autoTrackFirstPage = value;
                },
                registerPageTrack: registerPageTrack,
                registerEventTrack: registerEventTrack
            };
        })

        .run(['$rootScope', '$location', '$analytics',
            function ($rootScope, $location, $analytics) {
                if ($analytics.settings.pageTracking.autoTrackFirstPage) {
                    $analytics.pageTrack($location.absUrl());
                }
                if ($analytics.settings.pageTracking.autoTrackVirtualPages) {
                    $rootScope.$on('$routeChangeSuccess', function (event, current) {
                        if (current && (current.$$route || current).redirectTo) return;
                        $analytics.pageTrack($location.url());
                    });
                }
            }
        ])

        .directive('analyticsOn', ['$analytics',
            function ($analytics) {
                function isCommand(element) {
                    return ['a:', 'button:', 'button:button', 'button:submit', 'input:button', 'input:submit'].indexOf(
                        element.tagName.toLowerCase() + ':' + (element.type || '')) >= 0;
                }

                function inferEventType(element) {
                    if (isCommand(element)) return 'click';
                    return 'click';
                }

                function inferEventName(element) {
                    if (isCommand(element)) return element.innerText || element.value;
                    return element.id || element.name || element.tagName;
                }

                function isProperty(name) {
                    return name.substr(0, 9) === 'analytics' && ['on', 'event'].indexOf(name.substr(10)) === -1;
                }

                return {
                    restrict: 'A',
                    scope: false,
                    link: function ($scope, $element, $attrs) {
                        var eventType = $attrs.analyticsOn || inferEventType($element[0]),
                            eventName = $attrs.analyticsEvent || inferEventName($element[0]);

                        var properties = {};
                        angular.forEach($attrs.$attr, function (attr, name) {
                            if (isProperty(attr)) {
                                properties[name.slice(9).toLowerCase()] = $attrs[name];
                            }
                        });

                        angular.element($element[0]).bind(eventType, function () {
                            $analytics.eventTrack(eventName, properties);
                        });
                    }
                };
            }
        ]);
})(angular);

/**
 * @license Angulartics v0.8.5
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Universal Analytics update contributed by http://github.com/willmcclellan
 * License: MIT
 */
(function (angular) {
    'use strict';

    /**
     * @ngdoc overview
     * @name angulartics.google.analytics
     * Enables analytics support for Google Analytics (http://google.com/analytics)
     */
    angular.module('ubanalytics', ['angulartics'])
        .config(['$analyticsProvider',
            function ($analyticsProvider) {

                // GA already supports buffered invocations so we don't need
                // to wrap these inside angulartics.waitForVendorApi

                $analyticsProvider.registerPageTrack(function (path) {
                    if (window._gaq) _gaq.push(['_trackPageview', path]);
                    if (window.ga) ga('send', 'pageview', path);
                });

                $analyticsProvider.registerEventTrack(function (action, properties) {
                    if (window._gaq) _gaq.push(['_trackEvent', properties.category, action, properties.label, properties.value]);
                    if (window.ga) ga('send', 'event', properties.category, action, properties.label, properties.value);
                });

            }
        ]);
})(angular);


// recommendation 

//toast

/*
 * AngularJS Toaster
 * Version: 0.4.1
 *
 * Copyright 2013 Jiri Kavulak.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Author: Jiri Kavulak
 * Related to project of John Papa and Hans Fj�llemark
 */

angular.module('ubtoaster', ['ngAnimate'])
    .service('toaster', ['$rootScope',
        function ($rootScope) {
            this.pop = function (type, title, body, timeout, bodyOutputType) {
                this.toast = {
                    type: type,
                    title: title,
                    body: body,
                    timeout: timeout,
                    bodyOutputType: bodyOutputType
                };
                $rootScope.$broadcast('toaster-newToast');
            };
        }
    ])
    .constant('toasterConfig', {
        'tap-to-dismiss': true,
        'newest-on-top': true,
        //'fade-in': 1000,            // done in css
        //'on-fade-in': undefined,    // not implemented
        //'fade-out': 1000,           // done in css
        // 'on-fade-out': undefined,  // not implemented
        //'extended-time-out': 1000,    // not implemented
        'time-out': 5000, // Set timeOut and extendedTimeout to 0 to make it sticky
        'icon-classes': {
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning'
        },
        'body-output-type': '', // Options: '', 'trustedHtml', 'template'
        'body-template': 'toasterBodyTmpl.html',
        'icon-class': 'toast-info',
        'position-class': 'toast-top-full-width',
        'title-class': 'toast-title',
        'message-class': 'toast-message'
    })
    .directive('ubtoasterContainer', ['$compile', '$timeout', '$sce', 'toasterConfig', 'toaster',
        function ($compile, $timeout, $sce, toasterConfig, toaster) {
            return {
                replace: true,
                restrict: 'EA',
                link: function (scope, elm, attrs) {

                    var id = 0;

                    var mergedConfig = toasterConfig;
                    if (attrs.toasterOptions) {
                        angular.extend(mergedConfig, scope.$eval(attrs.toasterOptions));
                    }

                    scope.config = {
                        position: mergedConfig['position-class'],
                        title: mergedConfig['title-class'],
                        message: mergedConfig['message-class'],
                        tap: mergedConfig['tap-to-dismiss']
                    };

                    function addToast(toast) {
                        toast.type = mergedConfig['icon-classes'][toast.type];
                        if (!toast.type)
                            toast.type = mergedConfig['icon-class'];

                        id++;
                        angular.extend(toast, {
                            id: id
                        });

                        switch (toast.bodyOutputType) {
                            case 'trustedHtml':
                                toast.html = $sce.trustAsHtml(toast.body);
                                break;
                            case 'template':
                                toast.bodyTemplate = mergedConfig['body-template'];
                                break;
                        }

                        var timeout = typeof (toast.timeout) == "number" ? toast.timeout : mergedConfig['time-out'];
                        if (timeout > 0)
                            setTimeout(toast, timeout);

                        if (mergedConfig['newest-on-top'] === true)
                            scope.toasters.unshift(toast);
                        else
                            scope.toasters.push(toast);
                    }

                    function setTimeout(toast, time) {
                        toast.timeout = $timeout(function () {
                            scope.removeToast(toast.id);
                        }, time);
                    }

                    scope.toasters = [];
                    scope.$on('toaster-newToast', function () {
                        addToast(toaster.toast);
                    });
                },
                controller: ['$scope', '$element', '$attrs',
                    function ($scope, $element, $attrs) {

                        $scope.stopTimer = function (toast) {
                            if (toast.timeout)
                                $timeout.cancel(toast.timeout);
                        };

                        $scope.removeToast = function (id) {
                            var i = 0;
                            for (i; i < $scope.toasters.length; i++) {
                                if ($scope.toasters[i].id === id)
                                    break;
                            }
                            $scope.toasters.splice(i, 1);
                        };

                        $scope.remove = function (id) {
                            if ($scope.config.tap === true) {
                                $scope.removeToast(id);
                            }
                        };
                    }
                ],
                template: '<div  id="toast-container" ng-class="config.position">' +
                    '<div ng-repeat="toaster in toasters" class="toast" ng-class="toaster.type" ng-click="remove(toaster.id)" ng-mouseover="stopTimer(toaster)">' +
                    '<div ng-class="config.message" ng-switch on="toaster.bodyOutputType">' +
                    '<div ng-switch-when="trustedHtml" ng-bind-html="toaster.html"></div>' +
                    '<div ng-switch-when="template"><div ng-include="toaster.bodyTemplate"></div></div>' +
                    '<div ng-switch-default >{{toaster.body}}</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
            };
        }
    ]);





// Parse a date string in the format yyy-MM-ddThh:mm:ss TZD
// Example: 2010-08-20T10:02:32 -06:-30
function parseAddaDateString(dateString) {
    var year = dateString.substring(0,4);
    var month = dateString.substring(5,7);
    var day = dateString.substring(8,10);
    var hour = dateString.substring(11,13);
    var minute = dateString.substring(14,16);
    var second = dateString.substring(17,19);
    var timezoneTmp = dateString.substring(20).trim();
    var timezone = timezoneTmp.substring(0,1) + timezoneTmp.substring(1).replace('-','').replace('+','');

    var utcString = year +"-" + month + "-" +day + "T" +hour + ":"+minute +":"+second +timezone  ;
    var dateobj = new Date(Date.parse(utcString));

    return dateobj;

}