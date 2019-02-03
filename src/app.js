/** ****************************************************************************
 * App object.
 **************************************************************************** */
// polyfills
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/fn/object/assign';
import 'core-js/fn/array/fill';
import 'core-js/fn/array/includes';
import 'core-js/fn/string/includes';

import $ from 'jquery';
import React from 'react'; // eslint-disable-line
import ReactDOM from 'react-dom';
import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import radio from 'radio';
import Log from 'helpers/log';
import Update from 'helpers/update';
import Device from 'helpers/device';
import Analytics from 'helpers/analytics';
import 'helpers/translator';
import appModel from 'app_model';
import userModel from 'user_model';
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
  const modelsInit = Promise.all([appModel._init, userModel._init]);
  modelsInit.then(() => {
    // update app first
    Update.run(() => {
      // release the beast
      Log('App: starting.');

      if (Backbone.history) {
        Backbone.history.stop(); // https://stackoverflow.com/questions/7362989/backbone-history-has-already-been-started
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

              if (Device.isIOS()) {
                window.Keyboard.shrinkView(true);
                window.Keyboard.disableScrollingInShrinkView(true);
                window.Keyboard.automaticScrollToTopOnHiding = true;

              // iOS make space for statusbar
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
            appModel.resetDefaults();
            window.screenshotsPopulate();
          });
        }
      }
    });
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
      // TODO: for some reason the unmount function is sometimes not found
      Log("App: main view React DOM unmount did't happen", 'w');
    }
    region.show(view);
    return;
  }

  if (region.currentView) {
    region.currentView.destroy();
  }
  ReactDOM.render(view, document.getElementById('main'));
});

radio.on('app:header', view => {
  const region = App.regions.getRegion('header');
  if (view instanceof Backbone.View) {
    if (ReactDOM.unmountComponentAtNode && region.$el[0]) {
      ReactDOM.unmountComponentAtNode(region.$el[0]);
    } else {
      // TODO: for some reason the unmount function is sometimes not found
      Log("App: header view React DOM unmount did't happen", 'w');
    }
    region.show(view);
    return;
  }

  if (region.currentView) {
    region.currentView.destroy();
  }
  $(region.$el[0]).show();
  ReactDOM.render(view, region.$el[0]);
});

radio.on('app:footer', view => {
  const region = App.regions.getRegion('footer');
  if (view instanceof Backbone.View) {
    if (ReactDOM.unmountComponentAtNode && region.$el[0]) {
      ReactDOM.unmountComponentAtNode(region.$el[0]);
    } else {
      // TODO: for some reason the unmount function is sometimes not found
      Log("App: footer view React DOM unmount did't happen", 'w');
    }
    region.show(view);
    return;
  }

  if (region.currentView) {
    region.currentView.destroy();
  }
  $(region.$el[0]).show();
  ReactDOM.render(view, region.$el[0]);
});

radio.on('app:main:hide', options => {
  App.regions
    .getRegion('main')
    .hide(options)
    .empty();
});

radio.on('app:header:hide', options => {
  const region = App.regions.getRegion('header');
  ReactDOM.unmountComponentAtNode(region.$el[0]);
  region.hide(options).empty();
});

radio.on('app:footer:hide', options => {
  const region = App.regions.getRegion('footer');
  ReactDOM.unmountComponentAtNode(region.$el[0]);
  region.hide(options).empty();
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
