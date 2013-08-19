var _ = require('underscore'),
	common = require("../lib/common");
module.exports = function subway() {
	return function subway(req, res, next) {
		var locale = req.body.locale;
		if (!locale) {
			locale = req.query.locale;
		}
		// Default locale.
		if (!locale) {
			locale = "en";
		}
		if (_.keys(req.query).length > 0) {
			req.query.locale = locale;
		}
		else if (_.keys(req.body).length > 0) {
			req.body.locale = locale;
		}
		res.fjson = function () {
			var args = Array.prototype.slice.call(arguments, 0);
			if (!_.isUndefined(args[2])) {
				common.handleInternalError();
			}
			var data = format.apply(null, arguments);			
			res.json(data);
		};
		res.ejson = function (data, extra) {
			var code = 500; // default error code.
			var args = [data, code];
			var data = format.apply(null, args);
			var err = data.err.msg;
			if (err) {
				var tr = t(common.getParam(req, "locale"));
				if (tr) {
					data.err.msg = tr(err);
				}
			}
			// Some times, we want to append extra data when error happened.
			data["err"]["extra"] = extra;
			res.json(data);
		}
		res.tr = t(locale);
		// ignore register WS.
		if (req.path == "/user/register") {
			next();
			return;
		}
		var userUtil = require("../lib/user");
		var weiboid = req.query.weiboid;
		var name = _.isUndefined(req.query.name) ? undefined : req.query.name;
		var region = _.isUndefined(req.query.region) ? undefined : req.query.region;
		if (!weiboid) {
			weiboid = req.body.weiboid;
			name = req.body.name;
			region = req.body.region;
		}
		if (weiboid) {
			userUtil.insertUser({weiboid: weiboid, name: name, region: region}, function (err, user) {
				next();
			});
		}
		else {
			next();
		}
	}
}