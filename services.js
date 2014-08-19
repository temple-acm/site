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
		req.db.collection('slides').find().sort({
			order: 1
		}).toArray(function(err, results) {
			res.json(results);
		});
	});
	// Check if a user name is free
	app.get('/members/userName/isFree', function(req, res) {
		var userName = req.param("userName");
		if (!userName) {
			res.send(400, "Username parameter required.");
		} else {
			req.db.collection('user').find({
				userName: userName
			}).toArray(function(err, results) {
				if (err) {
					res.json(500, err);
				} else {
					res.json(200, (!results || results.length === 0));
				}
			});
		}
	});
	// Check if a user name is free
	app.get('/members/register', function(req, res) {
		var userName = req.param("userName");
		if (!userName) {
			res.send(400, "Username parameter required.");
		} else {
			req.db.collection('user').find({
				userName: userName
			}).exec(function(err, results) {
				if (err) {
					res.json(500, err);
				} else {
					res.json(200, (!results || results.length === 0));
				}
			});
		}
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