import { observer } from 'mobx-react';
import { Button } from 'common/flumens';
import Media from 'models/media';
import SpeciesSuggestions from './SpeciesSuggestions';

interface Props {
  onCrop: any;
  image: Media;
  identifyImage?: any;
  onSpeciesSelect: any;
}

const ImageFooter = ({
  onCrop,
  image,
  identifyImage,
  onSpeciesSelect,
}: Props) => {
  const onCropWrap = () => onCrop(image);

  const allowToEdit = !image.parent?.isDisabled() && !image.isIdentifying();

  return (
    <div className="mx-4 flex justify-between gap-2">
      <SpeciesSuggestions
        image={image}
        identifyImage={identifyImage}
        onSpeciesSelect={onSpeciesSelect}
      />

      {allowToEdit && (
        <Button
          className="shrink-0 text-white data-[pressed=true]:bg-neutral-100/40"
          onPress={onCropWrap}
          fill="clear"
        >
          Crop/Zoom
        </Button>
      )}
    </div>
  );
};

export default observer(ImageFooter);
