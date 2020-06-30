/** ****************************************************************************
 * A common webpack configuration.
 **************************************************************************** */
require('dotenv').config({ silent: true }); // get local environment variables from .env
const checkEnv = require('@flumens/has-env');

checkEnv({
  warn: ['APP_TRAINING', 'APP_MANUAL_TESTING', 'APP_INDICIA_API_HOST'],
  required: [
    'APP_OS_MAP_KEY',
    'APP_MAPBOX_MAP_KEY',
    'APP_SENTRY_KEY',
    'APP_INDICIA_API_KEY',
  ],
});

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pkg = require('./package.json');

const ROOT_DIR = path.resolve(__dirname, './');
const DIST_DIR = path.resolve(ROOT_DIR, 'build');

const isDevEnv = process.env.NODE_ENV === 'development';
const isProdEnv = process.env.NODE_ENV === 'production';
const isTestEnv = process.env.NODE_ENV === 'test';

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: ['index.js', 'vendor.js'],
  devtool: 'source-map',
  target: 'web',

  output: {
    path: DIST_DIR,
    filename: '[name].js',
    publicPath: '/',
  },
  resolve: {
    modules: [
      path.resolve(ROOT_DIR, './node_modules/'),
      path.resolve(ROOT_DIR, './src/'),
      path.resolve(ROOT_DIR, './src/common/vendor'),
    ],
    alias: {
      Lib: 'common/Lib',
      Components: 'common/Components',
      config: 'common/config/config',
      helpers: 'common/helpers',
      saved_samples: 'common/saved_samples',
      sample: 'common/models/sample',
      occurrence: 'common/models/occurrence',
      app_model: 'common/models/app_model',
      user_model: 'common/models/user_model',
      model_factory: 'common/models/model_factory',
    },
  },
  module: {
    rules: [
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
          {
            loader: 'string-replace-loader',
            options: {
              search: './default-skin.svg',
              replace: '/images/default-skin.svg',
              flags: 'g',
            },
          },
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
          `sass-loader`,
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
      __ENV__: JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: isDevEnv,
      __PROD__: isProdEnv,
      __TEST__: isTestEnv,

      'process.env': {
        // package.json variables
        APP_BUILD: JSON.stringify(
          process.env.TRAVIS_BUILD_ID || pkg.build || new Date().getTime()
        ),
        APP_NAME: JSON.stringify(pkg.name), // no need to be an env value
        APP_VERSION: JSON.stringify(pkg.version), // no need to be an env value

        // mandatory env. variables
        APP_INDICIA_API_KEY: JSON.stringify(
          process.env.APP_INDICIA_API_KEY || ''
        ),
        APP_OS_MAP_KEY: JSON.stringify(process.env.APP_OS_MAP_KEY || ''),
        APP_MAPBOX_MAP_KEY: JSON.stringify(
          process.env.APP_MAPBOX_MAP_KEY || ''
        ),

        // compulsory env. variables
        APP_INDICIA_API_HOST: JSON.stringify(
          process.env.APP_INDICIA_API_HOST || ''
        ),
        APP_TRAINING: process.env.APP_TRAINING || false,
        APP_SCREENSHOTS: process.env.APP_SCREENSHOTS || false,
        APP_EXPERIMENTS: process.env.APP_EXPERIMENTS || false,
        APP_SENTRY_KEY: JSON.stringify(process.env.APP_SENTRY_KEY || ''),
        APP_GA: JSON.stringify(process.env.APP_GA || false),

        // https://github.com/webpack-contrib/karma-webpack/issues/316
        SAUCE_LABS: JSON.stringify(process.env.SAUCE_LABS),
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      sourceMap: true,
      // https://github.com/marcelklehr/toposort/issues/20
      chunksSortMode: 'none',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ],
  stats: {
    children: false,
  },
  cache: true,
  devServer: {
    historyApiFallback: true,
  },
};

if (process.env.APP_MANUAL_TESTING) {
  config.entry.push('./test/manual-test-utils.js');
}

if (process.env.APP_SCREENSHOTS) {
  config.entry.push('./other/cordova/screenshots-setup.js');
}

module.exports = config;
