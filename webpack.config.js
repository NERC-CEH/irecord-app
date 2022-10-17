/** ****************************************************************************
 * A common webpack configuration.
 **************************************************************************** */
require('dotenv').config({ silent: true });
const webpack = require('webpack');
const appConfig = require('@flumens/webpack-config');

const required = [
  'APP_BACKEND_CLIENT_ID',
  'APP_BACKEND_CLIENT_PASS',
  'APP_OS_MAP_KEY',
  'APP_MAPBOX_MAP_KEY',
  'APP_SENTRY_KEY',
];

const development = {
  APP_TRAINING: '',
  APP_MANUAL_TESTING: '',
  APP_BACKEND_URL: '',
  APP_BACKEND_INDICIA_URL: '',
  SAUCE_LABS: '',
};

appConfig.plugins.unshift(
  new webpack.EnvironmentPlugin(required),
  new webpack.EnvironmentPlugin(development)
);

module.exports = appConfig;
