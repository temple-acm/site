// Load fs modules
var fs = require('fs'),
	path = require('path');

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
	}
};