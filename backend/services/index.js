/****************************************** DESCRIPTION *******************************************/

// This script loads the routes from every controller defined in the controllers directory.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require("fs"); // Node.js internal filesystem module
var path = require("path"); // Node.js internal pathing utility module
var _ = require("underscore"); // The it-does-everything library
var async = require("async");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Module Constants
var HTTP_METHOD_GET = "get";
var HTTP_METHOD_POST = "post";
var HTTP_METHOD_PUT = "put";
var HTTP_METHOD_DELETE = "del";
var HTTP_METHOD_PATCH = "patch";

var normalizeHTTPMethod = function (method) {
    var lowercaseMethod = method.toLowerCase();
    if (lowercaseMethod.indexOf(HTTP_METHOD_PATCH) !== -1) {
        return HTTP_METHOD_PATCH;
    } else if (lowercaseMethod.indexOf(HTTP_METHOD_POST) !== -1) {
        return HTTP_METHOD_POST;
    } else if (lowercaseMethod.indexOf(HTTP_METHOD_PUT) !== -1) {
        return HTTP_METHOD_PUT;
    } else if (lowercaseMethod.indexOf(HTTP_METHOD_DELETE) !== -1) {
        return HTTP_METHOD_DELETE;
    } else if (lowercaseMethod.indexOf(HTTP_METHOD_GET) !== -1) {
        return HTTP_METHOD_GET;
    } else {
        throw new Error("Invalid method '" + method + "' specified when registering route.");
    }
};

var walk = function (_path, app) {
    // Records the route priorities
    var priorityQueue = [];
    // Regisers a route with express
    var register = function (route) {
        // TODO permissions
        // TODO requires auth
        (app[normalizeHTTPMethod(route.method)])(route.path, route.handler);
        logger.info("\t\tRoute '%s %s' registered successfully.", route.method, route.path);
    };
    // Get the files in the services folder
    var files = fs.readdirSync(_path);
    // Iterate through each file
    var file, newPath, stat;
    for (var i = 0; i < files.length; i++) {
        // Update the control variables
        file = files[i];
        newPath = path.join(_path, file);
        stat = fs.statSync(newPath);
        // Process the file
        if (stat.isFile() && /(.*)\.(js|coffee)/.test(file) && (file !== "index.js")) {
            logger.info("\tLoading service '%s'.", newPath);
            // Load the routes
            var controller = require(newPath);
            if (controller.routes && _.isArray(controller.routes)) {
                var route;
                for (var j = 0; j < controller.routes.length; j++) {
                    route = controller.routes[j];
                    if (_.isFunction(route.handler)) {
                        if (!route.priority) {
                            // Default all priorities to 0
                            route.priority = 0;
                        }
                        // Initialize the queue if it doesn't exist
                        if (!priorityQueue[route.priority]) priorityQueue[route.priority] = [];
                        // Push the route to the queue
                        priorityQueue[route.priority].push(route);
                    }
                }
            }
        }
    }
    console.log("");
    logger.info("\tNow registering routes:");
    // Register the routes
    var routeList;
    for (i = 0; i < priorityQueue.length; i++) {
        routeList = priorityQueue[i];
        if (routeList) {
            routeList.forEach(register);
        }
    }
    logger.info("\tRoute registration complete.");
};

var route = function (app) {
    // All we do is walk
    walk(__dirname, app);
};

/******************************************* EXPORTS **********************************************/

// Export the routing method
module.exports.route = route;