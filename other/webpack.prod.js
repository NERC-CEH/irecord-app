/** ****************************************************************************
 * A production webpack configuration. Will minify and optimise the code build.
 *****************************************************************************/
const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

const ENV = process.env.NODE_ENV || process.env.ENV || 'production';

module.exports = webpackMerge(commonConfig, {
  devtool: 'source-map',

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      cacheFolder: path.resolve(__dirname, 'dist/_build/.cached_uglify/'),
      minimize: true,
      compressor: {
        warnings: false,
      },
    }),
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV),
      },
    }),
  ],
});
