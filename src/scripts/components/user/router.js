import Marionette from 'marionette';
import App from '../../app';
import LoginController from './login/controller';
import RegisterController from './register/controller';

App.user = {};

App.user.Router = Marionette.AppRouter.extend({
  routes: {
    "user/login(/)": LoginController.show,
    "user/register(/)": RegisterController.show,
    "user/*path": function () {App.trigger('404:show')}
  },
});

App.on("user:login", function(options) {
  App.navigate('user/login', options);
  LoginController.show();
});

App.on("user:register", function(options) {
  App.navigate('user/register', options);
  RegisterController.show();
});

App.on('before:start', function(){
  new App.user.Router();
});
