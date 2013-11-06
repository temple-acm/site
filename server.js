/****************************************** DESCRIPTION *******************************************/

// This is the primary entry point for the Node.js server. All functionality must be introduced in 
// some capacity within this file.

/*************************************** EXTERNAL IMPORTS *****************************************/

var express = require("express"); // The web server implementation we're using
var fs = require("fs"); // Node.js internal filesystem module
var path = require("path"); // Node.js internal pathing utility module
var passport = require("passport"); // A popular authentication library
var mongoose = require("mongoose"); // The Mongo DB ORM we're using

/*************************************** INTERNAL IMPORTS *****************************************/

var config = require("./config/config"); // Our server-wide configuration module
var logger = require("./util/log"); // Our custom logging utility
var expressConfig = require("./config/express"); // Our express configuration 
var controllers = require("./app/controllers");

/******************************************** MODULE **********************************************/

// Load configurations
// if test env, load example file
var env = process.env.NODE_ENV; // Defaults to dev. env.
var auth = require("./config/middlewares/authorization");
// Bootstrap the db connection
logger.info("Bootstrapping mongoose db connection.");
var db = mongoose.connect(config.db);
logger.info("Mongoose db connection bootstrapping complete.");
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
                logger.info("\tLoading model '%s'.", newPath);
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            // Otherwise recurse the directory
            walk(newPath);
        }
    });
};
// Walk the models path
logger.info("Loading schema models:");
walk(path.join(__dirname, "/app/models"));
logger.info("Schema model loading complete.");
// Define the express app
var app = express();
// Stuff the express configuration
expressConfig(app, passport, db);
logger.info("Express configuration bootstrapping complete.");
// Bootstrap the application routes
logger.info("Bootstrapping server HTTP routes:");
controllers.route(app, passport, auth);
logger.info("HTTP route bootstrapping complete.");
// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
logger.info("Server started on port %d.", port);

/******************************************* EXPORTS **********************************************/

// Expose the express application
exports = module.exports = app;