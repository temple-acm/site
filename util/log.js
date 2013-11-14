/*************************************** FILE DESCRIPTION *****************************************/

// This script defines the logger that we use throughout the server.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require("fs"); // File system management
var path = require("path"); // File pathing utility
var winston = require("winston"); // A popular logging adapter

/*************************************** INTERNAL IMPORTS *****************************************/

var config = require("../config/config"); // Server configuration script

/******************************************** MODULE **********************************************/

// Module Constants
const DEBUG_LOG_NAME = "debug.log";
const ERROR_LOG_NAME = "error.log";
const DEFAULT_LOGS_FOLDER_NAME = "logs";

// Lets first ensure that our log path exists
var logPath = config.logPath || path.join(__dirname, DEFAULT_LOGS_FOLDER_NAME);
if (!fs.existsSync(logPath) || !fs.statSync(logPath).isDirectory()) {
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
// We're asking winston to write to log files in addition to the command line. Also, we want errors
// to have their own log.
var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            json: false,
            timestamp: true
        }),
        new winston.transports.File({
            filename: path.join(logPath, DEBUG_LOG_NAME),
            json: false
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logPath, ERROR_LOG_NAME),
            json: false
        })
    ],
    exitOnError: false
});
logger.cli();
// Handle process errors
process.on("uncaughtException", function(err) {
    logger.error("UNCAUGHT EXCEPTION - message: \t%s", err.message);
    logger.error("UNCAUGHT EXCEPTION - trace:\t%s", err.stack);
});

/******************************************* EXPORTS **********************************************/

module.exports = logger;