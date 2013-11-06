/****************************************** DESCRIPTION *******************************************/

// This script loads the routes from every controller defined in the controllers directory.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require("fs"); // Node.js internal filesystem module
var path = require("path"); // Node.js internal pathing utility module

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Module Constants
const HTTP_METHOD_GET = "get";
const HTTP_METHOD_POST = "post";
const HTTP_METHOD_PUT = "put";
const HTTP_METHOD_DELETE = "del";
const HTTP_METHOD_PATCH = "patch";

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
}

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
                if (controller.routes) {
                    for (var route in controller.routes) {
                        try {
                            var method = normalizeHTTPMethod((controller.routes[route]).method);
                            // TODO permissions
                            // TODO requires auth
                            if ((controller.routes[route]).handler) {
                                (app[method])(route, (controller.routes[route]).handler);
                                logger.info("\t\tRoute '%s %s' registered successfully.", (controller.routes[route]).method, route);
                            } else if ((controller.routes[route]).handlers) {
                                for (var i = 0; i < (controller.routes[route]).handlers.length; i++) {
                                    (app[method])(route, (controller.routes[route]).handlers[i]);
                                    logger.info("\t\tRoute '%s %s' registered successfully.", (controller.routes[route]).method, route);
                                }
                            }
                        } catch (err) {
                            logger.error("\t\tCould not register route '%s %s' in controller '%s': %s.", (controller.routes[route]).method, route, newPath, (err.message ? err.message : "Error had no description."));
                        }
                    }
                }
                // Load the parameter adpaters
                if (controller.params) {
                    for (var param in controller.params) {
                        try {
                            if ((controller.params[param])) {
                                app.param(param, controller.params[param]);
                                logger.info("\t\tParameter adapter '%s' registered successfully.", route);
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
}

/******************************************* EXPORTS **********************************************/

// Export the routing method
module.exports.route = route;