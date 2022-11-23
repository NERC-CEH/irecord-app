/* eslint-disable camelcase */
import { FC } from 'react';
import Media from 'models/media';
import { IonLabel, IonNote, isPlatform } from '@ionic/react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import './styles.scss';

type Props = {
  image: Media;
};

const ImageTitle: FC<Props> = ({ image }) => {
  if (image.isIdentifying()) return null; // for re-rendering, this line must be first because this is the only observable in the media model

  const identifierWasNotUsed = !image.attrs.species;
  if (identifierWasNotUsed) return null;

  const parentMatchingSuggestion = image.getIdentifiedTaxonThatMatchParent();
  const identifierFoundNoSpecies = !image.attrs?.species?.suggestions.length;

  const getMessage = () => {
    if (identifierFoundNoSpecies) {
      return (
        <IonLabel className="better-image-tip">
          Sorry, we could not identify this species.
          <IonNote>
            Make sure that your species is in the centre of the image and is in
            focus.
          </IonNote>
        </IonLabel>
      );
    }

    const suggestion = image.getTopSpecies();

    const commonName = suggestion.common_names[0];
    const species = commonName || suggestion.scientific_name;

    const probability = ((suggestion.probability || 0) * 100).toFixed(0);

    const doesTaxonMatchParent =
      parentMatchingSuggestion?.warehouse_id === suggestion.warehouse_id;

    if (!doesTaxonMatchParent) {
      return (
        <IonLabel>
          We think it is <b>{probability}%</b> likely to be{' '}
          <b className={clsx(!commonName && 'scientific')}>{species}</b>.
        </IonLabel>
      );
    }

    return (
      <IonLabel>
        Great! We also think it is <b>{probability}%</b> likely to be{' '}
        <b className={clsx(!commonName && 'scientific')}>{species}</b>.
      </IonLabel>
    );
  };

  return (
    <div
      className={clsx(
        'gallery-ai-message',
        isPlatform('tablet') && 'gallery-tablet-styles'
      )}
    >
      {getMessage()}
    </div>
  );
};

export default observer(ImageTitle);
