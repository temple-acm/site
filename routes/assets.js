var path = require('path');

/******************************* MODULE HELPERS *******************************/

var INDEX_PAGE_PATH = path.join(__dirname, '..', 'public', 'pages', 'index.html');

/******************************** MEMBER ROUTES *******************************/

exports.route = function(app) {
	// Main page route
	app.get('/', function(req, res) {
		res.sendFile(INDEX_PAGE_PATH);
	});
	// Get the slides
	app.get('/slides', function(req, res) {
		req.db.collection('slides').find().sort({
			order: 1
		}).toArray(function(err, results) {
			res.json(results);
		});
	});
};