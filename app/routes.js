/*************************************** FILE DESCRIPTION *****************************************/

// This script publishes and defines all HTTP routes provided by this server. 

/*************************************** EXTERNAL IMPORTS *****************************************/

var passport = require("passport"); // A popular authentication library

/*************************************** INTERNAL IMPORTS *****************************************/

var rootController = require("./controllers/index"); // Article controller module
var userController = require("./controllers/users"); // User controller module
var articleController = require("./controllers/articles"); // Article controller module

/******************************************** MODULE **********************************************/

var bootstrap = function(app, passport, auth) {
    // User Routes
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
    }), users.session);
    // Finish with setting up the userId param
    app.param("userId", userController.user);
    // Article Routes
    app.get("/articles", articleController.all);
    app.post("/articles", auth.requiresLogin, articleController.create);
    app.get("/articles/:articleId", articleController.show);
    app.put("/articles/:articleId", auth.requiresLogin, auth.article.hasAuthorization, articleController.update);
    app.del("/articles/:articleId", auth.requiresLogin, auth.article.hasAuthorization, articleController.destroy);
    // Finish with setting up the articleId param
    app.param("articleId", articleController.article);
    // Home route
    app.get("/", rootController.render);
}

/******************************************* EXPORTS **********************************************/

module.exports.bootstrap = bootstrap;