<?php

// Put me in path/to/project/bin 
// crontab -e 

$key = md5("-");
$server = "https://91.121.37.193/$key/profile/check";

function restart() {
	$dir =  dirname(dirname(__FILE__));
	@exec("$dir/start-secure.sh stop");
	@exec("$dir/start-secure.sh start");
}

function notify($error) {
	$to = "jziwenchen@gmail.com";
	$cc = array(
		"jziwenchen@gmail.com"
	);
	$subject = "MN Server Restart";
	$body = $error;
	$headers = "From:jziwenchen@gmail.com". "\r\n".
		"Cc:". implode(",", $cc). "\r\n";
	$ret = mail($to, $subject, $body, $headers);
}

function call_server() {
	global $server;
	$req = curl_init();
	curl_setopt($req, CURLOPT_URL, $server);
	curl_setopt($req, CURLOPT_HEADER, 0);
	curl_setopt($req, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($req, CURLOPT_CONNECTTIMEOUT, 10); // 10 secs
	// Ignore SSL
	curl_setopt($req, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($req, CURLOPT_SSL_VERIFYHOST, FALSE);
	
	$ret = curl_exec($req);
	curl_close($req);
	if (!$ret) {
		return false;
	}
	else {
		return $ret;
	}
}

try {
	
	$content = json_decode(call_server(), TRUE);
	if (!$content) {
		restart();
		notify($content);
	}
	else {
		// Server is alive
		if (count($content) && $content[0]["usr_id"]) {
			// nothing to do
				print "Server is alive";
		}
		else {
			restart();
			notify(json_encode($content));
		}
	}
}
catch (Exception $e) {
	restart();
	notify("Unable access server: ". $server);
}
