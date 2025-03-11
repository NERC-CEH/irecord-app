import { useEffect, useContext } from 'react';
import { observer } from 'mobx-react';
import { Trans as T, useTranslation } from 'react-i18next';
import { useAlert } from '@flumens';
import { NavContext, IonItem, IonCheckbox, IonLabel } from '@ionic/react';
import VerificationIcon from 'common/Components/VerificationStatus/VerificationIcon';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import Occurrence from 'models/occurrence';
import './styles.scss';

let isPopupVisible = false;

const UpdatedRecordsDialog = () => {
  const alert = useAlert();
  const { t } = useTranslation();
  const { navigate } = useContext(NavContext);

  const { showVerifiedRecordsNotification } = appModel.data;

  const onToggleAlert = (e: any) => {
    // eslint-disable-next-line no-param-reassign
    appModel.data.showVerifiedRecordsNotification = !e.detail.checked;
  };

  const showAlert = () => {
    if (!showVerifiedRecordsNotification || isPopupVisible) return;

    const updatedOccurrences = samples.verified.updated;
    if (!updatedOccurrences?.length) return;

    isPopupVisible = true;

    const isStatus = (status: string) => (occ: Occurrence) =>
      occ.getVerificationStatus() === status;

    const verified = updatedOccurrences.filter(isStatus('verified')).length;
    const plausible = updatedOccurrences.filter(isStatus('plausible')).length;
    const rejected = updatedOccurrences.filter(isStatus('rejected')).length;
    const queried = updatedOccurrences.filter(isStatus('queried')).length;

    const message = (
      <>
        <p>
          <T>
            Some of your records have been verified or queried. You can find
            those in your <b>Uploaded</b> records list.
          </T>
        </p>

        <div className="counts">
          {!!verified && (
            <div className="verified-count">
              <VerificationIcon status="verified" />
              <span>
                <T>Accepted</T>:
              </span>
              <b>{verified}</b>
            </div>
          )}
          {!!plausible && (
            <div className="verified-count">
              <VerificationIcon status="plausible" />
              <span>
                <T>Plausible</T>:
              </span>
              <b>{plausible}</b>
            </div>
          )}
          {!!rejected && (
            <div className="verified-count">
              <VerificationIcon status="rejected" />
              <span>
                <T>Rejected</T>:
              </span>
              <b>{rejected}</b>
            </div>
          )}
          {!!queried && (
            <div className="verified-count">
              <VerificationIcon status="queried" />
              <span>
                <T>Queried</T>:
              </span>
              <b>{queried}</b>
            </div>
          )}
        </div>

        <IonItem lines="none">
          <IonCheckbox
            slot="start"
            checked={false}
            onIonChange={onToggleAlert}
          />
          <IonLabel>
            <small>
              <T>Do not show again</T>
            </small>
          </IonLabel>
        </IonItem>
      </>
    );

    alert({
      header: `${t('New verified records')} (${updatedOccurrences.length})`,
      message,
      cssClass: 'updated-records-dialog',
      backdropDismiss: false,
      skipTranslation: true,
      buttons: [
        {
          text: t('Close'),
          handler: () => {
            isPopupVisible = false;
            appModel.save();
          },
        },
        {
          text: t('See records'),
          handler: () => {
            isPopupVisible = false;
            appModel.save();
            navigate('/home/surveys/uploaded', 'root');
          },
        },
      ],
    });
  };

  useEffect(showAlert, [samples.verified?.timestamp]);

  return null;
};

export default observer(UpdatedRecordsDialog);
