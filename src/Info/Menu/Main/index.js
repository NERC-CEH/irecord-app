import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonIcon, IonList, IonItem, IonItemDivider } from '@ionic/react';
import {
  settings,
  exit,
  person,
  personAdd,
  lock,
  heart,
  helpBuoy,
  thumbsUp,
  informationCircleOutline,
} from 'ionicons/icons';
import AppMain from 'Components/Main';
import config from 'config';
import './styles.scss';
import './logo.svg';

const Component = observer(({ isLoggedIn, user, logOut, appModel }) => {
  const lang = appModel.attrs.language;

  return (
    <AppMain class="app-menu">
      <img src="/images/logo.svg" alt="app logo" />

      <IonList lines="full">
        {isLoggedIn && (
          <IonItem detail id="logout-button" onClick={logOut}>
            <IonIcon icon={exit} size="small" slot="start" />
            {t('Logout')}
            {': '}
            {user.firstname} {user.secondname}
          </IonItem>
        )}
        {/* {isLoggedIn && (
          <IonItem routerLink="/user/statistics" detail>
            <IonIcon icon={stats} size="small" slot="start" />
            {t('Statistics')}
          </IonItem>
        )} */}

        {!isLoggedIn && (
          <IonItem routerLink="/user/login" detail>
            <IonIcon icon={person} size="small" slot="start" />
            {t('Login')}
          </IonItem>
        )}

        {!isLoggedIn && (
          <IonItem routerLink="/user/register" detail>
            <IonIcon icon={personAdd} size="small" slot="start" />
            {t('Register')}
          </IonItem>
        )}

        <IonItemDivider>{t('Settings')}</IonItemDivider>
        <IonItem routerLink="/settings/menu" detail>
          <IonIcon icon={settings} size="small" slot="start" />
          {t('App')}
        </IonItem>

        <IonItemDivider>{t('Info')}</IonItemDivider>
        <IonItem routerLink="/info/about" detail>
          <IonIcon icon={informationCircleOutline} size="small" slot="start" />
          {t('About')}
        </IonItem>

        <IonItem routerLink="/info/help" detail>
          <IonIcon icon={helpBuoy} size="small" slot="start" />
          {t('Help')}
        </IonItem>
        <IonItem routerLink="/info/brc-approved" detail>
          <IonIcon icon={thumbsUp} size="small" slot="start" />
          {t('BRC Approved')}
        </IonItem>

        <IonItem routerLink="/info/credits" detail>
          <IonIcon icon={heart} size="small" slot="start" />
          {t('Credits')}
        </IonItem>

        <IonItem
          href={`${config.site_url}/AboutUs/Policies`}
          target="_blank"
          detail
        >
          <IonIcon icon={lock} size="small" slot="start" />
          {t('Privacy Policy')}
        </IonItem>
      </IonList>
    </AppMain>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Component;
