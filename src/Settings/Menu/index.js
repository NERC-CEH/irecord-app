import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import { resetDefaults, removeAllSynced, setAllToSend } from 'saved_samples';
import AppHeader from 'Components/Header';
import { success, warn, error } from 'helpers/toast';
import Main from './Main';

async function resetApp(appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');

  try {
    appModel.resetDefaults();
    userModel.logOut();
    await resetDefaults();

    success(t('Done'));
  } catch (e) {
    error(`${e.message}`);
  }
}

async function deleteAllSamples() {
  Log('Settings:Menu:Controller: deleting all samples.');

  try {
    await removeAllSynced();
    success(t('Done'));
  } catch (e) {
    error(`${e.message}`);
  }
}

async function sendAllSamples(userModel) {
  Log('Settings:Menu:Controller: sending all samples.');
 
  if (!userModel.hasLogIn()) {
    warn(t('Please log in first to upload the records.'));
    return;
  }

  try {
    const affectedRecordsCount = await setAllToSend();
    success(`${t('Sending')} ${affectedRecordsCount} ${t('record(s)')}`);
  } catch (e) {
    error(`${e.message}`);
  }
}

// TODO:
// toggleGridAlertService(on) {
//   if (!on) {
//     gridAlertService.stop();
//     return;
//   }

//   gridAlertService.start(location => {
//     console.log(location.gridref);
//     API.showGridNotification(location);
//   });
// },

// showGridNotification(location) {
//   const body = `<h1 style="text-align: center;">${location.gridref}</h1>`;

//   radio.trigger('app:dialog', {
//     title: 'Grid Square',
//     body,
//   });
// },

function onToggle(appModel, setting, checked) {
  Log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked;
  appModel.save();
}
const Container = observer(({ appModel, userModel }) => {
  const {
    sendAnalytics,
    useTraining,
    useGridRef,
    useGridMap,
    useExperiments,
    gridSquareUnit,
    geolocateSurveyEntries,
  } = appModel.attrs;

  return (
    <IonPage>
      <AppHeader title={t('Settings')} />
      <Main
        sendAnalytics={sendAnalytics}
        useTraining={useTraining}
        useGridRef={useGridRef}
        useGridMap={useGridMap}
        useExperiments={useExperiments}
        gridSquareUnit={gridSquareUnit}
        geolocateSurveyEntries={geolocateSurveyEntries}
        resetApp={() => resetApp(appModel, userModel)}
        sendAllSamples={() => sendAllSamples(userModel)}
        deleteAllSamples={() => deleteAllSamples()}
        onToggle={(setting, checked) => onToggle(appModel, setting, checked)}
      />
    </IonPage>
  );
});

Container.propTypes = {
  appModel: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
};

export default Container;
