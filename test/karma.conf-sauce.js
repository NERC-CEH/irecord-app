/**
 * Config copied with mods from backbone karma sauce config
 */
require('dotenv').config({ silent: true }); // get local environment variables from .env

const path = require('path');

process.env.NODE_ENV = 'test';
process.env.SAUCE_LABS = true;

const webpackConfigDev = require('../webpack.config');

delete webpackConfigDev.entry; // the entry is the loader
delete webpackConfigDev.output; // no need to output files
delete webpackConfigDev.optimization; // no need

webpackConfigDev.resolve.modules.push(path.resolve('./test/'));

const sauceBrowsers = [
  ['Browser', '8', 'Android', 'Android Emulator'], // latest
  ['Browser', '6', 'Android', 'Android Emulator'], // bottom
  // ['Safari', '13.0', 'iOS', 'iPhone SE'], // latest
  // ['Safari', '12.0', 'iOS', 'iPhone SE'], // bottom
].reduce(
  (browsers, [browserName, version, platform, device]) => ({
    ...browsers,
    ...{
      [`sl_${browserName}_${version}`]: {
        base: 'SauceLabs',
        browserName,
        version,
        platform,
        device,
      },
    },
  }),
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
    concurrency: 5,

    // test results reporter to use
    reporters: ['dots', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    sauceLabs: {
      build: `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`,
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    },
    urlRoot: '/__karma__/',

    proxies: {
      '/': 'http://localhost:4445',
    },
    captureTimeout: 120000,
    customLaunchers: sauceBrowsers,
    browserNoActivityTimeout: 45000,

    // Browsers to launch, commented out to prevent karma from starting
    // too many concurrent browsers and timing sauce out.
    browsers: Object.keys(sauceBrowsers),
  });
};
