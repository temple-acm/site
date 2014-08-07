var path = require('path'),
	fs = require('fs');

var LIVERELOAD_MIXIN = '<script src="http://localhost:35729/livereload.js"></script>';
var LIVERELOAD_PLACEHOLDER = "<!-- Livereload -->";
var INDEX_PAGE_PATH = path.join(__dirname, 'public', 'pages', 'index.html');

exports.route = function(app) {
	// Main page route
	app.get('/', function(req, res) {
		if (process.env.TUACM_PRODUCTION)
			res.sendfile(INDEX_PAGE_PATH);
		else {
			// Embed livereload
			fs.readFile(INDEX_PAGE_PATH, function(err, data) {
				if (err) {
					res.send(500, err);
				} else {
					var page = data.toString().replace(LIVERELOAD_PLACEHOLDER, LIVERELOAD_MIXIN);
					res.send(page);
				}
			});
		}
	});
	// Get the slides
	app.get('/slides', function(req, res) {
		var slides = req.db.collection('slides');
		slides.find().toArray(function(err, results) {
			res.json(results);
		});
	});
	// Redirects due to user error
	app.get('/register', function(req, res) {
		res.redirect('/#/register');
	});
	app.get('/login', function(req, res) {
		res.redirect('/#/login');
	});
	app.get('/emailus', function(req, res) {
		res.redirect('/#/emailus');
	});
	app.get('/about', function(req, res) {
		res.redirect('/#/about');
	});
	app.get('/events', function(req, res) {
		res.redirect('/#/events');
	});
	app.get('/contact', function(req, res) {
		res.redirect('/#/contact');
	});
	app.get('/dev', function(req, res) {
		res.redirect('/#/dev');
	});
};