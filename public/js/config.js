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