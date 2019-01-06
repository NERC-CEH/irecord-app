import React from 'react';
import Log from 'helpers/log';
import radio from 'radio';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Menu from './Menu';

function showLogoutConfirmationDialog(callbackIfTrue) {
  radio.trigger('app:dialog', {
    title: 'Logout',
    body: `${t('Are you sure you want to logout?')}<p><i>${t(
      'This will delete all the records on this device.'
    )}</i></p>`,
    buttons: [
      {
        title: 'Cancel',
        fill: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        },
      },
      {
        title: 'Logout',
        color: 'danger',
        onClick() {
          callbackIfTrue();
          radio.trigger('app:dialog:hide');
        },
      },
    ],
  });
}

const Controller = observer(props => {
  const { userModel, appModel, savedSamples } = props;

  function logOut() {
    Log('Info:Menu: logging out.');
    showLogoutConfirmationDialog(() => {
      appModel.resetDefaults();
      userModel.logOut();
      return savedSamples.resetDefaults();
    });
  }

  return <Menu user={userModel.attrs} logOut={logOut} />;
});

Controller.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  savedSamples: PropTypes.object.isRequired,
};

export default Controller;
