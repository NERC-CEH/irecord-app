/** ****************************************************************************
 * App object.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import FastClick from 'fastclick';
import { Log, Update, Analytics, Device } from 'helpers';
import CommonController from './common/controller';
import DialogRegion from './common/views/dialog_region';
import HideableRegion from './common/views/hideable_region';
import './common/router_extension';

// init Analytics
Analytics.init();

const App = new Marionette.Application();

App.navigate = (route, options = {}) => {
  Log(`App: navigating to ${route}`);
  const defaultOptions = { trigger: true };
  Backbone.history.navigate(route, $.extend(defaultOptions, options));
};

App.restart = () => {
  window.location.href = '/';
};

App.getCurrentRoute = () => Backbone.history.fragment;

App.on('before:start', () => {
  Log('App: initializing main regions');
  const RegionContainer = Marionette.View.extend({
    el: '#app',

    regions: {
      header: new HideableRegion({ el: '#header' }),
      footer: new HideableRegion({ el: '#footer' }),
      main: '#main',
      dialog: DialogRegion,
    },
  });

  App.regions = new RegionContainer();
});

App.on('start', () => {
  // update app first
  Update.run(() => {
    // release the beast
    Log('App: starting');

    FastClick.attach(document.body);

    if (Backbone.history) {
      Backbone.history.start();

      if (App.getCurrentRoute() === '') {
        App.trigger('home');
      }

      App.on('404:show', () => {
        CommonController.show({
          App,
          route: 'common/404',
          title: 404,
        });
      });

      if (window.cordova) {
        Log('App: cordova setup');

        // Although StatusB  ar in the global scope,
        // it is not available until after the deviceready event.
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

          Analytics.trackEvent('App', 'initialized');
        }, false);
      } else {
        // development loader
        $(document).ready(() => {
          $('#loader').remove();
        });
      }

      /**
       import recordManager from './common/record_manager';
       $(document).ready(() => {
         // For screenshots capture only
          window.testing.screenshotsPopulate(recordManager);
        });
       */
    }
  });
});

export { App as default };

