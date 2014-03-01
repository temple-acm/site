#!/bin/bash

mkdir -p ~/deploy && cd ~/deploy && wget projectmaster.zip -q https://github.com/temple-acm/site/archive.zip

if [ -f ~/deploy/projectmaster.zip ]; then
	unzip -q ~/deploy/projectmaster.zip
	rm ~/deploy/projectmaster.zip
	mv Project-master tuacm.org
	rm -rf /srv/tuacm.org
	mv tuacm.org /srv
fi
