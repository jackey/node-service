#!/usr/bin/env bash

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################


WORKSPACE="$(cd $( dirname ${BASH_SOURCE[0]} )/..  && pwd)"
print_status() { printf '%*s\r%s\n' "${COLUMNS:-$(tput cols)}" "$2" "$1"; }

printf '%*s%s\n' "${COLUMNS:-$(tput cols)}"  "[world]" "hello"

printf "%s\r\n" "Jackey" 