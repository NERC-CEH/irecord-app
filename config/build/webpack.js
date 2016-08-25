const webpackConfig = require('../webpack.config.js');
const webpackConfigDev = require('../webpack.config.dev.js');

module.exports = {
  // Main run
  main: webpackConfig,

  // Development run
  dev: webpackConfigDev,

  build: {
    // configuration for this build
  },
};
