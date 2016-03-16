import Backbone from '../../../vendor/backbone/js/backbone';
import Marionette from '../../../vendor/marionette/js/backbone.marionette';
import App from '../../app';
import CONFIG from 'config'; // Replaced with alias

import CommonController from '../common/controller';
import InfoMenuController from './menu/controller';

App.info = {};

App.info.Router = Marionette.AppRouter.extend({
  routes: {
    "info(/)": InfoMenuController.show,
    "info/about(/)": function() {
      CommonController.show({
        title: 'About', App: App, route: 'info/about/main',
        model: new Backbone.Model({version: CONFIG.version})
      })},
    "info/help(/)": function() {
      CommonController.show({
        title: 'Help', App: App, route: 'info/help/main'
      })},
    "info/privacy(/)": function() {
      CommonController.show({
        title: 'Privacy Policy', App: App, route: 'info/privacy/main'
      })},
    "info/brc-approved(/)": function() {
      CommonController.show({
        title: 'BRC Approved', App: App, route: 'info/brc_approved/main'
      })},
    "info/credits(/)": function() {
      CommonController.show({
        title: 'Credits', App: App, route: 'info/credits/main'
      })},
    "info/*path": function () {App.trigger('404:show')}
  }
});

App.on("info", function() {
  App.navigate('info');
  InfoMenuController.show();
});

App.on("info:about", function() {
  App.navigate('info/about');
  CommonController.show({
    title: 'About', App: App, route: 'info/about/main',
    model: new Backbone.Model({version: CONFIG.version})
  });
});

App.on("info:help", function() {
  App.navigate('info/help');
  CommonController.show({
    title: 'Help', App: App, route: 'info/help/main'
  });
});

App.on("info:privacy", function() {
  App.navigate('info/privacy');
  CommonController.show({
    title: 'Privacy Policy', App: App, route: 'info/privacy/main'
  });
});

App.on("info:brc-approved", function() {
  App.navigate('info/brc-approved');
  CommonController.show({
    title: 'BRC Approved', App: App, route: 'info/brc_approved/main'
  });
});

App.on("info:credits", function() {
  App.navigate('info/credits');
  CommonController.show({
    title: 'Credits', App: App, route: 'info/credits/main'
  });
});

App.on('before:start', function(){
  new App.info.Router();
});
