/******************************************************************************
 * App object.
 *****************************************************************************/
define([
    'jquery',
    'backbone',
    'marionette',
    'fastclick',
    'log'
  ],
  function ($, Backbone, Marionette, FastClick, log) {
    var app = new Marionette.Application();

    app.navigate = function(route,  options = {}){
      Backbone.history.navigate(route, options);
    };

    app.getCurrentRoute = function(){
      return Backbone.history.fragment
    };

    app.on("before:start", function(){
      var RegionContainer = Marionette.LayoutView.extend({
        el: "#app",

        regions: {
          header: "#header",
          main: "#main"
        }
      });

      app.regions = new RegionContainer();
    });

    app.on("start", function () {
      //app.models = {};
      //app.models.user = new UserModel();
      //app.models.app = new AppModel();
      //app.models.sample = null; //to be set up on record opening
      //app.collections = {};
      //
      //app.records = Records;

      FastClick.attach(document.body);

      //turn off the loading splash screen
      $('div.loading').css('display', 'none');
      $('body').removeClass('loading');


      if (Backbone.history) {
        Backbone.history.start();

        if (this.getCurrentRoute() === '') {
          app.trigger('records:list');
        }

        $('#loader').remove();
      }

    });

    return app;
  });