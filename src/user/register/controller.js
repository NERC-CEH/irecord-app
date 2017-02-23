/** ****************************************************************************
 * User Register controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config'; // Replaced with alias
import userModel from 'user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('User:Register:Controller: showing');
    // MAIN
    const mainView = new MainView();
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Register',
      }),
    });
    radio.trigger('app:header', headerView);

    // Start registration
    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        radio.trigger('app:dialog', {
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
            radio.trigger('app:dialog', {
              title: 'Welcome aboard!',
              body: 'Before submitting any records please check your email and ' +
              'click on the verification link.',
              buttons: [
                {
                  title: 'OK, got it',
                  class: 'btn-positive',
                  onClick() {
                    radio.trigger('app:dialog:hide');
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
            radio.trigger('app:dialog:error', err);
          });
      } else {
        mainView.triggerMethod('form:data:invalid', validationError);
      }
    });

    // FOOTER
    radio.trigger('app:footer:hide');
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

    data['api_key'] = CONFIG.indicia.api_key; // app logins

    // app logins
    const promise = new Promise((fulfill, reject) => {
      $.ajax({
        url: CONFIG.users.url,
        type: 'POST',
        data,
        timeout: CONFIG.users.timeout,
        success(receivedData) {
          const fullData = _.extend(receivedData.data, { password: data.password });
          userModel.logIn(fullData);
          fulfill(fullData);
        },
        error(xhr, textStatus) {
          if (xhr.responseJSON) {
            reject(new Error(xhr.responseJSON.errors));
          } else {
            reject(new Error(textStatus));
          }
        },
      });
    });

    return promise;
  },
};

export { API as default };
