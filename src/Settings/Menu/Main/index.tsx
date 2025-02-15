import { observer } from 'mobx-react';
import {
  arrowUndoOutline,
  schoolOutline,
  trashOutline,
  gridOutline,
  shareOutline,
  locationOutline,
  warningOutline,
  personRemoveOutline,
  cameraOutline,
  megaphoneOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, useAlert, InfoMessage, Toggle } from '@flumens';
import { IonIcon, IonList, IonItem, IonLabel, isPlatform } from '@ionic/react';
import config from 'common/config';
import './styles.scss';

function useDatabaseExportDialog(exportFn: any) {
  const alert = useAlert();

  const showDatabaseExportDialog = () => {
    alert({
      header: 'Export',
      message: (
        <>
          Are you sure you want to export the data?
          <p className="my-2 font-bold">
            This feature is intended solely for technical support and is not a
            supported method for exporting your data
          </p>
        </>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Export',
          handler: exportFn,
        },
      ],
    });
  };

  return showDatabaseExportDialog;
}

function useResetDialog(resetApp: any) {
  const alert = useAlert();

  const showResetDialog = () =>
    alert({
      header: 'Reset',
      message: (
        <>
          <T>
            Are you sure you want to reset the application to its initial state?
          </T>
          <p>
            <b>
              <T>This will wipe all the locally stored app data!</T>
            </b>
          </p>
        </>
      ),
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Reset',
          role: 'destructive',
          handler: resetApp,
        },
      ],
    });

  return showResetDialog;
}

function useUserDeleteDialog(deleteUser: any) {
  const alert = useAlert();

  const showUserDeleteDialog = () => {
    alert({
      header: 'Account delete',
      message: (
        <>
          <T>Are you sure you want to delete your account?</T>
          <InfoMessage color="danger" prefix={<IonIcon src={warningOutline} />}>
            This will remove your account on the iRecord website. You will lose
            access to any records that you have previously submitted using the
            app or website.
          </InfoMessage>
        </>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: deleteUser,
        },
      ],
    });
  };

  return showUserDeleteDialog;
}

function useDeleteAllSamplesDialog(deleteAllSamples: any) {
  const alert = useAlert();

  const showDeleteAllSamplesDialog = () =>
    alert({
      header: 'Remove All',
      message: (
        <T>
          Are you sure you want to remove all successfully synchronised local
          records?
          <p>
            <b>Note:</b> records on the server will not be touched.
          </p>
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: deleteAllSamples,
        },
      ],
    });

  return showDeleteAllSamplesDialog;
}

type Props = {
  resetApp: any;
  deleteUser: any;
  deleteAllSamples: any;
  isLoggedIn: boolean;
  useTraining: boolean;
  gridSquareUnit: string;
  onToggle: any;
  sendAnalytics?: boolean;
  useGridNotifications?: boolean;
  // useExperiments?: boolean;
  useSpeciesImageClassifier: boolean;
  exportDatabase: any;
  importDatabase: any;
};

