#!/usr/bin/env bash

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################
DIR="$(cd "$( dirname "${BASH_SOURCE[0]}")" && pwd )"
PWD=`dirname $DIR`

FILES=`ls -a | grep "\.[0-9]\{1,\}\.pid"`
for PID in $FILES
do
	PID=`cat $PID`

	if [[ $PID != "" ]];then
		kill -9 $PID
	else
		exit 1
	fi
done
