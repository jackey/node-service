var express = require('express'),
	fs = require('fs'),
	crypto = require("crypto"),
	format = require('./lib/format_response'),
	mysqllib = require('mysql'),
	argv = require("optimist").argv,
	_ = require("underscore");

var app = express();

var config = require("./config.js");
_.extend({
	port: 3000,
	host: "127.0.0.1"
}, config);

// set mysql/format as global variable 
global.mysql = mysqllib.createPool(config.mysql);
global.format = format;
global.cwd = process.cwd();
global.t = require("./lib/translate")("stores", "cn").t;
global.subway = {
	config :config
};

if (argv.port) {
	global.subway.config.port = argv.port;
}

// Enable security connection
if (_.isObject(config.ssl)) {
	var ssl = config.ssl
	var privateKey = fs.readFileSync(ssl.privatekey, "utf8");
	var certKey = fs.readFileSync(ssl.certkey, "utf8");
	var credentials = {key: privateKey, cert: certKey};
}

app.use(express.compress({
	filter: function (req, res) {
		return /json|text|javascript/.test(res.getHeader('Content-Type'));
	}
}));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: subway.config.fileupload.uploadDir}));
app.use(express.methodOverride());
app.use(express.query());
app.use(express.static(__dirname + "/" +subway.config.staticDir));

// Load middleware first 
_.each(config.middleware, function (name) {
	// load middleware that from express

	if (fs.existsSync("./middleware/" + name + ".js")) {
		var middleware = require("./middleware/" + name + ".js");
		app.use(middleware());
	}
	else {
		try {
			var middleware = require(name);
			app.use(middleware());
		}
		catch(e) {
			//ignore
		}
	}
});

// Enable cleaner
if (config.scavenger) {
	app.use(require("./middleware/scavenger")());
}

app.use(app.router);

// Load router
fs.readdir("./router", function (err, files) {
	// We only support GET/POST method for now
	_.each(files, function (file) {
		var router = require("./router/" + file);
		// GET
		_.each(router.get(), function (cb, path) {
			app.get(path, cb);
		});
		// POST
		_.each(router.post(), function (cb, path) {
			app.post(path, cb);
		});
	});
});

// 404/403 router handler
app.use(function (req, res, next) {
	res.status(404);
	res.json(format("not found router", 404));
});

// we set front page as app level
app.get("/", function (req, res) {
	res.json(format("welcome subway"));
});
 
// Export start function.
module.start = function () {
	// We don't need use HTTPS at backend server now.
	if (credentials && false) {
		require('http').createServer(app).listen(config.port, config.host);
		require('https').createServer(credentials, app).listen(config.ssl.port, config.host);
	}
	else {
		// Start our node server.
		app.listen(config.port, config.host);
	}

	console.log('App listen at ' + config.host + ":" + config.port);
	if (credentials) {
		console.log("Https start at " + config.host + ":" + config.ssl.port);
	}
}

// Listen SIGINT signal to exit from outsite.
process.on("SIGINT", function () {
	console.log('Exit');
	process.exit(0);
});

// Write pid number into .pid
// So that we can use outside moniter and keep it alive
fs.open("."+config.port+".pid", "w+", function (err, fd) {
	if (err) {
		process.exit(0);
	}
	else {
		fs.write(fd, process.pid);
	}
});

// Cron Job for close connection
setInterval(function () {
	var connections = mysql._allConnections;
	if (!connections) {
		return;
	}
	_.each(connections, function (connection) {
		connection._realEnd();
	});
},1000 * 10);

// If not required as module, we run start() function 
// to start server.
if (!module.parent) {
	module.start();
}