(function(ng, $) {
	if (!ng || !$) {
		// TODO show the user that their browser is junk
		alert('Oh lawd. Bump dat browser game doe.');
	}

	var SLIDER_DELAY = 5000;

	//---- App ----//

	var _app = ng.module('site', ['directives', 'services', 'controllers', 'ngRoute']);

	//---- Config ----//

	(function(app) {
		app.config(['$routeProvider',
			function($rp) {}
		]);
	})(_app);

	//---- Directives ----//

	(function(module, app) {
		// Slider directive
		module.directive('slider', ['$http',
			function($http) {
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
	})(ng.module('directives', []), _app);

	//---- Services ----//

	(function(module, app) {

	})(ng.module('services', []), _app);

	//---- Controllers ----//

	(function(module, app) {
		module.controller('MainCtrl', ['$scope',
			function($scope) {
				var ANIM_DELAY = 400;
				var $overlay = $('overlay');

				var hideCard = function() {
					$overlay.find('.cardholder').css('top', '100%');
					setTimeout(function() {
						$overlay.css('opacity', '0.0');
						$('body').removeClass('noscroll');
						setTimeout(function() {
							$overlay.hide();
						}, ANIM_DELAY);
					}, ANIM_DELAY);
				};
				var showCard = function() {
					$('body').addClass('noscroll');
					$overlay.show(function() {
						$overlay.css('opacity', '1.0');
						setTimeout(function() {
							$overlay.find('.cardholder').css('top', '0px');
							$overlay.click(hideCard);
						}, ANIM_DELAY);
					});
				};

				$scope.showRegistration = function() {
					$('overlay register').css('display', 'block');
					$('overlay login').css('display', 'none');
					showCard();
				};
			}
		]);
	})(ng.module('controllers', []), _app);

	//---- Init ----//

	(function() {
		var init = function() {
			ng.bootstrap(document, ['site']);
		};

		ng.element(document).ready(function() {
			init();
		});
	})();

})(angular, jQuery);