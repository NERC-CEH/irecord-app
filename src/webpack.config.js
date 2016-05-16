var path = require('path');

module.exports = {
    context: './src/scripts',
    entry: {
      app: './main.js',
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
        proj4leaflet: 'proj4Leaflet/js/proj4leaflet',
        proj4: 'proj4/js/proj4',
        config: 'config',
        'photoswipe-lib': 'photoswipe/js/photoswipe.min',
        'photoswipe-ui-default': 'photoswipe/js/photoswipe-ui-default.min',
        'common_names.data': 'data/common_names.data.json',
        'master_list.data': 'data/master_list.data.json',
        'informal_groups.data': 'data/informal_groups.data.js',
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
  };
