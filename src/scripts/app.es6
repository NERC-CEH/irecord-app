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
    'common/hideable_region',
    'common/controller'
  ],
  function ($, Backbone, Marionette, FastClick, Log, BrcArt, Analytics, CONFIG, DialogRegion, HideableRegion, CommonController) {
    //init Analytics
    Analytics.init();

    Log(BrcArt, 'i'); //saying hello :)

    var App = new Marionette.Application();

    App.navigate = function(route,  options = {}){
      let defaultOptions = {trigger: true};
      Backbone.history.navigate(route, $.extend(defaultOptions, options));
    };

    App.getCurrentRoute = function(){
      return Backbone.history.fragment
    };

    App.on("before:start", function(){
      var RegionContainer = Marionette.LayoutView.extend({
        el: "#app",

        regions: {
          header: new HideableRegion({el: "#header"}),
          footer: new HideableRegion({el: "#footer"}),
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

        if (window.cordova) {
          StatusBar.overlaysWebView(true);
          StatusBar.backgroundColorByName('black');

          //iOS make space for statusbar
          if (window.deviceIsIOS) {
            $('body').addClass('ios')
          }
        }
      }
    });

    return App;
  });