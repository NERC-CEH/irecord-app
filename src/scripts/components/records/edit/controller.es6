define([
  'string_extension',
  'date_extension',
  'app',
  'common/app_model',
  'common/user_model',
  './main_view',
  './header_view',
  'common/record_manager'
], function (String, Date, App, appModel, userModel, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;
      recordManager.get(recordID, function (err, recordModel) {
        //Not found
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

        //MAIN
        let mainView = new MainView({
          model: new Backbone.Model({recordModel: recordModel, appModel: appModel})
        });
        App.regions.main.show(mainView);

        //HEADER
        let headerView = new HeaderView({
          model: new Backbone.Model({
            title: 'Edit'
          })
        });
        App.regions.header.show(headerView);

        headerView.on('save', function (e) {
          let invalids = API.setToSend(recordModel);

          if (invalids) {
            let missing = '';
            _.each(invalids, function(invalid) {
              missing += '<b>' + invalid.name + '</b> - ' + invalid.message + '</br>';
            });

            App.regions.dialog.show({
              title: 'Sorry',
              body: missing
            });
          }
        });
      });
    },

    /**
     * Set the record for submission and send it.
     */
    setToSend: function (recordModel) {
      recordModel.metadata.saved = true;

      let invalids = recordModel.validate();
      if (invalids) {
        recordModel.metadata.saved = false;
        return invalids;
      }

      //save record
      recordModel.save(function (err) {
        if (window.navigator.onLine && !userModel.hasLogIn()) {
          App.trigger('user:login', {replace: true});
          return;
        } else {
          recordManager.sync(recordModel);
          App.trigger('record:saved');
        }
      })
    }
  };

  return API;
});