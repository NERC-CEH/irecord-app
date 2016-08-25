var path = require('path');

const webpackConfig = require('./webpack.config.js');

// add manual tests
webpackConfig.entry.testing = '../../test/manual-testing.js';

// development configuration
webpackConfig.resolve.alias.config = 'config_dev';

module.exports = webpackConfig;