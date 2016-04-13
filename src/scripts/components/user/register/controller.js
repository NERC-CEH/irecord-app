/** ****************************************************************************
 * User Register controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import App from '../../../app';
import Log from '../../../helpers/log';
import Device from '../../../helpers/device';
import CONFIG from 'config'; // Replaced with alias
import userModel from '../../common/user_model';
import MainView from './main_view';
import HeaderView from '../../common/header_view';

const API = {
  show() {
    Log('User:Register:Controller: showing');
    // MAIN
    const mainView = new MainView();
    App.regions.main.show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Register',
      }),
    });
    App.regions.header.show(headerView);

    // Start registration
    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        App.regions.dialog.show({
          title: 'Sorry',
          body: 'Looks like you are offline!',
        });
        return;
      }

      const validationError = userModel.validateRegistration(data);
      if (!validationError) {
        mainView.triggerMethod('form:data:invalid', {}); // update form
        App.regions.dialog.showLoader();

        API.register(data, (err) => {
          if (err) {
            Log(err, 'e');
            switch (err.xhr.status) {
              case 401:
                // unauthorised
                break;
              default:
                Log(`login:submit: ${err.xhr.status} ${err.thrownError}.`, 'e');
            }

            let response = '';
            if (err.xhr.responseText && (err.xhr.responseText === 'Missing name parameter'
              || err.xhr.responseText.indexOf('Bad') >= 0)) {
              response = 'Bad Username or Password';
            } else {
              if (err.thrownError && err.thrownError.indexOf('Unauthorised')) {
                // err.xhr.responseText = Invalid password"
                // it thinks that the user tries to update its account
                response = 'An account with this email exist';
              } else {
                response = err.thrownError;
              }
            }

            App.regions.dialog.error({ message: response });
            return;
          }
          App.regions.dialog.show({
            title: 'Welcome aboard!',
            body: 'Before submitting any records please check your email and ' +
            'click on the verification link.',
            buttons: [
              {
                title: 'OK, got it',
                class: 'btn-positive',
                onClick() {
                  App.regions.dialog.hide();
                  window.history.back();
                },
              },
            ],
            onHide() {
              window.history.back();
            },
          });
        });
      } else {
        mainView.triggerMethod('form:data:invalid', validationError);
      }
    });

    // FOOTER
    App.regions.footer.hide().empty();
  },

  /**
   * Starts an app sign in to the Drupal site process.
   * The sign in endpoint is specified by CONFIG.login.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * appname and appsecret for the mentioned module.
   */
  register(data, callback) {
    Log('User:Register:Controller: registering');

    const formData = new FormData();

    _.forEach(data, (value, key) => {
      formData.append(key, value);
    });


    // app logins
    formData.append('appname', CONFIG.morel.manager.appname);
    formData.append('appsecret', CONFIG.morel.manager.appsecret);

    $.ajax({
      url: CONFIG.login.url,
      type: 'POST',
      data: formData,
      dataType: 'text',
      contentType: false,
      processData: false,
      timeout: CONFIG.login.timeout,

      success(response) {
        const details = API.extractUserDetails(response);
        details.email = data.email;
        userModel.logIn(details);

        callback(null, details);
      },
      error(xhr, ajaxOptions, thrownError) {
        callback({
          xhr,
          ajaxOptions,
          thrownError,
        });
      },
    });
  },

  /**
   * Since the server response is not JSON, it gets user details from the response.
   * @param data
   * @returns {*}
   */
  extractUserDetails(data) {
    const lines = (data && data.split(/\r\n|\r|\n/g));
    if (lines && lines.length >= 3 && lines[0].length > 0) {
      return {
        secret: lines[0],
        name: lines[1],
        surname: lines[2],
      };
    }
    Log('User:Register:Controller: problems with received secret.', 'e');
    return null;
  },
};

export { API as default };
