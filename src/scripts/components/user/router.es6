define([
  'marionette',
  'log',
  'app',
  './login/controller',
  './register/controller'
], function(Marionette, log, app, LoginController, RegisterController) {
  app.user = {};

  app.user.Router = Marionette.AppRouter.extend({
    routes: {
      "user/login": LoginController.show,
      "user/register": RegisterController.show
    }
  });

  app.on("user:login", function() {
    app.navigate('user/login');
    LoginController.show();
  });

  app.on("user:register", function() {
    app.navigate('user/register');
    RegisterController.show();
  });

  app.on('before:start', function(){
    new app.user.Router();
  });
});
