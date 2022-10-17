import { FC } from 'react';
import Sample from 'models/sample';
import { IonBadge, IonSpinner } from '@ionic/react';
import appModel from 'models/app';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

type Props = {
  sample: Sample;
};

const Location: FC<Props> = ({ sample }) => {
  const isLocating = sample.isGPSRunning();
  const locationPrint = sample.printLocation();

  const { location } = sample.attrs;
  const locationName = location.name;

  const survey = sample.getSurvey();
  const locationLocked = appModel.isAttrLocked(sample, 'locationName');

  if (!locationPrint) {
    if (isLocating) {
      return (
        <span className="location">
          <T>Locating</T>
          <IonSpinner />.
        </span>
      );
    }

    return (
      <span className="location warning">
        <IonBadge className="location-warning" color="warning">
          <T>No location </T>
        </IonBadge>
      </span>
    );
  }

  if (!locationName) {
    return (
      <IonBadge className="location warning" color="warning">
        <T>No location name</T>
      </IonBadge>
    );
  }

  const locationPretty = sample.printLocation();
  return (
    <>
      <span className={`location ${locationLocked ? 'locked' : ''}`}>
        {locationName}
      </span>

      {survey.name !== 'default' && <span>{` (${locationPretty})`}</span>}
    </>
  );
};

export default observer(Location);
