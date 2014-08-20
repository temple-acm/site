var path = require('path'),
	fs = require('fs');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var async = require('async');


var LIVERELOAD_MIXIN = '<script src="http://localhost:35729/livereload.js"></script>';
var LIVERELOAD_PLACEHOLDER = "<!-- Livereload -->";
var INDEX_PAGE_PATH = path.join(__dirname, 'public', 'pages', 'index.html');

// --------------------- HELPER THINGS! --------------------------------------//


// Passport authentication stuffs
passport.use(new LocalStrategy({
        usernameField: 'userName'
    },
    function(username, password, done) {
        req.db.find({ userName: userName }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    req.db.find({ id: id }, function(err, user) {
        done(err, user);
    });
});

function saltAndHash(password) {
    var SALT_FACTOR = 5;

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        bcrypt.hash(password, salt, null, function(err, hash) {
            return hash;
        });
    });
};

// --------------------- ROUTES AND THINGS! ----------------------------------//

exports.route = function(app) {
// --------------------- SETTINGS AND THINGS! --------------------------------//
    // TODO: Change this for prod!
    app.use(session({secret: 'THIS SHOULD NOT BE USED IN PROD'}));
    app.use(passport.initialize());
    app.use(passport.session());

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

    // Login stuff
    app.post('/members/login', function(req, res) {
        var userName = req.param("userName");
        var testSaltedPassword = saltAndHash(req.param("Password"));
        if (!userName) {
            res.send(400, "Username parameter required.");
        } else {
            // Here begins the massive amount of to-be-duplicated code
            req.db.collection('user').find ({
                userName: userName
            }).toArray(function(err, results) {
                if (err) {
                    res.json(500, err);
                } else {
                    if (!results || results.length === 0) {
                        res.json(500, err);
                    } else {
                        var dbPassword = results[0].password;
                        bcrypt.compare(dbPassword, testSaltedPassword, function(err, isMatch) {
                            if (err) {
                                res.json(401, "Logon failed");
                            } else {
                                //TODO: figure out what needs to be sent back
                                res.json(200); // Logon successful
                            }
                        });
                    }
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
