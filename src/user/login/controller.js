/** ****************************************************************************
 * User Login controller.
 *****************************************************************************/
import $ from 'jquery';
import _ from 'lodash';
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
    Log('User:Register:Controller: showing.');
    // don't show if logged in
    if (userModel.hasLogIn()) {
      window.history.back();
    }

    // MAIN
    const mainView = new MainView();
    radio.trigger('app:main', mainView);

    // HEADER
    const headerView = new HeaderView({
      model: new Backbone.Model({
        title: 'Login',
      }),
    });
    radio.trigger('app:header', headerView);

    mainView.on('form:submit', (data) => {
      if (!Device.isOnline()) {
        radio.trigger('app:dialog', {
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
   * The sign in endpoint is specified by CONFIG.login.url -
   * should be a Drupal sight using iForm Mobile Auth Module.
   *
   * It is important that the app authorises itself providing
   * api_key for the mentioned module.
   */
  login(details) {
    Log('User:Login:Controller: logging in.');
    const promise = new Promise((fulfill, reject) => {
      $.get({
        url: CONFIG.users.url + encodeURIComponent(details.name), // url + user id
        data: {
          api_key: CONFIG.indicia.api_key, // app logins
        },
        timeout: CONFIG.users.timeout,
        beforeSend(xhr) {
          const userAuth = btoa(`${details.name}:${details.password}`);
          xhr.setRequestHeader('Authorization', `Basic ${userAuth}`);
        },
        success(receivedData) {
          const data = receivedData.data || {};
          if (!data.id || !data.email || !data.name ||
            !data.firstname || !data.secondname) {
            const err = new Error('Error while retrieving login response.');
            reject(err);
            return;
          }

          const fullData = _.extend(data, { password: details.password });
          userModel.logIn(fullData);
          fulfill(fullData);
        },
        error(xhr, textStatus) {
          let message = textStatus;
          if (xhr.responseJSON && xhr.responseJSON.errors) {
            message = xhr.responseJSON.errors.reduce(
              (name, err) => `${name}${err.title}\n`,
              ''
            );
          }
          reject(new Error(message));
        },
      });
    });

    return promise;
  },
};

export { API as default };
