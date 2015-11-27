define([
  'app',
  './main_view',
  './header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let controller = function (recordID) {
    id = recordID;

    recordManager.get(recordID, function (err, savedRecord) {
      record = savedRecord;
      //todo: check if saved if so then redirect to show
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

  app.on('records:edit:save', function (e) {
    record.metadata.saved = true;
    recordManager.set(record, function (err) {
      window.history.back();
    })
  });

  return controller;
});