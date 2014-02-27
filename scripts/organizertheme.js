var ubOrganizerTheme = angular.module("ubOrganizerTheme", []);
ubOrganizerTheme.factory("organizerService", [ '$http', '$q', function ($http, $q) {
    var organizerSrv = {};

    organizerSrv.getOrganizerThemData = function () {
        var promise = $http.get('organizertheme.json').then(function (result) {
            return result;
        });

        return promise;
    }

    return organizerSrv;

}]);

ubOrganizerTheme.controller("organizerThemeCtrl", ['$scope','$location', 'organizerService', 'ubSharedService'
    , function($scope, $location, organizerService,ubSharedService){

        ubSharedService.sethistory('/');

        $scope.clientsCarouselInterval = 5000;

        // Getting data of the organizer.
        organizerService.getOrganizerThemData().then(function(d){
            $scope.organizer = d.data[0];
            var dateCreated = parseAddaDateString($scope.organizer.registeredOn);
            $scope.operationalSince = dateCreated.toDateString();
            console.log(d);
        });

        // Scroll to the section selected
        $scope.getMenuClass = function (page) {
            if (page == $scope.active) {
                return "active";
            } else {
                return "";
            }
        }

        // Scroll to the section selected
        $scope.show = function (page) {

            $scope.active = page;

            if (page == 'org_whatwedo') {
                $location.hash('org_whatwedo');
                $anchorScroll();
            }

            if (page == 'org_activites') {
                $location.hash('org_activites');
                $anchorScroll();
            }

            if (page == 'org_clients') {
                $location.hash('org_clients');
                $anchorScroll();
            }

            if (page == 'org_getintouch') {
                $location.hash('org_getintouch');
                $anchorScroll();
            }

        }

        $scope.signUpForAlerts = function() {

        }





}]);