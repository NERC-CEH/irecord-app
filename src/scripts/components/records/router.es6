define([
  'marionette',
  'log',
  'app',
  './list/controller',
  './show/controller',
  './edit/controller',
  './edit_attr/controller',
  'common/location/controller',
  'common/taxon/controller'
], function(Marionette, log, app, ListController, ShowController, EditController,
            EditAttrController, LocationController, TaxonController) {
  app.records = {};

  app.records.Router = Marionette.AppRouter.extend({
    routes: {
      "records": ListController,
      "records/new": EditController,
      "records/new/:attr": EditAttrController,
      "records/:id": ShowController,
      "records/:id/edit": EditController,
      "records/:id/edit/location": LocationController,
      "records/:id/edit/taxon": TaxonController,
      "records/:id/edit/:attr": EditAttrController
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

  app.on("records:edit", function(id) {
    app.navigate('records/' + id + '/edit');
    EditController(id);
  });

  app.on("records:edit:attr", function(id, attrID) {
    app.navigate('records/' + id + '/edit/' + attrID);
    switch (attrID){
      case 'location':
        LocationController(id);
        break;
      case 'taxon':
        TaxonController(id);
        break;
      default:
        EditAttrController(id, attrID);
    }
  });

  app.on("records:new", function() {
    app.navigate('records/new');
    EditController();
  });

  app.on("records:new:attr", function(attrID) {
    app.navigate('records/new/' + attrID);
    switch (attrID) {
      case 'location':
        LocationController();
        break;
      case 'taxon':
        TaxonController();
        break;
      default:
        EditAttrController(null, attrID);
    }
  });

  app.on('before:start', function(){
    new app.records.Router();
  });
});
