/** ****************************************************************************
 * App object.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'marionette';
import FastClick from '../vendor/fastclick/js/fastclick';
import IndexedDBShim from '../vendor/IndexedDBShim/js/IndexedDBShim';
import Analytics from './helpers/analytics';
import Log from './helpers/log';
import Device from './helpers/device';
import CommonController from './components/common/controller';
import recordManager from './components/common/record_manager';
import DialogRegion from './components/common/dialog_region';
import HideableRegion from './components/common/hideable_region';

// init Analytics
Analytics.init();

const App = new Marionette.Application();

App.navigate = function (route, options = {}) {
  Log('App: navigating to ' + route);
  let defaultOptions = { trigger: true };
  Backbone.history.navigate(route, $.extend(defaultOptions, options));
};

App.getCurrentRoute = function () {
  return Backbone.history.fragment;
};

App.on('before:start', function () {
  Log('App: initializing main regions');
  var RegionContainer = Marionette.LayoutView.extend({
    el: '#app',

    regions: {
      header: new HideableRegion({ el: "#header" }),
      footer: new HideableRegion({ el: "#footer" }),
      main: '#main',
      dialog: DialogRegion
    }
  });

  App.regions = new RegionContainer();
});

App.on('start', function () {
  Log('App: starting');

  // Init for the first time
  // set up DB
  // when done - carry on with showing pages

  FastClick.attach(document.body);

  if (Backbone.history) {
    Backbone.history.start();

    if (this.getCurrentRoute() === '') {
      App.trigger('records:list');
    }

    App.on('404:show', function () {
      CommonController.show({
        App,
        route: 'common/404',
        title: 404,
      });
    });

    if (window.cordova) {
      Log('App: cordova setup');

      // Although StatusB  ar in the global scope, it is not available until after the deviceready event.
      document.addEventListener('deviceready', () => {
        Log('Showing the app.');

        window.StatusBar.overlaysWebView(true);
        window.StatusBar.backgroundColorByName('black');

        // iOS make space for statusbar
        if (Device.isIOS()) {
          $('body').addClass('ios');
        }

        // development loader
        $('#loader').remove();

        // hide loader
        if (navigator && navigator.splashscreen) {
          navigator.splashscreen.hide();
        }
      }, false);
    } else {
      // development loader
      $(document).ready(() => {
        $('#loader').remove();
      });
    }

    //$(document).ready(() => {
    //  // For screenshots capture only
    //  window.testing.screenshotsPopulate(recordManager);
    //});
  }
});

export { App as default };

