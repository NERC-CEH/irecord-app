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
      path.resolve('./src/vendor')
    ],
    alias: {
      jquery: 'jquery/js/jquery',
      backbone: 'backbone/js/backbone',
      leaflet: 'leaflet/js/leaflet',
      proj4leaflet: 'proj4Leaflet/js/proj4leaflet',
      proj4: 'proj4/js/proj4',
      config: 'config_dev',
      'master_list.data': './data/master_list_dev.data',
    },
  },
  module: {
    loaders: [
      {
        test: /^((?!data\.).)*\.js$/,
        exclude: /(node_modules|bower_components|vendor)/,
        loader: 'babel-loader',
      },
    ],
  },
};
