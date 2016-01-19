define([
  'app',
  'common/user_model',
  './main_view',
  './header_view',
  'common/record_manager',
  'helpers/date_extension',
  'helpers/string_extension'
], function (app, user, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;

      recordManager.get(recordID, function (err, record) {
        if (!record) {
          app.trigger('404:show');
          return;
        }
        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (record.metadata.saved) {
          app.trigger('records:show', recordID);
          return;
        }

        let mainView = new MainView({
          model: new Backbone.Model({record: record, user: user})
        });
        app.regions.main.show(mainView);

        let headerView = new HeaderView({
          model: new Backbone.Model({
            title: 'Edit'
          })
        });
        app.regions.header.show(headerView);

        headerView.on('save', function (e) {
          record.metadata.saved = true;
          recordManager.set(record, function (err) {
            window.history.back();
            app.trigger('records:edit:saved', record);
          })
        });
      });
    }
  };

  return API;
});