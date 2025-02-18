import { observer } from 'mobx-react';
import { cropOutline, trashBinOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { Button, usePhotoDeletePrompt } from 'common/flumens';
import Media from 'models/media';
import SpeciesSuggestions from './SpeciesSuggestions';

interface Props {
  onCrop: any;
  onDelete: any;
  image: Media;
  identifyImage?: any;
  onSpeciesSelect: any;
}

const ImageFooter = ({
  onCrop,
  onDelete,
  image,
  identifyImage,
  onSpeciesSelect,
}: Props) => {
  const showDeletePrompt = usePhotoDeletePrompt();

  const onCropWrap = () => onCrop(image);

  const onDeleteWrap = async () => {
    const shouldDelete = await showDeletePrompt();
    if (!shouldDelete) return;
    onDelete(image);
  };

  const allowToEdit = !image.parent?.isDisabled() && !image.isIdentifying();

  return (
    <div className="mx-4 flex justify-between gap-2">
      <SpeciesSuggestions
        image={image}
        identifyImage={identifyImage}
        onSpeciesSelect={onSpeciesSelect}
      />

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
