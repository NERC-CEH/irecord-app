import Backbone from 'backbone';
import Marionette from 'marionette';
import App from '../../app';
import CONFIG from 'config'; // Replaced with alias
import appModel from '../common/app_model';
import CommonController from '../common/controller';
import MenuController from './menu/controller';
import LocationsController from './locations/controller';

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
