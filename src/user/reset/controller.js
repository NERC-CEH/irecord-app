/** ****************************************************************************
 * User Reset controller.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import Error from 'helpers/error';
import Validate from 'helpers/validate';
import CONFIG from 'config';
import userModel from '../../common/models/user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('User:Reset:Controller: showing');

    // MAIN
    const mainView = new MainView();
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Reset',
      }),
    });
    radio.trigger('app:header', headerView);

    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        radio.on('app:dialog', {
          title: 'Sorry',
          body: 'Looks like you are offline!',
        });
        return;
      }

      const validationError = userModel.validateReset(data);
      if (!validationError) {
        mainView.triggerMethod('form:data:invalid', {}); // update form
        App.regions.getRegion('dialog').showLoader();

        API.reset(data)
          .then(() => {
            radio.on('app:dialog', {
              title: 'Success',
              body: 'Further instructions have been sent to your e-mail address.',
            });
            window.history.back();
          })
          .catch((err) => {
            radio.on('app:dialog:error', err);
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
   * The sign in endpoint is specified by CONFIG.reset.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * api_key for the mentioned module.
   */
  reset(data) {
    Log('User:Reset:Controller: logging in');
    const person = {
      // app resets
      api_key: CONFIG.morel.manager.api_key,
    };

    // user resets
    person.password = data.password;
    if (Validate.email(data.name)) {
      person.email = data.name;
    } else {
      person.name = data.name;
    }

    const promise = new Promise((fulfill, reject) => {
      // Reset password
      $.get({
        url: `${CONFIG.users.url}/anonymous/reset`,
        method: 'POST',
        data: person,
        timeout: CONFIG.users.timeout,
      })
        .then(fulfill)
        .fail((xhr, textStatus) => {
          if (xhr.responseJSON) {
            reject(new Error(xhr.responseJSON.errors));
          } else {
            reject(new Error(textStatus));
          }
        });
    });

    return promise;
  },
};

export { API as default };
