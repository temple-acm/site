angular.module("mean.system").controller("HeaderController", ["$scope", "$location", "Global", function ($scope, $location, Global) {
    $scope.global = Global;

    $scope.doRegister = function() {
        $location.path("/register");
    };

    $scope.doSignIn = function() {
        alert("signin");
    };

    $scope.menu = [{
        "title": "Articles",
        "link": "articles"
    }, {
        "title": "Create New Article",
        "link": "articles/create"
    }];
    
    $scope.isCollapsed = false;
}]);