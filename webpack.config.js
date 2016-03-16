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
      root: './src/',
      alias: {
        jquery: 'vendor/jquery/js/jquery',
        backbone: 'vendor/backbone/js/backbone',
        leaflet: 'vendor/leaflet/js/leaflet',
        proj4leaflet: 'vendor/proj4Leaflet/js/proj4leaflet',
        proj4: 'vendor/proj4/js/proj4',
        config: 'scripts/config',
        'master_list.data': './data/master_list.data',
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
