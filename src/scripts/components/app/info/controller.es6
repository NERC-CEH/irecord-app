define([
  'log',
  'app',
  'common/user_model',
  './main_view',
  'common/header_view'
], function (Log, App, userModel, MainView, HeaderView) {
  let infoModel;

  let API = {
    show: function () {
      infoModel = new Backbone.Model({
        userModel: userModel.get('surname')
      });

      let mainView = new MainView({model: infoModel});
      App.regions.main.show(mainView);

      mainView.on('logout', API.logout);

      let headerView = new HeaderView({
        model: new Backbone.Model({
          title: 'Info'
        })
      });
      App.regions.header.show(headerView);
    },

    logout: function () {
      userModel.logOut();
      infoModel.unset('userModel');
    }
  };

  return API;
});