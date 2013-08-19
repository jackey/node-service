// This middleware is clean output field data to make it super light

var common = require("../lib/common"),
	translate = require('../lib/translate'),
	_ = require('underscore');

function cleanModel(model, data) {
	if (!model) {
		return data;
	}
	var tmpData = {};
	_.each(model, function (key) {
		if (!_.isUndefined(data[key])) {
			if (key == "pid") {
				//console.log(data);
			}
			tmpData[key] = data[key];
		}
	});

	// Append object or array that we missed from defined in model.
	_.each(data, function (v, k) {
		if (_.isArray(v)) {
			_.each(v, function (vv, index) {
				var modelVV = getModelFromData(vv);
				var cleanedData = cleanModel(modelVV, vv);
				v[index] = cleanedData;
			});
			tmpData[k] = v;
		}
		// Date is object. but shouldn't process it .
		else if ((_.isObject(v) && !_.isDate(v))) {
			var cleanedObject = cleanModel(getModelFromData(v), v);
			tmpData[k] = v;
		}
	});
	return tmpData;
}

function getModelFromData(data) {
	var tablename = translate("none", "cn").whichIsTableName(data);
	var models = require('../lib/model');
	if (_.isUndefined(models[tablename])) {
		return false;
	}
	return models[tablename];
}

module.exports = function () {
	return function scavenger(req, res, next) {
		
		var preJSON = res.json;
		res.json = function () {
			var arguments = Array.prototype.slice.call(arguments);
			var resdata = _.first(arguments);
			if (resdata['status'] != 0) {
				var data = resdata['data'];
				_.isArray(data) && _.each(data, function(d, index) {
					var cleanData = cleanModel(getModelFromData(d), d);
					resdata["data"][index] = cleanData;
				});
				if (!_.isArray(data) && !_.isFunction() && _.isObject(data)) {
					var cleanData = cleanModel(getModelFromData(data), data);
					resdata["data"] = cleanData;
				}
			}
			return preJSON.apply(this, arguments);
		}
		next();
	}
}