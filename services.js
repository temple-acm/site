var path = require('path'),
	fs = require('fs');

var LIVERELOAD_MIXIN = '<script src="http://localhost:35729/livereload.js"></script>';
var LIVERELOAD_PLACEHOLDER = "<!-- Livereload -->";
var INDEX_PAGE_PATH = path.join(__dirname, 'public', 'pages', 'index.html');

exports.route = function(app) {
	// Setup routes
	app.get('/', function(req, res) {
		if (process.env.TUACM_PRODUCTION)
			res.sendfile(INDEX_PAGE_PATH);
		else {
			// Embed livereload
			fs.readFile(INDEX_PAGE_PATH, function(err, data) {
				if (err) {
					res.send(500, err);
				} else {
					data = data.toString().replace(LIVERELOAD_PLACEHOLDER, LIVERELOAD_MIXIN);
					res.send(data);
				}
			});
		}
	});
};