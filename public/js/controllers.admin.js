(function(module, app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // The main controller
    module.controller('MainCtrl', ['$scope', function($scope) {
        // Navigation related scope functions
        $scope.titleOfPage          = function(page) {
            switch (page) {
                case '/profile':
                    return 'Profile';
                case '/slides':
                    return 'Slides';
                case '/officers':
                    return 'Officers';
                case '/exports':
                    return 'Exports';
                case '/members':
                    return 'Members';
                default:
                    return '404';
            }
        };
        $scope.navToPage            = function(page) {
            window.location.hash = page;
        };
        $scope.returnToHomePage     = function() {
            window.location.href = '/';
        };

        // React to hash url changing
        var onHashUrlChangedSilenced = false;
        var onHashUrlChanged = function() {
            // To escape infinite event loops
            if (onHashUrlChangedSilenced) {
                onHashUrlChangedSilenced = false;
                return;
            } else if ($scope.currentPage !== window.location.hash.substr(1)) {
                $scope.$apply(function() {
                    // Read the hash url to figure out where we should be
                    if (window.location.hash.length === 0) {
                        $scope.currentPage = '/profile';
                        // Set the page title
                        $scope.currentPageTitle = $scope.titleOfPage($scope.currentPage);
                        // Profile is the default page
                        setTimeout(function() {
                            // Escape the digest loop before doing this again by setting this flag
                            onHashUrlChangedSilenced = true;
                            window.location.hash = '/profile';
                        }, 200);
                    } else {
                        // Avoid the actual hash character
                        $scope.currentPage = window.location.hash.substr(1);
                        // Set the page title
                        $scope.currentPageTitle = $scope.titleOfPage($scope.currentPage);
                    }
                });
            }
        };

        // Listen for hash url changes
        $(window).on('hashchange', onHashUrlChanged);
        // Trigger the hash url change function to get started with
        setTimeout(onHashUrlChanged, 0);
    }]);
    // The slide admin controller
    module.controller('SlideAdminCtrl', ['$scope', '$rootScope', 'SlideAdminSvc',
        function($scope, $rootScope, slideAdminService) {
            $scope.slidesLoaded = false;
            slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                $scope.slidesLoaded = true;
                $rootScope.slideData = $scope.slideData = data;
            }).error(function() {
                toastr.error("Error loading slides.");
            });
            $scope.initializeEditor = function(slide) {
                slideAdminService.editor.getSession().setValue(slide.html);
                slideAdminService.editingSlide = slide;
                $('body').addClass('noscroll');
                $('#slide-editor-overlay').css('display', 'block');
                $('#slide-editor-overlay').css('opacity', '1.0');
                //$('#slide-editor-overlay').css('display', 'block');
            };
            $scope.saveSlide = function(slideId) {
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideId) {
                        slideAdminService.updateSlide($rootScope.slideData[i]).success(function(data, status, headers, config) {
                            toastr.success("Slide updated!");
                        }).error(function() {
                            toastr.error("Error updating slide.");
                        });
                    }
                }
            };
            $scope.removeSlide = function(slideId) {
                $scope.slidesLoaded = false;
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideId) {
                        var idJson = { "id" : slideId };
                        slideAdminService.removeSlide(idJson).success(function(data, status, headers, config) {
                            slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                                $rootScope.slideData = $scope.slideData = data;
                                $scope.slidesLoaded = true;
                                toastr.success("Slide removed!");
                            }).error(function() {
                                toastr.error("Error reloading slides.");
                            });
                        }).error(function() {
                            toastr.error("Error removing slide.");
                        });
                    }
                }
            };
            $scope.addSlide = function() {
                $scope.slidesLoaded = false;
                var newSlideData = {
                    image: 'https://i.imgur.com/jwJoau0.jpg',
                    html: "<h1>We're the Temple ACM, and we <3 technology.</h1>"
                };
                slideAdminService.addSlide(newSlideData).success(function(data, status, headers, config) {
                    slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                        $scope.slidesLoaded = true;
                        $rootScope.slideData = $scope.slideData = data;
                        toastr.success("New slide created!");
                    }).error(function() {
                        toastr.error("Error reloading slides.");
                    });
                }).error(function() {
                    toastr.error("Error adding new slide.");
                });
            }
        }
    ]);
    // Adding on this monstrosity, we now move on to dealing with admin stuff
    module.controller('SlideEditorCtrl', ['$scope', '$rootScope', 'SlideAdminSvc',
        function($scope, $rootScope, slideAdminService) {
            $scope.closeEditor = function() {
                $('#slide-editor-overlay').css('display', 'none');
                $('#slide-editor-overlay').css('opacity', '0.0');
                $('body').removeClass('noscroll');
            };
            $scope.saveEditorChanges = function() {
                console.log("Saving editor changes");
                var newHtml = slideAdminService.editor.getSession().getValue();
                for (var i = 0; i < $rootScope.slideData.length; i++) {
                    if ($rootScope.slideData[i]._id == slideAdminService.editingSlide._id) {
                        var updatedSlide = $rootScope.slideData[i];
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
})(angular.module('controllers', ['services']), window._$_app);