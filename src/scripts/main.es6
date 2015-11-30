/******************************************************************************
 * RequireJS configuration and app object construction.
 *****************************************************************************/
(function () {
  require.config({
    baseUrl: "scripts/",
    paths: {
      'app-config': '{CONFIG}', //replaced on build
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
      'common': 'components/common',
      'log': 'helpers/log'
    },
    shim: {
      'latlon': {deps: ['latlon-ellipsoidal']},
      'latlon-ellipsoidal': {deps: ['vector3d', 'dms']},
      'backbone': {deps: ['jquery', 'underscore'], "exports": "Backbone"},
      'marionette': {deps: ['backbone']},
      'morel': {deps: ['IndexedDBShim']}
    },
    waitSeconds: 20
  });

  //Load the mighty app :)
  require([
    'app',
    'ratchet',
    'components/records/router',
    'components/app/router',
    'components/user/router'
  ], function (app) {
    app.start();
  });

})();
