import { observer } from 'mobx-react';
import { alertOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Badge, useAlert } from '@flumens';
import {
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonItemSliding,
  IonIcon,
} from '@ionic/react';
import VerificationStatus from 'common/Components/VerificationStatus';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import IncrementalButton from 'Survey/common/Components/IncrementalButton';
import './styles.scss';

function useDeleteOccurrenceDialog(occ: Occurrence, onDelete: any) {
  const alert = useAlert();

  const showDeleteOccurrenceDialog = () => {
    const speciesPrettyName = occ.getPrettyName();
    alert({
      header: 'Delete',
      message: (
        <>
          <T>Are you sure you want to delete {{ speciesPrettyName }}?</T>
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
          handler: onDelete,
        },
      ],
    });
  };

  return showDeleteOccurrenceDialog;
}

const getLocationCommponent = (model: Sample) => {
  const location = model.data.location || {};
  const surveylocation = model.parent?.data.location || {};
  const isLocating = model.isGPSRunning();
  const isCustomLocation = surveylocation.gridref !== location.gridref;

  const locationString = isCustomLocation ? model.printLocation() : '';
  let locationComponent;
  if (locationString) {
    locationComponent = <span>{locationString}</span>;
  } else if (isLocating) {
    locationComponent = <span className="warn">Locating...</span>;
  } else {
    return null;
  }

  return <div className="location">{locationComponent}</div>;
};

type Props = {
  model: Sample | Occurrence;
  increaseCount: any;
  onDelete: any;
  useSubSamples?: boolean;
};

const SpeciesListItem = ({
  model,
  increaseCount,
  onDelete,
  useSubSamples,
}: Props) => {
  const { url } = useRouteMatch();

  const { isDisabled } = model;

  const occ: Occurrence = useSubSamples
    ? (model as Sample).occurrences[0]
    : (model as Occurrence);

  const showDeleteOccurrenceDialog = useDeleteOccurrenceDialog(occ, onDelete);

  if (!occ) return null; // if remote deleted but left sub-sample

  const getIncrementButton = () => {
    const increaseCountWrap = () => increaseCount(occ);
    const increase5xCountWrap = () => increaseCount(occ, true);

    const value =
      occ.data.number || occ.data['number-ranges'] || occ.data.abundance;

    if (!value && isDisabled) return null;

    return (
      <IncrementalButton
        onClick={increaseCountWrap}
        onLongClick={increase5xCountWrap}
        value={value}
        disabled={isDisabled}
      />
    );
  };

  const commonName = occ.getPrettyName();

  const modelPath = useSubSamples ? 'smp' : 'occ';

  const isValid = !isDisabled && !model.validateRemote();

  return (
    <IonItemSliding
      key={occ.cid}
      className="species-list-item"
      disabled={isDisabled}
    >
      <IonItem
        routerLink={`${url}/${modelPath}/${model.cid}`}
        detail={!occ.hasOccurrenceBeenVerified() && isValid}
      >
        {getIncrementButton()}

        <div className="details">
          <div className="species">
            {commonName || <Badge color="warning">Species missing</Badge>}
          </div>
          {useSubSamples && getLocationCommponent(model as Sample)}
        </div>

        {!isValid && (
          <IonIcon
            slot="end"
            src={alertOutline}
            className="species-entry-incomplete-warning"
          />
        )}

        <VerificationStatus occ={occ} />
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={showDeleteOccurrenceDialog}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default observer(SpeciesListItem);
