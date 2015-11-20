define([
  'app',
  './main_view',
  'common/header_view'
], function (app, MainView, HeaderView) {
  let controller = function (id) {
    let mainView = new MainView();
    app.regions.main.show(mainView);

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  return controller;
});