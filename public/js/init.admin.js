(function(app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // Bootstrap the application
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['site']);
    });
    // Setup toastr
    toastr.options = {
      'debug': false,
      'positionClass': 'toast-bottom-right',
      'onclick': null,
      'fadeIn': 300,
      'fadeOut': 300,
      'timeOut': 2000,
      'extendedTimeOut': 1000
    };
})(window._$_app);