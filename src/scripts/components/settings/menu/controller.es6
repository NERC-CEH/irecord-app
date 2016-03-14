define([
  'log',
  'app',
  'app-config',
  'common/app_model',
  'common/user_model',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (Log, App, CONFIG, appModel, userModel, MainView, HeaderView, recordManager) {
  let API = {
    show: function () {
      let templateData = new Backbone.Model({
        useGridRef: appModel.get('useGridRef'),
        autosync: appModel.get('autosync')
      });

      let mainView = new MainView({
        model: templateData
      });
      mainView.on('setting:toggled', function (setting, on) {
        appModel.set(setting, on);
        appModel.save();
      });

      mainView.on('records:submit:all', API.sendAllRecords);
      mainView.on('records:delete:all', API.deleteAllRecords);
      mainView.on('app:reset', function () {
        App.regions.dialog.show({
          title: 'Reset',
          class: 'error',
          body: 'Are you sure you want to reset the application to its initial state? ' +
          'This will wipe all the locally stored app data!',
          buttons: [
            {
              title: 'Cancel',
              onClick: function () {
                App.regions.dialog.hide();
              }
            },
            {
              title: 'Reset',
              class: 'btn-negative',
              onClick: function () {
                //delete all
                API.resetApp(function () {
                  App.regions.dialog.show({
                    title: 'Done!',
                    timeout: 1000
                  })
                });
              }
            }
          ]
        });
      });

      App.regions.main.show(mainView);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Settings'
        })
      });
      App.regions.header.show(headerView);
    },

    deleteAllRecords: function () {
      App.regions.dialog.show({
        title: 'Delete All',
        body: 'Are you sure you want to delete all submitted records?',
        buttons: [
          {
            title: 'Cancel',
            onClick: function () {
              App.regions.dialog.hide();
            }
          },
          {
            title: 'Delete',
            class: 'btn-negative',
            onClick: function () {
              //delete all
              recordManager.removeAllSynced(function () {
                App.regions.dialog.show({
                  title: 'Done!',
                  timeout: 1000
                })
              });
            }
          }
        ]
      });
    },

    sendAllRecords: function () {
      App.regions.dialog.show({
        title: 'Send All',
        body: 'Are you sure you want to set all valid records for submission?' +
        '</br><i><b>Note:</b> it will not affect already submitted records.</i>',
        buttons: [
          {
            title: 'Cancel',
            onClick: function () {
              App.regions.dialog.hide();
            }
          },
          {
            title: 'OK',
            class: 'btn-positive',
            onClick: function () {
              //delete all
              recordManager.setAllToSend(function () {
                App.regions.dialog.show({
                  title: 'Done!',
                  timeout: 1000
                })
              });
            }
          }
        ]
      });
    },

    resetApp: function (callback) {
      Log('Resetting the application!', 'w');
      appModel.clear().set(appModel.defaults);;
      appModel.save();

      userModel.clear().set(appModel.defaults);;
      userModel.save();

      recordManager.clear(callback);
    }
  };

  return API;
});