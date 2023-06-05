import { FC } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { cropOutline } from 'ionicons/icons';
import Media from 'models/media';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import SpeciesSuggestions from './SpeciesSuggestions';
import './styles.scss';

interface Props {
  onCrop: any;
  image: Media;
  identifyImage?: any;
  onSpeciesSelect: any;
}

const ImageFooter: FC<Props> = ({
  onCrop,
  image,
  identifyImage,
  onSpeciesSelect,
}) => {
  const onCropWrap = () => onCrop(image);

  const allowToEdit = !image.parent?.isDisabled() && !image.isIdentifying();

  const cropButton = (
    <IonButton
      className="crop-button"
      onClick={onCropWrap}
      fill="clear"
      color="light"
    >
      <IonIcon icon={cropOutline} />
      <T>Crop/Zoom</T>
    </IonButton>
  );

  return (
    <>
      <SpeciesSuggestions
        image={image}
        identifyImage={identifyImage}
        onSpeciesSelect={onSpeciesSelect}
      />

      {allowToEdit && cropButton}
    </>
  );
};

export default observer(ImageFooter);
