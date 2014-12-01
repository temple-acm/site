(function(module, app) {
    // Create app if it does not already exist
    if (!app) app = window._$_app = angular.module('site', ['directives', 'services', 'controllers']);
    // The main controller
    module.controller('MainCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
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

        // Header buttons and stuff
        $scope.emitPlusClicked      = function() {
            $rootScope.$broadcast('header-button-plus-clicked');
        };
        $scope.emitRefreshClicked   = function() {
            $rootScope.$broadcast('header-button-refresh-clicked');
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

    /**
           _____ ___     __
          / ___// (_)___/ /__  _____
          \__ \/ / / __  / _ \/ ___/
         ___/ / / / /_/ /  __(__  )
        /____/_/_/\__,_/\___/____/

    **/

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

            // Listen for app-wide events
            $scope.$on('header-button-refresh-clicked', function(event) {
                if ($scope.currentPage === '/slides') {
                    $scope.slidesLoaded = false;
                    slideAdminService.getAllSlides().success(function(data, status, headers, config) {
                        $scope.slidesLoaded = true;
                        $rootScope.slideData = $scope.slideData = data;
                    }).error(function() {
                        toastr.error('Error loading slides.');
                    });
                }
            });
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
            $('#slide-editor-overlay').click(function(e) {
                if (e.target == this) {
                    $scope.closeEditor();
                }
            });
        }
    ]);
    // Handles new slides
    module.controller('SlideCreatorCtrl', ['$scope', '$rootScope', 'SlideAdminSvc',
        function($scope, $rootScope, slideAdminService) {
            var editor = slideAdminService.creator = ace.edit('new-slide-html');

            $scope.closeEditor = function() {
                $('#slide-creator-overlay').css('display', 'none');
                $('#slide-creator-overlay').css('opacity', '0.0');
                $('body').removeClass('noscroll');
            };

            $scope.creationPending = false;

            $scope.finishCreatingSlide = function() {
                var newHtml = editor.getSession().getValue();
                $scope.creationPending = true;
                slideAdminService.addSlide({
                    image: $scope.imageUrl,
                    html: newHtml
                }).success(function(data, status, headers, config) {
                    $scope.creationPending = false;
                    $scope.emitRefreshClicked();
                    $scope.closeEditor();
                }).error(function() {
                    $scope.creationPending = false;
                    toastr.error('Error adding new slide.');
                });
            };

            $scope.openEditor = function() {
                $scope.imageUrl = '';
                editor.getSession().setValue('');
                $('body').addClass('noscroll');
                $('#slide-creator-overlay').css('display', 'block');
                $('#slide-creator-overlay').css('opacity', '1.0');
            };

            // Listen for app-wide events
            $scope.$on('header-button-plus-clicked', function(event) {
                if ($scope.currentPage === '/slides') {
                    $scope.openEditor();
                }
            });

            $('#slide-creator-overlay').click(function(e) {
                if (e.target == this) {
                    $scope.closeEditor();
                }
            });
        }
    ]);

    /**
           ____  _________
          / __ \/ __/ __(_)_______  __________
         / / / / /_/ /_/ / ___/ _ \/ ___/ ___/
        / /_/ / __/ __/ / /__/  __/ /  (__  )
        \____/_/ /_/ /_/\___/\___/_/  /____/

    **/

    // The officer admin controller
    module.controller('OfficerAdminCtrl', ['$scope', '$rootScope', 'OfficersAdminSvc',
        function($scope, $rootScope, officerAdminService) {
            $scope.officersLoaded = false;
            officerAdminService.getAllOfficers().success(function(data, status, headers, config) {
                if (data[200]) {
                    $rootScope.officerData = $scope.officerData = data[200];
                    $scope.officersLoaded = true;
                } else {
                    toastr.error('There was a problem loading the officers.');
                }
            }).error(function() {
                toastr.error("Error loading officers.");
            });

            $scope.saveOfficer = function(officerId) {
                for (var i = 0; i < $rootScope.officerData.length; i++) {
                    if ($rootScope.officerData[i]._id == officerId) {
                        officerAdminService.updateOfficer($rootScope.officerData[i]).success(function(data, status, headers, config) {
                            toastr.success("Officer updated!");
                        }).error(function() {
                            toastr.error("Error updating officer.");
                        });
                    }
                }
            };
            $scope.removeOfficer = function(officer) {
                officerAdminService.removeOfficer({
                    id: officer._id,
                    _id: officer._id
                }).success(function(data, status, headers, config) {
                    $scope.emitRefreshClicked();
                    toastr.success('Officer removed!');
                }).error(function() {
                    toastr.error('Error removing officer.');
                });
            };

            // Listen for app-wide events
            $scope.$on('header-button-refresh-clicked', function(event) {
                if ($scope.currentPage === '/officers') {
                    $scope.officersLoaded = false;
                    officerAdminService.getAllOfficers().success(function(data, status, headers, config) {
                        if (data[200]) {
                            $rootScope.officerData = $scope.officerData = data[200];
                            $scope.officersLoaded = true;
                        } else {
                            toastr.error('There was a problem loading the officers.');
                        }
                    }).error(function() {
                        toastr.error("Error loading officers.");
                    });
                }
            });
        }
    ]);
    // Office adding ui
    module.controller('OfficerAdderCtrl', ['$scope', '$rootScope', 'OfficersAdminSvc', 'MembersAdminSvc',
        function($scope, $rootScope, officersAdminSvc, membersAdminSvc) {
            $scope.addOfficer = function(officerData) {
                $scope.officersChanged = true;
                officersAdminSvc.addOfficer({
                    _id: officerData._id,
                    title: 'Officer',
                    bio: officerData.bio
                }).success(function(data, status, headers, config) {
                    if (data['200']) {
                        $scope.emitRefreshClicked();
                        officerData.officer = true;
                        toastr.success('Member promoted to officer!');
                    } else {
                        toastr.error('Error promoting officer.');
                    }
                }).error(function() {
                    toastr.error('Error promoting officer.');
                });
            };

            $scope.memberFilterFn = function(member) {
                if (member.officer && member.officer == true) {
                    return false;
                }
                return true;
            };

            $scope.loadingMembers = true;
            membersAdminSvc.getMembers().success(function(data, status, headers, config) {
                if (data['200']) {
                    $scope.membersData = data['200'];
                    $scope.loadingMembers = false;
                } else {
                    toastr.error('Error loading member list.');
                }
            }).error(function() {
                toastr.error('Error loading member list.');
            });

            $scope.openOfficerAdder = function() {
                $('body').addClass('noscroll');
                $('#officer-adder-overlay').css('display', 'block');
                $('#officer-adder-overlay').css('opacity', '1.0');
            };

            $scope.closeOfficerAdder = function() {
                $('#officer-adder-overlay').css('opacity', '0.0');
                $('#officer-adder-overlay').css('display', 'none');
                $('body').removeClass('noscroll');
            };

            $('#officer-adder-overlay').click(function(e) {
                if (e.target == this) {
                    if ($scope.officersChanged == true) {
                        $rootScope.officersChanged = true;
                        $rootScope.$digest();
                    }
                    $scope.closeOfficerAdder();
                }
            });

            // Listen for app-wide events
            $scope.$on('header-button-plus-clicked', function(event) {
                if ($scope.currentPage === '/officers') {
                    $scope.openOfficerAdder();
                }
            });
        }
    ]);

    /**
            __  ___               __
           /  |/  /__  ____ ___  / /_  ___  __________
          / /|_/ / _ \/ __ `__ \/ __ \/ _ \/ ___/ ___/
         / /  / /  __/ / / / / / /_/ /  __/ /  (__  )
        /_/  /_/\___/_/ /_/ /_/_.___/\___/_/  /____/

    **/

    // Controls the member list
    module.controller('MembersCtrl', ['$scope', '$rootScope', 'MembersAdminSvc',
        function($scope, $rootScope, membersAdminSvc) {
            var refresh = function() {
                $scope.membersLoaded = false;
                membersAdminSvc.getMembers().success(function(data, status, headers, config) {
                    if (data['200']) {
                        $scope.membersData = data['200'];
                        $scope.membersLoaded = true;
                    } else {
                        toastr.error('Error loading member list.');
                    }
                }).error(function() {
                    toastr.error('Error loading member list.');
                });
            };

            // Listen for app-wide events
            $scope.$on('header-button-refresh-clicked', function(event) {
                if ($scope.currentPage === '/members') {
                    refresh();
                }
            });
            // Do initial refresh
            refresh();
        }
    ]);
    //
    module.controller('ProfileCtrl', ['$scope', '$rootScope', 'LoginSvc',
        function($scope, $rootScope, loginSvc) {
            $scope.profileLoaded = false;
            $scope.user = {};

            loginSvc.isLoggedIn().success(function(data, status, headers, config) {
                if (data['200']) {
                    $scope.user = data['200'];
                    $scope.profileLoaded = true;
                } else {
                    toastr.error('Error loading user.');
                }
            }).error(function() {
                toastr.error('Error loading user.');
            });

            $scope.save = function() {
                toastr.success('Profile changes saved.');
            };
        }
    ]);
})(angular.module('controllers', ['services']), window._$_app);