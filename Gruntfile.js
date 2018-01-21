require('dotenv').config({ silent: true }); // get local environment variables from .env

var path = require('path');

module.exports = function(grunt) {
  require('time-grunt')(grunt);

  require('load-grunt-config')(grunt, {
    // path to task.js files, defaults to grunt dir
    configPath: path.join(process.cwd(), 'other/build'),
    // auto grunt.initConfig
    init: true,
  });
};
