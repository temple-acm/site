/****************************************** DESCRIPTION *******************************************/

// This is the primary entry point for the Node.js server. All functionality must be introduced in
// some capacity within this file.

/*************************************** EXTERNAL IMPORTS *****************************************/

var fs = require('fs'); // Node.js internal filesystem module
var path = require('path'); // Node.js internal pathing utility module
var https = require('https');
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

// Load configurations
var httpsOpts = {
    cert: fs.readFileSync(process.env.TUACM_SSL_CERT || 'ssl/cert.crt'),
    key: fs.readFileSync(process.env.TUACM_SSL_KEY || 'ssl/key.pem')
};
// if test env, load example file
var env = process.env.NODE_ENV; // Defaults to dev. env.
// Define the express app
var app = express();
var mongoDb = undefined;
app.use(favicon(path.join(__dirname, 'public', 'img', 'icons', 'favicon.ico')));
app.use(morgan('dev', {
    stream: fs.createWriteStream(path.join('util', 'logs', 'access.log'), {
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
MongoClient.connect(process.env.TUACM_MONGO_URL || 'mongodb://tuacm:tuacm@kahana.mongohq.com:10045/tuacm', function(err, db) {
    if (err) throw err;
    // Session stuff
    mongoDb = db;
    app.use(session({
        secret: (process.env.TUACM_SESSION_SECRET || 'MEAN'),
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
});
app.use(ErrorHandler({
    dumpExceptions: true,
    showStack: true
}));
// File server endpoints for static assets
app.use('/static/dist', express.static(path.join(__dirname, 'public', 'dist')));
app.use('/static/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/static/partials', express.static(path.join(__dirname, 'public', 'partials')));
app.use('/static/vendor', express.static(path.join(__dirname, 'public', 'vendor')));
// Start the app by listening on <port>
var port = process.env.TUACM_PORT || 3000;
// Create an HTTPS service
https.createServer(httpsOpts, app).listen(port, '0.0.0.0');
logger.info('HTTPS server started on port 0.0.0.0:%d.', port);

/******************************************* EXPORTS **********************************************/

// Expose the express application
exports = module.exports = app;