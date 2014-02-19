/*************************************** FILE DESCRIPTION *****************************************/

// This script describes the object model for a Slide.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var async = require("async"); // An asynchronous flow utility
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// The mongoose schema supertype
var Schema = mongoose.Schema;

/**
 * Slide Schema
 */
var SlideSchema = new Schema({
    title: String,
    subtitle: String,
    bgImageUrl: String,
    link: String,
    bgColor: String,
    fontColor: String,
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: Date,
    updatedBy: {
        type: Schema.ObjectId,
        ref: "User"
    },
    createdBy: {
        type: Schema.ObjectId,
        ref: "User"
    }
});

mongoose.model("Slide", SlideSchema);

/******************************************* EXPORTS **********************************************/