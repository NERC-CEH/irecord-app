import { FC, useEffect, useContext } from 'react';
import { useAlert } from '@flumens';
import appModel from 'models/app';
import savedSamples from 'models/savedSamples';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import { NavContext, IonItem, IonCheckbox, IonLabel } from '@ionic/react';
import VerificationIcon from 'common/Components/VerificationStatus/VerificationIcon';
import './styles.scss';

let isPopupVisible = false;

const UpdatedRecordsDialog: FC = () => {
  const alert = useAlert();
  const { navigate } = useContext(NavContext);

  const { showVerifiedRecordsNotification } = appModel.attrs;

  const onToggleAlert = (e: any) => {
    // eslint-disable-next-line no-param-reassign
    appModel.attrs.showVerifiedRecordsNotification = !e.detail.checked;
  };

  const showAlert = () => {
    if (!showVerifiedRecordsNotification || isPopupVisible) return;

    const updatedOccurrences = savedSamples.verified.updated;
    if (!updatedOccurrences?.length) return;

    isPopupVisible = true;

    const isStatus = (status: string) => (occ: Occurrence) =>
      occ.getVerificationStatus() === status;

    const verified = updatedOccurrences.filter(isStatus('verified')).length;
    const plausible = updatedOccurrences.filter(isStatus('plausible')).length;
    const rejected = updatedOccurrences.filter(isStatus('rejected')).length;

    const message = (
      <>
        <p>
          Some of your records have been verified. You can find those in your
          Uploaded records list.
        </p>

        {!!verified && (
          <div className="verified-count">
            <VerificationIcon status="verified" />
            <span>
              Accepted: <b>{verified}</b>
            </span>
          </div>
        )}
        {!!plausible && (
          <div className="verified-count">
            <VerificationIcon status="plausible" />
            <span>
              Plausible: <b>{plausible}</b>
            </span>
          </div>
        )}
        {!!rejected && (
          <div className="verified-count">
            <VerificationIcon status="rejected" />
            <span>
              Rejected: <b>{rejected}</b>
            </span>
          </div>
        )}

        <IonItem lines="none">
          <IonCheckbox
            slot="start"
            checked={false}
            onIonChange={onToggleAlert}
          />
          <IonLabel>
            <small>Do not show again</small>
          </IonLabel>
        </IonItem>
      </>
    );

    alert({
      header: `New verified records (${updatedOccurrences.length})`,
      message,
      cssClass: 'updated-records-dialog',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Close',
          handler: () => {
            isPopupVisible = false;
            appModel.save();
          },
        },
        {
          text: 'See records',
          handler: () => {
            isPopupVisible = false;
            appModel.save();
            navigate('/home/surveys/uploaded', 'root');
          },
        },
      ],
    });
  };

  useEffect(showAlert, [savedSamples.verified?.timestamp]);

  return null;
};

export default observer(UpdatedRecordsDialog);
