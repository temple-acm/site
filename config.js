/*************************************** FILE DESCRIPTION *****************************************/

// This script defines the configuration for the server.

/*************************************** EXTERNAL IMPORTS *****************************************/

var path = require("path"); // File pathing utility; we use it for concating paths

/*************************************** INTERNAL IMPORTS *****************************************/

/******************************************** SCRIPT **********************************************/

// Server Constants
const PRODUCTION_URI = "http://acm.temple.edu";

// Settings Map
var settings = {
    sessionSecret: "temple acm rules",
    port: 8080,
    uri: "http://127.0.0.1:8080",
    logPath: path.join(_dirname, "logs"),
    debug: (process.env.NODE_ENV !== "production")
};

// Check if in production
if (process.env.NODE_ENV == "production") {
    settings.uri = PRODUCTION_URI;
    settings.port = process.env.PORT || 80; // Joyent SmartMachine uses process.env.PORT
    settings.airbrakeApiKey = "637689ef4946163f0c4241d70dc71be5cb89cc12"; // Error handling Service
}

/******************************************* EXPORTS **********************************************/

module.exports = settings;
