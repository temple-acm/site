#!/bin/bash

#################################################
## GIT DEPLOY SHELL SCRIPT ######################
#################################################

# !!! NOTE: unzip must be installed on this machine
# Runs the git deploy


# First, get the zip file
mkdir -p ~/deploy && cd ~/deploy && wget -O projectmaster.zip -q https://github.com/temple-acm/site/archive/master.zip

# Second, unzip it, if the zip file exists
if [ -f ~/deploy/projectmaster.zip ]; then
    # Unzip the zip file
    unzip -q ~/deploy/projectmaster.zip
    # Delete zip file
    rm ~/deploy/projectmaster.zip
    # Rename project directory to desired name
    mv Project-master tuacm.org
    # Delete current directory
    rm -rf /srv/tuacm.org
    # Replace with new files
    mv tuacm.org /srv
    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly
fi