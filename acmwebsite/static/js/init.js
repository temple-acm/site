// Preloading immediately visible images
(function() {
    // The header logo
    new Image().src = "static/img/acm-logo.png";
})();

window.bootstrap = function() {
    angular.bootstrap(document, ['mean']);
};

window.init = function() {
    window.bootstrap();
};

angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash == "#_=_") window.location.hash = "";

    //Then init the app
    window.init();
});