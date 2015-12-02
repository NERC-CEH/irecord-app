define([
  'app',
  './main_view',
  './header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;

      recordManager.get(recordID, function (err, record) {

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (record.metadata.saved) {
          app.trigger('records:show', recordID);
          return;
        }

        let mainView = new MainView({
          model: record
        });
        app.regions.main.show(mainView);

        mainView.on('save', function (e) {
          record.metadata.saved = true;
          recordManager.set(record, function (err) {
            window.history.back();
          })
        });

        let headerView = new HeaderView({
          model: new Backbone.Model({
            pageName: 'Edit'
          })
        });
        app.regions.header.show(headerView);
      });
    }
  };

  return API;
});