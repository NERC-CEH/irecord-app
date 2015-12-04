/******************************************************************************
 * App object.
 *****************************************************************************/
define([
    'jquery',
    'backbone',
    'marionette',
    'fastclick',
    'log',
    'common/dialog_region',
    'common/controller'
  ],
  function ($, Backbone, Marionette, FastClick, log, DialogRegion, CommonController) {
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
          main: "#main",
          dialog: DialogRegion
        }
      });

      app.regions = new RegionContainer();
    });

    app.on("start", function () {
      FastClick.attach(document.body);

      //turn off the loading splash screen
      $('div.loading').css('display', 'none');
      $('body').removeClass('loading');

      if (Backbone.history) {
        Backbone.history.start();

        if (this.getCurrentRoute() === '') {
          app.trigger('records:list');
        }

        app.on('404:show', function () {
          CommonController.show({
            app: app,
            route: 'common/404/main',
            title: 404
          });
        });

        $('#loader').remove();
      }

    });

    return app;
  });