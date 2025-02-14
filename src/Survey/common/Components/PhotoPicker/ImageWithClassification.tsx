/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import { alertCircleOutline, close } from 'ionicons/icons';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';

type Props = {
  media: Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const Image = ({ media, isDisabled, onDelete, onClick }: Props) => {
  const hasBeenIdentified = !!media.attrs?.species;

  const userSpeciesMatchesAI = media.getIdentifiedTaxonThatMatchParent();

  const isSpeciesSelected = (media?.parent as Occurrence)?.attrs?.taxon;

  const species = isSpeciesSelected
    ? userSpeciesMatchesAI
    : media.getTopSpecies();

  const showLoading = media.isIdentifying();

  const selectedSpeciesMatch = !(isSpeciesSelected && !userSpeciesMatchesAI);

  const { probability } = species || {};

  return (
    <div className="img">
      {!isDisabled && (
        <IonButton fill="clear" className="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}
      <img src={media.getURL()} onClick={onClick} />

      {showLoading && (
        <IonSpinner
          slot="end"
          className="absolute bottom-0 right-0 m-0.5 size-5 rounded-full bg-black/65 text-white"
        />
      )}

      {!showLoading && hasBeenIdentified && selectedSpeciesMatch && (
        <ProbabilityBadge
          probability={probability}
          className="absolute bottom-0 right-0"
        />
      )}

      {!showLoading && hasBeenIdentified && !selectedSpeciesMatch && (
        <IonIcon
          className="absolute bottom-0 right-0 m-0.5 size-5 rounded-full bg-white text-[var(--classifier-unlikely)]"
          icon={alertCircleOutline}
        />
      )}
    </div>
  );
};

export default observer(Image);
