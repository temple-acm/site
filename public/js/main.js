(function(ng, $) {
	if (!ng || !$) {
		// TODO show the user that their browser is junk
		console.log('Oh lawd.');
	}

	//---- App ----//

	var _app = ng.module('site', ['directives', 'services', 'controllers', 'ngRoute']);

	//---- Config ----//

	(function(app) {
		app.config(['$routeProvider',
			function($routeProvider) {
				// TODO
			}
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
						$http.get('/slides').success(function(data) {
							var sliderWidth = (100 * data.length) + '%';
							var slideWidth = (100.0 / data.length) + '%';
							el.width(sliderWidth);
							for (var i = 0; i < data.length; i++) {
								$('<slide style=\'width: ' + slideWidth + '; background-image: url(' + data[i].image + ');\'/>')
									.html(data[i].html)
									.appendTo(el);
							}
							el.css('opacity', 1.0);
							// Start sliding
							var position = 0;
							setInterval(function() {
								if (position + 1 === data.length) {
									position = 0;
								} else {
									position++;
								}
								el.css('marginLeft', (-100 * position) + '%');
							}, 5000);
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