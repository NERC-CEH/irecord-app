module.exports = grunt => ({
  default: ['init', 'jst', 'webpack:main'],

  init: ['init:validate', 'exec:data', 'copy', 'vendor'],

  'init:validate': () => {
    if (process.env.APP_FORCE) {
      grunt.option('force', true);
    }

    // check for non-production specific env vars
    if (process.env.APP_MANUAL_TESTING) {
      grunt.warn('APP_MANUAL_TESTING is enabled');
    }
    if (process.env.APP_TRAINING) {
      grunt.warn('APP_TRAINING is enabled');
    }
    if (process.env.APP_SCREENSHOTS) {
      grunt.warn('APP_SCREENSHOTS is enabled');
    }

    // check for missing env vars
    [
      'APP_OS_MAP_KEY',
      'APP_MAPBOX_MAP_KEY',
      'APP_SENTRY_KEY',
      'APP_INDICIA_API_KEY',
      'APP_GA',
    ].forEach(setting => {
      if (!process.env[setting]) {
        grunt.warn(`${setting} env variable is missing`);
      }
    });
  },

  vendor: [
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
