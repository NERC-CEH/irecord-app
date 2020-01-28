import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import Device from 'helpers/device';
import { IonPage, NavContext } from '@ionic/react';
import { warn, error } from 'common/helpers/toast';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import AppHeader from 'Components/Header';
import Main from './Main';

async function onRegister(userModel, details, lang, onSuccess) {
  const { email, password, firstname, secondname } = details;
  if (!Device.isOnline()) {
    warn(t("Sorry, looks like you're offline."));
    return;
  }
  await loader.show({
    message: t('Please wait...'),
  });

  const registrationDetails = {
    type: 'users',
    email: email.trim(),
    firstname: firstname.trim(),
    secondname: secondname.trim(),
    password,
    passwordConfirm: password,
    termsAgree: true,
    lang,
  };

  try {
    await userModel.register(registrationDetails);
    alert({
      header: t('Welcome aboard!'),
      message: t(
        'Before submitting any records please check your email and click on the verification link.'
      ),
      buttons: [
        {
          text: t('OK, got it'),
          role: 'cancel',
          handler: onSuccess,
        },
      ],
    });
  } catch (err) {
    Log(err, 'e');
    error(`${err.message}`);
  }

  loader.hide();
}

export default function RegisterContainer({ userModel, appModel }) {
  const lang = appModel.get('language');
  const context = useContext(NavContext);

  const onSuccess = () => {
    context.goBack();
  };

  return (
    <IonPage>
      <AppHeader title={t('Register')} />
      <Main
        schema={userModel.registerSchema}
        onSubmit={details => onRegister(userModel, details, lang, onSuccess)}
        lang={lang}
      />
    </IonPage>
  );
}

RegisterContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
};
