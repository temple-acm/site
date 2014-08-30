(function(module, app) {
	// Create app if it does not already exist
	if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
	// Slider directive
	module.directive('slider', ['$http',
		function($http) {
			var SLIDER_DELAY = 5000;

			return {
				restrict: 'E',
				link: function(scope, el, attrs) {
					// Setup initial DOM
					el.append('<conveyor></conveyor>');
					el.append('<arrow class=\'prev\'><i class=\'fa fa-angle-left\'></i></arrow>');
					el.append('<arrow class=\'next\'><i class=\'fa fa-angle-right\'></i></arrow>');
					// Grab le slides
					$http.get('/slides').success(function(data) {
						conveyor = el.find('conveyor');
						// Add le slides
						var conveyorWidth = (100 * data.length) + '%';
						var slideWidth = (100.0 / data.length) + '%';
						conveyor.width(conveyorWidth);
						for (var i = 0; i < data.length; i++) {
							$('<slide style=\'width: ' + slideWidth + '; background-image: url(' + data[i].image + ');\'/>')
								.html(data[i].html)
								.appendTo(conveyor);
						}
						// Show the slider
						el.css('opacity', 1.0);
						// Start sliding
						var intervalId;
						var position = 0;
						var nextSlide = function() {
							if (position + 1 === data.length) {
								position = 0;
							} else {
								position++;
							}
							conveyor.css('marginLeft', (-100 * position) + '%');
						};
						var prevSlide = function() {
							if (position - 1 === -1) {
								position = data.length - 1;
							} else {
								position--;
							}
							conveyor.css('marginLeft', (-100 * position) + '%');
						};
						intervalId = setInterval(nextSlide, SLIDER_DELAY);
						// When the cursor is on the slider - don't slide
						el.mouseenter(function() {
							clearInterval(intervalId);
						});
						// When the cursor is on the slider - don't slide
						el.mouseleave(function() {
							intervalId = setInterval(nextSlide, SLIDER_DELAY);
						});
						// Bind arrow click events
						el.find('arrow.prev').click(function() {
							prevSlide();
						});
						el.find('arrow.next').click(function() {
							nextSlide();
						});
					});
				}
			};
		}
	]);
	// Text change directive
	module.directive('ngTextChange', [

		function() {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					var delay = attrs.ngTextChangeDelay || 100;

					var typingTimer;
					var fireEvent = function() {
						scope.$eval(attrs.ngTextChange);
					};

					element.keyup(function() {
						clearTimeout(typingTimer);
						typingTimer = setTimeout(fireEvent, delay);
					});
					element.keydown(function() {
						clearTimeout(typingTimer);
					});
					element.blur(function() {
						clearTimeout(typingTimer);
						fireEvent();
					});
				}
			};
		}
	]);
	// Background image loading directive
	module.directive('ngBgImg', function() {
		return function(scope, element, attrs) {
			attrs.$observe('ngBgImg', function(value) {
				element.css({
					'background-image': 'url(' + value + ')',
					'background-size': 'cover'
				});
			});
		};
	});
})(angular.module('directives', []), window._$_app);