#!/usr/bin/env bash

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################


NC=`which nc`
PWD=`pwd`

if [[ $NC = "" ]];then
	echo -e "Please install nc first\n"
	exit
fi

nc -z 192.168.1.101 3001
STATUS=$?
if [[ !$STATUS -eq 0 ]];then
	exec $PWD/scripts/forcestop.sh
fi