module.exports = {
  'default': [
    'init',
    'run',
    'webpack:main',
    'replace:development_code',
  ],

  'init': [
    'init:data',
    'init:vendor',
    'copy',
  ],

  'init:data': ['exec:data_init'],

  'init:vendor': [
    'bower',
    'replace:bootstrap',
    'replace:indexedDBShim',
    'replace:latlon',
    'replace:ratchet',
    'replace:ratchet_fonts',
    'uglify',
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
};
//
// grunt.registerTask('cordova', 'Cordova tasks', update => {
//   if (update) {
//     // update only
//
//     grunt.task.run('replace:cordova_config');
//
//     // update www
//     grunt.task.run('exec:cordova_clean_www');
//     grunt.task.run('exec:cordova_copy_dist');
//     return;
//   }
//
//   // prepare www source
//   grunt.task.run('default');
//
//   grunt.task.run('replace:cordova_config');
//
//   // init cordova source
//   grunt.task.run('exec:cordova_init');
//
//   // add www source to cordova
//   grunt.task.run('exec:cordova_clean_www');
//   grunt.task.run('exec:cordova_copy_dist');
//   grunt.task.run('exec:cordova_add_platforms');
// });
//
