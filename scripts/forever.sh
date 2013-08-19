#!/usr/bin/env bash

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################

print_status() { printf '%*s\r%s\n' "${COLUMNS:-$(tput cols)}" "$2" "$1"; }
FOREVER=`which forever`
DIR="$(cd "$( dirname "${BASH_SOURCE[0]}")" && pwd )"
PWD=`dirname $DIR`
cd $PWD
PORTS="$( node -p '_ = require("underscore");_.each(require("./config").banlancer, function (p) {console.log(p.port)})' )"
MASTER_PORT="$( node -p '_ = require("underscore");console.log(require("./config").port)' | grep '[0-9]\{1,\}' )"

if [[ $FOREVER = "" ]];
then
  echo -e "forever not install\n"
  echo -e "install with: npm install forever -g\n"
  exit
fi

start_forever() {
	for PORT in $PORTS
	do
		if [[ $PORT -gt 0 ]]; then
			print_status "Start worker at [127.0.0.1:$PORT]" "[OK]"
			forever start -a -l "log/forever.$PORT.log" -o "log/subway.$PORT.log" -e "log/subway.$PORT.err.log" -p $PWD index.js --port=$PORT 1>/dev/null 2>&1
			print_status "Done" "[OK]"
		fi
	done

	print_status "Start master  at [127.0.0.1:$MASTER_PORT]" "[OK]"

	forever start -a -l "log/forever.$MASTER_PORT.log" -o "log/subway.$MASTER_PORT.log" -e "log/subway.err.$MASTER_PORT.log" -p $PWD banlancer.js --port=$MASTER_PORT 1>/dev/null 2>&1

	print_status "Done" "[OK]"

	# print_status "starting master" "[OK]"

	# forever start -a -l log/forever.log -o log/subway.log -e log/subway.err.log -p $PWD index.js

	# print_status "started master" "[OK]"
}

stop_forever() {
	print_status "Stop server" "[OK]"
	forever stop index.js 1>/dev/null 2>&1
	forever stop banlancer.js 1>/dev/null 2>&1
	print_status "Done" "[OK]"
}

ACTION=$1

if [[ $1 = "" ]];then
	ACTION="start"
fi

case $ACTION in
	"start")
		start_forever
		;;
	"stop")
		stop_forever
		;;
	*)
		echo -e "Usage: forever.sh [start|stop]"
	;;
esac
		
