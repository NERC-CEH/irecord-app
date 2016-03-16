import Backbone from '../../../../vendor/backbone/js/backbone';
import App from '../../../app';
import userModel from '../../common/user_model';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

let infoModel;

let API = {
  show: function () {

    let mainView = new MainView({ model: userModel });
    App.regions.main.show(mainView);

    mainView.on('user:logout', API.logout);

    let headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Info',
      }),
    });
    App.regions.header.show(headerView);
  },

  logout: function () {
    userModel.logOut();
  }
};

export { API as default };
