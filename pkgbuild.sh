#!/bin/bash

UPDATE=false
for i in "$@"
do
case $i in
    -u|--update)
    UPDATE=true
    shift # past argument=value
    ;;
    *)
    # unknown option
    ;;
esac
done

#Update the build only
if $UPDATE; then
  echo 'Updating build'

  rm -R cordova/www/*
  cp -R dist/* cordova/www/
  rm cordova/config.xml
  cp config_build.xml cordova/config.xml
  exit
fi

#Build from scratch
echo 'Build stared'

#prepare www source
npm install
grunt cordova

#init cordova source
echo 'Initializing cordova'
cordova create cordova

#add www source to cordova
echo 'Moving dist to cordova'
rm -R cordova/www/*
cp -R dist/* cordova/www/
rm cordova/config.xml
cp config_build.xml cordova/config.xml

cd cordova
cordova platforms add ios android
#cordova build ios android
