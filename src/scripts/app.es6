/******************************************************************************
 * App object.
 *****************************************************************************/
define([
    'jquery',
    'backbone',
    'marionette',
    'fastclick',
    'log',
    'brcart',
    'analytics',
    'app-config',
    'common/dialog_region',
    'common/controller'
  ],
  function ($, Backbone, Marionette, FastClick, Log, BrcArt, Analytics, CONFIG, DialogRegion, CommonController) {
    //init Analytics
    Analytics.init();

    Log(BrcArt, 'i'); //saying hello :)

    var App = new Marionette.Application();

    App.navigate = function(route,  options = {}){
      Backbone.history.navigate(route, options);
    };

    App.getCurrentRoute = function(){
      return Backbone.history.fragment
    };

    App.on("before:start", function(){
      var RegionContainer = Marionette.LayoutView.extend({
        el: "#app",

        regions: {
          header: "#header",
          main: "#main",
          dialog: DialogRegion
        }
      });

      App.regions = new RegionContainer();
    });

    App.on("start", function () {
      // Init for the first time
      // download appcache
      // set up DB
      // when done - carry on with showing pages

      FastClick.attach(document.body);

      //turn off the loading splash screen
      $('div.loading').css('display', 'none');
      $('body').removeClass('loading');

      if (Backbone.history) {
        Backbone.history.start();

        if (this.getCurrentRoute() === '') {
          App.trigger('records:list');
        }

        App.on('404:show', function () {
          CommonController.show({
            App: App,
            route: 'common/404',
            title: 404
          });
        });

        $('#loader').remove();
      }
    });

    return App;
  });