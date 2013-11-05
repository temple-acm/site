/*************************************** FILE DESCRIPTION *****************************************/

// This script publishes and defines all HTTP routes provided by this server. 

/*************************************** EXTERNAL IMPORTS *****************************************/

var passport = require("passport"); // A popular authentication library

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../util/log"); // Our custom logging utility

var rootController; // Article controller module
var userController; // User controller module
var articleController; // Article controller module

/******************************************** MODULE **********************************************/

var bootstrap = function(app, passport, auth) {
    // Load the controllers
    rootController = require("./controllers/index");
    userController = require("./controllers/users"); 
    articleController = require("./controllers/articles");
    // User Routes
    logger.info("\tRegistering user routes.");
    app.get("/signin", userController.signin);
    app.get("/signup", userController.signup);
    app.get("/signout", userController.signout);
    app.get("/users/me", userController.me);
    app.get("/users/:userId", userController.show);
    // Setting up the users api
    app.post("/users", userController.create);
    app.post("/users/session", passport.authenticate("local", {
        failureRedirect: "/signin",
        failureFlash: "Invalid email or password."
    }), userController.session);
    // Finish with setting up the userId param
    app.param("userId", userController.user);
    // Article Routes
    logger.info("\tRegistering article routes.");
    app.get("/articles", articleController.all);
    app.post("/articles", auth.requiresLogin, articleController.create);
    app.get("/articles/:articleId", articleController.show);
    app.put("/articles/:articleId", auth.requiresLogin, auth.article.hasAuthorization, articleController.update);
    app.del("/articles/:articleId", auth.requiresLogin, auth.article.hasAuthorization, articleController.destroy);
    // Finish with setting up the articleId param
    app.param("articleId", articleController.article);
    // Home route
    logger.info("\tRegistering root routes.");
    app.get("/", rootController.render);
};

/******************************************* EXPORTS **********************************************/

module.exports.bootstrap = bootstrap;