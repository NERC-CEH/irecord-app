define([
  'marionette',
  'log',
  'app',
  'common/record_manager',
  'common/user_model',
  'common/app_model',
  './list/controller',
  './show/controller',
  './edit/controller',
  './edit_attr/controller',
  'common/pages/location/controller',
  'common/pages/taxon/controller'
], function(Marionette, Log, App, recordManager, userModel, appModel, ListController, ShowController, EditController,
            EditAttrController, LocationController, TaxonController) {
  App.records = {};

  App.records.Router = Marionette.AppRouter.extend({
    routes: {
      "records(/)": ListController.show,
      "records/new(/)": TaxonController.show,
      "records/:id": ShowController.show,
      "records/:id/edit(/)": EditController.show,
      "records/:id/edit/location(/)": LocationController.show,
      "records/:id/edit/taxon(/)": TaxonController.show,
      "records/:id/edit/:attr(/)": EditAttrController.show,
      "records/*path": function () {App.trigger('404:show')}
    }
  });

  App.on("records:list", function(options) {
    App.navigate('records', options);
    ListController.show(  );
  });

  App.on("records:show", function(recordID, options) {
    App.navigate('records/' + recordID, options);
    ShowController.show(recordID);
  });

  App.on("records:edit", function(recordID, options) {
    App.navigate('records/' + recordID + '/edit', options);
    EditController.show(recordID);
  });

  App.on("records:edit:attr", function(recordID, attrID, options) {
    App.navigate('records/' + recordID + '/edit/' + attrID, options);
    switch (attrID){
      case 'location':
        LocationController.show(recordID);
        break;
      case 'taxon':
        TaxonController.show(recordID);
        break;
      default:
        EditAttrController.show(recordID, attrID);
    }
  });

  App.on("records:new", function(options) {
    App.navigate('records/new', options);
    EditController.show();
  });

  App.on("records:new:attr", function(attrID, options) {
    App.navigate('records/new/' + attrID, options);
    switch (attrID) {
      case 'location':
        LocationController.show();
        break;
      case 'taxon':
        TaxonController.show();
        break;
      default:
        EditAttrController.show(null, attrID);
    }
  });


  function syncRecords () {
    if (window.navigator.onLine && appModel.get('autosync')) {
      recordManager.syncAll();
    }
  }

  userModel.on('login', syncRecords);

  App.on('before:start', function(){
    new App.records.Router();

    if (userModel.hasLogIn()) {
      syncRecords();
    }
  });




});
