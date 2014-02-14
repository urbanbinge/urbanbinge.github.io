var ubAddaView = angular.module("ubAddaView", []);

ubAddaView.factory("addaViewService", [ '$http', '$q', function ($http, $q) {
    var addaviewsrv = {};
    var currentEvent;

    addaviewsrv.getOrganizerData = function () {
        var obj = {};
        var promise = $http.get('organizer.json').then(function (result) {
            return result;
        });

        return promise;
    }

    addaviewsrv.getUserData = function () {
        var obj = {};
        var promise = $http.get('user.json').then(function (result) {
            return result;
        });

        return promise;
    }


    addaviewsrv.isOrganizer = false;


    addaviewsrv.getAdda = function (addaId) {
        var obj = {};
        var promise = $http.get('adda.json').then(function (result) {
            angular.forEach(result.data, function (value) {
                if (value.id == addaId) {
                    angular.copy(value, obj);
                }
            })
            return obj;
        });

        return promise;

    }

    addaviewsrv.joinAdda = function (joinAddaObj) {
        var url = '';
        $http.post(url, joinAddaObj).success(function (response) {
            console.log(response);
        });
    };

    addaviewsrv.sendEmail = function (addaId, htmlMessage) {
        var url = '';
        var data = {
            addaId: addaId,
            message: htmlMessage
        };

        $http.post(url, data).success(function (response) {
            console.log(response);
        });
    };

    addaviewsrv.selectAddaEvent = function (event) {
        currentEvent = event;
    }

    addaviewsrv.getCurrentAddaEvent = function () {
        return currentEvent;
    }

    addaviewsrv.getAddaEventById = function (addaId, eventId) {
        var addaObj = {}, eventObj = {};
        var url = "adda.json";
        var promise = $http.get(url).then(function (result) {
            angular.forEach(result.data, function (value) {
                if (value.id == addaId) {
                    angular.copy(value, addaObj);
                }
            });

            angular.forEach(addaObj.events, function (event) {
                if (event.eventId == eventId) {
                    angular.copy(event, eventObj);
                }
            });

            return {
                addaObj: addaObj,
                eventObj: eventObj
            }
        });

        return promise;
    }

    return addaviewsrv;

}]);

ubAddaView.controller("addaViewCtrl", ['$scope', '$routeParams', '$modal', '$location', 'addaViewService', function ($scope, $routeParams, $modal,$location, addaViewService) {
    $scope.adda = {};
    $scope.htmlEmail = '';
    $scope.joinAdda = {};

    if($location.path().indexOf('/admin') > -1) {
        $scope.isOrganizer = true;
    }else{
        $scope.isOrganizer = false;
    }


    addaViewService.getAdda($routeParams.addaId).then(function (d) {
        var dateCreated = new Date(d.registeredOn);
        $scope.adda = d;
        $scope.operationalSince = dateCreated.toDateString();
        console.log(d);
    });

    $scope.active = '';
    $scope.getMenuClass = function (page) {
        if (page == $scope.active) {
            return "active";
        } else {
            return "";
        }
    }
    $scope.show = function (page) {
            $scope.active = page;
            console.log($scope.active);



    }

    $scope.showAddEventDialog = function () {
        console.log('Adding event');
        var modalInstance = $modal.open({
            // Controller of the modal dialog
            controller: AddEventInstanceCtrl,
            templateUrl: 'html/add_adda_event.html',
            windowClass: 'modal-huge'
        });

        modalInstance.result.then (function (newEvent) {
            $scope.newEvent = newEvent;
            console.log(newEvent);
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    }

    $scope.getUpcomingEvents = function () {
        return $scope.adda.events;
    }

    $scope.getPastEvents = function () {
        return $scope.adda.events;
    }

    $scope.sendEmail = function () {
        console.log($scope.htmlEmail);
        addaViewService.sendEmail($routeParams.id, $scope.htmlEmail);
    };

    $scope.joinAddaAction = function () {
        addaViewService.joinAdda($scope.joinAdda);
    }


}]);

ubAddaView.controller("addaEventViewCtrl", ['$scope', '$routeParams', '$location', '$modal', 'addaViewService',
    function ($scope, $routeParams, $location, $modal, addaViewService) {

        console.log($routeParams);
        console.log($location);

        if($location.path().indexOf('/admin') > -1) {
            $scope.isOrganizer = true;
        }else{
            $scope.isOrganizer = false;
        }

    addaViewService.getAddaEventById($routeParams.addaId,$routeParams.eventId).then(function (d) {
        $scope.event = d.eventObj;
        $scope.adda = d.addaObj;

        $scope.infoComments = $scope.event.membersComments.slice(0,5);

        console.log('Adda event', d);
    });

        $scope.myInterval = false;
  //  $scope.isOrganizer = addaViewService.isOrganizer;

    $scope.init = function () {

    }

    $scope.active = 'info';
    $scope.getMenuClass = function (page) {
        if (page == $scope.active) {
            return "active";
        } else {
            return "";
        }
    }
    $scope.show = function (page) {
        $scope.active = page;
        console.log($scope.active);
    }



    $scope.replyComment = function (event, commentId) {
        event.preventDefault();
    }


        $scope.photoCommentText = 'fdafsdafdsw';
    $scope.deleteComment = function (event, commentId) {
        event.preventDefault();
    }

        $scope.saveComment = function (photo) {
            if(photo.comments == undefined) {
                photo.comments = [];
            }

            photo.comments.push({
               comment: photo.photoCommentText,
                date: new Date(),
                user: '' // get the user that do the comment
            });
            photo.photoCommentText = '';
            console.log('photo', photo);
        }

}]);

ubAddaView.directive('menuItem', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            show: "&"
        },
        template: '<a href="#" ng-click="show()" ng-transclude></a>',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function (e) {
                    e.preventDefault();
                });
            }
        }
    };
});

