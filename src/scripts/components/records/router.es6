define([
  'jquery.mobile',
  'marionette',
  'log',
  'app',
  './list/controller',
  './show/controller'
], function(jqm, Marionette, log, app, ListController, ShowController) {
  app.records = {};

  app.records.Router = Marionette.AppRouter.extend({
    routes: {
      "records": ListController,
      "records/:id": ShowController
    }
  });

  app.on("records:list", function() {
    app.navigate('records');
    ListController();
  });

  app.on("records:show", function(id) {
    app.navigate('records/' + id);
    ShowController(id);
  });

  app.on('before:start', function(){
    new app.records.Router();
  });
});
