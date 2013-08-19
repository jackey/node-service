<?php

function restart() {
	$dir = dirname(__FILE__);	
	$ret = exec("$dir/scripts/forcestop.sh", $null, $status);
	if ($status != 0) {
		@exec("$dir/scripts/forever.sh stop", $null);
		@exec("$dir/scripts/forever.sh start", $null, $status);
	}
}
try {
	$ip = gethostbyname(trim(`hostname`));
	$opts = stream_context_create(array('http' => array('method' => 'GET', 'timeout' => 5)));
	// on server
	if ($ip != "127.0.0.1") {
		$content = @file_get_contents('http://222.73.219.19:20114/', false, $opts);
	}
	// on local
	else {
		$content = @file_get_contents('https://127.0.0.1:3001/', false, $opts);
	}
	$data = json_decode($content);
	if ($data) {
		print "no problem\r\n";
	}
	else {
		restart();
		print "server down\r\n";
	}
}
catch (Exception $e) {
	print "restart\r\n";
}
