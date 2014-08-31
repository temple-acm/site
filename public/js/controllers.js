(function(module, app) {
	// Create app if it does not already exist
	if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
	// Some constants / variables
	var EMAIL_REGEX = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
	var PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$/;
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
			var hideCard = $rootScope.hideCard = function(callback) {
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
							if (callback) callback();
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
				if ("200" in data) {
					$rootScope.isLoggedIn = true;
					$rootScope.loggedInUser = data["200"];
					$('#session-panel').css('display', 'block');
				} else {
					$rootScope.isLoggedIn = false;
				}
			});

			// Logout function
			$scope.logout = function() {
				loginService.logOut().success(function(data, status, headers, config) {
					$('#session-panel').css('display', 'none');
					$rootScope.isLoggedIn = false;
					// Hide the dropdown if it isn't already hidden
					if (!$dropdown.hasClass('collapse')) {
						$dropdown.addClass('collapse');
					}
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
					// Hide the dropdown if it isn't already hidden
					if (!$dropdown.hasClass('collapse')) {
						$dropdown.addClass('collapse');
					}
				} else if (url === '/login') {
					$scope.showLogin();
					// Hide the dropdown if it isn't already hidden
					if (!$dropdown.hasClass('collapse')) {
						$dropdown.addClass('collapse');
					}
				} else if (url === '/emailus') {
					$scope.showEmailUs();
					// Hide the dropdown if it isn't already hidden
					if (!$dropdown.hasClass('collapse')) {
						$dropdown.addClass('collapse');
					}
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
							scrollTop: ($anchor.offset().top + $viewport.scrollTop() - 40)
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
						if ('200' in data) {
							$rootScope.me = data['200'];
							// Pass the id as a reference
							$rootScope.registered = true;
							service.redirectToPaypal(data["200"].userName);
						} else {
							toastr.error("Could not submit registration form.");
						}
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
							if ($scope.registration)
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

			$scope.onEmailChanged = function() {
				var val = $('#register-form #email-text').val();
				if (EMAIL_REGEX.test(val)) {
					service.isEmailFree($('#register-form #email-text').val()).success(function(isFree) {
						if (isFree !== 'false') {
							$('#register-form #email-indicator').addClass('good');
							$('#register-form #email-indicator').html('This email is not in use.');
							// Mark the field valid
							if ($scope.registration)
								$scope.registration.email.$setValidity('email', true);
						} else {
							$('#register-form #email-indicator').removeClass('good');
							$('#register-form #email-indicator').html('This email is in use.');
							// Mark the field invalid
							if ($scope.registration)
								$scope.registration.email.$setValidity('email', false);
						}
					}).error(function() {
						$('#register-form #email-indicator').removeClass('good');
						$('#register-form #email-indicator').html('There was a problem connecting to the server.');
						// Mark the field invalid
						if ($scope.registration)
							$scope.registration.email.$setValidity('email', false);
					});
				} else {
					$('#register-form #email-indicator').removeClass('good');
					$('#register-form #email-indicator').html('Email format invalid.');
					// Mark the field invalid
					if ($scope.registration)
						$scope.registration.email.$setValidity('email', false);
				}
			};

			$scope.onMembershipChanged = function() {
				var val = $('#register-form #membership-num').val();
				if (val) {
					service.isMembershipFree($('#register-form #membership-num').val()).success(function(isFree) {
						if (isFree !== 'false') {
							$('#register-form #membership-num-indicator').addClass('good');
							$('#register-form #membership-num-indicator').html('This membership number is not in use.');
							// Mark the field valid
							if ($scope.registration)
								$scope.registration.membership.$setValidity('membership', true);
						} else {
							$('#register-form #membership-num-indicator').removeClass('good');
							$('#register-form #membership-num-indicator').html('This membership number is in use.');
							// Mark the field invalid
							if ($scope.registration)
								$scope.registration.membership.$setValidity('membership', false);
						}
					}).error(function() {
						$('#register-form #membership-num-indicator').removeClass('good');
						$('#register-form #membership-num-indicator').html('There was a problem connecting to the server.');
						// Mark the field invalid
						if ($scope.registration)
							$scope.registration.membership.$setValidity('membership', false);
					});
				} else {
					$('#register-form #membership-num-indicator').removeClass('good');
					$('#register-form #membership-num-indicator').html('Membership number is required.');
					// Mark the field invalid
					if ($scope.registration)
						$scope.registration.membership.$setValidity('membership', false);
				}
			};

			$scope.onPasswordChanged = function() {
				var pass = $('#register-form #password-text').val();
				var conf = $('#register-form #confirm-password-text').val();
				if (PASSWORD_REGEX.test(pass)) {
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
				if ("200" in events) {
					events = events["200"]; // trying this
					// HTML escape the description field
					for (var i = 0; i < events.length; i++) {
						events[i].description = $sce.trustAsHtml(events[i].description);
					}
					// Now its safe to show the events
					$scope.events = events;
					$scope.eventsLoaded = true;
				} else {
					console.log("Could not load events.");
				}
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
				if ("200" in officers) {
					officers = officers["200"]; // trying this
					// HTML escape the description field
					for (var i = 0; i < officers.length; i++) {
						officers[i].bio = $sce.trustAsHtml(officers[i].bio);
						officers[i].title = officers[i].title || 'Officer';
					}
					// Now we can show the officers
					$scope.officers = officers;
					if ($scope.officers.length % 4 === 0) {
						$scope.adWidth = 'col-md-12  col-sm-12 col-xs-12';
					} else {
						var mod = 4 - ($scope.officers.length % 4);
						$scope.adWidth = 'col-md-' + (mod * 3);
						if ($scope.officers.length % 2 === 0) {
							$scope.adWidth += ' col-sm-12';
						} else {
							$scope.adWidth += ' col-sm-6';
						}
						$scope.adWidth += ' col-xs-12';
					}
					$scope.officersLoaded = true;
				} else {
					console.log("Could not load officers.");
				}
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
			$scope.incompleteForm = false;
			$scope.invalidCredentials = false;
			// Code that handles the "Login" form goes here
			$scope.submit = function(user) {
				if ($scope.login.$valid) {
					service.logInUser(user).success(function(data, status, headers, config) {
						if ("200" in data) {
							$rootScope.isLoggedIn = true;
							$rootScope.loggedInUser = data["200"];
							$rootScope.hideCard();

							$scope.incompleteForm = false;
							$scope.invalidCredentials = false;

							$('#session-panel').css('display', 'block');
						} else {
							$scope.incompleteForm = false;
							$scope.invalidCredentials = true;
							// Refocus the password field
							$('#login-form #password-text').val('').focus();
						}
					});
				} else {
					$scope.incompleteForm = true;
					$scope.invalidCredentials = false;
				}
			};
		}
	]);
})(angular.module('controllers', ['services']), window._$_app);