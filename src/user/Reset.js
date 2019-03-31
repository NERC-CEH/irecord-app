import React from 'react';
import $ from 'jquery';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import _ from 'lodash';

function reset(data) {
  Log('User:Reset:Controller: resetting.');
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
      .fail((xhr, textStatus, errorThrown) => {
        let message = errorThrown;
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
}

function validateForm(attrs) {
  const errors = {};

  if (!attrs.name) {
    errors.name = t("can't be blank");
  }

  if (!_.isEmpty(errors)) {
    return errors;
  }

  return null;
}

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.userName = React.createRef();
    this.onClick = this.onClick.bind(this);
    this.state = {};
  }

  updateInputValidation(validation) {
    this.setState({
      userNameError: validation.name,
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

    const name = this.userName.current.value;
    const data = {
      name: name.trim(),
    };

    const validationError = validateForm(data);
    this.updateInputValidation(validationError || {});
    if (validationError) {
      return;
    }

    // mainView.triggerMethod('form:data:invalid', {}); // update form
    radio.trigger('app:loader');
    reset(data)
      .then(() => {
        radio.trigger('app:dialog', {
          title: 'Success',
          body: t(
            'Further instructions have been sent to your e-mail address.'
          ),
        });
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
          <p>
            {t(
              'Enter your username or email address to request a password reset'
            )}
            .
          </p>
        </div>

        <ion-list lines="full">
          <ion-item error={this.state.userNameError}>
            <span className="icon icon-user" slot="start" />
            <ion-input
              ref={this.userName}
              required
              type="email"
              placeholder={t('Username or email')}
            />
          </ion-item>
        </ion-list>

        <ion-button onClick={this.onClick} expand="full" color="primary">
          {t('Reset')}
        </ion-button>
      </div>
    );
  }
}

Component.propTypes = {};

export default Component;
