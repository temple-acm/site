/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning articles.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var passport = require("passport"); // A popular authentication library
var async = require("async"); // An asynchronous flow utility
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Firstly, load the model
var User = mongoose.model("User");

/**
 * Auth callback
 */
var authCallback = function(req, res, next) {
    res.redirect("/");
};

/**
 * Show login form
 */
var signin = function(req, res) {
    res.render("users/signin", {
        title: "Signin",
        message: req.flash("error")
    });
};

/**
 * Show sign up form
 */
var signup = function(req, res) {
    res.render("users/signup", {
        title: "Sign up",
        user: new User()
    });
};

/**
 * Logout
 */
var signout = function(req, res) {
    req.logout();
    res.redirect("/");
};

/**
 * Session
 */
var session = function(req, res) {
    res.redirect("/");
};

/**
 * Create user
 */
var create = function(req, res) {
    // Make a new user
    var user = new User(req.body);
    // Mongoose setting
    user.provider = "local";
    // Put it in the db
    user.save(function(err) {
        if (err) {
            return res.render("users/signup", {
                errors: err.errors,
                user: user
            });
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect("/");
        });
    });
};

/**
 *  Show profile
 */
var show = function(req, res) {
    var user = req.profile;
    // Send back an html view
    res.render("users/show", {
        title: user.name,
        user: user
    });
};

/**
 * Send User
 */
var me = function(req, res) {
    // We get the user from authentication middleware
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
var user = function(req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        // Pass down the error if there was one
        if (err) return next(err);
        // User was missing, throw a tantrum
        if (!user) return next(new Error("Failed to load User " + id));
        // Define this "profile" parameter of the request
        req.profile = user;
        // Goes to the next request handler
        next();
    });
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
    path: "/signin",
    method: "GET",
    handler: signin
}, {
    path: "/signup",
    method: "GET",
    handler: signup
}, {
    path: "/signout",
    method: "GET",
    requiresAuth: true,
    handler: signin
}, {
    path: "/users/me",
    method: "GET",
    requiresAuth: true,
    handler: me
}, {
    path: "/users/:userId",
    method: "GET",
    requiresAuth: true,
    handler: show
}, {
    path: "/users",
    method: "POST",
    permissions: [ /* Can create users */ "userCreator"], // Implies requiresAuth
    handler: create
}, {
    path: "/users/session",
    method: "POST",
    handlers: [
        passport.authenticate("local", {
            failureRedirect: "/signin",
            failureFlash: "Invalid email or password."
        }),
        session
    ]
}];
// This controller's parameter adapters
module.exports.params = {
    userId: user
};