import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Header, useToast, PickByType, useLoader } from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import appModel, { Attrs as AppModelAttrs } from 'models/app';
import savedSamples, { removeAllSynced } from 'models/savedSamples';
import userModel from 'models/user';
import Main from './Main';

async function resetApp(toast: any) {
  console.log('Settings:Menu:Controller: resetting the application!');

  try {
    await appModel.resetDefaults();
    await userModel.resetDefaults();
    await savedSamples.reset();

    toast.success('Done', { position: 'bottom' });
  } catch (e: any) {
    toast.error(`${e.message}`);
  }
}

async function deleteAllSamples(toast: any) {
  console.log('Settings:Menu:Controller: deleting all samples.');

  try {
    await removeAllSynced();
    toast.success('Done', { position: 'bottom' });
  } catch (e: any) {
    toast.error(`${e.message}`);
  }
}

const useDeleteUser = () => {
  const toast = useToast();
  const loader = useLoader();
  const { goBack } = useContext(NavContext);

  const deleteUser = async () => {
    console.log('Settings:Menu:Controller: deleting the user!');

    await loader.show('Please wait...');

    try {
      await userModel.delete();
      goBack();
      toast.success('Done', { position: 'bottom' });
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  return deleteUser;
};

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

function onToggle(
  setting: keyof PickByType<AppModelAttrs, boolean>,
  checked: boolean
) {
  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  appModel.attrs[setting] = checked;
  appModel.save();
}

const Container = () => {
  const deleteUser = useDeleteUser();

  const {
    sendAnalytics,
    useTraining,
    // useExperiments,
    gridSquareUnit,
    geolocateSurveyEntries,
    useSpeciesImageClassifier,
    useGridNotifications,
  } = appModel.attrs;

  const toast = useToast();

  return (
    <Page id="settings">
      <Header title="Settings" />
      <Main
        isLoggedIn={userModel.isLoggedIn()}
        deleteUser={deleteUser}
        sendAnalytics={sendAnalytics}
        useTraining={useTraining}
        // useExperiments={useExperiments}
        gridSquareUnit={gridSquareUnit}
        useGridNotifications={useGridNotifications}
        geolocateSurveyEntries={geolocateSurveyEntries}
        useSpeciesImageClassifier={useSpeciesImageClassifier}
        resetApp={() => resetApp(toast)}
        deleteAllSamples={() => deleteAllSamples(toast)}
        onToggle={(setting: any, checked: any) => onToggle(setting, checked)}
      />
    </Page>
  );
};

export default observer(Container);
