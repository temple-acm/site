/*************************************** FILE DESCRIPTION *****************************************/

// This script is the mai nentry point of the server. Here configuration is applied and the server
// runtime is established.

/*************************************** EXTERNAL IMPORTS *****************************************/

var connect = require("connect"); // HTTP server wrapper; provides a bunch of stuff
var express = require("express"); // Wraps connect to make it more user friendly
var airbrake = require("airbrake"); // A fancy, and reliable error reporting service
var assetManager = require("connect-assetmanager"); // Asset manager for connect
var assetHandler = require("connect-assetmanager-handlers"); // Handlers for asset manager
var notifoMiddleware = require("connect-notifo"); // Connect middleware for emergency notifications
var redisMiddleware = require("connect-redis"); // Connect middleware for redis session storage

/*************************************** INTERNAL IMPORTS *****************************************/

var config = require("./config.js"); // Server configuration script
var log = require("./log.js"); // For logging (info, warn, error)
var websocket = require("./websocket.js"); // Websocket utility

/******************************************** SCRIPT **********************************************/

// Fetch the site configuration
var config = require("./config.js");
// Make the process title prettier
process.title = config.uri.replace(/http:\/\/(www)?/, "");
// Airbrake configuration - airbrake is a fancy error reporting service
var airbrakeClient;
if (config.airbrakeApiKey) {
	// We need their client to get the error reporting functionality
	airbrakeClient = airbrake.createClient(config.airbrakeApiKey);
}
// Protect the process from uncaught exceptions - very important
process.addListener("uncaughtException", function(err, stack) {
	log.error("Caught exception: " + err + "\n" + err.stack);
	console.log("\u0007"); // Terminal bell
	if (airbrakeClient) {
		// Throw a tantrum
		airbrakeClient.notify(err);
	}
});
// We need to storage sesisons somewhere, right?
var RedisStore = redisMiddleware(express);
var sessionStore = new RedisStore;
// Export and create the server at the same time
var app = module.exports = express.createServer();
app.listen(config.port, null);
// Setup socket.io server
var socketIo = websocket.makeServer(app, sessionStore);
var authentication = new require("./lib/authentication.js")(app, config);
// Setup groups for CSS / JS assets
var assetsSettings = {
	js: {
		route: /\/static\/js\/[a-z0-9]+\/.*\.js/, // describes any js route
		path: "./public/js/", // where we put the js
		dataType: "javascript",
		files: [
			"http://code.jquery.com/jquery-latest.js",
			config.uri + "/socket.io/socket.io.js", // special case since the socket.io module serves its own js 
			"jquery.client.js"
		],
		debug: true,
		postManipulate: {
			"^": [
				assetHandler.uglifyJsOptimize,
				function insertSocketIoPort(file, path, index, isLast, callback) {
					callback(file.replace(/.#socketIoPort#./, config.port));
				}
			]
		}
	},
	css: {
		route: /\/static\/css\/[a-z0-9]+\/.*\.css/, // describes any css route
		path: "./public/css/", // where we put the css
		dataType: "css",
		files: [
			"reset.css",
			"client.css"
		],
		debug: true,
		postManipulate: {
			"^": [
				assetHandler.fixVendorPrefixes, // fix things like -webkit, -moz etc.
				assetHandler.fixGradients, // enables use of top to bottom gradients cross browser
				assetHandler.replaceImageRefToBase64(__dirname + "/public"),
				assetHandler.yuiCssOptimize // optimizes css
			]
		}
	}
};
// Add auto reload for CSS/JS/templates when in development
app.configure("development", function() {
	assetsSettings.js.files.push("jquery.frontend-development.js");
	assetsSettings.css.files.push("frontend-development.css");
	[
		["js", "updatedContent"],
		["css", "updatedCss"]
	].forEach(function(group) {
		assetsSettings[group[0]].postManipulate["^"].push(function triggerUpdate(file, path, index, isLast, callback) {
			callback(file);
			dummyHelpers[group[1]]();
		});
	});
});
// Build the assets middle ware
var assetsMiddleware = assetManager(assetsSettings);
// View engine definition
app.configure(function() {
	app.set("view engine", "ejs");
	app.set("views", __dirname + "/views");
});
// Middleware block
app.configure(function() {
	// Parses bodies, obviously
	app.use(express.bodyParser());
	// Allows for browser session stuff
	app.use(express.cookieParser());
	// The assets manager we just spent ~100 lines defining
	app.use(assetsMiddleware);
	// The Redis-based session manager
	app.use(express.session({
		"store": sessionStore, // Store
		"secret": config.sessionSecret || "thisisabadidea" // Secret
	}));
	// Change express' auto logging to be less bad
	app.use(express.logger({
		format: ":response-time ms - :date - :req[x-real-ip] - :method :url :user-agent / :referrer"
	}));
	// Authentication middleware
	app.use(authentication.middleware.auth());
	// Other stuff
	app.use(authentication.middleware.normalizeUserData());
	app.use(express["static"](__dirname + "/public", {
		maxAge: 86400000 // sessions exactly one day long
	}));

	// Send notification to computer/phone @ visit. Good to use for specific events or low traffic sites.
	if (config.notifoAuth) {
		app.use(notifoMiddleware(config.notifoAuth, {
			'filter': function(req, res, callback) {
				callback(null, (!req.xhr && !(req.headers['x-real-ip'] || req.connection.remoteAddress).match(/192.168./)));
			},
			'format': function(req, res, callback) {
				callback(null, {
					'title': ':req[x-real-ip]/:remote-addr @ :req[host]',
					'message': ':response-time ms - :date - :req[x-real-ip]/:remote-addr - :method :user-agent / :referrer'
				});
			}
		}));
	}
});

// ENV based configuration

// Show all errors and keep search engines out using robots.txt
app.configure("development", function() {
	app.use(express.errorHandler({
		"dumpExceptions": true,
		"showStack": true
	}));
	app.all("/robots.txt", function(req, res) {
		res.send("User-agent: *\nDisallow: /", {
			"Content-Type": "text/plain"
		});
	});
});
// Suppress errors, allow all search engines
app.configure("production", function() {
	app.use(express.errorHandler());
	app.all("/robots.txt", function(req, res) {
		res.send("User-agent: *", {
			"Content-Type": "text/plain"
		});
	});
});

// Template helpers
app.dynamicHelpers({
	assetsCacheHashes: function(req, res) {
		return assetsMiddleware.cacheHashes;
	},
	session: function(req, res) {
		return req.session;
	}
});

// Error handling
app.error(function(err, req, res, next) {
	// Log the error to Airbreak if available, good for backtracking.
	console.log(err);
	if (airbrake) {
		airbrake.notify(err);
	}

	if (err instanceof NotFound) {
		res.render("errors/404");
	} else {
		res.render("errors/500");
	}
});
// Develop a UID for every visitor for socket.io
app.all("/", function(req, res) {
	// Set example session uid for use with socket.io.
	if (!req.session.uid) {
		req.session.uid = (0 | ((Math.random() * 1000000) + (new Date()).getTime()));
	}
	// This is a map of values to send the index
	res.locals({
		key: "value"
	});
	// Render dat index
	res.render("index");
});
// We're done - shout about it
log.info("Running in " + (process.env.NODE_ENV || "development") + " mode @ " + config.uri);