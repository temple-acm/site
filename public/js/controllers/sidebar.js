angular.module("mean.system").controller("SidebarController", function ($scope, $location, $window) {
	$scope.navClass = function (page) {
		var currentRoute = $location.path().substring(1) || "home";
		return page === currentRoute ? "current" : "";
	};

	$scope.goHome = function(){
		$location.path('/');
	};

	$scope.gotoGitlab = function() {
		$window.location.href = '/gitlab';
	};

	$scope.goToSchedule = function(){
		$location.path('/schedule');
	};
});