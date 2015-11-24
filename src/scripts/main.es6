/******************************************************************************
 * RequireJS configuration and app object construction.
 *****************************************************************************/
(function () {
  require.config({
    baseUrl: "scripts/",
    paths: {
      'app-config': '{CONFIG}', //replaced on build
      'ratchet': 'libs/ratchet',
      'jquery': 'libs/jquery',
      'IndexedDBShim': 'libs/IndexedDBShim.min',
      'latlon': 'libs/osgridref.min',
      'latlon-ellipsoidal': 'libs/latlon-ellipsoidal.min',
      'vector3d': 'libs/vector3d.min',
      'dms': 'libs/dms.min',
      'fastclick': 'libs/fastclick.min',
      'morel': 'libs/morel',
      'underscore': 'libs/lodash',
      'backbone': 'libs/backbone',
      'marionette': 'libs/backbone.marionette',
      'backbone.localStorage': 'libs/backbone.localStorage-min',
      'common': 'components/common',
      'log': 'components/common/log'
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
    'components/app/router'
  ], function (app) {
    app.start();
  });

})();
