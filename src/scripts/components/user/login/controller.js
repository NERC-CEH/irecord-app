/** ****************************************************************************
 * User Login controller.
 *****************************************************************************/
import $ from 'jquery';
import Backbone from 'backbone';
import App from '../../../app';
import Log from '../../../helpers/log';
import Device from '../../../helpers/device';
import CONFIG from 'config'; // Replaced with alias
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
    App.regions.main.show(mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Login',
      }),
    });
    App.regions.header.show(headerView);

    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        App.regions.dialog.show({
          title: 'Sorry',
          body: 'Looks like you are offline!',
        });
        return;
      }

      const validationError = userModel.validateLogin(data);
      if (!validationError) {
        mainView.triggerMethod('form:data:invalid', {}); // update form
        App.regions.dialog.showLoader();

        API.login(data, (err) => {
          if (err) {
            let response = '';
            if (err.xhr.responseText && (err.xhr.responseText === 'Missing name parameter'
              || err.xhr.responseText.indexOf('Bad') >= 0)) {
              response = 'Bad Username or Password';
            } else {
              response = err.xhr.responseText;
            }

            App.regions.dialog.error({ message: response });
            return;
          }

          App.regions.dialog.hideLoader();
          window.history.back();
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
  login(data, callback) {
    Log('User:Login:Controller: logging in');
    const person = {
      // user logins
      email: data.email,
      password: data.password,

      // app logins
      appname: CONFIG.morel.manager.appname,
      appsecret: CONFIG.morel.manager.appsecret,
    };

    $.ajax({
      url: CONFIG.login.url,
      type: 'POST',
      data: person,
      callback_data: person,
      dataType: 'text',
      timeout: CONFIG.login.timeout,
      success(receivedData) {
        const details = API.extractUserDetails(receivedData);
        details.email = person.email;
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
    Log('login:extractdetails: problems with received secret.', 'w');
    return null;
  },
};

export { API as default };
