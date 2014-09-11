var path = require('path');

/******************************* MODULE HELPERS *******************************/

var INDEX_PAGE_PATH,
	RECRUITING_PAGE_PATH,
	RESET_PASSWORD_PAGE_PATH,
	NOT_FOUND_PATH;
// Use minified html for production
if (process.env.TUACM_DEV) {
	// Development
	INDEX_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'index.html');
	RECRUITING_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'recruiting.html');
	NOT_FOUND_PATH = path.join(__dirname, '..', 'public', 'dist', '404.html');
	RESET_PASSWORD_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'reset-password.html');
} else {
	// Production
	INDEX_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'index.min.html');
	RECRUITING_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'recruiting.min.html');
	NOT_FOUND_PATH = path.join(__dirname, '..', 'public', 'dist', '404.min.html');
	RESET_PASSWORD_PAGE_PATH = path.join(__dirname, '..', 'public', 'dist', 'reset-password.min.html');
}

/******************************** ASSET ROUTES ********************************/

exports.route = function(app) {
	/**** PAGES ****/

	// Main page route
	app.get('/', function(req, res) {
		res.sendFile(INDEX_PAGE_PATH);
	});
	// Recruiting slideshow page route
	app.get('/recruiting', function(req, res) {
		res.sendFile(RECRUITING_PAGE_PATH);
	});
	// Password reset page
	app.get('/settings/password/reset/:token', function(req, res) {
		var token = req.param('token');
		if (!token) {
			res.sendFile(NOT_FOUND_PATH);
		} else {
			req.db.collection('users').find({
				passwordResetToken: token
			}).toArray(function(err, users) {
				if (err || !users || users.length < 1) {
					res.sendFile(NOT_FOUND_PATH);
				} else {
					res.sendFile(RESET_PASSWORD_PAGE_PATH);
				}
			});
		}
	});

	/**** ASSET FETCHING ROUTES ****/

	// Get the slides
	app.get('/slides', function(req, res) {
		req.db.collection('slides').find().sort({
			order: 1
		}).toArray(function(err, results) {
			res.status(200).json(results);
		});
	});
};

// exports.finish = function(app) {
// 	app.use(function(req, res, next) {
// 		res.status(404);
// 		// respond with html page
// 		if (req.accepts('html')) {
// 			res.sendFile(NOT_FOUND_PATH);
// 			return;
// 		}
// 		// respond with json
// 		if (req.accepts('json')) {
// 			res.send({
// 				error: 'Page was not found'
// 			});
// 			return;
// 		}
// 		// default to plain-text. send()
// 		res.type('txt').send('Page was not found.');
// 	});
// };