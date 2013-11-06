/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes for rendering the webapp.

/*************************************** EXTERNAL IMPORTS *****************************************/

/*************************************** INTERNAL IMPORTS *****************************************/

/******************************************** MODULE **********************************************/

var render = function(req, res) {
    res.render("index", {
        user: req.user ? JSON.stringify(req.user) : "null"
    });
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = {
    "/": {
        method: "GET",
        handler: render
    }
};