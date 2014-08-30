exports.route = function(app) {
	// Callback we get from successful payment from Paypal.
	// Updates the "paid" field for that user in the database.
	var paypalCallback = function(req, res) {
		var userName = req.param('userName');
		req.db.collection('users').update({
			userName: userName
		}, {
			paid: true
		}, {}, function(err) {
			if (err) {
				console.log('Could not mark user "', userName, '" paid.');
			} else {
				console.log('User "', userName, '" is marked paid.');
			}
		});
	};
	app.get('/members/payments/callback/:userName', paypalCallback);
	app.post('/members/payments/callback/:userName', paypalCallback);
};