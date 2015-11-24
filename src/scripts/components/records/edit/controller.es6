define([
  'app',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let controller = function (recordID) {
    recordManager.get(recordID, function (err, record) {
      let mainView = new MainView({
        model: record
      });
      app.regions.main.show(mainView);
    });

    let headerView = new HeaderView({
      model: new Backbone.Model({
        pageName: 'Edit'
      })
    });
    app.regions.header.show(headerView);
  };

  return controller;
});