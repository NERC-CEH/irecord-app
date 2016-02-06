define([
  'morel',
  'string_extension',
  'date_extension',
  'app',
  'common/app_model',
  'common/user_model',
  './main_view',
  './header_view',
  'common/record_manager'
], function (Morel, String, Date, App, appModel, userModel, MainView, HeaderView, recordManager) {
  let id;
  let record;
  let API = {
    show: function (recordID){
      id = recordID;
      recordManager.get(recordID, function (err, recordModel) {
        //Not found
        if (!recordModel) {
          App.trigger('404:show', {replace: true});
          return;
        }

        //can't edit a saved one - to be removed when record update
        //is possible on the server
        if (recordModel.getSyncStatus() == Morel.SYNCED) {
          App.trigger('records:show', recordID, {replace: true});
          return;
        }


        //MAIN
        let mainView = new MainView({
          model: new Backbone.Model({recordModel: recordModel, appModel: appModel})
        });
        App.regions.main.show(mainView);

        //on finish sync move to show
        let checkIfSynced = function () {
          if (recordModel.getSyncStatus() == Morel.SYNCED) {
            App.trigger('records:show', recordID, {replace: true});
            return;
          }
        };
        recordModel.on('sync:request sync:done sync:error', checkIfSynced);
        mainView.on('destroy', function () {
          //unbind when page destroyed
          recordModel.off('sync:request sync:done sync:error', checkIfSynced);
        });


        //HEADER
        let headerView = new HeaderView({
          model: recordModel
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
          recordManager.syncAll();
          App.trigger('record:saved');
        }
      })
    }
  };

  return API;
});