/** ****************************************************************************
 * App object.
 *****************************************************************************/
// polyfills
import 'es6-promise/auto';

import $ from 'jquery';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import FastClick from 'fastclick';
import radio from 'radio';
import Log from 'helpers/log';
import Update from 'helpers/update';
import Analytics from 'helpers/analytics';
import Device from 'helpers/device';
import CommonController from './common/controller';
import DialogRegion from './common/views/dialog_region';
import HideableRegion from './common/views/hideable_region';
import './common/router_extension';
// import '../test/manual-testing';

// init Analytics
Analytics.init();

const App = new Marionette.Application();

App.navigate = (route, options = {}) => {
  Log(`App: navigating to ${route}.`);
  const defaultOptions = { trigger: true };
  Backbone.history.navigate(route, $.extend(defaultOptions, options));
};

App.restart = () => {
  window.location.href = '/';
};

App.getCurrentRoute = () => Backbone.history.fragment;

App.on('before:start', () => {
  Log('App: initializing main regions.');
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
    Log('App: starting.');

    FastClick.attach(document.body);

    if (Backbone.history) {
      Backbone.history.start();

      if (App.getCurrentRoute() === '') {
        radio.trigger('samples:list');
      }

      if (window.cordova) {
        Log('App: cordova setup.');

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
       import savedSamples from 'saved_samples';
       $(document).ready(() => {
         // For screenshots capture only
          window.testing.screenshotsPopulate(savedSamples);
        });
       */
    }
  });
});

// events
radio.on('app:restart', App.restart);

radio.on('app:dialog', (options) => {
  App.regions.getRegion('dialog').show(options);
});
radio.on('app:dialog:hide', (options) => {
  App.regions.getRegion('dialog').hide(options);
});
radio.on('app:dialog:error', (options) => {
  App.regions.getRegion('dialog').error(options);
});

radio.on('app:main', (options) => {
  App.regions.getRegion('main').show(options);
});
radio.on('app:header', (options) => {
  App.regions.getRegion('header').show(options);
});
radio.on('app:footer', (options) => {
  App.regions.getRegion('footer').show(options);
});
radio.on('app:main:hide', (options) => {
  App.regions.getRegion('main').hide(options).empty();
});
radio.on('app:header:hide', (options) => {
  App.regions.getRegion('header').hide(options).empty();
});
radio.on('app:footer:hide', (options) => {
  App.regions.getRegion('footer').hide(options).empty();
});

radio.on('app:404:show', () => {
  CommonController.show({
    App,
    route: 'common/404',
    title: 404,
  });
});

export { App as default };

