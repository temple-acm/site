angular.module("mean.system").controller("SidebarController", ["$scope", "Global",
    function($scope, Global) {
        $scope.global = Global;
        
        var windowRef = $(window);
        var sidebarInner = $(".sidebar-inner");
        var SIDEBAR_PADDING_TOP = "paddingTop";
        var ZERO_PX = "0px";
        var PX = "px";
        windowRef.scroll(function() {
            var scrollY = windowRef.scrollTop();
            if (scrollY >= 50) sidebarInner.css(SIDEBAR_PADDING_TOP, ZERO_PX);
            else sidebarInner.css(SIDEBAR_PADDING_TOP, (50 - scrollY) + PX);
        });
    }
]);