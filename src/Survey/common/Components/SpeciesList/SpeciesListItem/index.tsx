import { FC } from 'react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import {
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonItemSliding,
  IonIcon,
} from '@ionic/react';
import { useAlert } from '@flumens';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { Trans as T } from 'react-i18next';
import { alertOutline } from 'ionicons/icons';
import VerificationStatus from 'common/Components/VerificationStatus';
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
  const location = model.attrs.location || {};
  const surveylocation = model.parent?.attrs.location || {};
  const isLocating = model.isGPSRunning();
  const isCustomLocation = surveylocation.gridref !== location.gridref;

  const locationString = isCustomLocation ? model.printLocation() : '';
  let locationComponent;
  if (locationString) {
    locationComponent = <span>{locationString}</span>;
  } else if (isLocating) {
    locationComponent = <span className=" warn">Locating...</span>;
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

const SpeciesListItem: FC<Props> = ({
  model,
  increaseCount,
  onDelete,
  useSubSamples,
}) => {
  const { url } = useRouteMatch();

  const isDisabled = model.isDisabled();

  const occ: Occurrence = useSubSamples
    ? (model as Sample).occurrences[0]
    : (model as Occurrence);

  const showDeleteOccurrenceDialog = useDeleteOccurrenceDialog(occ, onDelete);

  const getIncrementButton = () => {
    const increaseCountWrap = () => increaseCount(occ);
    const increase5xCountWrap = () => increaseCount(occ, true);

    const value =
      occ.attrs.number || occ.attrs['number-ranges'] || occ.attrs.abundance;

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

  const survey = model.getSurvey();
  const isValid = survey.verify ? !survey.verify(model.attrs) : true;

  return (
    <IonItemSliding
      key={occ.cid}
      className="species-list-item"
      disabled={isDisabled}
    >
      <IonItem
        routerLink={`${url}/${modelPath}/${model.cid}`}
        detail={!occ.hasOccurrenceBeenVerified()}
      >
        {getIncrementButton()}

        <div className="details">
          <div className="species">{commonName}</div>
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
