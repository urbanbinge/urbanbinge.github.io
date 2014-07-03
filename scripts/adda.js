var mubAdda = angular.module("ubAdda", []);

// Function to show the filter by category. Ideally should be query from web service
function GetAddasByCategoryId(addas_list, id) {
    var addasBycategory = [];
    if (addas_list != undefined) {
        for (var i = 0; i < addas_list.length; i++) {
            if (addas_list[i].categoryId == id) {
                addasBycategory.push(addas_list[i]);
            }
        }
    }
    return addasBycategory;
}

// Function to get the most recent events
function GetMostRecentEvent(addas_list) {
    if (addas_list != undefined) {
        var mostRecentAdda = addas_list[0];
        var mostRecentEvent = addas_list[0].events[0];
        for (var i = 0; i < addas_list.length; i++) {
            for (var j = 0; j < addas_list[i].events.length; j++) {
                if (parseAddaDateString(addas_list[i].events[j].eventDate) <= parseAddaDateString(mostRecentEvent.eventDate)) {
                    mostRecentEvent = addas_list[i].events[j];
                    mostRecentAdda = addas_list[i];
                }
            }
        }
        return mostRecentAdda;
    }
    return {};
}

function addaCategoryListInit($scope, ubapi) {
    // sample category (taken from events). this needs to be replaced with data from GET /adda_category 
    CategoryListInit($scope, ubapi);
}



function CreateAddaDialogCtrl($scope, $modalInstance, $http, ubconfig) {
    $scope.currentPage = 1;
    $scope.options = {

    };
    $scope.groupName = '';
    $scope.location = '';
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
	
	$scope.typeChanged = function () {
        console.log('typeChanged',$scope.isOfType);
    }



    $scope.ok = function () {
        if ($scope.currentPage === 1) {
            // Validate that is added at least the Group Name
            if ($scope.groupName.length <=0 && $scope.location.length <= 0) {
                alert ('Group name and location are mandatory');
                return ;
            }
            if ($scope.options.uploadPhotos) {
                $scope.currentPage = 2;
                $scope.launchImageuploader = true;
            } else {
                $scope.currentPage = 3;
            }
        } else if ($scope.currentPage === 2) {
            $scope.currentPage = 3;
        } else if ($scope.currentPage === 3) {

            var newAdda = {};
            newAdda.cityId = -1;
            newAdda.isPrivate = $scope.isPrivate;
            newAdda.sendAlerts = $scope.options.sendAlerts;
            newAdda.organizerLogoURL = $scope.logoImg;
            newAdda.addaPicture = $scope.coverPhotoImg;
            newAdda.addaName =  $scope.groupName;
            newAdda.addaDescription = $scope.introduction;
            newAdda.addaLocation = $scope.location;
            newAdda.organizerLogoURL = $scope.logoImg;
            newAdda.addaPicture = $scope.coverPhotoImg;
            newAdda.tags = $scope.tagsSelected ;
            $modalInstance.close(newAdda);

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
            return 'Create Adda'
        }
    }

}



mubAdda.directive('addaImageUpload', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?cdMouseDrag',
        scope: {
            filename: '=',
            title: '@',
            optionsPreview: '='
        },
        controller: ['$scope', '$element', '$http', 'ubconfig',
            function ($scope, $element, $http, ubconfig) {

                //var url = ubconfig.get('ubapi_url') + /imgserver';
                var url = 'imgserver/index.php'; // demo
                $scope.options = {
                    url: url,
                    maxNumberOfFiles: 1
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
                $scope.$watch('optionsPreview', function(newVal){
                    $element.find('.')
                })

            }
        ],
        link: function(scope, element, attrs){
            scope.options.dropZone = element.find('.adda_dropzone');
            scope.$on('fileuploadadd', function(e, data) {
                scope.filename = data.files[0];
            });
            scope.$on('fileuploadfail', function(e, data) {
                console.log('Error uploading files', e);
                console.log('Error uploading files', data);
            });
        },
        templateUrl: 'html/addafileuploader.html'
    }
});

// Directive to handle the change on file input
mubAdda.directive('file', function () {
    return {
        scope: {
            file: '='
        },
        link: function (scope, el, attrs) {
            el.bind('change', function (event) {
                var files = event.target.files;
                var file = files[0];
                scope.file = file ? file.name : undefined;
                scope.$apply();
            });
        }
    };
});

