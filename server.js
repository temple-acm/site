/****************************************** DESCRIPTION *******************************************/

// This is the primary entry point for the Node.js server. All functionality must be introduced in 
// some capacity within this file.

/*************************************** EXTERNAL IMPORTS *****************************************/

var express = require("express"); // The web server implementation we're using
var fs = require("fs"); // Node.js internal filesystem module
var path = require("path"); // Node.js internal pathing utility module
var passport = require("passport"); // A popular authentication library

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("./util/log"); // Our custom logging utility
var passportConfig = require("./config/passport"); // Our passport configuration
var expressConfig = require("./config/express"); // Our express configuration 
var routes = require("./app/routes.js");

/******************************************** MODULE **********************************************/

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV = process.env.NODE_ENV || "development", // Defaults to dev. env.
    config = require("./config/config"), // Our server-wide configuration module
    auth = require("./config/middlewares/authorization"), // Our authentication middleware
    mongoose = require("mongoose"); // Our Mongo DB ORM

// Bootstrap the db connection, as defined in config
var db = mongoose.connect(config.db);

// Bootstrap the db models
var modelsPath = path.join(__dirname, "/app/models");
// Walk iterates through every file in the models folder and requires it
// WARNING: explosive runtime, try not to have too deep a directory structure
var walk = function(_path) {
    fs.readdirSync(_path).forEach(function(file) {
        var newPath = path.join(_path, file);
        // Get information on the file
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            // If its javascript or coffeescript, load it up
            if (/(.*)\.(js|coffee)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            // Otherwise recurse the directory
            walk(newPath);
        }
    });
};
// Walk the models path
walk(modelsPath);
// Bootstrap passport config
passportConfig(passport);
// Define the express app
var app = express();
// Stuff the express configuration
expressConfig(app, passport, db);
// Bootstrap the application routes
routes.bootstrap(app, passport, auth);
// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
logger.info("Server started on port %d.", port);

/******************************************* EXPORTS **********************************************/

// Expose the express application
exports = module.exports = app;
