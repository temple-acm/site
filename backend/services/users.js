/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning articles.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var async = require("async"); // An asynchronous flow utility
var fs = require("fs");
var path = require("path");
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility
var fsUtil = require("../../util/fs"); // Our custom filesystem utility
var config = require("../../config/config");

/******************************************** MODULE **********************************************/

// Constants
var RANDOM_STR_LEN = 26;
var RANDOM_STR_CHARS = "abcdefghijklmnopqrstuvwxyz";
var EMPTY_STRING = "";
// Some instance variables
var User = mongoose.model("User");
var resumePathAsserted = false; // Boolean that keeps track of whether we have a resume folder or not
// Some helper methods
var randomString = function () {
    // Return a string X characters long with random letters
    var chars = [];
    for (var i = 0; i < RANDOM_STR_LEN; i++)
        chars.push(RANDOM_STR_CHARS.charAt(Math.floor(Math.random() * RANDOM_STR_CHARS.length)));
    return chars.join(EMPTY_STRING);
};

var register = function (req, res) {
    var newUser = new User(req.body);
    newUser.save(function (err) {
        if (err) res.json(500, err);
        else res.json(200, newUser);
    });
};

var resumeDrop = function (req, res) {
    // Start piping for busboy
    req.pipe(req.busboy);
    // Busboy events for file
    req.busboy.on("file", function (fieldName, file, fileName) {
        var generatedFileName = randomString() + "." + fileName.split(".").pop();
        logger.info("New resume being uploaded via member registration: \"" + fileName + "\" -> \"" + generatedFileName + "\"");
        // Ensure that we have a place to put the file
        fsUtil.assertPath(config.fs.resumePath, function (err) {
            if (err) {
                logger.error("Resume '" + generatedFileName + "' could not be uploaded - there was an exception.");
                logger.error(err);
                res.send(500, err);
            } else {
                var resumePath = path.join(config.fs.resumePath, generatedFileName);
                file.pipe(fs.createWriteStream(resumePath));
                logger.info("Upload of resume '" + generatedFileName + "' now completed.");
                // Finish create
                res.send(200, generatedFileName);
            }
        });
    });
};

var userNameFree = function (req, res) {
    var username = req.param("username");
    if (!username) {
        res.send(400, "Username parameter required.");
    } else {
        User.find({
            username: username
        }).exec(function (err, results) {
            if (err) {
                res.json(500, err);
            } else {
                res.json(200, (!results || results.length === 0));
            }
        });
    }
};

var paypalCallback = function (req, res) {
    var userId = req.param('userId');
    User.findById(userId, function (err, user) {
        if (err) console.log('Could not record payment for \'' + userId + '\'', err);
        else {
            // Update user payment boolean
            user.paid = true;
            user.save(function (err) {
                if (err) console.log('Could not record payment for \'' + userId + '\'', err);
                else console.log('Received payment for \'' + userId + '\'', err);
            });
        }
    });
    // Send a 200 out of courtesy
    res.send(200);
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
    path: "/members/register",
    method: "POST",
    handler: register
}, {
    path: "/members/resumes/drop",
    method: "POST",
    handler: resumeDrop
}, {
    path: "/members/isUserNameFree",
    method: "GET",
    handler: userNameFree
}, {
    path: "/members/payments/callback/:userId",
    method: "POST",
    handler: paypalCallback
}, {
    path: "/members/payments/callback/:userId",
    method: "GET",
    handler: paypalCallback
}];