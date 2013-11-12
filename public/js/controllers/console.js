angular.module('mean.system').controller('ConsoleController', ['$scope', 'Global',
    function($scope, Global) {
        $scope.global = Global;
        // Get dat host son
        var http = location.protocol;
        var slashes = http.concat("//");
        var host = slashes.concat(window.location.hostname);
        // Build peer object
        var peer = new Peer({
            host: host,
            port: 3333,
            debug: 1
        });
        // Make the the WebRTC function registrations
        var onConnection = function (connection) {
            connection.on("data", function(data) {

            });
        };
    }
]);