define([
  'marionette',
  'app',
  'JST',
  'log',
  'common/header_view'
], function (Marionette, app, JST, log, HeaderView) {
  let controller = function (route) {
      let MainView = Marionette.ItemView.extend({
        template: JST[route]
      });
      app.regions.main.show(new MainView());

    let headerView = new HeaderView();
    app.regions.header.show(headerView);
  };

  return controller;
});