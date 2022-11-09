/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { FC } from 'react';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { observer } from 'mobx-react';
import { alertCircleOutline, close } from 'ionicons/icons';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import './styles.scss';

type Props = {
  media: Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const Image: FC<Props> = ({ media, isDisabled, onDelete, onClick }) => {
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
        <IonButton fill="clear" class="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}
      <img src={media.attrs.thumbnail} onClick={onClick} />

      {showLoading && <IonSpinner slot="end" />}

      {!showLoading && hasBeenIdentified && selectedSpeciesMatch && (
        <ProbabilityBadge probability={probability} />
      )}

      {!showLoading && hasBeenIdentified && !selectedSpeciesMatch && (
        <IonIcon className="warning-icon" icon={alertCircleOutline} />
      )}
    </div>
  );
};

export default observer(Image);
