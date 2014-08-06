var path = require('path'),
	fs = require('fs');

var LIVERELOAD_MIXIN = '<script src="http://localhost:35729/livereload.js"></script>';
var LIVERELOAD_PLACEHOLDER = "<!-- Livereload -->";
var INDEX_PAGE_PATH = path.join(__dirname, 'public', 'pages', 'index.html');

exports.route = function(app) {
	var pageCache = {};
	// Main page route
	app.get('/', function(req, res) {
		if (process.env.TUACM_PRODUCTION)
			res.sendfile(INDEX_PAGE_PATH);
		else {
			// Embed livereload
			if (!pageCache.index) {
				fs.readFile(INDEX_PAGE_PATH, function(err, data) {
					if (err) {
						res.send(500, err);
					} else {
						pageCache.index = data.toString().replace(LIVERELOAD_PLACEHOLDER, LIVERELOAD_MIXIN);
						res.send(pageCache.index);
					}
				});
			} else {
				res.send(pageCache.index);
			}
		}
	});
	// Get the slides
	app.get('/slides', function(req, res) {
		var slides = req.db.collection('slides');
		slides.find().toArray(function(err, results) {
			res.json(results);
		});
	});
};