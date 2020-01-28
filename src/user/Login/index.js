import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import Log from 'helpers/log';
import Device from 'helpers/device';
import { warn, error } from 'helpers/toast';
import loader from 'helpers/loader';
import AppHeader from 'Components/Header';
import Main from './Main';

async function onLogin(userModel, details, onSuccess) {
  const { name, password } = details;
  if (!Device.isOnline()) {
    warn(t("Sorry, looks like you're offline."));
    return;
  }
  await loader.show({
    message: t('Please wait...'),
  });

  const loginDetails = {
    name: name.trim(),
    password,
  };

  try {
    await userModel.logIn(loginDetails);

    onSuccess();
  } catch (err) {
    Log(err, 'e');
    error(`${err.message}`);
  }

  loader.hide();
}

export default function LoginContainer({ userModel, onSuccess }) {
  const context = useContext(NavContext);

  const onSuccessReturn = () => {
    onSuccess && onSuccess();
    const { from } = context.getLocation().state;
    if (from && !from.pathname.includes('/info/menu')) {
      window.history.back();
      return;
    }

    context.goBack();
  };

  return (
    <IonPage>
      <AppHeader title={t('Login')} />
      <Main
        schema={userModel.loginSchema}
        onSubmit={details => onLogin(userModel, details, onSuccessReturn)}
      />
    </IonPage>
  );
}

LoginContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
