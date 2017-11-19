/** ****************************************************************************
 * User Reset controller.
 **************************************************************************** */
import $ from 'jquery';
import Backbone from 'backbone';
import App from 'app';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import userModel from 'user_model';
import MainView from './main_view';
import HeaderView from '../../common/views/header_view';

const API = {
  show() {
    Log('User:Reset:Controller: showing.');

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

    mainView.on('form:submit', data => {
      if (!Device.isOnline()) {
        radio.trigger('app:dialog', {
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
            radio.trigger('app:dialog', {
              title: 'Success',
              body:
                'Further instructions have been sent to your e-mail address.',
            });
            window.history.back();
          })
          .catch(err => {
            Log(err, 'e');
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
   * The sign in endpoint is specified by CONFIG.reset.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * api_key for the mentioned module.
   */
  reset(data) {
    Log('User:Reset:Controller: logging in.');
    const promise = new Promise((fulfill, reject) => {
      const details = {
        type: 'users',
        password: ' ', // reset password
      };

      // Reset password
      $.ajax({
        url: CONFIG.users.url + encodeURIComponent(data.name), // url + user id
        method: 'PUT',
        processData: false,
        data: JSON.stringify({ data: details }),
        headers: {
          'x-api-key': CONFIG.indicia.api_key,
          'content-type': 'application/json',
        },
        timeout: CONFIG.users.timeout,
      })
        .then(fulfill)
        .fail((xhr, textStatus) => {
          let message = textStatus;
          if (xhr.responseJSON && xhr.responseJSON.errors) {
            message = xhr.responseJSON.errors.reduce(
              (name, err) => `${name}${err.title}\n`,
              ''
            );
          }
          reject(new Error(message));
        });
    });

    return promise;
  },
};

export { API as default };
