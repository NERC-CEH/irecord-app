import { FC } from 'react';
import { IonSpinner } from '@ionic/react';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import { prettyPrintLocation } from '@flumens';

import './styles.scss';

function getValue(sample: Sample) {
  if (sample.isGPSRunning()) {
    return <IonSpinner />;
  }

  return prettyPrintLocation(sample.attrs.location);
}

type Props = {
  sample: Sample;
};

const GridRefValue: FC<Props> = ({ sample }) => {
  const value = getValue(sample);
  if (!value) return null;

  return <div className="gridref-label">{value}</div>;
};

export default observer(GridRefValue);
