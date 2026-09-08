import { observer } from 'mobx-react';
import { prettyPrintLocation } from '@flumens';
import { IonSpinner } from '@ionic/react';
import Sample from 'models/sample';
import './styles.scss';

function getValue(sample: Sample) {
  if (sample.isGPSRunning()) {
    return <IonSpinner />;
  }

  const { location } = sample.data;
  if (!location?.latitude || !location.longitude) return null;

  return prettyPrintLocation({
    ...location,
    latitude: location.latitude,
    longitude: location.longitude,
  });
}

type Props = {
  sample: Sample;
};

const GridRefValue = ({ sample }: Props) => {
  const value = getValue(sample);
  if (!value) return null;

  return <div className="gridref-label">{value}</div>;
};

export default observer(GridRefValue);
