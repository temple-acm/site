var path = require('path'),
    fs = require('fs');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var async = require('async');
var request = require('request');
var FeedParser = require('feedparser');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var entities = require('entities');

var INDEX_PAGE_PATH = path.join(__dirname, 'public', 'pages', 'index.html');
var CALENDAR_RSS_URL = 'https://www.google.com/calendar/feeds/tuacm%40temple.edu/public/basic?orderby=starttime&sortorder=ascending&start-min={{isoDateTime}}';
var UPCOMING_EVENTS_LIMIT = 3;

// --------------------- HELPER THINGS! --------------------------------------//

// Passport authentication stuffs
passport.use('local', new LocalStrategy({
        usernameField: 'userName',
        passReqToCallback: true
    },
    function(req, username, password, done) {
        req.db.collection('users').find({
            userName: username
        }).toArray(function(err, user) {
            if (err) {
                return done(null, false, err);
            }
            if (!user || user.length === 0) {
                return done(null, false, {
                    message: "Invalid credentials"
                });
            }
            var isMatch = bcrypt.compareSync(password, user[0].password);
            if (!isMatch) {
                return done(null, false, {
                    message: "Invalid credentials"
                });
            } else {
                return done(null, user);
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user[0]['_id'].id);
});

passport.deserializeUser(function(req, id, done) {
    userObjectID = new ObjectID(id);
    req.db.collection('users').find({
        _id: userObjectID
    }).toArray(function(err, user) {
        done(err, user);
    });
});

// Helper function to create password hashes
function saltAndHash(password) {
    var SALT_FACTOR = 10;
    var salt = bcrypt.genSaltSync(SALT_FACTOR);
    return bcrypt.hashSync(password, salt);
};

// Date helper for google calendar
function padDigit(n) {
    return (n < 10) ? ('0' + n) : n;
}

function toISODateString(d) {
    return d.getUTCFullYear() + '-' + padDigit(d.getUTCMonth() + 1) + '-' + padDigit(d.getUTCDate()) + 'T' + padDigit(d.getUTCHours()) + ':' + padDigit(d.getUTCMinutes()) + ':' + padDigit(d.getUTCSeconds()) + 'Z';
}


exports.route = function(app) {
    // --------------------- SESSIONS AND THINGS! --------------------------------//
    app.use(passport.initialize());
    app.use(passport.session());

    // --------------------- ROUTES AND THINGS! ----------------------------------//

    // Main page route
    app.get('/', function(req, res) {
        res.sendfile(INDEX_PAGE_PATH);
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
                if (err) {
                    res.json(500, err);
                } else {
                    res.send(200, (!results || results.length === 0));
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

        if (!newUser.userName && newUser.userName.length > 0) res.send(500, 'userName property is invalid.');
        else if (!newUser.firstName && newUser.firstName.length > 0) res.send(500, 'firstName property is invalid.');
        else if (!newUser.lastName && newUser.lastName.length > 0) res.send(500, 'lastName property is invalid.');
        else if (!newUser.email && newUser.email.length > 0 && /^.*@.*$/i.test(newUser.email)) res.send(500, 'email property is invalid.');
        else if (!newUser.bio && newUser.bio.length > 0) res.send(500, 'bio property is invalid.');
        else if (!newUser.major && newUser.major.length > 0) res.send(500, 'major property is invalid.');
        else if (!newUser.studentLevel && newUser.studentLevel.length > 0) res.send(500, 'studentLevel property is invalid.');
        else if (!newUser.password && /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ig.test(newUser.password)) res.send(500, 'password property is invalid.');
        else {
            // TODO double check the user name
            // TODO double check the email
            // Salt the password before it goes into the db
            newUser.password = saltAndHash(newUser.password);
            // Insert the new user
            req.db.collection('users').save(newUser, function(err, createdUser) {
                if (err) {
                    res.json(200, {
                        "500": err
                    });
                } else {
                    res.json(200, {
                        "200": createdUser
                    });
                }
            });
        }
    });
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
    app.post('/members/login',
        function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    return res.json(200, {
                        "500": "Internal Passport error"
                    }); // This may never be called, since it's an internal Passport error
                } else {
                    req.logIn(user, function(err) {
                        if (err) {
                            return res.json(200, {
                                "401": "Unspecified login error"
                            });
                        }
                        return res.json(200, {
                            "200": {
                                userName: user[0].userName,
                                firstName: user[0].firstName,
                                lastName: user[0].lastName,
                                picture: user[0].picture
                            }
                        }); // We can add more fields here if needed
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
        res.send(200, "true");
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
            res.send(200, {
                "200": loggedInUser
            });
        } else {
            res.send(200, {
                "401": "false"
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
        }).toArray(function(err, officers) {
            if (err) {
                res.json(200, {
                    "500": err
                });
            } else {
                res.json(200, {
                    "200": officers
                });
            }
        });
    });

    /*
     * This endpoint retrieves ACM Google Calendar data from the publically-available
     * XML feed. It then collects the next (read: upcoming) three entries and sends
     * them back as an array of objects.
     *
     * Output:
     *  Success:
     *      status: 200
     *      data: { "200" : events } where "events" is an array of event objects.
     *  Error:
     *      If XML request fails:
     *          status: 200
     *          data: { "500" : err } where "err" is the error message returned
     */
    app.get('/events/calendar', function(req, res) {
        var parser = new FeedParser(),
            rssEntries = [],
            events = [];
        // Grab the calendar data
        request(CALENDAR_RSS_URL.replace('{{isoDateTime}}', toISODateString((new Date()))))
            .on('response', function() {
                // Pipe the calendar data into the feed parser
                this.pipe(parser);
            })
            .on('error', function(err) {
                res.json(200, {
                    "500": err
                });
            });
        // Called when the parser grabs an RSS entry
        parser.on('readable', function() {
            var rssEntry;
            while (rssEntry = this.read()) {
                // Cache the RSS entries
                if (rssEntries.length <= UPCOMING_EVENTS_LIMIT) {
                    rssEntries.push(rssEntry);
                }
            }
        });
        // Called when we reach the end of the RSS stream
        parser.on('end', function() {
            for (var i = 0; i < UPCOMING_EVENTS_LIMIT; i++) {
                var data, when, where, desc, status, evt;
                // Parse the rss entry
                evt = {
                    title: rssEntries[i].title,
                    link: rssEntries[i].link
                };
                // 2 fields are hidden in the "desciption" rss field
                data = rssEntries[i].description.split('\n');
                for (var ii = 0; ii < data.length; ii++) {
                    // Look for description
                    desc = data[ii].match(/Event Description: (.*)/);
                    if (desc) {
                        evt.description = desc[1];
                    }
                    // Look for status
                    status = data[ii].match(/Event Status: (.*)/);
                    if (status) {
                        evt.status = status[1];
                    }
                }
                // 2 fields are hidden in the "summary" rss field
                data = rssEntries[i].summary.split('\n');
                for (var ii = 0; ii < data.length; ii++) {
                    when = data[ii].match(/^(<br>)?When: (.*)$/);
                    where = data[ii].match(/^(<br>)?Where: (.*)$/);
                    // Actual HTML escaping fix
                    if (when) {
                        evt.when = entities.decodeHTML(when[2]);
                    }
                    if (where) {
                        evt.where = entities.decodeHTML(where[2]);
                    }
                }
                // Put the events in a list
                events.push(evt);
            }
            // Return the list when we're done
            res.json(200, {
                "200": events
            });
        });
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
    app.get('/officers', function(req, res) {
        res.redirect('/#/officers');
    });
};