// Directive to handle the tags in the create adda dialog
mubAdda.directive('addaCreateTag', function () {
    return {
        scope: {
            tagsSelected: '='
        },
        restrict: 'E',
        replace: true,
        controller: ['$scope','ubconfig',
            function ($scope, ubconfig) {

                $scope.tagsInConfigFile = ubconfig.get('tags');

                $scope.tags = [];

                $scope.getTagsShowed = function () {
                    var c = 0;
                    $scope.tags = [];
                    angular.forEach($scope.tagsInConfigFile, function(tag){
                        if ( ! ( $scope.tagsSelected.indexOf( tag.trim() ) >= 0 )  && c<4 ) {
                            $scope.tags.push(tag.trim());
                            c++;
                        }
                    });

                } ;

                $scope.selectTag = function (event, data) {
                    event.preventDefault();
                    var tag = $(event.target);
                    if(!tag.parent().hasClass('tag-selected')) {
                        $scope.tagsSelected.push(data.trim());
                        tag.parent().addClass('tag-selected');
                    }
                    $scope.getTagsShowed();

                };

                $scope.deleteTag = function (event, data) {
                    event.preventDefault();
                    var createtags_list =  angular.element('.createadda-tags');
                    angular.forEach(createtags_list.children(), function(item){
                        if(item.firstChild.textContent.trim() == data.trim()){
                            $(item).removeClass('tag-selected');
                        }
                    });

                    var tagSelected = event.target;
                    var index = $scope.tagsSelected.indexOf(data);
                    if(index >=0) {
                        $scope.tagsSelected.splice(index, 1);
                    }
                    $scope.getTagsShowed();

                }
        }],
        link: function (scope, el, attrs) {
            scope.getTagsShowed();
        },
        templateUrl: 'html/addacreate_tags.html'
    };
});

mubAdda.directive('ubAddaPoster', function () {
    return {
        restrict: 'E',
        replace: true,
        require: '?cdMouseDrag',
        scope: true,
        controller: function ($scope, $window, $timeout, $routeParams, $modal, ubconfig) {
            $scope.dw = ubconfig.get('topmenu');

            var cityId = $routeParams.cityId;

            $scope.optionsCoverPhoto = {
                previewWidth: 500,
                previewHeight: 1350
            }

            $scope.optionsLogo = {
                previewWidth: 100,
                previewHeight: 100
            }

            $scope.item_style = function () {
                var style = {
                    'width': 'inherit',
                    'height': 'inherit',
                    'background-repeat': 'no-repeat'
                };
                style['background-image'] = 'url(' + $scope.dw.items[1].items[10].poster + ')';
                return style;
            };
            $scope.showDialogCreateAdda = function () {
                console.log('Creating adda');
                var modalInstance = $modal.open({
                    // Controller of the modal dialog
                    controller: CreateAddaDialogCtrl,
                    templateUrl: 'createAddaDialog.html',
                    windowClass: 'modal-huge'
                });

                modalInstance.result.then (function (newAdda) {
                    $scope.newAdda = newAdda;
                    $scope.newAdda.cityId = cityId;
                    console.log(newAdda);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });


            }
        },
        templateUrl: 'html/addaposter.html'
    };
});

