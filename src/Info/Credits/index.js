import React from 'react';
import { IonList, IonItem, IonLabel, IonPage } from '@ionic/react';
import AppMain from 'Components/Main';
import AppHeader from 'Components/Header';
import './sponsors.svg';
import './styles.scss';

export default () => (
  <IonPage>
    <AppHeader title={t('Credits')} />
    <AppMain id="credits" class="ion-padding">
      <IonList lines="none">
        <IonItem>
          <img src="/images/sponsors.svg" alt="" />
        </IonItem>
      </IonList>

      <IonList lines="none">
        <IonItem>
          <IonLabel>
            <b>
              {t(
                'We are very grateful for all the people that have helped to develop and test the ORKS App:'
              )}
            </b>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <b>Richard Frost</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>ERCCIS Staff (past and present!)</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>ERCCIS Volunteers (past and present!)</b>
          </IonLabel>
        </IonItem>
        <IonItem lines="inset">
          <IonLabel>
            <b>
              A special thank you to Niki, Laura 1, Laura 2, Amity, Josh, Nic,
              Gary, John, Jenny, Alan and Stuart.
            </b>
          </IonLabel>
        </IonItem>
      </IonList>

      <IonList>
        <IonItem lines="inset">
          <IonLabel>
            {t('This app was funded by ')}
            <a href="https://www.erccis.org.uk/">ERCCIS</a>{' '}
            {t('and the Alexanda Fund for Recorders.')}
          </IonLabel>
        </IonItem>
        <IonItem lines="none">
          <IonLabel>
            {t(
              'Many thanks to the photographers for the use of their images in the welcome screen gallery.'
            )}
          </IonLabel>
        </IonItem>
      </IonList>
    </AppMain>
  </IonPage>
);
