import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner } from '@ionic/react';
import { Badge } from 'common/flumens';
import appModel from 'models/app';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
};

const Location = ({ sample }: Props) => {
  const isLocating = sample.isGPSRunning();
  const locationPrint = sample.printLocation();

  const { location } = sample.data;
  const locationName = location?.name;

  const survey = sample.getSurvey();
  const locationLocked = appModel.isAttrLocked(sample, 'locationName');

  if (!locationPrint) {
    if (isLocating) {
      return (
        <span className="italic">
          <T>Locating</T>
          <IonSpinner className="h-2" />
        </span>
      );
    }

    return (
      <Badge color="warning" size="small">
        No location
      </Badge>
    );
  }

  if (!locationName) {
    if (sample.isDisabled) return null;

    return (
      <Badge color="warning" size="small">
        No location name
      </Badge>
    );
  }

  const locationPretty = sample.printLocation();
  return (
    <>
      <span className={`text-sm ${locationLocked ? 'locked' : ''}`}>
        {locationName}
      </span>

      {survey.name !== 'default' && (
        <span className="text-sm">{` (${locationPretty})`}</span>
      )}
    </>
  );
};

export default observer(Location);
