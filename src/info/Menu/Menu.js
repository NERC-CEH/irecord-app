import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

const Component = observer(props => {
  const { password: login, firstname, secondname } = props.user;
  return (
    <ion-list lines="full">
      {login && (
        <ion-item detail id="logout-button" onClick={props.logOut}>
          <span slot="start" className="icon icon-logout" />
          {t('Logout')}: {firstname} {secondname}
        </ion-item>
      )}
      {login && (
        <ion-item href="#user/statistics" detail>
          <span slot="start" className="icon icon-statistics" />
          {t('Statistics')}
        </ion-item>
      )}

      {!login && (
        <ion-item href="#user/login" detail>
          <span slot="start" className="icon icon-user" />
          {t('Login')}
        </ion-item>
      )}

      {!login && (
        <ion-item href="#user/register" detail>
          <span slot="start" className="icon icon-user-plus" />
          {t('Register')}
        </ion-item>
      )}

      <ion-item-divider>{t('Settings')}</ion-item-divider>
      <ion-item href="#settings" detail>
        <span slot="start" className="icon icon-settings" />
        {t('App')}
      </ion-item>

      <ion-item-divider>{t('Info')}</ion-item-divider>
      <ion-item href="#info/about" detail>
        <span slot="start" className="icon icon-info" />
        {t('About')}
      </ion-item>
      <ion-item href="#info/help" detail>
        <span slot="start" className="icon icon-help" />
        {t('Help')}
      </ion-item>
      <ion-item href="#info/privacy" detail>
        <span slot="start" className="icon icon-lock-closed" />
        {t('Privacy Policy')}
      </ion-item>
      <ion-item href="#info/brc-approved" detail>
        <span slot="start" className="icon icon-thumbs-up" />
        {t('BRC Approved')}
      </ion-item>
      <ion-item href="#info/credits" detail>
        <span slot="start" className="icon icon-heart" />
        {t('Credits')}
      </ion-item>
    </ion-list>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  user: PropTypes.object
};

export default Component;