ubAddaView.directive('dynamicLayout', function () {
    return {
        restrict: 'A',
        scope: {
            cpage: '=',
            page: '@'
        },
        controller: function ($scope, $element) {
            $scope.$watch('cpage', function (newValue) {

                if (newValue == $scope.page) {
                    var masonry = $($element).data('masonry')
                    masonry.layout();
                    console.log(newValue);
                }
            });
        },
        link: function (scope, elem, attrs) {
            console.log('dynamic layout', elem);

        }
    };
});


ubAddaView.directive('carouselEvents', ['$location', '$routeParams', 'addaViewService',
    function ($location, $routeParams, addaViewService) {
        return {
            restrict: 'E',
            scope: {
                events: "="
            },
            templateUrl: 'html/carousel-events.html',

            controller: function ($scope, $element, $attrs) {
                //$element.preventDefault();
                $scope.selectEvent = function (event) {
                    addaViewService.selectAddaEvent(event);
                    var urlEvent ='/addaview/' + $routeParams.addaId + '/event/' + event.eventId;
                    $location.path(urlEvent);
                }
                $scope.$watch('events', function (newValue) {
                    if (newValue != undefined) {
                        var step = 1;
                        var visible = 4;
                        var speed = 200;
                        var liSize = 275;
                        var divSize = visible * liSize;
                        var carouselHeight = 160;
                        var current = 0;
                        var maximum = $scope.events.length;
                        var ulSize = liSize * maximum;
                        var divElement = $($element.children()[0]);
                        var prevButton = $(divElement.children()[0]);
                        var nextButton = $(divElement.children()[1]);
                        var ulElement = $(divElement.children()[2]);
                        divElement.css("width", divSize + "px").css("height", carouselHeight + "px").css("visibility", "visible").css("overflow", "hidden").css("position", "relative");
                        ulElement.css("width", ulSize + "px").css("left", -(current * liSize)).css("position", "absolute").css('padding', 0);

                        nextButton.click(function (e) {
                            e.preventDefault();
                            if (current + step < 0 || current + step > maximum - visible) {
                                return;
                            }
                            else {
                                current = current + step;
                                ulElement.animate({left: -(liSize * current)}, speed, null);
                            }
                            return false;
                        });

                        prevButton.click(function (e) {
                            e.preventDefault();
                            if (current - step < 0 || current - step > maximum - visible) {
                                return;
                            }
                            else {
                                current = current - step;
                                ulElement.animate({left: -(liSize * current)}, speed, null);
                            }
                            return false;
                        });
                    }
                });
            },
            link: function (scope, elem, attrs) {
                // if(scope.events!=undefined){

                // }

            }
        };
    }]);



