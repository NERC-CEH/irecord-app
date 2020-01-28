import React from 'react';
import AppHeader from 'Components/Header';
import { IonList, IonLabel, IonItem, IonPage } from '@ionic/react';
import AppMain from 'Components/Main';
import './styles.scss';
import './BRC_approved_logo.png';

export default () => (
  <IonPage>
    <AppHeader title={t('Help')} />
    <AppMain id="help">
      <img src="/images/BRC_approved_logo.png" className="brc-approved-logo" />

      <IonList lines="none">
        <IonItem>
          <IonLabel class="ion-text-wrap">
            {t(
              'Wherever you see this logo on a biological recording app you can be assured that the data you submit will be: made available to experts for quality assurance; made available for conservation and research and preserved for long-term use.'
            )}
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel class="ion-text-wrap">
            <b>
              {t('This logo indicates that your data is')}
:
            </b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel class="ion-text-wrap">
            {t(
              'Sent to the Biological Record Centre’s data warehouse linked to the iRecord system where it accessible to you as the recorder, to an expert community of verifiers and other users of iRecord'
            )}
            .
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel class="ion-text-wrap">
            {t(
              'Quality assured data is passed onto Local Environmental Records Centres, National Recording Schemes and to the NBN Gateway'
            )}
            .
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel class="ion-text-wrap">
            <b>{t('About BRC')}</b>
          </IonLabel>
        </IonItem>

        <IonItem>
          {' '}
          <IonLabel class="ion-text-wrap">
            The
            {' '}
            <a href="http://www.brc.ac.uk" rel="external">
              Biological Records Centre
            </a>
            {' '}
            (BRC),
            {' '}
            {t(
              'established in 1964, is a national focus in the UK for terrestrial and freshwater species recording. BRC works closely with the voluntary recording community, principally through support of national recording schemes and societies. BRC is supported by the Joint Nature Conservation Committee (JNCC) and the Centre for Ecology & Hydrology (CEH) within the Natural Environment Research Council (NERC). The work of BRC is a major component of the National Biodiversity Network (NBN)'
            )}
            .
          </IonLabel>
        </IonItem>
      </IonList>
      <IonList lines="none">
        <IonItem lines="inset">
          <IonLabel class="ion-text-wrap">
            <b>{t('Which app should I use?')}</b>
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel class="ion-text-wrap">
            {t('You might have noticed that several of')}
            {' '}
            <a href="http://www.brc.ac.uk/apps" rel="external">
              {t('BRC apps')}
            </a>
            {' '}
            {t(
              'feature some of the same species?  We have introduced the BRC Approved logo to signify that data from our apps all go to the same place. Therefore, you are free to choose which app you use to record a given species. All records will be sent to the same place, treated in the same way and will meet the established standards required by the Biological Record Centre'
            )}
            .
          </IonLabel>
        </IonItem>
      </IonList>
    </AppMain>
  </IonPage>
);
