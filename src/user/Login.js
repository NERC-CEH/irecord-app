import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import _ from 'lodash';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';

/**
 * Starts an app sign in to the Drupal site process.
 * The sign in endpoint is specified by CONFIG.login.url -
 * should be a Drupal sight using iForm Mobile Auth Module.
 *
 * It is important that the app authorises itself providing
 * api_key for the mentioned module.
 */
function login(details, userModel) {
  Log('User:Login: logging in.');
  const promise = new Promise((fulfill, reject) => {
    const userAuth = btoa(`${details.name}:${details.password}`);
    $.ajax({
      method: 'get',
      url: CONFIG.users.url + encodeURIComponent(details.name), // url + user id
      timeout: CONFIG.users.timeout,
      headers: {
        authorization: `Basic ${userAuth}`,
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'application/json',
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
      error(xhr, textStatus, errorThrown) {
        let message = errorThrown;
        if (xhr.responseJSON && xhr.responseJSON.errors) {
          message = xhr.responseJSON.errors.reduce((name, err) => `${name}${err.title}\n`, '');
        }
        reject(new Error(message));
      },
    });
  });

  return promise;
}

function validateForm(attrs) {
  const errors = {};

  if (!attrs.name) {
    errors.name = t("can't be blank");
  }

  if (!attrs.password) {
    errors.password = t("can't be blank");
  }

  if (!_.isEmpty(errors)) {
    return errors;
  }

  return null;
}

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
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
    const { userModel } = this.props;

    if (!Device.isOnline()) {
      radio.trigger('app:dialog', {
        title: 'Sorry',
        body: 'Looks like you are offline!',
      });
      return;
    }

    const name = this.userName.current.value;
    const password = this.userPassword.current.value;

    const data = {
      name: name.trim(),
      password,
    };

    const validationError = validateForm(data);
    this.updateInputValidation(validationError || {});
    if (validationError) {
      return;
    }

    // mainView.triggerMethod('form:data:invalid', {}); // update form
    radio.trigger('app:loader');
    login(data, userModel)
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
      <div style={{ textAlign: 'center' }}>
        <div className="info-message">
          <p>{t('Please sign in with your iRecord account or register.')}</p>
        </div>

        <ion-list lines="full">
          <ion-item error={this.state.userNameError}>
            <span className="icon icon-user" slot="start" />
            <ion-input
              ref={this.userName}
              required
              type="text"
              placeholder={t('Username or email')}
            />
          </ion-item>
          <ion-item error={this.state.userPasswordError}>
            <span className="icon icon-key" slot="start" />
            <ion-input
              ref={this.userPassword}
              required
              type="password"
              placeholder={t('Password')}
            />
          </ion-item>
        </ion-list>

        <ion-button onClick={this.onClick} expand="full" color="primary">
          {t('Sign in')}
        </ion-button>

        <ion-list>
          <ion-button href="#user/register" expand="full" color="light">
            {t('Register')}
          </ion-button>

          <ion-button href="#user/reset" expand="full" color="light">
            {t('Forgot password?')}
          </ion-button>
        </ion-list>
      </div>
    );
  }
}

Component.propTypes = {
  onSuccess: PropTypes.func,
  userModel: PropTypes.object.isRequired,
};

export default Component;
