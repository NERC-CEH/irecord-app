#!/bin/bash

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
  cp config.xml cordova/
  exit
fi

#Build from scratch
echo 'Build stared'

#prepare www source
npm install
grunt

#init cordova source
echo 'Initializing cordova'
cordova create cordova com.ceh.irecord iRecord

#add www source to cordova
echo 'Moving dist to cordova'
rm -R cordova/www/*
cp -R dist/* cordova/www/
rm cordova/config.xml
cp config.xml cordova/

cd cordova
cordova platforms add ios android
#cordova build ios android
