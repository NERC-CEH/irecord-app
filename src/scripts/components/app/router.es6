define([
  'marionette',
  'log',
  'app',
  'common/controller'
], function(Marionette, log, app, CommonController) {
  app.info = {};

  app.info.Router = Marionette.AppRouter.extend({
    routes: {
      "app/info": function () {
        CommonController('app/info/main')
      }
    }
  });

  app.on("app:info", function() {
    app.navigate('app/info');
    CommonController('app/info');
  });

  app.on('before:start', function(){
    new app.info.Router();
  });
});
