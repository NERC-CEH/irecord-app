define([
  'app',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let API = {
    show: function (id) {
      recordManager.get(id, function (err, record) {
        let mainView = new MainView({
          model: record
        });
        app.regions.main.show(mainView);
      });

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Record'
        })
      });
      app.regions.header.show(headerView);
    }
  };

  return API;
});