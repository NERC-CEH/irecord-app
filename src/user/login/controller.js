/** ****************************************************************************
 * User Login controller.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import App from 'app';
import { Log, Device, Error } from 'helpers';
import CONFIG from 'config';
import userModel from '../../common/models/user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('User:Register:Controller: showing');
    // don't show if logged in
    if (userModel.hasLogIn()) {
      window.history.back();
    }

    // MAIN
    const mainView = new MainView();
    App.regions.getRegion('main').show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Login',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        App.regions.getRegion('dialog').show({
          title: 'Sorry',
          body: 'Looks like you are offline!',
        });
        return;
      }

      const validationError = userModel.validateLogin(data);
      if (!validationError) {
        mainView.triggerMethod('form:data:invalid', {}); // update form
        App.regions.getRegion('dialog').showLoader();

        API.login(data)
          .then(() => {
            App.regions.getRegion('dialog').hideLoader();
            window.history.back();
          })
          .catch((err) => {
            App.regions.getRegion('dialog').error(err);
          });
      } else {
        mainView.triggerMethod('form:data:invalid', validationError);
      }
    });

    // FOOTER
    App.regions.getRegion('footer').hide().empty();
  },

  /**
   * Starts an app sign in to the Drupal site process.
   * The sign in endpoint is specified by CONFIG.login.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * api_key for the mentioned module.
   */
  login(data, callback) {
    Log('User:Login:Controller: logging in');
    const person = {
      // user logins
      email: data.email,
      password: data.password,

      // app logins
      api_key: CONFIG.morel.manager.api_key,
    };

    const promise = new Promise((fulfill, reject) => {
      $.ajax({
        url: CONFIG.login.url,
        type: 'POST',
        data: person,
        callback_data: person,
        timeout: CONFIG.login.timeout,
        success(receivedData) {
          userModel.logIn(receivedData.data);
          fulfill(receivedData.data);
        },
        error(xhr) {
          const error = new Error(xhr.responseJSON.errors);
          reject(error);
        },
      });
    });

    return promise;
  },
};

export { API as default };
