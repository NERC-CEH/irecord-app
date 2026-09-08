import { observer } from 'mobx-react';
import { cropOutline, trashBinOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { Button, usePhotoDeletePrompt } from 'common/flumens';
import Media from 'models/media';
import Occurrence, { type Taxon } from 'models/occurrence';
import SpeciesSuggestions from './SpeciesSuggestions';

type Props = {
  onCrop: (media: Media) => void;
  onDelete: (media: Media) => void | Promise<void>;
  image: Media;
  identifySpecies?: (manualTrigger?: boolean) => void;
  onSpeciesSelect: (taxon: Taxon) => void;
};

const ImageFooter = ({
  onCrop,
  onDelete,
  image,
  identifySpecies,
  onSpeciesSelect,
}: Props) => {
  const showDeletePrompt = usePhotoDeletePrompt();

  const onCropWrap = () => onCrop(image);

  const onDeleteWrap = async () => {
    const shouldDelete = await showDeletePrompt();
    if (!shouldDelete) return;
    onDelete(image);
  };

  const occurrence = image.parent instanceof Occurrence ? image.parent : null;

  const allowToEdit = !image.parent?.isDisabled && !occurrence?.isIdentifying;

  return (
    <div className="mx-4 flex justify-between gap-2">
      {occurrence && !occurrence.isDisabled && (
        <SpeciesSuggestions
          occurrence={occurrence}
          identifySpecies={identifySpecies}
          onSpeciesSelect={onSpeciesSelect}
        />
      )}

      {allowToEdit && (
        <div className="flex gap-4">
          <Button
            className="shrink-0 bg-black/60 p-2 text-white data-[pressed=true]:bg-neutral-100/40"
            onPress={onCropWrap}
            fill="clear"
            shape="round"
          >
            <IonIcon
              icon={cropOutline}
              className="size-8 [--ionicon-stroke-width:20px]"
            />
          </Button>

          <Button
            className="shrink-0 bg-black/60 p-2 text-white data-[pressed=true]:bg-neutral-100/40"
            onPress={onDeleteWrap}
            fill="clear"
            shape="round"
          >
            <IonIcon
              icon={trashBinOutline}
              className="size-8 [--ionicon-stroke-width:20px]"
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default observer(ImageFooter);
