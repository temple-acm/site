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
		module.controller('RegisterSvc', ['$http',
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
						url: '/members/isUserNameFree',
						params: {
							username: userName
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
					if (window.location.host === 'localhost' || window.location.host === '127.0.0.1') {
						// We're doing testing
						$(FAKE_PAYPAL_API_CALL_TEMPLATE.replace(PAYPAL_API_CALL_ID_TOKEN, userId)).submit();
					} else {
						$(PAYPAL_API_CALL_TEMPLATE.replace(PAYPAL_API_CALL_ID_TOKEN, userId)).submit();
					}
				};
			}
		]);
	})(ng.module('services', []), _app);

	//---- Controllers ----//

	(function(module, app) {
		// Main Controller
		module.controller('MainCtrl', ['$scope',
			function($scope) {
				var ANIM_DELAY = 400;
				var $overlay = $('overlay'),
					$cardHolder = $overlay.find('.cardholder');

				// Delegate UI Events
				$overlay.click(function(e) {
					if (e.target == this) {
						hideCard();
					}
				});

				// Card specific helper functions
				var hideCard = function() {
					$overlay.animate({
						scrollTop: '0px'
					}, ANIM_DELAY, function() {
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

				// Scope exports
				$scope.showRegistration = function() {
					$('overlay register').css('display', 'block');
					$('overlay login').css('display', 'none');
					showCard();
				};
				$scope.showLogin = function() {
					$('overlay register').css('display', 'none');
					$('overlay login').css('display', 'block');
					showCard();
				};
			}
		]);
		// Registration Controller
		module.controller('RegisterCtrl', ['$scope', '$rootScope', '$upload', 'RegisterSvc',
			function($scope, $rootScope, $upload, registerService) {
				// Constants
				var SUBMIT_URL = "members/register";
				var RESUME_DROP_URL = "members/resumes/drop";
				var DRAG_DROP_NEUTRAL = "Drag & Drop Your Resume Here";
				var DRAG_DROP_STYLE_NEUTRAL = "";
				var DRAG_DROP_WRONG_TYPE = "Provided file was the wrong type";
				var DRAG_DROP_WRONG_SIZE = "Provided file was too big";
				var DRAG_DROP_STYLE_WRONG = "wrong";
				var DRAG_DROP_RIGHT = "Resume file \"%s\" is ready to upload";
				var DRAG_DROP_STYLE_RIGHT = "dropped";

				// Instance variables
				$scope.pendingFile = null;
				$scope.dragDropMessage = DRAG_DROP_NEUTRAL;
				$scope.dragDropStyle = DRAG_DROP_STYLE_NEUTRAL;

				$scope.submit = function(user) {
					if ($scope.registration.$valid) {
						if ($scope.pendingFile) {
							$scope.upload = $upload.upload({
								url: RESUME_DROP_URL,
								method: 'POST',
								file: $scope.pendingFile
							}).success(function() {
								doRegistration(user);
							}).error(function() {
								alert('File upload failed.');
								console.log('File upload failed', arguments);
							});
						} else {
							registerService.registerUser(user).success(function(data, status, headers, config) {
								$rootScope.me = data;
								// Pass the id as a reference
								console.log('result', data);
								$scope.declareRegistered();
								registerService.redirectToPaypal(data._id);
							}).error(function(data, status, headers, config) {
								$('#register-modal').modal("show");
								console.log('problem', data);
							});
						}
					} else {
						// TODO modal or something
						// $('#register-modal').modal("show");
						alert('Could not submit registration form.');
					}
				};

				$scope.selectFile = function($files, user) {
					//$files: an array of files selected, each file has name, size, and type.
					var file = $files[0]; // Assume just one file
					var extension = file.name.split(".").pop().toLowerCase();
					// Check extension
					if (extension !== "doc" && extension !== "docx" && extension !== "pdf") {
						$scope.dragDropStyle = DRAG_DROP_STYLE_WRONG;
						$scope.dragDropMessage = DRAG_DROP_WRONG_TYPE;
					} else if (file.size > 1048576) {
						$scope.dragDropStyle = DRAG_DROP_STYLE_WRONG;
						$scope.dragDropMessage = DRAG_DROP_WRONG_SIZE;
					} else {
						// Set the file instance variable
						$scope.pendingFile = file;
						// Cosmetics
						$scope.dragDropStyle = DRAG_DROP_STYLE_RIGHT;
						$scope.dragDropMessage = DRAG_DROP_RIGHT.replace("%s", file.name);
					}
				};

				$scope.onUserIdChanged = function() {
					var val = $("#userIdText").val();
					if (val && val.length >= 5 && val.length <= 15 && /^[a-z0-9\.]+$/i.test(val)) {
						RegisterService.isUserNameFree($("#userIdText").val(), function(err, isFree) {
							if (isFree) {
								$("#userIdIndicator").addClass("good");
								$("#userIdIndicator").html("This user id is available.");
								// Mark the field valid
								$scope.registrationForm.userId.$setValidity("id", true);
							} else {
								$("#userIdIndicator").removeClass("good");
								$("#userIdIndicator").html("This user id is taken.");
								// Mark the field invalid
								$scope.registrationForm.userId.$setValidity("id", false);
							}
						});
					} else {
						$("#userIdIndicator").removeClass("good");
						$("#userIdIndicator").html("User id format invalid.");
						// Mark the field invalid
						$scope.registrationForm.userId.$setValidity("id", false);
					}
				};

				$scope.onPasswordChanged = function() {
					var pass = $("#passwordText").val();
					var conf = $("#confirmPasswordText").val();
					if (/^(?=.*[^a-zA-Z])(?=.*[a-z])(?=.*[A-Z])\S{8,}$/.test(pass)) {
						RegisterService.isUserNameFree($("#userIdText").val(), function(err, isFree) {
							if (pass === conf) {
								$("#passwordIndicator").addClass("good");
								$("#passwordIndicator").html("This password is valid.");
								// Mark the field valid
								$scope.registrationForm.password.$setValidity("pass", true);
							} else {
								$("#passwordIndicator").removeClass("good");
								$("#passwordIndicator").html("The passwords don't match.");
								// Mark the field invalid
								$scope.registrationForm.password.$setValidity("pass", false);
							}
						});
					} else {
						$("#passwordIndicator").removeClass("good");
						$("#passwordIndicator").html("Password format invalid.");
						// Mark the field invalid
						$scope.registrationForm.password.$setValidity("pass", false);
					}
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
