#!/usr/bin/env node

var exec = require("child_process").exec;

exec("php ../scripts/cropimage.php", {env: {"media": "uploaddir/usermedia/1890664504/user_register.png",  "thumbnail": "thumbnail_213_213"}}, function (err, out) {
	console.log(out);
});