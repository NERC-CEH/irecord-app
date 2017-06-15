import Backbone from 'backbone';
import Log from 'helpers/log';
import radio from 'radio';
import userModel from 'user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    const mainView = new MainView({ model: userModel });
    radio.trigger('app:main', mainView);

    mainView.on('user:logout', API.logout);

    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'iRecord App',
      }),
      classes: 'non-capitalize',
    });
    radio.trigger('app:header', headerView);
  },

  logout() {
    Log('Info:Menu:Controller: logging out.');
    userModel.logOut();
  },
};

export { API as default };
