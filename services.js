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
        req.db.find({
            userName: userName
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    req.db.find({
        id: id
    }, function(err, user) {
        done(err, user);
    });
});

function saltAndHash(password) {
    console.log("LOG OUTPUT: Now hashing/salting password " + password);
    var SALT_FACTOR = 10;
    var salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
};


// --------------------- ROUTES AND THINGS! ----------------------------------//

exports.route = function(app) {
    // --------------------- SETTINGS AND THINGS! --------------------------------//
    // TODO: Change this for prod!
    app.use(session({
        secret: 'THIS SHOULD NOT BE USED IN PROD'
    }));
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
            req.db.collection('users').find({
                userName: userName
            }).toArray(function(err, results) {
                console.log(arguments);
                if (err) {
                    res.json(500, err);
                } else {
                    res.send(200, (!results || results.length === 0));
                }
            });
        }
    });
    // Check if a user name is free
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
        newUser.paid = false;

        if (!newUser.userName && newUser.userName.length > 0) res.send(500, 'userName property was invalid.');
        else if (!newUser.firstName && newUser.firstName.length > 0) res.send(500, 'firstName property was invalid.');
        else if (!newUser.lastName && newUser.lastName.length > 0) res.send(500, 'lastName property was invalid.');
        else if (!newUser.email && newUser.email.length > 0) res.send(500, 'email property was invalid.');
        else if (!newUser.bio && newUser.bio.length > 0) res.send(500, 'bio property was invalid.');
        else if (!newUser.major && newUser.major.length > 0) res.send(500, 'major property was invalid.');
        else if (!newUser.studentLevel && newUser.studentLevel.length > 0) res.send(500, 'studentLevel property was invalid.');
        else if (!newUser.password && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/ig.test(newUser.password)) res.send(500, 'password property was invalid.');
        else {
            // TODO double check the user name
            // TODO double check the email
            // Salt the password before it goes into the db
            newUser.password = saltAndHash(newUser.password);
            // Insert the new user
            req.db.collection('users').save(newUser, function(err, createdUser) {
                if (err) {
                    res.json(500, err);
                } else {
                    res.json(200, createdUser);
                }
            });
        }
    });
    // Callback we get from successful payment from Paypal
    var paypalCallback = function(req, res) {
        var userName = req.param('userName');
        req.db.collection('users').update({
            userName: userName
        }, {
            paid: true
        }, {}, function(err) {
            if (err) {
                console.log('Could not mark user "', userName, '" paid.', err);
            } else {
                console.log('User "', userName, '" was marked paid.');
            }
        });
    };
    app.get('/members/payments/callback/:userName', paypalCallback);
    app.post('/members/payments/callback/:userName', paypalCallback);

    // Login stuff
    app.post('/members/login', function(req, res) {
        var un = req.param("userName");
        var testSaltedPassword = saltAndHash(req.param("Password"));
        console.log("LOG OUTPUT: Recieved password is " + req.param('Password'));
        console.log("LOG OUTPUT: Recived username is " + req.param("userName"));
        console.log("LOG OUTPUT: Hashed password is " + testSaltedPassword);
        if (!un) {
            res.send(400, "Username parameter required.");
        } else {
            // Here begins the massive amount of to-be-duplicated code
            req.db.collection('user').find().toArray(function(err, results) {
                console.log(arguments);
                if (err) {
                    console.log("LOG OUTPUT: ToArray error");
                    res.json(500, err);
                } else {
                    if (!results || results.length === 0) {
                        console.log("LOG OUTPUT: No results returned");
                        res.json(500, results);
                    } else {
                        var dbPassword = results[0].password;
                        bcrypt.compare(dbPassword, testSaltedPassword, function(err, isMatch) {
                            if (err) {
                                console.log("LOG OUTPUT: Invalid credentials");
                                res.json(401, "Logon failed");
                            } else {
                                passport.authenticate('local', function(err, user, info) {
                                    if (err) {
                                        return next(err); //TODO: Testing
                                    }
                                    if (!user) {
                                        res.json(401, "Logon failed");
                                    }
                                    req.logIn(user, function(err) {
                                        if (err) {
                                            return next(err);
                                        }
                                        return res.redirect('/'); //TODO: give them a reason to log in
                                    });
                                })(req, res, next);
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