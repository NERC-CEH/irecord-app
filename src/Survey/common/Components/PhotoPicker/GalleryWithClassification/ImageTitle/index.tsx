/* eslint-disable camelcase */
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import { IonLabel, IonNote, isPlatform } from '@ionic/react';
import Media from 'models/media';
import './styles.scss';

type Props = {
  image: Media;
};

const ImageTitle = ({ image }: Props) => {
  if (image.isIdentifying()) return null; // for re-rendering, this line must be first because this is the only observable in the media model

  const identifierWasNotUsed = !image.attrs.species;
  if (identifierWasNotUsed) return null;

  const identifierFoundNoSpecies = !image.attrs?.species?.suggestions.length;

  const getMessage = () => {
    if (!identifierFoundNoSpecies) return null;

    return (
      <IonLabel className="better-image-tip">
        <T>Sorry, we could not identify this species.</T>
        <IonNote>
          <T>
            Make sure that your species is in the centre of the image and is in
            focus.
          </T>
        </IonNote>
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
