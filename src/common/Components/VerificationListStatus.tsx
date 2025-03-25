import { IonLabel } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

interface Props {
  sample: Sample;
}

const VerificationListStatus = ({ sample }: Props) => {
  let rejected = 0;
  let verified = 0;
  let plausible = 0;

  const aggregateStatus = (occ: Occurrence) => {
    if (!occ?.isUploaded) return null;

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
    <IonLabel
      slot="end"
      className="m-0 mr-[3px] flex max-w-max flex-row text-[0.8em] opacity-100"
    >
      {!!rejected && (
        <span className="m-0 mr-px flex h-5 w-5 max-w-[25px] items-center justify-center rounded-[50%] bg-[var(--verification-rejected)] text-center font-medium text-[white] opacity-100">
          {rejected}
        </span>
      )}
      {!!plausible && (
        <span className="m-0 mr-px flex h-5 w-5 max-w-[25px] items-center justify-center rounded-[50%] bg-[var(--verification-plausible)] text-center font-medium text-[white] opacity-100">
          {plausible}
        </span>
      )}
      {!!verified && (
        <span className="m-0 mr-px flex h-5 w-5 max-w-[25px] items-center justify-center rounded-[50%] bg-[var(--verification-success)] text-center font-medium text-[white] opacity-100">
          {verified}
        </span>
      )}
    </IonLabel>
  );
};

export default VerificationListStatus;
