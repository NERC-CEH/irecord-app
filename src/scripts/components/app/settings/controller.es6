define([
  'app',
  'log',
  'app-config',
  'common/user_model',
  './main_view',
  'common/header_view'
], function (app, log, CONFIG, user, MainView, HeaderView) {
  let API = {
    show: function () {
      let templateData = new Backbone.Model({
        useScientificNames: user.get('useScientificNames'),
        useGridRef: user.get('useGridRef'),
        autosync: user.get('autosync')
      });

      let mainView = new MainView({
        model: templateData
      });
      mainView.on('setting:toggled', function (setting, on) {
        user.set(setting, on);
        user.save();
      });

      app.regions.main.show(mainView);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Settings'
        })
      });
      app.regions.header.show(headerView);
    }
  };

  return API;
});