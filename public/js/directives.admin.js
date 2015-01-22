(function(module, app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // The side navigation directive
    module.directive('sidenav', function() {
        return {
            restrict: 'E',
            templateUrl: '/static/dist/admin-sidenav.partial.html',
            controller: function ($scope, $rootScope, LoginSvc) {
                $scope.logOut = function() {
                    LoginSvc.logOut().success(function(data, status, headers, config) {
                        window.location.href = '/';
                    }).error(function(data, status, headers, config) {
                        toastr.error('Could not log out. Check that you have a connection to the Internet.');
                    });
                };
                $rootScope.session = {};
                $scope.sessionInfoLoaded = false;
                // Load the session data
                LoginSvc.isLoggedIn().success(function(data, status, headers, config) {
                    if (data[200]) {
                        $rootScope.session = data[200];
                        $scope.sessionInfoLoaded = true;
                    } else {
                        toastr.error('Could not get session information from the server. Check that you have a connection to the Internet.');
                    }
                }).error(function(data, status, headers, config) {
                    toastr.error('Could not get session information from the server. Check that you have a connection to the Internet.');
                });
            }
        };
    });
    // Background image loading directive
    module.directive('ngBgImg', function() {
        return function(scope, element, attrs) {
            attrs.$observe('ngBgImg', function(value) {
                var args = {};
                if (value && value !== '') {
                    args['background-image'] = 'url(' + value + ')';
                    args['background-size'] = 'cover';
                } else if (attrs['default'] && attrs['default'] !== '') {
                    args['background-image'] = 'url(' + attrs['default'] + ')';
                    args['background-size'] = 'cover';
                } else {
                    args['background-color'] = '#bcbcbc';
                }

                element.css(args);
            });
        };
    });
})(angular.module('directives', []), window._$_app);