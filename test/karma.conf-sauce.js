/**
 * Config copied with mods from backbone karma sauce config
 */
require('dotenv').config({ silent: true }); // get local environment variables from .env

const path = require('path');
const _ = require('lodash');

const webpack = require('webpack');

const webpackConfigDev = require('../other/webpack.dev');
delete webpackConfigDev.entry; // the entry is the loader
delete webpackConfigDev.output; // no need to output files
delete webpackConfigDev.optimization; // no need
const definePlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('test'),
  },
});
webpackConfigDev.plugins = webpackConfigDev.plugins.map(
  p => (p instanceof webpack.DefinePlugin ? definePlugin : p)
);
webpackConfigDev.resolve.modules.push(path.resolve('./test/'));

const sauceBrowsers = _.reduce(
  [
    ['firefox', '60'],
    ['firefox', '45'],
    ['firefox', '44'],
    ['firefox', '43'],
    ['firefox', '42'],
    ['firefox', '41'],

    ['chrome', '67'],
    ['chrome', '48'],
    ['chrome', '46'],
    ['chrome', '44'],
    ['chrome', '42'],
    ['chrome', '40'],
    ['chrome', '37'],

    ['android', '6'],
    ['android', '5.1'],
    ['android', '5'],
  ],
  (memo, platform) => {
    // internet explorer -> ie
    let label = platform[0].split(' ');
    if (label.length > 1) {
      label = _.invoke(label, 'charAt', 0);
    }
    label = `${label.join('')}_v${platform[1]}`.replace(' ', '_').toUpperCase();
    memo[label] = _.pick(
      {
        base: 'SauceLabs',
        browserName: platform[0],
        version: platform[1],
        platform: platform[2],
      },
      Boolean
    );
    return memo;
  },
  {}
);

module.exports = config => {
  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log(
      'SAUCE_USERNAME and SAUCE_ACCESS_KEY env variables are required.'
    );
    process.exit(1);
  }

  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [{ pattern: 'loader.js', watched: false }],

    preprocessors: {
      'loader.js': ['webpack'],
    },

    webpack: webpackConfigDev,

    webpackServer: {
      noInfo: true,
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      stats: {
        // minimal logging
        assets: false,
        colors: true,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false,
        children: false,
      },
    },

    singleRun: true,

    // Number of sauce tests to start in parallel
    concurrency: 9,

    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    sauceLabs: {
      build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${
        process.env.TRAVIS_BUILD_ID
      })`,
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    },

    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: _.keys(sauceBrowsers),
  });
};
