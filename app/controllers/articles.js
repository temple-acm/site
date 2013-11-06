/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning articles.

/*************************************** EXTERNAL IMPORTS *****************************************/

var mongoose = require("mongoose"); // The Mongo DB ORM we're using
var async = require("async"); // An asynchronous flow utility
var _ = require("underscore");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Firstly, load the model
var Article = mongoose.model("Article");


/**
 * Find article by id
 */
var article = function(req, res, next, id) {
    Article.load(id, function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};

/**
 * Create a article
 */
var create = function(req, res) {
    var article = new Article(req.body);
    article.user = req.user;

    article.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                article: article
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Update a article
 */
var update = function(req, res) {
    var article = req.article;

    article = _.extend(article, req.body);

    article.save(function(err) {
        res.jsonp(article);
    });
};

/**
 * Delete an article
 */
var destroy = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(article);
        }
    });
};

/**
 * Show an article
 */
var show = function(req, res) {
    res.jsonp(req.article);
};

/**
 * List of Articles
 */
var all = function(req, res) {
    Article.find().sort("-created").populate("user", "name username").exec(function(err, articles) {
        if (err) {
            res.render("error", {
                status: 500
            });
        } else {
            res.jsonp(articles);
        }
    });
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
    path: "/articles",
    method: "GET",
    handler: all
}, {
    path: "/articles",
    method: "POST",
    permissions: [ /* Can create articles */ "articleCreator"], // Implies requiresAuth
    handler: create
}, {
    path: "/articles/:articleId",
    method: "GET",
    handler: show
}, {
    path: "/articles/:articleId",
    method: "PUT",
    permissions: ["creator", /* Can edit articles */ "articleEditor"], // Implies requiresAuth
    handler: update
}, {
    path: "/articles/:articleId",
    method: "DELETE",
    permissions: ["creator", /* Can edit articles */ "articleDestroyer"], // Implies requiresAuth
    handler: destroy
}];
// This controller's parameter adapters
module.exports.params = {
    articleId: article
};