/******************************************************************************
 * App object.
 *****************************************************************************/
define([
    'jquery',
    'jquery.mobile',
    'marionette',
    'fastclick',
    'morel',
    'routers/router',
    'models/app',
    'models/user',
    'app-config',
    'helpers/log'
  ],
  function ($, jqm, Marionette, FastClick, morel, Router, AppModel, UserModel, CONFIG) {
    var App = {
      init: function () {
        $.extend(true, morel.Sample.keys, CONFIG.morel.sample);
        $.extend(true, morel.Occurrence.keys, CONFIG.morel.occurrence);
        app.recordManager = new morel.Manager(CONFIG.morel.manager);

        app.models = {};
        app.models.user = new UserModel();
        app.models.app = new AppModel();
        app.models.sample = null; //to be set up on record opening
        app.collections = {};

        app.router = new Router();
        Backbone.history.start();

        FastClick.attach(document.body);

        //turn off the loading splash screen
        $('div.loading').css('display', 'none');
        $('body').removeClass('loading');
      }
    };
    return App;
  });