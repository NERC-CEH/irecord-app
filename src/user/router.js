/** ****************************************************************************
 * User router.
 *****************************************************************************/
import Marionette from 'backbone.marionette';
import Log from 'helpers/log';
import App from 'app';
import radio from 'radio';
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
    'user/*path': () => { radio.trigger('app:404:show'); },
  },
});

radio.on('user:login', (options) => {
  App.navigate('user/login', options);
  LoginController.show();
});

App.on('before:start', () => {
  Log('User:router: initializing.');
  App.user.router = new Router();
});
