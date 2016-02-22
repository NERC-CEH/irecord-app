define([
  'log',
  'app',
  'app-config',
  'common/app_model',
  './main_view',
  'common/header_view',
  'common/record_manager'
], function (Log, App, CONFIG, appModel, MainView, HeaderView, recordManager) {
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

      mainView.on('records:delete:all', function () {
        App.regions.dialog.show({
          title: 'Delete All',
          body: 'Are you sure you want to delete all submitted records?',
          buttons: [
            {
              title: 'Delete',
              class: 'btn-negative',
              onClick: function () {
                //delete all
                recordManager.removeAllSynced(function () {
                  App.regions.dialog.show({
                    title: 'Done!'
                  })
                });
              }
            },
            {
              title: 'Cancel',
              onClick: function () {
                App.regions.dialog.hide();
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
    }
  };

  return API;
});