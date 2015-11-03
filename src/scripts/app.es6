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
    'helpers/log'
  ],
  function ($, jqm, Marionette, FastClick, morel, Router, AppModel, UserModel) {
    var App = {
      init: function () {
        //init data
        app.recordManager = new morel.Manager(app.CONF.morel);

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