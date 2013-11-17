angular.module("mean.system").controller("SliderController", function($scope, $http) {
    // A utility method for basic boiler plate slides
    var generateSlideId = function() {
        var letters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        var id = "slide-";
        for (var i = 0; i < 16; i++) {
            id += letters[Math.round(Math.random() * 1000000) % letters.length];
        }
        return id;
    };
    // A utility method for basic boiler plate slides
    var generateRandomColor = function() {
        var letters = "0123456789ABCDEF".split('');
        var color = "";
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    };
    // Define the slides array
    var slides = $scope.slides = [];
    // Get the slides from the database
    $http({
        method: "GET",
        url: "/slides"
    }).success(function(data, status, headers, config) {
        console.log("Slide fetch successful.");
        // Okay, now we can justify the width of the indicators panel
        $(document).ready(function() {
            $("div#home-expose ol.carousel-indicators").css("marginLeft", (((data.length * 18) + 12) / -2) + "px");
        });
        // Now to add the slides to slider ;D
        data.forEach(function(slide) {
            // Making modifications to the slides for 
            // view purposes
            slide.slideId = generateSlideId();
            slide.bgColor = slide.bgColor || "transparent";
            slides.push(slide);
            // Image loading logic
            $(document).ready(function() {
                if (slide.bgImageUrl) {
                    // Invisbly load the image
                    var image = new Image();
                    image.onload = function() {
                        // Hide the loader first
                        $("div#home-expose #" + slide.slideId + " img.slide-loader").fadeOut(200, function() {
                            this.remove();
                        });
                        // Set and fade in the loaded image
                        var el = $("div#home-expose #" + slide.slideId + " img.slide-bg");
                        el.get(0).src = image.src;
                        el.fadeIn(1200);
                        // Show the text too
                        $("div#home-expose #" + slide.slideId + " div.carousel-caption").fadeTo(400, 1.0, function() {
                            $("div#home-expose #" + slide.slideId + " div.carousel-caption").removeClass("subdued");
                        });
                    };
                    image.src = slide.bgImageUrl;
                }
            });
        });

    }).error(function(data, status, headers, config) {
        console.log("Could not get slides: " + arguments);
    });
    // Other config
    $scope.myInterval = 5000;
});