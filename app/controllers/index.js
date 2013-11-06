/****************************************** DESCRIPTION *******************************************/

// This script loads the routes from every controller defined in the controllers directory.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require("fs"); // Node.js internal filesystem module
var path = require("path"); // Node.js internal pathing utility module
var _ = require("underscore"); // The it-does-everything library

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Module Constants
var HTTP_METHOD_GET = "get";
var HTTP_METHOD_POST = "post";
var HTTP_METHOD_PUT = "put";
var HTTP_METHOD_DELETE = "del";
var HTTP_METHOD_PATCH = "patch";

var normalizeHTTPMethod = function(method) {
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

var walk = function(_path, app) {
    fs.readdirSync(_path).forEach(function(file) {
        var newPath = path.join(_path, file);
        // Get information on the file
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            // If its javascript or coffeescript, load it up
            if (/(.*)\.(js|coffee)/.test(file) && (file !== "index.js")) {
                logger.info("\tLoading controller '%s'.", newPath);
                // Load the routes
                var controller = require(newPath);
                if (controller.routes && _.isArray(controller.routes)) {
                    var route;
                    for (var i = 0; i < controller.routes.length; i++) {
                        route = controller.routes[i];
                        try {
                            if (!_.isString(route.path)) throw new Error("Route path '" + route.path + "' was not a valid string");

                            var method = normalizeHTTPMethod(route.method);
                            // TODO permissions
                            // TODO requires auth
                            if (_.isFunction(route.handler)) {
                                (app[method])(route.path, route.handler);
                                logger.info("\t\tRoute '%s %s' registered successfully.", route.method, route.path);
                            } else if (_.isArray(route.handlers)) {
                                var handlerRegistered = false;
                                var handler;
                                for (var j = 0; j < route.handlers.length; j++) {
                                    handler = route.handlers[j];
                                    if (_.isFunction(handler)) {
                                        (app[method])(route.path, handler);
                                        handlerRegistered = true;
                                    } else {
                                        logger.warn("\t\tRoute '%s %s' provided a handler that was not a function in its handlers list.", route.method, route.path);
                                    }
                                }
                                if (handlerRegistered) logger.info("\t\tRoute '%s %s' registered successfully.", route.method, route.path);
                                else logger.error("\t\tRoute '%s %s' NOT registered successfully.", route.method, route.path);
                            } else {
                                throw new Error("No valid handlers were provided.");
                            }
                        } catch (err) {
                            logger.error("\t\tCould not register route '%s %s' in controller '%s': %s.", route.method, route.path, newPath, (err.message ? err.message : "Error had no description."));
                        }
                    }
                } else {
                    logger.warn("\t\tNo routes were registered.");
                }
                // Load the parameter adpaters
                if (controller.params && _.isObject(controller.params)) {
                    for (var param in controller.params) {
                        try {
                            if (_.isFunction(controller.params[param])) {
                                app.param(param, controller.params[param]);
                                logger.info("\t\tParameter adapter for parameter '%s' registered successfully.", param);
                            } else {
                                throw new Error("Parameter adapter for parameter '" + param + "' was not a function.");
                            }
                        } catch (err) {
                            logger.error("\t\tCould not register parameter adapter '%s' in controller '%s': %s.", param, newPath, (err.message ? err.message : "Error had no description."));
                        }
                    }
                }
                // Finish up
                logger.info("\tController '%s' loaded successfully.", newPath);
            }
        } else if (stat.isDirectory()) {
            // Otherwise recurse the directory
            walk(newPath, app);
        }
    });
};

var route = function(app, passport, auth) {
    // All we do is walk
    walk(__dirname, app);
};

/******************************************* EXPORTS **********************************************/

// Export the routing method
module.exports.route = route;