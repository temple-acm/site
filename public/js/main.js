(function(ng, $) {
	if (!ng || !$) {
		// TODO show the user that their browser is junk
		toastr.error('Oh lawd. Bump dat browser game doe.');
		return;
	}

	var SLIDER_DELAY = 5000;

	//---- App ----//

	var _app = ng.module('site', ['directives', 'services', 'controllers']);

	//---- Config ----//

	(function(app) {
		// TODO config stuff here
	})(_app);

	//---- Directives ----//


	// To anybody who reads this section:
	// I apologize for the outdated memes my
	// colleague is using. I promise you, he
	// has a greater mental maturity than his
	// comments imply.
	//
	// -- Not Sandile Keswa

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
	})(ng.module('directives', []), _app);

	//---- Services ----//

	(function(module, app) {
		// Service that handles registration
		module.service('RegisterSvc', ['$http',
			function($http) {
				// This template is used to redirect to the payment form @ paypal
				var PAYPAL_API_CALL_TEMPLATE = '<form action="https://www.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd"' +
					' value="_s-xclick"><input type="hidden" name="hosted_button_id" value="6CYDNKB4YDGVC"><input type="hidden" name="notify_url" ' +
					' value="http://acm.temple.edu/members/payments/callback/{{id}}"></form>';
				// Does the same thing as PAYPAL_API_CALL_TEMPLATE - except it does it with fake money
				var FAKE_PAYPAL_API_CALL_TEMPLATE = '<form action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post"><input type="hidden" name="cmd"' +
					' value="_s-xclick"><input type="hidden" name="hosted_button_id" value="9M38CDYV8EHEJ"><input type="hidden" name="notify_url" ' +
					' value="http://acm.temple.edu/members/payments/callback/{{id}}"></form>';
				var PAYPAL_API_CALL_ID_TOKEN = '{{id}}';

				this.isUserNameFree = function(userName) {
					return $http({
						method: 'GET',
						url: '/members/userName/isFree',
						params: {
							userName: userName
						}
					});
				};
				this.registerUser = function(user) {
					return $http({
						method: 'POST',
						url: '/members/register',
						data: user
					});
				};
				this.redirectToPaypal = function(userId) {
					// TODO make this not the fake url on live
					var form;
					if (window.location.host === 'localhost' || window.location.host === '127.0.0.1') {
						// We're doing testing
						form = $(FAKE_PAYPAL_API_CALL_TEMPLATE.replace(PAYPAL_API_CALL_ID_TOKEN, userId));
					} else {
						form = $(PAYPAL_API_CALL_TEMPLATE.replace(PAYPAL_API_CALL_ID_TOKEN, userId));
					}
					// Add to the DOM first - FF bug
					$('body').append(form);
					form.submit();
				};
			}
		]);
		// Service that handles events
		module.service('EventSvc', ['$http',
			function($http) {
				this.getEvents = function() {
					return $http({
						method: 'GET',
						url: '/events/calendar'
					});
				};
			}
		]);
		module.service('LoginSvc', ['$http',
			function($http) {
				this.logInUser = function(user) {
					return $http({
						method: 'POST',
						url: '/members/login',
						data: user
					});
				};
				this.isLoggedIn = function() {
					return $http({
						method: 'GET',
						url: '/members/isLoggedIn'
					});
				};
                this.logOut = function() {
                    return $http({
                        method: 'GET',
                        url: '/members/logout'
                    });
                };
			}
		]);
		module.service('OfficersSvc', ['$http',
			function($http) {
				this.getOfficers = function() {
					return $http({
						method: 'GET',
						url: '/members/officers'
					});
				};
			}
		]);
	})(ng.module('services', []), _app);

	//---- Controllers ----//

	(function(module, app) {
		// Main Controller
		module.controller('MainCtrl', ['$scope', '$location', '$rootScope',
			function($scope, $location, $rootScope) {
				var ANIM_DELAY = 400;
				var $overlay = $('overlay'),
					$cardHolder = $overlay.find('.cardholder');

				// Card dismiss event handlers
				$overlay.click(function(e) {
					if (e.target == this) {
						hideCard();
					}
				});
				$cardHolder.click(function(e) {
					if (e.target == this) {
						hideCard();
					}
				});

				// Card specific helper functions
				var hideCard = $rootScope.hideCard = function() {
					$overlay.animate({
						scrollTop: '0px'
					}, ANIM_DELAY, function() {
						// Move back to main path
						window.location = '#/';
						$location.path('/').replace();
						// Continue animating
						$cardHolder.css('top', '100%');
						setTimeout(function() {
							$overlay.css('opacity', '0.0');
							$('body').removeClass('noscroll');
							setTimeout(function() {
								$overlay.css('display', 'none');
							}, ANIM_DELAY);
						}, ANIM_DELAY);
					});
				};
				var showCard = function() {
					$('body').addClass('noscroll');
					$overlay.css('display', 'block');
					$overlay.css('opacity', '1.0');
					setTimeout(function() {
						$cardHolder.css('top', '0px');
					}, ANIM_DELAY);
				};
				// Card specific scope functions
				$scope.showRegistration = function() {
					// Show & hide the right divs
					$('overlay register').css('display', 'block');
					$('overlay login').css('display', 'none');
					$('overlay emailus').css('display', 'none');
					// Resize the card
					$('.cardholder').removeClass('small').addClass('large');
					showCard();
				};
				$scope.showLogin = function() {
					// Show & hide the right divs
					$('overlay register').css('display', 'none');
					$('overlay login').css('display', 'block');
					$('overlay emailus').css('display', 'none');
					// Resize the card
					$('.cardholder').removeClass('large').addClass('small');
					showCard();
				};
				$scope.showEmailUs = function() {
					// Show & hide the right divs
					$('overlay register').css('display', 'none');
					$('overlay login').css('display', 'none');
					$('overlay emailus').css('display', 'block');
					// Resize the card
					$('.cardholder').removeClass('small').addClass('large');
					showCard();
				};
			}
		]);
		// Navigation Controller
		module.controller('NavCtrl', ['$scope', '$rootScope', '$location', 'LoginSvc',
			function($scope, $rootScope, $location, loginService) {
				// I don't know what I'm doing, but this regulates the logged-in status of users
				$scope.logInChecked = false;
				$rootScope.isLoggedIn = false;
				loginService.isLoggedIn().success(function(data, status, headers, config) {
					$scope.logInChecked = true;
					if (status !== 250) {
						$rootScope.isLoggedIn = true;
						$rootScope.loggedInUser = data;
                        $('#session-panel').css('display', 'block');
					}
				}).error(function(data, status, headers, config) {
					$scope.logInChecked = true;
                    console.log(data);
				}); // I don't know if this is necessary.

                // Logout function
                $scope.logout = function() {
                    loginService.logOut().success(function(data, status, headers, config) {
                        $('#session-panel').css('display', 'none');
                        $rootScope.isLoggedIn = false;
                    }).error(function(data, status, headers, config) {
                        toastr.error("Could not log out. Check that you have a connection to the Internet.");
                    });
                };
				var $viewport = $('viewport'),
					$navbar = $('.navbar-fixed-top'),
					$nav = $('nav ul li a.page-scroll'),
					$section = $('section'),
					$dropdown = $('.navbar-main-collapse');
				// Nav UI Events
				$nav.click(function() {
					var section = $(this).data('section');
					$scope.scrollTo(section);
				});
				// UI routing
				var route = function(url) {
					if (!url) {
						return;
					} else if (url === '/') {
						$scope.scrollTo();
					} else if (url === '/register') {
						$scope.showRegistration();
					} else if (url === '/login') {
						$scope.showLogin();
					} else if (url === '/emailus') {
						$scope.showEmailUs();
					} else {
						setTimeout(function() {
							$scope.scrollTo(url.substring(1));
						}, 1500);
					}
				};
				var adjustNav = function() {
					if ($viewport.scrollTop() > 50) {
						$navbar.addClass('top-nav-collapse');
					} else {
						$navbar.removeClass('top-nav-collapse');
					}

					var $el;
					for (var i = 0; i < $section.size(); i++) {
						$el = $($section.get(i));
						if ($el.position().top <= 50 && (($el.position().top + ($el.height()))) >= -45) {
							$nav.removeClass('active');
							$('nav ul li a[data-section=\'' + $el.attr('id') + '\']').addClass('active');
							return;
						}
					}
					$nav.removeClass('active');
				};
				// Listen for url changes
				$scope.$on('$locationChangeSuccess', function() {
					route($location.path());
				});
				// Listen for scroll
				$viewport.on('scroll', adjustNav);
				// Utility scope exports
				$scope.scrollTo = function(section) {
					if (!section) {
						$viewport.stop().animate({
							scrollTop: 0
						}, 1500, 'easeInOutExpo');
					} else {
						var $anchor = $('section#' + section);
						window.location = '#/' + section;
						$location.path('/' + section).replace();
						if ($anchor.get(0)) {
							$viewport.stop().animate({
								scrollTop: ($anchor.offset().top + $viewport.scrollTop() - 50)
							}, 1500, 'easeInOutExpo');
						}
						// Hide the dropdown if it isn't already hidden
						if (!$dropdown.hasClass('collapse')) {
							$dropdown.addClass('collapse');
						}
					}
				};
				// Export scroll to for non-angular access
				window.$scrollTo = $scope.scrollTo;
				// Shows and hides the nav menu
				$scope.toggleMobileNavMenu = function() {
					if ($dropdown.hasClass('collapse')) {
						$dropdown.removeClass('collapse');
					} else {
						$dropdown.addClass('collapse');
					}
				};
			}
		]);
		// Registration Controller
		module.controller('RegisterCtrl', ['$scope', '$rootScope', 'RegisterSvc',
			function($scope, $rootScope, service) {
				$rootScope.registered = false;

				$scope.submit = function(user) {
					if ($scope.registration.$valid) {
						service.registerUser(user).success(function(data, status, headers, config) {
							$rootScope.me = data;
							// Pass the id as a reference
							$rootScope.registered = true;
							service.redirectToPaypal(data.userName);
						}).error(function(data, status, headers, config) {
							toastr.error('Could not submit registration form.');
						});
					} else {
						toastr.warning('The form is not yet complete. Please ensure the form is valid.');
					}
				};

				$scope.onUserIdChanged = function() {
					var val = $('#register-form #user-id-text').val();
					if (val && val.length >= 5 && val.length <= 15 && /^[a-z0-9\.]+$/i.test(val)) {
						service.isUserNameFree($('#register-form #user-id-text').val()).success(function(isFree) {
							if (isFree !== 'false') {
								$('#register-form #user-id-indicator').addClass('good');
								$('#register-form #user-id-indicator').html('This user id is available.');
								// Mark the field valid

								$scope.registration.userId.$setValidity('id', true);
							} else {
								$('#register-form #user-id-indicator').removeClass('good');
								$('#register-form #user-id-indicator').html('This user id is taken.');
								// Mark the field invalid
								if ($scope.registration)
									$scope.registration.userId.$setValidity('id', false);
							}
						}).error(function() {
							$('#register-form #user-id-indicator').removeClass('good');
							$('#register-form #user-id-indicator').html('There was a problem connecting to the server.');
							// Mark the field invalid
							if ($scope.registration)
								$scope.registration.userId.$setValidity('id', false);
						});
					} else {
						$('#register-form #user-id-indicator').removeClass('good');
						$('#register-form #user-id-indicator').html('User id format invalid.');
						// Mark the field invalid
						if ($scope.registration)
							$scope.registration.userId.$setValidity('id', false);
					}
				};

				$scope.onPasswordChanged = function() {
					var pass = $('#register-form #password-text').val();
					var conf = $('#register-form #confirm-password-text').val();
					if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$/gm.test(pass)) {
						if (pass === conf) {
							$('#register-form #password-indicator').addClass('good');
							$('#register-form #password-indicator').html('This password is valid.');
							// Mark the field valid
							if ($scope.registration)
								$scope.registration.password.$setValidity('pass', true);
						} else {
							$('#register-form #password-indicator').removeClass('good');
							$('#register-form #password-indicator').html('The passwords don\'t match.');
							// Mark the field invalid
							if ($scope.registration)
								$scope.registration.password.$setValidity('pass', false);
						}
					} else {
						$('#register-form #password-indicator').removeClass('good');
						$('#register-form #password-indicator').html('Password format invalid.');
						// Mark the field invalid
						if ($scope.registration)
							$scope.registration.password.$setValidity('pass', false);
					}
				};
			}
		]);
		// Events Controller
		module.controller('EventsCtrl', ['$scope', '$rootScope', '$sce', 'EventSvc',
			function($scope, $rootScope, $sce, service) {
				$scope.eventsLoaded = false;
				// Code that handles the "Upcoming Events" section of the main page goes here
				service.getEvents().success(function(events) {
					// HTML escape the description field
					for (var i = 0; i < events.length; i++) {
						events[i].description = $sce.trustAsHtml(events[i].description);
					}
					// Now its safe to show the events
					$scope.events = events;
					$scope.eventsLoaded = true;
				}).error(function(err) {
					console.log('Could not load events:', err);
				});
			}
		]);
		// Email Controller
		module.controller('EmailCtrl', ['$scope',
			function() {
				// TODO: Code that handles the "Email Us" form goes here
			}
		]);
		// Officers Controller
		module.controller('OfficersCtrl', ['$scope', '$sce', 'OfficersSvc',
			function($scope, $sce, service) {
				$scope.officersLoaded = false;
				// Code that handles the "Officers" section of the main page goes here
				service.getOfficers().success(function(officers) {
					// HTML escape the description field
					for (var i = 0; i < officers.length; i++) {
						officers[i].bio = $sce.trustAsHtml(officers[i].bio);
						officers[i].title = officers[i].title || 'Officer';
					}
					// Now we can show the officers
					$scope.officers = officers;
					if ($scope.officers.length % 4 === 0) {
						$scope.adWidth = 'col-sm-12 col-xs-12';
					} else {
						var mod = 4 - ($scope.officers.length % 4);
						$scope.adWidth = 'col-sm-' + (mod * 3);
						if ($scope.officers.length % 2 === 0) {
							$scope.adWidth += ' col-xs-12';
						} else {
							$scope.adWidth += ' col-xs-6';
						}
					}
					$scope.officersLoaded = true;
				}).error(function(err) {
					console.log('Could not load officers:', err);
				});
			}
		]);
		// Google Map Controller
		module.controller('MapCtrl', ['$scope',
			function() {
				// Google Maps Scripts
				// When the window has finished loading create our google map below
				google.maps.event.addDomListener(window, 'load', function() {
					// Basic options for a simple Google Map
					// For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
					var mapOptions = {
						// How zoomed in you want the map to start at (always required)
						zoom: 16,
						// The latitude and longitude to center the map (always required)
						center: new google.maps.LatLng(39.981489, -75.153174), // New York
						// Disables the default Google Maps UI components
						disableDefaultUI: false,
						scrollwheel: false,
						draggable: true
					};
					// Get the HTML DOM element that will contain your map
					// We are using a div with id="map" seen below in the <body>
					var mapElement = document.getElementById('map');
					// Create the Google Map using out element and options defined above
					var map = new google.maps.Map(mapElement, mapOptions);
					// Custom Map Marker Icon - Customize the map-marker.png file to customize your icon
					var myLatLng = new google.maps.LatLng(39.981489, -75.153174);
					var beachMarker = new google.maps.Marker({
						position: myLatLng,
						map: map
					});
				});
			}
		]);
		// Login Controller
		module.controller('LoginCtrl', ['$scope', '$rootScope', 'LoginSvc',
			function($scope, $rootScope, service) {
				// Code that handles the "Login" form goes here
				$scope.submit = function(user) {
					if ($scope.login.$valid) {
						service.logInUser(user).success(function(data, status, headers, config) {
                            $rootScope.isLoggedIn = true;
                            $rootScope.loggedInUser = data;
                            $rootScope.hideCard();
                            $('#session-panel').css('display', 'block');
                        }).error(function(data, status, headers, config) {
							toastr.error("Could not log in. Make sure you've typed your username and password properly.", 'Error');
						});
					} else {
						toastr.warning('Could not submit login form, are you sure you typed everything in?', 'Warning');
					}
				};
			}
		]);
	})(ng.module('controllers', ['services']), _app);

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
