var passport = require('passport'),
	bcrypt = require('bcrypt'),
	ObjectId = require('mongodb').ObjectID,
	LocalStrategy = require('passport-local').Strategy;

/*************************** PASSPORT CONFIGURATION ***************************/

// Setting up passport strategy (used for authentication)
passport.use('local', new LocalStrategy({
	usernameField: 'userName',
	passReqToCallback: true
}, function(req, username, password, done) {
	req.db.collection('users').find({
		userName: username
	}).toArray(function(err, user) {
		if (err) {
			return done(null, false, err);
		}
		if (!user || user.length === 0) {
			return done(null, false, {
				message: 'Invalid credentials'
			});
		}
		var isMatch = bcrypt.compareSync(password, user[0].password);
		if (!isMatch) {
			return done(null, false, {
				message: 'Invalid credentials'
			});
		} else {
			return done(null, user);
		}
	});
}));
// How passport identifies users (we have it work via mongo's bson mechanism)
passport.serializeUser(function(user, done) {
	done(null, user[0]['_id'].id);
});
// How passport turns an id back into a user
passport.deserializeUser(function(req, id, done) {
	userObjectId = new ObjectId(id);
	req.db.collection('users').find({
		_id: userObjectId
	}).toArray(function(err, user) {
		done(err, user);
	});
});

/******************************* MODULE HELPERS *******************************/

var SALT_FACTOR = 10;
// Helper function to create password hashes
var saltAndHash = function(password) {
	var salt = bcrypt.genSaltSync(SALT_FACTOR);
	return bcrypt.hashSync(password, salt);
};

/******************************** MEMBER CONFIG *******************************/

exports.configure = function(app) {
	// Attach passport to express app
	app.use(passport.initialize());
	app.use(passport.session());
};

/******************************** MEMBER ROUTES *******************************/

