define([
  'app',
  './main_view',
  './header_view'
], function (app, MainView, HeaderView) {
  let controller = function () {
    let RecordModel = Backbone.Model.extend({
      defaults: {
        name: 'record'
      }
    });

    let RecordsCollection = Backbone.Collection.extend({
      model: RecordModel
    });

    let recordsCollecion = new RecordsCollection(new Array(100));

    let mainView = new MainView({
      collection: recordsCollecion
    });
    app.regions.main.show(mainView);

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  return controller;
});