define([
  'log',
  'app',
  'app-config',
  'common/app_model',
  './main_view',
  'common/header_view'
], function (Log, App, CONFIG, appModel, MainView, HeaderView) {
  let API = {
    show: function () {
      let templateData = new Backbone.Model({
        useScientificNames: appModel.get('useScientificNames'),
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