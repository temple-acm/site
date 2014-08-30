exports.route = function(app) {
	// Convenient redirects
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
	app.get('/officers', function(req, res) {
		res.redirect('/#/officers');
	});
};