ubAddaView.directive('sliderMembers', ['$location', '$routeParams', 'addaViewService',
    function ($location, $routeParams, addaViewService) {
        return {
            restrict: 'E',
            scope: {
                members: "="
            },
            templateUrl: 'html/sliderMembers.html',

            controller: function ($scope, $element ) {
                $scope.$watch('members', function (newValue) {
                    if (newValue != undefined) {
                        var step = 1;
                        var visible = 5;
                        var speed = 200;
                        var liSize = 210;
                        var divSize = visible * liSize;
                        var carouselHeight = 200;
                        var current = 0;
                        var maximum = $scope.members.length;
                        var ulSize = liSize * maximum;
                        var divElement = $($element.find('.addaevent_members')[0]);
                        var prevButton =  $($element.find('.btnprev_member')[0]);
                        var nextButton =  $($element.find('.btnnext_member')[0]);
                        var ulElement =  $($element.find('ul')[0]);
                        divElement.css("width", divSize + "px").css("height", carouselHeight + "px").css("visibility", "visible").css("overflow", "hidden").css("position", "relative");
                        ulElement.css("width", ulSize + "px").css("left", -(current * liSize)).css("position", "absolute").css('padding', 0);

                        nextButton.click(function (e) {
                            e.preventDefault();
                            if (current + step < 0 || current + step > maximum - visible) {
                                return;
                            }
                            else {
                                current = current + step;
                                ulElement.animate({left: -(liSize * current)}, speed, null);
                            }
                            return false;
                        });

                        prevButton.click(function (e) {
                            e.preventDefault();
                            if (current - step < 0 || current - step > maximum - visible) {
                                return;
                            }
                            else {
                                current = current - step;
                                ulElement.animate({left: -(liSize * current)}, speed, null);
                            }
                            return false;
                        });
                    }
                });
            },
            link: function (scope, elem, attrs) {
                // if(scope.events!=undefined){

                // }

            }
        };
    }]);

ubAddaView.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {

            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

ubAddaView.directive('aPreventDefault', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
    };
});


function AddEventInstanceCtrl($scope, $modalInstance, $http, ubconfig) {
    $scope.currentPage = 1;
    $scope.options = {
    };
    $scope.eventTitle = '';
    $scope.location = '';
    $scope.date = '';
    $scope.seats = '';
    $scope.noLimit = false;
    $scope.introduction = '';
    $scope.coverPhotoImg = '';
    $scope.logoImg = '';
    $scope.isPrivate = false;
    $scope.coverfilename = {};
    $scope.logofilename = {};

    $scope.$on('fileuploadadd', function(e, data){
        console.log(data);
    });



    $scope.tagsSelected = [];

    $scope.cancelDialog = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.privacyChanged = function () {
        console.log('privacyChanged',$scope.isPrivate);
    }



    $scope.ok = function () {
        if ($scope.currentPage === 1) {
            // Validate that is added at least the Group Name
            if ($scope.eventTitle.length <=0 && $scope.location.length <= 0) {
                alert ('Event title and location are mandatory');
                return ;
            }
            if ($scope.options!= undefined && ($scope.options.uploadAditionalPhotos || $scope.options.uploadCoverPage)) {
                $scope.currentPage = 2;
                $scope.launchImageuploader = true;
            } else {
                $scope.currentPage = 3;
            }
        } else if ($scope.currentPage === 2) {
            $scope.currentPage = 3;
        } else if ($scope.currentPage === 3) {

            var newEvent = {};
            newEvent.cityId = -1;
            newEvent.eventTitle =  $scope.eventTitle;
            newEvent.introduction = $scope.introduction;
            newEvent.date = $scope.date;
            newEvent.location = $scope.location;
            newEvent.tags = $scope.tagsSelected ;
            $modalInstance.close(newEvent);

        }

    }

    $scope.back = function () {
        if ($scope.currentPage === 2) {
            $scope.currentPage = 1;
        } else if ($scope.currentPage === 3) {

            if ($scope.options.uploadPhotos) {
                $scope.currentPage = 2;
            } else {
                $scope.currentPage = 1;
            }

        }

    }


    $scope.showPage = function (page) {
        if (page === $scope.currentPage) {
            return true;
        }
        return false;
    }
    // NEXT and CREATE ADDA buttons
    $scope.getPrimaryLabelBtn = function () {
        if ($scope.currentPage === 1 || $scope.currentPage === 2) {
            return 'Next';
        } else {
            return 'Create Event'
        }
    }

}