module.exports = grunt => ({
    default: ['init', 'jst', 'webpack:main'],

    init: ['exec:data', 'copy', 'vendor'],

    vendor: [
      'replace:latlon',
      'replace:ratchet',
      'replace:ratchet_fonts',
      'replace:fontello_fonts',
      'replace:photoswipe',
    ],

    // Development run
    update: ['jst', 'webpack:main'],

    // Development update
    dev: ['init', 'jst', 'webpack:dev'],

    // Development run
    'dev:update': ['jst', 'webpack:dev'],

    // Cordova set up
    cordova: [
      // prepare www source
      'default',

      // init cordova source
      // add www source to cordova
      'exec:cordova_init',

      'exec:cordova_clean_www',
      'exec:cordova_copy_dist',
      'replace:cordova_config',
      'replace:cordova_build',
      'exec:cordova_add_platforms',
    ],

    /**
     * Updates cordova project - use after tinkering with src or congig
     */
    'cordova:update': [
      'exec:cordova_clean_www',
      'exec:cordova_copy_dist',
      'replace:cordova_config',
      'replace:cordova_build',
      'exec:cordova_rebuild',
    ],

    /**
     * Runs the app to a connected Android device/emulator
     */
    'cordova:android:run': ['exec:cordova_run_android'],

    'cordova:android': [
      'prompt:keystore',
      'cordova:_prepAndroid',
      'replace:cordova_config',
      'replace:cordova_build',
      'exec:cordova_android_build',
    ],

    /**
     * Sets up the right SDK version and package ID for the config generator
     */
    'cordova:_prepAndroid': () => {
      grunt.option('android', true);
    },
  });
