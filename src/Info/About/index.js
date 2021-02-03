import React from 'react';
import { IonList, IonItem, IonLabel, IonPage } from '@ionic/react';
import AppMain from 'Components/Main';
import AppHeader from 'Components/Header';
import './styles.scss';

const Component = () => (
  <IonPage>
    <AppHeader title={t('About')} />
    <AppMain id="about" class="ion-padding">
      <IonList lines="none">
        <IonItem>
          <IonLabel>
            The ORKS app is a mobile application which enables you to record
            wildlife sightings in Cornwall and Scilly on the go. You can log
            your sighting with details, photos, descriptions and other
            information, and upload this to the{' '}
            <a href="https://www.orks.org.uk">www.ORKS.org.uk</a> website.
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t(
              'Your wildlife records are then available for conservation, sustainable planning, education and research work in Cornwall.'
            )}
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            ORKS website and app are developed and supported by ERCCIS,
            Environmental Records Centre for Cornwall and the Isles of Scilly{' '}
            <a href="https://www.erccis.org.uk">www.erccis.org.uk</a>
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel>
            <b>{t('Who can use the app?')}</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t(
              'We encourage everyone and anyone to use this app, to record and submit your wildlife sightings while out enjoying the Cornish wild places.'
            )}
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t(
              'You don’t have to be an expert, this app is for anyone with an interest in wildlife and who want to do more to protect Cornwall’s Wildlife and Wild Places.'
            )}
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel>
            <b>{t('How to use this app')}</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            The ORKS app is linked to the Online Recording Kernow and Scilly
            website - <a href="https://www.orks.org.uk">www.ORKS.org.uk</a>.
            Your account and sightings submitted through the app can be viewed
            and managed through the ORKS website.
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            Sign in or register an account on ORKS so you can submit your
            records:
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            - Add species sightings by going to the &#34;+&#34; icon at the
            bottom of the app
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            - Add all the details for the sightings, and photos from your device
            camera or gallery. The location of your sightings is obtained
            through your phone GPS but can be updated using the map.
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            - Once your record is correct and you have added all the details you
            want it is ready to submit; click on the &#34;UPLOAD&#34; button to
            submit it to the ORKS website.
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel>
            <b>{t('App Development')}</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            {t(
              'This app was developed using open source code for the iRecord app. Developed by ERCCIS and funding by the Alexanda Fund for Recorders.'
            )}
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            If you have any suggestions of feedback please contact{' '}
            <a href="mailto:orks%40cornwallwildlifetrust.org.uk?subject=ORKS%20App%20Support%20%26%20Feedback">
              ERCCIS
            </a>
            .
          </IonLabel>
        </IonItem>
      </IonList>
    </AppMain>
  </IonPage>
);

Component.propTypes = {};

export default Component;
