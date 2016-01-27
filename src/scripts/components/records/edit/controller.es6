define([
  'string_extension',
  'date_extension',
  'app',
  'common/app_model',
  './main_view',
  './header_view',
  'common/record_manager'
], function (String, Date, App, appModel, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;

      recordManager.get(recordID, function (err, recordModel) {
        if (!recordModel) {
          App.trigger('404:show');
          return;
        }
        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (recordModel.metadata.saved) {
          App.trigger('records:show', recordID);
          return;
        }

        let mainView = new MainView({
          model: new Backbone.Model({recordModel: recordModel, appModel: appModel})
        });
        App.regions.main.show(mainView);

        let headerView = new HeaderView({
          model: new Backbone.Model({
            title: 'Edit'
          })
        });
        App.regions.header.show(headerView);

        //Set the record for submission
        headerView.on('save', function (e) {
          recordModel.metadata.saved = true;

          let invalids = recordModel.validate();
          if (invalids) {
            recordModel.metadata.saved = false;

            let missing = '';
            _.each(invalids, function(invalid) {
              missing += '<b>' + invalid.name + '</b> - ' + invalid.message + '</br>';
            });

            App.regions.dialog.show({
              title: 'Sorry',
              body: missing
            });

            return;
          }

          recordModel.save(function (err) {
            window.history.back();
            App.trigger('records:edit:saved', recordModel);
          })
        });
      });
    }
  };

  return API;
});