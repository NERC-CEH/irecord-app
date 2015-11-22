define([
  'app',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let controller = function (recordID) {
    let sample;

    if (!recordID) {
      //new record
      sample = new morel.Sample();

    } else {
      //existing record
      sample = recordManager.get(recordID);
    }

    let mainView = new MainView(sample);
    app.regions.main.show(mainView);

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  return controller;
});