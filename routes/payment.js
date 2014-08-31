var ipn = require('paypal-ipn');
var logger = require('../util/log');

exports.route = function(app) {
	// Callback we get from successful payment from Paypal.
	// Updates the "paid" field for that user in the database.
	app.post('/members/payments/callback/:userName', function(req, res) {
		// IPN requires that we send a 200 immediately
		res.send(200);
		var userName = req.param('userName');
		ipn.verify(req.body, function(err, msg) {
			if (err) {
				logger.log('error', 'could not process IPN callback for ' + userName, err);
			} else {
				// We received a bonafide response
				req.db.collection('users').update({
					userName: userName
				}, {
					paid: true,
					dateLastPaid: (new Date()).getTime()
				}, {}, function(err) {
					if (err) {
						logger.log('error', 'could not mark user paid', err);
					} else {
						logger.log('debug', 'User "', userName, '" is marked paid.');
					}
				});
			}
		});
	});
};