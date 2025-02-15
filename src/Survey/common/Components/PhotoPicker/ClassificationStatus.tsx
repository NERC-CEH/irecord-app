/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { alertCircleOutline } from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/react';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';

type Props = { media: Media };

const ClassificationStatus = ({ media }: Props) => {
  const hasBeenIdentified = !!media.attrs?.species;

  const userSpeciesMatchesAI = media.getIdentifiedTaxonThatMatchParent();

  const isSpeciesSelected = (media?.parent as Occurrence)?.attrs?.taxon;

  const species = isSpeciesSelected
    ? userSpeciesMatchesAI
    : media.getTopSpecies();

  const showLoading = media.isIdentifying();

  const selectedSpeciesMatch = !(isSpeciesSelected && !userSpeciesMatchesAI);

  const { probability } = species || {};

  if (showLoading)
    return (
      <IonSpinner
        slot="end"
        className="m-0.5 block size-5 rounded-full bg-black/65 text-white"
      />
    );

  if (hasBeenIdentified && selectedSpeciesMatch)
    return <ProbabilityBadge probability={probability} className="" />;

  return (
    <IonIcon
      className="m-0.5 block size-[21px] rounded-full bg-white text-[var(--classifier-unlikely)]"
      icon={alertCircleOutline}
    />
  );
};

export default ClassificationStatus;
