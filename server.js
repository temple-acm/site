var express = require('express');
var http = require('http');
var QRCode = require('qrcode-npm');
var md5 = require('MD5');
var path = require('path');

var app = express();
app.engine('html', require('ejs').renderFile);

const SERVER_ADDR = 'localhost:7373'

app.use(express.cookieParser());
app.use(express.session({
    secret: 'secret_key',
    store: express.session.MemoryStore({
        reapInterval: 60000 * 10
    })
}));
app.use(express.bodyParser());

app.get('/generateqr', function(req, res){
	var gameId = md5('gId' + (new Date()).getTime() + Math.floor((Math.random() * 100) + 1));
	var qr = qrcode(4, 'M');
	qr.addData(app.get('host') + '/game/' + gameId);
	qr.make();
	res.send(200, qr.createImgTag());
});

app.get('/game/:gameId', function(req, res){
	var ua = req.header('user-agent');
    if(/mobile/i.test(ua)) {
		//render controls
		res.render(path.join(__dirname, 'controller', 'index.html'));
	} else {
        //render game
		res.render(path.join(__dirname, 'controller', 'index.html'));
    }
});

http.createServer(app).listen(7373);