import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Trans as T } from 'react-i18next';
import { isPlatform, IonLabel, IonButton, IonSpinner } from '@ionic/react';
import CONFIG from 'common/config';
import Media, { ClassifierSuggestion } from 'models/media';
import './styles.scss';

type Props = {
  image: Media;
  identifyImage?: any;
  onSpeciesSelect: any;
};

type SpeciesTileProps = { suggestion: ClassifierSuggestion; onClick: any };

const SpeciesTile = ({ suggestion, onClick }: SpeciesTileProps) => {
  const { commonNames, scientificName, probability } = suggestion;

  const commonName = commonNames[0];
  const species = commonName || scientificName;

  let color;
  if (probability > CONFIG.POSITIVE_THRESHOLD) {
    color = 'success';
  } else if (probability > CONFIG.POSSIBLE_THRESHOLD) {
    color = 'warning';
  } else {
    color = 'danger';
  }
  const roundedProbability = (probability * 100).toFixed();

  const isTablet = isPlatform('tablet') ? 'tablet' : '';

  return (
    <div className={`species-tile ${isTablet}`} onClick={onClick}>
      <div className={`score ${color}`}>
        <IonLabel>{roundedProbability}%</IonLabel>
      </div>
      <div className="container">
        <IonLabel className={clsx(!commonName && 'scientific')}>
          {species}
        </IonLabel>
      </div>
    </div>
  );
};

const FooterMessage = ({ image, identifyImage, onSpeciesSelect }: Props) => {
  const identifierWasNotUsed = !image.attrs?.species;
  const speciesList = image.attrs?.species?.suggestions;

  if (image.isIdentifying()) {
    return (
      <>
        <h3>
          <T>Suggestions:</T>
        </h3>

        <span className="id-loading">
          <T>Identifying...</T> <IonSpinner />
        </span>
      </>
    );
  }

  if (identifierWasNotUsed && !image.isDisabled()) {
    return (
      <IonButton className="re-identify-button" onClick={identifyImage}>
        <T>Get species suggestions</T>
      </IonButton>
    );
  }

  const identifierFoundNoSpecies = !image.attrs?.species?.suggestions.length;
  if (identifierFoundNoSpecies) return null;

  const getIdentifiedSpeciesList = () => {
    const placeholderCount = isPlatform('tablet') ? 4 : 3;

    const getImageItem = (suggestion: ClassifierSuggestion, index: number) =>
      !suggestion ? (
        <div key={index} className="img-placeholder" />
      ) : (
        <SpeciesTile
          suggestion={suggestion}
          key={index}
          onClick={() => onSpeciesSelect(suggestion)}
        />
      );

    const imagesWithPlaceholders = [...speciesList];
    // +1 for the actual image
    if (imagesWithPlaceholders.length < placeholderCount) {
      imagesWithPlaceholders.push(
        ...Array(placeholderCount - speciesList.length)
      );
    }

    return imagesWithPlaceholders.map(getImageItem);
  };

  if (!speciesList.length) return null;

  return (
    <>
      <h3>
        <T>Suggestions:</T>
      </h3>

      <div className="species-array-wrapper">
        <div className="species-array">{getIdentifiedSpeciesList()}</div>
      </div>
    </>
  );
};

export default observer(FooterMessage);
