require('dotenv').config({ silent: true }); // get local environment variables from .env
const pkg = require('../../package.json')

const appMinorVersion = pkg.version.split('.').splice(0,2).join('.')

module.exports = function(grunt) {
  return {
    ionic_copy: {
      command: 'cp -R node_modules/@ionic dist/main',
      stdout: true,
    },
    cordova_init: {
      command: 'cordova create dist/cordova',
      stdout: true,
    },
    cordova_resources: {
      command: `mkdir -p dist/resources &&
                cp -R other/designs/android dist/resources &&

                cp other/designs/splash.svg dist/resources &&
                sed -i.bak 's/{{APP_VERSION}}/${appMinorVersion}/g' dist/resources/splash.svg &&

                ./node_modules/.bin/sharp -i dist/resources/splash.svg -o dist/resources/splash.png resize 2737 2737 -- removeAlpha &&
                ./node_modules/.bin/sharp -i other/designs/icon.svg -o dist/resources/icon.png resize 1024 1024 -- removeAlpha &&

                ./node_modules/.bin/cordova-res --resources dist/resources`,
      stdout: true,
    },
    cordova_clean_www: {
      command: 'rm -R -f dist/cordova/www/* && rm -f dist/cordova/config.xml',
      stdout: true,
    },
    cordova_rebuild: {
      command: 'cd dist/cordova/ && cordova prepare ios android',
      stdout: true,
    },
    cordova_android_build_dev: {
      command: 'cd dist/cordova/ && ../../node_modules/.bin/cordova build android',
      stdout: true,
    },
    cordova_copy_dist: {
      command: 'cp -R dist/main/* dist/cordova/www/',
      stdout: true,
    },
    cordova_add_platforms: {
      // @6.4.0 because of https://github.com/ionic-team/ionic/issues/13857#issuecomment-381744212
      command: 'cd dist/cordova && cordova platforms add ios android',
      stdout: true,
    },
    /**
     * $ANDROID_KEYSTORE must be set up to point to your android certificates keystore
     */
    cordova_android_build: {
      command() {
        const pass = grunt.config('keystore-password');
        return `cd dist/cordova && 
            mkdir -p dist && 
            cordova --release build android && 
            cd platforms/android/app/build/outputs/apk/release/ &&
            jarsigner -keystore ${process.env.KEYSTORE}
              -storepass ${pass} app-release-unsigned.apk irecord &&
            zipalign 4 app-release-unsigned.apk main.apk &&
            mv -f main.apk ../../../../../../../dist/`;
      },

      stdout: true,
      stdin: true,
    },

    cordova_build_ios: {
      command: 'cd dist/cordova && cordova build ios',
      stdout: true,
    },

    cordova_build_android: {
      command: 'cd dist/cordova && cordova build android',
      stdout: true,
    },
  };
};
