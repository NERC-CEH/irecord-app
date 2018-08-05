/** ****************************************************************************
 * A development webpack configuration.
 **************************************************************************** */
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig, {
  mode: 'development',

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify('development'),
      },
    }),
  ],
});
