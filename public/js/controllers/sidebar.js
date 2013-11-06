angular.module("mean.system").controller("SidebarController", ["$scope", "Global",
    function($scope, Global) {
        $scope.global = Global;

        $scope.menu = [{
            "title": "Home",
            "link": "/"
        }, {
            "title": "Contact Us",
            "link": "contact"
        }, {
            "title": "About Us",
            "link": "about"
        }];

        $scope.isCollapsed = true;
    }
]);