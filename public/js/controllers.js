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
				if ($overlay.css('display') !== 'block') {
					$('body').addClass('noscroll');
					$overlay.css('display', 'block');
					$overlay.css('opacity', '1.0');
					setTimeout(function() {
						$cardHolder.css('top', '0px');
					}, ANIM_DELAY);
				}
			};
			// Card specific scope functions
			$scope.showRegistration = function() {
				// Show & hide the right divs
				$('overlay register').css('display', 'block');
				$('overlay login').css('display', 'none');
				$('overlay emailus').css('display', 'none');
				$('overlay forgot-password').css('display', 'none');
				// Resize the card
				$('.cardholder').removeClass('small').addClass('large');
				showCard();
			};
			$scope.showLogin = function() {
				// Show & hide the right divs
				$('overlay register').css('display', 'none');
				$('overlay login').css('display', 'block');
				$('overlay emailus').css('display', 'none');
				$('overlay forgot-password').css('display', 'none');
				// Resize the card
				$('.cardholder').removeClass('large').addClass('small');
				showCard();
			};
			$scope.showEmailUs = function() {
				// Show & hide the right divs
				$('overlay register').css('display', 'none');
				$('overlay login').css('display', 'none');
				$('overlay emailus').css('display', 'block');
				$('overlay forgot-password').css('display', 'none');
				// Resize the card
				$('.cardholder').removeClass('small').addClass('large');
				showCard();
			};
			$scope.showForgotPassword = function() {
				// Show & hide the right divs
				$('overlay register').css('display', 'none');
				$('overlay login').css('display', 'none');
				$('overlay emailus').css('display', 'none');
				$('overlay forgot-password').css('display', 'block');
				// Resize the card
				$('.cardholder').removeClass('small').addClass('large');
				showCard();
			};
		}
	]);
	// Navigation Controller
	module.controller('NavCtrl', ['$scope', '$rootScope', '$location', 'LoginSvc', 'RegisterSvc',
		function($scope, $rootScope, $location, loginService, registerService) {
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
			// For the pay button
			$scope.pay = function() {
				if ($rootScope.loggedInUser && $rootScope.loggedInUser.userName) {
					registerService.redirectToPaypal($rootScope.loggedInUser.userName);
				}
			};

			var $viewport = $('viewport'),
				$navbar = $('.navbar-fixed-top'),
				$nav = $('nav ul li a.page-scroll'),
				$section = $('section'),
				$dropdown = $('.navbar-main-collapse'),
				internalPathRef = '/';

			// Internal record of where our sections are on the page
			var sectionPositionMap = {};
			// Re-calculates the position map
			var recalculateSectionPositions = $rootScope.recalculateSectionPositions = function() {
				var $el, currentTop = $viewport.scrollTop();
				for (var i = 0; i < $section.size(); i++) {
					$el = $($section.get(i));
					sectionPositionMap[$el.attr('id')] = {
						top: currentTop + $el.position().top,
						height: $el.height()
					};
				}
				// Reconsider nav
				adjustNav();
			};
			// Update section map when the window size changes
			$(window).resize(function() {
				// Give the DOM sometime to figure itself out
				setTimeout(recalculateSectionPositions, 200);
			});
			// Update section map when the DOM is ready
			$(recalculateSectionPositions);

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
				var currentTop = $viewport.scrollTop();

				if (currentTop > 50) {
					$navbar.addClass('top-nav-collapse');
				} else {
					$navbar.removeClass('top-nav-collapse');
				}

				for (var sectionId in sectionPositionMap) {
					var top = sectionPositionMap[sectionId].top,
						height = sectionPositionMap[sectionId].height;

					if (currentTop >= (top - 45) && currentTop <= ((top - 45) + height)) {
						$nav.removeClass('active');
						$('nav ul li a[data-section=\'' + sectionId + '\']').addClass('active');
						return;
					}
				}
				// Means we ain't in a section
				$nav.removeClass('active');
			};
			// Animation helpers
			var beforeScrollAnimation = function() {
				$viewport.bind('scroll mousedown DOMMouseScroll mousewheel keyup', function(e) {
					if (e.which > 0 || e.type == 'mousedown' || e.type == 'mousewheel') {
						$viewport.stop(true);
					}
				});
			};
			var afterScrollAnimation = function() {
				$viewport.unbind('scroll mousedown DOMMouseScroll mousewheel keyup');
				// Re-listen for scroll
				$viewport.on('scroll', adjustNav);
			};
			// Listen for url changes
			$scope.$on('$locationChangeSuccess', function() {
				var path = $location.path();
				if (path !== internalPathRef) {
					route($location.path());
				}
			});
			// Listen for scroll
			$viewport.on('scroll', adjustNav);
			// Utility scope exports
			$scope.scrollTo = function(section) {
				if (!section) {
					internalPathRef = '/';
					beforeScrollAnimation();
					$viewport.stop().animate({
						scrollTop: 0
					}, 1500, 'easeInOutExpo', afterScrollAnimation);
				} else {
					var $anchor = $('section#' + section);
					internalPathRef = '/' + section;
					window.location = '#/' + section;
					if ($anchor.get(0)) {
						beforeScrollAnimation();
						$viewport.stop().animate({
							scrollTop: ($anchor.offset().top + $viewport.scrollTop() - 40)
						}, 1500, 'easeInOutExpo', afterScrollAnimation);
					}
					// Hide the dropdown if it isn't already hidden
					if (!$dropdown.hasClass('collapse')) {
						$dropdown.addClass('collapse');
					}
				}
				console.log('scroll to', section);
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
			// Form status flags (trigger the footer alerts)
			$scope.incompleteForm = false;
			$scope.requestFailed = false;

			$scope.submit = function(user) {
				if ($scope.registration.$valid) {
					service.registerUser(user).success(function(data, status, headers, config) {
						if ('200' in data) {
							$rootScope.me = data['200'];
							// Pass the id as a reference
							$rootScope.registered = true;
							$scope.incompleteForm = false;
							$scope.requestFailed = false;
							service.redirectToPaypal(data['200'].userName);
						} else {
							$scope.incompleteForm = false;
							$scope.requestFailed = true;
							// Focus the bottom of the form
							$('overlay').animate({
								scrollTop: $('overlay')[0].scrollHeight
							}, 1500, 'easeInOutExpo');
						}
					});
				} else {
					// TODO scroll to bottom of form
					$scope.incompleteForm = true;
					$scope.requestFailed = false;
					// Focus the bottom of the form
					$('overlay').animate({
						scrollTop: $('overlay')[0].scrollHeight
					}, 1500, 'easeInOutExpo');
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
					// Update the section position map
					setTimeout($scope.recalculateSectionPositions, 200);
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
	// Forgot Password Controller
	module.controller('ForgotPasswordCtrl', ['$scope', '$rootScope', 'LoginSvc',
		function($scope, $rootScope, service) {
			$scope.submitted = false;
			$scope.submissionError = false;
			$scope.incompleteForm = false;

			$scope.submit = function(data) {
				if (!data || (!data.userName && !data.email)) {
					$scope.incompleteForm = true;
					$scope.submissionError = false;
					$scope.submitted = false;
				} else {
					$scope.incompleteForm = false;
					$scope.submissionError = false;
					$scope.submitted = true;
					service.forgotPassword(data.userName, data.email).success(function(result) {
						if ('200' in result) {
							$rootScope.hideCard();
							setTimeout(function() {
								$scope.$apply(function() {
									$scope.submitted = false;
									$scope.submissionError = false;
									$scope.incompleteForm = false;
								});
							}, 1500);
						} else {
							$scope.submissionError = true;
							$scope.submitted = false;
						}
					});
				}
			};
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
					// Update the section position map
					setTimeout($scope.recalculateSectionPositions, 200);
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
	// Reset Password Controller
	module.controller('ResetPasswordCtrl', ['$scope', 'LoginSvc',
		function($scope, service) {
			var TOKEN_REGEX = /\/([a-zA-Z0-9]+)$/;

			$scope.invalidForm = false;
			$scope.resetFailed = false;

			$scope.onPasswordChanged = function() {
				var pass = $('#reset-password-form #password-text').val();
				var conf = $('#reset-password-form #confirm-password-text').val();
				if (PASSWORD_REGEX.test(pass)) {
					if (pass === conf) {
						$('#reset-password-form #password-indicator').addClass('good');
						$('#reset-password-form #password-indicator').html('This password is valid.');
						// Mark the field valid
						if ($scope.registration)
							$scope.registration.password.$setValidity('pass', true);
					} else {
						$('#reset-password-form #password-indicator').removeClass('good');
						$('#reset-password-form #password-indicator').html('The passwords don\'t match.');
						// Mark the field invalid
						if ($scope.registration)
							$scope.registration.password.$setValidity('pass', false);
					}
				} else {
					$('#reset-password-form #password-indicator').removeClass('good');
					$('#reset-password-form #password-indicator').html('Password format invalid.');
					// Mark the field invalid
					if ($scope.registration)
						$scope.registration.password.$setValidity('pass', false);
				}
			};

			$scope.submit = function(user) {
				if ($scope.resetpass.$valid) {
					var token;
					if (window.location.pathname.match(TOKEN_REGEX)) {
						token = window.location.pathname.match(TOKEN_REGEX)[1];
					} else {
						$scope.invalidForm = false;
						$scope.resetFailed = true;
						return;
					}

					service.resetPassword(user.password, token).success(function(data, status, headers, config) {
						if ('200' in data) {
							$scope.invalidForm = false;
							$scope.resetFailed = false;
							window.location.replace('/');
						} else {
							$scope.invalidForm = false;
							$scope.resetFailed = true;
							// Refocus the password field
							$('#reset-password-form #password-text').val('').focus();
						}
					}).error(function() {
						$scope.invalidForm = false;
						$scope.resetFailed = true;
						// Refocus the password field
						$('#reset-password-form #password-text').val('').focus();
					});
				} else {
					$scope.invalidForm = true;
					$scope.resetFailed = false;
				}
			};
		}
	]);
    // Adding on this monstrosity, we now move on to dealing with admin stuff
    module.controller('SlideEditorCtrl', ['$scope', '$rootScope', 'SlideAdminSvc',
        function($scope, $rootScope, slideAdminService) {
            $scope.closeEditor = function() {
                $('overlay slide-editor').css('display', 'none');
                $('overlay').css('opacity', '0.0');
                $('overlay').css('display', 'none');
                $('body').removeClass('noscroll');
            };
            $scope.saveEditorChanges = function() {
                console.log("Saving editor changes");
                var newHtml = slideAdminService.editor.getSession().getValue();
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideAdminService.editingSlide._id) {
                        var updatedSlide = $rootScope.slideData[i]; //TODO: why does this trigger an update the original DOM. Have I misunderstood how javascript treats this assignment?
                        updatedSlide.html = newHtml;
                    }
                }
                $scope.closeEditor();
            };
            $('overlay').click(function(e) {
                if (e.target == this) {
                    $scope.closeEditor();
                }
            });
        }
    ]);

    module.controller('SlideAdminCtrl', ['$scope', '$rootScope', 'SlideAdminSvc',
        function($scope, $rootScope, slideAdminService) {
            $scope.slidesLoaded = false;
            slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                $scope.slidesLoaded = true;
                $rootScope.slideData = $scope.slideData = data;
            }).error(function() {
                console.log("error loading slides");
            });
            $scope.initializeEditor = function(slide) {
                slideAdminService.editor.getSession().setValue(slide.html);
                slideAdminService.editingSlide = slide;
                $('body').addClass('noscroll');
                $('overlay').css('display', 'block');
                $('overlay').css('opacity', '1.0');
                $('overlay slide-editor').css('display', 'block');
            };
            $scope.saveSlide = function(slideId) {
                console.log("now saving slide " + slideId);
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideId) {
                        slideAdminService.updateSlide($rootScope.slideData[i]).success(function(data, status, headers, config) {
                            console.log("slide updated");
                        }).error(function() {
                            console.log("error updating slide");
                        });
                    }
                }
            };
            $scope.removeSlide = function(slideId) {
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideId) {
                        slideAdminService.removeSlide(slideId).success(function(data, status, headers, config) {
                            console.log("slide removed"); // TODO: remove
                        }).error(function() {
                            console.log("error removing slide"); //TODO: remove
                        });
                    }
                }
            };
            $scope.addSlide = function(newSlideData) {
                $scope.slidesLoaded = false;
                slideAdminService.addSlide(newSlideData).success(function(data, status, headers, config) {
                    slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                        $scope.slidesLoaded = true;
                        $rootScope.slideData = $scope.slideData = data;
                    }).error(function() {
                        console.log('error reloading slides');
                    });
                }).error(function() {
                    console.log('error adding new slide');
                });
            }
        }
    ]);
    module.controller('OfficerAdminCtrl', ['$scope', 'OfficersSvc', 'OfficersAdminSvc',
        function($scope, officersSvc, officersAdminSvc) {
            $scope.officersLoaded = false;
            officersSvc.getOfficers().success(function(data, status, headers, config) {
                $scope.officerData = data["200"];
                $scope.officersLoaded = true;
            }).error(function() {
                console.log("error loading officers");
            });
        }
    ]);
    module.controller('MemberAdminCtrl', ['$scope', 'MembersAdminSvc',
        function($scope, membersAdminSvc) {
            $scope.membersLoaded = false;
            membersAdminSvc.getMembers().success(function(data, status, headers, config) {
                $scope.loadedMembers = data;
                $scope.membersLoaded = true;
            }).error(function() {
                console.log("error loading members");
            });
        }
    ]);
})(angular.module('controllers', ['services']), window._$_app);
