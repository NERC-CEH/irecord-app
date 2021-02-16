import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonButton, IonList } from '@ionic/react';
import AppMain from 'Components/Main';
import { person, mail, key, lock, eye, eyeOff, walk } from 'ionicons/icons';
import { Formik, Form } from 'formik';
import InputWithValidation from 'Components/InputWithValidation';
import ToggleWithValidation from 'Components/ToggleWithValidation';
import config from 'config';

class Component extends React.Component {
  state = {
    showPassword: false,
  };

  togglePassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword,
    }));
  };

  render() {
    const { showPassword } = this.state;
    const { onSubmit, schema, lang } = this.props;

    return (
      <AppMain id="register-page">
        <div className="info-message">
          <p>
            {t(
              'An activation email will be sent to your email address after registering, please check this and follow the link to activate your account before submitting records.'
            )}
          </p>
        </div>
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{}}
          render={props => (
            <Form>
              <IonList lines="full">
                <InputWithValidation
                  name="email"
                  placeholder={t('Email')}
                  icon={mail}
                  type="email"
                  {...props}
                />
                <InputWithValidation
                  name="username"
                  placeholder={t('Username')}
                  icon={walk}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="firstname"
                  placeholder={t('First name')}
                  icon={person}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="secondname"
                  placeholder={t('Last name')}
                  icon={person}
                  type="text"
                  {...props}
                />
                <InputWithValidation
                  name="password"
                  placeholder={t('Password')}
                  icon={key}
                  type={showPassword ? 'text' : 'password'}
                  {...props}
                >
                  <IonButton
                    slot="end"
                    onClick={this.togglePassword}
                    fill="clear"
                  >
                    <IonIcon
                      icon={showPassword ? eye : eyeOff}
                      faint
                      size="small"
                    />
                  </IonButton>
                </InputWithValidation>
                <ToggleWithValidation
                  name="terms"
                  label={
                    <>
                      {t('I agree to')}{' '}
                      <a href={`${config.site_url}/terms_of_use?lang=${lang}`}>
                        {t('Terms and Conditions')}
                      </a>
                    </>
                  }
                  icon={lock}
                  type="terms"
                  {...props}
                />
              </IonList>

              <IonButton color="primary" type="submit" expand="block">
                {t('Register')}
              </IonButton>
            </Form>
          )}
        />
      </AppMain>
    );
  }
}

Component.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  lang: PropTypes.string.isRequired,
};

export default Component;
