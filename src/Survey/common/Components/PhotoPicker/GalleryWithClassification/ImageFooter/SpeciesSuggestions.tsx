import { useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner, IonModal } from '@ionic/react';
import { Button } from 'common/flumens';
import Media, { ClassifierSuggestion } from 'models/media';
import ProbabilityBadge from 'Survey/common/Components/ProbabilityBadge';

const SNAP_POSITIONS = [0, 0.3, 0.5, 1];
const DEFAULT_SNAP_POSITION = 0.3;

type Props = {
  image: Media;
  identifyImage?: any;
  onSpeciesSelect: any;
};

const SpeciesSuggestions = ({
  image,
  identifyImage,
  onSpeciesSelect,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const identifierWasNotUsed = !image.attrs?.species;
  const speciesList = image.attrs?.species?.suggestions;

  if (image.isIdentifying()) {
    return (
      <div className="flex items-center justify-center gap-3 text-white">
        <T>Identifying...</T> <IonSpinner color="light" className="size-5" />
      </div>
    );
  }

  if (identifierWasNotUsed && !image.isDisabled()) {
    return (
      <Button
        className="shrink-0 text-white"
        onPress={identifyImage}
        fill="outline"
      >
        Get species suggestions
      </Button>
    );
  }

  const identifierFoundNoSpecies = !image.attrs?.species?.suggestions.length;
  if (identifierFoundNoSpecies || !speciesList.length) return null;

  const getSuggestionItem = (suggestion: ClassifierSuggestion) => {
    const { commonNames, scientificName, probability } = suggestion;

    const commonName = commonNames[0];

    return (
      <div className="flex min-h-20 w-full items-center justify-start gap-2 border-b border-solid p-2">
        <ProbabilityBadge probability={probability} className="shrink-0" />
        <div className="flex w-full flex-col gap-1">
          {!!commonName && <b>{commonName}</b>}
          {!!scientificName && <i>{scientificName}</i>}
        </div>

        <Button
          className="shrink-0 px-3 py-2 text-sm"
          onPress={() => {
            setIsOpen(false);
            onSpeciesSelect(suggestion);
          }}
          fill="outline"
        >
          Select
        </Button>
      </div>
    );
  };

  const suggestions = speciesList.map(getSuggestionItem);

  return (
    <>
      <Button className="shrink-0 text-white" onPress={onOpen} fill="outline">
        Suggestions
      </Button>

      <IonModal
        isOpen={isOpen}
        backdropDismiss={false}
        backdropBreakpoint={0.5}
        breakpoints={SNAP_POSITIONS}
        initialBreakpoint={DEFAULT_SNAP_POSITION}
        canDismiss
        onIonModalWillDismiss={onClose}
        className="[&::part(handle)]:mt-2"
      >
        <div className="mx-2 mt-5">
          <h2 className="text-lg font-semibold">Suggestions:</h2>
          <div className="flex flex-col">{suggestions}</div>
        </div>
      </IonModal>
    </>
  );
};

export default observer(SpeciesSuggestions);
