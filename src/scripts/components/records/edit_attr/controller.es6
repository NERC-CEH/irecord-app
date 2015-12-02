define([
  'app',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (app, MainView, HeaderView, recordManager) {
  let API =  {
    show: function (recordID, attr) {
      recordManager.get(recordID, function (err, record) {
//        switch (attr) {
//          case 'number':
//            break;
//          case 'date':
//
//            break;
//          default:
//        };

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (record.metadata.saved) {
          app.trigger('records:show', recordID);
          return;
        }

        let mainView = new MainView({
          attr: attr,
          model: record
        });
        app.regions.main.show(mainView);

        let headerView = new HeaderView();
        app.regions.header.show(headerView);
      });
    }
  };

  return API;
});