#!/usr/bin/env bash

############################################################
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
# This program used for backup every log file from subway  #
# webservices output.                                      #
#                                                          #
#                                                          #
############################################################

CWD="$(cd $( dirname ${BASH_SOURCE[0]} ) && pwd )"
LOGPATH="$(cd $CWD/../log && pwd)"
BACKUPPATH=$LOGPATH/history

if [[ ! -d $BACKUPPATH ]] ; then
	mkdir $BACKUPPATH
fi

################ Zip Log That In Array #########################
LOGS="$(ls $LOGPATH)"
for LOG in $LOGS
do
	if [[ -f "$LOGPATH/$LOG" ]]; then
		zip "$BACKUPPATH/$LOG-$(date +%Y%m%d%H%M).zip" "$LOGPATH/$LOG"
		# Truncat it 
		> "$LOGPATH/$LOG"
	fi
done
###############      End Zip Log       ##########################

