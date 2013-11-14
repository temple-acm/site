/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning slides.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var passport = require("passport"); // A popular authentication library
var request = require("request"); // Ze coolest REST client ever
var async = require("async"); // An asynchronous flow utility
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Firstly, load the model
var Slide = mongoose.model("Slide");

// A test data generation method for slides
var getOrCreateSlides = function(callback) {
    // Look and see if any slides are in the db
    Slide.find({}, function(err, slidesAlreadyInDb) {
        if (err) {
            callback(err);
            return;
        } else if (slidesAlreadyInDb.length <= 0) {
            // A utility method for basic boiler plate slides
            var generateRandomColor = function() {
                var letters = "0123456789ABCDEF".split('');
                var color = "#";
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.round(Math.random() * 15)];
                }
                return color;
            };
            // Its time to add our test slides
            var testSlides = [];
            // Random slide count between 5 and 9
            var slideCount = 5 + (Math.floor(Math.random() * 100) % 4);
            for (var i = 0; i < slideCount; i++) testSlides.push(new Slide());
            // Now we stuff in the data
            var includeImageUrl = true; // For image alternation
            async.each(testSlides, function(testSlide, done) {
                // Give the slide an image and a bg
                testSlide.bgColor = generateRandomColor();
                if (includeImageUrl) {
                    includeImageUrl = false;
                    testSlide.bgImageUrl = "http://lorempixel.com/1600/350/food";
                } else {
                    testSlide.link = "http://brojsimpson.com/wordpress/wp-content/uploads/2011/04/rick-rolled-links-header.jpg";
                    includeImageUrl = true;
                }
                // Get the text
                request({
                    url: "http://baconipsum.com/api",
                    qs: {
                        type: "all-meat",
                        paras: 1
                    }
                }, function(err, response, body) {
                    if (err) {
                        testSlide.title = "This is a title";
                        testSlide.subtitle = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
                    } else {
                        var result = JSON.parse(response.body)[0];
                        // Grab the first 6 words
                        testSlide.title = result.split(/\s+/).slice(0, 6).join(" ") + ".";
                        // Get the sentences after the first
                        testSlide.subtitle = result;
                    }
                    // Save this slide
                    testSlide.save();
                    // We're done here
                    done();
                });
            }, function(err) {
                // Called when all the slides have been initialized
                if (err) callback(err);
                else {
                    callback(null, testSlides);
                }
            });
        } else {
            // We have slides in the db already, so lets just return them
            callback(null, slidesAlreadyInDb);
        }
    });
}

/**
 * Get all slides
 */
var getAll = function(req, res) {
    getOrCreateSlides(function(err, slides) {
        if (err) res.json(500, err);
        else res.json(slides);
    });
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
    path: "/slides",
    method: "GET",
    handler: getAll
}];