/** ****************************************************************************
 * App object.
 **************************************************************************** */
// polyfills
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'es6-promise/auto';

import $ from 'jquery';
import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import FastClick from 'fastclick';
import radio from 'radio';
import Log from 'helpers/log';
import Update from 'helpers/update';
import Device from 'helpers/device';
import Analytics from 'helpers/analytics';
import 'helpers/translator';
import appModel from 'app_model';
import CommonController from './common/controller';
import DialogRegion from './common/views/dialog_region';
import HideableRegion from './common/views/hideable_region';
import './common/router_extension';

const App = new Marionette.Application();

App.navigate = (route, options = {}) => {
  Log(`App: navigating to ${route}.`);
  const defaultOptions = { trigger: false };
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
        if (appModel.get('showWelcome')) {
          radio.trigger('info:welcome');
        } else {
          radio.trigger('samples:list');
        }
      }

      if (window.cordova) {
        Log('App: cordova setup.');

        // Although StatusB  ar in the global scope,
        // it is not available until after the deviceready event.
        document.addEventListener(
          'deviceready',
          () => {
            Log('Showing the app.');

            // iOS make space for statusbar
            if (Device.isIOS()) {
              $('body').addClass('ios');
            }

            // hide loader
            if (navigator && navigator.splashscreen) {
              navigator.splashscreen.hide();
            }

            Analytics.trackEvent('App', 'initialized');
          },
          false
        );
      }

      // For screenshots capture only
      if (process.env.APP_SCREENSHOTS) {
        $(document).ready(() => {
          appModel.clear().set(appModel.defaults);
          appModel.save();
          window.screenshotsPopulate();
        });
      }
    }
  });
});

// events
radio.on('app:restart', App.restart);

radio.on('app:dialog', options => {
  App.regions.getRegion('dialog').show(options);
});
radio.on('app:dialog:hide', options => {
  App.regions.getRegion('dialog').hide(options);
});
radio.on('app:dialog:error', options => {
  App.regions.getRegion('dialog').error(options);
});

radio.on('app:main', view => {
  const region = App.regions.getRegion('main');
  if (view instanceof Backbone.View) {
    if (ReactDOM.unmountComponentAtNode && region.$el[0]) {
      ReactDOM.unmountComponentAtNode(region.$el[0]);
    } else {
      // todo: for some reason the unmount function is sometimes not found
      Log("App: main view React DOM unmount did't happen", 'w');
    }
    region.show(view);
    return;
  }

  ReactDOM.render(view, region.$el[0]);
});

radio.on('app:header', view => {
  const region = App.regions.getRegion('header');
  if (view instanceof Backbone.View) {
    if (ReactDOM.unmountComponentAtNode && region.$el[0]) {
      ReactDOM.unmountComponentAtNode(region.$el[0]);
    } else {
      // todo: for some reason the unmount function is sometimes not found
      Log("App: header view React DOM unmount did't happen", 'w');
    }
    region.show(view);
    return;
  }

  ReactDOM.render(view, region.$el[0]);
});

radio.on('app:footer', view => {
  App.regions.getRegion('footer').show(view);
});
radio.on('app:main:hide', options => {
  App.regions
    .getRegion('main')
    .hide(options)
    .empty();
});
radio.on('app:header:hide', options => {
  App.regions
    .getRegion('header')
    .hide(options)
    .empty();
});
radio.on('app:footer:hide', options => {
  App.regions
    .getRegion('footer')
    .hide(options)
    .empty();
});

radio.on('app:loader', () => {
  App.regions.getRegion('dialog').showLoader();
});
radio.on('app:loader:hide', () => {
  App.regions.getRegion('dialog').hideLoader();
});

radio.on('app:404:show', () => {
  CommonController.show({
    App,
    route: 'common/404',
    title: 404,
  });
});

export { App as default };
