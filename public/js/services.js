(function(module, app) {
	// Create app if it does not already exist
	if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
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
			this.isEmailFree = function(email) {
				return $http({
					method: 'GET',
					url: '/members/email/isFree',
					params: {
						email: email
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
})(angular.module('services', []), window._$_app);