angular.module("mean.system").controller("SliderController", function($scope) {
    $scope.myInterval = 5000;
    var slides = $scope.slides = [];
    $scope.addSlide = function() {
        var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
        slides.push({
            image: 'http://placehold.it/' + ($("section.content section").width() || 500) + 'x350/ADD8E6/FFFFFF',
            text: ['More', 'Extra', 'Lots of', 'Surplus'][slides.length % 4] + ' ' + ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
        });
    };
    for (var i = 0; i < 4; i++) {
        $scope.addSlide();
    }
});