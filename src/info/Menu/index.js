import React from 'react';
import Log from 'helpers/log';
import radio from 'radio';
import PropTypes from 'prop-types';
import Menu from './Menu';

function showLogoutConfirmationDialog(callbackIfTrue) {
  radio.trigger('app:dialog', {
    title: 'Are you sure you want to logout?',
    buttons: [
      {
        title: 'Cancel',
        type: 'clear',
        onClick() {
          radio.trigger('app:dialog:hide');
        }
      },
      {
        title: 'Logout',
        class: 'btn-negative',
        onClick() {
          callbackIfTrue();
          radio.trigger('app:dialog:hide');
        }
      }
    ]
  });
}

const Controller = props => {
  const { userModel } = props;

  function logOut() {
    Log('Info:Menu: logging out.');
    showLogoutConfirmationDialog(userModel.logOut.bind(userModel));
  }

  return <Menu user={userModel.attributes} logOut={logOut} />;
};

Controller.propTypes = {
  userModel: PropTypes.object
};

export default Controller;
