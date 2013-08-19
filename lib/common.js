var _ = require('underscore'),
  Step = require("step");

_.extend(exports, {
	handleInternalError: function (err) {
		// TODO
	},
	errorMsg: function () {
		//TODO:
	},
  getValue: function (obj, value) {
    if (_.isUndefined(value)) value = null;
    return _.isUndefined(obj) ? value : obj;
  },
  getTableFields: function (tablename, cb) {
    Step(function () {
      mysql.getConnection(function (err, connection) {
        if (err) {
          cb(err)
        }
        else {
          connection.query("show columns from " + tablename, function(err, rows) {
            if (err) {
              cb(err);
            }
            else {
              var fields = [];
              _.each(rows,function (field) {
                // table.field_name as table_field_name
                fields.push(" "+ tablename + "." + field["Field"] + " AS " + tablename + "_" + field["Field"]);
              });
              cb(null, fields.join());
            }
            connection.end();
          });
        }
      });
    });
  },
	coordinateDistinct: function (p1, p2, ceil) {
    if (_.isUndefined(ceil)) {
      ceil = true;
    }
		function toRad(Value) {
		    /** Converts numeric degrees to radians */
		    return Value * Math.PI / 180;
		}
		var lat1 = p1.lat;
		var lat2 = p2.lat;
		var lon1 = p1.lon;
		var lon2 = p2.lon;
		// Reference: 
		// http://www.movable-type.co.uk/scripts/latlong.html
		var R =  6378137.0  ; // m, the radius of Earth
        var flat = toRad(p1['lat']);  
        var flng = toRad(p1['lon']);  
        var tlat = toRad(p2['lat']);  
        var tlng = toRad(p2['lon']); 
          
        var result = Math.sin(flat) * Math.sin(tlat) ;  
        result += Math.cos(flat) * Math.cos(tlat) * Math.cos(flng-tlng);
        if (ceil) return Math.ceil(Math.acos(result) * R / 1000);
        return Math.acos(result) * R / 1000;
	},
  loadRouter: function (name) {
    return require("../router/" + name);
  },
  newSessionId: function () {
    return require('connect').utils.uid(24);
  },
  md5: function (data) {
    var crypto = require("crypto");
    var md5 = crypto.createHash("md5");
    return md5.update(data, "utf8").digest("hex");
  },
  datestr: function (date, nosecond) {
    nosecond || (nosecond = false);
    function twoDigits(d) {
        if(0 <= d && d < 10) return "0" + d.toString();
        if(-10 < d && d < 0) return "-0" + (-1*d).toString();
        return d.toString();
    }

    Date.prototype.toMysqlFormat = function() {
        var f = this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes());
        return nosecond ? f : f + ":" + twoDigits(this.getUTCSeconds());
    };
    var MyDate = new Date();
    if (_.isDate(date)) var MyDate = date;
    return MyDate.toMysqlFormat();
  },
  needToUpdate: function (ts, cb) {
    // Check products update status.
    Step(function () {
      var parallel = this.parallel();
      mysql.getConnection(function (err, connection) {
        if (err) {
          parallel(err);
        }
        else {
          connection.query("SELECT count(*) as count FROM products WHERE mdate > ?", [ts], function (err, rows) {
            if (err) {
              parallel(err);
            }
            else {
              var count = _.first(rows)["count"];
              parallel(null, count);
            }
            connection.end();
          });
        }
      });
    }, function(err, count) {
      var parallel = this.parallel();
      // Check media update status
      if (err) {
        parallel(err);
      }
      else {
        mysql.getConnection(function (err, connection) {
          if (err) {
            parallel(err);
          }
          else {
            connection.query("SELECT count(*) as count FROM media WHERE mdate > ?", [ts], function (err,rows) {
              if (err) {
                parallel(err);
              }
              else {
                var countProduct = _.first(rows)["count"];
                parallel(err, count + countProduct);
              }
              connection.end();
            });
          }
        });
      }
    }, function (err, count) {
      var parallel = this.parallel();
      // Check taxonomy update status.
      if (err) {
        cb(err);
      }
      else {
        mysql.getConnection(function (err, connection) {
          if (err) {
            cb(err);
          }
          else {
            connection.query("SELECT count(*) as count FROM taxonomies WHERE mdate > ?", [ts], function (err, rows) {
              if (err) {
                parallel(err);
              }
              else {
                parallel(null, count + parseInt(_.first(rows)["count"]));
              }
            });
            connection.end();
          }
        });
      }
    },
    function (err, count) {
      var parallel = this.parallel();
      if (err) {
        parallel(err);
      }
      else {
        mysql.getConnection(function (err, connection) {
          if (err) {
            parallel(err);
          }
          else {
            connection.query("SELECT count(*) as count FROM pages WHERE mdate > ?", [ts], function (err, rows) {
              if (err) {
                parallel(err);
              }
              else {
                parallel(null, count + parseInt(_.first(rows)["count"]));
              }
            });
            connection.end();
          }
        });
      }
    }, function (err, count) {
      if (err) {
        cb(err);
      }
      else {
        if (count > 0) {
          cb(null, true);
        }
        else {
          cb(null, false);
        }
      }
    });
  },
  gpsBaiduMapLink: function (lat, lon, content, title, referer) {
    var baselink = "http://api.map.baidu.com/marker";
    var query = {
      location: lat + ","+lon,
      title: _.isUndefined(title) ? subway.config.baidumap.title : title,
      content: _.isUndefined(content) ? subway.config.baidumap.content: content,
      referer: _.isUndefined(referer) ? subway.config.baidumap.referer: referer,
      output: "html"
    }
    var querystring = require("querystring").stringify(query);
    return baselink + "?" + querystring;
  },
  gpsGoogleMapLink: function (lat, lon, content, title, referer) {
    var bashlink = "http://maps.google.com/";
    var query = {
      ie: "UTF8",
      ll: lat + "," + lon,
    }
    return bashlink + "?" + require("querystring").stringify(query);
  },
  tokenReplace: function (tokenstr, params) {
    _.chain(params)
      .keys()
      .each(function (token) {
        var value = params[token];
        tokenstr = tokenstr.replace(token, value);        
      })
      .value();
    return tokenstr;
  },
  timestamp: function (date) {
    if (_.isUndefined(date)) {
      date = new Date();
    }
    return Math.round(date.getTime() / 1000);
  },
  // Help function to get data from query or body
  getParam: function (req, p) {
    function getValue(obj, value) {
      if (_.isUndefined(value)) value = null;
      return _.isUndefined(obj) ? value : obj;
    }
    var v = getValue(req.query[p]);
    if (_.keys(req.body).length > 0) {
      v = getValue(req.body[p]);
    }
    return v;
  }
});