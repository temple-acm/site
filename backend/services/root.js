/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes for rendering the webapp.

/*************************************** EXTERNAL IMPORTS *****************************************/

/*************************************** INTERNAL IMPORTS *****************************************/

/******************************************** MODULE **********************************************/

// Renders the main page, which has the SPA inside it
var render = function (req, res) {
	res.render("main", {
		user: req.user ? JSON.stringify(req.user) : "null"
	});
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
	path: "/*",
	method: "GET",
	priority: 1,
	handler: render
}];