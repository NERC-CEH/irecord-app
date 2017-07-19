/** ****************************************************************************
 * A common webpack configuration.
 *****************************************************************************/
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const pkg = require('../package.json');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const sassLoaders = [
  'css-loader?-url',
  'postcss-loader',
  `sass-loader?includePaths[]=${path.resolve(__dirname, './src')}`,
];

module.exports = {
  context: './src/',
  entry: {
    app: './main.js',
    vendor: './vendor.js',
  },
  output: {
    path: 'dist/main',
    filename: '[name].js', // Notice we use a variable
  },
  resolve: {
    root: [
      path.resolve('./dist/_build'),
      path.resolve('./node_modules/'),
      path.resolve('./src/'),
      path.resolve('./src/common/vendor'),
    ],
    alias: {
      app: 'app',
      config: 'common/config/config',
      helpers: 'common/helpers',
      radio: 'common/radio',
      saved_samples: 'common/saved_samples',
      sample: 'common/models/sample',
      occurrence: 'common/models/occurrence',
      app_model: 'common/models/app_model',
      user_model: 'common/models/user_model',
      model_factory: 'common/models/model_factory',

      // vendor
      typeahead: 'typeahead.js/dist/typeahead.jquery',
      bootstrap: 'bootstrap/js/bootstrap',
      ratchet: 'ratchet/dist/js/ratchet',
      'photoswipe-lib': 'photoswipe/dist/photoswipe',
      'photoswipe-ui-default': 'photoswipe/dist/photoswipe-ui-default',
    },
  },
  module: {
    loaders: [
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|bower_components|vendor(?!\.js))/,
        loader: 'babel-loader',
      },
      { test: /\.json/, loader: 'json' },
      { test: /(\.png)|(\.svg)|(\.jpg)/, loader: 'file?name=images/[name].[ext]' },
      { test: /(\.woff)|(\.ttf)/, loader: 'file?name=font/[name].[ext]' },
      {
        test: /\.s?css$/,
        loader: ExtractTextPlugin.extract('style-loader', sassLoaders.join('!')),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor'],
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    // Extract environmental variables and replace references with values in the code
    new webpack.DefinePlugin({
      'process.env': {
        // package.json variables
        APP_BUILD: JSON.stringify(process.env.TRAVIS_BUILD_ID || pkg.build || new Date().getTime()),
        APP_NAME: JSON.stringify(pkg.name), // no need to be an env value
        APP_VERSION: JSON.stringify(pkg.version), // no need to be an env value

        // mandatory env. variables
        APP_INDICIA_API_KEY: JSON.stringify(process.env.APP_INDICIA_API_KEY || ''),
        APP_OS_MAP_KEY: JSON.stringify(process.env.APP_OS_MAP_KEY || ''),
        APP_MAPBOX_MAP_KEY: JSON.stringify(process.env.APP_MAPBOX_MAP_KEY || ''),

        // compulsory env. variables
        APP_INDICIA_API_HOST: JSON.stringify(process.env.APP_INDICIA_API_HOST || ''),
        APP_TRAINING: JSON.stringify(process.env.APP_TRAINING || false),
        APP_EXPERIMENTS: JSON.stringify(process.env.APP_EXPERIMENTS || false),
        APP_SENTRY_KEY: JSON.stringify(process.env.APP_SENTRY_KEY || ''),
        APP_GA: JSON.stringify(process.env.APP_GA || false),
      },
    }),
    new CircularDependencyPlugin(),
  ],
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions'],
    }),
  ],
  stats: {
    children: false,
  },
  cache: true,
};
