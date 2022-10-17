import { FC } from 'react';
import { PhotoPicker, captureImage } from '@flumens';
import { useTranslation } from 'react-i18next';
import { useIonActionSheet, isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import Media from 'models/media';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import config from 'common/config';

export function usePromptImageSource() {
  const { t } = useTranslation();
  const [presentActionSheet] = useIonActionSheet();

  const promptImageSource = (resolve: any) => {
    presentActionSheet({
      buttons: [
        { text: t('Gallery'), handler: () => resolve(false) },
        { text: t('Camera'), handler: () => resolve(true) },
        { text: t('Cancel'), role: 'cancel', handler: () => resolve(null) },
      ],
      header: t('Choose a method to upload a photo'),
    });
  };
  const promptImageSourceWrap = () =>
    new Promise<boolean | null>(promptImageSource);

  return promptImageSourceWrap;
}

type Props = {
  model: Sample | Occurrence;
};

const AppPhotoPicker: FC<Props> = ({ model }) => {
  const promptImageSource = usePromptImageSource();

  async function getImage() {
    const shouldUseCamera = await promptImageSource();
    const cancelled = shouldUseCamera === null;
    if (cancelled) return null;

    const images = await captureImage(
      shouldUseCamera ? { camera: true } : { multiple: true }
    );
    if (!images.length) return null;

    const getImageModel = (image: any) =>
      Media.getImageModel(
        isPlatform('hybrid') ? Capacitor.convertFileSrc(image) : image,
        config.dataPath
      );
    const imageModels = images.map(getImageModel);
    return Promise.all(imageModels);
  }

  return (
    <PhotoPicker
      getImage={getImage}
      model={model}
      isDisabled={model.isDisabled()}
    />
  );
};

export default AppPhotoPicker;
