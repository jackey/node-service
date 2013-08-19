#!/usr/bin/env bash

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################

PWD=`pwd`
pandoc --toc -o $PWD/api_documentation.pdf $PWD/API.md
