/******************************************************************************
 * RequireJS configuration and app object construction.
 *****************************************************************************/
(function () {
  require.config({
    baseUrl: "scripts/",
    paths: {
      //config
      'app-config': '{CONFIG}', //replaced on build

      //libraries
      'ratchet': '../vendor/ratchet',
      'jquery': '../vendor/jquery',
      'IndexedDBShim': '../vendor/IndexedDBShim.min',
      'latlon': '../vendor/osgridref.min',
      'latlon-ellipsoidal': '../vendor/latlon-ellipsoidal.min',
      'vector3d': '../vendor/vector3d.min',
      'dms': '../vendor/dms.min',
      'fastclick': '../vendor/fastclick.min',
      'morel': '../vendor/morel',
      'underscore': '../vendor/lodash',
      'backbone': '../vendor/backbone',
      'marionette': '../vendor/backbone.marionette',
      'backbone.localStorage': '../vendor/backbone.localStorage-min',
      'hammerjs': '../vendor/hammer',
      'leaflet': '../vendor/leaflet',
      'proj4': '../vendor/proj4',
      'proj4leaflet': '../vendor/proj4leaflet',
      'os-leaflet':'../vendor/OSOpenSpace',

      //shorthands
      'common': 'components/common',

      //common pages
      'common/location': 'components/common/pages/location',
      'common/taxon': 'components/common/pages/taxon',

      //helpers
      'log': 'helpers/log',
      'gps': 'helpers/gps',
      'browser': 'helpers/browser',
      'validate': 'helpers/validate',
      'location': 'helpers/location',
      'error': 'helpers/error',
      'date_extension': 'helpers/date_extension',
      'string_extension': 'helpers/string_extension',
      'router_extension': 'helpers/router_extension',
      'brcart': 'helpers/brcart'
    },
    shim: {
      'latlon': {deps: ['latlon-ellipsoidal']},
      'latlon-ellipsoidal': {deps: ['vector3d', 'dms']},
      'backbone': {deps: ['jquery', 'underscore'], "exports": "Backbone"},
      'marionette': {deps: ['backbone']},
      'morel': {deps: ['backbone', 'IndexedDBShim']},
      'os-leaflet': {deps: ['proj4leaflet']}
    },
    waitSeconds: 30
  });

  //Load the mighty app :)
  require([
    'app',
    'ratchet',
    'components/records/router',
    'components/app/router',
    'components/user/router'
  ], function (App) {
    App.start();
  });

})();