const MenuMain = ({
  resetApp,
  isLoggedIn,
  deleteUser,
  deleteAllSamples,
  onToggle,
  useTraining,
  sendAnalytics,
  // useExperiments,
  gridSquareUnit,
  useSpeciesImageClassifier,
  useGridNotifications,
  exportDatabase,
  importDatabase,
}: Props) => {
  const showDatabaseExportDialog = useDatabaseExportDialog(exportDatabase);
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);
  const showResetDialog = useResetDialog(resetApp);
  const showDeleteAllSamplesDialog =
    useDeleteAllSamplesDialog(deleteAllSamples);

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);
  const onTrainingModeToggle = (checked: boolean) =>
    onToggle('useTraining', checked);
  // const onUseExperiments = (checked: boolean) =>
  //   onToggle('useExperiments', checked);
  const onUseImageClassifier = (checked: boolean) =>
    onToggle('useSpeciesImageClassifier', checked);
  const onToggleGridNotifications = (checked: boolean) =>
    onToggle('useGridNotifications', checked);

  return (
    <Main>
      <IonList lines="full">
        <h3 className="list-title">
          <T>Location</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/locations" detail>
            <IonIcon icon={locationOutline} size="small" slot="start" />
            <T>Manage Saved</T>
          </IonItem>

          <IonItem routerLink="/settings/survey" detail>
            <IonIcon icon={gridOutline} size="small" slot="start" />
            <IonLabel>
              <T>Grid Square Unit</T>
            </IonLabel>
            <IonLabel slot="end">{gridSquareUnit}</IonLabel>
          </IonItem>

          <Toggle
            prefix={<IonIcon src={megaphoneOutline} className="size-6" />}
            label="Grid Square Notifications"
            defaultSelected={useGridNotifications}
            onChange={onToggleGridNotifications}
          />
          <InfoMessage inline>
            We will alert you when you enter a new grid square during Species
            List or Plant surveys.
          </InfoMessage>
        </div>

        <h3 className="list-title">
          <T>Application</T>
        </h3>
        <div className="rounded-list">
          <Toggle
            prefix={<IonIcon src={cameraOutline} className="size-6" />}
            label="Suggest species"
            defaultSelected={useSpeciesImageClassifier}
            onChange={onUseImageClassifier}
          />
          <InfoMessage inline>
            Use image recognition to identify species from your photos.
          </InfoMessage>
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

          <Toggle
            prefix={<IonIcon src={schoolOutline} className="size-6" />}
            label="Training Mode"
            defaultSelected={useTraining}
            onChange={onTrainingModeToggle}
          />
          <InfoMessage inline>
            Mark any new records as 'training' and exclude from all reports.
          </InfoMessage>

          {/* <MenuAttrToggle
            icon={flameOutline}
            label="Experimental Features"
            value={useExperiments}
            onChange={onUseExperiments}
          />

          <InfoMessage inline>
            Some features are in a trial state and are subject to change in
            future releases.
          </InfoMessage> */}

          <Toggle
            label="Share App Analytics"
            prefix={<IonIcon src={shareOutline} className="size-5" />}
            onChange={onSendAnalyticsToggle}
            defaultSelected={sendAnalytics}
          />
          <InfoMessage inline>
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
          <IonItem onClick={showDatabaseExportDialog}>
            <IonIcon icon={cloudDownloadOutline} size="small" slot="start" />
            Export database
          </IonItem>

          {!isPlatform('hybrid') && (
            <IonItem onClick={importDatabase}>
              <IonIcon icon={cloudUploadOutline} size="small" slot="start" />
              Import database
            </IonItem>
          )}
        </div>

        <div className="destructive-item rounded-list mt-6">
          <IonItem onClick={showDeleteAllSamplesDialog}>
            <IonIcon icon={trashOutline} size="small" slot="start" />
            <IonLabel>
              <T>Remove Uploaded Surveys</T>
            </IonLabel>
          </IonItem>
          <InfoMessage inline>
            You can remove uploaded surveys from this device.
          </InfoMessage>

          <IonItem onClick={showResetDialog}>
            <IonIcon icon={arrowUndoOutline} size="small" slot="start" />
            <IonLabel>
              <T>Reset app</T>
            </IonLabel>
          </IonItem>
          <InfoMessage inline>
            You can reset the app data to its default settings.
          </InfoMessage>

          {isLoggedIn && (
            <>
              <IonItem onClick={showUserDeleteDialog}>
                <IonIcon icon={personRemoveOutline} size="small" slot="start" />
                <IonLabel>
                  <T>Delete account</T>
                </IonLabel>
              </IonItem>
              <InfoMessage inline>
                You can delete your user account from the system.
              </InfoMessage>
            </>
          )}
        </div>
      </IonList>

      <p className="float-right mx-2.5 my-3 opacity-70">{`v${config.version} (${config.build})`}</p>
    </Main>
  );
};

export default observer(MenuMain);
