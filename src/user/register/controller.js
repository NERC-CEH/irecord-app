/** ****************************************************************************
 * User Register controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import App from 'app';
import { Log, Device } from 'helpers';
import CONFIG from 'config'; // Replaced with alias
import userModel from '../../common/models/user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('User:Register:Controller: showing');
    // MAIN
    const mainView = new MainView();
    App.regions.getRegion('main').show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Register',
      }),
    });
    App.regions.getRegion('header').show(headerView);

    // Start registration
    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        App.regions.getRegion('dialog').show({
          title: 'Sorry',
          body: 'Looks like you are offline!',
        });
        return;
      }

      const validationError = userModel.validateRegistration(data);
      if (!validationError) {
        mainView.triggerMethod('form:data:invalid', {}); // update form
        App.regions.getRegion('dialog').showLoader();

        API.register(data)
          .then(() => {
            App.regions.getRegion('dialog').show({
              title: 'Welcome aboard!',
              body: 'Before submitting any records please check your email and ' +
              'click on the verification link.',
              buttons: [
                {
                  title: 'OK, got it',
                  class: 'btn-positive',
                  onClick() {
                    App.regions.getRegion('dialog').hide();
                    window.history.back();
                  },
                },
              ],
              onHide() {
                window.history.back();
              },
            });
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
  register(data) {
    Log('User:Register:Controller: registering');

    const formData = new FormData();

    _.forEach(data, (value, key) => {
      formData.append(key, value);
    });

    // app logins
    formData.append('api_key', CONFIG.morel.manager.api_key);
    const promise = new Promise((fulfill, reject) => {
      $.ajax({
        url: CONFIG.login.url,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
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
