/** ****************************************************************************
 * User router.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import { Log } from 'helpers';
import App from 'app';
import LoginController from './login/controller';
import RegisterController from './register/controller';
import ResetController from './reset/controller';
import ActivitiesController from '../common/pages/activities/controller';
import StatisticsController from './statistics/controller';

App.user = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'user/login(/)': LoginController.show,
    'user/activities(/)': ActivitiesController.show,
    'user/statistics(/)': StatisticsController.show,
    'user/register(/)': RegisterController.show,
    'user/reset(/)': ResetController.show,
    'user/*path': () => { App.trigger('404:show'); },
  },
});

App.on('user:login', (options) => {
  App.navigate('user/login', options);
  LoginController.show();
});

App.on('user:register', (options) => {
  App.navigate('user/register', options);
  RegisterController.show();
});

App.on('user:activities', (options) => {
  App.navigate('user/activities', options);
  ActivitiesController.show();
});

App.on('user:statistics', (options) => {
  App.navigate('user/statistics', options);
  StatisticsController.show();
});

App.on('before:start', () => {
  Log('User:router: initializing');
  App.user.router = new Router();
});
