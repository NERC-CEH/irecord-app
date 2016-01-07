define([
  'marionette',
  'log',
  'app',
  'app-config',
  'common/controller',
  './info/controller',
  './settings/controller'
], function(Marionette, log, app, CONFIG, CommonController, InfoController, SettingsController) {
  app.info = {};

  app.info.Router = Marionette.AppRouter.extend({
    routes: {
      "app/info": InfoController.show,
      "app/about": function() {
        CommonController.show({
          title: 'About', app: app, route: 'app/about/main',
          model: {version: CONFIG.version}
        })},
      "app/privacy": function() {
        CommonController.show({
          title: 'Privacy Policy', app: app, route: 'app/privacy/main'
        })},
      "app/brc-approved": function() {
        CommonController.show({
          title: 'BRC Approved', app: app, route: 'app/brc_approved/main'
        })},
      "app/credits": function() {
        CommonController.show({
          title: 'Credits', app: app, route: 'app/credits/main'
        })},
      "app/settings": SettingsController.show,
      "app/*path": function () {app.trigger('404:show')}
    }
  });

  app.on("app:info", function() {
    app.navigate('app/info');
    InfoController.show();
  });

  app.on("app:about", function() {
    app.navigate('app/about');
    CommonController.show({
      title: 'About', app: app, route: 'app/about/main',
      model: {version: CONFIG.version}
    });
  });

  app.on("app:privacy", function() {
    app.navigate('app/privacy');
    CommonController.show({
      title: 'Privacy Policy', app: app, route: 'app/privacy/main'
    });
  });

  app.on("app:brc-approved", function() {
    app.navigate('app/brc-approved');
    CommonController.show({
      title: 'BRC Approved', app: app, route: 'app/brc_approved/main'
    });
  });

  app.on("app:credits", function() {
    app.navigate('app/credits');
    CommonController.show({
      title: 'Credits', app: app, route: 'app/credits/main'
    });
  });

  app.on("app:settings", function() {
    app.navigate('app/settings');
    CommonController.show({
      title: 'Settings', app: app, route: 'app/settings/main'
    });
  });


  app.on('before:start', function(){
    new app.info.Router();
  });
});
