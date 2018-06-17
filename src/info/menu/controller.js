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

  showLogoutConfirmationDialog(callbackIfTrue) {
    radio.trigger('app:dialog', {
      title: 'Are you sure you want to logout?',
      buttons: [
        {
          title: 'Cancel',
          class: 'btn-clear',
          onClick() {
            radio.trigger('app:dialog:hide');
          },
        },
        {
          title: 'Logout',
          class: 'btn-negative',
          onClick() {
            callbackIfTrue();
            radio.trigger('app:dialog:hide');
          },
        },
      ],
    });
  },

  logout() {
    Log('Info:Menu:Controller: logging out.');
    API.showLogoutConfirmationDialog(() => {
      userModel.logOut();
    });
  },
};

export { API as default };
