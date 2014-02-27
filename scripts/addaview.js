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

ubAddaView.controller("addaViewCtrl", ['$scope', '$routeParams', '$modal', '$location', '$anchorScroll', 'ubSharedService',
    'addaViewService', function ($scope, $routeParams, $modal, $location, $anchorScroll, ubSharedService, addaViewService) {
    $scope.adda = {};
    $scope.htmlEmail = '';
    $scope.joinAdda = {};
    ubSharedService.sethistory('/');
    if ($location.path().indexOf('/admin') > -1) {
        $scope.isOrganizer = true;
    } else {
        $scope.isOrganizer = false;
    }


    addaViewService.getAdda($routeParams.addaId).then(function (d) {
        //var dateCreated = new Date(d.registeredOn);
        var dateCreated = parseAddaDateString(d.registeredOn);
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

        if (page == 'theme') {
            $location.hash('addadescription');
            $anchorScroll();
        }

        if (page == 'events') {
            $location.hash('addaevents');
            $anchorScroll();
        }

        if (page == 'noticeboard') {
            $location.hash('addaview_noticeboard');
            $anchorScroll();
        }

        if (page == 'members') {
            $location.hash('adda_members');
            $anchorScroll();
        }

    }
$scope.newMembersSorted = [];
        $scope.getMembersList = function(){
            if($scope.adda.members!=undefined) {
                if($scope.newMembersSorted.length == 0){
                    var membersSorted = $scope.adda.members.sort(function(a, b) {
                        var textA = a.name.toUpperCase();
                        var textB = b.name.toUpperCase();
                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                    });

                    var current = '';

                    angular.forEach(membersSorted, function (member){
                        var letter = member.name.trim().substring(0,1).toLowerCase();
                        if (letter != current) {
                            $scope.newMembersSorted.push({
                                letter: letter,
                                typeOfItem: 'letter'
                            });
                            current = letter;
                        }
                        var newMemberObj = {};
                        angular.copy(member, newMemberObj);

                        newMemberObj.typeOfItem = 'member';
                        $scope.newMembersSorted.push(newMemberObj);

                    });

                    return $scope.newMembersSorted;
                }else{
                    return $scope.newMembersSorted;
                }

            }
            return $scope.newMembersSorted;

        }

        $scope.getMembersClass = function (member) {
            if (member.typeOfItem == 'letter') {
                return 'member_container member_letter';
            }else{
                return 'member_container';
            }
        }


    $scope.showAddEventDialog = function () {
        console.log('Adding event');
        var modalInstance = $modal.open({
            // Controller of the modal dialog
            controller: AddEventInstanceCtrl,
            templateUrl: 'html/add_adda_event.html',
            windowClass: 'modal-huge'
        });

        modalInstance.result.then(function (newEvent) {
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

ubAddaView.controller("addaEventViewCtrl", ['$scope', '$routeParams', '$location', '$modal', '$filter', 'ubSharedService', 'addaViewService',
    function ($scope, $routeParams, $location, $modal,$filter,ubSharedService, addaViewService) {

       // console.log($routeParams);
       // console.log($location);

        ubSharedService.sethistory('/');

        if ($location.path().indexOf('/admin') > -1) {
            $scope.isOrganizer = true;
        } else {
            $scope.isOrganizer = false;
        }

        addaViewService.getAddaEventById($routeParams.addaId, $routeParams.eventId).then(function (d) {
            $scope.event = d.eventObj;
            $scope.eventDate = parseAddaDateString( d.eventObj.eventDate);
            $scope.adda = d.addaObj;

            $scope.infoComments = $scope.event.membersComments.slice(0, 5);

            console.log('Adda event', d);
        });

        $scope.newcommenttext = '';

        $scope.myInterval = false;

        $scope.init = function () {

        }

        $scope.postComment = function() {
            if($scope.newcommenttext.length> 0){
                var newComment = {
                    comment: $scope.newcommenttext,
                    commentDate: $filter('date')( new Date(), 'yyyy-MM-dd hh:mm:ss Z'),
                    commentId: -1,
                    name: "Anonymus",
                    uid: -1
                };
                $scope.event.membersComments.push(newComment);
            }
            $scope.newcommenttext = '';
        }

        // Shows the edit event dialog
        $scope.editevent = function (event) {
            console.log('Editing event');
            var modalInstance = $modal.open({
                // Controller of the modal dialog
                controller: EditEventInstanceCtrl,
                templateUrl: 'html/edit_adda_event.html',
                windowClass: 'modal-huge',
                resolve: {
                    eventObj: function () {
                        return event;
                    }
                }
            });

            modalInstance.result.then(function (newEvent) {
                $scope.newEvent = newEvent;
                console.log(newEvent);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        $scope.active = 'info';
        $scope.getMenuClass = function (page) {
//            if (page == $scope.active) {
//                return "active";
//            } else {
//                return "";
//            }
            return '';
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
                    var urlEvent = '/addaview/' + $routeParams.addaId + '/event/' + event.eventId;
                    $location.path(urlEvent);
                }
                $scope.$watch('events', function (newValue) {
                    if (newValue != undefined) {
                        var step = 1;
                        var visible = 3;
                        var speed = 200;
                        var liSize = 310;
                        var divSize = visible * liSize;
                        var carouselHeight = 200;
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

            controller: function ($scope, $element) {
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
                        var prevButton = $($element.find('.btnprev_member')[0]);
                        var nextButton = $($element.find('.btnnext_member')[0]);
                        var ulElement = $($element.find('ul')[0]);
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

            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

ubAddaView.directive('aPreventDefault', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function (e) {
                    e.preventDefault();
                });
            }
        }
    };
});

ubAddaView.directive('ubCommentsThread', function () {
    return {
        restrict: "E",
        replace: true,
        scope: {
            comments: '='
        },
        template: '<div class="addacomment_thread" data-ng-repeat="comment in comments"><ub-comment-block comment="comment" commentsarray="comments"></ub-comment-block></div>',
        link: function (scope, elem, attrs) {
            angular.forEach(scope.comments, function(comment){
                if (typeof comment.commentReplies == "undefined"){
                    comment.commentReplies = [];
                }
            });
        }
    };
});

ubAddaView.directive('ubCommentBlock', ['$compile', '$filter', function ($compile, $filter) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            comment:'=',
            commentsarray: '='
        },
        templateUrl:'html/comment_thread.html',
        controller: function($scope,$element){
            $scope.isAddingReply = false;
            $scope.commentDate = parseAddaDateString($scope.comment.commentDate);
            $scope.reply  = function(event,comment) {
                if(!$scope.isAddingReply) {
                    var htmlform = '<form class="addacomment_form"><textarea class="addacomment_tareply" ng-model="replyText"></textarea><button class="btn btn-sm btn-default" ng-click="addReply( $event,comment   )">Post</button></div></form>';
                    $compile(htmlform)($scope, function(cloned, scope){
                        $(event.target).parent().parent().append(cloned);
                    });
                    $scope.isAddingReply = true;
                }


            }

            $scope.addReply = function (event){
                event.preventDefault();
                if (typeof $scope.comment.commentReplies == "undefined"){
                    $scope.comment.commentReplies = [];
                }
                var newComment = {
                    comment: $scope.replyText,
                    commentDate: $filter('date')( new Date(), 'yyyy-MM-dd hh:mm:ss Z'),
                    commentId: -1,
                    name: "Anonymus",
                    uid: -1
                };
                $scope.comment.commentReplies.push(newComment);

                if( angular.isArray($scope.comment.commentReplies) && $element.find('.addacomment_replies').length <= 0 ){
                    $compile("<ub-comments-thread comments='comment.commentReplies'></ub-comments-thread>")($scope, function(cloned, scope){
                        $element.append(  angular.element('<div class="addacomment_replies"></div>').append(cloned) );
                        //  element.append(cloned);
                    });
                }
                 $('.addacomment_form').remove();
                $scope.replyText = '';
                $scope.isAddingReply = false;


                //console.log('Adding reply for' , comment, event);
            }

            $scope.delete  = function() {
                var index = -1;
                angular.forEach($scope.commentsarray, function(commentInParent, key){
                    if(commentInParent == $scope.comment){
                        index = key;
                    }
                });
                $scope.commentsarray.splice(index, 1);
            }
        },
        link: function (scope, element, attrs) {
            // Here goes logic to handle replies
            if( angular.isArray(scope.comment.commentReplies)){
                $compile("<ub-comments-thread comments='comment.commentReplies'></ub-comments-thread>")(scope, function(cloned, scope){
                  element.append(  angular.element('<div class="addacomment_replies"></div>').append(cloned) );
                  //  element.append(cloned);
                });
            }
        }
    };
}]);

ubAddaView.directive('ngConfirmClick', [
    function(){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }]);

ubAddaView.directive('ubLightboxGallery', ['$filter', function($filter){
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: 'html/addaeventphoto_lightbox.html',
       // template: '<div  style="display:none"><div id="lightbox_gallery"><div rel="eventgallery" id="slideshow_{{ photo.imageId }}" class="eventgallery"  item="photo" ng-repeat="photo in photos"><img ng-src="{{ photo.imageURL }}" alt=""/></div></div></div>',
controller: function($scope){
    $scope.saveComment = function (photo) {
        console.log('saving comment ', photo);
        if (photo.comments == undefined) {
            photo.comments = [];
        }

        photo.comments.push({
            comment: photo.photoCommentText,
            date: $filter('date')( new Date(), 'yyyy-MM-dd hh:mm:ss Z'),
            user: 'Anonymus' // get the user that do the comment
        });
        photo.photoCommentText = '';
        console.log('photo', photo);
    }
},

        scope: {
            photos: '='
        }

    }
}]);



ubAddaView.directive('ubLightboxButton', function () {
    return {
        restrict: 'A'  ,
        link: function (scope, elem, attrs) {

            elem.click(function(e){
                e.preventDefault();
                $("#lightbox_gallery_links>a").colorbox({
                    rel:'eventgallery',
                    inline: true,
                    width: 900, height: 480,
                    href: function(){
                        console.log($.colorbox.element().attr('photoid'));
                        return "#" + $.colorbox.element().attr('photoid');
                    }
                }).eq(0).click();
//                $(".eventgallery").colorbox({
//                    rel:'eventgallery'
//                }).eq(0).click();
            });
        }
    };
});



//
//
//ubAddaView.directive('ubLightboxItem', function(){
//    return {
//        restrict: 'A',
//        replace: true,
//        template: '<img ng-src="{{ item.imageURL }} }}" alt=""/>',
//        scope: {
//            item: '='
//        },
//        link: function(scope, elem){
//           // elem.colorbox({ rel:'eventgallery'});
//        },
//        controller: function($scope, $element){
//
//        }
//
//    }
//});


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

    $scope.$on('fileuploadadd', function (e, data) {
        console.log(data);
    });


    $scope.tagsSelected = [];

    $scope.cancelDialog = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.privacyChanged = function () {
        console.log('privacyChanged', $scope.isPrivate);
    }


    $scope.ok = function () {
        if ($scope.currentPage === 1) {
            // Validate that is added at least the Group Name
            if ($scope.eventTitle.length <= 0 && $scope.location.length <= 0) {
                alert('Event title and location are mandatory');
                return;
            }
            if ($scope.options != undefined && ($scope.options.uploadAditionalPhotos || $scope.options.uploadCoverPage)) {
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
            newEvent.eventTitle = $scope.eventTitle;
            newEvent.introduction = $scope.introduction;
            newEvent.date = $scope.date;
            newEvent.location = $scope.location;
            newEvent.tags = $scope.tagsSelected;
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

function EditEventInstanceCtrl($scope, $modalInstance, $http, ubconfig, eventObj) {
    $scope.event = eventObj;
    console.log($scope.event);
    $scope.currentPage = 1;
    $scope.options = {
    };
    $scope.date =  parseAddaDateString(eventObj.eventDate);

    $scope.noLimit = false;
    $scope.introduction = '';
    $scope.coverPhotoImg = '';
    $scope.logoImg = '';
    $scope.isPrivate = false;
    $scope.coverfilename = {};
    $scope.logofilename = {};

    $scope.$on('fileuploadadd', function (e, data) {
        console.log(data);
    });

    $scope.tagsSelected = [];

    $scope.cancelDialog = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.privacyChanged = function () {
        console.log('privacyChanged', $scope.isPrivate);
    }

    $scope.ok = function () {
        if ($scope.currentPage === 1) {
            // Validate that is added at least the Group Name
            if ($scope.event.eventTitle.length <= 0 && $scope.event.eventVenue.length <= 0) {
                alert('Event title and location are mandatory');
                return;
            }
            if ($scope.options != undefined && ($scope.options.uploadAditionalPhotos || $scope.options.uploadCoverPage)) {
                $scope.currentPage = 2;
                $scope.launchImageuploader = true;
            } else {
                $scope.currentPage = 3;
            }
        } else if ($scope.currentPage === 2) {
            $scope.currentPage = 3;
        } else if ($scope.currentPage === 3) {
            $modalInstance.close(eventObj);

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