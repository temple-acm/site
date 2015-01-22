var passport = require('passport'),
	bcrypt = require('bcrypt'),
	async = require('async'),
    MongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID,
	LocalStrategy = require('passport-local').Strategy;
var emailUtil = require('../util/email'),
	logger = require('../util/log'),
    acl = require('acl');

//-------------------------- PASSPORT CONFIGURATION --------------------------//

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

//------------------------------ MODULE HELPERS ------------------------------//

var SALT_FACTOR = 10;
var EMAIL_REGEX = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
var PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,16}$/;
// Helper function to create password hashes
var saltAndHash = function(password) {
	var salt = bcrypt.genSaltSync(SALT_FACTOR);
	return bcrypt.hashSync(password, salt);
};
// Helper to generate a password reset token
var passwordResetToken = function() {
	return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
};

//-------------------------ACL CONFIGURATION----------------------------------//

MongoClient.connect(process.env.TUACM_URL, function(err, db) {
    var aclBackend = new acl.mongodbBackend(db);
    acl = new acl(aclBackend);
    logger.log('info', 'ACL backend initialized in member.js.');
});

//------------------------------- MEMBER CONFIG ------------------------------//

exports.configure = function(app) {
	// Attach passport to express app
	app.use(passport.initialize());
	app.use(passport.session());
};

