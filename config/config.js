/*************************************** FILE DESCRIPTION *****************************************/

// This script defines the configuration for the entire server. The configuration varies with the 
// current environment as defined by NODE_ENV (production, development etc.). Furthermore, config-
// uration is loaded at server start.

/*************************************** EXTERNAL IMPORTS *****************************************/

var _ = require("underscore");
var path = require("path"); // Node.js internal pathing utility module

/*************************************** INTERNAL IMPORTS *****************************************/

/******************************************** MODULE **********************************************/

/******************************************* EXPORTS **********************************************/

// Ensure process ENV variable is set
process.env.NODE_ENV = process.env.NODE_ENV || "development";
// Load app configuration
module.exports = _.extend(
    require(path.join(__dirname, "env", "all.js")),
    require(path.join(__dirname, "env", process.env.NODE_ENV + ".json")));
