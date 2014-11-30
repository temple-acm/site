(function(app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // Bootstrap the application
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['site']);
    });
})(window._$_app);