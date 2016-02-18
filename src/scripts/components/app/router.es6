define([
  'marionette',
  'log',
  'app',
  'app-config',
  'common/controller',
  './info/controller',
  './settings/controller'
], function(Marionette, Log, App, CONFIG, CommonController, InfoController, SettingsController) {
  App.info = {};

  App.info.Router = Marionette.AppRouter.extend({
    routes: {
      "app/info(/)": InfoController.show,
      "app/about(/)": function() {
        CommonController.show({
          title: 'About', App: App, route: 'app/about/main',
          model: {version: CONFIG.version}
        })},
      "app/help(/)": function() {
        CommonController.show({
          title: 'Help', App: App, route: 'app/help/main'
        })},
      "app/privacy(/)": function() {
        CommonController.show({
          title: 'Privacy Policy', App: App, route: 'app/privacy/main'
        })},
      "app/brc-approved(/)": function() {
        CommonController.show({
          title: 'BRC Approved', App: App, route: 'app/brc_approved/main'
        })},
      "app/credits(/)": function() {
        CommonController.show({
          title: 'Credits', App: App, route: 'app/credits/main'
        })},
      "app/settings(/)": SettingsController.show,
      "app/*path": function () {App.trigger('404:show')}
    }
  });

  App.on("app:info", function() {
    App.navigate('app/info');
    InfoController.show();
  });

  App.on("app:about", function() {
    App.navigate('app/about');
    CommonController.show({
      title: 'About', App: App, route: 'app/about/main',
      model: {version: CONFIG.version}
    });
  });

  App.on("app:help", function() {
    App.navigate('app/help');
    CommonController.show({
      title: 'Help', App: App, route: 'app/help/main'
    });
  });

  App.on("app:privacy", function() {
    App.navigate('app/privacy');
    CommonController.show({
      title: 'Privacy Policy', App: App, route: 'app/privacy/main'
    });
  });

  App.on("app:brc-approved", function() {
    App.navigate('app/brc-approved');
    CommonController.show({
      title: 'BRC Approved', App: App, route: 'app/brc_approved/main'
    });
  });

  App.on("app:credits", function() {
    App.navigate('app/credits');
    CommonController.show({
      title: 'Credits', App: App, route: 'app/credits/main'
    });
  });

  App.on("app:settings", function() {
    App.navigate('app/settings');
    CommonController.show({
      title: 'Settings', App: App, route: 'app/settings/main'
    });
  });


  App.on('before:start', function(){
    new App.info.Router();
  });
});
