define([
  'app',
  './main_view',
  './header_view',
  './empty_list_view',
  'common/record_manager'
], function (app, MainView, HeaderView, EmptyListView, recordManager) {
  let controller = function () {
    recordManager.getAll(function (err, records) {
      let mainView = new MainView({
        collection: records
      });
      app.regions.main.show(mainView);
    });

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  return controller;
});