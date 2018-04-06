/** ****************************************************************************
 * Settings router.
 **************************************************************************** */
import Marionette from 'backbone.marionette';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import LocationsController from './locations/controller';
import SurveyController from './survey/controller';
import MenuController from './menu/controller';

App.settings = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'settings(/)': MenuController.show,
    'settings/locations(/)': LocationsController.show,
    'settings/survey(/)': SurveyController.show,
    'settings/*path': () => {
      radio.trigger('app:404:show');
    },
  },
});

radio.on('settings:locations', (options = {}) => {
  App.navigate('settings/locations', options);
  LocationsController.show(options);
});

App.on('before:start', () => {
  Log('Settings:router: initializing.');
  App.settings.router = new Router();
});
