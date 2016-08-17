/** ****************************************************************************
 * App object.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'marionette';
import FastClick from '../vendor/fastclick/js/fastclick';
import Analytics from './helpers/analytics';
import RouterExt from './components/common/router_extension';
import Update from './helpers/update';
import Log from './helpers/log';
import Device from './helpers/device';
import CommonController from './components/common/controller';
import DialogRegion from './components/common/views/dialog_region';
import HideableRegion from './components/common/views/hideable_region';

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
  const RegionContainer = Marionette.LayoutView.extend({
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
  Log('App: starting');

  Update.run();

  FastClick.attach(document.body);

  if (Backbone.history) {
    Backbone.history.start();

    if (App.getCurrentRoute() === '') {
      App.trigger('records:list');
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
     import recordManager from './components/common/record_manager';
     $(document).ready(() => {
      // For screenshots capture only
      window.testing.screenshotsPopulate(recordManager);
    });
     */
  }
});

export { App as default };

