import { FC } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { IonLabel } from '@ionic/react';
import './styles.scss';

interface Props {
  sample: Sample;
}

const VerificationListIcon: FC<Props> = ({ sample }) => {
  let rejected = 0;
  let verified = 0;
  let plausible = 0;

  const aggregateStatus = (occ: Occurrence) => {
    if (!occ.isUploaded()) return null;

    const status = occ.getVerificationStatus();
    if (!status) return null;

    if (status === 'verified') verified += 1;
    if (status === 'plausible') plausible += 1;
    if (status === 'rejected') rejected += 1;

    return null;
  };

  const hasSubSample = sample.samples.length;
  if (hasSubSample) {
    const getSamples = (subSample: Sample) => {
      subSample.occurrences.forEach(aggregateStatus);
    };
    sample.samples.forEach(getSamples);
  } else {
    sample.occurrences.forEach(aggregateStatus);
  }

  if (!rejected && !plausible && !verified) return null;

  return (
    <IonLabel slot="end" className="verification-list-status">
      {!!rejected && <span className="id-red">{rejected}</span>}
      {!!plausible && <span className="id-amber">{plausible}</span>}
      {!!verified && <span className="id-green">{verified}</span>}
    </IonLabel>
  );
};

export default VerificationListIcon;
