module.exports = (grunt) => {
  return {
    'default': [
      'init',
      'run',
      'webpack:main',
      'replace:development_code',
    ],

    'init': [
      'init:data',
      'bower',
      'copy',
      'vendor',
    ],

    'init:data': ['exec:data_init'],

    'vendor': [
      'replace:bootstrap',
      'replace:indexedDBShim',
      'replace:latlon',
      'replace:ratchet',
      'replace:ratchet_fonts',
      'replace:fontello_fonts',
    ],

    'run': [
      'sass',
      'cssmin',
      'jst',
      'replace:main',
    ],

    // Development run
    'update': [
      'run',
      'webpack:main',
      'replace:development_code',
    ],

    // Development update
    'dev': [
      'init',
      'run',
      'webpack:dev',
    ],

    // Development run
    'dev:update': [
      'run',
      'webpack:dev',
    ],

    'test': ['karma:local'],
    'test:sauce': ['karma:sauce'],

    // Cordova set up
    'cordova': [
      // prepare www source
      'default',

      // init cordova source
      // add www source to cordova
      'exec:cordova_init',

      'exec:cordova_clean_www',
      'exec:cordova_copy_dist',
      'cordova:_prepAndroid',
      'replace:cordova_config',
      'exec:cordova_add_platforms',
    ],

    'cordova:update': [
      'replace:cordova_config',
      // update www
      'exec:cordova_clean_www',
      'exec:cordova_copy_dist',
    ],

    'cordova:android': [
      'cordova:_prepAndroid',
      'replace:cordova_config',
      'exec:cordova_android_build',
    ],
    'cordova:android:old': [
      'cordova:_prepAndroidOld',
      'replace:cordova_config',
      'exec:cordova_android_build_old',
    ],

    /**
     * Sets up the right SDK version and package ID for the config generator
     */
    'cordova:_prepAndroid': () => {
      grunt.option('android', true);
    },
    'cordova:_prepAndroidOld': () => {
      grunt.option('android', true);
      grunt.option('oldversion', true);
    },
  };
};
