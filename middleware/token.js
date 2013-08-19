var _ = require('underscore');
module.exports = function subway() {
	return function subway(req, res, next) {
		function ejson(data) {
			var code = 500; // default error code.
			var data = format.apply(null, [data, 500]);
			res.json(data);
		}
		// If not have token, we only allow you access /token/register/:md5 path.
		var regexp = new RegExp("\/token\/register\/");
		if (regexp.test(req.path)) {
			next();
			return;
		}
		if (_.isUndefined(req.query.token)) {
			if (res.ejson) {
				res.ejson("you are not allowed access our system");
			}
			else {
				ejson("you are not allowed access our system");
			}
		}
		else {
			var token = req.query.token;
			require('../lib/token')().loadToken(req.query.token, function (err, token) {
				if (err) {
					ejson("you are not allowed access our system");
				}
				else {
					next();
				}
			});
		}
	}
}