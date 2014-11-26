/****************************************** DESCRIPTION *******************************************/

// This is the primary entry point for the Node.js server. All functionality must be introduced in
// some capacity within this file.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require('fs'); // Node.js internal filesystem module
var path = require('path'); // Node.js internal pathing utility module
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var express = require('express'),
    morgan = require('morgan'), // Logger
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    ErrorHandler = require('errorhandler'),
    favicon = require('serve-favicon'),
    MongoStore = require('connect-mongo')(session),
    busboy = require('connect-busboy');
var passport = require('passport');
/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require('./util/log'); // Our custom logging utility
var routes = require('./routes');

/******************************************** MODULE **********************************************/

// Ensure we have the env variables we need
if (!process.env.TUACM_LOGPATH) {
    console.log('TUACM_LOGPATH is invalid; now exiting.');
    process.exit(1);
}
if (!process.env.TUACM_MONGO_URL) {
    console.log('TUACM_MONGO_URL is invalid; now exiting.');
    process.exit(1);
}
if (!process.env.TUACM_GMAIL_EMAIL) {
    console.log('TUACM_GMAIL_EMAIL is invalid; now exiting.');
    process.exit(1);
}
if (!process.env.TUACM_GMAIL_PASSWORD) {
    console.log('TUACM_GMAIL_PASSWORD is invalid; now exiting.');
    process.exit(1);
}
if (!process.env.TUACM_SESSION_SECRET) {
    console.log('TUACM_SESSION_SECRET is invalid; now exiting.');
    process.exit(1);
}
if (!process.env.TUACM_PORT || typeof parseInt(process.env.TUACM_PORT) !== 'number') {
    console.log('TUACM_PORT is invalid; now exiting.');
    process.exit(1);
}

// Define the express app
var app = express();
var mongoDb = undefined;
app.use(favicon(path.join(__dirname, 'public', 'img', 'icons', 'favicon.ico')));
app.use(morgan('dev', {
    stream: fs.createWriteStream(path.join(process.env.TUACM_LOGPATH, 'access.log'), {
        flags: 'a',
        encoding: 'utf8'
    })
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(busboy());
// Adds mongo to every request
app.use(function(req, res, next) {
    req.db = mongoDb;
    next();
});
// Connects to mongo and sets up session shit
logger.info('Waiting for mongo connection...');
MongoClient.connect(process.env.TUACM_MONGO_URL, function(err, db) {
    if (err) logger.error('Could not connect to mongo', err);
    else {
        // Session stuff
        mongoDb = db;
        app.use(session({
            secret: process.env.TUACM_SESSION_SECRET,
            // TODO restrict db creds to env vars
            store: new MongoStore({
                db: mongoDb,
                collection: 'sessions'
            }),
            resave: true,
            saveUninitialized: true
        }));
        // Bootstrap the application routes
        routes.setup(app);
        var port = parseInt(process.env.TUACM_PORT);
        http.createServer(app).listen(port, '0.0.0.0');
        logger.info('HTTP server started on port 0.0.0.0:%d.', port);
    }
});
app.use(ErrorHandler({
    dumpExceptions: true,
    showStack: true
}));
// File server endpoints for static assets
app.use('/static/dist', express.static(path.join(__dirname, 'public', 'dist')));
app.use('/static/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/static/vendor', express.static(path.join(__dirname, 'public', 'vendor')));
// Start the app by listening on <port>
// Create an HTTPS service

/******************************************* EXPORTS **********************************************/

// Expose the express application
exports = module.exports = app;
