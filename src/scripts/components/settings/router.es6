define([
  'backbone',
  'marionette',
  'log',
  'app',
  'app-config',
  'common/controller',
  './menu/controller',
  './locations/controller',
  'common/app_model'
], function(Backbone, Marionette, Log, App, CONFIG, CommonController, MenuController, LocationsController, appModel) {
  App.settings = {};

  App.settings.Router = Marionette.AppRouter.extend({
    routes: {
      "settings(/)": MenuController.show,
      "settings/locations(/)": LocationsController.show,
      "settings/*path": function () {App.trigger('404:show')}
    }
  });

  App.on("settings", function() {
    App.navigate('settings/menu');
    CommonController.show({
      title: 'Settings', App: App, route: 'settings/menu'
    });
  });

  App.on("settings:locations", function() {
    App.navigate('settings/locations');
    LocationsController.show();
  });


  App.on('before:start', function(){
    new App.settings.Router();
  });
});
