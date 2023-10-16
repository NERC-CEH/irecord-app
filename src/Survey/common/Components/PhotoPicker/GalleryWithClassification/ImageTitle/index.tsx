/* eslint-disable camelcase */
import { FC } from 'react';
import Media from 'models/media';
import { IonLabel, IonNote, isPlatform } from '@ionic/react';
import { Trans as T } from 'react-i18next';
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
          <T>Sorry, we could not identify this species.</T>
          <IonNote>
            <T>
              Make sure that your species is in the centre of the image and is
              in focus.
            </T>
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
          <T>
            We think it is <b>{{ probability } as any}%</b> likely to be{' '}
            <b className={clsx(!commonName && 'scientific')}>
              {{ species } as any}
            </b>
            .
          </T>
        </IonLabel>
      );
    }

    return (
      <IonLabel>
        <T>
          Great! We also think it is <b>{{ probability } as any}%</b> likely to
          be{' '}
          <b className={clsx(!commonName && 'scientific')}>
            {{ species } as any}
          </b>
          .
        </T>
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
