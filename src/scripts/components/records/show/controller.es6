define([
  'app',
  'common/user_model',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, userModel, MainView, HeaderView, recordManager) {
  let API = {
    show: function (id){
      recordManager.get(id, function (err, recordModel) {
        if (!recordModel) {
          app.trigger('404:show');
          return;
        }

        let mainView = new MainView({
          model: new Backbone.Model({record: recordModel, user: userModel})
        });

        mainView.on('sync:init', function () {
          app.regions.dialog.showLoader();

          recordManager.sync(recordModel, function (err) {
            if (err) {
              app.regions.dialog.error(err);
              return;
            }
            app.regions.dialog.hideLoader();
            window.history.back();
          });
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