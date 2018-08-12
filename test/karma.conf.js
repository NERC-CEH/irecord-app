require('dotenv').config({ silent: true }); // get local environment variables from .env
const webpack = require('webpack');
const path = require('path');

// get development webpack config
const webpackConfigDev = require('../other/webpack.dev');
// // clean it up a bit
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

module.exports = config => {
  config.set({
    browsers: ['ChromeCustom'],

    customLaunchers: {
      ChromeCustom: {
        base: 'ChromiumHeadless',
        flags: ['--no-sandbox'],
      },
    },

    frameworks: ['mocha', 'chai', 'sinon'],

    files: [{ pattern: 'loader.js', watched: true }],

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

    coverageReporter: {
      dir: '../coverage',
      reporters: [
        {
          type: 'html',
          subdir: 'html',
        },
      ],
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
    singleRun: true,
  });
};
