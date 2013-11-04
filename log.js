/*************************************** FILE DESCRIPTION *****************************************/

// This script defines the logger that we use throughout the server.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require("fs"); // File system management
var path = require("path"); // File pathing utility
var winston = require("winston"); // A popular logging adapter

/*************************************** INTERNAL IMPORTS *****************************************/

var config = require("./config.js"); // Server configuration script

/******************************************** SCRIPT **********************************************/

// Module Constants
const DEBUG_LOG_NAME = "debug.log";
const ERROR_LOG_NAME = "error.log";

// Lets first ensure that our log path exists
var logPath = config.logPath || _dirname;
if (!fs.statSync(logPath).isDirectory()) {
    // Log path doesn't exist, so we need to create it
    console.log("UH OH: Log folder path '" + logPath + "' isn't a thing - fixing that.");
    try {
        fs.mkdirSync(logPath);
        console.log("PHEW: Ok, the log folder was created successfully.");
    } catch (err) {
        // If we can't create the log path, we're in a wold of hurt
        console.log("UH OH: Dude, I couldn't create the log folder:: " + err.message + ".");
        console.log("UH OH: Now Exiting.");
        exit(1);
    }
}
// We're globalizing the winston logger here
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true
        }),
        new winston.transports.File({
            filename: path.join(logPath, DEBUG_LOG_NAME)
            json: false
        })
    ],
    exceptionHandlers: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true
        }),
        new winston.transports.File({
            filename: path.join(logPath, ERROR_LOG_NAME),
            json: false
        })
    ],
    exitOnError: false
});

/******************************************* EXPORTS **********************************************/

module.exports = logger;