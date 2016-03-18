import Backbone from 'backbone';
import App from '../../../app';
import userModel from '../../common/user_model';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

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
    userModel.logOut();
  },
};

export { API as default };
