define([
  'marionette',
  'log',
  'app',
  'common/controller',
  './info/controller'
], function(Marionette, log, app, CommonController, InfoController) {
  app.info = {};

  app.info.Router = Marionette.AppRouter.extend({
    routes: {
      "app/info": InfoController.show,
      "app/*path": function () {app.trigger('404:show')}
    }
  });

  app.on("app:info", function() {
    app.navigate('app/info');
    InfoController.show();
  });

  app.on('before:start', function(){
    new app.info.Router();
  });
});
