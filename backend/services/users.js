/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning articles.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var passport = require("passport"); // A popular authentication library
var async = require("async"); // An asynchronous flow utility
var fs = require("fs");
var path = require("path");
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility
var config = require("../../config/config");

/******************************************** MODULE **********************************************/

var RANDOM_STR_LEN = 16;
var RANDOM_STR_CHARS = "abcdefghijklmnopqrstuvwxyz";
// Firstly, load the model
var User = mongoose.model("User");
// Some helper methods
var randomString = function () {
	// Return a string X characters long with random letters
	var chars = [];
	for (var i = 0; i < RANDOM_STR_LEN; i++)
		chars.push(RANDOM_STR_CHARS.charAt(Math.floor(Math.random() * RANDOM_STR_CHARS.length)));
	return chars.join();
};

/**
 * Show login form
 */
var register = function (req, res) {
	// Register the new member
	logger.info("Some data:");
	console.log(req.body);
	// Start piping for busboy
	req.pipe(req.busboy);
	// Busboy events for file
	req.busboy.on("file", function (fieldName, file, fileName) {
		var generatedFileName = randomString() + "" + (new Date()).getTime() + "." + fileName.split(".").pop();
		logger.info("New resume being uploaded via member registration: \"" + fileName + "\" -> \"" + generatedFileName + "\"");
		file.pipe(path.join(fs.createWriteStream(config.fs.resumePath, generatedFileName)));
		console.log("On:file");
		console.log(arguments);
	});
	res.json(200, {});
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
	path: "/members/register",
	method: "POST",
	handler: register
}];