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
    // https://github.com/webpack-contrib/karma-webpack/issues/316
    SAUCE_LABS: JSON.stringify('true')
  }
});
webpackConfigDev.plugins = webpackConfigDev.plugins.map(
  p => (p instanceof webpack.DefinePlugin ? definePlugin : p)
);
webpackConfigDev.resolve.modules.push(path.resolve('./test/'));

const sauceBrowsers = [
  /**  Browser environment */
  ['chrome', '69'], // latest
  ['chrome', '37'], // bottom support
  ['safari', '12'], // latest
  ['safari', '8'], // bottom support

  /**  Mobile environment */
  ['android', '6'], // latest
  ['android', '5.1'],
  ['android', '5'], // bottom support
  ['Safari', '11.2', 'iOS', 'iPhone 6'], // latest
  ['Safari', '11.1', 'iOS', 'iPhone 6'],
  ['Safari', '10.3', 'iOS', 'iPhone 6'],
  ['Safari', '10.2', 'iOS', 'iPhone 6'] // bottom support
].reduce((memo, platform) => {
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
      device: platform[3]
    },
    Boolean
  );
  return memo;
}, {});

module.exports = config => {
  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.log('SAUCE_USERNAME and SAUCE_ACCESS_KEY env variables are required.');
    process.exit(1);
  }

  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [{ pattern: 'loader.js', watched: false }],

    preprocessors: {
      'loader.js': ['webpack']
    },

    webpack: webpackConfigDev,

    webpackServer: {
      noInfo: true
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
        children: false
      }
    },

    singleRun: true,

    // Number of sauce tests to start in parallel
    concurrency: 5,

    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    sauceLabs: {
      build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`,
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },
    urlRoot: '/__karma__/',

    proxies: {
      '/': 'http://localhost:4445'
    },
    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,
    browserNoActivityTimeout: 45000,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: Object.keys(sauceBrowsers)
  });
};
