(function(module, app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // The login service
    module.service('LoginSvc', ['$http',
        function($http) {
            this.logOut = function() {
                return $http({
                    method: 'GET',
                    url: '/members/logout'
                });
            };

            this.isLoggedIn = function() {
                return $http({
                    method: 'GET',
                    url: '/members/isLoggedIn'
                });
            };
        }
    ]);
    // Admin services
    module.service('SlideAdminSvc', ['$http',
        function($http) {
            this.getAllSlides = function() {
                return $http({
                    method: 'GET',
                    url: '/admin/allSlides'
                });
            };
            this.addSlide = function(slideData) {
                return $http({
                    method: 'POST',
                    url: '/admin/addSlide',
                    data: slideData
                });
            };
            this.getSingleSlide = function(slideData) {
                return $http({
                    method: 'GET',
                    url: '/admin/getSlide',
                    data: slideData
                });
            };
            this.updateSlide = function(updatedSlide) {
                return $http({
                    method: 'POST',
                    url: '/admin/updateSlide',
                    data: updatedSlide
                });
            };
            this.removeSlide = function(slideId) {
                return $http({
                    method: 'POST',
                    url: '/admin/removeSlide',
                    data: slideId
                });
            };

            this.editor = ace.edit('editor');
            this.editor.getSession().setMode('ace/mode/html');
            this.editingSlide = null;
            this.creator = ace.edit('new-slide-html');
            this.creator.getSession().setMode('ace/mode/html');
        }
    ]);

    module.service('OfficersAdminSvc', ['$http',
        function($http) {
            this.addOfficer = function(newOfficerData) {
                return $http({
                    method: 'POST',
                    url: '/admin/addOfficer',
                    data: newOfficerData
                });
            };
            this.removeOfficer = function(officerData) {
                return $http({
                    method: 'POST',
                    url: '/admin/removeOfficer',
                    data: officerData
                });
            };
        }
    ]);

    module.service('MembersAdminSvc', ['$http',
        function($http) {
            this.getMembers = function() {
                return $http({
                    method: 'GET',
                    url: '/admin/getMembers',
                });
            };
            this.getMember = function(member) {
                return $http({
                    method: 'POST',
                    url: '/admin/getMember',
                    data: member
                });
            }
            this.editingMember = null;
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
})(angular.module('services', []), window._$_app);