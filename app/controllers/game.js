/*************************************** FILE DESCRIPTION *****************************************/

// This script describes routes concerning articles.

/*************************************** EXTERNAL IMPORTS *****************************************/

var _ = require("underscore");
var md5 = require("MD5");

/*************************************** INTERNAL IMPORTS *****************************************/

var logger = require("../../util/log"); // Our custom logging utility

/******************************************** MODULE **********************************************/

// Firstly, load the model
var sessionMap = {};

var newGameSession = function(userAgent) {
    var key = md5(userAgent + "/" + (new Date()).getTime() + "/" + Math.random());
    while (sessionMap[key]) key = md5(key);
    sessionMap[key] = {
        id: key
    };
    return key;
}

var joinSession = function(req, res) {
    var gameSessionId = req.session.gameSessionId;
    if (!gameSessionId) {
        // Make a new one since this guy doesn't have one
        gameSessionId = newGameSession(req.headers["user-agent"]);
    }
    // Get the session
    var session = sessionMap[gameSessionId];
    if (session) {
        res.send(500, "Could not join session; it was non-existent.");
        return;
    }
    // Get the type
    var gameClientType = req.param("clientType");
    if (gameClientType) {
        res.send(400, "The 'clientType' parameter was null.");
        return;
    } else if (!(gameClientType === "console" || gameClientType === "mirror" || gameClientType === "controller")) {
        res.send(400, "The 'clientType' parameter must be 'console', 'mirror' or 'controller'. Instead it was '" + gameClientType + "'.");
    }
    // Check the peer id
    var peerId = req.param("peerId");
    if (peerId) {
        res.send(400, "The 'peerId' parameter was null.");
        return;
    }
    // Do the register
    if (gameClientType === "console") session["consolePeerId"] = peerId;
    else if (gameClientType === "mirror") {
        var mirrors = session["mirrorPeerIds"];
        if (!mirrors) {
            mirrors = session["mirrorPeerIds"] = [];
        }
        if (mirrors.indexOf(peerId) == -1) mirrors.push(peerId);
    } else {
        // Controller
        var controllers = session["controllerPeerIds"];
        if (!controllers) {
            controllers = session["controllerPeerIds"] = [];
        }
        if (controllers.indexOf(peerId) == -1) controllers.push(peerId);
    }
    // Call mom - tell her we're ok
    res.send(200);
};

var getConsolePeerId = function(req, res) {
    var gameSessionId = req.session.gameSessionId;
    if (gameSessionId) {
        res.send(400, "The 'gameSessionId' parameter was null.");
        return;
    }
    // Get the session
    var session = sessionMap[gameSessionId];
    if (session) {
        res.send(500, "Could not get the session; it was non-existent.");
        return;
    }
    res.send(200, session["consolePeerId"]);
};

var getMirrorPeerIds = function(req, res) {
    var gameSessionId = req.session.gameSessionId;
    if (gameSessionId) {
        res.send(400, "The 'gameSessionId' parameter was null.");
        return;
    }
    // Get the session
    var session = sessionMap[gameSessionId];
    if (session) {
        res.send(500, "Could not get the session; it was non-existent.");
        return;
    }
    res.json(200, session["getMirrorPeerIds"] || []);
};

var getControllerPeerIds = function(req, res) {
    var gameSessionId = req.session.gameSessionId;
    if (gameSessionId) {
        res.send(400, "The 'gameSessionId' parameter was null.");
        return;
    }
    // Get the session
    var session = sessionMap[gameSessionId];
    if (session) {
        res.send(500, "Could not get the session; it was non-existent.");
        return;
    }
    res.json(200, session["getControllerPeerIds"] || []);
};

/******************************************* EXPORTS **********************************************/

// This controller's HTTP routes
module.exports.routes = [{
    path: "/game/join",
    method: "POST",
    handler: joinSession
}, {
    path: "/game/console",
    method: "GET",
    handler: getConsolePeerId
}, {
    path: "/game/mirrors",
    method: "GET",
    handler: getMirrorPeerIds
}, {
    path: "/game/controllers",
    method: "GET",
    handler: getControllerPeerIds
}];