mubAdda.controller('addaCtrl', ['$scope', '$window', '$timeout', '$http', '$routeParams', 'ubapi', 'ubconfig', 'ubSharedService', '$location',
    function addaCtrl($scope, $window, $timeout, $http, $routeParams, ubapi, ubconfig, ubSharedService, $location) {

        ubSharedService.setCurrentCityId($routeParams.cityId);
        addaCategoryListInit($scope, ubapi);
        // inform search that we want adda search (not event search)
        ubSharedService.setIsAddaSearch(($location.path().indexOf('adda') > 0));

        /* save current route for login mechanism*/
        ubSharedService.sethistory($location.path());

        $scope.addas_complete_list;
        $scope.addas_search_list;
        $scope.addas_search_list_suggested;
        $scope.searchStatus;
        // by default 15 items will be showed
        $scope.max_items_showed = 10;
        // category selected
        $scope.current_type = null;

        $scope.init = function () {
            $scope.search();
        };

        // Capture event when a category is selected and save it to the $scope.current_type variable
        $scope.$on('update_type', function (ev, val) {
            if (val != undefined) {
                $scope.current_type = val;
            }
        });

        $scope.$on('update_addas_search_list', function (ev, val) {
            if (val != undefined) {
                $scope.addas_search_list = val;
            }
        });

        // This should be query from the server
        $scope.$on('load_more_addas', function (ev, state) {
            var nextIndex = $scope.addas_search_list.length;
            if ($scope.addas_complete_list[nextIndex] != undefined && nextIndex < $scope.addas_complete_list.length) {
                $scope.addas_search_list.push($scope.addas_complete_list[nextIndex]);
                console.log('Adda added', $scope.addas_complete_list[nextIndex]);
            }
        });

        // When the value of the variable $scope.current_category change its executed
        $scope.$watch('current_type', function (newVal) {
            console.log('Current type', newVal);
            if ($scope.current_type != null) {
                // Apply filter to the search
                $scope.search('', $scope.current_type.cid)
            }
        });

        $scope.$watch('addas_search_list', function (newVal) {
            console.log('Search list changed', newVal);
        });

        $scope.search = function (searchText, typeId, startDate, endDate) {

            var parameters = {};
            if (searchText != undefined && searchText.length > 0) {
                parameters.searchText = searchText
            }
            // TypeId is a integer
            if (typeId != undefined && typeId > 0) {
                parameters.categoryId = typeId;
            }

            if (startDate != startDate && startDate.length > 0) {
                parameters.startDate = startDate
            }

            if (endDate != undefined && endDate.length > 0) {
                parameters.endDate = endDate;
            }

            $http.get('adda.json')
                .then(function (result) {
                    var resultsArray = [];
                    $scope.addas_complete_list = result;
                    // filter for tests in development
                    var cityId = $routeParams.cityId;
                    var count = 0;
                    angular.forEach(result.data, function (value, key) {
                        if (value.cityId == cityId && count < $scope.max_items_showed) {
                            var obj = {};
                            angular.copy(value, obj);
                            resultsArray.push(obj);
                            count = count + 1;
                        }
                    });
                    if (typeId != undefined && typeId > 0) {
                        $scope.addas_search_list = GetAddasByCategoryId(resultsArray, typeId);
                    } else {
                        $scope.addas_search_list = resultsArray;
                    }

                    console.log('Search result', $scope.addas_search_list);
                    if ($scope.addas_search_list != undefined && $scope.addas_search_list.length > 0) {
                        $scope.searchStatus = 'found';
                    } else {
                        // Obtain the suggested event when the results with the search criteria given are not found
                        // Is returned one event but from the webservice could be returned any number of events suggested.
                        $scope.searchStatus = 'notFound';
                        var mostRecent = GetMostRecentEvent(resultsArray);
                        $scope.addas_search_list_suggested = [  ];
                        $scope.addas_search_list_suggested.push(mostRecent);
                    }
                });


        }


    }
]);

mubAdda.directive('ubAddaList', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            listData: '=',
            searchStatus: '=',
            listDataSuggested: '='
        },
        controller: function ($scope, $window, $timeout, ubSharedService) {
            // Grid Layout by default
            $scope.e_view_type = 0;

            if($scope.listDataSuggested==undefined){
                console.log('Adda does not exits');
            }


            $scope.getMostRecentEvent = function (adda) {
                if(adda==undefined){
                    console.log('Adda does not exits');
                }
                var response = {};
                response.eventName = adda.events[0].eventTitle;
                response.eventImageUrl = adda.events[0].eventPhotos[0].imageURL;
                response.eventInfo = adda.events[0].eventInfo.substring(0, 60);
                response.mostRecentDate = parseAddaDateString(adda.events[0].eventDate);
                var currentDate =  parseAddaDateString(adda.events[0].eventDate);
                // get most recent event
                angular.forEach(adda.events, function (value) {
                   // currentDate = Date.parse(value.eventDate);
                    currentDate = parseAddaDateString(value.eventDate);
                    if (response.mostRecentDate < currentDate) {
                        response.eventName = value.eventTitle;
                        response.mostRecentDate = currentDate;
                    }
                });
                return response;
            };

            $scope.getNumOfMembers = function (adda) {
                if (adda.members != undefined) {
                    return adda.members.length;
                } else {
                    return 0;
                }
            }

            $scope.getNumOfNoticeBoards = function (adda) {
                if (adda.noticeBoard != undefined) {
                    return adda.noticeBoard.length;
                } else {
                    return 0;
                }
            }

            $scope.loadMoreAddas = function () {
                var numOfElements = $scope.listData.length;
                console.log('load_more_addas - current elements ', numOfElements);
                $scope.$emit('load_more_addas', 1);
            }

            $scope.container_style = function() {
                if($scope.e_view_type != 0){
                    return 'adda_items_list';
                }
                else{
                    return 'adda_items';
                }

            };

            $scope.container_view_change = function(val) {
                console.log('Container view change',val);
                $scope.e_view_type = val;
            };


        },
        link: function (scope, elements, attr) {
        },
        templateUrl: 'html/addalist.html'
    };
});

