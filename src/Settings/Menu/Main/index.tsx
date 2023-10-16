import { FC } from 'react';
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
  cameraOutline, // megaphoneOutline,
} from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Main, useAlert, InfoMessage, MenuAttrToggle } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
} from '@ionic/react';
import config from 'common/config';
import './styles.scss';

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
          <InfoMessage
            color="danger"
            icon={warningOutline}
            className="destructive-warning"
          >
            This will wipe all the locally stored app data!
          </InfoMessage>
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
          <InfoMessage
            color="danger"
            icon={warningOutline}
            className="destructive-warning"
          >
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
  const { t } = useTranslation();
  const alert = useAlert();

  const showDeleteAllSamplesDialog = () =>
    alert({
      header: 'Remove All',
      message: `${t(
        'Are you sure you want to remove all successfully synchronised local records?'
      )}<p><i><b>${t('Note')}:</b> ${t(
        'records on the server will not be touched.'
      )}</i></p>`,
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
  geolocateSurveyEntries: boolean;
  onToggle: any;
  sendAnalytics?: boolean;
  // useExperiments?: boolean;
  useSpeciesImageClassifier: boolean;
};

const MenuMain: FC<Props> = ({
  resetApp,
  isLoggedIn,
  deleteUser,
  deleteAllSamples,
  onToggle,
  useTraining,
  sendAnalytics,
  // useExperiments,
  geolocateSurveyEntries,
  gridSquareUnit,
  useSpeciesImageClassifier,
}) => {
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);
  const showResetDialog = useResetDialog(resetApp);
  const showDeleteAllSamplesDialog =
    useDeleteAllSamplesDialog(deleteAllSamples);

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);
  const onTrainingModeToggle = (checked: boolean) =>
    onToggle('useTraining', checked);
  const onGeolocateSurveyEntriesToggle = (checked: boolean) =>
    onToggle('geolocateSurveyEntries', checked);
  // const onUseExperiments = (checked: boolean) =>
  //   onToggle('useExperiments', checked);
  const onUseImageClassifier = (checked: boolean) =>
    onToggle('useSpeciesImageClassifier', checked);

  // const onToggleGridAlert = () => console.log(11);

  return (
    <Main>
      <IonList lines="full">
        <IonItemDivider>
          <T>Location</T>
        </IonItemDivider>
        <div className="rounded">
          <IonItem routerLink="/settings/survey" detail>
            <IonIcon icon={gridOutline} size="small" slot="start" />
            <IonLabel>
              <T>Grid Square Unit</T>
            </IonLabel>
            <IonLabel slot="end">{gridSquareUnit}</IonLabel>
          </IonItem>

          {/* <MenuAttrToggle
            icon={megaphoneOutline}
            label="New Grid Square Alert"
            value={true}
            onChange={onToggleGridAlert}
          />
          <InfoMessage color="dark">
            We will alert you when you enter a new grid square during Species
            List or Plant surveys.
          </InfoMessage> */}

          <IonItem routerLink="/settings/locations" detail>
            <IonIcon icon={locationOutline} size="small" slot="start" />
            <T>Manage Saved</T>
          </IonItem>

          <MenuAttrToggle
            icon={locationOutline}
            label="Geolocate Survey Entries"
            value={geolocateSurveyEntries}
            onChange={onGeolocateSurveyEntriesToggle}
          />

          <InfoMessage color="dark">
            We will notify you when you cross into another grid square. You can
            select the square size in the app settings.
          </InfoMessage>
        </div>

        <IonItemDivider>
          <T>Application</T>
        </IonItemDivider>
        <div className="rounded">
          <MenuAttrToggle
            icon={cameraOutline}
            label="Suggest Species"
            value={useSpeciesImageClassifier}
            onChange={onUseImageClassifier}
          />
          <InfoMessage color="dark">
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

          <MenuAttrToggle
            icon={schoolOutline}
            label="Training Mode"
            value={useTraining}
            onChange={onTrainingModeToggle}
          />
          <InfoMessage color="dark">
            Mark any new records as 'training' and exclude from all reports.
          </InfoMessage>

          {/* <MenuAttrToggle
            icon={flameOutline}
            label="Experimental Features"
            value={useExperiments}
            onChange={onUseExperiments}
          />

          <InfoMessage color="dark">
            Some features are in a trial state and are subject to change in
            future releases.
          </InfoMessage> */}

          <MenuAttrToggle
            icon={shareOutline}
            label="Share App Analytics"
            value={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage color="dark">
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
        </div>

        <div className="destructive-item rounded">
          <IonItem onClick={showDeleteAllSamplesDialog}>
            <IonIcon icon={trashOutline} size="small" slot="start" />
            <IonLabel>
              <T>Remove Uploaded Surveys</T>
            </IonLabel>
          </IonItem>
          <InfoMessage color="dark">
            You can remove uploaded surveys from this device.
          </InfoMessage>

          <IonItem onClick={showResetDialog}>
            <IonIcon icon={arrowUndoOutline} size="small" slot="start" />
            <IonLabel>
              <T>Reset App</T>
            </IonLabel>
          </IonItem>
          <InfoMessage color="dark">
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
              <InfoMessage color="dark">
                You can delete your user account from the system.
              </InfoMessage>
            </>
          )}
        </div>
      </IonList>

      <p className="app-version">{`v${config.version} (${config.build})`}</p>
    </Main>
  );
};

export default observer(MenuMain);
