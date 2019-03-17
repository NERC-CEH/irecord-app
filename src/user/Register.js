import React from 'react';
import radio from 'radio';
import PropTypes from 'prop-types';
import Validate from 'helpers/validate';
import Log from 'helpers/log';
import Device from 'helpers/device';
import $ from 'jquery';
import _ from 'lodash';
import CONFIG from 'config';
import Toggle from 'common/Components/Toggle';

/**
 * Starts an app sign in to the Drupal site process.
 * The sign in endpoint is specified by CONFIG.login.url -
 * should be a Drupal sight using iForm Mobile Auth Module.
 *
 * It is important that the app authorises itself providing
 * api_key for the mentioned module.
 */
function register(formData, userModel) {
  Log('User:Register: registering.');

  // app logins
  const promise = new Promise((fulfill, reject) => {
    const submissionData = Object.assign({}, formData, { type: 'users' });

    $.ajax({
      url: CONFIG.users.url,
      method: 'POST',
      processData: false,
      data: JSON.stringify({ data: submissionData }),
      headers: {
        'x-api-key': CONFIG.indicia.api_key,
        'content-type': 'application/json',
      },
      timeout: CONFIG.users.timeout,
      success(receivedData) {
        const data = receivedData.data || {};
        if (!data.id || !data.email || !data.name || !data.firstname || !data.secondname) {
          const err = new Error('Error while retrieving registration response.');
          reject(err);
          return;
        }
        const fullData = _.extend(receivedData.data, {
          password: formData.password,
        });
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

  if (!attrs.email) {
    errors.email = t("can't be blank");
  } else if (!Validate.email(attrs.email)) {
    errors.email = 'invalid';
  }

  if (!attrs.firstname) {
    errors.firstname = t("can't be blank");
  }

  if (!attrs.secondname) {
    errors.secondname = t("can't be blank");
  }

  if (!attrs.password) {
    errors.password = t("can't be blank");
  } else if (attrs.password.length < 2) {
    errors.password = t('is too short');
  }

  if (!attrs.passwordConfirm) {
    errors.passwordConfirm = t("can't be blank");
  } else if (attrs.passwordConfirm !== attrs.password) {
    errors.passwordConfirm = t('passwords are not equal');
  }

  if (!attrs.termsAgree) {
    errors.termsAgree = t('you must agree to the terms');
  }

  if (!_.isEmpty(errors)) {
    return errors;
  }

  return null;
}

class Component extends React.Component {
  constructor() {
    super();
    this.userEmail = React.createRef();
    this.userFirstname = React.createRef();
    this.userSecondname = React.createRef();
    this.userPassword = React.createRef();
    this.userPasswordConfirm = React.createRef();
    this.onTermsAgree = this.onTermsAgree.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {};
  }

  updateInputValidation(validation) {
    this.setState({
      userEmailError: validation.email,
      userFirstnameError: validation.firstname,
      userSecondnameError: validation.secondname,
      userPasswordError: validation.password,
      userPasswordConfirmError: validation.passwordConfirm,
      termsAgreeError: validation.termsAgree,
    });
  }

  onSubmit() {
    const { userModel } = this.props;

    if (!Device.isOnline()) {
      radio.trigger('app:dialog', {
        title: 'Sorry',
        body: 'Looks like you are offline!',
      });
      return;
    }

    const email = this.userEmail.current.value;
    const firstname = this.userFirstname.current.value;
    const secondname = this.userSecondname.current.value;

    const data = {
      email: email.trim(),
      firstname: firstname.trim(),
      secondname: secondname.trim(),
      password: this.userPassword.current.value,
      passwordConfirm: this.userPasswordConfirm.current.value,
      termsAgree: this.state.termsAgree,
    };

    const validationError = validateForm(data);
    this.updateInputValidation(validationError || {});
    if (validationError) {
      return;
    }

    radio.trigger('app:loader');
    register(data, userModel)
      .then(() => {
        radio.trigger('app:dialog', {
          title: 'Welcome aboard!',
          body:
            'Before submitting any records please check your email and ' +
            'click on the verification link.',
          buttons: [
            {
              title: 'OK, got it',
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
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  }

  onTermsAgree(checked) {
    this.setState({ termsAgree: checked });
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <ion-list lines="full">
          <ion-item error={this.state.userEmailError}>
            <span className="icon icon-mail" slot="start" />
            <ion-input ref={this.userEmail} required type="text" placeholder={t('Email')} />
          </ion-item>
          <ion-item error={this.state.userFirstnameError}>
            <span className="icon icon-user" slot="start" />
            <ion-input
              ref={this.userFirstname}
              required
              type="text"
              placeholder={t('First Name')}
            />
          </ion-item>
          <ion-item error={this.state.userSecondnameError}>
            <span className="icon icon-user" slot="start" />
            <ion-input ref={this.userSecondname} required type="text" placeholder={t('Surname')} />
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
          <ion-item error={this.state.userPasswordConfirmError}>
            <span className="icon icon-key" slot="start" />
            <ion-input
              ref={this.userPasswordConfirm}
              required
              type="password"
              placeholder={t('Confirm password')}
            />
          </ion-item>

          <ion-item error={this.state.termsAgreeError}>
            <ion-label>
              {t('I agree to')}{' '}
              <a href="#info/terms" style={{ display: 'inline', color: '#91a71c' }}>
                {t('Terms and Conditions')}
              </a>
            </ion-label>

            <Toggle onToggle={this.onTermsAgree} />
          </ion-item>
        </ion-list>

        <ion-button
          onClick={this.onSubmit}
          expand="full"
          disabled={!this.state.termsAgree}
          color="primary"
        >
          {t('Register')}
        </ion-button>
      </div>
    );
  }
}

Component.propTypes = {
  userModel: PropTypes.object.isRequired,
};

export default Component;
