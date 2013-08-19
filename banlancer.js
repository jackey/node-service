// Load banlance for subway.
// So webservice would be more stable.

var config = require("./config"),
	_ = require('underscore'),
	fs = require('fs'),
	http = require('http'),
	https = require('https'),
	proxy = require("http-proxy");

var backendStack = [];

module.exports = {
	ports: function () {
		var ports = "";
		_.each(config.banlancer, function (banlancer) {
			ports += " "+ banlancer["port"];
		});
		return ports;
	},
}

function heartbeatCheck(port, okCallback, errCallback) {
	if (port) {
		var options = {
			port: port,
			host: config.host,
			path: "/event/all"
		};
		request = http.get(options, function (res) {
			var body = "";
			res.on("data", function () {
				okCallback();
			});
			res.on("error", function () {
				console.log(arguments);
				errCallback();
			});
		});
		request.on("error", function () {
			errCallback();
		});
	}
}

// We also must support HTTPS at balancer server.
var httpsoptions = (function () {
	// Enable security connection
	if (_.isObject(config.ssl)) {
		return {key: fs.readFileSync(config.ssl.privatekey, "utf8"), cert: fs.readFileSync(config.ssl.certkey, "utf8")};
	}
	return false;
})();

// heartbeat check backend webservice per 1 mins.
setInterval(function () {
	_.each(module.exports.ports().split(" "), function (port) {
		heartbeatCheck(port, function () {
			//TODO: If it is alive, we put this backend at stack.
		}, function () {
			// If error happend, we restart this server
			var pid = require('fs').readFileSync("." + port + ".pid");
			process.kill(pid, "SIGINT");
		});
	});
}, 10 * 1000);

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

if (httpsoptions) {
	https.createServer(httpsoptions, function (req, res) {
		var i = ( Math.floor(Math.random() * 100 ) + 1) % config.banlancer.length;
		var backend = new proxy.HttpProxy({
			target: config.banlancer[i]
		});
		backend.proxyRequest(req, res);
	})
	.listen(config.ssl.port);
	console.log("Https load banlancer started at " + config.host + ":" + config.port);
}

proxy.createServer(function (req, res, proxy) {
	var i = ( Math.floor(Math.random() * 100 ) + 1) % config.banlancer.length;
	proxy.proxyRequest(req, res, config.banlancer[i]);
})
.listen(config.port, config.host);

console.log("Http load banlancer started at " + config.host + ":" + config.port);

// Listen SIGINT signal to exit from outsite.
process.on("SIGINT", function () {
	process.exit(0);
});