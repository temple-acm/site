angular.module("mean.system").controller("SidebarController", function ($scope, $location, $window) {
	$scope.navClass = function (page) {
		var currentRoute = $location.path().substring(1) || "home";
		return page === currentRoute ? "current" : "";
	};

	$scope.gotoGitlab = function() {
		$window.location.href = '/gitlab';
	};
});