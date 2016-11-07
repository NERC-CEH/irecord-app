const prodConfig = require('../webpack.prod.js');
const devConfig = require('../webpack.dev.js');

module.exports = {
  // Main run
  main: prodConfig,

  // Development run
  dev: devConfig,

  build: {
    // configuration for this build
  },
};
