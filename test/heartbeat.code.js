function heartbeatCheck(port, okCallback, errCallback) {
	if (port) {
		var options = {
			port: port,
			host: "127.0.0.1",
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

// heartbeat check backend webservice per 1 mins.
setInterval(function () {
	_.each(module.exports.ports().split(" "), function (port) {
		heartbeatCheck(port, function () {
			//TODO: If it is alive, we put this backend at stack.
		}, function () {
			// If error happend, we restart this server
			var pid = require('fs').readFileSync("." + port + ".pid");
			//process.kill(pid, "SIGINT");
		});
	});
}, 1 * 1000);