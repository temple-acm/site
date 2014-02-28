angular.module("mean.system").directive("ngTextChange", function (RegisterService) {
	return {
		restrict: "A",
		link: function (scope, element, attrs) {
			var delay = attrs.ngTextChangeDelay || 100;

			var typingTimer;
			var fireEvent = function () {
				scope.$eval(attrs.ngTextChange);
			};

			element.keyup(function () {
				clearTimeout(typingTimer);
				typingTimer = setTimeout(fireEvent, delay);
			});
			element.keydown(function () {
				clearTimeout(typingTimer);
			});
			element.blur(function () {
				clearTimeout(typingTimer);
				fireEvent();
			});
		}
	};
});