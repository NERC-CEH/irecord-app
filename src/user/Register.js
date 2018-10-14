import React from 'react';
import radio from 'radio';
import Log from 'helpers/log';
import Device from 'helpers/device';
import userModel from 'user_model';
import $ from 'jquery';
import _ from 'lodash';
import CONFIG from 'config';

/**
 * Starts an app sign in to the Drupal site process.
 * The sign in endpoint is specified by CONFIG.login.url -
 * should be a Drupal sight using iForm Mobile Auth Module.
 *
 * It is important that the app authorises itself providing
 * api_key for the mentioned module.
 */
function register(formData) {
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
        'content-type': 'application/json'
      },
      timeout: CONFIG.users.timeout,
      success(receivedData) {
        const data = receivedData.data || {};
        if (
          !data.id ||
          !data.email ||
          !data.name ||
          !data.firstname ||
          !data.secondname
        ) {
          const err = new Error(
            'Error while retrieving registration response.'
          );
          reject(err);
          return;
        }
        const fullData = _.extend(receivedData.data, {
          password: formData.password
        });
        userModel.logIn(fullData);
        fulfill(fullData);
      },
      error(xhr, textStatus, errorThrown) {
        let message = errorThrown;
        if (xhr.responseJSON && xhr.responseJSON.errors) {
          message = xhr.responseJSON.errors.reduce(
            (name, err) => `${name}${err.title}\n`,
            ''
          );
        }
        reject(new Error(message));
      }
    });
  });

  return promise;
}

class Component extends React.Component {
  constructor() {
    super();
    this.userEmail = React.createRef();
    this.userFirstname = React.createRef();
    this.userSecondname = React.createRef();
    this.userPassword = React.createRef();
    this.userPasswordConfirm = React.createRef();
    this.termsAgree = React.createRef();
    this.state = {};
  }

  updateInputValidation(validation) {
    this.setState({
      userEmailError: validation.email,
      userFirstnameError: validation.firstname,
      userSecondnameError: validation.secondname,
      userPasswordError: validation.password,
      userPasswordConfirmError: validation.passwordConfirm,
      termsAgreeError: validation.termsAgree
    });
  }

  onSubmit() {
    if (!Device.isOnline()) {
      radio.trigger('app:dialog', {
        title: 'Sorry',
        body: 'Looks like you are offline!'
      });
      return;
    }

    const data = {
      email: this.userEmail.current.value,
      firstname: this.userFirstname.current.value,
      secondname: this.userSecondname.current.value,
      password: this.userPassword.current.value,
      passwordConfirm: this.userPasswordConfirm.current.value,
      termsAgree: this.termsAgree.current.checked
    };

    const validationError = userModel.validateRegistration(data);
    this.updateInputValidation(validationError || {});
    if (validationError) {
      return;
    }

    radio.trigger('app:loader');
    register(data)
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
              }
            }
          ],
          onHide() {
            window.history.back();
          }
        });
      })
      .catch(err => {
        Log(err, 'e');
        radio.trigger('app:dialog:error', err);
      });
  }

  render() {
    return (
      <div>
        <ion-list lines="full">
          <ion-item error={this.state.userEmailError}>
            <span className="icon icon-mail" slot="start" />
            <ion-input
              ref={this.userEmail}
              required
              type="text"
              placeholder={t('Email')}
            />
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
            <ion-input
              ref={this.userSecondname}
              required
              type="text"
              placeholder={t('Surname')}
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
              <a
                href="#info/terms"
                style={{ display: 'inline', color: '#91a71c' }}
              >
                {t('Terms and Conditions')}
              </a>
            </ion-label>

            <ion-toggle slot="end" ref={this.termsAgree} />
          </ion-item>
        </ion-list>

        <ion-button
          onClick={this.onSubmit.bind(this)}
          style={{ width: '100%', margin: '0 auto' }}
        >
          {t('Create')}
        </ion-button>
      </div>
    );
  }
}

export default Component;
