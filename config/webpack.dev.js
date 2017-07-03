/** ****************************************************************************
 * A development webpack configuration.
 *****************************************************************************/
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const ENV = process.env.NODE_ENV || process.env.ENV || 'development';

module.exports = webpackMerge(commonConfig, {
  // Extend common/config/config.js file with common/config/config_dev.js
  resolve: {
    alias: {
      config: 'common/config/config_dev',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV),
      },
    }),
  ],
});
