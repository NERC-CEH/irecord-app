module.exports = {
  data_init: {
    command() {
     return 'cd src/data && ' +
      'python make.py species &&' +
      'mkdir -p ../../dist/_build/ &&' +
      'mv species*data.json ../../dist/_build/ &&' +
      'rm warnings.log';
    },
    stdout: true,
  },
  cordova_init: {
    command: 'cordova create dist/cordova',
    stdout: true,
  },
  cordova_clean_www: {
    command: 'rm -R dist/cordova/www/* && rm dist/cordova/config.xml',
    stdout: true,
  },
  cordova_copy_dist: {
    command: 'cp -R dist/main/* dist/cordova/www/',
    stdout: true,
  },
  cordova_add_platforms: {
    command: 'cd dist/cordova && cordova platforms add ios android',
    stdout: true,
  },
  /**
   * $ANDROID_KEYSTORE must be set up to point to your android certificates keystore
   */
  cordova_android_build: {
    command:
    'cd dist/cordova && ' +
    'mkdir -p dist && ' +

    'cordova --release build android && ' +
    'cd platforms/android/build/outputs/apk &&' +
    'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $ANDROID_KEYSTORE android-release-unsigned.apk irecord &&' +
    'zipalign -v 4 android-release-unsigned.apk main.apk && ' +

    'mv -f main.apk ../../../../../dist/',

    stdout: true,
    stdin: true,
  },
  cordova_android_build_old: {
    command:
    'cd dist/cordova && ' +
    'mkdir -p dist && ' +

    // 'cordova platforms add android && ' + // don't know if needed to load new config

    'cordova plugin add cordova-plugin-crosswalk-webview && ' +
    'cordova --release build android && ' +
    'cd platforms/android/build/outputs/apk &&' +

    'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $ANDROID_KEYSTORE android-armv7-release-unsigned.apk irecord &&' +
    'zipalign -v 4 android-armv7-release-unsigned.apk arm7.apk && ' +

    'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $ANDROID_KEYSTORE android-x86-release-unsigned.apk irecord &&' +
    'zipalign -v 4 android-x86-release-unsigned.apk x86.apk && ' +

    'mv -f arm7.apk ../../../../../dist/ && ' +
    'mv -f x86.apk ../../../../../dist/',

    stdout: true,
    stdin: true,
  },
};