exports.route = function(app) {
	// Check if a user name is free
	app.get('/members/userName/isFree', function(req, res) {
		var userName = req.param('userName');
		if (!userName) {
			res.status(400).send('Username parameter required.');
		} else {
			req.db.collection('users').find({
				userName: userName
			}).toArray(function(err, results) {
				if (err) {
					res.status(500).json('Error looking up users');
				} else {
					res.status(200).send(!results || results.length === 0);
				}
			});
		}
	});

	/*
	 * This endpoint registers members. It takes in a serialized object with all
	 * the fields enumerated below, performs validation on them, and then commits
	 * the changes to the database and redirects the client to Paypal to give us
	 * money.
	 *
	 * Input:
	 *  All that stuff below, with the exceptions of "paid" and "officer", which
	 *  are provided defaults because for every newly registering user both should
	 *  be "false" until otherwise changed.
	 *
	 * Output:
	 *  Success:
	 *      status: 200
	 *      data: { "200" : newUser } where newUser is the newly-created user's
	 *      information.
	 *  Error:
	 *      status: 200
	 *      data: { "500" : err } where "err" is the database error.
	 */
	app.post('/members/register', function(req, res) {
		// TODO we need better validations here
		var newUser = {};

		newUser.userName = req.body.userName;
		newUser.firstName = req.body.firstName;
		newUser.lastName = req.body.lastName;
		newUser.email = req.body.email;
		newUser.github = req.body.github;
		newUser.twitter = req.body.twitter;
		newUser.facebook = req.body.facebook;
		newUser.bio = req.body.bio;
		newUser.major = req.body.major;
		newUser.studentLevel = req.body.studentLevel;
		newUser.membership = req.body.membership;
		newUser.password = req.body.password;
		newUser.picture = req.body.picture;
		newUser.paid = false;
		newUser.officer = false;

		if (!newUser.userName && newUser.userName.length > 0) res.status(500).send('userName property is invalid.');
		else if (!newUser.firstName && newUser.firstName.length > 0) res.status(500).send('firstName property is invalid.');
		else if (!newUser.lastName && newUser.lastName.length > 0) res.status(500).send('lastName property is invalid.');
		else if (!newUser.email && newUser.email.length > 0 && /^.*@.*$/i.test(newUser.email)) res.status(500).send('email property is invalid.');
		else if (!newUser.bio && newUser.bio.length > 0) res.status(500).send('bio property is invalid.');
		else if (!newUser.major && newUser.major.length > 0) res.status(500).send('major property is invalid.');
		else if (!newUser.studentLevel && newUser.studentLevel.length > 0) res.status(500).send('studentLevel property is invalid.');
		else if (!newUser.password && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ig.test(newUser.password)) res.status(500).send('password property is invalid.');
		else {
			// TODO double check the user name
			// TODO double check the email
			// Salt the password before it goes into the db
			newUser.password = saltAndHash(newUser.password);
			// Insert the new user
			req.db.collection('users').save(newUser, function(err, createdUser) {
				if (err) {
					res.status(200).json({
						'500': 'Error saving new user'
					});
				} else {
					res.status(200).json({
						'200': createdUser
					});
				}
			});
		}
	});

	/*
	 * This endpoint logs in users. It takes in a serialized object representing
	 * a login request, and returns either an object with that user's relevant
	 * information from the database, or an error message.
	 *
	 * Input:
	 *  { "userName" : username, "password" : password } where username/password
	 *  are the inputted username/password. Note the spelling of "userName" in the
	 *  object.
	 *
	 * Output:
	 *  Success:
	 *      status: 200
	 *      data: { "200": [ userName, firstName, lastName, picture ] }
	 *  Error:
	 *      Internal Passport Error:
	 *          status: 200
	 *          data: { "500" : "Internal Passport error" }
	 *      Login credential error:
	 *          status: 200
	 *          data: { "401" : "Unspecified login error" }
	 */
	app.post('/members/login', function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) {
				return res.status(200).json({
					'500': 'Internal Passport error'
				}); // This may never be called, since it's an internal Passport error
			} else {
				req.logIn(user, function(err) {
					if (err) {
						return res.status(200).json({
							'401': 'Unspecified login error'
						});
					} else {
						return res.status(200).json({
							'200': {
								userName: user[0].userName,
								firstName: user[0].firstName,
								lastName: user[0].lastName,
								picture: user[0].picture
							}
						}); // We can add more fields here if needed
					}
				});
			}
		})(req, res, next);
	});

	/*
	 * The simplest endpoint in this mess. Logs people out. Can't actually go
	 * wrong, I think. It just makes one call to Passport's session stuff and
	 * sends a 200 back. Beautiful. Simple. Perfect (almost).
	 */
	app.get('/members/logout', function(req, res) {
		req.logout();
		res.status(200).send('true');
	});

	/*
	 * This endpoint queries for an active user object in the session. If one
	 * exists, then we can confidently say that there is a logged-in user in
	 * this session and we send that user's information back. If not, we return
	 * the error string "false".
	 *
	 * Output:
	 *  Success:
	 *      status: 200
	 *      data: {"200" : loggedInUser }, where loggedInUser is the user object the current
	 *      session belongs to.
	 *  Error:
	 *      status: 200
	 *      data: Object { "401" : "false" }
	 */
	app.get('/members/isLoggedIn', function(req, res) {
		if (req.user) {
			var loggedInUser = {
				userName: req.user[0].userName,
				firstName: req.user[0].firstName,
				picture: req.user[0].picture
			}
			res.status(200).send({
				'200': loggedInUser
			});
		} else {
			res.status(200).send({
				'401': 'false'
			});
		}
	});

	/*
	 * This endpoint retrieves the entries for all the active ACM officers from
	 * the database. It does so by finding all entries in the 'users' collection
	 * that have the boolean flag "officer" set to true.
	 *
	 * Output:
	 *  Success:
	 *      status: 200
	 *      data: { "200" : officers } where "officers" is a list of the officers'
	 *      user objects.
	 *  Error:
	 *      status: 200
	 *      data: { "500": err } where "err" is the error message.
	 */
	app.get('/members/officers', function(req, res) {
		req.db.collection('users').find({
			officer: true
		},
        {
            firstName:1,
            lastName:1,
            picture:1,
            title:1,
            bio:1
        }).toArray(function(err, officers) {
			if (err) {
				res.status(200).json({
					'500': "Error retrieving officers"
				});
			} else {
				res.status(200).json({
					'200': officers
				});
			}
		});
	});
};
