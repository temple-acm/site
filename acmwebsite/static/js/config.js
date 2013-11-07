//Setting up route
window.app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/articles', {
            templateUrl: 'static/views/articles/list.html'
        }).
        when('/articles/create', {
            templateUrl: 'static/views/articles/create.html'
        }).
        when('/articles/:articleId/edit', {
            templateUrl: 'static/views/articles/edit.html'
        }).
        when('/articles/:articleId', {
            templateUrl: 'static/views/articles/view.html'
        }).
        when('/', {
            templateUrl: 'static/views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
window.app.config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);