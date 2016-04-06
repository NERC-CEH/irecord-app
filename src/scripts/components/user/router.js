/** ****************************************************************************
 * User router.
 *****************************************************************************/
import Marionette from 'marionette';
import App from '../../app';
import log from '../../helpers/log';
import LoginController from './login/controller';
import RegisterController from './register/controller';

App.user = {};

const Router = Marionette.AppRouter.extend({
  routes: {
    'user/login(/)': LoginController.show,
    'user/register(/)': RegisterController.show,
    'user/*path'() {App.trigger('404:show');},
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

App.on('before:start', () => {
  log('User:router: initializing');
  App.user.router = new Router();
});
