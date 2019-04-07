/** ****************************************************************************
 * A common webpack configuration.
 **************************************************************************** */
require('dotenv').config({ silent: true }); // get local environment variables from .env

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const pkg = require('../package.json');

const srcPath = path.resolve(__dirname, '../src');

const ROOT_DIR = path.resolve(__dirname, '../');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist/main');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

const config = {
  entry: [path.join(SRC_DIR, 'main.js'), path.join(SRC_DIR, 'vendor.js')],
  devtool: 'source-map',
  target: 'web',

  output: {
    path: DIST_DIR,
    filename: '[name].js',
  },
  resolve: {
    modules: [
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
      templates: 'common/templates',

      // vendor
      typeahead: 'typeahead.js/dist/typeahead.jquery',
      bootstrap: 'bootstrap/js/bootstrap',
      ratchet: 'ratchet/dist/js/ratchet',
      'photoswipe-lib': 'photoswipe/dist/photoswipe',
      'photoswipe-ui-default': 'photoswipe/dist/photoswipe-ui-default',
    },
  },
  module: {
    rules: [
      { test: /\.tpl/, loader: 'ejs-loader?variable=obj' },
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|vendor(?!\.js))/,
        loader: 'babel-loader',
      },
      {
        test: /(\.png)|(\.svg)|(\.jpg)/,
        loader: 'file-loader?name=images/[name].[ext]',
      },
      {
        test: /(\.woff)|(\.ttf)/,
        loader: 'file-loader?name=font/[name].[ext]',
      },
      {
        test: /\.s?[c|a]ss$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader?-url',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins() {
                return [autoprefixer('last 2 version')];
              },
            },
          },
          `sass-loader?includePaths[]=${srcPath}`,
        ],
      },
    ],
  },

  optimization: {
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },

  // ignore file sizes since cordova is localhost
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 10000000,
  },

  plugins: [
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
        APP_TRAINING: process.env.APP_TRAINING || false,
        APP_SCREENSHOTS: process.env.APP_SCREENSHOTS || false,
        APP_EXPERIMENTS: process.env.APP_EXPERIMENTS || false,
        APP_SENTRY_KEY: JSON.stringify(process.env.APP_SENTRY_KEY || ''),
        APP_GA: JSON.stringify(process.env.APP_GA || false),
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: true,
      sourceMap: true,
      chunksSortMode: 'dependency',
    }),
    new webpack.NamedModulesPlugin(),
  ],
  stats: {
    children: false,
  },
  cache: true,
};

if (process.env.NODE_ANALYZE) {
  config.plugins.push(new BundleAnalyzerPlugin());
}

if (process.env.APP_MANUAL_TESTING) {
  config.entry.push('./test/manual-test-utils.js');
}

if (process.env.APP_SCREENSHOTS) {
  config.entry.push('../other/cordova/screenshots-setup.js');
}

module.exports = config;
