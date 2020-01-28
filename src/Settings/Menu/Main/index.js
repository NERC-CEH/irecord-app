import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Toggle from 'Components/Toggle';
import {
  IonIcon,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/react';
import {
  flame,
  undo,
  school,
  trash,
  grid,
  share,
  paperPlane,
  pin,
} from 'ionicons/icons';
import AppMain from 'Components/Main';
import alert from 'common/helpers/alert';
import config from 'config';
import './styles.scss';

function resetDialog(reset) {
  alert({
    header: t('Reset'),
    message: `${t(
      'Are you sure you want to reset the application to its initial state?'
    )}<p><b>${t('This will wipe all the locally stored app data!')}</b></p>`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Reset'),
        cssClass: 'danger',
        handler: reset,
      },
    ],
  });
}

function deleteAllSamplesDialog(deleteAllSamples) {
  alert({
    header: t('Remove All'),
    message: `${t(
      'Are you sure you want to remove all successfully synchronised local records?'
    )}<p><i><b>${t('Note')}:</b> ${t(
      'records on the server will not be touched.'
    )}</i></p>`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Remove'),
        cssClass: 'danger',
        handler: deleteAllSamples,
      },
    ],
  });
}

function sendAllSamplesDialog(sendAllSamples) {
  alert({
    header: t('Submit All'),
    message: t(
      'Are you sure you want to set all valid records for submission?'
    ),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Submit'),
        cssClass: 'secondary',
        handler: sendAllSamples,
      },
    ],
  });
}

@observer
class Component extends React.Component {
  static propTypes = {
    resetApp: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    sendAllSamples: PropTypes.func.isRequired,
    deleteAllSamples: PropTypes.func.isRequired,
    useTraining: PropTypes.bool.isRequired,
    useExperiments: PropTypes.bool.isRequired,
    sendAnalytics: PropTypes.bool.isRequired,
    useGridRef: PropTypes.bool.isRequired,
    useGridMap: PropTypes.bool.isRequired,
    geolocateSurveyEntries: PropTypes.bool.isRequired,
    gridSquareUnit: PropTypes.string.isRequired,
  };

  render() {
    const {
      resetApp,
      sendAllSamples,
      deleteAllSamples,
      onToggle,
      useTraining,
      sendAnalytics,
      useGridRef,
      useExperiments,
      geolocateSurveyEntries,
      useGridMap,
      gridSquareUnit,
    } = this.props;

    return (
      <AppMain class="app-settings">
        <IonList lines="full">
          <IonItemDivider>{t('Records')}</IonItemDivider>
          <IonItem
            id="submit-all-btn"
            onClick={() => sendAllSamplesDialog(sendAllSamples)}
          >
            <IonIcon icon={paperPlane} size="small" slot="start" />
            <IonLabel> 
              {' '}
              {t('Submit All')}
            </IonLabel>
          </IonItem>
          <IonItem
            id="delete-all-btn"
            onClick={() => deleteAllSamplesDialog(deleteAllSamples)}
          >
            <IonIcon icon={trash} size="small" slot="start" />
            {t('Remove All Saved')}
          </IonItem>

          <IonItemDivider>{t('Location')}</IonItemDivider>
          <IonItem>
            <IonIcon icon={grid} size="small" slot="start" />
            <IonLabel>{t('Use Grid Ref')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('useGridRef', checked)}
              checked={useGridRef}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  'Locations should be represented as UK Grid Reference instead of Latitude and Longitude.'
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={grid} size="small" slot="start" />
            <IonLabel>{t('Show Map Grid')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('useGridMap', checked)}
              disabled={!useGridRef}
              checked={useGridMap}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  'Show UK Grid Reference over the map.'
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/locations" detail>
            <IonIcon icon={pin} size="small" slot="start" />
            {t('Manage Saved')}
          </IonItem>
          <IonItem routerLink="/settings/survey" detail>
            <IonIcon icon={grid} size="small" slot="start" />
            <IonLabel>{t('Grid Square Unit')}</IonLabel>
            <IonLabel slot="end">{gridSquareUnit}</IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={pin} size="small" slot="start" />
            <IonLabel>{t('Geolocate Survey Entries')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('geolocateSurveyEntries', checked)}
              checked={geolocateSurveyEntries}
            />
          </IonItem>
          <IonItemDivider>{t('Application')}</IonItemDivider>
          {/* <IonItem routerLink="/settings/language">
            <IonLabel>{t('Language')}</IonLabel>
            <IonIcon icon={flag} size="small" slot="start" />
            <IonLabel slot="end">{languages[language]}</IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country">
            <IonLabel>{t('Country')}</IonLabel>
            <IonIcon icon={globe} size="small" slot="start" />
            <IonLabel slot="end">{t(countries[country])}</IonLabel>
          </IonItem> */}

          <IonItem>
            <IonIcon icon={school} size="small" slot="start" />
            <IonLabel>{t('Training Mode')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('useTraining', checked)}
              checked={useTraining}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  "Mark any new records as 'training' and exclude from all reports."
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={flame} size="small" slot="start" />
            <IonLabel>{t('Experimental Features')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('useExperiments', checked)}
              checked={useExperiments}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  'Some features are in a trial state and are subject to change in future releases.'
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={share} size="small" slot="start" />
            <IonLabel>{t('Share App Analytics')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('sendAnalytics', checked)}
              checked={sendAnalytics}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  'Share app crash data so we can make the app more reliable.'
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem id="app-reset-btn" onClick={() => resetDialog(resetApp)}>
            <IonIcon icon={undo} size="small" slot="start" />
            {t('Reset App')}
          </IonItem>
        </IonList>

        <p className="app-version">{`v${config.version} (${config.build})`}</p>
      </AppMain>
    );
  }
}

export default Component;