//------------------------------- MEMBER ROUTES ------------------------------//

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
					logger.log('error', err);
					res.status(500).json('Error looking up users');
				} else {
					res.status(200).send(!results || results.length === 0);
				}
			});
		}
	});

	// Check if an email is free
	app.get('/members/email/isFree', function(req, res) {
		var email = req.param('email');
		if (!email) {
			res.status(400).send('Email parameter required.');
		} else {
			req.db.collection('users').find({
				email: email
			}).toArray(function(err, results) {
				if (err) {
					logger.log('error', err);
					res.status(500).json('Error looking up users');
				} else {
					res.status(200).send(!results || results.length === 0);
				}
			});
		}
	});

	// Check if a membership number is free
	app.get('/members/membership/isFree', function(req, res) {
		var membership = req.param('membership');
		if (!membership) {
			res.status(400).send('Membership parameter required.');
		} else {
			req.db.collection('users').find({
				membership: membership
			}).toArray(function(err, results) {
				if (err) {
					logger.log('error', err);
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

		newUser.userName = req.body.userName; // Required
		newUser.firstName = req.body.firstName; // Required
		newUser.lastName = req.body.lastName; // Required
		newUser.email = req.body.email; // Required
		newUser.github = req.body.github;
		newUser.twitter = req.body.twitter;
		newUser.facebook = req.body.facebook;
		newUser.bio = req.body.bio; // Required
		newUser.major = req.body.major; // Required
		newUser.studentLevel = req.body.studentLevel; // Required
		newUser.membership = req.body.membership; // Required
		newUser.password = req.body.password; // Required
		newUser.picture = req.body.picture;
		newUser.paid = false;
		newUser.dateLastPaid = null;
		newUser.officer = false;
		newUser.dateRegistered = (new Date()).getTime();

		if (!newUser.userName || typeof newUser.userName !== 'string' || newUser.userName.length <= 0) {
			res.status(400).send('userName property is invalid.');
		} else if (!newUser.firstName || typeof newUser.firstName !== 'string' || newUser.firstName.length <= 0) {
			res.status(400).send('firstName property is invalid.');
		} else if (!newUser.lastName || typeof newUser.lastName !== 'string' || newUser.lastName.length <= 0) {
			res.status(400).send('lastName property is invalid.');
		} else if (!newUser.email || typeof newUser.email !== 'string' || newUser.email.length <= 0 || !EMAIL_REGEX.test(newUser.email)) {
			res.status(400).send('email property is invalid.');
		} else if (!newUser.bio || typeof newUser.bio !== 'string' || newUser.bio.length <= 0) {
			res.status(400).send('bio property is invalid.');
		} else if (!newUser.major || typeof newUser.major !== 'string' || newUser.major.length <= 0) {
			res.status(400).send('major property is invalid.'); // TODO check major from list of majors
		} else if (!newUser.studentLevel || typeof newUser.studentLevel !== 'string' || newUser.studentLevel.length <= 0) {
			res.status(400).send('studentLevel property is invalid.');
		} else if (!newUser.password || typeof newUser.password !== 'string' || !PASSWORD_REGEX.test(newUser.password)) {
			res.status(400).send('password property is invalid.');
		} else if (!newUser.membership || typeof newUser.membership !== 'string' || newUser.membership.length <= 0) {
			res.status(400).send('membership property is invalid.');
		} else {
			async.parallel({
				userName: function(cb) {
					req.db.collection('users').find({
						userName: newUser.userName
					}).toArray(function(err, results) {
						if (err) {
							cb(err);
						} else {
							cb(undefined, !results || results.length === 0);
						}
					});
				},
				email: function(cb) {
					req.db.collection('users').find({
						email: newUser.email
					}).toArray(function(err, results) {
						if (err) {
							cb(err);
						} else {
							cb(undefined, !results || results.length === 0);
						}
					});
				},
				membership: function(cb) {
					req.db.collection('users').find({
						membership: newUser.membership
					}).toArray(function(err, results) {
						if (err) {
							cb(err);
						} else {
							cb(undefined, !results || results.length === 0);
						}
					});
				}
			}, function(err, results) {
				if (err) {
					logger.log('error', 'issue while registering user', err);
					res.status(200).json({
						'500': 'Internal server error'
					});
				} else {
					if (!results.userName) {
						res.status(200).json({
							'500': 'userName is already taken'
						});
					} else if (!results.email) {
						res.status(200).json({
							'500': 'email is already taken'
						});
					} else if (!results.membership) {
						res.status(200).json({
							'500': 'membership is already taken'
						});
					} else {
						// We're clear to register this user
						newUser.password = saltAndHash(newUser.password);
						// Insert the new user
						req.db.collection('users').save(newUser, function(err, createdUser) {
							if (err) {
								logger.log('error', 'could not register user', err);
								res.status(200).json({
									'500': 'Error saving new user'
								});
							} else {
								var strippedUser = {
									userName: createdUser.userName,
									picture: createdUser.picture,
									firstName: createdUser.firstName,
									lastName: createdUser.lastName
								};
                                // Ah, more nested callbacks.
                                acl.allow(createdUser.userName, 'members', function(err) {
                                    if (err) {
                                        res.status(200).json({
                                            '500' : 'Error saving new user'
                                        });
                                    }
                                });
								res.status(200).json({
									'200': strippedUser
								});
							}
						});
					}
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
				logger.log('error', err);
				return res.status(200).json({
					'500': 'Internal Passport error'
				}); // This may never be called, since it's an internal Passport error
			} else {
				req.logIn(user, function(err) {
					if (err) {
                        logger.log('error', 'Login error: ' + err);
						return res.status(200).json({
							'401': 'Unspecified login error'
						});
					} else {
						return res.status(200).json({
							'200': {
								userName: user[0].userName,
								firstName: user[0].firstName,
								lastName: user[0].lastName,
								paid: user[0].paid || false,
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

	app.post('/members/forgotPassword', function(req, res) {
		var userName = req.body.userName;
		var email = req.body.email;

		var query = {};
		if (typeof userName === 'string') {
			query.userName = userName;
		} else if (typeof email === 'string') {
			query.email = email;
		} else {
			res.status(200).send({
				'400': 'either userName or email parameter is required'
			});
			return;
		}

		req.db.collection('users').find(query).toArray(function(err, users) {
			if (err || users.length < 1) {
				if (err) logger.log('error', err);
				res.status(200).json({
					'200': {}
				});
			} else {
				var user = users[0];
				// Check if the user has an email
				if (!user.email) {
					res.status(200).json({
						'200': {}
					});
					return;
				}
				// Generate a token
				var token = passwordResetToken();
				// Set the password reset token
				req.db.collection('users').update({
					userName: user.userName
				}, {
					$set: {
						passwordResetToken: token
					}
				}, {
					multi: false
				}, function(err) {
					if (err) {
						res.status(200).send({
							'500': 'There was an internal error while setting the password reset token'
						});
						logger.log('error', 'could not set the password reset token', err);
					} else {
						// Send an email with this information
						emailUtil.sendForgotPassword(user.email, user.firstName + ' ' + user.lastName, token);
						// Send response back
						res.status(200).send({
							'200': {}
						});
						// Kill this token after an hour
						setTimeout(function() {
							logger.info('Killing password reset token ' + token);
							req.db.collection('users').update({
								userName: user.userName
							}, {
								$unset: {
									passwordResetToken: ''
								}
							}, {
								multi: false
							}, function() {});
						}, 3600000);
					}
				});
			}
		});
	});

	/*
	 * Resets the password of the currently logged in user. If there is nobody
	 * logged in, or if the password is ill-formatted, then this call fails.
	 */
	app.post('/members/resetPassword', function(req, res) {
		var newPassword = req.body.newPassword;
		var passwordResetToken = req.body.passwordResetToken;
		if (typeof newPassword !== 'string' || !PASSWORD_REGEX.test(newPassword)) {
			res.status(200).send({
				'400': 'newPassword parameter was invalid'
			});
		} else if (typeof passwordResetToken !== 'string') {
			res.status(200).send({
				'400': 'passwordResetToken parameter was invalid'
			});
		} else {
			var saltedNewPassword = saltAndHash(newPassword);
			// Set the password in the database then update the session
			req.db.collection('users').update({
				passwordResetToken: passwordResetToken
			}, {
				$set: {
					password: saltedNewPassword
				},
				$unset: {
					passwordResetToken: ''
				}
			}, {
				multi: false
			}, function(err) {
				if (err) {
					res.status(200).send({
						'500': 'There was an internal error while updating the user password'
					});
					logger.log('error', 'could not reset password', err);
				} else {
					res.status(200).send({
						'200': 'password was successfully reset'
					});
				}
			});
		}
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
			res.status(200).send({
				'200': {
					userName: req.user[0].userName,
                    _id: req.user[0]._id,
					firstName: req.user[0].firstName,
					lastName: req.user[0].lastName,
					paid: req.user[0].paid || false,
					picture: req.user[0].picture,
					bio: req.user[0].bio,
					github: req.user[0].github,
					twitter: req.user[0].twitter,
					facebook: req.user[0].facebook,
					email: req.user[0].email,
					major: req.user[0].major,
					studentLevel: req.user[0].studentLevel,
					membership: req.user[0].membership
				}
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
		}, {
			firstName: 1,
			lastName: 1,
			picture: 1,
			title: 1,
			bio: 1
		}).toArray(function(err, officers) {
			if (err) {
				logger.log('error', err);
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
