module.exports = function logger() {
	return function logger(req, res, next) {
		try {
			var agent = req.get("User-Agent");
			var language = req.get("Accept-Language");
			var ip = req.connection.remoteAddress;
			var uri = req.path;
			var body = req.body;
			if (!body) {
				body = req.query;
			}
			//log it
			console.log('client: [' + ip + "] with language: [" + language + "] access: [" + uri + "] by agent: [" + agent + "]" + " params:" + JSON.stringify(body));
		}
		catch (e) {
			// ignore
		}

		next();
	}
}