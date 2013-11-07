angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.doRegister = function() {
        alert("reg");
    };

    $scope.doSignIn = function() {
        alert("sign");
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