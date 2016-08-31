var _ = require('lodash');

const webpackConfig = require('./webpack.config.js');
const development = _.cloneDeep(webpackConfig);

// add manual tests
development.entry.testing = '../../test/manual-testing.js';

// development configuration
development.resolve.alias.config = 'config_dev';

module.exports = development;