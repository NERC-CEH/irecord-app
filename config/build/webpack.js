const webpackConfig = require('../../src/webpack.config.js');
const webpackConfigDev = require('../../src/webpack.config.dev.js');

module.exports = {
  // Main run
  main: webpackConfig,

  // Development run
  dev: webpackConfigDev,

  build: {
    // configuration for this build
  },
};
