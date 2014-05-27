//Setting up route
window.app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/register', {
            templateUrl: '/static/views/register.html'
        }).
        when('/', {
            templateUrl: '/static/views/home.html'
        }).
        when('/schedule', {
            templateUrl: '/static/views/schedule.html',
            controller: 'CalendarCtrl'
        }).
        when('/termsofservice', {
            templateUrl: '/static/views/ppts.html',
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix("!");
    }
]);