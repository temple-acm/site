var logger = require("../util/log");

module.exports.bootstrap = function(_port) {
    var PeerServer = require("peer").PeerServer;
    var server = new PeerServer({
        port: _port || 3333
    });
    logger.info("Peer.js server has started on port '%d'", _port || 3333);
}