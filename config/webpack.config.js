var path = require('path');
var webpack = require('webpack');

module.exports = {
  context: './src/scripts',
  entry: {
    app: './main.js',
  },
  output: {
    path: 'dist/main',
    filename: '[name].js', // Notice we use a variable
  },
  resolve: {
    root: [
      path.resolve('./dist/_build'),
      path.resolve('./dist/_build/vendor'),
      path.resolve('./src/scripts'),
      path.resolve('./src/vendor'),
    ],
    alias: {
      // data
      'common_names.data': 'master_list_names.data.json',
      'master_list.data': 'master_list.data.json',
      'informal_groups.data': 'informal_groups.data.json',

      // helpers
      device: 'helpers/device',
      gps: 'helpers/gps',
      string: 'helpers/string',
      date: 'helpers/date',
      image: 'helpers/image',
      log: 'helpers/log',
      location: 'helpers/location',
      analytics: 'helpers/analytics',
      error: 'helpers/error',
      validate: 'helpers/validate',

      // vendor
      jquery: 'jquery/js/jquery',
      lodash: 'lodash/js/lodash',
      fastclick: 'fastclick/js/fastclick',
      typeahead: 'typeahead.js/js/typeahead.jquery',
      bootstrap: 'bootstrap/js/bootstrap',
      ratchet: 'ratchet/js/ratchet',
      indexedDBShim: 'IndexedDBShim/js/IndexedDBShim',
      hammer: 'hammerjs/js/hammer',
      underscore: 'lodash/js/lodash',
      backbone: 'backbone/js/backbone',
      'backbone.localStorage': 'backbone.localStorage/js/backbone.localStorage',
      marionette: 'marionette/js/backbone.marionette',
      morel: 'morel/js/morel',

      leaflet: 'leaflet/js/leaflet',
      OSOpenSpace: 'os-leaflet/js/OSOpenSpace',
      'Leaflet.GridRef': 'leaflet.gridref/js/L.GridRef',
      proj4leaflet: 'proj4Leaflet/js/proj4leaflet',
      LatLon: 'latlon/js/latlon-ellipsoidal',
      OsGridRef: 'latlon/js/osgridref',
      'latlon-ellipsoidal': 'latlon/js/latlon-ellipsoidal',
      proj4: 'proj4/js/proj4',

      'photoswipe-lib': 'photoswipe/js/photoswipe',
      'photoswipe-ui-default': 'photoswipe/js/photoswipe-ui-default',
},
  },
  module: {
    loaders: [
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel-loader',
      },
      { test: /\.json/, loader: 'json' },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      cacheFolder: path.resolve(__dirname, 'dist/_build/.cached_uglify/'),
      minimize: true,
      compressor: {
        warnings: false,
      },
    }),
  ],
  cache: true,
};
