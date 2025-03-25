import { useContext } from 'react';
import { observer } from 'mobx-react';
import writeBlob from 'capacitor-blob-writer';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Page, Header, useToast, PickByType, useLoader } from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import CONFIG from 'common/config';
import groups from 'common/models/collections/groups';
import { db } from 'common/models/store';
import appModel, { Data as AppModelData } from 'models/app';
import samples, { removeAllSynced } from 'models/collections/samples';
import userModel from 'models/user';
import Main from './Main';

async function resetApp(toast: any) {
  console.log('Settings:Menu:Controller: resetting the application!');

  try {
    await appModel.reset();
    await userModel.reset();
    await groups.reset();
    await samples.reset();

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

const exportDatabase = async () => {
  const blob = await db.export();

  if (!isPlatform('hybrid')) {
    window.open(window.URL.createObjectURL(blob), '_blank');
    return;
  }

  const path = `export-app-${CONFIG.build}-${Date.now()}.db`;
  const directory = Directory.External;

  await writeBlob({ path, directory, blob });
  const { uri: url } = await Filesystem.getUri({ directory, path });
  await Share.share({ title: `App database`, files: [url] });
  await Filesystem.deleteFile({ directory, path });
};

// For dev purposes only
const importDatabase = async () => {
  const blob = await new Promise<Blob>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function () {
      const fileReader = new FileReader();
      fileReader.onloadend = async (e: any) =>
        resolve(
          new Blob([e.target.result], { type: 'application/vnd.sqlite3' })
        );
      fileReader.readAsArrayBuffer(input.files![0]);
    });
    input.click();
  });

  await db.sqliteConnection.closeAllConnections();
  await db.import(blob);
  window.location.reload();
};

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
  setting: keyof PickByType<AppModelData, boolean>,
  checked: boolean
) {
  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  appModel.data[setting] = checked;
  appModel.save();
}

const Container = () => {
  const deleteUser = useDeleteUser();

  const {
    sendAnalytics,
    useTraining,
    // useExperiments,
    gridSquareUnit,
    useSpeciesImageClassifier,
    useGridNotifications,
  } = appModel.data;

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
        useSpeciesImageClassifier={useSpeciesImageClassifier}
        resetApp={() => resetApp(toast)}
        deleteAllSamples={() => deleteAllSamples(toast)}
        onToggle={(setting: any, checked: any) => onToggle(setting, checked)}
        exportDatabase={exportDatabase}
        importDatabase={importDatabase}
      />
    </Page>
  );
};

export default observer(Container);
