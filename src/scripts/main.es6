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
      'zepto': '../vendor/zepto.min',
      'zepto-custom': '../vendor/zepto-custom',
      'deferred': '../vendor/deferred.min',
      'IndexedDBShim': '../vendor/IndexedDBShim.min',
      'latlon': '../vendor/osgridref.min',
      'latlon-ellipsoidal': '../vendor/latlon-ellipsoidal.min',
      'vector3d': '../vendor/vector3d.min',
      'dms': '../vendor/dms.min',
      'fastclick': '../vendor/fastclick.min',
      'morel': '../vendor/morel',
      'underscore': '../vendor/lodash.min',
      'backbone': '../vendor/backbone.min',
      'marionette': '../vendor/backbone.marionette.min',
      'backbone.localStorage': '../vendor/backbone.localStorage-min',
      'hammerjs': '../vendor/hammer.min',
      'leaflet': '../vendor/leaflet',
      'proj4': '../vendor/proj4',
      'proj4leaflet': '../vendor/proj4leaflet',
      'os-leaflet':'../vendor/OSOpenSpace',
      'ga': '//www.google-analytics.com/analytics',

      //shorthands
      'common': 'components/common',

      //common pages
      'common/location': 'components/common/pages/location',
      'common/taxon': 'components/common/pages/taxon',

      //helpers
      'log': 'helpers/log',
      'analytics': 'helpers/analytics',
      'gps': 'helpers/gps',
      'UUID': 'helpers/UUID',
      'browser': 'helpers/browser',
      'validate': 'helpers/validate',
      'location': 'helpers/location',
      'error': 'helpers/error',
      'date_extension': 'helpers/date_extension',
      'string_extension': 'helpers/string_extension',
      'router_extension': 'helpers/router_extension',
      'brcart': 'helpers/brcart'
    },
    //For using Zepto see this:
    //http://simonsmith.io/using-zepto-and-jquery-with-requirejs/
    map: {
      '*': {
        'jquery': 'zepto-custom'
      },
      'zepto-custom': {
        'zepto': 'zepto'
      }
    },
    shim: {
      'zepto': {exports: 'Zepto', deps: ['deferred']},
      'latlon': {deps: ['latlon-ellipsoidal']},
      'latlon-ellipsoidal': {deps: ['vector3d', 'dms']},
      'backbone': {deps: ['jquery', 'underscore'], "exports": "Backbone"},
      'marionette': {deps: ['backbone']},
      'morel': {deps: ['backbone', 'IndexedDBShim']},
      'os-leaflet': {deps: ['proj4leaflet']},
      'ga': {exports: "__ga__"}
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
