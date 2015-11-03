/******************************************************************************
 * RequireJS configuration and app object construction.
 *****************************************************************************/
(function () {
  require.config({
    baseUrl: "scripts/",
    paths: {
      'conf': '', //replaced with grunt
      'jquery': 'libs/jquery.min',
      'jquery.mobile': 'libs/jquery.mobile.custom.min',
      'IndexedDBShim': 'libs/IndexedDBShim.min',
      'latlon': 'libs/osgridref.min',
      'latlon-ellipsoidal': 'libs/latlon-ellipsoidal.min',
      'vector3d': 'libs/vector3d.min',
      'dms': 'libs/dms.min',
      'fastclick': 'libs/fastclick.min',
      'morel': 'libs/morel',
      'underscore': 'libs/lodash.min',
      'backbone': 'libs/backbone.min',
      'marionette': 'libs/backbone.marionette.min',
      'backbone.localStorage': 'libs/backbone.localStorage-min'
    },
    shim: {
      'latlon': {deps: ['latlon-ellipsoidal']},
      'latlon-ellipsoidal': {deps: ['vector3d', 'dms']},
      'jquery.mobile': {deps: ['conf-jqm']},
      'backbone': {deps: ['jquery', 'underscore'], "exports": "Backbone"},
      'marionette': {deps: ['backbone']},
      'morel': {deps: ['IndexedDBShim']}
    },
    waitSeconds: 20
  });

  //Load the mighty app :)
  window.app = {};
  require(['conf-jqm', 'app'], function (jqmConf, App) {
    //jquery mobile - backbone configuration should be set up by this point.
    App.init();
  });

})();
