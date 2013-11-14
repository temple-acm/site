angular.module("mean.system").controller("SliderController", function($scope, $http) {
    // A utility method for basic boiler plate slides
    var generateRandomColor = function() {
        var letters = "0123456789ABCDEF".split('');
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    };
    // Define the slides array (TODO: this should be fetched via HTTP)
    var slides = $scope.slides = [];
    // Get the slides from the database
    $http({
        method: "GET",
        url: "/slides"
    }).success(function(data, status, headers, config) {
        console.log("Slide fetch successful.");
        data.forEach(function(slide) {
            slides.push(slide);
        });
    }).error(function(data, status, headers, config) {
        console.log("Could not get slides: " + arguments);
    });
    // Other config
    $scope.myInterval = 5000;
});