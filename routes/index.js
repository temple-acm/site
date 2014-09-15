// Load fs modules
var fs = require('fs'),
	path = require('path');

var NOT_FOUND_PATH;
// Use minified html for production
if (process.env.TUACM_DEV) {
	// Development
	NOT_FOUND_PATH = path.join(__dirname, '..', 'public', 'dist', '404.html');
} else {
	// Production
	NOT_FOUND_PATH = path.join(__dirname, '..', 'public', 'dist', '404.min.html');
}

// Sweep through all the routes we have; put them in a list
var routeModules = [];
var fileNames = fs.readdirSync(__dirname);
for (var i = 0; i < fileNames.length; i++) {
	if (fileNames[i].indexOf('.js') === (fileNames[i].length - 3) && fileNames[i] !== 'index.js') {
		routeModules.push(require(path.join(__dirname, fileNames[i])) || {});
	}
}

// Expose function to load routes
exports.setup = function(app) {
	for (var i = 0; i < routeModules.length; i++) {
		// Run configure first
		if (typeof routeModules[i].configure === 'function') {
			routeModules[i].configure(app);
		}
		// Run routing second
		if (typeof routeModules[i].route === 'function') {
			routeModules[i].route(app);
		}
		// Run post configuration last
		if (typeof routeModules[i].finish === 'function') {
			routeModules[i].finish(app);
		}
	}
	// Handles 404s
	app.use(function(req, res, next) {
		res.status(404);
		// respond with html page
		if (req.accepts('html')) {
			res.sendFile(NOT_FOUND_PATH);
			return;
		}
		// respond with json
		if (req.accepts('json')) {
			res.send({
				error: 'Page was not found'
			});
			return;
		}
		// default to plain-text. send()
		res.type('txt').send('Page was not found.');
	});
};