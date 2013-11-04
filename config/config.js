/*************************************** FILE DESCRIPTION *****************************************/

// This script defines the configuration for the entire server. The configuration varies with the 
// current environment as defined by NODE_ENV (production, development etc.). Furthermore, config-
// uration is loaded at server start.

/*************************************** EXTERNAL IMPORTS *****************************************/

var _ = require("underscore");

// Load app configuration

module.exports = _.extend(
    require(__dirname + '/../config/env/all.js'),
    require(__dirname + '/../config/env/' + process.env.NODE_ENV + '.json') || {});