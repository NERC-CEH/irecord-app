import React from 'react';
import PropTypes from 'prop-types';
import $ from "jquery";
import _ from "lodash";
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import userModel from 'user_model';


/**
 * Starts an app sign in to the Drupal site process.
 * The sign in endpoint is specified by CONFIG.login.url -
 * should be a Drupal sight using iForm Mobile Auth Module.
 *
 * It is important that the app authorises itself providing
 * api_key for the mentioned module.
 */
function login(details) {
  Log('User:Login:Controller: logging in.');
  const promise = new Promise((fulfill, reject) => {
    $.get({
      url: CONFIG.users.url + encodeURIComponent(details.name), // url + user id
      timeout: CONFIG.users.timeout,
      beforeSend(xhr) {
        const userAuth = btoa(`${details.name}:${details.password}`);
        xhr.setRequestHeader('Authorization', `Basic ${userAuth}`);
        xhr.setRequestHeader('x-api-key', CONFIG.indicia.api_key);
        xhr.setRequestHeader('content-type', 'application/json');
      },
      success(receivedData) {
        const data = receivedData.data || {};
        if (!data.id || !data.email || !data.name) {
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
}


class Component extends React.Component {
  constructor(props) {
    super(props);
    this.userName = React.createRef();
    this.userPassword = React.createRef();
    this.state = {};
  }

  updateInputValidation(validation) {
    this.setState({
      userNameError: validation.name,
      userPasswordError: validation.password,
    });
  }

  onClick() {
    if (!Device.isOnline()) {
      radio.trigger('app:dialog', {
        title: 'Sorry',
        body: 'Looks like you are offline!',
      });
      return;
    }

    const data = {
      name: this.userName.current.value,
      password: this.userPassword.current.value,
    };

    const validationError = userModel.validateLogin(data);
    this.updateInputValidation(validationError || {});
    if (validationError) {
      return;
    }

    // mainView.triggerMethod('form:data:invalid', {}); // update form
    radio.trigger('app:loader');
    login(data)
      .then(() => {
        radio.trigger('app:loader:hide');
        this.props.onSuccess && this.props.onSuccess();
        window.history.back();
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  }

  render() {
    return (
      <div>
        <div className="info-message">
          <p>{t("Please sign in with your iRecord account or register.")}</p>
        </div>

        <ion-list lines="full">
          <ion-item error={this.state.userNameError}>
            <span className="icon icon-user" slot="start"></span>
            <ion-input ref={this.userName} required type="text"
                       placeholder={t("Username or email")}></ion-input>
          </ion-item>
          <ion-item error={this.state.userPasswordError}>
            <span className="icon icon-key" slot="start"></span>
            <ion-input ref={this.userPassword} required
                       type="password"
                       placeholder={t("Password")}></ion-input>
          </ion-item>
        </ion-list>

        <ion-button style={{ width: '100%', margin: '0 auto' }}
                    onClick={this.onClick.bind(this)}
                    color="light">{t("Sign in")}</ion-button>

        <ion-list lines="full">
          <ion-item href="#user/register">
            <span slot="start"
                  className="icon icon-user-plus"></span>
            {t("Register")}
          </ion-item>
          <ion-item href="#user/reset">
            <span slot="start"
                  className="icon icon-key"></span>
            {t("Request a new password")}
          </ion-item>
        </ion-list>
      </div>
    );
  }
}

Component.propTypes = {
  onSuccess: PropTypes.func,
};

export default Component;

