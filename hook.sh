#!/bin/bash

echo 'Allocating deployment space.'
mkdir -p ~/deploy && cd ~/deploy && wget -O projectmaster.zip -q https://github.com/temple-acm/site/archive/master.zip

if [ -f ~/deploy/projectmaster.zip ]; then
	unzip -q ~/deploy/projectmaster.zip
	echo 'Unzipping repository archive.'
	rm ~/deploy/projectmaster.zip
	mv site-master tuacm.org
	echo 'Backing up node_modules.'
	mv /srv/tuacm.org/node_modules ~/deploy/node_modules
	echo 'Deleting existing codebase.'
	rm -rf /srv/tuacm.org
	echo 'Replacing the old codebase with the updated codebase.'
	mv tuacm.org /srv
	echo 'Replacing node_modules.'
	mv ~/deploy/node_modules /srv/tuacm.org/node_modules
fi
echo 'Git deploy complete.'
