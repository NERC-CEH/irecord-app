define([
  'app',
  'log',
  'common/models/user',
  './main_view',
  'common/header_view'
], function (app, log, user, MainView, HeaderView) {
  let infoModel;

  let API = {
    show: function () {
      infoModel = new Backbone.Model({
        user: user.get('surname')
      });

      let mainView = new MainView({model: infoModel});
      app.regions.main.show(mainView);

      mainView.on('logout', API.logout);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          pageName: 'Info'
        })
      });
      app.regions.header.show(headerView);
    },

    logout: function () {
      user.logOut();
      infoModel.unset('user');
    }
  };

  return API;
});