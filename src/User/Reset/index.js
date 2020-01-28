import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import Log from 'helpers/log';
import Device from 'helpers/device';
import { warn, error } from 'common/helpers/toast';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import AppHeader from 'Components/Header';
import Main from './Main';

async function onSubmit(userModel, details, onSuccess) {
  const { name } = details;
  if (!Device.isOnline()) {
    warn(t("Sorry, looks like you're offline."));
    return;
  }
  await loader.show({
    message: t('Please wait...'),
  });

  const resetDetails = {
    name: name.trim(),
  };

  try {
    await userModel.reset(resetDetails);
    alert({
      header: t("We've sent an email to you"),
      message: t(
        "Click the link in the email to reset your password. If you don't see the email, check other places like your junk, spam or other folders."
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

export default function Container({ userModel }) {
  const context = useContext(NavContext);

  const onSuccess = () => {
    context.goBack();
  };

  return (
    <IonPage>
      <AppHeader title={t('Reset')} />
      <Main
        schema={userModel.resetSchema}
        onSubmit={details => onSubmit(userModel, details, onSuccess)}
      />
    </IonPage>
  );
}

Container.propTypes = {
  userModel: PropTypes.object.isRequired,
};
