#!/bin/bash

# update json file and move to final location
sed -i _original 's?start_host.bat?'`pwd`'/start_host_osx.sh?g' host_conf.json
mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts
mv host_conf.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.piercewashington.app_launcher.json
mv host_conf.json_original host_conf.json

# update sh file
cp start_host.sh start_host_osx.sh
sed -i _original 's?CPQ_TOOL_HOST?'`pwd`'?g' start_host_osx.sh
rm start_host_osx.sh_original

# setup log files/folders
mkdir ~/.bigtools
