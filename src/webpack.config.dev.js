var path = require('path');

module.exports = {
  context: './src/scripts',
  entry: {
    app: './main.js',
    testing: '../../test/manual-testing.js',
  },
  output: {
    path: 'dist',
    filename: '[name].js', // Notice we use a variable
  },
  resolve: {
    root: [
      path.resolve('./src/scripts'),
      path.resolve('./src/vendor'),
    ],
    alias: {
      jquery: 'jquery/js/jquery',
      lodash: 'lodash/js/lodash',
      script: 'scriptjs/js/script.min',
      underscore: 'lodash/js/lodash',
      backbone: 'backbone/js/backbone',
      marionette: 'marionette/js/backbone.marionette',
      morel: 'morel/js/morel',
      leaflet: 'leaflet/js/leaflet',
      'Leaflet.GridRef': 'leaflet.gridref/js/L.GridRef',
      proj4leaflet: 'proj4Leaflet/js/proj4leaflet',
      LatLon: 'latlon/js/latlon-ellipsoidal',
      OsGridRef: 'latlon/js/osgridref',
      proj4: 'proj4/js/proj4',
      'photoswipe-lib': 'photoswipe/js/photoswipe',
      'photoswipe-ui-default': 'photoswipe/js/photoswipe-ui-default',
      config: 'config_dev',
      'master_list.data': 'data/master_list.data.json',
      'common_names.data': 'data/names_master_list.data.json',
      'informal_groups.data': 'data/informal_groups.data.js',
      typeahead: 'typeahead.js/js/typeahead.jquery',
    },
  },
  module: {
    loaders: [
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
        },
      },
      { test: /\.json/, loader: 'json' },
    ],
  },
};
