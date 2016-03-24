/** ****************************************************************************
 * Settings router.
 *****************************************************************************/
import Marionette from 'marionette';
import App from '../../app';
import CommonController from '../common/controller';
import MenuController from './menu/controller';
import LocationsController from './locations/controller';

App.settings = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'settings(/)': MenuController.show,
    'settings/locations(/)': LocationsController.show,
    'settings/*path'() {App.trigger('404:show');},
  },
});

App.on('settings', () => {
  App.navigate('settings/menu');
  CommonController.show({
    title: 'Settings', App, route: 'settings/menu',
  });
});

App.on('settings:locations', () => {
  App.navigate('settings/locations');
  LocationsController.show();
});


App.on('before:start', () => {
  App.settings.router = new Router();
});
