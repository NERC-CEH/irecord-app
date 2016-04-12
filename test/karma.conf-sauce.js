/**
 * Config copied with mods from backbone karma sauce config
 */
var _ = require('./vendor/underscore');
var fs = require('fs');
var path = require('path');

//get development webpack config
var webpackConfigDev = require('../src/webpack.config.dev');
//clean it up a bit
delete webpackConfigDev.context;
delete webpackConfigDev.entry;
delete webpackConfigDev.output;

var sauceBrowsers = _.reduce([
  ['firefox', '45'],
  ['firefox', '44'],
  ['firefox', '43'],
  ['firefox', '42'],
  ['firefox', '41'],

  ['chrome', '40'],
  ['chrome', '39'],
  ['chrome', '30'],

  ['microsoftedge', '20.10240', 'Windows 10'],
  ['internet explorer', '11', 'Windows 10'],
  ['internet explorer', '10', 'Windows 8'],

  ['android', '5.1'],
  ['android', '5'],
  ['android', '4.4'],
  ['android', '4.3'],
  ['android', '4.1'],

  ['safari', '9'],
  ['safari', '8.0', 'OS X 10.10'],

], function (memo, platform) {
  // internet explorer -> ie
  var label = platform[0].split(' ');
  if (label.length > 1) {
    label = _.invoke(label, 'charAt', 0);
  }
  label = (label.join('') + '_v' + platform[1]).replace(' ', '_').toUpperCase();
  memo[label] = _.pick({
    'base': 'SauceLabs',
    'browserName': platform[0],
    'version': platform[1],
    'platform': platform[2]
  }, Boolean);
  return memo;
}, {});

module.exports = function (config) {
  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync('./test/sauce.json')) {
      console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
      process.exit(1);
    } else {
      process.env.SAUCE_USERNAME = require('./sauce').username;
      process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
    }
  }

  config.set({
    basePath: '../',

    frameworks: ['mocha', 'chai'],

    files: [
      { pattern: 'tests.webpack.js', watched: false },
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },

    webpack: webpackConfigDev,

    webpackServer: {
      noInfo: true,
    },

    singleRun: true,

    // Number of sauce tests to start in parallel
    concurrency: 9,

      // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: _.keys(sauceBrowsers),
  });
};
