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
        <IonItem lines="inset">
          <IonLabel>
            <b>
              {t(
                'We are very grateful for all the people that helped to create this app:'
              )}
            </b>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <b>David Roy</b>
            {' '}
(UK Centre for Ecology & Hydrology)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Karolis Kazlauskis</b>
            {' '}
(Flumens)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>John van Breda</b>
            {' '}
(Biodiverse IT)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Tom Humphrey</b>
            {' '}
(BSBI)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Martin Harvey</b>
            {' '}
(CEH)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Sally Rankin</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Colin Harrower</b>
            {' '}
(CEH)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Tom August</b>
            {' '}
(CEH)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Chris Raper</b>
            {' '}
(NHM)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Charles Roper</b>
            {' '}
(FSC)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Matt Smith</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Alan Rowland</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>David Genney</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Graham Checkley</b>
          </IonLabel>
        </IonItem>
      </IonList>

      <IonList>
        <IonItem lines="none">
          <IonLabel>
            {t('This app was part-funded by the')}
            {' '}
            <a href="https://www.ceh.ac.uk/">Centre for Ecology & Hydrology</a>
/
            <a href="http://jncc.defra.gov.uk/">
              Joint Nature Conservation Committee
            </a>
            {' '}
            {t('partnership supporting BRC')}
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel>
            <b>{t('Welcome screen credits:')}</b>
          </IonLabel>
        </IonItem>
        <IonItem>David Kitching</IonItem>
        <IonItem>UK Ladybird Survey</IonItem>
      </IonList>
      <IonList>
        <IonItem lines="none">
          <IonLabel>
            {t('Icons were made by')}
            {' '}
            <a
              href="https://www.flaticon.com/authors/nhor-phai"
              title="Nhor Phai"
            >
              Nhor Phai
            </a>
            ,
            {' '}
            <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
              Freepik
            </a>
            {' '}
            from
            {' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </IonLabel>
        </IonItem>
      </IonList>
    </AppMain>
  </IonPage>
);
