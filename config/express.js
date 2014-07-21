/**
 * Module dependencies.
 */
var express = require('express'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('errorhandler'),
	favicon = require('serve-favicon'),
	morgan  = require('morgan'),
	mongoStore = require('connect-mongo')(session),
    busboy = require('connect-busboy'),
    helpers = require('view-helpers'),
	path = require('path'),
    config = require('./config');

module.exports = function (app, db) {
    app.set('showStackError', true);
    //Setting the fav icon and static folder
    app.use(favicon(path.join(__dirname, '..', 'public', 'img', 'icons', 'favicon.ico')));
    app.use(morgan('dev'));
    // Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        // Don't use the logger - period
        // app.use(express.logger('dev'));
    }
    //Set views path, template engine and default layout
    app.set('views', config.root + '/backend/pages');
    app.set('view engine', 'jade');
    //Enable jsonp
    app.enable("jsonp callback");
	//cookieParser should be above session
	app.use(cookieParser());
	// body parsing should be above methodOverride
	app.use(bodyParser.json());
	// Handles url variables
	app.use(bodyParser.urlencoded());
	// Handles route handler stacking
	app.use(methodOverride());
	// Busboy enables file upload etc.
	app.use(busboy());
	// Pathing for all the static files
	app.use("/static/js", express.static(config.root + "/public/js"));
	app.use("/static/css", express.static(config.root + "/public/css"));
	app.use("/static/fonts", express.static(config.root + "/public/fonts"));
	app.use("/static/img", express.static(config.root + "/public/img"));
	app.use("/static/lib", express.static(config.root + "/public/lib"));
	app.use("/static/views", express.static(config.root + "/public/views"));
	// express/mongo session storage
	app.use(session({
		secret: 'MEAN',
		store: new mongoStore({
			db: db.connection.db,
			collection: 'sessions'
		})
	}));
	//dynamic helpers
	app.use(helpers(config.app.name));
	//routes should be at the last
	app.use(errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
	//Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	// app.use(function (err, req, res, next) {
		//Treat as 404
	//	if (~err.message.indexOf('not found')) return next();
		//Log it
//		console.error(err.stack);
		//Error page
//		res.status(500).render('500', {
//			error: err.stack
//		});
//	});
	//Assume 404 since no middleware responded
//	app.use(function (req, res, next) {
//		res.status(404).render('404', {
//			url: req.originalUrl,
//			error: 'Not found'
//		});
//	});
};
