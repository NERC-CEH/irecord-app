/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import { alertCircleOutline } from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/react';
import Occurrence from 'models/occurrence';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';

type Props = { occurrence: Occurrence };

const ClassificationStatus = ({ occurrence }: Props) => {
  if (occurrence.isIdentifying)
    return (
      <IonSpinner
        slot="end"
        className="m-0.5 block size-5 rounded-full bg-black/65 text-white"
      />
    );

  let probability = occurrence.getSelectedTaxonProbability();
  const userHasNotSelected = !Number.isFinite(probability);
  if (userHasNotSelected) {
    probability = occurrence.getTopSuggestionProbability();
  }

  if (probability)
    return <ProbabilityBadge probability={probability} className="" />;

  return (
    <IonIcon
      className="m-0.5 block size-[21px] rounded-full bg-white text-[var(--classifier-unlikely)]"
      icon={alertCircleOutline}
    />
  );
};

export default observer(ClassificationStatus);
