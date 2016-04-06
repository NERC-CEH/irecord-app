/******************************************************************************
 * Info router.
 *****************************************************************************/
import Backbone from 'backbone';
import Marionette from 'marionette';
import App from '../../app';
import log from '../../helpers/log';
import CONFIG from 'config'; // Replaced with alias

import CommonController from '../common/controller';
import InfoMenuController from './menu/controller';

App.info = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'info(/)': InfoMenuController.show,
    'info/about(/)'() {
      CommonController.show({
        title: 'About', App, route: 'info/about/main',
        model: new Backbone.Model({ version: CONFIG.version }),
      });},
    'info/help(/)'() {
      CommonController.show({
        title: 'Help', App, route: 'info/help/main',
      });},
    'info/privacy(/)'() {
      CommonController.show({
        title: 'Privacy Policy', App, route: 'info/privacy/main',
      });},
    'info/brc-approved(/)'() {
      CommonController.show({
        title: 'BRC Approved', App, route: 'info/brc_approved/main',
      });},
    'info/credits(/)'() {
      CommonController.show({
        title: 'Credits', App, route: 'info/credits/main',
      });},
    'info/*path'() {App.trigger('404:show');},
  },
});

App.on('info', () => {
  App.navigate('info');
  InfoMenuController.show();
});

App.on('info:about', () => {
  App.navigate('info/about');
  CommonController.show({
    title: 'About', App, route: 'info/about/main',
    model: new Backbone.Model({ version: CONFIG.version }),
  });
});

App.on('info:help', () => {
  App.navigate('info/help');
  CommonController.show({
    title: 'Help', App, route: 'info/help/main',
  });
});

App.on('info:privacy', () => {
  App.navigate('info/privacy');
  CommonController.show({
    title: 'Privacy Policy', App, route: 'info/privacy/main',
  });
});

App.on('info:brc-approved', () => {
  App.navigate('info/brc-approved');
  CommonController.show({
    title: 'BRC Approved', App, route: 'info/brc_approved/main',
  });
});

App.on('info:credits', () => {
  App.navigate('info/credits');
  CommonController.show({
    title: 'Credits', App, route: 'info/credits/main',
  });
});

App.on('before:start', () => {
  log('Info:router: initializing');
  App.info.router = new Router();
});
