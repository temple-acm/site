/*************************************** FILE DESCRIPTION *****************************************/

// This script is the web socket server for the site.

/*************************************** EXTERNAL IMPORTS *****************************************/

var connect = require("connect"); // HTTP server wrapper
var socketIo = require("socket.io"); // Awesomest websocket library ever

/*************************************** INTERNAL IMPORTS *****************************************/

var config = require("./config.js"); // Server configuration script
var log = require("./log.js"); // For logging (info, warn, error)

/******************************************** SCRIPT **********************************************/

// Module Constants
const SOCKET_CONNECTION_ACKNOWLEDGEMENT = "ACK";

// The web socket server instance factory
var makeServer = function(expressInstance, sessionStore, handler) {
    var parseCookie = connect.utils.parseCookie; // Cookie decoder
    var io = socketIo.listen(expressInstance); // Start listening through the express instance
    // Set the io server log level
    io.configure(function() {
        io.set("log level", 0);
    });
    // Handle authorization handshake
    io.set("authorization", function(handshakeData, ack) {
        var cookies = parseCookie(handshakeData.headers.cookie);
        sessionStore.get(cookies["connect.sid"], function(err, sessionData) {
            handshakeData.session = sessionData || {};
            handshakeData.sid = cookies["connect.sid"] || null;
            ack(err, err ? false : true);
        });
    });
    // Handle websocket connection
    io.sockets.on("connection", function(client) {
        var user;
        // Get the UID of the user
        if (client.handshake.session.user) user = client.handshake.session.user.name;
        else user = "UID: " + (client.handshake.session.uid || "has no UID");
        // Join user specific channel, this is good so content is send across user tabs.
        client.join(client.handshake.sid);
        // Send acknowledgement back to the client
        client.send(SOCKET_CONNECTION_ACKNOWLEDGEMENT);
        // Handle actual messages from this guy
        client.on("message", function(msg) {
            if (handler || handler.onMessage)
                handler.onMessage(user, msg);
        });
        // Handle the end of the conversation
        client.on("disconnect", function() {
            log.info("A user '%s' has disconnected from the websocket server.", user);
        });
    });
    // Finally, handle the error case
    io.sockets.on("error", function() {
        log.error("An error occurred with user '%s' on the websocket server: %s", user, arguments);
    });
    // Return the socket server
    return io;
}

/******************************************* EXPORTS **********************************************/

module.exports.makeServer = makeServer;