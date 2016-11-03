import Backbone from 'backbone';
import App from '../../../app';
import Log from '../../../helpers/log';
import userModel from '../../common/models/user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    const mainView = new MainView({ model: userModel });
    App.regions.main.show(mainView);

    mainView.on('user:logout', API.logout);

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Info',
      }),
    });
    App.regions.header.show(headerView);
  },

  logout() {
    Log('Info:Menu:Controller: logging out');
    userModel.logOut();
  },
};

export { API as default };
