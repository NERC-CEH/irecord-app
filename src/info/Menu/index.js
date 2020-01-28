import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import alert from 'common/helpers/alert';
import AppHeader from 'Components/Header';
import { resetDefaults } from 'saved_samples';
import Main from './Main';

function showLogoutConfirmationDialog(callback) {
  alert({
    header: t('Logout'),
    message: `${t('Are you sure you want to logout?')}`,
    inputs: [
      {
        name: 'reset',
        type: 'checkbox',
        label: 'Discard local data',
        value: 'reset',
        checked: true,
      },
    ],
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: t('Logout'),
        cssClass: 'primary',
        handler: callback,
      },
    ],
  });
}

const Controller = observer(props => {
  const { userModel, appModel, savedSamples, ...restProps } = props;

  function logOut() {
    Log('Info:Menu: logging out.');
    showLogoutConfirmationDialog(async ([reset]) => {
      userModel.logOut();
      if (reset) {
        await resetDefaults();
      }
    });
  }

  const isLoggedIn = userModel.hasLogIn();
  return (
    <IonPage>
      <AppHeader title={t('Menu')} />
      <Main
        user={userModel.attrs}
        appModel={appModel}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
        {...restProps}
      />
    </IonPage>
  );
});

Controller.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  savedSamples: PropTypes.array.isRequired,
};

export default Controller;
