angular.module("mean.system").controller("PageController", function($scope, $location) {
	// Pages where the side bar should be hidden
	var sidebarBlacklist = [
		"register"
	];
	// Method to check if the sidebar should be visible
	$scope.sidebarClass = function() {
		var currentRoute = $location.path().substring(1) || "home";
		return (sidebarBlacklist.indexOf(currentRoute) === -1) ? "" : "no-sidebar";
	};
});