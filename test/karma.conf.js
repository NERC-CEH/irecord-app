var path = require('path');

//get development webpack config
var webpackConfigDev = require('../config/webpack.config.dev');
//clean it up a bit
delete webpackConfigDev.context;
delete webpackConfigDev.entry;
delete webpackConfigDev.output;

module.exports = function exports(config) {
  config.set({
    basePath: '../',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      { pattern: 'test/mocks.js', watched: false },
      { pattern: 'tests.webpack.js', watched: true },
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },

    webpack: webpackConfigDev,

    webpackServer: {
      noInfo: true,
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
  });
};
