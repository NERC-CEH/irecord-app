define([
  'marionette',
  'log',
  'app',
  './login/controller',
  './register/controller'
], function(Marionette, Log, App, LoginController, RegisterController) {
  App.user = {};

  App.user.Router = Marionette.AppRouter.extend({
    routes: {
      "user/login(/)": LoginController.show,
      "user/register(/)": RegisterController.show,
      "user/*path": function () {App.trigger('404:show')}
    }
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
});
